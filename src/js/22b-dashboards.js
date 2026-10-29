/* ====== Dashboards da Minha área: tudo calculado dos leads e acompanhamentos salvos (nenhum número fictício) ====== */
const PLANO_NOME={basico:'Essencial',medio:'Crescimento',max:'Completo'};
const SAVE={at:0,ok:true};
const DASH={dias:30,status:'',svc:'',plano:'',q:'',ord:'recentes'};
const leadT=l=>{const n=parseInt(l.id,36);return n>1e12&&n<4e12?n:(l.t||0)};
const dHora=t=>{const d=new Date(t);return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+' '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})};

/* indicador de salvamento: confirma que gravou de verdade ou avisa que não */
function pintaSave(){
  const el=document.getElementById('savebar');if(!el)return;
  if(!SAVE.at){el.className='savebar';el.textContent='';return}
  el.className='savebar'+(SAVE.ok?' ok':' bad');
  el.textContent=SAVE.ok?'Salvo neste navegador às '+new Date(SAVE.at).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}):'NÃO SALVO: o armazenamento do navegador está cheio ou bloqueado. Baixe o backup antes de fechar esta aba.';
}

/* registro de atividades (a partir de agora): quem fez o quê e quando */
const ativGet=()=>{try{const a=JSON.parse(sget('ativ2')||'[]');return Array.isArray(a)?a.filter(x=>x&&typeof x.t==='number'&&typeof x.txt==='string'):[]}catch(e){return[]}};
const ativAdd=(tipo,txt,id)=>{
  const a=ativGet(),r={t:Date.now(),tipo,txt:String(txt).slice(0,200),id:String(id||'').slice(0,24),por:'Você'},u=a[0];
  if(u&&u.tipo===r.tipo&&u.id===r.id&&r.t-u.t<600000&&(tipo==='mensagem'||tipo==='orcamento'))return;
  a.unshift(r);sset('ativ2',JSON.stringify(a.slice(0,400)));
};
function ativLog(l,p){
  try{
    if(!p)return;
    if(p.status&&p.status!==l.status)ativAdd('status',l.nome+': '+stl(l.status)+' → '+stl(p.status),l.id);
    if(p.orc&&p.orc!==l.orc)ativAdd('orcamento','Orçamentos gerados para '+l.nome,l.id);
    if(p.msg&&p.msg!==l.msg)ativAdd('mensagem','Mensagem de WhatsApp gerada ou editada para '+l.nome,l.id);
    if(Array.isArray(p.envios)&&p.envios.length>(l.envios||[]).length)ativAdd('envio','Orçamento enviado no WhatsApp para '+l.nome,l.id);
    if(p.plano&&p.plano!==l.plano)ativAdd('plano','Plano '+(PLANO_NOME[p.plano]||p.plano)+' registrado para '+l.nome,l.id);
    if(p.track&&!l.track)ativAdd('projeto','Acompanhamento iniciado para '+l.nome,l.id);
  }catch(e){}
}

