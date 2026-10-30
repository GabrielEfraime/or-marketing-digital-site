let VIDA=null;
function vida(){
  const alvo=app.querySelector('.home,.svp,.vg'),reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!VIDA){
    const c=document.createElement('canvas');c.id='bokeh';c.setAttribute('aria-hidden','true');document.body.appendChild(c);
    const bar=document.createElement('div');bar.id='vprog';bar.setAttribute('aria-hidden','true');document.body.appendChild(bar);
    const x=c.getContext('2d');let W=0;
    const rs=()=>{const d=Math.min(devicePixelRatio||1,2);c.width=innerWidth*d;c.height=innerHeight*d;W=d};
    addEventListener('resize',rs);rs();
    const nova=ini=>({x:Math.random(),y:ini?Math.random():1.08,r:2+Math.random()*(Math.random()<.22?30:9),v:.00003+Math.random()*.00009,dx:(Math.random()-.5)*.00005,h:Math.random()<.22?75:190+Math.random()*100,a:.1+Math.random()*.28,t:Math.random()*6.28});
    const ps=[...Array(48)].map(()=>nova(true));
    VIDA={c,on:false};
    const loop=t=>{
      if(VIDA.on&&!document.hidden){
        x.clearRect(0,0,c.width,c.height);
        ps.forEach((p,i)=>{p.y-=p.v;p.x+=p.dx+Math.sin(t*.0004+p.t)*.00007;if(p.y<-.08)ps[i]=nova(false);
          const tw=.6+.4*Math.sin(t*.001+p.t),px=p.x*c.width,py=p.y*c.height,r=p.r*W,g=x.createRadialGradient(px,py,0,px,py,r);
          g.addColorStop(0,'hsla('+p.h+',90%,75%,'+(p.a*tw)+')');g.addColorStop(1,'hsla('+p.h+',90%,75%,0)');x.fillStyle=g;x.beginPath();x.arc(px,py,r,0,6.2832);x.fill()});
      }
      if(!reduz)requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    let tk=0;const doc=document.documentElement;
    addEventListener('scroll',()=>{if(tk)return;tk=requestAnimationFrame(()=>{tk=0;const y=scrollY,m=doc.scrollHeight-innerHeight;doc.style.setProperty('--sy',y);bar.style.transform='scaleX('+(m>0?Math.min(y/m,1):0)+')'})},{passive:true});
    addEventListener('mousemove',e=>{const t=e.target.closest&&e.target.closest('.sc2,.tl li,.cc,.pgrid li,.mk-r');if(!t)return;const r=t.getBoundingClientRect();t.style.setProperty('--mx',(e.clientX-r.left)+'px');t.style.setProperty('--my',(e.clientY-r.top)+'px')},{passive:true});
  }
  VIDA.on=false;VIDA.c.style.display=alvo?'':'none';document.getElementById('vprog').style.display=alvo?'':'none';
  if(!alvo)return;
  alvo.querySelectorAll('.top').forEach(t=>{if(t.querySelector('.waves'))return;
    const w=document.createElement('div');w.className='waves';w.setAttribute('aria-hidden','true');
    const ln=(amp,k,ph)=>{let d='M0 '+(60+amp*Math.sin(ph));for(let i=1;i<=288;i++){const X=i*10;d+=' L'+X+' '+(60+amp*Math.sin(X/1440*6.2832*k+ph)).toFixed(1)}return d};
    w.innerHTML='<svg viewBox="0 0 2880 120" preserveAspectRatio="none"><path d="'+ln(22,1,0)+'"/></svg><svg viewBox="0 0 2880 120" preserveAspectRatio="none"><path d="'+ln(14,2,1.7)+'"/></svg><svg viewBox="0 0 2880 120" preserveAspectRatio="none"><path d="'+ln(9,3,3.1)+'"/></svg>';
    t.appendChild(w)});
  if(reduz||!('IntersectionObserver' in window))return;
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('rv-in');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  alvo.querySelectorAll('.guide h2,.pgrid li,.aif-card,.aif-stage,.sols h2,.ofh,.sc2,.band .sec>*,.tl li,.qa-in h2,.qa-sub,.fq,.cc,.cta-band .sec>*,.svp-body>*,.vg-list>*,.vl li,.foot-top>*,.mq,.v-rv').forEach(el=>{
    const i=[...el.parentElement.children].indexOf(el);el.classList.add('rv');el.style.transitionDelay=Math.min(i,8)*70+'ms';io.observe(el)});
}
const ARR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const WM=`<span class="wmw"><span class="wm">marketing</span><span class="wt">digital</span></span>`;
/* o link da Minha área fica escondido do visitante: aparece com #/admin no endereço (e passa a aparecer neste navegador depois da primeira vez) */
const ADMV=()=>{if(location.protocol==='file:')return true;if(location.hash==='#/admin'){sset('adm','1');return true}return sget('adm')==='1'};
const TICK=['Briefing em poucos minutos','3 opções de orçamento','Revisado por uma pessoa da equipe','Resposta pelo WhatsApp','Rio de Janeiro'];
const tick=()=>'<div class="v-tick" aria-hidden="true"><div class="v-tick-t">'+[0,1].map(()=>TICK.map(t=>'<span>'+t+'</span><i>\u2022</i>').join('')).join('')+'</div></div>';
const nav2=home=>`${tick()}<header class="nav"><div class="navi"><button class="brandb" data-home="1" aria-label="Início">${logo}${WM}</button>${home?`<nav class="mnav" id="mnav" aria-label="Principal">${home===1?'<button data-scroll="oferta">Serviços</button><button data-scroll="como">Como funciona</button><button data-scroll="sobre">Quem somos</button><button data-scroll="duvidas">Dúvidas</button><button data-scroll="contato">Contato</button>':'<button data-home="1">Início</button>'}<button data-vagas="1"${home===2?' class="cur" aria-current="page"':''}>Vagas</button></nav>`:''}<span class="navr">${home===1?'<button type="button" class="nav-cta" data-brief="1">Solicitar orçamento</button>':''}${home?'<button type="button" class="menub" data-menu aria-expanded="false" aria-controls="mnav">Menu</button>':''}${ADMV()?'<button class="lnk" data-nav="admin">Minha área</button>':''}</span></div></header>`;
const cnt=ph=>P.qa.filter(x=>x.ph===ph).length;
const PH=['Seu contato','Seu negócio','Perguntas sob medida','Investimento'];
const TIP=['Usamos o seu contato só para te enviar o plano e o orçamento.','Pode responder do seu jeito. Quanto mais detalhe, melhor o plano.','Estas perguntas mudam conforme o seu negócio. Quanto mais você contar, melhor fica o plano.','Uma faixa de valor já ajuda: montamos 3 opções que cabem no seu momento.'];
const shell=(ph,inner)=>{const m=MODS[P.mod];return `${nav2()}<main class="wrap"><div class="wzl"><aside class="rail"><span class="svc" style="--c:${m.c}">${P.mods.map(k=>ICON[k]).join('')}<span>${P.mods.length>1?'Combo: ':''}${P.mods.map(k=>MODS[k].name).join(' + ')}</span></span>
  <ol class="ph">${PH.map((t,i)=>`<li class="${i<ph?'done':i===ph?'on':''}"><i>${i<ph?'✓':i+1}</i>${t}</li>`).join('')}</ol>${modsRail()}<div class="tip">${TIP[ph]}</div>${rsmRail()}</aside><section class="gl">${inner}</section></div></main>`};
const segs=n=>`<div class="seg">${Array.from({length:SEED+(P.mod==='guia'?DIRQ.filter(x=>x[5](ansOf(P.qa))).length:0)+Math.min(maxAI(),topicPool().length)+COMUM.length},(_,i)=>`<i class="${i<n?'on':''}"></i>`).join('')}</div>`;