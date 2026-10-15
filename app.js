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
 out[9].ends=out[9].ends.map(e=>e.map(v=>v=='X'||v=='10'?'7':v=='9'?'6':v)); // one rough sample day
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
function endLabel(s,i){if(s.dists&&s.dists[i]){const d=s.dists[i];return`end ${s.dists.slice(0,i+1).filter(x=>x==d).length} at ${d}`}const m=(s.round||'').match(/(\d+m)/);return`end ${i+1}${m?' at '+m[1]:''}`}
function winsFor(s){const W=[],prev=done().filter(x=>x.round==s.round&&x.id!=s.id&&x.date<=s.date);const t=total(s);
 const ends=s.ends.map(endSum),best=Math.max(...ends),bi=ends.indexOf(best);
 W.push(['⭐',`Your best end was ${endLabel(s,bi)}: ${best} points (${s.ends[bi].join(' ')}).`]);
 const gold=arrows(s).filter(a=>val(a)>=9).length;if(gold)W.push(['🟡',`${gold} arrows in the gold. That's ${Math.round(gold/arrows(s).length*100)}% of your shots.`]);
 if(prev.length){const avg=prev.reduce((a,x)=>a+total(x),0)/prev.length;if(t>avg)W.push(['📈',`${Math.round(t-avg)} points above your usual for this round.`]);
  const p=Math.max(...prev.map(total));if(t>p)W.push(['🏆',`NEW personal best! ${t} beats your old best of ${p}.`]);
  const half=Math.ceil(ends.length/2),late=ends.slice(half);if(late.length&&late.reduce((a,b)=>a+b)/late.length>=ends.slice(0,half).reduce((a,b)=>a+b)/half)W.push(['💪',`You finished as strong as you started: your last ends (${endLabel(s,half)} to ${endLabel(s,ends.length-1)}) held up. Great stamina and focus.`])}
 if(sd(ends)<2.5)W.push(['🎯','Super consistent: your ends were all close together.']);
 W.push(['🏹',`You shot ${arrows(s).length} arrows. Every arrow is practice banked.`]);return W.slice(0,3)}
function badges(){const d=done(),p=pbs(),st=streak(),arr=d.reduce((t,s)=>t+arrows(s).length,0),xs=d.reduce((t,s)=>t+arrows(s).filter(a=>a=='X').length,0);
 return[['🏹','First session',d.length>=1],['💯','100 arrows',arr>=100],['🔥','3-week streak',st>=3],['❌','10 X\'s',xs>=10],['🏆','Beat a PB',d.some(s=>winsFor(s).some(w=>w[0]=='🏆'))],
 ['🎯','Tight group',S.plots.length>=6&&groupStats(S.plots).r<0.25],['🌈','Clean end (no misses)',d.some(s=>s.ends.some(e=>e.every(a=>a!='M')))],['📓','Evidence bank',S.best.length>=1]]}

/* ---------- charts (inline SVG) ---------- */
function lineChart(series,{h=170,labels=[],markers=[]}={}){const W=340,P=30;const all=series.flatMap(s=>s.data).filter(v=>v!=null);if(!all.length)return'<p class="muted">Not enough data yet.</p>';
 let mn=Math.min(...all),mx=Math.max(...all);if(mn==mx){mn-=1;mx+=1}const n=Math.max(...series.map(s=>s.data.length));
 const X=i=>P+(n<2?0:i*(W-P-10)/(n-1)),Y=v=>h-22-(v-mn)/(mx-mn)*(h-40);
 let g=`<svg viewBox="0 0 ${W} ${h}" role="img" aria-label="chart" width="100%"><line x1="${P}" y1="${h-22}" x2="${W}" y2="${h-22}" stroke="#94a3b8"/>`+
 `<text x="2" y="${Y(mx)+4}" font-size="11" fill="#475569">${Math.round(mx)}</text><text x="2" y="${Y(mn)+4}" font-size="11" fill="#475569">${Math.round(mn)}</text>`;
 for(const s of series){const pts=s.data.map((v,i)=>v==null?null:`${X(i)},${Y(v)}`).filter(Boolean);g+=`<polyline fill="none" stroke="${s.c}" stroke-width="${s.w||2.5}" ${s.dash?'stroke-dasharray="5 4"':''} points="${pts.join(' ')}"/>`;
  if(!s.dash)s.data.forEach((v,i)=>{if(v!=null)g+=`<circle cx="${X(i)}" cy="${Y(v)}" r="3.5" fill="${s.c}"/>`})}
markers.forEach(m=>{g+=`<line x1="${X(m.i)}" x2="${X(m.i)}" y1="8" y2="${h-22}" stroke="#7c3aed" stroke-dasharray="3 3"/><text x="${X(m.i)}" y="10" font-size="12" text-anchor="middle">⚙️</text><title>${m.t}</title>`});
 labels.forEach((l,i)=>{if(n<=12||i%Math.ceil(n/6)==0)g+=`<text x="${X(i)}" y="${h-6}" font-size="10" text-anchor="middle" fill="#475569">${l}</text>`});
 return g+'</svg>'+`<div class="small">${series.map(s=>`<span style="color:${s.c};font-weight:800">━</span> ${s.name}`).join(' &nbsp; ')}${markers.length?' &nbsp; ⚙️ setup change':''}</div>${markers.length?`<ul class="small" style="margin:4px 0 0;padding-left:18px">${markers.map(m=>`<li>${m.t}</li>`).join('')}</ul>`:''}`}
function bars(vals,labels,c='#1d4ed8',groups){const W=340,h=groups?165:150,mx=Math.max(...vals,1),bw=(W-20)/vals.length;
 return`<svg viewBox="0 0 ${W} ${h}" width="100%" role="img" aria-label="bar chart">${vals.map((v,i)=>`<rect x="${10+i*bw+2}" y="${h-20-v/mx*(h-40)}" width="${bw-4}" height="${v/mx*(h-40)}" rx="3" fill="${c}"/><text x="${10+i*bw+bw/2}" y="${h-24-v/mx*(h-40)}" font-size="10" text-anchor="middle" fill="#0f172a">${Math.round(v*10)/10}</text><text x="${10+i*bw+bw/2}" y="${h-6}" font-size="10" text-anchor="middle" fill="#475569">${labels[i]}</text>${groups&&(i==0||groups[i]!=groups[i-1])?`${i?`<line x1="${10+i*bw}" x2="${10+i*bw}" y1="2" y2="${h-4}" stroke="#94a3b8" stroke-dasharray="3 3"/>`:''}<text x="${10+i*bw+3}" y="11" font-size="11" font-weight="700" fill="#0f172a">${groups[i]}</text>`:''}`).join('')}</svg>`}


/* End chart coloured by WA ring zone of the end's average arrow (end total / arrows in the end):
   gold >=9, red 7 to <9, blue 5 to <7, black 3 to <5, white <3. For 6 arrows: gold 54+, red 42-53, blue 30-41, black 18-29, white <18. */
const ZONES=[[9,'#ffd84d','#b58900','Gold'],[7,'#d62828','#d62828','Red'],[5,'#2563eb','#2563eb','Blue'],[3,'#111','#111','Black'],[0,'#fff','#64748b','White']];
const zoneOf=a=>ZONES.find(z=>a>=z[0]);
function endChart(sums,apes,dists,title){const W=340,top=dists?20:4,h=top+110,n=sums.length,gap=n>24?1:2,bw=(W-4)/n,mx=Math.max(...apes)*10,showV=bw>=16;
 let g=`<svg viewBox="0 0 ${W} ${h+16}" width="100%" role="img" aria-label="${title||'End by end'} chart">`;
 if(dists){let st=0;for(let i=1;i<=n;i++){if(i==n||dists[i]!=dists[st]){const x0=2+st*bw,x1=2+i*bw;g+=`<rect x="${x0+0.5}" y="1" width="${x1-x0-1}" height="15" rx="3" fill="#eef2f7"/><text x="${(x0+x1)/2}" y="12" font-size="10" font-weight="700" text-anchor="middle" fill="#0f172a">${dists[st]}</text>`;st=i}}}
 sums.forEach((v,i)=>{const a=v/(apes[i]||1),z=zoneOf(a),bh=Math.max(2,v/mx*(h-top-14)),x=2+i*bw+gap/2,y=h-bh;const lbl=dists?`end ${dists.slice(0,i+1).filter(d=>d==dists[i]).length} at ${dists[i]}`:`end ${i+1}`;
  g+=`<rect x="${x}" y="${y}" width="${Math.max(1,bw-gap)}" height="${bh}" rx="1.5" fill="${z[1]}" stroke="${z[2]}" stroke-width="${z[3]=='White'?1:0}" style="cursor:pointer" data-t="${lbl}: ${v} (avg ${a.toFixed(1)} per arrow, ${z[3]})" onclick="this.closest('.ec').querySelector('.ecap').textContent=this.dataset.t"><title>${lbl}: ${v}</title></rect>`;
  if(showV)g+=`<text x="${x+(bw-gap)/2}" y="${y-3}" font-size="8" text-anchor="middle" fill="#475569">${v}</text>`});
 g+=`<text x="2" y="${h+12}" font-size="9" fill="#64748b">1</text><text x="${W-2}" y="${h+12}" font-size="9" text-anchor="end" fill="#64748b">${n}</text></svg>`;
 return`<div class="ec">${g}<p class="small ecap" style="margin:2px 0;min-height:1.2em">${showV?'':'Tap a bar to see its score.'}</p><div class="small" style="display:flex;flex-wrap:wrap;gap:4px 10px">${ZONES.map(z=>`<span><i style="display:inline-block;width:10px;height:10px;background:${z[1]};border:1px solid ${z[2]};vertical-align:middle"></i> ${z[3]}${z[0]==9?' 9+':z[0]?` ${z[0]}–${ZONES[ZONES.indexOf(z)-1][0]}`:' <3'}</span>`).join('')}</div><p class="small muted" style="margin:2px 0 0">Colour = ring of the end's average arrow (end total ÷ arrows).${Math.max(...apes)==6?' For 6 arrows: gold 54+, red 42–53, blue 30–41, black 18–29, white under 18.':''}</p></div>`}
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
let view=/^#plot/.test(location.hash)?'score':'home',cur=null;
function nav(v){if(v=='plot')v='score';view=v;document.querySelectorAll('#tabs button').forEach(b=>b.setAttribute('aria-current',b.dataset.v==v));render();scrollTo(0,0)}
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>nav(b.dataset.v));
function gate(){return`<div class="card dark gate"><span class="kicker">Members only</span><h1>Unlock ScoreTool</h1><p>Track every arrow, see your progress, and celebrate your wins.</p>
<ul><li>Arrow-by-arrow scoring with AA rounds</li><li>Your progress charts and personal bests</li><li>Badges, streaks and "Wins of the day"</li><li>Arrow plotting with group centre</li><li>Coach/parent share link</li></ul>
<p class="small muted">Payments aren't switched on in this demo. Card, Apple Pay and Google Pay via Stripe will come later.</p>
<button class="btn full" id="unlock">Demo unlock (free, no payment)</button></div>`}
function pickProfile(){return`<div class="card"><span class="kicker">Welcome</span><h1>Who's shooting?</h1><p class="muted">Pick an archer to load their official results from Archer's Diary.</p>
${ARCHERS.map(n=>`<button class="btn ghost full" style="margin:6px 0" data-p="${n}">${n}</button>`).join('')}${csvNote()}</div>`}
function csvNote(){return csvState=='ok'?`<p class="small"><span class="real">Official</span> results loaded from Archer's Diary.</p>`:
 `<p class="small"><span class="sample">No scores yet</span> No official results imported yet. The Archer's Diary import is still being collected, so official results will appear here once it's added.</p>`}
