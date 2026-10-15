/* ScoreTool demo v1. Static, localStorage only. No real payments. */
const $=s=>document.querySelector(s), app=$('#app');
const ROUNDS={ // AA/WA round templates (arrows per end, distances)
 'WA 720 (70m)':{ends:12,ape:6,face:'122cm',max:720},
 'WA 720 (60m)':{ends:12,ape:6,face:'122cm',max:720},
 'WA 720 (50m Compound)':{ends:12,ape:6,face:'80cm 6-ring',max:720},
 'Short Canberra (50/40/30m)':{ends:15,ape:6,face:'122cm',max:900},
 'Junior Canberra (40/30/20m)':{ends:15,ape:6,face:'80cm',max:900},
 'Indoor WA 18m':{ends:20,ape:3,face:'40cm',max:600},
 'Practice 10 ends × 3':{ends:10,ape:3,face:'any',max:300},
 'Practice 6 ends × 6':{ends:6,ape:6,face:'any',max:360}};
const KEY='scoretool.v1';
let S=JSON.parse(localStorage.getItem(KEY)||'null')||{profile:null,unlocked:false,sessions:[],best:[],plots:[]};
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
let REAL={}; // name -> [{date,event,round,score,division,club,url}]
let csvState='loading';

/* ---------- importer for /data/archer_scores.csv (from Archer's Diary) ---------- */
function parseCSV(t){const rows=[];let r=[],f='',q=false;for(let i=0;i<t.length;i++){const c=t[i];
 if(q){if(c=='"'&&t[i+1]=='"'){f+='"';i++}else if(c=='"')q=false;else f+=c}
 else if(c=='"')q=true;else if(c==','){r.push(f);f=''}else if(c=='\n'||c=='\r'){if(c=='\r'&&t[i+1]=='\n')i++;r.push(f);rows.push(r);r=[];f=''}else f+=c}
 if(f||r.length){r.push(f);rows.push(r)}return rows.filter(x=>x.some(v=>v.trim()))}
function pick(h,names){for(const n of names){const i=h.findIndex(x=>x.toLowerCase().replace(/[^a-z]/g,'')==n);if(i>=0)return i}return -1}
let OFF={}; // name -> [{key,date,event,round,url,ends:[{dist,arrows,flag}]}]
async function loadArrows(){try{const r=await fetch('data/arrows.csv',{cache:'no-store'});if(!r.ok)return;const rows=parseCSV(await r.text()),h=rows[0];
 const I=n=>h.indexOf(n);for(const row of rows.slice(1)){const g=n=>(row[I(n)]||'').trim(),nm=g('archer'),key=g('date')+'|'+g('round')+'|'+g('event');
  const L=(OFF[nm]=OFF[nm]||[]);let o=L.find(x=>x.key==key);if(!o){o={key,date:g('date'),event:g('event'),round:g('round'),url:g('results_url'),ends:[]};L.push(o)}
  const ar=g('arrows').split(',').map(x=>x.trim().toUpperCase()).filter(Boolean);o.ends.push({dist:g('distance'),arrows:ar,flag:ar.length>0&&ar.every(a=>a=='M')})}
 for(const k in OFF)OFF[k].sort((a,b)=>a.date<b.date?1:-1)}catch(e){}}
async function loadReal(){await loadArrows();
 try{const r=await fetch('data/archer_scores.csv',{cache:'no-store'});if(!r.ok)throw 0;
  const rows=parseCSV(await r.text());if(rows.length<2){csvState='empty';return}
  const h=rows[0],ix={name:pick(h,['archer','name','archername']),date:pick(h,['date','eventdate']),event:pick(h,['event','eventname','shoot','tournament']),
   round:pick(h,['round','roundname']),score:pick(h,['score','total','totalscore']),division:pick(h,['division','bowclass','bowtype','class','category']),notes:pick(h,['notes']),
   club:pick(h,['club']),url:pick(h,['url','resultsurl','source','sourceurl','link']),tens:pick(h,['tens','10s']),xs:pick(h,['xs','x'])};
  for(const row of rows.slice(1)){const g=k=>ix[k]>=0?(row[ix[k]]||'').trim():'';const sc=parseInt(g('score'));if(!g('name')||isNaN(sc)||sc<=0)continue; /* skip not-entered/0 rows */
   (REAL[g('name')]=REAL[g('name')]||[]).push({date:g('date'),event:g('event'),round:g('round')||'Unknown round',score:sc,division:g('division'),club:g('club'),url:g('url'),tens:g('tens'),xs:g('xs'),notes:g('notes'),incomplete:/incomplete|partial|not shot/i.test(g('notes'))})}
  for(const k in REAL)REAL[k].sort((a,b)=>normDate(a.date)<normDate(b.date)?-1:1);
  csvState=Object.keys(REAL).length?'ok':'empty';
 }catch(e){csvState='missing'}}
function normDate(d){const m=d.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);return m?`${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`:d}
const ARCHERS=['Nathaniel Stride','Logan Wolfe'];
const findReal=n=>{const k=Object.keys(REAL).find(x=>x.toLowerCase().includes(n.split(' ')[1].toLowerCase())&&x.toLowerCase().includes(n.split(' ')[0].slice(0,4).toLowerCase()));return k?REAL[k]:[]};