/* status do briefing de cada serviço (módulo) a partir das respostas salvas no lead */
function modStatus(l){
  const qa=l.qa||[],A=ansOf(qa.filter(x=>x.tp));
  if(!qa.some(x=>x.tp))return null;
  return svcs(l).filter(k=>k!=='guia'&&MODS[k]).map((k,i)=>{
    const topicos=MODS[k].qs.slice(0,-COMUM.length).filter(t=>(!t[5]||t[5](A))&&!(i&&BASE_Q.includes(t[0])));
    const resp=t=>qa.find(x=>x.tp&&(x.tp===k+':'+t[0]||(!i&&x.tp==='seed:'+t[0])||(DUPQ.has(t[0])&&x.tp.split(':')[1]===t[0])));
    const feitas=topicos.map(resp).filter(Boolean),falta=topicos.filter(t=>!resp(t)).map(t=>t[1]);
    const duvida=feitas.filter(x=>x.a==='Não informado').length;
    const st=!feitas.length?'pendente':falta.length?'em preenchimento':duvida?'precisa de esclarecimentos':'concluído';
    return {k,nome:CURTO[k]||MODS[k].name,st,total:topicos.length,feitas:feitas.length,duvida,falta};
  });
}
/* comparação dos pacotes: tudo vem da tabela de preços (calcOrc), nada da IA */
function planosCards(l){
  let C;try{C=calcOrc(l)}catch(e){return ''}
  if(!C||!C.sv||!C.sv.length)return '';
  const card=pk=>{const T=C.tiers[pk],multi=C.sv.length>1;
    const prazos=[...new Set(T.itens.filter(i=>i.e&&i.e.prazo).map(i=>(multi?(CURTO[i.k]||MODS[i.k].name)+': ':'')+i.e.prazo))];
    const itens=T.itens.map(it=>it.falta?'<li>'+esc(CURTO[it.k]||MODS[it.k].name)+': itens e valor a confirmar</li>':(it.e.inclui.length?it.e.inclui:[it.e.nome||'itens a confirmar']).map(x=>'<li>'+(multi?esc(CURTO[it.k]||MODS[it.k].name)+': ':'')+esc(x)+'</li>').join('')).join('');
    return `<div class="${l.plano===pk?'esc':''}">${l.plano===pk?'<span class="tg">escolhido pelo cliente</span>':''}<h4>${esc(PLANO_NOME[pk])}</h4><span class="vl">${T.inicio?rs(T.inicio):'a confirmar'}${T.ap?' <small>a partir de</small>':''}</span><small>para começar (implantação + 1º mês)</small><small>Implantação: ${T.setupF?rs(T.setupF)+' (uma vez)':'sem'} · Mensalidade: ${T.mensalF?rs(T.mensalF)+'/mês':'sem'}</small><small>Prazo: ${prazos.length?esc(prazos.join('; ')):'a confirmar'}</small><details><summary class="hint">O que inclui</summary><ul class="psv">${itens}</ul></details></div>`};
  return '<div class="plc" role="group" aria-label="Comparação dos pacotes">'+['basico','medio','max'].map(card).join('')+'</div><p class="hint">Valores da tabela de preços. Verba de anúncios (Google e Meta) é paga pelo cliente à plataforma e não está incluída. Condição de pagamento: a confirmar.'+(C.falta.length?' Itens sem valor na tabela ficam fora dos totais.':'')+'</p>';
}
function briefPainel(l){
  const ms=modStatus(l);
  if(!ms)return '<p class="hint">Este lead é anterior aos briefings por módulo: as respostas estão na aba do resumo, sem status por serviço.</p>';
  const abertos=ms.filter(m=>m.st!=='concluído');
  return `<div class="bmod"><h3 class="dsh-h">Briefing por serviço</h3><ul class="alr">${ms.map(m=>`<li><b>${esc(m.nome)}</b> <span class="chip ${m.st==='concluído'?'aprovado':m.st==='pendente'?'novo':'pronto'}">${esc(m.st)}</span><span class="hint">${m.feitas} de ${m.total} perguntas respondidas${m.duvida?', '+m.duvida+' marcadas como "não sei"':''}${m.falta.length?'. Falta: '+esc(m.falta.slice(0,3).join(' / ')):''}</span></li>`).join('')}</ul>${abertos.length?'<p class="hint"><b>Atenção:</b> há briefing incompleto ou com dúvidas. Confirme com o cliente antes de enviar um orçamento definitivo; os itens sem informação ficam "a confirmar".</p>':''}</div>`;
}