function render(){seedNotes();regCustom();
 if(location.hash.startsWith('#share=')) return renderShare();
 if(!S.unlocked){app.innerHTML=gate();$('#unlock').onclick=()=>{S.unlocked=true;save();render()};$('#tabs').hidden=true;return}
 $('#tabs').hidden=false;
 if(!S.profile){app.innerHTML=pickProfile();app.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{S.profile=b.dataset.p;if(!S.sessions.length)S.sessions=sampleSessions();save();nav('home')});return}
 if(view=='plot'){view='score'}({home,score,stats,diary,me,squad})[view]()}

/* ---------- latest real shoot ---------- */
const ld=d=>new Date(d).toLocaleDateString('en-CA');const today=()=>new Date().toLocaleDateString('en-CA');
function realShoots(){const off=findReal(S.profile||'').map(r=>({kind:'official',date:normDate(r.date),round:r.round,score:r.score,incomplete:!!r.incomplete,r}));
 const pr=done().filter(s=>!s.sample).map(s=>({kind:'practice',date:s.date,round:s.round,score:total(s),incomplete:false,s}));return[...off,...pr].sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:0)}
function latestShoot(){const L=realShoots();if(!L.length)return null;const x=L[L.length-1],prior=L.slice(0,-1).filter(y=>y.round==x.round&&!y.incomplete);
 const pb=prior.length?Math.max(...prior.map(y=>y.score)):null,u=prior.slice(-5),usual=u.length?u.reduce((a,y)=>a+y.score,0)/u.length:null;
 let cat=x.incomplete?'incomplete':!prior.length?'first':x.score>pb?'pb':x.score>=pb*0.98?'great':x.score<usual*0.95?'tough':'solid';
 const diff=cat=='pb'?x.score-pb:cat=='great'?pb-x.score:Math.abs(Math.round((usual||x.score)-x.score));return{...x,cat,pb,usual:usual&&Math.round(usual),diff}}
