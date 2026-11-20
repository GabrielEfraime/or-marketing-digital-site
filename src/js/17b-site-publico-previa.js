/* Prévia (20/11/2026): primeira tela, seção Projetos e oferta detalhada de Criação de sites.
   Nada aqui inventa cliente, depoimento, resultado ou preço: valores ficam "a confirmar" e o escopo vem da tabela PRECOS.
   MARCA_PEND mostra, só na prévia, o que depende do CEO. Antes de publicar, ponha false (ou remova os marcadores). */
const MARCA_PEND=true;
const pend=t=>MARCA_PEND?`<span class="pj-pend"><b>Pendente</b> ${esc(t)}</span>`:'';
const WA_LINK=()=>CFG.whats?'https://wa.me/'+wnum(CFG.whats):'';

/* problemas que o visitante reconhece, cada um leva ao serviço que trata dele */
const PROBLEMAS=[
 {t:'Meu site não gera contatos',k:'sites'},
 {t:'Anuncio e não sei se compensa',k:'trafego'},
 {t:'Minhas redes estão paradas',k:'social'},
 {t:'Minha marca não passa confiança',k:'brand'}];

function homeHero(){
  const wa=WA_LINK();
  return `<section class="v-hero v-t3" id="topo"><canvas class="v-t3c" id="h3c" aria-hidden="true"></canvas><div class="v-wrap v-hero-in"><div class="v-hero-t"><h1 class="v-h1"><span class="v-h1a">Marketing digital para negócios do Rio</span> <span class="v-h1b v-h1m">Site, anúncios e redes que trabalham juntos.</span></h1><p class="v-lead">A OR cuida do site, dos anúncios, das redes e da marca de empresas e pequenos negócios. Você responde um briefing de poucos minutos, recebe um plano e um orçamento em 3 opções, e uma pessoa da equipe revisa tudo antes de chegar até você.</p><div class="v-act"><button type="button" class="v-btn" data-brief="1"><span>Solicitar orçamento</span>${ARR}</button>${wa?`<a class="v-btn v-btn-o" href="${wa}" target="_blank" rel="noopener noreferrer"><span>Conversar no WhatsApp</span></a>`:''}</div>
  <div class="hp-prob"><p class="hp-prob-t" id="hp-prob-t">O que costuma travar o seu negócio?</p><ul class="hp-prob-l" aria-labelledby="hp-prob-t">${PROBLEMAS.map(p=>`<li><button type="button" class="hp-prob-b" data-svc="${p.k}">${esc(p.t)}</button></li>`).join('')}</ul></div></div></div><button type="button" class="v-t3s" data-scroll="projetos" aria-label="Rolar para os projetos"><svg viewBox="0 0 40 64" width="38" height="61" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path pathLength="1" d="M26 2C24 12 14 18 13 26C12 33 20 36 22 30C24 24 16 22 14 30C12 38 16 50 19 60M13 54L19 60L23 53"/></svg></button></section>`;
}

/* telas ilustradas em CSS: não são capturas reais, e o cartão diz isso */
const telaMock=v=>`<div class="pj-tela m-${v}" aria-hidden="true"><div class="pj-bar"><i></i><i></i><i></i></div><div class="pj-corpo"><span class="pj-h"></span><span class="pj-ln"></span><span class="pj-ln s"></span><div class="pj-g"><b></b><b></b><b></b></div></div><div class="pj-cel"><span class="pj-h"></span><span class="pj-ln"></span><span class="pj-btn"></span></div></div>`;
const PROJETOS=[
 {sel:'Projeto próprio',nome:'Site e plataforma da OR',mock:'a',
  obj:'Apresentar a agência, receber pedidos de orçamento por um briefing guiado e organizar esses pedidos num painel interno.',
  fiz:['Site público com serviços, como funciona e dúvidas','Briefing guiado: perguntas fixas e perguntas adaptadas ao negócio','Plano e orçamento em 3 opções, sempre revisados por uma pessoa','Painel interno para acompanhar pedidos, tarefas e relatórios'],
  tela:'O site que você está vendo agora e, por dentro, o painel interno.',
  p:'capturas reais do site e do painel (sem dados de cliente)'},
 {sel:'Demonstração',nome:'Distribuidora de materiais de escritório',mock:'b',
  obj:'Mostrar como um site institucional de 5 páginas organiza pedidos de cotação de empresas da região.',
  fiz:['Páginas de produtos, atendimento e contato','Botão de WhatsApp e formulário de cotação','Textos pensados para quem compra para uma empresa'],
  tela:'Início, página de produtos e versão para celular.',
  p:'aprovar o negócio fictício e produzir as telas'},
 {sel:'Demonstração',nome:'Escritório de contabilidade',mock:'c',
  obj:'Mostrar como marca e redes sociais deixam um serviço técnico mais claro para pequenas empresas.',
  fiz:['Logo, cores e mini manual de marca','Calendário de um mês de posts','Exemplos de post e de carrossel'],
  tela:'Manual de marca, calendário e exemplos de post.',
  p:'aprovar o negócio fictício e produzir as peças'}];

