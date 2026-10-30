/* Modal padrão: botão fechar, Esc, foco preso e devolvido, fundo travado, rolagem interna e aviso de alteração não salva (m.sujo) */
function dlg(label,html,o){
  o=o||{};const id=o.id||'sdlg',old=document.getElementById(id);if(old)old.remove();
  const m=document.createElement('div');m.id=id;m.className='modal';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label',label);
  m.innerHTML='<div class="mbox'+(o.larga?' larga':'')+'">'+(o.forced?'':'<button type="button" class="mx" aria-label="Fechar" data-mx>\u00d7</button>')+html+'</div>';
  if(o.forced)m.dataset.forced='1';
  const opener=document.activeElement,rm=m.remove.bind(m);
  m.remove=()=>{rm();if(!document.querySelector('.modal'))document.body.classList.remove('mlock');if(opener&&opener.isConnected&&opener.focus&&!document.querySelector('.modal'))opener.focus()};
  m.tenta=()=>{if(m.sujo&&m.sujo())confirma('Você tem alterações que ainda não foram salvas. Fechar mesmo assim?',()=>m.remove(),{ok:'Descartar e fechar',titulo:'Descartar alterações?'});else m.remove()};
  m.onclick=e=>{if(e.target===m&&!m.dataset.forced)m.tenta()};
  const x=m.querySelector('[data-mx]');if(x)x.onclick=()=>m.tenta();
  document.body.appendChild(m);document.body.classList.add('mlock');
  const f=m.querySelector('input,textarea,select,.btn')||m.querySelector('button');if(f)f.focus();return m;
}
function confirma(msg,fn,o){
  o=o||{};const m=dlg(o.titulo||'Confirmação','<h3>'+esc(o.titulo||'Confirmar')+'</h3><p>'+esc(msg)+'</p><div class="row"><button type="button" class="btn'+(o.perigo===false?'':' danger')+'" data-s>'+esc(o.ok||'Confirmar')+'</button><button type="button" class="btn ghost" data-n>Cancelar</button></div>',{id:'cdlg'});
  m.querySelector('[data-s]').onclick=()=>{fn();m.remove()};m.querySelector('[data-n]').onclick=()=>m.remove();m.querySelector('[data-n]').focus();return m;
}
const sim=(msg,o)=>new Promise(r=>{const m=confirma(msg,()=>r(true),o),rm=m.remove;m.remove=()=>{rm();r(false)}});
function aviso(msg){const m=dlg('Aviso','<p>'+esc(msg)+'</p><div class="row"><button class="btn" data-ok>Entendi</button></div>');m.querySelector('[data-ok]').onclick=()=>m.remove()}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('[data-priv]'))privacy()});
document.addEventListener('keydown',e=>{
  const ms=document.querySelectorAll('.modal'),m=ms[ms.length-1];if(!m)return;
  if(e.key==='Escape'){if(!m.dataset.forced){e.preventDefault();m.tenta?m.tenta():m.remove()}return}
  if(e.key!=='Tab')return;
  const f=[...m.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled])')].filter(x=>x.offsetParent!==null);if(!f.length)return;
  const a=f[0],z=f[f.length-1];
  if(!m.contains(document.activeElement)||(e.shiftKey&&document.activeElement===a)){e.preventDefault();(e.shiftKey?z:a).focus()}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus()}
});
function privacy(){
  const em=PRIV_EMAIL?esc(PRIV_EMAIL):'o WhatsApp pelo qual você falou com a gente';
  const m=dlg('Política de privacidade',`<h3>Política de privacidade</h3><div class="pv">
  <p><b>Quem cuida dos seus dados:</b> ${esc(CFG.brand)}${RESPONSAVEL?', serviço prestado por '+esc(RESPONSAVEL):''}, Rio de Janeiro. Contato para assuntos de dados: ${em}.</p>
  <p><b>O que coletamos:</b> nome, WhatsApp, e-mail (se você informar) e as respostas do briefing sobre o seu negócio. Evite escrever dados sensíveis ou de terceiros nas respostas.</p>
  <p><b>Para que usamos:</b> montar o seu plano e o orçamento e falar com você pelo WhatsApp. Não usamos para outra finalidade e não vendemos os seus dados. Base legal: o seu consentimento e procedimentos preliminares de um contrato que você pediu (LGPD, art. 7º, I e V).</p>
  <p><b>Inteligência artificial:</b> para gerar perguntas, resumo, plano e orçamento, o seu primeiro nome e as respostas do briefing (sem o seu WhatsApp e sem o seu e-mail) são enviados a serviços de IA de terceiros, como a Groq, que podem processar os dados fora do Brasil (transferência internacional, art. 33 da LGPD). Enviamos só o necessário para a tarefa. Uma pessoa da nossa equipe sempre revisa o resultado antes de enviar qualquer coisa a você.</p>
  <p><b>Onde ficam:</b> nos equipamentos da nossa equipe e nas pastas de backup da própria equipe. Ao abrir uma conversa, o seu número é usado pelo próprio WhatsApp. As fontes do site vêm do Google Fonts, e o Google vê o seu endereço IP.</p>
  <p><b>Por quanto tempo:</b> até ${RETENCAO_MESES} meses sem contratação, ou até você pedir a exclusão. Clientes em acompanhamento ficam enquanto durar o serviço.</p>
  <p><b>Vagas e banco de talentos:</b> se você se candidatar, guardamos nome, contato, área de interesse, link e mensagem só para o processo seletivo, por até ${RETENCAO_MESES} meses ou até você pedir a exclusão. Esses dados não são enviados a serviços de IA.</p>
  <p><b>Seus direitos (LGPD, art. 18):</b> saber quais dados temos, corrigir, receber uma cópia, pedir a exclusão e retirar o consentimento a qualquer momento, pelo contato acima.</p>
  <p class="hint">Versão ${PRIV_VERSAO}.</p></div><div class="row"><button class="btn" id="pvx">Entendi</button></div>`);
  m.querySelector('#pvx').onclick=()=>m.remove();
}
function trocarPin(forced){
  const m=dlg('Trocar PIN',`<h3>${forced?'Defina um PIN novo':'Trocar PIN'}</h3><p class="hint">Use pelo menos 6 caracteres.${forced?' O PIN padrão é público: sem trocar, ninguém entra na Minha área.':''}</p><label for="np1">Novo PIN</label><input id="np1" type="password" autocomplete="new-password"><label for="np2">Repita o PIN</label><input id="np2" type="password" autocomplete="new-password"><p class="err2" id="npe" role="alert"></p><div class="row"><button class="btn" id="npok">Salvar</button>${forced?'':'<button class="btn ghost" id="npc">Agora não</button>'}</div>`);
  if(forced){m.dataset.forced='1';m.onclick=null}else m.querySelector('#npc').onclick=()=>m.remove();
  m.querySelector('#npok').onclick=async()=>{
    const a=m.querySelector('#np1').value,b=m.querySelector('#np2').value,e=m.querySelector('#npe');
    if(a.length<6)return e.textContent='Use pelo menos 6 caracteres.';
    if(a!==b)return e.textContent='Os dois campos precisam ser iguais.';
    if(a===ADMIN_PIN||a==='1234')return e.textContent='Escolha um PIN diferente do padrão.';
    const h=await pinMake(a);
    CFG.pinh=h;delete CFG.pin;CFG.t=Date.now();saveCfg();diskSaveSoon();m.remove();
  };
}
async function diskPurge(id){
  if(typeof DISK==='undefined'||!DISK.dir||DISK.state==='off')return false;
  try{
    try{const cd=await DISK.dir.getDirectoryHandle('clientes');for await(const [n] of cd.entries())if(n.includes('_'+id+'.'))await cd.removeEntry(n)}catch(e){}
    const hd=await DISK.dir.getDirectoryHandle('historico');
    for await(const [n,h] of hd.entries()){
      if(h.kind!=='file')continue;const t=await rfile(hd,n);if(!t||!t.includes(id))continue;
      try{const o=JSON.parse(t);o.leads=(o.leads||[]).filter(x=>x.id!==id);await wfile(hd,n,JSON.stringify(o,null,1))}catch(e){}
    }
    return true;
  }catch(e){return false}
}
/* ids apagados (clientes e prospects): o backup não os traz de volta e a pasta do HD é limpa quando reconectar */
const apagados=()=>Array.isArray(CFG.apagados)?CFG.apagados.filter(x=>x&&typeof x.id==='string'):[];
const foiApagado=id=>apagados().some(x=>x.id===id);
function marcaApagado(id,hd){CFG.apagados=[...apagados().filter(x=>x.id!==id),{id,hd:!!hd,em:Date.now()}].slice(-1000);CFG.t=Date.now();saveCfg()}
async function purgaPendentes(){for(const x of apagados().filter(y=>!y.hd))if(await diskPurge(x.id))marcaApagado(x.id,true)}
async function apagarLead(id,ask){
  const l=getL().find(x=>x.id===id);if(!l)return;
  if(ask&&!(await sim('Apagar "'+l.nome+'" e todos os dados deste cliente (briefing, plano, orçamentos e acompanhamento)? Não dá para desfazer.',{ok:'Apagar',titulo:'Apagar cliente?'})))return;
  const ex=((l.track&&l.track.campanhas)||[]).flatMap(c=>(c.exemplos||[]).map(x=>x.id));
  setL(getL().filter(x=>x.id!==id));marcaApagado(id,false);
  await Promise.all([arqDelPref('site:'+id+':'),...ex.map(e=>arqDel('cx:'+e))]).catch(()=>{});
  if(await diskPurge(id))marcaApagado(id,true);
}
async function limparAntigos(){
  const lim=Date.now()-RETENCAO_MESES*30*864e5;
  const v=getL().filter(l=>(l.t||0)<lim&&l.status!=='aplicado'&&l.status!=='aprovado');
  if(!v.length)return aviso('Nenhum lead sem contratação com mais de '+RETENCAO_MESES+' meses.');
  if(!(await sim(v.length+' lead(s) parado(s) há mais de '+RETENCAO_MESES+' meses serão apagados de vez, inclusive do backup no HD. Continuar?',{ok:'Apagar',titulo:'Apagar leads antigos?'})))return;
  for(const l of v)await apagarLead(l.id,false);A.sel=null;admin();
}
document.addEventListener('click',async e=>{
  const b=e.target.closest&&e.target.closest('#lgd,#lgx,#npin,#lclean');if(!b||!A.auth)return;
  if(b.id==='npin')return trocarPin(false);
  if(b.id==='lclean')return limparAntigos();
  const l=getL().find(x=>x.id===A.sel);if(!l)return;
  if(b.id==='lgx')return dl('dados-'+l.id+'.json',JSON.stringify(l,null,1),'application/json');
  await apagarLead(l.id,true);A.sel=null;paintList();paintDet();
});
let lastAct=Date.now();
['click','keydown','pointermove'].forEach(ev=>addEventListener(ev,()=>{lastAct=Date.now()},{passive:true}));
setInterval(()=>{if(A.auth&&Date.now()-lastAct>15*60*1000){A.auth=false;if(V==='admin')admin()}},30000);
document.addEventListener('click',e=>{if(e.target.id==='skipl'){const m=document.querySelector('#app main');if(m){m.setAttribute('tabindex','-1');m.focus()}}});
const cfgSafe=()=>({...semChave(),pin:undefined,lembrar:undefined});
const wnum=n=>{let d=String(n||'').replace(/\D/g,'').replace(/^0+/,'');if(d.length===10||d.length===11)d='55'+d;return /^55\d{10,11}$/.test(d)?d:''};
function md(t){return esc(t).replace(/```(\w*)\n([\s\S]*?)(```|$)/g,'<pre>$2</pre>').replace(/^### (.*)$/gm,'<h3>$1</h3>').replace(/^#{1,2} (.*)$/gm,'<h2>$1</h2>')
 .replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/^\s*[-*] (.*)$/gm,'<li>$1</li>').replace(/(<li>.*<\/li>\n?)+/g,m=>'<ul>'+m+'</ul>').replace(/\n(?!<)/g,'<br>')}
