const guiaNota=l=>'O cliente não sabia o que precisava; os serviços abaixo foram sugeridos pelo roteiro de descoberta, pelos motivos: '+((l.guia&&Array.isArray(l.guia.rec))?l.guia.rec.map(r=>(MODS[r.k]?MODS[r.k].name:r.k)+' ('+(r.why||[]).join(' ')+')').join('; '):'')+'\n';
const recHtml=rec=>`<div class="panel recbox"><h3>Por onde indicamos começar</h3><ul class="reclist">${rec.map((r,i)=>`<li><b>${i+1}. ${esc(MODS[r.k].name)}</b>${(r.why||[]).map(w=>'<span>'+esc(w)+'</span>').join('')}</li>`).join('')}</ul><p class="hint">É uma sugestão inicial, feita a partir das suas respostas. Nossa equipe revisa antes de enviar o plano e o orçamento.</p></div>`;

const $=s=>document.querySelector(s),app=$('#app');
const MEM={};let STORE_OK=true;
const sget=k=>{if(k in MEM)return MEM[k];try{return localStorage.getItem(k)}catch(e){STORE_OK=false;return null}};
const sset=(k,v)=>{try{localStorage.setItem(k,v);delete MEM[k]}catch(e){STORE_OK=false;MEM[k]=v}};
/* Lote 3A: o código do servidor (Cloudflare, chave 'ortoken') foi aposentado; apaga o valor antigo, se existir */
try{localStorage.removeItem('ortoken')}catch(e){}
const GROQ_URL='https://api.groq.com/openai/v1',GEMINI_URL='https://generativelanguage.googleapis.com/v1beta/openai',IAS=['ia1','ia2','ia3'],IA_CHAVES=[...IAS,'img','pol'];
/* Funções (pedido do dono em 04/11/2026, prompt mestre da Groq): IA 1 = criação (posts, legendas, roteiros, artes, mensagens) no Qwen 3.8 27B;
   IA 2 = estratégia e atendimento (calendário, campanhas, briefing, orçamento, relatórios) no GPT-OSS 120B; IA 3 = captação no GPT-OSS 120B.
   As três usam a mesma chave da Groq. "img" = Gemini, reserva de emergência do texto (e das imagens); "pol" = Pollinations, gerador das imagens das artes. */
const IA_DEF={ia1:{url:GROQ_URL,model:'qwen/qwen3.8-27b'},ia2:{url:GROQ_URL,model:'openai/gpt-oss-120b'},ia3:{url:GROQ_URL,model:'openai/gpt-oss-120b'},img:{url:GEMINI_URL,model:'gemini-3.5-flash'},pol:{url:'https://gen.pollinations.ai',model:'tongyi-mai/z-image-turbo'}},IA0=s=>({kind:'openai',...IA_DEF[s],key:''});
const CFG={kb:{sobre:'',regras:'',exemplos:'',licoes:[]},brand:BRAND,precos:PRECOS,pin:ADMIN_PIN,whats:MY_WHATS,t:0,ia1:IA0('ia1'),ia2:IA0('ia2'),ia3:IA0('ia3'),img:IA0('img'),pol:IA0('pol')};
const semChave=()=>{const o={...CFG};IA_CHAVES.forEach(s=>{o[s]={...CFG[s],key:''}});return o};
/* Copia para CFG só os campos conhecidos de uma configuração vinda de fora (config.json do HD, outra aba, localStorage), sem Object.assign direto.
   Ignora __proto__, constructor e prototype em qualquer nível. "local" libera também os campos que só existem no navegador (pin, lembrar, skipKeys, moverGemini). */
const CFG_TIPOS={kb:'o',kbAntigo:'o',kbAntigo2:'o',apagados:'a',brand:'s',precos:'s',precosAntigos:'s',whats:'s',pinh:'s',t:'n'},CFG_LOCAIS={pin:'s',lembrar:'b',skipKeys:'a',moverGemini:'b'};
const cfgLimpa=v=>{if(Array.isArray(v))return v.map(cfgLimpa);if(v&&typeof v==='object'){const o={};for(const k of Object.keys(v))if(k!=='__proto__'&&k!=='constructor'&&k!=='prototype')o[k]=cfgLimpa(v[k]);return o}return v};
const cfgTipoOk=(t,v)=>t==='o'?(v&&typeof v==='object'&&!Array.isArray(v)):t==='a'?Array.isArray(v):t==='s'?typeof v==='string':t==='n'?(typeof v==='number'&&isFinite(v)):t==='b'?typeof v==='boolean':false;
const cfgMescla=(o,local)=>{
  if(!o||typeof o!=='object'||Array.isArray(o))return;
  for(const k of Object.keys(o)){
    if(k==='__proto__'||k==='constructor'||k==='prototype')continue;
    const v=o[k],t=CFG_TIPOS[k]||(local&&CFG_LOCAIS[k])||(/^seeded[A-Za-z0-9]{0,20}$/.test(k)?'s':'');
    if(t&&cfgTipoOk(t,v))CFG[k]=cfgLimpa(v);
    else if(IA_CHAVES.includes(k)&&v&&typeof v==='object'&&!Array.isArray(v)){const n={};for(const f of Object.keys(v)){if(f==='__proto__'||f==='constructor'||f==='prototype')continue;if(['string','number','boolean'].includes(typeof v[f]))n[f]=v[f]}CFG[k]=n}}};
