// Monta o arquivo único estudio-ia.html a partir de src/ (sem dependências: só Node 18+).
// Uso:  node scripts/montar.mjs            -> grava dist/estudio-ia.html
//       node scripts/montar.mjs --copiar   -> também copia para ../estudio-ia.html (a pasta de cima)
//       node scripts/montar.mjs --watch    -> remonta sozinho quando você salvar um arquivo de src/
import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ler = (rel) => fs.readFileSync(path.join(RAIZ, rel), 'utf8');

const escH = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// SEO do site público: tudo invisível para o visitante e igual ao conteúdo da página (sem texto escondido, que o Google pune).
// Lê src/seo.json, a marca e o WhatsApp de 01-config-precos.js e os serviços da vitrine (nome e descrição) de 15-conteudo-servicos.js.
export function seo() {
  const s = JSON.parse(ler('src/seo.json'));
  const cfg = ler('src/js/01-config-precos.js'), vit = ler('src/js/15-conteudo-servicos.js');
  const marca = (cfg.match(/const BRAND='([^']+)'/) || [])[1] || 'OR Marketing Digital';
  const whats = (cfg.match(/const MY_WHATS='(\d+)'/) || [])[1] || '';
  const servicos = [...vit.matchAll(/\{k:'[a-z]+',name:'([^']+)',mods:\[[^\]]*\],desc:'([^']+)'\}/g)].map((m) => ({ nome: m[1], desc: m[2] }));
  if (!servicos.length) throw new Error('montar: não achei os serviços de VITRINE em 15-conteudo-servicos.js');
  const url = /^https:\/\/[^\s"'<>]+\/$/.test(s.url || '') ? s.url : '';
  const tel = whats.length === 13 ? '+' + whats.slice(0, 2) + '-' + whats.slice(2, 4) + '-' + whats.slice(4, 9) + '-' + whats.slice(9) : '';
  const negocio = {
    '@type': 'ProfessionalService', '@id': (url || '') + '#empresa', name: marca, description: s.descricao,
    areaServed: { '@type': 'City', name: s.cidade },
    address: { '@type': 'PostalAddress', addressLocality: s.cidade, addressRegion: s.estado, addressCountry: 'BR' },
    ...(url ? { url } : {}), ...(tel ? { telephone: tel } : {}),
    hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Serviços', itemListElement: servicos.map((x) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: x.nome, description: x.desc } })) },
  };
  const ld = { '@context': 'https://schema.org', '@graph': [negocio, { '@type': 'WebSite', name: marca, inLanguage: 'pt-BR', ...(url ? { url } : {}), publisher: { '@id': (url || '') + '#empresa' } }] };
  const head = [
    '<title>' + escH(s.titulo) + '</title>',
    '<meta name="description" content="' + escH(s.descricao) + '">',
    '<meta name="robots" content="index,follow,max-image-preview:large">',
    url && '<link rel="canonical" href="' + escH(url) + '">',
    s.googleVerificacao && '<meta name="google-site-verification" content="' + escH(s.googleVerificacao) + '">',
    '<meta property="og:type" content="website">', '<meta property="og:locale" content="pt_BR">',
    '<meta property="og:site_name" content="' + escH(marca) + '">', '<meta property="og:title" content="' + escH(s.titulo) + '">',
    '<meta property="og:description" content="' + escH(s.descricao) + '">', url && '<meta property="og:url" content="' + escH(url) + '">',
    '<meta name="twitter:card" content="summary">',
    '<script type="application/ld+json">' + JSON.stringify(ld).replace(/</g, '\\u003c') + '</script>',
  ].filter(Boolean).join('\n');
  // mesmo conteúdo da página, para quem abre sem JavaScript e para robôs que não rodam JavaScript
  const noscript = '<noscript><main class="nojs" style="max-width:760px;margin:40px auto;padding:0 20px;font:16px/1.6 system-ui,sans-serif;color:#f2f2f2;background:#0b0b0b">'
    + '<h1>' + escH(marca) + ': marketing digital sob medida</h1><p>' + escH(s.descricao) + '</p><h2>Serviços</h2><ul>'
    + servicos.map((x) => '<li><b>' + escH(x.nome) + '</b>: ' + escH(x.desc) + '</li>').join('') + '</ul>'
    + (whats ? '<p><a href="https://wa.me/' + whats + '" style="color:#FF8A4D">Fale com a gente no WhatsApp</a></p>' : '')
    + '<p>Para responder o briefing e ver o site completo, ative o JavaScript no navegador.</p></main></noscript>';
  const hoje = new Date().toISOString().slice(0, 10);
  return {
    head, noscript, url,
    robots: 'User-agent: *\nAllow: /\n' + (url ? 'Sitemap: ' + url + 'sitemap.xml\n' : ''),
    sitemap: url ? '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>' + escH(url) + '</loc><lastmod>' + hoje + '</lastmod></url>\n</urlset>\n' : '',
  };
}


// Cofre do site: as chaves de IA entram no site CIFRADAS, nunca em texto. Cifra AES-256-GCM com chave derivada da senha (PBKDF2-SHA256, 600 mil voltas),
// no mesmo formato do backup protegido do app (bkpCifra/bkpDecifra), então o navegador abre com a função que já existe.
// Entradas (ambiente do GitHub Actions ou arquivo .env local, gitignorado): COFRE_SENHA (mínimo 12 caracteres) e as chaves GROQ_API_KEY, GEMINI_API_KEY, POLLINATIONS_API_KEY.
// Sem senha ou sem chave, o site sai sem cofre (null): a chave em texto nunca vai para a página.
export function cofre(chaves, senha) {
  if (typeof senha !== 'string' || senha.length < 12) throw new Error('COFRE_SENHA precisa ter pelo menos 12 caracteres.');
  const it = 600000, salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
  const chave = crypto.pbkdf2Sync(Buffer.from(senha, 'utf8'), salt, it, 32, 'sha256');
  const c = crypto.createCipheriv('aes-256-gcm', chave, iv);
  const ct = Buffer.concat([c.update(Buffer.from(JSON.stringify(chaves), 'utf8')), c.final(), c.getAuthTag()]);  // mesmo layout do WebCrypto: texto cifrado + etiqueta
  return { v: 1, cripto: 'AES-GCM-256', kdf: 'PBKDF2-SHA256', it, salt: salt.toString('base64'), iv: iv.toString('base64'), dados: ct.toString('base64') };
}
function envLocal() {
  const f = path.join(RAIZ, '.env'), o = {};
  if (!fs.existsSync(f)) return o;
  for (const l of fs.readFileSync(f, 'utf8').split(/\r?\n/)) { const m = l.match(/^([A-Z0-9_]+)=(.*)$/); if (m) o[m[1]] = m[2].trim(); }
  return o;
}
export function cofreDoAmbiente() {
  const e = { ...envLocal(), ...Object.fromEntries(Object.entries(process.env).filter(([, v]) => v)) };
  const chaves = {};
  if (e.GROQ_API_KEY) chaves.groq = e.GROQ_API_KEY;
  if (e.GEMINI_API_KEY) chaves.gemini = e.GEMINI_API_KEY;
  if (e.POLLINATIONS_API_KEY || e.POLLINATIONS_KEY) chaves.pollinations = e.POLLINATIONS_API_KEY || e.POLLINATIONS_KEY;
  if (!Object.keys(chaves).length) return null;
  if (!e.COFRE_SENHA) { console.log('aviso: há chaves de IA no ambiente, mas falta COFRE_SENHA: o site sai SEM cofre (a chave nunca vai em texto).'); return null; }
  return cofre(chaves, e.COFRE_SENHA);
}

export function montar() {
  const ordem = JSON.parse(ler('src/ordem.json'));
  // fontes de src/fontes/ entram embutidas (data:), porque a CSP não deixa carregar fonte de fora
  const css = ordem.css.map((p) => ler(p.arquivo)).join('\n').replace(/url\("\.\.\/fontes\/([\w.-]+\.woff2)"\)/g,
    (_, f) => 'url("data:font/woff2;base64,' + fs.readFileSync(path.join(RAIZ, 'src/fontes', f)).toString('base64') + '")');
  const js = ordem.js.map((p) => ler(p.arquivo)).join('\n');
  const molde = ler(ordem.molde);
  if (!molde.includes('{{CSS}}') || !molde.includes('{{JS}}')) throw new Error('O molde precisa ter {{CSS}} e {{JS}}.');
  if (!molde.includes('{{SEO}}') || !molde.includes('{{NOSCRIPT}}')) throw new Error('O molde precisa ter {{SEO}} e {{NOSCRIPT}}.');
  const S = seo();
  const COFRE = cofreDoAmbiente();
  if (COFRE) console.log('ok  cofre do site com as chaves de IA (cifrado)');
  // function como substituto: evita que "$&" e "$1" do código sejam interpretados
  const d = new Date(), p = (n) => String(n).padStart(2, '0'), selo = p(d.getDate()) + '/' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  const html = molde.replace('{{SEO}}', () => S.head).replace('{{NOSCRIPT}}', () => S.noscript).replace('{{CSS}}', () => css).replace('{{JS}}', () => js.replace('__BUILD__', selo).replace('__COFRE__', () => JSON.stringify(COFRE)));
  // erro de sintaxe no JavaScript aparece aqui, antes de abrir o navegador
  try { new Function(js.replace('__BUILD__', 'x').replace('__COFRE__', 'null')); } catch (e) { throw new Error('Erro de sintaxe no JavaScript: ' + e.message); }
  return html;
}

function gravar(html, destino) {
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, html);
  console.log('ok  ' + path.relative(process.cwd(), destino) + '  ' + (Buffer.byteLength(html) / 1024).toFixed(0) + ' KB');
}