/* ---------- sample practice data (clearly labelled) ---------- */
function rng(seed){return()=>{seed=(seed*16807)%2147483647;return seed/2147483647}}
function sampleSessions(){const R=rng(7),out=[];const today=new Date();
 for(let s=0;s<10;s++){const d=new Date(today-(30-s*3)*864e5);const ends=[];const skill=7.2+s*0.08;
  for(let e=0;e<10;e++){const end=[];for(let a=0;a<3;a++){let v=Math.round(skill+(R()-0.5)*4-(e>7?0.6:0));v=Math.max(0,Math.min(10,v));end.push(v==10&&R()<.35?'X':v==0?'M':String(v))}ends.push(end)}
  out.push({id:'sample'+s,sample:true,date:d.toISOString().slice(0,10),round:'Practice 10 ends × 3',ends,note:''})}
 out[9].ends=out[9].ends.map(e=>e.map(v=>v=='X'||v=='10'?'7':v=='9'?'6':v)); // one rough day so the Comeback Plan shows
 return out}

/* ---------- scoring helpers ---------- */
const val=a=>a=='X'?10:a=='M'?0:+a;
const endSum=e=>e.reduce((t,a)=>t+val(a),0);
const total=s=>s.ends.reduce((t,e)=>t+endSum(e),0);
const arrows=s=>s.ends.flat();
const avgArrow=s=>{const a=arrows(s);return a.length?total(s)/a.length:0};
const sd=xs=>{if(xs.length<2)return 0;const m=xs.reduce((a,b)=>a+b)/xs.length;return Math.sqrt(xs.reduce((t,x)=>t+(x-m)**2,0)/(xs.length-1))};
const col=a=>{const v=val(a);return v>=9?'k-y':v>=7?'k-r':v>=5?'k-b':v>=3?'k-k':v>=1?'k-w':'k-m'};
const allSessions=()=>[...S.sessions].sort((a,b)=>a.date<b.date?-1:1);
const done=()=>allSessions().filter(s=>{const R=ROUNDS[s.round];return R&&s.ends.length==R.ends&&s.ends.every(e=>e.length==R.ape)});

/* ---------- PBs, streaks, badges, wins ---------- */
function pbs(){const m={};for(const s of done()){const t=total(s);if(!m[s.round]||t>m[s.round].score)m[s.round]={score:t,date:s.date,sample:s.sample}}
 for(const r of findReal(S.profile||'')){if(r.incomplete)continue;const k='🏆 '+r.round+(r.division?' · '+r.division.replace(/^(Under \d+|Open) (Male|Female) /,''):'');if(!m[k]||r.score>m[k].score)m[k]={score:r.score,date:r.date,real:true}}return m}
function streak(){const wk=d=>Math.floor((new Date(d)-new Date('2024-01-01'))/6048e5);const w=[...new Set(allSessions().map(s=>wk(s.date)))].sort((a,b)=>b-a);if(!w.length)return 0;
 let n=1;for(let i=1;i<w.length;i++){if(w[i-1]-w[i]==1)n++;else break}return n} // weeks-with-practice style streak
function winsFor(s){const W=[],prev=done().filter(x=>x.round==s.round&&x.id!=s.id&&x.date<=s.date);const t=total(s);
 const ends=s.ends.map(endSum),best=Math.max(...ends),bi=ends.indexOf(best);
 W.push(['⭐',`Your best end was end ${bi+1}: ${best} points (${s.ends[bi].join(' ')}).`]);
 const gold=arrows(s).filter(a=>val(a)>=9).length;if(gold)W.push(['🟡',`${gold} arrows in the gold. That's ${Math.round(gold/arrows(s).length*100)}% of your shots.`]);
 if(prev.length){const avg=prev.reduce((a,x)=>a+total(x),0)/prev.length;if(t>avg)W.push(['📈',`${Math.round(t-avg)} points above your usual for this round.`]);
  const p=Math.max(...prev.map(total));if(t>p)W.push(['🏆',`NEW personal best! ${t} beats your old best of ${p}.`]);
  const half=Math.ceil(ends.length/2),late=ends.slice(half);if(late.length&&late.reduce((a,b)=>a+b)/late.length>=ends.slice(0,half).reduce((a,b)=>a+b)/half)W.push(['💪','You finished as strong as you started. Great stamina and focus.'])}
 if(sd(ends)<2.5)W.push(['🎯','Super consistent: your ends were all close together.']);
 W.push(['🏹',`You shot ${arrows(s).length} arrows. Every arrow is practice banked.`]);return W.slice(0,3)}
function badges(){const d=done(),p=pbs(),st=streak(),arr=d.reduce((t,s)=>t+arrows(s).length,0),xs=d.reduce((t,s)=>t+arrows(s).filter(a=>a=='X').length,0);
 return[['🏹','First session',d.length>=1],['💯','100 arrows',arr>=100],['🔥','3-week streak',st>=3],['❌','10 X\'s',xs>=10],['🏆','Beat a PB',d.some(s=>winsFor(s).some(w=>w[0]=='🏆'))],
 ['🎯','Tight group',S.plots.length>=6&&groupStats(S.plots).r<0.25],['🌈','Clean end (no misses)',d.some(s=>s.ends.some(e=>e.every(a=>a!='M')))],['📓','Evidence bank',S.best.length>=1],['💪','Comeback done',S.comebackDone]]}