/* ---- cálculo (só dados reais) ---- */
function dashCalc(){
  const f=DASH,q=norm(f.q),lim=f.dias?Date.now()-f.dias*864e5:0,hoje=today(),todos=getL().filter(l=>!l.arq);
  const passa=(l,porPeriodo)=>(!porPeriodo||!lim||leadT(l)>=lim)&&(!f.status||l.status===f.status)&&(!f.svc||svcs(l).includes(f.svc))&&(!f.plano||l.plano===f.plano)&&(!q||norm(l.nome).includes(q));
  const B=todos.filter(l=>passa(l,true)),R={base:B};
  R.recebidos=B.length;
  R.pend=B.filter(l=>l.status==='novo'||l.status==='pronto').length;
  R.orc=B.filter(l=>l.orc).length;R.msg=B.filter(l=>l.msg).length;
  R.env=B.filter(l=>(l.envios||[]).length).length;
  R.apr=B.filter(l=>l.status==='aprovado'||l.status==='aplicado').length;
  R.rec=B.filter(l=>l.status==='recusado').length;
  R.exec=B.filter(l=>l.status==='aplicado').length;
  R.aguard=B.filter(l=>l.status==='aprovado').length;
  const ap=B.filter(l=>l.status==='aplicado'&&l.track);
  R.fin=ap.filter(l=>l.track.tarefas.length&&prog(l.track)===100).length;
  R.and=ap.length-R.fin;
  R.atr=ap.filter(l=>{const n=nextDue(l.track);return n&&n<hoje}).length;
  const ts=[];todos.filter(l=>l.track&&passa(l,false)).forEach(l=>l.track.tarefas.filter(x=>!x.done&&x.due).forEach(x=>ts.push({l,x})));
  ts.sort((a,b)=>a.x.due.localeCompare(b.x.due));R.tarefas=ts.slice(0,10);R.tarefasTotal=ts.length;
  const nd=Math.min(f.dias||90,90),cont={};for(let i=nd-1;i>=0;i--)cont[addDays(hoje,-i)]=0;
  B.forEach(l=>{const d=new Date(leadT(l)).toISOString().slice(0,10);if(d in cont)cont[d]++});
  R.porDia=Object.entries(cont);
  const sv={};B.forEach(l=>svcs(l).forEach(k=>{sv[k]=(sv[k]||0)+1}));R.porSvc=Object.entries(sv).sort((a,b)=>b[1]-a[1]);
  const ord={recentes:(a,b)=>leadT(b)-leadT(a),nome:(a,b)=>a.nome.localeCompare(b.nome,'pt-BR'),status:(a,b)=>STATUS_ORD(a.status)-STATUS_ORD(b.status)||leadT(b)-leadT(a)};
  R.lista=B.slice().sort(ord[f.ord]||ord.recentes);
  return R;
}
const STATUS_ORD=s=>['novo','pronto','aprovado','aplicado','recusado'].indexOf(s);