function executar() {
  const html = montar();
  gravar(html, path.join(RAIZ, 'dist', 'estudio-ia.html'));
  // hospedagem (GitHub Pages): a página como index.html; a publicação oficial é só o dist/ pelo Actions (.github/workflows/pages.yml)
  gravar(html, path.join(RAIZ, 'dist', 'index.html'));
  // arquivos que só o Google lê; vão para a raiz da hospedagem junto com o site
  const S = seo();
  gravar(S.robots, path.join(RAIZ, 'dist', 'robots.txt'));
  const sm = path.join(RAIZ, 'dist', 'sitemap.xml');
  if (S.sitemap) gravar(S.sitemap, sm); else { if (fs.existsSync(sm)) fs.rmSync(sm); console.log('aviso: sem "url" em src/seo.json, sitemap.xml não gerado'); }
  if (process.argv.includes('--copiar')) gravar(html, path.resolve(RAIZ, '..', 'estudio-ia.html'));
  return html;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { executar(); } catch (e) { console.error('ERRO: ' + e.message); process.exit(1); }
  if (process.argv.includes('--watch')) {
    console.log('Observando src/ ... (Ctrl+C para parar)');
    let espera;
    fs.watch(path.join(RAIZ, 'src'), { recursive: true }, () => {
      clearTimeout(espera);
      espera = setTimeout(() => { try { executar(); } catch (e) { console.error('ERRO: ' + e.message); } }, 200);
    });
  }
}
