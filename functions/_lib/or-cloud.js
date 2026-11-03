// Camada D1/R2 compartilhada pelas Pages Functions. Nenhum segredo é enviado ao navegador.
export const json=(data,status=200,extra={})=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...extra}});
export const fail=(status,message)=>json({error:{message}},status);
export const validId=x=>typeof x==='string'&&/^[A-Za-z0-9]{1,24}$/.test(x);
export const validAsset=x=>typeof x==='string'&&/^(marca|arte:[A-Za-z0-9]{1,24})$/.test(x);
const enc=new TextEncoder();
const hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const sha=async s=>hex(await crypto.subtle.digest('SHA-256',enc.encode(s)));
const safeEqual=async(a,b)=>!!a&&!!b&&(await sha(a))===(await sha(b));
const now=()=>Date.now();
export const dbReady=env=>!!env.DB;
export function sameOrigin(request){
 const o=request.headers.get('Origin');
 return !o||o===new URL(request.url).origin;
}
export async function readJson(request,max=800000){
 const len=+(request.headers.get('Content-Length')||0);
 if(len>max)throw new Error('PAYLOAD_TOO_LARGE');
 const raw=await request.text();
 if(raw.length>max)throw new Error('PAYLOAD_TOO_LARGE');
 return JSON.parse(raw);
}
export async function rateLimit(db,key,max,windowMs){
 const t=now(),until=t+windowMs;
 const row=await db.prepare("INSERT INTO rate_limits(key,count,reset_at) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN reset_at<=? THEN 1 ELSE count+1 END,reset_at=CASE WHEN reset_at<=? THEN ? ELSE reset_at END RETURNING count").bind(key,until,t,t,until).first();
 return +(row?.count||1)>max;
}
export async function ipLimit(req,env,action,max,windowMs){
 const ip=req.headers.get('CF-Connecting-IP')||'unknown';
 return rateLimit(env.DB,await sha('or:rl:'+action+':'+ip),max,windowMs);
}
const b64=u=>btoa(String.fromCharCode(...u)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const salt=()=>b64(crypto.getRandomValues(new Uint8Array(16)));
async function derive(pass,s){
 const base=await crypto.subtle.importKey('raw',enc.encode(pass),'PBKDF2',false,['deriveBits']);
 const raw=Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));
 return hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:raw,iterations:210000,hash:'SHA-256'},base,256));
}
const cookieValue=req=>(req.headers.get('Cookie')||'').match(/(?:^|;\s*)or_session=([A-Za-z0-9_-]{30,128})/)?.[1]||'';
export async function authenticate(req,env){
 if(!env.DB)return null;
 const token=cookieValue(req);
 if(token){
  const row=await env.DB.prepare("SELECT u.id,u.email,u.role,u.client_id,u.must_change_password FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token_hash=? AND s.expires_at>? AND u.disabled_at IS NULL").bind(await sha(token),now()).first();
  if(row)return row;
 }
 const legacy=req.headers.get('X-OR-Token')||'';
 if(env.ADMIN_TOKEN&&env.ADMIN_TOKEN.length>=32&&legacy.length>=32&&await safeEqual(legacy,env.ADMIN_TOKEN))
  return {id:null,email:'admin-token',role:'admin',client_id:null,must_change_password:0,legacy:true};
 return null;
}
export function canRead(a,id){return !!a&&(a.role==='admin'||a.role==='staff'||(a.role==='client'&&a.client_id===id));}
export function canWrite(a,id){return !!a&&(a.role==='admin'||a.role==='staff'||(a.role==='client'&&a.client_id===id&&false));}
export function requireAdmin(a){return !!a&&a.role==='admin'}
export async function audit(db,actor,action,target){
 await db.prepare("INSERT INTO audit_log(id,actor_id,action,target_id,created_at) VALUES(?,?,?,?,?)").bind(crypto.randomUUID(),actor?.id||null,action,target||null,now()).run();
}
export async function createUser(env,actor,b){
 const email=String(b.email||'').toLowerCase().trim(),role=b.role||'client',password=String(b.password||'');
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<12||password.length>128||!['admin','staff','client'].includes(role)||role==='client'&&!validId(b.client_id))return fail(400,'E-mail, senha ou perfil inválido.');
 if(role==='client'&&!await env.DB.prepare('SELECT id FROM clients WHERE id=?').bind(b.client_id).first())return fail(404,'Cliente não encontrado.');
 const id=crypto.randomUUID(),s=salt(),hash=await derive(password,s);
 try{
  await env.DB.prepare('INSERT INTO users(id,email,password_salt,password_hash,role,client_id,must_change_password,created_at) VALUES(?,?,?,?,?,?,1,?)').bind(id,email,s,hash,role,role==='client'?b.client_id:null,now()).run();
  await audit(env.DB,actor,'user:create',id);
  return json({ok:true,id,email,role},201);
 }catch(e){return fail(409,'E-mail já cadastrado ou registro inválido.');}
}
async function newSession(env,u,req){
 const token=b64(crypto.getRandomValues(new Uint8Array(32))),expires=now()+7*86400000;
 await env.DB.prepare('INSERT INTO sessions(token_hash,user_id,expires_at,created_at) VALUES(?,?,?,?)').bind(await sha(token),u.id,expires,now()).run();
 const secure=new URL(req.url).protocol==='https:'?'; Secure':'';
 return json({ok:true,user:{id:u.id,email:u.email,role:u.role,client_id:u.client_id,must_change_password:u.must_change_password}},200,{'Set-Cookie':'or_session='+token+'; HttpOnly; SameSite=Strict; Path=/api; Max-Age=604800'+secure});
}
export async function authRoute(req,env,route){
 const method=req.method,actor=await authenticate(req,env);
 if(route==='me'&&method==='GET')return actor?json({ok:true,user:actor}):fail(401,'Entre na sua conta.');
 if(route==='logout'&&method==='POST'){
  const t=cookieValue(req);if(t)await env.DB.prepare('DELETE FROM sessions WHERE token_hash=?').bind(await sha(t)).run();
  return json({ok:true},200,{'Set-Cookie':'or_session=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0'});
 }
 if(route==='login'&&method==='POST'){
  if(await ipLimit(req,env,'login',12,600000))return fail(429,'Muitas tentativas. Tente mais tarde.');
  let b;try{b=await readJson(req,4000)}catch(e){return fail(400,'Dados inválidos.')}
  const email=String(b.email||'').toLowerCase().trim(),pwd=String(b.password||'');
  if(pwd.length>128)return fail(401,'E-mail ou senha incorretos.');
  const u=await env.DB.prepare('SELECT * FROM users WHERE email=? AND disabled_at IS NULL').bind(email).first();
  // Executa PBKDF2 inclusive para contas inexistentes, reduzindo diferenças de tempo.
  const fake='AAAAAAAAAAAAAAAAAAAAAA',hash=await derive(pwd,u?.password_salt||fake);
  if(!u||hash!==u.password_hash)return fail(401,'E-mail ou senha incorretos.');
  return newSession(env,u,req);
 }
 if(route==='bootstrap'&&method==='POST'){
  if(!actor?.legacy)return fail(403,'ADMIN_TOKEN é necessário para cadastrar o primeiro administrador.');
  const existing=await env.DB.prepare("SELECT id FROM users WHERE role='admin' LIMIT 1").first();
  if(existing)return fail(409,'Administrador já cadastrado.');
  let b;try{b=await readJson(req,4000)}catch(e){return fail(400,'Dados inválidos.')}
  const result=await createUser(env,actor,{...b,role:'admin'});
  return result;
 }
 if(route==='users'&&method==='POST'){
  if(!requireAdmin(actor))return fail(403,'Permissão insuficiente.');
  let b;try{b=await readJson(req,4000)}catch(e){return fail(400,'Dados inválidos.')}
  return createUser(env,actor,b);
 }
 if(route==='password'&&method==='PUT'){
  if(!actor?.id)return fail(401,'Entre na sua conta.');
  let b;try{b=await readJson(req,4000)}catch(e){return fail(400,'Dados inválidos.')}
  const pw=String(b.password||'');if(pw.length<12||pw.length>128)return fail(400,'Use uma senha de 12 a 128 caracteres.');
  const s=salt(),hash=await derive(pw,s);
  await env.DB.prepare('UPDATE users SET password_salt=?,password_hash=?,must_change_password=0 WHERE id=?').bind(s,hash,actor.id).run();
  await env.DB.prepare('DELETE FROM sessions WHERE user_id=?').bind(actor.id).run();
  return json({ok:true,login_required:true},200,{'Set-Cookie':'or_session=; HttpOnly; SameSite=Strict; Path=/api; Max-Age=0'});
 }
 return fail(404,'Rota não encontrada.');
}
export async function publicLead(req,env){
 if(!dbReady(env))return fail(503,'Banco D1 não configurado.');
 if(!sameOrigin(req))return fail(403,'Origem não permitida.');
 if(await ipLimit(req,env,'briefing:2m',5,120000)||await ipLimit(req,env,'briefing:day',30,86400000))return fail(429,'Muitos envios. Tente novamente mais tarde.');
 let l;try{l=await readJson(req,64000)}catch(e){return fail(400,'Briefing inválido.')}
 if(!validId(l?.id)||typeof l.nome!=='string'||!l.nome.trim()||l.nome.length>120||!Array.isArray(l.qa)||l.qa.length>100||!l.consent?.em||!l.consent?.versao)return fail(400,'Briefing incompleto ou sem consentimento.');
 const qa=l.qa.map(x=>({q:String(x?.q||'').slice(0,500),a:String(x?.a||'').slice(0,5000),tp:String(x?.tp||'').slice(0,40)}));
 const data={...l,nome:l.nome.trim(),email:String(l.email||'').slice(0,160),whats:String(l.whats||'').slice(0,30),qa,status:'novo',t:now()};
 const t=now();
 try{
  await env.DB.batch([
   env.DB.prepare('INSERT OR IGNORE INTO clients(id,name,email,whatsapp,status,data_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)').bind(l.id,data.nome,data.email,data.whats,'novo',JSON.stringify(data),t,t),
   env.DB.prepare('INSERT OR IGNORE INTO briefings(id,client_id,data_json,received_at,source) VALUES(?,?,?,?,?)').bind(l.id,l.id,JSON.stringify(data),t,'public')
  ]);
  return json({ok:true,id:l.id},201);
 }catch(e){return fail(500,'Não foi possível salvar o briefing.');}
}
const clamp=(v,max)=>String(v||'').slice(0,max);
export async function upsertClient(db,lead){
 if(!validId(lead?.id)||typeof lead.nome!=='string'||!lead.nome.trim()||!['novo','pronto','aprovado','aplicado','recusado'].includes(lead.status||'novo'))return fail(400,'Dados do cliente inválidos.');
 const data=JSON.stringify(lead),t=Math.max(1,Math.floor(Number(lead.t)||now()));
 if(data.length>850000)return fail(413,'Projeto excede o limite de tamanho.');
 const old=await db.prepare('SELECT updated_at FROM clients WHERE id=?').bind(lead.id).first();
 if(old&&+old.updated_at>t)return fail(409,'Há uma versão mais recente no servidor. Recarregue antes de salvar.');
 const posts=Array.isArray(lead.track?.pecas)?lead.track.pecas.filter(p=>validId(p.id)).slice(0,300):[];
 const ident=lead.track?.identidadeVisual&&typeof lead.track.identidadeVisual==='object'?lead.track.identidadeVisual:{};
 const stmts=[
  db.prepare('INSERT INTO clients(id,name,email,whatsapp,status,data_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,email=excluded.email,whatsapp=excluded.whatsapp,status=excluded.status,data_json=excluded.data_json,updated_at=excluded.updated_at').bind(lead.id,clamp(lead.nome,120),clamp(lead.email,160),clamp(lead.whats,30),lead.status||'novo',data,old?+old.updated_at:t,t),
  db.prepare('DELETE FROM posts WHERE client_id=?').bind(lead.id)
 ];
 const fronts=new Map((lead.track?.frentes||[]).map(x=>[x.id,x]));
 for(const p of posts){
  const front=fronts.get(p.fid)||{};
  stmts.push(db.prepare('INSERT INTO posts(client_id,id,front_id,title,caption,body,format,scheduled_for,status,art_json,data_json,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind(lead.id,p.id,validId(p.fid)?p.fid:null,clamp(p.titulo,140),clamp(p.legenda,20000),clamp(p.txt,20000),clamp(front.fmt,30),/^\d{4}-\d{2}-\d{2}$/.test(p.data||'')?p.data:null,clamp(p.status||'Ideia',35),JSON.stringify(p.arte||{}),JSON.stringify(p),t));
 }
 stmts.push(db.prepare('INSERT INTO brand_identities(client_id,profile_json,logo_asset_key,updated_at) VALUES(?,?,?,?) ON CONFLICT(client_id) DO UPDATE SET profile_json=excluded.profile_json,logo_asset_key=excluded.logo_asset_key,updated_at=excluded.updated_at').bind(lead.id,JSON.stringify(ident),ident.logo?'clients/'+lead.id+'/marca':null,t));
 await db.batch(stmts);
 return json({ok:true,id:lead.id,updated_at:t,posts:posts.length});
}
export async function listClients(db,actor){
 const rows=actor.role==='client'?await db.prepare('SELECT data_json FROM clients WHERE id=?').bind(actor.client_id).all():await db.prepare('SELECT data_json FROM clients ORDER BY updated_at DESC LIMIT 500').all();
 return json({leads:(rows.results||[]).map(r=>{try{return JSON.parse(r.data_json)}catch(e){return null}}).filter(Boolean)});
}
export async function listRows(db,actor,kind,clientId,month){
 if(!validId(clientId)||!canRead(actor,clientId))return fail(403,'Acesso negado.');
 if(kind==='briefings'){
  const rows=await db.prepare('SELECT id,data_json,received_at FROM briefings WHERE client_id=? ORDER BY received_at DESC LIMIT 100').bind(clientId).all();
  return json({briefings:(rows.results||[]).map(x=>({id:x.id,received_at:x.received_at,data:JSON.parse(x.data_json)}))});
 }
 if(kind==='identity'){
  const x=await db.prepare('SELECT profile_json,logo_asset_key FROM brand_identities WHERE client_id=?').bind(clientId).first();
  return json({identity:x?JSON.parse(x.profile_json):{},logo_key:x?.logo_asset_key||null});
 }
 if(kind==='calendar'&&month&&!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))return fail(400,'Mês inválido.');
 const sql=kind==='calendar'?'SELECT data_json FROM posts WHERE client_id=? AND scheduled_for LIKE ? ORDER BY scheduled_for':'SELECT data_json FROM posts WHERE client_id=? ORDER BY updated_at DESC LIMIT 300';
 const rows=await (kind==='calendar'?db.prepare(sql).bind(clientId,month?month+'-%':'%').all():db.prepare(sql).bind(clientId).all());
 return json({posts:(rows.results||[]).map(x=>JSON.parse(x.data_json))});
}
export async function assetRoute(req,env,actor,clientId,assetId){
 if(!validId(clientId)||!validAsset(assetId)||!canRead(actor,clientId))return fail(403,'Acesso negado.');
 if(!env.ASSETS)return fail(503,'Bucket R2 não configurado.');
 const key='clients/'+clientId+'/'+assetId;
 if(req.method==='GET'){
  const obj=await env.ASSETS.get(key);
  if(!obj)return fail(404,'Arquivo não encontrado.');
  return new Response(obj.body,{headers:{'Content-Type':obj.httpMetadata?.contentType||'application/octet-stream','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }
 if(!canWrite(actor,clientId))return fail(403,'Sem permissão para alterar arquivos.');
 if(req.method==='PUT'){
  const mime=(req.headers.get('Content-Type')||'').split(';')[0].toLowerCase(),allowed=['image/png','image/jpeg','image/webp'];
  if(!allowed.includes(mime))return fail(415,'Somente PNG, JPEG ou WebP.');
  const len=Number(req.headers.get('Content-Length')||0);
  if(len>5*1024*1024)return fail(413,'Imagem maior que 5 MB.');
  const bytes=await req.arrayBuffer();
  if(!bytes.byteLength||bytes.byteLength>5*1024*1024)return fail(413,'Imagem vazia ou maior que 5 MB.');
  const magic=new Uint8Array(bytes.slice(0,12));
  const isPng=magic[0]===137&&magic[1]===80&&magic[2]===78&&magic[3]===71;
  const isJpeg=magic[0]===255&&magic[1]===216&&magic[2]===255;
  const isWebp=String.fromCharCode(...magic.slice(0,4))==='RIFF'&&String.fromCharCode(...magic.slice(8,12))==='WEBP';
  if(!((mime==='image/png'&&isPng)||(mime==='image/jpeg'&&isJpeg)||(mime==='image/webp'&&isWebp)))return fail(415,'Assinatura de imagem inválida.');
  await env.ASSETS.put(key,bytes,{httpMetadata:{contentType:mime}});
  await env.DB.prepare('INSERT INTO assets(client_id,asset_id,r2_key,mime_type,size_bytes,created_at) VALUES(?,?,?,?,?,?) ON CONFLICT(client_id,asset_id) DO UPDATE SET mime_type=excluded.mime_type,size_bytes=excluded.size_bytes,created_at=excluded.created_at').bind(clientId,assetId,key,mime,bytes.byteLength,now()).run();
  await audit(env.DB,actor,'asset:upload',clientId+'/'+assetId);
  return json({ok:true,id:assetId,size:bytes.byteLength},201);
 }
 if(req.method==='DELETE'){
  await env.ASSETS.delete(key);
  await env.DB.prepare('DELETE FROM assets WHERE client_id=? AND asset_id=?').bind(clientId,assetId).run();
  await audit(env.DB,actor,'asset:delete',clientId+'/'+assetId);
  return json({ok:true});
 }
 return fail(405,'Método não permitido.');
}
