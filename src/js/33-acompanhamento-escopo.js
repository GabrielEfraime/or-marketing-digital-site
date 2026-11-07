/* ---------- o que vamos fazer: frentes de cada serviço (redes e formatos; áreas dos outros serviços) ---------- */
const PK_DE_NOME={Essencial:'basico',Crescimento:'medio',Completo:'max'};
const trkPk=l=>PK_DE_NOME[(l.track||{}).pacote]||l.plano||'';
const FREQ={mensal:'Todo mês',semanal:'Toda semana',unica:'Uma vez',limite:'Fora do escopo'};
const LIMITE_RE=/por conta do cliente|n[aã]o inclu|pago pelo cliente|paga pelo cliente/i;
const svNome=k=>MODS[k]?(CURTO[k]||MODS[k].name):k;
const svNomeC=k=>{const s=svNome(k);return s.charAt(0).toUpperCase()+s.slice(1)};
const REDES=['Instagram','Facebook','TikTok','LinkedIn','YouTube','Kwai','Pinterest','X'];
const REDE_FMT={Instagram:['post','carrossel','reels','stories'],Facebook:['post','reels','stories'],TikTok:['video'],LinkedIn:['post','carrossel'],YouTube:['shorts'],Kwai:['video'],Pinterest:['pin'],X:['post']};
const FMT={post:'Posts no feed',carrossel:'Carrosséis',reels:'Reels',stories:'Stories',video:'Vídeos curtos',shorts:'Shorts',pin:'Pins',comunidade:'Respostas a comentários e mensagens',relatorio:'Relatório do mês',
 campanha:'Estrutura das campanhas',anuncio:'Anúncios (títulos e descrições)',palavras:'Palavras-chave e negativas',extensao:'Extensões do anúncio',otimiza:'Otimização do mês',
 criativo:'Criativos',publico:'Públicos para testar',ytvideo:'Vídeos do canal',thumb:'Thumbnails',
 gmnpost:'Publicações no perfil do Google',avaliacao:'Respostas a avaliações',fotos:'Fotos e vídeos para pedir',qa:'Perguntas e respostas do perfil',
 pauta:'Pautas',release:'Releases',veiculos:'Veículos indicados',clipping:'Relatório de clipping',
 pagina:'Textos das páginas',manut:'Manutenção do mês',melhoria:'Melhorias de conversão',seo:'SEO das páginas',
 conceito:'Conceitos de marca',logo:'Direções de logo',paleta:'Paleta e tipografia',aplic:'Aplicações da marca',outro:'Outra frente'};
const FR_AREAS={ads:[['campanha',1],['anuncio',3],['palavras',1],['extensao',1],['otimiza',1],['relatorio',1]],
 meta:[['criativo',3],['publico',1],['otimiza',1],['relatorio',1]],youtube:[['ytvideo',4],['shorts',8],['thumb',4]],
 local:[['gmnpost',4],['avaliacao',1],['fotos',1],['qa',1]],press:[['pauta',3],['release',1],['veiculos',1],['clipping',1]],
 site:[['pagina',1],['manut',1],['melhoria',3],['seo',1]],brand:[['conceito',3],['logo',3],['paleta',1],['aplic',1]]};
FR_AREAS.resite=FR_AREAS.site;
const POR={mes:'por mês',semana:'por semana',dia:'por dia',projeto:'no projeto'};
const FMT_RE={post:/\bposts?\b/i,carrossel:/carross/i,reels:/\breels?\b/i,stories:/\bstor(y|ies)\b/i,shorts:/\bshorts\b/i,ytvideo:/v[ií]deos?/i,release:/releases?/i,pauta:/pautas?/i,gmnpost:/publica[cç]/i,
 criativo:/criativos?|pe[cç]as/i,campanha:/campanhas?/i,anuncio:/an[uú]ncios?/i,relatorio:/relat[oó]rio/i,comunidade:/comunidade|coment[aá]rios|mensagens/i,avaliacao:/avalia[cç]/i,pagina:/p[aá]ginas?/i,melhoria:/melhoria/i};