const qaOf=l=>l.qa||MODS[l.mod].qs.map(([k,q])=>({q,a:(l.ans||{})[k]||''}));
const brief=l=>`Cliente (primeiro nome): ${String(l.nome||'').split(' ')[0]}\n`+(l.guia?guiaNota(l):'')+'<briefing>\n'+(l.ficha?`RESUMO CONFIRMADO (fonte da verdade, nunca contrarie):\n${l.ficha}\n\nRespostas originais:\n`:'')+qaOf(l).map(x=>`- ${x.q} ${x.a}`).join('\n')+'\n</briefing>'+`\n\nTarefa: ${(l.mods&&l.mods.length>1)?'Entregue um plano integrado, com uma parte para cada serviço contratado.\n\n'+l.mods.filter(k=>MODS[k]).map((k,i)=>'PARTE '+(i+1)+' - '+MODS[k].name+': '+MODS[k].task).join('\n\n'):MODS[l.mod].task}`;
const setApp=h=>{document.querySelectorAll('.v-cap').forEach(n=>n.remove());app.innerHTML=h;const mn=app.querySelector('main');if(mn&&!mn.id)mn.id='conteudo';vida();
  app.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>nav(b.dataset.nav));
  app.querySelectorAll('[data-home]').forEach(b=>b.onclick=()=>{P.mod=null;P.mods=[];P.cur=null;P.done=null;P.who=null;P.page=null;nav('pub')});
  app.querySelectorAll('[data-vagas]').forEach(b=>b.onclick=()=>{P.page='vagas';P.mod=null;P.mods=[];P.cur=null;P.who=null;P.done=null;pub();window.scrollTo(0,0)});
  app.querySelectorAll('[data-scroll]').forEach(b=>b.onclick=()=>{const nv=app.querySelector('.nav');if(nv){nv.classList.remove('mopen');const mb=nv.querySelector('[data-menu]');if(mb)mb.setAttribute('aria-expanded','false')}const e=document.getElementById(b.dataset.scroll);if(e&&e.scrollIntoView)e.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});
  app.querySelectorAll('[data-menu]').forEach(b=>b.onclick=()=>{const nv=b.closest('.nav'),o=nv.classList.toggle('mopen');b.setAttribute('aria-expanded',o?'true':'false')})};
const storeWarn=()=>STORE_OK?'':`<div class="warn">Seu navegador está bloqueando o armazenamento. Os leads ficam só nesta aba. Abra o arquivo direto no Chrome ou Edge (duplo clique) para salvar de verdade.</div>`;