const saveCfg=()=>{sset('cfg2',JSON.stringify(semChave()));keysSave()};
/* Chaves das IAs: cifradas com AES-GCM. A chave de cifra é gerada no navegador, fica no IndexedDB como "não exportável" (o JavaScript usa, mas não consegue ler o valor)
   e nunca vai para backup, exportação ou servidor. Só o texto cifrado fica no localStorage e no IndexedDB. Não protege contra um script malicioso na própria página: por isso a CSP é fechada. */
const kb64=u=>btoa(String.fromCharCode(...u)),kunb64=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
let KEYS_READY=false,KEYS_LAST='';
/* Chave da Places API (Captar clientes): vai no mesmo cofre cifrado das chaves de IA (campo "gplaces"); GPK.v é a cópia em memória. */
const GPK={v:''};
const keysObj=()=>{const o={};IA_CHAVES.forEach(s=>{if(CFG[s].key)o[s]=CFG[s].key});if(GPK.v)o.gplaces=GPK.v;return o};
const gplLegado=()=>{let v='';try{v=localStorage.getItem('gplaces')||''}catch(e){}return v||MEM.gplaces||''};
const gplLimpaClaro=()=>{try{localStorage.removeItem('gplaces')}catch(e){}delete MEM.gplaces};
async function kcKey(criar){
  if(!(window.crypto&&crypto.subtle))return null;
  let k=await idbGet('kc');
  if(!k&&criar){k=await crypto.subtle.generateKey({name:'AES-GCM',length:256},false,['encrypt','decrypt']);await idbSet('kc',k);if(!(await idbGet('kc')))return null}
  return k||null}
/* devolve 'ok' (cifrada e guardada), 'aba' (sem como guardar: vale até fechar a aba) ou 'erro' */
async function keysSave(forcar){
  if(!KEYS_READY&&!forcar)return 'ok';
  const o=keysObj(),txt=JSON.stringify(o);
  if(txt===KEYS_LAST&&!forcar)return 'ok';
  try{sessionStorage.removeItem('ikeys');sessionStorage.removeItem('gpl')}catch(e){}delete MEM.gpl;
  if(!Object.keys(o).length){sset('ikeys2','');try{localStorage.removeItem('ikeys2');localStorage.removeItem('ikeys')}catch(e){}delete MEM.ikeys;await idbSet('ikeys2','');gplLimpaClaro();KEYS_LAST=txt;return 'ok'}
  if(CFG.lembrar===false){const a=JSON.stringify(IA_CHAVES.map(s=>CFG[s].key||''));try{sessionStorage.setItem('ikeys',a)}catch(e){MEM.ikeys=a}if(GPK.v){try{sessionStorage.setItem('gpl',GPK.v)}catch(e){MEM.gpl=GPK.v}}gplLimpaClaro();return 'aba'}
  try{
    const k=await kcKey(true);
    if(!k){const a=JSON.stringify(IA_CHAVES.map(s=>CFG[s].key||''));try{sessionStorage.setItem('ikeys',a)}catch(e){MEM.ikeys=a}if(GPK.v){try{sessionStorage.setItem('gpl',GPK.v)}catch(e){MEM.gpl=GPK.v}}return 'aba'}
    const iv=crypto.getRandomValues(new Uint8Array(12)),ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(txt)));
    const blob=JSON.stringify({v:1,iv:kb64(iv),c:kb64(ct)});
    sset('ikeys2',blob);await idbSet('ikeys2',blob);
    try{localStorage.removeItem('ikeys')}catch(e){}delete MEM.ikeys;gplLimpaClaro();KEYS_LAST=txt;return 'ok'
  }catch(e){return 'erro'}}
