import {json,fail,authenticate,authRoute,readJson,sameOrigin,dbReady,publicLead,upsertClient,listClients,listRows,assetRoute,audit,canRead,canWrite,ipLimit} from '../_lib/or-cloud.js';
const GROQ='https://api.groq.com/openai/v1/chat/completions';
const OPENAI='https://api.openai.com/v1/chat/completions';
const GEMINI='https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';
const MODELOS=/^(gpt-5|gpt-4[.]1|gpt-4o|o[0-9])[A-Za-z0-9.-]*$/;
const OUTROS=['openai/gpt-oss-120b','openai/gpt-oss-20b','qwen/qwen3.8-27b','gemini-3.5-flash','gemini-3.5-flash-lite','gemini-flash-lite-latest'];
const MAX_SITE=1500000;
async function ia(req,env,actor){
 if(await ipLimit(req,env,'ia:'+String(actor.id||'legacy'),60,3600000))return fail(429,'Limite de chamadas de IA atingido.');
 let b;try{b=await readJson(req,400000)}catch(e){return fail(400,'Pedido inválido ou grande demais.')}
 if(!b||typeof b.model!=='string'||!(MODELOS.test(b.model)||OUTROS.includes(b.model))||!Array.isArray(b.messages)||b.messages.length>100)return fail(400,'Modelo ou mensagens inválidas.');
 for(const m of b.messages){
  if(!m||!['system','user','assistant','tool'].includes(m.role)||typeof m.content!=='string'||m.content.length>200000)return fail(400,'Mensagem inválida.');
 }
 const target=b.model.startsWith('gemini')?['GEMINI_API_KEY',GEMINI]:MODELOS.test(b.model)?['OPENAI_API_KEY',OPENAI]:['GROQ_API_KEY',GROQ];
 if(!env[target[0]])return fail(503,'Provedor de IA não configurado.');
 b.stream=!!b.stream;
 for(const key of ['max_tokens','max_completion_tokens'])if(key in b)b[key]=Math.min(16000,Math.max(1,Number(b[key])||2048));
 try{
  const response=await fetch(target[1],{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+env[target[0]]},body:JSON.stringify(b),signal:AbortSignal.timeout(150000)});
  return new Response(response.body,{status:response.status,headers:{'Content-Type':response.headers.get('Content-Type')||'application/json','Cache-Control':'no-store'}});
 }catch(e){return fail(502,'Provedor de IA indisponível.')}
}
function isPublicHostname(host){
 const h=host.toLowerCase();
 return !(/^(localhost|localhost\.|.*\.localhost|.*\.local|.*\.internal|.*\.test|.*\.invalid|.*\.example|.*\.onion)$/.test(h)||
 h==='metadata.google.internal'||h==='169.254.169.254'||h==='0.0.0.0'||h.includes(':')||
 /^\d+(?:\.\d+){3}$/.test(h)||/^\d+$/.test(h));
}
async function inspectSite(raw){
 let url;try{url=new URL(raw)}catch(e){return fail(400,'Endereço inválido.')}
 if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.port||!isPublicHostname(url.hostname))return fail(400,'Endereço público HTTPS inválido.');
 let response;
 try{response=await fetch(url.toString(),{redirect:'manual',headers:{'User-Agent':'OR Marketing Digital (site review)'},signal:AbortSignal.timeout(15000)});}catch(e){return fail(502,'O site não respondeu.')}
 // Não seguir redirecionamentos automáticos para IPs internos ou outros hosts.
 if(response.status>=300&&response.status<400)return fail(409,'Redirecionamento detectado. Use o endereço final público.');
 if(!/text\/html|application\/xhtml/i.test(response.headers.get('Content-Type')||''))return fail(415,'O endereço não devolveu HTML.');
 const html=(await response.text()).slice(0,MAX_SITE);
 const cabecalhos={};for(const h of ['content-security-policy','strict-transport-security','x-frame-options','x-content-type-options','referrer-policy','permissions-policy','server']){const v=response.headers.get(h);if(v)cabecalhos[h]=v.slice(0,400)}
 return json({status:response.status,final:url.toString(),https:url.protocol==='https:',cabecalhos,html});
}
export async function onRequest({request,env,params}){
 const parts=Array.isArray(params.rota)?params.rota:[params.rota].filter(Boolean),route=parts.join('/'),m=request.method;
 if(m==='OPTIONS')return fail(405,'Método não permitido.');
 if(!sameOrigin(request)&&m!=='GET'&&m!=='HEAD')return fail(403,'Origem não permitida.');
 if(!dbReady(env)&&route!=='site')return fail(503,'Vincule um banco Cloudflare D1 usando o nome DB.');
 try{
  if(route==='lead'&&m==='POST')return publicLead(request,env);
  if(route==='cloud/auth/login'||route==='cloud/auth/logout'||route==='cloud/auth/bootstrap'||route==='cloud/auth/users'||route==='cloud/auth/me'||route==='cloud/auth/password')return authRoute(request,env,parts.slice(2).join('/'));
  const actor=await authenticate(request,env);
  if(!actor)return fail(401,'Autenticação necessária.');
  if(route==='ping'&&m==='GET')return json({ok:true,db:'D1',assets:!!env.ASSETS,user:{role:actor.role}});
  if(actor.must_change_password&&route!=='cloud/auth/password')return fail(403,'Troque a senha inicial antes de continuar.');
  if(route==='ia'&&m==='POST'&&actor.role!=='client')return ia(request,env,actor);
  if(route==='site'&&m==='GET'&&actor.role!=='client')return inspectSite(new URL(request.url).searchParams.get('url')||'');
  if(route==='leads'&&m==='GET'&&actor.role!=='client')return listClients(env.DB,actor);
  // API antiga removia briefings depois da importação. Agora o D1 é fonte persistente.
  if(route==='leads'&&m==='DELETE'&&actor.role!=='client')return json({ok:true,deleted:0,persistent:true});
  if(route==='cloud/clients'&&m==='GET')return listClients(env.DB,actor);
  if(route==='cloud/clients'&&m==='PUT'&&actor.role!=='client'){
   const lead=await readJson(request,850000);
   const outcome=await upsertClient(env.DB,lead);
   if(outcome.ok)await audit(env.DB,actor,'client:upsert',lead.id);
   return outcome;
  }
  if(parts[0]==='cloud'&&parts[1]==='clients'&&parts.length===4&&m==='GET'){
   const id=parts[2],kind=parts[3];
   if(!['briefings','posts','calendar','identity'].includes(kind))return fail(404,'Recurso desconhecido.');
   return listRows(env.DB,actor,kind,id,new URL(request.url).searchParams.get('month'));
  }
  if(parts[0]==='cloud'&&parts[1]==='assets'&&parts.length===4){
   return assetRoute(request,env,actor,parts[2],parts[3]);
  }
  return fail(404,'Rota não encontrada.');
 }catch(e){
  if(e?.message==='PAYLOAD_TOO_LARGE')return fail(413,'Pedido grande demais.');
  if(e instanceof SyntaxError)return fail(400,'JSON inválido.');
  return fail(500,'Erro interno ao processar a solicitação.');
 }
}
