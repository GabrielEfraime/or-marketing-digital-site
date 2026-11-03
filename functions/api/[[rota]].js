// Servidor do site no Cloudflare Pages (Pages Functions). Tudo em /api/*:
//   GET    /api/ping           consultor: confere o código do servidor
//   POST   /api/ia             consultor: repassa o pedido para a OpenAI, o Gemini ou a Groq (conforme o modelo) com a chave guardada aqui (o navegador não vê a chave)
//   POST   /api/lead           visitante: guarda o briefing (no máximo 30 dias), com limite por IP
//   GET    /api/leads          consultor: lista os briefings guardados
//   DELETE /api/leads          consultor: apaga os briefings já puxados para a Minha área
//   GET    /api/site?url=...   consultor: baixa o HTML do site atual de um cliente para a análise do "Refazer site"
// Variáveis no Cloudflare (Settings > Variables and Secrets): OPENAI_API_KEY, GEMINI_API_KEY e GROQ_API_KEY (secretas), ADMIN_TOKEN (secreta, 32+ caracteres).
// Binding: LEADS (KV namespace). Sem dependências.

const GROQ = 'https://api.groq.com/openai/v1/chat/completions';
const OPENAI = 'https://api.openai.com/v1/chat/completions';
const GEMINI = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const MODELOS = /^(gpt-5|gpt-4[.]1|gpt-4o|o[0-9])[A-Za-z0-9.-]*$/;
const MODELOS_OUTROS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest'];
const MAX_PEDIDO = 400_000, MAX_LEAD = 64_000, MAX_SITE = 1_500_000, LEAD_TTL = 30 * 86400;

const json = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const erro = (status, msg) => json({ error: { message: msg } }, status);

async function igual(a, b) {
  const x = new TextEncoder().encode(a), y = new TextEncoder().encode(b);
  if (x.length !== y.length) return false;
  return crypto.subtle.timingSafeEqual ? crypto.subtle.timingSafeEqual(x, y) : x.every((v, i) => v === y[i]);
}
async function consultor(req, env) {
  const t = req.headers.get('X-OR-Token') || '';
  return !!env.ADMIN_TOKEN && env.ADMIN_TOKEN.length >= 32 && t.length >= 20 && (await igual(t, env.ADMIN_TOKEN));
}
async function lerTexto(req, max) {
  if (Number(req.headers.get('Content-Length')) > max) throw new Error('grande');
  if (!req.body) return '';
  const reader = req.body.getReader(), decoder = new TextDecoder();
  let size = 0, text = '';
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) { await reader.cancel(); throw new Error('grande'); }
      text += decoder.decode(value, { stream: true });
    }
    return text + decoder.decode();
  } finally { reader.releaseLock(); }
}
// limite por IP com contador no KV (aproximado: o KV não é atômico, serve para segurar abuso, não para cobrança)
async function passouLimite(env, ip, chave, max, ttl) {
  const k = 'rl:' + chave + ':' + ip, n = +(await env.LEADS.get(k)) || 0;
  if (n >= max) return true;
  await env.LEADS.put(k, String(n + 1), { expirationTtl: ttl });
  return false;
}

async function ia(req, env) {
  let b;
  try { b = JSON.parse(await lerTexto(req, MAX_PEDIDO)); } catch (e) { return erro(413, 'Pedido grande demais ou inválido.'); }
  if (!b || !(typeof b.model === 'string' && (MODELOS.test(b.model) || MODELOS_OUTROS.includes(b.model))) || !Array.isArray(b.messages)) return erro(400, 'Modelo não permitido ou pedido sem mensagens.');
  const alvo = b.model.startsWith('gemini') ? ['GEMINI_API_KEY', GEMINI] : MODELOS.test(b.model) ? ['OPENAI_API_KEY', OPENAI] : ['GROQ_API_KEY', GROQ], chave = env[alvo[0]];
  if (!chave) return erro(500, alvo[0] + ' não configurada no Cloudflare.');
  for (const k of ['max_tokens', 'max_completion_tokens']) if (k in b) b[k] = Math.min(Math.max(1, +b[k] || 2048), 16000);
  const r = await fetch(alvo[1], { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + chave }, body: JSON.stringify(b) });
  // repassa o corpo como veio (streaming e mensagens de limite 429/413, que o site lê para esperar ou encolher)
  return new Response(r.body, { status: r.status, headers: { 'Content-Type': r.headers.get('Content-Type') || 'text/plain', 'Cache-Control': 'no-store' } });
}

