function reaPostsVincular(id,pid,mode,date){
  const l=trkL(id);
  trkSet(id,t=>{
    const p=(t.pecas||[]).find(x=>x.id===pid);if(!p)return;
    p.briefingLeadId=id;p.briefingAtualizadoEm=String(l&& (l.t||l.data)||"");
    if(mode)p.formaGeracao=mode;
    if(date){p.data=date;p.status="Agendado"}
  });
}
function reaPostsAbrirBrief(id){
  if(!trkL(id))return;
  A.view="";A.sel=id;A.tab="brief";admin();
}
function reaPostsAbrirProducao(id,fid,pid){
  const l=trkL(id),p=l&&pid&&(l.track.pecas||[]).find(x=>x.id===pid);if(!l)return;
  A.view="trk";A.sel=id;T.id=id;T.tab="prod";T.area=fid||null;T.peca=pid||null;T.msg="";T.info="";T.cic=p&&/^c\d+$/.test(p.per||"")?Number(p.per.slice(1)):null;admin();
}
function reaPostsModoPrompt(mode,topic,date){
  const when=date?"Data planejada: "+reaPostsFormatDate(date)+". ":"",custom=String(topic||"").trim();
  if(mode==="servicos")return when+"Crie um post sobre um produto ou serviço real descrito no briefing. Escolha uma oferta específica, explique seu valor com base somente nos dados registrados e proponha uma chamada para ação sem inventar preços, benefícios ou resultados.";
  if(mode==="passo")return when+"Crie um post educativo em formato passo a passo, com etapas úteis para o público-alvo descrito no briefing. Não invente fatos nem prometa resultados.";
  if(mode==="profissional")return when+"Crie uma peça profissional, com gancho claro, texto de arte conciso e legenda pronta para revisão. Use exclusivamente as informações do briefing.";
  if(custom)return when+"Direção editorial solicitada pelo consultor: "+custom+". Use isso como tema e mantenha os fatos limitados ao briefing.";
  return when+"Escolha um assunto específico e pertinente dentre os interesses, desafios, objetivos, datas, produtos e serviços registrados no briefing. Crie uma peça original que não repita os temas das peças existentes.";
}
async function reaPostsGerarUm(id,fid,mode,date,open,custom){
  const l=trkL(id);if(!l||!reaPostsTemBriefing(l)){REA_POSTS_STATE.notice="Complete o briefing do cliente antes de gerar posts.";admin();return}
  const f=l.track.frentes.find(x=>x.id===fid);if(!f){REA_POSTS_STATE.notice="A frente social selecionada não existe.";admin();return}
  if(T.busy){REA_POSTS_STATE.notice="Aguarde a geração em andamento terminar.";return}
  T.id=id;T.cic=null;const per=perSel(l.track),before=new Set((l.track.pecas||[]).map(p=>p.id));
  T.busy="posts:"+id;REA_POSTS_STATE.notice="A IA está criando a peça com o briefing de "+l.nome+"…";admin();
  const ok=await frenteGerar(id,fid,per,1,null,{pauta:"1. "+reaPostsModoPrompt(mode,custom,date)});
  const fresh=trkL(id),created=ok&&fresh&&fresh.track?(fresh.track.pecas||[]).filter(p=>!before.has(p.id)).sort((a,b)=>(a.t||0)-(b.t||0)):[];
  if(created.length){
    reaPostsVincular(id,created[0].id,mode,date);
    REA_POSTS_STATE.notice="A IA gerou a peça a partir do briefing e a vinculou ao cliente "+l.nome+". Revise o texto e a arte.";
    T.busy="";T.prog="";T.msg="";
    if(open)return reaPostsAbrirProducao(id,fid,created[0].id);
  }else REA_POSTS_STATE.notice=T.msg||"A IA não gerou uma peça. Confira a configuração da IA e tente novamente.";
  T.busy="";T.prog="";T.msg="";REA_POSTS_STATE.client=id;REA_POSTS_STATE.front=fid;admin();
}
function reaPostsExtrairPlano(raw,datas){
  const mark=String.fromCharCode(96).repeat(3),texto=String(raw||"").split(mark+"json").join("").split(mark).join("").trim(),a=texto.indexOf("["),b=texto.lastIndexOf("]");
  if(a<0||b<a)throw new Error("A IA não devolveu o plano no formato esperado. Tente gerar de novo.");
  let v;try{v=JSON.parse(texto.slice(a,b+1))}catch(e){throw new Error("Não consegui ler o plano gerado pela IA. Tente novamente.")}
  if(!Array.isArray(v))throw new Error("O plano da IA não veio como uma lista de pautas.");
  const out=datas.map((data,i)=>{const x=v[i]||{};return {data,tema:String(x.tema||x.assunto||"").trim().slice(0,180),objetivo:String(x.objetivo||"").trim().slice(0,180),formato:String(x.formato||"").trim().slice(0,40)}}).filter(x=>x.tema);
  if(out.length!==datas.length)throw new Error("A IA não criou uma pauta para cada data planejada. Gere o plano novamente.");
  return out;
}
async function reaPostsGerarPlano(id,fid,y,m){
  const l=trkL(id),f=l&&l.track&&(l.track.frentes||[]).find(x=>x.id===fid);
  if(!l||!f||!reaPostsTemBriefing(l)){REA_POSTS_STATE.notice="Complete o briefing e configure a frente social antes de gerar o calendário.";admin();return}
  if(T.busy){REA_POSTS_STATE.notice="Aguarde a geração em andamento terminar.";return}
  const limit=Math.max(1,Number(f.por==="projeto"?f.qtd:alvo(f))||8),monthKey=reaPostsDataIso(y,m,1).slice(0,7),existing=(l.track.pecas||[]).filter(p=>p.fid===fid&&(f.por==="projeto"||p.data&&String(p.data).slice(0,7)===monthKey)).length;
  const qtd=Math.min(24,limit-existing);
  if(qtd<1){REA_POSTS_STATE.notice="O escopo desta frente já foi preenchido para este período.";admin();return}
  const datas=reaPostsDistribuirDias(y,m,qtd),anteriores=(l.track.pecas||[]).filter(p=>p.fid===f.id&&p.data).map(p=>p.titulo).filter(Boolean).slice(-40),marca=reaPostsIdentidade(l);
  const dt=new Date(y,m,1).toLocaleDateString("pt-BR",{month:"long",year:"numeric"});
  const msgs=[
    {role:"system",content:"Você é estrategista editorial da OR Marketing Digital. Gere uma pauta com exatamente uma linha por data recebida. Use só fatos do briefing; não invente ofertas, resultados, datas comemorativas, dados nem depoimentos. Distribua ângulos variados entre educação, confiança, produto/serviço e interação, respeitando nicho, público, tom e restrições. Evite repetir temas existentes. Responda somente JSON válido, sem markdown, neste formato: [{\"data\":\"YYYY-MM-DD\",\"tema\":\"...\",\"objetivo\":\"...\",\"formato\":\"...\"}]. Copie literalmente as datas fornecidas e devolva exatamente a quantidade pedida."+(rgpBloco(l)?"\n\n"+rgpBloco(l):"")},
    {role:"user",content:"CLIENTE: "+l.nome+"\nSERVIÇO CONTRATADO: "+(MODS[f.k]?MODS[f.k].name:f.k)+"\nREDE E FORMATO: "+(f.rede||"redes sociais")+" · "+(FMT[f.fmt]||f.fmt)+"\nMÊS: "+dt+"\nQUANTIDADE PREVISTA NO ESCOPO: "+qtd+"\nDATAS A DISTRIBUIR: "+datas.join(", ")+"\nIDENTIDADE: "+String(marca.nomePerfil||l.nome)+" · "+String(marca.instagram||"perfil não informado")+"\n\nBRIEFING COMPLETO DO CLIENTE:\n"+String(ctxIA(l)||"").slice(0,12000)+"\n\nTEMAS JÁ UTILIZADOS:\n"+(anteriores.join("; ")||"nenhum registrado")+"\n\nCrie uma pauta adequada para cada data."}
  ];
  T.id=id;T.cic=null;T.busy="posts-plano:"+id;REA_POSTS_STATE.year=y;REA_POSTS_STATE.month=m;REA_POSTS_STATE.client=id;REA_POSTS_STATE.front=fid;REA_POSTS_STATE.notice="A IA está lendo o briefing e montando as pautas do mês…";admin();
  let plano;
  try{
    const raw=clean(await askF(msgs,s=>{const e=document.querySelector(".rea-post-notice");if(e)e.textContent="A IA está montando o plano editorial… "+s.length+" caracteres"},{slot:"ia2",max:2200,temp:.55}));
    plano=reaPostsExtrairPlano(raw,datas);
  }catch(e){T.busy="";REA_POSTS_STATE.notice=e.message||"A IA não conseguiu criar a pauta.";admin();return}
  const per=perSel(l.track),chunk=Math.max(1,Math.min(LOTE[f.fmt]||4,6));let criadas=0;
  for(let offset=0;offset<plano.length;offset+=chunk){
    const part=plano.slice(offset,offset+chunk),cur=trkL(id),before=new Set((cur.track.pecas||[]).map(p=>p.id));
    T.busy="posts-plano:"+id;REA_POSTS_STATE.notice="A IA está gerando as peças "+(offset+1)+"–"+Math.min(offset+part.length,plano.length)+" de "+plano.length+"…";admin();
    const pauta=part.map((x,i)=>(i+1)+". DATA "+x.data+" · TEMA: "+x.tema+" · OBJETIVO: "+x.objetivo+(x.formato?" · FORMATO: "+x.formato:"")).join("\n");
    const ok=await frenteGerar(id,fid,per,part.length,null,{pauta});
    const fresh=trkL(id),novas=ok&&fresh&&fresh.track?(fresh.track.pecas||[]).filter(p=>!before.has(p.id)).sort((a,b)=>(a.t||0)-(b.t||0)):[];
    if(!novas.length)break;
    trkSet(id,t=>{
      t.planosPosts=Array.isArray(t.planosPosts)?t.planosPosts:[];
      novas.slice(0,part.length).forEach((p,i)=>{const pauta=part[i];if(!pauta)return;p.data=pauta.data;p.status="Agendado";p.briefingLeadId=id;p.briefingAtualizadoEm=String(l.t||l.data||"");p.formaGeracao="planejamento-ia";p.temaPlanejado=pauta.tema});
      criadas+=Math.min(novas.length,part.length);
      t.planosPosts.push({id:uid(),leadId:id,frenteId:fid,mes:monthKey,geradoEm:new Date().toISOString(),quantidade:Math.min(novas.length,part.length),origemBriefing:id,pautas:part.slice(0,novas.length)});
    });
    if(!ok||novas.length<part.length)break;
  }
  T.busy="";T.prog="";T.msg="";
  REA_POSTS_STATE.notice=criadas?"Plano editorial e "+criadas+" post(s) gerados por IA e vinculados ao briefing de "+l.nome+". Revise antes de marcar como publicado.":(T.msg||"Não consegui gerar as peças. Confira a configuração da IA e tente novamente.");
  admin();
}
async function reaPostsGerarLegenda(id,pid){
  const l=trkL(id),p=l&&l.track&&(l.track.pecas||[]).find(x=>x.id===pid);if(!l||!p||T.busy)return;
  T.busy="posts-legenda:"+id;
  const msgs=[
    {role:"system",content:"Você escreve a legenda de uma publicação social usando exclusivamente os fatos do briefing. Entregue uma legenda pronta em português do Brasil, natural, clara e apropriada ao público. Não invente promessas, preços, estatísticas, depoimentos ou garantias. Inclua chamada para ação e no máximo cinco hashtags somente se fizer sentido."+(rgpBloco(l)?"\n\n"+rgpBloco(l):"")},
    {role:"user",content:"BRIEFING DO CLIENTE:\n"+String(ctxIA(l)||"").slice(0,8000)+"\n\nPOST PARA ADAPTAÇÃO:\n<POST>\n"+String(p.txt||"").slice(0,5000)+"\n</POST>\n\nTítulo: "+String(p.titulo||"")}
  ];
  REA_POSTS_STATE.notice="A IA está adaptando a legenda ao briefing…";admin();
  try{const out=clean(await askF(msgs,()=>{},{slot:"ia1",max:900,temp:.65}));trkSet(id,t=>{const x=(t.pecas||[]).find(y=>y.id===pid);if(x)x.legenda=out});REA_POSTS_STATE.notice="Legenda criada por IA com o contexto do briefing. Revise antes de usar."}
  catch(e){REA_POSTS_STATE.notice=e.message||"Não consegui gerar a legenda."}
  T.busy="";admin();
}
function reaPostsDuplicar(id,pid){
  const l=trkL(id),p=l&&l.track&&(l.track.pecas||[]).find(x=>x.id===pid);if(!l||!p)return;
  const clone=JSON.parse(JSON.stringify(p));clone.id=uid();clone.t=Date.now();clone.status="Ideia";clone.data="";clone.favorito=false;clone.legenda="";clone.publicadoEm="";clone.geradoEm=today();clone.briefingLeadId=id;
  trkSet(id,t=>{t.pecas=t.pecas||[];t.pecas.push(clone)});
  REA_POSTS_STATE.notice="Cópia criada e ligada ao mesmo briefing. Edite a cópia antes de usar.";admin();
}
function reaPostsSalvarData(id,pid,date){
  if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date)){REA_POSTS_STATE.notice="Escolha uma data válida.";return}
  trkSet(id,t=>{const p=(t.pecas||[]).find(x=>x.id===pid);if(p){p.data=date;p.status=date?"Agendado":(p.status==="Agendado"?"Ideia":p.status)}});
  REA_POSTS_STATE.notice=date?"Data salva no calendário interno. A publicação ainda precisa ser feita manualmente.":"Data removida do planejamento.";
  admin();
}
function reaPostsPublicarStatus(id,pid){
  trkSet(id,t=>{const p=(t.pecas||[]).find(x=>x.id===pid);if(p){p.status="Publicado";p.publicadoEm=new Date().toISOString()}});
  REA_POSTS_STATE.notice="Status atualizado para publicada. Essa ação registra o trabalho feito; não publica no Instagram.";admin();
}
function reaPostsFavoritar(id,pid){
  trkSet(id,t=>{const p=(t.pecas||[]).find(x=>x.id===pid);if(p)p.favorito=!p.favorito});
  admin();
}
async function reaPostsBaixar(item){
  const [id,fid,pid]=item.split("::"),l=trkL(id),p=l&&l.track&&(l.track.pecas||[]).find(x=>x.id===pid),f=l&&l.track&&(l.track.frentes||[]).find(x=>x.id===fid);if(!p||!f)return;
  const a=reaArtePreparar(p,f,l),box=document.createElement("div");
  box.innerHTML='<canvas data-rea-art-canvas></canvas><span data-rea-art-dims></span>';box.dataset.reaFoto=a.foto?"1":"0";
  const img=await reaArteObterImagem(box,id,pid),logo=await reaPostsObterLogo(id);reaArteDesenhar(box,a,img,logo);
  const canvas=box.querySelector("[data-rea-art-canvas]");
  canvas.toBlob(blob=>{
    if(!blob){REA_POSTS_STATE.notice="O navegador não conseguiu exportar o PNG.";admin();return}
    const base=norm(p.titulo||"post").replace(/[^a-z0-9_-]+/gi,"-").replace(/^-|-$/g,"").slice(0,50)||"post";
    dl(base+".png",blob,"image/png");
  },"image/png");
}
async function reaPostsObterLogo(id){
  const key="marca:"+id;if(REA_ART_IMAGENS.has(key))return REA_ART_IMAGENS.get(key).img;
  let blob=null;try{blob=await arqGet(key)}catch(e){}
  if(!blob)return null;
  return new Promise(resolve=>{const url=URL.createObjectURL(blob),img=new Image();img.onload=()=>{REA_ART_IMAGENS.set(key,{img,url});resolve(img)};img.onerror=()=>{URL.revokeObjectURL(url);resolve(null)};img.src=url});
}
async function reaPostsThumbs(){
  document.querySelectorAll("[data-rea-post-thumb]").forEach(async canvas=>{
    const box=canvas.parentElement,cod=canvas.dataset.reaPostThumb,[id,fid,pid]=cod.split("::"),l=trkL(id),p=l&&l.track&&(l.track.pecas||[]).find(x=>x.id===pid),f=l&&l.track&&(l.track.frentes||[]).find(x=>x.id===fid);
    if(!p||!f)return;
    const a=reaArtePreparar(p,f,l);box.dataset.reaFoto=a.foto?"1":"0";
    box.innerHTML='<canvas data-rea-art-canvas></canvas><span data-rea-art-dims></span>';
    const img=await reaArteObterImagem(box,id,pid),logo=await reaPostsObterLogo(id),target=box.querySelector("[data-rea-art-canvas]");
    if(!target||!box.isConnected)return;
    target.className="rea-post-thumb-canvas";reaArteDesenhar(box,a,img,logo);
    const drawn=box.querySelector("[data-rea-art-canvas]");if(drawn)drawn.className="rea-post-thumb-canvas";
  });
}
function reaPostsCalendarMove(delta){
  const d=new Date(REA_POSTS_STATE.year,REA_POSTS_STATE.month+(Number(delta)||0),1);REA_POSTS_STATE.year=d.getFullYear();REA_POSTS_STATE.month=d.getMonth();admin();
}
async function reaPostsLogoSave(id,file){
  const status=document.querySelector("[data-rea-brand-status]");
  if(!file)return;
  if(!["image/png","image/jpeg","image/webp"].includes(file.type)){if(status)status.textContent="Envie um PNG, JPEG ou WebP.";return}
  if(file.size>3*1024*1024){if(status)status.textContent="A logo pode ter até 3 MB.";return}
  const key="marca:"+id;try{
    await arqPut(key,new Blob([file],{type:file.type}));
    const c=REA_ART_IMAGENS.get(key);if(c){URL.revokeObjectURL(c.url);REA_ART_IMAGENS.delete(key)}
    const l=trkL(id);if(l)trkSet(id,t=>{t.identidadeVisual=t.identidadeVisual||{};t.identidadeVisual.logo=true});
    const logo=await reaPostsObterLogo(id),img=document.querySelector("[data-rea-brand-preview]"),rm=document.querySelector("[data-rea-brand-remove]");
    if(img&&logo){img.src=REA_ART_IMAGENS.get(key).url;img.hidden=false}if(rm)rm.disabled=false;if(status)status.textContent="Logo salva neste navegador.";
  }catch(e){if(status)status.textContent="Não consegui salvar a logo neste navegador."}
}
function reaPostsBind(){
  reaPostsThumbs();
  const logoBox=document.querySelector("[data-rea-brand-preview]");
  if(logoBox){
    const l=reaPostsCliente();if(l)reaPostsObterLogo(l.id).then(img=>{const x=REA_ART_IMAGENS.get("marca:"+l.id);if(img&&x&&logoBox.isConnected){logoBox.src=x.url;logoBox.hidden=false;const rm=document.querySelector("[data-rea-brand-remove]");if(rm)rm.disabled=false}});
  }
  document.querySelectorAll("[data-rea-post-view]").forEach(b=>b.onclick=()=>{REA_POSTS_STATE.view=b.dataset.reaPostView;admin()});
  document.querySelectorAll("[data-rea-post-prompt]").forEach(b=>b.onclick=async()=>{
    const l=getL().find(x=>x.id===b.dataset.reaPostPrompt);if(!l)return;
    const o=b.textContent;
    b.textContent=(await copiar(reaPostsPromptSemana(l)))?"Prompt copiado":"Não consegui copiar";
    setTimeout(()=>{if(b.isConnected)b.textContent=o},2500);
  });
  const cp=document.getElementById("rea-post-client");if(cp)cp.onchange=()=>{REA_POSTS_STATE.client=cp.value;REA_POSTS_STATE.front="";REA_POSTS_STATE.notice="";admin()};
  const fr=document.getElementById("rea-post-front");if(fr)fr.onchange=()=>{REA_POSTS_STATE.front=fr.value;admin()};
  const search=document.getElementById("rea-posts-q");if(search)search.oninput=()=>{REA_POSTS_STATE.q=search.value;const pos=search.selectionStart;admin();const n=document.getElementById("rea-posts-q");if(n){n.focus();n.setSelectionRange(pos,pos)}};
  document.querySelectorAll("[data-rea-post-status]").forEach(b=>b.onclick=()=>{REA_POSTS_STATE.status=b.dataset.reaPostStatus;admin()});
  document.querySelectorAll("[data-rea-post-brief]").forEach(b=>b.onclick=()=>reaPostsAbrirBrief(b.dataset.reaPostBrief));
  document.querySelectorAll("[data-rea-post-open]").forEach(b=>b.onclick=()=>{const [id,fid,pid]=b.dataset.reaPostOpen.split("::");reaPostsAbrirProducao(id,fid,pid)});
  document.querySelectorAll("[data-rea-post-client]").forEach(b=>b.onclick=()=>{const [id,fid]=b.dataset.reaPostClient.split("::");reaPostsAbrirProducao(id,fid,null)});
  document.querySelectorAll("[data-rea-calendar-move]").forEach(b=>b.onclick=()=>reaPostsCalendarMove(b.dataset.reaCalendarMove));
  const today=document.querySelector("[data-rea-calendar-today]");if(today)today.onclick=()=>{const d=new Date();REA_POSTS_STATE.year=d.getFullYear();REA_POSTS_STATE.month=d.getMonth();admin()};
  document.querySelectorAll("[data-rea-post-plan]").forEach(b=>b.onclick=()=>{const l=reaPostsCliente(),f=reaPostsFrente(l);if(l&&f)reaPostsGerarPlano(l.id,f.id,REA_POSTS_STATE.year,REA_POSTS_STATE.month)});
  document.querySelectorAll("[data-rea-post-generate]").forEach(b=>b.onclick=()=>{
    const l=reaPostsCliente(),f=reaPostsFrente(l);if(!l||!f)return;
    const custom=b.dataset.reaPostCustom?((document.getElementById("rea-post-topic")||{}).value||""):"";
    reaPostsGerarUm(l.id,f.id,b.dataset.reaPostGenerate,b.dataset.reaPostDate||"",b.dataset.reaPostGenerate==="profissional",custom);
  });
  document.querySelectorAll("[data-rea-post-download]").forEach(b=>b.onclick=()=>reaPostsBaixar(b.dataset.reaPostDownload));
  document.querySelectorAll("[data-rea-post-caption]").forEach(b=>b.onclick=()=>{const a=b.dataset.reaPostCaption.split("::");reaPostsGerarLegenda(a[0],a[2])});
  document.querySelectorAll("[data-rea-post-duplicate]").forEach(b=>b.onclick=()=>{const a=b.dataset.reaPostDuplicate.split("::");reaPostsDuplicar(a[0],a[2])});
  document.querySelectorAll("[data-rea-post-favorite]").forEach(b=>b.onclick=()=>{const a=b.dataset.reaPostFavorite.split("::");reaPostsFavoritar(a[0],a[2])});
  document.querySelectorAll("[data-rea-post-save-date]").forEach(b=>b.onclick=()=>{const code=b.dataset.reaPostSaveDate,a=code.split("::"),field=document.querySelector('[data-rea-post-date="'+code+'"]');reaPostsSalvarData(a[0],a[2],field?field.value:"")});
  document.querySelectorAll("[data-rea-post-published]").forEach(b=>b.onclick=()=>{const a=b.dataset.reaPostPublished.split("::");reaPostsPublicarStatus(a[0],a[2])});
  const save=document.querySelector("[data-rea-brand-save]");
  if(save)save.onclick=()=>{
    const id=save.dataset.reaBrandSave,profile={
      nomePerfil:String((document.getElementById("rea-brand-name")||{}).value||"").trim().slice(0,80),
      instagram:String((document.getElementById("rea-brand-instagram")||{}).value||"").trim().slice(0,60),
      corFundo:reaArteHex((document.getElementById("rea-brand-bg")||{}).value,"#0A0908"),
      corTexto:reaArteHex((document.getElementById("rea-brand-text")||{}).value,"#EAE0D5"),
      corDestaque:reaArteHex((document.getElementById("rea-brand-accent")||{}).value,"#C6AC8E"),
      fonteTitulo:String((document.getElementById("rea-brand-font-title")||{}).value||"Sora"),
      fonteTexto:String((document.getElementById("rea-brand-font-text")||{}).value||"Inter"),
      logo:!!reaPostsIdentidade(trkL(id)).logo
    };
    trkSet(id,t=>{profile.logo=!!(t.identidadeVisual&&t.identidadeVisual.logo);profile.ref=!!(t.identidadeVisual&&t.identidadeVisual.ref);t.identidadeVisual=profile});
    REA_POSTS_STATE.notice="Identidade visual salva no acompanhamento deste cliente.";admin();
  };
  const refIn=document.querySelector("[data-rea-brand-ref]");
  if(refIn)refIn.onchange=async()=>{
    const l=reaPostsCliente(),f=refIn.files&&refIn.files[0],st=document.querySelector("[data-rea-brand-ref-status]");if(!l||!f)return;
    if(!["image/png","image/jpeg","image/webp"].includes(f.type)){if(st)st.textContent="Envie um PNG, JPEG ou WebP.";refIn.value="";return}
    if(f.size>8*1024*1024){if(st)st.textContent="A imagem pode ter até 8 MB.";refIn.value="";return}
    try{
      const blob=new Blob([f],{type:f.type}),p=await reaPostsPaleta(blob);
      await arqPut("ref:"+l.id,blob);trkSet(l.id,t=>{t.identidadeVisual=t.identidadeVisual||{};t.identidadeVisual.ref=true});
      [["rea-brand-bg",p.corFundo],["rea-brand-text",p.corTexto],["rea-brand-accent",p.corDestaque]].forEach(x=>{const e=document.getElementById(x[0]);if(e)e.value=x[1]});
      if(st)st.textContent="Referência salva. Cores sugeridas nos campos acima: confira e clique em Salvar identidade visual.";
    }catch(e){if(st)st.textContent="Não consegui ler esta imagem ou guardá-la neste navegador."}
    refIn.value="";
  };
  const criar=document.querySelector("[data-rea-brand-criar]");
  if(criar)criar.onclick=async()=>{
    const l=getL().find(x=>x.id===criar.dataset.reaBrandCriar);if(!l)return;const o=criar.textContent;
    criar.textContent=(await copiar(reaPostsPromptIdentidade(l)))?"Prompt copiado":"Não consegui copiar";
    setTimeout(()=>{if(criar.isConnected)criar.textContent=o},2500);
  };
  const upload=document.querySelector("[data-rea-brand-logo]");
  if(upload)upload.onchange=()=>{const l=reaPostsCliente();if(l)reaPostsLogoSave(l.id,upload.files&&upload.files[0])};
  const remove=document.querySelector("[data-rea-brand-remove]");
  if(remove)remove.onclick=async()=>{const l=reaPostsCliente();if(!l)return;const key="marca:"+l.id,c=REA_ART_IMAGENS.get(key);if(c){URL.revokeObjectURL(c.url);REA_ART_IMAGENS.delete(key)}await arqDel(key);trkSet(l.id,t=>{t.identidadeVisual=t.identidadeVisual||{};t.identidadeVisual.logo=false});const img=document.querySelector("[data-rea-brand-preview]");if(img){img.hidden=true;img.removeAttribute("src")}remove.disabled=true;const s=document.querySelector("[data-rea-brand-status]");if(s)s.textContent="Logo removida deste navegador."};
}
