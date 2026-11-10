/* Frameworks do "Prompt Mestre" (FOFA/SWOT, AIDA, STP, Ansoff) e regras de tipografia, em blocos curtos e SÓ onde servem ao serviço.
   Onde cada um entra (arquivo: função):
   - 25-especialistas-estrategia.js: gen() (Estratégia, modo 'plano': por serviço, ver FW_POR_MOD)
   - 27-orcamento-mensagem.js: orc() modo 'orc' (AIDA nas propostas), msgGen() modo 'msg' (AIDA na mensagem de WhatsApp)
   - 29-execucao-kits-site.js: execGen() (Google Ads e redes: AIDA 'texto'; site: 'site' = AIDA + STP + tipografia)
   - 34-acompanhamento-producao.js: peças de conteúdo (AIDA 'texto' conforme o serviço)
   - 43-posts-acoes.js: legenda de post (AIDA 'texto')
   - 48-captacao.js: capMsg() (AIDA 'msg') e capPedidoSite() ('site')
   - 48-site-studio-analise.js: ssPromptAnalise() (FOFA com prioridade, dentro do JSON já existente)
   - 48-site-studio-site.js: ssBaseSys() ('site': AIDA + STP + tipografia); 48-site-studio-revisao.js: ssPedidoRevisao() (checa tipografia)
   - 48-site-studio-proposta.js e 18-briefing-assistente.js: sem framework (a proposta é montada sem IA; o assistente só adapta uma pergunta).
   Regras fixas em todos: nada de valor em reais (preço é da tabela, etapa do orçamento), nada de dado, concorrente ou depoimento inventado. */
const FW_ROT='Ao analisar, marque cada ponto como [confirmado] (está no briefing), [hipótese] (inferência sua, a confirmar) ou [estimativa] (faixa qualitativa). Não cite concorrente, mercado, dado ou número que não esteja no briefing. Sem valores em reais.';
const FW={
 fofa:'FOFA (SWOT), só com base no briefing: Forças e Fraquezas (internas), Oportunidades e Ameaças (externas), até 4 itens cada. Priorize cada item por impacto e urgência (alto, médio, baixo) e ordene do mais importante. Cruze em ações: Forças x Oportunidades (aproveitar), Forças x Ameaças (proteger), Fraquezas x Oportunidades (corrigir), Fraquezas x Ameaças (evitar), com no máximo 1 ação concreta por cruzamento, ligada ao serviço contratado.',
 stp:'STP: Segmentação (2 a 3 segmentos pelos critérios do briefing: perfil, necessidade, região, comportamento); Público-alvo (1 principal, com o motivo; [hipótese] se não estiver explícito); Posicionamento (proposta de valor em 1 frase e a declaração "Para [público] que [necessidade], [marca] é [categoria] que [benefício principal], diferente de [alternativa], porque [razão para acreditar]"). Só diferenciais do briefing; sem concorrente citado, use "alternativa genérica do mercado".',
 ansoff:'Matriz de Ansoff, só se o briefing der base para crescer: avalie as 4 rotas (penetração: mais do mesmo ao mesmo público; desenvolvimento de mercado: novo público ou região; desenvolvimento de produto: nova oferta ao público atual; diversificação: nova oferta e novo público). Para cada rota: investimento, complexidade, riscos, prazo, retorno e indicadores, em níveis (baixo, médio, alto) e faixas de prazo, tudo [estimativa], sem valores em reais nem retorno prometido. Recomende 1 rota para começar, com o motivo, e diga o que o briefing não permite avaliar.',
 aida:'AIDA nos textos de conversão (roteiro interno; não escreva os rótulos no texto final): Atenção (abertura específica, com fato real do briefing); Interesse (o problema do público e como o serviço se liga a ele); Desejo (benefícios e provas só do briefing; sem depoimento, número ou garantia inventados); Ação (um único próximo passo claro). Sem falsa escassez, urgência artificial ou manipulação.',
 aidaCurto:'AIDA (roteiro interno, sem escrever os rótulos): Atenção com fato real do briefing; Interesse no problema do público; Desejo com benefícios e provas só do briefing; Ação com um único próximo passo. Sem falsa escassez nem pressão.',
 msg:'AIDA na mensagem: a abertura faz a Atenção e o Interesse (fato real do briefing e o problema dele); os pacotes inseridos pelo sistema fazem o Desejo; o fechamento é a Ação, com uma pergunta simples. Sem falsa escassez nem pressão.',
 orc:'AIDA em cada pacote (roteiro interno, sem os rótulos): "O que vamos fazer" abre com o problema real do briefing (Atenção e Interesse); o que está incluso, explicado em linguagem de processo e sem prometer resultado, mostra o Desejo; o fechamento propõe um único próximo passo (Ação). Sem falsa escassez.',
 tipo:'TIPOGRAFIA E HIERARQUIA (design e CSS): line-height cerca de 1,5 no texto corrido, 1,25 em subtítulos e 0,9 a 1,1 em títulos grandes; escala tipográfica consistente (razão fixa entre tamanhos, 3 a 4 tamanhos no total); hierarquia clara, nesta ordem: informação principal, complemento, benefício, ação; contraste WCAG AA (4,5:1 no texto, 3:1 no texto grande); no celular, texto corrido de 16px ou mais, linhas de 45 a 75 caracteres e títulos que não estouram a tela.'
};
/* quais frameworks servem a cada serviço (lista vazia = nenhum) */
const FW_POR_MOD={ads:['aida'],meta:['aida'],social:['aida','stp'],youtube:['stp'],local:['fofa'],press:[],brand:['stp'],site:['aida','stp','tipo'],resite:['fofa','aida','stp','tipo'],mkt:['fofa','stp','ansoff'],assess:['fofa','ansoff']};
const FW_AIDA_MODS=['ads','meta','social','site','resite'];
const fwLista=mods=>{const o=[];(mods||[]).forEach(k=>(FW_POR_MOD[k]||[]).forEach(f=>{if(!o.includes(f))o.push(f)}));return o};
/* modos: 'plano' (Estratégia, blocos completos por serviço), 'texto' (peças e legendas: AIDA curto só nos serviços de texto de conversão),
   'msg' (mensagem de WhatsApp), 'orc' (propostas), 'site' (design de site: AIDA + STP + tipografia). Devolve '' quando nada serve. */
function fwBloco(mods,modo){
  const m=(mods||[]).filter(k=>typeof k==='string');
  if(modo==='msg')return 'FRAMEWORK: '+FW.msg;
  if(modo==='orc')return 'FRAMEWORK: '+FW.orc;
  if(modo==='site')return 'FRAMEWORKS E TIPOGRAFIA: '+FW.aidaCurto+' '+FW.stp+'\n'+FW.tipo;
  if(modo==='texto')return m.some(k=>FW_AIDA_MODS.includes(k))?'FRAMEWORK: '+FW.aidaCurto:'';
  const l=fwLista(m);if(!l.length)return '';
  return 'FRAMEWORKS DE MARKETING (aplique só o que serve ao serviço contratado, sem mecanicismo e sem encher o texto; o que o briefing não sustenta, não faça): '+FW_ROT+'\n'+l.map(f=>FW[f]).join('\n');
}
/* teto de resposta extra para a Estratégia quando entram análises longas (FOFA, STP, Ansoff) */
const fwMaxExtra=mods=>fwLista(mods).filter(f=>f==='fofa'||f==='stp'||f==='ansoff').length*500;
