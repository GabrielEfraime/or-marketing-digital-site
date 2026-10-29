// Verificações de segurança e de qualidade do arquivo montado. Uso: node scripts/verificar.mjs
// Termina com código 1 se algo importante falhar (serve também para automatizar depois).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { montar } from './montar.mjs';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = montar();
let falhas = 0;
const ok = (m) => console.log('  ok     ' + m);
const ruim = (m) => { falhas++; console.log('  FALHOU ' + m); };
const aviso = (m) => console.log('  aviso  ' + m);

console.log('Verificando o arquivo montado (' + (Buffer.byteLength(html) / 1024).toFixed(0) + ' KB)');

// 1. Política de segurança do navegador presente e sem curinga perigoso
const csp = (html.match(/Content-Security-Policy" content="([^"]+)"/) || [])[1] || '';
csp ? ok('política de segurança (CSP) presente') : ruim('sem CSP no <head>');
if (/default-src 'none'/.test(csp)) ok("CSP começa fechada (default-src 'none')"); else ruim("CSP sem default-src 'none'");
if (/\*(?![:\s;])/.test(csp.replace(/localhost:\*|127\.0\.0\.1:\*/g, ''))) ruim('CSP com curinga (*) fora do localhost'); else ok('CSP sem curinga fora do localhost');

// 2. Nenhum recurso de terceiros carregado sozinho (só chamadas pedidas pelo usuário)
const PERMITIDOS = ['wa.me', 'web.whatsapp.com', 'api.groq.com', 'api.openai.com', 'api.anthropic.com', 'openrouter.ai', 'api.cerebras.ai',
  'generativelanguage.googleapis.com', 'www.googleapis.com', 'places.googleapis.com', 'overpass-api.de', 'overpass.kumi.systems', 'openstreetmap.org', 'googleusercontent.com', 'instagram.com', 'console.cloud.google.com', 'schema.org', 'ads.google.com', 'facebook.com', 'landdding.com', 'dopaminestudio.io', 'bar-topas.ch', 'pradiplabs.dev', 'dark-moon.org', 'www.w3.org', 'localhost', '127.0.0.1'];
const hosts = new Set();
for (const m of html.matchAll(/https?:\/\/([a-z0-9.-]+)/gi)) hosts.add(m[1].toLowerCase());
const fora = [...hosts].filter((h) => !PERMITIDOS.some((p) => h === p || h.endsWith('.' + p)));
fora.length ? aviso('endereços fora da lista permitida (confira se são exemplos de texto): ' + fora.join(', ')) : ok('só endereços da lista permitida');
if (/fonts\.googleapis|fonts\.gstatic|cdnjs|unpkg|jsdelivr/i.test(html)) ruim('carrega fontes ou scripts de CDN (vaza IP do visitante)'); else ok('sem Google Fonts nem CDN');

// 3. Segredos
const SEGREDOS = [/gsk_[A-Za-z0-9]{20,}/, /sk-ant-[A-Za-z0-9_-]{20,}/, /sk-[A-Za-z0-9]{32,}/, /AIza[0-9A-Za-z_-]{30,}/, /ghp_[A-Za-z0-9]{30,}/];
SEGREDOS.some((r) => r.test(html)) ? ruim('parece haver uma chave de API dentro do código') : ok('nenhuma chave de API no código');

html.includes('window.OR_TESTE=1') ? ruim('o build normal está com a marca do build de TESTE') : ok('build normal sem a marca de teste');
for (const p of ['dist/estudio-ia-TESTE.html', 'docs/estudio-ia-TESTE.html']) if (fs.existsSync(path.join(RAIZ, p))) ruim('build de TESTE (com chave) dentro de ' + p);

// 4. Sem restos de depuração e sem avaliação dinâmica de código
/\bconsole\.(log|debug)\(/.test(html.includes('/*THREE_R159*/') ? html.slice(0, html.indexOf('/*THREE_R159*/')) + html.slice(html.indexOf('function orAberturaRodar')) : html) ? ruim('console.log esquecido') : ok('sem console.log');
/\beval\(|new Function\(/.test(html) ? ruim('eval ou new Function no código do site') : ok('sem eval nem new Function');
html.includes('__il') ? ruim('registro temporário de depuração (__il) ainda no código') : ok('sem registro temporário de depuração');

// 5. SEO (o que só o Google lê: título, descrição, robots, dados estruturados)
const titulo = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
titulo && titulo.length <= 70 ? ok('título com ' + titulo.length + ' caracteres') : ruim('título ausente ou com mais de 70 caracteres');
const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
desc.length >= 70 && desc.length <= 170 ? ok('descrição com ' + desc.length + ' caracteres') : ruim('descrição ausente ou fora de 70 a 170 caracteres');
/<meta name="robots" content="index/.test(html) ? ok('robots libera a indexação') : ruim('robots bloqueia o Google (noindex) no build normal');
const ldm = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
try { const ld = JSON.parse(ldm[1]); ld['@graph'] && ld['@graph'].length ? ok('dados estruturados (JSON-LD) válidos') : ruim('JSON-LD sem @graph'); } catch (e) { ruim('JSON-LD ausente ou inválido'); }
/<noscript>[\s\S]*<h1>/.test(html) ? ok('conteúdo para quem abre sem JavaScript') : aviso('sem conteúdo em <noscript>');
/<link rel="canonical"/.test(html) ? ok('canonical presente') : aviso('sem canonical e sem sitemap: preencha "url" em src/seo.json quando tiver o domínio');
/google-site-verification/.test(html) ? ok('verificação do Google Search Console presente') : aviso('sem a meta de verificação do Search Console (preencha "googleVerificacao" em src/seo.json)');

// 6. Itens que o dono precisa decidir (não falham, só lembram)
const consts = ['RESPONSAVEL', 'PRIV_EMAIL'];
for (const c of consts) { if (new RegExp('const ' + c + "=''").test(html)) aviso(c + ' está vazio (preencher antes de publicar)'); }
if (/const VAGAS=\[\]/.test(html)) aviso('VAGAS está vazio (a página de vagas mostra "nenhuma vaga aberta")');
if (/const ADMIN_PIN='1234'/.test(html)) aviso("PIN padrão 1234 no código: o app obriga a trocar no primeiro acesso, mas confirme");

// 7. Diferença para o arquivo da pasta de cima
const topo = path.resolve(RAIZ, '..', 'estudio-ia.html');
if (fs.existsSync(topo)) { fs.readFileSync(topo, 'utf8') === html ? ok('idêntico a ../estudio-ia.html') : aviso('diferente de ../estudio-ia.html (rode "npm run montar:copiar" para atualizar)'); }

// 8. Testes automáticos (contas, data, WhatsApp, servidor do Cloudflare)
const tst = spawnSync(process.execPath, [path.join(RAIZ, 'scripts', 'testar.mjs')], { encoding: 'utf8' });
tst.status === 0 ? ok('testes: ' + tst.stdout.trim()) : ruim('testes: ' + (tst.stdout + tst.stderr).trim().slice(0, 600));

console.log(falhas ? '\n' + falhas + ' falha(s).' : '\nTudo certo.');
process.exit(falhas ? 1 : 0);