function homeProjetos(){
  return `<section class="v-sec v-base v-gl" id="projetos" aria-labelledby="projetos-t"><div class="v-wrap"><p class="pj-k">Projetos</p><h2 class="v-h2 v-rv" id="projetos-t">O que fazemos, <span class="v-nw">na <span class="v-pl">prática</span>.</span></h2><p class="v-p v-rv">Um projeto próprio e dois exemplos de demonstração. Os exemplos usam negócios fictícios e estão marcados como demonstração: ainda não temos clientes para mostrar aqui, e não vamos inventar nenhum.</p>
  <ul class="pj-l">${PROJETOS.map(j=>`<li class="pj-c${j.sel==='Demonstração'?' dem':''}"><div class="pj-top"><span class="pj-sel">${esc(j.sel==='Demonstração'?'DEMONSTRAÇÃO':j.sel)}</span>${j.sel==='Demonstração'?'<span class="pj-fic">Negócio fictício, sem cliente real</span>':''}</div>${telaMock(j.mock)}<h3>${esc(j.nome)}</h3><dl><dt>Objetivo</dt><dd>${esc(j.obj)}</dd><dt>${j.sel==='Demonstração'?'O que a demonstração mostra':'O que foi desenvolvido'}</dt><dd><ul>${j.fiz.map(f=>`<li>${esc(f)}</li>`).join('')}</ul></dd><dt>Telas</dt><dd>${esc(j.tela)}</dd></dl>${pend(j.p)}</li>`).join('')}</ul>
  <p class="pj-nota">As ilustrações acima mostram a estrutura de cada tela; não são capturas reais.</p></div></section>`;
}

/* escopo e prazo de um módulo, direto da tabela de preços; o valor NUNCA é exibido */
function escopoDe(mod){
  return String(PRECOS).split('\n').filter(l=>l.startsWith(mod+'|')).map(l=>{
    const p=l.split('|'),o={pac:p[1]};
    p.slice(2).forEach(f=>{const i=f.indexOf('=');if(i>0)o[f.slice(0,i)]=f.slice(i+1)});
    return o}).filter(o=>o.pac!=='extra');
}
const OBJETIVOS=[
 {t:'Melhorar o site',d:'Seu site é antigo, lento ou não traz contatos, ou você ainda não tem um.',s:['Criação de sites'],k:'sites'},
 {t:'Divulgar o negócio',d:'Você quer ser encontrado por quem procura o que você faz, no Google e nas redes.',s:['Tráfego pago','Gestão de redes sociais'],k:'trafego'},
 {t:'Organizar a marca e as redes',d:'Falta identidade visual, ou os perfis não têm rotina nem direção.',s:['Criação de branding','Gestão de redes sociais'],k:'brand'}];

function homeServicos(){
  const pac=escopoDe('site'),nomes={basico:'Essencial',medio:'Crescimento',max:'Completo'};
  const wa=WA_LINK();
  return `<section class="v-sec v-base" id="servicos" aria-labelledby="servicos-t"><div class="v-wrap"><p class="pj-k">Serviços</p><h2 class="v-h2 v-rv" id="servicos-t">Comece pelo que você <span class="v-nw">quer <span class="v-pl">resolver</span>.</span></h2><p class="v-p v-rv">Você não precisa saber o nome do serviço. Escolha o objetivo mais próximo do seu e veja o que fazemos.</p>
  <ul class="of-obj">${OBJETIVOS.map(o=>`<li><button type="button" class="of-ob" data-svc="${o.k}"><b>${esc(o.t)}</b><span>${esc(o.d)}</span><em>${o.s.map(esc).join(' · ')}</em></button></li>`).join('')}</ul>
  <div class="of-det" id="of-site"><div class="of-hd"><p class="pj-k">Oferta em detalhe</p><h3 class="v-h3">Criação de sites</h3><p class="v-p">Um site pensado para quem chega do Google ou do Instagram e precisa entender rápido o que você faz e como falar com você. Há três tamanhos, conforme o que o seu negócio precisa agora.</p></div>
  <ul class="of-pac">${pac.map(p=>`<li><h4>${nomes[p.pac]||''}<small>${esc(p.nome||'')}</small></h4><ul>${String(p.inclui||'').split(';').map(x=>x.trim()).filter(Boolean).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><p class="of-pz"><b>Prazo</b> ${esc(p.prazo||'a confirmar')}</p><p class="of-vl"><b>Valor</b> a confirmar${p.pac==='max'?' conforme o projeto':''}</p></li>`).join('')}</ul>
  <div class="of-reg"><h4>Como funciona a entrega</h4><dl><dt>O que está incluso</dt><dd>O que aparece em cada tamanho acima, e nada além disso sem combinar antes.</dd><dt>Limites</dt><dd>Domínio e hospedagem ficam por conta do cliente. Textos e escolha de imagens podem ser feitos por nós como item à parte. Pedido fora do combinado vira novo orçamento.</dd><dt>Revisões</dt><dd>${pend('quantas rodadas de ajuste o site inclui')}</dd><dt>Prazo</dt><dd>Contado a partir da aprovação e do envio do material que o cliente precisa mandar. ${pend('confirmar a regra de contagem do prazo')}</dd><dt>Acompanhamento</dt><dd>Depois de publicar, há manutenção mensal opcional (atualizações, backup e pequenas alterações). ${pend('validar o que fica coberto no pós-entrega')}</dd><dt>Valor</dt><dd>O orçamento mostra o valor total antes de você decidir. ${pend('CEO validar escopo e custos antes de qualquer preço aparecer')}</dd></dl></div>
  <div class="v-act"><button type="button" class="v-btn" data-brief="1" data-servico="site"><span>Solicitar orçamento de site</span>${ARR}</button>${wa?`<a class="v-btn v-btn-o" href="${wa}" target="_blank" rel="noopener noreferrer"><span>Conversar no WhatsApp</span></a>`:''}</div></div></div></section>`;
}
