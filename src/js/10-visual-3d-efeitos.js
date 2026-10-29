/* Marca 3D (WebGL puro, sem biblioteca): o "V" da Vyxa extrudado, com luz e inclinação que segue o ponteiro. */
function vMarkStart(){
  const c=document.getElementById('vmk');if(!c)return;
  if(c._stop)c._stop();
  const gl=c.getContext('webgl',{antialias:true,alpha:true,premultipliedAlpha:true});
  if(!gl){c.classList.add('off');return}
  const reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* contorno do V, no sentido anti-horário, e os triângulos da face */
  const P=[[-1,1],[-.28,-1],[.28,-1],[1,1],[.55,1],[0,-.25],[-.55,1]],T=[[0,1,5],[0,5,6],[2,3,4],[2,4,5],[1,2,5]],H=.28;
  const v=[],push=(x,y,z,nx,ny,nz)=>v.push(x,y,z,nx,ny,nz);
  const area=(a,b,d)=>(b[0]-a[0])*(d[1]-a[1])-(b[1]-a[1])*(d[0]-a[0]);
  T.forEach(t=>{let [a,b,d]=t.map(i=>P[i]);if(area(a,b,d)<0)[b,d]=[d,b];
    push(a[0],a[1],H,0,0,1);push(b[0],b[1],H,0,0,1);push(d[0],d[1],H,0,0,1);
    push(a[0],a[1],-H,0,0,-1);push(d[0],d[1],-H,0,0,-1);push(b[0],b[1],-H,0,0,-1)});
  let sa=0;P.forEach((p,i)=>{const q=P[(i+1)%P.length];sa+=p[0]*q[1]-q[0]*p[1]});
  P.forEach((p,i)=>{const q=P[(i+1)%P.length],dx=q[0]-p[0],dy=q[1]-p[1],l=Math.hypot(dx,dy)||1,nx=(sa>0?dy:-dy)/l,ny=(sa>0?-dx:dx)/l;
    push(p[0],p[1],H,nx,ny,0);push(q[0],q[1],H,nx,ny,0);push(q[0],q[1],-H,nx,ny,0);
    push(p[0],p[1],H,nx,ny,0);push(q[0],q[1],-H,nx,ny,0);push(p[0],p[1],-H,nx,ny,0)});
  const n=v.length/6;
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return o};
  const pr=gl.createProgram();
  gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec3 p;attribute vec3 n;uniform mat4 uM;uniform mat4 uR;varying vec3 vn;void main(){vn=mat3(uR)*n;gl_Position=uM*vec4(p,1.);}'));
  gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,'precision mediump float;uniform vec3 uC;varying vec3 vn;void main(){vec3 N=normalize(vn);vec3 L1=normalize(vec3(-.45,.7,.65));vec3 L2=normalize(vec3(.7,-.3,.4));float d=.42+.56*max(dot(N,L1),0.)+.2*max(dot(N,L2),0.);vec3 Hh=normalize(L1+vec3(0.,0.,1.));float sp=pow(max(dot(N,Hh),0.),48.)*.3;float rim=pow(1.-max(N.z,0.),3.)*.14;gl_FragColor=vec4(uC*d+vec3(sp+rim),1.);}'));
  gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){c.classList.add('off');return}
  gl.useProgram(pr);
  const bf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(v),gl.STATIC_DRAW);
  const ap=gl.getAttribLocation(pr,'p'),an=gl.getAttribLocation(pr,'n');
  gl.enableVertexAttribArray(ap);gl.vertexAttribPointer(ap,3,gl.FLOAT,false,24,0);
  gl.enableVertexAttribArray(an);gl.vertexAttribPointer(an,3,gl.FLOAT,false,24,12);
  const uM=gl.getUniformLocation(pr,'uM'),uR=gl.getUniformLocation(pr,'uR'),uC=gl.getUniformLocation(pr,'uC');
  gl.enable(gl.DEPTH_TEST);gl.clearColor(0,0,0,0);
  const mul=(a,b)=>{const o=new Array(16).fill(0);for(let i=0;i<4;i++)for(let j=0;j<4;j++)for(let k=0;k<4;k++)o[j*4+i]+=a[k*4+i]*b[j*4+k];return o};
  const rotY=a=>{const s=Math.sin(a),k=Math.cos(a);return[k,0,-s,0,0,1,0,0,s,0,k,0,0,0,0,1]};
  const rotX=a=>{const s=Math.sin(a),k=Math.cos(a);return[1,0,0,0,0,k,s,0,0,-s,k,0,0,0,0,1]};
  const tr=(x,y,z)=>[1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1];
  const proj=(f,a,nr,fr)=>{const t=1/Math.tan(f/2);return[t/a,0,0,0,0,t,0,0,0,0,(fr+nr)/(nr-fr),-1,0,0,2*fr*nr/(nr-fr),0]};
  const cor=()=>{const m=(getComputedStyle(c).color.match(/[\d.]+/g)||[255,90,0]).map(Number);return[m[0]/255,m[1]/255,m[2]/255]};
  let col=cor(),yaw=-.5,pitch=.14,vis=true,raf=0,w=0,h=0;const t0=performance.now();
  const size=()=>{const d=Math.min(devicePixelRatio||1,2),W=Math.max(2,Math.round(c.clientWidth*d)),Hh=Math.max(2,Math.round(c.clientHeight*d));if(W!==w||Hh!==h){w=c.width=W;h=c.height=Hh;gl.viewport(0,0,w,h)}};
  const draw=()=>{size();gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    const R=mul(rotY(yaw),rotX(pitch)),M=mul(proj(.62,w/h,1,20),mul(tr(0,0,-4.6),R));
    gl.uniformMatrix4fv(uM,false,new Float32Array(M));gl.uniformMatrix4fv(uR,false,new Float32Array(R));gl.uniform3fv(uC,col);gl.drawArrays(gl.TRIANGLES,0,n)};
  const tick=t=>{raf=0;if(!document.body.contains(c))return stop();
    if(vis&&!document.hidden){yaw=-.5+(t-t0)*.00055;pitch=.16+Math.sin((t-t0)*.0004)*.1;draw()}
    raf=requestAnimationFrame(tick)};
  const io=new IntersectionObserver(es=>{vis=es[0].isIntersecting});io.observe(c);
  const ro=new ResizeObserver(()=>{if(reduz)draw()});ro.observe(c);
  const th=new MutationObserver(()=>{col=cor();if(reduz)draw()});th.observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
  function stop(){cancelAnimationFrame(raf);raf=0;io.disconnect();ro.disconnect();th.disconnect()}
  c._stop=stop;
  if(reduz){draw();return}
  raf=requestAnimationFrame(tick);
}
/* Orbe do AI-Driven: anéis orbitais ciano e violeta cruzando em 3D, malha fina, partículas e núcleo brilhante (canvas 2D, sem biblioteca). */
function orbStart(){
  const c=document.getElementById('orb');if(!c)return;
  if(c._stop)c._stop();
  const x=c.getContext('2d');if(!x)return;
  const reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const CY='245,245,243',VI='255,90,0',MG='255,138,77';
  const N=110,UC=[];for(let i=0;i<=N;i++){const a=i/N*Math.PI*2;UC.push([Math.cos(a),Math.sin(a)])}
  /* anéis: raio, velocidades de giro nos três eixos, fase, cor */
  const RINGS=[[1,.31,.17,.09,0,CY],[.96,-.23,.29,.14,1.1,VI],[.9,.18,-.34,.21,2.2,CY],[.84,-.27,-.19,.33,3.0,VI],[.78,.36,.12,-.24,4.1,CY],[.72,-.15,.38,.18,5.0,VI],[.66,.28,-.26,.3,.6,CY],[.58,-.4,.22,-.12,1.7,VI],[.5,.2,.35,.27,2.8,CY],[.92,.12,-.14,.4,3.7,VI],[.7,-.33,-.3,-.16,4.6,CY]];
  /* partículas na casca da esfera */
  const PT=[];for(let i=0;i<90;i++){const u=Math.random()*2-1,a=Math.random()*Math.PI*2,r=Math.sqrt(1-u*u),k=.55+Math.random()*.5;PT.push([Math.cos(a)*r*k,u*k,Math.sin(a)*r*k,Math.random()*6.28])}
  const rot=(p,ax,ay,az)=>{let [X,Y,Z]=p,c1=Math.cos(ax),s1=Math.sin(ax),y1=Y*c1-Z*s1,z1=Y*s1+Z*c1;Y=y1;Z=z1;
    const c2=Math.cos(ay),s2=Math.sin(ay),x2=X*c2+Z*s2,z2=-X*s2+Z*c2;X=x2;Z=z2;
    const c3=Math.cos(az),s3=Math.sin(az);return[X*c3-Y*s3,X*s3+Y*c3,Z]};
  let vis=true,raf=0,W=0,yaw=0,pit=0;const t0=performance.now();
  const size=()=>{const d=Math.min(devicePixelRatio||1,2),s=Math.max(2,Math.round(c.clientWidth*d));if(s!==W){W=c.width=c.height=s}return d};
  const draw=t=>{
    const d=size(),R=W/2,s=reduz?3:(t-t0)/1000;
    x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,W);x.translate(R,R);x.lineCap='round';x.lineJoin='round';
    yaw=s*.22;pit=.32+Math.sin(s*.18)*.16;
    const U=R*.8,F=3.2,proj=p=>{const q=rot(p,pit,yaw,0),k=F/(F-q[2]*.9);return[q[0]*U*k,q[1]*U*k,q[2]]};
    x.globalCompositeOperation='lighter';
    /* halo de fundo */
    let g=x.createRadialGradient(0,0,0,0,0,R*.95);g.addColorStop(0,'rgba('+MG+',.16)');g.addColorStop(.35,'rgba('+VI+',.1)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(-R,-R,W,W);
    /* malha da esfera: paralelos e meridianos, mais claros na frente */
    x.lineWidth=1*d;
    for(let la=-3;la<=3;la++){const y=la/4,r=Math.sqrt(1-y*y)*.96;let prev=null;
      for(let i=0;i<=48;i++){const a=i/48*Math.PI*2+s*.12,p=proj([Math.cos(a)*r,y*.96,Math.sin(a)*r]);if(prev){x.strokeStyle='rgba('+CY+','+(.05+.12*(prev[2]+p[2]+2)/4).toFixed(3)+')';x.beginPath();x.moveTo(prev[0],prev[1]);x.lineTo(p[0],p[1]);x.stroke()}prev=p}}
    for(let lo=0;lo<8;lo++){const b=lo/8*Math.PI+s*.12;let prev=null;
      for(let i=0;i<=48;i++){const a=i/48*Math.PI*2,p=proj([Math.cos(a)*Math.cos(b)*.96,Math.sin(a)*.96,Math.cos(a)*Math.sin(b)*.96]);if(prev){x.strokeStyle='rgba('+CY+','+(.04+.1*(prev[2]+p[2]+2)/4).toFixed(3)+')';x.beginPath();x.moveTo(prev[0],prev[1]);x.lineTo(p[0],p[1]);x.stroke()}prev=p}}
    /* anéis orbitais: um traço largo e suave por baixo e um fino e brilhante por cima */
    RINGS.forEach((rg,ri)=>{const [r,sx,sy,sz,ph,col]=rg,ax=ph+s*sx,ay=ph*.7+s*sy,az=ph*.4+s*sz;
      const pts=UC.map(u=>proj(rot(rot([u[0]*r,u[1]*r,0],ax,ay,az),0,0,0)));
      for(let pass=0;pass<2;pass++){x.lineWidth=(pass?1.5:5)*d;
        for(let i=0;i<N;i+=6){const a=pts[i],b=pts[Math.min(i+6,N)],z=(a[2]+b[2])/2,al=(pass?.28:.05)+(pass?.62:.1)*(z+1)/2;
          x.strokeStyle='rgba('+col+','+al.toFixed(3)+')';x.beginPath();x.moveTo(a[0],a[1]);
          for(let j=i+1;j<=Math.min(i+6,N);j++)x.lineTo(pts[j][0],pts[j][1]);x.stroke()}}
      /* ponto que percorre o anel */
      if(ri%2===0){const u=(s*.35*(ri%4?1:-1)+ri*1.3)%1,k=Math.floor((u<0?u+1:u)*N),p=pts[k];
        const gg=x.createRadialGradient(p[0],p[1],0,p[0],p[1],10*d);gg.addColorStop(0,'rgba(255,255,255,.95)');gg.addColorStop(.35,'rgba('+col+',.55)');gg.addColorStop(1,'rgba('+col+',0)');x.fillStyle=gg;x.beginPath();x.arc(p[0],p[1],10*d,0,Math.PI*2);x.fill()}
    });
    /* partículas */
    PT.forEach(q=>{const p=proj(rot([q[0],q[1],q[2]],0,s*.15,0)),al=(.25+.5*(p[2]+1)/2)*(.6+.4*Math.sin(s*1.6+q[3]));x.fillStyle='rgba(190,235,255,'+al.toFixed(3)+')';x.beginPath();x.arc(p[0],p[1],(1+.9*(p[2]+1)/2)*d,0,Math.PI*2);x.fill()});
    /* núcleo */
    const pulse=1+.08*Math.sin(s*2.2),rc=R*.2*pulse;
    g=x.createRadialGradient(0,0,0,0,0,rc*2.4);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.12,'rgba(255,225,200,.95)');g.addColorStop(.32,'rgba('+MG+',.55)');g.addColorStop(.65,'rgba('+VI+',.2)');g.addColorStop(1,'rgba('+VI+',0)');
    x.fillStyle=g;x.beginPath();x.arc(0,0,rc*2.4,0,Math.PI*2);x.fill();
    x.globalCompositeOperation='source-over';
  };
  const tick=t=>{raf=0;if(!document.body.contains(c))return stop();if(vis&&!document.hidden)draw(t);raf=requestAnimationFrame(tick)};
  const io=new IntersectionObserver(es=>{vis=es[0].isIntersecting});io.observe(c);
  const ro=new ResizeObserver(()=>{if(reduz)draw(performance.now())});ro.observe(c);
  function stop(){cancelAnimationFrame(raf);raf=0;io.disconnect();ro.disconnect()}
  c._stop=stop;
  if(reduz){draw(performance.now());return}
  raf=requestAnimationFrame(tick);
}
/* Pontos pulsantes no topo (inspirado na United Carriers): matriz de pontos com ondas lentas e alguns pontos que pulsam. */
function dotsStart(){
  document.querySelectorAll('main .v-hero').forEach(sec=>{
    if(sec.querySelector('.v-dots'))return;
    const c=document.createElement('canvas');c.className='v-dots';c.setAttribute('aria-hidden','true');sec.insertBefore(c,sec.firstChild);
    const x=c.getContext('2d'),reduz=matchMedia('(prefers-reduced-motion: reduce)').matches,GAP=28;
    let W=0,H=0,D=1,vis=true,raf=0,pts=[];const t0=performance.now();
    const fit=()=>{D=Math.min(devicePixelRatio||1,2);W=c.width=Math.max(2,Math.round(c.clientWidth*D));H=c.height=Math.max(2,Math.round(c.clientHeight*D));
      const cols=Math.ceil(W/(GAP*D)),rows=Math.ceil(H/(GAP*D));pts=[];for(let k=0;k<8;k++)pts.push([Math.floor(Math.random()*cols),Math.floor(Math.random()*rows),Math.random()])};
    const draw=t=>{const s=reduz?4:(t-t0)/1000,dark=document.documentElement.dataset.theme!=='light',base=dark?'244,245,251':'11,11,11',acc=dark?'255,90,0':'69,39,214',g=GAP*D;
      x.clearRect(0,0,W,H);
      for(let r=0;r*g<H+g;r++)for(let q=0;q*g<W+g;q++){const a=.07+.11*(.5+.5*Math.sin(q*.33+r*.27-s*.8));x.fillStyle='rgba('+base+','+a.toFixed(3)+')';x.beginPath();x.arc(q*g+g/2,r*g+g/2,1.15*D,0,6.2832);x.fill()}
      pts.forEach(p=>{const ph=(((s*.45+p[2])%1)+1)%1,cx=p[0]*g+g/2,cy=p[1]*g+g/2;x.strokeStyle='rgba('+acc+','+(.55*(1-ph)).toFixed(3)+')';x.lineWidth=1.4*D;x.beginPath();x.arc(cx,cy,(2.5+ph*30)*D,0,6.2832);x.stroke();x.fillStyle='rgba('+acc+',.95)';x.beginPath();x.arc(cx,cy,2.6*D,0,6.2832);x.fill()})};
    const tick=t=>{raf=0;if(!document.body.contains(c))return stop();if(vis&&!document.hidden)draw(t);raf=requestAnimationFrame(tick)};
    const io=new IntersectionObserver(es=>{vis=es[0].isIntersecting});io.observe(c);
    const ro=new ResizeObserver(()=>{fit();if(reduz)draw(performance.now())});ro.observe(c);
    function stop(){cancelAnimationFrame(raf);raf=0;io.disconnect();ro.disconnect()}
    fit();if(reduz){draw(performance.now());return}raf=requestAnimationFrame(tick);
  });
}
/* Navegação por capítulos na lateral (inspirada na Seacat): mostra onde você está e leva a cada parte. */
function capitulos(){
  document.querySelectorAll('.v-cap').forEach(n=>n.remove());
  const L=[['topo','Início'],['manifesto','Manifesto'],['opcoes','Opções'],['sobre','AI-Driven'],['briefing','Briefing'],['oferta','Serviços'],['como','Como funciona'],['duvidas','Dúvidas'],['contato','Contato']].filter(a=>document.getElementById(a[0]));
  if(!L.length)return;
  const reduz=matchMedia('(prefers-reduced-motion: reduce)').matches,nav=document.createElement('nav');nav.className='v-cap';nav.setAttribute('aria-label','Partes da página');
  nav.innerHTML=L.map(a=>'<button type="button" data-cap="'+a[0]+'" aria-label="Ir para '+a[1]+'"><span>'+a[1]+'</span><i></i></button>').join('');
  document.body.appendChild(nav);
  nav.onclick=e=>{const b=e.target.closest('[data-cap]');if(b){const el=document.getElementById(b.dataset.cap);if(el)el.scrollIntoView({behavior:reduz?'auto':'smooth'})}};
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){nav.querySelectorAll('[aria-current]').forEach(b=>b.removeAttribute('aria-current'));const b=nav.querySelector('[data-cap="'+e.target.id+'"]');if(b)b.setAttribute('aria-current','true')}}),{rootMargin:'-45% 0px -50% 0px'});
  L.forEach(a=>io.observe(document.getElementById(a[0])));
}
/* Abertura (inspirada na Seacat): o nome da empresa se revela, uma barra carrega e um botão abre o site. Aparece uma vez por visita. */
let INTRO_FEITA=false;
function introStart(){
  if(INTRO_FEITA||document.getElementById('or-intro')||location.hash==='#/admin')return;
  INTRO_FEITA=true;
  const o=document.createElement('div');o.id='or-intro';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');o.setAttribute('aria-label','Abertura OR Marketing Digital');
  o.innerHTML='<canvas id="or-canvas"></canvas><img class="fallback" src="'+VMARK+'" alt="OR Marketing Digital"><div class="or-line l1"></div><div class="or-line l2"></div><button class="or-skip" id="or-skip" type="button">Pular</button><div class="or-copy"><div class="or-tag">Estratégia · Criatividade · Resultados</div><div class="or-sub"><b>Mais que marketing.</b> É crescimento real.</div><div class="or-actions"><button class="or-btn" id="or-enter" type="button">Entrar</button></div></div>';
  document.body.appendChild(o);
  app.inert=true;document.documentElement.style.overflow='hidden';
  window.addEventListener('or-intro-done',()=>{app.inert=false;document.documentElement.style.overflow='';window.scrollTo(0,0);
    setTimeout(()=>{o.remove();const m=document.getElementById('conteudo');if(m){m.setAttribute('tabindex','-1');m.focus({preventScroll:true})}},1100)},{once:true});
  try{orAberturaRodar()}catch(e){o.classList.add('done');app.inert=false;document.documentElement.style.overflow='';o.remove()}
}
function cenaStart(){
  const sec=document.getElementById('como');if(!sec||!sec.classList.contains('v-scene'))return;
  if(window._cena){removeEventListener('scroll',window._cena);removeEventListener('resize',window._cena);window._cena=null}
  const cv=sec.querySelector('canvas'),lis=[...sec.querySelectorAll('.v-sc-steps li')],num=sec.querySelector('.v-sc-n b');
  if(!cv||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  sec.classList.remove('est');
  const x=cv.getContext('2d');let W=0,H=0,D=1,last=-1,raf=0;
  const cl=(v,a,b)=>Math.max(a,Math.min(b,v)),ss=(a,b,v)=>{const t=cl((v-a)/(b-a),0,1);return t*t*(3-2*t)};
  const MONO='ui-monospace,"Cascadia Mono",Consolas,monospace';
  const fit=()=>{D=Math.min(devicePixelRatio||1,2);const w=Math.max(2,Math.round(cv.clientWidth*D)),h=Math.max(2,Math.round(cv.clientHeight*D));if(w!==W||h!==H){cv.width=W=w;cv.height=H=h;last=-1}};
  const box=(a,b,w,h,r)=>{x.beginPath();if(x.roundRect)x.roundRect(a,b,w,h,r);else x.rect(a,b,w,h)};
  const draw=p=>{
    fit();const dark=document.documentElement.dataset.theme!=='light',K=dark?'244,245,251':'11,11,11',L=dark?'255,90,0':'69,39,214',u=Math.min(W,H)/100;
    const col=(c,a)=>'rgba('+c+','+a.toFixed(3)+')';
    x.clearRect(0,0,W,H);
    /* grade de pontos ao fundo */
    x.fillStyle=col(K,.1);for(let i=6;i<100;i+=6)for(let j=6;j<100;j+=6){x.beginPath();x.arc(i*u,j*u,.35*u,0,6.2832);x.fill()}
    const win=i=>{const fi=i===0?1:ss(i*.25-.05,i*.25+.02,p),fo=i===3?1:1-ss((i+1)*.25-.02,(i+1)*.25+.05,p);return fi*fo};
    const tx=(t,px,py,sz,al,cc,al2)=>{x.font='600 '+(sz*u)+'px '+MONO;x.textAlign=al2||'left';x.fillStyle=col(cc||K,al);x.fillText(t,px*u,py*u)};
    /* 1. briefing: perguntas e respostas */
    let a=win(0),s=cl(p/.25,0,1);
    if(a>.01){tx('BRIEFING',8,8,2.6,.7*a);
      for(let k=0;k<5;k++){const t=cl(s*5.4-k,0,1)*a,q=k%2===0,bx=(q?8:44)*u,by=(14+k*14.5+(1-t)*3)*u,bw=(q?46:48)*u,bh=10*u;
        box(bx,by,bw,bh,2.2*u);x.fillStyle=col(q?K:L,q?.08*t:.16*t);x.fill();x.strokeStyle=col(q?K:L,.55*t);x.lineWidth=D;x.stroke();
        x.fillStyle=col(q?K:L,.55*t);box(bx+3*u,by+3*u,bw*(q?.7:.55),1.5*u,.7*u);x.fill();box(bx+3*u,by+6*u,bw*(q?.45:.7),1.5*u,.7*u);x.fill()}}
    /* 2. plano: documento com itens marcados */
    a=win(1);s=cl((p-.25)/.25,0,1);
    if(a>.01){tx('PLANO',8,8,2.6,.7*a);const sc=.94+.06*ss(0,.4,s),cx=50*u,cy=52*u;x.save();x.translate(cx,cy);x.scale(sc,sc);x.translate(-cx,-cy);
      box(22*u,14*u,56*u,76*u,3*u);x.fillStyle=col(K,.07*a);x.fill();x.strokeStyle=col(K,.6*a);x.lineWidth=1.2*D;x.stroke();
      x.fillStyle=col(L,.95*a);box(28*u,20*u,24*u,3.4*u,1.2*u);x.fill();
      for(let k=0;k<5;k++){const t=ss(k*.17,k*.17+.3,s),yy=(32+k*11)*u;x.fillStyle=col(K,.38*a);box(40*u,yy,(30-k*2.5)*u*t+.1,1.8*u,.8*u);x.fill();
        x.strokeStyle=col(L,.95*a*t);x.lineWidth=1.8*D;x.beginPath();x.moveTo(28*u,yy+1*u);x.lineTo(30*u,yy+3*u);x.lineTo(34*u,yy-1.4*u);x.stroke()}
      x.restore()}
    /* 3. orçamento: três colunas (nenhuma é recomendada por padrão) */
    a=win(2);s=cl((p-.5)/.25,0,1);
    if(a>.01){tx('ORÇAMENTO',8,8,2.6,.7*a);const hs=[38,58,78],nm=['ESSENCIAL','CRESCIMENTO','COMPLETO'];
      for(let k=0;k<3;k++){const t=ss(k*.14,k*.14+.5,s),w=20*u,px=(21+k*26)*u,h=hs[k]*u*t,py=84*u-h;
        box(px,py,w,Math.max(h,1),2*u);x.fillStyle=k===1?col(L,.92*a):col(K,.12*a);x.fill();if(k!==1){x.strokeStyle=col(K,.45*a);x.lineWidth=D;x.stroke()}
        tx(nm[k],px/u+10,90,2.3,.8*a,K,'center')}}
    /* 4. WhatsApp: conversa */
    a=win(3);s=cl((p-.75)/.25,0,1);
    if(a>.01){tx('WHATSAPP',8,8,2.6,.7*a);box(28*u,12*u,44*u,78*u,5*u);x.strokeStyle=col(K,.6*a);x.lineWidth=1.2*D;x.stroke();
      const t1=ss(.05,.3,s),t2=ss(.4,.65,s),t3=ss(.75,.95,s);
      box(32*u,20*u,26*u,12*u,2.4*u);x.fillStyle=col(K,.13*a*t1);x.fill();x.fillStyle=col(K,.55*a*t1);box(35*u,23.5*u,19*u,1.6*u,.8*u);x.fill();box(35*u,27*u,13*u,1.6*u,.8*u);x.fill();
      box(42*u,38*u,26*u,12*u,2.4*u);x.fillStyle=col(L,.9*a*t2);x.fill();x.fillStyle=col(dark?'11,11,11':'255,255,255',.7*a*t2);box(45*u,41.5*u,19*u,1.6*u,.8*u);x.fill();box(45*u,45*u,12*u,1.6*u,.8*u);x.fill();
      box(32*u,56*u,26*u,12*u,2.4*u);x.fillStyle=col(K,.13*a*t3);x.fill();x.fillStyle=col(K,.55*a*t3);box(35*u,59.5*u,17*u,1.6*u,.8*u);x.fill();
      tx('EXEMPLO ILUSTRATIVO',50,96,2,.65*a,K,'center')}
  };
  const frame=()=>{raf=0;const r=sec.getBoundingClientRect(),st=sec.querySelector('.v-stick'),tot=Math.max(1,sec.offsetHeight-st.offsetHeight),p=cl((68-r.top)/tot,0,1);
    const i=Math.min(3,Math.floor(p*4));lis.forEach((li,k)=>li.classList.toggle('on',k===i));
    const v=Math.round(p*100);if(num)num.textContent=String(v).padStart(2,'0');
    if(Math.abs(p-last)>.0004){last=p;draw(p)}};
  const on=()=>{if(!raf)raf=requestAnimationFrame(frame)};
  window._cena=on;addEventListener('scroll',on,{passive:true});addEventListener('resize',on);frame();
}
/* Marca gigante em pontos no rodapé (inspirada na United Carriers): o nome vira uma matriz de pontos; um anel segue o mouse e os pontos por perto crescem e se afastam. */
function megaStart(){
  document.querySelectorAll('.v-mega').forEach(el=>{
    if(el._stop)el._stop();
    const txt=String(el.dataset.t||el.textContent||'OR').trim().toUpperCase();el.dataset.t=txt;
    el.textContent='';el.classList.add('pts');
    const cv=document.createElement('canvas');el.appendChild(cv);
    const x=cv.getContext('2d');if(!x)return;
    const reduz=matchMedia('(prefers-reduced-motion: reduce)').matches,G=7,R=150,FF='"Arial Black","Segoe UI Black","Helvetica Neue",Arial,sans-serif';
    let dots=[],W=0,H=0,D=1,px=0,py=0,rx=0,ry=0,inside=false,vis=true,raf=0;const t0=performance.now();
    const build=()=>{
      const cw=Math.max(240,Math.round(el.clientWidth));D=Math.min(devicePixelRatio||1,2);
      const m=document.createElement('canvas'),mx=m.getContext('2d');mx.font='900 200px '+FF;
      const me=mx.measureText(txt),asc=me.actualBoundingBoxAscent,des=me.actualBoundingBoxDescent,fs=200*cw*.99/Math.max(1,me.width),sc=fs/200,ch=Math.round((asc+des)*sc+G*2);
      m.width=cw;m.height=ch;mx.font='900 '+fs+'px '+FF;mx.textAlign='center';mx.textBaseline='alphabetic';mx.fillStyle='#000';mx.fillText(txt,cw/2,asc*sc+G);
      const px4=mx.getImageData(0,0,cw,ch).data;dots=[];
      for(let j=0;j*G+G/2<ch;j++)for(let i=0;i*G+G/2<cw;i++){const X=Math.floor(i*G+G/2),Y=Math.floor(j*G+G/2);if(px4[(Y*cw+X)*4+3]>110)dots.push([X,Y,i,j])}
      cv.style.height=ch+'px';cv.width=W=Math.round(cw*D);cv.height=H=Math.round(ch*D);
    };
    const LV=12,lv=Array.from({length:LV},()=>[]);
    const draw=t=>{
      const s=(t-t0)/1000;x.setTransform(1,0,0,1,0,0);x.clearRect(0,0,W,H);x.setTransform(D,0,0,D,0,0);
      for(let i=0;i<LV;i++)lv[i].length=0;
      const sw=reduz?-9:((s*.32)%1.6)*1.6-.6;   // faixa de luz que atravessa a marca
      for(let n=0;n<dots.length;n++){const d=dots[n];let X=d[0],Y=d[1],k=0;
        if(!reduz)Y+=1.1*Math.sin(s*1.8+d[2]*.21+d[3]*.13);
        if(inside){const dx=X-rx,dy=Y-ry,dd=Math.hypot(dx,dy);if(dd<R){k=1-dd/R;k*=k;const f=k*16/(dd||1);X+=dx*f;Y+=dy*f}}
        const u=X/Math.max(1,W/D)-sw-(Y/Math.max(1,H/D))*.25,band=Math.max(0,1-Math.abs(u)*5.5);
        const a=Math.min(1,.5+band*.45+k*.55),q=Math.min(LV-1,Math.round(a*(LV-1)));
        lv[q].push(X,Y,1.15+k*2.4+band*.5)}
      for(let q=0;q<LV;q++){const L=lv[q];if(!L.length)continue;const a=q/(LV-1);
        x.fillStyle=a>.9?'rgba(255,170,110,'+a.toFixed(2)+')':'rgba(255,90,0,'+a.toFixed(2)+')';x.beginPath();
        for(let i=0;i<L.length;i+=3){const r=L[i+2];x.rect(L[i]-r,L[i+1]-r,r*2,r*2)}x.fill()}
      if(inside){x.strokeStyle='rgba(255,90,0,.95)';x.lineWidth=2;x.beginPath();x.arc(rx,ry,34,0,6.2832);x.stroke();x.fillStyle='#FF5A00';x.beginPath();x.arc(rx,ry,3,0,6.2832);x.fill()}
    };
    const move=e=>{const r=cv.getBoundingClientRect();px=e.clientX-r.left;py=e.clientY-r.top;if(!inside){rx=px;ry=py}inside=true;if(reduz)requestAnimationFrame(()=>draw(performance.now()))};
    const leave=()=>{inside=false;if(reduz)requestAnimationFrame(()=>draw(performance.now()))};
    el.addEventListener('pointermove',move);el.addEventListener('pointerdown',move);el.addEventListener('pointerleave',leave);el.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')leave()});
    const tick=t=>{raf=0;if(!document.body.contains(el))return stop();
      if(vis&&!document.hidden){rx+=(px-rx)*.28;ry+=(py-ry)*.28;draw(t)}raf=requestAnimationFrame(tick)};
    const io=new IntersectionObserver(es=>{vis=es[0].isIntersecting});io.observe(el);
    const ro=new ResizeObserver(()=>{build();draw(performance.now())});ro.observe(el);
    function stop(){cancelAnimationFrame(raf);raf=0;io.disconnect();ro.disconnect();el._stop=null}
    el._stop=stop;build();draw(performance.now());
    if(!reduz)raf=requestAnimationFrame(tick);
  });
}
/* Rótulos com índice no início de cada seção (estilo United Carriers). */
function rotulos(){
  const M={topo:'Início',manifesto:'Manifesto',opcoes:'Opções',sobre:'AI-Driven',briefing:'Briefing',oferta:'Serviços',como:'Processo',duvidas:'Dúvidas',contato:'Contato','svp-corpo':'O serviço','vagas-lista':'Vagas',cadastro:'Cadastro'};
  let n=0;document.querySelectorAll('main section[id]').forEach(sec=>{
    const nome=M[sec.id];if(!nome||sec.querySelector(':scope .v-lab')||sec.classList.contains('v-scene')||sec.id==='topo')return;
    const w=sec.querySelector('.v-wrap');if(!w)return;n++;
    const p=document.createElement('p');p.className='v-lab';p.innerHTML='<b>('+String(n).padStart(2,'0')+')</b> '+nome;w.insertBefore(p,w.firstChild)});
}
function heroFlutuarStart(){
  const h=app.querySelector('.v-hc');
  if(!h||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  h.addEventListener('pointermove',e=>{const r=h.getBoundingClientRect();h.style.setProperty('--mx',((e.clientX-r.left)/r.width-.5)*2);h.style.setProperty('--my',((e.clientY-r.top)/r.height-.5)*2)});
}
