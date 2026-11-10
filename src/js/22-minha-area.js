/* ====== Casca da Minha área (direção C): menu agrupado, barra de topo, barra inferior no celular ====== */
const PN_SVG=p=>'<svg class="pn-ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+p+'</svg>';
const PN_ICONES={
  dash:PN_SVG('<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>'),
  '':PN_SVG('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><path d="M16 4.7a3.5 3.5 0 010 6.6M18 14.8c2 .6 3.2 2.3 3.5 5.2"/>'),
  cap:PN_SVG('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>'),
  studio:PN_SVG('<rect x="3" y="4.5" width="18" height="15" rx="2.5"/><path d="M3 9h18M7 6.8h.01M10 6.8h.01"/>'),
  posts:PN_SVG('<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="9" cy="9" r="1.6"/><path d="M4 17l5-5 4 4 2-2 5 5"/>'),
  demandas:PN_SVG('<rect x="3.5" y="4" width="4.5" height="16" rx="1.5"/><rect x="9.8" y="4" width="4.5" height="10" rx="1.5"/><rect x="16" y="4" width="4.5" height="13" rx="1.5"/>'),
  vagas:PN_SVG('<rect x="3" y="7.5" width="18" height="12.5" rx="2.5"/><path d="M9 7.5V6a2 2 0 012-2h2a2 2 0 012 2v1.5M3 13h18"/>'),
  trk:PN_SVG('<path d="M3 12h4l2.5-6.5 4 13 2.5-6.5h5"/>'),
  assistente:PN_SVG('<path d="M12 3.5l1.7 4.8 4.8 1.7-4.8 1.7L12 16.5l-1.7-4.8L5.5 10l4.8-1.7z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>'),
  kb:PN_SVG('<path d="M5 4.5A1.5 1.5 0 016.5 3H19v15H6.5A1.5 1.5 0 005 19.5z"/><path d="M5 19.5A1.5 1.5 0 006.5 21H19v-3M9 7.5h6"/>'),
  ias:PN_SVG('<rect x="6.5" y="6.5" width="11" height="11" rx="2"/><path d="M9.5 3v3.5M14.5 3v3.5M9.5 17.5V21M14.5 17.5V21M3 9.5h3.5M3 14.5h3.5M17.5 9.5H21M17.5 14.5H21"/>'),
  pub:PN_SVG('<path d="M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 014 18.5v-11A1.5 1.5 0 015.5 6H10"/>'),
  busca:PN_SVG('<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/>'),
  sino:PN_SVG('<path d="M6 16.5V11a6 6 0 0112 0v5.5l1.5 2h-15z"/><path d="M10 21h4"/>'),
  ajuda:PN_SVG('<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 114 2c-.9.6-1.6 1-1.6 2.1M12 16.8h.01"/>'),
  mais:PN_SVG('<circle cx="5.5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18.5" cy="12" r="1.3"/>'),
  menu:PN_SVG('<path d="M4 7h16M4 12h16M4 17h16"/>')
};
const PN_GRUPOS=[
  ['Visão geral',[['dash','Dashboard'],['','Leads'],['cap','Captar clientes']]],
  ['Ferramentas',[['studio','Site Studio'],['posts','Posts'],['demandas','Demandas'],['vagas','Vagas']]],
  ['Acompanhamento',[['trk','Acompanhamento']]],
  ['Inteligência artificial',[['assistente','Assistente por setor'],['kb','Base da IA'],['ias','IAs']]]
];
const PN_BARRA=[['dash','Início'],['','Leads'],['cap','Captar'],['trk','Projetos']];
const PN_NOMES={dash:'Dashboard','':'Leads',cap:'Captar clientes',studio:'Site Studio',posts:'Posts',demandas:'Demandas','arte-demanda':'Arte da demanda',vagas:'Vagas',trk:'Acompanhamento',assistente:'Assistente por setor',kb:'Base da IA',ias:'IAs'};
const pnAtivo=()=>{const v=A.view||'';return v==='arte-demanda'?'demandas':v};
const pnContagem=v=>{
  try{
    if(v==='')return getL().filter(l=>!l.arq&&l.status==='novo').length;
    if(v==='demandas')return OR_QUADRO.itens.filter(d=>!d.arquivada&&d.coluna!=='Concluídas').length;
  }catch(e){}
  return 0;
};
const pnIniciais=()=>{const n=String(typeof RESPONSAVEL==='string'?RESPONSAVEL:'').trim();if(!n)return 'OR';const p=n.split(/\s+/);return ((p[0]||'')[0]+(p.length>1?p[p.length-1][0]:'')).toUpperCase()};
/* troca de tela: os mesmos zeramentos de antes, por estado (nunca por #hash) */
function pnIr(v){
  v=v||'';
  if(v==='trk'){T.id=null;T.msg=''}
  else if(v==='cap'){CAP.id=null;CAP.err='';CAP.msg=''}
  else if(v==='studio'){SS.id=null;SS.err='';SS.msg=''}
  else if(v==='vagas'){A.vgc=null;A.vgTab=null}
  A.view=v;pnFechaMenu(true);admin();
  const m=document.querySelector('.mainc');if(m){try{m.focus({preventScroll:true})}catch(e){}}
  window.scrollTo(0,0);
}
function pnItem(v,t,cls){
  const on=pnAtivo()===v,n=pnContagem(v);
  return `<button type="button" class="${cls||'pn-i'}${on?' on':''}" data-pn="${esc(v)}"${on?' aria-current="page"':''}>${PN_ICONES[v]}<span class="pn-t">${esc(t)}</span>${n?`<span class="pn-c" aria-label="${n} ${v===''?'novo(s)':'em aberto'}">${n}</span>`:''}</button>`;
}
function pnAlertas(){try{return alertas(dashCalc()).length}catch(e){return 0}}
function admShell(inner){
  const v=A.view||'',atual=PN_NOMES[v]||'',nal=pnAlertas();
  const crumb=v==='arte-demanda'?`<button type="button" class="pn-bc-l" data-pn="demandas">Demandas</button><span class="pn-bc-s" aria-hidden="true">/</span><span aria-current="page">Arte da demanda</span>`:`<span aria-current="page">${esc(atual)}</span>`;
  const mais=[['studio','Site Studio'],['posts','Posts'],['demandas','Demandas'],['vagas','Vagas'],['assistente','Assistente por setor'],['kb','Base da IA'],['ias','IAs']];
  const naBarra=PN_BARRA.map(x=>x[0]).includes(pnAtivo());
  return `<div class="pn">
  <aside class="pn-side" aria-label="Menu da Minha área">
   <button type="button" class="brandb pn-brand" data-nav="pub" aria-label="Ver site público">${logo}<span class="wmw"><span class="wm">Marketing digital</span><span class="wt">Painel</span></span></button>
   <nav class="pn-nav" aria-label="Seções da Minha área">${PN_GRUPOS.map(([g,its],i)=>`<div class="pn-g" role="group" aria-labelledby="pn-g${i}"><span class="pn-gt" id="pn-g${i}">${esc(g)}</span>${its.map(([k,t])=>pnItem(k,t)).join('')}</div>`).join('')}</nav>
  </aside>
  <div class="pn-col">
   ${window.OR_TESTE?'<p class="err pn-teste" role="note">Build de TESTE com a chave da IA embutida. Não publique nem envie este arquivo.</p>':''}
   <header class="pn-top">
    <button type="button" class="pn-ib pn-menub" data-pn-mais aria-label="Abrir o menu" aria-controls="pn-menu" aria-expanded="false">${PN_ICONES.menu}</button>
    <div class="pn-bcw"><nav class="pn-bc" aria-label="Você está em"><button type="button" class="pn-bc-l pn-bc-raiz" data-pn="dash">Minha área</button><span class="pn-bc-s" aria-hidden="true">/</span>${crumb}</nav><div id="savebar" class="savebar" role="status"></div></div>
    <button type="button" class="pn-busca" data-pn-paleta aria-haspopup="dialog" aria-label="Buscar lead ou ir para uma tela (Ctrl+K)">${PN_ICONES.busca}<span class="pn-busca-t">Buscar lead ou ir para uma tela</span><kbd>Ctrl</kbd><kbd>K</kbd></button>
    <button type="button" class="pn-ib pn-busca-ib" data-pn-paleta aria-haspopup="dialog" aria-label="Buscar lead ou ir para uma tela">${PN_ICONES.busca}</button>
    <button type="button" class="pn-ib" id="pn-sino" aria-label="Avisos: ${nal?nal+' que precisam de atenção':'nenhum no momento'}" data-pn="dash">${PN_ICONES.sino}${nal?'<span class="pn-ponto" aria-hidden="true"></span>':''}</button>
    <button type="button" class="pn-ib pn-ajuda" id="pn-ajuda" aria-label="Ajuda: atalhos e como a IA trabalha">${PN_ICONES.ajuda}</button>
    <div class="pn-av-w"><button type="button" class="pn-av" id="pn-av" aria-expanded="false" aria-controls="pn-menu" aria-label="Menu da conta"><span aria-hidden="true">${esc(pnIniciais())}</span></button>
     <div class="pn-menu" id="pn-menu" role="group" aria-label="Menu da conta" hidden>
      <div class="pn-m-mais"><span class="pn-gt">Mais telas</span>${mais.map(([k,t])=>pnItem(k,t,'pn-mi')).join('')}</div>
      <div class="pn-m-conta"><button type="button" class="pn-mi" data-nav="pub">${PN_ICONES.pub}<span class="pn-t">Ver site público</span></button></div>
     </div></div>
   </header>
   <div id="savebad" class="savebad" role="alert" hidden></div>
   <main class="mainc" tabindex="-1">${inner}</main>
  </div>
  <nav class="pn-bar" aria-label="Atalhos">${PN_BARRA.map(([k,t])=>`<button type="button" class="pn-bi${pnAtivo()===k?' on':''}" data-pn="${k}"${pnAtivo()===k?' aria-current="page"':''}>${PN_ICONES[k]}<span>${esc(t)}</span></button>`).join('')}<button type="button" class="pn-bi${naBarra?'':' on'}" data-pn-mais aria-controls="pn-menu" aria-expanded="false">${PN_ICONES.mais}<span>Mais</span></button></nav>
  <div class="pn-veu" hidden></div>
  </div>`;
}
/* menu da conta (computador) e folha "Mais" (celular) são o mesmo elemento */
const PN={gatilho:null};
function pnFechaMenu(semFoco){
  const m=document.getElementById('pn-menu');if(!m||m.hidden)return;
  m.hidden=true;document.body.classList.remove('pn-folha');m.setAttribute('role','group');m.setAttribute('aria-label','Menu da conta');m.removeAttribute('aria-modal');
  const veu=document.querySelector('.pn-veu');if(veu)veu.hidden=true;
  document.querySelectorAll('#pn-av,[data-pn-mais]').forEach(b=>b.setAttribute('aria-expanded','false'));
  if(!semFoco&&PN.gatilho&&PN.gatilho.isConnected)PN.gatilho.focus();
}
function pnAbreMenu(gatilho){
  const m=document.getElementById('pn-menu');if(!m)return;
  PN.gatilho=gatilho;m.hidden=false;
  const mob=matchMedia('(max-width:860px)').matches;
  document.body.classList.toggle('pn-folha',mob);
  /* na folha do celular o resto da tela fica coberto e o foco fica preso: é um diálogo modal; no computador é só um grupo de botões */
  if(mob){m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Mais telas e conta')}
  const veu=document.querySelector('.pn-veu');if(veu)veu.hidden=!mob;
  document.querySelectorAll('#pn-av,[data-pn-mais]').forEach(b=>b.setAttribute('aria-expanded',b===gatilho?'true':'false'));
  const p=[...m.querySelectorAll('button')].filter(b=>b.offsetParent!==null)[0];if(p)p.focus();
}
/* sino: leva até o cartão "Precisa de atenção" do Dashboard (sem animação se o usuário pediu menos movimento) */
function pnVaiAtencao(){
  const s=document.getElementById('pd-atencao');if(!s)return;
  s.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  try{s.focus({preventScroll:true})}catch(e){}
}
function pnAjudaDlg(){
  const m=dlg('Ajuda','<h3>Ajuda</h3><p class="hint">Atalhos: Ctrl+K abre a busca de leads e telas; Esc fecha janelas e menus; Tab percorre os controles.</p><p class="hint">A IA só trabalha quando você clica em um botão de gerar. Nada é enviado ao cliente sem a sua revisão.</p><div class="row"><button type="button" class="btn" data-ok>Entendi</button></div>');
  m.querySelector('[data-ok]').onclick=()=>m.remove();
}
function bindShell(){
  document.querySelectorAll('[data-pn]').forEach(b=>b.onclick=()=>pnIr(b.dataset.pn));
  document.querySelectorAll('[data-pn-paleta]').forEach(b=>b.onclick=()=>pnPaletaAbre(b));
  const alterna=b=>{const m=document.getElementById('pn-menu');if(m&&!m.hidden&&PN.gatilho===b)pnFechaMenu();else{pnFechaMenu(true);pnAbreMenu(b)}};
  const av=document.getElementById('pn-av');if(av)av.onclick=()=>alterna(av);
  document.querySelectorAll('[data-pn-mais]').forEach(b=>b.onclick=()=>alterna(b));
  const sn=document.getElementById('pn-sino');if(sn)sn.onclick=()=>{if(A.view!=='dash')pnIr('dash');pnVaiAtencao()};
  const aj=document.getElementById('pn-ajuda');if(aj)aj.onclick=pnAjudaDlg;
  const veu=document.querySelector('.pn-veu');if(veu)veu.onclick=()=>pnFechaMenu();
  const m=document.getElementById('pn-menu');
  if(m)m.onkeydown=e=>{
    const bs=[...m.querySelectorAll('button')].filter(b=>b.offsetParent!==null),i=bs.indexOf(document.activeElement);
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();pnFechaMenu()}
    else if(e.key==='ArrowDown'){e.preventDefault();bs[(i+1)%bs.length].focus()}
    else if(e.key==='ArrowUp'){e.preventDefault();bs[(i-1+bs.length)%bs.length].focus()}
    else if(e.key==='Home'){e.preventDefault();bs[0].focus()}
    else if(e.key==='End'){e.preventDefault();bs[bs.length-1].focus()}
    else if(e.key==='Tab'){
      /* a folha do celular prende o foco; o menu do computador fecha ao sair */
      if(document.body.classList.contains('pn-folha')){if(e.shiftKey&&i<=0){e.preventDefault();bs[bs.length-1].focus()}else if(!e.shiftKey&&i===bs.length-1){e.preventDefault();bs[0].focus()}}
      else{
        /* menu do computador: Tab fecha e o foco volta ao avatar; a partir dele o navegador segue para o elemento seguinte (Shift+Tab: o anterior) */
        const g=PN.gatilho;pnFechaMenu(true);
        if(g&&g.isConnected){g.focus();if(e.shiftKey)e.preventDefault()}
      }}
  };
  pintaSave();
}
document.addEventListener('mousedown',e=>{const m=document.getElementById('pn-menu');if(!m||m.hidden)return;if(e.target.closest('#pn-menu,#pn-av,[data-pn-mais]'))return;pnFechaMenu(true)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!document.querySelector('.modal')){const m=document.getElementById('pn-menu');if(m&&!m.hidden)pnFechaMenu()}});
/* exportar os leads em CSV (botão do Dashboard) */
const leadsCsv=()=>dl('leads.csv','nome,whatsapp,email,area,status,data\n'+getL().map(l=>[l.nome,l.whats,l.email,svcName(l),l.status,l.data].map(csvSafe).join(',')).join('\n'),'text/csv');
function admin(){
  if(!A.auth){
    /* bloqueio por PIN: nada da área logada pode ficar na tela (busca Ctrl+K, menu da conta, folha Mais, janelas abertas) */
    palFecha(true);pnFechaMenu(true);document.body.classList.remove('pn-folha','pal-aberta');
    document.querySelectorAll('.modal').forEach(m=>m.remove());
    setApp(`<main class="pinw" tabindex="-1"><div class="pin panel"><h1 class="pinh">Minha área</h1><p class="hint">Digite o seu PIN para entrar.</p><label for="pin">PIN</label><input id="pin" type="password" autocomplete="off">
    <div class="row"><button class="btn" id="ok">Entrar</button><button class="btn ghost" data-nav="pub">Voltar ao site</button></div><p class="hint" id="er" role="alert"></p></div></main>`);
    const t=async()=>{const r=await pinOk($('#pin').value);if(r===true){A.auth=true;lastAct=Date.now();admin();if(!CFG.pinh)setTimeout(()=>trocarPin(true),200)}else{$('#er').textContent=r==='wait'?'Muitas tentativas. Aguarde '+Math.ceil((pinLock.until-Date.now())/1000)+' s.':'PIN incorreto.';$('#pin').value='';$('#pin').focus()}};
    $('#ok').onclick=t;$('#pin').onkeydown=e=>{if(e.key==='Enter')t()};$('#pin').focus();return;
  }
  if(A.view==='demandas'){setApp(admShell(orQuadroInner()));bindShell();return orQuadroBind()}
  if(A.view==='arte-demanda'){setApp(admShell(orQuadroArteInner()));bindShell();return reaArteBind(document.querySelector('.mainc'),'demanda:'+OR_QUADRO.aberta)}
  if(A.view==='assistente'){setApp(admShell(orAssistInner()));bindShell();return orAssistBind()}
  if(A.view==='dash'){setApp(admShell(dashInner()));bindShell();return bindDash()}
  if(A.view==='vagas'){setApp(admShell(vagasInner()));bindShell();return bindVagas()}
  if(A.view==='posts'){setApp(admShell(postsInner()));bindShell();return reaPostsBind()}
  if(A.view==='trk'){setApp(admShell('<div id="trk"></div>'));bindShell();return trkPaint()}
  if(A.view==='cap'){setApp(admShell('<div id="cap"></div>'));bindShell();return capPaint()}
  if(A.view==='studio'){setApp(admShell('<div id="studio"></div>'));bindShell();return ssPaint()}
  if(A.view==='kb'){setApp(admShell(kbInner()));bindShell();return bindKb()}
  if(A.view==='ias'){setApp(admShell(iasInner()));bindShell();return bindIas()}
  setApp(admShell(`<h2 class="pt">Leads</h2><p class="hint">Quando um briefing chega, ele aparece aqui. A IA só trabalha quando você clica: abra o lead e use "Gerar tudo com a IA".</p>${storeWarn()}<div id="sts"></div>
  <select id="flt" style="max-width:220px" aria-label="Filtrar por status">${['todos','novo','pronto','aprovado','aplicado','recusado'].map(s=>`<option value="${s}" ${A.filter===s?'selected':''}>${stl(s)}</option>`).join('')}</select>
  <div class="adm-g"><div class="list" id="lst"></div><div id="det"></div></div>`));
  bindShell();$('#flt').onchange=e=>{A.filter=e.target.value;paintList()};
  paintList();paintDet();
}
function paintList(){
  const L=getL(),c=s=>L.filter(l=>l.status===s).length,vis=A.filter==='todos'?L:L.filter(l=>l.status===A.filter);
  A.sig=sig();
  const st=document.getElementById('sts');
  if(st)st.innerHTML=`<div class="stats">${[['novo','novos','--c:var(--st-novo)'],['pronto','prontos para revisar','--c:var(--st-pronto)'],['aprovado','aprovados','--c:var(--st-aprovado)'],['aplicado','em execução','--c:var(--st-aplicado)']].map(([k,t,s])=>`<div class="sc" style="${s}"><b>${c(k)}</b><span>${t}</span></div>`).join('')}</div>`;
  const ls=document.getElementById('lst');if(!ls)return;
  ls.innerHTML=vis.length?vis.map(l=>`<button class="it ${l.status} ${l.id===A.sel?'on':''}" data-i="${esc(l.id)}"><b>${esc(l.nome)}</b><span class="chip ${l.status}">${stl(l.status)}</span>${(l.envios||[]).length?'<span class="wsent" title="Orçamento enviado no WhatsApp">'+WAI+'enviado</span>':''}<br><span class="hint">${svcIc(l)} ${svcName(l)} · ${esc(l.data)}</span></button>`).join(''):'<p class="hint">Nenhum lead aqui ainda. Abra o site público em outra aba e faça um briefing.</p>';
  ls.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{A.sel=b.dataset.i;A.edit=false;A.err='';A.fs=false;paintList();paintDet()});
}
function paintDet(){
  if(A.view==='trk'){trkPaint();return}
  const el=document.getElementById('det');if(!el)return;
  const l=getL().find(x=>x.id===A.sel);
  const sp=l&&ssPorLead(l.id);
  el.innerHTML=(sp?`<div class="panel row" style="margin-bottom:12px"><span class="hint">Este lead tem um projeto no Site Studio: ${esc(sp.nome)}.</span><button type="button" class="btn ghost" id="sslk">Abrir o projeto no Site Studio</button></div>`:'')+(l?detail(l):'<div class="panel hint">Escolha um lead na lista.</div>');if(l)bind(l);
  if(sp&&document.getElementById('sslk'))document.getElementById('sslk').onclick=()=>{A.view='studio';SS.id=sp.id;SS.js='';SS.err='';SS.msg='';admin()};
}
function paneHtml(l,o,h){
  const wait=t=>`<p class="hint">${t}</p>`;
  if(A.tab==='exec')return execPane(l);
  if(A.tab==='brief')return `<div class="qa">${qaOf(l).map(x=>`<p><b>${esc(x.q)}</b><br>${esc(x.a||'—')}</p>`).join('')}</div>`;
  if(A.tab==='ficha'){
    if(mineJ('orc',l)&&J.orc.what==='ficha')return md(J.orc.live)||wait('A IA está lendo o briefing…');
    return `<p class="hint">Este é o resumo que a IA fez do briefing. Confira se ela entendeu certo: se algo estiver errado, corrija aqui e todo o resto (orçamento, estratégia, execução e mensagem) passa a usar este resumo como verdade.</p><textarea id="fic" style="min-height:260px">${esc(l.ficha||'')}</textarea>`;
  }
  if(A.tab==='plano'){
    if(A.edit&&l.entrega)return `<textarea id="txt">${esc(l.entrega)}</textarea>`;
    if(mineJ('plano',l))return md(J.plano.live)||wait('A IA está pensando…');
    if(h&&A.sub==='prev')return `<iframe id="pv" sandbox="allow-scripts" title="Preview do site"></iframe>`;
    return l.entrega?md(l.entrega):wait('Ainda não gerado. Clique em "Gerar plano com IA".');
  }
  if(A.tab==='orc'){
    if(mineJ('orc',l)&&J.orc.what==='orc')return md(J.orc.live.replace(/---(BASICO|MEDIO|MAX|MENSAGEM)---/g,(x,k)=>'\n## '+LBL[k]+'\n'))||wait('A IA está pensando…');
    if(o.BASICO||o.MEDIO||o.MAX)return `<div class="tiers">${['BASICO','MEDIO','MAX'].map(k=>o[k]?`<div class="tier"><h3>${LBL[k]}</h3>${md(o[k])}</div>`:'').join('')}</div>`;
    return l.orc?md(l.orc):wait('Ainda não gerado. Clique em "Gerar 3 orçamentos + mensagem".');
  }
  if(mineJ('orc',l))return J.orc.what==='msg'?(md(J.orc.live)||wait('Reescrevendo…')):wait('A mensagem aparece aqui quando os orçamentos terminarem…');
  return l.msg?`<textarea id="msg">${esc(l.msg)}</textarea>`:wait('A mensagem é gerada junto com os orçamentos.');
}
function actions(l,h){
  const dp=J.plano.on?'disabled':'',dq=J.orc.on?'disabled':'',done=l.entrega&&!J.plano.on;
  if(A.tab==='plano')return `<div class="row" style="margin-top:12px"><button class="btn" id="gen" ${dp}>${l.entrega?'Gerar de novo':'Gerar plano com IA'}</button>${done?`<button class="btn ghost" id="ed">${A.edit?'Ver':'Editar'}</button><button class="btn ghost" id="cp">Copiar</button>${h?`<button class="btn ghost" id="sb">${A.sub==='prev'?'Ver código':'Ver preview'}</button><button class="btn ghost" id="dh">Baixar site</button>`:''}<button class="btn ghost" id="fs">Ler em tela cheia</button>`:''}</div>`;
  if(A.tab==='orc')return `<div class="row" style="margin-top:12px"><button class="btn" id="orc" ${dq}>${l.orc?'Gerar orçamentos de novo':'Gerar 3 orçamentos + mensagem'}</button><button class="btn ghost" id="fs">Ler em tela cheia</button></div>`;
  if(A.tab==='ficha')return `<div class="row" style="margin-top:12px"><button class="btn" id="ficgo" ${dq}>${l.ficha?'Gerar de novo':'Gerar resumo'}</button>${l.ficha?`<button class="btn ok" id="redo" ${dq}>Refazer orçamentos com este resumo</button>`:''}</div>`;
  if(A.tab==='exec')return `<div class="row" style="margin-top:12px"><button class="btn" id="exall" ${J.ex.on?'disabled':''}>Gerar tudo da execução</button><button class="btn ghost" id="fs">Ler em tela cheia</button></div>`;
  if(A.tab==='msg')return `<div class="row" style="margin-top:12px">${l.msg&&!J.orc.on?`<button class="btn wa" id="wm">${WAI} Enviar no WhatsApp</button>`+'<button class="btn ghost" id="em">Enviar por e-mail</button><button class="btn ghost" id="cm">Copiar mensagem</button><button class="btn ghost" id="fs">Ler em tela cheia</button>':''}<button class="btn ${l.msg?'ghost':''}" id="orc" ${dq}>${l.msg?'Gerar de novo':'Gerar orçamentos + mensagem'}</button></div>`;
  return `<div class="row" style="margin-top:12px"><button class="btn ghost" id="fs">Ler em tela cheia</button></div>`;
}
/* Estratégia e execução: geradas no Acompanhamento (depois que o cliente fecha), com os mesmos botões e o mesmo painel de leitura do lead. */
function detMini(l,tab){
  A.sel=l.id;A.tab=tab;const o=parseOrc(l.orc||''),h=isSite(l)?htmlOf(l.entrega):'';
  return `<div class="stat" id="stat">${esc(statLine())}</div>${A.err?`<div class="err">${esc(A.err)}</div>`:''}${actions(l,h)}<div class="pane ${A.fs?'fs':''}" id="pane" role="tabpanel" aria-labelledby="dtb-${A.tab}">${paneHtml(l,o,h)}</div>${A.fs?'<button class="btn fsx" id="fsx">Fechar leitura (Esc)</button>':''}${covWarn(l)}${fixRow(l)}`;
}
function detail(l){
  const o=parseOrc(l.orc||''),h=isSite(l)?htmlOf(l.entrega):'';
  const tabs=[['brief','Briefing'],['ficha','Resumo'+(l.ficha?IC.feito:'')],['orc','Orçamentos'+(l.orc?IC.feito:'')],['msg','Mensagem'+(l.msg?IC.feito:'')]];
  if(!tabs.some(([k])=>k===A.tab))A.tab='orc';
  return `<div class="panel dt"><div class="dthead"><div><h3>${esc(l.nome)} <span class="chip ${l.status}">${stl(l.status)}</span></h3>
  <p class="hint">${svcIc(l)} ${svcName(l)} · ${esc(l.whats)}${(l.envios||[]).length?' · <b>orçamento enviado '+(l.envios.slice(-1)[0].via==='email'?'por e-mail':'no WhatsApp')+' em '+esc(l.envios.slice(-1)[0].quando)+'</b>':''} ${l.email?'· '+esc(l.email):''}</p>${planosCards(l)}${briefPainel(l)}${rvPainel(l)}${rgpPainel(l)}${l.guia?'<p class="hint"><b>Veio do roteiro "ainda não sei o que preciso".</b> Os serviços foram sugeridos pelo app; confirme com o cliente antes de enviar o orçamento.</p>':''}</div>
  <div class="row" style="margin:0">${!l.orc&&l.status!=='recusado'?`<button class="btn hl" id="gall" ${anyBusy()?'disabled':''}>${l.ficha?'Gerar o orçamento com a IA':'Gerar resumo e orçamento com a IA'}</button>`:''}${l.msg?`<button class="btn wa" id="wsend">${WAI} Enviar orçamento no WhatsApp</button><button class="btn ghost" id="emsend">Enviar por e-mail</button>`:''}${(l.entrega||l.orc)&&!['aprovado','aplicado','recusado'].includes(l.status)?'<button class="btn ok" id="ap">Aprovar</button><button class="btn ghost" id="rec">Marcar como recusado</button>':''}${l.status==='recusado'?'<button class="btn ghost" id="reab">Reabrir</button>':''}<button class="btn ghost" id="lgx">Exportar dados (LGPD)</button><button class="btn ghost" id="lgd">Apagar cliente</button></div></div>
  <div class="tabs" role="tablist">${tabs.map(([k,t])=>`<button class="tab ${A.tab===k?'on':''}" data-t="${k}" role="tab" id="dtb-${k}" aria-controls="pane" aria-selected="${A.tab===k}">${t}</button>`).join('')}</div>
  <p class="hint plsel"><label>Plano escolhido pelo cliente <select id="plsel"><option value="">ainda não escolheu</option>${Object.entries(PLANO_NOME).map(([k,t])=>`<option value="${k}" ${l.plano===k?'selected':''}>${t}</option>`).join('')}</select></label>${l.planoEm?' · registrado em '+esc(dHora(Date.parse(l.planoEm)||Date.now())):''}</p>
  <div class="stat" id="stat">${esc(statLine())}</div>
  ${A.err?`<div class="err">${esc(A.err)}</div>`:''}
  ${actions(l,h)}
  <div class="pane ${A.fs?'fs':''}" id="pane" role="tabpanel" aria-labelledby="dtb-${A.tab}">${paneHtml(l,o,h)}</div>${A.fs?'<button class="btn fsx" id="fsx">Fechar leitura (Esc)</button>':''}${covWarn(l)}${fixRow(l)}${fimLead(l)}</div>`;
}
const fimLead=l=>['novo','pronto','aprovado'].includes(l.status)?'<div class="dfim"><div><b>O cliente fechou?</b><span class="hint">Confirme o pacote, o valor e o início para levar o cliente ao acompanhamento.</span></div><button class="btn hl" id="ay">Cliente fechou: ir para o acompanhamento</button></div>':l.status==='aplicado'?'<div class="dfim"><div><b>Cliente em execução</b><span class="hint">Entregas, produção, campanhas e métricas ficam no acompanhamento.</span></div><button class="btn hl" id="ao">Abrir acompanhamento</button></div>':'';
function bind(l){
  const g=id=>document.getElementById(id),rp=()=>{paintList();paintDet()};
  document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{A.tab=b.dataset.t;A.edit=false;paintDet()});
  bindExec(l);rvBind(l);rgpBind(l);
  if(g('fic'))g('fic').onchange=()=>upd(l.id,{ficha:g('fic').value.trim(),fichaOk:true});
  if(g('ficgo'))g('ficgo').onclick=()=>ficha(l.id);
  if(g('gall'))g('gall').onclick=()=>gerarTudo(l.id);
  if(g('redo'))g('redo').onclick=()=>orc(l.id);
  if(g('fixgo'))g('fixgo').onclick=()=>{const v=g('fixt').value.trim();if(!v)return g('fixt').focus();
    CFG.kb=CFG.kb||{};const L=CFG.kb.licoes=CFG.kb.licoes||[];L.push({k:A.tab,txt:v,...(g('fixk').checked?{}:{cli:l.nome})});if(L.length>100)L.shift();CFG.t=Date.now();saveCfg();diskSaveSoon();
    ({ficha:()=>ficha(l.id,v),plano:()=>gen(l.id,v),exec:()=>execGen(l.id,g('fixw').value,v),orc:()=>orc(l.id,v),msg:()=>msgGen(l.id,v)})[A.tab]()};
  if(g('pv'))g('pv').srcdoc=htmlOf(l.entrega);
  if(g('gen'))g('gen').onclick=()=>gen(l.id);
  if(g('orc'))g('orc').onclick=()=>orc(l.id);
  if(g('ap'))g('ap').onclick=()=>rgpAntesDeAprovar(l,()=>{upd(l.id,{status:'aprovado'});rp()});
  if(g('rec'))g('rec').onclick=()=>{upd(l.id,{status:'recusado'});rp()};
  if(g('reab'))g('reab').onclick=()=>{upd(l.id,{status:l.orc?'pronto':'novo'});rp()};
  if(g('plsel'))g('plsel').onchange=()=>{const v=g('plsel').value,em=new Date().toISOString();upd(l.id,{plano:v,planoEm:v?em:'',planoHist:v?[...(l.planoHist||[]),{plano:v,em}].slice(-20):(l.planoHist||[])});rp()};
  if(g('ay'))g('ay').onclick=()=>fecharDlg(l.id);
  if(g('ao'))g('ao').onclick=()=>{if(!l.track)return trkStart(l.id);A.view='trk';T.id=l.id;T.tab='geral';admin()};
  if(g('ed'))g('ed').onclick=()=>{if(A.edit&&g('txt'))upd(l.id,{entrega:g('txt').value});A.edit=!A.edit;paintDet()};
  if(g('sb'))g('sb').onclick=()=>{A.sub=A.sub==='prev'?'code':'prev';paintDet()};
  if(g('cp'))g('cp').onclick=()=>copiar(htmlOf(l.entrega)||l.entrega);
  if(g('dh'))g('dh').onclick=()=>dlHtml((l.nome.replace(/\W+/g,'-')||'site')+'.html',htmlOf(l.entrega));
  if(g('rf'))g('rf').onclick=()=>{const v=g('ref').value.trim();if(v)gen(l.id,v)};
  if(g('fs'))g('fs').onclick=()=>{A.fs=true;paintDet()};
  if(g('fsx'))g('fsx').onclick=()=>{A.fs=false;paintDet()};
  if(g('msg'))g('msg').onchange=()=>upd(l.id,{msg:g('msg').value});
  if(g('cm'))g('cm').onclick=()=>copiar(g('msg').value);
  if(g('wm'))g('wm').onclick=()=>{if(g('msg'))upd(l.id,{msg:g('msg').value});waOpen(l.id)};
  if(g('em'))g('em').onclick=()=>{if(g('msg'))upd(l.id,{msg:g('msg').value});emOpen(l.id)};
  if(g('wsend'))g('wsend').onclick=()=>waOpen(l.id);
  if(g('emsend'))g('emsend').onclick=()=>emOpen(l.id);
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&A.fs){A.fs=false;paintDet()}});
function live(kind,txt){
  const j=J[kind];j.live=txt;if(A.sel!==j.id||A.edit)return;
  const s=document.getElementById('stat');if(s)s.textContent=statLine();
  if(kind==='ex')return;
  if(A.tab!==(kind==='orc'?J.orc.what:kind))return;
  const p=document.getElementById('pane');if(!p)return;
  const nb=p.scrollHeight-p.scrollTop-p.clientHeight<160;
  p.innerHTML=(kind==='orc'&&J.orc.what==='orc'?md(txt.replace(/---(BASICO|MEDIO|MAX|MENSAGEM)---/g,(x,k)=>'\n## '+LBL[k]+'\n')):md(txt))||'<p class="hint">A IA está pensando…</p>';
  if(nb)p.scrollTop=p.scrollHeight;
}
