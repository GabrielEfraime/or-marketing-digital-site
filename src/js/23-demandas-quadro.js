/* Quadro interno, vazio na primeira abertura: não importa Trello nem Canva. */
const OR_COLUNAS=['Novas demandas','Briefing','Em produção','Revisão interna','Aprovação do cliente','Concluídas'];

function orQuadroNormalizar(x){
  if(!x||typeof x.id!=='string'||!/^[A-Za-z0-9_-]{1,100}$/.test(x.id)||typeof x.titulo!=='string'||!OR_COLUNAS.includes(x.coluna))return null;
  const txt=(v,n)=>typeof v==='string'?v.slice(0,n):'';
  const d={id:x.id,titulo:txt(x.titulo,140),descricao:txt(x.descricao,12000),coluna:x.coluna,cliente:txt(x.cliente,100),responsavel:txt(x.responsavel,100),servico:txt(x.servico,30),origem:txt(x.origem,50),prazo:/^\d{4}-\d\d-\d\d$/.test(x.prazo||'')?x.prazo:'',arquivada:!!x.arquivada,criado:txt(x.criado,40),atualizado:txt(x.atualizado,40),
    checklist:(Array.isArray(x.checklist)?x.checklist:[]).filter(v=>v&&typeof v.texto==='string').slice(0,50).map(v=>({texto:txt(v.texto,300),ok:!!v.ok})),
    historico:(Array.isArray(x.historico)?x.historico:[]).filter(h=>h&&OR_COLUNAS.includes(h.de)&&OR_COLUNAS.includes(h.para)).slice(-30).map(h=>({de:h.de,para:h.para,em:txt(h.em,40)}))};
  if(x.arte&&typeof x.arte==='object'&&!Array.isArray(x.arte))d.arte=x.arte;
  return d;
}
function orQuadroImportar(itens){
  if(!Array.isArray(itens))return 0;
  let n=0;for(const raw of itens.slice(0,1000)){const d=orQuadroNormalizar(raw);if(!d)continue;const i=OR_QUADRO.itens.findIndex(x=>x.id===d.id);
    if(i<0){OR_QUADRO.itens.push(d);n++}
    else if((Date.parse(d.atualizado||d.criado)||0)>(Date.parse(OR_QUADRO.itens[i].atualizado||OR_QUADRO.itens[i].criado)||0)){OR_QUADRO.itens[i]=d;n++}
  }if(n)orQuadroSalvar();return n;
}

function orQuadroLer(){
  try{const a=JSON.parse(sget('or-demandas-v1')||'[]');return Array.isArray(a)?a.map(orQuadroNormalizar).filter(Boolean).slice(0,1000):[]}catch(e){return []}
}
const OR_QUADRO={itens:orQuadroLer(),aberta:'',busca:'',arquivadas:false,msg:'',ocupado:false};
function orQuadroSalvar(){if(typeof diskSaveSoon==='function')diskSaveSoon();sset('or-demandas-v1',JSON.stringify(OR_QUADRO.itens));OR_QUADRO.msg=STORE_OK?'Demanda salva.':'O armazenamento está indisponível: a mudança vale só nesta aba. Exporte uma cópia.'}
function orQuadroItem(id){return OR_QUADRO.itens.find(x=>x.id===id)}
function orQuadroMover(id,coluna){
  const d=orQuadroItem(id);if(!d||!OR_COLUNAS.includes(coluna)||d.coluna===coluna)return false;
  d.historico=Array.isArray(d.historico)?d.historico:[];d.historico.push({de:d.coluna,para:coluna,em:new Date().toISOString()});d.historico=d.historico.slice(-30);
  d.coluna=coluna;d.atualizado=new Date().toISOString();orQuadroSalvar();return true;
}

function orQuadroTemBriefing(l){
  return !!l&&(!!String(l.ficha||'').trim()||(qaOf(l)||[]).some(x=>x&&String(x.a||'').trim()&&!/^(não informado|não sei responder agora)$/i.test(String(x.a).trim())));
}
function orQuadroCliente(d){return getL().find(l=>l.id===d.cliente&&orQuadroTemBriefing(l))||null}
function orQuadroFonteHtml(d){
  const l=orQuadroCliente(d);
  return l?'<details><summary>Briefing inicial vinculado · '+esc(l.nome)+'</summary><div class="qa">'+qaOf(l).map(x=>'<p><b>'+esc(x.q)+'</b><br>'+esc(x.a||'A confirmar')+'</p>').join('')+'</div></details>':'<p class="err" role="alert">Vincule um cliente com briefing inicial preenchido para criar as peças desta demanda.</p>';
}

