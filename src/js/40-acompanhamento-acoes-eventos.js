/* ---------- ações e eventos das partes novas ---------- */
const copiado=b=>{if(b){const o=b.textContent;b.textContent='Copiado';setTimeout(()=>{b.textContent=o},1800)}};
const abreWa=(l,txt)=>window.open('https://wa.me/'+wnum(l.whats)+'?text='+encodeURIComponent(txt),'_blank','noopener,noreferrer');
function prodAct(k,arg,b){
  const id=T.id,l=trkL(id);if(!l)return true;const [a1,a2]=String(arg||'').split('|');
  if(k==='escload'){const pk=trkPk(l);
    const faz=()=>{trkSet(id,t=>{const r=frentesDe(trkL(id),pk),velho={};t.frentes.forEach(x=>{velho[x.k+'|'+x.rede+'|'+x.fmt]=x.id});r.frentes.forEach(x=>{const v=velho[x.k+'|'+x.rede+'|'+x.fmt];if(v)x.id=v});t.frentes=r.frentes;t.redes=r.redes;t.escopo=r.resto;t.escopoPk=pk});T.msg=pk?'Frentes e entregas carregadas do pacote '+PLANO_NOME[pk]+'.':'Frentes padrão carregadas (pacote fora da tabela).';trkPaint()};
    if(l.track.frentes.length||l.track.escopo.length)confirma('Trocar as frentes e as entregas atuais pelas do pacote? As quantidades que você mudou à mão voltam às da tabela. As peças já geradas continuam nas frentes que existirem.',faz,{ok:'Trocar',titulo:'Recarregar do pacote?',perigo:false});else faz();return true}
  if(k==='escadd'){const tx=val2('es_txt');if(!tx)return true;trkSet(id,t=>t.escopo.push({id:uid(),k:val2('es_k'),txt:tx.slice(0,300),freq:val2('es_fq')||'mensal',done:false}))}
  else if(k==='escdel')trkSet(id,t=>{t.escopo=t.escopo.filter(x=>x.id!==arg)});
  else if(k==='escdone')trkSet(id,t=>{const x=t.escopo.find(y=>y.id===arg);if(x){x.done=!x.done;x.at=x.done?today():''}});
  else if(k==='escgen'){entregaUma(id,arg);return true}
  else if(k==='rede'){const r=arg,t0=l.track;
    if(t0.redes.includes(r)){const ids=t0.frentes.filter(x=>x.rede===r).map(x=>x.id),pids=(t0.pecas||[]).filter(p=>ids.includes(p.fid)).map(p=>p.id),n=pids.length;
      const tira=()=>{pids.forEach(pid=>reaArteLimparArquivo(id,pid));trkSet(id,t=>{t.redes=t.redes.filter(x=>x!==r);t.frentes=t.frentes.filter(x=>x.rede!==r);t.pecas=(t.pecas||[]).filter(p=>!ids.includes(p.fid))});trkPaint()};
      if(n){trkPaint();confirma('Tirar '+r+'? As '+n+' peça(s) já geradas para '+r+' serão apagadas.',tira,{ok:'Tirar',titulo:'Tirar rede?'})}else tira();return true}
    trkSet(id,t=>{t.redes.push(r);(REDE_FMT[r]||['post']).forEach(fm=>{const base=t.frentes.find(x=>x.k==='social'&&(x.fmt===fm||((fm==='video'||fm==='shorts')&&x.fmt==='reels')));t.frentes.push({id:uid(),k:'social',rede:r,fmt:fm,qtd:base?base.qtd:4,por:base?base.por:'mes'})})})}
  else if(k==='fradd'){const fm=val2('fa_f_'+arg)||'outro',q=Math.max(1,Math.min(60,Math.round(+val2('fa_q_'+arg))||1)),r=arg==='social'?val2('fa_r_'+arg):'';
    trkSet(id,t=>t.frentes.push({id:uid(),k:arg,rede:r,fmt:fm,qtd:q,por:arg==='brand'?'projeto':'mes',...(fm==='outro'?{nome:''}:{})}))}
  else if(k==='frdel'){const fr=l.track.frentes.find(x=>x.id===arg);if(!fr)return true;const pids=(l.track.pecas||[]).filter(p=>p.fid===arg).map(p=>p.id),n=pids.length;
    const faz=()=>{pids.forEach(pid=>reaArteLimparArquivo(id,pid));trkSet(id,t=>{t.frentes=t.frentes.filter(x=>x.id!==arg);t.pecas=(t.pecas||[]).filter(p=>p.fid!==arg)});trkPaint()};
    if(n)confirma('Apagar a frente "'+frNome(fr)+'" e as '+n+' peça(s) dela? Não dá para desfazer.',faz,{ok:'Apagar',titulo:'Apagar frente?'});else faz();return true}
  else if(k==='area'){T.area=arg||null;T.peca=null;T.tab='prod';T.msg='';T.info='';trkPaint();window.scrollTo(0,0);return true}
  else if(k==='peca'){T.peca=arg||null;T.msg='';trkPaint();window.scrollTo(0,0);return true}
  else if(k==='per'){T.cic=Math.max(1,(T.cic||cicAtual(l.track))+(+arg));T.msg='';T.info=''}
  else if(k==='parar'){T.parar=true;const e=document.getElementById('prprog');if(e)e.textContent='Parando depois desta parte…';return true}
  else if(k==='gerartudo'){const per=perSel(l.track),t0=l.track;geraFila(id,per,t0.frentes.map(x=>({fid:x.id,n:Math.max(0,alvo(x)-pecasDe(t0,x,per).length)})).filter(x=>x.n>0));return true}
  else if(k==='frgen'){geraFila(id,perSel(l.track),[{fid:a1,n:Math.max(1,+a2||1)}]);return true}
  else if(k==='frcp'||k==='frwa'){const fr=l.track.frentes.find(x=>x.id===arg);if(!fr)return true;const per=perSel(l.track),tx=pecasTxt(fr,pecasDe(l.track,fr,per));
    if(k==='frcp'){copiar(tx);copiado(b);return true}
    abreWa(l,'Oi, '+l.nome.split(' ')[0]+'! Aqui é a equipe da OR. Seguem as peças de '+frNome(fr)+' ('+perNomeT(l.track,perF(fr,per))+') para você aprovar:\n\n'+tx.slice(0,2800)+(tx.length>2800?'\n\n(continua no material completo que enviamos à parte)':'')+'\n\nPode nos dizer se aprova ou o que quer ajustar?');return true}
  else if(k==='pcgen'){pecaRefaz(id,arg);return true}
  else if(k==='pccp'||k==='pcwa'){const p=(l.track.pecas||[]).find(x=>x.id===arg),fr=p&&l.track.frentes.find(x=>x.id===p.fid);if(!p)return true;const tx=(p.titulo?p.titulo+'\n\n':'')+p.txt;
    if(k==='pccp'){copiar(tx);copiado(b);return true}
    abreWa(l,'Oi, '+l.nome.split(' ')[0]+'! Aqui é a equipe da OR. Segue uma peça'+(fr?' de '+frNome(fr):'')+' para você aprovar:\n\n'+tx.slice(0,2800)+'\n\nPode nos dizer se aprova ou o que quer ajustar?');return true}
  else if(k==='pcdel'){confirma('Apagar esta peça? Não dá para desfazer.',()=>{reaArteLimparArquivo(id,arg);trkSet(id,t=>{t.pecas=(t.pecas||[]).filter(x=>x.id!==arg)});T.peca=null;trkPaint()},{ok:'Apagar',titulo:'Apagar peça?'});return true}
  else if(k==='ia'){iaCanal(id,a1,a2);return true}
  else if(k==='iafix'){const c=val2('iacx-'+a2);if(!c){T.iaMsg='Escreva o que a IA errou.';T.iaCanal=a1;return trkPaint(),true}const g=document.getElementById('iacg-'+a2);iaCanal(id,a1,'',{rid:a2,corr:c.slice(0,600),geral:!!(g&&g.checked)});return true}
  else if(k==='iacp'){const r=((l.track.ia||{})[a1]||[]).find(x=>x.id===a2);if(r)copiar(r.txt);copiado(b);return true}
  else if(k==='iadel'){trkSet(id,t=>{if(isObj(t.ia)&&Array.isArray(t.ia[a1]))t.ia[a1]=t.ia[a1].filter(x=>x.id!==a2)})}
  else if(k==='iapeca'){const r=((l.track.ia||{})[a1]||[]).find(x=>x.id===a2),fid=val2('iaf-'+a1)||(r&&r.fid),fr=l.track.frentes.find(x=>x.id===fid);T.iaCanal=a1;T.iaMsg='';T.iaInfo='';
    if(!r||!fr){T.iaMsg='Escolha a frente onde a peça vai ficar.';return trkPaint(),true}
    const per=perF(fr,perSel(l.track)),L=r.acao==='temas'?r.txt.split('\n').map(s=>(s.match(/^\s*(?:[-–•*]|\d+[.)])\s+(.+)/)||[])[1]).filter(Boolean).map(s=>s.trim().slice(0,140)).slice(0,40):[];
    if(r.acao==='temas'&&!L.length){T.iaMsg='Não achei temas em lista (linhas começando com hífen) nesta resposta.';return trkPaint(),true}
    trkSet(id,t=>{t.pecas=t.pecas||[];if(L.length)L.forEach((s,i)=>t.pecas.push({id:uid(),fid:fr.id,per,titulo:s,txt:'',status:'Ideia',data:'',interno:'',geradoEm:today(),t:Date.now()+i}));
      else{const pri=(r.txt.split('\n').find(s=>s.trim())||'').replace(/^[#\s*_-]+|[*_]+$/g,'').trim().slice(0,140);t.pecas.push({id:uid(),fid:fr.id,per,titulo:pri||r.titulo,txt:r.txt,status:'Ideia',data:'',interno:'',geradoEm:today(),t:Date.now()})}});
    T.iaInfo=L.length?L.length+' peça(s) criada(s) em '+frNome(fr)+'. Abra cada uma na Produção e clique em "Desenvolver com IA".':'Peça salva em '+frNome(fr)+' (Produção).'}
  else if(k==='pcbrief'){pecaBriefing(id,arg);return true}
  else if(k==='perfilia'){perfilIA(id);return true}
  else if(k==='perfilbr'){confirma('Recarregar o perfil a partir das respostas do briefing? O que você editou ou a IA organizou será substituído.',()=>{trkSet(id,t=>{t.perfil=perfilDoBriefing(trkL(id))});T.pMsg='Perfil recarregado das respostas do briefing.';T.pAbre=true;trkPaint()},{ok:'Recarregar',titulo:'Recarregar o perfil?',perigo:false});return true}
  else if(k==='verperfil'){T.tab='geral';T.area=null;T.peca=null;T.pAbre=true;trkPaint();setTimeout(()=>{const e=document.getElementById('perfil');if(e)e.scrollIntoView({block:'start'})},30);return true}
  else if(k==='kit'){kitGerar(id,arg);return true}
  else if(k==='kitver'){A.view='';A.sel=id;A.tab=arg==='plano'?'plano':'exec';A.edit=false;admin();return true}
  else if(k==='campnew'){const n=val2('cp_nome');if(!n){T.msg='Dê um nome à campanha.';return trkPaint(),true}
    trkSet(id,t=>t.campanhas.unshift({id:uid(),nome:n.slice(0,120),k:val2('cp_k'),objetivo:val2('cp_obj').slice(0,200),inicio:val2('cp_ini'),fim:val2('cp_fim'),verba:val2('cp_verba').slice(0,60),status:'Planejada',notas:'',exemplos:[]}));T.msg=''}
  else if(k==='campdel'){const cp=l.track.campanhas.find(x=>x.id===arg);if(!cp)return true;
    confirma('Apagar a campanha "'+cp.nome+'" e os exemplos dela? Não dá para desfazer.',()=>{(cp.exemplos||[]).forEach(e=>e.arq&&arqDel('cx:'+e.id));trkSet(id,t=>{t.campanhas=t.campanhas.filter(x=>x.id!==arg)});trkPaint()},{ok:'Apagar',titulo:'Apagar campanha?'});return true}
  else if(k==='cxadd'){const tx=val2('cxx-'+arg);if(!tx)return true;trkSet(id,t=>{const cp=t.campanhas.find(x=>x.id===arg);if(cp)(cp.exemplos=cp.exemplos||[]).push({id:uid(),titulo:val2('cxt-'+arg).slice(0,120),txt:tx.slice(0,20000)})})}
  else if(k==='cxdel'){arqDel('cx:'+a2);trkSet(id,t=>{const cp=t.campanhas.find(x=>x.id===a1);if(cp)cp.exemplos=(cp.exemplos||[]).filter(e=>e.id!==a2)})}
  else if(k==='cxver'){const cp=l.track.campanhas.find(x=>x.id===a1),e=cp&&(cp.exemplos||[]).find(y=>y.id===a2);if(!e||!e.arq)return true;
    arqGet('cx:'+a2).then(bl=>{if(!bl)return aviso('O arquivo não está neste navegador (foi apagado ou veio de outro computador).');const u=URL.createObjectURL(bl);
      if(e.arq.img){const m=dlg('Exemplo','<h3>'+esc(e.titulo||e.arq.nome)+'</h3><img class="u-imgfit" src="'+u+'" alt="'+esc(e.titulo||'Imagem de referência')+'">',{larga:true});setTimeout(()=>URL.revokeObjectURL(u),60000)}
      else{URL.revokeObjectURL(u);dl(e.arq.nome,bl,bl.type)}}).catch(()=>aviso('Não consegui abrir o arquivo.'));return true}
  else if(k==='metaadd'){if(!val2('mr_cus')&&!val2('mr_imp')){T.msg='Preencha ao menos impressões ou valor usado.';return trkPaint(),true}
    trkSet(id,t=>{const r=t.canais.meta.rows;r.push({data:val2('mr_data')||today(),imp:val2('mr_imp'),alcance:val2('mr_alc'),cliques:val2('mr_cli'),res:val2('mr_res'),custo:val2('mr_cus')});r.sort((x,y)=>y.data.localeCompare(x.data))});T.msg=''}
  else if(k==='metadel')trkSet(id,t=>t.canais.meta.rows.splice(+arg,1));
  else if(k==='pauadd'){if(!val2('pa_tit'))return true;trkSet(id,t=>t.canais.press.pautas.unshift({id:uid(),titulo:val2('pa_tit').slice(0,200),veiculo:val2('pa_vei').slice(0,120),data:val2('pa_data'),status:'Ideia',link:''}))}
  else if(k==='paudel')trkSet(id,t=>{t.canais.press.pautas=t.canais.press.pautas.filter(x=>x.id!==arg)});
  else if(k==='vecadd'){if(!val2('ve_nome'))return true;trkSet(id,t=>t.canais.press.veiculos.push({id:uid(),nome:val2('ve_nome').slice(0,120),editoria:val2('ve_ed').slice(0,80),contato:val2('ve_ct').slice(0,160)}))}
  else if(k==='vecdel')trkSet(id,t=>{t.canais.press.veiculos=t.canais.press.veiculos.filter(x=>x.id!==arg)});
  else if(k==='sitekit'){siteNovaVersao(id,l.xsite&&l.xsite.html,'Site gerado no kit');return true}
  else if(k==='sitegen'){if(J.ex.on)return true;const aj=val2('sg-aj').slice(0,600);T.msg='';
    (async()=>{const pr=execGen(id,'site',aj||undefined);trkPaint();const tk=setInterval(()=>{const x=document.querySelector('[data-act="sitegen"]');if(x&&J.ex.on)x.textContent='Gerando o site… '+J.ex.live.length+' caracteres'},1000);
      await pr;clearInterval(tk);const x=trkL(id);if(A.err){T.msg=A.err;A.err='';return trkPaint()}
      if(x&&x.xsite&&x.xsite.html)return siteNovaVersao(id,x.xsite.html,aj?'IA: '+aj.slice(0,80):'Gerado pela IA');T.msg='A IA não devolveu o HTML do site. Tente de novo.';trkPaint()})();return true}
  else if(k==='kitchk'){if(l.xsite&&l.xsite.html)verificaDlg(l.xsite.html,'Verificação do site do kit');return true}
  else if(k==='verprev'||k==='veredit'||k==='verdl'||k==='verchk'){
    arqGet(siteKey(id,arg)).then(html=>{if(typeof html!=='string')return aviso('Esta versão não está neste navegador (foi apagada ou veio de outro computador).');
      if(k==='verchk')return verificaDlg(html,'Verificação da versão de '+fdate(((l.track.canais.site.versoes||[]).find(v=>v.id===arg)||{}).data));
      if(k==='verdl')return dlHtml('site-'+l.nome.replace(/[^\w-]+/g,'-').toLowerCase()+'-'+arg+'.html',html);
      if(k==='verprev'){const m=dlg('Prévia do site','<h3>Prévia do site</h3><p class="hint">Sem recursos de fora (fontes e imagens externas podem não aparecer aqui).</p><iframe class="u-pv" sandbox="allow-scripts" title="Prévia do site"></iframe>',{larga:true});m.querySelector('iframe').srcdoc=html;return}
      const m=dlg('Editar o código do site','<h3>Editar o código do site</h3><p class="hint">Salvar cria uma versão nova. A versão atual continua guardada.</p><label for="vedn">Anotação da mudança</label><input id="vedn" maxlength="200" placeholder="Ex.: troquei o telefone do rodapé"><label for="vedt">Código HTML</label><textarea class="u-code" id="vedt" spellcheck="false"></textarea><div class="row"><button class="btn" id="veds">Salvar como nova versão</button></div>',{larga:true});
      m.querySelector('#vedt').value=html;m.querySelector('#veds').onclick=()=>{const v=m.querySelector('#vedt').value,n=m.querySelector('#vedn').value.trim()||'Edição de '+fdate(today());m.remove();siteNovaVersao(id,v,n)}}).catch(()=>aviso('Não consegui ler esta versão.'));return true}
  else if(k==='veratual')trkSet(id,t=>{(t.canais.site.versoes||[]).forEach(v=>{v.atual=v.id===arg});t.canais.site.publicado=t.canais.site.publicado||today()});
  else if(k==='verdel'){confirma('Apagar esta versão do código? Não dá para desfazer.',()=>{arqDel(siteKey(id,arg));trkSet(id,t=>{t.canais.site.versoes=(t.canais.site.versoes||[]).filter(v=>v.id!==arg)});trkPaint()},{ok:'Apagar',titulo:'Apagar versão?'});return true}
  else if(k==='wamsg'){const tx=waMsg(l,arg);if(tx)abreWa(l,tx);return true}
  else return false;
  trkPaint();return true;
}
function prodBind(el,id){
  const on=(sel,fn)=>el.querySelectorAll(sel).forEach(x=>x.onchange=()=>fn(x));
  on('[data-esc-txt]',x=>trkSet(id,t=>{const it=t.escopo.find(y=>y.id===x.dataset.escTxt);if(it)it.txt=x.value.trim().slice(0,300)}));
  on('[data-esc-fq]',x=>{trkSet(id,t=>{const it=t.escopo.find(y=>y.id===x.dataset.escFq);if(it)it.freq=x.value});trkPaint()});
  on('[data-esc-cont]',x=>trkSet(id,t=>{const it=t.escopo.find(y=>y.id===x.dataset.escCont);if(it)it.conteudo=x.value}));
  on('[data-fr-q]',x=>trkSet(id,t=>{const f=t.frentes.find(y=>y.id===x.dataset.frQ);if(f)f.qtd=Math.max(1,Math.min(60,Math.round(+x.value)||1))}));
  on('[data-fr-p]',x=>trkSet(id,t=>{const f=t.frentes.find(y=>y.id===x.dataset.frP);if(f)f.por=x.value}));
  on('[data-fr-n]',x=>trkSet(id,t=>{const f=t.frentes.find(y=>y.id===x.dataset.frN);if(f)f.nome=x.value.trim().slice(0,80)}));
  on('[data-pc-t]',x=>trkSet(id,t=>{const p=(t.pecas||[]).find(y=>y.id===x.dataset.pcT);if(p)p.titulo=x.value.trim().slice(0,140)}));
  on('[data-pc-x]',x=>trkSet(id,t=>{const p=(t.pecas||[]).find(y=>y.id===x.dataset.pcX);if(p)p.txt=x.value.slice(0,20000)}));
  on('[data-pc-s]',x=>trkSet(id,t=>{const p=(t.pecas||[]).find(y=>y.id===x.dataset.pcS);if(p)p.status=x.value}));
  el.querySelectorAll('[data-f^="perfil."]').forEach(x=>x.onchange=()=>trkSet(id,t=>{setPath(t,x.dataset.f,x.value.slice(0,600));if(isObj(t.perfil))t.perfil.fonte='editado'}));
  on('[data-pc-b]',x=>trkSet(id,t=>{const p=(t.pecas||[]).find(y=>y.id===x.dataset.pcB);if(p)p.briefing=x.value.slice(0,20000)}));
  on('[data-ia-txt]',x=>{const [c,r]=x.dataset.iaTxt.split('|');trkSet(id,t=>{const it=isObj(t.ia)&&Array.isArray(t.ia[c])&&t.ia[c].find(y=>y.id===r);if(it)it.txt=x.value.slice(0,30000)})});
  on('[data-pc-d]',x=>trkSet(id,t=>{const p=(t.pecas||[]).find(y=>y.id===x.dataset.pcD);if(p)p.data=x.value}));
  on('[data-cp]',x=>{const [cid,f]=x.dataset.cp.split('|');trkSet(id,t=>{const cp=t.campanhas.find(y=>y.id===cid);if(cp&&['status','objetivo','inicio','fim','verba','notas'].includes(f))cp[f]=x.value.slice(0,f==='notas'?4000:200)});if(f==='status')trkPaint()});
  on('[data-cx]',x=>{const [cid,eid]=x.dataset.cx.split('|');trkSet(id,t=>{const cp=t.campanhas.find(y=>y.id===cid),e=cp&&(cp.exemplos||[]).find(y=>y.id===eid);if(e)e.txt=x.value.slice(0,20000)})});
  on('[data-pau-st]',x=>trkSet(id,t=>{const p=t.canais.press.pautas.find(y=>y.id===x.dataset.pauSt);if(p)p.status=x.value}));
  on('[data-pau-link]',x=>trkSet(id,t=>{const p=t.canais.press.pautas.find(y=>y.id===x.dataset.pauLink);if(p)p.link=/^https:\/\//i.test(x.value.trim())?x.value.trim().slice(0,400):''}));
  el.querySelectorAll('[data-cxfile]').forEach(f=>f.onchange=async()=>{const file=f.files[0],cid=f.dataset.cxfile;if(!file)return;
    const v=await exValida(file);if(!v.ok){T.msg=v.erro;return trkPaint()}
    const eid=uid();let txt='';
    if(!v.img){try{const r=await cvTexto(file,v.ext);txt=String(r.texto||'').trim().slice(0,20000)}catch(e){txt=''}}
    try{await arqPut('cx:'+eid,v.img?new Blob([file],{type:v.tipo}):file)}catch(e){T.msg='Não consegui guardar o arquivo neste navegador.';return trkPaint()}
    trkSet(id,t=>{const cp=t.campanhas.find(y=>y.id===cid);if(cp)(cp.exemplos=cp.exemplos||[]).push({id:eid,titulo:file.name.replace(/\.[^.]+$/,'').slice(0,120),txt,arq:{nome:file.name.slice(0,120),tam:file.size,img:!!v.img}})});
    T.msg=v.img?'Imagem guardada. Escreva no texto do exemplo o que ela tem de bom, para a IA usar.':txt?'Arquivo guardado e texto lido para a IA.':'Arquivo guardado, mas não consegui ler o texto dele. Cole o texto no exemplo.';trkPaint()});
  const mc=document.getElementById('metacsv');if(mc)mc.onchange=async()=>{const file=mc.files[0];if(!file)return;const r=metaFromCsv(await file.text());
    if(r.erro||!r.rows.length){T.msg=r.erro||'O arquivo não trouxe linhas com números.';return trkPaint()}
    trkSet(id,t=>{const c=t.canais.meta;r.rows.forEach(x=>{const i=c.rows.findIndex(y=>y.data===x.data);if(i>=0)c.rows[i]=x;else c.rows.push(x)});c.rows.sort((a,b)=>b.data.localeCompare(a.data));if(c.situacao==='Planejado')c.situacao='Rodando'});
    T.msg=r.rows.length+' linha(s) importada(s).'+(r.dated?'':' O arquivo não tinha datas por dia, então entrou como um único total de hoje.');trkPaint()};
  const sh=document.getElementById('sitehtml');if(sh)sh.onchange=async()=>{const file=sh.files[0];if(!file)return;
    if(file.size>HTML_MAX){T.msg='O arquivo passa de 5 MB.';return trkPaint()}
    let txt='';try{txt=new TextDecoder('utf-8',{fatal:true}).decode(await file.arrayBuffer())}catch(e){T.msg='O arquivo precisa ser HTML em UTF-8.';return trkPaint()}
    if(!/<html|<!doctype|<body/i.test(txt)){T.msg='O arquivo não parece ser uma página HTML.';return trkPaint()}
    siteNovaVersao(id,txt,'Importado: '+file.name.slice(0,80))};
  lpBind();
  reaArteBind(el,id);
  el.querySelectorAll('[data-thumb]').forEach(img=>arqGet(img.dataset.thumb).then(bl=>{if(bl&&img.isConnected){img.src=URL.createObjectURL(bl);img.onload=()=>URL.revokeObjectURL(img.src)}}).catch(()=>{}));
}

/* ---------- confirmação da contratação: leva o lead para o acompanhamento ---------- */
function fecharDlg(id){
  const l=trkL(id);if(!l)return;
  const tot=pk=>{if(!['basico','medio','max'].includes(pk))return '';try{const t=calcOrc(l).tiers[pk];return t?[t.setupF?rs(t.setupF)+' de implantação':'',t.mensalF?rs(t.mensalF)+'/mês':''].filter(Boolean).join(' + ')+(t.ap?' (a partir de)':''):''}catch(e){return ''}};
  const pk0=l.plano||(l.track&&PK_DE_NOME[l.track.pacote])||'';
  const m=dlg('Confirmar contratação',`<h3>Confirmar contratação</h3><p class="hint">${esc(l.nome)} · ${esc(svcName(l))}</p>
  <label for="fc-pk">Pacote contratado</label><select id="fc-pk">${[['','Escolha o pacote'],['basico','Essencial'],['medio','Crescimento'],['max','Completo'],['outro','Outro (fora da tabela)']].map(([k,n])=>`<option value="${k}" ${k===pk0?'selected':''}>${n}</option>`).join('')}</select>
  <label for="fc-v">Valor combinado</label><input id="fc-v" maxlength="120" value="${esc((l.track&&l.track.valor)||tot(pk0))}"><p class="hint">Vem da tabela de preços. Mude se combinou outro valor com o cliente. A verba de anúncios não entra aqui: é paga pelo cliente à plataforma.</p>
  <div class="fr"><div><label for="fc-i">Início</label><input id="fc-i" type="date" value="${esc((l.track&&l.track.start)||today())}"></div><div><label for="fc-c">Dia da cobrança</label><input id="fc-c" type="number" min="1" max="31" value="${esc((l.track&&l.track.cobranca)||'')}"></div></div>
  <p class="hint">Ao confirmar, o cliente passa para "em execução" e as entregas do pacote entram em "O que vamos fazer".</p><p class="u-err hint" id="fc-e" role="alert"></p>
  <div class="row"><button type="button" class="btn hl" id="fc-ok">Confirmar e ir para o acompanhamento</button><button type="button" class="btn ghost" id="fc-n">Cancelar</button></div>`);
  const q=s=>m.querySelector(s);let mexeu=false;
  q('#fc-v').oninput=()=>{mexeu=true};
  q('#fc-pk').onchange=()=>{q('#fc-e').textContent='';if(!mexeu)q('#fc-v').value=tot(q('#fc-pk').value)};
  q('#fc-n').onclick=()=>m.remove();
  q('#fc-ok').onclick=()=>{
    const pk=q('#fc-pk').value,ini=q('#fc-i').value||today(),cob=q('#fc-c').value.trim();
    if(!pk){q('#fc-e').textContent='Escolha o pacote contratado.';return q('#fc-pk').focus()}
    if(cob&&!(+cob>=1&&+cob<=31)){q('#fc-e').textContent='O dia da cobrança vai de 1 a 31.';return q('#fc-c').focus()}
    const atual=trkL(id);if(!atual)return m.remove();
    if(pk!=='outro'&&pk!==atual.plano){const em=new Date().toISOString();upd(id,{plano:pk,planoEm:em,planoHist:[...(atual.planoHist||[]),{plano:pk,em}].slice(-20)})}
    const l2=trkL(id),novo=!l2.track,tr=novo?trkNew(l2):l2.track,pacote=pk==='outro'?'Outro':PLANO_NOME[pk];
    if(novo&&ini!==tr.start){const d=Math.round((new Date(ini+'T12:00:00')-new Date(tr.start+'T12:00:00'))/864e5);tr.tarefas.forEach(x=>{x.due=addDays(x.due,d)});tr.start=ini}
    const trocou=tr.pacote!==pacote;
    Object.assign(tr,{pacote,valor:q('#fc-v').value.trim().slice(0,120),cobranca:cob,start:ini});
    if(pk==='outro'&&novo){const r=frentesDe(l2,'');tr.frentes=r.frentes;tr.redes=r.redes;tr.escopo=[]}
    else if(!novo&&trocou&&!(tr.pecas||[]).length){const r=frentesDe(l2,pk==='outro'?'':pk);tr.frentes=r.frentes;tr.redes=r.redes;tr.escopo=r.resto}
    (tr.diario=tr.diario||[]).push({id:uid(),data:today(),txt:'Contratação confirmada: pacote '+pacote+(tr.valor?', '+tr.valor:'')+'.'});
    upd(id,{status:'aplicado',track:tr});m.remove();
    A.view='trk';T.id=id;T.tab='escopo';T.area=null;T.peca=null;T.cic=null;T.msg='';admin();
  };
}
