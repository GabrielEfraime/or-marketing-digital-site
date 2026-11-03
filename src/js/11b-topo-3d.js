/* Topo da home (02/11/2026): cena 3D de tela cheia atrás do título, em WebGL puro (sem bibliotecas), nas cores Earthen Luxe.
   Uma superfície de areia e seda com ondas lentas, vista em perspectiva, com a câmera avançando devagar e luz baixa em areia,
   como um vídeo de fundo. Desenha em resolução reduzida e a ~30 quadros por segundo; para quando sai da tela ou a aba
   fica oculta; com "reduzir movimento" fica parada (um quadro só). Sem WebGL, fica o degradê do CSS (24-topo-3d.css, classe v-t3). */
function heroCenaStart(){
  const c=document.getElementById('h3c');if(!c)return;
  const gl=c.getContext('webgl',{alpha:false,antialias:false,depth:false,powerPreference:'low-power'});
  if(!gl){c.remove();return}
  const reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const frag=`precision highp float;uniform vec2 R;uniform float T;
float H(vec2 p){float t=T*.07;
 p+=.55*vec2(sin(p.y*.33+t*1.1),cos(p.x*.27-t*.8));
 return .62*sin(p.x*.31+p.y*.17+t)+.34*sin(p.x*.13-p.y*.38-t*.7+1.7)+.16*sin(p.x*.71+p.y*.49+t*1.6+4.1)+.07*sin(p.x*1.37-p.y*1.13+t*2.1);}
vec3 N(vec2 p){float e=.03;return normalize(vec3(H(p-vec2(e,0.))-H(p+vec2(e,0.)),2.*e,H(p-vec2(0.,e))-H(p+vec2(0.,e))));}
float hs(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
 vec2 uv=(gl_FragCoord.xy*2.-R)/R.y;
 vec3 obs=vec3(.039,.035,.031),ard=vec3(.133,.2,.231),are=vec3(.776,.675,.557),ter=vec3(.369,.314,.247),mar=vec3(.918,.878,.835);
 vec3 ro=vec3(sin(T*.05)*1.5,2.1,T*.35);
 vec3 ww=normalize(vec3(0.,-.42,1.)),uu=normalize(cross(vec3(0.,1.,0.),ww)),vv=cross(ww,uu);
 vec3 rd=normalize(uv.x*uu+uv.y*vv+1.6*ww);
 vec3 L=normalize(vec3(-.35,.3,1.));
 float sol=max(dot(rd,L),0.);
 vec3 neb=ard*.62+are*.06;
 vec3 ceu=mix(neb,obs,smoothstep(0.,.42,rd.y))+are*(.22*pow(sol,7.)+.12*pow(sol,60.));
 vec3 col=ceu;
 if(rd.y<.06){
  float t=.1;
  for(int i=0;i<80;i++){vec3 p=ro+rd*t;float d=p.y-H(p.xz);if(d<.002*t||t>34.)break;t+=d*.6;}
  if(t<34.){
   vec3 p=ro+rd*t,n=N(p.xz),h=normalize(L-rd);
   float dif=max(dot(n,L),0.),spe=pow(max(dot(n,h),0.),38.),fre=pow(1.-max(dot(n,-rd),0.),4.);
   vec3 alb=mix(ter*.5,are*.62,smoothstep(-.7,1.,p.y));
   vec3 s=alb*(.1+.95*dif)+are*spe*.85+mar*fre*.1+ard*.18*(n.y*.5+.5);
   col=mix(s,ceu,max(1.-exp(-.07*t),smoothstep(18.,34.,t)));
  }
 }
 vec2 q=gl_FragCoord.xy/R;
 col*=.55+.45*pow(16.*q.x*q.y*(1.-q.x)*(1.-q.y),.22);
 col+=(hs(gl_FragCoord.xy+fract(T)*91.)-.5)*.025;
 gl_FragColor=vec4(col,1.);
}`;
  const sh=(t,src)=>{const o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);return o};
  const pr=gl.createProgram();
  gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));
  gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,frag));
  gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){c.remove();return}
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER,gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
  const a=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
  const uR=gl.getUniformLocation(pr,'R'),uT=gl.getUniformLocation(pr,'T');
  const t0=performance.now();let vis=true,raf=0,ult=0;
  const fit=()=>{const k=innerWidth<700?.6:.5;c.width=Math.max(2,Math.round(c.clientWidth*k));c.height=Math.max(2,Math.round(c.clientHeight*k));gl.viewport(0,0,c.width,c.height)};
  const draw=t=>{gl.uniform2f(uR,c.width,c.height);gl.uniform1f(uT,reduz?24:24+(t-t0)/1000);gl.drawArrays(gl.TRIANGLES,0,3);c.classList.add('on')};
  const loop=t=>{raf=0;if(!c.isConnected){limpa();return}if(!vis||document.hidden)return;
    if(t-ult>=32){ult=t;draw(t)}raf=requestAnimationFrame(loop)};
  const segue=()=>{if(!reduz&&!raf&&vis&&!document.hidden)raf=requestAnimationFrame(loop)};
  const io=new IntersectionObserver(es=>{vis=es[0].isIntersecting;segue()});io.observe(c);
  const ajusta=()=>{if(!c.isConnected){limpa();return}fit();if(reduz)draw(performance.now())};
  function limpa(){io.disconnect();removeEventListener('resize',ajusta);document.removeEventListener('visibilitychange',segue);
    const x=gl.getExtension('WEBGL_lose_context');if(x)x.loseContext()}
  addEventListener('resize',ajusta);document.addEventListener('visibilitychange',segue);
  fit();draw(performance.now());segue();
}
