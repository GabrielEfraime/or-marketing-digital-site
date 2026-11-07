/* Funções genéricas usadas por vários arquivos (carregado antes de todos). Só definições: nada roda ao carregar. */
const uid=()=>Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-3);
const today=()=>new Date().toLocaleDateString('sv-SE');
const brl=n=>'R$ '+(Number(n)||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const arr=a=>Array.isArray(a)?a:[];
const hexLum=h=>{const n=parseInt(h.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255;return(.2126*r+.7152*g+.0722*b)/255};

/* IndexedDB: um só jeito de abrir e de fazer uma transação. Os nomes dos bancos e das lojas NÃO mudam
   ('estudio-ia'/'kv', 'vyxa-cv'/'f', 'or-arquivos'/'f'), senão os dados já salvos somem. */
const idbAbre=(nome,loja)=>new Promise((res,rej)=>{try{const q=indexedDB.open(nome,1);q.onupgradeneeded=()=>q.result.createObjectStore(loja);q.onsuccess=()=>res(q.result);q.onerror=()=>rej(q.error)}catch(e){rej(e)}});
const idbTx=async(nome,loja,modo,fn)=>{const d=await idbAbre(nome,loja);return new Promise((res,rej)=>{const tx=d.transaction(loja,modo),r=fn(tx.objectStore(loja));tx.oncomplete=()=>res(r&&r.result);tx.onerror=()=>rej(tx.error);tx.onabort=()=>rej(tx.error)})};

/* Copia para a área de transferência. Devolve true/false; quem chama decide o aviso e o plano B.
   Se vier "msg" e a cópia der certo, mostra esse aviso. */
/* Aviso breve (role=status, aria-live) que não trava a tela. */
function toast(m){let t=document.getElementById('toast');if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');t.setAttribute('aria-live','polite');document.body.appendChild(t)}
  t.classList.remove('on');clearTimeout(t._h);setTimeout(()=>{t.textContent=m;t.classList.add('on')},40);t._h=setTimeout(()=>t.classList.remove('on'),2400)}
/* Plano B da cópia: textarea temporário + execCommand('copy'). */
function copiarB(txt){const ant=document.activeElement;let ok=false;try{const t=document.createElement('textarea');t.className='copy-tmp';t.value=txt;t.setAttribute('readonly','');t.setAttribute('aria-hidden','true');document.body.appendChild(t);t.select();t.setSelectionRange(0,t.value.length);ok=document.execCommand('copy');t.remove()}catch(e){ok=false}
  try{if(ant&&ant.focus)ant.focus()}catch(e){}return ok}
const copiar=async(txt,msg)=>{txt=String(txt??'');let ok=false;try{await navigator.clipboard.writeText(txt);ok=true}catch(e){ok=copiarB(txt)}
  if(ok){if(msg&&typeof aviso==='function')aviso(msg);else toast('Copiado');return true}
  if(typeof dlg==='function'){const m=dlg('Copiar manualmente','<h3>Não foi possível copiar sozinho</h3><p class="hint">Selecione o texto abaixo e copie com Ctrl+C.</p><textarea readonly class="copy-man" rows="7" aria-label="Texto para copiar">'+esc(txt)+'</textarea><div class="row"><button class="btn" type="button" data-ok>Fechar</button></div>',{id:'copydlg'});const b=m.querySelector('[data-ok]');if(b)b.onclick=()=>m.remove();const ta=m.querySelector('textarea');if(ta){ta.focus();ta.select()}}
  else toast('Não foi possível copiar. Selecione o texto e copie à mão.');
  return false};

/* HTML gerado pela IA que vai para fora do app (download, pasta do HD): tira <script>, atributos on*, javascript: e
   outros jeitos de rodar código, e põe uma CSP que proíbe scripts no próprio arquivo entregue. */
const CSP_SEM_SCRIPT='<meta http-equiv="Content-Security-Policy" content="script-src \'none\'">';
const sanitizaHtml=html=>{
  const d=new DOMParser().parseFromString(String(html||''),'text/html');
  d.querySelectorAll('script,object,embed,applet,base').forEach(e=>e.remove());
  d.querySelectorAll('meta[http-equiv]').forEach(e=>{if(/refresh|content-security-policy|set-cookie/i.test(e.getAttribute('http-equiv')))e.remove()});
  d.querySelectorAll('*').forEach(e=>{[...e.attributes].forEach(a=>{
    const n=a.name.toLowerCase(),v=a.value.replace(/[\u0000- \u007f-\u009f]+/g,'').toLowerCase();
    if(n.startsWith('on')||((n==='href'||n==='src'||n==='action'||n==='formaction'||n==='xlink:href'||n==='srcdoc'||n==='data')&&(/^(javascript|vbscript):/.test(v)||(n!=='src'&&/^data:text\/html/.test(v)))))e.removeAttribute(a.name);
    if(n==='srcdoc')e.removeAttribute(a.name)})});
  d.head.insertAdjacentHTML('afterbegin',(d.querySelector('meta[charset]')?'':'<meta charset="utf-8">')+CSP_SEM_SCRIPT);
  return '<!doctype html>\n'+d.documentElement.outerHTML};
const dlHtml=(nome,html)=>dl(nome,sanitizaHtml(html),'text/html');
