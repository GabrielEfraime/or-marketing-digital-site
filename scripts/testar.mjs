// Testes do que mais custa errar: contas de preço, data de hoje, número do WhatsApp e o servidor do Cloudflare.
// Uso: node scripts/testar.mjs  (o "npm run verificar" também roda). Sem dependências.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ler = (f) => fs.readFileSync(path.join(RAIZ, f), 'utf8');
let ok = 0, falhou = 0;
const t = async (nome, fn) => { try { await fn(); ok++; } catch (e) { falhou++; console.log('  FALHOU ' + nome + ': ' + e.message); } };

// as funções do site rodam num contexto isolado, com o mínimo do navegador
const ctx = vm.createContext({ addEventListener() {}, setInterval() { return 0; }, console });
vm.runInContext(ler('src/js/01-config-precos.js') + '\n' + ler('src/js/02-modulos-servicos.js') + '\n' + ler('src/js/19-orcamento-mensagem.js')
  + "\nconst svcs=l=>l.mods,CFG={precos:PRECOS},LBL={BASICO:'Essencial',MEDIO:'Crescimento',MAX:'Completo'};"
  + '\n' + ler('src/js/22-acompanhamento.js').split('\n').find((l) => l.startsWith('const today='))
  + '\n' + ler('src/js/07-ui-base.js').split('\n').find((l) => l.startsWith('const wnum=')), ctx);
const S = (js) => vm.runInContext(js, ctx);

await t('preço: milhar com ponto, decimal com vírgula ou ponto', () => {
  assert.equal(S("tabNum('1.500')"), 1500); assert.equal(S("tabNum('1.500,50')"), 1500.5);
  assert.equal(S("tabNum('1500.50')"), 1500.5); assert.equal(S("tabNum('99.90')"), 99.9); assert.equal(S("tabNum('')"), 0);
});
await t('orçamento de um serviço bate com a tabela', () => {
  const r = S("const _c=calcOrc({mods:['ads']});({tab:parseTab(PRECOS).mods.ads,c:_c})");
  for (const pk of ['basico', 'medio', 'max']) {
    assert.equal(r.c.tiers[pk].setupF, r.tab[pk].setup); assert.equal(r.c.tiers[pk].mensalF, r.tab[pk].mensal);
    assert.equal(r.c.tiers[pk].inicio, r.tab[pk].setup + r.tab[pk].mensal);
  }
});
await t('combo: desconto da tabela sobre a soma dos serviços', () => {
  const tab = 'ads|basico|setup=1000|mensal=2000\nsite|basico|setup=3000|mensal=0\ncombo|desconto=10';
  const c = S('calcOrc({mods:["ads","site"]},' + JSON.stringify(tab) + ')').tiers.basico;
  assert.equal(c.setupF, 3600); assert.equal(c.mensalF, 1800); assert.equal(c.inicio, 5400);
});
await t('conferência de valores acha valor inventado e aceita os da tabela', () => {
  const r = S("const _d=calcOrc({mods:['ads']});({bom:checarValores(['basico','medio','max'].map(k=>rs(_d.tiers[k].inicio)).join(' '),_d,false),ruim:checarValores('R$ 1,00',_d,false)})");
  assert.deepEqual([...r.bom], []); assert.ok(r.ruim.some((x) => /não existe na tabela/.test(x)));
});
await t('data de hoje no fuso do computador', () => {
  const d = new Date(), p = (n) => String(n).padStart(2, '0');
  assert.equal(S('today()'), d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()));
});
await t('número do WhatsApp', () => {
  assert.equal(S("wnum('(21) 99999-0000')"), '5521999990000'); assert.equal(S("wnum('+55 21 3333-2222')"), '552133332222');
  assert.equal(S("wnum('21 9999')"), ''); assert.equal(S("wnum('')"), '');
});

// servidor do Cloudflare com KV e Groq simulados
const { onRequest } = await import(pathToFileURL(path.join(RAIZ, 'functions', 'api', '[[rota]].js')).href);
const kv = new Map(), TOKEN = 'x'.repeat(40);
const env = { ADMIN_TOKEN: TOKEN, GROQ_API_KEY: 'chave-de-teste', OPENAI_API_KEY: 'chave-openai', GEMINI_API_KEY: 'chave-gemini', LEADS: {
  get: async (k) => kv.get(k) ?? null, put: async (k, v) => { kv.set(k, v); }, delete: async (k) => { kv.delete(k); },
  list: async ({ prefix }) => ({ keys: [...kv.keys()].filter((k) => k.startsWith(prefix)).map((name) => ({ name })), list_complete: true }) } };