function fill(t,v){return t.replace(/\{(\w+)\}/g,(_,k)=>v[k]??'')}
function rot(key,list,n=1){S.rot=S.rot||{};const r=S.rot[key]||{shoot:null,i:-1};const sk=S._shootKey;if(r.shoot!==sk){r.i=(r.i+n)%list.length;r.shoot=sk;S.rot[key]=r;save()}return[...Array(n)].map((_,k)=>list[(r.i+k)%list.length])}
function coachCard(L){const cat=L.cat=='first'?'solid':L.cat,M=(window.COACH_MSG||{})[cat];if(!M)return'';S._shootKey=L.date+'|'+L.round+'|'+L.score;
 const msg=rot('m_'+cat,M.messages)[0],nud=M.nudges.length?rot('n_'+cat,M.nudges,1):[];
 const fact=L.cat=='pb'?`${L.score} on ${L.round}, up from ${L.pb}.`:L.cat=='great'?`${L.score} on ${L.round}, just ${L.diff} off your PB of ${L.pb}.`:L.cat=='tough'?`${L.score} on ${L.round}, ${L.diff} below your usual of ${L.usual}.`:L.cat=='incomplete'?`${L.round}: round not finished, so it isn't counted in PBs or charts.`:L.cat=='first'?`${L.score} on ${L.round}. Your first score on this round, so it's the PB to beat.`:`${L.score} on ${L.round}, around your usual of ${L.usual}.`;
 const border=L.cat=='tough'?'border:3px solid var(--gold)':(L.cat=='pb'||L.cat=='great')?'border:3px solid #16a34a':'';
 return`<div class="card" style="${border}"><span class="kicker">${M.kicker} · ${L.date} <span class="real">${L.kind}</span></span><h2>${msg}</h2><p class="small muted">${fact}</p>
 ${L.cat=='tough'&&L.pb?`<p>Your best on this round is <b>${L.pb}</b>. You've done it before.</p>`:''}${nud.length?`<h3>Think about it</h3><ul>${nud.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}${L.cat=='tough'?'<p class="small"><b>Your coach can help you plan your next session.</b></p>':''}${L.cat=='pb'||L.cat=='great'?'<div style="font-size:28px;text-align:center">🎉🏹🎯</div>':''}</div>`}
function latestWins(L){if(L.kind=='practice')return{s:L.s,label:L.s.round};const o=offRounds().find(x=>normDate(x.date)==L.date);
 if(o){const ge=o.ends.filter(e=>!e.flag);return{s:{id:'off',date:L.date,round:o.round,ends:ge.map(e=>e.arrows),dists:ge.map(e=>e.dist)},label:o.round}}return null}
/* ---------- arrow volume (300-a-day idea from George Ryles notes; not shown) ---------- */
function dayArrows(){const m={};const add=(d,n)=>{if(n>0)m[d]=(m[d]||0)+n};S.sessions.filter(s=>!s.sample).forEach(s=>add(s.date,arrows(s).length));
 offRounds().forEach(o=>add(normDate(o.date),o.ends.reduce((t,e)=>t+e.arrows.length,0)));Object.entries(S.vol||{}).forEach(([d,n])=>add(d,n));return m}
function volBadges(mm){const m=mm||dayArrows(),days=Object.keys(m).sort(),mx=Math.max(0,...Object.values(m)),B=window.VOL_BADGES;
 let best=0,run=0,prev=null;days.forEach(d=>{if(m[d]>=300){run=prev&&Math.round((new Date(d)-new Date(prev))/864e5)==1&&m[prev]>=300?run+1:1;best=Math.max(best,run)}prev=d});
 let wk=0;days.forEach(d=>{let t=0;for(let i=0;i<7;i++){t+=m[ld(new Date(d).getTime()-i*864e5)]||0}wk=Math.max(wk,t)});
 return[...B.daily.map(b=>[b[1],b[2],mx>=b[0],b[3]]),...B.streak.map(b=>[b[1],b[2],best>=b[0],b[3]]),...B.weekly.map(b=>[b[1],b[2],wk>=b[0],b[3]])]}
function volCard(){const ad=(S.vol||{})[today()]||0,g=S.goal||(/logan/i.test(S.profile||'')?300:0),n=dayArrows()[today()]||0,p=g?Math.min(1,n/g):0,C=2*Math.PI*42;S._shootKey=S._shootKey||today();const nd=rot('vol',window.VOL_NUDGES)[0];
 return`<div class="card"><span class="kicker">Today's arrows</span><div class="row" style="gap:12px;align-items:center"><button id="ringbtn" aria-label="${n} arrows today${g?" of "+g:""}. Tap to edit added arrows" style="background:none;border:0;padding:0;cursor:pointer"><svg viewBox="0 0 100 100" width="110" height="110" aria-hidden="true"><circle cx="50" cy="50" r="42" fill="none" stroke="#e5e7eb" stroke-width="10"/><circle cx="50" cy="50" r="42" fill="none" stroke="var(--gold,#e0a800)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${C*p} ${C}" transform="rotate(-90 50 50)"/><text x="50" y="50" text-anchor="middle" font-size="22" font-weight="700" fill="#0f172a">${n}</text><text x="50" y="66" text-anchor="middle" font-size="10" fill="#475569">${g?"of "+g:"arrows"}</text></svg></button>
 <div style="flex:1;min-width:0"><label class="small" for="goal" style="display:block">Daily goal (set by you or your coach): <input id="goal" type="number" min="0" max="1000" step="10" value="${g||""}" placeholder="–" style="width:70px;display:inline-block;padding:4px"> arrows a day</label><p class="small" style="margin:6px 0">Shot some without scoring? Add them:</p><div style="display:flex;flex-wrap:wrap;gap:6px">${[6,12,36,72].map(k=>`<button class="btn ghost" data-vol="${k}" style="padding:6px 10px">+${k}</button>`).join('')}<button class="btn ghost" data-vol="-6" style="padding:6px 10px" aria-label="remove 6">−6</button></div></div></div><p class="small muted" style="margin:6px 0 0">${n-ad} from rounds + ${ad} added today. Tap the number to edit.</p><div id="vedit" hidden style="margin-top:6px"><label for="vset" class="small">Arrows added today</label><div style="display:flex;gap:6px"><input id="vset" type="number" min="0" max="2000" inputmode="numeric" value="${ad}" style="flex:1"><button class="btn" id="vsave">Set</button></div></div><button class="btn ghost" id="vreset" style="margin-top:6px;padding:6px 10px">Reset today</button><p class="small muted" style="margin:8px 0 0">💡 ${nd}</p></div>`}
function iconRow(b,size=26){return`<div class="irow" style="position:relative"><div role="list" style="display:flex;gap:6px;overflow-x:auto;white-space:nowrap;padding:4px 2px;scrollbar-width:thin">${b.map(x=>{const nm=x[1]+(x[2]?'':' (locked)');return`<span role="listitem" tabindex="0" aria-label="${nm}" title="${nm}" data-tip="${nm}" onclick="badgeTip(this)" onkeydown="if(event.key=='Enter')badgeTip(this)" style="flex:0 0 auto;font-size:${size}px;line-height:1;cursor:pointer;${x[2]?'':'filter:grayscale(1);opacity:.35'}">${x[0]}</span>`}).join('')}</div><span class="btip" hidden style="position:absolute;z-index:5;background:#0f172a;color:#fff;font-size:12px;padding:3px 8px;border-radius:6px;white-space:nowrap;pointer-events:none"></span></div>`}
function badgeTip(el){const w=el.closest('.irow'),t=w.querySelector('.btip'),r=el.getBoundingClientRect(),q=w.getBoundingClientRect();t.textContent=el.dataset.tip;t.hidden=false;t.style.top=(r.bottom-q.top+4)+'px';t.style.left=Math.max(0,Math.min(q.width-t.offsetWidth,r.left-q.left+r.width/2-t.offsetWidth/2))+'px';clearTimeout(w._t);w._t=setTimeout(()=>t.hidden=true,1800)}
function shelf(){const b=[...volBadges(),...badges()];return`<div class="card"><span class="kicker">Badges shelf</span>${iconRow(b)}</div>`}
function home(){const d=done(),real=findReal(S.profile),L=latestShoot();
 let h=`<div class="card dark"><span class="kicker">G'day ${S.profile.split(' ')[0]}</span><h1>Your progress zone</h1>
 <div class="stats"><div class="stat"><b>${d.length}</b>sessions</div><div class="stat"><b>${streak()}</b>wk streak</div><div class="stat"><b>${d.reduce((t,s)=>t+arrows(s).length,0)}</b>arrows</div></div>
 <p class="small muted" style="margin:10px 0 0">You're compared with <b>your own past self</b>, not with anyone else.</p>${kidLine()}</div>`;
 if(L)h+=coachCard(L);
 const W=L&&latestWins(L);
 if(W){h+=`<div class="card"><span class="kicker">Wins of the day · ${L.date} <span class="real">${L.kind}</span></span><h2>${W.label}</h2>${winsFor(W.s).map(w=>`<div class="win"><i>${w[0]}</i><div>${w[1]}</div></div>`).join('')}<button class="btn ghost" id="bank" style="margin-top:8px">⭐ Save to my evidence bank</button></div>`}
 else if(L){h+=`<div class="card"><span class="kicker">Wins of the day · ${L.date} <span class="real">${L.kind}</span></span><h2>${L.round}: ${L.score}</h2><p class="small muted">No arrow-by-arrow data for this shoot yet, so end-by-end wins aren't available.</p></div>`}
 else{const last=d[d.length-1];if(last)h+=`<div class="card"><span class="kicker">Wins of the day · ${last.date} <span class="sample">sample</span></span><h2>3 things you did well</h2>${winsFor(last).map(w=>`<div class="win"><i>${w[0]}</i><div>${w[1]}</div></div>`).join('')}</div>`}
 const dr=S.sessions.filter(x=>!x.sample&&ROUNDS[x.round]&&!(x.ends.length==ROUNDS[x.round].ends&&x.ends[x.ends.length-1].length==ROUNDS[x.round].ape)&&arrowsIn(x)>0);if(dr.length)h+=`<div class="card" style="border:2px solid #2563eb"><span class="kicker">Unfinished rounds</span>${dr.map(x=>`<div class="list-item row"><span><b>${esc(x.round)}</b><span class="small muted"> · ${fmtD(x.date)} · ${total(x)} so far (${arrowsIn(x)} arrows)</span></span><button class="btn" data-resume="${x.id}" style="padding:4px 10px">Resume</button></div>`).join('')}</div>`;h+=volCard()+shelf();
 h+=`<div class="card"><span class="kicker">Official results · Archer's Diary</span><h2>Competition scores</h2>${real.length?real.slice(-6).reverse().map(r=>`<div class="list-item"><div class="row"><b>${r.score}</b><span class="real">official</span></div><div class="small">${r.round} · ${r.event} · ${r.date}${r.division?' · '+r.division:''}${r.incomplete?' <span class="sample">incomplete, not counted</span>':''}</div>${r.url?`<a class="small" href="${r.url}" target="_blank" rel="noopener">Source</a>`:''}${noteBox(r)}</div>`).join(''):csvNote()}</div>`;
 h+=(window.rankCard?rankCard(S.profile):"");h+=`<button class="btn ghost full" onclick="nav('squad')" style="margin-bottom:8px">👥 My squad</button>`;h+=noteInsights();h+=`<button class="btn alt full" id="go">✍️ Start a new session</button>`;app.innerHTML=h;
 $('#go').onclick=()=>nav('score');
 if($('#bank'))$('#bank').onclick=()=>{S.best.push({date:L.date,text:winsFor(W.s).map(w=>w[1]).join(' '),total:L.score,round:L.round});save();$('#bank').textContent='Saved ✓'};

 if($('#goal'))$('#goal').onchange=e=>{const v=Math.max(0,Math.min(1000,+e.target.value||0));S.goal=v;save();home()};if($('#ringbtn'))$('#ringbtn').onclick=()=>{const e=$('#vedit');e.hidden=!e.hidden;if(!e.hidden)$('#vset').focus()};
 if($('#vsave'))$('#vsave').onclick=()=>{S.vol=S.vol||{};S.vol[today()]=Math.max(0,Math.min(2000,Math.round(+$('#vset').value||0)));save();home()};
 if($('#vreset'))$('#vreset').onclick=()=>{if(!confirm("Reset today's added arrows?"))return;S.vol=S.vol||{};delete S.vol[today()];save();home()};app.querySelectorAll('[data-resume]').forEach(b=>b.onclick=()=>{cur=S.sessions.find(x=>x.id==b.dataset.resume);history.pushState({scoring:1},'');nav('score')});app.querySelectorAll('[data-vol]').forEach(b=>b.onclick=()=>{S.vol=S.vol||{};const t=today();S.vol[t]=Math.max(0,(S.vol[t]||0)+ +b.dataset.vol);save();home()});bindNotes()}


/* Source refs (George Ryles notes) are kept in code only, never shown. Wording is our own. */
function cite(c){return''}
function tip(t,c){return`<div class="list-item">${t}${cite(c)}</div>`}
const KID=[['Every arrow you shoot is part of your story. Nice work showing up!',''],['What was your favourite shot today?',''],['Look back a few months and see how far you\'ve come.',''],['Tricky days still count. You kept going!','']];
function kidLine(){const k=KID[Math.floor(Date.now()/864e5)%KID.length];return`<p style="margin:10px 0 0">💬 ${k[0]}${cite(k[1]+', in simple words')}</p>`}
function roundFacts(sums,good,all,dists,fe,le,EL){const T=[],av=a=>a.reduce((x,y)=>x+y,0)/(a.length||1),m=av(sums),f1=x=>x.toFixed(1);
 if(le.length&&av(fe)-av(le)>=1)T.push(`Your last ${le.length} ends (${EL(sums.length-le.length)} to ${EL(sums.length-1)}) averaged ${f1(av(fe)-av(le))} points lower than your first ${fe.length} (${f1(av(le))} vs ${f1(av(fe))}).`);
 else if(le.length)T.push(`Your last ${le.length} ends averaged ${f1(av(le))}, compared with ${f1(av(fe))} for your first ${fe.length}.`);
 if(sums.length>1)T.push(`Your best end was ${EL(sums.indexOf(Math.max(...sums)))} with ${Math.max(...sums)}. Your lowest was ${EL(sums.indexOf(Math.min(...sums)))} with ${Math.min(...sums)}.`);
 const dv=dists.map(d=>{const a=good.filter(e=>e.dist==d).flatMap(e=>e.arrows);return{d,n:parseFloat(d)||0,v:a.reduce((t,x)=>t+val(x),0)/(a.length||1)}}).sort((a,b)=>b.n-a.n);
 if(dv.length>1)T.push(`Average per arrow: ${dv.map(x=>`${x.d} ${x.v.toFixed(2)}`).join(', ')}.`);
 const ms=all.filter(a=>a=='M').length;if(ms)T.push(`${ms} miss${ms>1?'es':''} this round.`);
 return T}
function ryTips(sums,good,all,dists,fe,le,EL){const T=roundFacts(sums,good,all,dists,fe,le,EL);
 return`<h3 style="margin-top:12px">Your round in numbers</h3>${T.map(t=>`<div class="list-item">${t}</div>`).join('')}<p class="small" style="margin-top:6px"><b>Worth a chat with your coach?</b></p>`}

const TAGS=[['😴','Tired',/tired|sleep|exhaust|fatigu/i],['🌬️','Wind/weather',/wind|rain|hot|heat|cold|weather|storm/i],['😬','Nerves',/nerv|anxious|shak|pressure/i],['🔧','Gear change',/new (arrow|bow|sight|string|tab|release)|gear|changed|tuned|equipment/i],['🩹','Injury',/injur|sore|pain|hurt/i],['⏸️','Incomplete',/didn.?t (finish|complete)|incomplete|retired|stopped early/i]];
function seedNotes(){if(S.notes)return;S.notes={'sample9':'SAMPLE: windy and felt tired','sample5':'SAMPLE: windy afternoon','sample2':'SAMPLE: bad sleep, felt tired','o:2026-10-11|WA 90/1440':"Didn't complete the round"};save()}
const noteKey=r=>r.id||('o:'+normDate(r.date)+'|'+r.round);
const tagsOf=t=>TAGS.filter(x=>x[2].test(t||''));
function chips(t){return tagsOf(t).map(x=>`<span class="sample" style="background:#eef2ff;color:#1e3a8a;margin-right:4px">${x[0]} ${x[1]}</span>`).join('')}
function noteBox(r){const k=noteKey(r),t=(S.notes||{})[k]||'';return`<label class="small muted" style="display:block;margin-top:6px">How did you shoot? <textarea data-n="${k.replace(/"/g,'&quot;')}" rows="2" style="width:100%;box-sizing:border-box;font:inherit" placeholder="e.g. felt tired, windy, new arrows, didn't finish">${t.replace(/</g,'&lt;')}</textarea></label><div class="chips">${chips(t)}</div>`}
function bindNotes(){app.querySelectorAll('[data-n]').forEach(el=>el.oninput=()=>{S.notes=S.notes||{};S.notes[el.dataset.n]=el.value;save();el.closest('label').nextElementSibling.innerHTML=chips(el.value)})}
function noteInsights(){const items=[];const rel=(list,sc)=>{const g={};list.forEach(x=>(g[x.round]=g[x.round]||[]).push(x));for(const r in g){const a=g[r],m=a.reduce((t,x)=>t+sc(x),0)/a.length;if(m)a.forEach(x=>items.push({pct:(sc(x)/m-1)*100,t:(S.notes||{})[noteKey(x)]}))}};
 rel(done(),total);rel(findReal(S.profile||'').filter(r=>!r.incomplete),r=>r.score);
 const out=TAGS.map(([e,n])=>{const w=items.filter(i=>tagsOf(i.t).some(x=>x[1]==n)),o=items.filter(i=>!tagsOf(i.t).some(x=>x[1]==n));if(w.length<2||!o.length)return'';const d=w.reduce((a,b)=>a+b.pct,0)/w.length-o.reduce((a,b)=>a+b.pct,0)/o.length;
  return`<div class="list-item">${e} On <b>${n.toLowerCase()}</b> days you score <b>${Math.abs(d).toFixed(1)}% ${d<0?'less':'more'}</b> than your usual for that round (${w.length} sessions).</div>`}).filter(Boolean);
 return`<div class="card"><span class="kicker">From your notes</span><h3>What your notes show</h3>${out.length?out.join('')+'<p class="small muted">Compared with your own average for the same round. Notes starting "SAMPLE" are demo notes.</p>':'<p>Add a note under each score (tired, windy, nerves, new gear, sore, didn\'t finish). Once 2 sessions share a tag, you\'ll see how it affects your scores.</p>'}</div>`}

let fix=null;
const isSix=R=>/6-ring/.test(R.face||'');const isSpot=R=>/3-spot/.test(R.face||'');
const faceVB=R=>isSpot(R)?'-0.54 -0.54 1.08 1.08':isSix(R)?'-0.64 -0.64 1.28 1.28':'-1.04 -1.04 2.08 2.08';
/* face for a given end: custom rounds have distance blocks, each with its own face */
function faceR(R,ei){if(!R.blocks)return R;let k=0;for(const b of R.blocks){k+=+b.ends;if(ei<k)return{face:`${b.size}cm ${b.type}`,dist:b.dist+b.unit}}const b=R.blocks[R.blocks.length-1];return{face:`${b.size}cm ${b.type}`,dist:b.dist+b.unit}}
/* custom practice rounds (practice only, never counted for classification) */
function regCustom(){(S.customRounds||[]).forEach(c=>{const ends=c.blocks.reduce((t,b)=>t+ +b.ends,0);ROUNDS[c.name]={ends,ape:+c.ape,face:c.blocks.map(b=>`${b.size}cm ${b.type}`).join(' / '),max:ends*c.ape*10,custom:true,practice:true,blocks:c.blocks,xs:c.xs}})}
function faceSVG(pts,id,vb,R,extra=''){const rings=[['#fff','#333'],['#fff','#333'],['#111','#fff'],['#111','#fff'],['#2563eb','#111'],['#2563eb','#111'],['#d62828','#111'],['#d62828','#111'],['#ffd84d','#111'],['#ffd84d','#111']];
 let g=`<svg id="${id}" viewBox="${vb}" width="100%" style="touch-action:none;display:block" role="img" aria-label="Target face, tap where the arrow landed">`;
 rings.forEach((c,i)=>{if(R&&isSix(R)&&i<4)return;if(R&&isSpot(R)&&i<5)return;g+=`<circle r="${1-i*0.1}" fill="${c[0]}" stroke="${c[1]}" stroke-width="0.006"/>`});g+=`<circle r="0.05" fill="none" stroke="#111" stroke-width="0.005"/>`;
 pts.forEach(p=>g+=`<circle cx="${p.x}" cy="${p.y}" r="0.025" fill="${p.sel?'#a855f7':'#22c55e'}" stroke="#000" stroke-width="0.008"/>`);return g+extra+'</svg>'}
function plotScore(x,y,R){const d=Math.hypot(x,y)-0.012;/* line cutter: arrow edge touching a line scores higher */const lim=R&&isSpot(R)?0.5:R&&isSix(R)?0.6:1;if(d>lim)return'M';if(d<=0.05)return R&&R.xs===false?'10':'X';return String(Math.min(10,10-Math.floor(Math.max(0,d)*10)))}
function sortEnd(i){const E=cur.ends[i],P=(cur.pos=cur.pos||[])[i]||[];const pr=E.map((a,k)=>[a,P[k]||null]).sort((a,b)=>val(b[0])-val(a[0])||(b[0]=='X')-(a[0]=='X'));cur.ends[i]=pr.map(x=>x[0]);cur.pos[i]=pr.map(x=>x[1])}
function putArrow(k,xy){const R=ROUNDS[cur.round];cur.pos=cur.pos||[];
 if(fix){const[i,j]=fix;cur.ends[i][j]=k;(cur.pos[i]=cur.pos[i]||[])[j]=xy||null;if(cur.ends[i].length==R.ape)sortEnd(i);fix=null;if(fixRet||(sv=='entry'&&i<cur.ends.length-1))sv='sheet';fixRet=false;save();score();return}
 let e=cur.ends[cur.ends.length-1];if(e.length==R.ape){if(cur.ends.length>=R.ends)return;cur.ends.push([]);e=cur.ends[cur.ends.length-1]}
 const i=cur.ends.length-1;e.push(k);(cur.pos[i]=cur.pos[i]||[])[e.length-1]=xy||null;
 if(e.length==R.ape){sortEnd(i);justDone=true}save();score()}
let crEdit=null,sv='sheet',justDone=false,fixRet=false;
function score(){regCustom();if(!cur){if(crEdit)return roundForm();const mine=(S.customRounds||[]).map(c=>c.name),std=Object.keys(ROUNDS).filter(r=>!ROUNDS[r].custom);
 app.innerHTML=`<div class="card"><span class="kicker">New session</span><h1>Score it</h1><label for="rd">Round</label><select id="rd"><optgroup label="Standard rounds">${std.map(r=>`<option ${r==S.lastRound?'selected':''}>${esc(r)}</option>`).join('')}</optgroup>${mine.length?`<optgroup label="My rounds">${mine.map(r=>`<option ${r==S.lastRound?'selected':''}>${esc(r)}</option>`).join('')}</optgroup>`:''}<option value="__new">+ Create my own practice round</option></select>
 <label for="dt">Date</label><input id="dt" type="date" value="${today()}"><button class="btn alt full" style="margin-top:14px" id="st">Start</button>
 <p class="small muted">Saved on this phone as you go (localStorage).</p></div>${mine.length?`<div class="card"><h3>My rounds</h3>${(S.customRounds||[]).map((c,i)=>`<div class="list-item row"><div><b>${esc(c.name)}</b><div class="small muted">${ROUNDS[c.name].ends} ends × ${c.ape} · max ${ROUNDS[c.name].max} · practice</div></div><span><button class="btn ghost" data-ce="${i}" style="padding:4px 10px">Edit</button> <button class="btn ghost" data-cd="${i}" style="padding:4px 10px">Delete</button></span></div>`).join('')}</div>`:''}`+sessionList();
 $('#rd').onchange=e=>{if(e.target.value=='__new'){crEdit={i:-1};score()}};
 app.querySelectorAll('[data-ce]').forEach(b=>b.onclick=()=>{crEdit={i:+b.dataset.ce};score()});
 app.querySelectorAll('[data-cd]').forEach(b=>b.onclick=()=>{const c=S.customRounds[+b.dataset.cd];if(!confirm(`Delete "${c.name}"? Sessions already shot keep their scores.`))return;S.customRounds.splice(+b.dataset.cd,1);save();score()});
 $('#st').onclick=()=>{if($('#rd').value=='__new')return;S.lastRound=$('#rd').value;sv='entry';justDone=false;cur={id:'s'+Date.now(),date:$('#dt').value,round:$('#rd').value,ends:[[]],pos:[[]],note:''};S.sessions.push(cur);save();history.pushState({scoring:1},'');score()};bindList();return}
 const R=ROUNDS[cur.round],last=cur.ends[cur.ends.length-1],fin=cur.ends.length==R.ends&&last.length==R.ape,P=cur.pos||[];
 if(sv=='sheet'&&!fix)return scoreSheet(R,fin);
 const full=last.length==R.ape,ei=fix?fix[0]:(full&&(justDone||fin))?cur.ends.length-1:full?cur.ends.length:cur.ends.length-1,e=cur.ends[ei]||[];
 const FR=faceR(R,ei),vb=faceVB(FR),d=distOf(FR,cur.round);
 const shown=fix?[...(P[fix[0]]||[])].map((p,j)=>p&&{...p,sel:j==fix[1]}).filter(Boolean):(P[ei]||[]).filter(Boolean);
 const endDone=e.length==R.ape,prog=cur.ends.slice(0,ei+1).reduce((t,y)=>t+endSum(y),0),locked=endDone&&!fix;
 const rows=[['9','10',R.xs===false?'':'X'],['6','7','8'],...(isSpot(FR)?[['M']]:isSix(FR)?[['M','5']]:[['3','4','5'],['M','1','2']])];
 const sm=typeof sightFor=='function'&&d?sightFor(d):'';
 app.innerHTML=`<div class="ad"><div class="ad-title">Score End${R.custom?' · practice':''}</div>
 <div class="ad-head"><div class="ad-left"><div class="ad-box">${esc(S.profile)}</div><div class="ad-box"><div class="row"><b>End ${ei+1}</b><b>${esc(d||'')}</b></div><div>${esc(faceName(FR))}</div>${d?`<div class="small" id="sighttag">Sight ${sm?esc(sm):'not set'}</div>`:''}</div></div>
 <div class="ad-right"><div class="ad-num"><span>End</span><b>${endSum(e)}</b></div><div class="ad-num"><span>Prog</span><b>${prog}</b></div></div></div>
 <div class="ad-chips" aria-label="Arrows this end">${Array.from({length:R.ape},(_,j)=>e[j]!=null?`<span class="adb ${col(e[j])}" role="button" tabindex="0" data-fix="${ei},${j}" aria-label="fix arrow ${e[j]}"${fix&&fix[0]==ei&&fix[1]==j?' style="outline:3px solid #7c3aed;outline-offset:2px"':''}>${e[j]}</span>`:'<span class="adb adb-empty"></span>').join('')}
 <button class="ad-small" id="undo" ${e.length&&!fix?'':'disabled'}>↶ Undo</button><button class="ad-small" id="hideface" aria-pressed="${!!S.hideFace}">${S.hideFace?'Show target':'Hide target'}</button></div>
 <p class="small muted" style="margin:2px 12px">${fix?'Tap the face or a score to fix this arrow.':locked?'End complete. Tap an arrow to fix it, or press Next.':'Tap the face or a score. Tap an arrow to fix it.'}</p>
 ${S.hideFace?'':`<div id="fwrap" style="position:relative;max-width:260px;margin:0 auto">${faceSVG(shown,'pface',vb,FR)}<div id="loupe" hidden style="position:absolute;width:110px;height:110px;border-radius:50%;overflow:hidden;border:3px solid #111;box-shadow:0 2px 8px #0006;pointer-events:none;background:#fff"></div></div>`}
 <div class="ad-pad">${rows.map(r=>r.map(k=>k?`<button class="${col(k)}" data-k="${k}" aria-label="score ${k}" ${locked?'disabled':''}>${k}</button>`:'<span></span>').join('')).join('')}</div>
 <div class="ad-foot"><button class="ad-back" id="eback">‹ Back</button><button class="ad-go" id="enext" ${endDone&&!fix?'':'disabled'}>Next ›</button></div></div>`;
 $('#hideface').onclick=()=>{S.hideFace=!S.hideFace;save();score()};
 app.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>putArrow(b.dataset.k,null));
 const f=$('#pface');if(f){const L=$('#loupe'),W=$('#fwrap');const pt=ev=>{const q=f.createSVGPoint();q.x=ev.clientX;q.y=ev.clientY;return q.matrixTransform(f.getScreenCTM().inverse())};
  const show=ev=>{const q=pt(ev),r=W.getBoundingClientRect();L.hidden=false;L.style.left=(ev.clientX-r.left-55)+'px';L.style.top=(ev.clientY-r.top-140)+'px';
   L.innerHTML=faceSVG(shown,'lf',`${q.x-0.12} ${q.y-0.12} 0.24 0.24`,FR,`<path d="M${q.x-0.04} ${q.y}h0.08M${q.x} ${q.y-0.04}v0.08" stroke="#a855f7" stroke-width="0.006"/><circle cx="${q.x}" cy="${q.y}" r="0.012" fill="none" stroke="#a855f7" stroke-width="0.004"/>`)+`<b style="position:absolute;bottom:4px;left:0;right:0;text-align:center;font-size:13px;background:#fffc">${plotScore(q.x,q.y,Object.assign({xs:R.xs},FR))}</b>`};
  f.onpointerdown=ev=>{if(locked)return;f.setPointerCapture(ev.pointerId);show(ev)};f.onpointermove=ev=>{if(!L.hidden)show(ev)};
  f.onpointercancel=()=>L.hidden=true;f.onpointerup=ev=>{if(L.hidden)return;L.hidden=true;const q=pt(ev);putArrow(plotScore(q.x,q.y,Object.assign({xs:R.xs},FR)),{x:+q.x.toFixed(3),y:+q.y.toFixed(3)})}}
 app.querySelectorAll('[data-fix]').forEach(el=>el.onclick=el.onkeydown=ev=>{if(ev.type=='keydown'&&ev.key!='Enter'&&ev.key!=' ')return;const [i,j]=el.dataset.fix.split(',').map(Number);fix=fix&&fix[0]==i&&fix[1]==j?null:[i,j];score()});
 $('#undo').onclick=()=>{const l=cur.ends[cur.ends.length-1];if(!l.length)return;l.pop();const pp=(cur.pos||[])[cur.ends.length-1];if(pp)pp.length=l.length;justDone=false;save();score()};
 $('#eback').onclick=()=>{fix=null;fixRet=false;justDone=false;sv='sheet';score()};
 $('#enext').onclick=()=>{justDone=false;sv='sheet';score()}}
