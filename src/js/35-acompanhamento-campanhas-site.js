/* ---------- campanhas e exemplos ---------- */
const CAMP_ST=['Planejada','Ativa','Pausada','Encerrada'];
const IMG_MAX=5*1048576;
async function exValida(f){
  if(!f||!f.size)return {ok:false,erro:'O arquivo está vazio.'};
  const ext=(f.name.split('.').pop()||'').toLowerCase();
  if(['png','jpg','jpeg','webp'].includes(ext)){
    if(f.size>IMG_MAX)return {ok:false,erro:'A imagem passa de 5 MB.'};
    const b=new Uint8Array(await f.slice(0,12).arrayBuffer()),png=b[0]===0x89&&b[1]===0x50&&b[2]===0x4E&&b[3]===0x47,jpg=b[0]===0xFF&&b[1]===0xD8&&b[2]===0xFF,webp=String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP';
    if(!(png||jpg||webp))return {ok:false,erro:'O arquivo não é uma imagem de verdade (o conteúdo não confere com a extensão).'};
    return {ok:true,img:true,tipo:png?'image/png':jpg?'image/jpeg':'image/webp'};
  }
  const v=await cvValida(f);return v.ok?{ok:true,ext:v.ext}:v;
}
function tabCamp(l){
  const t=l.track,sv=svcs(l);
  return `<p class="hint">Campanhas do cliente, com exemplos de referência (anúncios, legendas e roteiros que funcionaram, modelos de que o cliente gostou). A IA usa o texto dos exemplos ao gerar a produção do mesmo serviço. Imagens ficam guardadas para a equipe consultar: a IA usada hoje lê só texto, então escreva no campo do exemplo o que a imagem tem de bom. Os arquivos ficam só neste navegador e não entram no backup.</p>${T.msg?`<p class="hint">${esc(T.msg)}</p>`:''}
  <h4>Nova campanha</h4><div class="fr">${inp('cp_nome','Nome da campanha')}<div><label for="cp_k">Serviço</label><select id="cp_k">${sv.map(k=>`<option value="${k}">${esc(svNomeC(k))}</option>`).join('')}</select></div>${inp('cp_obj','Objetivo')}${inp('cp_ini','Início','date',today())}${inp('cp_fim','Fim','date')}${inp('cp_verba','Verba de mídia (paga pelo cliente)')}<div><button class="btn" data-act="campnew">Criar campanha</button></div></div>
  ${t.campanhas.map(cp=>`<section class="esc camp"><div class="xh"><h4>${esc(cp.nome)} <span class="chip ${cp.status==='Ativa'?'aprovado':cp.status==='Encerrada'?'':'novo'}">${esc(cp.status)}</span> <span class="hint">· ${esc(svNomeC(cp.k))}</span></h4>${delBtn('campdel:'+cp.id)}</div>
    <div class="fr"><div><label>Situação</label><select data-cp="${cp.id}|status">${CAMP_ST.map(s=>`<option ${cp.status===s?'selected':''}>${s}</option>`).join('')}</select></div><div><label>Objetivo</label><input data-cp="${cp.id}|objetivo" value="${esc(cp.objetivo||'')}"></div><div><label>Início</label><input type="date" data-cp="${cp.id}|inicio" value="${esc(cp.inicio||'')}"></div><div><label>Fim</label><input type="date" data-cp="${cp.id}|fim" value="${esc(cp.fim||'')}"></div><div><label>Verba de mídia</label><input data-cp="${cp.id}|verba" value="${esc(cp.verba||'')}"></div></div>
    <label>Anotações da campanha</label><textarea data-cp="${cp.id}|notas" rows="2">${esc(cp.notas||'')}</textarea>
    <h4>Exemplos de referência (${(cp.exemplos||[]).length})</h4>
    ${(cp.exemplos||[]).map(e=>`<div class="ex">${e.arq&&e.arq.img?`<img class="ex-th" data-thumb="cx:${e.id}" alt="${esc(e.titulo||'Imagem de referência')}">`:''}<div class="ex-c"><b>${esc(e.titulo||'Sem título')}</b>${e.arq?`<span class="hint">${esc(e.arq.nome)} · ${tamTxt(e.arq.tam)}</span>`:''}<textarea data-cx="${cp.id}|${e.id}" rows="3" placeholder="Texto do exemplo ou o que ele tem de bom">${esc(e.txt||'')}</textarea><div class="u-m40 row">${e.arq?`<button class="btn ghost" data-act="cxver:${cp.id}|${e.id}">Abrir arquivo</button>`:''}${delBtn('cxdel:'+cp.id+'|'+e.id)}</div></div></div>`).join('')||'<p class="hint">Nenhum exemplo ainda.</p>'}
    <div class="fr"><div><label for="cxt-${cp.id}">Título do exemplo</label><input id="cxt-${cp.id}" maxlength="120"></div><div class="u-span2"><label for="cxx-${cp.id}">Texto do exemplo</label><textarea id="cxx-${cp.id}" rows="2" placeholder="Cole aqui o anúncio, a legenda ou o roteiro"></textarea></div><div><button class="btn ghost" data-act="cxadd:${cp.id}">Adicionar texto</button></div><div><label class="u-lbl btn ghost">Enviar arquivo (imagem, PDF, DOCX ou TXT)<input type="file" data-cxfile="${cp.id}" accept=".png,.jpg,.jpeg,.webp,.pdf,.docx,.txt" hidden></label></div></div></section>`).join('')||'<p class="hint">Nenhuma campanha cadastrada.</p>'}`;
}

