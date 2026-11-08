/* OR Site Studio, Etapa 5: proposta comercial (SPEC.md: SS-026 a SS-031).
   Sem IA e sem rede: monta o documento a partir da análise revisada, dos valores da tabela (calcOrc) e do que o consultor digita.
   Valores só de CFG.precos ou digitados; o que não tem valor mostra "a confirmar". Nada é enviado: o consultor revisa e exporta (impressão do navegador). */
const SS_PROM_MODS=['site','resite','ads','meta','social','brand'];

/* ---- funções puras (testadas em scripts/testar.mjs) ---- */
function ssLimpaProposta(x){
  if(!isObj(x))return null;
  return {ocultos:(Array.isArray(x.ocultos)?x.ocultos:[]).filter(k=>typeof k==='string'&&/^(fortes|problemas|oportunidades):\d{1,2}$/.test(k)).slice(0,40),intro:txtT(x.intro,1500,1),melhorias:txtT(x.melhorias,2500,1),obs:txtT(x.obs,1200,1),revisada:x.revisada===true,
    mods:(Array.isArray(x.mods)?x.mods:[]).filter(k=>typeof k==='string'&&/^[a-z]{2,12}$/.test(k)&&(typeof MODS==='undefined'||Object.prototype.hasOwnProperty.call(MODS,k))).filter((k,i,a)=>a.indexOf(k)===i).slice(0,8),
    avulsos:(Array.isArray(x.avulsos)?x.avulsos:[]).filter(isObj).map(a=>({nome:txtT(a.nome,120),setup:txtT(a.setup,20),mensal:txtT(a.mensal,20)})).filter(a=>a.nome).slice(0,12)};
}
const ssPropostaPadrao=p=>({ocultos:[],intro:'',melhorias:'',obs:'',revisada:false,mods:[p&&p.modo==='redesenhar'?'resite':'site'],avulsos:[]});
/* frases que prometem resultado: o consultor vê o aviso antes de exportar (SS-028) */
const SS_PROMESSAS=[/garant\w*/i,/\bdobr(?:e|ar|o|amos)\b/i,/\btriplic\w*/i,/\b\d+\s*(?:x|vezes)\b/i,/resultados?\s+(?:certos?|imediatos?|r[aá]pidos?)/i,/\baument\w*\b[^.\n]{0,40}\b(?:vendas|faturamento|clientes|lucro|seguidores)/i,/\bsem\s+riscos?\b/i,/\b100\s*%/,/primeiro\s+lugar|topo\s+do\s+google|\btop\s*1\b/i];
function ssPromessas(txt){const s=String(txt||''),r=[];SS_PROMESSAS.forEach(re=>{const m=s.match(re);if(m)r.push(m[0].trim())});return [...new Set(r)]}
/* títulos do site demonstrativo para o resumo da proposta (a demonstração em si vai no arquivo HTML) */
function ssResumoSite(html){
  const s=String(html||'').slice(0,200000),limpa=t=>t.replace(/<[^>]*>/g,' ').replace(/\{\{[^}]*\}\}/g,' ').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
  const tit=(s.match(/<title[^>]*>([\s\S]*?)<\/title>/i)||[])[1],sec=[];
  for(const m of s.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi)){const t=limpa(m[1]).slice(0,80);if(t&&!sec.includes(t))sec.push(t);if(sec.length>=10)break}
  return {titulo:limpa(tit||'').slice(0,100),secoes:sec};
}
/* aceita "1.500,50", "R$ 80", "80"; negativo, texto sem número ou valor absurdo viram 0 (= "a confirmar") */
const ssDinheiro=v=>{const s=String(v||'');if(/^\s*-/.test(s))return 0;const n=tabNum(s.replace(/[^\d.,]/g,''));return n>0&&n<1e7?n:0};
/* valores: pacotes da tabela (calcOrc) para os módulos escolhidos + itens avulsos digitados. Quem soma é o app. */
function ssValores(mods,avulsos){
  const ms=(mods||[]).filter(k=>Object.prototype.hasOwnProperty.call(MODS,k)),C=ms.length?calcOrc({mods:ms}):null;
  const av=(avulsos||[]).map(a=>{const setup=ssDinheiro(a.setup),mensal=ssDinheiro(a.mensal);return {nome:a.nome,setup,mensal,confirmar:!setup&&!mensal}});
  return {C,mods:ms,av,avSetup:r2(av.reduce((s,a)=>s+a.setup,0)),avMensal:r2(av.reduce((s,a)=>s+a.mensal,0)),avPend:av.filter(a=>a.confirmar).length};
}
/* confere as contas do orçamento: total para começar = implantação + 1º mês, e os totais batem com a soma dos itens (SS-027) */
function ssConfereSoma(C){
  const prob=[];if(!C)return prob;
  for(const pk of ['basico','medio','max']){const T=C.tiers[pk],f=1-(T.desc||0)/100;
    const s=r2(T.itens.reduce((a,i)=>a+(i.e?i.e.setup:0),0)*f),m=r2(T.itens.reduce((a,i)=>a+(i.e?i.e.mensal:0),0)*f);
    if(Math.abs(s-T.setupF)>0.01)prob.push('implantação do pacote '+pk+' não bate com a soma dos itens');
    if(Math.abs(m-T.mensalF)>0.01)prob.push('mensalidade do pacote '+pk+' não bate com a soma dos itens');
    if(Math.abs(r2(T.setupF+T.mensalF)-T.inicio)>0.01)prob.push('o total para começar do pacote '+pk+' não bate');}
  return prob;
}
/* texto do total do pacote recomendado, para o registro da exportação (SS-031) */
function ssTotalRecomendado(V){
  if(!V.C)return 'a confirmar';const T=V.C.tiers.medio;
  return T.itens.some(i=>i.falta)?'a confirmar':rs(T.inicio)+(T.ap?' (a partir de)':'');
}
const ssPar=t=>String(t||'').split(/\n+/).map(x=>x.trim()).filter(Boolean).map(x=>'<p>'+esc(x)+'</p>').join('');
const ssLi=l=>l.length?'<ul>'+l.map(x=>'<li>'+x+'</li>').join('')+'</ul>':'';
/* documento da proposta: HTML único, CSS dentro, sem recursos externos, identidade Earthen Luxe */
function ssPropostaHtml(d){
  const V=d.valores,A=d.analise,oc=d.ocultos||[],cor={ob:'#0A0908',ar:'#C6AC8E',mf:'#EAE0D5',te:'#5E503F',ard:'#22333B'};  /* ponto com "número fora dos fatos" não vai para o cliente */
  const sec=(tit,corpo)=>corpo?'<section><h2>'+esc(tit)+'</h2>'+corpo+'</section>':'';
  const item=x=>esc(x.t)+(x.f==='fato'?'':' <em>(avaliação da equipe)</em>');
  /* fora da proposta: ponto com número ou afirmação fora dos fatos, ponto que promete resultado e o que o consultor desmarcou */
  const usa=(l,k)=>(l||[]).filter((x,i)=>!x.aviso&&!ssPromessas(x.t).length&&!oc.includes(k+':'+i));
  const lista=(tit,l,k)=>usa(l,k).length?'<h3>'+esc(tit)+'</h3>'+ssLi(usa(l,k).map(item)):'';
  const pacote=(pk,rec)=>{
    const T=V.C.tiers[pk],nome={basico:'Essencial',medio:'Crescimento',max:'Completo'}[pk],falta=T.itens.some(i=>i.falta);
    const itens=T.itens.map(i=>i.falta?'<li><b>'+esc(MODS[i.k].name)+'</b>: a confirmar</li>':'<li><b>'+esc(MODS[i.k].name)+'</b> ('+esc(i.e.nome||nome)+')'+(i.e.setup?'<br>Implantação '+rs(i.e.setup)+(i.e.aPartir?' (a partir de)':'')+' · pagamento único':'')+(i.e.mensal?'<br>Mensalidade '+rs(i.e.mensal)+'/mês':'')+(i.e.prazo?'<br>Prazo: '+esc(i.e.prazo):'')+(i.e.inclui.length?ssLi(i.e.inclui.map(esc)):'')+'</li>').join('');
    return '<div class="pac'+(rec?' rec':'')+'"><h3>'+nome+(rec?' <span class="tag">Recomendado</span>':'')+'</h3><ul class="its">'+itens+'</ul>'
      +'<p class="tot">'+(falta?'Total parcial (há itens a confirmar): ':'')+'Implantação '+rs(T.setupF)+' · Mensalidade '+rs(T.mensalF)+'/mês<br><b>Para começar: '+rs(T.inicio)+(T.ap?' (a partir de)':'')+'</b>'+(T.desc?'<br><small>Inclui desconto de combo de '+T.desc+'% da tabela.</small>':'')+'</p></div>';
  };
  const avTab=V.av.length?'<h3>Itens combinados à parte</h3><table><thead><tr><th>Item</th><th>Implantação</th><th>Mensalidade</th></tr></thead><tbody>'
    +V.av.map(a=>'<tr><td>'+esc(a.nome)+'</td><td>'+(a.confirmar?'a confirmar':a.setup?rs(a.setup):'—')+'</td><td>'+(a.confirmar?'a confirmar':a.mensal?rs(a.mensal)+'/mês':'—')+'</td></tr>').join('')
    +'</tbody></table><p class="tot">Subtotal dos itens com valor: implantação '+rs(V.avSetup)+' · mensalidade '+rs(V.avMensal)+'/mês'+(V.avPend?' ('+V.avPend+' item(ns) a confirmar)':'')+'</p>':'';
  const ads=V.mods.some(k=>k==='ads'||k==='meta');
  const demo=d.resumoSite?'<p>Preparamos um site demonstrativo (versão '+d.resumoSite.versao+') para você ver e navegar. O arquivo acompanha esta proposta.</p>'+(d.resumoSite.titulo?'<p><b>Título:</b> '+esc(d.resumoSite.titulo)+'</p>':'')+(d.resumoSite.secoes.length?'<p><b>Seções:</b></p>'+ssLi(d.resumoSite.secoes.map(esc)):'')+'<p class="peq">É uma demonstração, não o site oficial. Textos, fotos e valores finais serão definidos com você.</p>':'';
  const css='@page{size:A4;margin:14mm}*{box-sizing:border-box}body{margin:0;background:'+cor.mf+';color:'+cor.ob+';font:15px/1.6 Inter,"Segoe UI",system-ui,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}'
   +'header{background:'+cor.ob+';color:'+cor.mf+';padding:36px 40px}header img{height:46px;display:block;margin-bottom:18px}header .sl{color:'+cor.ar+';letter-spacing:.2em;text-transform:uppercase;font-size:11px}header h1{margin:6px 0 4px;font:600 28px/1.2 Sora,"Segoe UI",system-ui,sans-serif}header p{margin:0;color:'+cor.ar+'}'
   +'main{max-width:860px;margin:0 auto;padding:8px 40px 40px}section{padding:22px 0;border-bottom:1px solid '+cor.ar+';break-inside:avoid-page}h2{font:600 20px/1.3 Sora,"Segoe UI",system-ui,sans-serif;color:'+cor.ard+';margin:0 0 10px}h3{font-size:15px;margin:16px 0 6px;color:'+cor.te+'}'
   +'ul{margin:6px 0;padding-left:20px}li{margin:3px 0}.pacs{display:grid;gap:14px;grid-template-columns:repeat(auto-fit,minmax(230px,1fr))}.pac{border:1px solid '+cor.ar+';border-radius:12px;padding:14px;break-inside:avoid;background:#fff8}.pac.rec{border:2px solid '+cor.ard+'}.pac h3{margin:0 0 8px;color:'+cor.ob+'}'
   +'.its{list-style:none;padding:0}.its li{margin:8px 0}.its ul{font-size:13px;color:'+cor.te+'}.tag{font-size:11px;background:'+cor.ard+';color:'+cor.mf+';padding:2px 8px;border-radius:99px;vertical-align:middle}.tot{margin-top:10px}.peq,small{font-size:12px;color:'+cor.te+'}'
   +'table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:6px 8px;border-bottom:1px solid '+cor.ar+'}footer{padding:18px 40px;font-size:12px;color:'+cor.te+';text-align:center}@media (max-width:560px){header,main{padding-left:18px;padding-right:18px}}';
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Proposta para '+esc(d.nome)+'</title><style>'+css+'</style></head><body>'
   +'<header><img src="'+esc(d.logo)+'" alt="'+esc(d.brand)+'"><div class="sl">'+esc(d.slogan||'')+'</div><h1>Proposta para '+esc(d.nome)+'</h1><p>'+esc(d.brand)+' · '+esc(d.data)+'</p></header><main>'
   +sec('Sobre esta proposta',ssPar(d.intro))
   +sec('Análise do seu negócio',A?lista('Pontos fortes',A.fortes,'fortes')+lista('O que pode melhorar',A.problemas,'problemas')+lista('Oportunidades',A.oportunidades,'oportunidades')+(A.faltando&&A.faltando.length?'<h3>Ainda não sabemos</h3>'+ssLi(A.faltando.map(esc)):''):'')
   +sec('Melhorias sugeridas',ssPar(d.melhorias))
   +sec('Demonstração do novo site',demo)
   +(V.C?sec('Serviços e valores','<div class="pacs">'+pacote('basico',false)+pacote('medio',true)+pacote('max',false)+'</div>'+(ads?'<p class="peq">A verba de anúncios (Google, Meta) é paga por você direto à plataforma e não entra nos valores.</p>':'')+'<p class="peq">Valores da tabela da '+esc(d.brand)+'. Itens marcados "a confirmar" serão definidos com você antes de fechar.</p>'+avTab):sec('Valores',avTab))
   +sec('Observações',ssPar(d.obs))
   +'</main><footer>Proposta preparada por '+esc(d.brand)+(d.whats?' · WhatsApp '+esc(d.whats):'')+' · '+esc(d.data)+'</footer></body></html>';
}
