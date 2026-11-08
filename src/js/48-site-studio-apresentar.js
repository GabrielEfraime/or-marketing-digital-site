/* OR Site Studio: modo Apresentar (SPEC.md SS-044). Mostra o site ou a proposta em tela cheia DENTRO do site, sem baixar arquivo nem abrir outro programa.
   Serve para mostrar ao cliente num tablet ou computador: tamanhos de celular, tablet e computador, Esc para sair. Nada é enviado a lugar nenhum. */
const SS_TAM={cel:['Celular','375px'],tab:['Tablet','768px'],pc:['Computador','100%']};
/* op: {js (o site pode ligar o JavaScript), imprimir (função que abre a impressão), tamanhos (mostra celular, tablet, computador), tam (inicial)} */
function ssApresentar(titulo,html,op){
  op=op||{};const antes=document.activeElement,estado={js:false,tam:op.tam||'pc'};
  const o=document.createElement('div');o.className='ss-apres';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Apresentação: '+titulo);
  const btn=(k,t,extra)=>`<button type="button" class="btn ghost" data-ap="${k}"${extra||''}>${esc(t)}</button>`;
  o.innerHTML=`<div class="ss-ap-bar"><b class="ss-ap-t">${esc(titulo)}</b><div class="row ss-ap-ac">
    ${op.tamanhos?Object.entries(SS_TAM).map(([k,[t]])=>btn('tam:'+k,t,' aria-pressed="'+(estado.tam===k)+'"')).join(''):''}
    ${op.js?btn('js','JavaScript do site',' aria-pressed="false"'):''}${op.imprimir?btn('print','Imprimir ou salvar PDF'):''}
    ${btn('full','Tela cheia')}${btn('sair','Sair (Esc)')}</div></div>
   <div class="ss-ap-cena" id="ssapc"></div>`;
  const cena=o.querySelector('#ssapc');
  /* o sandbox só muda recriando o iframe */
  const monta=()=>{
    cena.textContent='';const f=document.createElement('iframe');f.className='ss-ap-if';f.title='Apresentação: '+titulo;
    f.setAttribute('sandbox',(estado.js?'allow-scripts ':'')+'allow-popups allow-popups-to-escape-sandbox');f.setAttribute('referrerpolicy','no-referrer');
    f.style.width=SS_TAM[estado.tam][1];f.srcdoc=html;cena.appendChild(f);
  };
  const pressiona=(sel,on)=>{const b=o.querySelector(sel);if(b)b.setAttribute('aria-pressed',String(!!on))};
  const sair=()=>{document.removeEventListener('keydown',tecla,true);if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});o.remove();document.documentElement.style.overflow=prevOv;try{if(antes&&antes.focus)antes.focus()}catch(e){}};
  const tecla=e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();sair()}
    else if(e.key==='Tab'){const fs=[...o.querySelectorAll('button')].filter(b=>!b.disabled);if(!fs.length)return;const a=fs.indexOf(document.activeElement);
      if(e.shiftKey&&a<=0){e.preventDefault();fs[fs.length-1].focus()}else if(!e.shiftKey&&a===fs.length-1){e.preventDefault();fs[0].focus()}}};
  o.onclick=e=>{const b=e.target.closest('[data-ap]');if(!b)return;const [k,v]=b.dataset.ap.split(':');
    if(k==='sair')sair();
    else if(k==='tam'){estado.tam=v;o.querySelectorAll('[data-ap^="tam:"]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.ap==='tam:'+v)));monta()}
    else if(k==='js'){estado.js=!estado.js;pressiona('[data-ap="js"]',estado.js);monta()}
    else if(k==='print'&&op.imprimir)op.imprimir();
    else if(k==='full'){if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else if(o.requestFullscreen)o.requestFullscreen().catch(()=>{})}};
  const prevOv=document.documentElement.style.overflow;document.documentElement.style.overflow='hidden';
  document.body.appendChild(o);monta();document.addEventListener('keydown',tecla,true);
  const foco=o.querySelector('[data-ap="sair"]');if(foco)foco.focus();
  return {sair,elemento:o};
}