const chama = (rota, init = {}, tok) => onRequest({ request: new Request('https://teste.pages.dev/api/' + rota, { ...init, headers: { ...(init.headers || {}), ...(tok ? { 'X-OR-Token': tok } : {}), 'CF-Connecting-IP': '1.2.3.4' } }), env, params: { rota: rota.split('?')[0].split('/') } });
let groqPedido = null;
globalThis.fetch = async (u, o) => { groqPedido = { u: String(u), o }; return new Response('data: {"choices":[{"delta":{"content":"ok"}}]}\n\ndata: [DONE]\n', { status: 200, headers: { 'Content-Type': 'text/event-stream' } }); };

await t('servidor: sem código, nada de IA nem de leads', async () => {
  assert.equal((await chama('ping')).status, 401); assert.equal((await chama('leads')).status, 401);
  assert.equal((await chama('ia', { method: 'POST', body: '{}' }, 'errado-errado-errado-errado')).status, 401);
});
await t('servidor: visitante manda o briefing, consultor puxa e apaga', async () => {
  const lead = { id: 'abc123', nome: 'Maria', status:'aplicado', orc:'Preço forjado', track:{segredo:true}, qa: [{ q: 'Negócio', a: 'Confeitaria' }] };
  assert.equal((await chama('lead', { method: 'POST', body: JSON.stringify(lead) })).status, 200);
  assert.equal((await chama('lead', { method: 'POST', body: '{"id":"../x"}' })).status, 400);
  const L = (await (await chama('leads', {}, TOKEN)).json()).leads;
  assert.equal(L.length, 1); assert.equal(L[0].nome, 'Maria');
  assert.equal(L[0].status,'novo');assert.equal(L[0].orc,undefined);assert.equal(L[0].track,undefined);
  assert.equal((await chama('lead', {method:'POST',body:JSON.stringify(lead)})).status,409);
  assert.equal((await chama('leads', { method: 'DELETE', body: JSON.stringify({ ids: ['abc123'] }) }, TOKEN)).status, 200);
  assert.equal((await (await chama('leads', {}, TOKEN)).json()).leads.length, 0);
});
await t('servidor: limite de envios por IP', async () => {
  let ultimo;
  for (let i = 0; i < 6; i++) ultimo = await chama('lead', { method: 'POST', body: JSON.stringify({ id: 'r' + i, nome: 'x', qa: [] }) });
  assert.equal(ultimo.status, 429);
});
await t('servidor: IA usa a chave guardada e só modelos permitidos', async () => {
  assert.equal((await chama('ia', { method: 'POST', body: JSON.stringify({ model: 'modelo-nao-permitido', messages: [] }) }, TOKEN)).status, 400);
  const r = await chama('ia', { method: 'POST', body: JSON.stringify({ model: 'openai/gpt-oss-20b', messages: [{ role: 'user', content: 'oi' }], max_tokens: 999999 }) }, TOKEN);
  assert.equal(r.status, 200); assert.match(await r.text(), /ok/);
  assert.equal(groqPedido.o.headers.Authorization, 'Bearer chave-de-teste'); assert.equal(JSON.parse(groqPedido.o.body).max_tokens, 16000);
});
await t('servidor: cada modelo vai para a sua plataforma com a sua chave', async () => {
  const vai = async (model, extra = {}) => { await chama('ia', { method: 'POST', body: JSON.stringify({ model, messages: [{ role: 'user', content: 'oi' }], ...extra }) }, TOKEN); return groqPedido; };
  let p = await vai('gpt-5-mini', { max_completion_tokens: 999999 });
  assert.match(p.u, /api.openai.com/); assert.equal(p.o.headers.Authorization, 'Bearer chave-openai'); assert.equal(JSON.parse(p.o.body).max_completion_tokens, 16000);
  p = await vai('gemini-3.5-flash'); assert.match(p.u, /generativelanguage/); assert.equal(p.o.headers.Authorization, 'Bearer chave-gemini');
  p = await vai('openai/gpt-oss-120b'); assert.match(p.u, /api.groq.com/); assert.equal(p.o.headers.Authorization, 'Bearer chave-de-teste');
});
await t('servidor: imagem da arte vai ao Gemini com a chave do servidor e só com modelo e proporção permitidos', async () => {
  const pede = (b, tok = TOKEN) => chama('imagem', { method: 'POST', body: JSON.stringify(b) }, tok);
  const ok = { model: 'gemini-3.1-flash-image', prompt: 'Fundo para post de confeitaria, sem texto', proporcao: '4:5' };
  assert.equal((await pede(ok, null)).status, 401);
  assert.equal((await pede({ ...ok, model: 'gpt-image-1' })).status, 400);
  assert.equal((await pede({ ...ok, proporcao: '21:9' })).status, 400);
  assert.equal((await pede({ ...ok, prompt: '' })).status, 400);
  const r = await pede(ok);
  assert.equal(r.status, 200);
  assert.equal(groqPedido.u, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent');
  assert.equal(groqPedido.o.headers['x-goog-api-key'], 'chave-gemini'); assert.equal(groqPedido.o.headers.Authorization, undefined);
  const b = JSON.parse(groqPedido.o.body);
  assert.deepEqual(b.generationConfig, { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '4:5' } });
  assert.equal(b.contents[0].parts[0].text, ok.prompt);
  const chave = env.GEMINI_API_KEY; delete env.GEMINI_API_KEY;
  try { assert.equal((await pede(ok)).status, 500); } finally { env.GEMINI_API_KEY = chave; }
});
await t('servidor: sem cota de imagem no Gemini, a arte sai pelo Workers AI do Cloudflare', async () => {
  const pede = (b) => chama('imagem', { method: 'POST', body: JSON.stringify(b) }, TOKEN);
  const anterior = globalThis.fetch, modelos = [], rodou = [];
  globalThis.fetch = async (u) => { modelos.push(String(u).split('/models/')[1]); return new Response(JSON.stringify({ error: { code: 429, message: 'Quota exceeded for metric: generate_content_free_tier_requests, limit: 0' } }), { status: 429, headers: { 'Content-Type': 'application/json' } }); };
  env.AI = { run: async (model, input) => { rodou.push({ model, tipo: input.multipart ? input.multipart.contentType : 'json' }); return { image: 'iVBORw0KGgo' + 'A'.repeat(200) }; } };
  try {
    const r = await pede({ prompt: 'Coffee cup on a wooden table, no text', proporcao: '9:16' });
    assert.equal(r.status, 200);
    assert.deepEqual(modelos, ['gemini-3.1-flash-image:generateContent', 'gemini-2.5-flash-image:generateContent']);
    assert.equal(rodou[0].model, '@cf/black-forest-labs/flux-2-klein-4b'); assert.match(rodou[0].tipo, /multipart\/form-data; boundary=/);
    const j = await r.json(); assert.equal(j.motor, 'workers-ai'); assert.equal(j.candidates[0].content.parts[0].inlineData.mimeType, 'image/png');
    const chave = env.GEMINI_API_KEY; delete env.GEMINI_API_KEY; modelos.length = 0;
    try { assert.equal((await pede({ prompt: 'x', proporcao: '1:1' })).status, 200); assert.equal(modelos.length, 0); } finally { env.GEMINI_API_KEY = chave; }
    env.AI = { run: async () => { throw new Error('3036: daily free allocation of 10,000 neurons used'); } };
    const lim = await pede({ prompt: 'x', proporcao: '4:5' });
    assert.equal(lim.status, 429); assert.match((await lim.json()).error.message, /^Imagem: acabou o limite gratuito/);
  } finally { globalThis.fetch = anterior; delete env.AI; }
});
await t('site: imagem da IA lê a resposta do Gemini e explica o plano gratuito', () => {
  const fonte = ler('src/js/22h-ia-imagem.js'), ctx = { atob: (s) => Buffer.from(s, 'base64').toString('latin1'), Blob, location: { protocol: 'http:' } };
  vm.runInNewContext(fonte + ';this.iaImgBlob=iaImgBlob;this.iaImgErro=iaImgErro;this.iaImgPrompt=iaImgPrompt;', ctx);
  const png = Buffer.from([137, 80, 78, 71]).toString('base64');
  const blob = ctx.iaImgBlob({ candidates: [{ content: { parts: [{ text: 'x' }, { inlineData: { mimeType: 'image/png', data: png } }] } }] });
  assert.equal(blob.type, 'image/png'); assert.equal(blob.size, 4);
  assert.throws(() => ctx.iaImgBlob({ promptFeedback: { blockReason: 'SAFETY' } }), /SAFETY/);
  assert.match(ctx.iaImgErro(429, 'Quota exceeded for metric: generate_content_free_tier_requests, limit: 0'), /plano gratuito/);
  assert.match(ctx.iaImgErro(401, '{"error":{"message":"Código do servidor ausente ou errado."}}'), /código do servidor/);
  assert.equal(ctx.iaImgErro(429, '{"error":{"message":"Imagem: acabou o limite gratuito de imagens do dia no Cloudflare."}}'), 'acabou o limite gratuito de imagens do dia no Cloudflare.');
  const p = ctx.iaImgPrompt({ titulo: 'Bolo de pote', formato: 'story', cores: ['#0A0908'] });
  assert.match(p, /9:16/); assert.match(p, /nenhum texto/); assert.match(p, /Bolo de pote/);
});
await t('servidor: leitura de site recusa endereço local', async () => {
  assert.equal((await chama('site?url=' + encodeURIComponent('http://127.0.0.1/admin'), {}, TOKEN)).status, 400);
  assert.equal((await chama('site?url=' + encodeURIComponent('file:///etc/passwd'), {}, TOKEN)).status, 400);
});

