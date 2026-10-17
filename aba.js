/* ABA 3D scoring (Australian Bowhunters Association).
   Ground truth: the ABA INTERCLUB Official Score Sheet (Western Australia ABA): 40 targets = a 3-arrow half ('3A', targets 1-20,
   up to 3 arrows, first hit scores) + a 1-arrow half ('1A', targets 1-20, first arrow only). Points: arrow 1 A/B/C 20/18/16,
   arrow 2 14/12/10, arrow 3 8/6/4. Matches ABA National Rules consolidated 1 Jan 2026 v2, National 3D Round rules 7-9 (round = 20 targets;
   3-arrow, 2-arrow and 1-arrow rounds; first arrow to score; grading score = a 3-arrow round + a 1-arrow round). Distances are unmarked. */
(function(){
const PTS=[[20,18,16],[14,12,10],[8,6,4]],ZN=['A','B','C'],ZL={A:'Kill',B:'Vital',C:'Wound'};
/* One ABA round in the picker: the Interclub sheet. First half = 3-arrow half (targets 1-20, first arrow to hit scores),
   second half = 1-arrow half (targets 21-40, one arrow, a miss scores 0). Checked against Nathe's sheet photo (3A columns on the left,
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
function where(R,i){let s=0;for(let h=0;h<R.halves.length;h++){const H=R.halves[h];if(i<s+H.t)return{h,H,n:H.n,tn:i-s+1,s};s+=H.t}const H=R.halves[R.halves.length-1];return{h:R.halves.length-1,H,n:H.n,tn:H.t,s:s-H.t}}
window.abaWhere=where;
const abaPts=(n,k,z)=>k>=1&&k<=n&&ZN.includes(z)?PTS[k-1][ZN.indexOf(z)]:null;window.abaPts=abaPts;
const st=()=>{cur.aba=cur.aba||[];return cur.aba};
function targetIdx(){return cur.ends.length&&cur.ends[cur.ends.length-1].length==0?cur.ends.length-1:cur.ends.length}
/* record zone A/B/C or 'M' for the current target: first arrow to score; arrows 2/3 only after a miss, and only in a 3-arrow half */
function abaHit(z){const R=ROUNDS[cur.round],A=st(),i=targetIdx();if(i>=R.ends||cur.finished)return;const n=where(R,i).n;
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
function halves(s){const R=ROUNDS[s.round];let i0=0;return R.halves.map(H=>{const v=[...Array(H.t)].map((_,j)=>{const e=s.ends[i0+j];return e&&e.length?val(e[0]):null});let run=0;const rn=v.map(x=>x==null?null:(run+=x));
 const sub=[0,1].map(q=>v.slice(q*10,q*10+10).reduce((t,x)=>t+(x||0),0)),o={H,v,rn,sub,tot:v.reduce((t,x)=>t+(x||0),0),i0};i0+=H.t;return o})}
window.abaHalves=halves;
/* paper-style sheet: mirrors the ABA Interclub Official Score Sheet */
function paper(s){const R=ROUNDS[s.round],HS=halves(s),hd=s.abaHead||{},A=s.aba||[];
 const col=(o,q)=>`<table class="aba-p"><tr><th>T</th><th title="arrow number + zone">Hit</th><th>${o.H.l}</th></tr>${[...Array(10)].map((_,j)=>{const t=q*10+j,a=A[o.i0+t]||{},v=o.v[t];return`<tr><td>${o.i0+t+1}</td><td>${v==null?'':v===0?'M':a.k?hitCode(a):''}</td><td><b>${v==null?'':v===0?'M':v}</b> <span class="small muted">${o.rn[t]==null?'':o.rn[t]}</span></td></tr>`}).join('')}<tr><td colspan="2" class="small">Subtotal ${o.i0+q*10+1}-${o.i0+q*10+10}</td><td><b>${o.sub[q]}</b></td></tr></table>`;
 return`<div class="card aba-sheet" id="abapaper"><div style="text-align:center"><b>ABA INTERCLUB</b><div class="small" style="color:#ff6b6b">Official Score Sheet</div></div>
 <div class="aba-hd"><div><span class="small muted">Name</span><b>${escA(hd.name||S.profile||'')}</b></div><div><span class="small muted">Date</span><b>${escA(s.date)}</b></div><div><span class="small muted">ABA #</span>${escA(hd.no||'')}</div><div><span class="small muted">Grade</span>${escA(hd.grade||'')}</div><div><span class="small muted">Division</span>${escA(hd.div||'')}</div><div><span class="small muted">Target</span>${escA(hd.target||'')}</div></div>
 <p class="small muted" style="margin:6px 0 0">Points: arrow number (1, 2 or 3) by zone (A Kill, B Vital, C Wound). Hit = arrow + zone, e.g. 1A = 20, 2B = 12.</p><table class="aba-pts"><tr><th>Arrow</th><th>A</th><th>B</th><th>C</th></tr>${PTS.map((r,k)=>`<tr><th>${k+1}</th>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</table>
 ${HS.map(o=>`<div class="aba-half"><div class="kicker" style="margin-top:8px">${HS.length>1?(o===HS[0]?'First half':'Second half')+' · ':''}${o.H.name} (${o.H.l}) · targets ${o.i0+1}-${o.i0+o.H.t}</div><div class="small muted">${o.H.desc}</div><div class="aba-cols">${col(o,0)}${col(o,1)}</div><div class="list-item row"><span>${o.H.n==3?'3 Arrow':o.H.n==1?'1 Arrow':o.H.n+' Arrow'} Total</span><b id="abahalf${o.H.l}">${o.tot}</b></div></div>`).join('')}
 ${HS.length>1?`<div class="list-item row" style="font-size:18px"><span><b>ROUND TOTAL</b></span><b id="abaround">${HS.reduce((t,o)=>t+o.tot,0)}</b></div>`:''}
 ${s.abaNote?`<p class="small muted">${escA(s.abaNote)}</p>`:''}</div>`}
window.abaPaper=paper;
function abaScore(R){const A=st(),i=targetIdx(),fin=i>=R.ends||cur.finished,W=fin?null:where(R,i),n=W?W.n:1,t=A[i]||{m:0},k=(t.m||0)+1,tot=total(cur),doneT=cur.ends.filter(e=>e.length).length,maxP=tot+(R.ends-doneT)*20,HS=halves(cur);
 if(fin&&!cur.finished){cur.finished=true;save()}const S3=abaStats([cur]);if(window._abaSid!==cur.id){window._abaSid=cur.id;window._abaView=cur.finished?'sheet':'score'}
 const hd=cur.abaHead=cur.abaHead||{};
 const top=`<div class="card" id="abacard"><span class="kicker">ABA 3D · first arrow to score</span>
 <div class="row" style="justify-content:space-between;align-items:flex-end;margin:6px 0"><div><div class="small muted" id="abahalf">${fin?'Round':(R.halves.length>1?(W.h==0?'First half':'Second half')+' · ':'')+W.H.name+' · target'}</div><b style="font-size:30px" id="abatg">${fin?'Done':(i+1)+' of '+R.ends}</b></div><div style="text-align:right"><div class="small muted">Total</div><b style="font-size:30px;color:var(--gold)" id="abatot">${tot}</b><div class="small muted" id="abamax">max possible ${maxP}</div></div></div>
 ${fin?'':`<div class="list-item" id="abarule" style="margin:4px 0;border-left:4px solid ${W.n>1?'#ffd84d':'#3b82f6'};padding-left:8px"><b>${W.H.name}:</b> ${W.H.desc}.${R.halves.length>1?(W.h==0?' The 1-arrow half comes second (targets 21-40).':` First half done: ${HS[0].tot}.`):''}</div>`}
 <div class="small muted" id="abahalves">${HS.map(o=>`${o.H.name[0].toUpperCase()+o.H.name.slice(1)} (targets ${o.i0+1}-${o.i0+o.H.t}): <b>${o.tot}</b> (${o.i0+1}-${o.i0+10}: ${o.sub[0]}, ${o.i0+11}-${o.i0+20}: ${o.sub[1]})`).join(' · ')}</div>
 <div class="zbar" style="justify-content:flex-start;margin:8px 0"><button class="zb${window._abaView=='score'?' on':''}" data-abv="score">Score</button><button class="zb${window._abaView=='sheet'?' on':''}" data-abv="sheet">Score sheet</button><button class="zb" id="abaexit" style="margin-left:auto">${fin?'✓ Close':'✕ Exit round'}</button></div>`;
 const pad=fin?`<p><b>Round complete: ${tot}</b> · avg ${S3.avg!=null?S3.avg.toFixed(1):'–'} per target · first-arrow hits ${S3.firstN}/${S3.n} · kills (A) ${S3.kill}</p><button class="btn full" id="abadone">Done</button>`:`
 <p style="margin:4px 0" id="abaarrow"><b>Arrow ${k} of ${n}</b>${n>1?(k<n?` · a miss means you shoot arrow ${k+1} at this target`:' · last arrow: a miss scores 0'):' · one arrow only in this half: a miss scores 0'}${t.m?` <span class="small muted">· missed ${t.m}</span>`:''}</p>
 <div class="aba-pad" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${ZN.map(z=>`<button class="aba-z" data-z="${z}" style="min-height:64px;font-size:22px;font-weight:800;border-radius:12px;border:0;background:${z=='A'?'#ffd84d':z=='B'?'#3b82f6':'#334155'};color:${z=='A'?'#111':'#fff'}">${abaPts(n,k,z)}<div style="font-size:13px;font-weight:700">${z} · ${ZL[z]}</div></button>`).join('')}<button class="aba-z" data-z="M" style="min-height:64px;font-size:22px;font-weight:800;border-radius:12px;border:0;background:#64748b;color:#fff">M<div style="font-size:13px;font-weight:700">${k<n?'Miss · shoot arrow '+(k+1):'Miss · 0'}</div></button></div>
 <label for="abad" class="small" style="display:block;margin-top:10px">Estimated distance (optional, unmarked)</label><input id="abad" type="number" inputmode="numeric" min="1" max="60" placeholder="m" value="${t.d||''}" style="width:110px">`;
 const head=`<details style="margin-top:8px"><summary class="small">Sheet details (name, ABA #, grade, division, target)</summary>${[['name','Name',S.profile||''],['no','ABA #',''],['grade','Grade',''],['div','Division',''],['target','Target','']].map(([k2,l,ph])=>`<label class="small" for="abh-${k2}">${l}</label><input id="abh-${k2}" data-abh="${k2}" value="${escA(hd[k2]||'')}" placeholder="${escA(ph)}">`).join('')}</details>`;
 app.innerHTML=top+(window._abaView=='sheet'?'</div>'+paper(cur):pad+`<div style="display:flex;gap:8px;margin-top:10px"><button class="btn ghost" id="abaundo" ${doneT||t.m?'':'disabled'}>↶ Undo</button>${fin?'':`<button class="btn ghost" id="abafin">Finish early</button>`}</div>${head}</div>`)+
 `<p class="small muted" style="margin:0 4px 12px">ABA National Rules (1 Jan 2026), rule 13: 1A = 20, 1B = 18, 1C = 16, 2A = 14, 2B = 12, 2C = 10, 3A = 8, 3B = 6, 3C = 4. The first arrow to score counts; no more arrows once one scores. Up to 20 a target.</p>`;
 app.querySelectorAll('[data-abv]').forEach(b=>b.onclick=()=>{window._abaView=b.dataset.abv;abaScore(R)});
 app.querySelectorAll('[data-z]').forEach(b=>b.onclick=()=>abaHit(b.dataset.z));
 app.querySelectorAll('[data-abh]').forEach(x=>x.onchange=()=>{hd[x.dataset.abh]=x.value.trim();save()});
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
 <p class="small" style="margin:6px 0 0">Vital (B) ${X.vital} · Wound (C) ${X.wound} · No score ${X.miss}. Last: <b>${total(last)}</b> on ${escA(last.date)}${LH.length>1?` (${LH.map(o=>o.H.l+' '+o.tot).join(' + ')})`:''}${last.src=='paper'?' · from a paper sheet':''}.</p></div>`)};
const _sc=score;score=function(){if(!cur)seed();return _sc.apply(this,arguments)};
})();