async function guardaLead(req, env) {
  const ip = req.headers.get('CF-Connecting-IP') || 'sem-ip';
  if (await passouLimite(env, ip, 'min', 5, 120) || await passouLimite(env, ip, 'dia', 30, 86400)) return erro(429, 'Muitos envios. Tente de novo mais tarde.');
  let l;
  try { l = JSON.parse(await lerTexto(req, MAX_LEAD)); } catch (e) { return erro(400, 'Briefing inválido.'); }
  if (!l || typeof l.id !== 'string' || !/^[A-Za-z0-9]{1,24}$/.test(l.id) || typeof l.nome !== 'string' || !Array.isArray(l.qa)) return erro(400, 'Briefing incompleto.');
  if (await env.LEADS.get('lead:' + l.id)) return erro(409, 'Este briefing já foi recebido.');
  const texto = (v, max) => typeof v === 'string' ? v.slice(0, max) : '';
  const servicos = ['ads','meta','social','youtube','local','press','brand','site','resite','mkt','assess','guia'];
  const recebido = new Date().toISOString();
  const publico = {
    id: l.id, nome: texto(l.nome, 120), whats: texto(l.whats, 30), email: texto(l.email, 160),
    mod: servicos.includes(l.mod) ? l.mod : undefined,
    mods: (Array.isArray(l.mods) ? l.mods : []).filter(x => servicos.includes(x)).slice(0, 12),
    qa: l.qa.filter(x => x && typeof x === 'object' && !Array.isArray(x)).slice(0, 100).map(x => ({ q: texto(x.q, 500), a: texto(x.a, 5000), tp: texto(x.tp, 40) })),
    consent: l.consent && typeof l.consent === 'object' ? { em: texto(l.consent.em, 40), versao: texto(l.consent.versao, 80) } : undefined,
    status: 'novo', t: Date.now(), data: recebido, recebido
  };
  await env.LEADS.put('lead:' + l.id, JSON.stringify(publico), { expirationTtl: LEAD_TTL });
  return json({ ok: true });
}

async function listaLeads(env) {
  const out = [];
  let cur;
  do {
    const p = await env.LEADS.list({ prefix: 'lead:', cursor: cur });
    for (const k of p.keys) { const v = await env.LEADS.get(k.name); if (v) try { out.push(JSON.parse(v)); } catch (e) {} }
    cur = p.list_complete ? null : p.cursor;
  } while (cur && out.length < 500);
  return json({ leads: out });
}

async function apagaLeads(req, env) {
  let b;
  try { b = JSON.parse(await lerTexto(req, 50_000)); } catch (e) { return erro(400, 'Pedido inválido.'); }
  const ids = (Array.isArray(b && b.ids) ? b.ids : []).filter((x) => typeof x === 'string' && /^[A-Za-z0-9]{1,24}$/.test(x)).slice(0, 500);
  await Promise.all(ids.map((id) => env.LEADS.delete('lead:' + id)));
  return json({ ok: true, apagados: ids.length });
}

function sitePublico(u) {
  const host = u.hostname.toLowerCase().replace(/\.$/, '');
  return /^https?:$/.test(u.protocol) && !u.username && !u.password &&
    (!u.port || (u.protocol === 'https:' ? u.port === '443' : u.port === '80')) &&
    host.includes('.') && !/^(localhost|\d+\.\d+\.\d+\.\d+|\[.*\])$/i.test(host) &&
    !/(^|\.)(localhost|local|internal|test|invalid|example|onion)$/.test(host);
}

