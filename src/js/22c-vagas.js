/* ====== Vagas na Minha área: criar, editar, publicar, pausar, encerrar, arquivar e acompanhar candidatos ======
   Ficam em localStorage ('vagas2'), só neste navegador. A página pública do site lê a constante VAGAS (05-dados-leads.js):
   para publicar de verdade use "Copiar código das vagas publicadas" e cole lá. Candidatos vêm do cadastro público (aba Banco de dados). */
const VG_ESTADOS=['rascunho','publicada','pausada','encerrada','arquivada'];
const VG_TIPOS=['CLT','PJ','Estágio','Temporário','Freelancer','Outro'];
const VG_MODELOS=['Presencial','Híbrido','Remoto'];
const VG_ETAPAS=['Recebido','Em análise','Triagem humana','Entrevista','Avaliação técnica','Etapa final','Aprovado','Não selecionado','Desistência'];
const VG_ETAPAS_PADRAO=['Triagem do cadastro','Conversa com a equipe','Etapa final'];
const vgLinhas=(v,n,m)=>String(v==null?'':v).split('\n').map(x=>txtT(x,m||200)).filter(Boolean).slice(0,n||20);
const vgData=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''))?String(v):'';
function cleanV(o){
  if(!o||typeof o!=='object'||Array.isArray(o)||!ID_OK.test(String(o.id||'')))return null;
  const pick=(x,l,d)=>l.includes(x)?x:d;
  return {id:String(o.id),titulo:txtT(o.titulo,100),depto:txtT(o.depto,100),area:pick(o.area,AREAS,AREAS[0]),descricao:txtT(o.descricao,1500,1),
    resp:vgLinhas(Array.isArray(o.resp)?o.resp.join('\n'):o.resp),reqObr:vgLinhas(Array.isArray(o.reqObr)?o.reqObr.join('\n'):o.reqObr),reqDes:vgLinhas(Array.isArray(o.reqDes)?o.reqDes.join('\n'):o.reqDes),comp:vgLinhas(Array.isArray(o.comp)?o.comp.join('\n'):o.comp),
    tipo:pick(o.tipo,VG_TIPOS,VG_TIPOS[0]),modelo:pick(o.modelo,VG_MODELOS,VG_MODELOS[0]),local:txtT(o.local,100),salario:txtT(o.salario,80),beneficios:txtT(o.beneficios,300),jornada:txtT(o.jornada,100),
    qtd:Math.min(99,Math.max(1,parseInt(o.qtd,10)||1)),abertura:vgData(o.abertura),prazo:vgData(o.prazo),etapas:vgLinhas(Array.isArray(o.etapas)?o.etapas.join('\n'):o.etapas,12,60),extra:txtT(o.extra,600,1),
    estado:pick(o.estado,VG_ESTADOS,'rascunho'),t:Number(o.t)||0,
    hist:(Array.isArray(o.hist)?o.hist:[]).filter(x=>x&&typeof x==='object').map(x=>({em:txtT(x.em,40),txt:txtT(x.txt,160)})).slice(-30)};
}
const getV=()=>{try{const a=JSON.parse(sget('vagas2')||'[]');return Array.isArray(a)?a.map(cleanV).filter(Boolean):[]}catch(e){return[]}};
const setV=a=>sset('vagas2',JSON.stringify(a.slice(0,100)));
const vgAberta=v=>v.estado==='publicada'&&(!v.prazo||v.prazo>=today());
const vgPublico=v=>({titulo:v.titulo,area:v.area,local:v.local,modelo:v.modelo,descricao:v.descricao,requisitos:v.reqObr});
/* lista usada pela página pública: as da constante VAGAS e, só quando você está na Minha área, as publicadas aqui (prévia) */
const vagasLista=()=>VAGAS.concat(A.auth?getV().filter(vgAberta).map(vgPublico):[]);
const vgNovoId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const vgVazia=()=>({id:'',titulo:'',depto:'',area:AREAS[0],descricao:'',resp:[],reqObr:[],reqDes:[],comp:[],tipo:'CLT',modelo:'Presencial',local:'',salario:'',beneficios:'',jornada:'',qtd:1,abertura:today(),prazo:'',etapas:VG_ETAPAS_PADRAO.slice(),extra:'',estado:'rascunho',t:0,hist:[]});
const vgFiltro={estado:'',q:''};
const vgCands=v=>getT().filter(t=>t.vaga===v.titulo);

