const STL={novo:'novo',pronto:'pronto',aprovado:'aprovado',aplicado:'em execução',recusado:'recusado'};
const stl=s=>STL[s]||s;
const today=()=>new Date().toLocaleDateString('sv-SE');
const addDays=(d,n)=>{const x=new Date(d+'T12:00:00');x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
const fdate=d=>d?String(d).split('-').reverse().join('/'):'';
const num=v=>{let s=String(v??'').replace(/[^\d,.\-]/g,'');if(!s)return 0;
  if(/^\-?\d{1,3}(\.\d{3})+$/.test(s))s=s.replace(/\./g,'');
  else{const lc=s.lastIndexOf(','),ld=s.lastIndexOf('.');if(lc>ld)s=s.replace(/\./g,'').replace(',','.');else if(ld>lc)s=s.replace(/,/g,'')}
  return parseFloat(s)||0};
const brl=n=>'R$ '+(Number(n)||0).toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});
const int=n=>(Math.round(Number(n)||0)).toLocaleString('pt-BR');
const T={id:null,tab:'geral',msg:'',busy:'',relLive:0};
const CH={ads:'Google Ads',meta:'Meta Ads',social:'Redes sociais',site:'Site',press:'Imprensa'};
const prog=t=>{const n=t.tarefas.length,d=t.tarefas.filter(x=>x.done).length;return n?Math.round(d/n*100):0};
const nextDue=t=>t.tarefas.filter(x=>!x.done).map(x=>x.due).sort()[0]||'';
const setPath=(o,p,v)=>{const k=p.split('.');let c=o;for(let i=0;i<k.length-1;i++)c=c[k[i]]=c[k[i]]||{};c[k[k.length-1]]=v};
const getPath=(o,p)=>p.split('.').reduce((a,k)=>a&&a[k],o);
const uid=()=>Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-3);
const trkL=id=>getL().find(x=>x.id===id);
function trkSet(id,fn){const l=trkL(id);if(!l||!l.track)return;fn(l.track);upd(id,{track:l.track})}

function trkNew(l){
  const sv=svcs(l),st=today(),canais={},tarefas=[];
  const add=(canal,txt,off)=>tarefas.push({id:uid(),canal,txt,due:addDays(st,off),done:false});
  if(sv.includes('ads')){canais.ads={conta:'',situacao:'Planejado',inicio:'',rows:[]};
    [['Pedir ao cliente acesso à conta de Google Ads dele (convite como Administrador ou vínculo ao meu gerente) e anotar o ID da conta',1],['Configurar as conversões (cliques no WhatsApp, formulário) e o Google Analytics 4',2],['Importar a planilha da aba Execução no Google Ads Editor e revisar',3],['Conferir anúncios, extensões e palavras negativas',3],['Ligar as campanhas e conferir se estão veiculando',4],['Revisar termos de pesquisa e adicionar negativas',11],['Primeira otimização de lances e palavras-chave',18],['Relatório do primeiro mês',32]].forEach(([t,o])=>add('ads',t,o));
    arr(l.xads&&l.xads.checklist_lancamento).slice(0,4).forEach(t=>add('ads','Lançamento: '+vtxt(t),3))}
  if(sv.includes('social')){canais.social={perfis:[],situacao:'Planejado',rows:[],postados:{}};
    [['Acessar o perfil do cliente e ajustar bio, foto e link',1],['Produzir o primeiro lote de conteúdo (semana 1)',3],['Começar a postar pelo calendário',4],['Produzir o lote da semana 2',10],['Revisar o que funcionou e ajustar os temas',14],['Relatório do primeiro mês',30]].forEach(([t,o])=>add('social',t,o));
    arr(l.xsoc&&l.xsoc.checklist_producao).slice(0,3).forEach(t=>add('social','Produção: '+vtxt(t),3))}
  if(isSite(l)){canais.site={url:urlAtual(l)||'',situacao:'Em construção',publicado:'',ga4:'',psi:[],rows:[]};
    [['Aprovar a versão final do site com o cliente',3],['Publicar o site e apontar o domínio',7],['Instalar o Google Analytics 4 e o Search Console',8],['Testar o formulário e o botão de WhatsApp',8],['Medir a velocidade e corrigir o que for preciso',9],['Relatório do primeiro mês',32]].forEach(([t,o])=>add('site',t,o))}
  sv.forEach(k=>{if(TAREFAS[k])TAREFAS[k].forEach(([t,o])=>add('geral',t,o))});
  const o={start:st,pacote:PLANO_NOME[l.plano]||'',valor:'',cobranca:'',pgto:'em dia',canais,tarefas,diario:[{id:uid(),data:st,txt:'Acompanhamento iniciado.'}],relatorios:[]};
  trkGarante({...l,track:o});return o;
}
function trkStart(id){
  const l=trkL(id);if(!l)return;
  upd(id,{status:'aplicado',...(l.track?{}:{track:trkNew(l)})});
  A.view='trk';T.id=id;T.tab='geral';T.msg='';admin();
}

function adsSum(rows){const s={imp:0,cli:0,cus:0,conv:0};rows.forEach(r=>{s.imp+=num(r.imp);s.cli+=num(r.cliques);s.cus+=num(r.custo);s.conv+=num(r.conv)});
  return {...s,ctr:s.imp?s.cli/s.imp*100:0,cpc:s.cli?s.cus/s.cli:0,cpa:s.conv?s.cus/s.conv:0}}
function socSum(rows){const o={};rows.forEach(r=>{o.posts=(o.posts||0)+num(r.posts);o.alc=(o.alc||0)+num(r.alcance);o.int=(o.int||0)+num(r.interacoes)});const u=rows[0];o.seg=u?num(u.seguidores):0;
  const p=rows[1];o.dseg=u&&p?num(u.seguidores)-num(p.seguidores):0;return o}
