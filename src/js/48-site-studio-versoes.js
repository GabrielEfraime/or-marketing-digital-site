/* OR Site Studio, Etapa 4: desfazer, refazer, abrir, comparar e limitar versões do site (SPEC.md: SS-022, SS-023, SS-025).
   Voltar ou abrir uma versão só troca a "versão atual": nada é apagado. Só o limite apaga, e antes o app pergunta. */
const SS_VERS_LIM=30;  /* limite provisório (decisão pendente do CEO, SPEC seção 5, item 5) */
let IA_QUEM='';        /* modelo que de fato respondeu à última chamada (preenchido por askF) */

/* ---- funções puras (testadas em scripts/testar.mjs) ---- */
/* versão vizinha na ordem de criação: dir -1 = anterior (desfazer), +1 = seguinte (refazer); 0 se não há */
function ssVizinha(vers,atual,dir){
  const ns=(vers||[]).map(v=>v.n).sort((a,b)=>a-b),i=ns.indexOf(atual);
  if(i<0)return 0;const j=i+(dir<0?-1:1);return j>=0&&j<ns.length?ns[j]:0;
}
/* qual versão sai quando já se chegou ao limite: a mais antiga que não é a atual nem foi enviada ao cliente.
   0 = cabe (ainda há espaço); -1 = está no limite e nada pode sair (todas atuais ou enviadas) */
function ssParaDescartar(vers,atual,lim){
  const v=vers||[];if(v.length<lim)return 0;
  const c=v.filter(x=>!x.env&&x.n!==atual).sort((a,b)=>a.n-b.n);
  return c.length?c[0].n:-1;
}
/* diferença por linhas (menor subsequência comum). Devolve {ops:[{t:'+'|'-',l}], add, rem}; só as linhas que mudaram */
function ssDiff(a,b){
  const A=String(a||'').split(/\r?\n/).map(s=>s.trim()),B=String(b||'').split(/\r?\n/).map(s=>s.trim());
  let i0=0;while(i0<A.length&&i0<B.length&&A[i0]===B[i0])i0++;
  let fa=A.length,fb=B.length;while(fa>i0&&fb>i0&&A[fa-1]===B[fb-1]){fa--;fb--}
  const X=A.slice(i0,fa),Y=B.slice(i0,fb),n=X.length,m=Y.length;
  if(n*m>4e6)return {ops:[...X.map(l=>({t:'-',l})),...Y.map(l=>({t:'+',l}))].filter(o=>o.l),add:m,rem:n,grande:true};
  const w=m+1,T=new Uint32Array((n+1)*w);
  for(let i=n-1;i>=0;i--)for(let j=m-1;j>=0;j--)T[i*w+j]=X[i]===Y[j]?T[(i+1)*w+j+1]+1:Math.max(T[(i+1)*w+j],T[i*w+j+1]);
  const ops=[];let i=0,j=0,add=0,rem=0;
  while(i<n&&j<m){if(X[i]===Y[j]){i++;j++}else if(T[(i+1)*w+j]>=T[i*w+j+1]){rem++;if(X[i])ops.push({t:'-',l:X[i]});i++}else{add++;if(Y[j])ops.push({t:'+',l:Y[j]});j++}}
  while(i<n){rem++;if(X[i])ops.push({t:'-',l:X[i]});i++}
  while(j<m){add++;if(Y[j])ops.push({t:'+',l:Y[j]});j++}
  return {ops,add,rem,grande:false};
}

/* ---- ações (só no clique) ---- */
function ssIrVersao(id,n){
  const p=ssGet(id);if(!p||!p.vers.some(v=>v.n===n)||p.vAtual===n)return;
  ssUpd(id,{vAtual:n});ssRegistra(id,'versao','Abriu a versão '+n+'.');
}
const ssDesfazer=id=>{const p=ssGet(id);if(p)ssIrVersao(id,ssVizinha(p.vers,p.vAtual,-1))};
const ssRefazer=id=>{const p=ssGet(id);if(p)ssIrVersao(id,ssVizinha(p.vers,p.vAtual,1))};
function ssMarcaEnviada(id,n){
  const p=ssGet(id),v=p&&p.vers.find(x=>x.n===n);if(!v)return;
  ssUpd(id,{vers:p.vers.map(x=>x.n===n?{...x,env:!x.env}:x)});ssRegistra(id,'versao',(v.env?'Desmarcou':'Marcou')+' a versão '+n+' como enviada ao cliente.');
}
async function ssComparaVersoes(id,a,b){
  if(!a||!b||a===b){SS.cmp=null;SS.err='Escolha duas versões diferentes para comparar.';return ssPaint()}
  try{
    const [ha,hb]=await Promise.all([arqGet(ssChaveV(id,a)),arqGet(ssChaveV(id,b))]);
    if(!ha||!hb){SS.cmp=null;SS.err='Não achei o HTML de uma das versões neste navegador (as versões não entram no backup).';return ssPaint()}
    SS.err='';SS.cmp={id,a,b,...ssDiff(ha,hb)};
  }catch(e){SS.cmp=null;SS.err='Não consegui abrir as versões guardadas neste navegador.'}
  ssPaint();
}
