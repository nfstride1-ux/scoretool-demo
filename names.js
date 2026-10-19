/* Display names (20 Oct 2026). Each tester picks their own nickname; it is the ONLY name the app shows anywhere.
   Real names in TESTERS stay internal (they match Archer's Diary data and squad/league keys) and never render; ids stay internal.
   A tester with no name yet shows as 'Tester 1', 'Tester 2'... (position in TESTERS), never the real name.
   Sync (no server): each phone posts {k:'nm',id,n,nt} (id + name + time chosen, nothing else) to the public ntfy.sh topic
   H2H_NS+'-names' and polls it at the head-to-head invite cadence (every 4th 8 s tick, ~32 s, while open). Names are cached
   on the phone. ntfy keeps messages 12 h, so a phone re-posts its own name when its last post is over 6 h old.
   Invites and match state also carry the sender's name (nm, nt), so a match works even if the directory poll lags.
   Uniqueness: checked against the cache when picking, then re-checked on every poll; on a clash the earlier pick keeps the
   name, the later picker is asked to choose another and shows as 'Tester N' on other phones until they do.
   Safety net: any tester real name (and its known variants) that still reaches the page is swapped for the display name. */
const NM_DIR='scoretool.names',NM_SINCE='scoretool.names.since',nmOwnKey=id=>'scoretool.dname.'+id,nmAskKey=id=>'scoretool.dname.asked.'+id,nmPostKey=id=>'scoretool.dname.posted.'+id;
const NM_HINT='Pick a nickname, not your full real name.';
const NM_VARIANTS={phill:['Phil Arthur'],joseph:['Joe Snook'],dana:['Dana Matete'],tahuri:['Tahuri Engelen-Burney','Tahuri Burney','Tahuri Engelen']};
/* small built-in rude list. SUB: blocked anywhere in the name. WORD: blocked as a whole word (so Cassie, Grape, Hitchcock are fine). */
const NM_SUB=['fuck','fuk','fck','shit','cunt','bitch','wank','twat','slut','whore','nigg','faggot','bastard','bollock','asshole','arsehole','penis','vagina','porn','dildo','retard','spastic','motherf','jizz','boner'];
const NM_WORD=['ass','arse','asses','dick','dicks','cock','cocks','tit','tits','piss','rape','sex','sexy','hoe','hoes','nazi','crap','kys','poo','fag','fags','cum','prick','knob','bum'];
const nmClean=s=>String(s==null?'':s).trim().replace(/\s+/g,' ');
const nmFold=s=>String(s).toLowerCase().replace(/0/g,'o').replace(/[1!|]/g,'i').replace(/3/g,'e').replace(/[@4]/g,'a').replace(/[$5]/g,'s').replace(/7/g,'t');
function nmRude(s){const f=nmFold(s),flat=f.replace(/[^a-z]/g,''),squash=flat.replace(/(.)\1+/g,'$1'),toks=f.split(/[^a-z]+/).filter(Boolean);
 /* also treat a lone 1/l as either letter: 'sh1t' and 'shlt' */
 const flatI=flat.replace(/l/g,'i');
 return NM_SUB.some(w=>flat.includes(w)||squash.includes(w)||flatI.includes(w))||toks.some(t=>NM_WORD.includes(t)||NM_WORD.includes(t.replace(/(.)\1+/g,'$1')))||NM_WORD.includes(flat)}
/* surnames (and full names) of every tester: a nickname must not contain them */
const NM_REAL=(()=>{const S1=new Set(),F=[];TESTERS.forEach(t=>{[t.name,t.ad,...(NM_VARIANTS[t.id]||[])].filter(Boolean).forEach(n=>{F.push([t.id,n]);n.split(/\s+/).slice(1).join(' ').split(/[\s-]+/).filter(x=>x.length>2).forEach(x=>S1.add(x.toLowerCase()))})});return{sur:[...S1],full:F}})();
function nmDir(){try{return JSON.parse(localStorage.getItem(NM_DIR)||'{}')||{}}catch(e){return{}}}
function nmSaveDir(D){try{localStorage.setItem(NM_DIR,JSON.stringify(D))}catch(e){}}
const nmOwn=id=>{try{const j=JSON.parse(localStorage.getItem(nmOwnKey(id))||'null');return j&&j.n?j:null}catch(e){return null}};
const nmIdx=id=>TESTERS.findIndex(t=>t.id==id);
const nmNeutral=id=>{const i=nmIdx(id);return i<0?'Tester':'Tester '+(i+1)};
/* Rule check. Returns {ok,n,msg}. selfId is skipped for the uniqueness check; pass uniq=false to check format/rude only. */
function nmCheck(raw,selfId,uniq=true){const n=nmClean(raw);
 if(n.length<2)return{ok:false,n,msg:'Use at least 2 characters.'};
 if(n.length>16)return{ok:false,n,msg:'Use 16 characters or fewer.'};
 if(!/^[A-Za-z0-9 _-]+$/.test(n))return{ok:false,n,msg:'Use letters, numbers, spaces, - and _ only.'};
 if(nmRude(n))return{ok:false,n,msg:'Please pick a different name.'};
 const lo=n.toLowerCase(),toks=lo.split(/[\s_-]+/);
 if(NM_REAL.sur.some(s=>toks.includes(s)||lo.replace(/[\s_-]/g,'').includes(s.replace(/[\s_-]/g,'')))||NM_REAL.full.some(([,f])=>f.toLowerCase()==lo))return{ok:false,n,msg:NM_HINT};
 if(/^tester\s*\d*$/i.test(n))return{ok:false,n,msg:'Pick a name of your own.'};
 if(uniq){const D=nmDir();if(Object.entries(D).some(([id,e])=>id!=selfId&&e&&String(e.n).toLowerCase()==lo))return{ok:false,n,msg:'Another tester already has that name.'}}
 return{ok:true,n,msg:''}}
