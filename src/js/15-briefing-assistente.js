/* rascunho do briefing: fica só neste navegador até o envio, para continuar depois */
const rascLe=()=>{try{const r=JSON.parse(sget('brief2')||'null');return r&&Array.isArray(r.qa)&&r.who&&Date.now()-r.t<12096e5?r:null}catch(e){return null}};
const rascSalva=()=>{if(P.who&&P.mod!=='guia')sset('brief2',JSON.stringify({t:Date.now(),mod:P.mod,mods:P.mods,who:P.who,qa:P.qa,skip:[...P.skipTp]}))};
const rascLimpa=()=>{try{sset('brief2','')}catch(e){}};
/* painel por serviço (status e progresso) e resumo das respostas, na lateral do briefing */
function modsRail(){
  if(P.mod==='guia'||!P.who||P.mods.length<2)return '';
  const pool=topicPool(),A=ansOf(P.qa),at=(P.cur&&P.cur.tp||'').split(':')[0];
  return '<ul class="mods" aria-label="Briefing de cada serviço">'+P.mods.map((k,i)=>{
    const tot=(i?0:SEED)+pool.filter(x=>x.k===k&&(!x.t[5]||x.t[5](A))).length,done=Math.min(tot,P.qa.filter(x=>x.tp&&(x.tp.startsWith(k+':')||(!i&&x.tp.startsWith('seed:')))).length);
    const st=!done?'pendente':done>=tot?'concluído':'em preenchimento';
    return `<li class="${at===k||(!at&&!i)?'on':''}"><div class="mh"><b>${esc(MODS[k].name)}</b><span class="glass-st ${st==='concluído'?'ok':''}">${st}</span></div><div class="mbar" role="progressbar" aria-valuemin="0" aria-valuemax="${tot}" aria-valuenow="${done}" aria-label="Progresso de ${esc(MODS[k].name)}"><i style="width:${tot?Math.round(done/tot*100):0}%"></i></div><span class="hint">${done} de ${tot} perguntas</span></li>`}).join('')+'</ul>';
}
function rsmRail(){
  if(P.mod==='guia'||!P.who||!P.qa.length)return '';
  return '<details class="rsm"><summary>Suas respostas até agora ('+P.qa.length+')</summary><ol>'+P.qa.map(x=>'<li>'+esc(x.q)+'<br><b>'+esc(x.a)+'</b></li>').join('')+'</ol></details>';
}
function gate(){
  setApp(shell(0,`${segs(0)}<h2 class="q">Primeiro, como posso te chamar?</h2>
  <input id="ln" aria-label="Seu nome" autocomplete="name" placeholder="Seu nome" maxlength="80">
  <label for="lw">WhatsApp com DDD, para eu te enviar o resultado</label><input id="lw" type="tel" autocomplete="tel" placeholder="(21) 90000-0000" maxlength="20">
  <label for="le">E-mail (opcional)</label><input id="le" type="email" autocomplete="email" placeholder="voce@email.com" maxlength="120">
  <label class="cons"><input type="checkbox" id="lc"><span>Concordo com o uso do meu nome, WhatsApp e respostas para receber o plano e o orçamento, incluindo o envio de trechos das respostas (sem WhatsApp e e-mail) a serviços de IA. Li a <button type="button" class="plink" id="lpv">política de privacidade</button>.</span></label>
  <div class="row"><button class="btn" id="go">Começar</button><button class="btn ghost" id="bk">Voltar</button></div><p class="err2" id="er" role="alert"></p>`));
  $('#bk').onclick=()=>{P.mod=null;pub()};
  const go=()=>{const w={nome:$('#ln').value.trim(),whats:$('#lw').value.trim(),email:$('#le').value.trim()};
    if(!w.nome||w.whats.replace(/\D/g,'').length<10){$('#er').textContent='Preencha seu nome e um WhatsApp com DDD.';return}
    if(w.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(w.email)){$('#er').textContent='Esse e-mail parece incompleto. Confira ou deixe em branco.';return}
    if(!$('#lc').checked){$('#er').textContent='Para continuar, marque a concordância com a política de privacidade.';return}
    P.who={...w,consent:{em:new Date().toISOString(),versao:PRIV_VERSAO}};pub()};
  $('#lpv').onclick=privacy;
  const rs=rascLe();if(rs&&rs.mod===P.mod&&JSON.stringify(rs.mods)===JSON.stringify(P.mods)){const b=document.createElement('button');b.className='btn ghost';b.type='button';b.textContent='Continuar briefing salvo ('+rs.qa.length+' respostas)';b.onclick=()=>{P.who=rs.who;P.qa=rs.qa;P.skipTp=new Set(rs.skip||[]);P.cur=null;pub()};$('#go').parentNode.appendChild(b)}
  $('#go').onclick=go;app.querySelectorAll('input').forEach(i=>i.onkeydown=e=>{if(e.key==='Enter')go()});
  $('#ln').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();$('#lw').focus()}};$('#ln').focus();
}
const FOREIGN={ads:/google ads|\bcpc\b|performance max/gi,meta:/meta ads|\bpixel\b|públicos? semelhantes?|impulsion\w*/gi,social:/\breels?\b|stories|calend[aá]rio de posts/gi,youtube:/youtube|thumbnails?|miniaturas?|inscritos|\bshorts\b/gi,local:/google meu neg[oó]cio|google maps|seo local/gi,press:/assessoria de imprensa|\brelease\b|\bpauta\b|jornalistas?|clipping/gi,brand:/logotipo|\blogo\b|identidade visual|paleta|manual de marca/gi,site:/\bsite\b|landing page|hospedagem|dom[ií]nio|wordpress|\blayout\b/gi,resite:/\bsite\b|landing page|hospedagem|dom[ií]nio|wordpress|\blayout\b/gi};
const DUPQ=new Set(['pub','cores','estilo','ref','int','local','conc']);
const BASE_Q=['negocio','nome','oferta'];
function topicPool(){
  const lists=P.mods.map((k,i)=>MODS[k].qs.slice(i?0:SEED,-COMUM.length).filter(t=>!i||!BASE_Q.includes(t[0])).map(t=>({k,t,tp:k+':'+t[0]})));
  const out=[],seen=new Set();
  lists.forEach(l=>l.forEach(x=>{if(DUPQ.has(x.t[0])){if(seen.has(x.t[0]))return;seen.add(x.t[0])}out.push(x)}));
  return out;
}
function nextTopic(){const used=new Set([...P.qa.map(x=>x.tp),...P.skipTp]),A=ansOf(P.qa);return topicPool().find(x=>!used.has(x.tp)&&(!x.t[5]||x.t[5](A)))||null}
const allowedText=()=>P.mods.flatMap(k=>MODS[k].qs.map(x=>x[1]+' '+(Array.isArray(x[2])?x[2].join(' '):x[2]))).concat(P.qa.map(x=>x.a)).join(' ').toLowerCase();
function parseQ(t){const m=clean(t).match(/\{[\s\S]*\}/);if(!m)return null;try{const o=JSON.parse(m[0].replace(/,\s*([}\]])/g,'$1'));return(o&&(o.pergunta||o.pular))?o:null}catch(e){return null}}
function escopoTxt(mods){
  const sel=mods.map(k=>MODS[k]).filter(Boolean),out=Object.entries(MODS).filter(([k,m])=>!mods.includes(k)&&!m.oculto);
  return 'ESCOPO DESTA CONVERSA: fale APENAS sobre '+sel.map(m=>m.foco).join(' e ')+'. NÃO fale sobre: '+out.map(([k,m])=>m.foco).join('; ')+'. Se o cliente mencionar outro assunto, não aprofunde: volte ao escopo.';
}
function qCheck(o,top,allowed){
  if(!o||typeof o.pergunta!=='string')return {erro:'a resposta não veio no formato JSON pedido'};
  const q=o.pergunta.trim().replace(/\s+/g,' '),t=top.t,isOpt=Array.isArray(t[2]);
  if(q.length<12||q.length>220||!/\?\s*$/.test(q))return {erro:'a pergunta precisa ter de 12 a 220 caracteres e terminar com "?"'};
  const ops=Array.isArray(o.opcoes)?[...new Set(o.opcoes.filter(x=>typeof x==='string').map(x=>x.trim()).filter(x=>x&&x.length<=60))].slice(0,6):[];
  if(isOpt&&ops.length<2)return {erro:'faltaram de 3 a 6 opções curtas'};
  const texto=(q+' '+ops.join(' ')).toLowerCase();
  if(t[4]&&!new RegExp(t[4],'i').test(texto))return {erro:'a pergunta saiu do assunto "'+t[1]+'"'};
  for(const m of Object.keys(FOREIGN)){
    if(P.mods.includes(m))continue;
    for(const w of texto.matchAll(new RegExp(FOREIGN[m].source,'gi')))if(!allowed.includes(w[0].toLowerCase()))return {erro:'ela fala de "'+w[0]+'", que é de outro serviço que o cliente não escolheu'};
  }
  return {ok:{q,ops:isOpt?ops:[],dica:isOpt?'':String(o.dica||t[2]||'').slice(0,140)}};
}
async function aiQ(top,motivo){
  const names=P.mods.map(k=>MODS[k].name+' ('+MODS[k].foco+')').join(' + '),t=top.t,isOpt=Array.isArray(t[2]);
  const hist=P.qa.map(x=>`P: ${x.q}\nR: ${x.a}`).join('\n');
  const exs=P.mods.flatMap(k=>MODS[k].qs.slice(SEED,-COMUM.length).map(x=>x[1])).filter(x=>x!==t[1]).slice(0,3);
  const msgs=[{role:'system',content:'Você faz parte da equipe de marketing digital da '+CFG.brand+', no Rio de Janeiro, conversando com uma pessoa que pode virar cliente. Português do Brasil, simples e simpático, tratando por "você" e falando como equipe ("nós", "a gente"), nunca em primeira pessoa do singular. Sua única tarefa é adaptar UMA pergunta já definida ao negócio dela, SEM mudar o assunto e SEM misturar serviços. '+escopoTxt(P.mods)+' Responda SOMENTE com JSON válido.'},
   {role:'user',content:`Serviço escolhido: ${names}\n\nPergunta definida (o assunto é obrigatório): ${t[1]}\n${isOpt?'Opções do modelo: '+t[2].join(' | ')+'\n':'Exemplo de resposta do modelo: '+t[2]+'\n'}${exs.length?'Outras perguntas deste mesmo serviço, só para você sentir o tema (não repita): '+exs.join(' / ')+'\n':''}\nConversa até agora:\n${hist||'(nenhuma)'}\n\nRegras:\n1) Faça uma única pergunta sobre exatamente o mesmo assunto da pergunta definida, usando o ramo e o produto do cliente quando ajudar, sem inventar nenhum fato.\n2) No máximo 200 caracteres, terminando com "?".\n3) ${isOpt?'Devolva de 3 a 6 opções curtas, simples e independentes, adaptadas ao ramo (use as opções do modelo como base).':'Não dê opções: deixe "opcoes" vazio e escreva um exemplo curto em "dica".'}\n4) Não fale de serviços que o cliente não escolheu.\n5) Se o cliente já respondeu claramente este assunto na conversa, responda apenas {"pular":true}.\nFormato: {"pergunta":"...","opcoes":[],"dica":"..."}`+(motivo?`\n\nATENÇÃO: sua resposta anterior foi recusada porque ${motivo}. Refaça mantendo o assunto da pergunta definida.`:'')}];
  P.ctl=new AbortController();const to=setTimeout(()=>P.ctl.abort(),30000);
  try{return parseQ(await ask(msgs,()=>{},{slot:'ia2',json:true,max:260,temp:motivo?0.1:0.3,signal:P.ctl.signal}))||{}}catch(e){return {err:true}}finally{clearTimeout(to)}
}
function loading(){
  setApp(shell(2,`${segs(P.qa.length)}<p class="kick">${MODS[P.mod].name}</p><h2 class="q" role="status">Montando a próxima pergunta para o seu caso…</h2>
  <div class="sk" style="width:80%"></div><div class="sk" style="width:55%"></div><div class="row"><button class="btn ghost" id="skp" hidden>Está demorando? Usar pergunta padrão</button></div>`));
  setTimeout(()=>{const b=$('#skp');if(b){b.hidden=false;b.onclick=()=>{P.skip=true;P.ctl&&P.ctl.abort()}}},6000);
}
async function nextQ(){
  const show=(ph,q,h,multi,tp)=>{P.cur={ph,q,h,multi:!!multi,tp};wizard()},seeds=MODS[P.mod].qs.slice(0,SEED);
  if(P.mod==='guia'&&cnt('seed')===1){const A=ansOf(P.qa),d=DIRQ.find(x=>!P.qa.some(y=>y.tp==='dir:'+x[0])&&x[5](A));if(d)return show('dir',d[1],d[2],d[3],'dir:'+d[0])}
  if(cnt('seed')<SEED){const s=seeds[cnt('seed')];return show('seed',s[1],s[2],s[3],'seed:'+s[0])}
  if(cnt('ai')<maxAI()){
    const top=nextTopic();
    if(top){
      const t=top.t,fb=()=>show('ai',t[1],t[2],t[3],top.tp);
      if(P.fail||P.mod!=='guia')return fb();
      loading();let o=await aiQ(top);
      if(P.skip){P.skip=false;return fb()}
      if(o.err){P.fail=true;return fb()}
      if(o.pular===true&&P.skipTp.size<2){P.skipTp.add(top.tp);return nextQ()}
      let ck=qCheck(o,top,allowedText());
      if(!ck.ok){o=await aiQ(top,ck.erro);if(P.skip){P.skip=false;return fb()}if(o.err){P.fail=true;return fb()}ck=qCheck(o,top,allowedText())}
      return ck.ok?show('ai',ck.ok.q,ck.ok.ops.length>=2?ck.ok.ops:ck.ok.dica,t[3],top.tp):fb();
    }
  }
  const ci=cnt('comum');
  if(ci<COMUM.length){const s=COMUM[ci];return show('comum',s[1],s[2],s[3],'comum:'+s[0])}
  submit();
}
function wizard(){
  const {q,h,a,ph,multi,tp}=P.cur,km=(tp||'').split(':')[0],mi=P.mods.indexOf(km),opt=Array.isArray(h),n=P.qa.length+1,last=ph==='comum'&&cnt('comum')===COMUM.length-1;
  const parts=opt&&a?String(a).split(', '):[];
  const sel=new Set(P.cur.sel||parts.filter(x=>h.includes(x))),other0=P.cur.other!=null?P.cur.other:parts.filter(x=>!h.includes(x)).join(', ');
  let othOpen=!!other0;
  setApp(shell(ph==='seed'||ph==='dir'?1:ph==='ai'?2:3,`${segs(n)}<p class="kick">${mi>=0&&P.mod!=='guia'?esc((P.mods.length>1?'Módulo '+(mi+1)+' de '+P.mods.length+' · ':'')+(MODS[km].nome||MODS[km].name)+' · '):''}Pergunta ${n}</p><h2 class="q" id="qh" tabindex="-1">${esc(q)}</h2>
  ${opt?`<div class="chips${multi?' m':''}" role="group">${h.map(o=>`<button class="chip2 ${sel.has(o)?'on':''}" data-o="${esc(o)}" aria-pressed="${sel.has(o)}">${esc(o)}</button>`).join('')}${ph!=='comum'?`<button class="chip2 ${other0?'on':''}" id="oth" aria-pressed="${!!other0}">Outra resposta</button>`:''}</div>${multi?'<p class="hint2">Você pode marcar mais de uma opção.</p>':''}<div id="othw" ${other0?'':'hidden'}><input id="othi" aria-label="Outra resposta" placeholder="Escreva a sua resposta" value="${esc(other0)}"></div>`
  :`<textarea id="f" rows="2" aria-labelledby="qh" placeholder="${esc(h)}">${esc(a||'')}</textarea>`}
  <div class="row"><button class="btn ghost" id="bk">Voltar</button><button class="btn" id="nx" ${opt&&!multi&&!other0?'hidden':''}>${last?'Enviar briefing':'Continuar'}</button>${mi>=0&&P.mod!=='guia'?'<button class="btn ghost" id="nsei">Não sei responder agora</button>':''}</div>`));
  if($('#nsei'))$('#nsei').onclick=()=>done('Não informado',{sel:[],other:''});
  const done=(v,x)=>{P.qa.push({ph,q,h,multi,tp,a:v,...(x||{})});P.cur=null;rascSalva();nextQ()};
  const val=()=>opt?[...h.filter(o=>sel.has(o)),(($('#othi')||{}).value||'').trim()].filter(Boolean).join(', '):$('#f').value.trim();
  $('#bk').onclick=()=>{if(opt){P.cur.sel=[...sel];P.cur.other=(($('#othi')||{}).value||'').trim();P.cur.a=val()}else P.cur.a=$('#f').value;
    if(P.qa.length){P.cur=P.qa.pop();P.aiDone=false;wizard()}else{P.who=null;P.cur=null;pub()}};
  if(opt){
    app.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>{
      if(!multi&&!othOpen)return done(b.dataset.o,{sel:[b.dataset.o],other:''});
      if(multi){const o=b.dataset.o;sel.has(o)?sel.delete(o):sel.add(o)}else{sel.clear();sel.add(b.dataset.o)}
      app.querySelectorAll('[data-o]').forEach(x=>{const on=sel.has(x.dataset.o);x.classList.toggle('on',on);x.setAttribute('aria-pressed',on)})});
    if($('#oth'))$('#oth').onclick=()=>{othOpen=!othOpen;$('#othw').hidden=!othOpen;$('#nx').hidden=!(multi||othOpen);$('#oth').classList.toggle('on',othOpen);$('#oth').setAttribute('aria-pressed',othOpen);if(othOpen)$('#othi').focus()};
    $('#nx').onclick=()=>{const v=val();if(!v){return $('#othi')&&othOpen?$('#othi').focus():0}done(v,{sel:[...sel],other:(($('#othi')||{}).value||'').trim()})};
    if($('#othi'))$('#othi').onkeydown=e=>{if(e.key==='Enter')$('#nx').click()};
    $('#qh').focus();
  }else{const f=$('#f'),fit=()=>{f.style.height='auto';f.style.height=f.scrollHeight+'px'};fit();f.oninput=fit;f.focus();
    const go=()=>{const v=f.value.trim();if(!v)return f.focus();done(v)};
    $('#nx').onclick=go;f.onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();go()}}}
}
/* O lead vai para o servidor (Cloudflare, /api/lead) no site publicado. Sem servidor, ou se o envio falhar, o visitante manda as respostas pelo WhatsApp. */
async function submit(){
  const l={id:Date.now().toString(36),mod:P.mod,mods:P.mods,...P.who,qa:P.qa.map(({q,a,tp})=>({q:String(q).slice(0,300),a:String(a).slice(0,1500),tp:String(tp||'').slice(0,40)})),status:'novo',data:new Date().toLocaleString('pt-BR'),entrega:'',t:Date.now()};
  P.rec=null;if(P.mods[0]==='guia'){const rec=recomendar(P.qa);l.mod=rec[0].k;l.mods=rec.map(x=>x.k);l.guia={rec,em:new Date().toISOString()};P.rec=rec}
  setL([l,...getL()]);rascLimpa();
  const dest=/^https:\/\//.test(LEAD_WEBHOOK)?LEAD_WEBHOOK:location.protocol==='https:'?'/api/lead':'';
  P.envio='local';
  if(dest){try{const r=await fetch(dest,{method:'POST',headers:{'Content-Type':'text/plain'},body:JSON.stringify(l),signal:AbortSignal.timeout(15000)});P.envio=r.ok?'ok':'falhou'}catch(e){P.envio='falhou'}}
  P.waTxt=('Olá! Respondi o briefing no site.\nNome: '+l.nome+'\nServiço: '+svcName(l)+'\n\n'+l.qa.map(x=>x.q+'\n'+x.a).join('\n\n')).slice(0,1800);
  P.done=P.who.nome.split(' ')[0];pub();
}
function thanks(){
  const falta=P.envio==='falhou',wa=wnum(CFG.whats);
  setApp(`${nav2()}<main class="wrap"><section class="sec" style="padding-top:clamp(40px,8vw,100px)">${falta?'':'<div class="okc"><svg width="40" height="40" viewBox="0 0 40 40"><path d="M10 21l7 7 13-15" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'}
  ${falta?`<h2>Falta um passo, ${esc(P.done)}.</h2><p class="sub">Não conseguimos registrar o seu briefing no nosso sistema agora. Envie as suas respostas pelo WhatsApp: a mensagem já vai pronta, é só apertar enviar.</p>`:`<h2>Recebemos, ${esc(P.done)}. Já estamos analisando.</h2><p class="sub">Em até 24 horas você recebe o seu plano e o orçamento no WhatsApp que informou.</p>`}${P.rec?recHtml(P.rec):''}${storeWarn()}
  ${falta?'':'<div class="steps"><div class="step"><b>1</b><h3>Briefing recebido</h3><p>Suas respostas já estão com a gente.</p></div><div class="step"><b>2</b><h3>Plano e 3 pacotes</h3><p>Revisamos a estratégia e o orçamento.</p></div><div class="step"><b>3</b><h3>Conversa no WhatsApp</h3><p>Enviamos tudo e tiramos dúvidas.</p></div></div>'}
  <div class="row">${wa?(falta?`<a class="btn" href="https://wa.me/${wa}?text=${encodeURIComponent(P.waTxt||'')}" target="_blank" rel="noopener noreferrer">Enviar meu briefing pelo WhatsApp</a>`:`<a class="btn" href="https://wa.me/${wa}" target="_blank" rel="noopener noreferrer">Falar com a gente agora</a>`):''}<button class="btn ghost" id="nv">Fazer outro briefing</button></div></section></main>`);
  $('#nv').onclick=()=>{P.mod=null;P.who=null;P.done=null;P.rec=null;P.qa=[];P.cur=null;pub()};
}
