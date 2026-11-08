// Captura telas reais do site em tamanho cheio, com o Chrome (ou Edge) do computador. Sem dependências: usa o protocolo do Chrome (CDP) e o WebSocket do Node 22+.
// Serve de evidência visual obrigatória (veja TESTING.md). Não altera o site: só abre, rola e fotografa.
// Uso:  node scripts/capturar.mjs [url] [pasta]      (padrão: http://127.0.0.1:5173/ e capturas/)
//       Antes, suba o site:  npm run abrir   (ou outro servidor local)
//       --admin   também fotografa a Minha área (entra por script, só em ambiente local; não usa PIN real)
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const URL_SITE = args[0] || 'http://127.0.0.1:5173/', PASTA = path.resolve(args[1] || 'capturas');
const ADMIN = process.argv.includes('--admin');
const CHROMES = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  path.join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'), 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const chrome = CHROMES.find((p) => p && fs.existsSync(p));
if (!chrome) { console.error('ERRO: não achei Chrome nem Edge neste computador.'); process.exit(1); }
fs.mkdirSync(PASTA, { recursive: true });

const porta = 9300 + Math.floor(Math.random() * 400), perfil = fs.mkdtempSync(path.join(os.tmpdir(), 'or-cap-'));
const proc = spawn(chrome, ['--headless=new', '--remote-debugging-port=' + porta, '--user-data-dir=' + perfil, '--hide-scrollbars', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', 'about:blank'], { stdio: 'ignore' });
const espera = (ms) => new Promise((r) => setTimeout(r, ms));
const encerrar = () => { try { proc.kill(); } catch (e) {} setTimeout(() => { try { fs.rmSync(perfil, { recursive: true, force: true }); } catch (e) {} }, 800); };
process.on('exit', encerrar);

async function conectar() {
  for (let i = 0; i < 60; i++) {
    try {
      const abas = await (await fetch(`http://127.0.0.1:${porta}/json`)).json();
      const aba = abas.find((a) => a.type === 'page');
      if (aba) return aba.webSocketDebuggerUrl;
    } catch (e) {}
    await espera(250);
  }
  throw new Error('o Chrome não respondeu');
}
const ws = new WebSocket(await conectar());
await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error('falha no WebSocket do Chrome')); });
let id = 0; const pend = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pend.has(d.id)) { pend.get(d.id)(d); pend.delete(d.id); } };
const cmd = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pend.set(i, (d) => (d.error ? rej(new Error(method + ': ' + d.error.message)) : res(d.result))); ws.send(JSON.stringify({ id: i, method, params })); });
const js = async (expr) => { const r = await cmd('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' ' + (r.exceptionDetails.exception?.description || '')); return r.result.value; };
const foto = async (nome) => { const r = await cmd('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); const f = path.join(PASTA, nome + '.png'); fs.writeFileSync(f, Buffer.from(r.data, 'base64')); console.log('ok  ' + path.relative(process.cwd(), f)); return f; };

await cmd('Page.enable'); await cmd('Runtime.enable');
const abrir = async (w, h, mobile) => {
  await cmd('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: !!mobile });
  await cmd('Page.navigate', { url: URL_SITE }); await espera(3000);
  await js("(()=>{const b=[...document.querySelectorAll('button')].find(x=>/entrar/i.test(x.textContent));if(b)b.click()})()"); await espera(4500);
  await js("document.documentElement.style.scrollBehavior='auto'"); await espera(300);
};
const rolar = async (y) => { await js(`scrollTo(0,${y})`); await espera(1100); };
const alturaH2 = () => js("[...document.querySelectorAll('h2')].map(h=>Math.round(h.getBoundingClientRect().top+scrollY))");

const telas = [['desktop', 1440, 900, false], ['celular', 390, 844, true]];
const relatorio = {};
for (const [nome, w, h, mobile] of telas) {
  await abrir(w, h, mobile);
  const hs = await alturaH2(), total = await js('document.documentElement.scrollHeight');
  relatorio[nome] = { largura: w, alturaDaPagina: total, h2: hs.length };
  await rolar(0); await foto(`${nome}-01-topo`);
  const alvos = [hs[0], hs[1], hs[2], hs[4], hs[hs.length - 2]].filter((v) => v != null).map((v) => Math.max(0, v - 90));
  let n = 2; for (const y of alvos) { await rolar(y); await foto(`${nome}-${String(n++).padStart(2, '0')}-y${y}`); }
  relatorio[nome].fotos = n - 1;
}
if (ADMIN) {
  await abrir(1440, 900, false);
  await js("(()=>{document.body.className='adm';A.auth=true;V='admin';A.view='';A.sel=null;admin()})()"); await espera(1500); await foto('admin-leads');
  for (const [v, nome] of [['dash', 'dashboard'], ['cap', 'captar'], ['studio', 'studio'], ['posts', 'posts']]) { await js(`(()=>{A.view='${v}';admin()})()`); await espera(1500); await foto('admin-' + nome); }
}
fs.writeFileSync(path.join(PASTA, 'relatorio.json'), JSON.stringify({ url: URL_SITE, em: new Date().toISOString(), relatorio }, null, 1));
ws.close(); encerrar();