/* ---- peças visuais ---- */
function tabelaLeads(R){
  if(!R.lista.length)return '<p class="hint">Nenhum lead com esses filtros.</p>';
  return `<div class="tbw"><table class="tbl"><thead><tr><th>Cliente</th><th>Serviços</th><th>Status</th><th>Plano</th><th>Orçamento</th><th>Recebido</th></tr></thead><tbody>${R.lista.slice(0,40).map(l=>`<tr data-lead="${esc(l.id)}" tabindex="0" role="link" aria-label="Abrir ${esc(l.nome)}"><td><b>${esc(l.nome)}</b></td><td>${esc(svcs(l).map(k=>CURTO[k]||MODS[k].name).join(', '))}</td><td><span class="chip ${esc(l.status)}">${esc(stl(l.status))}</span></td><td>${l.plano?esc(PLANO_NOME[l.plano]):'<span class="hint">—</span>'}</td><td>${(l.envios||[]).length?'enviado':(l.orc?'gerado':'<span class="hint">—</span>')}</td><td>${esc(dHora(leadT(l)))}</td></tr>`).join('')}</tbody></table></div>${R.lista.length>40?`<p class="hint">Mostrando 40 de ${R.lista.length}. Use os filtros para refinar.</p>`:''}`;
}
function taxas(R){
  const dec=R.apr+R.rec,t={};
  t.aprov=dec>=3?{v:Math.round(R.apr/dec*100)+'%',nota:R.apr+' aprovados de '+dec+' decididos (aprovado ou recusado) no período'}:{v:'—',nota:'Poucos dados: só '+dec+' proposta(s) decidida(s) no período (mínimo 3)'};
  t.conv=R.recebidos>=5?{v:Math.round(R.apr/R.recebidos*100)+'%',nota:R.apr+' aprovados de '+R.recebidos+' leads recebidos no período'}:{v:'—',nota:'Poucos dados: só '+R.recebidos+' lead(s) no período (mínimo 5)'};
  return t;
}
function alertas(R){
  const hoje=today(),a=[],L=R.base,lim=Date.now()-3*864e5;
  L.filter(l=>l.status==='novo'&&!l.orc).forEach(l=>a.push({id:l.id,t:'Briefing recebido, orçamento ainda não gerado',n:l.nome}));
  L.filter(l=>l.status==='pronto'&&!(l.envios||[]).length).forEach(l=>a.push({id:l.id,t:'Orçamento pronto, ainda não enviado',n:l.nome}));
  L.filter(l=>l.status==='pronto'&&(l.envios||[]).length&&Date.parse(l.envios.slice(-1)[0].em)<lim).forEach(l=>a.push({id:l.id,t:'Enviado há mais de 3 dias, sem resposta registrada',n:l.nome}));
  L.filter(l=>l.status==='aplicado'&&l.track).forEach(l=>{const n=nextDue(l.track);if(n&&n<hoje)a.push({proj:l.id,t:'Projeto com tarefa atrasada',n:l.nome})});
  return a;
}
function bentoCard(cls,titulo,corpo){return `<section class="bn ${cls}"><h3 class="dsh-h">${titulo}</h3>${corpo}</section>`}
function numCard(cls,n,t,sub,c){return `<section class="bn ${cls}" style="--c:${c}"><span class="bn-t">${t}</span><b class="bn-n">${n}</b>${sub?`<span class="bn-s">${sub}</span>`:''}</section>`}
function graficoBento(par){
  const W=640,H=120,mx=Math.max(...par.map(p=>p[1]),1),st=W/par.length,bw=Math.max(2,Math.min(18,st*.7)),tot=par.reduce((a,p)=>a+p[1],0);
  if(!tot)return '<p class="hint">Ainda não há dados neste período.</p>';
  const dd=i=>{const p=par[i],q=i?par[i-1][1]:null;return fdate(p[0])+': '+p[1]+' lead(s)'+(q===null?'':(p[1]===q?', igual ao dia anterior':', '+(p[1]>q?'+':'')+(p[1]-q)+' em relação ao dia anterior'))};
  return `<svg viewBox="0 0 ${W} ${H}" class="gdia gbn" role="group" aria-label="Leads recebidos por dia, ${tot} no total. Use as setas do teclado para ler cada dia.">${par.map((p,i)=>{const h=Math.max(p[1]?3:1,Math.round(p[1]/mx*(H-24)));return `<rect x="${(i*st+(st-bw)/2).toFixed(1)}" y="${H-14-h}" width="${bw.toFixed(1)}" height="${h}" rx="2" tabindex="${i===par.length-1?0:-1}" data-i="${i}" data-d="${esc(dd(i))}"><title>${esc(dd(i))}</title></rect>`}).join('')}<line x1="0" y1="${H-13.5}" x2="${W}" y2="${H-13.5}" stroke="currentColor" opacity=".25"/><text x="0" y="${H}" class="gt">${esc(fdate(par[0][0]))}</text><text x="${W}" y="${H}" text-anchor="end" class="gt">${esc(fdate(par[par.length-1][0]))}</text></svg><p class="gcap hint" role="status" aria-live="polite">Passe o cursor ou use as setas sobre as barras para ver o dia.</p>`;
}
function funilLinks(R){
  const et=[['Leads recebidos',R.recebidos,'todos'],['Com orçamento gerado',R.orc,'pronto'],['Orçamento enviado',R.env,'pronto'],['Aprovados',R.apr,'aprovado'],['Em execução',R.exec,'aplicado']],max=Math.max(R.recebidos,1);
  return `<ol class="fn">${et.map(([t,n,f])=>`<li><button class="lnkb" data-flt="${f}">${t}</button><i style="width:${Math.max(n?2:0,Math.round(n/max*100))}%"></i><b>${n}</b></li>`).join('')}</ol><p class="hint">Cada etapa conta os leads do período que chegaram até ela. Clique para abrir a lista filtrada.</p>`;
}
function dashPainel(R){
  const hoje=today(),ev=ativGet().slice(0,8),tx=taxas(R),al=alertas(R);
  const per=DASH.dias?'nos últimos '+DASH.dias+' dias':'em todo o período';
  const sem=!R.recebidos&&!getL().length;
  return `
  <p class="bn-res">${sem?'Ainda não há leads. Quando alguém concluir um briefing no site, os números aparecem aqui.':`<b>${R.recebidos}</b> lead(s) ${per}, <b>${R.pend}</b> aguardando ação e <b>${R.apr}</b> aprovado(s).`}</p>
  <div class="bento">
   <section class="bn bn-hero"><h3 class="dsh-h">Leads por dia</h3><b class="bn-n big">${R.recebidos}</b><span class="bn-s">leads recebidos ${per}</span>${graficoBento(R.porDia)}</section>
   ${numCard('',R.pend,'Pendentes','novo ou pronto','#ffd166')}
   ${numCard('',R.orc,'Orçamentos gerados',R.msg+' mensagens, '+R.env+' enviados','#F5F5F3')}
   ${numCard('',R.apr,'Aprovados',R.rec+' recusados','#ff9a66')}
   ${numCard('',tx.aprov.v,'Taxa de aprovação',esc(tx.aprov.nota),'#12805c')}
   ${bentoCard('bn-w2','Precisa de atenção',al.length?`<ul class="alr">${al.slice(0,8).map(x=>`<li><span class="hint">${esc(x.t)}</span><button class="lnkb" ${x.proj?`data-proj="${esc(x.proj)}"`:`data-lead="${esc(x.id)}"`}>${esc(x.n)}</button></li>`).join('')}</ul>${al.length>8?`<p class="hint">Mostrando 8 de ${al.length}.</p>`:''}`:'<p class="hint">Nada exigindo atenção agora.</p>')}
   ${bentoCard('bn-w2','Funil comercial',funilLinks(R))}
   ${bentoCard('','Conversão',`<b class="bn-n">${tx.conv.v}</b><span class="bn-s">${esc(tx.conv.nota)}</span>`)}
   ${bentoCard('','Projetos',`<ul class="psv"><li><span>Aguardando início</span><b>${R.aguard}</b></li><li><span>Em andamento</span><b>${R.and}</b></li><li><span>Finalizados</span><b>${R.fin}</b></li><li><span>Atrasados</span><b class="${R.atr?'late':''}">${R.atr}</b></li></ul>`)}
   ${bentoCard('bn-w2','Tarefas e prazos próximos',R.tarefas.length?`<ul class="tkl">${R.tarefas.map(({l,x})=>`<li><button class="lnkb" data-proj="${esc(l.id)}"><b>${esc(l.nome)}</b> · ${esc(x.txt)}</button><span class="${x.due<hoje?'late':(x.due<=addDays(hoje,7)?'soon':'hint')}">${x.due<hoje?'atrasada · ':''}${esc(fdate(x.due))}</span></li>`).join('')}</ul>${R.tarefasTotal>10?`<p class="hint">Mostrando 10 de ${R.tarefasTotal} tarefas pendentes.</p>`:''}`:'<p class="hint">Nenhuma tarefa pendente com prazo.</p>')}
   ${bentoCard('bn-w2','Serviços mais pedidos',R.porSvc.length?`<ul class="psv">${R.porSvc.map(([k,n])=>`<li><span>${esc(CURTO[k]||MODS[k].name)}</span><b>${n}</b></li>`).join('')}</ul>`:'<p class="hint">Ainda não há dados neste período.</p>')}
   ${bentoCard('bn-w2','Atividade recente',ev.length?`<ul class="act">${ev.map(e=>`<li><span class="hint">${esc(dHora(e.t))} · ${esc(e.por||'Você')}</span>${e.id?`<button class="lnkb" data-lead="${esc(e.id)}">${esc(e.txt)}</button>`:esc(e.txt)}</li>`).join('')}</ul>`:'<p class="hint">Sem atividades registradas ainda. Elas aparecem aqui a partir de agora.</p>')}
  </div>
  <section class="panel" style="margin-top:14px"><h3 class="dsh-h">Leads do período (${R.lista.length})</h3>${tabelaLeads(R)}</section>
  <p class="hint dsh-nota">Todos os números vêm dos leads e acompanhamentos salvos neste navegador. Orçamento não é receita: o painel não soma valores de propostas. Taxa de aprovação = aprovados ÷ (aprovados + recusados); conversão = aprovados ÷ leads recebidos, ambas no período filtrado.</p>`;
}
function dashInner(){
  const o=(v,t,sel)=>`<option value="${esc(v)}" ${String(sel)===String(v)?'selected':''}>${esc(t)}</option>`;
  return `<h2 class="pt">Dashboard</h2><p class="hint">Visão da operação com os dados reais da sua conta.</p>${storeWarn()}
  <div class="dsh-f" role="group" aria-label="Filtros do dashboard">
   <label>Período<select id="df-dias">${[[7,'Últimos 7 dias'],[30,'Últimos 30 dias'],[90,'Últimos 90 dias'],[0,'Todo o período']].map(([v,t])=>o(v,t,DASH.dias)).join('')}</select></label>
   <label>Status<select id="df-status">${o('','Todos',DASH.status)}${['novo','pronto','aprovado','aplicado','recusado'].map(s=>o(s,stl(s),DASH.status)).join('')}</select></label>
   <label>Serviço<select id="df-svc">${o('','Todos',DASH.svc)}${Object.entries(MODS).filter(([k,m])=>!m.oculto).map(([k,m])=>o(k,CURTO[k]||m.name,DASH.svc)).join('')}</select></label>
   <label>Plano<select id="df-plano">${o('','Todos',DASH.plano)}${Object.entries(PLANO_NOME).map(([k,t])=>o(k,t,DASH.plano)).join('')}</select></label>
   <label>Ordenar a lista<select id="df-ord">${o('recentes','Mais recentes',DASH.ord)}${o('nome','Nome',DASH.ord)}${o('status','Status',DASH.ord)}</select></label>
   <label class="dsh-q">Cliente<input id="df-q" type="search" placeholder="Buscar por nome" value="${esc(DASH.q)}" maxlength="80" autocomplete="off"></label>
  </div><div id="dashc"></div>`;
}
function pintaDash(){
  const el=document.getElementById('dashc');if(!el)return;
  A.sig=sig();const R=dashCalc();el.innerHTML=dashPainel(R);
  el.querySelectorAll('[data-lead]').forEach(b=>{const ir=()=>{A.view='';A.sel=b.dataset.lead;A.tab='orc';A.edit=false;A.err='';A.fs=false;admin()};b.onclick=ir;if(b.tagName==='TR')b.onkeydown=e=>{if(e.key==='Enter')ir()}});
  el.querySelectorAll('[data-flt]').forEach(b=>b.onclick=()=>{A.view='';A.filter=b.dataset.flt;admin()});
  const gc=el.querySelector('.gcap');
  const bars=[...el.querySelectorAll('.gbn rect')];
  bars.forEach((r,i)=>{const diz=()=>{if(gc)gc.textContent=r.dataset.d;bars.forEach(x=>x.classList.toggle('on',x===r))};
    r.onmouseenter=diz;r.onfocus=diz;
    r.onkeydown=e=>{const j=e.key==='ArrowRight'?i+1:e.key==='ArrowLeft'?i-1:e.key==='Home'?0:e.key==='End'?bars.length-1:-1;
      if(j>=0&&j<bars.length){e.preventDefault();bars[i].tabIndex=-1;bars[j].tabIndex=0;bars[j].focus()}}});
  el.querySelectorAll('[data-proj]').forEach(b=>b.onclick=()=>{A.view='trk';T.id=b.dataset.proj;T.tab='tarefas';admin()});
}
function bindDash(){
  const m={'df-dias':['dias',v=>+v],'df-status':['status',v=>v],'df-svc':['svc',v=>v],'df-plano':['plano',v=>v],'df-ord':['ord',v=>v]};
  Object.entries(m).forEach(([id,[k,fn]])=>{const e=document.getElementById(id);if(e)e.onchange=()=>{DASH[k]=fn(e.value);pintaDash()}});
  const q=document.getElementById('df-q');if(q)q.oninput=()=>{DASH.q=q.value;pintaDash()};
  pintaDash();
}