function siteSum(rows){const v=rows.reduce((a,r)=>a+num(r.visitas),0),c=rows.reduce((a,r)=>a+num(r.contatos),0);return {v,c,tx:v?c/v*100:0}}
const rowsSince=(rows,days)=>rows.filter(r=>r.data>=addDays(today(),-days));
function trkSummary(l){
  const t=l.track,c=t.canais,out=[];
  if(c.ads){const a=adsSum(c.ads.rows),w=adsSum(rowsSince(c.ads.rows,7));out.push(`Google Ads (${c.ads.situacao}): desde o início ${int(a.imp)} impressões, ${int(a.cli)} cliques, custo ${brl(a.cus)}, ${int(a.conv)} conversões, CTR ${a.ctr.toFixed(2)}%, CPC ${brl(a.cpc)}${a.conv?', custo por conversão '+brl(a.cpa):''}. Últimos 7 dias: ${int(w.cli)} cliques, custo ${brl(w.cus)}, ${int(w.conv)} conversões.`)}
  if(c.social){const s=socSum(c.social.rows);out.push(`Redes sociais (${c.social.situacao}): ${arr(c.social.perfis).map(p=>p.rede+' '+p.handle).join(', ')||'perfis não informados'}. Seguidores atuais: ${int(s.seg)}${s.dseg?' ('+(s.dseg>0?'+':'')+int(s.dseg)+' desde o registro anterior)':''}; posts registrados: ${int(s.posts||0)}; alcance somado: ${int(s.alc||0)}; interações somadas: ${int(s.int||0)}; posts do calendário publicados: ${Object.keys(c.social.postados||{}).length}.`)}
  if(c.meta){const m=metaSum(c.meta.rows),w=metaSum(rowsSince(c.meta.rows,7));out.push(`Meta Ads (${c.meta.situacao}): desde o início valor usado ${brl(m.cus)}, ${int(m.imp)} impressões, ${int(m.cli)} cliques no link, ${int(m.res)} resultados${m.res?', custo por resultado '+brl(m.cpr):''}. Últimos 7 dias: valor usado ${brl(w.cus)}, ${int(w.res)} resultados.`)}
  if(c.site){const s=siteSum(c.site.rows),p=c.site.psi[0];out.push(`Site (${c.site.situacao}${c.site.url?', '+c.site.url:''}): ${int(s.v)} visitas e ${int(s.c)} contatos registrados${s.v?' ('+s.tx.toFixed(1)+'% de conversão)':''}.${p?` Última medição de qualidade (${fdate(p.data)}): desempenho ${p.perf}, acessibilidade ${p.acc}, SEO ${p.seo}.`:''}`)}
  return out.join('\n');
}

function isoDate(s){s=String(s||'').trim();let m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);if(m)return m[0];m=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);return m?m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0'):''}
function adsFromCsv(txt){
  const lines=txt.replace(/^\ufeff/,'').split(/\r?\n/).filter(x=>x.trim());
  const hi=lines.findIndex(l=>{const n=norm(l);return /clique|click/.test(n)&&/custo|cost/.test(n)});
  if(hi<0)return {rows:[],erro:'Não achei as colunas de cliques e custo. Exporte o relatório de campanhas do Google Ads com Dia, Impressões, Cliques, Custo e Conversões.'};
  const sp=[',',';','\t'].map(x=>[x,lines[hi].split(x).length]).sort((a,b)=>b[1]-a[1])[0][0];
  const split=l=>{const o=[];let cur='',q=false;for(const ch of l){if(ch==='"')q=!q;else if(ch===sp&&!q){o.push(cur);cur=''}else cur+=ch}o.push(cur);return o.map(x=>x.trim())};
  const H=split(lines[hi]).map(norm),ix=re=>H.findIndex(h=>re.test(h));
  const c={d:ix(/^(dia|day|data|date)$/),imp:ix(/impr/),cli:ix(/^(cliques|clicks)$/),cus:ix(/^(custo|cost)/),conv:ix(/^(conversoes|conversions|conv)/)};
  const agg={};let dated=0;
  for(const l of lines.slice(hi+1)){const p=split(l);if(p.length<2||/^(total|--)/.test(norm(p[0])))continue;
    const d=c.d>=0?isoDate(p[c.d]):'';if(d)dated++;
    const key=d||'import';const a=agg[key]=agg[key]||{data:d||today(),imp:0,cliques:0,custo:0,conv:0};
    a.imp+=num(p[c.imp]);a.cliques+=num(p[c.cli]);a.custo+=num(p[c.cus]);a.conv+=num(p[c.conv])}
  return {rows:Object.values(agg).map(a=>({data:a.data,imp:String(a.imp),cliques:String(a.cliques),custo:a.custo.toFixed(2),conv:String(a.conv)})),dated};
}

const bars=(rows,key,color)=>{const r=rows.slice(0,14).reverse();if(!r.length)return '';const W=360,max=Math.max(...r.map(x=>num(x[key])),1),st=W/r.length,bw=Math.min(26,st*.7);
  return `<svg viewBox="0 0 ${W} 64" class="bars" role="img" aria-label="Gráfico de ${key}">${r.map((x,i)=>{const h=Math.max(2,Math.round(num(x[key])/max*54));return `<rect x="${(i*st+(st-bw)/2).toFixed(1)}" y="${60-h}" width="${bw.toFixed(1)}" height="${h}" rx="4" fill="${color}"><title>${esc(fdate(x.data))}: ${esc(x[key])}</title></rect>`}).join('')}<line x1="0" y1="60.5" x2="${W}" y2="60.5" stroke="currentColor" opacity=".15"/></svg>`};
const kpi=(t,v)=>`<div class="kpi"><span>${t}</span><b>${v}</b></div>`;
const fld=(t,path,val,type,opts)=>`<div><label>${t}</label>${opts?`<select data-f="${path}">${opts.map(o=>`<option ${o===val?'selected':''}>${o}</option>`).join('')}</select>`:`<input data-f="${path}" type="${type||'text'}" value="${esc(val||'')}">`}</div>`;
const inp=(id,t,type,v)=>`<div><label for="${id}">${t}</label><input id="${id}" type="${type||'text'}" value="${esc(v||'')}"></div>`;
const delBtn=a=>`<button class="x" data-act="${esc(a)}" aria-label="Apagar">×</button>`;

