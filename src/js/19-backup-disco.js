const DISK={dir:null,state:'off',last:'',lastT:0,busy:false,timer:null,noSave:false};
const idbOpen=()=>idbAbre('estudio-ia','kv');
const idbGet=async k=>{try{const db=await idbOpen();return await new Promise(res=>{const g=db.transaction('kv').objectStore('kv').get(k);g.onsuccess=()=>res(g.result);g.onerror=()=>res(null)})}catch(e){return null}};
const idbSet=async(k,v)=>{try{const db=await idbOpen();await new Promise(res=>{const t=db.transaction('kv','readwrite');t.objectStore('kv').put(v,k);t.oncomplete=res;t.onerror=res})}catch(e){}};
const stamp=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())};
async function wfile(dir,name,txt){const h=await dir.getFileHandle(name,{create:true});const w=await h.createWritable();await w.write(txt);await w.close()}
async function rfile(dir,name){try{const h=await dir.getFileHandle(name);return await (await h.getFile()).text()}catch(e){return null}}
function merge(remote){
  const m=new Map(getL().map(l=>[l.id,l]));let ch=0;
  MERGE_REJ=0;
  for(const raw of (Array.isArray(remote)?remote:[])){const r=cleanLead(raw);if(!r){MERGE_REJ++;continue}if(foiApagado(r.id))continue;const l=m.get(r.id);if(!l||(r.t||0)>(l.t||0)){m.set(r.id,r);ch++}}
  if(ch){DISK.noSave=true;setL([...m.values()].sort((a,b)=>parseInt(b.id,36)-parseInt(a.id,36)));DISK.noSave=false}
  return ch;
}
async function diskLoad(){
  const c=await rfile(DISK.dir,'config.json');
  if(c)try{const o=JSON.parse(c);if((o.t||0)>(CFG.t||0)){const ks=IA_CHAVES.map(s=>(CFG[s]||{}).key),ph=CFG.pinh;cfgMescla(o,false);IA_CHAVES.forEach((s,i)=>{CFG[s]={...IA0(s),...CFG[s],key:ks[i]||""}});delete CFG.reserva;if(ph){CFG.pinh=ph;delete CFG.pin}saveCfg()}}catch(e){}
  const t=await rfile(DISK.dir,'leads.json');
  if(t)try{const o=JSON.parse(t);merge(o.leads||o)}catch(e){}
  const pr=await rfile(DISK.dir,'prospects.json');
  if(pr)try{capMerge(JSON.parse(pr).prosp)}catch(e){}
  const pj=await rfile(DISK.dir,'projetos.json');
  if(pj)try{ssMerge(JSON.parse(pj).proj)}catch(e){}
  const demandas=await rfile(DISK.dir,'demandas.json');
  if(demandas)try{orQuadroImportar(JSON.parse(demandas).demandas)}catch(e){}
  await purgaPendentes();
}
async function diskInit(){
  const h=await idbGet('dir');if(!h)return;
  DISK.dir=h;
  try{if(await h.queryPermission({mode:'readwrite'})==='granted'){await diskLoad();DISK.state='on';await diskSave(true)}else DISK.state='perm'}catch(e){DISK.state='perm'}
  if(V==='admin'&&A.auth&&!A.view){paintList();paintDet()}
}
function diskSaveSoon(){if(DISK.state!=='on'||DISK.noSave)return;clearTimeout(DISK.timer);DISK.timer=setTimeout(()=>diskSave(),1200)}
async function diskSave(full){
  if(DISK.state!=='on'||DISK.busy)return;DISK.busy=true;
  try{
    const L=getL(),json=JSON.stringify({v:1,salvo:new Date().toISOString(),leads:L},null,1),t0=Date.now();
    await wfile(DISK.dir,'leads.json',json);
    await wfile(DISK.dir,'demandas.json',JSON.stringify({v:1,demandas:OR_QUADRO.itens}));
    await wfile(DISK.dir,'config.json',JSON.stringify(cfgSafe(),null,1));
    await wfile(DISK.dir,'prospects.json',JSON.stringify({v:1,salvo:new Date().toISOString(),prosp:capLoad().L},null,1));
    await wfile(DISK.dir,'projetos.json',JSON.stringify({v:1,salvo:new Date().toISOString(),proj:ssLoad()},null,1));
    const hd=await DISK.dir.getDirectoryHandle('historico',{create:true}),corte='leads_'+new Date(Date.now()-30*864e5).toLocaleDateString('sv-SE');
    await wfile(hd,'leads_'+stamp()+'.json',json);
    for await(const [n] of hd.entries())if(/^leads_\d{4}-\d\d-\d\d\.json$/.test(n)&&n<corte)await hd.removeEntry(n);
    const cd=await DISK.dir.getDirectoryHandle('clientes',{create:true});
    for(const l of L){
      if(!full&&(l.t||0)<=DISK.lastT)continue;
      const nome=(l.nome||'cliente').replace(/[^\w]+/g,'-')+'_'+l.id;
      await wfile(cd,nome+'.md',`# ${l.nome} - ${svcName(l)}\n\nWhatsApp: ${l.whats}\nData: ${l.data}\nStatus: ${l.status}\n\n## Briefing\n${qaOf(l).map(x=>`- ${x.q}\n  ${x.a}`).join('\n')}\n\n## Plano\n${l.entrega||'(ainda não gerado)'}\n\n## Orçamentos\n${l.orc||'(ainda não gerado)'}\n\n## Mensagem\n${l.msg||''}\n${l.track?`\n## Acompanhamento (início ${l.track.start})\n${l.track.tarefas.map(x=>(x.done?'[x] ':'[ ] ')+x.txt+' ('+x.due+')').join('\n')}\n\n### Diário\n${l.track.diario.map(x=>x.data+': '+x.txt).join('\n')}\n\n### Relatórios\n${l.track.relatorios.map(x=>x.data+'\n'+x.txt).join('\n\n')}\n`:''}`);
      const h=isSite(l)?htmlOf(l.entrega||''):'';if(h)await wfile(cd,nome+'.html',sanitizaHtml(h));
    }
    DISK.lastT=t0;DISK.last=new Date().toLocaleTimeString('pt-BR');
  }catch(e){DISK.state='perm'}
  DISK.busy=false;
}
/* decifra por senha: AES-GCM 256 com chave derivada por PBKDF2-SHA256 (600 mil iterações). Usada pelo cofre do site (48-cofre-site.js); o blob é gerado em scripts/montar.mjs. */
const b64=u=>{let s='';const a=new Uint8Array(u);for(let i=0;i<a.length;i+=8192)s+=String.fromCharCode(...a.subarray(i,i+8192));return btoa(s)};
const unb64=s=>Uint8Array.from(atob(String(s)),c=>c.charCodeAt(0));
async function chaveBkp(senha,salt,it){const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(senha),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt,iterations:it},k,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function bkpDecifra(o,senha){const it=+o.it;if(!(it>=100000&&it<=5000000)||!o.salt||!o.iv||!o.dados)throw new Error('Arquivo de backup inválido.');const k=await chaveBkp(senha,unb64(o.salt),it);
  try{return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64(o.iv)},k,unb64(o.dados))))}catch(e){throw new Error('Senha errada ou arquivo de backup corrompido.')}}