// baixa só http(s) na porta padrão, sem usuário e senha na URL, com tempo-limite e tamanho máximo
async function baixaSite(url) {
  let u;
  try { u = new URL(url); } catch (e) { return erro(400, 'Endereço inválido.'); }
  let r;
  const signal = AbortSignal.timeout(15000);
  try {
    for (let salto = 0; salto <= 5; salto++) {
      if (!sitePublico(u)) return erro(400, 'Use um endereço público do site, como https://www.exemplo.com.br');
      r = await fetch(u.toString(), { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0 (OR Marketing Digital; analise de site)' }, signal });
      if (![301, 302, 303, 307, 308].includes(r.status)) break;
      const destino = r.headers.get('Location');
      if (r.body) await r.body.cancel();
      if (!destino || salto === 5) return erro(502, 'Redirecionamento inválido ou excessivo.');
      u = new URL(destino, u);
    }
  } catch (e) { return erro(502, 'O site não respondeu ou devolveu um endereço inválido.'); }
  const tipo = r.headers.get('Content-Type') || '';
  if (!/text\/html|application\/xhtml/i.test(tipo)) return erro(415, 'O endereço não devolveu uma página HTML.');
  let html;
  try { html = await lerTexto(r, MAX_SITE); } catch (e) { return erro(413, 'A página ultrapassou o tamanho máximo permitido.'); }
  const cab = {};
  for (const h of ['content-security-policy', 'strict-transport-security', 'x-frame-options', 'x-content-type-options', 'referrer-policy', 'permissions-policy', 'server']) { const v = r.headers.get(h); if (v) cab[h] = v.slice(0, 400); }
  return json({ status: r.status, final: u.href, https: u.protocol === 'https:', cabecalhos: cab, html });
}


/* Canva opcional: apenas gera novas imagens; não lista nem importa artes da conta. */
async function canvaPedido(env, caminho, init = {}) {
  return fetch('https://api.canva.com/rest/v1/' + caminho, {
    ...init, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.CANVA_ACCESS_TOKEN },
    redirect: 'error', signal: AbortSignal.timeout(30000)
  });
}
async function canvaRota(req, env, rota) {
  if (!env.CANVA_ACCESS_TOKEN) return erro(503, 'Canva não configurado no servidor. A conexão do chat não conecta o site. Use o editor interno enquanto a integração é autorizada.');
  if (rota === 'canva/gerar' && req.method === 'POST') {
    let b;
    try { b = JSON.parse(await lerTexto(req, 40000)); } catch (e) { return erro(400, 'Briefing de arte inválido.'); }
    if (!b || typeof b.prompt !== 'string' || !b.prompt.trim() || b.prompt.length > 10000 ||
        typeof b.chave !== 'string' || !/^[a-zA-Z0-9_-]{16,100}$/.test(b.chave)) return erro(400, 'Informe o briefing e a identificação da nova demanda.');
    const formatos = { feed: 'portrait_4_5', quadrado: 'square', story: 'portrait' };
    const r = await canvaPedido(env, 'image-generations', { method: 'POST', body: JSON.stringify({
      prompt: b.prompt, idempotency_key: b.chave, aspect_ratio: formatos[b.formato] || 'portrait_4_5',
      asset_upload: { type: 'none' }
    }) });
    if (!r.ok) return erro(r.status, r.status === 402 ? 'Os créditos de IA do Canva acabaram.' : r.status === 401 ? 'A autorização do Canva expirou. Renove a conexão no servidor.' : 'O Canva recusou a geração. Confira as permissões de geração de imagem da integração.');
    const o = await r.json();
    return json({ job: { id: o.job?.id, status: o.job?.status } });
  }
  const m = rota.match(/^canva\/(tarefa|imagem)\/([A-Za-z0-9_-]{1,200})$/);
  if (!m || req.method !== 'GET') return erro(404, 'Rota do Canva não encontrada.');
  const r = await canvaPedido(env, 'image-generations/' + encodeURIComponent(m[2]));
  if (!r.ok) return erro(r.status, 'Não foi possível consultar esta geração do Canva.');
  const o = await r.json(), job = o.job;
  if (m[1] === 'tarefa') return json({ job: { id: job?.id, status: job?.status, error: job?.error ? 'O Canva não conseguiu gerar esta imagem.' : undefined } });
  if (job?.status !== 'success' || !job.result?.image?.url) return erro(409, 'A imagem ainda não está pronta.');
  let url;
  try { url = new URL(job.result.image.url); } catch (e) { return erro(502, 'O Canva devolveu um endereço inválido.'); }
  if (url.protocol !== 'https:' || !sitePublico(url)) return erro(502, 'O Canva devolveu um endereço inválido.');
  const image = await fetch(url.href, { redirect: 'error', signal: AbortSignal.timeout(30000) });
  const tipo = image.headers.get('Content-Type')?.split(';')[0];
  if (!image.ok || !['image/png', 'image/jpeg', 'image/webp'].includes(tipo) || !image.body) return erro(502, 'O Canva não devolveu uma imagem compatível.');
  const reader = image.body.getReader(), partes = []; let tamanho = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read(); if (done) break;
      tamanho += value.byteLength;
      if (tamanho > 12 * 1024 * 1024) { await reader.cancel(); return erro(413, 'A imagem ultrapassou 12 MB.'); }
      partes.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(tamanho);let pos = 0;
  for (const p of partes) { bytes.set(p, pos);pos += p.length; }
  return new Response(bytes, { headers: { 'Content-Type': tipo, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

export async function onRequest({ request: req, env, params }) {
  const rota = (params.rota || []).join('/'), m = req.method;
  try {
    // "return await" para o catch pegar qualquer erro das rotas
    if (rota === 'lead' && m === 'POST') return env.LEADS ? await guardaLead(req, env) : erro(500, 'KV LEADS não ligado no Cloudflare.');
    if (!(await consultor(req, env))) return erro(401, 'Código do servidor ausente ou errado.');
    if (rota.startsWith('canva/')) return await canvaRota(req, env, rota);
    if (rota === 'ping' && m === 'GET') return json({ ok: true });
    if (rota === 'ia' && m === 'POST') return await ia(req, env);
    if (rota === 'leads' && env.LEADS && m === 'GET') return await listaLeads(env);
    if (rota === 'leads' && env.LEADS && m === 'DELETE') return await apagaLeads(req, env);
    if (rota === 'site' && m === 'GET') return await baixaSite(new URL(req.url).searchParams.get('url') || '');
    return erro(404, 'Rota não encontrada.');
  } catch (e) {
    return erro(500, 'Erro no servidor.');
  }
}
