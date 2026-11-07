function sha256js(m){const K=[];let p=2;for(let n=0;n<64;p++){let q=1;for(let d=2;d*d<=p;d++)if(p%d==0){q=0;break}if(q){K[n++]=(Math.cbrt(p)%1*4294967296)|0}}
  const H=[];p=2;for(let n=0;n<8;p++){let q=1;for(let d=2;d*d<=p;d++)if(p%d==0){q=0;break}if(q){H[n++]=(Math.sqrt(p)%1*4294967296)|0}}
  const u=new TextEncoder().encode(m),l=u.length,w=new Uint8Array(((l+9+63)>>6)<<6);w.set(u);w[l]=128;new DataView(w.buffer).setUint32(w.length-4,l*8);
  const dv=new DataView(w.buffer),W=new Array(64),r=(x,n)=>(x>>>n)|(x<<(32-n));
  for(let o=0;o<w.length;o+=64){for(let i=0;i<16;i++)W[i]=dv.getUint32(o+i*4);
    for(let i=16;i<64;i++){const a=W[i-15],b=W[i-2];W[i]=(W[i-16]+(r(a,7)^r(a,18)^(a>>>3))+W[i-7]+(r(b,17)^r(b,19)^(b>>>10)))|0}
    let [a,b,c,d,e,f,g,h]=H;
    for(let i=0;i<64;i++){const t1=(h+(r(e,6)^r(e,11)^r(e,25))+((e&f)^(~e&g))+K[i]+W[i])|0,t2=((r(a,2)^r(a,13)^r(a,22))+((a&b)^(a&c)^(b&c)))|0;h=g;g=f;f=e;e=(d+t1)|0;d=c;c=b;b=a;a=(t1+t2)|0}
    H[0]=(H[0]+a)|0;H[1]=(H[1]+b)|0;H[2]=(H[2]+c)|0;H[3]=(H[3]+d)|0;H[4]=(H[4]+e)|0;H[5]=(H[5]+f)|0;H[6]=(H[6]+g)|0;H[7]=(H[7]+h)|0}
  return H.map(x=>(x>>>0).toString(16).padStart(8,'0')).join('')}
const sha=async v=>{const t='vyxa|'+v;try{if(window.crypto&&crypto.subtle)return[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t)))].map(b=>b.toString(16).padStart(2,'0')).join('')}catch(e){}return sha256js(t)};
const hexs=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
const unhex=h=>Uint8Array.from(String(h).match(/../g)||[],x=>parseInt(x,16));
const kdf=async(v,salt,it)=>{const k=await crypto.subtle.importKey('raw',new TextEncoder().encode(v),'PBKDF2',false,['deriveBits']);return hexs(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt,iterations:it},k,256))};
const pinMake=async v=>{try{if(window.crypto&&crypto.subtle){const sl=crypto.getRandomValues(new Uint8Array(16));return 'pbkdf2$600000$'+hexs(sl)+'$'+await kdf(v,sl,600000)}}catch(e){}return sha(v)};
const pinCheck=async v=>{const h=CFG.pinh;if(!h)return v===CFG.pin;if(String(h).startsWith('pbkdf2$')){const p=String(h).split('$'),it=+p[1];if(!(it>=1000&&it<=1000000))return false;try{return(await kdf(v,unhex(p[2]),it))===p[3]}catch(e){return false}}return(await sha(v))===h};
const pinLock=(()=>{try{const o=JSON.parse(sget('pinlock')||'{}');return{n:Math.max(0,+o.n||0),until:Math.max(0,+o.until||0)}}catch(e){return{n:0,until:0}}})();
const pinSave=()=>sset('pinlock',JSON.stringify(pinLock));
async function pinOk(v){
  if(Date.now()<pinLock.until)return 'wait';
  const ok=await pinCheck(v);
  if(ok){pinLock.n=0;pinLock.until=0;pinSave();if(CFG.pinh&&!String(CFG.pinh).startsWith('pbkdf2$')&&window.crypto&&crypto.subtle){CFG.pinh=await pinMake(v);saveCfg()}return true}
  pinLock.n++;if(pinLock.n>=5)pinLock.until=Date.now()+Math.min(900,30*2**(pinLock.n-5))*1000;pinSave();
  return false;
}