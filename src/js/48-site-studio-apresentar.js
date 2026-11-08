/* OR Site Studio: modo Apresentar (SPEC.md SS-044). Mostra o site ou a proposta em tela cheia DENTRO do site, sem baixar arquivo nem abrir outro programa.
   Serve para mostrar ao cliente num tablet ou computador: tamanhos de celular, tablet e computador, Esc para sair. Nada é enviado a lugar nenhum.
   Revisão do Codex (08/11/2026): a faixa de prévia fica FORA do iframe (o site não a alcança), o conteúdo leva CSP própria sem rede, e o resto da página fica inerte. */
const SS_TAM={cel:['Celular','375px'],tab:['Tablet','768px'],pc:['Computador','100%']};
/* CSP do conteúdo apresentado: scripts do site (quando ligados) não saem para nenhuma rede nem enviam formulário */
const SS_CSP_APRES='<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; img-src data:; style-src \'unsafe-inline\'; script-src \'unsafe-inline\'; form-action \'none\'; base-uri \'none\'">';
const ssComCsp=h=>/<head[^>]*>/i.test(String(h))?String(h).replace(/<head[^>]*>/i,m=>m+SS_CSP_APRES):SS_CSP_APRES+String(h);
/* op: {js (o site pode ligar o JavaScript), csp (põe a CSP sem rede no conteúdo), faixa (texto fixo mostrado fora do iframe), imprimir (função que abre a impressão), tamanhos (celular, tablet, computador), tam (inicial)} */
function ssApresentar(titulo,html,op){
  op=op||{};const antes=document.activeElement,estado={js:false,tam:op.tam||'pc'};
  const o=document.createElement('div');o.className='ss-apres';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Apresentação: '+titulo);
  const btn=(k,t,extra)=>`<button type="button" class="btn ghost" data-ap="${k}"${extra||''}>${esc(t)}</button>`;
  o.innerHTML=`<div class="ss-ap-bar"><b class="ss-ap-t">${esc(titulo)}</b><div class="row ss-ap-ac">
    ${op.tamanhos?Object.entries(SS_TAM).map(([k,[t]])=>btn('tam:'+k,t,' aria-pressed="'+(estado.tam===k)+'"')).join(''):''}
    ${op.js?btn('js','JavaScript do site',' aria-pressed="false"'):''}${op.imprimir?btn('print','Imprimir ou salvar PDF'):''}
    ${btn('full','Tela cheia')}${btn('sair','Sair (Esc)',' aria-keyshortcuts="Escape" title="Com o foco dentro do site o Esc não chega aqui: use este botão ou Shift+Tab"')}</div></div>
   ${op.faixa?`<div class="ss-ap-fx" role="note">${esc(op.faixa)}</div>`:''}
   <div class="ss-ap-cena" id="ssapc"></div>`;
  const cena=o.querySelector('#ssapc'),conteudo=op.csp?ssComCsp(html):html;
  /* o sandbox só muda recriando o iframe */
  const monta=()=>{
    cena.textContent='';const f=document.createElement('iframe');f.className='ss-ap-if';f.title='Apresentação: '+titulo;
    f.setAttribute('sandbox',(estado.js?'allow-scripts ':'')+'allow-popups allow-popups-to-escape-sandbox');f.setAttribute('referrerpolicy','no-referrer');
    f.style.width=SS_TAM[estado.tam][1];f.srcdoc=conteudo;cena.appendChild(f);
  };
  const pressiona=(sel,on)=>{const b=o.querySelector(sel);if(b)b.setAttribute('aria-pressed',String(!!on))};
  /* o resto da página fica inerte (sem foco, sem leitor de tela) enquanto a apresentação está aberta */
  const outros=[...document.body.children].filter(e=>e!==o&&!e.hasAttribute('inert'));outros.forEach(e=>e.setAttribute('inert',''));
  const prevOv=document.documentElement.style.overflow;
  const sair=()=>{document.removeEventListener('keydown',tecla,true);outros.forEach(e=>e.removeAttribute('inert'));if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});o.remove();document.documentElement.style.overflow=prevOv;try{if(antes&&antes.focus)antes.focus()}catch(e){}};
  const tecla=e=>{
    if(!document.body.contains(o)){document.removeEventListener('keydown',tecla,true);outros.forEach(x=>x.removeAttribute('inert'));return}  /* overlay removido por fora: não deixa o ouvinte nem o inert para trás */
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();sair()}
    else if(e.key==='Tab'){const fs=[...o.querySelectorAll('button')].filter(b=>!b.disabled);if(!fs.length)return;const a=fs.indexOf(document.activeElement);
      if(e.shiftKey&&a<=0){e.preventDefault();fs[fs.length-1].focus()}else if(!e.shiftKey&&a===fs.length-1){e.preventDefault();fs[0].focus()}}};
  o.onclick=e=>{const b=e.target.closest('[data-ap]');if(!b)return;const [k,v]=b.dataset.ap.split(':');
    if(k==='sair')sair();
    else if(k==='tam'){estado.tam=v;o.querySelectorAll('[data-ap^="tam:"]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.ap==='tam:'+v)));monta()}
    else if(k==='js'){estado.js=!estado.js;pressiona('[data-ap="js"]',estado.js);monta()}
    else if(k==='print'&&op.imprimir)op.imprimir();
    else if(k==='full'){if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});else if(o.requestFullscreen)o.requestFullscreen().catch(()=>{})}};
  document.documentElement.style.overflow='hidden';
  document.body.appendChild(o);monta();document.addEventListener('keydown',tecla,true);
  const foco=o.querySelector('[data-ap="sair"]');if(foco)foco.focus();
  return {sair,elemento:o};
}