function vgMuda(id,estado,txt){
  const a=getV(),v=a.find(x=>x.id===id);if(!v)return;
  v.estado=estado;v.t=Date.now();v.hist=[...(v.hist||[]),{em:new Date().toLocaleString('pt-BR'),txt}].slice(-30);setV(a);ativAdd('vaga','Vaga "'+v.titulo+'": '+txt,'');
}
function vgValida(f,publicar){
  const e=[],T=(k,m)=>{if(!f[k])e.push([k,m])};
  T('titulo','Escreva o título da vaga.');
  if(publicar){T('depto','Informe a empresa ou o departamento.');T('descricao','Escreva a descrição da vaga.');if(!f.reqObr.length)e.push(['reqObr','Liste ao menos um requisito obrigatório.']);if(f.modelo!=='Remoto')T('local','Informe a localidade (ou escolha o modelo Remoto).');if(!f.abertura)e.push(['abertura','Informe a data de abertura.'])}
  if(f.prazo&&f.abertura&&f.prazo<f.abertura)e.push(['prazo','O prazo de candidatura não pode ser antes da abertura.']);
  if(f.titulo&&getV().some(x=>x.id!==f.id&&x.estado!=='arquivada'&&x.titulo.toLowerCase()===f.titulo.toLowerCase()))e.push(['titulo','Já existe outra vaga com este título. Use um título diferente para não misturar candidatos.']);
  return e;
}
function vgLe(){
  const g=id=>(document.getElementById(id)||{}).value||'';
  return cleanV({id:A.vg==='novo'?'tmp':A.vg,titulo:g('vg-titulo'),depto:g('vg-depto'),area:g('vg-area'),descricao:g('vg-descricao'),resp:g('vg-resp'),reqObr:g('vg-reqObr'),reqDes:g('vg-reqDes'),comp:g('vg-comp'),tipo:g('vg-tipo'),modelo:g('vg-modelo'),local:g('vg-local'),salario:g('vg-salario'),beneficios:g('vg-beneficios'),jornada:g('vg-jornada'),qtd:g('vg-qtd'),abertura:g('vg-abertura'),prazo:g('vg-prazo'),etapas:g('vg-etapas'),extra:g('vg-extra'),estado:(A.vgForm&&A.vgForm.estado)||'rascunho'});
}
const vgChip=e=>`<span class="chip ${e==='publicada'?'aprovado':e==='rascunho'?'novo':e==='pausada'?'pronto':'recusado'}">${esc(e)}</span>`;

