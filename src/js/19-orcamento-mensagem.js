const rs=n=>'R$ '+(Number(n)||0).toLocaleString('pt-BR',{minimumFractionDigits:(Number(n)||0)%1?2:0,maximumFractionDigits:2});
const tabNum=v=>{const s=String(v||'0').trim(),n=/^\d+\.\d{1,2}$/.test(s)?parseFloat(s):parseFloat(s.replace(/\./g,'').replace(',','.'));return isFinite(n)?n:0};
const r2=n=>Math.round(n*100)/100;
const CURTO={ads:'Google Ads',meta:'Meta Ads',social:'conteúdo para redes sociais',youtube:'YouTube',local:'Google Meu Negócio e SEO local',press:'assessoria de imprensa',brand:'identidade visual',site:'um site novo',resite:'refazer o seu site'};
const precoDe=k=>{const e=((parseTab(CFG.precos).mods[k]||{}).basico);return e?'a partir de '+rs(e.setup+e.mensal)+(e.mensal?' para começar':''):'valor sob consulta'};
const curtoNomes=l=>svcs(l).map(k=>CURTO[k]||MODS[k].name).join(', ').replace(/, ([^,]*)$/,' e $1');
function parseTab(t){
  const R={mods:{},extras:{},combo:0,erros:[]};
  String(t||'').split('\n').forEach((ln,i)=>{
    ln=ln.trim();if(!ln||ln[0]==='#')return;
    const p=ln.split('|').map(x=>x.trim());
    if(p[0]==='combo'){const m=ln.match(/desconto\s*=\s*(\d+(?:[.,]\d+)?)/);R.combo=m?Math.min(50,parseFloat(m[1].replace(',','.'))):0;return}
    p[1]=({essencial:'basico',crescimento:'medio',completo:'max'})[String(p[1]||'').toLowerCase()]||p[1];
    if(!MODS[p[0]]||!['basico','medio','max','extra'].includes(p[1])){R.erros.push('linha '+(i+1)+': "'+ln.slice(0,40)+'"');return}
    const o={};p.slice(2).forEach(kv=>{const j=kv.indexOf('=');if(j>0)o[kv.slice(0,j).trim().toLowerCase()]=kv.slice(j+1).trim()});
    const e={nome:o.nome||'',setup:tabNum(o.setup),mensal:tabNum(o.mensal),aPartir:/^(1|sim|true)$/i.test(o.apartir||''),prazo:o.prazo||'',inclui:(o.inclui||'').split(';').map(x=>x.trim()).filter(Boolean)};
    if(p[1]==='extra')(R.extras[p[0]]=R.extras[p[0]]||[]).push(e);else(R.mods[p[0]]=R.mods[p[0]]||{})[p[1]]=e;
  });
  return R;
}
function calcOrc(l,tabela){
  const T=parseTab(tabela==null?CFG.precos:tabela),sv=svcs(l),tiers={},falta=new Set(),d=sv.length>1?T.combo:0,f=1-d/100;
  for(const pk of ['basico','medio','max']){
    const itens=[];let setup=0,mensal=0,ap=false;
    for(const k of sv){const e=(T.mods[k]||{})[pk];if(!e){falta.add(k);itens.push({k,falta:true});continue}itens.push({k,e});setup+=e.setup;mensal+=e.mensal;ap=ap||e.aPartir}
    const setupF=r2(setup*f),mensalF=r2(mensal*f);
    tiers[pk]={itens,setup,mensal,setupF,mensalF,inicio:r2(setupF+mensalF),ap,desc:d};
  }
  return {tiers,T,falta:[...falta],sv};
}
function tabelaParaIA(l,C){
  const nomes={basico:'Essencial',medio:'Crescimento',max:'Completo'},L=[];
  C.sv.forEach(k=>{
    const m=C.T.mods[k]||{};
    L.push('## '+MODS[k].name);
    ['basico','medio','max'].forEach(pk=>{
      const e=m[pk];
      if(!e){L.push(`- ${nomes[pk]}: sem valor na tabela (escreva "a confirmar")`);return}
      L.push(`- ${nomes[pk]} "${e.nome||MODS[k].name}": ${e.setup?'implantação '+rs(e.setup)+' (paga uma vez)':'sem implantação'}${e.mensal?'; mensalidade '+rs(e.mensal)+'/mês':''}${e.aPartir?' (a partir de)':''}${e.prazo?'; prazo: '+e.prazo:''}; inclui: ${e.inclui.join('; ')||'(não informado)'}`);
    });
    (C.T.extras[k]||[]).forEach(e=>L.push(`- Opcional (não somar): ${e.nome}${e.setup?' '+rs(e.setup):''}${e.mensal?' '+rs(e.mensal)+'/mês':''}${e.inclui.length?' ('+e.inclui.join('; ')+')':''}`));
  });
  if(C.sv.length>1)L.push('## Combo\n- '+(C.T.combo?'Desconto de combo de '+C.T.combo+'% sobre implantação e mensalidade':'Sem desconto de combo (não aplique desconto)'));
  L.push('## Regras gerais\n- A verba de anúncios (Google, Meta) é paga pelo cliente direto à plataforma e não entra nos valores.');
  return L.join('\n');
}
function refValores(C){
  return ['basico','medio','max'].map(pk=>{const T=C.tiers[pk];return `${LBL[pk.toUpperCase()]}: implantação total ${rs(T.setupF)}; mensalidade total ${rs(T.mensalF)}/mês; para começar (implantação + 1º mês) ${rs(T.inicio)}${T.ap?' (a partir de)':''}`}).join('\n');
}
function allowedAmounts(C){
  const s=new Set([0]);
  Object.values(C.tiers).forEach(T=>{[T.inicio,T.setupF,T.mensalF,T.setup,T.mensal].forEach(x=>s.add(x));T.itens.forEach(i=>{if(i.e){s.add(i.e.setup);s.add(i.e.mensal);s.add(r2(i.e.setup+i.e.mensal))}})});
  C.sv.forEach(k=>(C.T.extras[k]||[]).forEach(e=>{s.add(e.setup);s.add(e.mensal)}));
  return s;
}
function checarValores(txt,C,soMsg){
  const ok=[...allowedAmounts(C)],found=[...String(txt).matchAll(/R\$\s*([\d.]+(?:,\d{1,2})?)/g)].map(m=>tabNum(m[1])),prob=[];
  [...new Set(found.filter(n=>!ok.some(a=>Math.abs(a-n)<0.01)))].forEach(n=>prob.push('o valor '+rs(n)+' não existe na tabela de preços'));
  (soMsg?['medio']:['basico','medio','max']).forEach(pk=>{const T=C.tiers[pk];if(T.inicio&&!found.some(n=>Math.abs(n-T.inicio)<0.01))prob.push('o total para começar do pacote '+LBL[pk.toUpperCase()]+' ('+rs(T.inicio)+') não aparece')});
  return prob;
}
const ctxCliente=l=>`CLIENTE: ${l.nome}\nRESUMO DO CLIENTE:\n${l.ficha||qaOf(l).map(x=>`- ${x.q} ${x.a}`).join('\n')}`;
const SYS_ORC=l=>'Você faz parte da equipe da '+CFG.brand+' (Rio de Janeiro) e monta orçamentos e mensagens claros e honestos em português do Brasil, assinando como equipe ("nós") e sem citar o nome de nenhuma pessoa. Use SOMENTE os valores e itens da tabela de preços fornecida. Se algo não estiver na tabela, escreva "a confirmar" em vez de inventar. Confira as somas. Use SOMENTE as informações do briefing; nunca troque o assunto nem o negócio do cliente. Nunca prometa resultado.\n\n'+protocolo(svcs(l))+(kb(['orc','msg'],l)?'\n\n'+kb(['orc','msg'],l):'');
const MSG_REGRAS='A mensagem de WhatsApp tem DUAS partes escritas por você, separadas por uma linha só com ---FECHO---. Os pacotes (o que cada um inclui, prazos e valores) NÃO devem ser escritos por você: o sistema os insere entre as duas partes, a partir da tabela de preços. TOM: português brasileiro natural, como uma pessoa que leu o briefing e entendeu o negócio; próximo e objetivo, sem intimidade forçada, sem elogio automático, sem fórmulas de venda e sem pressionar. PARTE 1, a abertura (2 ou 3 frases curtas): cumprimente pelo primeiro nome, cite o que o cliente vende, a região, o objetivo ou a dificuldade que ele descreveu (só o que está no briefing; nunca invente fatos, problemas, público ou resultados) e diga que logo abaixo estão as opções. Varie a forma de abrir; não comece sempre igual. PARTE 2, o fechamento (até 3 frases): diga qual opção combina mais com o briefing e por quê, em uma frase; se a opção mais simples bastar, diga isso com franqueza (não indique a do meio por padrão); termine com uma pergunta ou próximo passo simples, diferente a cada mensagem (não use sempre a mesma frase). Nunca escreva valores, listas de itens, prazos nem os pacotes: o sistema os insere. Evite "estratégia completa", "otimização contínua" e "acompanhamento personalizado". Sem markdown, no máximo 1 emoji, no máximo 650 caracteres somando as duas partes.';
const FECHO_PADRAO='Me conta qual dessas opções chega mais perto do que você precisa agora, que a gente ajusta o que for preciso.';
const NOME_PK={basico:'Essencial',medio:'Crescimento',max:'Completo'};
// Um bloco por pacote, montado direto da tabela de preços: o que inclui, prazo e valores (nada vem da IA).
function blocoPlano(C,pk){
  const T=C.tiers[pk],multi=C.sv.length>1,L=['*'+NOME_PK[pk]+'*'];
  T.itens.forEach(it=>{
    const sv=CURTO[it.k]||MODS[it.k].name,rot=sv.charAt(0).toUpperCase()+sv.slice(1);
    if(it.falta){L.push('- '+(multi?rot+': ':'')+'itens e valor a confirmar');return}
    const lista=it.e.inclui.length?it.e.inclui:[it.e.nome||'itens a confirmar'];
    if(multi)L.push('- '+rot+': '+lista.join('; '));else lista.forEach(x=>L.push('- '+x));
  });
  const partes=[];
  if(T.setupF)partes.push('implantação '+rs(T.setupF)+' (paga uma vez)');
  if(T.mensalF)partes.push('mensalidade '+rs(T.mensalF)+'/mês');
  let inv='Investimento: '+(partes.join(' + ')||'a confirmar');
  if(T.inicio&&T.setupF&&T.mensalF)inv+='. Para começar: '+rs(T.inicio);
  if(T.ap)inv+=' (a partir de)';
  if(C.falta.length)inv+=' (os itens a confirmar ficam de fora desse total)';
  L.push(inv);
  const prazos=T.itens.filter(i=>i.e&&i.e.prazo).map(i=>(multi?(CURTO[i.k]||MODS[i.k].name)+': ':'')+i.e.prazo);
  if(prazos.length)L.push('Prazo: '+[...new Set(prazos)].join('; '));
  if(T.desc)L.push('Já com '+T.desc+'% de desconto por combinar os serviços.');
  return L.join('\n');
}
const notasMsg=C=>(C.sv.some(k=>k==='ads'||k==='meta')?'A verba de anúncios é paga por você direto ao Google ou à Meta e não está nesses valores.\n':'')+'Condição de pagamento: a confirmar.';
const comporMsg=(ab,fe,C)=>[String(ab||'').trim(),['basico','medio','max'].map(pk=>blocoPlano(C,pk)).join('\n\n')+'\n\n'+notasMsg(C),String(fe||'').trim()||FECHO_PADRAO].filter(Boolean).join('\n\n');
const MSG_RUIM=m=>!m||m.length<80||m.length>3500||/\*\*|^#{1,3} /m.test(m);
async function chamarOrc(msgs,C,tipo){
  let out='',prob=[];
  for(let i=0;i<2;i++){
    out=clean(await askF(msgs,t=>live('orc',clean(t)),{slot:'ia2',max:tipo==='msg'?700:4800,temp:i?0.1:0.2}));
    const k=out.indexOf('---MENSAGEM---'),raw=tipo==='msg'?out:(k<0?'':out.slice(k+14).trim()),body=tipo==='msg'?'':(k<0?out:out.slice(0,k)).trim();
    const partesMsg=raw.split('---FECHO---'),abertura=(partesMsg[0]||'').trim(),fecho=(partesMsg[1]||'').trim();
    const msg=abertura?comporMsg(abertura,fecho,C):'';
    prob=[];
    if(abertura&&!fecho)prob.push('faltou o fechamento depois da linha ---FECHO---');
    if(tipo!=='msg'&&!['BASICO','MEDIO','MAX'].every(x=>body.includes('---'+x+'---')))prob.push('faltam os marcadores ---BASICO---, ---MEDIO--- e ---MAX--- (um por pacote)');
    if(tipo!=='msg'&&k<0)prob.push('faltou a linha ---MENSAGEM--- com a mensagem de WhatsApp');
    if(MSG_RUIM(msg))prob.push('a mensagem de WhatsApp está ausente, curta demais, longa demais ou com markdown');
    prob.push(...checarValores(tipo==='msg'?msg:out,C,tipo==='msg'));
    if(!prob.length||i)return {body,msg,prob};
    msgs=[...msgs,{role:'assistant',content:out},{role:'user',content:'Corrija estes problemas e responda de novo no mesmo formato: '+prob.join('; ')+'. Use exatamente estes totais:\n'+refValores(C)}];
  }
}
async function orc(id,corr){
  const l=getL().find(x=>x.id===id);if(!l)return;
  const C=calcOrc(l),first=l.nome.split(' ')[0];
  const msgs=[{role:'system',content:SYS_ORC(l)},
   {role:'user',content:`TABELA DE PREÇOS DOS SERVIÇOS ESCOLHIDOS:\n${tabelaParaIA(l,C)}\n\nCONTAS JÁ CONFERIDAS (use exatamente estes totais):\n${refValores(C)}\n\nBRIEFING DO CLIENTE:\n${brief(l).split('\n\nTarefa:')[0]}\nSERVIÇOS ESCOLHIDOS: ${curtoNomes(l)}\n\nMonte 3 PACOTES usando só a tabela de preços:\n- BASICO (Essencial): resolve uma necessidade específica com escopo enxuto, menor investimento (se o cliente disse quanto quer investir, procure caber nisso).\n- MEDIO (Crescimento): acrescenta entregas ou acompanhamento que justificam o investimento maior.\n- MAX (Completo): para operações que realmente precisam de uma estrutura maior. Não force o Completo se o briefing não pede.\nNão trate nenhum pacote como recomendado por padrão: se uma solução mais simples bastar para o briefing, diga isso.\n${svcs(l).length>1?'Como são vários serviços, cada pacote combina todos eles no mesmo nível e soma tudo.\n':''}Cada pacote deve ser uma PROPOSTA EXPLICADA, que o cliente entenda sem precisar perguntar nada, em Markdown, com estes blocos em negrito, nesta ordem:\n**O que vamos fazer:** de 3 a 5 linhas com a estratégia deste pacote para o negócio do cliente (qual é o caminho, por que ele faz sentido para o ramo, o público e o objetivo informados), citando 1 ou 2 detalhes reais do briefing.\n**Como vamos trabalhar:** de 3 a 6 etapas numeradas (diagnóstico, configuração, produção, lançamento, acompanhamento etc.) dizendo, em linguagem simples, o que acontece em cada uma, com os prazos da tabela quando houver.\n**O que está incluso:** cada item da tabela com uma explicação curta de para que serve e o que o cliente recebe na prática (só itens da tabela).\n**O que não está incluso:** o que fica de fora ou é pago à parte (por exemplo, verba de anúncios paga direto à plataforma, domínio e hospedagem, quando for o caso).\n**O que precisamos de você:** acessos por convite (nunca senha), materiais, aprovações e prazos de resposta.\n**O que você acompanha:** como vai ver o andamento e quais indicadores serão olhados, sem prometer números.\n**Investimento:** implantação, mensalidade e total para começar (use exatamente os totais conferidos), prazo em dias úteis e, no pagamento, escreva "condição de pagamento a confirmar" (nenhuma condição foi aprovada). Liste à parte custos externos que apareçam na tabela (domínio, hospedagem) e a verba de anúncios paga à plataforma.\n**Para quem é este pacote:** uma frase dizendo quando ele é a melhor escolha, com base no briefing, e quando não é necessário.\nEspecifique quantidades, limites, frequência, revisões e responsabilidades; evite expressões vagas. Não invente entregas, números de resultado, prazos, descontos nem valores. Cada pacote deve ter entre 220 e 380 palavras.\n\nUse EXATAMENTE este formato, com as linhas de marcação sozinhas:\n---BASICO---\n(pacote)\n---MEDIO---\n(pacote)\n---MAX---\n(pacote)\n---MENSAGEM---\n(mensagem de WhatsApp pronta para ${first}. ${MSG_REGRAS})`+(corr&&l.orc?`\n\nRESPOSTA ANTERIOR (tinha erro):\n${l.orc}\n\n${l.msg||''}\n\nCORREÇÃO DA EQUIPE (obrigatória, siga à risca; se pedir outro valor, ele precisa estar na tabela): ${corr}\nRefaça tudo corrigindo isso.`:'')}];
  Object.assign(J.orc,{on:true,id,live:'',t0:Date.now(),what:'orc'});A.err='';A.sel=id;paintList();paintDet();
  try{
    const r=await chamarOrc(msgs,C,'orc');
    upd(id,{orc:r.body,msg:r.msg,orcAviso:r.prob.slice(0,6),...(l.status==='novo'?{status:'pronto'}:{})});
  }catch(e){A.err=e.message}
  J.orc.on=false;paintList();paintDet();
}
async function msgGen(id,corr){
  const l=getL().find(x=>x.id===id);if(!l)return;
  const C=calcOrc(l),first=l.nome.split(' ')[0];
  const msgs=[{role:'system',content:SYS_ORC(l)},
   {role:'user',content:`${ctxCliente(l)}\n\nTABELA DE PREÇOS DOS SERVIÇOS ESCOLHIDOS:\n${tabelaParaIA(l,C)}\n\nCONTAS JÁ CONFERIDAS (use exatamente estes totais):\n${refValores(C)}\n\nORÇAMENTOS:\n${(l.orc||'(ainda não gerados)').replace(/---(BASICO|MEDIO|MAX)---/g,(x,k)=>'\n## '+LBL[k])}\n\nMENSAGEM ATUAL (tinha erro):\n${l.msg||''}\n\nCORREÇÃO DA EQUIPE (obrigatória, siga à risca): ${corr||'refaça a mensagem'}\nEscreva a mensagem de WhatsApp para ${first}. ${MSG_REGRAS} Responda só com a mensagem.`}];
  Object.assign(J.orc,{on:true,id,live:'',t0:Date.now(),what:'msg'});A.err='';A.sel=id;paintList();paintDet();
  try{const r=await chamarOrc(msgs,C,'msg');upd(id,{msg:r.msg,orcAviso:r.prob.slice(0,6)})}catch(e){A.err=e.message}
  J.orc.on=false;paintList();paintDet();
}
/* A IA só roda quando o consultor clica (nada é gerado sozinho ao abrir o site ou a Minha área). */
async function gerarTudo(id){
  if(anyBusy()||!A.auth)return;
  const l=getL().find(x=>x.id===id);if(!l)return;
  A.tab='orc';A.fs=false;A.err='';
  if(!l.ficha){await ficha(id);if(A.err)return}
  const x=getL().find(y=>y.id===id)||l,faz=[];
  if(!x.orc)faz.push(()=>orc(id));if(!x.entrega)faz.push(()=>gen(id));
  if(sameIA()){for(const f of faz){await f();if(A.err)return}}else await Promise.all(faz.map(f=>f()));
  if(!A.err)await execAll(id,true);
}
addEventListener('storage',e=>{if(e.key==='leads2'&&V==='admin'&&A.auth&&(!A.view||A.view==='trk'||A.view==='dash')){paintList();if(A.view==='dash')pintaDash()}});
setInterval(()=>{if(V==='admin'&&A.auth&&(!A.view||A.view==='trk'||A.view==='dash')&&sig()!==A.sig){paintList();if(A.view==='dash')pintaDash()}},3000);
