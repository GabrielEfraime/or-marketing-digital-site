// Monta o arquivo único estudio-ia.html a partir de src/ (sem dependências: só Node 18+).
// Uso:  node scripts/montar.mjs            -> grava dist/estudio-ia.html
//       node scripts/montar.mjs --copiar   -> também copia para ../estudio-ia.html (a pasta de cima)
//       node scripts/montar.mjs --watch    -> remonta sozinho quando você salvar um arquivo de src/
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ler = (rel) => fs.readFileSync(path.join(RAIZ, rel), 'utf8');

const escH = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// SEO do site público: tudo invisível para o visitante e igual ao conteúdo da página (sem texto escondido, que o Google pune).
// Lê src/seo.json, a marca e o WhatsApp de 01-config-precos.js e os serviços (nome e descrição) de 02-modulos-servicos.js.
export function seo() {
  const s = JSON.parse(ler('src/seo.json'));
  const cfg = ler('src/js/01-config-precos.js'), mods = ler('src/js/02-modulos-servicos.js');
  const marca = (cfg.match(/const BRAND='([^']+)'/) || [])[1] || 'OR Marketing Digital';
  const whats = (cfg.match(/const MY_WHATS='(\d+)'/) || [])[1] || '';
  const servicos = [...mods.matchAll(/^([a-z]+):\{c:'#[0-9A-Fa-f]+',name:'([^']+)',desc:'([^']+)'/gm)].map((m) => ({ nome: m[2], desc: m[3] }));
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

export function montar() {
  const ordem = JSON.parse(ler('src/ordem.json'));
  const css = ordem.css.map((p) => ler(p.arquivo)).join('\n');
  const js = ordem.js.map((p) => ler(p.arquivo)).join('\n');
  const molde = ler(ordem.molde);
  if (!molde.includes('{{CSS}}') || !molde.includes('{{JS}}')) throw new Error('O molde precisa ter {{CSS}} e {{JS}}.');
  if (!molde.includes('{{SEO}}') || !molde.includes('{{NOSCRIPT}}')) throw new Error('O molde precisa ter {{SEO}} e {{NOSCRIPT}}.');
  const S = seo();
  // function como substituto: evita que "$&" e "$1" do código sejam interpretados
  const d = new Date(), p = (n) => String(n).padStart(2, '0'), selo = p(d.getDate()) + '/' + p(d.getMonth() + 1) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  const html = molde.replace('{{SEO}}', () => S.head).replace('{{NOSCRIPT}}', () => S.noscript).replace('{{CSS}}', () => css).replace('{{JS}}', () => js.replace('__BUILD__', selo));
  // erro de sintaxe no JavaScript aparece aqui, antes de abrir o navegador
  try { new Function(js.replace('__BUILD__', 'x')); } catch (e) { throw new Error('Erro de sintaxe no JavaScript: ' + e.message); }
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
  // hospedagem (Cloudflare Pages): a página como index.html e os cabeçalhos de segurança que a meta tag não consegue dar
  gravar(html, path.join(RAIZ, 'dist', 'index.html'));
  const csp = (html.match(/Content-Security-Policy" content="([^"]+)"/) || [])[1];
  gravar('/*\n  Content-Security-Policy: ' + csp + "; frame-ancestors 'none'\n  X-Frame-Options: DENY\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n  Strict-Transport-Security: max-age=31536000; includeSubDomains\n  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()\n  Cross-Origin-Opener-Policy: same-origin\n/api/*\n  Cache-Control: no-store\n", path.join(RAIZ, 'dist', '_headers'));
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