/* lê as chaves cifradas (e as do formato antigo, sem cifra, que passam a ser cifradas) */
async function keysLoad(forcar){
  try{
    const k=await kcKey(false),blob=sget('ikeys2')||await idbGet('ikeys2');
    if(k&&blob){const b=JSON.parse(blob),o=JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:kunb64(b.iv)},k,kunb64(b.c))));if(CFG.moverGemini){const g=o.img||o.ia2||o.ia1||o.ia3;if(g&&!CFG.img.key)CFG.img.key=String(g)}IA_CHAVES.forEach(s=>{if(s!=='img'&&o.img&&o[s]===o.img&&!/googleapis[.]com/.test(CFG[s].url||''))return; /* a chave do Google nunca vai para uma IA de outra plataforma (ex.: aba antiga aberta) */
      if(o[s]&&!(CFG.skipKeys||[]).includes(s)&&(forcar||!CFG[s].key))CFG[s].key=String(o[s])});
      if(o.gplaces&&(forcar||!GPK.v))GPK.v=String(o.gplaces)}
  }catch(e){}
  const legado=gplLegado(); /* chave da Places em texto claro (formato antigo): passa para o cofre e o texto claro é apagado */
  if(legado&&!GPK.v)GPK.v=legado;
  KEYS_LAST=JSON.stringify(keysObj());
  KEYS_READY=true;
  if(legado)await keysSave(true);
  if(CFG.skipKeys){delete CFG.skipKeys;delete CFG.moverGemini;saveCfg();await keysSave(true)} // migrações: chaves que não servem na plataforma nova saem (a do Google vai para as imagens)
  if(IA_CHAVES.some(s=>CFG[s].key)&&(sget('ikeys')||MEM.ikeys))await keysSave(true); // formato antigo: cifra e apaga o texto puro
}
const loadKeys=()=>{let k=null;try{k=sessionStorage.getItem('ikeys')}catch(e){}k=k||sget('ikeys')||MEM.ikeys;try{k=JSON.parse(k||'[]')}catch(e){k=[]}IA_CHAVES.forEach((s,i)=>{if(k[i])CFG[s].key=String(k[i])});let g='';try{g=sessionStorage.getItem('gpl')||''}catch(e){}g=g||MEM.gpl||'';if(g&&!GPK.v)GPK.v=g};
try{cfgMescla(JSON.parse(sget('cfg2')||'{}'),true);IA_CHAVES.forEach(s=>{CFG[s]={...IA0(s),...CFG[s]}});loadKeys()}catch(e){}
if(!CFG.whats)CFG.whats=MY_WHATS;
if(CFG.pinh)delete CFG.pin;
if(CFG.seededPr!=='v3'){if(CFG.precos&&!/MARCADOR-TABELA-V3/.test(CFG.precos)&&!/^EXEMPLOS:/.test(CFG.precos))CFG.precosAntigos=CFG.precos;CFG.precos=PRECOS;CFG.seededPr='v3';CFG.t=Date.now();saveCfg()}
/* Outra aba salvou: puxa a configuração e as chaves de lá, para esta aba não gravar por cima com dados velhos (e apagar a chave). */
addEventListener('storage',e=>{try{
  if(e.key==='cfg2'&&e.newValue){const ks=IA_CHAVES.map(s=>CFG[s].key);cfgMescla(JSON.parse(e.newValue),true);IA_CHAVES.forEach((s,i)=>{CFG[s]={...IA0(s),...CFG[s],key:ks[i]}})}
  if(e.key==='ikeys2')keysLoad(true);
}catch(x){}});
/* Por ora as três IAs rodam no Gemini: configurações antigas (OpenAI, Groq ou a IA reserva) migram uma vez. A chave do Google é a única que continua valendo; as outras saem. */
if(CFG.seededGem!=='1'){const gk=([CFG.ia1,CFG.ia2,CFG.ia3].filter(c=>c&&/googleapis[.]com/.test(c.url||'')&&c.key)[0]||{}).key||'';
  IAS.forEach(s=>{CFG[s]={...IA0(s),key:s==='ia2'?gk:''}});
  delete CFG.reserva;['seededNuvem','seededIA3','seededGemini','seededGemini2','seededTres'].forEach(x=>delete CFG[x]);CFG.seededGem='1';CFG.skipKeys=['ia1','ia3'];CFG.t=Date.now();saveCfg()}
/* 04/11/2026: a IA passou para a Groq (Qwen cria; GPT-OSS 120B planeja, atende e capta). Migra uma vez: as três IAs vão para os
   modelos novos e a chave do Google, que servia às três, vai para o cartão de imagens (as imagens continuam no Gemini). */
if(CFG.seededGroq!=='1'){const g=[CFG.ia1,CFG.ia2,CFG.ia3].map(c=>c&&/googleapis[.]com/.test(c.url||'')&&c.key).find(Boolean);
  IAS.forEach(s=>{CFG[s]={...IA0(s)}});if(g&&!CFG.img.key)CFG.img.key=g;
  CFG.moverGemini=true;CFG.skipKeys=[...IAS];CFG.seededGroq='1';CFG.t=Date.now();saveCfg()}
/* 06/11/2026: Anthropic, OpenRouter, Cerebras e OpenAI saíram da CSP e da tela IAs. Quem ainda tem uma IA configurada com um desses provedores
   volta, só nessa IA, à configuração padrão da Groq (a chave daquele provedor sai; as demais IAs, chaves e configurações ficam como estão). */
if(CFG.seededProv!=='1'){const velho=c=>c&&(c.kind==='anthropic'||/api[.]openai[.]com|api[.]anthropic[.]com|openrouter[.]ai|api[.]cerebras[.]ai/.test(c.url||'')),sai=IAS.filter(s=>velho(CFG[s]));
  if(sai.length){sai.forEach(s=>{CFG[s]={...IA0(s)}});CFG.skipKeys=[...new Set([...(CFG.skipKeys||[]),...sai])]}
  CFG.seededProv='1';CFG.t=Date.now();saveCfg()}
