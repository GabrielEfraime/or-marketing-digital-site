function aifStart(){
  const c=document.getElementById('aifc');if(!c)return;
  c.width=c.height=640;
  const gl=c.getContext('webgl',{premultipliedAlpha:true,alpha:true});if(!gl){c.style.display='none';return}
  const sh=(t,src)=>{const o=gl.createShader(t);gl.shaderSource(o,src);gl.compileShader(o);return o};
  const pr=gl.createProgram();
  gl.attachShader(pr,sh(gl.VERTEX_SHADER,'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'));
  gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,`precision highp float;uniform vec2 R;uniform float T;
float h(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float n(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n(p);p=p*2.03+vec3(1.7,9.2,3.1);a*=.5;}return s;}
vec3 pal(float t){return .5+.5*cos(6.2832*(t+vec3(.0,.33,.67)));}
void main(){
 vec2 p=(gl_FragCoord.xy*2.-R)/R.y;
 float a=atan(p.y,p.x);
 float rr=.8+.03*sin(3.*a+T*.6)+.02*sin(5.*a-T*.8);
 float d=length(p)/rr;
 float aa=smoothstep(1.,.985,d);
 if(aa<=0.){gl_FragColor=vec4(0.);return;}
 float z=sqrt(max(1.-d*d,0.));
 vec3 N=normalize(vec3(p/rr,z));
 vec3 q=N*1.3;
 float t=T*.18;
 vec3 o=vec3(t,-t*.7,t*.5);
 float h0=fbm(q+o);
 vec3 g=vec3(fbm(q+o+vec3(.06,0.,0.)),fbm(q+o+vec3(0.,.06,0.)),fbm(q+o+vec3(0.,0.,.06)))-h0;
 vec3 Nb=normalize(N-g*2.2);
 vec3 V=vec3(0.,0.,1.);
 float fr=pow(1.-max(dot(Nb,V),0.),2.);
 vec3 rd=refract(-V,Nb,.75);
 vec2 u=N.xy*.9+rd.xy*1.2+vec2(h0*1.5,0.);
 float k=fbm(vec3(u*1.1,t*.8));
 float ph=k*8.+u.x*2.2-u.y*1.6+T*.06;
 vec3 c1=vec3(1.,.35,0.),c2=vec3(.76,.27,0.),c3=vec3(.96,.94,.9),c4=vec3(1.,.6,.2);
 float w1=.5+.5*sin(ph),w2=.5+.5*sin(ph+1.6),w3=.5+.5*sin(ph+3.2),w4=.5+.5*sin(ph+4.8);
 vec3 col=(c1*w1+c2*w2+c3*w3+c4*w4)/(w1+w2+w3+w4);
 float l=1.-abs(sin(h0*16.+T*.35));
 col+=pow(l,14.)*vec3(1.,.9,.8)*.4;
 col=mix(col*1.1,vec3(1.,.75,.5),fr*.3);
 vec3 L=normalize(vec3(-.5,.65,.7));
 float sp=pow(max(dot(Nb,normalize(L+V)),0.),260.);
 float sp2=pow(max(dot(Nb,normalize(vec3(.6,-.55,.6)+V)),0.),120.);
 float spec=sp*1.3+sp2*.4;
 float al=clamp(.5+.45*fr+spec,0.,1.);
 col+=spec;
 gl_FragColor=vec4(col*al*aa,al*aa);
}`));
  gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS)){c.style.display='none';return}
  gl.useProgram(pr);
  const bf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,bf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(pr,'a');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  gl.uniform2f(gl.getUniformLocation(pr,'R'),c.width,c.height);
  const uT=gl.getUniformLocation(pr,'T'),reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;
  function frame(t){
    if(!c.isConnected)return;
    gl.viewport(0,0,c.width,c.height);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(uT,reduz?8:t*.001+8);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    if(!reduz)requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}