await t('servidor: redirecionamento não pode acessar rede local', async () => {
  const anterior = globalThis.fetch;
  const vistos = [];
  try {
    globalThis.fetch = async (u) => { vistos.push(String(u)); return new Response(null, { status: 302, headers: { Location: 'http://127.0.0.1/admin' } }); };
    assert.equal((await chama('site?url=https://www.exemplo.com.br', {}, TOKEN)).status, 400);
    assert.equal(vistos.length, 1);
    for (const url of ['http://localhost./', 'http://app.local/', 'http://[::1]/', 'http://2130706433/']) {
      assert.equal((await chama('site?url=' + encodeURIComponent(url), {}, TOKEN)).status, 400);
    }
    assert.equal(vistos.length, 1);
  } finally { globalThis.fetch = anterior; }
});
await t('servidor: limites contam bytes e recusam HTML excessivo', async () => {
  assert.equal((await chama('ia', { method: 'POST', body: 'á'.repeat(210000) }, TOKEN)).status, 413);
  const anterior = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('x'.repeat(1500001), { headers: { 'Content-Type': 'text/html' } });
    assert.equal((await chama('site?url=https://www.exemplo.com.br', {}, TOKEN)).status, 413);
    globalThis.fetch = async () => new Response('<html>ok</html>', { headers: { 'Content-Type': 'text/html' } });
    const r = await chama('site?url=https://www.exemplo.com.br', {}, TOKEN);
    assert.equal(r.status, 200);
    assert.equal((await r.json()).final, 'https://www.exemplo.com.br/');
  } finally { globalThis.fetch = anterior; }
});

