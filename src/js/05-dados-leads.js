const esc=t=>String(t??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ID_OK=/^[A-Za-z0-9]{1,24}$/,STATUS_OK=['novo','pronto','aprovado','aplicado','recusado'];
const isObj=x=>!!x&&typeof x==='object'&&!Array.isArray(x);
const strOr=(x,max,d='')=>typeof x==='string'?x.slice(0,max):d;
function cleanTrack(t){
  if(!isObj(t)||!isObj(t.canais))return null;
  const o={...t,canais:{}};
  for(const [k,c] of Object.entries(t.canais)){
    if(!isObj(c))continue;
    const n={...c};['rows','perfis','psi','versoes','veiculos','pautas'].forEach(f=>{if(n[f]!==undefined&&!Array.isArray(n[f]))n[f]=[]});
    ['versoes','veiculos','pautas'].forEach(f=>{if(Array.isArray(n[f]))n[f]=n[f].filter(x=>isObj(x)&&typeof x.id==='string'&&ID_OK.test(x.id))});
    if(n.links!==undefined&&!isObj(n.links))n.links={};
    if(n.postados!==undefined&&!isObj(n.postados))n.postados={};
    if(Array.isArray(n.rows))n.rows=n.rows.filter(isObj);
    o.canais[k]=n;
  }
  ['tarefas','diario','relatorios'].forEach(f=>{
    o[f]=(Array.isArray(t[f])?t[f]:[]).filter(isObj).map(x=>({...x,id:typeof x.id==='string'&&ID_OK.test(x.id)?x.id:uid()}));
  });
  ['escopo','ciclos','campanhas','frentes','pecas'].forEach(f=>{if(t[f]===undefined)return;
    o[f]=(Array.isArray(t[f])?t[f]:[]).filter(isObj).map(x=>({...x,id:typeof x.id==='string'&&ID_OK.test(x.id)?x.id:uid()}));});
  (o.ciclos||[]).forEach(c=>{c.itens=(Array.isArray(c.itens)?c.itens:[]).filter(isObj);c.conteudo=strOr(c.conteudo,200000);c.per=strOr(c.per,10);c.tipo=c.tipo==='semanal'?'semanal':'mensal'});
  (o.campanhas||[]).forEach(c=>{c.exemplos=(Array.isArray(c.exemplos)?c.exemplos:[]).filter(x=>isObj(x)&&typeof x.id==='string'&&ID_OK.test(x.id))});
  if(t.cicloTipo!==undefined&&!isObj(t.cicloTipo))o.cicloTipo={};
  if(t.redes!==undefined)o.redes=(Array.isArray(t.redes)?t.redes:[]).filter(r=>typeof r==='string').map(r=>r.slice(0,40)).slice(0,12);
  if(t.perfil!==undefined){o.perfil={};if(isObj(t.perfil))for(const [k,v] of Object.entries(t.perfil))if(/^[a-z]{2,14}$/.test(k)&&typeof v==='string')o.perfil[k]=v.slice(0,600)}
  if(t.ia!==undefined){o.ia={};if(isObj(t.ia))for(const [c,L] of Object.entries(t.ia))if(/^[a-z]{2,10}$/.test(c)&&Array.isArray(L))o.ia[c]=L.filter(x=>isObj(x)&&typeof x.id==='string'&&ID_OK.test(x.id)).map(x=>({...x,txt:strOr(x.txt,30000),titulo:strOr(x.titulo,160),pedido:strOr(x.pedido,1500)})).slice(0,30)}
  (o.pecas||[]).forEach(p=>{p.briefing=strOr(p.briefing,20000);p.txt=strOr(p.txt,20000);p.titulo=strOr(p.titulo,140);p.per=strOr(p.per,10);p.fid=strOr(p.fid,24)});
  (o.frentes||[]).forEach(x=>{x.qtd=Math.max(1,Math.min(60,Math.round(+x.qtd)||1));if(!['mes','semana','dia','projeto'].includes(x.por))x.por='mes'});
  return o;
}
function cleanLead(r){
  if(!isObj(r)||typeof r.id!=='string'||!ID_OK.test(r.id))return null;
  const mods=(Array.isArray(r.mods)?r.mods:[]).filter(k=>typeof k==='string'&&MODS[k]);
  const mod=typeof r.mod==='string'&&MODS[r.mod]?r.mod:mods[0];
  if(!mod)return null;
  const l={...r,mod,mods:mods.length?mods:[mod]};
  l.nome=strOr(r.nome,120)||'Sem nome';l.whats=strOr(r.whats,30);l.email=strOr(r.email,160);l.data=strOr(r.data,40);
  ['ficha','entrega','orc','msg'].forEach(k=>{if(r[k]!==undefined)l[k]=strOr(r[k],300000)});
  l.status=STATUS_OK.includes(r.status)?r.status:'novo';
  l.t=Number.isFinite(r.t)?r.t:0;
  if(r.qa!==undefined)l.qa=Array.isArray(r.qa)?r.qa.filter(isObj).map(x=>({q:strOr(x.q,500),a:strOr(x.a,5000),tp:strOr(x.tp,40)})):[];
  if(r.ans!==undefined&&!isObj(r.ans))delete l.ans;
  if(r.orcAviso!==undefined)l.orcAviso=(Array.isArray(r.orcAviso)?r.orcAviso:[]).filter(w=>typeof w==='string').map(w=>w.slice(0,200)).slice(0,6);
  ['consent','xads','xsoc','guia'].forEach(k=>{if(r[k]!==undefined&&!isObj(r[k]))delete l[k]});
  if(l.guia)l.guia={...l.guia,rec:(Array.isArray(l.guia.rec)?l.guia.rec:[]).filter(x=>isObj(x)&&typeof x.k==='string'&&MODS[x.k]).map(x=>({k:x.k,why:(Array.isArray(x.why)?x.why:[]).filter(w=>typeof w==='string').map(w=>w.slice(0,300)).slice(0,4)}))};
  if(r.xsite!==undefined&&!(isObj(r.xsite)&&typeof r.xsite.html==='string'))delete l.xsite;
  l.envios=(Array.isArray(r.envios)?r.envios:[]).filter(isObj).map(x=>({...x,em:strOr(x.em,40),quando:strOr(x.quando,60),via:strOr(x.via,10)}));
  if(!['basico','medio','max'].includes(r.plano)){delete l.plano;delete l.planoEm;delete l.planoHist}else{l.planoEm=strOr(r.planoEm,40);l.planoHist=(Array.isArray(r.planoHist)?r.planoHist:[]).filter(x=>isObj(x)&&['basico','medio','max'].includes(x.plano)).map(x=>({plano:x.plano,em:strOr(x.em,40)})).slice(-20)}
  if(r.arq!==undefined)l.arq=strOr(r.arq,40);
  if(r.refsSite!==undefined)l.refsSite=strOr(r.refsSite,4000);
  if(r.siteAtual!==undefined)l.siteAtual=strOr(r.siteAtual,400);
  if(r.analiseSite!==undefined){const a=r.analiseSite;if(!isObj(a))delete l.analiseSite;else l.analiseSite={url:strOr(a.url,400),texto:strOr(a.texto,8000),estrutura:strOr(a.estrutura,3000),em:Number.isFinite(a.em)?a.em:0,achados:(Array.isArray(a.achados)?a.achados:[]).filter(x=>typeof x==='string').map(x=>x.slice(0,300)).slice(0,30),psi:isObj(a.psi)?{data:strOr(a.psi.data,10),perf:+a.psi.perf||0,acc:+a.psi.acc||0,seo:+a.psi.seo||0,bp:+a.psi.bp||0,falhas:(Array.isArray(a.psi.falhas)?a.psi.falhas:[]).filter(x=>typeof x==='string').map(x=>x.slice(0,120)).slice(0,12)}:undefined}}
  if(r.estiloSite!==undefined&&!['padrao','movimento','3d'].includes(r.estiloSite))delete l.estiloSite;
  if(r.track!==undefined){const t=cleanTrack(r.track);if(t)l.track=t;else{delete l.track;if(l.status==='aplicado')l.status='aprovado'}}
  return l;
}
let MERGE_REJ=0;
const AREAS=['Tráfego pago','Conteúdo e redes sociais','Vídeo e YouTube','Design e identidade visual','Sites e desenvolvimento','Atendimento e comercial','Outra área'];
const txtT=(v,n,nl)=>String(v==null?'':v).replace(nl?/[\u0000-\u0009\u000b-\u001f\u007f]/g:/[\u0000-\u001f\u007f]/g,' ').trim().slice(0,n);
const cleanT=o=>{if(!o||typeof o!=='object'||Array.isArray(o)||!ID_OK.test(String(o.id||'')))return null;return {id:String(o.id),nome:txtT(o.nome,80),whats:txtT(o.whats,20),email:txtT(o.email,120),area:txtT(o.area,60),vaga:txtT(o.vaga,100),link:/^https:\/\//i.test(String(o.link||''))?txtT(o.link,300):'',msg:txtT(o.msg,600,1),data:txtT(o.data,30),etapa:txtT(o.etapa,30),nota:txtT(o.nota,1000,1),cvnome:txtT(o.cvnome,120),cvtam:Math.max(0,Number(o.cvtam)||0),cvtipo:txtT(o.cvtipo,5),cvtxt:txtT(o.cvtxt,12000,1),analise:txtT(o.analise,14000,1),t:Number(o.t)||0}};
const getT=()=>{try{const a=JSON.parse(sget('talentos2')||'[]');return Array.isArray(a)?a.map(cleanT).filter(Boolean):[]}catch(e){return[]}};
const setT=a=>sset('talentos2',JSON.stringify(a.slice(0,300)));
const getL=()=>{try{const a=JSON.parse(sget('leads2')||'[]');return Array.isArray(a)?a.map(cleanLead).filter(Boolean):[]}catch(e){return[]}};
const setL=a=>{const j=JSON.stringify(a);sset('leads2',j);let ok=false;try{ok=STORE_OK&&localStorage.getItem('leads2')===j}catch(e){ok=false}SAVE.at=Date.now();SAVE.ok=ok;diskSaveSoon();pintaSave()};
const upd=(id,p)=>{const a=getL();const l=a.find(x=>x.id===id);if(l){ativLog(l,p);Object.assign(l,p,{t:Date.now()})}setL(a)};
const clean=t=>String(t??'').replace(/<think>[\s\S]*?(<\/think>|$)/g,'').trim();
const htmlOf=t=>{const m=clean(t).match(/```html\s*\n([\s\S]*?)(```|$)/);return m?m[1]:''};
const dl=(name,txt,type)=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;a.click()};


const RETENCAO_MESES=12;
const PRIV_EMAIL='';
const VAGAS=[];
const PRIV_VERSAO='2026-10';