const faceName=F=>F.face=='any'?'Full 10-ring face':`${/^\d/.test(F.face)?'WA ':''}${F.face.replace(/ (6-ring|3-spot)/,' ($1)')}`;
const distOf=(F,round)=>F.dist||((round.match(/(\d+(?:m|yd))/)||[])[1])||'';
function sheetSections(s){const R=ROUNDS[s.round],out=[];s.ends.forEach((x,i)=>{const F=faceR(R,i),k=faceName(F)+(distOf(F,s.round)?' @ '+distOf(F,s.round):'');if(!out.length||out[out.length-1].k!=k)out.push({k,ends:[]});out[out.length-1].ends.push(i)});return out}
function scoreSheet(R,fin){const s=cur,secs=sheetSections(s);let run=0;
 const arrowsAll=s.ends.flat(),xs=arrowsAll.filter(a=>a=='X').length,tens=arrowsAll.filter(a=>a=='X'||a=='10').length;
 app.innerHTML=`<div class="ad"><div class="ad-title">Score Sheet</div><div class="ad-sheet"><div class="ad-name">${esc(S.profile)}</div><div class="ad-band">${esc(s.round)}${R.custom?' · practice':''}</div>
 ${secs.map(sec=>{const A=sec.ends.flatMap(i=>s.ends[i]);return`<table class="ad-tab"><thead><tr><th>#</th><th>Scores<div style="font-weight:400">${esc(sec.k)}</div></th><th>End</th><th>Prog</th></tr></thead><tbody>
 ${sec.ends.map(i=>{run+=endSum(s.ends[i]);return`<tr><td>${i+1}</td><td>${s.ends[i].map((a,j)=>`<span class="adb ${col(a)}" role="button" tabindex="0" data-fix="${i},${j}" aria-label="fix end ${i+1} arrow ${a}">${a}</span>`).join('')}</td><td>${endSum(s.ends[i])}</td><td>${run}</td></tr>`}).join('')}</tbody></table>
 ${secs.length>1?`<div class="ad-sum small">X's: <b>${A.filter(a=>a=='X').length}</b> 10's/X's: <b>${A.filter(a=>a=='X'||a=='10').length}</b> <b>${A.reduce((t,a)=>t+val(a),0)}</b></div>`:''}`}).join('')}
 <div class="ad-sum">X's: <b>${xs}</b>&nbsp; 10's/X's: <b>${tens}</b>&nbsp; <b class="big">${total(s)}</b><span class="small muted">&nbsp;/ ${R.max}</span></div></div>
 ${fin?summaryCard(s)+`<div class="ad-sheet" style="padding:10px">${noteBox(s)}<button class="btn full" id="fin" style="margin-top:8px">See my wins</button></div>`:''}
 <div class="ad-foot"><button class="ad-back" id="sback">‹ Back</button>${fin?'':`<button class="ad-go" id="addsc">Add Scores</button>`}</div></div>`;
 bindNotes();
 app.querySelectorAll('[data-fix]').forEach(el=>el.onclick=el.onkeydown=ev=>{if(ev.type=='keydown'&&ev.key!='Enter'&&ev.key!=' ')return;fix=el.dataset.fix.split(',').map(Number);fixRet=true;sv='entry';score()});
 if($('#addsc'))$('#addsc').onclick=()=>{sv='entry';score()};
 if($('#fin'))$('#fin').onclick=()=>{cur=null;sv='sheet';nav('home')};
 $('#sback').onclick=()=>fin?(cur=null,save(),score()):leaveScoring()}
