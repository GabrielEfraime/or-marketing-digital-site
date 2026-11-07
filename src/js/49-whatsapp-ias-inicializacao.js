const WAI='<svg class="wai" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a9 9 0 00-7.7 13.6L3 21l4.5-1.2A9 9 0 1012 3z"/><path d="M9.2 8.4c.2 2.700 2.600 5.200 5.600 5.900l1.100-1.400-1.900-.9-.8.800a4.700 4.700 0 01-2.200-2.300l.8-.8-.9-1.900z"/></svg>';
function waOpen(id){
  const l=getL().find(x=>x.id===id);if(!l)return;
  const old=document.getElementById('wam');if(old)old.remove();
  const ult=(l.envios||[]).slice(-1)[0];
  const m=dlg('Enviar orçamento no WhatsApp',`<h3>Enviar orçamento no WhatsApp</h3><p class="hint">Revise a mensagem. O WhatsApp abre com o texto pronto e você só aperta enviar.${ult?' <b>Já enviado em '+esc(ult.quando)+'.</b>':''}</p>
  <label for="wa_t">Para: ${esc(l.nome)} (WhatsApp com DDD)</label><input id="wa_t" value="${esc(l.whats)}" inputmode="tel" autocomplete="off">
  <label for="wa_m">Mensagem</label><textarea id="wa_m" style="min-height:260px">${esc(l.msg||'')}</textarea><p class="hint" id="wa_i"></p>
  <label class="tg2b"><input type="checkbox" id="wa_k" checked> Marcar como enviado ao abrir o WhatsApp</label>
  <div class="row"><button class="btn wa" id="wa_a">${WAI} Abrir no WhatsApp</button><button class="btn ghost" id="wa_w">WhatsApp Web</button><button class="btn ghost" id="wa_c">Copiar mensagem</button><button class="btn ghost" id="wa_x">Fechar</button></div><p class="hint" id="wa_s" role="status"></p>`,{id:'wam'});
  const q=s=>m.querySelector(s),close=()=>m.tenta();
  m.sujo=()=>{const c=getL().find(x=>x.id===id)||l;return q('#wa_m').value!==(c.msg||'')||q('#wa_t').value!==(c.whats||'')};
  const info=()=>{const t=q('#wa_m').value,d=q('#wa_t').value.replace(/\D/g,'');
    q('#wa_i').textContent=t.length+' caracteres'+(encodeURIComponent(t).length>1800?' · mensagem longa: se o WhatsApp cortar o texto, use "Copiar mensagem" e cole na conversa.':'')+(d.length<10?' · confira o número: faltam dígitos (DDD + número).':'')};
  q('#wa_m').oninput=info;q('#wa_t').oninput=info;info();
  q('#wa_x').onclick=close;
  q('#wa_c').onclick=()=>{copiar(q('#wa_m').value).then(ok=>{q('#wa_s').textContent=ok?'Mensagem copiada.':'O navegador não deixou copiar. Selecione o texto e copie com Ctrl+C.'})};
  const go=via=>{
    const t=q('#wa_m').value.trim(),tel=q('#wa_t').value.trim();
    if(!t){q('#wa_s').textContent='A mensagem está vazia. Gere o orçamento primeiro.';return}
    if(tel.replace(/\D/g,'').length<10){q('#wa_s').textContent='Confira o número do cliente (DDD + número).';q('#wa_t').focus();return}
    const cur=getL().find(x=>x.id===id),envios=(cur.envios||[]).slice();
    if(q('#wa_k').checked)envios.push({em:new Date().toISOString(),quando:new Date().toLocaleString('pt-BR'),via});
    upd(id,{msg:t,whats:tel,envios});
    const num=wnum(tel),enc=encodeURIComponent(t);
    window.open(via==='web'?'https://web.whatsapp.com/send?phone='+num+'&text='+enc:'https://wa.me/'+num+'?text='+enc,'_blank','noopener,noreferrer');
    q('#wa_s').textContent=q('#wa_k').checked?'WhatsApp aberto e orçamento marcado como enviado. Confira e aperte enviar lá.':'WhatsApp aberto. Confira e aperte enviar lá.';
    paintList();paintDet();
  };
  q('#wa_a').onclick=()=>go('app');q('#wa_w').onclick=()=>go('web');
  q('#wa_m').focus();
}