/* ---------- charts (inline SVG) ---------- */
function lineChart(series,{h=170,labels=[]}={}){const W=340,P=30;const all=series.flatMap(s=>s.data).filter(v=>v!=null);if(!all.length)return'<p class="muted">Not enough data yet.</p>';
 let mn=Math.min(...all),mx=Math.max(...all);if(mn==mx){mn-=1;mx+=1}const n=Math.max(...series.map(s=>s.data.length));
 const X=i=>P+(n<2?0:i*(W-P-10)/(n-1)),Y=v=>h-22-(v-mn)/(mx-mn)*(h-40);
 let g=`<svg viewBox="0 0 ${W} ${h}" role="img" aria-label="chart" width="100%"><line x1="${P}" y1="${h-22}" x2="${W}" y2="${h-22}" stroke="#94a3b8"/>`+
 `<text x="2" y="${Y(mx)+4}" font-size="11" fill="#475569">${Math.round(mx)}</text><text x="2" y="${Y(mn)+4}" font-size="11" fill="#475569">${Math.round(mn)}</text>`;
 for(const s of series){const pts=s.data.map((v,i)=>v==null?null:`${X(i)},${Y(v)}`).filter(Boolean);g+=`<polyline fill="none" stroke="${s.c}" stroke-width="${s.w||2.5}" ${s.dash?'stroke-dasharray="5 4"':''} points="${pts.join(' ')}"/>`;
  if(!s.dash)s.data.forEach((v,i)=>{if(v!=null)g+=`<circle cx="${X(i)}" cy="${Y(v)}" r="3.5" fill="${s.c}"/>`})}
 labels.forEach((l,i)=>{if(n<=12||i%Math.ceil(n/6)==0)g+=`<text x="${X(i)}" y="${h-6}" font-size="10" text-anchor="middle" fill="#475569">${l}</text>`});
 return g+'</svg>'+`<div class="small">${series.map(s=>`<span style="color:${s.c};font-weight:800">━</span> ${s.name}`).join(' &nbsp; ')}</div>`}
function bars(vals,labels,c='#1d4ed8'){const W=340,h=150,mx=Math.max(...vals,1),bw=(W-20)/vals.length;
 return`<svg viewBox="0 0 ${W} ${h}" width="100%" role="img" aria-label="bar chart">${vals.map((v,i)=>`<rect x="${10+i*bw+2}" y="${h-20-v/mx*(h-40)}" width="${bw-4}" height="${v/mx*(h-40)}" rx="3" fill="${c}"/><text x="${10+i*bw+bw/2}" y="${h-24-v/mx*(h-40)}" font-size="10" text-anchor="middle" fill="#0f172a">${Math.round(v*10)/10}</text><text x="${10+i*bw+bw/2}" y="${h-6}" font-size="10" text-anchor="middle" fill="#475569">${labels[i]}</text>`).join('')}</svg>`}

/* ---------- target plotting ---------- */
function groupStats(p){if(!p.length)return{cx:0,cy:0,r:0};const cx=p.reduce((a,b)=>a+b.x,0)/p.length,cy=p.reduce((a,b)=>a+b.y,0)/p.length;
 return{cx,cy,r:p.reduce((a,b)=>a+Math.hypot(b.x-cx,b.y-cy),0)/p.length}}
function ringScore(x,y){const d=Math.hypot(x,y);if(d>1)return'M';if(d<=0.05)return'X';return String(10-Math.floor(d*10))}
function targetSVG(pts){const rings=[['#fff','#333'],['#fff','#333'],['#111','#fff'],['#111','#fff'],['#2563eb','#111'],['#2563eb','#111'],['#d62828','#111'],['#d62828','#111'],['#ffd84d','#111'],['#ffd84d','#111']];
 let g=`<svg id="tface" viewBox="-1.1 -1.1 2.2 2.2" width="100%" role="img" aria-label="Target face, tap where each arrow landed">`;
 rings.forEach((c,i)=>g+=`<circle r="${1-i*0.1}" fill="${c[0]}" stroke="${c[1]}" stroke-width="0.006"/>`);g+=`<circle r="0.05" fill="none" stroke="#111" stroke-width="0.005"/>`;
 pts.forEach((p,i)=>g+=`<circle cx="${p.x}" cy="${p.y}" r="0.035" fill="#22c55e" stroke="#000" stroke-width="0.01"/>`);
 if(pts.length>=3){const s=groupStats(pts);g+=`<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" fill="none" stroke="#a855f7" stroke-width="0.015" stroke-dasharray="0.04 0.03"/><path d="M${s.cx-0.06} ${s.cy}h0.12M${s.cx} ${s.cy-0.06}v0.12" stroke="#a855f7" stroke-width="0.02"/>`}
 return g+'</svg>'}

