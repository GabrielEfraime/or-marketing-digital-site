/* Sincronização online não destrutiva. Dados continuam disponíveis localmente; D1 é cópia persistente no servidor.
   Operações de rede só são feitas após autenticação do painel. */
const OR_CLOUD={started:false,loading:false,checked:false,pending:new Map(),timers:new Map(),error:'',active:false};
const orCloudOn=()=>location.protocol==='https:'&&(!!srvTok()||OR_CLOUD.active);
function orCloudHeaders(extra={}){
 const t=srvTok();return {...(t?{'X-OR-Token':t}:{}),...extra};
}
async function orCloudRequest(path,options={}){
 const r=await fetch('/api/'+path,{credentials:'same-origin',...options,headers:orCloudHeaders(options.headers||{})});
 if(!r.ok){let msg='Erro '+r.status;try{msg=(await r.json()).error?.message||msg}catch(e){}throw new Error(msg)}
 return r;
}
function orCloudNotice(message){
 OR_CLOUD.error=message||'';
 const bar=document.getElementById('savebar');
 if(bar&&message){bar.setAttribute('role','status');bar.textContent='Nuvem OR: '+message}
}
function orCloudQueue(items){
 if(!OR_CLOUD.started||OR_CLOUD.loading||!orCloudOn()||!A.auth)return;
 for(const l of items||[]){
  if(!l||!ID_OK.test(l.id))continue;
  OR_CLOUD.pending.set(l.id,structuredClone(l));
  clearTimeout(OR_CLOUD.timers.get(l.id));
  OR_CLOUD.timers.set(l.id,setTimeout(()=>orCloudFlush(l.id),900));
 }
}
async function orCloudFlush(id){
 const l=OR_CLOUD.pending.get(id);
 if(!l||!orCloudOn())return;
 try{
  await orCloudRequest('cloud/clients',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(l)});
  if(OR_CLOUD.pending.get(id)===l)OR_CLOUD.pending.delete(id);
  orCloudNotice('');
 }catch(e){orCloudNotice('Não foi possível sincronizar '+l.nome+': '+e.message+'; a cópia local foi preservada.');}
}
async function orCloudInit(){
 if(OR_CLOUD.started||OR_CLOUD.loading||!A.auth||location.protocol!=='https:')return;
 if(!srvTok()&&!OR_CLOUD.active){
   if(OR_CLOUD.checked)return;
   OR_CLOUD.checked=true;
   try{const r=await fetch('/api/cloud/auth/me',{credentials:'same-origin'});if(!r.ok)return;OR_CLOUD.active=true}catch(e){return}
 }
 OR_CLOUD.loading=true;
 try{
  const response=await orCloudRequest('cloud/clients');
  const data=await response.json(),remote=(data.leads||[]).map(cleanLead).filter(Boolean);
  const local=getL(),map=new Map(local.map(x=>[x.id,x]));
  for(const r of remote){const old=map.get(r.id);if(!old||(+r.t||0)>(+old.t||0))map.set(r.id,r)}
  const merged=[...map.values()].sort((a,b)=>(+b.t||0)-(+a.t||0));
  if(JSON.stringify(merged)!==JSON.stringify(local)){setL(merged);if(A.view===''||A.view==='dash'||A.view==='posts')admin();}
  OR_CLOUD.started=true;
  for(const item of merged){if(!remote.some(x=>x.id===item.id))OR_CLOUD.pending.set(item.id,structuredClone(item))}
  for(const id of OR_CLOUD.pending.keys())orCloudFlush(id);
 }catch(e){orCloudNotice('Sincronização indisponível: '+e.message+'. Sem apagar dados locais.')}
 finally{OR_CLOUD.loading=false}
}
function orCloudAssetPath(key){
 const m=String(key).match(/^marca:([A-Za-z0-9]{1,24})$/);
 if(m)return 'cloud/assets/'+m[1]+'/marca';
 const p=String(key).match(/^arte:([A-Za-z0-9]{1,24}):([A-Za-z0-9]{1,24})$/);
 if(p)return 'cloud/assets/'+p[1]+'/arte:'+p[2];
 return null;
}
async function orCloudUploadAsset(key,value){
 const path=orCloudAssetPath(key);if(!path||!orCloudOn()||!A.auth||!(value instanceof Blob))return;
 try{
  await orCloudRequest(path,{method:'PUT',headers:{'Content-Type':value.type||'image/png'},body:value});
  orCloudNotice('');
 }catch(e){orCloudNotice('Imagem ficou neste navegador: '+e.message)}
}
async function orCloudGetAsset(key){
 const path=orCloudAssetPath(key);if(!path||!orCloudOn()||!A.auth)return null;
 try{return await (await orCloudRequest(path)).blob()}catch(e){return null}
}
async function orCloudDeleteAsset(key){
 const path=orCloudAssetPath(key);if(!path||!orCloudOn()||!A.auth)return;
 try{await orCloudRequest(path,{method:'DELETE'})}catch(e){orCloudNotice('Não foi possível excluir arquivo na nuvem: '+e.message)}
}