/* ---------- Meta Ads ---------- */
function metaSum(rows){const s={imp:0,alc:0,cli:0,cus:0,res:0};rows.forEach(r=>{s.imp+=num(r.imp);s.alc+=num(r.alcance);s.cli+=num(r.cliques);s.cus+=num(r.custo);s.res+=num(r.res)});
  return {...s,ctr:s.imp?s.cli/s.imp*100:0,cpm:s.imp?s.cus/s.imp*1000:0,cpr:s.res?s.cus/s.res:0}}
function metaFromCsv(txt){
  const lines=txt.replace(/^﻿/,'').split(/\r?\n/).filter(x=>x.trim());
  const hi=lines.findIndex(x=>{const n=norm(x);return /impress/.test(n)&&/(valor usado|amount spent)/.test(n)});
  if(hi<0)return {rows:[],erro:'Não achei as colunas de impressões e valor usado. No Gerenciador de Anúncios, exporte o relatório com Dia, Impressões, Alcance, Cliques no link, Resultados e Valor usado.'};
  const sp=[',',';','\t'].map(x=>[x,lines[hi].split(x).length]).sort((a,b)=>b[1]-a[1])[0][0];
  const split=x=>{const o=[];let cur='',q=false;for(const ch of x){if(ch==='"')q=!q;else if(ch===sp&&!q){o.push(cur);cur=''}else cur+=ch}o.push(cur);return o.map(y=>y.trim())};
  const H=split(lines[hi]).map(norm),ix=re=>H.findIndex(h=>re.test(h));
  let d=ix(/^(dia|day)$/);if(d<0)d=ix(/inicio dos relatorios|reporting starts/);
  const c={d,imp:ix(/^impress/),alc:ix(/^(alcance|reach)$/),cli:ix(/cliques no link|link clicks/),cus:ix(/valor usado|amount spent/),res:ix(/^(resultados|results)$/)};
  const agg={};let dated=0;
  for(const x of lines.slice(hi+1)){const p=split(x);if(p.length<2||/^(total|--)/.test(norm(p[0])))continue;
    const dt=c.d>=0?isoDate(p[c.d]):'';if(dt)dated++;
    const a=agg[dt||'import']=agg[dt||'import']||{data:dt||today(),imp:0,alcance:0,cliques:0,custo:0,res:0};
    a.imp+=c.imp>=0?num(p[c.imp]):0;a.alcance+=c.alc>=0?num(p[c.alc]):0;a.cliques+=c.cli>=0?num(p[c.cli]):0;a.custo+=num(p[c.cus]);a.res+=c.res>=0?num(p[c.res]):0}
  return {rows:Object.values(agg).map(a=>({data:a.data,imp:String(a.imp),alcance:String(a.alcance),cliques:String(a.cliques),custo:a.custo.toFixed(2),res:String(a.res)})),dated};
}
/* ---------- assessoria de imprensa ---------- */
const PAU_ST=['Ideia','Release em redação','Aguardando aprovação do cliente','Enviado','Com retorno','Publicado','Sem retorno'];
function tabPress(l){const c=l.track.canais.press,pub=c.pautas.filter(p=>p.status==='Publicado');
  return `${iaPainel(l,'press')}<div class="fr">${fld('Situação','canais.press.situacao',c.situacao,null,['Planejado','Em andamento','Pausado','Encerrado'])}${fld('Porta-voz','canais.press.porta',c.porta)}</div>
  <p class="hint">Fluxo: pauta (fato real do cliente) → release → aprovação do cliente → envio → retorno → publicação. Não prometemos publicação: quem decide é o jornalista.</p>
  <div class="kpis">${kpi('Pautas',c.pautas.length)}${kpi('Enviadas',c.pautas.filter(p=>['Enviado','Com retorno','Publicado','Sem retorno'].includes(p.status)).length)}${kpi('Publicadas',pub.length)}${kpi('Veículos na lista',c.veiculos.length)}</div>
  <h4>Pautas</h4>${c.pautas.map(p=>`<div class="tsk"><span class="u-flex1"><b>${esc(p.titulo)}</b>${p.veiculo?' · '+esc(p.veiculo):''}${p.data?' · '+esc(fdate(p.data)):''}</span><select data-pau-st="${p.id}" aria-label="Situação da pauta">${PAU_ST.map(s=>`<option ${p.status===s?'selected':''}>${s}</option>`).join('')}</select><input class="u-mw220" data-pau-link="${p.id}" value="${esc(p.link||'')}" placeholder="Link da matéria" aria-label="Link da matéria">${delBtn('paudel:'+p.id)}</div>`).join('')||'<p class="hint">Nenhuma pauta ainda. A aba Produção pode sugerir pautas a partir do briefing.</p>'}
  <div class="fr">${inp('pa_tit','Pauta (o fato e o ângulo)')}${inp('pa_vei','Veículo')}${inp('pa_data','Data','date',today())}<div><button class="btn" data-act="pauadd">Adicionar pauta</button></div></div>
  ${pub.length?`<h4>Clipping (o que saiu)</h4><ul class="cx">${pub.map(p=>`<li><b>${esc(p.veiculo||'Veículo')}</b> · ${esc(p.titulo)}${p.link&&/^https:\/\//i.test(p.link)?` · <a href="${esc(p.link)}" target="_blank" rel="noopener noreferrer">abrir</a>`:''}</li>`).join('')}</ul>`:''}
  <h4>Veículos e contatos de imprensa</h4><p class="hint">Guarde só o contato profissional (redação ou e-mail de trabalho).</p>${c.veiculos.map(v=>`<div class="tsk"><span class="u-flex1"><b>${esc(v.nome)}</b>${v.editoria?' · '+esc(v.editoria):''}${v.contato?' · '+esc(v.contato):''}</span>${delBtn('vecdel:'+v.id)}</div>`).join('')}
  <div class="fr">${inp('ve_nome','Veículo')}${inp('ve_ed','Editoria')}${inp('ve_ct','Contato profissional')}<div><button class="btn ghost" data-act="vecadd">Adicionar veículo</button></div></div>`}

