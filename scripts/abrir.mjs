// Abre a plataforma por um servidor local em http://127.0.0.1:5173 (Ctrl+C para parar). Uso: npm run abrir  |  npm run abrir -- --teste
// Por que não abrir o arquivo direto (file://)? No Chrome, todo HTML aberto com duplo clique divide o mesmo armazenamento:
// um site de prévia baixado e aberto assim leria as chaves e os dados dos clientes. Pelo servidor local, a plataforma fica separada.
// Primeira vez neste endereço: clique em "Conectar pasta de backup no HD" para trazer os leads, ou importe um backup.
import http from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const teste = process.argv.includes('--teste');
const pagina = teste ? path.resolve(RAIZ, '..', 'estudio-ia-TESTE.html') : path.join(RAIZ, 'dist', 'estudio-ia.html');
if (!fs.existsSync(pagina)) { console.error('Ainda não existe ' + pagina + '. Rode: npm run ' + (teste ? 'montar:teste' : 'montar')); process.exit(1); }
const PORTA = Number(process.env.PORTA) || 5173, url = 'http://127.0.0.1:' + PORTA + '/';

// Chave Gemini do .env: entra só na página servida aqui (127.0.0.1), nunca no dist/ nem no git.
// Preenche a chave das IAs quando este navegador ainda não tem uma salva; a chave que você salvar na tela IAs continua valendo.
function chaveGemini() {
  const f = path.join(RAIZ, '.env');
  return fs.existsSync(f) ? (fs.readFileSync(f, 'utf8').match(/^GEMINI_API_KEY=(\S+)/m) || [])[1] || '' : '';
}
function comChave(html, k) {
  const js = `/* npm run abrir: chave Gemini do .env (só local). */
(function(){try{
  const K=${JSON.stringify(k)},U='https://generativelanguage.googleapis.com/v1beta/openai',M={ia1:'gemini-3.5-flash',ia2:'gemini-3.5-flash-lite',reserva:'gemini-flash-lite-latest'};
  let a=[];try{a=JSON.parse(localStorage.getItem('ikeys')||'[]')}catch(e){}
  if(a[0]&&a[1])return;
  const c=JSON.parse(localStorage.getItem('cfg2')||'{}');
  for(const s of ['ia1','ia2'])if(!c[s]||!/googleapis\\.com/.test(c[s].url||''))c[s]=Object.assign({},c[s],{kind:'openai',url:U,model:M[s],key:''});
  if(!c.reserva||!c.reserva.model)c.reserva={kind:'openai',url:U,model:M.reserva,key:''};
  c.seededGemini='1';localStorage.setItem('cfg2',JSON.stringify(c));
  localStorage.setItem('ikeys',JSON.stringify([a[0]||K,a[1]||K]));
}catch(e){}})();
`;
  const i = html.indexOf('<script>');
  return i < 0 ? html : html.slice(0, i + 8) + '\n' + js + html.slice(i + 8);
}

http.createServer((req, res) => {
  const p = new URL(req.url, url).pathname;
  // só a página; as rotas /api/* existem apenas no Cloudflare
  if (p !== '/' && p !== '/index.html') { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Não encontrado.'); }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY' });
  const k = teste ? '' : chaveGemini();
  if (!k) return fs.createReadStream(pagina).pipe(res);
  res.end(comChave(fs.readFileSync(pagina, 'utf8'), k));
}).listen(PORTA, '127.0.0.1', () => {
  console.log('Plataforma' + (teste ? ' (build de TESTE)' : '') + ' em ' + url + '  (Ctrl+C para parar)');
  if (!teste) console.log(chaveGemini() ? 'Chave Gemini do .env ligada nas IAs (só neste endereço local).' : 'Sem GEMINI_API_KEY no .env: cole a chave em Minha área > IAs.');
  const [cmd, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
});
