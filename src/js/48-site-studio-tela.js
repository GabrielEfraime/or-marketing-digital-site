/* OR Site Studio, Etapa 2: tela (lista de projetos, novo projeto, ficha com a análise). SPEC.md: SS-001, SS-002, SS-006, SS-008, SS-012. */
const ssNomeEt=k=>(SS_ETAPAS.find(x=>x[0]===k)||[0,k])[1];
const ssProg=()=>{['ssprog','ssprog2'].forEach(i=>{const e=document.getElementById(i);if(e)e.textContent=SS.prog})};  /* durante a IA só este texto muda; a tela inteira é refeita no fim */
function ssChips(sel,nome){return [['redesenhar','Redesenhar','Modernizar site existente'],['zero','Criar do zero','Nova proposta visual']].map(([k,t,d])=>
  `<button type="button" class="cap-chip ${sel===k?'on':''}" aria-pressed="${sel===k}" data-ss="${nome}:${k}"><b>${t}</b> <span class="hint">${d}</span></button>`).join('')}
function ssNovoHtml(){
  const sem=capLoad().L.filter(x=>!ssPorProsp(x.id));
  return `<section class="panel ss-novo"><h3>Novo projeto</h3>
   <label for="ssnn">Nome do negócio</label><input id="ssnn" maxlength="140" autocomplete="off">
   <label for="ssne">Site ou Instagram da empresa</label><input id="ssne" maxlength="400" placeholder="https://www.empresa.com.br ou @empresa" autocomplete="off">
   <div class="row" role="group" aria-label="Tipo de projeto">${ssChips(SS.novoModo||'','novomodo')}</div>
   <div class="row"><button type="button" class="btn hl" data-ss="criar">Criar projeto</button></div>
   ${sem.length?`<label for="ssps">Ou comece por um prospect de Captar clientes</label><div class="row"><select id="ssps"><option value="">Escolha um prospect</option>${sem.map(x=>`<option value="${esc(x.id)}">${esc(x.nome)}${x.cidade?' · '+esc(x.cidade):''}</option>`).join('')}</select><button type="button" class="btn ghost" data-ss="doprosp">Criar a partir dele</button></div>`:''}</section>`;
}
function ssListaHtml(L){
  return L.length?`<ul class="ss-lista">${L.map(p=>`<li><button type="button" class="ss-lk" data-ss="abrir:${esc(p.id)}"><b>${esc(p.nome)}</b><span class="hint">${esc(ssNomeEt(p.etapa))}${p.analise?' · com análise':''}${p.lead?' · com lead':''} · atualizado ${esc(dHora(p.t||p.criado))}</span></button></li>`).join('')}</ul>`
   :'<p class="hint">Nenhum projeto ainda. Crie um acima.</p>';
}
function ssItens(lista,tit){
  return lista.length?`<section class="esc"><h4>${tit}</h4><ul class="ss-itens">${lista.map(x=>`<li>${x.f==='fato'?`<span class="cap-tag op">Fato ${x.fonte.map(n=>'nº '+n).join(', ')}</span>`:'<span class="cap-tag">Inferência</span>'}${x.aviso?' <span class="cap-tag ss-av">Conferir número</span>':''} ${esc(x.t)}</li>`).join('')}</ul></section>`:'';
}
function ssAnaliseHtml(a){
  if(!a)return '<p class="hint">Ainda sem análise. Preencha o que souber e clique em "Analisar com IA". A IA usa só o que está aqui e no texto colado: não busca nada na internet.</p>';
  const tem=SS_LISTAS.some(k=>a[k].length);
  return `<p class="hint">Gerada em ${esc(dHora(a.em))}${a.ia?' · pedida a '+esc(a.ia):''}. Revise antes de usar.</p>
   ${a.avisos.length?`<div class="err" role="alert"><b>Confira:</b><ul>${a.avisos.map(x=>'<li>'+esc(x)+'</li>').join('')}</ul></div>`:''}
   <section class="esc"><h4>Fatos informados</h4><ol class="ss-itens">${a.fatos.map((f,i)=>`<li><b>${i+1}.</b> ${esc(f.txt.length>240?f.txt.slice(0,240)+'…':f.txt)} <span class="hint">(${esc(f.origem)})</span></li>`).join('')||'<li class="hint">Nenhum fato informado.</li>'}</ol></section>
   ${tem?ssItens(a.fortes,'Pontos fortes')+ssItens(a.problemas,'Problemas')+ssItens(a.oportunidades,'Oportunidades'):`<section class="esc"><h4>Resposta da IA (fora do formato)</h4><p class="ss-bruto">${esc(a.bruto)}</p></section>`}
   ${a.faltando.length?`<section class="esc"><h4>Não informado (faria diferença)</h4><ul class="ss-itens">${a.faltando.map(x=>'<li>'+esc(x)+'</li>').join('')}</ul></section>`:''}`;
}
/* site demonstrativo: gerar, ver em celular ou computador, pedir mudanças e baixar */
function ssSiteHtml(p){
  const dev=SS.dev==='pc'?'pc':'cel';
  if(!p.vAtual)return `<section class="panel"><h3>Site demonstrativo</h3><p class="hint">A IA escreve o HTML, o CSS e o JavaScript de um site com os dados deste projeto e da análise. Você vê e navega aqui mesmo, sem publicar nada.</p>
   <div class="row"><button type="button" class="btn hl" data-ss="gerar"${SS.busy?' disabled':''}>Gerar o site</button></div><p class="hint" role="status" aria-live="polite" id="ssprog2">${esc(SS.prog)}</p></section>`;
  const v=p.vers.find(x=>x.n===p.vAtual);
  return `<section class="panel"><h3>Site demonstrativo</h3>
   <p class="hint">Versão ${p.vAtual} de ${p.vers.length}${v?' · '+esc(dHora(v.em)):''}. As versões ficam só neste navegador e não entram no backup: baixe o site para guardar.</p>
   <div class="row" role="group" aria-label="Tamanho da prévia"><button type="button" class="cap-chip ${dev==='cel'?'on':''}" aria-pressed="${dev==='cel'}" data-ss="dev:cel">Celular</button><button type="button" class="cap-chip ${dev==='pc'?'on':''}" aria-pressed="${dev==='pc'}" data-ss="dev:pc">Computador</button>
    <button type="button" class="btn ghost" data-ss="baixar">Baixar o site (HTML)</button><button type="button" class="btn ghost" data-ss="gerar"${SS.busy?' disabled':''}>Gerar de novo</button></div>
   <div class="row"><button type="button" class="btn ghost" data-ss="js" aria-pressed="${SS.js===p.id}">${SS.js===p.id?'Desativar o JavaScript da prévia':'Ativar o JavaScript da prévia (menus e botões do site)'}</button></div>
   <div class="ss-pvbox ${dev}"><iframe id="sspv" class="ss-pv" sandbox="${SS.js===p.id?'allow-scripts':''}" title="Prévia do site demonstrativo de ${esc(p.nome)}"></iframe></div>
   <div id="ssacess"></div>
   <p class="hint">A prévia abre sem JavaScript, para um código ruim não travar a página. Ative o JavaScript quando quiser testar menus e botões. O arquivo baixado nunca leva JavaScript, formulário nem recurso de fora (regra de segurança do app).</p>
   <h4>Pedir uma mudança</h4>
   <label for="ssaj">O que mudar? Ex.: trocar as cores, adicionar uma seção de contato, refazer o topo</label>
   <textarea id="ssaj" rows="3" maxlength="1200">${esc(SS.pedido||'')}</textarea>
   <div class="row"><button type="button" class="btn hl" data-ss="ajustar"${SS.busy?' disabled':''}>Aplicar a mudança</button></div>
   <p class="hint" role="status" aria-live="polite" id="ssprog2">${esc(SS.prog)}</p>
   <h4>Versões (${p.vers.length} de ${SS_VERS_LIM})</h4>
   <div class="row"><button type="button" class="btn ghost" data-ss="desfazer"${ssVizinha(p.vers,p.vAtual,-1)&&!SS.busy?'':' disabled'}>Desfazer (voltar à versão ${ssVizinha(p.vers,p.vAtual,-1)||'—'})</button>
    <button type="button" class="btn ghost" data-ss="refazer"${ssVizinha(p.vers,p.vAtual,1)&&!SS.busy?'':' disabled'}>Refazer (ir à versão ${ssVizinha(p.vers,p.vAtual,1)||'—'})</button></div>
   <p class="hint">Voltar ou abrir uma versão não apaga nada. Um novo pedido de mudança parte da versão aberta e cria uma versão nova. Ao chegar a ${SS_VERS_LIM} versões, a mais antiga (que não seja a atual nem esteja marcada como enviada) sai, depois de você confirmar.</p>
   <ul class="ss-itens ss-vers">${p.vers.slice().reverse().map(x=>`<li><div><b>Versão ${x.n}</b>${x.n===p.vAtual?' <span class="cap-tag op">atual</span>':''}${x.env?' <span class="cap-tag">enviada ao cliente</span>':''} <span class="hint">${esc(dHora(x.em))}${x.ia?' · IA: '+esc(x.ia):''}</span><br>${esc(x.pedido)}</div>
    <div class="row">${x.n===p.vAtual?'':`<button type="button" class="btn ghost" data-ss="abrirv:${x.n}"${SS.busy?' disabled':''}>Abrir</button>`}<button type="button" class="btn ghost" data-ss="env:${x.n}" aria-pressed="${!!x.env}">${x.env?'Desmarcar envio':'Marcar como enviada'}</button></div></li>`).join('')}</ul>
   ${p.vers.length>1?ssComparaHtml(p):''}</section>`;
}
function ssComparaHtml(p){
  const op=(sel)=>p.vers.slice().reverse().map(v=>`<option value="${v.n}"${v.n===sel?' selected':''}>Versão ${v.n}${v.n===p.vAtual?' (atual)':''}</option>`).join('');
  const c=SS.cmp&&SS.cmp.id===p.id?SS.cmp:null,a=c?c.a:ssVizinha(p.vers,p.vAtual,-1)||p.vers[0].n,b=c?c.b:p.vAtual;
  return `<h4>Comparar duas versões</h4><div class="row"><label for="ssca">De</label><select id="ssca">${op(a)}</select><label for="sscb">Para</label><select id="sscb">${op(b)}</select><button type="button" class="btn ghost" data-ss="comparar">Comparar</button></div>
   ${c?`<p class="hint" role="status">Da versão ${c.a} para a ${c.b}: ${c.add} linha(s) a mais e ${c.rem} a menos${c.grande?' (arquivo grande: mostrei tudo como trocado)':''}.</p>
   ${c.ops.length?`<pre class="ss-diff" tabindex="0" aria-label="Linhas que mudaram">${c.ops.slice(0,200).map(o=>`<span class="${o.t==='+'?'ss-mais':'ss-menos'}">${o.t} ${esc(o.l.slice(0,200))}</span>`).join('\n')}</pre>${c.ops.length>200?'<p class="hint">Mostrando as primeiras 200 linhas que mudaram.</p>':''}`:'<p class="hint">As duas versões têm o mesmo código.</p>'}`:''}`;
}
/* proposta comercial: o consultor escolhe os serviços, escreve ou ajusta o texto, confere os valores e exporta */
const ssProp=p=>p.proposta||ssPropostaPadrao(p);
/* o consultor escolhe quais pontos da análise vão para o cliente (SS-030); os suspeitos ou que prometem resultado já ficam de fora */
function ssPontosHtml(p,pr){
  const A=p.analise;if(!A)return '';
  const itens=[['fortes','Ponto forte'],['problemas','O que pode melhorar'],['oportunidades','Oportunidade']].flatMap(([k,nome])=>(A[k]||[]).map((x,i)=>({k,i,nome,x})));
  if(!itens.length)return '';
  return `<fieldset class="ss-fs"><legend>Pontos da análise que vão para a proposta</legend><div class="ss-cks">${itens.map(({k,i,nome,x})=>{const fora=x.aviso||ssPromessas(x.t).length;return `<label class="ss-ck"><input type="checkbox" data-ssx="${k}:${i}"${fora?' disabled':''}${!fora&&!(pr.ocultos||[]).includes(k+':'+i)?' checked':''}> <span>${esc(nome)}: ${esc(x.t)}${fora?' <em>(fora da proposta: número, afirmação ou promessa fora dos fatos)</em>':''}</span></label>`}).join('')}</div></fieldset>`;
}
function ssPropostaTela(p){
  const pr=ssProp(p),V=ssValores(pr.mods,pr.avulsos),prob=ssConfereSoma(V.C),prom=ssPromessas([pr.intro,pr.melhorias,pr.obs,...pr.avulsos.map(a=>a.nome)].join('\n'));
  const T=p.vAtual?null:'Gere o site demonstrativo para a proposta mostrar a demonstração (opcional).';
  const mods=SS_PROM_MODS.filter(k=>MODS[k]);
  const cx=k=>`<label class="ss-ck"><input type="checkbox" data-ssm="${k}"${pr.mods.includes(k)?' checked':''}> ${esc(MODS[k].name)}</label>`;
  const tier=pk=>{if(!V.C)return '';const t=V.C.tiers[pk],falta=t.itens.some(i=>i.falta);return `<li><b>${{basico:'Essencial',medio:'Crescimento (recomendado)',max:'Completo'}[pk]}</b>: ${falta?'há item a confirmar; ':''}implantação ${rs(t.setupF)} · mensalidade ${rs(t.mensalF)}/mês · para começar <b>${rs(t.inicio)}</b>${t.ap?' (a partir de)':''}</li>`};
  const exp=p.exportadas||[];
  return `<section class="panel" id="ssprop"><h3>Proposta comercial</h3>
   <p class="hint">Monta um documento com a identidade da OR: análise (sem os pontos que tinham número fora dos fatos), melhorias, resumo do site, valores da tabela de preços e o que você digitar. Nada é enviado: você revisa e exporta.</p>
   <fieldset class="ss-fs"><legend>Serviços da proposta (valores da tabela de preços)</legend><div class="ss-cks">${mods.map(cx).join('')}</div></fieldset>
   ${V.C?`<ul class="ss-itens" aria-label="Valores calculados pelo app">${['basico','medio','max'].map(tier).join('')}</ul>`:'<p class="hint">Nenhum serviço da tabela escolhido: a proposta mostrará só os itens avulsos.</p>'}
   ${prob.length?`<div class="err" role="alert"><b>As contas não batem:</b><ul>${prob.map(x=>'<li>'+esc(x)+'</li>').join('')}</ul></div>`:'<p class="hint">Conferência das somas: ok.</p>'}
   ${ssPontosHtml(p,pr)}
   <label for="ssp1">Texto de abertura (opcional)</label><textarea id="ssp1" rows="3" maxlength="1500" placeholder="Ex.: Obrigado pela conversa. Preparamos esta proposta com base no que vimos do seu negócio.">${esc(pr.intro)}</textarea>
   <label for="ssp2">Melhorias sugeridas (escreva ou ajuste; uma por linha)</label><textarea id="ssp2" rows="5" maxlength="2500">${esc(pr.melhorias||ssMelhoriasPadrao(p))}</textarea>
   <h4>Itens combinados à parte</h4><p class="hint">Nome e, se já tiver, os valores em R$. Sem valor, a proposta mostra "a confirmar".</p>
   <div id="ssav">${pr.avulsos.map((a,i)=>`<div class="row ss-avl"><input aria-label="Nome do item ${i+1}" data-sav="nome:${i}" maxlength="120" value="${esc(a.nome)}" placeholder="Item"><input aria-label="Implantação do item ${i+1}" data-sav="setup:${i}" maxlength="20" value="${esc(a.setup)}" placeholder="Implantação R$" inputmode="decimal"><input aria-label="Mensalidade do item ${i+1}" data-sav="mensal:${i}" maxlength="20" value="${esc(a.mensal)}" placeholder="Mensal R$" inputmode="decimal"><button type="button" class="btn ghost" data-ss="avdel:${i}">Remover</button></div>`).join('')}</div>
   <div class="row"><button type="button" class="btn ghost" data-ss="avadd"${pr.avulsos.length>=12?' disabled':''}>Adicionar item</button></div>
   <label for="ssp3">Observações (opcional)</label><textarea id="ssp3" rows="3" maxlength="1200">${esc(pr.obs)}</textarea>
   ${prom.length?`<div class="err" role="alert"><b>Cuidado com promessas:</b> o texto tem "${esc(prom.join('", "'))}". A OR não promete resultado; troque por entregas e processo. A exportação fica bloqueada até você trocar.</div>`:''}
   ${T?`<p class="hint">${T}</p>`:''}
   <div class="row"><button type="button" class="btn ghost" data-ss="propsalvar">Salvar texto</button><button type="button" class="btn ghost" data-ss="propprev">Ver a proposta</button></div>
   <label class="ss-ck"><input type="checkbox" id="ssrev"${pr.revisada?' checked':''}> Revisei o texto e os valores desta proposta</label>
   <div class="row"><button type="button" class="btn hl" data-ss="proppdf"${pr.revisada&&!prob.length&&!prom.length?'':' disabled'}>Gerar PDF (imprimir)</button><button type="button" class="btn ghost" data-ss="prophtml"${pr.revisada&&!prob.length&&!prom.length?'':' disabled'}>Baixar proposta (HTML)</button></div>
   <p class="hint">O PDF sai pela impressão do navegador (escolha "Salvar como PDF"). Só funciona depois de marcar que você revisou.</p>
   ${exp.length?`<h4>Já exportadas</h4><ul class="ss-itens">${exp.slice().reverse().map(x=>`<li>${esc(dHora(x.em))} · ${x.como==='pdf'?'PDF':'HTML'} · site versão ${x.vSite||'—'} · pacote recomendado: ${esc(x.total)}</li>`).join('')}</ul>`:''}</section>`;
}
/* melhorias sugeridas de partida: as oportunidades e problemas da análise (o consultor edita) */
function ssMelhoriasPadrao(p){const a=p.analise;return a?[...a.oportunidades,...a.problemas].filter(x=>!x.aviso).map(x=>x.t).join('\n'):''}
async function ssDadosProposta(p){
  const pr=ssProp(p),V=ssValores(pr.mods,pr.avulsos);let resumo=null;
  if(p.vAtual){try{const h=await arqGet(ssChaveV(p.id,p.vAtual));if(h)resumo={...ssResumoSite(h),versao:p.vAtual}}catch(e){}}
  return {V,pr,doc:{nome:p.nome,data:new Date().toLocaleDateString('pt-BR'),brand:BRAND,slogan:SLOGAN,whats:MY_WHATS?'+'+MY_WHATS.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/,'$1 ($2) $3-$4'):'',logo:VMARK,
    intro:pr.intro,melhorias:pr.melhorias||ssMelhoriasPadrao(p),obs:pr.obs,analise:p.analise,ocultos:pr.ocultos||[],resumoSite:resumo,valores:V}};
}
function ssLePropostaTela(p){
  const g=id=>document.getElementById(id),pr={...ssProp(p)};
  if(g('ssp1'))pr.intro=g('ssp1').value;if(g('ssp2'))pr.melhorias=g('ssp2').value;if(g('ssp3'))pr.obs=g('ssp3').value;
  if(g('ssrev'))pr.revisada=g('ssrev').checked;
  if(document.querySelector('[data-ssx]'))pr.ocultos=[...document.querySelectorAll('[data-ssx]')].filter(c=>!c.checked).map(c=>c.dataset.ssx);
  const m=[...document.querySelectorAll('[data-ssm]')].filter(c=>c.checked).map(c=>c.dataset.ssm);if(document.querySelector('[data-ssm]'))pr.mods=m;
  const av=[];document.querySelectorAll('[data-sav]').forEach(i=>{const [k,n]=i.dataset.sav.split(':');(av[+n]=av[+n]||{nome:'',setup:'',mensal:''})[k]=i.value});pr.avulsos=av.filter(Boolean);
  return pr;
}
/* salva o que está na tela; mudou texto, serviço ou item: a marca "revisei" cai e o consultor revisa de novo */
function ssSalvaProposta(p,mut){
  p=ssGet(p.id)||p;  /* o "p" do clique pode ser antigo (mudou sem repintar): compara com o que está salvo agora */
  const pr=ssLePropostaTela(p);if(mut)mut(pr);
  const cont=x=>JSON.stringify([x.intro,x.melhorias||ssMelhoriasPadrao(p),x.obs,x.mods,x.avulsos,x.ocultos||[]]);
  if(cont(pr)!==cont(ssProp(p)))pr.revisada=false;
  ssUpd(p.id,{proposta:pr});
  if(pr.revisada&&!ssProp(p).revisada)ssRegistra(p.id,'proposta','Proposta marcada como revisada pelo consultor.');
  return ssGet(p.id);
}
async function ssAcaoProposta(p,k){
  const q=ssSalvaProposta(p);SS.err='';SS.msg='';
  const V=ssValores(ssProp(q).mods,ssProp(q).avulsos);
  if(k==='propsalvar'){ssRegistra(q.id,'proposta','Texto da proposta salvo.');SS.msg='Texto salvo.';return ssPaint()}
  if(k==='propprev'){const {doc}=await ssDadosProposta(q);ssPaint();
    const m=dlg('Proposta','<h3>Proposta para '+esc(q.nome)+'</h3><iframe class="cap-pvg" sandbox="" title="Prévia da proposta"></iframe>',{larga:true});m.querySelector('iframe').srcdoc=ssBlindaExport(ssPropostaHtml(doc));return}
  if(!ssProp(q).revisada){SS.err='Marque que você revisou o texto e os valores antes de exportar.';return ssPaint()}
  if(ssConfereSoma(V.C).length){SS.err='As contas não batem; não dá para exportar.';return ssPaint()}
  const pq=ssProp(q);if(ssPromessas([pq.intro,pq.melhorias||ssMelhoriasPadrao(q),pq.obs,...pq.avulsos.map(a=>a.nome)].join('\n')).length){SS.err='O texto da proposta tem frase que promete resultado. Troque por entregas e processo para exportar.';return ssPaint()}
  try{await ssExportaProposta(q,k==='proppdf'?'pdf':'html');SS.msg=k==='proppdf'?'Abri a impressão: escolha "Salvar como PDF".':'Proposta baixada.'}catch(e){SS.err='Não consegui montar a proposta: '+e.message}
  ssPaint();
}
async function ssExportaProposta(p,como){
  const {V,doc}=await ssDadosProposta(p),html=ssBlindaExport(ssPropostaHtml(doc));
  ssUpd(p.id,{exportadas:[...(p.exportadas||[]),{em:Date.now(),vSite:p.vAtual||0,total:ssTotalRecomendado(V),como}]});
  ssRegistra(p.id,'proposta','Proposta exportada ('+(como==='pdf'?'PDF':'HTML')+'), pacote recomendado: '+ssTotalRecomendado(V)+'.');
  if(como==='html')return ssBaixaHtml(capSlug(p.nome)+'-proposta.html',html);
  /* PDF: iframe temporário (sem scripts: o HTML passou por ssBlindaExport) só para imprimir; o clique do consultor abre a janela de impressão */
  const f=document.createElement('iframe');f.setAttribute('aria-hidden','true');f.title='Proposta para impressão';f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  f.onload=()=>{try{f.contentWindow.focus();f.contentWindow.print()}catch(e){SS.err='O navegador não abriu a impressão. Use "Baixar proposta (HTML)" e imprima o arquivo.';ssPaint()}setTimeout(()=>f.remove(),60000)};
  document.body.appendChild(f);f.srcdoc=html;
}
/* carrega a prévia depois de pintar: o HTML mora no IndexedDB */
function ssCarregaPrevia(p){
  const f=document.getElementById('sspv');if(!f||!p.vAtual)return;
  arqGet(ssChaveV(p.id,p.vAtual)).then(h=>{
    const f2=document.getElementById('sspv');if(!f2||SS.id!==p.id)return;
    if(!h){const a=document.getElementById('ssacess');if(a)a.innerHTML='<p class="err" role="alert">Não achei o HTML desta versão neste navegador (as versões não entram no backup). Gere o site de novo.</p>';return}
    f2.srcdoc=ssMonta(h,ssDadosSite(p));
    const a=document.getElementById('ssacess'),av=ssChecaAcess(h).concat(ssChecaEstrutura(h));
    if(a)a.innerHTML=av.length?`<div class="err" role="status"><b>Checagem automática (confira antes de mostrar):</b><ul>${av.map(x=>'<li>'+esc(x)+'</li>').join('')}</ul></div>`:'<p class="hint">Checagem automática: sem avisos. Isso não substitui revisar a mão.</p>'
  }).catch(()=>{const a=document.getElementById('ssacess');if(a)a.innerHTML='<p class="err" role="alert">Não consegui abrir as versões guardadas neste navegador.</p>'});
}
function ssFicha(p){
  const leadOk=p.lead&&getL().some(l=>l.id===p.lead);
  return `<div class="row"><button type="button" class="btn ghost" data-ss="voltar">Voltar aos projetos</button></div>
   <h2 class="pt">${esc(p.nome)}</h2>
   <div class="row"><label for="ssEt">Etapa</label><select id="ssEt">${SS_ETAPAS.map(([k,t])=>`<option value="${k}"${p.etapa===k?' selected':''}>${esc(t)}</option>`).join('')}</select>
    ${leadOk?'<button type="button" class="btn ghost" data-ss="lead">Abrir o lead</button>':''}</div>
   <section class="panel"><h3>Dados do negócio</h3>
    <label for="ssfn">Nome do negócio</label><input id="ssfn" maxlength="140" value="${esc(p.nome)}">
    <label for="ssfs">Site</label><input id="ssfs" maxlength="400" placeholder="https://www.empresa.com.br" value="${esc(p.site)}">
    <label for="ssfi">Instagram (sem @)</label><input id="ssfi" maxlength="60" value="${esc(p.ig)}">
    <div class="row" role="group" aria-label="Tipo de projeto">${ssChips(p.modo,'modo')}</div>
    ${p.prosp&&capGet(p.prosp)&&capGet(p.prosp).tel?`<label class="ss-ck"><input type="checkbox" id="ssmw"${p.mostraWa?' checked':''}> Mostrar o WhatsApp e o mapa do negócio no site demonstrativo (usa os dados do prospect)</label>`:''}
    <label for="ssfc">Texto colado (conteúdo do site ou do Instagram, avaliações, o que o cliente disse)</label>
    <textarea id="ssfc" rows="6" maxlength="6000" placeholder="Cole aqui o que você achou sobre o negócio. A IA trata isso como dado, nunca como ordem.">${esc(p.colado)}</textarea>
    <div class="row"><button type="button" class="btn ghost" data-ss="salvar">Salvar dados</button><button type="button" class="btn hl" data-ss="analisar"${SS.busy?' disabled':''}>${p.analise?'Analisar de novo com IA':'Analisar com IA'}</button></div>
    <p class="hint" id="ssprog" role="status" aria-live="polite">${esc(SS.prog)}</p></section>
   ${SS.err?`<div class="err" role="alert">${esc(SS.err)} <button type="button" class="btn ghost" data-ss="retry">Tentar de novo</button></div>`:''}${SS.msg?`<p class="hint" role="status">${esc(SS.msg)}</p>`:''}
   <section class="panel"><h3>Análise do negócio</h3>${ssAnaliseHtml(p.analise)}</section>
   ${ssSiteHtml(p)}
   ${ssPropostaTela(p)}
   <section class="panel"><h3>Apagar este projeto</h3><p class="hint">Apaga a análise, as versões do site e a proposta deste navegador. Não tem volta.</p><div class="row"><button type="button" class="btn danger" data-ss="apagar">Apagar projeto</button></div></section>
   <section class="panel"><h3>Histórico</h3><ul class="ss-itens">${p.hist.slice(-30).reverse().map(h=>`<li><span class="hint">${esc(dHora(h.em))}</span> ${esc(h.txt)}</li>`).join('')}</ul></section>`;
}
async function ssApagar(p){
  if(!(await sim('Apagar o projeto "'+p.nome+'"? Isso apaga a análise, as versões do site e a proposta deste navegador e não tem volta. Baixe antes o que quiser guardar.',{ok:'Apagar projeto',titulo:'Apagar projeto?'})))return;
  ssSave(ssLoad().filter(x=>x.id!==p.id));marcaApagado(p.id);await arqDelPref('ssv:'+p.id+':');
  SS.id=null;SS.js='';SS.err='';SS.msg='Projeto apagado.';ssPaint();
}
function ssPaint(){
  const el=document.getElementById('studio');if(!el)return;
  const L=ssLoad(),p=SS.id&&L.find(x=>x.id===SS.id);if(SS.id&&!p)SS.id=null;
  const rasc={};if(SS.idAnt===SS.id)['ssaj','ssp1','ssp2','ssp3'].forEach(i=>{const e=document.getElementById(i);if(e)rasc[i]=e.value});SS.idAnt=SS.id;  /* o que foi digitado e ainda não salvo volta depois de refazer a tela */
  const cofre=cofreAtivo()?'':cofreHtml();  /* aparelho sem chave e site com cofre: pede a senha aqui mesmo, sem ir à tela IAs */
  el.innerHTML=p?cofre+(STORE_OK?'':'<div class="warn" role="alert">O navegador está bloqueando o armazenamento: este projeto fica só nesta aba e some ao fechá-la.</div>')+ssFicha(p):`<h2 class="pt">Site Studio</h2><p class="hint">Analise um negócio e prepare a proposta de um site. Nada roda sozinho: a IA só trabalha quando você clica.</p>${cofre}
   ${STORE_OK?'':'<div class="warn" role="alert">O navegador está bloqueando o armazenamento: os projetos do Site Studio ficam só nesta aba e somem ao fechá-la. Abra pelo endereço local (npm run abrir) no Chrome ou Edge.</div>'}
   ${SS.err?`<div class="err" role="alert">${esc(SS.err)}</div>`:''}${ssNovoHtml()}<section class="panel"><h3>Meus projetos (${L.length})</h3>${ssListaHtml(L)}</section>`;
  ssBind(el,p);if(p)ssCarregaPrevia(p);cofreBind(ssPaint);
  Object.keys(rasc).forEach(i=>{const e=document.getElementById(i);if(e&&!(i==='ssaj'&&SS.limpaAj))e.value=rasc[i]});SS.limpaAj=false;
}
function ssBind(el,p){
  const g=id=>document.getElementById(id),val=id=>(g(id)||{}).value||'';
  el.onclick=e=>{const b=e.target.closest('[data-ss]');if(!b||!el.contains(b))return;const [k,v]=b.dataset.ss.split(':');
    if(k==='novomodo'){SS.novoModo=SS.novoModo===v?'':v;SS.err='';const n=val('ssnn'),en=val('ssne');ssPaint();g('ssnn').value=n;g('ssne').value=en;return}
    if(k==='criar'){const nome=val('ssnn').trim(),en=ssEntrada(val('ssne'));
      if(!nome&&!en.site&&!en.ig){SS.err='Informe o nome do negócio, o site ou o Instagram.';return ssPaint()}
      if(val('ssne').trim()&&!en.site&&!en.ig){SS.err='Não entendi o site ou o Instagram. Use um link (https://...) ou @usuario.';return ssPaint()}
      const id=ssCriar({nome:nome||(en.site?capHost(en.site):'@'+en.ig),site:en.site,ig:en.ig,modo:SS.novoModo||(en.site?'redesenhar':'zero')});SS.err='';SS.msg='';SS.novoModo='';SS.id=id;return ssPaint()}
    if(k==='doprosp'){const pr=capGet(val('ssps'));if(!pr){SS.err='Escolha um prospect.';return ssPaint()}
      const sem=capSinal(pr).semSite;SS.err='';SS.msg='';SS.id=ssCriar({nome:pr.nome,cidade:pr.cidade,site:sem?'':pr.site,ig:pr.ig,prosp:pr.id,lead:pr.lead,modo:sem?'zero':'redesenhar'});return ssPaint()}
    if(k==='abrir'){SS.id=v;SS.js='';SS.err='';SS.msg='';return ssPaint()}
    if(k==='voltar'){SS.id=null;SS.err='';SS.msg='';return ssPaint()}
    if(!p)return;
    if(k==='avadd')return (ssSalvaProposta(p,q=>q.avulsos.push({nome:'Novo item',setup:'',mensal:''})),ssPaint());
    if(k==='avdel')return (ssSalvaProposta(p,q=>q.avulsos.splice(+v,1)),ssPaint());
    if(['propsalvar','propprev','proppdf','prophtml'].includes(k))return ssAcaoProposta(p,k);
    if(k==='modo'){ssUpd(p.id,{modo:p.modo===v?'':v});return ssPaint()}
    if(k==='lead'){A.view='';A.sel=p.lead;A.tab='brief';return admin()}
    if(k==='desfazer'||k==='refazer'||k==='abrirv'||k==='env'){SS.pedido=val('ssaj');SS.err='';SS.msg='';if(k!=='env')SS.js='';
      if(k==='desfazer')ssDesfazer(p.id);else if(k==='refazer')ssRefazer(p.id);else if(k==='abrirv')ssIrVersao(p.id,+v);else ssMarcaEnviada(p.id,+v);return ssPaint()}
    if(k==='comparar'){return ssComparaVersoes(p.id,+val('ssca'),+val('sscb'))}
    if(k==='js'){SS.js=SS.js===p.id?'':p.id;SS.pedido=val('ssaj');return ssPaint()}
    if(k==='apagar')return ssApagar(p);
    if(k==='dev'){SS.dev=v==='pc'?'pc':'cel';SS.pedido=val('ssaj');return ssPaint()}
    if(k==='gerar'){salva();return ssRodaIA(p.id,'gerar')}
    if(k==='ajustar'){SS.pedido=val('ssaj');salva();return ssRodaIA(p.id,'ajustar',SS.pedido)}
    if(k==='baixar'){arqGet(ssChaveV(p.id,p.vAtual)).then(h=>{if(!h){SS.err='Não achei o HTML desta versão neste navegador.';return ssPaint()}ssBaixaHtml(capSlug(p.nome)+'.html',ssBlindaExport(ssMonta(h,ssDadosSite(p)),{faixa:true}))}).catch(()=>{SS.err='Não consegui abrir a versão guardada.';ssPaint()});return}
    if(k==='retry'){salva();const u=SS.ult||{tipo:'analisar'};return u.tipo==='analisar'?ssAnalisar(p.id):ssRodaIA(p.id,u.tipo,u.pedido)}
    if(k==='salvar'||k==='analisar'){salva();if(k==='analisar')return ssAnalisar(p.id);SS.msg='Dados salvos.';SS.err='';return ssPaint()}
  };
  const salva=()=>{if(!p)return;ssUpd(p.id,{nome:val('ssfn')||p.nome,site:ssEntrada(val('ssfs')).site||'',ig:val('ssfi').replace(/^@/,''),colado:val('ssfc'),mostraWa:g('ssmw')?g('ssmw').checked:p.mostraWa})};
  el.onchange=e=>{if(!p||!e.target.matches)return;if(e.target.matches('[data-ssm],[data-ssx],#ssrev')){ssSalvaProposta(p);ssPaint()}else if(e.target.matches('[data-sav]'))ssSalvaProposta(p)};
  if(g('ssEt'))g('ssEt').onchange=()=>{ssUpd(p.id,{etapa:g('ssEt').value});ssPaint()};
}