/* Orçamento por e-mail: abre o programa de e-mail (mailto) ou o Gmail já na conta da empresa, com a mensagem pronta. Quem aperta enviar é o consultor: o site não manda e-mail sozinho. */
function emOpen(id){
  const l=getL().find(x=>x.id===id);if(!l)return;
  const old=document.getElementById('emm');if(old)old.remove();
  const NL=String.fromCharCode(10),ult=(l.envios||[]).filter(x=>x.via==='email').slice(-1)[0],ass=NL+NL+'Gabriel Efraime'+NL+CFG.brand+(PRIV_EMAIL?' · '+PRIV_EMAIL:'');
  const m=dlg('Enviar orçamento por e-mail',`<h3>Enviar orçamento por e-mail</h3><p class="hint">Revise o texto. O e-mail abre pronto e você só aperta enviar.${PRIV_EMAIL?' No Gmail, ele abre na conta '+esc(PRIV_EMAIL)+' (precisa estar conectada neste navegador).':''}${ult?' <b>Já enviado por e-mail em '+esc(ult.quando)+'.</b>':''}</p>
  <label for="em_t">Para: ${esc(l.nome)}</label><input id="em_t" type="email" value="${esc(l.email||'')}" placeholder="e-mail do cliente" autocomplete="off">
  <label for="em_s">Assunto</label><input id="em_s" value="${esc('Orçamento | '+CFG.brand)}">
  <label for="em_m">Mensagem</label><textarea id="em_m" style="min-height:260px">${esc((l.msg||'')+ass)}</textarea><p class="hint" id="em_i"></p>
  <label class="tg2b"><input type="checkbox" id="em_k" checked> Marcar como enviado ao abrir o e-mail</label>
  <div class="row"><button class="btn" id="em_a">Abrir no app de e-mail</button><button class="btn ghost" id="em_g">Abrir no Gmail</button><button class="btn ghost" id="em_c">Copiar texto</button><button class="btn ghost" id="em_x">Fechar</button></div><p class="hint" id="em_s2" role="status"></p>`,{id:'emm'});
  const q=s=>m.querySelector(s),close=()=>m.tenta();
  m.sujo=()=>q('#em_m').value!==((l.msg||'')+ass)||q('#em_t').value!==(l.email||'');
  const info=()=>{const n=encodeURIComponent(q('#em_m').value).length;q('#em_i').textContent=q('#em_m').value.length+' caracteres'+(n>1800?' · texto longo: alguns programas de e-mail cortam. Se cortar, use "Abrir no Gmail" ou "Copiar texto".':'')};
  q('#em_m').oninput=info;info();q('#em_x').onclick=close;
  q('#em_c').onclick=()=>{copiar(q('#em_m').value).then(ok=>{q('#em_s2').textContent=ok?'Texto copiado.':'O navegador não deixou copiar. Selecione o texto e copie com Ctrl+C.'})};
  const go=via=>{
    const to=q('#em_t').value.trim(),su=q('#em_s').value.trim(),corpo=q('#em_m').value;
    if(!corpo.trim()){q('#em_s2').textContent='A mensagem está vazia. Gere o orçamento primeiro.';return}
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)){q('#em_s2').textContent='Confira o e-mail do cliente.';q('#em_t').focus();return}
    const enc=encodeURIComponent;
    if(via==='gmail')window.open('https://mail.google.com/mail/?authuser='+enc(PRIV_EMAIL)+'&view=cm&fs=1&to='+enc(to)+'&su='+enc(su)+'&body='+enc(corpo),'_blank','noopener,noreferrer');
    else{const a=document.createElement('a');a.href='mailto:'+enc(to)+'?subject='+enc(su)+'&body='+enc(corpo);document.body.appendChild(a);a.click();a.remove()}
    const cur=getL().find(x=>x.id===id),envios=(cur.envios||[]).slice();
    if(q('#em_k').checked)envios.push({em:new Date().toISOString(),quando:new Date().toLocaleString('pt-BR'),via:'email'});
    upd(id,{email:to,envios});
    q('#em_s2').textContent=q('#em_k').checked?'E-mail aberto e orçamento marcado como enviado. Confira e aperte enviar lá.':'E-mail aberto. Confira e aperte enviar lá.';
    paintList();paintDet();
  };
  q('#em_a').onclick=()=>go('app');q('#em_g').onclick=()=>go('gmail');
  q('#em_t').focus();
}

const urlAtual=l=>((qaOf(l).find(x=>/endereço do site atual/i.test(x.q))||{}).a||'').trim();

