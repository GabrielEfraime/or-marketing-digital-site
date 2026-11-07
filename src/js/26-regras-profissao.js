/* Regras de publicidade por profissão (levantamento do pesquisador, 06/11/2026).
   É um levantamento de normas, não é parecer jurídico: o consultor confirma com o conselho da profissão.
   Aqui só há dados e funções de apoio: a detecção do ramo, o bloco que entra nos prompts da IA (estratégia, execução, arte e legenda)
   e o painel "Conferir regras da profissão" da Minha área. Nada aqui bloqueia o fluxo: o consultor decide se segue.
   Prefixo próprio: RGP / rgp. Para incluir uma profissão nova, acrescente uma entrada em RGP_PROF (e, se quiser, um padrão em RGP_PADROES). */
const RGP_AVISO='Levantamento de normas, não é parecer jurídico; confirme com o conselho.';
const RGP_EM_LEVANTAMENTO='Regras em levantamento; confirme com o conselho.';
const RGP_PROF={
  advocacia:{nome:'Advocacia',norma:'Provimento 205/2021 do CFOAB',conselho:'OAB',
    pode:['Marketing jurídico informativo, discreto e sóbrio','Redes sociais e site','Anúncios em meios não vedados','Impulsionamento sem oferta de serviço jurídico','Palavras-chave que respondem à busca do cliente'],
    nao:['Citar honorários, formas de pagamento, gratuidade ou desconto','Usar expressões persuasivas, autoengrandecimento ou comparação','Prometer resultado ou usar caso concreto','Citar decisões e resultados em processos','Dar brindes indiscriminados','Pagar para entrar em ranking','Usar símbolos da OAB','Ostentar bens','Fazer anúncio ostensivo em plataforma de vídeo'],
    alerta:['Depoimento de cliente: alto risco.','Possível revisão do Provimento em andamento: conferir antes de vender.']},
  medicina:{nome:'Medicina',norma:'Res. CFM 2.336/2023',conselho:'CFM',
    pode:['Informar valor de consulta e formas de pagamento','Anunciar descontos em campanhas, sem venda casada nem premiação','Antes e depois, apenas com o conjunto exigido: indicações, evoluções satisfatórias e insatisfatórias, complicações e texto educativo'],
    nao:['Usar imagem que identifique o paciente','Editar ou melhorar a imagem','Usar depoimento com superioridade ou promessa','Oferecer consulta gratuita','Dar garantia de resultado'],
    alerta:['Conteúdo de terceiros repostado vira responsabilidade do médico.']},
  odontologia:{nome:'Odontologia',norma:'Res. CFO 196/2019 e Código de Ética',conselho:'CFO',
    pode:['Imagens de diagnóstico e resultado final, só do dentista que executou, com TCLE do paciente'],
    nao:['Mostrar o transcurso do procedimento','Usar imagem sem nome e número de inscrição do dentista','Usar caso clínico de terceiro','Fazer sensacionalismo, mercantilização e promessa de resultado','Anunciar preços, gratuidade e formas de pagamento','Oferecer trabalho gratuito como autopromoção','Usar serviço como prêmio de sorteio'],
    alerta:['Responsabilidade por anúncio ilícito é solidária (dono, responsável técnico e quem contribuiu): a agência pode ser corresponsabilizada.']},
  contabilidade:{nome:'Contabilidade',norma:'CFC, NBC PG 01 de 07/02/2019',conselho:'CFC',
    pode:['Publicidade informativa, moderada e discreta, de natureza técnica e científica','Indicar títulos, especializações, serviços e trabalhos realizados','Citar clientes somente com autorização deles','Divulgar trabalho técnico assinado','Manter em seu poder os dados que sustentam a mensagem','Seguir o Código de Defesa do Consumidor e a lei de concorrência desleal','Proposta por escrito com valor de cada serviço, periodicidade e reajuste'],
    nao:['Mercantilização','Fazer afirmações desproporcionais sobre serviços, capacitação ou experiência','Fazer comparação depreciativa com colegas','Fazer ações comerciais que iludam a boa-fé','Intitular-se com categoria que não possui','Publicar trabalho do qual não participou'],
    alerta:['Atenção (inferência, não está literal na norma): promessa de resultado, "o mais barato" e anúncio de promoção são de alto risco.','Depoimento e captação: a norma não trata diretamente.','Não foi conferido se a NBC PG 01 foi revista depois de 2019.']},
  engenharia:{nome:'Engenharia e construção',norma:'Confea Res. 1.002/2002 e Lei 5.194/1966',conselho:'CREA/CONFEA',
    pode:['Divulgar conhecimentos da profissão','Competição honesta'],
    nao:['Usar informação imprecisa em publicidade (o dever é informação certa, precisa e objetiva)','Usar artifícios enganosos para conquistar contratos','Cobrar honorários vis ou extorsivos','Usar "engenharia", "arquitetura" ou "agronomia" no nome da firma sem diretoria majoritariamente de profissionais registrados'],
    alerta:['Atenção: trabalhos técnicos (orçamentos, laudos, especificações) devem trazer nome da empresa, título e número de registro do profissional.','Empresa que executa obra da área só inicia atividade após registro no Crea; obras exigem placa visível com autor e responsáveis.','Número do Crea em anúncio: boa prática, não obrigação confirmada.','Texto do Confea veio de site secundário: confira no oficial. Arquitetos (CAU) não verificado.']}
};
/* Detecção em duas etapas. 1) Campo do ramo (respostas "negócio", "nicho", "ramo" e o perfil): vale o padrão forte e também as palavras amplas.
   2) Só se o ramo não indicar nada, o briefing livre: vale apenas o padrão forte. Se houver odontologia, medicina sai (um dentista pode citar "médico").
   Padrões sobre o texto sem acentos e em minúsculas. */
