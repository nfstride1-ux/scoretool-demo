/* ABA 3D scoring (Australian Bowhunters Association).
   Ground truth: the ABA INTERCLUB Official Score Sheet (Western Australia ABA): 40 targets = a 3-arrow half ('3A', targets 1-20,
   up to 3 arrows, first hit scores) + a 1-arrow half ('1A', targets 1-20, first arrow only). Points: arrow 1 A/B/C 20/18/16,
   arrow 2 14/12/10, arrow 3 8/6/4. Matches ABA National Rules consolidated 1 Jan 2026 v2, National 3D Round rules 7-9 (round = 20 targets;
   3-arrow, 2-arrow and 1-arrow rounds; first arrow to score; grading score = a 3-arrow round + a 1-arrow round). Distances are unmarked. */
(function(){
const PTS=[[20,18,16],[14,12,10],[8,6,4]],ZN=['A','B','C'],ZL={A:'Kill',B:'Vital',C:'Wound'};
/* One ABA round in the picker: the Interclub sheet. First half = 3-arrow half (targets 1-20, first arrow to hit scores),
   second half = 1-arrow half (its own targets 1-20, one arrow, a miss scores 0). Checked against Nathe's sheet photo (3A columns on the left,
   then 1A; '3 Arrow Total' then '1 Arrow total') and ABA rule 7(a)1 ('a 3 arrow and one arrow round'). 20 points max per target, 800 per round. */
const IC='ABA Interclub 3D (40 targets: 3-arrow half, then 1-arrow half)',IC_OLD='ABA Interclub (3A + 1A, 40 targets)';
ROUNDS[IC]={ends:40,ape:1,face:'ABA 3D animal',max:800,aba:3,halves:[{n:3,t:20,l:'3A',name:'3-arrow half',desc:'up to 3 arrows a target: the first arrow to hit scores'},{n:1,t:20,l:'1A',name:'1-arrow half',desc:'one arrow a target: a miss scores 0'}],practice:true};
window.ABA_IC=IC;
/* old names stay defined so any old session still opens, but they are hidden from the round picker */
ROUNDS[IC_OLD]={...ROUNDS[IC],legacy:true};
[[3,'3 arrow'],[2,'2 arrow'],[1,'1 arrow']].forEach(([n,l])=>{ROUNDS['ABA 3D · '+l+' (20 targets)']={ends:20,ape:1,face:'ABA 3D animal',max:400,aba:n,halves:[{n,t:20,l:n+'A',name:n+'-arrow round',desc:n>1?'up to '+n+' arrows a target: the first arrow to hit scores':'one arrow a target: a miss scores 0'}],practice:true,legacy:true}});
const hitCode=a=>a&&a.k?a.k+(a.z||''):'M';window.abaHitCode=hitCode;
function migrate(){let ch=0;(S.sessions||[]).forEach(x=>{if(x.round==IC_OLD){x.round=IC;ch=1}if(x.id=='aba20250517'&&/3A running total/.test(x.abaNote||'')){x.abaNote=NOTE;ch=1}});if(S.lastRound==IC_OLD){S.lastRound=IC;ch=1}if(ch)save()}
const isAba=r=>!!(ROUNDS[r]&&ROUNDS[r].aba);window.isAbaRound=isAba;
const escA=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
/* which half a round-target index (0-based) is in: {h, n arrows, tn target number in half, start index} */
/* club rule (start-of-round tick): the first half is shot 1-arrow too, so both halves are 1-arrow */
const CLUB={n:1,t:20,l:'1A',name:'1-arrow half (club rule)',desc:'one arrow a target: a miss scores 0'};
function halvesOf(R,x){x=x||(typeof cur!='undefined'?cur:null);return x&&x.abaClub&&R.halves.length>1?[CLUB,...R.halves.slice(1)]:R.halves}
window.abaHalvesOf=halvesOf;
function where(R,i,x){const HS=halvesOf(R,x);let s=0;for(let h=0;h<HS.length;h++){const H=HS[h];if(i<s+H.t)return{h,H,n:H.n,tn:i-s+1,s};s+=H.t}const H=HS[HS.length-1];return{h:HS.length-1,H,n:H.n,tn:H.t,s:s-H.t}}
window.abaWhere=where;
const abaPts=(n,k,z)=>k>=1&&k<=n&&ZN.includes(z)?PTS[k-1][ZN.indexOf(z)]:null;window.abaPts=abaPts;
const st=()=>{cur.aba=cur.aba||[];return cur.aba};
function targetIdx(){return cur.ends.length&&cur.ends[cur.ends.length-1].length==0?cur.ends.length-1:cur.ends.length}
/* record zone A/B/C or 'M' for the current target: first arrow to score; arrows 2/3 only after a miss, and only in a 3-arrow half */
function abaHit(z){const R=ROUNDS[cur.round],A=st(),i=targetIdx();if(i>=R.ends||cur.finished)return;const n=where(R,i,cur).n;
 if(!cur.ends[i])cur.ends[i]=[];const t=A[i]=A[i]||{m:0,d:null};
 if(z=='M'){t.m++;if(t.m>=n){cur.ends[i]=['M'];t.k=0;t.z=''}}
 else{const k=t.m+1,p=abaPts(n,k,z);if(p==null)return;cur.ends[i]=[String(p)];t.k=k;t.z=z}
 if(cur.ends[i].length&&cur.ends.length<R.ends&&cur.ends.length==i+1)cur.ends.push([]);
 save();abaScore(R)}
window.abaHit=abaHit;
function abaUndo(){const A=st();let i=targetIdx();const t=A[i];
 if(t&&t.m&&!(cur.ends[i]||[]).length){t.m--}
 else{if(cur.ends[i]&&!cur.ends[i].length)cur.ends.pop();i=cur.ends.length-1;if(i<0){cur.ends=[[]];save();return abaScore(ROUNDS[cur.round])}cur.ends[i]=[];if(A[i]){A[i].m=0;delete A[i].k;delete A[i].z}}
 if(!cur.ends.length)cur.ends=[[]];cur.finished=false;save();abaScore(ROUNDS[cur.round])}
function abaStats(ss){const T=[];ss.forEach(s=>s.ends.forEach((e,i)=>{if(!e.length)return;const a=(s.aba||[])[i]||{};T.push({v:val(e[0]),k:a.k||0,z:a.z||''})}));
 const n=T.length,sum=T.reduce((t,x)=>t+x.v,0);return{n,sum,avg:n?sum/n:null,first:n?T.filter(x=>x.k==1).length/n:null,firstN:T.filter(x=>x.k==1).length,kill:T.filter(x=>x.z=='A').length,vital:T.filter(x=>x.z=='B').length,wound:T.filter(x=>x.z=='C').length,miss:T.filter(x=>!x.k).length}}
window.abaStats=abaStats;
/* half totals: per half, scores by target (null = not shot), running total within the half, subtotals 1-10 and 11-20 */
function halves(s){const R=ROUNDS[s.round];let i0=0;return halvesOf(R,s).map(H=>{const v=[...Array(H.t)].map((_,j)=>{const e=s.ends[i0+j];return e&&e.length?val(e[0]):null});let run=0;const rn=v.map(x=>x==null?null:(run+=x));
 const sub=[0,1].map(q=>v.slice(q*10,q*10+10).reduce((t,x)=>t+(x||0),0)),o={H,v,rn,sub,tot:v.reduce((t,x)=>t+(x||0),0),i0};i0+=H.t;return o})}
window.abaHalves=halves;
/* The sheet grid, laid out like the paper ABA Interclub sheet: 4 columns (3A 1-10, 3A 11-20, 1A 1-10, 1A 11-20). Each row = one target:
   its score next to the running total for that half. Subtotal per 10 targets, then each half's total, then the round total.
   Both halves are numbered 1-20, as on the paper. */
const halfTag=(o,HS)=>HS.length>1?(o===HS[0]?'First half':'Second half')+' · ':'';
/* halves are called First half / Second half everywhere; 1A, 2B etc. are only ever score codes */
const hName=(h,n)=>n>1?(h==0?'First half':'Second half'):'Round';window.abaHalfName=hName;
function grid(s,live){const HS=halves(s),A=s.aba||[],nx=live?targetIdx():-1;
 const col=(o,q,h)=>`<table class="aba-p" data-col="${h}-${q}"><tr><th colspan="3"><span style="font-size:10px">${hName(h,HS.length)}</span> <span class="small">${q*10+1}-${q*10+10}</span></th></tr>${[...Array(10)].map((_,j)=>{const t=q*10+j,a=A[o.i0+t]||{},v=o.v[t],on=o.i0+t==nx;
  return`<tr${on?' class="aba-now"':''}><td class="aba-t">${t+1}</td><td class="aba-v" data-hit="${v==null?'':v===0?'M':a.k?hitCode(a):''}" title="${v==null?'':v===0?'no score':hitCode(a)}">${v==null?'':v}</td><td class="aba-r">${o.rn[t]==null?'':o.rn[t]}</td></tr>`}).join('')}<tr class="aba-sub"><td colspan="2" class="small">${q*10+1}-${q*10+10}</td><td><b data-sub="${h}-${q}">${o.sub[q]}</b></td></tr></table>`;
 return`<div class="aba-cols4">${HS.map((o,h)=>col(o,0,h)+col(o,1,h)).join('')}</div>
 <div class="aba-tots">${HS.map((o,h)=>`<div class="list-item row"><span>${halfTag(o,HS)}${o.H.n==3?'3 Arrow':o.H.n==1?'1 Arrow':o.H.n+' Arrow'} Total <span class="small muted">(${o.sub[0]} + ${o.sub[1]})</span></span><b id="abah${h}">${o.tot}</b></div>`).join('')}
 ${HS.length>1?`<div class="list-item row" style="font-size:18px"><span><b>ROUND TOTAL</b></span><b id="abaround">${HS.reduce((t,o)=>t+o.tot,0)}</b></div>`:''}</div>`}
window.abaGrid=grid;
function paper(s){const hd=s.abaHead||{},HS=halves(s);
 return`<div class="card aba-sheet" id="abapaper"><div style="text-align:center"><b>ABA INTERCLUB</b><div class="small" style="color:#ff6b6b">Official Score Sheet</div></div>
 <div class="aba-hd"><div><span class="small muted">Name</span><b>${escA(hd.name||S.profile||'')}</b></div><div><span class="small muted">Date</span><b>${escA(s.date)}</b></div><div><span class="small muted">ABA #</span>${escA(hd.no||'')}</div><div><span class="small muted">Grade</span>${escA(hd.grade||'')}</div><div><span class="small muted">Division</span>${escA(hd.div||'')}</div><div><span class="small muted">Target</span>${escA(hd.target||'')}</div></div>
 <p class="small muted" style="margin:6px 0 0" id="abahow">${HS.map((o,h)=>`${hName(h,HS.length)}: ${o.H.desc}`).join('. ')}. Each half is targets 1-20. Points: 1A 20, 1B 18, 1C 16 · 2A 14, 2B 12, 2C 10 · 3A 8, 3B 6, 3C 4.</p>
 <table class="aba-pts"><tr><th>Arrow</th><th>A</th><th>B</th><th>C</th></tr>${PTS.map((r,k)=>`<tr><th>${k+1}</th>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</table>
 ${grid(s,false)}
 ${s.abaNote?`<p class="small muted">${escA(s.abaNote)}</p>`:''}</div>`}
window.abaPaper=paper;
/* Scorer: one target at a time. Arrow 1's buttons (20/18/16/Miss); a score records the target and moves straight on.
   Only a Miss in a 3-arrow half brings up arrow 2 (14/12/10/Miss), then arrow 3 (8/6/4/Miss); three misses = 0 and move on.
   In a 1-arrow half: one tap (20/18/16 or Miss = 0), then the next target. */
function abaScore(R){const A=st(),i=targetIdx(),fin=i>=R.ends||cur.finished,W=fin?null:where(R,i,cur),n=W?W.n:1,t=A[i]||{m:0},k=(t.m||0)+1,tot=total(cur),doneT=cur.ends.filter(e=>e.length).length,maxP=tot+(R.ends-doneT)*20,HS=halves(cur);
 if(fin&&!cur.finished){cur.finished=true;save()}const S3=abaStats([cur]);if(window._abaSid!==cur.id){window._abaSid=cur.id;window._abaView=cur.finished?'sheet':'score'}
 const hd=cur.abaHead=cur.abaHead||{},fresh=!doneT&&!t.m&&!fin;
 const li=[...cur.ends.keys()].filter(j=>cur.ends[j].length).pop(),LW=li!=null?where(R,li,cur):null,LH=LW?HS[LW.h]:null;
 const last=li==null?'':`<div class="list-item" id="abalast" style="margin:4px 0">Last: ${hName(LW.h,HS.length).toLowerCase()} target ${LW.tn} scored <b>${val(cur.ends[li][0])}</b>${(A[li]||{}).k?' ('+hitCode(A[li])+')':' (no score)'} · ${hName(LW.h,HS.length).toLowerCase()} running total <b>${LH.rn[LW.tn-1]}</b></div>`;
 const top=`<div class="card" id="abacard"><span class="kicker">ABA Interclub 3D</span>
 <div class="row" style="justify-content:space-between;align-items:flex-end;margin:6px 0"><div><div class="small muted" id="abahalf">${fin?'Round':hName(W.h,HS.length)+' · '+(W.n>1?'3-arrow':'1-arrow')+(cur.abaClub&&W.h==0?' (club rule)':'')}</div><b style="font-size:30px" id="abatg">${fin?'Done':'Target '+W.tn+' of '+W.H.t}</b></div><div style="text-align:right"><div class="small muted">Total</div><b style="font-size:30px;color:var(--gold)" id="abatot">${tot}</b>${fin?'':`<div class="small muted" id="abamax">max possible ${maxP}</div>`}</div></div>
 ${fin?'':`<div class="list-item" id="abarule" style="margin:4px 0;border-left:4px solid ${W.n>1?'#ffd84d':'#3b82f6'};padding-left:8px">${W.n>1?'Tap the score of your first arrow to hit. A hit moves straight to the next target. Only tap Miss if the arrow missed: then shoot the next arrow at the same target.':'One arrow a target. Tap its score, or Miss (scores 0). Then it moves to the next target.'}${HS.length>1&&W.h==1?` First half done: ${HS[0].tot}.`:''}</div>`}
 ${fresh?`<label class="list-item" id="abaclubl" style="display:flex;gap:8px;align-items:center;margin:4px 0"><input type="checkbox" id="abaclub" ${cur.abaClub?'checked':''}> <span>Club rule: first half is 1 arrow too</span></label>`:cur.abaClub?'<div class="small muted" id="abaclubon">Club rule on: both halves are 1-arrow.</div>':''}
 <div class="small muted" id="abahalves">${HS.map((o,h)=>`${hName(h,HS.length)}: <b>${o.tot}</b> (1-10: ${o.sub[0]}, 11-20: ${o.sub[1]})`).join(' · ')}</div>
 <div class="zbar" style="justify-content:flex-start;margin:8px 0"><button class="zb${window._abaView=='score'?' on':''}" data-abv="score">Score</button><button class="zb${window._abaView=='sheet'?' on':''}" data-abv="sheet">Score sheet</button><button class="zb" id="abaexit" style="margin-left:auto">${fin?'✓ Close':'✕ Exit round'}</button></div>`;
 const pad=fin?`<p><b>Round complete: ${tot}</b> · avg ${S3.avg!=null?S3.avg.toFixed(1):'–'} per target · first-arrow hits ${S3.firstN}/${S3.n} · kills (A) ${S3.kill}</p><button class="btn full" id="abadone">Done</button>`:`
 <p style="margin:4px 0" id="abaarrow"><b>Arrow ${k}</b>${n>1?(k==1?'':` · arrow ${k-1} missed`):''}</p>
 <div class="aba-pad" style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px">${ZN.map(z=>`<button class="aba-z" data-z="${z}" style="min-height:64px;font-size:22px;font-weight:800;border-radius:12px;border:0;background:${z=='A'?'#ffd84d':z=='B'?'#3b82f6':'#334155'};color:${z=='A'?'#111':'#fff'}">${abaPts(n,k,z)}<div style="font-size:11px;font-weight:700">${ZL[z]} ${z}</div></button>`).join('')}<button class="aba-z" data-z="M" style="min-height:64px;font-size:18px;font-weight:800;border-radius:12px;border:0;background:#64748b;color:#fff">Miss<div style="font-size:11px;font-weight:700">${k<n?'arrow '+(k+1):'0 · next'}</div></button></div>
 ${last}`;
 const head=`<details style="margin-top:8px"><summary class="small">Sheet details (name, ABA #, grade, division, target)</summary>${[['name','Name',S.profile||''],['no','ABA #',''],['grade','Grade',''],['div','Division',''],['target','Target','']].map(([k2,l,ph])=>`<label class="small" for="abh-${k2}">${l}</label><input id="abh-${k2}" data-abh="${k2}" value="${escA(hd[k2]||'')}" placeholder="${escA(ph)}">`).join('')}</details>`;
 const dist=fin?'':`<label for="abad" class="small" style="display:block;margin-top:10px">Estimated distance (optional, unmarked)</label><input id="abad" type="number" inputmode="numeric" min="1" max="60" placeholder="m" value="${t.d||''}" style="width:110px">`;
 app.innerHTML=top+(window._abaView=='sheet'?'</div>'+paper(cur):pad+`<div style="display:flex;gap:8px;margin-top:10px"><button class="btn ghost" id="abaundo" ${doneT||t.m?'':'disabled'}>↶ Undo</button>${fin?'':`<button class="btn ghost" id="abafin">Finish early</button>`}</div></div><div class="card" id="abalive"><span class="kicker">Your sheet so far</span>${grid(cur,true)}</div><div class="card">${dist}${head}</div>`)+
 `<p class="small muted" style="margin:0 4px 12px">ABA National Rules (1 Jan 2026), rule 13: 1A = 20, 1B = 18, 1C = 16, 2A = 14, 2B = 12, 2C = 10, 3A = 8, 3B = 6, 3C = 4. The first arrow to score counts; no more arrows once one scores. Up to 20 a target.</p>`;
 app.querySelectorAll('[data-abv]').forEach(b=>b.onclick=()=>{window._abaView=b.dataset.abv;abaScore(R)});
 app.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>abaHit(b.dataset.z));
 app.querySelectorAll('[data-abh]').forEach(x=>x.onchange=()=>{hd[x.dataset.abh]=x.value.trim();save()});
 const cb=$('#abaclub');if(cb)cb.onchange=()=>{if(cur.ends.some(e=>e.length))return;cur.abaClub=cb.checked;if(!cb.checked)delete cur.abaClub;S.abaClub=cb.checked;save();abaScore(R)};
 const dI=$('#abad');if(dI)dI.onchange=()=>{const A=st(),j=targetIdx();A[j]=A[j]||{m:0};const v=parseInt(dI.value);A[j].d=v>0&&v<=60?v:null;save()};
 const u=$('#abaundo');if(u)u.onclick=abaUndo;const f=$('#abafin');if(f)f.onclick=()=>{if(!cur.ends.some(e=>e.length))return;if(!cur.ends[cur.ends.length-1].length)cur.ends.pop();cur.finished=true;save();abaScore(R)};
 const x=$('#abaexit');if(x)x.onclick=()=>{if(cur.finished){cur=null;sv='sheet';window._abaView='score';save();score()}else leaveScoring()};
 const d=$('#abadone');if(d)d.onclick=()=>{cur=null;sv='sheet';window._abaView='score';score()}}
window.abaScore=abaScore;
/* Nathe's 17 May 2025 Interclub, typed from his paper sheet (every value read clearly; halves add to 392 and 390). Zones follow from the
   points: 20 can only be arrow 1 A and 18 only arrow 1 B. Saved once on his phone, marked as from a paper sheet. */
const P3=[20,20,20,20,20,20,18,20,20,18, 20,18,20,18,20,20,20,20,20,20],P1=[20,20,18,18,20,20,20,20,20,18, 20,18,20,18,20,20,20,20,20,20];
const NOTE="Typed from the paper ABA Interclub sheet. In the 3-arrow half, the running total after target 14 reads 274 on the paper (should be 272), so it ends on 394; the target scores and the written 3 Arrow Total of 392 agree.";
function seed(){migrate();const p=String(S.profile||'').toLowerCase();if(!(p.includes('stride')&&p.includes('nath'))||S.abaSeeded)return;const all=[...P3,...P1];
 S.sessions.push({id:'aba20250517',date:'2025-05-17',round:IC,ends:all.map(v=>[String(v)]),pos:[],note:'',finished:true,src:'paper',
  aba:all.map(v=>({m:0,k:1,z:v==20?'A':'B',d:null})),abaHead:{name:'Nathaniel Stride',no:'63268',div:'TBA',grade:'',target:''},
  abaNote:NOTE});S.abaSeeded=true;save()}
window.abaSeed=seed;window.abaMigrate=migrate;try{if(typeof S!='undefined'&&S&&S.sessions)migrate()}catch(e){}
/* Stats: ABA 3D card */
const _st=stats;stats=function(){seed();_st.apply(this,arguments);const ss=done().filter(s=>s.round==window._r||(!window._r&&false));if(!isAba(window._r)||!ss.length||$('#abastats'))return;const X=abaStats(ss),last=ss[ss.length-1],L=abaStats([last]),LH=halves(last);
 app.insertAdjacentHTML('afterbegin',`<div class="card" id="abastats"><span class="kicker">ABA 3D</span><h3 style="margin:2px 0 6px">${ss.length} round${ss.length>1?'s':''} · ${X.n} targets</h3>
 <div class="stats" style="grid-template-columns:1fr 1fr 1fr"><div class="stat"><b>${X.avg.toFixed(1)}</b>avg per target</div><div class="stat"><b>${Math.round(100*X.first)}%</b>first-arrow hits</div><div class="stat"><b>${X.kill}</b>kills (A)</div></div>
 <p class="small" style="margin:6px 0 0">Vital (B) ${X.vital} · Wound (C) ${X.wound} · No score ${X.miss}. Last: <b>${total(last)}</b> on ${escA(last.date)}${LH.length>1?` (${LH.map((o,h)=>hName(h,LH.length).toLowerCase()+' '+o.tot).join(' + ')}${last.abaClub?', club rule: both halves 1-arrow':''})`:''}${last.src=='paper'?' · from a paper sheet':''}.</p></div>`)};
const _sc=score;score=function(){if(!cur)seed();else if(isAba(cur.round)&&cur.abaClub===undefined&&S.abaClub&&!cur.ends.some(e=>e.length))cur.abaClub=true;return _sc.apply(this,arguments)};
})();