/* ---------- views ---------- */
let view='home',cur=null;
function nav(v){view=v;document.querySelectorAll('#tabs button').forEach(b=>b.setAttribute('aria-current',b.dataset.v==v));render();scrollTo(0,0)}
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>nav(b.dataset.v));
function gate(){return`<div class="card dark gate"><span class="kicker">Members only</span><h1>Unlock ScoreTool</h1><p>Track every arrow, see your progress, and celebrate your wins.</p>
<ul><li>Arrow-by-arrow scoring with AA rounds</li><li>Your progress charts and personal bests</li><li>Badges, streaks and "Wins of the day"</li><li>Arrow plotting with sight hints</li><li>Coach/parent share link</li></ul>
<p class="small muted">Payments aren't switched on in this demo. Card, Apple Pay and Google Pay via Stripe will come later.</p>
<button class="btn full" id="unlock">Demo unlock (free, no payment)</button></div>`}
function pickProfile(){return`<div class="card"><span class="kicker">Welcome</span><h1>Who's shooting?</h1><p class="muted">Pick an archer to load their official results from Archer's Diary.</p>
${ARCHERS.map(n=>`<button class="btn ghost full" style="margin:6px 0" data-p="${n}">${n}</button>`).join('')}${csvNote()}</div>`}
function csvNote(){return csvState=='ok'?`<p class="small"><span class="real">Official</span> results loaded from Archer's Diary.</p>`:
 `<p class="small"><span class="sample">No scores yet</span> No official results imported yet. The Archer's Diary import is still being collected, so official results will appear here once it's added.</p>`}
function render(){
 if(location.hash.startsWith('#share=')) return renderShare();
 if(!S.unlocked){app.innerHTML=gate();$('#unlock').onclick=()=>{S.unlocked=true;save();render()};$('#tabs').hidden=true;return}
 $('#tabs').hidden=false;
 if(!S.profile){app.innerHTML=pickProfile();app.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{S.profile=b.dataset.p;if(!S.sessions.length)S.sessions=sampleSessions();save();nav('home')});return}
 ({home,score,plot,stats,me})[view]()}

function home(){const d=done(),last=d[d.length-1],real=findReal(S.profile);
 let h=`<div class="card dark"><span class="kicker">G'day ${S.profile.split(' ')[0]}</span><h1>Your progress zone</h1>
 <div class="stats"><div class="stat"><b>${d.length}</b>sessions</div><div class="stat"><b>${streak()}</b>wk streak</div><div class="stat"><b>${d.reduce((t,s)=>t+arrows(s).length,0)}</b>arrows</div></div>
 <p class="small muted" style="margin:10px 0 0">You're compared with <b>your own past self</b>, not with anyone else.</p></div>`;
 const cb=comeback();if(cb)h+=cb;
 if(last){h+=`<div class="card"><span class="kicker">Wins of the day · ${last.date} ${last.sample?'<span class="sample">sample</span>':''}</span><h2>3 things you did well</h2>${winsFor(last).map(w=>`<div class="win"><i>${w[0]}</i><div>${w[1]}</div></div>`).join('')}
 <button class="btn ghost" id="bank" style="margin-top:8px">⭐ Save to my evidence bank</button></div>`}
 const lo=offRounds()[0];if(lo){const ge=lo.ends.filter(e=>!e.flag);h+=`<div class="card"><span class="kicker">Wins of the day · ${lo.date} <span class="real">official</span></span><h2>${lo.round}</h2>${winsFor({id:'off',date:lo.date,round:lo.round,ends:ge.map(e=>e.arrows)}).map(w=>`<div class="win"><i>${w[0]}</i><div>${w[1]}</div></div>`).join('')}<button class="btn ghost" onclick="nav('stats')" style="margin-top:8px">See full round analysis</button></div>`}
 h+=`<div class="card"><span class="kicker">Official results · Archer's Diary</span><h2>Competition scores</h2>${real.length?real.slice(-6).reverse().map(r=>`<div class="list-item"><div class="row"><b>${r.score}</b><span class="real">official</span></div><div class="small">${r.round} · ${r.event} · ${r.date}${r.division?' · '+r.division:''}${r.incomplete?' <span class="sample">incomplete, not counted</span>':''}</div>${r.url?`<a class="small" href="${r.url}" target="_blank" rel="noopener">Source</a>`:''}</div>`).join(''):csvNote()}</div>`;
 h+=`<button class="btn alt full" id="go">✍️ Start a new session</button>`;app.innerHTML=h;
 $('#go').onclick=()=>nav('score');if($('#bank'))$('#bank').onclick=()=>{S.best.push({date:last.date,text:winsFor(last).map(w=>w[1]).join(' '),total:total(last),round:last.round,sample:!!last.sample});save();$('#bank').textContent='Saved ✓'};bindCB()}

