// Gera estudio-ia-TESTE.html: o mesmo site, já com a IA ligada (Gemini se houver GEMINI_API_KEY no .env; senão Groq).
// SÓ PARA TESTE LOCAL. O arquivo contém a chave: não publique, não envie e não ponha no zip.
// O estudio-ia.html normal nunca recebe chave. Uso: npm run montar:teste
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { montar } from './montar.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = fs.existsSync(path.join(RAIZ, '.env')) ? fs.readFileSync(path.join(RAIZ, '.env'), 'utf8') : '';
const gemini = (env.match(/^GEMINI_API_KEY=(\S+)/m) || [])[1];
const chave = gemini || (env.match(/^GROQ_API_KEY=(\S+)/m) || [])[1];
if (!chave) { console.error('ERRO: coloque GEMINI_API_KEY=... (ou GROQ_API_KEY=...) no arquivo .env'); process.exit(1); }
// com a chave Gemini, as três IAs usam o Gemini; senão, a Groq
const U = gemini ? 'https://generativelanguage.googleapis.com/v1beta/openai' : 'https://api.groq.com/openai/v1';
const M = gemini ? ['gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest'] : ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];
// opcional: chave da Places API do Google para a tela Captar clientes
const gplaces = (env.match(/^GOOGLE_PLACES_KEY=(\S+)/m) || [])[1] || '';

const injeta = `/* BUILD DE TESTE: Groq ligada com a chave do .env. NÃO PUBLICAR. */
window.OR_TESTE=1;
(function(){try{
  const K=${JSON.stringify(chave)},U=${JSON.stringify(U)};
  const c=JSON.parse(localStorage.getItem('cfg2')||'{}');
  c.ia1=Object.assign({},c.ia1,{kind:'openai',url:U,model:${JSON.stringify(M[0])},key:''});
  c.ia2=Object.assign({},c.ia2,{kind:'openai',url:U,model:${JSON.stringify(M[1])},key:''});
  c.reserva={kind:'openai',url:U,model:${JSON.stringify(M[2])},key:''};c.seededIA3='1';c.lembrar=true;
  localStorage.setItem('cfg2',JSON.stringify(c));localStorage.setItem('ikeys',JSON.stringify([K,K]));
  const G=${JSON.stringify(gplaces)};if(G&&!localStorage.getItem('gplaces'))localStorage.setItem('gplaces',G);
}catch(e){}})();
`;
let html = montar();
const i = html.indexOf('<script>');
if (i < 0) throw new Error('não achei o <script> do molde');
html = html.slice(0, i + 8) + '\n' + injeta + html.slice(i + 8);
// o build de teste nunca pode ir para o Google
html = html.replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex,nofollow">');
const destino = path.resolve(RAIZ, '..', 'estudio-ia-TESTE.html');
fs.writeFileSync(destino, html);
console.log('ok  ' + destino + '  (contém a chave: só para teste local)');
