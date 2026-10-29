const guiaNota=l=>'O cliente não sabia o que precisava; os serviços abaixo foram sugeridos pelo roteiro de descoberta, pelos motivos: '+((l.guia&&Array.isArray(l.guia.rec))?l.guia.rec.map(r=>(MODS[r.k]?MODS[r.k].name:r.k)+' ('+(r.why||[]).join(' ')+')').join('; '):'')+'\n';
const recHtml=rec=>`<div class="panel recbox"><h3>Por onde indicamos começar</h3><ul class="reclist">${rec.map((r,i)=>`<li><b>${i+1}. ${esc(MODS[r.k].name)}</b>${(r.why||[]).map(w=>'<span>'+esc(w)+'</span>').join('')}</li>`).join('')}</ul><p class="hint">É uma sugestão inicial, feita a partir das suas respostas. Nossa equipe revisa antes de enviar o plano e o orçamento.</p></div>`;

const $=s=>document.querySelector(s),app=$('#app');
const MEM={};let STORE_OK=true;
const sget=k=>{if(k in MEM)return MEM[k];try{return localStorage.getItem(k)}catch(e){STORE_OK=false;return null}};
const sset=(k,v)=>{try{localStorage.setItem(k,v);delete MEM[k]}catch(e){STORE_OK=false;MEM[k]=v}};
const GROQ_URL='https://api.groq.com/openai/v1',GEMINI_URL='https://generativelanguage.googleapis.com/v1beta/openai',GEMINI_M={ia1:'gemini-3.5-flash',ia2:'gemini-3.5-flash-lite',reserva:'gemini-flash-lite-latest'},IA0=(s)=>({kind:'openai',url:GEMINI_URL,model:GEMINI_M[s],key:''});
const theme=()=>document.documentElement.dataset.theme==='light'?'light':'dark';
const setTheme=()=>{document.documentElement.dataset.theme='dark'};
setTheme();
const CFG={reserva:{kind:'openai',url:GEMINI_URL,model:GEMINI_M.reserva,key:''},kb:{sobre:'',regras:'',exemplos:'',licoes:[]},brand:BRAND,precos:PRECOS,pin:ADMIN_PIN,whats:MY_WHATS,t:0,ia1:IA0('ia1'),ia2:IA0('ia2')};
const saveCfg=()=>{sset('cfg2',JSON.stringify({...CFG,ia1:{...CFG.ia1,key:''},ia2:{...CFG.ia2,key:''}}));const k=JSON.stringify([CFG.ia1.key||'',CFG.ia2.key||'']);try{sessionStorage.removeItem('ikeys')}catch(e){}if(CFG.lembrar===false){try{sessionStorage.setItem('ikeys',k)}catch(e){MEM.ikeys=k}try{localStorage.removeItem('ikeys')}catch(e){}}else sset('ikeys',k)};
const loadKeys=()=>{let k=null;try{k=sessionStorage.getItem('ikeys')}catch(e){}k=k||sget('ikeys')||MEM.ikeys;try{k=JSON.parse(k||'[]')}catch(e){k=[]}if(k[0])CFG.ia1.key=String(k[0]);if(k[1])CFG.ia2.key=String(k[1])};
try{Object.assign(CFG,JSON.parse(sget('cfg2')||'{}'));CFG.ia1={...IA0('ia1'),...CFG.ia1};CFG.ia2={...IA0('ia2'),...CFG.ia2};if(CFG.ia1.key||CFG.ia2.key){saveCfg()}loadKeys()}catch(e){}
if(!CFG.whats)CFG.whats=MY_WHATS;
if(CFG.pinh)delete CFG.pin;
if(CFG.seededPr!=='v2'){if(CFG.precos&&!/MARCADOR-TABELA-V2/.test(CFG.precos)&&!/^EXEMPLOS:/.test(CFG.precos))CFG.precosAntigos=CFG.precos;CFG.precos=PRECOS;CFG.seededPr='v2';CFG.t=Date.now();saveCfg()}
/* A IA roda na nuvem (Groq), sem nenhum computador ligado: configurações antigas com Ollama migram uma vez. */
if(CFG.seededNuvem!=='1'){['ia1','ia2'].forEach(s=>{if(CFG[s].kind==='ollama'){const k=CFG[s].key;CFG[s]={...IA0(s),key:k||''}}});if(CFG.reserva&&CFG.reserva.model==='qwen3.5:4b')CFG.reserva.model='';CFG.seededNuvem='1';CFG.t=Date.now();saveCfg()}
if(CFG.seededIA3!=='1'){if(!CFG.reserva||CFG.reserva.kind!=='openai')CFG.reserva={kind:'openai',url:GROQ_URL,model:'qwen/qwen3.8-27b',key:''};CFG.seededIA3='1';CFG.t=Date.now();saveCfg()}
/* Outra aba salvou: puxa a configuração e as chaves de lá, para esta aba não gravar por cima com dados velhos (e apagar a chave). */
addEventListener('storage',e=>{try{
  if(e.key==='cfg2'&&e.newValue){const k1=CFG.ia1.key,k2=CFG.ia2.key;Object.assign(CFG,JSON.parse(e.newValue));CFG.ia1={...IA0('ia1'),...CFG.ia1,key:k1};CFG.ia2={...IA0('ia2'),...CFG.ia2,key:k2}}
  if(e.key==='ikeys'){const k=JSON.parse(e.newValue||'[]');CFG.ia1.key=String(k[0]||'');CFG.ia2.key=String(k[1]||'')}
}catch(x){}});
/* Todo o site roda no Gemini: quem estava na Groq migra uma vez (a chave da Groq não serve no Google, então sai). */
if(CFG.seededGemini!=='1'){['ia1','ia2'].forEach(s=>{if(/groq\.com/.test(CFG[s].url||'')){CFG[s]={...IA0(s),key:''}}});if(!CFG.reserva||/groq\.com/.test(CFG.reserva.url||'')||!CFG.reserva.model)CFG.reserva={kind:'openai',url:GEMINI_URL,model:GEMINI_M.reserva,key:''};CFG.seededGemini='1';CFG.t=Date.now();saveCfg()}
/* gemini-flash-latest vivia sobrecarregado (erro 503 ou sem resposta): troca uma vez pelos modelos 3.5, que respondem. A chave fica. */
if(CFG.seededGemini2!=='1'){['ia1','ia2','reserva'].forEach(s=>{if(CFG[s]&&CFG[s].model==='gemini-flash-latest')CFG[s].model=GEMINI_M[s]});CFG.seededGemini2='1';CFG.t=Date.now();saveCfg()}
