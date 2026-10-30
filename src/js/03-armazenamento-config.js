const guiaNota=l=>'O cliente não sabia o que precisava; os serviços abaixo foram sugeridos pelo roteiro de descoberta, pelos motivos: '+((l.guia&&Array.isArray(l.guia.rec))?l.guia.rec.map(r=>(MODS[r.k]?MODS[r.k].name:r.k)+' ('+(r.why||[]).join(' ')+')').join('; '):'')+'\n';
const recHtml=rec=>`<div class="panel recbox"><h3>Por onde indicamos começar</h3><ul class="reclist">${rec.map((r,i)=>`<li><b>${i+1}. ${esc(MODS[r.k].name)}</b>${(r.why||[]).map(w=>'<span>'+esc(w)+'</span>').join('')}</li>`).join('')}</ul><p class="hint">É uma sugestão inicial, feita a partir das suas respostas. Nossa equipe revisa antes de enviar o plano e o orçamento.</p></div>`;

const $=s=>document.querySelector(s),app=$('#app');
const MEM={};let STORE_OK=true;
const sget=k=>{if(k in MEM)return MEM[k];try{return localStorage.getItem(k)}catch(e){STORE_OK=false;return null}};
const sset=(k,v)=>{try{localStorage.setItem(k,v);delete MEM[k]}catch(e){STORE_OK=false;MEM[k]=v}};
const GROQ_URL='https://api.groq.com/openai/v1',GEMINI_URL='https://generativelanguage.googleapis.com/v1beta/openai',OPENAI_URL='https://api.openai.com/v1',IAS=['ia1','ia2','ia3'];
/* IA 1 = OpenAI (criação e acompanhamento), IA 2 = Gemini (briefing, resumo, orçamento e mensagem ao cliente), IA 3 = Groq (captação de clientes). */
const IA_DEF={ia1:{url:OPENAI_URL,model:'gpt-5-mini'},ia2:{url:GEMINI_URL,model:'gemini-3.5-flash'},ia3:{url:GROQ_URL,model:'openai/gpt-oss-120b'}},IA0=s=>({kind:'openai',...IA_DEF[s],key:''});
const theme=()=>document.documentElement.dataset.theme==='light'?'light':'dark';
const setTheme=()=>{document.documentElement.dataset.theme='dark'};
setTheme();
const CFG={kb:{sobre:'',regras:'',exemplos:'',licoes:[]},brand:BRAND,precos:PRECOS,pin:ADMIN_PIN,whats:MY_WHATS,t:0,ia1:IA0('ia1'),ia2:IA0('ia2'),ia3:IA0('ia3')};
const semChave=()=>{const o={...CFG};IAS.forEach(s=>{o[s]={...CFG[s],key:''}});return o};
const saveCfg=()=>{sset('cfg2',JSON.stringify(semChave()));keysSave()};
/* Chaves das IAs: cifradas com AES-GCM. A chave de cifra é gerada no navegador, fica no IndexedDB como "não exportável" (o JavaScript usa, mas não consegue ler o valor)
   e nunca vai para backup, exportação ou servidor. Só o texto cifrado fica no localStorage e no IndexedDB. Não protege contra um script malicioso na própria página: por isso a CSP é fechada. */
const kb64=u=>btoa(String.fromCharCode(...u)),kunb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
let KEYS_READY=false,KEYS_LAST='';
async function kcKey(criar){
  if(!(window.crypto&&crypto.subtle))return null;
  let k=await idbGet('kc');
  if(!k&&criar){k=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);await idbSet('kc',k);if(!(await idbGet('kc')))return null}
  return k||null}
/* devolve 'ok' (cifrada e guardada), 'aba' (sem como guardar: vale até fechar a aba) ou 'erro' */
async function keysSave(forcar){
  if(!KEYS_READY&&!forcar)return 'ok';
  const o={};IAS.forEach(s=>{if(CFG[s].key)o[s]=CFG[s].key});const txt=JSON.stringify(o);
  if(txt===KEYS_LAST&&!forcar)return 'ok';
  try{sessionStorage.removeItem('ikeys')}catch(e){}
  if(!Object.keys(o).length){sset('ikeys2','');try{localStorage.removeItem('ikeys2');localStorage.removeItem('ikeys')}catch(e){}delete MEM.ikeys;await idbSet('ikeys2','');KEYS_LAST=txt;return 'ok'}
  if(CFG.lembrar===false){const a=JSON.stringify(IAS.map(s=>CFG[s].key||''));try{sessionStorage.setItem('ikeys',a)}catch(e){MEM.ikeys=a}return 'aba'}
  try{
    const k=await kcKey(true);
    if(!k){const a=JSON.stringify(IAS.map(s=>CFG[s].key||''));try{sessionStorage.setItem('ikeys',a)}catch(e){MEM.ikeys=a}return 'aba'}
    const iv=crypto.getRandomValues(new Uint8Array(12)),ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(txt)));
    const blob=JSON.stringify({v:1,iv:kb64(iv),c:kb64(ct)});
    sset('ikeys2',blob);await idbSet('ikeys2',blob);
    try{localStorage.removeItem('ikeys')}catch(e){}delete MEM.ikeys;KEYS_LAST=txt;return 'ok'
  }catch(e){return 'erro'}}
