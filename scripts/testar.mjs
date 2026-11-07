// Testes do que mais custa errar: contas de preço, data de hoje, número do WhatsApp, imagem da IA, chamadas à IA, demandas e editor.
// Uso: node scripts/testar.mjs  (o "npm run verificar" também roda). Sem dependências.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ler = (f) => fs.readFileSync(path.join(RAIZ, f), 'utf8');
// junta, na ordem de carga, os arquivos de src/js cujo nome (sem o número) está na lista: assim o teste acompanha arquivos divididos
const lerJs = (...slugs) => {
  const achados = JSON.parse(ler('src/ordem.json')).js.map((e) => e.arquivo).filter((a) => slugs.includes(path.basename(a).replace(/^\d+-/, '').replace(/\.js$/, '')));
  if (achados.length !== slugs.length) throw new Error('lerJs: esperava ' + slugs.length + ' arquivo(s) e achei ' + achados.length + ' (' + slugs.join(', ') + ')');
  return achados.map(ler).join('\n');
};
let ok = 0, falhou = 0;
const t = async (nome, fn) => { try { await fn(); ok++; } catch (e) { falhou++; console.log('  FALHOU ' + nome + ': ' + e.message); } };

// as funções do site rodam num contexto isolado, com o mínimo do navegador
const ctx = vm.createContext({ addEventListener() {}, setInterval() { return 0; }, console });
vm.runInContext(ler('src/js/01-config-precos.js') + '\n' + ler('src/js/03-modulos-servicos.js') + '\n' + ler('src/js/27-orcamento-mensagem.js')
  + "\nconst svcs=l=>l.mods,CFG={precos:PRECOS},LBL={BASICO:'Essencial',MEDIO:'Crescimento',MAX:'Completo'};"
  + '\n' + ler('src/js/00-util.js')
  + '\n' + ler('src/js/08-ui-base.js').split('\n').find((l) => l.startsWith('const wnum=')), ctx);
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