function comeback(){const d=done();if(d.length<4)return'';const last=d[d.length-1],prev=d.slice(0,-1).filter(s=>s.round==last.round).slice(-5);if(prev.length<3)return'';
 const avg=prev.reduce((a,s)=>a+total(s),0)/prev.length;if(total(last)>=avg*0.92||S.comebackFor==last.id)return'';
 const ev=S.best.length?S.best[S.best.length-1]:{text:`your best day was ${Math.max(...prev.map(total))} on this round`};
 return`<div class="card" style="border:3px solid var(--gold)"><span class="kicker">Comeback plan</span><h2>Tough day? Totally normal.</h2>
 <p>Last session was below your usual. Even the best archers have days like that. Let's rebuild with some easy wins:</p>
 <ol><li><b>Move closer or use a bigger face</b> for 3 ends. Aim to get 2 out of 3 arrows in the red or better.</li><li><b>Pick one thing you control</b>, like your shot routine or follow-through, and give yourself a 👍 for each end where you did it.</li><li><b>Remember:</b> ${ev.text}</li></ol>
 <button class="btn" id="cbdone">I did my comeback session ✓</button></div>`}
function bindCB(){const b=$('#cbdone');if(b)b.onclick=()=>{S.comebackDone=true;S.comebackFor=done().slice(-1)[0].id;save();b.textContent='Awesome! Comeback badge earned 💪'}}

function score(){if(!cur){app.innerHTML=`<div class="card"><span class="kicker">New session</span><h1>Score it</h1><label for="rd">Round</label><select id="rd">${Object.keys(ROUNDS).map(r=>`<option>${r}</option>`).join('')}</select>
 <label for="dt">Date</label><input id="dt" type="date" value="${new Date().toISOString().slice(0,10)}"><button class="btn alt full" style="margin-top:14px" id="st">Start</button>
 <p class="small muted">Saved on this phone as you go (localStorage).</p></div>`+sessionList();$('#st').onclick=()=>{cur={id:'s'+Date.now(),date:$('#dt').value,round:$('#rd').value,ends:[[]],note:''};S.sessions.push(cur);save();score()};bindList();return}
 const R=ROUNDS[cur.round],e=cur.ends[cur.ends.length-1],fin=cur.ends.length==R.ends&&e.length==R.ape;
 app.innerHTML=`<div class="card"><div class="row"><span class="kicker">${cur.round}</span><b>${total(cur)} / ${R.max}</b></div>
 <h2>End ${cur.ends.length} of ${R.ends}</h2><div style="min-height:40px">${e.map(a=>`<span class="arrow ${col(a)}">${a}</span>`).join('')}</div>
 ${fin?`<p><b>All done!</b> 🎉</p><button class="btn full" id="fin">See my wins</button>`:`<div class="keypad">${['X','10','9','8','7','6','5','4','3','2','1','M'].map(k=>`<button class="${col(k)}" data-k="${k}" aria-label="score ${k}">${k}</button>`).join('')}<button class="k-u" id="undo" style="grid-column:span 2">↶ Undo</button><button class="k-u" id="quit" style="grid-column:span 2">Save & exit</button></div>`}</div>
 <div class="card"><table class="ends"><tr><th>End</th><th>Arrows</th><th>Sum</th><th>Run</th></tr>${cur.ends.map((x,i)=>`<tr><td>${i+1}</td><td>${x.map(a=>`<span class="arrow ${col(a)}">${a}</span>`).join('')}</td><td>${endSum(x)}</td><td>${cur.ends.slice(0,i+1).reduce((t,y)=>t+endSum(y),0)}</td></tr>`).join('')}</table></div>`;
 app.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>{if(e.length==R.ape){if(cur.ends.length>=R.ends)return;cur.ends.push([])}cur.ends[cur.ends.length-1].push(b.dataset.k);
  const l=cur.ends[cur.ends.length-1];if(l.length==R.ape)l.sort((a,b)=>val(b)-val(a)||(b=='X')-(a=='X'));if(l.length==R.ape&&cur.ends.length<R.ends)cur.ends.push([]);save();score()});
 if($('#undo'))$('#undo').onclick=()=>{let l=cur.ends[cur.ends.length-1];if(!l.length&&cur.ends.length>1){cur.ends.pop();l=cur.ends[cur.ends.length-1]}l.pop();save();score()};
 if($('#quit'))$('#quit').onclick=()=>{if(!cur.ends[cur.ends.length-1].length&&cur.ends.length>1)cur.ends.pop();cur=null;save();score()};
 if($('#fin'))$('#fin').onclick=()=>{cur=null;nav('home')}}
function sessionList(){return`<div class="card"><h3>Past sessions</h3>${allSessions().slice().reverse().map(s=>`<div class="list-item row"><div><b>${total(s)}</b> · ${s.round}<div class="small muted">${s.date} ${s.sample?'<span class="sample">sample data</span>':''}</div></div>${s.sample?'':`<button class="btn ghost" data-del="${s.id}" aria-label="delete">🗑</button>`}</div>`).join('')}</div>`}
function bindList(){app.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{S.sessions=S.sessions.filter(s=>s.id!=b.dataset.del);save();score()})}

