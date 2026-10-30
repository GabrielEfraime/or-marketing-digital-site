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
  const lead = { id: 'abc123', nome: 'Maria', qa: [{ q: 'Negócio', a: 'Confeitaria' }] };
  assert.equal((await chama('lead', { method: 'POST', body: JSON.stringify(lead) })).status, 200);
  assert.equal((await chama('lead', { method: 'POST', body: '{"id":"../x"}' })).status, 400);
  const L = (await (await chama('leads', {}, TOKEN)).json()).leads;
  assert.equal(L.length, 1); assert.equal(L[0].nome, 'Maria');
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
await t('servidor: leitura de site recusa endereço local', async () => {
  assert.equal((await chama('site?url=' + encodeURIComponent('http://127.0.0.1/admin'), {}, TOKEN)).status, 400);
  assert.equal((await chama('site?url=' + encodeURIComponent('file:///etc/passwd'), {}, TOKEN)).status, 400);
});

console.log((falhou ? falhou + ' teste(s) falharam, ' : '') + ok + ' teste(s) passaram.');
process.exit(falhou ? 1 : 0);
