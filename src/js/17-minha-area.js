const A={sel:null,filter:'todos',tab:'orc',edit:false,fs:false,sub:'prev',err:'',auth:false,view:'dash',sig:''};
const J={orc:{on:false,id:null,live:'',t0:0,what:'orc'},plano:{on:false,id:null,live:'',t0:0},ex:{on:false,id:null,live:'',t0:0,what:''}};
const anyBusy=()=>J.orc.on||J.plano.on||J.ex.on;
const isSite=l=>svcs(l).some(k=>k==='site'||k==='resite');
const svcs=l=>(l.mods&&l.mods.length?l.mods:[l.mod]).filter(k=>MODS[k]);
const svcName=l=>svcs(l).map(k=>MODS[k].name).join(' + ');
const svcIc=l=>svcs(l).map(k=>'<span class="mi">'+ICON[k]+'</span>').join('');
const mineJ=(k,l)=>J[k].on&&J[k].id===l.id;
const LBL={BASICO:'Essencial',MEDIO:'Crescimento',MAX:'Completo',MENSAGEM:'Mensagem'};
const sig=()=>getL().map(l=>l.id+l.status+(l.orc?1:0)).join();
function parseOrc(t){const o={},re=/---(BASICO|MEDIO|MAX|MENSAGEM)---/g,ix=[];let m;while((m=re.exec(t)))ix.push([m[1],m.index,re.lastIndex]);
  ix.forEach((x,i)=>{o[x[0]]=t.slice(x[2],i+1<ix.length?ix[i+1][1]:t.length).trim()});return o}
const statLine=()=>['orc','plano','ex'].filter(k=>J[k].on&&J[k].id===A.sel).map(k=>`${{orc:({ficha:'Resumindo o briefing',msg:'Reescrevendo a mensagem'}[J.orc.what]||'Gerando 3 orçamentos e a mensagem'),plano:'Gerando o plano',ex:'Gerando '+J.ex.what}[k]}… ${Math.round((Date.now()-J[k].t0)/1000)}s · ${J[k].live.length} caracteres`).join('   ·   ');
setInterval(()=>{const s=document.getElementById('stat');if(s)s.textContent=statLine()},1000);

