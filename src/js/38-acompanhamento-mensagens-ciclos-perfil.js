/* ---------- mensagens prontas (WhatsApp) ---------- */
function waMsg(l,tipo){const n=l.nome.split(' ')[0];
  return ({material:`Oi, ${n}! Aqui é a equipe da OR. Para a produção deste período, precisamos de algumas fotos ou vídeos recentes do seu negócio (produtos, equipe, bastidores). Pode nos mandar por aqui quando puder?`,
    aprovacao:`Oi, ${n}! Aqui é a equipe da OR. Passando para lembrar da aprovação do material que enviamos. Se quiser ajustar alguma coisa, é só dizer o que mudar.`,
    reuniao:`Oi, ${n}! Aqui é a equipe da OR. Que tal uma conversa rápida de 20 minutos esta semana para revisarmos o que foi feito e os próximos passos? Qual dia e horário ficam bons para você?`})[tipo]||'';
}
const waRapido=l=>`<h4>Mensagens rápidas para o cliente</h4><div class="row"><button class="btn ghost" data-act="wamsg:material">Pedir fotos e vídeos</button><button class="btn ghost" data-act="wamsg:aprovacao">Lembrar da aprovação</button><button class="btn ghost" data-act="wamsg:reuniao">Marcar uma conversa</button></div><p class="hint">Abre o WhatsApp com a mensagem pronta para você revisar antes de enviar. A integração direta com o WhatsApp da OR (enviar e receber por aqui) precisa de um número no WhatsApp Business e do servidor.</p>`;

/* ---------- mês do contrato: Mês 1, Mês 2... contados a partir do início do cliente (não pelo mês do calendário) ---------- */
const addMeses=(d,n)=>{const x=new Date(d+'T12:00:00'),dia=x.getDate();x.setDate(1);x.setMonth(x.getMonth()+n);x.setDate(Math.min(dia,new Date(x.getFullYear(),x.getMonth()+1,0).getDate()));return x.toISOString().slice(0,10)};
const cicIni=(t,n)=>addMeses(t.start||today(),n-1);
const cicFim=(t,n)=>addDays(cicIni(t,n+1),-1);
function cicDe(t,d){let n=1;while(n<240&&cicIni(t,n+1)<=d)n++;return n}
const cicAtual=t=>cicDe(t,today());
const perSel=t=>'c'+(T.cic||cicAtual(t));
const perN=p=>/^c\d+$/.test(p||'')?+p.slice(1):0;
const perNomeT=(t,p)=>p==='projeto'?'projeto':'Mês '+perN(p)+' · '+fdate(cicIni(t,perN(p))).slice(0,5)+' a '+fdate(cicFim(t,perN(p))).slice(0,5);
const perLongo=(t,p)=>p==='projeto'?'projeto inteiro':'Mês '+perN(p)+' do contrato ('+fdate(cicIni(t,perN(p)))+' a '+fdate(cicFim(t,perN(p)))+')';
const perAntes=p=>perN(p)>1?'c'+(perN(p)-1):'';

/* ---------- perfil do cliente: o nicho e as respostas do briefing são a base de toda IA deste cliente ---------- */
const PERFIL_CAMPOS=[['nicho','Nicho / ramo','Ex.: barbearia de bairro, beleza masculina'],['oferta','O que vende ou oferece',''],['publico','Público',''],['regiao','Região',''],['objetivo','Objetivo agora',''],['tom','Tom e jeito da marca',''],['diferenciais','Diferenciais',''],['restricoes','Regras e o que evitar',''],['concorrentes','Concorrentes e referências',''],['datas','Datas e épocas fortes',''],['especifico','Particularidades do nicho (sugestão da IA, confirme)',''],['extra','Outras observações','']];
const PERFIL_RE={nicho:/qual e o seu negocio|seu negocio ou o seu trabalho|assunto do seu canal/,oferta:/o que voce (vende|oferece)|devem ser priorizados/,publico:/publico|cliente ideal|para quem voce quer ser visto|quem compra/,regiao:/onde estao os (seus )?clientes|cidade|bairro|regiao/,
 objetivo:/o que voce (mais )?quer conseguir|objetivo|o que voce quer que a pessoa faca|maior problema/,tom:/jeito de falar|tom de voz|estilo visual|como quer ser visto/,diferenciais:/escolherem voce|diferencia/,restricoes:/regra comercial|nao deve ser divulgado|devem ser evitados/,
 concorrentes:/concorrent|admira|referencias que vale/,datas:/dias, horarios ou epocas|proximos 3 meses|lancamento, evento|novidade para divulgar/};