function plot(){const p=S.plots,g=groupStats(p);let hint='Tap at least 3 arrows to see your group.';
 if(p.length>=3){const dx=g.cx,dy=g.cy,off=Math.hypot(dx,dy);
  hint=off<0.08?'Your group is nicely centred. No sight change needed! 🎯':`Group centre is ${dy<-0.04?'high':dy>0.04?'low':''}${Math.abs(dy)>0.04&&Math.abs(dx)>0.04?' and ':''}${dx<-0.04?'left':dx>0.04?'right':''}. <b>Move your sight ${[dy<-0.04?'UP':dy>0.04?'DOWN':'',dx<-0.04?'LEFT':dx>0.04?'RIGHT':''].filter(Boolean).join(' and ')}</b> ("follow the arrow"). Ask your coach how many clicks.`}
 app.innerHTML=`<div class="card"><span class="kicker">Arrow plotting</span><h2>Tap where each arrow hit</h2><div class="target-wrap">${targetSVG(p)}</div>
 <div class="stats" style="margin-top:8px"><div class="stat"><b>${p.length}</b>arrows</div><div class="stat"><b>${p.length?Math.round(p.reduce((t,a)=>t+val(ringScore(a.x,a.y)),0)/p.length*10)/10:'–'}</b>avg</div><div class="stat"><b>${p.length>=3?Math.round(g.r*100)/10:'–'}</b>group (rings)</div></div>
 <p>${hint}</p><p class="small muted">The purple ring shows your average spread around the group centre (+). Smaller means more consistent.</p>
 <button class="btn ghost" id="pu">↶ Undo</button> <button class="btn ghost" id="pc">Clear</button></div>`;
 $('#tface').onclick=ev=>{const s=$('#tface'),pt=s.createSVGPoint();pt.x=ev.clientX;pt.y=ev.clientY;const q=pt.matrixTransform(s.getScreenCTM().inverse());S.plots.push({x:+q.x.toFixed(3),y:+q.y.toFixed(3)});save();plot()};
 $('#pu').onclick=()=>{S.plots.pop();save();plot()};$('#pc').onclick=()=>{S.plots=[];save();plot()}}

function stats(){const d=done();if(!d.length){app.innerHTML=officialCard()+'<div class="card">Score a practice session to see practice stats.</div>';if($('#os'))$('#os').onchange=e=>{window._o=+e.target.value;stats()};return}
 const byRound={};d.forEach(s=>(byRound[s.round]=byRound[s.round]||[]).push(s));const rounds=Object.keys(byRound);
 const sel=window._r&&byRound[window._r]?window._r:rounds.sort((a,b)=>byRound[b].length-byRound[a].length)[0],ss=byRound[sel];
 const tot=ss.map(total),roll=tot.map((_,i)=>{const w=tot.slice(Math.max(0,i-2),i+1);return w.reduce((a,b)=>a+b)/w.length});
 const pb=tot.map((_,i)=>Math.max(...tot.slice(0,i+1))),last=ss[ss.length-1],ends=last.ends.map(endSum);
 const nE=Math.max(...ss.map(s=>s.ends.length)),endAvg=[...Array(nE)].map((_,i)=>{const v=ss.map(s=>s.ends[i]?endSum(s.ends[i]):null).filter(x=>x!=null);return v.reduce((a,b)=>a+b,0)/v.length});
 const third=Math.max(1,Math.floor(nE/3)),early=endAvg.slice(0,third).reduce((a,b)=>a+b)/third,late=endAvg.slice(-third).reduce((a,b)=>a+b)/third;
 const cons=ss.map(s=>sd(s.ends.map(endSum)));const real=findReal(S.profile);
 app.innerHTML=officialCard()+`<div class="card"><h2>Practice</h2><label for="rs">Round</label><select id="rs">${rounds.map(r=>`<option ${r==sel?'selected':''}>${r}</option>`).join('')}</select>${ss.some(s=>s.sample)?'<p class="small"><span class="sample">Includes sample data</span> Demo practice sessions, not real scores.</p>':''}</div>
 <div class="card"><h3>Score trend</h3>${lineChart([{name:'Score',data:tot,c:'#1d4ed8'},{name:'3-session average',data:roll,c:'#e0a800',dash:1},{name:'PB',data:pb,c:'#16a34a',w:1.5,dash:1}],{labels:ss.map(s=>s.date.slice(5))})}</div>
 <div class="card"><h3>Last session, end by end</h3>${bars(ends,ends.map((_,i)=>i+1))}</div>
 <div class="card"><h3>Consistency</h3><p class="small muted">How spread out your end scores were. Lower means steadier.</p>${lineChart([{name:'End spread (SD)',data:cons.map(x=>Math.round(x*10)/10),c:'#7c3aed'}],{labels:ss.map(s=>s.date.slice(5))})}</div>
 <div class="card"><h3>Early vs late ends</h3><div class="stats" style="grid-template-columns:1fr 1fr"><div class="stat"><b>${early.toFixed(1)}</b>first ${third} ends</div><div class="stat"><b>${late.toFixed(1)}</b>last ${third} ends</div></div>
 <p>${late>=early-0.3?'💪 You hold your score right to the end. Great focus!':`Your last ends average ${(early-late).toFixed(1)} points lower. Try a short reset routine (breathe, check your feet) before each of the last few ends.`}</p></div>
 <div class="card"><h3>Personal bests</h3>${Object.entries(pbs()).map(([r,v])=>`<div class="list-item row"><span>${r}</span><span><b>${v.score}</b> ${v.real?'<span class="real">official</span>':v.sample?'<span class="sample">sample</span>':''}</span></div>`).join('')}</div>
 ${real.length?`<div class="card"><h3>Official competition scores</h3>${lineChart([{name:'Official score',data:real.filter(r=>!r.incomplete).map(r=>r.score),c:'#166534'}],{labels:real.filter(r=>!r.incomplete).map(r=>normDate(r.date).slice(5))})}<p class="small muted">Mixed rounds; compare within the same round.</p></div>`:''}
 ${estRating(real)}
 <div class="card"><h3>Compare</h3><p>Default: <b>you vs. you</b>. This season's average is ${(tot.reduce((a,b)=>a+b)/tot.length).toFixed(0)}, and your first ${Math.min(3,tot.length)} sessions averaged ${(tot.slice(0,3).reduce((a,b)=>a+b)/Math.min(3,tot.length)).toFixed(0)}.</p><label><input type="checkbox" id="club" style="width:auto"> Show club & division averages (opt-in)</label><div id="clubout"></div></div>`;
 $('#rs').onchange=e=>{window._r=e.target.value;stats()};if($('#os'))$('#os').onchange=e=>{window._o=+e.target.value;stats()};
 $('#club').onchange=e=>{$('#clubout').innerHTML=e.target.checked?'<p class="small muted">Coming soon: club and division averages worked out from the public Archer\'s Diary results already on archerycalendars.com. Off by default for juniors.</p>':''}}