const AA_MAP={'WA 720 (70m)':'WA 70/720','WA 720 (60m)':'WA 60/720','WA 720 (50m Compound)':'WA 50/720','Short Canberra (50/40/30m)':'Short Canberra','Junior Canberra (40/30/20m)':'Junior Canberra','Indoor WA 18m':'WA Indoor 18m'};
function summaryCard(s){const sc=total(s),prev=done().filter(x=>x.round==s.round&&x!==s),best=prev.length?prev.reduce((a,b)=>total(b)>total(a)?b:a):null;
 const off=findReal(S.profile||'').filter(r=>r.division).slice(-1)[0],div=off&&off.division,aa=AA_MAP[s.round];
 const rt=aa&&typeof aaRating=='function'&&AA_ROUNDS[aa]?aaRating(sc,aa,/compound/i.test(div||'')):null,lv=rt!=null&&div?aaLevel(rt,div):null;
 const row=(k,v,x='')=>`<tr><th>${k}</th><td>${v}</td><td class="small muted">${x}</td></tr>`;
 const pb=best?(sc>total(best)?`🎉 New practice PB for this round, beating ${total(best)}.`:sc==total(best)?'Equal to your practice best for this round.':''):'First time you have scored this round here.';
 return`<div class="ad-sheet"><div class="ad-name">${esc(S.profile)}</div><table class="ad-kv">${div?row('Division',esc(div),'from your official results'):''}${row('Round Name',esc(s.round))}${row('Score',sc)}
 ${best?row('Best Score',Math.max(total(best),sc),total(best)>=sc?fmtD(best.date):fmtD(s.date)):''}${rt!=null?row('AA Rating',rt.toFixed(1)):''}${lv?row('Classification',esc(lv.name),'level for this rating · practice isn\'t counted'):''}</table>
 ${pb?`<div class="ad-band" style="margin:0">Personal best</div><p style="margin:8px 12px">${pb}</p>`:''}</div>`}
function arrowsIn(s){return s.ends.reduce((t,e)=>t+e.length,0)}
function leaveScoring(after){if(!cur)return;fix=null;const go=()=>{cur=null;sv='sheet';save();if(after)after();else score()};
 if(!arrowsIn(cur)){S.sessions=S.sessions.filter(x=>x!==cur);return go()}
 const ov=document.createElement('div');ov.id='leaveov';ov.style.cssText='position:fixed;inset:0;background:#0008;z-index:50;display:flex;align-items:flex-end;justify-content:center';
 ov.innerHTML=`<div class="card" role="dialog" aria-modal="true" aria-label="Leave this round?" style="width:100%;max-width:480px;margin:0;border-radius:16px 16px 0 0;padding-bottom:calc(16px + env(safe-area-inset-bottom))"><h2>Leave this round?</h2><p class="small muted">${arrowsIn(cur)} arrows entered so far.</p>
 <button class="btn full" id="lkeep">Keep this round for later</button><button class="btn full" id="ldisc" style="margin-top:8px;background:#dc2626;color:#fff">Discard round</button><button class="btn ghost full" id="lstay" style="margin-top:8px">Keep scoring</button></div>`;
 document.body.appendChild(ov);const close=()=>ov.remove();
 $('#lkeep').onclick=()=>{close();go()};$('#lstay').onclick=()=>{close();history.pushState({scoring:1},'')};
 $('#ldisc').onclick=()=>{if(!confirm('Discard this round? Its arrows will be deleted.'))return;close();S.sessions=S.sessions.filter(x=>x!==cur);go()}}
addEventListener('popstate',()=>{if(cur&&view=='score'&&!document.getElementById('leaveov')){history.pushState({scoring:1},'');leaveScoring()}});