await t('site: imagem da IA lê a resposta do Gemini e explica o plano gratuito', () => {
  const fonte = ler('src/js/44-ia-imagem.js'), ctx = { atob: (s) => Buffer.from(s, 'base64').toString('latin1'), Blob, location: { protocol: 'http:' } };
  vm.runInNewContext(fonte + ';this.iaImgBlob=iaImgBlob;this.iaImgErro=iaImgErro;this.iaImgPrompt=iaImgPrompt;this.iaPolUrl=iaPolUrl;this.iaPolErro=iaPolErro;', ctx);
  const u = new URL(ctx.iaPolUrl('Bread on a table, no text', 'story', 'tongyi-mai/z-image-turbo'));
  assert.equal(u.origin + u.pathname, 'https://gen.pollinations.ai/image/Bread%20on%20a%20table%2C%20no%20text');
  assert.equal(u.searchParams.get('model'), 'tongyi-mai/z-image-turbo'); assert.equal(u.searchParams.get('width'), '720'); assert.equal(u.searchParams.get('height'), '1280'); assert.equal(u.searchParams.get('key'), null);
  assert.match(ctx.iaPolErro(402), /créditos/); assert.match(ctx.iaPolErro(401), /recusou a chave/);
  const png = Buffer.from([137, 80, 78, 71]).toString('base64');
  const blob = ctx.iaImgBlob({ candidates: [{ content: { parts: [{ text: 'x' }, { inlineData: { mimeType: 'image/png', data: png } }] } }] });
  assert.equal(blob.type, 'image/png'); assert.equal(blob.size, 4);
  assert.throws(() => ctx.iaImgBlob({ promptFeedback: { blockReason: 'SAFETY' } }), /SAFETY/);
  assert.match(ctx.iaImgErro(429, 'Quota exceeded for metric: generate_content_free_tier_requests, limit: 0'), /plano gratuito/);
  assert.match(ctx.iaImgErro(401, ''), /recusada/);
  const p = ctx.iaImgPrompt({ titulo: 'Bolo de pote', formato: 'story', cores: ['#0A0908'] });
  assert.match(p, /9:16/); assert.match(p, /nenhum texto/); assert.match(p, /Bolo de pote/);
});
await t('IA: cancelar não dispara a IA de reserva e chave compartilhada funciona', async () => {
  const c = vm.createContext({ GROQ_URL:'https://api.groq.com/openai/v1', sget:()=>null, sset(){}, location:{protocol:'http:'}, DOMException, setTimeout, clearTimeout });
  vm.runInContext("const IAS=['ia1','ia2','ia3'],IA_CHAVES=[...IAS],CFG={ia1:{kind:'openai',url:'u',model:'a',key:'teste'},ia2:{kind:'openai',url:'u',model:'b',key:''},ia3:{kind:'openai',url:'u',model:'c',key:''}};",c);
  vm.runInContext(ler('src/js/09-ia-chamadas.js'),c);
  vm.runInContext("var chamadas=0;ask=async()=>{chamadas++;throw new DOMException('Parado','AbortError')}",c);
  await assert.rejects(vm.runInContext("askF([],()=>{},{slot:'ia1'})",c),e=>e.name==='AbortError');
  assert.equal(vm.runInContext('chamadas',c),1);
  vm.runInContext("chamadas=0;ask=async()=>{chamadas++;if(chamadas===1)throw new Error('limite');return 'reserva'}",c);
  assert.equal(await vm.runInContext("askF([],()=>{},{slot:'ia1'})",c),'reserva');
  assert.equal(vm.runInContext('chamadas',c),2);
  /* Groq toda fora: o Gemini do cartão de reserva responde por último */
  vm.runInContext("CFG.img={kind:'openai',url:'https://generativelanguage.googleapis.com/v1beta/openai',model:'x',key:'chave-gemini'};var GEMINI_URL=CFG.img.url,IA_DEF={img:{model:'gemini-3.5-flash'}};chamadas=0;var usados=[];ask=async(m,cb,o)=>{chamadas++;const c=o.cfg||CFG[o.slot];usados.push(c.model);if(!/googleapis/.test(c.url))throw new Error('Groq fora');return 'gemini'}",c);
  assert.equal(await vm.runInContext("askF([],()=>{},{slot:'ia1'})",c),'gemini');
  assert.deepEqual(JSON.parse(vm.runInContext('JSON.stringify(usados)',c)),['a','b','c','gemini-3.5-flash']);
});
await t('IA: parâmetros da Groq por modelo (prompt mestre), chave compartilhada e chave do Gemini só para imagens', async () => {
  const pedidos = [];
  const c = vm.createContext({ GROQ_URL: 'https://api.groq.com/openai/v1', sget: () => null, sset() {}, location: { protocol: 'https:', hostname: 'gabrielefraime.github.io' }, DOMException, setTimeout, clearTimeout, TextDecoder, AbortController, Response, clean: (x) => x,
    fetch: async (u, o) => { pedidos.push({ u, b: JSON.parse(o.body), h: o.headers }); return new Response('data: {"choices":[{"delta":{"content":"ok"}}]}\n\ndata: [DONE]\n', { headers: { 'Content-Type': 'text/event-stream' } }); } });
  vm.runInContext("const G='https://api.groq.com/openai/v1',IAS=['ia1','ia2','ia3'],IA_CHAVES=[...IAS,'img'],CFG={brand:'OR',ia1:{kind:'openai',url:G,model:'qwen/qwen3.8-27b',key:'chave-groq'},ia2:{kind:'openai',url:G,model:'openai/gpt-oss-120b',key:''},ia3:{kind:'openai',url:G,model:'openai/gpt-oss-120b',key:''},img:{kind:'openai',url:'https://generativelanguage.googleapis.com/v1beta/openai',model:'gemini-3.1-flash-image',key:'chave-gemini'}};", c);
  vm.runInContext(ler('src/js/09-ia-chamadas.js'), c);
  assert.equal(await vm.runInContext("ask([{role:'user',content:'oi'}],()=>{},{slot:'ia1',max:1000})", c), 'ok');
  let p = pedidos[0];
  assert.equal(p.u, 'https://api.groq.com/openai/v1/chat/completions'); assert.equal(p.h.Authorization, 'Bearer chave-groq');
  assert.equal(p.b.temperature, 0.6); assert.equal(p.b.top_p, 0.95); assert.equal(p.b.reasoning_format, 'hidden'); assert.equal(p.b.max_tokens, 1000); assert.equal(p.b.reasoning_effort, undefined);
  await vm.runInContext("ask([{role:'user',content:'oi'}],()=>{},{slot:'ia2',max:1000,temp:.3})", c);
  p = pedidos[1];
  assert.equal(p.h.Authorization, 'Bearer chave-groq'); assert.equal(p.b.model, 'openai/gpt-oss-120b');
  assert.equal(p.b.temperature, 1); assert.equal(p.b.top_p, 1); assert.equal(p.b.reasoning_effort, 'medium'); assert.equal(p.b.include_reasoning, false); assert.equal(p.b.reasoning_format, undefined); assert.equal(p.b.max_tokens, 2800);
  assert.equal(vm.runInContext('keyDe(CFG.img)', c), 'chave-gemini'); assert.equal(vm.runInContext('keyDe(CFG.ia3)', c), 'chave-groq');
});
await t('demandas: quadro vazio, transições validadas, histórico e isolamento de dados', () => {
  const memory = {};
  const c=vm.createContext({setInterval(){},document:{addEventListener(){}},getL:()=>[],qaOf:()=>[],sget:k=>memory[k]||null,sset:(k,v)=>{memory[k]=v},STORE_OK:true,Date});
  vm.runInContext(lerJs('minha-area-estado','assistente-setor','minha-area','demandas-quadro','demandas-quadro-ia'),c);
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
  vm.runInContext(lerJs('editor-arte','posts-painel','posts-acoes'),c);
  const a=vm.runInContext("reaArtePreparar({arte:{slides:[{titulo:'Um'},{titulo:'Dois'}],slide:1}},{fmt:'post'},{nome:'Cliente'})",c);
  assert.equal(a.slides[a.slide].titulo,'Dois');
  const desenhados=[];
  const ctx={createLinearGradient:()=>({addColorStop(){}}),fillRect(){},save(){},restore(){},beginPath(){},arc(){},fill(){},measureText:t=>({width:t.length*10}),fillText:t=>desenhados.push(t)};
  const canvas={width:0,height:0,style:{},getContext:()=>ctx};
  c.box={querySelector:s=>s==='[data-rea-art-canvas]'?canvas:null};c.a=a;
  vm.runInContext('reaArteDesenhar(box,a,null,null)',c);
  assert.ok(desenhados.includes('Dois'));
  const fonte=lerJs('editor-arte','posts-painel','posts-acoes');
  assert.ok(!/dataset\.reaArtSlide\b/.test(fonte));
});