function qtdDe(txt,re){
  if(!re.test(txt))return null;
  const n=txt.match(/(\d+)\s*(?:a|-|–|ou)\s*(\d+)/)||txt.match(/(\d+)/),por=/todo dia|todos os dias|di[aá]ri/i.test(txt)?'dia':/semana/i.test(txt)?'semana':'mes';
  return {qtd:n?Math.max(+n[1],+(n[2]||0)):(por==='dia'?1:null),por};
}
function redesDoCliente(l){
  const p=((l.track&&l.track.canais.social&&l.track.canais.social.perfis)||[]).map(x=>x.rede),txt=norm(qaOf(l).map(x=>x.a).join(' ')+' '+(l.ficha||''));
  const pad={X:/twitter/},achou=REDES.filter(r=>p.some(x=>norm(x).includes(norm(r)))||(pad[r]||new RegExp('\\b'+norm(r)+'\\b')).test(txt));
  return achou.length?achou:['Instagram'];
}
function frentesDe(l,pk){
  const Tb=parseTab(CFG.precos),fr=[],resto=[];let redes=[];
  svcs(l).forEach(k=>{
    const e=pk&&(Tb.mods[k]||{})[pk],inc=e?(e.inclui.length?e.inclui:[e.nome||MODS[k].name]):[],fq=e&&e.mensal>0?'mensal':'unica',usado=new Set();
    const acha=f=>{for(let i=0;i<inc.length;i++){if(usado.has(i))continue;const q=FMT_RE[f]&&qtdDe(inc[i],FMT_RE[f]);if(q){usado.add(i);return q}}return null};
    if(k==='social'){
      inc.forEach((x,i)=>{if(/\bredes?\b/i.test(x)&&/\d/.test(x)&&!/post|reels|stor/i.test(x))usado.add(i)});
      redes=redesDoCliente(l);
      const q={post:acha('post'),carrossel:acha('carrossel'),reels:acha('reels'),stories:acha('stories')};q.video=q.shorts=q.reels;
      redes.forEach(r=>(REDE_FMT[r]||['post']).forEach(f=>{const v=q[f];if(v||['post','video','shorts'].includes(f))fr.push({id:uid(),k,rede:r,fmt:f,qtd:(v&&v.qtd)||4,por:v?v.por:'mes'})}));
      ['comunidade','relatorio'].forEach(f=>{const v=acha(f);if(v)fr.push({id:uid(),k,rede:'',fmt:f,qtd:1,por:'mes'})});
    }else(FR_AREAS[k]||[]).forEach(([f,d])=>{const v=acha(f);fr.push({id:uid(),k,rede:'',fmt:f,qtd:(v&&v.qtd)||d,por:k==='brand'?'projeto':(v?v.por:'mes')})});
    inc.forEach((x,i)=>{if(!usado.has(i))resto.push({id:uid(),k,txt:x,freq:LIMITE_RE.test(x)?'limite':fq,done:false})});
  });
  return {frentes:fr,resto,redes};
}
/* completa acompanhamentos antigos com as partes novas; devolve true se mudou algo */
function trkGarante(l){
  const t=l&&l.track;if(!t)return false;let m=false;const sv=svcs(l);
  if(!Array.isArray(t.frentes)){const r=frentesDe(l,trkPk(l));t.frentes=r.frentes;t.redes=r.redes;if(!Array.isArray(t.escopo)||t.escopoPk!==undefined)t.escopo=r.resto;t.escopoPk=trkPk(l);m=true}
  if(!Array.isArray(t.escopo)){t.escopo=[];m=true}
  if(!Array.isArray(t.redes)){t.redes=[...new Set(t.frentes.map(f=>f.rede).filter(Boolean))];m=true}
  ['pecas','ciclos','campanhas'].forEach(f=>{if(!Array.isArray(t[f])){t[f]=[];m=true}});
  t.pecas.forEach(p=>{if(/^\d{4}-\d{2}$/.test(p.per||'')){const d=p.per+'-01';p.per='c'+cicDe(t,d<(t.start||d)?t.start:d);m=true}});
  if(!isObj(t.ia)){t.ia={};m=true}
  if(!isObj(t.perfil)){t.perfil=perfilDoBriefing(l);m=true}
  if(sv.includes('meta')&&!t.canais.meta){t.canais.meta={conta:'',situacao:'Planejado',inicio:'',rows:[]};m=true}
  if(sv.includes('press')&&!t.canais.press){t.canais.press={situacao:'Planejado',veiculos:[],pautas:[]};m=true}
  if(t.canais.site){const s=t.canais.site;if(!Array.isArray(s.versoes)){s.versoes=[];m=true}if(!isObj(s.links)){s.links={};m=true}}
  return m;
}
const frNome=f=>(f.rede?f.rede+' · ':'')+(f.fmt==='outro'?(f.nome||'Outra frente'):(FMT[f.fmt]||f.fmt));
const alvo=f=>f.por==='semana'?f.qtd*4:f.por==='dia'?f.qtd*30:f.qtd;
const fmtsDe=k=>k==='social'?[...new Set(Object.values(REDE_FMT).flat()),'comunidade','relatorio','outro']:[...(FR_AREAS[k]||[]).map(a=>a[0]),'outro'];
function tabEscopo(l){
  const t=l.track,pk=trkPk(l),Tb=parseTab(CFG.precos),sv=svcs(l);
  const linha=f=>`<div class="fr-it"><span class="fr-n">${f.rede?`<b>${esc(f.rede)}</b> · `:''}${f.fmt==='outro'?`<input data-fr-n="${f.id}" value="${esc(f.nome||'')}" placeholder="Nome da frente" aria-label="Nome da frente">`:esc(FMT[f.fmt]||f.fmt)}</span><input type="number" min="1" max="60" data-fr-q="${f.id}" value="${esc(f.qtd)}" aria-label="Quantidade de ${esc(frNome(f))}"><select data-fr-p="${f.id}" aria-label="Frequência de ${esc(frNome(f))}">${Object.entries(POR).map(([v,n])=>`<option value="${v}" ${f.por===v?'selected':''}>${n}</option>`).join('')}</select><button class="btn ghost itg" data-act="area:${f.id}">Abrir</button>${delBtn('frdel:'+f.id)}</div>`;
  const bloco=k=>{const e=pk&&(Tb.mods[k]||{})[pk],F=t.frentes.filter(f=>f.k===k),O=t.escopo.filter(x=>x.k===k);
    return `<section class="esc"><h4>${esc(svNomeC(k))}${e?` <span class="hint">· ${esc(e.nome||PLANO_NOME[pk])} · ${e.setup?'implantação '+rs(e.setup):'sem implantação'}${e.mensal?' · '+rs(e.mensal)+'/mês':''}${e.prazo?' · '+esc(e.prazo):''}</span>`:''}</h4>
    ${k==='social'?`<p class="u-mb6 hint">Redes do cliente</p><div class="redes">${[...new Set([...REDES,...t.redes])].map(r=>`<label class="rd ${t.redes.includes(r)?'on':''}"><input type="checkbox" data-act="rede:${esc(r)}" ${t.redes.includes(r)?'checked':''}> ${esc(r)}</label>`).join('')}</div>`:''}
    ${k==='social'?t.redes.map(r=>{const L=F.filter(f=>f.rede===r);return `<h5 class="sub-h">${esc(r)}</h5>`+(L.map(linha).join('')||'<p class="hint">Nenhum formato. Adicione abaixo.</p>')}).join('')+(F.some(f=>!f.rede)?'<h5 class="sub-h">Em todas as redes</h5>'+F.filter(f=>!f.rede).map(linha).join(''):''):(F.map(linha).join('')||'<p class="hint">Nenhuma frente.</p>')}
    <div class="fr-add">${k==='social'?`<select id="fa_r_${k}" aria-label="Rede"><option value="">Todas as redes</option>${t.redes.map(r=>`<option>${esc(r)}</option>`).join('')}</select>`:''}<select id="fa_f_${k}" aria-label="Formato ou área">${fmtsDe(k).map(f=>`<option value="${f}">${esc(FMT[f])}</option>`).join('')}</select><input id="fa_q_${k}" type="number" min="1" max="60" value="4" aria-label="Quantidade"><button class="btn ghost itg" data-act="fradd:${k}">Adicionar frente</button></div>
    ${O.length?`<h5 class="sub-h">Outras entregas</h5>`+O.map(x=>`<div class="esc-it ${x.freq==='limite'?'lim':''}">${x.freq==='unica'?`<input type="checkbox" data-act="escdone:${x.id}" ${x.done?'checked':''} aria-label="Entregue">`:'<span class="esc-dot" aria-hidden="true"></span>'}<input class="esc-tx" data-esc-txt="${x.id}" value="${esc(x.txt)}" aria-label="Entrega"><select data-esc-fq="${x.id}" aria-label="Frequência">${Object.entries(FREQ).map(([v,n])=>`<option value="${v}" ${x.freq===v?'selected':''}>${n}</option>`).join('')}</select>${delBtn('escdel:'+x.id)}</div>`).join(''):''}</section>`};
  return `<p class="hint">O que a equipe vai fazer para este cliente, separado por frente: em redes sociais, cada rede com os seus formatos; nos outros serviços, cada área. A quantidade vem do pacote na tabela de preços e você ajusta. "Abrir" leva à página da frente na aba Produção, onde as peças são geradas.</p>
  <div class="fr">${fld('Pacote contratado','pacote',t.pacote,null,['','Essencial','Crescimento','Completo','Outro'])}<div><button class="btn ghost" data-act="escload">Recarregar do pacote</button></div></div>
  ${pk?'':'<p class="u-err hint">Escolha o pacote para puxar as quantidades da tabela.</p>'}${T.msg?`<p class="hint">${esc(T.msg)}</p>`:''}
  ${sv.map(bloco).join('')}
  <h4>Adicionar outra entrega</h4><div class="fr"><div><label for="es_k">Serviço</label><select id="es_k">${sv.map(k=>`<option value="${k}">${esc(svNomeC(k))}</option>`).join('')}</select></div><div class="u-span2"><label for="es_txt">Entrega</label><input id="es_txt" maxlength="300" placeholder="Ex.: reunião mensal com o cliente"></div><div><label for="es_fq">Frequência</label><select id="es_fq">${Object.entries(FREQ).map(([v,n])=>`<option value="${v}">${n}</option>`).join('')}</select></div><div><button class="btn" data-act="escadd">Adicionar</button></div></div>`;
}