function tabGeral(l){const t=l.track,st=nextDue(t),late=t.tarefas.filter(x=>!x.done&&x.due<today()).length,n=cicAtual(t),per='c'+n,F=t.frentes||[],M=F.filter(f=>f.por!=='projeto'),tot=M.reduce((s,f)=>s+alvo(f),0),fe=M.reduce((s,f)=>s+Math.min(alvo(f),pecasDe(t,f,per).length),0),dias=Math.max(0,Math.round((new Date(cicFim(t,n)+'T12:00:00')-new Date(today()+'T12:00:00'))/864e5)),out=(t.escopo||[]).filter(x=>x.freq==='unica');
  return `${perfilHtml(l)}<section class="mes-c"><div class="mes-i"><span class="hint">Mês do contrato</span><b>Mês ${n}</b><span>${esc(fdate(cicIni(t,n)))} a ${esc(fdate(cicFim(t,n)))} · ${dias?'faltam '+dias+' dia(s)':'último dia'}</span></div><div class="mes-p"><span>${fe} de ${tot} peças do mês geradas</span><div class="pb"><i style="width:${tot?Math.round(fe/tot*100):0}%"></i></div></div><button class="btn" data-act="area:">Abrir a produção</button></section>
  <h4>Demandas do Mês ${n}</h4>${svcs(l).map(k=>{const L=F.filter(f=>f.k===k);if(!L.length)return '';return `<section class="esc dem"><h5 class="sub-h">${esc(svNomeC(k))}</h5>${L.map(f=>{const P=pecasDe(t,f,per),a=alvo(f),ap=P.filter(p=>p.status==='Aprovado'||p.status==='Publicado').length,pub=P.filter(p=>p.status==='Publicado').length;return `<button type="button" class="dem-it" data-act="area:${f.id}"><span class="dem-n">${esc(frNome(f))}<small>${esc(f.qtd+' '+POR[f.por])}</small></span><span class="dem-b" aria-hidden="true"><i style="width:${a?Math.min(100,Math.round(P.length/a*100)):0}%"></i></span><span class="dem-v"><b>${P.length}/${a}</b>${ap?' · '+ap+' aprovada(s)':''}${pub?' · '+pub+' publicada(s)':''}</span></button>`}).join('')}</section>`}).join('')||'<p class="hint">Nenhuma demanda cadastrada. Veja "O que vamos fazer".</p>'}
  ${out.length?`<p class="hint">Entregas de implantação: ${out.filter(x=>x.done).length} de ${out.length} feitas (ver em Produção, "Outras entregas").</p>`:''}
  <h4>Tarefas</h4><div class="kpis">${kpi('Pendentes',t.tarefas.filter(x=>!x.done).length)}${kpi('Atrasadas',late)}${kpi('Próxima',st?fdate(st):'—')}${kpi('Concluídas',prog(t)+'%')}</div>${late?'<p class="hint" style="color:var(--err)">Há tarefas atrasadas. Veja a aba Tarefas.</p>':''}
  <h4>Contrato</h4><div class="fr">${fld('Pacote escolhido','pacote',t.pacote,null,['','Essencial','Crescimento','Completo','Outro'])}${fld('Valor combinado','valor',t.valor)}${fld('Dia da cobrança','cobranca',t.cobranca,'number')}${fld('Pagamento','pgto',t.pgto,null,['em dia','pendente','atrasado'])}${fld('Início do contrato','start',t.start,'date')}</div>
  <p class="hint">O Mês 1 começa na data de início do contrato. Mudar o início muda os períodos (as peças continuam nos meses em que foram feitas).</p>
  ${waRapido(l)}
  <p class="hint">A ligação automática com o Google Ads, o Meta Ads e as redes do cliente exige um servidor com as chaves oficiais de cada plataforma e a autorização do cliente. Por enquanto os números entram por importação de relatório e lançamento manual, e ficam guardados enquanto o cliente estiver com a OR.</p>`}
