/* Cofre do site: as chaves de IA vão CIFRADAS dentro da própria página (o build, com a senha COFRE_SENHA, escreve o bloco no lugar do marcador abaixo).
   Em qualquer aparelho o consultor digita a senha uma vez; as chaves passam para o cofre local de sempre (cifrado no navegador) e o aparelho lembra.
   Sem senha ninguém lê a chave. Sem COFRE_SENHA no build o valor é null e nada disso aparece. Usa bkpDecifra (PBKDF2 600 mil + AES-GCM), a mesma do backup protegido. */
const COFRE_SITE=__COFRE__;
const COFRE={busy:false,err:''};
const cofreAtivo=()=>IAS.some(s=>CFG[s].key);
/* abre o cofre e preenche só as IAs que ainda estão sem chave (a chave que você colou na tela IAs não é trocada). Devolve quantas IAs ganharam chave. */
async function cofreAbre(senha){
  if(!COFRE_SITE)throw new Error('Este site não tem cofre de chaves.');
  let o;try{o=await bkpDecifra(COFRE_SITE,String(senha||''))}catch(e){throw new Error('Senha errada.')}
  const val=(v,pre)=>typeof v==='string'&&v.length>=20&&v.length<=300&&!/\s/.test(v)&&(!pre||v.startsWith(pre))?v:'';
  const g=val(o&&o.groq,'gsk_'),ge=val(o&&o.gemini),po=val(o&&o.pollinations);
  if(!g&&!ge&&!po)throw new Error('O cofre abriu, mas não tem nenhuma chave válida.');
  let n=0;IAS.forEach(s=>{if(g&&!CFG[s].key){CFG[s].key=g;n++}});
  if(ge&&!CFG.img.key){CFG.img.key=ge;n++}if(po&&!CFG.pol.key){CFG.pol.key=po;n++}
  await keysSave(true);
  return n;
}
function cofreHtml(){
  if(!COFRE_SITE)return '';
  if(cofreAtivo())return '<p class="hint" role="status">IA ativa neste aparelho.</p>';
  return `<section class="panel" id="cofre"><h3>Destravar a IA deste site</h3>
   <p class="hint">As chaves da IA vão cifradas dentro do site. Digite a senha uma vez: este aparelho lembra e a IA passa a funcionar. Sem a senha ninguém consegue ler a chave.</p>
   <label for="cofsenha">Senha do site</label><input id="cofsenha" type="password" autocomplete="off" spellcheck="false" maxlength="200">
   <div class="row"><button type="button" class="btn hl" id="cofbtn"${COFRE.busy?' disabled':''}>Destravar a IA</button></div>
   <p class="err" role="alert" id="coferr">${esc(COFRE.err)}</p></section>`;
}
/* depois(): o que repintar quando o cofre abrir (ou falhar) */
function cofreBind(depois){
  const b=document.getElementById('cofbtn'),i=document.getElementById('cofsenha');if(!b||!i)return;
  const vai=async()=>{
    if(COFRE.busy)return;
    if(!i.value){COFRE.err='Digite a senha do site.';const e=document.getElementById('coferr');if(e)e.textContent=COFRE.err;return}
    COFRE.busy=true;b.disabled=true;b.textContent='Abrindo…';  /* a derivação da senha leva alguns segundos em aparelho fraco */
    try{await cofreAbre(i.value);COFRE.err=''}catch(e){COFRE.err=e.message}
    COFRE.busy=false;i.value='';depois();
  };
  b.onclick=vai;
  i.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();vai()}};
}