await t('IA: cancelar não dispara a IA de reserva e chave compartilhada funciona', async () => {
  const c = vm.createContext({ OPENAI_URL:'https://api.openai.com/v1', sget:()=>null, sset(){}, location:{protocol:'http:'}, DOMException, setTimeout, clearTimeout });
  vm.runInContext("const IAS=['ia1','ia2','ia3'],CFG={ia1:{kind:'openai',url:'u',model:'a',key:'teste'},ia2:{kind:'openai',url:'u',model:'b',key:''},ia3:{kind:'openai',url:'u',model:'c',key:''}};",c);
  vm.runInContext(ler('src/js/08-ia-chamadas.js'),c);
  vm.runInContext("var chamadas=0;ask=async()=>{chamadas++;throw new DOMException('Parado','AbortError')}",c);
  await assert.rejects(vm.runInContext("askF([],()=>{},{slot:'ia1'})",c),e=>e.name==='AbortError');
  assert.equal(vm.runInContext('chamadas',c),1);
  vm.runInContext("chamadas=0;ask=async()=>{chamadas++;if(chamadas===1)throw new Error('limite');return 'reserva'}",c);
  assert.equal(await vm.runInContext("askF([],()=>{},{slot:'ia1'})",c),'reserva');
  assert.equal(vm.runInContext('chamadas',c),2);
});
await t('demandas: quadro vazio, transições validadas, histórico e isolamento de dados', () => {
  const memory = {};
  const c=vm.createContext({setInterval(){},document:{addEventListener(){}},getL:()=>[],qaOf:()=>[],sget:k=>memory[k]||null,sset:(k,v)=>{memory[k]=v},STORE_OK:true,Date});
  vm.runInContext(ler('src/js/17-minha-area.js'),c);
  assert.equal(vm.runInContext('OR_QUADRO.itens.length',c),0);
  vm.runInContext("OR_QUADRO.itens.push({id:'d1',titulo:'Nova arte',coluna:OR_COLUNAS[0],descricao:'Briefing',historico:[]})",c);
  assert.equal(vm.runInContext("orQuadroMover('d1','Etapa inválida')",c),false);
  assert.equal(vm.runInContext("orQuadroMover('d1',OR_COLUNAS[2])",c),true);
  assert.equal(vm.runInContext("orQuadroItem('d1').historico.length",c),1);
  assert.equal(JSON.parse(memory['or-demandas-v1'])[0].coluna,'Em produção');
  assert.equal(vm.runInContext("orQuadroArteCliente('demanda:d1').track.pecas[0].txt",c),'Briefing');
});
await t('editor: troca de slide usa o índice real e prévia recebe texto do slide', () => {
  const c=vm.createContext({Map,CFG:{brand:'OR'}});
  vm.runInContext(ler('src/js/22g-editor-posts.js'),c);
  const a=vm.runInContext("reaArtePreparar({arte:{slides:[{titulo:'Um'},{titulo:'Dois'}],slide:1}},{fmt:'post'},{nome:'Cliente'})",c);
  assert.equal(a.slides[a.slide].titulo,'Dois');
  const desenhados=[];
  const ctx={createLinearGradient:()=>({addColorStop(){}}),fillRect(){},save(){},restore(){},beginPath(){},arc(){},fill(){},measureText:t=>({width:t.length*10}),fillText:t=>desenhados.push(t)};
  const canvas={width:0,height:0,style:{},getContext:()=>ctx};
  c.box={querySelector:s=>s==='[data-rea-art-canvas]'?canvas:null};c.a=a;
  vm.runInContext('reaArteDesenhar(box,a,null,null)',c);
  assert.ok(desenhados.includes('Dois'));
  const fonte=ler('src/js/22g-editor-posts.js');
  assert.ok(!/dataset\.reaArtSlide\b/.test(fonte));
});

