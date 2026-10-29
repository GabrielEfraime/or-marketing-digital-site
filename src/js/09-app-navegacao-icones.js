let V='pub';
function nav(v){V=v;render()}
function render(){document.body.className=V==='admin'?'adm':'pub';window.scrollTo(0,0);V==='admin'?admin():pub()}

addEventListener('scroll',()=>{const n=document.querySelector('.nav'),t=document.getElementById('totop');if(n)n.classList.toggle('scr',scrollY>16);if(t)t.classList.toggle('on',scrollY>500)},{passive:true});
const SEED=2,MINAI=4,MAXAI=7;
const P={mod:null,mods:[],who:null,done:null,qa:[],cur:null,fail:false,aiDone:false,skip:false,ctl:null,skipTp:new Set()};
const maxAI=()=>P.mod==='guia'?9:99;
const logo=`<img class="vlogo" src="${VMARK}" alt="" aria-hidden="true">`;
const ICON={ads:'<svg viewBox="0 0 24 24"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>',
 meta:'<svg viewBox="0 0 24 24"><path d="M3 11v2a1 1 0 001 1h2l5 4V6L6 10H4a1 1 0 00-1 1z"/><path d="M15.5 8.5a5 5 0 010 7M18.5 6a9 9 0 010 12"/></svg>',
 social:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4z"/></svg>',
 youtube:'<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="M10 9l5 3-5 3z"/></svg>',
 local:'<svg viewBox="0 0 24 24"><path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
 press:'<svg viewBox="0 0 24 24"><rect x="3" y="4" width="15" height="16" rx="2"/><path d="M18 8h3v10a2 2 0 01-2 2M7 8h7M7 12h7M7 16h4"/></svg>',
 brand:'<svg viewBox="0 0 24 24"><path d="M12 19l7-7-3-3-7 7-1 4z"/><path d="M15 6l3 3M5 21h4"/></svg>',
 guia:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M16 8l-2 6-6 2 2-6z"/></svg>',
 site:'<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
 resite:'<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 0115-6.7L21 8M21 3v5h-5M21 12a9 9 0 01-15 6.7L3 16M3 21v-5h5"/></svg>'};