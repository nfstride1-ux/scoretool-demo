/* Tester profiles. Each tester's data lives in its own localStorage key so testing never mixes.
   Nathe keeps the original key. Every tester with data:true gets his own real official results history (data/sheets_<id>.json,
   data/ad_<id>.json, built from scores.db); bow = the only bow that feeds his stats (other bows are kept in the file, left out).
   ad = the archer's name in the official results when it differs. data:false = no confirmed official results match yet, so the profile starts empty.
   Names only, no contact details. Real names show in personal places (sign-in, home, Me, score sheets, coach summary, parent and
   coach links, suggestions); social and competitive views (h2h, match night, squad, league, badges, share images) show the
   tester's chosen nickname instead (names.js). junior:true = under 16. */
const TESTERS=[{id:'nathe',name:'Nathaniel Stride',short:'Nathe',bow:'Compound',data:true},
 {id:'phill',name:'Phill Arthur',short:'Phill',ad:'George Philip Arthur',bow:'Compound',data:true},
 {id:'logan',name:'Logan Wolfe',short:'Logan',bow:'Compound',data:true,junior:true},
 {id:'steven',name:'Steven Snook',short:'Steven',bow:'Compound',data:true},
 {id:'joseph',name:'Joseph Snook',short:'Joseph',bow:'Compound',data:true,junior:true},
 {id:'michael',name:'Michael Choong',short:'Michael',bow:'Compound',data:true},
 /* Dana: listed as 'Dana Matete' in Phil's group; The official results list him as Dana Chapman-Bureny (Gosnells, male, compound, member 32545), the only Dana at Gosnells. */
 {id:'dana',name:'Dana Chapman-Bureny',short:'Dana',bow:'Compound',data:true},
 {id:'tahuri',name:'Tahuri Burney',short:'Tahuri',ad:'Tahuri Engelen-Burney',bow:'Compound',data:true,junior:true},
 /* Estiaan Cronje (Gosnells, member 19190, Open compound): added 20 Oct 2026. He stopped shooting; history = the 6 months before his last recorded shoot (16 Feb to 16 Aug 2025). */
 {id:'estiaan',name:'Estiaan Cronje',short:'Estiaan',bow:'Compound',data:true},
 /* Nate Evans (Kalamunda, member 20536): confirmed tester 18 Oct 2026. His scores were removed from scores.db at his earlier request, so his profile stays empty until they are pulled again. */
 {id:'nate',name:'Nate Evans',short:'Nate',bow:'Compound',data:false},
 /* Darnie (20 Oct 2026, Nathe): an archer who is NOT a tester. He can be scored, picked in matches, match nights, leagues and groups,
    and has his own link (?tester=darnie), but he isn't in the testers squad and gets no tester suggestion prompts.
    21 Oct 2026: The official results list him as Danie Oosthuizen (Whiteman Park Archers WA, member 8704, compound, Open and 50+), NOT
    Danie-Louis Oosthuizen (same club). History = his full official compound history, 2015 to 2026 (501 scoresheets, same load
    as Estiaan, Nathe 21 Oct 2026). His crawl stays paused in the scores database; this file is a one-off load. 22 Oct 2026 (Nathe): shown as Danie everywhere; id, link and stored data stay 'darnie'. */
 {id:'darnie',name:'Danie Oosthuizen',short:'Danie',bow:'Compound',data:true,guest:true}];
const isGuest=t=>!!(t&&t.guest);window.isGuest=isGuest;
const TESTER=(function(){const q=new URLSearchParams(location.search).get('tester');let id=(q||'').toLowerCase();
 if(id=='nathan'||id=='nathaniel')id='nathe';if(id=='phil')id='phill';
 if(TESTERS.some(t=>t.id==id))localStorage.setItem('scoretool.tester',id);else id=localStorage.getItem('scoretool.tester');
 return TESTERS.find(t=>t.id==id)||null})();
/* ---- Admin view (26 Oct 2026, Nathe) ----
   When Nathe switches to another tester he is only LOOKING. 'scoretool.adminReturn'='nathe' remembers who he really is, so the switcher and a
   'Viewing as <name> - Back to my profile' bar stay on every screen (lab.js). It is written only by the picker when the admin switches (or once, on
   a phone that already holds Nathe's own profile, so a switch made before this update can still be undone). Normal testers never get it.
   While it is set the viewed tester's saved data is READ ONLY: every localStorage write (except this flag, the tester choice and the theme),
   every network POST and every IndexedDB write is blocked and logged in window.__avBlocked. ?tester=nathe always switches back and clears it. */