function roundForm(){const c=crEdit.i>=0?JSON.parse(JSON.stringify(S.customRounds[crEdit.i])):(crEdit.d||{name:'',ape:6,xs:true,blocks:[{dist:18,unit:'m',size:40,type:'full',ends:10}]});crEdit.d=c;
 const tot=()=>c.blocks.reduce((t,b)=>t+ +b.ends,0)*c.ape*10;
 app.innerHTML=`<div class="card"><span class="kicker">${crEdit.i>=0?'Edit':'Create'} my practice round</span><label for="cn">Name</label><input id="cn" value="${esc(c.name)}" placeholder="e.g. Tuesday 30m blast">
 <label for="cape">Arrows per end</label><div style="display:flex;gap:6px"><select id="cape" style="flex:1">${[3,6].map(n=>`<option ${c.ape==n?'selected':''}>${n}</option>`).join('')}<option value="c" ${![3,6].includes(+c.ape)?'selected':''}>Custom</option></select><input id="capec" type="number" min="1" max="12" value="${c.ape}" style="flex:1" ${[3,6].includes(+c.ape)?'hidden':''} aria-label="Custom arrows per end"></div>
 <label style="display:flex;gap:8px;align-items:center;margin-top:8px"><input type="checkbox" id="cxs" style="width:auto" ${c.xs!==false?'checked':''}> Count Xs</label>
 <h3 style="margin-top:10px">Distance blocks</h3>${c.blocks.map((b,i)=>`<div class="list-item" data-b="${i}"><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
  <label>Distance<div style="display:flex;gap:4px"><input data-f="dist" type="number" min="1" value="${b.dist}" style="min-width:0"><select data-f="unit" style="width:64px">${['m','yd'].map(u=>`<option ${b.unit==u?'selected':''}>${u}</option>`).join('')}</select></div></label>
  <label>Ends<input data-f="ends" type="number" min="1" max="60" value="${b.ends}"></label>
  <label>Face size<select data-f="size">${[122,80,60,40].map(z=>`<option value="${z}" ${b.size==z?'selected':''}>${z}cm</option>`).join('')}</select></label>
  <label>Face type<select data-f="type">${[['full','Full 10-ring'],['6-ring','6-ring'],['3-spot','3-spot']].map(([v,l])=>`<option value="${v}" ${b.type==v?'selected':''}>${l}</option>`).join('')}</select></label></div>
  ${c.blocks.length>1?`<button class="btn ghost" data-rb="${i}" style="margin-top:6px;padding:4px 10px">Remove block</button>`:''}</div>`).join('')}
 <button class="btn ghost" id="addb" style="margin-top:6px">+ Add distance</button>
 <p style="margin:10px 0 0"><b>Max score: <span id="cmax">${tot()}</span></b> <span class="small muted">· practice only, never counted for classification</span></p>
 <div style="display:flex;gap:6px;margin-top:10px"><button class="btn" id="csave">Save round</button><button class="btn ghost" id="ccancel">Cancel</button></div></div>`;
 const up=()=>{$('#cmax').textContent=tot()};
 app.querySelectorAll('[data-b] [data-f]').forEach(el=>el.oninput=el.onchange=()=>{const b=c.blocks[+el.closest('[data-b]').dataset.b];b[el.dataset.f]=['dist','ends','size'].includes(el.dataset.f)?+el.value:el.value;up()});
 $('#cape').onchange=e=>{if(e.target.value=='c'){$('#capec').hidden=false}else{$('#capec').hidden=true;c.ape=+e.target.value}up()};$('#capec').oninput=e=>{c.ape=Math.max(1,Math.min(12,+e.target.value||1));up()};
 $('#cn').oninput=e=>c.name=e.target.value;$('#cxs').onchange=e=>c.xs=e.target.checked;
 $('#addb').onclick=()=>{const l=c.blocks[c.blocks.length-1];c.blocks.push({...l});roundForm()};
 app.querySelectorAll('[data-rb]').forEach(b=>b.onclick=()=>{c.blocks.splice(+b.dataset.rb,1);roundForm()});
 $('#ccancel').onclick=()=>{crEdit=null;score()};
 $('#csave').onclick=()=>{const n=c.name.trim();if(!n)return alert('Give your round a name.');if(ROUNDS[n]&&(!ROUNDS[n].custom||(crEdit.i>=0?S.customRounds[crEdit.i].name!=n:true)))return alert('That name is already used. Pick another.');
  c.name=n;S.customRounds=S.customRounds||[];if(crEdit.i>=0){const old=S.customRounds[crEdit.i].name;if(old!=n){delete ROUNDS[old];S.sessions.forEach(x=>{if(x.round==old)x.round=n})}S.customRounds[crEdit.i]=c}else S.customRounds.push(c);S.lastRound=n;crEdit=null;save();regCustom();score()}}
function plottedCard(s){if(!s||!(s.pos||[]).some(e=>(e||[]).some(Boolean)))return'<p class="small muted" style="margin:0 4px 12px">No arrows were plotted in this session.</p>';const pts=s.pos.flat().filter(Boolean),g=groupStats(pts),R=ROUNDS[s.round]||{};
 return`<div class="card"><h3>Group plot · ${s.date}</h3><p class="small muted">${pts.length} plotted arrows from ${s.round}. Keypad arrows have no position, so they aren't shown.</p><div style="max-width:300px;margin:0 auto">${faceSVG(pts,'gplot',isSix(R)?'-0.64 -0.64 1.28 1.28':'-1.04 -1.04 2.08 2.08',R,pts.length>=3?`<circle cx="${g.cx}" cy="${g.cy}" r="${g.r}" fill="none" stroke="#a855f7" stroke-width="0.012" stroke-dasharray="0.04 0.03"/><path d="M${g.cx-0.06} ${g.cy}h0.12M${g.cx} ${g.cy-0.06}v0.12" stroke="#a855f7" stroke-width="0.018"/>`:'')}</div>${pts.length>=3?`<p class="small">Centre of group: ${Math.abs(g.cy)<0.04?'level':g.cy<0?'high':'low'}, ${Math.abs(g.cx)<0.04?'centred':g.cx<0?'left':'right'}. Spread ${(g.r*10).toFixed(1)} rings.</p>`:''}</div>`}
function sessionList(){return`<div class="card"><h3>Past sessions</h3>${allSessions().slice().reverse().map(s=>`<div class="list-item row" style="align-items:flex-start"><div style="flex:1;min-width:0"><b>${total(s)}</b> · ${s.round}<div class="small muted">${s.date} ${s.sample?'<span class="sample">sample data</span>':''}</div>${noteBox(s)}</div>${s.sample?'':`<button class="btn ghost" data-del="${s.id}" aria-label="delete">🗑</button>`}</div>`).join('')}</div>`}
function bindList(){bindNotes();app.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{S.sessions=S.sessions.filter(s=>s.id!=b.dataset.del);save();score()})}

/* The old Plot tab's free plots now live in Stats (read-only group view). Plotting happens on the scoring screen. */
function freePlotCard(){const p=S.plots||[];if(!p.length)return'';const g=groupStats(p);let hint='';
 if(p.length>=3){const dx=g.cx,dy=g.cy,off=Math.hypot(dx,dy);hint=off<0.08?'This group is centred on the middle. 🎯':`This group's centre is ${[dy<-0.04?'high':dy>0.04?'low':'',dx<-0.04?'left':dx>0.04?'right':''].filter(Boolean).join(' and ')} of the middle. Worth a chat with your coach?`}
 return`<div class="card"><span class="kicker">Old Plot screen · no date or round saved</span><h3>Earlier free plots</h3><div class="target-wrap" style="max-width:260px;margin:0 auto;pointer-events:none">${targetSVG(p)}</div>
 <div class="stats" style="margin-top:8px"><div class="stat"><b>${p.length}</b>arrows</div><div class="stat"><b>${Math.round(p.reduce((t,a)=>t+val(ringScore(a.x,a.y)),0)/p.length*10)/10}</b>avg</div><div class="stat"><b>${p.length>=3?Math.round(g.r*100)/10:'–'}</b>group (rings)</div></div>
 <p class="small">${hint}</p><p class="small muted">These came from the old Plot screen, which didn’t save a date or round, so they aren’t linked to any session. New plots are saved with the session you score.</p></div>`}

function stats(){const d=done();if(!d.length){app.innerHTML=officialCard()+`<h2 class="sec" style="margin:22px 4px 6px;border-bottom:3px solid #166534;padding-bottom:4px">History</h2><p class="small muted" style="margin:0 4px 10px">Older data not tied to a session.</p>`+freePlotCard()+'<div class="card">Score a practice session to see practice stats.</div>';if($('#os'))$('#os').onchange=e=>{window._o=+e.target.value;stats()};return}
 const byRound={};d.forEach(s=>(byRound[s.round]=byRound[s.round]||[]).push(s));const rounds=Object.keys(byRound);
 const sel=window._r&&byRound[window._r]?window._r:rounds.sort((a,b)=>byRound[b].length-byRound[a].length)[0],ss=byRound[sel];
 const tot=ss.map(total),roll=tot.map((_,i)=>{const w=tot.slice(Math.max(0,i-2),i+1);return w.reduce((a,b)=>a+b)/w.length});
 const pb=tot.map((_,i)=>Math.max(...tot.slice(0,i+1))),last=ss[window._ps!=null&&ss[window._ps]?window._ps:ss.length-1],ends=last.ends.map(endSum);
 const nE=Math.max(...ss.map(s=>s.ends.length)),endAvg=[...Array(nE)].map((_,i)=>{const v=ss.map(s=>s.ends[i]?endSum(s.ends[i]):null).filter(x=>x!=null);return v.reduce((a,b)=>a+b,0)/v.length});
 const third=Math.max(1,Math.floor(nE/3)),early=endAvg.slice(0,third).reduce((a,b)=>a+b)/third,late=endAvg.slice(-third).reduce((a,b)=>a+b)/third;
 const cons=ss.map(s=>sd(s.ends.map(endSum)));const real=findReal(S.profile);
 app.innerHTML=`<h2 class="sec" style="margin:22px 4px 6px;border-bottom:3px solid #166534;padding-bottom:4px">This official round</h2><p class="small muted" style="margin:0 4px 10px">Only this round’s own arrows from the scoresheet.</p>`+officialCard()+'<p class="small muted" style="margin:-4px 4px 12px">Plots are only for practice sessions. Arrows can’t be plotted at official shoots.</p>'+`<h2 class="sec" style="margin:22px 4px 6px;border-bottom:3px solid #166534;padding-bottom:4px">This practice session</h2><p class="small muted" style="margin:0 4px 10px">Pick a practice session. The plot and end-by-end chart use only that session’s arrows.</p><div class="card"><h2>Practice</h2><label for="rs">Round</label><select id="rs">${rounds.map(r=>`<option ${r==sel?'selected':''}>${r}</option>`).join('')}</select><label for="ps">Session</label><select id="ps">${ss.map((x,j)=>[x,j]).reverse().map(([x,j])=>`<option value="${j}" ${x==last?'selected':''}>${x.date} · ${total(x)}${x.sample?' (sample)':''}</option>`).join('')}</select>${ss.some(s=>s.sample)?'<p class="small"><span class="sample">Includes sample data</span> Demo practice sessions, not real scores.</p>':''}</div>`+plottedCard(last)+`<div class="card"><h3>End by end · ${last.date}${(last.round.match(/(\d+m)/)||[])[1]?' at '+last.round.match(/(\d+m)/)[1]:''}</h3>${endChart(ends,last.ends.map(e=>e.length),null)}</div><h2 class="sec" style="margin:22px 4px 6px;border-bottom:3px solid #166534;padding-bottom:4px">All your practice</h2><p class="small muted" style="margin:0 4px 10px">Trends across every practice session of the chosen round.</p>`+noteInsights()+`<div class="card"><h3>Score trend</h3>${lineChart([{name:'Score',data:tot,c:'#1d4ed8'},{name:'3-session average',data:roll,c:'#e0a800',dash:1},{name:'PB',data:pb,c:'#16a34a',w:1.5,dash:1}],{labels:ss.map(s=>s.date.slice(5)),markers:typeof setupMarkers=='function'?setupMarkers(ss.map(s=>s.date)):[]})}</div>
 <div class="card"><h3>Consistency</h3><p class="small muted">How spread out your end scores were. Lower means steadier.</p>${lineChart([{name:'End spread (SD)',data:cons.map(x=>Math.round(x*10)/10),c:'#7c3aed'}],{labels:ss.map(s=>s.date.slice(5))})}</div>
 <div class="card"><h3>Early vs late ends</h3><div class="stats" style="grid-template-columns:1fr 1fr"><div class="stat"><b>${early.toFixed(1)}</b>first ${third} ends</div><div class="stat"><b>${late.toFixed(1)}</b>last ${third} ends</div></div>
 <p>${late>=early-0.3?'💪 You hold your score right to the end. Great focus!':`Your last ends average ${(early-late).toFixed(1)} points lower. Worth a chat with your coach?`}</p></div>
 <div class="card"><h3>Personal bests</h3>${Object.entries(pbs()).map(([r,v])=>`<div class="list-item row"><span>${r}</span><span><b>${v.score}</b> ${v.real?'<span class="real">official</span>':v.sample?'<span class="sample">sample</span>':''}</span></div>`).join('')}</div>
 <h2 class="sec" style="margin:22px 4px 6px;border-bottom:3px solid #166534;padding-bottom:4px">All your official scores</h2><p class="small muted" style="margin:0 4px 10px">Every official result, across all events.</p>${officialCharts(real)}
 ${estRating(real)}
 <h2 class="sec" style="margin:22px 4px 6px;border-bottom:3px solid #166534;padding-bottom:4px">History</h2><p class="small muted" style="margin:0 4px 10px">Older data not tied to a session.</p>${freePlotCard()}<div class="card"><h3>Compare</h3><p>Default: <b>you vs. you</b>. This season's average is ${(tot.reduce((a,b)=>a+b)/tot.length).toFixed(0)}, and your first ${Math.min(3,tot.length)} sessions averaged ${(tot.slice(0,3).reduce((a,b)=>a+b)/Math.min(3,tot.length)).toFixed(0)}.</p><label><input type="checkbox" id="club" style="width:auto"> Show club & division averages (opt-in)</label><div id="clubout"></div></div>`;
 app.querySelectorAll('[data-ev]').forEach(b=>b.onchange=()=>{S.evOver=S.evOver||{};S.evOver[b.dataset.ev]=b.checked?'open':'club';save();const y=scrollY;stats();scrollTo(0,y)});app.querySelectorAll('[data-oc]').forEach(b=>b.onclick=()=>{window._oc=b.dataset.oc;const y=scrollY;stats();scrollTo(0,y)});bindNotes();$('#rs').onchange=e=>{window._r=e.target.value;window._ps=null;stats()};$('#ps').onchange=e=>{window._ps=+e.target.value;stats()};if($('#os'))$('#os').onchange=e=>{window._o=+e.target.value;stats()};
 $('#club').onchange=e=>{$('#clubout').innerHTML=e.target.checked?'<p class="small muted">Coming soon: club and division averages worked out from the public Archer\'s Diary results already on archerycalendars.com. Off by default for juniors.</p>':''}}
