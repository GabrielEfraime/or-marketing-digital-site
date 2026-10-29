/* Abertura 3D da OR (arquivo "LOGO E ABERTURA/logo/abertura-3d.html", sem alterações no desenho): Three.js r159 em 00-three-r159.js. */
function orAberturaRodar(){
/* ====== CONFIGURACAO ====== */
var CONFIG={
  autoDismissMs: 7500,   // fecha sozinho depois disso; use 0 para exigir clique em "Entrar"
  redirect: null,        // ex.: '/home' para ir a outra pagina ao terminar
  showOncePerSession: false // true = so mostra na primeira visita da aba
};
var MODEL={"O_out":{"cx":-134.64,"cy":-0.20,"rx":143.56,"ry":172.12,"rot":-1.54},"O_in":{"cx":-139.08,"cy":3.70,"rx":83.23,"ry":118.37,"rot":-3.10},"R":[["M",-13.25,137.0],["C",-13.4,130,-8.5,122.5,6.41,116.05],["C",11.55,111.54,30.12,89.82,33.84,88.58],["C",38.25,87.12,48.60,88.81,53.75,88.74],["C",59.09,88.66,64.39,87.72,69.75,87.80],["C",93.50,88.18,167.38,93.41,185.14,83.08],["C",196.49,76.5,199.58,65.29,199.49,53.0],["C",199.39,40.04,192.13,29.02,181.54,22.0],["C",174.64,17.42,166.39,15.06,158.25,13.83],["C",149.37,12.5,139.96,13.74,131.0,13.45],["C",108.61,12.77,86.21,12.5,63.75,12.5],["C",56.5,12.5,48.5,11.9,45.09,10.56],["C",43.84,7.94,44.83,4.25,46.27,1.93],["C",56.03,-13.77,70.38,-27.51,82.14,-41.75],["C",92.98,-54.83,157.14,-137.69,165.23,-140.69],["C",170.21,-142.54,295.74,-142.10,305.25,-140.5],["L",206.75,-29.5],["C",213.38,-27.31,221.61,-26.39,228.75,-23.94],["C",251.76,-16.02,268.32,2.93,275.78,25.75],["C",282.01,44.80,280.94,64.13,274.62,83.0],["C",263.73,115.55,231.73,134.0,199.0,137.32],["C",185.90,138.65,172.15,137.5,159.0,137.5],["C",138.41,137.5,117.83,137.5,97.25,137.5],["C",73.58,137.5,49.91,137.5,26.25,137.5],["C",13.28,137.5,-1.05,138.21,-13.25,137.0],["Z"]],"S":[["M",44.75,11.25],["C",45.2,-4,66.7,-22.8,82.67,-42.07],["C",101.7,-65.2,145.2,-118.1,164.25,-141.25],["L",231.5,-140.0],["L",113.25,10.0],["L",44.75,11.25],["Z"]],"W":627.0,"H":301.0};
/* ========================== */
var intro=document.getElementById('or-intro'),canvas=document.getElementById('or-canvas');
var params=new URLSearchParams(location.search);
var freeze=params.has('t')?parseFloat(params.get('t')):null;      // ?t=2.5 congela num instante (teste)
var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
try{ if(CONFIG.showOncePerSession&&sessionStorage.getItem('or-intro')&&!params.has('intro')) {intro.className='done';return;} }catch(e){}

var finished=false, raf=0;
function finish(){
  if(finished)return; finished=true;
  intro.classList.add('done');
  try{sessionStorage.setItem('or-intro','1')}catch(e){}
  window.dispatchEvent(new CustomEvent('or-intro-done'));
  setTimeout(function(){cancelAnimationFrame(raf);try{renderer.dispose()}catch(e){}; if(CONFIG.redirect)location.href=CONFIG.redirect;},950);
}
document.getElementById('or-skip').onclick=finish;
document.getElementById('or-enter').onclick=finish;
addEventListener('keydown',function(e){if(e.key==='Escape'||e.key==='Enter')finish()});

var renderer;
try{
  renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true,powerPreference:'high-performance'});
}catch(e){ intro.classList.add('nogl','go','txt'); if(!freeze)setTimeout(finish,CONFIG.autoDismissMs||6000); return; }
renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.25;

var scene=new THREE.Scene();
var camera=new THREE.PerspectiveCamera(28,1,0.1,100);