function tabAds(l){const c=l.track.canais.ads,s=adsSum(c.rows);
  return `${iaPainel(l,'ads')}
  <div class="cgrid"><section class="esc"><h4>Resultados</h4><div class="kpis">${kpi('Impressões',int(s.imp))}${kpi('Cliques',int(s.cli))}${kpi('Custo',brl(s.cus))}${kpi('Conversões',int(s.conv))}${kpi('CTR',s.ctr.toFixed(2)+'%')}${kpi('CPC médio',brl(s.cpc))}${kpi('Custo por conversão',s.conv?brl(s.cpa):'—')}</div>
  <div class="chs"><div><span class="hint">Cliques por dia</span>${bars(c.rows,'cliques','#F5F5F3')}</div><div><span class="hint">Conversões por dia</span>${bars(c.rows,'conv','#FF5A00')}</div></div>
  ${T.msg?`<p class="hint">${esc(T.msg)}</p>`:''}
  <details class="it2-c dlanc" ${c.rows.length?'':'open'}><summary>Lançar números ou importar relatório</summary><div class="fr">${inp('ar_data','Data','date',today())}${inp('ar_imp','Impressões','number')}${inp('ar_cli','Cliques','number')}${inp('ar_custo','Custo (R$)','text')}${inp('ar_conv','Conversões','number')}<div><button class="btn" data-act="addads">Adicionar</button></div></div>
  <div class="row" style="margin-top:8px"><label class="btn ghost" style="margin:0;cursor:pointer">Importar relatório CSV do Google Ads<input type="file" id="adscsv" accept=".csv,.txt" hidden></label></div><p class="hint">Dica: no Google Ads, em Relatórios, agende um relatório semanal em CSV para o seu e-mail e importe aqui.</p></details>
  ${c.rows.length?`<table class="mt"><tr><th>Data</th><th>Impr.</th><th>Cliques</th><th>Custo</th><th>Conv.</th><th></th></tr>${c.rows.map((r,i)=>`<tr><td>${fdate(r.data)}</td><td>${esc(r.imp)}</td><td>${esc(r.cliques)}</td><td>${esc(r.custo)}</td><td>${esc(r.conv)}</td><td>${delBtn('delads:'+i)}</td></tr>`).join('')}</table>`:'<p class="hint">Nenhum número lançado ainda.</p>'}</section>
  <section class="esc"><h4>Conta e acesso</h4><div class="fr">${fld('Situação','canais.ads.situacao',c.situacao,null,['Planejado','Planilha importada','Rodando','Pausado','Encerrado'])}${fld('Início da veiculação','canais.ads.inicio',c.inicio,'date')}${fld('ID da conta (123-456-7890)','canais.ads.conta',c.conta)}${fld('Como você acessa','canais.ads.tipoacesso',c.tipoacesso,null,['Convite ao meu e-mail','Vinculada ao meu gerente (MCC)','Ainda não definido'])}${fld('Seu e-mail ou ID do seu gerente','canais.ads.meuacesso',c.meuacesso)}${fld('Situação do acesso','canais.ads.acesso',c.acesso,null,['Ainda não pedi','Pedido enviado','Acesso concedido','Com problema'])}</div>
  <div class="row"><button class="btn ghost" data-act="cpacc:ads">Copiar mensagem pedindo acesso</button></div><p class="hint">As campanhas são feitas dentro da conta de Google Ads do próprio cliente, por convite ou pelo seu gerente (MCC). Nunca peça nem guarde a senha dele aqui.</p>
  <div class="row"><a class="btn ghost" href="https://ads.google.com/" target="_blank" rel="noopener noreferrer">Abrir Google Ads</a><a class="btn ghost" href="https://ads.google.com/home/tools/ads-editor/" target="_blank" rel="noopener noreferrer">Google Ads Editor</a></div></section></div>`}