const FICHA_RE={nicho:/^neg[oó]cio:/i,oferta:/^o que vende/i,publico:/^p[uú]blico e regi[aã]o:/i,objetivo:/^objetivo/i,extra:/^observa[cç]/i};
const REGULADO=/clinic|estetic|dent|odont|medic|saude|psicolog|nutri|fisio|advoc|advog|contab|farmac|bebida|cerveja|financ|credito|emprestimo|imobil|corretor|seguro|veterin/;
const vazio=a=>!a||/^(n[aã]o sei|n[aã]o informado|nenhum|nenhuma|-|não)$/i.test(String(a).trim());
function perfilDoBriefing(l){
  const p={},add=(k,v)=>{v=String(v||'').replace(/\s+/g,' ').trim();if(vazio(v))return;const L=p[k]?p[k].split(' · '):[];if(!L.some(x=>norm(x)===norm(v)))L.push(v);p[k]=L.join(' · ').slice(0,500)};
  qaOf(l).forEach(x=>{const q=norm(x.q||''),a=String(x.a||'');for(const [k,re] of Object.entries(PERFIL_RE))if(re.test(q)){add(k,a);break}});
  String(l.ficha||'').split('\n').forEach(s=>{for(const [k,re] of Object.entries(FICHA_RE))if(re.test(s.trim())){const v=s.slice(s.indexOf(':')+1).trim();if(!/n[aã]o informado/i.test(v))add(k,v);break}});
  if(REGULADO.test(norm((p.nicho||'')+' '+(p.oferta||''))))add('restricoes','Setor com regras de publicidade (conselho profissional ou lei específica): respeite-as e não prometa resultado');
  PERFIL_CAMPOS.forEach(([k])=>{if(p[k]===undefined)p[k]=''});
  return {...p,fonte:'briefing',em:today()};
}
const perfilDe=l=>(l.track&&isObj(l.track.perfil)&&l.track.perfil)||perfilDoBriefing(l);
const REGRA_NICHO='Tudo precisa ser específico para o nicho, o público, a região e o objetivo deste cliente, a partir do perfil e das respostas do briefing. Não use ideias genéricas que serviriam para qualquer negócio nem exemplos de outros nichos, e nunca troque o negócio do cliente. Se uma informação não estiver no perfil nem nas respostas, não suponha: marque [a confirmar com o cliente]. Escreva em linguagem simples e prática para o dono de um negócio pequeno, com ações viáveis para pouca verba e pouco tempo.';
function ctxIA(l){
  const p=perfilDe(l),lin=PERFIL_CAMPOS.filter(([k])=>p[k]).map(([k,n])=>'- '+n+': '+p[k]).join('\n');
  const vis=new Set(),resp=qaOf(l).filter(x=>!vazio(x.a)&&!vis.has(norm(x.q))&&vis.add(norm(x.q))).map(x=>'- '+x.q+' '+String(x.a).slice(0,400)).join('\n').slice(0,6000);
  return '<briefing>\nPERFIL DO CLIENTE (base de tudo o que você gerar para ele):\n'+(lin||'(perfil ainda vazio)')+(l.ficha?'\n\nRESUMO CONFIRMADO DO BRIEFING:\n'+String(l.ficha).slice(0,1500):'')+'\n\nRESPOSTAS DO CLIENTE NO BRIEFING:\n'+(resp||'(sem respostas registradas)')+'\n</briefing>';
}
function perfilHtml(l){
  const p=perfilDe(l),n=PERFIL_CAMPOS.filter(([k])=>p[k]).length,busy=T.busy==='perfil';
  return `<section class="perf" id="perfil"><div class="perf-h"><div class="perf-i"><span class="hint">Base da IA para este cliente</span><b>${esc(p.nicho||'Nicho ainda não identificado')}</b><span class="hint">${[p.regiao,p.publico&&'público: '+p.publico].filter(Boolean).map(x=>esc(String(x).slice(0,120))).join(' · ')||'Complete o perfil para a IA acertar o nicho.'}</span></div>
  <div class="u-m0 row"><button class="btn" data-act="perfilia" ${T.busy?'disabled':''}>${busy?'Organizando… '+(T.relLive||0)+' caracteres':'Organizar com IA'}</button><button class="btn ghost" data-act="perfilbr" ${T.busy?'disabled':''}>Recarregar do briefing</button></div></div>
  ${T.pMsg?`<p class="hint" role="status">${esc(T.pMsg)}</p>`:''}
  <details class="it2-c" ${T.pAbre||!p.nicho?'open':''}><summary>Ver e editar o perfil (${n} de ${PERFIL_CAMPOS.length} campos preenchidos)</summary><div class="perf-f">${PERFIL_CAMPOS.map(([k,nm,ph])=>`<div class="${['nicho','regiao','tom'].includes(k)?'':'perf-l'}"><label for="pf-${k}">${esc(nm)}</label><textarea id="pf-${k}" data-f="perfil.${k}" rows="${['nicho','regiao'].includes(k)?1:2}" maxlength="600" placeholder="${esc(ph)}">${esc(p[k]||'')}</textarea></div>`).join('')}</div>
  <p class="hint">Vem das respostas do briefing${p.fonte==='ia'?', organizadas pela IA em '+esc(fdate(p.em)):p.fonte==='editado'?', com ajustes seus':''}. Tudo o que a IA gera para este cliente (produção, assistente dos canais, briefings das peças, entregas e relatórios) parte deste perfil e de todas as respostas do briefing.</p></details></section>`;
}
const perfilLinha=l=>{const p=perfilDe(l);return `<div class="iap-base"><span>Base: <b>${esc(p.nicho||'nicho não identificado')}</b>${p.regiao?' · '+esc(String(p.regiao).slice(0,60)):''}${p.publico?' · público: '+esc(String(p.publico).slice(0,80)):''}</span><button class="btn ghost itg" data-act="verperfil">Ver o perfil</button></div>`};
async function perfilIA(id){
  const l=trkL(id);if(!l||T.busy)return;
  const campos=PERFIL_CAMPOS.map(([k,n])=>'"'+k+'":"'+n+'"').join(',');
  const msgs=[{role:'system',content:'Você organiza o perfil de um cliente de marketing digital a partir das respostas que ele deu no briefing. Responda SOMENTE com JSON válido, sem texto fora do JSON. Nos campos sobre o cliente, use só o que ele respondeu, com as palavras dele resumidas; se ele não respondeu, deixe "". O campo "nicho" diz o segmento e o subnicho em poucas palavras (ex.: "beleza masculina · barbearia de bairro"). O campo "especifico" é a única exceção: traga, em até 4 linhas, o que costuma funcionar no marketing desse nicho (datas fortes do setor, temas, linguagem, cuidados e regras de publicidade), como conhecimento geral do nicho, sem afirmar nada sobre o cliente. '+PM_CURTO},
   {role:'user',content:ctxIA(l)+'\n\nDevolva o JSON com estas chaves (o valor ao lado é o que cada uma significa): {'+campos+'}'}];
  T.busy='perfil';T.pMsg='';T.relLive=0;trkPaint();
  try{
    const out=await askF(msgs,s=>{T.relLive=s.length;const b=document.querySelector('[data-act=perfilia]');if(b)b.textContent='Organizando… '+s.length+' caracteres'},{slot:'ia2',json:true,max:1800,temp:0.2}),j=xj(out);
    if(!j)throw new Error('A IA não devolveu o perfil num formato legível. Tente de novo.');
    trkSet(id,t=>{const p=isObj(t.perfil)?t.perfil:perfilDoBriefing(l);PERFIL_CAMPOS.forEach(([k])=>{const v=j[k];if(typeof v==='string'&&v.trim())p[k]=v.trim().slice(0,600)});p.fonte='ia';p.em=today();t.perfil=p});
    T.pMsg='Perfil organizado. Confira os campos: o que estiver errado, corrija aqui e a IA passa a usar a versão corrigida.';T.pAbre=true;
  }catch(e){T.pMsg=e.message}
  T.busy='';trkPaint();
}