function offRounds(){const k=Object.keys(OFF).find(x=>x.toLowerCase()==(S.profile||'').toLowerCase());return k?OFF[k]:[]}
function officialCard(){const L=offRounds();if(!L.length)return'';const i=Math.min(window._o||0,L.length-1),o=L[i],good=o.ends.filter(e=>!e.flag),flagged=o.ends.filter(e=>e.flag);
 const sums=good.map(e=>endSum(e.arrows)),all=good.flatMap(e=>e.arrows),n=all.length||1,pc=f=>Math.round(all.filter(f).length/n*100);
 const dists=[...new Set(good.map(e=>e.dist))],third=Math.max(1,Math.floor(sums.length/3)),fe=sums.slice(0,third),le=sums.slice(-third),av=a=>a.reduce((x,y)=>x+y,0)/a.length;
 const fake={id:'off',date:o.date,round:o.round,ends:good.map(e=>e.arrows)};
 return`<div class="card"><span class="kicker">Official round · real arrows <span class="real">official</span></span><label for="os">Pick a round</label><select id="os">${L.map((x,j)=>`<option value="${j}" ${j==i?'selected':''}>${x.date} · ${x.round}</option>`).join('')}</select>
 <p class="small muted">${o.event} · ${good.length} ends · ${all.length} arrows · total ${sums.reduce((a,b)=>a+b,0)} · <a href="${o.url}" target="_blank" rel="noopener">Archer's Diary</a></p>
 ${flagged.length?`<p class="small"><span class="sample">Flagged</span> ${flagged.map(e=>e.dist).join(', ')}: ${flagged.length} end(s) with every arrow a miss. That's most likely a scoresheet error, so it's left out of these stats and isn't treated as real form.</p>`:''}
 <h3>End by end</h3>${bars(sums,sums.map((_,j)=>j+1),'#166534')}
 <h3>Arrow values</h3><div class="stats"><div class="stat"><b>${pc(a=>a=='X')}%</b>X</div><div class="stat"><b>${pc(a=>a=='10')}%</b>10</div><div class="stat"><b>${pc(a=>a=='9')}%</b>9</div></div>
 <h3 style="margin-top:12px">Per distance (avg per arrow)</h3>${dists.map(d=>{const a=good.filter(e=>e.dist==d).flatMap(e=>e.arrows);return`<div class="list-item row"><span>${d}</span><b>${(a.reduce((t,x)=>t+val(x),0)/a.length).toFixed(2)}</b></div>`}).join('')}
 <div class="stats" style="grid-template-columns:1fr 1fr 1fr;margin-top:10px"><div class="stat"><b>${av(fe).toFixed(1)}</b>first ${third} ends</div><div class="stat"><b>${av(le).toFixed(1)}</b>last ${third} ends</div><div class="stat"><b>${sd(sums).toFixed(1)}</b>end spread</div></div>
 <h3 style="margin-top:12px">Wins from this round</h3>${winsFor(fake).map(w=>`<div class="win"><i>${w[0]}</i><div>${w[1]}</div></div>`).join('')}</div>`}
function estRating(real){const rr=real.map(r=>({r,m:(r.notes||'').match(/Rating\s*([\d.]+);?\s*([A-Za-z ]+)?/)})).filter(x=>x.m);
 const off=rr.length?`<div class="list-item"><span class="real">official</span> Latest Archer's Diary rating: <b>${rr[rr.length-1].m[1]}</b>${rr[rr.length-1].m[2]?' · '+rr[rr.length-1].m[2].trim():''} <span class="small muted">(${rr[rr.length-1].r.round}, ${rr[rr.length-1].r.date})</span></div>`:'';
 return`<div class="card"><h3>AA rating & classification <span class="est">estimated · placeholder</span></h3>${off}
 <p class="small">The official Archery Australia ratings come from Archer's Diary's round tables. We haven't licensed or loaded those tables yet, so we don't calculate any rating or handicap ourselves. Any number above is copied straight from Archer's Diary. You need at least 3 official scores in the last 12 months. ${real.length>=3?`You have ${real.length} official results ✓`:`You have ${real.length} so far.`}</p>
 <div class="badges">${['White','Black','Blue','Red','Gold'].map(c=>`<div class="badge off"><i>🎽</i>${c}</div>`).join('')}</div><p class="small"><a href="https://www.archersdiary.com/RatingCalculator.aspx" target="_blank" rel="noopener">Check your official rating on Archer's Diary</a></p></div>`}

