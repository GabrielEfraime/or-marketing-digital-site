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

// Contratos mínimos das Pages Functions em ambiente sem bindings.
// Testes D1/R2 reais são obrigatórios após a criação dos recursos e antes da publicação.
const {onRequest}=await import(pathToFileURL(path.join(RAIZ,'functions','api','[[rota]].js')).href);
const TOKEN='x'.repeat(40),env={ADMIN_TOKEN:TOKEN};
const chama=(route,options={},token)=>onRequest({
 request:new Request('https://teste.pages.dev/api/'+route,{...options,headers:{
  ...options.headers,...(token?{'X-OR-Token':token}:{}),'CF-Connecting-IP':'192.0.2.1'
 }}),
 env,params:{rota:route.split('?')[0].split('/')}
});
await t('sem D1, endpoint de dados falha fechado',async()=>{
 assert.equal((await chama('lead',{method:'POST',body:'{}'})).status,503);
 assert.equal((await chama('cloud/clients',{},TOKEN)).status,503);
});
await t('CORS: POST externo não altera dados',async()=>{
 const res=await chama('cloud/clients',{method:'PUT',headers:{Origin:'https://atacante.example'},body:'{}'},TOKEN);
 assert.equal(res.status,403);
});
await t('acesso a sites locais é negado',async()=>{
 const withDb={...env,DB:{}}; // apenas rota de site; sem consultas D1
 const r=await onRequest({request:new Request('https://teste.pages.dev/api/site?url='+encodeURIComponent('http://127.0.0.1/admin'),{headers:{'X-OR-Token':TOKEN}}),env:withDb,params:{rota:['site']}});
 assert.equal(r.status,400);
});
await t('arquivos de banco e portal fazem parte do projeto',()=>{
 assert.ok(ler('migrations/0001_or_cloudflare.sql').includes('CREATE TABLE IF NOT EXISTS posts'));
 assert.ok(ler('migrations/0001_or_cloudflare.sql').includes('CREATE TABLE IF NOT EXISTS brand_identities'));
 assert.ok(ler('src/portal.html').includes('/api/cloud/'));
 assert.ok(ler('functions/_lib/or-cloud.js').includes('HttpOnly; SameSite=Strict'));
});
console.log((falhou?falhou+' teste(s) falharam, ':'')+ok+' teste(s) passaram.');
process.exit(falhou?1:0);
