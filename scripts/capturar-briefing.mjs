// Fotografa o briefing de cada serviço (1440 e 390), o contato direto e o erro da IA, com o Chrome do computador. Sem dependências.
// Uso: node scripts/capturar-briefing.mjs [url] [pasta]   (padrão: http://127.0.0.1:5173/ e capturas-briefing/). Suba o site antes: npm run abrir
// Só lê e fotografa; o caso de erro aponta as IAs para um endereço inválido só na aba de teste.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const URL_SITE = args[0] || 'http://127.0.0.1:5173/', PASTA = path.resolve(args[1] || 'capturas-briefing');
const CHROMES = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'), 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'];
const chrome = CHROMES.find((p) => p && fs.existsSync(p));
if (!chrome) { console.error('ERRO: não achei Chrome nem Edge.'); process.exit(1); }
fs.mkdirSync(PASTA, { recursive: true });
const porta = 9300 + Math.floor(Math.random() * 400), perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'or-capb-'));
const proc = spawn(chrome, ['--headless=new', '--remote-debugging-port=' + porta, '--user-data-dir=' + perfil, '--hide-scrollbars', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', 'about:blank'], { stdio: 'ignore' });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const encerrar = () => { try { proc.kill(); } catch (e) {} setTimeout(() => { try { fs.rmSync(perfil, { recursive: true, force: true }); } catch (e) {} }, 800); };
process.on('exit', encerrar);
async function conectar() {
  for (let i = 0; i < 60; i++) { try { const abas = await (await fetch(`http://127.0.0.1:${porta}/json`)).json(); const aba = abas.find((a) => a.type === 'page'); if (aba) return aba.webSocketDebuggerUrl; } catch (e) {} await espera(250); }
  throw new Error('o Chrome não respondeu');
}
const ws = new WebSocket(await conectar());
await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('falha no WebSocket')); });
let id = 0; const pend = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
const cmd = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, (d) => (d.error ? rej(new Error(method + ': ' + d.error.message)) : res(d.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const js = async (expr) => { const r = await cmd('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || '')); return r.result.value; };
const foto = async (nome) => {
  const h = await js('Math.max(document.documentElement.scrollHeight,innerHeight)'), w = await js('innerWidth');
  const r = await cmd('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: w, height: Math.min(h, 3000), scale: 1 } });
  fs.writeFileSync(path.join(PASTA, nome + '.png'), Buffer.from(r.data, 'base64'));
};
await cmd('Page.enable'); await cmd('Runtime.enable');

const AJUDA = `window.__s=ms=>new Promise(r=>setTimeout(r,ms));
window.__ini=async(m)=>{P.mods=m;P.mod=m[0];P.qa=[];P.cur=null;P.fail=false;P.aiDone=false;P.skipTp=new Set();P.who=null;P.done=null;P.page=null;pub();await __s(250)};
window.__gate=async()=>{document.querySelector('#ln').value='Teste Silva';document.querySelector('#lw').value='(21) 99999-0000';document.querySelector('#lc').checked=true;const a=document.querySelector('#lai');if(a)a.checked=false;document.querySelector('#go').click();await __s(300)};
window.__passo=async()=>{const h=document.querySelector('#qh');if(!h)return false;const c=document.querySelector('[data-o]');if(c){c.click();await __s(60);const n=document.querySelector('#nx');if(document.querySelector('#qh')&&document.querySelector('#qh').textContent===h.textContent&&n&&!n.hidden)n.click()}else{const f=document.querySelector('#f');f.value='Resposta de teste';document.querySelector('#nx').click()}await __s(120);return true};
window.__ate=async(m,k)=>{await __ini(m);await __gate();for(let i=0;i<80;i++){if(P.cur&&P.cur.tp&&P.cur.tp.endsWith(':'+k))return P.cur.tp;if(!(await __passo()))break}return 'fim'};
window.__medida=()=>{const q=document.querySelector('.dcont');const r=x=>x?[Math.round(x.getBoundingClientRect().left),Math.round(x.getBoundingClientRect().width),Math.round(x.getBoundingClientRect().height)]:null;return {dcont:r(q),botoes:[...document.querySelectorAll('.dcont .btn')].map(b=>r(b)),rolagemH:document.documentElement.scrollWidth>innerWidth}};`;

const CASOS = [['ads', ['ads'], 'pesq'], ['meta', ['meta'], 'destino'], ['social', ['social'], 'aprova'], ['site', ['site'], 'meta'], ['resite', ['resite'], 'acesso'],
  ['brand', ['brand'], 'uso'], ['mkt', ['mkt'], 'gargalo'], ['assess', ['assess'], 'dados'], ['comum', ['ads'], 'invest']];
const relatorio = {};
for (const [nome, w, h, mobile] of [['1440', 1440, 900, false], ['390', 390, 844, true]]) {
  await cmd('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile });
  await cmd('Page.navigate', { url: URL_SITE }); await espera(3500); await js(AJUDA);
  relatorio[nome] = {};
  await js("__ini(['ads'])"); await foto(`${nome}-00-contato-inicio`); relatorio[nome].gate = await js('__medida()');
  for (const [n, mods, chave] of CASOS) { const tp = await js(`__ate(${JSON.stringify(mods)},'${chave}')`); await foto(`${nome}-${n}`); relatorio[nome][n] = { tp, ...(await js('__medida()')) }; }
  // erro da IA: com endereço inválido a chamada falha e o briefing segue com as perguntas padrão
  await js("IA_CHAVES.forEach(k=>{if(CFG[k]){CFG[k].key=CFG[k].key||'x';CFG[k].url='https://invalido.invalid/v1'}});window.fetch=()=>Promise.reject(new Error('sem rede'));__ini(['site'])"); await espera(300);
  await js("document.querySelector('#ln').value='Teste Silva';document.querySelector('#lw').value='(21) 99999-0000';document.querySelector('#lc').checked=true;document.querySelector('#go').click()"); await espera(500);
  await js("(async()=>{for(let i=0;i<4;i++){const c=document.querySelector('[data-o]');if(c){c.click();await __s(100);const n=document.querySelector('#nx');if(n&&!n.hidden)n.click()}else{const f=document.querySelector('#f');if(f){f.value='Teste';document.querySelector('#nx').click()}}await __s(900)}})()");
  await espera(3000); await foto(`${nome}-erro-ia`); relatorio[nome].erroIA = { falhou: await js('!!P.fail'), pergunta: await js("document.querySelector('#qh')?.textContent||''"), aviso: await js("document.querySelector('.hint2[role=status]')?.textContent||''"), ...(await js('__medida()')) };
  
  // fim: lead criado e botão de WhatsApp
  await js("__ate(['ads'],'zzz')"); await espera(800); await foto(`${nome}-fim`); relatorio[nome].fim = { tela: await js("document.querySelector('h2')?.textContent"), lead: await js('(()=>{const l=getL()[0];return l&&{mods:l.mods,n:l.qa.length,status:l.status}})()') };
}
fs.writeFileSync(path.join(PASTA, 'relatorio.json'), JSON.stringify(relatorio, null, 1));
console.log(JSON.stringify(relatorio, null, 1));
ws.close(); encerrar();
