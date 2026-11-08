/* OR Site Studio, Etapa 1: projetos ligados ao prospect, ao lead e ao histórico de negociação.
   Só dados: sem IA, sem tela e sem rede (SPEC.md: SS-001 a SS-006, SS-035 e SS-036).
   O orçamento não é guardado aqui: ele é calculado a partir do lead (calcOrc), então o projeto chega ao orçamento pelo lead. */
const SS_ETAPAS=[['rascunho','Rascunho'],['analise','Em análise'],['site','Site pronto'],['proposta','Proposta pronta'],['enviada','Proposta enviada'],['fechado','Fechado'],['perdido','Perdido']];
const SS_MODOS=['','redesenhar','zero'],SS_HIST_MAX=200,SS_MAX=500;
const ssUrl=v=>/^https?:\/\//i.test(String(v||''))?txtT(v,400):'';
const ssIdOk=v=>typeof v==='string'&&ID_OK.test(v)?v:'';

/* ---- funções puras (testadas em scripts/testar.mjs) ---- */
/* análise da IA (Etapa 2): cada ponto é "fato" (cita os fatos numerados de onde veio) ou "inferência" */
const SS_LISTAS=['fortes','problemas','oportunidades'];
function ssLimpaAnalise(a){
  if(!isObj(a))return null;
  const item=x=>{const o=isObj(x)?x:{t:x},t=txtT(o.t,300);if(!t)return null;
    const fonte=(Array.isArray(o.fonte)?o.fonte:[]).map(Number).filter(v=>Number.isInteger(v)&&v>=1&&v<=40).slice(0,5);
    return {t,f:o.f==='fato'&&fonte.length?'fato':'inferencia',fonte:o.f==='fato'&&fonte.length?fonte:[],aviso:!!o.aviso}};
  const out={em:Math.max(0,Math.min(1e15,+a.em||0)),ia:txtT(a.ia,80),bruto:txtT(a.bruto,6000,1),
    fatos:(Array.isArray(a.fatos)?a.fatos:[]).filter(isObj).map(f=>({txt:txtT(f.txt,4200,1),origem:txtT(f.origem,80)})).filter(f=>f.txt).slice(0,40),
    faltando:(Array.isArray(a.faltando)?a.faltando:[]).map(x=>txtT(x,200)).filter(Boolean).slice(0,8),
    avisos:(Array.isArray(a.avisos)?a.avisos:[]).map(x=>txtT(x,240)).filter(Boolean).slice(0,10)};
  SS_LISTAS.forEach(k=>{out[k]=(Array.isArray(a[k])?a[k]:[]).map(item).filter(Boolean).slice(0,8)});
  return out;
}
function ssLimpa(r){
  if(!isObj(r)||!ssIdOk(r.id))return null;
  const n=(k,a,b)=>Math.max(a,Math.min(b,+r[k]||0));
  const vers=(Array.isArray(r.vers)?r.vers:[]).filter(isObj).map(v=>({n:Math.max(0,Math.min(1e6,Math.round(+v.n||0))),em:Math.max(0,Math.min(1e15,+v.em||0)),pedido:txtT(v.pedido,400),ia:txtT(v.ia,80),bytes:Math.max(0,Math.min(1e8,Math.round(+v.bytes||0))),env:v.env===true})).filter((v,i,a)=>v.n>=1&&a.findIndex(x=>x.n===v.n)===i).slice(-200);
  const exportadas=(Array.isArray(r.exportadas)?r.exportadas:[]).filter(isObj).map(x=>({em:Math.max(0,Math.min(1e15,+x.em||0)),vSite:Math.max(0,Math.min(1e6,Math.round(+x.vSite||0))),total:txtT(x.total,60),como:['pdf','html'].includes(x.como)?x.como:'pdf'})).slice(-50);
  return {cidade:txtT(r.cidade,80),mostraWa:r.mostraWa===true,exportadas,proposta:ssLimpaProposta(r.proposta),vers,vAtual:vers.some(v=>v.n===Math.round(+r.vAtual||0))?Math.round(+r.vAtual):0,
    colado:txtT(r.colado,6000,1),analise:ssLimpaAnalise(r.analise),id:r.id,nome:txtT(r.nome,140)||'Sem nome',modo:SS_MODOS.includes(r.modo)?r.modo:'',site:ssUrl(r.site),ig:txtT(r.ig,60).replace(/[^A-Za-z0-9._]/g,''),
    prosp:ssIdOk(r.prosp),lead:ssIdOk(r.lead),etapa:SS_ETAPAS.some(x=>x[0]===r.etapa)?r.etapa:'rascunho',criado:n('criado',0,1e15),t:n('t',0,1e15),
    hist:(Array.isArray(r.hist)?r.hist:[]).filter(isObj).map(x=>({ev:txtT(x.ev,30),txt:txtT(x.txt,240),em:Math.max(0,Math.min(1e15,+x.em||0))})).slice(-SS_HIST_MAX)};
}
const ssEvento=(p,ev,txt,em)=>({...p,hist:[...p.hist,{ev:txtT(ev,30),txt:txtT(txt,240),em}].slice(-SS_HIST_MAX),t:em});
/* cria um projeto novo; "id" vem de fora para o teste ser previsível */
function ssNovo(d,id,em){
  const p=ssLimpa({id,nome:d&&d.nome,cidade:d&&d.cidade,modo:d&&d.modo,site:d&&d.site,ig:d&&d.ig,prosp:d&&d.prosp,lead:d&&d.lead,etapa:'rascunho',criado:em,t:em,hist:[]});
  return p&&ssEvento(p,'criado',p.prosp?'Projeto criado a partir de um prospect.':'Projeto criado à mão.',em);
}
/* aplica só os campos permitidos; mudar a etapa ou ligar o lead entra no histórico */
function ssAplica(p,patch,em){
  const ok={};['nome','cidade','modo','site','ig','etapa','lead','prosp','colado','analise','vers','vAtual','proposta','exportadas','mostraWa'].forEach(k=>{if(patch&&k in patch)ok[k]=patch[k]});
  let q=ssLimpa({...p,...ok,t:em});if(!q)return p;
  if(q.etapa!==p.etapa)q=ssEvento(q,'etapa','Etapa: '+(SS_ETAPAS.find(x=>x[0]===q.etapa)||[0,q.etapa])[1]+'.',em);
  if(q.lead&&q.lead!==p.lead)q=ssEvento(q,'lead','Ligado ao lead.',em);
  return q;
}
/* mescla por id; vence o maior "t" (igual ao backup dos leads). "apagado(id)" impede ressuscitar o que foi apagado */
function ssMescla(atual,remoto,apagado){
  const m=new Map((Array.isArray(atual)?atual:[]).map(p=>[p.id,p]));let ch=0;
  for(const raw of (Array.isArray(remoto)?remoto:[]).slice(0,2000)){const r=ssLimpa(raw);if(!r||(apagado&&apagado(r.id)))continue;const p=m.get(r.id);if(!p||r.t>p.t){m.set(r.id,r);ch++}}
  return {lista:[...m.values()].sort((a,b)=>b.criado-a.criado).slice(0,SS_MAX),mudou:ch};
}