const ADMIN_KEY='scoretool.adminReturn';
(function(){try{const cur=TESTER&&TESTER.id;
 if(cur=='nathe'){if(localStorage.getItem(ADMIN_KEY))localStorage.removeItem(ADMIN_KEY)}
 else if(cur&&!localStorage.getItem(ADMIN_KEY)){const n=JSON.parse(localStorage.getItem('scoretool.v1')||'null');if(n&&/^Nathaniel Stride/i.test(n.profile||''))localStorage.setItem(ADMIN_KEY,'nathe')}
 window.ADMIN_VIEW=!!(cur&&cur!='nathe'&&localStorage.getItem(ADMIN_KEY)=='nathe')}catch(e){window.ADMIN_VIEW=false}
 if(!window.ADMIN_VIEW)return;
 const LS=window.localStorage,P=Storage.prototype,_set=P.setItem,_rm=P.removeItem,_clr=P.clear,OK=new Set([ADMIN_KEY,'scoretool.tester','scoretool.theme']);
 window.__avBlocked=[];let gest=0;['pointerdown','keydown','click','touchstart'].forEach(e=>addEventListener(e,()=>{gest=Date.now()},true));
 const who=()=>TESTER.short;
 window.avNotice=function(){const el=document.getElementById('avtoast')||(()=>{const d=document.createElement('div');d.id='avtoast';d.setAttribute('role','alert');document.body.appendChild(d);return d})();
  el.textContent="You are viewing "+who()+"'s profile; this would change "+who()+"'s data, so it was not saved. Tap Back to my profile at the top to use your own.";
  el.classList.add('on');clearTimeout(window.__avT);window.__avT=setTimeout(()=>el.classList.remove('on'),6000)};
 const block=(kind,k)=>{window.__avBlocked.push(kind+':'+k);if(Date.now()-gest<2500)window.avNotice()};
 P.setItem=function(k,v){if(this!==LS||OK.has(String(k)))return _set.call(this,k,v);block('set',k)};
 P.removeItem=function(k){if(this!==LS||OK.has(String(k)))return _rm.call(this,k);block('remove',k)};
 P.clear=function(){if(this!==LS)return _clr.call(this);block('clear','*')};
 const _f=window.fetch;if(_f)window.fetch=function(i,o){const m=String((o&&o.method)||(i&&i.method)||'GET').toUpperCase();
  if(m!='GET'&&m!='HEAD'){block('net-'+m,String(i&&i.url||i).replace(/\?.*$/,''));return Promise.reject(new TypeError('Blocked: viewing another profile (read only)'))}return _f.apply(this,arguments)};
 if(window.IDBObjectStore)['put','add','delete','clear'].forEach(m=>{const f=IDBObjectStore.prototype[m];IDBObjectStore.prototype[m]=function(){block('idb-'+m,this.name);throw new DOMException('Viewing another profile (read only)','ReadOnlyError')}});
})();
function setTester(id){const was=TESTER&&TESTER.id;
 /* 26 Oct 2026: the admin remembers who he really is. Only the real owner (Nathe, or while he is already viewing as another tester) can set it; picking Nathe again clears it. */
 try{if(id=='nathe')localStorage.removeItem(ADMIN_KEY);else if(was=='nathe'||window.ADMIN_VIEW)localStorage.setItem(ADMIN_KEY,'nathe')}catch(e){}
 localStorage.setItem('scoretool.tester',id);const u=new URL(location.href);u.searchParams.delete('tester');u.hash='';location.href=u.toString()}
function testerLink(id){return location.origin+location.pathname+'?tester='+id}
function testerPicker(){return`<div class="card dark"><span class="kicker">Tester sign-in</span><h1>Who's testing?</h1><p>Pick your name. Your scores are saved on this phone, separate from the other testers.</p>
${TESTERS.map(t=>`<button class="btn full" style="margin:8px 0" data-tester="${t.id}">${t.name}</button>`).join('')}<p class="small muted">You can change this later in Me.</p></div>`}
function bindTesterPicker(root){(root||document).querySelectorAll('[data-tester]').forEach(b=>b.onclick=()=>setTester(b.dataset.tester))}
function testerCard(){return`<div class="card"><span class="kicker">Tester</span><h2>Testing as ${TESTER?TESTER.name:'nobody'}</h2><p class="small muted">${TESTER&&TESTER.id=='nathe'?"Each tester's data is kept separate on this phone.":'Your scores are kept separate on this phone.'}</p>
<div class="row" style="gap:6px;flex-wrap:wrap;justify-content:flex-start">${TESTER&&(TESTER.id=='nathe'||window.ADMIN_VIEW)?TESTERS.filter(t=>t.id!=TESTER.id).map(t=>`<button class="btn ghost" data-tester="${t.id}">Switch to ${t.short}</button>`).join(''):''}</div></div>`}