/* ====== Dashboard de métricas por projeto (aba "Métricas" do Acompanhamento) ====== */
const delta=(a,b)=>{if(!b)return a?'<small class="dl">novo</small>':'';const p=(a-b)/b*100;return `<small class="dl ${p>=0?'up':'down'}">${p>=0?'+':''}${p.toFixed(0)}% vs. período anterior</small>`};
const kpiD=(t,v,d)=>`<div class="kpi"><span>${t}</span><b>${v}</b>${d||''}</div>`;
const entre=(rows,de,ate)=>rows.filter(r=>r.data>=de&&r.data<ate);
function metCanal(nome,c,corpo,ultima){
  return `<section class="panel met"><h3 class="dsh-h">${esc(nome)}</h3><p class="hint">Situação: ${esc(c.situacao||'não informada')} · Última atualização dos números: <b>${ultima?esc(fdate(ultima)):'nenhum número lançado'}</b> · Origem: lançamento manual ou importação de CSV · Atualização automática: <b>não conectada</b></p>${corpo}</section>`;
}
function tabMetricas(l){
  const t=l.track,p=T.mper||30,hoje=today(),ini=addDays(hoje,-p),ini2=addDays(hoje,-2*p),fim=addDays(hoje,1),c=t.canais,out=[];
  if(c.ads){const r=c.ads.rows,A1=adsSum(entre(r,ini,fim)),A0=adsSum(entre(r,ini2,ini)),u=r.map(x=>x.data).sort().pop();
    out.push(metCanal('Google Ads',c.ads,r.length?`<div class="kpis">${kpiD('Impressões',int(A1.imp),delta(A1.imp,A0.imp))}${kpiD('Cliques',int(A1.cli),delta(A1.cli,A0.cli))}${kpiD('Custo',brl(A1.cus),delta(A1.cus,A0.cus))}${kpiD('Conversões',int(A1.conv),delta(A1.conv,A0.conv))}${kpiD('CTR',A1.ctr.toFixed(2)+'%')}${kpiD('CPC médio',brl(A1.cpc))}${kpiD('Custo por conversão',A1.conv?brl(A1.cpa):'—')}</div>${bars(entre(r,ini,fim).slice().sort((a,b)=>b.data.localeCompare(a.data)),'cliques','#F5F5F3')}<p class="hint">Cliques por dia no período.</p>`:'<p class="hint">Sem números lançados. Lance na aba Google Ads ou importe o relatório CSV.</p>',u))}
  if(c.meta){const r=c.meta.rows,M1=metaSum(entre(r,ini,fim)),M0=metaSum(entre(r,ini2,ini)),u=r.map(x=>x.data).sort().pop();
    out.push(metCanal('Meta Ads',c.meta,r.length?`<div class="kpis">${kpiD('Valor usado',brl(M1.cus),delta(M1.cus,M0.cus))}${kpiD('Impressões',int(M1.imp),delta(M1.imp,M0.imp))}${kpiD('Cliques no link',int(M1.cli),delta(M1.cli,M0.cli))}${kpiD('Resultados',int(M1.res),delta(M1.res,M0.res))}${kpiD('CTR',M1.ctr.toFixed(2)+'%')}${kpiD('CPM',brl(M1.cpm))}${kpiD('Custo por resultado',M1.res?brl(M1.cpr):'—')}</div>${bars(entre(r,ini,fim).slice().sort((a,b)=>b.data.localeCompare(a.data)),'res','#F5F5F3')}<p class="hint">Resultados por dia no período.</p>`:'<p class="hint">Sem números lançados. Lance na aba Meta Ads ou importe o relatório CSV do Gerenciador de Anúncios.</p>',u))}
  if(c.social){const r=c.social.rows,S1=socSum(entre(r,ini,fim)),S0=socSum(entre(r,ini2,ini)),u=r.map(x=>x.data).sort().pop(),eng=S1.alc?S1.int/S1.alc*100:0;
    out.push(metCanal('Redes sociais',c.social,r.length?`<div class="kpis">${kpiD('Seguidores (último registro)',int(socSum(r).seg),socSum(r).dseg?'<small class="dl '+(socSum(r).dseg>=0?'up':'down')+'">'+(socSum(r).dseg>0?'+':'')+int(socSum(r).dseg)+' desde o registro anterior</small>':'')}${kpiD('Alcance',int(S1.alc||0),delta(S1.alc||0,S0.alc||0))}${kpiD('Interações',int(S1.int||0),delta(S1.int||0,S0.int||0))}${kpiD('Engajamento (interações ÷ alcance)',S1.alc?eng.toFixed(1)+'%':'—')}${kpiD('Posts',int(S1.posts||0),delta(S1.posts||0,S0.posts||0))}</div>`:'<p class="hint">Sem números lançados. Lance na aba Redes sociais.</p>',u))}
  if(c.site){const r=c.site.rows,V1=siteSum(entre(r,ini,fim)),V0=siteSum(entre(r,ini2,ini)),u=r.map(x=>x.data).sort().pop(),ps=c.site.psi[0];
    out.push(metCanal('Site',c.site,r.length?`<div class="kpis">${kpiD('Visitas',int(V1.v),delta(V1.v,V0.v))}${kpiD('Contatos',int(V1.c),delta(V1.c,V0.c))}${kpiD('Taxa de conversão',V1.v?V1.tx.toFixed(1)+'%':'—')}${ps?kpiD('PageSpeed (desempenho)',ps.perf+' · '+esc(fdate(ps.data))):''}</div>${bars(entre(r,ini,fim).slice().sort((a,b)=>b.data.localeCompare(a.data)),'visitas','#FF5A00')}<p class="hint">Visitas por dia no período.</p>`:'<p class="hint">Sem números lançados. Lance na aba Site.</p>',u))}
  const integ=[['Instagram, Facebook e Meta Ads','exige autorização do cliente e app aprovado pela Meta'],['YouTube','exige autorização do cliente (OAuth) e chave da API'],['Google Analytics 4','exige autorização do cliente e servidor para guardar o acesso'],['Google Ads (API)','exige token de desenvolvedor e autorização do cliente']];
  return `<div class="row" style="margin:0 0 10px"><label class="mper">Período<select id="mper">${[7,30,90].map(n=>`<option value="${n}" ${p===n?'selected':''}>Últimos ${n} dias (comparado aos ${n} anteriores)</option>`).join('')}</select></label></div>
  ${out.join('')||'<p class="hint">Este projeto ainda não tem canais de métricas.</p>'}
  <section class="panel met"><h3 class="dsh-h">Integrações automáticas</h3><ul class="intg">${integ.map(([n,d])=>`<li><b>${n}</b><span class="hint">não conectada · ${d}. Planejada para a Fase 2; enquanto isso, lance os números à mão.</span></li>`).join('')}</ul></section>`;
}
