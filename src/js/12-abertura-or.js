/* Abertura com a assinatura animada do kit Earthen Luxe (06_ANIMACAO/OR_Assinatura_Animada.svg), sem bibliotecas.
   O desenho (ABERTURA_SVG) vem de 02-marca-or.js; a animação é CSS (15-abertura-or.css), para respeitar o movimento reduzido.
   O slogan entra depois que MARKETING DIGITAL termina de surgir (3,5 s).
   Fecha no botão Entrar, com Enter ou Esc, ou sozinha depois de 8 s. */
function orAberturaRodar(){
  const intro=document.getElementById('or-intro');
  const reduz=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let feito=false;
  const tecla=e=>{if(e.key==='Escape'||e.key==='Enter')fim()};
  const fim=()=>{if(feito)return;feito=true;intro.classList.add('done');removeEventListener('keydown',tecla);
    dispatchEvent(new CustomEvent('or-intro-done'))};
  document.getElementById('or-enter').onclick=fim;
  addEventListener('keydown',tecla);
  requestAnimationFrame(()=>intro.classList.add('go'));
  setTimeout(()=>intro.classList.add('txt'),reduz?0:3500);
  setTimeout(fim,8000);
}
