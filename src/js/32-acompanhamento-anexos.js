/* Acompanhamento, parte 2: o que vamos fazer (escopo do pacote), produção por ciclo (semana ou mês) com IA,
   campanhas com exemplos para a IA, Meta Ads, assessoria de imprensa, versões do código do site e mensagens prontas.
   Tudo fica neste navegador. Arquivos (exemplos e versões do site) ficam no IndexedDB "or-arquivos" e NÃO entram no backup. */

const arqTx=(modo,fn)=>idbTx('or-arquivos','f',modo,fn);
const arqPut=(k,v)=>arqTx('readwrite',s=>s.put(v,k));
const arqGet=k=>arqTx('readonly',s=>s.get(k));
const arqDel=k=>arqTx('readwrite',s=>s.delete(k)).catch(()=>{});
const arqDelPref=p=>arqTx('readwrite',s=>{const c=s.openCursor();c.onsuccess=()=>{const x=c.result;if(!x)return;if(String(x.key).startsWith(p))x.delete();x.continue()};return null}).catch(()=>{});