const RGP_PADROES={
  odontologia:/odont|dentist|ortodont|implantod|periodont|endodont|clinica dental/,
  medicina:/clinica medica|consultorio medico|dermatolog|cardiolog|pediatr|ginecolog|ortopedi|oftalmolog|urolog|neurolog|endocrinolog|cirurgia plastica|\bcrm\b/,
  advocacia:/advoca|advogad|\boab\b|escritorio juridico/,
  contabilidade:/contabil|contador|contadora|bpo financeiro|\bcrc\b/,
  engenharia:/engenhar|engenheir|construtora|\bcrea\b|\bconfea\b/
};
const RGP_PADROES_RAMO={medicina:/\bmedic[oa]s?\b|medicina/,engenharia:/construcao|\breformas?\b|\bobras?\b/};
/* Expressões que parecem engenharia, mas são serviços de marketing: saem do texto antes de procurar. */
const RGP_IGNORAR=/obras? d[ae] arte|obras? prima|mao de obra|galerias? d[ae] obras?|constru\w* d[aeo]s? (marca|site|sites|loja|identidade|audiencia|presenca|autoridade|negocio|imagem)\b|reform\w* (d[aeo]s? |o |a )?(site|sites|marca|logo|logotipo|pagina|loja|visual)\b|reformula\w*|refazer (o |a )?(site|marca|logo)/g;
const rgpNorm=t=>norm(t||'');
const rgpLimpa=t=>rgpNorm(t).replace(RGP_IGNORAR,' ');
/* Texto do campo do ramo do lead. */
function rgpRamo(l){
  let r='';
  try{
    (l.qa||[]).forEach(x=>{if(/(^|:)(negocio|nicho|ramo)$/.test(String((x&&x.tp)||'')))r+=' '+String(x.a||'')});
    if(l.ans)r+=' '+String(l.ans.negocio||'')+' '+String(l.ans.nicho||'');
    const p=l.track&&l.track.perfil;if(p)r+=' '+String(p.nicho||'')+' '+String(p.oferta||'');
  }catch(e){}
  return r;
}
/* Quais profissões o lead parece ter. Texto simples, sem erro: qualquer falha devolve lista vazia. */
function rgpDetectar(l){
  try{
    if(!l)return [];
    const o=l.rgp&&l.rgp.prof;
    if(o==='nenhuma')return [];
    if(typeof o==='string'&&Object.hasOwn(RGP_PROF,o))return [o];
    const ks=Object.keys(RGP_PADROES),ramo=rgpLimpa(rgpRamo(l));
    let r=ks.filter(k=>RGP_PADROES[k].test(ramo)||(RGP_PADROES_RAMO[k]&&RGP_PADROES_RAMO[k].test(ramo)));
    if(!r.length){
      let txt='';
      try{txt+=qaOf(l).map(x=>String(x.a||'')).join(' ')}catch(e){}
      txt+=' '+String(l.ficha||'');
      try{if(typeof ctxIA==='function')txt+=' '+ctxIA(l)}catch(e){}
      const n=rgpLimpa(txt);
      r=ks.filter(k=>RGP_PADROES[k].test(n));
    }
    if(r.includes('odontologia'))r=r.filter(k=>k!=='medicina');
    return r;
  }catch(e){return []}
}
/* Bloco curto para os prompts. Vazio quando nenhuma profissão regulamentada é detectada. */
function rgpBloco(l){
  try{
    const ks=rgpDetectar(l);if(!ks.length)return '';
    const partes=ks.map(k=>{
      const p=RGP_PROF[k];if(!p)return '';
      if(p.levantando)return p.nome+' ('+p.norma+'): '+RGP_EM_LEVANTAMENTO+' Não afirme o que é permitido ou proibido na publicidade desta profissão; marque [a confirmar com o conselho].';
      return p.nome+' ('+p.norma+').\nPODE: '+p.pode.join('; ')+'.\nNÃO PODE (nunca escreva nem sugira): '+p.nao.join('; ')+'.'+(p.alerta&&p.alerta.length?'\nATENÇÃO: '+p.alerta.join(' '):'');
    }).filter(Boolean);
    if(!partes.length)return '';
    return 'REGRAS DA PROFISSÃO (publicidade regulamentada; '+RGP_AVISO+'):\n'+partes.join('\n\n')+'\nSe o briefing ou o pedido pedir algo da lista de proibições, não faça: use a alternativa permitida e marque [a confirmar com o conselho].';
  }catch(e){return ''}
}
/* Itens da lista de conferência de uma profissão: id estável + texto. */
const rgpItens=k=>{const p=RGP_PROF[k];if(!p)return [];if(p.levantando)return [[k+'_c0','Confirmei com o conselho ('+p.conselho+') as regras de publicidade desta profissão']];return p.nao.map((t,i)=>[k+'_n'+i,t])};
function rgpTotais(l){
  const ks=rgpDetectar(l),conf=(l&&l.rgp&&l.rgp.conf)||{};let tot=0,ok=0;
  ks.forEach(k=>rgpItens(k).forEach(([id])=>{tot++;if(conf[id])ok++}));
  return {ks,tot,ok,pend:tot-ok};
}
const rgpTxtStatus=t=>t.tot?(t.pend?t.ok+' de '+t.tot+' itens conferidos. Faltam '+t.pend+'.':'Todos os '+t.tot+' itens conferidos.'):'';
/* Painel da Minha área. Sempre mostra o aviso fixo; sem profissão detectada, só oferece a escolha manual. */
function rgpPainel(l){try{return rgpPainelIn(l)}catch(e){return ''}}
function rgpPainelIn(l){
  const t=rgpTotais(l),conf=(l.rgp&&l.rgp.conf)||{},sel=(l.rgp&&l.rgp.prof)||'';
  const opts='<option value="">Detectar pelo briefing</option><option value="nenhuma"'+(sel==='nenhuma'?' selected':'')+'>Sem profissão regulamentada</option>'+Object.keys(RGP_PROF).map(k=>'<option value="'+k+'"'+(sel===k?' selected':'')+'>'+esc(RGP_PROF[k].nome)+'</option>').join('');
  const escolha='<label class="rgp-sel" for="rgpsel">Profissão regulamentada <select id="rgpsel" aria-label="Profissão regulamentada deste cliente">'+opts+'</select></label>';
  if(!t.ks.length)return '<div class="bmod rgp" id="rgppn"><details class="rgp-d"><summary>Regras de publicidade por profissão: nenhuma detectada (abrir para escolher)</summary>'+escolha+'</details><p class="hint" role="note"><b>'+esc(RGP_AVISO)+'</b></p></div>';
  const li=a=>a.map(x=>'<li>'+esc(x)+'</li>').join('');
  const grupo=k=>{
    const p=RGP_PROF[k];
    if(p.levantando)return '<fieldset class="rgp-f"><legend>'+esc(p.nome)+' · '+esc(p.norma)+'</legend><p class="hint">'+esc(RGP_EM_LEVANTAMENTO)+'</p>'+rgpItens(k).map(([id,tx])=>rgpItem(id,tx,conf[id])).join('')+'</fieldset>';
    return '<fieldset class="rgp-f"><legend>'+esc(p.nome)+' · '+esc(p.norma)+'</legend>'
      +'<p class="hint"><b>Pode:</b></p><ul class="rgp-ul">'+li(p.pode)+'</ul>'
      +(p.alerta&&p.alerta.length?'<ul class="rgp-ul rgp-al">'+li(p.alerta)+'</ul>':'')
      +'<p class="hint"><b>Confirme que o material (estratégia, posts, legendas, anúncios, artes) não vai:</b></p>'
      +p.nao.map((tx,i)=>rgpItem(k+'_n'+i,tx,conf[k+'_n'+i])).join('')+'</fieldset>';
  };
  return '<div class="bmod rgp" id="rgppn" role="group" aria-labelledby="rgph"><h3 class="dsh-h" id="rgph">Conferir regras da profissão</h3>'
    +'<p class="hint" role="note"><b>'+esc(RGP_AVISO)+'</b> Você pode seguir sem concluir a conferência; ela fica registrada.</p>'
    +t.ks.map(grupo).join('')
    +'<p class="hint" id="rgpst" role="status" aria-live="polite">'+esc(rgpTxtStatus(t))+((l.rgp&&l.rgp.seguiu)?' Aprovado sem concluir a conferência em '+esc(l.rgp.seguiu)+'.':'')+'</p>'
    +escolha+'</div>';
}
const rgpItem=(id,tx,on)=>'<label class="rgp-it"><input type="checkbox" data-rgp="'+esc(id)+'"'+(on?' checked':'')+'><span>'+esc(tx)+'</span></label>';
function rgpGravar(l,mut){
  const cur=getL().find(x=>x.id===l.id);if(!cur)return;
  const r=cur.rgp||{},n={conf:{...(r.conf||{})},prof:r.prof||'',seguiu:r.seguiu||''};
  mut(n);upd(l.id,{rgp:n});
}
function rgpBind(l){
  const g=id=>document.getElementById(id);if(!g('rgppn'))return;
  document.querySelectorAll('[data-rgp]').forEach(c=>c.onchange=()=>{
    rgpGravar(l,n=>{if(c.checked)n.conf[c.dataset.rgp]=true;else delete n.conf[c.dataset.rgp]});
    const cur=getL().find(x=>x.id===l.id),st=g('rgpst');if(cur&&st)st.textContent=rgpTxtStatus(rgpTotais(cur));
  });
  if(g('rgpsel'))g('rgpsel').onchange=()=>{rgpGravar(l,n=>{n.prof=g('rgpsel').value});paintDet()};
}
/* Antes de aprovar: se faltar conferência, pergunta; o consultor pode seguir mesmo assim. */
function rgpAntesDeAprovar(l,seguir){
  let feito=false;const once=()=>{if(!feito){feito=true;seguir()}};
  try{rgpAntesDeAprovarIn(l,once)}catch(e){once()}
}
function rgpAntesDeAprovarIn(l,seguir){
  const cur=getL().find(x=>x.id===l.id)||l,t=rgpTotais(cur);
  if(!t.pend){seguir();return}
  confirma('Faltam '+t.pend+' de '+t.tot+' itens na conferência das regras da profissão ('+t.ks.map(k=>RGP_PROF[k].nome).join(', ')+'). '+RGP_AVISO+' Aprovar mesmo assim?',()=>{
    rgpGravar(cur,n=>{n.seguiu=new Date().toLocaleDateString('pt-BR')});seguir();
  },{titulo:'Conferir regras da profissão',ok:'Aprovar mesmo assim',perigo:false});
}