/* --- ambiente procedural (estudio escuro com softboxes) para reflexos metalicos --- */
(function(){
  var c=document.createElement('canvas');c.width=1024;c.height=512;var g=c.getContext('2d');
  var gr=g.createLinearGradient(0,0,0,512);gr.addColorStop(0,'#5a5a64');gr.addColorStop(.45,'#202024');gr.addColorStop(1,'#0c0c0e');
  g.fillStyle=gr;g.fillRect(0,0,1024,512);
  function box(x,y,w,h,col,blur){g.save();g.filter='blur('+blur+'px)';g.fillStyle=col;g.fillRect(x,y,w,h);g.restore();}
  box(60,30,380,120,'#ffffff',18);
  var pg=g.createLinearGradient(0,150,0,380);pg.addColorStop(0,'#9c9da8');pg.addColorStop(.5,'#3a3a42');pg.addColorStop(1,'#111114');
  g.save();g.filter='blur(40px)';g.fillStyle=pg;g.fillRect(560,150,420,230);g.restore();   // painel frontal (reflexo da face)          // softbox superior esquerda
  box(560,10,420,90,'#e8eeff',18);          // faixa superior direita
  box(0,170,110,260,'#ffffff',14);          // tira lateral
  box(900,170,110,230,'#b8f7e8',14);         // rim menta (paleta)
  box(300,380,420,70,'#ff5a00',20);         // reflexo laranja embaixo
  var t=new THREE.CanvasTexture(c);t.mapping=THREE.EquirectangularReflectionMapping;t.colorSpace=THREE.SRGBColorSpace;
  var pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromEquirectangular(t).texture;t.dispose();pm.dispose();
})();

/* --- luzes --- */
var key=new THREE.PointLight(0xffffff,0,0,2);key.position.set(-6,4,6);scene.add(key);   // luz de varredura
var rim=new THREE.DirectionalLight(0xb8f7e8,1.8);rim.position.set(5,2,-4);scene.add(rim);
var fill=new THREE.DirectionalLight(0xffffff,1.4);fill.position.set(-3,5,5);scene.add(fill);
var glow=new THREE.PointLight(0xff5a00,0,6,2);scene.add(glow);                        // brilho laranja
var holeGlow=new THREE.PointLight(0xff6a10,0,3.2,2);scene.add(holeGlow);             // brilho dentro do O

/* --- geometria a partir do modelo vetorial --- */
var K=0.01, DEPTH=62, BEV=9;
function shapeFrom(cmds){
  var s=new THREE.Shape();
  cmds.forEach(function(c){
    if(c[0]==='M')s.moveTo(c[1],c[2]);
    else if(c[0]==='L')s.lineTo(c[1],c[2]);
    else if(c[0]==='C')s.bezierCurveTo(c[1],c[2],c[3],c[4],c[5],c[6]);
  });
  return s;
}
function ext(shape,depth,bev){
  return new THREE.ExtrudeGeometry(shape,{depth:depth,bevelEnabled:true,bevelThickness:bev,bevelSize:bev*0.75,bevelOffset:-bev*0.75,bevelSegments:6,curveSegments:64});
}
var oS=new THREE.Shape(),eo=MODEL.O_out,ei=MODEL.O_in;
oS.absellipse(eo.cx,eo.cy,eo.rx,eo.ry,0,Math.PI*2,false,eo.rot);
var hole=new THREE.Path();hole.absellipse(ei.cx,ei.cy,ei.rx,ei.ry,0,Math.PI*2,true,ei.rot);oS.holes.push(hole);
var rS=shapeFrom(MODEL.R), sS=shapeFrom(MODEL.S);

var metal=new THREE.MeshPhysicalMaterial({color:0x4c4c52,metalness:1,roughness:0.27,clearcoat:0.8,clearcoatRoughness:0.15,envMapIntensity:2.3});
var orange=new THREE.MeshStandardMaterial({color:0xff5a00,emissive:0xff3c00,emissiveIntensity:0,roughness:0.35,metalness:0.15,envMapIntensity:0.8});

function letter(shape,mat,depth,bev){
  var g=ext(shape,depth,bev);g.computeBoundingBox();var c=new THREE.Vector3();g.boundingBox.getCenter(c);g.translate(-c.x,-c.y,-c.z);
  var m=new THREE.Mesh(g,mat);var holder=new THREE.Group();holder.add(m);holder.position.set(c.x*K,c.y*K,0);m.scale.setScalar(K);
  return {holder:holder,center:c};
}
var O=letter(oS,metal,DEPTH,BEV), R=letter(rS,metal,DEPTH,BEV);
// faixa laranja: filha do R, um pouco mais funda na frente (fica embutida)
var SD=DEPTH+4, sg=ext(sS,SD,BEV*0.55);
var sMesh=new THREE.Mesh(sg,orange);
sMesh.position.set(-R.center.x,-R.center.y,(DEPTH/2+BEV+6)-BEV*0.55-SD);   // frente da faixa 6 unidades a frente do aco
R.holder.children[0].add(sMesh);
var logo=new THREE.Group();logo.add(O.holder,R.holder);scene.add(logo);
// posicao das luzes de brilho
glow.position.set((MODEL.S[0][1]+80)*K,(MODEL.S[0][2]-70)*K,1.2);
holeGlow.position.set(ei.cx*K,ei.cy*K,-0.3);