function orQuadroInner(){
  const q=OR_QUADRO,L=q.itens.filter(d=>!!d.arquivada===q.arquivadas&&(!q.busca||[d.titulo,d.descricao,d.responsavel].join(' ').toLowerCase().includes(q.busca.toLowerCase())));
  const clienteOp=cur=>'<option value="">Escolha o briefing do cliente</option>'+getL().filter(orQuadroTemBriefing).map(l=>'<option value="'+esc(l.id)+'" '+(cur===l.id?'selected':'')+'>'+esc(l.nome)+'</option>').join('');
  const d=orQuadroItem(q.aberta);
  return '<h2 class="pt">Demandas</h2><p class="hint">Do briefing inicial ao planejamento e à arte: cada demanda fica vinculada ao cliente. O quadro começa vazio; nada é importado de outras ferramentas.</p>'+
    '<section class="panel"><details><summary>Nova demanda</summary><form id="or-q-nova"><label for="or-q-titulo">Título</label><input id="or-q-titulo" maxlength="140" required><label for="or-q-cliente">Briefing inicial do cliente</label><select id="or-q-cliente" required>'+clienteOp('')+'</select><label for="or-q-descricao">Orientação adicional da demanda (opcional)</label><textarea id="or-q-descricao" maxlength="12000"></textarea><div class="row"><button class="btn" type="submit">Criar demanda</button><button class="btn ghost" type="button" id="or-q-planejar" '+(q.ocupado?'disabled':'')+'>Propor demandas pelo briefing com IA</button></div></form></details></section>'+
    '<div class="row"><label for="or-q-busca">Buscar <input id="or-q-busca" maxlength="140" value="'+esc(q.busca)+'"></label><label><input id="or-q-arquivadas" type="checkbox" '+(q.arquivadas?'checked':'')+'> Ver arquivadas</label><button class="btn ghost" id="or-q-exportar">Exportar quadro</button></div><p role="status" id="or-q-msg">'+esc(q.msg)+'</p>'+
    '<div class="or-quadro" aria-label="Quadro de demandas">'+OR_COLUNAS.map((col,i)=>'<section class="or-coluna" data-or-col="'+i+'" aria-label="'+esc(col)+'"><h3>'+esc(col)+' <span>'+L.filter(d=>d.coluna===col).length+'</span></h3>'+L.filter(d=>d.coluna===col).map(d=>'<article class="or-cartao" draggable="true" data-or-card="'+esc(d.id)+'"><button class="btn ghost" data-or-abrir="'+esc(d.id)+'">'+esc(d.titulo)+'</button>'+(d.prazo?'<p>Prazo: '+esc(d.prazo)+'</p>':'')+(d.responsavel?'<p>'+esc(d.responsavel)+'</p>':'')+'<label>Etapa<select data-or-mover="'+esc(d.id)+'">'+OR_COLUNAS.map((c,j)=>'<option value="'+j+'" '+(c===d.coluna?'selected':'')+'>'+esc(c)+'</option>').join('')+'</select></label></article>').join('')+'</section>').join('')+'</div>'+
    (d?'<section class="panel or-demanda"><h3>'+esc(d.titulo)+'</h3>'+orQuadroFonteHtml(d)+'<form id="or-q-editar"><label for="or-q-edit-titulo">Título</label><input id="or-q-edit-titulo" maxlength="140" required value="'+esc(d.titulo)+'"><label for="or-q-edit-cliente">Cliente</label><select id="or-q-edit-cliente" required>'+clienteOp(d.cliente)+'</select><label for="or-q-edit-desc">Briefing</label><textarea id="or-q-edit-desc" maxlength="12000">'+esc(d.descricao||'')+'</textarea><div class="fr"><div><label for="or-q-resp">Responsável</label><input id="or-q-resp" maxlength="100" value="'+esc(d.responsavel||'')+'"></div><div><label for="or-q-prazo">Prazo</label><input type="date" id="or-q-prazo" value="'+esc(d.prazo||'')+'"></div></div><label for="or-q-check">Checklist (um item por linha)</label><textarea id="or-q-check" maxlength="4000">'+esc((d.checklist||[]).map(x=>x.texto).join('\n'))+'</textarea><button type="submit" class="btn">Salvar demanda</button></form>'+
    '<ul class="or-checklist">'+(d.checklist||[]).map((x,i)=>'<li><label><input type="checkbox" data-or-check="'+i+'" '+(x.ok?'checked':'')+'> '+esc(x.texto)+'</label></li>').join('')+'</ul>'+
    '<div class="row"><button class="btn" id="or-q-arte">Abrir editor de arte</button><button class="btn ghost" id="or-q-ia" '+(q.ocupado?'disabled':'')+'>Criar layout com IA</button><button class="btn ghost" id="or-q-img" '+(q.ocupado?'disabled':'')+'>Criar imagem com IA</button><button class="btn ghost" id="or-q-arquivar">'+(d.arquivada?'Restaurar':'Arquivar')+'</button></div><p class="hint">Salve as alterações do briefing antes de pedir o layout ou a imagem à IA. Textos, cores e composição continuam editáveis; a imagem da IA entra como fundo, sem texto.</p>'+
    '<details><summary>Histórico de etapas</summary><ul>'+(d.historico||[]).map(h=>'<li>'+esc(h.de)+' → '+esc(h.para)+' · '+esc(h.em)+'</li>').join('')+'</ul></details></section>':'');
}
function orQuadroBind(){
  const q=OR_QUADRO;
  $('#or-q-nova').onsubmit=e=>{e.preventDefault();const titulo=$('#or-q-titulo').value.trim();if(!titulo)return;if(!orQuadroCliente({cliente:$('#or-q-cliente').value})){q.msg='Escolha um briefing inicial preenchido.';admin();return}
    const d={id:uid(),titulo,cliente:$('#or-q-cliente').value,descricao:$('#or-q-descricao').value.trim(),coluna:OR_COLUNAS[0],responsavel:'',prazo:'',checklist:[],historico:[],criado:new Date().toISOString()};q.itens.push(d);q.aberta=d.id;orQuadroSalvar();admin()};
  $('#or-q-planejar').onclick=()=>orQuadroPlanejar($('#or-q-cliente').value);
  $('#or-q-busca').onchange=e=>{q.busca=e.target.value;admin()};
  $('#or-q-arquivadas').onchange=e=>{q.arquivadas=e.target.checked;q.aberta='';admin()};
  $('#or-q-exportar').onclick=()=>dl('demandas-or.json',JSON.stringify({versao:1,demandas:q.itens},null,2),'application/json');
  document.querySelectorAll('[data-or-abrir]').forEach(b=>b.onclick=()=>{q.aberta=b.dataset.orAbrir;admin();document.querySelector('.or-demanda')?.scrollIntoView({block:'start'})});
  document.querySelectorAll('[data-or-mover]').forEach(e=>e.onchange=()=>{orQuadroMover(e.dataset.orMover,OR_COLUNAS[Number(e.value)]);admin()});
  document.querySelectorAll('[data-or-card]').forEach(e=>e.ondragstart=ev=>{ev.dataTransfer.setData('text/plain',e.dataset.orCard);ev.dataTransfer.effectAllowed='move'});
  document.querySelectorAll('[data-or-col]').forEach(e=>{e.ondragover=ev=>ev.preventDefault();e.ondrop=ev=>{ev.preventDefault();orQuadroMover(ev.dataTransfer.getData('text/plain'),OR_COLUNAS[Number(e.dataset.orCol)]);admin()}});
  const d=orQuadroItem(q.aberta);if(!d)return;
  $('#or-q-editar').onsubmit=e=>{e.preventDefault();const titulo=$('#or-q-edit-titulo').value.trim();if(!titulo)return;
    d.atualizado=new Date().toISOString();d.titulo=titulo;d.cliente=$('#or-q-edit-cliente').value;d.descricao=$('#or-q-edit-desc').value.trim();d.responsavel=$('#or-q-resp').value.trim();d.prazo=$('#or-q-prazo').value;
    const antigos=d.checklist||[];d.checklist=$('#or-q-check').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean).slice(0,50).map(texto=>({texto,ok:!!antigos.find(x=>x.texto===texto&&x.ok)}));orQuadroSalvar();admin()};
  document.querySelectorAll('[data-or-check]').forEach(e=>e.onchange=()=>{const x=d.checklist[Number(e.dataset.orCheck)];if(x){x.ok=e.checked;orQuadroSalvar();$('#or-q-msg').textContent=q.msg}});
  $('#or-q-arquivar').onclick=()=>{d.arquivada=!d.arquivada;q.aberta='';orQuadroSalvar();admin()};
  $('#or-q-arte').onclick=()=>{A.view='arte-demanda';admin()};
  $('#or-q-ia').onclick=()=>orQuadroArteIA(d.id);
  $('#or-q-img').onclick=()=>orQuadroImagemIA(d.id);
}