/* ---------- site: acesso rápido e versões do código ---------- */
const HTML_MAX=5*1048576;
const siteKey=(id,vid)=>'site:'+id+':'+vid;
/* topo da aba Site do acompanhamento: o botão de gerar o site (antes só existia na Execução do lead) */
function siteGerar(l){const V=(l.track.canais.site.versoes||[]);
  const ger=J.ex.on&&J.ex.id===l.id&&J.ex.what==='o site';
  return `<section class="esc sitegen"><h4>Criar ou atualizar o site</h4><p class="hint">A IA cria o site completo a partir do briefing, do estilo e das referências abaixo. Cada geração vira uma nova versão na lista de versões: nada é publicado sozinho.</p>
  ${lpRefsHtml(l)}
  <label for="sg-aj">O que mudar nesta versão (opcional)</label><input id="sg-aj" maxlength="600" placeholder="Ex.: trocar a cor principal por verde, incluir a seção de planos">
  <div class="row"><button class="btn hl" data-act="sitegen" ${J.ex.on?'disabled':''}>${ger?'Gerando o site… '+J.ex.live.length+' caracteres':V.length?'Gerar nova versão com IA':'Gerar o site com IA'}</button></div></section>`}
function siteExtra(l){const s=l.track.canais.site,lk=s.links||{},V=(s.versoes||[]).slice().sort((a,b)=>b.t-a.t);
  const link=(k,n,ph)=>`<div><label for="lk-${k}">${n}</label><div class="lkr"><input id="lk-${k}" data-f="canais.site.links.${k}" value="${esc(lk[k]||'')}" placeholder="${ph}">${/^https:\/\//i.test(lk[k]||'')?`<a class="btn ghost" href="${esc(lk[k])}" target="_blank" rel="noopener noreferrer">Abrir</a>`:''}</div></div>`;
  return `<h4>Acesso rápido</h4><p class="hint">Links do painel da hospedagem, do repositório e do registro do domínio, para entrar rápido em uma atualização ou se algo der errado. Só links (https): senhas não ficam aqui.</p>
  <div class="fr">${link('painel','Painel da hospedagem','Link https://…')}${link('repo','Repositório do código','Link https://…')}${link('dominio','Registro do domínio','Link https://…')}</div>
  <h4>Código do site (versões)</h4><p class="hint">Cada versão guarda o HTML completo. Para atualizar: edite e salve como nova versão, baixe e publique no painel da hospedagem. Se der errado, baixe a versão anterior e publique de novo. As versões ficam só neste navegador: baixe as importantes.</p>
  <div class="row">${l.xsite&&l.xsite.html?'<button class="btn ghost" data-act="sitekit">Salvar o site do kit como nova versão</button><button class="btn ghost" data-act="kitchk">Verificar o site do kit</button>':''}<label class="u-lbl btn ghost">Importar arquivo HTML<input type="file" id="sitehtml" accept=".html,.htm" hidden></label></div>
  ${V.length?`<table class="mt"><tr><th>Versão</th><th>Anotação</th><th>Tamanho</th><th></th></tr>${V.map(v=>`<tr><td>${esc(fdate(v.data))}${v.atual?' <span class="chip aprovado">publicada</span>':''}</td><td>${esc(v.nota||'')}</td><td>${tamTxt(v.tam||0)}</td><td class="vbt"><button class="btn ghost" data-act="verprev:${v.id}">Prévia</button><button class="btn ghost" data-act="verchk:${v.id}">Verificar</button><button class="btn ghost" data-act="veredit:${v.id}">Editar</button><button class="btn ghost" data-act="verdl:${v.id}">Baixar</button>${v.atual?'':`<button class="btn ghost" data-act="veratual:${v.id}">Marcar como publicada</button>`}${delBtn('verdel:'+v.id)}</td></tr>`).join('')}</table>`:'<p class="hint">Nenhuma versão guardada.</p>'}`}
async function siteNovaVersao(id,html,nota){
  if(!html||html.length>HTML_MAX){T.msg=html?'O HTML passa de 5 MB.':'O arquivo está vazio.';return trkPaint()}
  const vid=uid();
  try{await arqPut(siteKey(id,vid),html)}catch(e){T.msg='Não consegui guardar a versão neste navegador (armazenamento bloqueado ou cheio).';return trkPaint()}
  let velhas=[];
  trkSet(id,t=>{const s=t.canais.site;s.versoes=s.versoes||[];s.versoes.push({id:vid,t:Date.now(),data:today(),nota:String(nota||'').slice(0,200),tam:new Blob([html]).size});
    s.versoes.sort((a,b)=>b.t-a.t);if(s.versoes.length>30){velhas=s.versoes.slice(30).filter(v=>!v.atual);s.versoes=s.versoes.filter(v=>!velhas.includes(v))}});
  velhas.forEach(v=>arqDel(siteKey(id,v.id)));
  T.msg='Versão guardada.';trkPaint();
}