function iaCard(s,t,d){
  const c=CFG[s];
  return `<div class="panel iacard"><h3>${t}</h3><p class="hint">${d}</p>
  <label for="${s}k">Plataforma</label><select id="${s}k">${Object.entries(IAKIND).map(([k,v])=>`<option value="${k}" ${c.kind===k?'selected':''}>${v}</option>`).join('')}</select>
  <label for="${s}u">Endereço (URL)</label><input id="${s}u" value="${esc(c.url)}">
  <label for="${s}m">Modelo</label><input id="${s}m" list="${s}l" value="${esc(c.model)}"><datalist id="${s}l"></datalist>
  <div id="${s}kw"><label for="${s}c">Chave da API</label><input id="${s}c" type="password" placeholder="${c.key?'Chave salva (deixe vazio para manter)':'Cole a chave aqui'}" autocomplete="off" spellcheck="false"></div>
  <div class="row"><button class="btn ghost" id="${s}t">Testar</button><button class="btn ghost" id="${s}f">Ver modelos disponíveis</button></div><p class="hint" id="${s}r"></p></div>`;
}
function iasInner(){
  return `<h2 class="pt">IAs</h2><p class="hint">As IAs rodam na Groq, cada uma com uma função. A <b>IA 1</b> (Qwen 3.8 27B) cria posts, legendas, roteiros, textos das artes, kits e mensagens. A <b>IA 2</b> (GPT-OSS 120B) planeja e atende: calendário editorial, demandas, estratégia, briefing, orçamento, perfil do cliente, anúncios e relatórios. A <b>IA 3</b> (GPT-OSS 120B) cuida da captação de clientes. Cole a chave da Groq em uma delas e as outras usam a mesma. As imagens das artes saem pelo Pollinations, e o Gemini fica de reserva de emergência. Se uma IA falhar, o site tenta as outras e avisa quem respondeu.</p>
  <p class="hint">Sem servidor (como no site do GitHub), as chaves ficam cifradas só neste navegador. Em outro computador ou navegador, cole de novo.</p>
  <div class="iag">${iaCard('ia1','IA 1 · Criação','Posts, legendas, roteiros, textos das artes, kits de execução e mensagens.')}${iaCard('ia2','IA 2 · Estratégia e atendimento','Calendário editorial, demandas, estratégia, briefing, orçamento, perfil do cliente, anúncios e relatórios.')}${iaCard('ia3','IA 3 · Captação de clientes','Busca de clientes, site de prévia e mensagem de abordagem.')}
  <div class="panel iacard"><h3>Imagens das artes · Pollinations</h3><p class="hint">A Groq não gera imagem. O botão "Criar imagem com IA" usa o Pollinations: crie a conta em enter.pollinations.ai (entra com o GitHub), gere uma chave secreta (começa com sk_) e cole aqui. Cada imagem custa frações de centavo em Pollen, e a conta nova ganha créditos para começar.</p>
  <label for="polc">Chave do Pollinations</label><input id="polc" type="password" placeholder="${CFG.pol.key?'Chave salva (deixe vazio para manter)':'Cole a chave aqui'}" autocomplete="off" spellcheck="false">
  <div class="row"><button class="btn ghost" id="polt">Testar</button></div><p class="hint" id="polr" role="status"></p></div>
  <div class="panel iacard"><h3>Reserva de emergência · Gemini</h3><p class="hint">Se a Groq falhar ou estiver sem chave, o texto sai pelo Gemini, com um aviso na tela. Se o Pollinations falhar, o site também tenta a imagem pelo Gemini (imagem só sai com o faturamento da chave ativo; o texto funciona no plano gratuito).</p>
  <label for="imgc">Chave do Gemini</label><input id="imgc" type="password" placeholder="${CFG.img.key?'Chave salva (deixe vazio para manter)':'Cole a chave aqui'}" autocomplete="off" spellcheck="false">
  <div class="row"><button class="btn ghost" id="imgt">Testar</button></div><p class="hint" id="imgr" role="status"></p></div></div>
  <div class="panel">${Object.keys(IA_LIM).length?'<h4>Limites que a Groq informou</h4><ul class="cx">'+Object.entries(IA_LIM).map(([m,v])=>'<li><b>'+esc(m)+'</b>: '+(v.tpm?int(v.tpm)+' tokens por minuto':'limite não informado')+' <span class="hint">(aviso de '+esc(new Date(v.em||0).toLocaleString('pt-BR'))+')</span></li>').join('')+'</ul><p class="hint">O site encolhe os pedidos para caber nesses limites. Para limites maiores, o plano pago da Groq (Developer) cobra por uso: confira o preço atual em console.groq.com.</p>':''}</div>
  <label class="tg2b"><input type="checkbox" id="lemb" ${CFG.lembrar===false?'':'checked'}> Lembrar as chaves neste computador</label><p class="hint">As chaves ficam cifradas (AES-GCM) só neste navegador, separadas das configurações, e não entram em backup nem em exportação. Desmarcado, elas valem só até fechar a aba. Protege contra leitura casual; não protege de quem usa este computador.</p>
  <div class="row"><button class="btn" id="iasave">Salvar</button><button class="btn ghost" id="iaclr">Apagar as chaves</button></div><p class="hint" id="iam"></p>`;
}
let talQ='';
function talInner(){
  const l=getT().filter(t=>!talQ||norm([t.nome,t.area,t.vaga,t.email].join(' ')).includes(norm(talQ))),wa=t=>{let d=String(t.whats).replace(/\D/g,'');if(d.length<=11)d='55'+d;return 'https://wa.me/'+d};
  return `<h3 class="pt2">Banco de dados de currículos</h3><p class="hint">Todos os cadastros recebidos pela página de vagas, com ou sem vaga específica. Ficam só neste navegador. Guarde só o necessário e apague quando o processo terminar.</p><div class="dsh-f"><label class="dsh-q">Buscar por nome, área ou vaga<input id="tq" type="search" maxlength="80" value="${esc(talQ)}"></label></div><div class="row"><button class="btn ghost" id="tclean">Apagar cadastros com mais de ${RETENCAO_MESES} meses</button></div>${l.length?l.map(t=>`<div class="panel tal"><h3>${esc(t.nome)}</h3><p class="hint">${esc(t.data)} · ${esc(t.area)} · ${esc(t.vaga||'Banco de talentos')}</p><p>${t.whats?'WhatsApp: '+esc(t.whats):''}${t.email?' · E-mail: '+esc(t.email):''}</p>${webLink(t.link)?'<p><a href="'+esc(webLink(t.link))+'" target="_blank" rel="noopener noreferrer">'+esc(t.link)+'</a></p>':''}${t.msg?'<p class="tmsg">'+esc(t.msg)+'</p>':''}<div class="row">${t.whats?'<a class="btn wa" href="'+wa(t)+'" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>':''}<button class="btn ghost" data-tdel="${esc(t.id)}">Apagar</button></div></div>`).join(''):'<p class="hint" style="margin-top:16px">'+(talQ?'Nenhum cadastro encontrado para essa busca.':'Nenhum cadastro ainda.')+'</p>'}`;
}
function bindTal(){
  const q=document.getElementById('tq');if(q)q.oninput=()=>{talQ=q.value;const p=q.selectionStart;admin();const n=document.getElementById('tq');if(n){n.focus();n.setSelectionRange(p,p)}};
  document.querySelectorAll('[data-tdel]').forEach(b=>b.onclick=()=>confirma('Apagar este cadastro? Não dá para desfazer.',()=>{cvDel(b.dataset.tdel);setT(getT().filter(t=>t.id!==b.dataset.tdel));admin()},{ok:'Apagar',titulo:'Apagar cadastro?'}));
  $('#tclean').onclick=()=>{const lim=Date.now()-RETENCAO_MESES*30*864e5,v=getT().filter(t=>t.t<lim);if(!v.length)return aviso('Nenhum cadastro com mais de '+RETENCAO_MESES+' meses.');confirma(v.length+' cadastro(s) serão apagados. Continuar?',()=>{v.forEach(x=>cvDel(x.id));setT(getT().filter(t=>t.t>=lim));admin()},{ok:'Apagar',titulo:'Apagar cadastros antigos?'})};
}
function bindIas(){
  const rd=s=>({kind:$('#'+s+'k').value,url:$('#'+s+'u').value.trim(),model:$('#'+s+'m').value.trim(),key:($('#'+s+'c')&&$('#'+s+'c').value.trim())||CFG[s].key||''});
  const test=async(c,r)=>{const t0=Date.now();r.textContent='Testando…';
    try{const out=await ask([{role:'user',content:'Responda só com a palavra: ok'}],()=>{},{cfg:c,max:30});r.textContent='Respondeu em '+((Date.now()-t0)/1000).toFixed(1)+'s ('+(out||'sem texto').slice(0,30)+').'}
    catch(e){r.textContent=e.message}};
  for(const s of IAS){
    $('#'+s+'k').onchange=e=>{const d=IADEF[e.target.value];$('#'+s+'u').value=d.url;$('#'+s+'m').value=d.model};
    $('#'+s+'t').onclick=()=>test(rd(s),$('#'+s+'r'));
    $('#'+s+'f').onclick=async()=>{const c=rd(s),r=$('#'+s+'r');
      try{
        if(c.kind==='openai'){const j=await (await fetch((c.url||IADEF.openai.url).replace(/\/$/,'')+'/models',{headers:{Authorization:'Bearer '+c.key}})).json();const n=(j.data||[]).map(m=>m.id);
          $('#'+s+'l').innerHTML=n.map(x=>`<option value="${esc(x)}">`).join('');r.textContent=n.length?n.length+' modelos disponíveis. Clique no campo Modelo para escolher.':'A plataforma não listou modelos. Confira a chave.'}
        else r.textContent='Esta plataforma não lista modelos.';
      }catch(e){r.textContent='Não consegui listar. Confira a chave, o endereço e a internet.'}};
  }
  $('#iaclr').onclick=()=>{IA_CHAVES.forEach(s=>{CFG[s].key=''});saveCfg();keysSave(true);$('#iam').textContent='Chaves apagadas deste navegador.';document.querySelectorAll('#ia1c,#ia2c,#ia3c,#imgc,#polc').forEach(i=>{i.value='';i.placeholder='Cole a chave aqui'})};
  $('#iasave').onclick=async()=>{Object.assign(CFG,{ia1:rd('ia1'),ia2:rd('ia2'),ia3:rd('ia3'),img:{...CFG.img,key:$('#imgc').value.trim()||CFG.img.key||''},pol:{...CFG.pol,key:$('#polc').value.trim()||CFG.pol.key||''},lembrar:$('#lemb').checked,t:Date.now()});
    sset('cfg2',JSON.stringify(semChave()));diskSaveSoon();$('#iam').textContent='Salvando…';
    const r=await keysSave(true),n=IA_CHAVES.filter(s=>CFG[s].key).length;
    $('#iam').textContent=!n?'Salvo. Nenhuma chave foi colada ainda.':r==='ok'?'Salvo. '+n+' chave(s) cifrada(s) neste navegador. Clique em Testar em cada IA.':r==='aba'?'Salvo, mas as chaves valem só até fechar esta aba'+(CFG.lembrar===false?' (você desmarcou "Lembrar as chaves").':': este navegador não deixou guardar com cifra (janela anônima ou armazenamento bloqueado).'):'Salvei a configuração, mas NÃO consegui guardar as chaves. Abra o site pelo endereço normal (não em janela anônima) e tente de novo.';
    document.querySelectorAll('#ia1c,#ia2c,#ia3c,#imgc,#polc').forEach(i=>{i.value='';const s=i.id.slice(0,3);i.placeholder=CFG[s].key?'Chave salva (deixe vazio para manter)':'Cole a chave aqui'})};
  $('#imgt').onclick=async()=>{const r=$('#imgr'),k=$('#imgc').value.trim()||keyDe(CFG.img);if(!k){r.textContent='Cole a chave do Gemini primeiro.';return}r.textContent='Testando…';
    try{const x=await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=1',{headers:{'x-goog-api-key':k}});r.textContent=x.ok?'O Google aceitou a chave. Ela já serve de reserva para o texto; imagem só com o faturamento ativo.':'O Google recusou a chave (erro '+x.status+'). Confira e cole de novo.'}
    catch(e){r.textContent='Não consegui falar com o Google. Confira a internet.'}};
  $('#polt').onclick=async()=>{const r=$('#polr'),k=$('#polc').value.trim()||keyDe(CFG.pol);if(!k){r.textContent='Cole a chave do Pollinations primeiro.';return}r.textContent='Testando…';
    try{const x=await fetch('https://gen.pollinations.ai/account/key',{headers:{Authorization:'Bearer '+k}});r.textContent=x.ok?'O Pollinations aceitou a chave. Clique em Salvar para guardar.':'O Pollinations recusou a chave (erro '+x.status+'). Use a chave secreta, que começa com sk_.'}
    catch(e){r.textContent='Não consegui falar com o Pollinations. Confira a internet.'}};
}

/* o título do site vem do SEO (src/seo.json); a IA não é chamada nem aquecida ao abrir o site */
if(!document.title)document.title=CFG.brand;
render();
diskInit();
addEventListener('hashchange',()=>{if(location.hash==='#/admin'&&V!=='admin')render()});
keysLoad().then(()=>{if(IAS.some(s=>CFG[s].key)&&A.auth&&A.view==='ias')admin()});