const rede=u=>{const h=String(u.handle||'').trim();if(/^https?:\/\//i.test(h))return h;const x=h.replace(/^@/,'');const r=norm(u.rede);
  return r.includes('insta')?'https://instagram.com/'+x:r.includes('tiktok')?'https://tiktok.com/@'+x:r.includes('youtube')?'https://youtube.com/@'+x:r.includes('linkedin')?'https://linkedin.com/in/'+x:'https://google.com/search?q='+encodeURIComponent(u.rede+' '+x)};
function tabSocial(l){const c=l.track.canais.social,s=socSum(c.rows),cal=arr(l.xsoc&&l.xsoc.calendario);
  return `${iaPainel(l,'social')}
  <div class="cgrid"><section class="esc"><h4>Resultados</h4><div class="kpis">${kpi('Seguidores (último)',int(s.seg))}${kpi('Variação',(s.dseg>0?'+':'')+int(s.dseg))}${kpi('Posts',int(s.posts||0))}${kpi('Alcance somado',int(s.alc||0))}${kpi('Interações somadas',int(s.int||0))}</div>
  ${c.rows.length?`<div class="chs"><div><span class="hint">Seguidores</span>${bars(c.rows,'seguidores','#8A8A8A')}</div><div><span class="hint">Alcance</span>${bars(c.rows,'alcance','#FF5A00')}</div></div>`:''}
  <details class="it2-c dlanc" ${c.rows.length?'':'open'}><summary>Lançar números da semana</summary><div class="fr">${inp('sr_data','Data','date',today())}${inp('sr_rede','Rede')}${inp('sr_seg','Seguidores','number')}${inp('sr_alc','Alcance','number')}${inp('sr_int','Interações','number')}${inp('sr_posts','Posts na semana','number')}<div><button class="btn" data-act="addsoc">Adicionar</button></div></div></details>
  ${c.rows.length?`<table class="mt"><tr><th>Data</th><th>Rede</th><th>Seguid.</th><th>Alcance</th><th>Interações</th><th>Posts</th><th></th></tr>${c.rows.map((r,i)=>`<tr><td>${fdate(r.data)}</td><td>${esc(r.rede)}</td><td>${esc(r.seguidores)}</td><td>${esc(r.alcance)}</td><td>${esc(r.interacoes)}</td><td>${esc(r.posts)}</td><td>${delBtn('delsoc:'+i)}</td></tr>`).join('')}</table>`:'<p class="hint">Nenhum número lançado ainda.</p>'}</section>
  <section class="esc"><h4>Perfis do cliente</h4>${arr(c.perfis).map((p,i)=>`<div class="pf"><b>${esc(p.rede)}</b> ${esc(p.handle)} <a href="${esc(rede(p))}" target="_blank" rel="noopener noreferrer">Abrir</a>${delBtn('delperfil:'+i)}</div>`).join('')||'<p class="hint">Nenhum perfil cadastrado.</p>'}
  <div class="fr">${inp('pf_rede','Rede')}${inp('pf_h','@usuário ou link')}<div><button class="btn ghost" data-act="addperfil">Adicionar perfil</button></div></div>
  <h4>Acesso e situação</h4><div class="fr">${fld('Situação do canal','canais.social.situacao',c.situacao,null,['Planejado','Postando','Pausado','Encerrado'])}${fld('Acesso aos perfis','canais.social.acesso',c.acesso,null,['Ainda não pedi','Pedido enviado','Acesso concedido','Com problema'])}${fld('Seu e-mail para o convite','canais.social.meuacesso',c.meuacesso)}</div>
  <div class="row"><button class="btn ghost" data-act="cpacc:social">Copiar mensagem pedindo acesso</button></div><p class="hint">Peça acesso por convite (Meta Business Suite, parceiros ou gerentes de cada rede). Não guarde senhas aqui.</p></section></div>
  ${cal.length?`<section class="esc"><h4>Calendário do kit (${Object.keys(c.postados||{}).length}/${cal.length} publicados)</h4><div class="cal">${cal.map(d=>`<label class="day pd"><input type="checkbox" data-act="post:${esc(d.dia)}" ${(c.postados||{})[d.dia]?'checked':''}> <b>Dia ${esc(d.dia)} · ${esc(d.formato)}</b><div class="hint">${esc(d.tema)}</div></label>`).join('')}</div></section>`:''}`}
const gauge=(t,v)=>`<div class="gg ${v==null?'':v>=90?'g':v>=50?'y':'r'}"><b>${v==null?'—':v}</b><span>${t}</span></div>`;
function tabSite(l){const c=l.track.canais.site,s=siteSum(c.rows),p=c.psi[0];
  return `${iaPainel(l,'site')}${siteGerar(l)}<div class="fr">${fld('Situação','canais.site.situacao',c.situacao,null,['Em construção','No ar','Em manutenção'])}${fld('Acesso ao domínio/hospedagem','canais.site.acesso',c.acesso,null,['Ainda não pedi', 'Pedido enviado', 'Acesso concedido', 'Com problema'])}${fld('Endereço do site','canais.site.url',c.url)}${fld('Publicado em','canais.site.publicado',c.publicado,'date')}${fld('ID do Google Analytics (G-XXXX)','canais.site.ga4',c.ga4)}</div>
  <div class="row" style="margin-top:10px">${c.url?`<a class="btn ghost" href="${esc(/^https?:/i.test(c.url)?c.url:'https://'+c.url)}" target="_blank" rel="noopener noreferrer">Abrir o site</a>`:''}<button class="btn ghost" data-act="cpacc:site">Copiar mensagem pedindo acesso</button><button class="btn" data-act="psi" ${T.busy==='psi'?'disabled':''}>${T.busy==='psi'?'Medindo… (até 1 minuto)':'Medir velocidade e SEO (PageSpeed)'}</button></div>
  ${T.msg?`<p class="hint">${esc(T.msg)}</p>`:''}
  ${siteExtra(l)}
  <h4>Qualidade do site ${p?'<span class="hint">(medido em '+fdate(p.data)+', no celular)</span>':''}</h4>${p?`<div class="gauges">${gauge('Desempenho',p.perf)}${gauge('Acessibilidade',p.acc)}${gauge('SEO',p.seo)}${gauge('Boas práticas',p.bp)}</div>`:'<p class="hint">Ainda não medido. O site precisa estar publicado na internet.</p>'}
  ${c.psi.length>1?`<p class="hint">Medições anteriores: ${c.psi.slice(1,6).map(x=>fdate(x.data)+': '+x.perf+'/'+x.acc+'/'+x.seo).join(' · ')}</p>`:''}
  <h4>Visitas e contatos</h4><div class="kpis">${kpi('Visitas',int(s.v))}${kpi('Contatos',int(s.c))}${kpi('Conversão',s.tx.toFixed(1)+'%')}</div><div class="chs"><div><span class="hint">Visitas</span>${bars(c.rows,'visitas','#F5F5F3')}</div><div><span class="hint">Contatos</span>${bars(c.rows,'contatos','#F5F5F3')}</div></div>
  <div class="fr">${inp('st_data','Data','date',today())}${inp('st_vis','Visitas','number')}${inp('st_con','Contatos (WhatsApp, formulário, ligações)','number')}<div><button class="btn" data-act="addsite">Adicionar</button></div></div>
  ${c.rows.length?`<table class="mt"><tr><th>Data</th><th>Visitas</th><th>Contatos</th><th></th></tr>${c.rows.map((r,i)=>`<tr><td>${fdate(r.data)}</td><td>${esc(r.visitas)}</td><td>${esc(r.contatos)}</td><td>${delBtn('delsite:'+i)}</td></tr>`).join('')}</table>`:''}`}
function tabTarefas(l){const t=l.track,cs=Object.keys(t.canais).concat(['geral']);
  return `<div class="fr">${inp('tk_txt','Nova tarefa')}${inp('tk_due','Prazo','date',addDays(today(),3))}<div><label>Canal</label><select id="tk_c">${cs.map(k=>`<option value="${k}">${CH[k]||'Geral'}</option>`).join('')}</select></div><div><button class="btn" data-act="addtask">Adicionar</button></div></div>
  ${cs.map(k=>{const L=t.tarefas.filter(x=>x.canal===k);return L.length?`<h4>${CH[k]||'Geral'}</h4>`+L.sort((a,b)=>a.done-b.done||a.due.localeCompare(b.due)).map(x=>`<div class="tsk ${x.done?'ok':''}"><label><input type="checkbox" data-act="tgl:${x.id}" ${x.done?'checked':''}> <span>${esc(x.txt)}</span></label><i class="${!x.done&&x.due<today()?'late':''}">${fdate(x.due)}</i>${delBtn('deltask:'+x.id)}</div>`).join(''):''}).join('')}`}
function tabDiario(l){const t=l.track;
  return `<div class="fr">${inp('dr_data','Data','date',today())}<div style="grid-column:span 2"><label for="dr_txt">Anotação (conversa com o cliente, decisão, ajuste feito)</label><input id="dr_txt"></div><div><button class="btn" data-act="adddiario">Adicionar</button></div></div>
  ${t.diario.slice().sort((a,b)=>b.data.localeCompare(a.data)).map(d=>`<div class="tsk"><span><b>${fdate(d.data)}</b> · ${esc(d.txt)}</span>${delBtn('deldiario:'+d.id)}</div>`).join('')}`}
function tabRel(l){const t=l.track,busy=T.busy==='rel';
  return `<div class="row" style="margin-top:0"><button class="btn" data-act="rel" ${busy?'disabled':''}>${busy?'Gerando… '+T.relLive+' caracteres':'Gerar relatório da semana com IA'}</button></div>
  <p class="hint">Usa os números lançados, as tarefas e o diário. A IA só usa o que está registrado, então confira os números antes de enviar.</p>${T.msg?`<p class="hint" style="color:var(--err)">${esc(T.msg)}</p>`:''}
  ${t.relatorios.map(r=>`<div class="xsec"><div class="xh"><h3>${fdate(r.data)}</h3><div class="row" style="margin:0"><button class="btn ghost" data-act="cprel:${r.id}">Copiar</button><button class="btn ok" data-act="wprel:${r.id}">Enviar no WhatsApp</button>${delBtn('delrel:'+r.id)}</div></div><textarea data-rel="${esc(r.id)}" style="min-height:170px">${esc(r.txt)}</textarea>${r.interno?`<p class="hint"><b>Notas internas:</b> ${esc(r.interno)}</p>`:''}</div>`).join('')||'<p class="hint">Nenhum relatório ainda.</p>'}`}

function accMsg(l,canal){
  const c=l.track.canais[canal]||{},n=l.nome.split(' ')[0];
  if(canal==='ads'){
    const mail=c.meuacesso||'[SEU E-MAIL DO GOOGLE]';
    if(c.tipoacesso==='Vinculada ao meu gerente (MCC)')return `Oi, ${n}! Para cuidarmos das suas campanhas no Google Ads, precisamos de acesso à sua conta. Você não precisa nos passar senha.\n\nO caminho mais simples:\n1) Envie para nós o ID da sua conta (fica no canto superior da tela, no formato 123-456-7890).\n2) Enviamos um pedido de vínculo pelo nosso gerente (${c.meuacesso||'ID do nosso gerente'}).\n3) Você entra em ads.google.com > Admin > Acesso e segurança > Gerentes e aceita o pedido.\n\nSe ficar com dúvida, chame a gente que guiamos você por chamada.`;
    return `Oi, ${n}! Para cuidarmos das suas campanhas no Google Ads, precisamos de acesso à sua conta. Você não precisa nos passar senha, é só nos convidar:\n\n1) Entre em ads.google.com com a sua conta.\n2) Clique em Admin (ou Ferramentas) > Acesso e segurança.\n3) Clique no botão "+" e informe este e-mail: ${mail}\n4) Escolha o nível "Administrador" (ou "Padrão") e envie o convite.\n\nDepois nos avise e nos envie o ID da conta (fica no canto superior, no formato 123-456-7890). Se ficar com dúvida, chame a gente que guiamos você por chamada.`}
  if(canal==='social')return `Oi, ${n}! Para cuidarmos das suas redes sociais, precisamos de acesso sem você nos passar senha.\n\nNo Instagram e no Facebook, o jeito certo é pelo Meta Business Suite: em Configurações, procure Pessoas ou Parceiros e nos adicione pelo e-mail ${(c.meuacesso)||'[SEU E-MAIL]'}, com permissão para gerenciar conteúdo (e anúncios, se formos anunciar). Nas outras redes (TikTok, YouTube, Kwai), diga quais são e explicamos como convidar. O caminho pode variar um pouco conforme a versão do aplicativo, então chame a gente se não achar.`;
  return `Oi, ${n}! Para publicarmos o seu site, precisamos falar com o lugar onde o seu domínio está registrado (Registro.br, GoDaddy, Hostinger etc.). O ideal é você nos convidar como usuário no painel de lá, sem passar senha. Se preferir, diga onde está o domínio e orientamos você a apontar para o site novo.`;
}
function trkList(){
  const L=getL().filter(l=>l.track),pend=L.reduce((a,l)=>a+l.track.tarefas.filter(x=>!x.done).length,0),sem=L.filter(l=>{const n=nextDue(l.track);return n&&n<=addDays(today(),7)}).length;
  return `<h2 class="pt">Acompanhamento</h2><p class="hint">Clientes que aprovaram e estão em execução. Para colocar um cliente aqui, abra o lead e clique em "Cliente fechou: ir para o acompanhamento".</p>
  <div class="stats"><div class="sc" style="--c:#8A8A8A"><b>${L.length}</b><span>clientes em execução</span></div><div class="sc" style="--c:#F5F5F3"><b>${pend}</b><span>tarefas pendentes</span></div><div class="sc" style="--c:#F5F5F3"><b>${sem}</b><span>com prazo nos próximos 7 dias</span></div></div>
  ${L.length?`<div class="tcards">${L.map(l=>{const t=l.track,n=nextDue(t);return `<button class="tc" data-ti="${esc(l.id)}"><b>${esc(l.nome)}</b><span class="hint">${svcIc(l)} ${esc(svcName(l))}</span><div class="pb"><i style="width:${prog(t)}%"></i></div><span class="hint">${prog(t)}% concluído · ${n?(n<today()?'<span class="late">atrasada: ':'próxima tarefa: ')+fdate(n)+(n<today()?'</span>':''):'tudo em dia'}</span><span class="hint">${esc([t.pacote,t.valor].filter(Boolean).join(' · '))}</span>${(t.frentes||[]).length?`<span class="hint">Mês ${cicAtual(t)} do contrato: ${(t.pecas||[]).filter(p=>p.per==='c'+cicAtual(t)).length} de ${(t.frentes||[]).filter(f=>f.por!=='projeto').reduce((s,f)=>s+alvo(f),0)} peças</span>`:''}</button>`}).join('')}</div>`:'<div class="panel hint">Nenhum cliente em execução ainda.</div>'}`}
function trkDetail(l){
  const t=l.track,pend=t.tarefas.filter(x=>!x.done).length;
  const tabs=[['geral','Visão geral'],['escopo','O que vamos fazer'],['prod','Produção'],['camp','Campanhas'+(t.campanhas&&t.campanhas.length?' ('+t.campanhas.length+')':'')],['met','Métricas'],...Object.keys(t.canais).filter(k=>CH[k]).map(k=>[k,CH[k]]),['tarefas','Tarefas'+(pend?' ('+pend+')':'')],['diario','Diário'],['rel','Relatórios'+(t.relatorios.length?' ✓':'')]];
  if(!tabs.some(x=>x[0]===T.tab))T.tab='geral';
  const body={geral:tabGeral,escopo:tabEscopo,prod:tabProd,camp:tabCamp,met:tabMetricas,ads:tabAds,meta:tabMeta,social:tabSocial,site:tabSite,press:tabPress,tarefas:tabTarefas,diario:tabDiario,rel:tabRel}[T.tab](l);
  return `<div class="row" style="margin:0 0 6px"><button class="btn ghost" data-back="1">← Todos os clientes</button><a class="btn ghost" href="https://wa.me/${wnum(l.whats)}" target="_blank" rel="noopener noreferrer">WhatsApp do cliente</a></div>
  <h2 class="pt">${esc(l.nome)} <span class="chip aplicado">em execução</span></h2><p class="hint">${svcIc(l)} ${esc(svcName(l))} · ${esc(l.whats)}</p>
  <div class="tabs" role="tablist">${tabs.map(([k,n])=>`<button class="tab ${T.tab===k?'on':''}" data-tt="${k}" role="tab" aria-selected="${T.tab===k}">${n}</button>`).join('')}</div><div class="panel">${body}</div>`;
}
function trkPaint(){
  const el=document.getElementById('trk');if(!el)return;
  const l=T.id&&trkL(T.id);
  if(T.id&&(!l||!l.track))T.id=null;
  else if(l&&trkGarante(l))upd(l.id,{track:l.track});
  el.innerHTML=T.id?trkDetail(trkL(T.id)):trkList();trkBind();
}
function trkBind(){
  const el=document.getElementById('trk'),id=T.id;
  el.querySelectorAll('[data-ti]').forEach(b=>b.onclick=()=>{T.id=b.dataset.ti;T.tab='geral';T.area=null;T.peca=null;T.cic=null;T.msg='';trkPaint()});
  el.querySelectorAll('[data-back]').forEach(b=>b.onclick=()=>{T.id=null;T.msg='';trkPaint()});
  const mp=document.getElementById('mper');if(mp)mp.onchange=()=>{T.mper=+mp.value;trkPaint()};
  el.querySelectorAll('[data-tt]').forEach(b=>b.onclick=()=>{T.tab=b.dataset.tt;T.msg='';T.info='';trkPaint()});
  el.querySelectorAll('[data-f]').forEach(i=>i.onchange=()=>{trkSet(id,t=>setPath(t,i.dataset.f,i.value));if(i.dataset.f==='start'||/situacao|pacote|pgto/.test(i.dataset.f))trkPaint()});
  el.querySelectorAll('[data-act]').forEach(b=>{const ev=b.type==='checkbox'?'onchange':'onclick';b[ev]=()=>trkAct(b.dataset.act,b)});
  el.querySelectorAll('[data-rel]').forEach(a=>a.onchange=()=>trkSet(id,t=>{const r=t.relatorios.find(x=>x.id===a.dataset.rel);if(r)r.txt=a.value}));
  const f=document.getElementById('adscsv');if(f)f.onchange=async()=>{const file=f.files[0];if(!file)return;const r=adsFromCsv(await file.text());
    if(r.erro||!r.rows.length){T.msg=r.erro||'O arquivo não trouxe linhas com números.';return trkPaint()}
    trkSet(id,t=>{const c=t.canais.ads;r.rows.forEach(x=>{const k=c.rows.findIndex(y=>y.data===x.data);if(k>=0)c.rows[k]=x;else c.rows.push(x)});c.rows.sort((a,b)=>b.data.localeCompare(a.data));if(c.situacao==='Planejado')c.situacao='Rodando'});
    T.msg=r.rows.length+' linha(s) importada(s).'+(r.dated?'':' O arquivo não tinha datas por dia, então entrou como um único total de hoje.');trkPaint()};
  if(id)prodBind(el,id);
}
const val2=i=>{const e=document.getElementById(i);return e?e.value.trim():''};
function trkAct(a,b){
  const id=T.id,[k,arg]=a.split(':');
  if(prodAct(k,arg,b))return;
  const push=(path,row)=>trkSet(id,t=>{const arr0=getPath(t,path);arr0.push(row);if(row.data)arr0.sort((x,y)=>y.data.localeCompare(x.data))});
  if(k==='addads'){if(!val2('ar_cli')&&!val2('ar_custo')){T.msg='Preencha ao menos cliques ou custo.';return trkPaint()}push('canais.ads.rows',{data:val2('ar_data')||today(),imp:val2('ar_imp'),cliques:val2('ar_cli'),custo:val2('ar_custo'),conv:val2('ar_conv')});T.msg=''}
  else if(k==='delads')trkSet(id,t=>t.canais.ads.rows.splice(+arg,1));
  else if(k==='addsoc'){if(!val2('sr_seg')&&!val2('sr_alc')&&!val2('sr_int')){T.msg='';return}push('canais.social.rows',{data:val2('sr_data')||today(),rede:val2('sr_rede'),seguidores:val2('sr_seg'),alcance:val2('sr_alc'),interacoes:val2('sr_int'),posts:val2('sr_posts')})}
  else if(k==='delsoc')trkSet(id,t=>t.canais.social.rows.splice(+arg,1));
  else if(k==='addperfil'){if(!val2('pf_h'))return;trkSet(id,t=>t.canais.social.perfis.push({rede:val2('pf_rede')||'Instagram',handle:val2('pf_h')}))}
  else if(k==='delperfil')trkSet(id,t=>t.canais.social.perfis.splice(+arg,1));
  else if(k==='post')trkSet(id,t=>{const p=t.canais.social.postados=t.canais.social.postados||{};if(p[arg])delete p[arg];else p[arg]=today()});
  else if(k==='addsite'){if(!val2('st_vis')&&!val2('st_con'))return;push('canais.site.rows',{data:val2('st_data')||today(),visitas:val2('st_vis'),contatos:val2('st_con')})}
  else if(k==='delsite')trkSet(id,t=>t.canais.site.rows.splice(+arg,1));
  else if(k==='addtask'){if(!val2('tk_txt'))return;trkSet(id,t=>t.tarefas.push({id:uid(),canal:val2('tk_c')||'geral',txt:val2('tk_txt'),due:val2('tk_due')||today(),done:false}))}
  else if(k==='tgl')trkSet(id,t=>{const x=t.tarefas.find(y=>y.id===arg);if(x){x.done=!x.done;x.at=x.done?today():''}});
  else if(k==='deltask')trkSet(id,t=>{t.tarefas=t.tarefas.filter(y=>y.id!==arg)});
  else if(k==='adddiario'){if(!val2('dr_txt'))return;trkSet(id,t=>t.diario.push({id:uid(),data:val2('dr_data')||today(),txt:val2('dr_txt')}))}
  else if(k==='deldiario')trkSet(id,t=>{t.diario=t.diario.filter(y=>y.id!==arg)});
  else if(k==='cpacc'){navigator.clipboard.writeText(accMsg(trkL(id),arg));if(b){const o=b.textContent;b.textContent='Copiado ✓';setTimeout(()=>{b.textContent=o},1800)}return}
  else if(k==='psi')return trkPsi(id);
  else if(k==='rel')return trkRel(id);
  else if(k==='cprel'){const r=trkL(id).track.relatorios.find(y=>y.id===arg);if(r)navigator.clipboard.writeText(r.txt);return}
  else if(k==='wprel'){const l=trkL(id),r=l.track.relatorios.find(y=>y.id===arg);if(r)window.open('https://wa.me/'+wnum(l.whats)+'?text='+encodeURIComponent(r.txt),'_blank','noopener,noreferrer');return}
  else if(k==='delrel')trkSet(id,t=>{t.relatorios=t.relatorios.filter(y=>y.id!==arg)});
  trkPaint();
}
async function trkPsi(id){
  const l=trkL(id),u=((l.track.canais.site||{}).url||'').trim();
  if(!u){T.msg='Preencha o endereço do site primeiro.';return trkPaint()}
  T.busy='psi';T.msg='';trkPaint();
  try{
    const r=await fetch('https://www.googleapis.com/pagespeedonline/v5/runPagespeed?strategy=mobile&category=performance&category=accessibility&category=seo&category=best-practices&url='+encodeURIComponent(/^https?:\/\//i.test(u)?u:'https://'+u));
    if(!r.ok)throw new Error(r.status===429?'O Google limitou as consultas grátis agora. Tente de novo em alguns minutos.':'O PageSpeed respondeu com erro '+r.status+'. Confira se o site está publicado e o endereço está certo.');
    const c=((await r.json()).lighthouseResult||{}).categories||{},sc=k=>c[k]&&c[k].score!=null?Math.round(c[k].score*100):null;
    trkSet(id,t=>{t.canais.site.psi.unshift({data:today(),perf:sc('performance'),acc:sc('accessibility'),seo:sc('seo'),bp:sc('best-practices')})});
  }catch(e){T.msg=/Failed to fetch|NetworkError/.test(e.message)?'Não consegui consultar o PageSpeed. Confira a internet e o endereço do site.':e.message}
  T.busy='';trkPaint();
}
async function trkRel(id){
  const l=trkL(id),t=l.track,first=l.nome.split(' ')[0];
  const feitas=t.tarefas.filter(x=>x.done&&x.at>=addDays(today(),-7)).map(x=>'- '+x.txt),prox=t.tarefas.filter(x=>!x.done).sort((a,b)=>a.due.localeCompare(b.due)).slice(0,5).map(x=>'- '+x.txt+' (até '+fdate(x.due)+')'),notas=t.diario.slice().sort((a,b)=>b.data.localeCompare(a.data)).slice(0,5).map(x=>'- '+fdate(x.data)+': '+x.txt);
  const msgs=[{role:'system',content:'Você faz parte da equipe da OR (Rio de Janeiro), fala sempre como equipe ("nós"), nunca cita o nome de uma pessoa, e escreve relatórios curtos, claros e honestos para clientes, em português do Brasil, por WhatsApp. Use SOMENTE os números e fatos fornecidos. Nunca invente resultado nem prometa; se faltar dado, diga que ainda está coletando. '+REGRA_NICHO+' '+PM_CURTO+(kb('msg',l)?'\n\n'+kb('msg',l):'')},
   {role:'user',content:`CLIENTE (primeiro nome): ${first}\nSERVIÇOS: ${svcName(l)}\n${ctxIA(l)}\nHOJE: ${fdate(today())} (acompanhamento iniciado em ${fdate(t.start)})\n\nNÚMEROS REGISTRADOS:\n${trkSummary(l)||'(nenhum número lançado ainda)'}\n\nFEITO NOS ÚLTIMOS 7 DIAS:\n${feitas.join('\n')||'(nada marcado)'}\n\nPRÓXIMOS PASSOS PLANEJADOS:\n${prox.join('\n')||'(nenhum)'}\n\nANOTAÇÕES RECENTES:\n${notas.join('\n')}\n\nEscreva: 1) a mensagem de WhatsApp para ${first} com o relatório da semana (até 1200 caracteres, sem markdown, no máximo 2 emojis): o que foi feito, os números em linguagem simples e o que significam, e os próximos passos. 2) Depois uma linha contendo apenas ---INTERNO--- e, em seguida, notas internas curtas para o consultor (riscos e o que ajustar).`}];
  T.busy='rel';T.msg='';T.relLive=0;trkPaint();
  try{
    const out=await askF(msgs,x=>{T.relLive=x.length;const b=document.querySelector('[data-act=rel]');if(b)b.textContent='Gerando… '+x.length+' caracteres'},{slot:'ia1',max:1200,temp:0.3});
    const i=out.indexOf('---INTERNO---');
    trkSet(id,tt=>tt.relatorios.unshift({id:uid(),data:today(),txt:(i<0?out:out.slice(0,i)).trim(),interno:i<0?'':out.slice(i+13).trim()}));
  }catch(e){T.msg=e.message}
  T.busy='';trkPaint();
}