/* lê as chaves cifradas (e as do formato antigo, sem cifra, que passam a ser cifradas) */
async function keysLoad(forcar){
  try{
    const k=await kcKey(false),blob=sget('ikeys2')||await idbGet('ikeys2');
    if(k&&blob){const b=JSON.parse(blob),o=JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:kunb64(b.iv)},k,kunb64(b.c))));IAS.forEach(s=>{if(o[s]&&(forcar||!CFG[s].key))CFG[s].key=String(o[s])})}
  }catch(e){}
  KEYS_LAST=JSON.stringify(Object.fromEntries(IAS.filter(s=>CFG[s].key).map(s=>[s,CFG[s].key])));
  KEYS_READY=true;
  if(IAS.some(s=>CFG[s].key)&&(sget('ikeys')||MEM.ikeys))await keysSave(true); // formato antigo: cifra e apaga o texto puro
}
const loadKeys=()=>{let k=null;try{k=sessionStorage.getItem('ikeys')}catch(e){}k=k||sget('ikeys')||MEM.ikeys;try{k=JSON.parse(k||'[]')}catch(e){k=[]}IAS.forEach((s,i)=>{if(k[i])CFG[s].key=String(k[i])})};
try{Object.assign(CFG,JSON.parse(sget('cfg2')||'{}'));IAS.forEach(s=>{CFG[s]={...IA0(s),...CFG[s]}});loadKeys()}catch(e){}
if(!CFG.whats)CFG.whats=MY_WHATS;
if(CFG.pinh)delete CFG.pin;
if(CFG.seededPr!=='v2'){if(CFG.precos&&!/MARCADOR-TABELA-V2/.test(CFG.precos)&&!/^EXEMPLOS:/.test(CFG.precos))CFG.precosAntigos=CFG.precos;CFG.precos=PRECOS;CFG.seededPr='v2';CFG.t=Date.now();saveCfg()}
/* A IA roda na nuvem (Groq), sem nenhum computador ligado: configurações antigas com Ollama migram uma vez. */


/* Outra aba salvou: puxa a configuração e as chaves de lá, para esta aba não gravar por cima com dados velhos (e apagar a chave). */
addEventListener('storage',e=>{try{
  if(e.key==='cfg2'&&e.newValue){const ks=IAS.map(s=>CFG[s].key);Object.assign(CFG,JSON.parse(e.newValue));IAS.forEach((s,i)=>{CFG[s]={...IA0(s),...CFG[s],key:ks[i]}})}
  if(e.key==='ikeys2')keysLoad(true);
}catch(x){}});
/* Todo o site roda no Gemini: quem estava na Groq migra uma vez (a chave da Groq não serve no Google, então sai). */

/* Três IAs com papéis fixos (OpenAI, Gemini, Groq). Configurações antigas migram uma vez: a chave do Google vai para a IA 2, a da Groq para a IA 3, e a IA 1 (OpenAI) começa sem chave. */
if(CFG.seededTres!=='1'){const u=(c,r)=>r.test((c&&c.url)||''),oa=/api[.]openai[.]com/,g=/googleapis[.]com/,q=/groq[.]com/,v=[CFG.ia1,CFG.ia2,CFG.ia3,CFG.reserva].filter(Boolean),pega=r=>(v.find(c=>u(c,r)&&c.key)||{}).key||'';
  CFG.ia1=u(CFG.ia1,oa)?CFG.ia1:{...IA0('ia1'),key:pega(oa)};
  CFG.ia2=u(CFG.ia2,g)?{...CFG.ia2,key:pega(g)}:{...IA0('ia2'),key:pega(g)};
  CFG.ia3=u(CFG.ia3,q)?{...CFG.ia3,key:pega(q)}:{...IA0('ia3'),key:pega(q)};
  delete CFG.reserva;['seededNuvem','seededIA3','seededGemini','seededGemini2'].forEach(x=>delete CFG[x]);CFG.seededTres='1';CFG.t=Date.now();saveCfg()}
