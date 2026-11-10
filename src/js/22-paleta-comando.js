/* ====== Paleta de comando (Ctrl+K) da Minha área: telas e leads, só com dados locais, nada de IA nem de rede ====== */
const PAL={aberta:false,gatilho:null,itens:[],i:0};
const palTelas=()=>[...PN_GRUPOS.flatMap(g=>g[1]),['cfg','Configurações']].map(([v,t])=>({tipo:'tela',v,t}));
function palResultados(q){
  const n=norm(q||''),telas=palTelas().filter(x=>!n||norm(x.t).includes(n)),
    leads=getL().filter(l=>!l.arq&&(!n||norm(l.nome).includes(n)||norm(svcName(l)).includes(n))).sort((a,b)=>leadT(b)-leadT(a)).slice(0,n?8:5).map(l=>({tipo:'lead',id:l.id,t:l.nome,s:stl(l.status)+' · '+svcName(l)}));
  return [...telas,...leads];
}
function palPinta(){
  const lista=document.getElementById('pal-lista'),inp=document.getElementById('pal-q');if(!lista||!inp)return;
  PAL.itens=palResultados(inp.value);if(PAL.i>=PAL.itens.length)PAL.i=Math.max(0,PAL.itens.length-1);
  let ult='';
  lista.innerHTML=PAL.itens.length?PAL.itens.map((x,i)=>{
    const g=x.tipo==='tela'?'Telas':'Leads',cab=g!==ult?`<li role="presentation" class="pal-g">${g}</li>`:'';ult=g;
    return cab+`<li role="option" id="pal-o${i}" class="pal-o${i===PAL.i?' on':''}" data-i="${i}" aria-selected="${i===PAL.i}"><span class="pal-t">${esc(x.t)}</span>${x.s?`<span class="pal-s">${esc(x.s)}</span>`:''}</li>`}).join(''):'<li role="presentation" class="pal-vazio">Nada encontrado. Tente outro nome.</li>';
  inp.setAttribute('aria-activedescendant',PAL.itens.length?'pal-o'+PAL.i:'');
  const on=lista.querySelector('.on');if(on&&on.scrollIntoView)on.scrollIntoView({block:'nearest'});
  const st=document.getElementById('pal-st');if(st)st.textContent=PAL.itens.length?PAL.itens.length+' resultado(s)':'Nenhum resultado';
}
function palEscolhe(i){
  const x=PAL.itens[i];if(!x)return;palFecha(true);
  if(x.tipo==='tela')pnIr(x.v);
  else{A.view='';A.sel=x.id;A.tab='orc';A.edit=false;A.err='';A.fs=false;admin();window.scrollTo(0,0)}
}
function palFecha(semFoco){
  const p=document.getElementById('pal');if(p)p.remove();
  document.body.classList.remove('pal-aberta');PAL.aberta=false;
  if(!semFoco&&PAL.gatilho&&PAL.gatilho.isConnected)PAL.gatilho.focus();
}
function pnPaletaAbre(gatilho){
  if(PAL.aberta||document.querySelector('.modal'))return;
  pnFechaMenu(true);
  PAL.aberta=true;PAL.i=0;PAL.gatilho=(gatilho&&gatilho!==document.body)?gatilho:document.querySelector('.pn-busca');
  const p=document.createElement('div');p.id='pal';p.className='pal';
  p.innerHTML=`<div class="pal-box" role="dialog" aria-modal="true" aria-label="Buscar lead ou ir para uma tela"><div class="pal-in">${PN_ICONES.busca}<input id="pal-q" type="text" role="combobox" aria-expanded="true" aria-controls="pal-lista" aria-autocomplete="list" aria-label="Buscar lead ou ir para uma tela" placeholder="Buscar lead ou ir para uma tela" autocomplete="off" spellcheck="false" maxlength="80"><kbd>Esc</kbd></div><ul id="pal-lista" class="pal-l" role="listbox" aria-label="Resultados"></ul><p class="pal-d" id="pal-st" role="status" aria-live="polite"></p><button type="button" class="pal-x" data-pal-x>Fechar</button></div>`;
  document.body.appendChild(p);document.body.classList.add('pal-aberta');
  const inp=p.querySelector('#pal-q'),lista=p.querySelector('#pal-lista');
  inp.oninput=()=>{PAL.i=0;palPinta()};
  inp.onkeydown=e=>{
    if(e.key==='ArrowDown'){e.preventDefault();PAL.i=PAL.itens.length?(PAL.i+1)%PAL.itens.length:0;palPinta()}
    else if(e.key==='ArrowUp'){e.preventDefault();PAL.i=PAL.itens.length?(PAL.i-1+PAL.itens.length)%PAL.itens.length:0;palPinta()}
    else if(e.key==='Enter'){e.preventDefault();palEscolhe(PAL.i)}
  };
  /* foco preso: Tab alterna entre a busca e o botão Fechar; Esc fecha */
  p.onkeydown=e=>{
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();palFecha()}
    else if(e.key==='Tab'){const f=[inp,p.querySelector('[data-pal-x]')],i=f.indexOf(document.activeElement);e.preventDefault();f[(i+(e.shiftKey?-1:1)+f.length)%f.length].focus()}
  };
  p.onmousedown=e=>{if(e.target===p)palFecha()};
  lista.onmousedown=e=>e.preventDefault();
  lista.onclick=e=>{const o=e.target.closest('[data-i]');if(o)palEscolhe(+o.dataset.i)};
  p.querySelector('[data-pal-x]').onclick=()=>palFecha();
  palPinta();inp.focus();
}
document.addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&!e.altKey&&(e.key==='k'||e.key==='K')){
    if(V!=='admin'||!A.auth)return;
    e.preventDefault();if(PAL.aberta)palFecha();else pnPaletaAbre(document.activeElement);
  }
});