function admShell(inner){
  return `<div class="shell"><aside class="side">${window.OR_TESTE?'<p class="err" role="note" style="margin:0 0 10px">Build de TESTE com a chave da IA embutida. Não publique nem envie este arquivo.</p>':''}<button class="brandb" data-nav="pub" aria-label="Ver site público">${logo}<span class="wmw"><span class="wm">marketing</span><span class="wt">digital · painel</span></span></button>
  <nav class="nvs" aria-label="Seções da Minha área">${[['','nvl','Leads'],['cap','nvc','Captar clientes'],['dash','nvd','Dashboard'],['trk','nvt','Acompanhamento'],['vagas','nvvg','Vagas']].map(([v,id,t])=>`<button class="nv ${(A.view||'')===v?'on':''}" id="${id}"${(A.view||'')===v?' aria-current="page"':''}>${t}</button>`).join('')}<div class="nvg" role="group" aria-labelledby="nvgt"><span class="nvgt" id="nvgt">Inteligência Artificial</span>${[['kb','nvk','Base da IA'],['ias','nvi','IAs (Groq e reserva)']].map(([v,id,t])=>`<button class="nv sub ${A.view===v?'on':''}" id="${id}"${A.view===v?' aria-current="page"':''}>${t}</button>`).join('')}</div><button class="nv" data-nav="pub">Ver site público</button></nav>
  <div class="iasum">IA 1 (criação): ${esc(CFG.ia1.model)}<br>IA 2 (atendimento): ${esc(CFG.ia2.model)}<br>IA 3 (captação): ${esc(CFG.ia3.model)}</div>
  <div id="disk" class="diskbar"></div><div id="savebar" class="savebar" role="status"></div>
  <div class="dtools"><button id="csv">Exportar CSV</button><button id="bkp">Baixar backup</button><button id="impb">Importar backup</button><input type="file" id="imp" accept=".json" hidden><button id="npin">Trocar PIN</button><button id="lclean">Limpar leads antigos</button></div>
  </aside><main class="mainc" tabindex="-1">${inner}</main></div>`;
}
function bindShell(){
  $('#nvd').onclick=()=>{A.view='dash';admin()};$('#nvl').onclick=()=>{A.view='';admin()};$('#nvt').onclick=()=>{A.view='trk';T.id=null;T.msg='';admin()};$('#nvk').onclick=()=>{A.view='kb';admin()};$('#nvc').onclick=()=>{A.view='cap';CAP.id=null;CAP.err='';CAP.msg='';admin()};$('#nvi').onclick=()=>{A.view='ias';admin()};$('#nvvg').onclick=()=>{A.view='vagas';A.vgc=null;A.vgTab=null;admin()};
  $('#csv').onclick=()=>dl('leads.csv','nome,whatsapp,email,area,status,data\n'+getL().map(l=>[l.nome,l.whats,l.email,svcName(l),l.status,l.data].map(csvSafe).join(',')).join('\n'),'text/csv');
  $('#bkp').onclick=()=>bkpDlg();
  $('#impb').onclick=()=>$('#imp').click();
  $('#imp').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{let o=JSON.parse(await f.text());if(o&&o.cripto){const s=await senhaDlg();e.target.value='';if(!s)return;o=await bkpDecifra(o,s)}const n=merge(o.leads||o),np=Array.isArray(o.prosp)?capMerge(o.prosp):0;aviso(n+' lead(s) importado(s).'+(np?' '+np+' prospect(s) importado(s).':'')+(MERGE_REJ?' '+MERGE_REJ+' ignorado(s) por estarem inválidos.':''));if(!A.view){paintList();paintDet()}}catch(x){aviso(/Senha|inválido/.test((x&&x.message)||'')?x.message:'Arquivo inválido.')}};
  paintDisk();pintaSave();
}
function admin(){
  if(!A.auth){
    setApp(`<main class="pinw" tabindex="-1"><div class="pin panel"><h1 class="pinh">Minha área</h1><p class="hint">Digite o seu PIN para entrar.</p><label for="pin">PIN</label><input id="pin" type="password" autocomplete="off">
    <div class="row"><button class="btn" id="ok">Entrar</button><button class="btn ghost" data-nav="pub">Voltar ao site</button></div><p class="hint" id="er" role="alert"></p></div></main>`);
    const t=async()=>{const r=await pinOk($('#pin').value);if(r===true){A.auth=true;lastAct=Date.now();admin();if(!CFG.pinh)setTimeout(()=>trocarPin(true),200)}else{$('#er').textContent=r==='wait'?'Muitas tentativas. Aguarde '+Math.ceil((pinLock.until-Date.now())/1000)+' s.':'PIN incorreto.';$('#pin').value='';$('#pin').focus()}};
    $('#ok').onclick=t;$('#pin').onkeydown=e=>{if(e.key==='Enter')t()};$('#pin').focus();return;
  }
  if(A.view==='dash'){setApp(admShell(dashInner()));bindShell();return bindDash()}
  if(A.view==='tal'){A.view='vagas';A.vgTab='db';A.vgc=null;A.vg=null}
  if(A.view==='vagas'){setApp(admShell(vagasInner()));bindShell();return bindVagas()}
  if(A.view==='trk'){setApp(admShell('<div id="trk"></div>'));bindShell();return trkPaint()}
  if(A.view==='cap'){setApp(admShell('<div id="cap"></div>'));bindShell();return capPaint()}
  if(A.view==='kb'){setApp(admShell(kbInner()));bindShell();return bindKb()}
  if(A.view==='ias'){setApp(admShell(iasInner()));bindShell();return bindIas()}
  setApp(admShell(`<h2 class="pt">Leads</h2><p class="hint">Quando um briefing chega, ele aparece aqui. A IA só trabalha quando você clica: abra o lead e use "Gerar tudo com a IA".</p>${srvOn()?'<div class="row"><button class="btn ghost" id="pull">Buscar briefings do site</button></div>':''}${storeWarn()}<div id="sts"></div>
  <select id="flt" style="max-width:220px" aria-label="Filtrar por status">${['todos','novo','pronto','aprovado','aplicado','recusado'].map(s=>`<option value="${s}" ${A.filter===s?'selected':''}>${stl(s)}</option>`).join('')}</select>
  <div class="adm-g"><div class="list" id="lst"></div><div id="det"></div></div>`));
  bindShell();$('#flt').onchange=e=>{A.filter=e.target.value;paintList()};
  paintList();paintDet();
  if($('#pull'))$('#pull').onclick=()=>puxarLeads(true);
  if(srvOn()&&!A.puxou){A.puxou=true;puxarLeads(false)}
}
/* briefings dos visitantes guardados no servidor (Cloudflare): traz para cá e apaga de lá depois de salvo neste navegador */
async function puxarLeads(manual){
  if(!srvOn())return;
  try{const h={'X-OR-Token':srvTok()},r=await fetch('/api/leads',{headers:h});if(!r.ok)throw new Error(r.status===401?'o servidor recusou o código (confira em IAs)':'erro '+r.status);
    const L=((await r.json()).leads||[]).filter(x=>x&&typeof x.id==='string'),n=merge(L);
    if(L.length&&SAVE.ok!==false)await fetch('/api/leads',{method:'DELETE',headers:{...h,'Content-Type':'application/json'},body:JSON.stringify({ids:L.map(x=>x.id)})});
    if(manual||n)aviso(n?n+' briefing(s) novo(s) do site.':'Nenhum briefing novo no site.');if(!A.view){paintList();paintDet()}}
  catch(e){if(manual)aviso('Não consegui buscar os briefings: '+e.message+'.')}
}
function paintList(){
  const L=getL(),c=s=>L.filter(l=>l.status===s).length,vis=A.filter==='todos'?L:L.filter(l=>l.status===A.filter);
  A.sig=sig();
  const st=document.getElementById('sts');
  if(st)st.innerHTML=`<div class="stats">${[['novo','novos','--c:#ffd166'],['pronto','prontos para revisar','--c:#ff8a4d'],['aprovado','aprovados','--c:#ff9a66'],['aplicado','em execução','--c:#12805c']].map(([k,t,s])=>`<div class="sc" style="${s}"><b>${c(k)}</b><span>${t}</span></div>`).join('')}</div>`;
  const ls=document.getElementById('lst');if(!ls)return;
  ls.innerHTML=vis.length?vis.map(l=>`<button class="it ${l.status} ${l.id===A.sel?'on':''}" data-i="${esc(l.id)}"><b>${esc(l.nome)}</b><span class="chip ${l.status}">${stl(l.status)}</span>${(l.envios||[]).length?'<span class="wsent" title="Orçamento enviado no WhatsApp">'+WAI+'enviado</span>':''}<br><span class="hint">${svcIc(l)} ${svcName(l)} · ${esc(l.data)}</span></button>`).join(''):'<p class="hint">Nenhum lead aqui ainda. Abra o site público em outra aba e faça um briefing.</p>';
  ls.querySelectorAll('[data-i]').forEach(b=>b.onclick=()=>{A.sel=b.dataset.i;A.edit=false;A.err='';A.fs=false;paintList();paintDet()});
}
function paintDet(){
  if(A.view==='trk'){trkPaint();return}
  const el=document.getElementById('det');if(!el)return;
  const l=getL().find(x=>x.id===A.sel);
  el.innerHTML=l?detail(l):'<div class="panel hint">Escolha um lead na lista.</div>';if(l)bind(l);
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
    if(o.BASICO||o.MEDIO||o.MAX)return `<div class="tiers">${['BASICO','MEDIO','MAX'].map(k=>o[k]?`<div class="tier ${k==='MEDIO'?'rec':''}"><h3>${LBL[k]}${k==='MEDIO'?' · recomendado':''}</h3>${md(o[k])}</div>`:'').join('')}</div>`;
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
  return `<div class="stat" id="stat">${esc(statLine())}</div>${A.err?`<div class="err">${esc(A.err)}</div>`:''}${actions(l,h)}<div class="pane ${A.fs?'fs':''}" id="pane">${paneHtml(l,o,h)}</div>${A.fs?'<button class="btn fsx" id="fsx">Fechar leitura (Esc)</button>':''}${covWarn(l)}${fixRow(l)}`;
}
function detail(l){
  const o=parseOrc(l.orc||''),h=isSite(l)?htmlOf(l.entrega):'';
  const tabs=[['brief','Briefing'],['ficha','Resumo'+(l.ficha?' ✓':'')],['orc','Orçamentos'+(l.orc?' ✓':'')],['msg','Mensagem'+(l.msg?' ✓':'')]];
  if(!tabs.some(([k])=>k===A.tab))A.tab='orc';
  return `<div class="panel dt"><div class="dthead"><div><h3>${esc(l.nome)} <span class="chip ${l.status}">${stl(l.status)}</span></h3>
  <p class="hint">${svcIc(l)} ${svcName(l)} · ${esc(l.whats)}${(l.envios||[]).length?' · <b>orçamento enviado '+(l.envios.slice(-1)[0].via==='email'?'por e-mail':'no WhatsApp')+' em '+esc(l.envios.slice(-1)[0].quando)+'</b>':''} ${l.email?'· '+esc(l.email):''}</p>${planosCards(l)}${briefPainel(l)}${l.guia?'<p class="hint"><b>Veio do roteiro "ainda não sei o que preciso".</b> Os serviços foram sugeridos pelo app; confirme com o cliente antes de enviar o orçamento.</p>':''}</div>
  <div class="row" style="margin:0">${!l.orc&&l.status!=='recusado'?`<button class="btn hl" id="gall" ${anyBusy()?'disabled':''}>${l.ficha?'Gerar o orçamento com a IA':'Gerar resumo e orçamento com a IA'}</button>`:''}${l.msg?`<button class="btn wa" id="wsend">${WAI} Enviar orçamento no WhatsApp</button><button class="btn ghost" id="emsend">Enviar por e-mail</button>`:''}${(l.entrega||l.orc)&&!['aprovado','aplicado','recusado'].includes(l.status)?'<button class="btn ok" id="ap">Aprovar</button><button class="btn ghost" id="rec">Marcar como recusado</button>':''}${l.status==='recusado'?'<button class="btn ghost" id="reab">Reabrir</button>':''}<button class="btn ghost" id="lgx">Exportar dados (LGPD)</button><button class="btn ghost" id="lgd">Apagar cliente</button></div></div>
  <div class="tabs" role="tablist">${tabs.map(([k,t])=>`<button class="tab ${A.tab===k?'on':''}" data-t="${k}" role="tab" aria-selected="${A.tab===k}">${t}</button>`).join('')}</div>
  <p class="hint plsel"><label>Plano escolhido pelo cliente <select id="plsel"><option value="">ainda não escolheu</option>${Object.entries(PLANO_NOME).map(([k,t])=>`<option value="${k}" ${l.plano===k?'selected':''}>${t}</option>`).join('')}</select></label>${l.planoEm?' · registrado em '+esc(dHora(Date.parse(l.planoEm)||Date.now())):''}</p>
  <div class="stat" id="stat">${esc(statLine())}</div>
  ${A.err?`<div class="err">${esc(A.err)}</div>`:''}
  ${actions(l,h)}
  <div class="pane ${A.fs?'fs':''}" id="pane">${paneHtml(l,o,h)}</div>${A.fs?'<button class="btn fsx" id="fsx">Fechar leitura (Esc)</button>':''}${covWarn(l)}${fixRow(l)}${fimLead(l)}</div>`;
}
const fimLead=l=>['novo','pronto','aprovado'].includes(l.status)?'<div class="dfim"><div><b>O cliente fechou?</b><span class="hint">Confirme o pacote, o valor e o início para levar o cliente ao acompanhamento.</span></div><button class="btn hl" id="ay">Cliente fechou: ir para o acompanhamento</button></div>':l.status==='aplicado'?'<div class="dfim"><div><b>Cliente em execução</b><span class="hint">Entregas, produção, campanhas e métricas ficam no acompanhamento.</span></div><button class="btn hl" id="ao">Abrir acompanhamento</button></div>':'';
function bind(l){
  const g=id=>document.getElementById(id),rp=()=>{paintList();paintDet()};
  document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{A.tab=b.dataset.t;A.edit=false;paintDet()});
  bindExec(l);
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
  if(g('ap'))g('ap').onclick=()=>{upd(l.id,{status:'aprovado'});rp()};
  if(g('rec'))g('rec').onclick=()=>{upd(l.id,{status:'recusado'});rp()};
  if(g('reab'))g('reab').onclick=()=>{upd(l.id,{status:l.orc?'pronto':'novo'});rp()};
  if(g('plsel'))g('plsel').onchange=()=>{const v=g('plsel').value,em=new Date().toISOString();upd(l.id,{plano:v,planoEm:v?em:'',planoHist:v?[...(l.planoHist||[]),{plano:v,em}].slice(-20):(l.planoHist||[])});rp()};
  if(g('ay'))g('ay').onclick=()=>fecharDlg(l.id);
  if(g('ao'))g('ao').onclick=()=>{if(!l.track)return trkStart(l.id);A.view='trk';T.id=l.id;T.tab='geral';admin()};
  if(g('ed'))g('ed').onclick=()=>{if(A.edit&&g('txt'))upd(l.id,{entrega:g('txt').value});A.edit=!A.edit;paintDet()};
  if(g('sb'))g('sb').onclick=()=>{A.sub=A.sub==='prev'?'code':'prev';paintDet()};
  if(g('cp'))g('cp').onclick=()=>navigator.clipboard.writeText(htmlOf(l.entrega)||l.entrega);
  if(g('dh'))g('dh').onclick=()=>dl((l.nome.replace(/\W+/g,'-')||'site')+'.html',htmlOf(l.entrega),'text/html');
  if(g('rf'))g('rf').onclick=()=>{const v=g('ref').value.trim();if(v)gen(l.id,v)};
  if(g('fs'))g('fs').onclick=()=>{A.fs=true;paintDet()};
  if(g('fsx'))g('fsx').onclick=()=>{A.fs=false;paintDet()};
  if(g('msg'))g('msg').onchange=()=>upd(l.id,{msg:g('msg').value});
  if(g('cm'))g('cm').onclick=()=>navigator.clipboard.writeText(g('msg').value);
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