function offRounds(){const k=Object.keys(OFF).find(x=>x.toLowerCase()==(S.profile||'').toLowerCase());return k?OFF[k]:[]}
function officialCard(){const L=offRounds();if(!L.length)return'';const i=Math.min(window._o||0,L.length-1),o=L[i],good=o.ends.filter(e=>!e.flag),flagged=o.ends.filter(e=>e.flag);
 const sums=good.map(e=>endSum(e.arrows)),all=good.flatMap(e=>e.arrows),n=all.length||1,pc=f=>Math.round(all.filter(f).length/n*100);
 const dists=[...new Set(good.map(e=>e.dist))],third=Math.max(1,Math.floor(sums.length/3)),fe=sums.slice(0,third),le=sums.slice(-third),av=a=>a.reduce((x,y)=>x+y,0)/a.length;
 const fake={id:'off',date:o.date,round:o.round,ends:good.map(e=>e.arrows),dists:good.map(e=>e.dist)};const gl=sums.map((_,j)=>endLabel(fake,j).match(/end (\d+)/)[1]);
 return`<div class="card"><span class="kicker">Official round · real arrows <span class="real">official</span></span><label for="os">Pick a round</label><select id="os">${L.map((x,j)=>`<option value="${j}" ${j==i?'selected':''}>${x.date} · ${x.round}</option>`).join('')}</select>
 <p class="small muted">${o.event} · ${good.length} ends · ${all.length} arrows · total ${sums.reduce((a,b)=>a+b,0)} · <a href="${o.url}" target="_blank" rel="noopener">Archer's Diary</a></p>
 ${flagged.length?`<p class="small"><span class="sample">Flagged</span> ${flagged.map(e=>e.dist).join(', ')}: ${flagged.length} end(s) with every arrow a miss. That's most likely a scoresheet error, so it's left out of these stats and isn't treated as real form.</p>`:''}
 <h3>End by end${dists.length>1?' (by distance)':' at '+dists[0]}</h3>${endChart(sums,good.map(e=>e.arrows.length),dists.length>1?fake.dists:null)}
 <h3>Arrow values</h3><div class="stats"><div class="stat"><b>${pc(a=>a=='X')}%</b>X</div><div class="stat"><b>${pc(a=>a=='10')}%</b>10</div><div class="stat"><b>${pc(a=>a=='9')}%</b>9</div></div>
 <h3 style="margin-top:12px">Per distance (avg per arrow)</h3>${dists.map(d=>{const a=good.filter(e=>e.dist==d).flatMap(e=>e.arrows);return`<div class="list-item row"><span>${d}</span><b>${(a.reduce((t,x)=>t+val(x),0)/a.length).toFixed(2)}</b></div>`}).join('')}
 <div class="stats" style="grid-template-columns:1fr 1fr 1fr;margin-top:10px"><div class="stat"><b>${av(fe).toFixed(1)}</b>first ${third} ends</div><div class="stat"><b>${av(le).toFixed(1)}</b>last ${third} ends</div><div class="stat"><b>${sd(sums).toFixed(1)}</b>end spread</div></div>
 ${ryTips(sums,good,all,dists,fe,le,j=>endLabel(fake,j))}${noteBox({date:o.date,round:o.round})}<h3 style="margin-top:12px">Wins from this round</h3>${winsFor(fake).map(w=>`<div class="win"><i>${w[0]}</i><div>${w[1]}</div></div>`).join('')}</div>`}

/* Official scores: one chart per round + bow type (chips), plus AA rating over time. */
const fmtD=d=>{const x=new Date(normDate(d));return isNaN(x)?d:x.getDate()+' '+x.toLocaleString('en-AU',{month:'short'})};
function ptChart(P,{mn,mx,id}){const W=340,h=170,L=34,R=10,T=14,B=24,n=P.length,X=i=>L+(n<2?(W-L-R)/2:i*(W-L-R)/(n-1)),Y=v=>T+(1-(v-mn)/(mx-mn||1))*(h-T-B);
 let g=`<svg viewBox="0 0 ${W} ${h}" width="100%" role="img" aria-label="chart"><line x1="${L}" y1="${h-B}" x2="${W-R}" y2="${h-B}" stroke="#94a3b8"/>`;
 [mn,(mn+mx)/2,mx].forEach(v=>g+=`<text x="${L-4}" y="${Y(v)+4}" font-size="10" text-anchor="end" fill="#475569">${Math.round(v)}</text><line x1="${L}" x2="${W-R}" y1="${Y(v)}" y2="${Y(v)}" stroke="#e2e8f0"/>`);
 g+=`<polyline fill="none" stroke="#166534" stroke-width="2" points="${P.map((p,i)=>`${X(i)},${Y(p.v)}`).join(' ')}"/>`;
 const step=Math.ceil(n/5);P.forEach((p,i)=>{if((i%step==0&&(n-1-i>=step*0.6||i==0))||i==n-1)g+=`<text x="${X(i)}" y="${h-8}" font-size="10" text-anchor="${i==0&&n>1?'start':i==n-1&&n>1?'end':'middle'}" fill="#475569">${p.label}</text>`;
  g+=p.star?`<text x="${X(i)}" y="${Y(p.v)+5}" font-size="15" text-anchor="middle">⭐</text>`:`<circle cx="${X(i)}" cy="${Y(p.v)}" r="4" fill="#166534"/>`;
  g+=`<circle cx="${X(i)}" cy="${Y(p.v)}" r="12" fill="transparent" style="cursor:pointer" data-t="${esc(p.tip)}" onclick="this.closest('.pc').querySelector('.pcap').textContent=this.dataset.t"><title>${esc(p.tip)}</title></circle>`});
 return`<div class="pc">${g}</svg><p class="small pcap" style="margin:2px 0;min-height:1.2em">Tap a point for details.</p></div>`}
function officialCharts(real){const ok=real.filter(r=>!r.incomplete&&r.score>0);if(!ok.length)return'';const G={};
 ok.forEach(r=>{const c=aaCategory(r.division),k=r.round+' · '+(c?c.bow:(r.division||'').split(' ').pop());(G[k]=G[k]||[]).push(r)});
 const keys=Object.keys(G).sort((a,b)=>G[b].length-G[a].length);const k=window._oc&&G[window._oc]?window._oc:keys[0],L=G[k].slice().sort((a,b)=>normDate(a.date)<normDate(b.date)?-1:1);
 const rd=L[0].round,def=AA_ROUNDS&&AA_ROUNDS[rd],max=def?def.r.reduce((t,p)=>t+p[0]*p[3][0][1],0):null,best=Math.max(...L.map(r=>r.score)),bi=L.findIndex(r=>r.score==best);
 const lo=Math.min(...L.map(r=>r.score)),pad=Math.max(2,(best-lo)*0.15);
 const chart=ptChart(L.map((r,i)=>({v:r.score,label:fmtD(r.date),star:i==bi,tip:`${fmtD(r.date)} ${normDate(r.date).slice(0,4)} · ${r.event} · ${r.score}${max?' / '+max:''}${i==bi?' ⭐ PB':''}`})),{mn:Math.floor(lo-pad),mx:Math.min(max||1e9,Math.ceil(best+pad))});
 const rt=ok.map(r=>{const c=aaCategory(r.division);return{r,v:c?aaRating(r.score,r.round,c.bow=='Compound'&&r.round=='WA Indoor 18m'):null}}).filter(x=>x.v!=null).sort((a,b)=>normDate(a.r.date)<normDate(b.r.date)?-1:1);
 const rb=rt.length?Math.max(...rt.map(x=>x.v)):0,rl=rt.length?Math.min(...rt.map(x=>x.v)):0;
 return`<div class="card"><h3>Official scores by round</h3><div style="display:flex;flex-wrap:wrap;gap:6px;margin:6px 0">${keys.map(x=>`<button class="btn ${x==k?'':'ghost'}" data-oc="${esc(x)}" style="padding:5px 10px;font-size:13px">${esc(x)} (${G[x].length})</button>`).join('')}</div>
 <p class="small muted" style="margin:0">${esc(k)}${max?` · out of ${max}`:''} · best ${best} ⭐</p>${chart}</div>
 ${rt.length>1?`<div class="card"><h3>Rating over time</h3><p class="small muted" style="margin:0">Rating lets you compare different rounds.</p>${ptChart(rt.map(x=>({v:x.v,label:fmtD(x.r.date),star:x==rt.find(y=>y.v==rb),tip:`${fmtD(x.r.date)} ${normDate(x.r.date).slice(0,4)} · ${x.r.event} · ${x.r.round} ${x.r.score} · rating ${x.v.toFixed(1)}`})),{mn:Math.floor(rl-2),mx:Math.ceil(rb+2)})}</div>`:''}`}
/* Ratings: Archery Australia rating scheme (Park 2014) + Schedule 4A.1 classification levels; see ratings.js for sources. */
/* Event requirements: AA Shooting Rules v7.2 (July 2026), 4.2.3 Outdoor Target and 4.2.4 Indoor Target:
   White-Gold: open tournament, QRE or club-calendar shoot (outdoor: Schedule 9A round, min 72 arrows).
   Master & Grand Master: at least 1 of the 3 rounds at an open tournament or QRE.
   Elite Bronze/Silver/Gold: all 3 rounds at an open tournament or QRE.
   Outdoor only: each open tournament/QRE round is 72+ arrows with at least 30 arrows at the listed minimum distance or longer.
   The rules make no distinction between state and national ranking events for classifications (both count as open tournament/QRE). */
const EV_NEED=[3,3,3,1,1,0,0,0,0,0];
const LV_COL={'Elite Gold':'#d4af37','Elite Silver':'#c0c7d1','Elite Bronze':'#cd7f32','Grand Master':'#4c1d95','Master':'#7c3aed','Gold':'#ffd84d','Red':'#d62828','Blue':'#2563eb','Black':'#111','White':'#fff'};
const EV_LABEL={club:'Club shoot',open:'Open/registered tournament',state:'State ranking/championship',national:'National/QRE'};
function evType(r){const k='e:'+normDate(r.date)+'|'+r.round,o=(S.evOver||{})[k];if(o)return o;const n=r.event||'';
 return/\bQRE\b|world record status|national/i.test(n)?'national':/state\b.*(championship|titles|ranking)|state ranking/i.test(n)?'state':/\bopen\b|tournament|\bcup\b|classic|trophy/i.test(n)?'open':'club'}
function minDistOK(r,c){const def=AA_ROUNDS[r.round];if(!def)return null;const P=def.r,tot=P.reduce((t,p)=>t+p[0],0);if(tot<72)return false;
 const age=(c.key.match(/Under (1[46])/)||[])[1],need=age=='16'?40:age=='14'?30:60;const face=p=>p[3][p[3].length-1][0];
 return P.filter(p=>p[1]>=need&&face(p)>=1.2||(!age&&c.bow=='Compound'&&p[1]>=50&&face(p)>=0.79)).reduce((t,p)=>t+p[0],0)>=30}
let NEXT=null;function loadNext(){if(NEXT)return;NEXT=[];fetch('https://archerycalendars.com/data/events.json').then(r=>r.json()).then(d=>{const t=today();
 NEXT=(d.events||[]).filter(x=>/Registered tournament|QRE|State Championship|^National|^State$/.test(x.level||'')&&/target|indoor/i.test(x.discipline||'')&&(x.start_date||'')>=t).sort((a,b)=>((b.state=='WA')-(a.state=='WA'))||(a.start_date<b.start_date?-1:1)).slice(0,4);if(view=='stats')stats()}).catch(()=>{})}
function estRating(real){if(typeof aaRating!='function')return'';loadNext();const yr=today().slice(0,4),groups={};
 real.filter(r=>!r.incomplete).forEach(r=>{const c=aaCategory(r.division);if(!c)return;const rt=aaRating(r.score,r.round,c.bow=='Compound'&&r.round=='WA Indoor 18m');if(rt==null)return;
  const ind=AA_ROUNDS[r.round].r.every(p=>p[2])?'Indoor':'Outdoor',gk=c.bow+'|'+ind,ev=evType(r),q=ev!='club'&&(ind=='Indoor'||minDistOK(r,c)!==false);
  (groups[gk]=groups[gk]||{div:r.division,list:[]}).list.push({r,rt,ev,q,date:normDate(r.date)});groups[gk].div=r.division});
 const body=Object.entries(groups).map(([gk,G])=>{const[bow,disc]=gk.split('|'),c=aaCategory(G.div),lv=AA_CLASS[c.bow][c.key]||[],L=G.list,last=L[L.length-1],thisYr=L.filter(x=>x.date.slice(0,4)==yr);
  const tiles=AA_LEVELS.map((nm,i)=>{const at=thisYr.filter(x=>x.rt>=lv[i]),n=at.length,qn=at.filter(x=>x.q).length,need=EV_NEED[i],ok=n>=3&&qn>=Math.min(need,3);
   const st=ok?'✅ Achieved':n>=3?`⚠️ Enough rounds, but you need ${need-qn} more at an open tournament or QRE`:`${n}/3 rounds`;
   const fg=['Black','Blue','Red','Grand Master','Master'].includes(nm)?'#fff':'#0f172a';
   return`<div style="border-radius:10px;padding:8px;background:${LV_COL[nm]};color:${fg};border:1px solid #cbd5e1;${n?'':'opacity:.55'}"><b style="font-size:13px">${nm}</b> <span style="font-size:11px">${lv[i]}+</span><div style="font-size:12px">Rounds at this level: ${Math.min(n,3)}/3${need?`<br>At qualifying events: ${Math.min(qn,need)}/${need}`:''}</div><div style="font-size:12px;margin-top:2px">${st}</div></div>`}).reverse();
  return`<details ${disc=='Outdoor'?'open':''} style="margin-top:8px"><summary><b>${disc} · ${bow} · ${c.key}</b> · latest ${last.rt.toFixed(1)}</summary>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px">${tiles.join('')}</div>
  <details style="margin-top:6px"><summary class="small">This year's rounds and event type (${thisYr.length})</summary>${thisYr.slice().reverse().map(x=>{const k='e:'+x.date+'|'+x.r.round;return`<div class="list-item small"><b>${x.r.score}</b> ${x.r.round} · ${fmtD(x.date)} · rating ${x.rt.toFixed(1)}<br>${esc(x.r.event)}<br>${EV_LABEL[x.ev]}${x.q?' ✓ qualifying':''}${x.ev!='club'&&disc=='Outdoor'&&minDistOK(x.r,c)===false?' (round too short or too close to qualify)':''}
   <label style="display:flex;gap:6px;align-items:center;margin-top:2px"><input type="checkbox" data-ev="${esc(k)}" style="width:auto" ${x.ev!='club'?'checked':''}> This was a ranking shoot (open tournament, state/national ranking or QRE)</label></div>`}).join('')}</details></details>`}).join('');
 const nx=(NEXT||[]).map(x=>`<li><a href="https://archerycalendars.com/#/shoot/${encodeURIComponent(x.id)}" target="_blank" rel="noopener">${esc(x.name)}</a> · ${fmtD(x.start_date)} · ${x.state||'AUS'}</li>`).join('');
 return`<div class="card"><h3>Rating & classification</h3><p class="small muted" style="margin:0">Archery Australia rating and levels · ${yr}</p>${body||'<p class="small muted">No supported rounds yet.</p>'}
 ${nx?`<h3 style="margin-top:10px">Next chance</h3><p class="small muted" style="margin:0">Upcoming registered tournaments, state/national events and QREs (WA first) from archerycalendars.com.</p><ul class="small" style="padding-left:18px">${nx}</ul>`:''}
 <details style="margin-top:8px"><summary class="small"><b>How this works</b></summary><p class="small">Ratings use the Archery Australia rating model (J. Park), the one Archer's Diary uses, calculated on this phone from round, score and bow type. They're within about 0.3 of Archer's Diary outdoors; indoor can read up to 1.5 higher.</p>
 <p class="small">Levels and event rules: AA Shooting Rules v7.2, Schedule 4A.1 and rules 4.2.3 (outdoor) and 4.2.4 (indoor). You need 3 rounds at the level in the calendar year. White to Gold can be shot at a club-calendar shoot, open tournament or QRE. Master and Grand Master need at least 1 of the 3 at an open tournament or QRE. Elite Bronze, Silver and Gold need all 3 at an open tournament or QRE. Outdoors, those rounds need 72+ arrows with at least 30 at the minimum distance for your class. The rules don't separate state and national ranking events here; both count. Three AA members must take part in shooting and scoring. Event types are guessed from the event name, so tick the box if it's wrong. Official claims go through your club.</p>
 <p class="small"><a href="https://www.archersdiary.com/RatingCalculator.aspx" target="_blank" rel="noopener">Archer's Diary calculator</a> · <a href="https://archery.org.au/wp-content/uploads/2026/07/SHOOTINGRULES-AA-2026-07-01.pdf" target="_blank" rel="noopener">AA Shooting Rules</a></p></details></div>`}