/* who owns each name: earliest pick wins (tie: TESTERS order) */
function nmOwners(D){const O={};Object.entries(D).forEach(([id,e])=>{if(!e||!e.n)return;const k=String(e.n).toLowerCase(),o=O[k];
 if(!o||e.nt<o.nt||(e.nt==o.nt&&nmIdx(id)<nmIdx(o.id)))O[k]={id,nt:e.nt}});return O}
function nmClash(id){const D=nmDir(),e=D[id];if(!e||!e.n)return false;const o=nmOwners(D)[String(e.n).toLowerCase()];return!!(o&&o.id!=id)}
/* learn a name from the relay (directory, invite or match state) */
function nmLearn(id,n,nt){if(!id||nmIdx(id)<0||typeof n!='string')return false;const me=TESTER&&TESTER.id;if(id==me)return false;
 const c=nmCheck(n,id,false);if(!c.ok)return false;const D=nmDir(),e=D[id];nt=+nt||0;
 if(e&&e.n==c.n&&(e.nt||0)<=nt)return false;if(e&&(e.nt||0)>nt&&e.n!=c.n)return false;
 D[id]={n:c.n,nt};nmSaveDir(D);return true}
/* --- what the app shows --- */
function testerName(id){const me=TESTER&&TESTER.id,o=id?nmOwn(id):null;if(id&&id==me)return o?o.n:nmNeutral(id);
 const e=nmDir()[id];if(e&&e.n&&nmCheck(e.n,id,false).ok&&!nmClash(id))return e.n;
 /* a name picked on this same phone (another tester profile) */if(o&&nmCheck(o.n,id,false).ok&&!(e&&e.n))return o.n;return nmNeutral(id)}
const myName=()=>TESTER?testerName(TESTER.id):'You';
const nmEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
/* every real-name variant -> tester id, longest first so 'Tahuri Engelen-Burney' beats 'Tahuri Engelen' */
const NM_VAR=(()=>{const L=[];NM_REAL.full.forEach(([id,n])=>{L.push([id,n]);const p=n.split(/\s+/);if(p.length>1){L.push([id,p[0]+' '+p[p.length-1][0]+'.']);L.push([id,p[0]+' '+p[1][0]+'.'])}});
 const seen=new Set();return L.filter(([i,n])=>{const k=n.toLowerCase();if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>b[1].length-a[1].length)})();
const NM_RX=new RegExp('('+NM_VAR.map(([,n])=>nmEsc(n)).join('|')+')(?![A-Za-z])','gi');
const nmIdOf=s=>{const k=String(s||'').trim().toLowerCase();const v=NM_VAR.find(([,n])=>n.toLowerCase()==k);return v?v[0]:null};
/* map a stored name (S.profile, squad member, coach...) to the name to show */
function dispName(s){if(s==null)return s;const id=nmIdOf(s);if(id)return testerName(id);if(typeof S!='undefined'&&S&&s==S.profile)return myName();return s}
function nmScrub(t){if(!t||typeof t!='string')return t;NM_RX.lastIndex=0;if(!NM_RX.test(t))return t;NM_RX.lastIndex=0;return t.replace(NM_RX,m=>testerName(nmIdOf(m)))}
window.dispName=dispName;window.testerName=testerName;window.myName=myName;window.nmScrub=nmScrub;window.nmCheck=nmCheck;
/* --- relay sync --- */
const NM_TOPIC=()=>H2H_NS+'-names';
async function nmPublish(force){if(!TESTER)return;const o=nmOwn(TESTER.id);if(!o)return;const last=+localStorage.getItem(nmPostKey(TESTER.id))||0;
 if(!force&&Date.now()-last<6*36e5)return;if(await h2hPost(NM_TOPIC(),{k:'nm',id:TESTER.id,n:o.n,nt:o.nt,t:Date.now()}))localStorage.setItem(nmPostKey(TESTER.id),String(Date.now()))}
let nmBusy=false;
async function nmSync(){if(nmBusy)return false;nmBusy=true;let ch=false;try{const before=TESTER&&nmClash(TESTER.id);
 const L=await h2hPoll(NM_TOPIC(),localStorage.getItem(NM_SINCE));if(L&&L.length){L.forEach(d=>{localStorage.setItem(NM_SINCE,d._id);if(d.k=='nm'&&nmLearn(d.id,d.n,d.nt))ch=true})}
 await nmPublish(false);if(TESTER&&nmClash(TESTER.id)&&!before)ch=true}finally{nmBusy=false}
 if(ch&&typeof render=='function'&&!(document.activeElement&&/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName))&&!(typeof cur!='undefined'&&cur&&typeof view!='undefined'&&view=='score'))render();return ch}
