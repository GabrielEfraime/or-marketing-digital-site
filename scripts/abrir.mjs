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

http.createServer((req, res) => {
  const p = new URL(req.url, url).pathname;
  // só a página; as rotas /api/* existem apenas no Cloudflare
  if (p !== '/' && p !== '/index.html') { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Não encontrado.'); }
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY' });
  fs.createReadStream(pagina).pipe(res);
}).listen(PORTA, '127.0.0.1', () => {
  console.log('Plataforma' + (teste ? ' (build de TESTE)' : '') + ' em ' + url + '  (Ctrl+C para parar)');
  const [cmd, args] = process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : process.platform === 'darwin' ? ['open', [url]] : ['xdg-open', [url]];
  spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref();
});