const vgTabs=()=>`<div class="tabs" role="tablist" aria-label="Vagas">${[['','Vagas'],['db','Banco de dados ('+getT().length+')']].map(([k,n])=>`<button type="button" class="tab ${(A.vgTab||'')===k?'on':''}" data-vgtab="${k}" role="tab" aria-selected="${(A.vgTab||'')===k}">${n}</button>`).join('')}</div>`;
function vagasInner(){
  if(A.vgc)return vgCandInner();
  if(A.vg)return vgFormInner();
  if(A.vgTab==='db')return '<h2 class="pt">Vagas</h2>'+vgTabs()+talInner();
  const a=getV().filter(v=>(!vgFiltro.estado?v.estado!=='arquivada':v.estado===vgFiltro.estado)&&(!vgFiltro.q||norm(v.titulo).includes(norm(vgFiltro.q)))).sort((x,y)=>y.t-x.t);
  const pub=getV().filter(vgAberta);
  return `<h2 class="pt">Vagas</h2>${vgTabs()}<p class="hint">Crie e acompanhe as vagas. Elas ficam salvas só neste navegador.</p>${storeWarn()}
  <div class="row"><button class="btn" id="vg-nova">+ Nova vaga</button><button class="btn ghost" id="vg-exp" ${pub.length?'':'disabled'}>Copiar código das vagas publicadas</button></div><p class="hint" id="vg-msg" role="status"></p>
  <p class="hint">Publicada aqui, a vaga aparece na página pública só para você, nesta tela (prévia). Para os visitantes verem, copie o código e cole na constante <b>VAGAS</b> do projeto (<code>src/js/05-dados-leads.js</code>), depois monte o site de novo.</p>
  <div class="dsh-f"><label>Estado<select id="vg-fe"><option value="">Todas, menos arquivadas</option>${VG_ESTADOS.map(e=>`<option ${vgFiltro.estado===e?'selected':''}>${e}</option>`).join('')}</select></label><label class="dsh-q">Buscar<input id="vg-fq" type="search" maxlength="80" placeholder="Título da vaga" value="${esc(vgFiltro.q)}"></label></div>
  ${a.length?`<div class="tbw"><table class="tbl vgt"><thead><tr><th>Vaga</th><th>Estado</th><th>Candidatos</th><th>Prazo</th><th>Ações</th></tr></thead><tbody>${a.map(v=>{
    const n=vgCands(v).length,ac=[];
    ac.push(`<button class="btn ghost sm" data-vg="ed" data-id="${esc(v.id)}">Editar</button>`,`<button class="btn ghost sm" data-vg="cand" data-id="${esc(v.id)}">Candidatos</button>`);
    if(v.estado==='rascunho'||v.estado==='pausada')ac.push(`<button class="btn sm" data-vg="pub" data-id="${esc(v.id)}">Publicar</button>`);
    if(v.estado==='publicada')ac.push(`<button class="btn ghost sm" data-vg="pau" data-id="${esc(v.id)}">Pausar inscrições</button>`);
    if(v.estado==='publicada'||v.estado==='pausada')ac.push(`<button class="btn ghost sm" data-vg="enc" data-id="${esc(v.id)}">Encerrar</button>`);
    if(v.estado==='encerrada')ac.push(`<button class="btn ghost sm" data-vg="reab" data-id="${esc(v.id)}">Reabrir</button>`);
    ac.push(`<button class="btn ghost sm" data-vg="dup" data-id="${esc(v.id)}">Duplicar</button>`);
    if(v.estado==='arquivada')ac.push(`<button class="btn ghost sm" data-vg="reab" data-id="${esc(v.id)}">Desarquivar</button>`);else if(v.estado!=='publicada')ac.push(`<button class="btn ghost sm" data-vg="arq" data-id="${esc(v.id)}">Arquivar</button>`);
    return `<tr><td><b>${esc(v.titulo||'(sem título)')}</b><br><span class="hint">${esc([v.area,v.modelo,v.local].filter(Boolean).join(' · '))}</span></td><td>${vgChip(v.estado)}${v.estado==='publicada'&&v.prazo&&v.prazo<today()?' <span class="late">prazo vencido</span>':''}</td><td>${n}</td><td>${v.prazo?esc(fdate(v.prazo)):'<span class="hint">sem prazo</span>'}</td><td class="vga">${ac.join(' ')}</td></tr>`}).join('')}</tbody></table></div>`
  :'<div class="panel"><h3 class="dsh-h">Nenhuma vaga ainda</h3><p class="hint">Clique em "+ Nova vaga" para criar a primeira. Você pode salvar como rascunho e publicar depois.</p></div>'}`;
}
function bindVagas(){
  const $$=s=>document.querySelector(s),rp=()=>{setApp(admShell(vagasInner()));bindShell();bindVagas()};
  if(A.vgc)return bindCand(rp);
  if(A.vg)return bindForm(rp);
  document.querySelectorAll('[data-vgtab]').forEach(b=>b.onclick=()=>{A.vgTab=b.dataset.vgtab||null;rp()});
  if(A.vgTab==='db')return bindTal();
  $$('#vg-nova').onclick=()=>{A.vg='novo';A.vgForm=vgVazia();rp()};
  $$('#vg-fe').onchange=e=>{vgFiltro.estado=e.target.value;rp()};
  const q=$$('#vg-fq');q.oninput=()=>{vgFiltro.q=q.value;const p=q.selectionStart;rp();const n=$$('#vg-fq');n.focus();n.setSelectionRange(p,p)};
  $$('#vg-exp').onclick=()=>{const t='const VAGAS='+JSON.stringify(getV().filter(vgAberta).map(vgPublico),null,1)+';';navigator.clipboard.writeText(t).then(()=>{$$('#vg-msg').textContent='Código copiado. Cole no lugar de "const VAGAS=[];" em src/js/05-dados-leads.js e rode npm run montar:copiar.'},()=>dlg('Código das vagas','<h3>Código das vagas publicadas</h3><p class="hint">O navegador não deixou copiar sozinho. Selecione e copie.</p><textarea readonly rows="10" style="width:100%">'+esc(t)+'</textarea>',{larga:true}))};
  document.querySelectorAll('[data-vg]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.id,v=getV().find(x=>x.id===id);if(!v)return;const k=b.dataset.vg;
    if(k==='ed'){A.vg=id;A.vgForm=v;return rp()}
    if(k==='cand'){A.vgc=id;return rp()}
    if(k==='pub'){const e=vgValida(v,true);if(e.length){A.vg=id;A.vgForm=v;A.vgErr=e;return rp()}vgMuda(id,'publicada','publicada');return rp()}
    if(k==='pau'){vgMuda(id,'pausada','inscrições pausadas');return rp()}
    if(k==='reab'){vgMuda(id,v.estado==='arquivada'?'rascunho':'publicada',v.estado==='arquivada'?'desarquivada (voltou a rascunho)':'reaberta');return rp()}
    if(k==='enc')return confirma('Encerrar a vaga "'+v.titulo+'"? Ela sai da página pública. Você pode reabrir depois.',()=>{vgMuda(id,'encerrada','encerrada');rp()},{ok:'Encerrar',titulo:'Encerrar vaga?'});
    if(k==='arq')return confirma('Arquivar a vaga "'+v.titulo+'"? Os candidatos continuam no Banco de dados.',()=>{vgMuda(id,'arquivada','arquivada');rp()},{ok:'Arquivar',titulo:'Arquivar vaga?',perigo:false});
    if(k==='dup'){const a=getV(),c={...v,id:vgNovoId(),titulo:v.titulo+' (cópia)',estado:'rascunho',abertura:today(),t:Date.now(),hist:[{em:new Date().toLocaleString('pt-BR'),txt:'duplicada de "'+v.titulo+'"'}]};a.unshift(c);setV(a);A.vg=c.id;A.vgForm=c;rp()}
  });
}
/* ---- formulário (página própria; o que você digita fica guardado mesmo se trocar de tela) ---- */
function vgFormInner(){
  const f=A.vgForm||vgVazia(),err=A.vgErr||[],E=k=>{const e=err.find(x=>x[0]===k);return e?`<span class="err2" role="alert" id="e-${k}">${esc(e[1])}</span>`:''};
  const ln=a=>esc((a||[]).join('\n')),sel=(id,l,v)=>`<select id="${id}">${l.map(x=>`<option ${x===v?'selected':''}>${esc(x)}</option>`).join('')}</select>`;
  return `<h2 class="pt">${A.vg==='novo'?'Nova vaga':'Editar vaga'}</h2><p class="hint">Estado: ${vgChip(f.estado)} · Os campos com * são exigidos para publicar. Para rascunho só o título é obrigatório.</p>
  <form class="vgf" id="vgf" novalidate>
   <label for="vg-titulo">Título da vaga *</label><input id="vg-titulo" maxlength="100" value="${esc(f.titulo)}" ${err.some(x=>x[0]==='titulo')?'aria-invalid="true" aria-describedby="e-titulo"':''}>${E('titulo')}
   <label for="vg-depto">Empresa ou departamento *</label><input id="vg-depto" maxlength="100" value="${esc(f.depto)}">${E('depto')}
   <label for="vg-area">Área</label>${sel('vg-area',AREAS,f.area)}
   <label for="vg-descricao">Descrição *</label><textarea id="vg-descricao" rows="4" maxlength="1500">${esc(f.descricao)}</textarea>${E('descricao')}
   <label for="vg-resp">Responsabilidades (uma por linha)</label><textarea id="vg-resp" rows="4">${ln(f.resp)}</textarea>
   <label for="vg-reqObr">Requisitos obrigatórios * (um por linha)</label><textarea id="vg-reqObr" rows="4">${ln(f.reqObr)}</textarea>${E('reqObr')}
   <label for="vg-reqDes">Requisitos desejáveis (um por linha)</label><textarea id="vg-reqDes" rows="3">${ln(f.reqDes)}</textarea>
   <label for="vg-comp">Competências relevantes (uma por linha)</label><textarea id="vg-comp" rows="3">${ln(f.comp)}</textarea>
   <div class="vg2"><div><label for="vg-tipo">Tipo de contratação</label>${sel('vg-tipo',VG_TIPOS,f.tipo)}</div><div><label for="vg-modelo">Modelo</label>${sel('vg-modelo',VG_MODELOS,f.modelo)}</div></div>
   <label for="vg-local">Localidade (obrigatória se não for remoto)</label><input id="vg-local" maxlength="100" value="${esc(f.local)}">${E('local')}
   <div class="vg2"><div><label for="vg-salario">Faixa salarial (opcional)</label><input id="vg-salario" maxlength="80" value="${esc(f.salario)}"></div><div><label for="vg-qtd">Quantidade de vagas</label><input id="vg-qtd" type="number" min="1" max="99" value="${f.qtd}"></div></div>
   <label for="vg-beneficios">Benefícios (opcional)</label><input id="vg-beneficios" maxlength="300" value="${esc(f.beneficios)}">
   <label for="vg-jornada">Jornada ou horário</label><input id="vg-jornada" maxlength="100" value="${esc(f.jornada)}">
   <div class="vg2"><div><label for="vg-abertura">Data de abertura *</label><input id="vg-abertura" type="date" value="${esc(f.abertura)}">${E('abertura')}</div><div><label for="vg-prazo">Prazo de candidatura (opcional)</label><input id="vg-prazo" type="date" value="${esc(f.prazo)}">${E('prazo')}</div></div>
   <label for="vg-etapas">Etapas do processo seletivo (uma por linha)</label><textarea id="vg-etapas" rows="3">${ln(f.etapas)}</textarea>
   <label for="vg-extra">Informações adicionais</label><textarea id="vg-extra" rows="3" maxlength="600">${esc(f.extra)}</textarea>
   <div class="row"><button type="button" class="btn" id="vg-pub">${f.estado==='publicada'?'Salvar e manter publicada':'Publicar'}</button><button type="button" class="btn ghost" id="vg-rasc">${A.vg==='novo'||f.estado==='rascunho'?'Salvar como rascunho':'Salvar alterações'}</button><button type="button" class="btn ghost" id="vg-prev">Pré-visualizar</button><button type="button" class="btn ghost" id="vg-cancel">Cancelar</button></div><p class="hint" id="vg-st" role="status"></p>
  </form>${(f.hist||[]).length?`<h3 class="dsh-h">Histórico</h3><ul class="act">${f.hist.slice().reverse().map(h=>`<li><span class="hint">${esc(h.em)}</span>${esc(h.txt)}</li>`).join('')}</ul>`:''}`;
}
function vgPrevHtml(f){
  const L=(t,a)=>a.length?`<h4>${t}</h4><ul>${a.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:'';
  return `<h3>${esc(f.titulo||'(sem título)')}</h3><p class="hint">${esc([f.depto,f.area,f.tipo,f.modelo,f.local,f.jornada].filter(Boolean).join(' · '))}</p><p>${esc(f.descricao)}</p>${L('Responsabilidades',f.resp)}${L('Requisitos obrigatórios',f.reqObr)}${L('Requisitos desejáveis',f.reqDes)}${L('Competências',f.comp)}${f.salario?'<p><b>Faixa salarial:</b> '+esc(f.salario)+'</p>':''}${f.beneficios?'<p><b>Benefícios:</b> '+esc(f.beneficios)+'</p>':''}${L('Etapas do processo',f.etapas)}<p class="hint">${f.qtd} vaga(s) · abertura ${esc(fdate(f.abertura))}${f.prazo?' · candidaturas até '+esc(fdate(f.prazo)):''}</p>${f.extra?'<p>'+esc(f.extra)+'</p>':''}`;
}
function bindForm(rp){
  const g=id=>document.getElementById(id),base=JSON.stringify(vgLe()||{}),st=t=>{g('vg-st').textContent=t};
  const dirty=()=>JSON.stringify(vgLe()||{})!==base;
  const guarda=()=>{const f=vgLe();if(f){A.vgForm={...f,hist:(A.vgForm||{}).hist||[]};A.vgErr=null}};
  g('vgf').addEventListener('input',guarda);g('vgf').addEventListener('change',guarda);
  const volta=()=>{A.vg=null;A.vgForm=null;A.vgErr=null;rp()};
  if(A.vgErr&&A.vgErr.length){const e=g(({titulo:'vg-titulo',depto:'vg-depto',descricao:'vg-descricao',reqObr:'vg-reqObr',local:'vg-local',abertura:'vg-abertura',prazo:'vg-prazo'})[A.vgErr[0][0]]);if(e)e.focus()}
  const salva=publicar=>{
    const f=vgLe(),e=vgValida(f,publicar);if(e.length){guarda();A.vgErr=e;return rp()}
    const a=getV(),novo=A.vg==='novo',id=novo?vgNovoId():A.vg,ant=a.find(x=>x.id===id);
    const reg={...f,id,estado:publicar?'publicada':(novo?'rascunho':ant.estado),t:Date.now(),hist:[...((ant&&ant.hist)||[]),{em:new Date().toLocaleString('pt-BR'),txt:novo?'criada':(publicar?(ant.estado==='publicada'?'editada':'publicada'):'editada')}].slice(-30)};
    if(ant&&ant.titulo&&ant.titulo!==reg.titulo){const ts=getT().map(t=>t.vaga===ant.titulo?{...t,vaga:reg.titulo}:t);setT(ts)}
    setV(novo?[reg,...a]:a.map(x=>x.id===id?reg:x));ativAdd('vaga','Vaga "'+reg.titulo+'": '+reg.hist[reg.hist.length-1].txt,'');
    volta();if(!STORE_OK)aviso('Atenção: o navegador bloqueou o armazenamento, então a vaga NÃO ficou salva e some ao fechar a página.');
  };
  g('vg-pub').onclick=()=>salva(true);g('vg-rasc').onclick=()=>salva(false);
  g('vg-prev').onclick=()=>{const f=vgLe();dlg('Pré-visualização da vaga',vgPrevHtml(f)+'<div class="row"><button class="btn ghost" data-ok>Fechar</button></div>',{larga:true}).querySelector('[data-ok]').onclick=()=>document.getElementById('sdlg').remove()};
  g('vg-cancel').onclick=()=>{if(dirty()||A.vg==='novo'&&(vgLe()||{}).titulo)confirma('Descartar o que você digitou nesta vaga?',volta,{ok:'Descartar',titulo:'Descartar alterações?'});else volta()};
}
/* ---- candidatos de uma vaga ---- */
const vgCand={q:'',etapa:'',ord:'novos'};
function vgCandInner(){
  const v=getV().find(x=>x.id===A.vgc);if(!v){A.vgc=null;return vagasInner()}
  const wa=t=>{let d=String(t.whats).replace(/\D/g,'');if(d.length<=11)d='55'+d;return 'https://wa.me/'+d};
  let c=vgCands(v).filter(t=>(!vgCand.q||norm(t.nome).includes(norm(vgCand.q)))&&(!vgCand.etapa||(t.etapa||'Recebido')===vgCand.etapa));
  c=c.sort((a,b)=>vgCand.ord==='nome'?a.nome.localeCompare(b.nome,'pt-BR'):(vgCand.ord==='antigos'?a.t-b.t:b.t-a.t));
  return `<div class="row"><button class="btn ghost" id="vc-voltar">Voltar às vagas</button></div><h2 class="pt">Candidatos: ${esc(v.titulo)}</h2><p class="hint">${vgChip(v.estado)} · ${vgCands(v).length} candidatura(s) recebida(s) pelo cadastro público, ligadas a esta vaga pelo título. Este cadastro não recebe currículo em arquivo nem faz análise por IA: isso exige servidor com armazenamento privado (Fase 2). A decisão é sempre da equipe.</p>
  <div class="dsh-f"><label class="dsh-q">Buscar por nome<input id="vc-q" type="search" maxlength="80" value="${esc(vgCand.q)}"></label><label>Etapa<select id="vc-e"><option value="">Todas</option>${VG_ETAPAS.map(e=>`<option ${vgCand.etapa===e?'selected':''}>${e}</option>`).join('')}</select></label><label>Ordenar<select id="vc-o">${[['novos','Mais recentes'],['antigos','Mais antigas'],['nome','Nome']].map(([k,t])=>`<option value="${k}" ${vgCand.ord===k?'selected':''}>${t}</option>`).join('')}</select></label></div>
  ${rhComparar(v)}${c.length?c.map(t=>`<div class="panel tal"><h3>${esc(t.nome)}</h3><p class="hint">${esc(t.data)} · ${esc(t.area)}</p><p>${t.whats?'WhatsApp: '+esc(t.whats):''}${t.email?' · E-mail: '+esc(t.email):''}</p>${t.link?'<p><a href="'+esc(t.link)+'" target="_blank" rel="noopener noreferrer">'+esc(t.link)+'</a></p>':''}${t.msg?'<p class="tmsg">'+esc(t.msg)+'</p>':''}
   <label for="et-${esc(t.id)}">Etapa</label><select id="et-${esc(t.id)}" data-et="${esc(t.id)}">${VG_ETAPAS.map(e=>`<option ${((t.etapa||'Recebido')===e)?'selected':''}>${e}</option>`).join('')}</select>
   <label for="nt-${esc(t.id)}">Nota interna (só a equipe vê)</label><textarea id="nt-${esc(t.id)}" data-nt="${esc(t.id)}" rows="2" maxlength="1000">${esc(t.nota||'')}</textarea>
   <div class="row">${t.whats?'<a class="btn wa" href="'+wa(t)+'" target="_blank" rel="noopener noreferrer">Chamar no WhatsApp</a>':''}<button class="btn ghost" data-ntsave="${esc(t.id)}">Salvar nota</button></div>${rhPainel(t,v)}</div>`).join(''):'<p class="hint">Nenhuma candidatura com esses filtros.</p>'}`;
}
function bindCand(rp){
  const $$=s=>document.querySelector(s);
  $$('#vc-voltar').onclick=()=>{A.vgc=null;rp()};
  $$('#vc-q').oninput=e=>{vgCand.q=e.target.value;const p=e.target.selectionStart;rp();const n=$$('#vc-q');n.focus();n.setSelectionRange(p,p)};
  $$('#vc-e').onchange=e=>{vgCand.etapa=e.target.value;rp()};$$('#vc-o').onchange=e=>{vgCand.ord=e.target.value;rp()};
  bindRH(rp);
  const mut=(id,p)=>setT(getT().map(t=>t.id===id?{...t,...p}:t));
  document.querySelectorAll('[data-et]').forEach(s=>s.onchange=()=>{mut(s.dataset.et,{etapa:s.value});ativAdd('candidato','Candidato movido para "'+s.value+'"','');aviso('Etapa atualizada para "'+s.value+'".')});
  document.querySelectorAll('[data-ntsave]').forEach(b=>b.onclick=()=>{const t=document.querySelector('[data-nt="'+b.dataset.ntsave+'"]');mut(b.dataset.ntsave,{nota:txtT(t.value,1000,1)});b.textContent='Nota salva';setTimeout(()=>{b.textContent='Salvar nota'},1500)});
}
