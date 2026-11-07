// Gera estudio-ia-TESTE.html: o mesmo site, já com as IAs ligadas (Groq nas IAs 1, 2 e 3; Gemini como reserva; Pollinations nas imagens), com as chaves do .env.
// SÓ PARA TESTE LOCAL. O arquivo contém a chave: não publique, não envie e não ponha no zip.
// O estudio-ia.html normal nunca recebe chave. Uso: npm run montar:teste
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { montar } from './montar.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = fs.existsSync(path.join(RAIZ, '.env')) ? fs.readFileSync(path.join(RAIZ, '.env'), 'utf8') : '';
const pega = (n) => ((env.match(new RegExp('^' + n + '=(.+)', 'm')) || [])[1] || '').trim();
// ordem de IA_CHAVES no site: ia1, ia2, ia3, img (Gemini, reserva), pol (Pollinations, imagens)
const K = [pega('GROQ_API_KEY'), pega('GROQ_API_KEY'), pega('GROQ_API_KEY'), pega('GEMINI_API_KEY'), pega('POLLINATIONS_API_KEY')];
if (!K.some(Boolean)) { console.error('ERRO: coloque GROQ_API_KEY (e, se quiser, GEMINI_API_KEY e POLLINATIONS_API_KEY) no arquivo .env'); process.exit(1); }
// opcional: chave da Places API do Google para a tela Captar clientes (o site passa o valor para o cofre cifrado ao abrir)
const gplaces = pega('GOOGLE_PLACES_KEY');

const injeta = `/* BUILD DE TESTE: IAs ligadas com as chaves do .env. NÃO PUBLICAR. */
window.OR_TESTE=1;
(function(){try{
  const K=${JSON.stringify(K)};
  if(!localStorage.getItem('ikeys2'))localStorage.setItem('ikeys',JSON.stringify(K));
  const c=JSON.parse(localStorage.getItem('cfg2')||'{}');c.lembrar=true;localStorage.setItem('cfg2',JSON.stringify(c));
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
