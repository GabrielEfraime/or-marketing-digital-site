const A={sel:null,filter:'todos',tab:'orc',edit:false,fs:false,sub:'prev',err:'',auth:false,view:'dash',sig:''};
const J={orc:{on:false,id:null,live:'',t0:0,what:'orc'},plano:{on:false,id:null,live:'',t0:0},ex:{on:false,id:null,live:'',t0:0,what:''}};
const anyBusy=()=>J.orc.on||J.plano.on||J.ex.on;
const isSite=l=>svcs(l).some(k=>k==='site'||k==='resite');
const svcs=l=>(l.mods&&l.mods.length?l.mods:[l.mod]).filter(k=>MODS[k]);
const svcName=l=>svcs(l).map(k=>MODS[k].name).join(' + ');
const svcIc=l=>svcs(l).map(k=>'<span class="mi">'+ICON[k]+'</span>').join('');
const mineJ=(k,l)=>J[k].on&&J[k].id===l.id;
const LBL={BASICO:'Essencial',MEDIO:'Crescimento',MAX:'Completo',MENSAGEM:'Mensagem'};
const sig=()=>getL().map(l=>l.id+l.status+(l.orc?1:0)).join();
function parseOrc(t){const o={},re=/---(BASICO|MEDIO|MAX|MENSAGEM)---/g,ix=[];let m;while((m=re.exec(t)))ix.push([m[1],m.index,re.lastIndex]);
  ix.forEach((x,i)=>{o[x[0]]=t.slice(x[2],i+1<ix.length?ix[i+1][1]:t.length).trim()});return o}
const statLine=()=>['orc','plano','ex'].filter(k=>J[k].on&&J[k].id===A.sel).map(k=>`${{orc:({ficha:'Resumindo o briefing',msg:'Reescrevendo a mensagem'}[J.orc.what]||'Gerando 3 orçamentos e a mensagem'),plano:'Gerando o plano',ex:'Gerando '+J.ex.what}[k]}… ${Math.round((Date.now()-J[k].t0)/1000)}s · ${J[k].live.length} caracteres`).join('   ·   ');
setInterval(()=>{const s=document.getElementById('stat');if(s)s.textContent=statLine()},1000);