await t('fonte completa: JavaScript concatenado compila', () => {
  const ordem=JSON.parse(ler('src/ordem.json'));
  const js=ordem.js.map(x=>ler(x.arquivo)).join('\n');
  new vm.Script(js,{filename:'site-concatenado.js'});
});
await t('briefing: materiais, aprovação e datas não se repetem entre serviços', () => {
  const c=vm.createContext({});
  vm.runInContext(ler('src/js/01-config-precos.js')+'\n'+ler('src/js/03-modulos-servicos.js'),c);
  vm.runInContext("const SEED=2,P={mods:['social','meta'],qa:[],skipTp:new Set()};",c);
  vm.runInContext(ler('src/js/18-briefing-assistente.js'),c);
  for(const id of ['materiaisbase','aprovacaoprazo','datasconfirmadas']){
    assert.equal(vm.runInContext("topicPool().filter(x=>x.t[0]==="+JSON.stringify(id)+").length",c),1);
  }
});

await t('links de candidatos recusam esquemas executáveis e aceitam HTTP(S)', () => {
  const c=vm.createContext({URL});
  const linha=ler('src/js/08-ui-base.js').split('\n').find(x=>x.startsWith('const webLink='));
  vm.runInContext(linha,c);
  for(const v of ['javascript:alert(1)','java\nscript:alert(1)','data:text/html,<script>alert(1)</script>','https://usuario:senha@site.com/']){
    assert.equal(vm.runInContext('webLink('+JSON.stringify(v)+')',c),'');
  }
  assert.equal(vm.runInContext("webLink('https://site.com/portfolio')",c),'https://site.com/portfolio');
});

console.log((falhou ? falhou + ' teste(s) falharam, ' : '') + ok + ' teste(s) passaram.');
process.exit(falhou ? 1 : 0);