function me(){const b=badges(),url=location.href.split('#')[0]+'#share='+encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(shareData())))));
 app.innerHTML=`<div class="card"><span class="kicker">${S.profile}</span><h2>Badges</h2><div class="badges">${b.map(x=>`<div class="badge ${x[2]?'':'off'}"><i>${x[0]}</i>${x[1]}</div>`).join('')}</div></div>
 <div class="card"><span class="kicker">Evidence bank</span><h2>My best moments</h2><p class="small muted">Read these before a big shoot. You've done it before!</p>
 ${S.best.length?S.best.map(e=>`<div class="list-item"><b>${e.total}</b> · ${e.round} · ${e.date} ${e.sample?'<span class="sample">sample</span>':''}<div class="small">${e.text}</div></div>`).join(''):'<p>Nothing saved yet. Tap "Save to my evidence bank" on a good day.</p>'}
 <label for="bm">Add a moment in your own words</label><textarea id="bm" rows="2" placeholder="e.g. Stayed calm in the shoot-off at Kalamunda"></textarea><button class="btn ghost" id="bmadd" style="margin-top:6px">Add</button></div>
 <div class="card"><span class="kicker">Coach / parent</span><h2>Share a read-only view</h2><p class="small">Send this link to your coach or parent. They'll see progress and effort, but can't change anything.</p><input readonly value="${url}" id="sh" aria-label="share link"><button class="btn ghost" id="cp" style="margin-top:6px">Copy link</button> <a class="btn ghost" href="${url}" style="margin-top:6px">Preview</a></div>
 <div class="card"><button class="btn ghost" id="sw">Switch archer</button> <button class="btn ghost" id="rs">Reset demo</button></div>`;
 $('#bmadd').onclick=()=>{const t=$('#bm').value.trim();if(t){S.best.push({date:new Date().toISOString().slice(0,10),text:t,total:'⭐',round:'My note'});save();me()}};
 $('#cp').onclick=()=>{navigator.clipboard&&navigator.clipboard.writeText(url);$('#cp').textContent='Copied ✓'};
 $('#sw').onclick=()=>{S.profile=null;save();render()};$('#rs').onclick=()=>{localStorage.removeItem(KEY);location.reload()}}
function shareData(){const d=done();return{n:S.profile,s:d.slice(-10).map(s=>[s.date,s.round,total(s),arrows(s).length,s.sample?1:0]),b:badges().filter(x=>x[2]).map(x=>x[0]+' '+x[1]),st:streak()}}
function renderShare(){$('#tabs').hidden=true;let D;try{D=JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(location.hash.slice(7))))))}catch(e){app.innerHTML='<div class="card">This share link is invalid.</div>';return}
 const real=findReal(D.n);
 app.innerHTML=`<div class="card dark"><span class="kicker">Coach / parent view · read only</span><h1>${D.n}</h1><div class="stats"><div class="stat"><b>${D.s.length}</b>sessions</div><div class="stat"><b>${D.st}</b>wk streak</div><div class="stat"><b>${D.s.reduce((t,x)=>t+x[3],0)}</b>arrows</div></div></div>
 <div class="card"><h3>Progress</h3>${lineChart([{name:'Session score',data:D.s.map(x=>x[2]),c:'#1d4ed8'}],{labels:D.s.map(x=>x[0].slice(5))})}${D.s.some(x=>x[4])?'<p class="small"><span class="sample">Includes sample data</span></p>':''}</div>
 <div class="card"><h3>Badges earned</h3><p>${D.b.join(' · ')||'None yet'}</p></div>
 ${real.length?`<div class="card"><h3>Official results</h3>${real.slice(-5).reverse().map(r=>`<div class="list-item"><b>${r.score}</b> · ${r.round} · ${r.date}</div>`).join('')}</div>`:''}
 <div class="card"><h3>💬 How to help</h3><ul><li>Praise effort and routine, like "I loved how you reset after that end", rather than the score.</li><li>Ask "What went well today?" before "What went wrong?"</li><li>Compare with their own last month, not other kids.</li></ul></div>
 <a class="btn full" href="${location.href.split('#')[0]}">Open my own ScoreTool</a>`}

loadReal().then(()=>{nav(view)});
addEventListener('hashchange',()=>{if(location.hash.startsWith('#share='))render();else nav('home')});