window.nmSync=nmSync;
/* my own name: save locally, put me in my own cache (so uniqueness is checked the same way everywhere), post it */
function nmSetMine(n){const id=TESTER.id,o={n,nt:Date.now()};localStorage.setItem(nmOwnKey(id),JSON.stringify(o));localStorage.setItem(nmAskKey(id),'1');
 const D=nmDir();D[id]=o;nmSaveDir(D);nmPublish(true)}
(function(){if(!TESTER)return;const o=nmOwn(TESTER.id);if(o){const D=nmDir();if(!D[TESTER.id]||D[TESTER.id].n!=o.n){D[TESTER.id]=o;nmSaveDir(D)}}})();
/* --- screens --- */
function nmForm(id,cta){const o=TESTER&&nmOwn(TESTER.id);return`<label for="${id}">Display name</label><input id="${id}" maxlength="16" autocomplete="off" autocapitalize="words" value="${o?esc(o.n):''}" placeholder="e.g. Arrowhead_7">
 <p class="small muted" style="margin:4px 0">${NM_HINT} 2 to 16 letters, numbers, spaces, - or _. Other testers see only this name.</p><p class="small" id="${id}err" role="alert" style="margin:4px 0;font-weight:600"></p><button class="btn alt full" id="${id}go">${cta}</button>`}
function nmBindForm(id,done){const go=$('#'+id+'go'),inp=$('#'+id);if(!go)return;const sub=()=>{const c=nmCheck(inp.value,TESTER.id);if(!c.ok){$('#'+id+'err').textContent='⚠ '+c.msg;return}nmSetMine(c.n);done()};
 go.onclick=sub;inp.onkeydown=e=>{if(e.key=='Enter')sub()}}
function nmNeedPrompt(){if(!TESTER)return false;if(nmClash(TESTER.id))return true;return!nmOwn(TESTER.id)&&!localStorage.getItem(nmAskKey(TESTER.id))}
function nmScreen(){const clash=nmClash(TESTER.id);$('#tabs').hidden=true;
 app.innerHTML=`<div class="card dark" id="nmscreen"><span class="kicker">Welcome</span><h1>${clash?'Pick another name':'Choose your display name'}</h1>
 <p class="small">${clash?'Another tester picked that name first. Choose a different one.':'This is the name other testers see in matches, squads and leagues.'}</p>${nmForm('nmin','Save name')}
 ${clash?'':'<button class="btn ghost full" id="nmlater" style="margin-top:6px">Not now</button><p class="small muted">Until you pick one you show as '+esc(nmNeutral(TESTER.id))+'. You can set it any time in Me.</p>'}</div>`;
 nmBindForm('nmin',()=>{$('#tabs').hidden=false;nav('home')});const l=$('#nmlater');if(l)l.onclick=()=>{localStorage.setItem(nmAskKey(TESTER.id),'1');$('#tabs').hidden=false;nav('home')}}
const _nmRender=render;render=function(){if(TESTER&&S.unlocked&&S.profile&&!/^#(share|coach)=/.test(location.hash)&&nmNeedPrompt())return nmScreen();return _nmRender()};
const _nmMe=me;me=function(){_nmMe();const c=document.createElement('div');c.className='card';c.id='nmcard';
 c.innerHTML=`<span class="kicker">Display name</span><h2>${esc(myName())}</h2>${nmForm('nmme','Save display name')}`;app.prepend(c);
 nmBindForm('nmme',()=>me())};
/* safety net: scrub real names from text and visible attributes as the page changes (never touches data-* attributes) */
(function(){const A=['value','title','aria-label','placeholder','alt','content'];
 const fix=root=>{if(root.nodeType==3){const v=nmScrub(root.data);if(v!==root.data)root.data=v;return}if(root.nodeType!=1)return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT);let n=root;
  do{if(n.nodeType==3){if(n.parentNode&&/^(SCRIPT|STYLE)$/.test(n.parentNode.nodeName))continue;const v=nmScrub(n.data);if(v!==n.data)n.data=v}
   else for(const a of A)if(n.hasAttribute&&n.hasAttribute(a)){const o=n.getAttribute(a),v=nmScrub(o);if(v!==o){n.setAttribute(a,v);if(a=='value'&&'value'in n)n.value=v}}}while((n=w.nextNode()))};
 const go=()=>{fix(document.body);document.title=nmScrub(document.title)};
 new MutationObserver(M=>{for(const m of M){if(m.type=='characterData')fix(m.target);else if(m.type=='attributes')fix(m.target);else m.addedNodes.forEach(fix)}})
  .observe(document.documentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:A});
 if(document.body)go();else addEventListener('DOMContentLoaded',go)})();