function me(){const b=badges(),url=location.href.split('#')[0]+'#share='+encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(shareData())))));
 app.innerHTML=`<div class="card"><span class="kicker">${S.profile}</span><h2>Badges</h2><div class="badges">${b.map(x=>`<div class="badge ${x[2]?'':'off'}"><i>${x[0]}</i>${x[1]}</div>`).join('')}</div></div>
 <div class="card"><span class="kicker">Evidence bank</span><h2>My best moments</h2><p class="small muted">Read these before a big shoot. You've done it before!</p>
 ${S.best.length?S.best.map(e=>`<div class="list-item"><b>${e.total}</b> · ${e.round} · ${e.date} ${e.sample?'<span class="sample">sample</span>':''}<div class="small">${e.text}</div></div>`).join(''):'<p>Nothing saved yet. Tap "Save to my evidence bank" on a good day.</p>'}
 <label for="bm">Add a moment in your own words</label><textarea id="bm" rows="2" placeholder="e.g. Stayed calm in the shoot-off at Kalamunda"></textarea><button class="btn ghost" id="bmadd" style="margin-top:6px">Add</button></div>
 <div class="card"><span class="kicker">Coach / parent</span><h2>Share a read-only view</h2><p class="small">Send this link to your coach or parent. They'll see progress and effort, but can't change anything.</p><input readonly value="${url}" id="sh" aria-label="share link"><button class="btn ghost" id="cp" style="margin-top:6px">Copy link</button> <a class="btn ghost" href="${url}" style="margin-top:6px">Preview</a></div>
 <div class="card"><span class="kicker">Squads</span><h2>My squad</h2><p class="small">A private, chat-free group to cheer each other on.</p><button class="btn" onclick="nav('squad')">Open squads</button></div><div class="card"><button class="btn ghost" id="sw">Switch archer</button> <button class="btn ghost" id="rs">Reset demo</button></div>`;
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
 
 <a class="btn full" href="${location.href.split('#')[0]}">Open my own ScoreTool</a>`}

loadReal().then(()=>{nav(view)});
addEventListener('hashchange',()=>{if(location.hash.startsWith('#share='))render();else nav(location.hash=='#plot'?'score':'home')});