/* --- tamanho / camera --- */
var LW=MODEL.W*K, LH=MODEL.H*K;
function resize(){
  var w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;
  var t=Math.tan(camera.fov*Math.PI/360), need=Math.max(LW/(w<700?0.84:0.72)/(t*camera.aspect*2), (LH*2.25)/(t*2));
  camera.userData.base=need*1.0;camera.updateProjectionMatrix();
}
addEventListener('resize',resize);resize();

/* --- interacao --- */
var mx=0,my=0,sx=0,sy=0;
addEventListener('pointermove',function(e){mx=e.clientX/innerWidth*2-1;my=e.clientY/innerHeight*2-1});
addEventListener('deviceorientation',function(e){if(e.gamma!=null){mx=Math.max(-1,Math.min(1,e.gamma/30));my=Math.max(-1,Math.min(1,(e.beta-45)/30));}});

/* --- animacao --- */
function clamp(x){return x<0?0:x>1?1:x}
function eOut4(x){x=clamp(x);return 1-Math.pow(1-x,4)}
function eOut3(x){x=clamp(x);return 1-Math.pow(1-x,3)}
function eIO(x){x=clamp(x);return x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2}
var t0=performance.now(), shown={go:false,txt:false};
var Z=0.0;
function frame(now){
  var t=freeze!=null?freeze:(now-t0)/1000;
  if(reduce)t=Math.max(t,4);
  /* 0.0-0.3 preto | O gira 0.2-2.0 | R gira 0.45-2.25 | faixa acende 1.7-2.5 | varredura de luz 1.5-3.2 | texto 2.6 */
  var po=eOut4((t-0.2)/1.8), pr=eOut4((t-0.45)/1.8);
  O.holder.rotation.y=-(1-po)*Math.PI*1.1;  O.holder.position.x=O.center.x*K-(1-po)*2.2;
  R.holder.rotation.y= (1-pr)*Math.PI*1.1;  R.holder.position.x=R.center.x*K+(1-pr)*2.2;
  var sc=0.82+0.18*eOut3((t-0.2)/2.2); logo.scale.setScalar(sc);
  O.holder.visible=t>0.2; R.holder.visible=t>0.45;

  var ig=clamp((t-1.7)/0.35), fall=1-clamp((t-2.05)/0.9);       // acende e assenta
  var flash=Math.sin(Math.PI*clamp((t-1.7)/0.9));
  orange.emissiveIntensity=ig*(0.38+1.5*flash);
  glow.intensity=ig*(0.12+2.2*flash); holeGlow.intensity=clamp((t-1.2)/0.8)*(0.9+0.6*flash);

  var sw=clamp((t-1.45)/1.8);key.position.set(-7+sw*14,3.5-sw*1.5,5.5);key.intensity=sw>0&&sw<1?Math.sin(Math.PI*sw)*55:0;

  // camera: aproximacao + parallax suave
  sx+=(mx-sx)*0.06;sy+=(my-sy)*0.06;
  var idle=Math.max(0,t-2.8);
  var dist=camera.userData.base*(1.18-0.18*eIO(t/3.2));
  var ang=(1-eOut3(t/3))*0.35 + sx*0.22 + Math.sin(idle*0.55)*0.04;
  var elev=(1-eOut3(t/3))*0.10 - sy*0.12 + Math.sin(idle*0.4)*0.02;
  camera.position.set(Math.sin(ang)*dist,Math.sin(elev)*dist,Math.cos(ang)*dist);
  camera.lookAt(0,-0.30*LH,0);

  if(!shown.go&&t>0.25){shown.go=true;intro.classList.add('go')}
  if(!shown.txt&&t>2.7){shown.txt=true;intro.classList.add('txt')}
  renderer.render(scene,camera);
  if(!finished&&freeze==null){
    if(CONFIG.autoDismissMs&&t*1000>CONFIG.autoDismissMs)finish();
    raf=requestAnimationFrame(frame);
  }
}
if(freeze!=null){frame(0);window.__ready=true}else raf=requestAnimationFrame(frame);
}