await t('fonte completa: JavaScript concatenado compila', () => {
  const ordem=JSON.parse(ler('src/ordem.json'));
  const js=ordem.js.map(x=>ler(x.arquivo)).join('\n');
  new vm.Script(js,{filename:'site-concatenado.js'});
});
await t('Canva: exige autenticação e não lista artes existentes', async () => {
  assert.equal((await chama('canva/gerar',{method:'POST',body:'{}'})).status,401);
  assert.equal((await chama('canva/gerar',{method:'POST',body:'{}'},TOKEN)).status,503);
  const anterior=globalThis.fetch;env.CANVA_ACCESS_TOKEN='canva-teste';
  const vistos=[];
  try{
    globalThis.fetch=async(u,o)=>{vistos.push({u:String(u),o});return new Response(JSON.stringify({job:{id:'job1',status:'in_progress'}}),{headers:{'Content-Type':'application/json'}})};
    const r=await chama('canva/gerar',{method:'POST',body:JSON.stringify({prompt:'Nova demanda de post',chave:'demanda_nova_123456',formato:'feed'})},TOKEN);
    assert.equal(r.status,200);assert.equal((await r.json()).job.id,'job1');
    assert.equal(vistos[0].u,'https://api.canva.com/rest/v1/image-generations');
    assert.equal(vistos[0].o.headers.Authorization,'Bearer canva-teste');
    const b=JSON.parse(vistos[0].o.body);assert.equal(b.aspect_ratio,'portrait_4_5');assert.equal(b.asset_upload.type,'none');
    assert.equal((await chama('canva/gerar',{method:'POST',body:'{}'},TOKEN)).status,400);
    assert.equal(vistos.length,1);
  }finally{globalThis.fetch=anterior;delete env.CANVA_ACCESS_TOKEN}
});

await t('briefing: materiais, aprovação e datas não se repetem entre serviços', () => {
  const c=vm.createContext({});
  vm.runInContext(ler('src/js/01-config-precos.js')+'\n'+ler('src/js/02-modulos-servicos.js'),c);
  vm.runInContext("const SEED=2,P={mods:['social','meta'],qa:[],skipTp:new Set()};",c);
  vm.runInContext(ler('src/js/15-briefing-assistente.js'),c);
  for(const id of ['materiaisbase','aprovacaoprazo','datasconfirmadas']){
    assert.equal(vm.runInContext("topicPool().filter(x=>x.t[0]==="+JSON.stringify(id)+").length",c),1);
  }
});

await t('links de candidatos recusam esquemas executáveis e aceitam HTTP(S)', () => {
  const c=vm.createContext({URL});
  const linha=ler('src/js/07-ui-base.js').split('\n').find(x=>x.startsWith('const webLink='));
  vm.runInContext(linha,c);
  for(const v of ['javascript:alert(1)','java\nscript:alert(1)','data:text/html,<script>alert(1)</script>','https://usuario:senha@site.com/']){
    assert.equal(vm.runInContext('webLink('+JSON.stringify(v)+')',c),'');
  }
  assert.equal(vm.runInContext("webLink('https://site.com/portfolio')",c),'https://site.com/portfolio');
});

console.log((falhou ? falhou + ' teste(s) falharam, ' : '') + ok + ' teste(s) passaram.');
process.exit(falhou ? 1 : 0);