/* ---- armazenamento (localStorage com fallback em memória, como os leads e os prospects) ---- */
const ssLoad=()=>{try{const o=JSON.parse(sget('proj1')||'[]');return (Array.isArray(o)?o:[]).map(ssLimpa).filter(Boolean)}catch(e){return []}};
const ssSave=L=>{sset('proj1',JSON.stringify(L.slice(0,SS_MAX)));diskSaveSoon()};
const ssGet=id=>ssLoad().find(p=>p.id===id);
const ssPorProsp=pid=>pid?ssLoad().find(p=>p.prosp===pid):undefined;
const ssPorLead=lid=>lid?ssLoad().find(p=>p.lead===lid):undefined;
/* cria o projeto; se o prospect já tem projeto, devolve o que existe (não duplica) */
function ssCriar(d){
  const ja=ssPorProsp(d&&d.prosp);if(ja)return ja.id;
  const em=Date.now(),p=ssNovo(d,'p'+em.toString(36)+Math.random().toString(36).slice(2,6),em);if(!p)return '';
  ssSave([p,...ssLoad()]);return p.id;
}
function ssUpd(id,patch){
  const L=ssLoad(),i=L.findIndex(p=>p.id===id);if(i<0)return undefined;
  L[i]=ssAplica(L[i],patch,Date.now());ssSave(L);return L[i];
}
function ssRegistra(id,ev,txt){
  const L=ssLoad(),i=L.findIndex(p=>p.id===id);if(i<0)return;
  L[i]=ssEvento(L[i],ev,txt,Date.now());ssSave(L);
}
function ssMerge(lista){const r=ssMescla(ssLoad(),lista,foiApagado);if(r.mudou)ssSave(r.lista);return r.mudou}
/* chamado quando o prospect vira lead: se já existe projeto dele, liga ao lead (sem criar outro) */
function ssAoVirarLead(prospId,leadId){
  const p=ssPorProsp(prospId);if(!p||p.lead||!ssIdOk(leadId))return '';
  ssUpd(p.id,{lead:leadId});return p.id;
}
