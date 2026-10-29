// Servidor do site no Cloudflare Pages (Pages Functions). Tudo em /api/*:
//   GET    /api/ping           consultor: confere o código do servidor
//   POST   /api/ia             consultor: repassa o pedido para a Groq com a chave guardada aqui (o navegador não vê a chave)
//   POST   /api/lead           visitante: guarda o briefing (no máximo 30 dias), com limite por IP
//   GET    /api/leads          consultor: lista os briefings guardados
//   DELETE /api/leads          consultor: apaga os briefings já puxados para a Minha área
//   GET    /api/site?url=...   consultor: baixa o HTML do site atual de um cliente para a análise do "Refazer site"
// Variáveis no Cloudflare (Settings > Variables and Secrets): GROQ_API_KEY (secreta), ADMIN_TOKEN (secreta, 32+ caracteres).
// Binding: LEADS (KV namespace). Sem dependências.

const GROQ = 'https://api.groq.com/openai/v1/chat/completions';
const MODELOS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];
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
  const t = await req.text();
  if (t.length > max) throw new Error('grande');
  return t;
}
// limite por IP com contador no KV (aproximado: o KV não é atômico, serve para segurar abuso, não para cobrança)
async function passouLimite(env, ip, chave, max, ttl) {
  const k = 'rl:' + chave + ':' + ip, n = +(await env.LEADS.get(k)) || 0;
  if (n >= max) return true;
  await env.LEADS.put(k, String(n + 1), { expirationTtl: ttl });
  return false;
}

async function ia(req, env) {
  if (!env.GROQ_API_KEY) return erro(500, 'GROQ_API_KEY não configurada no Cloudflare.');
  let b;
  try { b = JSON.parse(await lerTexto(req, MAX_PEDIDO)); } catch (e) { return erro(413, 'Pedido grande demais ou inválido.'); }
  if (!b || !MODELOS.includes(b.model) || !Array.isArray(b.messages)) return erro(400, 'Modelo não permitido ou pedido sem mensagens.');
  b.max_tokens = Math.min(Math.max(1, +b.max_tokens || 2048), 16000);
  const r = await fetch(GROQ, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.GROQ_API_KEY }, body: JSON.stringify(b) });
  // repassa o corpo como veio (streaming e mensagens de limite 429/413, que o site lê para esperar ou encolher)
  return new Response(r.body, { status: r.status, headers: { 'Content-Type': r.headers.get('Content-Type') || 'text/plain', 'Cache-Control': 'no-store' } });
}

async function guardaLead(req, env) {
  const ip = req.headers.get('CF-Connecting-IP') || 'sem-ip';
  if (await passouLimite(env, ip, 'min', 5, 120) || await passouLimite(env, ip, 'dia', 30, 86400)) return erro(429, 'Muitos envios. Tente de novo mais tarde.');
  let l;
  try { l = JSON.parse(await lerTexto(req, MAX_LEAD)); } catch (e) { return erro(400, 'Briefing inválido.'); }
  if (!l || typeof l.id !== 'string' || !/^[A-Za-z0-9]{1,24}$/.test(l.id) || typeof l.nome !== 'string' || !Array.isArray(l.qa)) return erro(400, 'Briefing incompleto.');
  await env.LEADS.put('lead:' + l.id, JSON.stringify({ ...l, recebido: new Date().toISOString() }), { expirationTtl: LEAD_TTL });
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

// baixa só http(s) na porta padrão, sem usuário e senha na URL, com tempo-limite e tamanho máximo
async function baixaSite(url) {
  let u;
  try { u = new URL(url); } catch (e) { return erro(400, 'Endereço inválido.'); }
  if (!/^https?:$/.test(u.protocol) || u.username || u.password || (u.port && !['80', '443'].includes(u.port)) || /^(localhost|\d+\.\d+\.\d+\.\d+|\[.*\])$/i.test(u.hostname)) return erro(400, 'Use um endereço público do site, como https://www.exemplo.com.br');
  let r;
  try { r = await fetch(u.toString(), { redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0 (OR Marketing Digital; analise de site)' }, signal: AbortSignal.timeout(15000) }); } catch (e) { return erro(502, 'O site não respondeu em 15 segundos.'); }
  const tipo = r.headers.get('Content-Type') || '';
  if (!/text\/html|application\/xhtml/i.test(tipo)) return erro(415, 'O endereço não devolveu uma página HTML.');
  const html = (await r.text()).slice(0, MAX_SITE);
  const cab = {};
  for (const h of ['content-security-policy', 'strict-transport-security', 'x-frame-options', 'x-content-type-options', 'referrer-policy', 'permissions-policy', 'server']) { const v = r.headers.get(h); if (v) cab[h] = v.slice(0, 400); }
  return json({ status: r.status, final: r.url, https: r.url.startsWith('https:'), cabecalhos: cab, html });
}

export async function onRequest({ request: req, env, params }) {
  const rota = (params.rota || []).join('/'), m = req.method;
  try {
    // "return await" para o catch pegar qualquer erro das rotas
    if (rota === 'lead' && m === 'POST') return env.LEADS ? await guardaLead(req, env) : erro(500, 'KV LEADS não ligado no Cloudflare.');
    if (!(await consultor(req, env))) return erro(401, 'Código do servidor ausente ou errado.');
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
