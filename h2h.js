/* Head-to-head: two testers shoot the same indoor round on their own phones and see each other's ends (20 Oct 2026).
   Works between ANY two testers (not tied to the squad). Each phone keeps its own copy of the match in S.matches.
   Relay: ntfy.sh public topics (no account, no server of ours). Only the tester id, the tester's chosen display name (nm, nt = when
   chosen), round, match code and arrow scores are sent, never real names, contact details or notes. Topics use an unguessable match code; relay messages expire after 12 hours.
   Near-live: each phone sends its ends when they change and checks the relay every 8 seconds while the app is open. */
const H2H_BASE='https://ntfy.sh',H2H_NS='scoretool-h2h-q7m4';
const h2hTopic=c=>H2H_NS+'-'+String(c).toLowerCase().replace(/[^a-z0-9]/g,''),h2hInbox=id=>H2H_NS+'-in-'+id;
const H2H_ROUNDS=()=>Object.keys(ROUNDS).filter(r=>/^Indoor WA/.test(r)&&!ROUNDS[r].custom);
const H2H_MODES={total:'Highest total',sets:'Set points (2 for a set win, 1 for a draw, first to 6)'};
const h2hMe=()=>TESTER?TESTER.id:null,h2hShort=id=>testerName(id);
const h2hAll=()=>S.matches=S.matches||[],h2hGet=c=>h2hAll().find(m=>m.code==c);
const h2hSess=m=>m&&m.sid?S.sessions.find(s=>s.id==m.sid):null;
function h2hCode(){const L='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',a=new Uint32Array(8);crypto.getRandomValues(a);return Array.from(a,x=>L[x%L.length]).join('')}
async function h2hPost(topic,o){try{const r=await fetch(H2H_BASE+'/'+topic,{method:'POST',body:JSON.stringify(o)});return r.ok}catch(e){return false}}
async function h2hPoll(topic,since){try{const r=await fetch(H2H_BASE+'/'+topic+'/json?poll=1&since='+(since||'all'),{cache:'no-store'});if(!r.ok)return null;
 return(await r.text()).split('\n').filter(Boolean).map(l=>{try{const j=JSON.parse(l);if(j.event!='message')return null;const d=JSON.parse(j.message);d._id=j.id;return d}catch(e){return null}}).filter(Boolean)}catch(e){return null}}
const h2hNm=()=>{const o=TESTER&&nmOwn(TESTER.id);return o?{nm:o.n,nt:o.nt}:{}};
const h2hMyDone=m=>{const s=h2hSess(m);return!!(s&&(isDone(s)||(s.finished&&arrowsIn(s)>0)))};
const h2hState=m=>{const s=h2hSess(m);return{k:'st',code:m.code,by:h2hMe(),round:m.round,mode:m.mode,a:m.a,b:m.b,ends:s?s.ends.filter(e=>e&&e.length):[],done:h2hMyDone(m),...h2hNm(),t:Date.now()}};
/* Score the match from MY side: a = me, b = opponent. Only ends both archers have finished count for sets. */
function h2hCalc(m){const R=ROUNDS[m.round]||{ape:3,ends:20},ape=R.ape,s=h2hSess(m),A=s?s.ends.filter(e=>e&&e.length):[],B=(m.op&&m.op.ends)||[],full=e=>e&&e.length==ape;
 let ta=0,tb=0,sa=0,sb=0,win=null;const rows=[],n=Math.max(A.length,B.length);
 for(let i=0;i<n;i++){const a=A[i]||[],b=B[i]||[],ea=endSum(a),eb=endSum(b);ta+=ea;tb+=eb;let pa=null,pb=null;
  if(m.mode=='sets'&&!win&&full(a)&&full(b)){pa=ea>eb?2:ea==eb?1:0;pb=eb>ea?2:ea==eb?1:0;sa+=pa;sb+=pb;if((sa>=6||sb>=6)&&sa!=sb)win=sa>sb?'a':'b'}
  rows.push({i,a,b,ea,eb,ta,tb,fa:full(a),fb:full(b),pa,pb,sa,sb})}
 const dA=h2hMyDone(m),dB=!!(m.op&&m.op.done),cnt=(E,f)=>E.flat().filter(f).length;let tie='';
 if(m.mode!='sets'&&dA&&dB){if(ta!=tb)win=ta>tb?'a':'b';else{const t1=cnt(A,x=>x=='X'||x=='10'),t2=cnt(B,x=>x=='X'||x=='10');if(t1!=t2){win=t1>t2?'a':'b';tie='Tied on total, decided on 10s (incl. X)'}else{const x1=cnt(A,x=>x=='X'),x2=cnt(B,x=>x=='X');if(x1!=x2){win=x1>x2?'a':'b';tie='Tied on total and 10s, decided on Xs'}else win='draw'}}}
 if(m.mode=='sets'&&!win&&dA&&dB)win=sa==sb?'draw':sa>sb?'a':'b';
 return{rows,ta,tb,sa,sb,win,tie,dA,dB}}
function h2hLine(m){const c=h2hCalc(m),o=h2hShort(m.opp);return m.mode=='sets'?`You ${c.sa} – ${c.sb} ${o} (set points)`:`You ${c.ta} – ${c.tb} ${o}`}
function h2hResult(m,c){const o=h2hShort(m.opp);if(!c.win)return'';return c.win=='draw'?'Draw':c.win=='a'?'▲ You win':`▲ ${esc(o)} wins`}
window.h2hChip=function(s){const m=h2hGet(s.h2h);if(!m)return'';const c=h2hCalc(m),r=h2hResult(m,c);
 return`<button class="ad-small h2hchip" id="h2hchip" onclick="h2hView('${m.code}')" aria-label="Open head-to-head match">⚔ ${esc(h2hLine(m))}${r?' · '+r:''}</button>`};
/* Start a session for a match (same as Score > Start, tagged with the match code) */
function h2hStart(m){const r=m.round;S.lastRound=r;sv='entry';justDone=false;fix=null;if(typeof PZ!='undefined'){PZ.k=1;PZ.cx=PZ.cy=0}
 cur={id:'s'+Date.now(),date:today(),round:r,ends:[[]],pos:[[]],note:'',h2h:m.code};if(indoor3(ROUNDS[r],faceR(ROUNDS[r],0)))cur.face3=S.face3||'vert';
 S.sessions.push(cur);m.sid=cur.id;m.status='active';save();h2hPost(h2hTopic(m.code),h2hState(m));m.sent=JSON.stringify(h2hState(m).ends)+h2hMyDone(m);save();history.pushState({scoring:1},'');score();scrollTo(0,0)}
window.h2hCard=function(){if(!TESTER)return`<div class="card"><span class="kicker">Head-to-head</span><h3>Shoot against another tester</h3><p class="small muted">Pick your tester name in Me first.</p></div>`;
 const L=h2hAll().slice().reverse(),inv=L.filter(m=>m.status=='invite'),act=L.filter(m=>m.status!='invite'&&m.status!='declined').slice(0,6),me=h2hMe();
 return`<div class="card" id="h2hcard"><span class="kicker">Head-to-head</span><h3>Shoot an indoor round against another tester</h3><p class="small muted" style="margin:2px 0 8px">You both score on your own phones and see each other's ends as you go.</p>
 ${inv.map(m=>`<div class="list-item" data-inv="${m.code}"><b>${esc(h2hShort(m.opp))} challenged you</b><div class="small muted">${esc(m.round)} · ${esc(m.mode=='sets'?'Set points':'Highest total')}</div><div class="row" style="gap:6px;justify-content:flex-start;margin-top:6px"><button class="btn alt" data-h2hacc="${m.code}">Accept and start</button><button class="btn ghost" data-h2hno="${m.code}">Not now</button></div></div>`).join('')}
 ${act.map(m=>{const c=h2hCalc(m),r=h2hResult(m,c);return`<div class="list-item row"><span><b>vs ${esc(h2hShort(m.opp))}</b><div class="small muted">${esc(m.round)} · ${esc(h2hLine(m))}${r?' · <b>'+r+'</b>':m.status=='declined-by-opp'?' · they said not now':!m.op?' · waiting for them to accept':''}</div></span><button class="btn ghost" data-h2hopen="${m.code}">Open</button></div>`}).join('')}
 <details id="h2hnew"><summary class="btn full" style="list-style:none;text-align:center;margin-top:6px">Start a match</summary>
 <label for="h2hrd">Round</label><select id="h2hrd">${H2H_ROUNDS().map(r=>`<option ${r=='Indoor WA 18m'?'selected':''}>${esc(r)}</option>`).join('')}</select>
 <label for="h2hop">Opponent</label><select id="h2hop">${TESTERS.filter(t=>t.id!=me).map(t=>`<option value="${t.id}">${esc(testerName(t.id))}</option>`).join('')}</select>
 <label for="h2hmd">Scoring</label><select id="h2hmd">${Object.entries(H2H_MODES).map(([k,v])=>`<option value="${k}">${esc(v)}</option>`).join('')}</select>
 <button class="btn alt full" id="h2hgo" style="margin-top:10px">Send challenge and start scoring</button><p class="small muted">They see it on their Score tab and tap Accept. Only your display name, the round and your arrow scores are shared, just for this match.</p></details></div>`};
window.h2hBind=function(){const g=$('#h2hgo');if(g)g.onclick=()=>{const opp=$('#h2hop').value,me=h2hMe();if(!opp||!me)return;
  const m={code:h2hCode(),round:$('#h2hrd').value,mode:$('#h2hmd').value,a:me,b:opp,opp,created:Date.now(),status:'active'};h2hAll().push(m);
  h2hPost(h2hInbox(opp),{k:'inv',code:m.code,round:m.round,mode:m.mode,from:me,to:opp,...h2hNm(),t:Date.now()});h2hStart(m)};
 app.querySelectorAll('[data-h2hacc]').forEach(b=>b.onclick=()=>{const m=h2hGet(b.dataset.h2hacc);if(m)h2hStart(m)});
 app.querySelectorAll('[data-h2hno]').forEach(b=>b.onclick=()=>{const m=h2hGet(b.dataset.h2hno);if(!m)return;m.status='declined';save();h2hPost(h2hTopic(m.code),{k:'no',code:m.code,by:h2hMe(),t:Date.now()});score()});
 app.querySelectorAll('[data-h2hopen]').forEach(b=>b.onclick=()=>h2hView(b.dataset.h2hopen))};
window.h2hView=function(code){const m=h2hGet(code);if(!m)return;const c=h2hCalc(m),o=esc(h2hShort(m.opp)),s=h2hSess(m),R=ROUNDS[m.round]||{},sets=m.mode=='sets',r=h2hResult(m,c);
 const ago=m.seen?Math.max(0,Math.round((Date.now()-m.seen)/1000)):null,mk=(x,y,ok)=>ok&&x>y?' ▲':'';
 const st=r?`<p style="font-size:22px;font-weight:800;margin:6px 0">${r}</p>${c.tie?`<p class="small">${esc(c.tie)}</p>`:''}`:m.status=='declined-by-opp'?`<p>${o} said not now.</p>`:!m.op?`<p>Waiting for ${o} to accept. They'll see it on their Score tab.</p>`:`<p>${o} has shot ${plN(c.rows.filter(x=>x.fb).length,'end','ends')}${m.op.done?' and finished':''}.</p>`;
 app.innerHTML=`<div id="h2hview"><div class="card dark"><span class="kicker">Head-to-head · ${esc(sets?'Set points':'Highest total')}</span><h1>You vs ${o}</h1><p class="small" style="margin:0">${esc(m.round)} · ${plN(R.ends,'end','ends')} of ${R.ape}${sets?' · 2 for a set win, 1 for a draw, first to 6':''}</p>
 <p style="font-size:28px;font-weight:800;margin:8px 0 0">${sets?`${c.sa} – ${c.sb}`:`${c.ta} – ${c.tb}`}</p><p class="small" style="margin:0">You – ${o}${sets?' · set points':''}</p>${st}</div>
 <div class="card"><table class="ad-tab h2htab" style="width:100%"><thead><tr><th>End</th><th>You</th><th>${o}</th><th>${sets?'Sets':'Totals'}</th></tr></thead><tbody>
 ${c.rows.map(x=>{const both=x.fa&&x.fb;return`<tr><td>${x.i+1}</td><td${both&&x.ea>x.eb?' class="h2hwin"':''}>${x.a.length?`${esc(x.a.join(' '))} <b>${x.ea}</b>${mk(x.ea,x.eb,both)}`:'–'}</td><td${both&&x.eb>x.ea?' class="h2hwin"':''}>${x.b.length?`${esc(x.b.join(' '))} <b>${x.eb}</b>${mk(x.eb,x.ea,both)}`:'–'}</td><td>${sets?(x.pa!=null?`${x.sa} – ${x.sb}${x.pa==1?' (draw)':''}`:'–'):`${x.ta} – ${x.tb}`}</td></tr>`}).join('')||'<tr><td colspan="4" class="small muted">No ends yet.</td></tr>'}</tbody></table>
 <p class="small muted">▲ marks the higher end.${ago!=null?` Last update from ${o} ${ago<60?ago+'s':Math.round(ago/60)+' min'} ago.`:''} Updates every few seconds while the app is open.</p>
 <div class="row" style="gap:6px;justify-content:flex-start;flex-wrap:wrap">${s&&!h2hMyDone(m)?`<button class="btn alt" id="h2hback">Back to scoring</button>`:''}<button class="btn ghost" id="h2hrf">Refresh now</button><button class="btn ghost" id="h2hout">All matches</button></div></div></div>`;
 const b=$('#h2hback');if(b)b.onclick=()=>{cur=s;sv='entry';fix=null;score()};$('#h2hrf').onclick=()=>h2hTick(true);$('#h2hout').onclick=()=>{cur=null;sv='sheet';if(view!='score')nav('score');else score()}};
let h2hN=0,h2hBusy=false;
async function h2hTick(force){if(h2hBusy||(document.hidden&&!force)||!TESTER)return;h2hBusy=true;try{const me=h2hMe();let ch=false;
 if(force||h2hN++%4==0){if(window.nmSync)nmSync();const L=await h2hPoll(h2hInbox(me),S.h2hIn);if(L&&L.length){L.forEach(d=>{S.h2hIn=d._id;if(d.k=='inv'&&d.to==me&&d.nm&&nmLearn(d.from,d.nm,d.nt))ch=true;if(d.k=='inv'&&d.to==me&&d.from!=me&&d.code&&ROUNDS[d.round]&&!h2hGet(d.code)){h2hAll().push({code:d.code,round:d.round,mode:d.mode=='sets'?'sets':'total',a:d.from,b:me,opp:d.from,created:d.t||Date.now(),status:'invite'});ch=true}});save()}}
 const live=h2hAll().filter(m=>m.status!='declined'&&Date.now()-(m.created||0)<2*864e5&&!(m.op&&m.op.done&&h2hMyDone(m)&&m.sentDone));
 for(const m of live){if(m.sid){const st=h2hState(m),sig=JSON.stringify(st.ends)+st.done;if(sig!=m.sent){if(await h2hPost(h2hTopic(m.code),st)){m.sent=sig;if(st.done)m.sentDone=true;save()}}}
  const L=await h2hPoll(h2hTopic(m.code),m.since);if(L&&L.length){L.forEach(d=>{m.since=d._id;if(d.code!=m.code||d.by!=m.opp)return;if(d.nm&&nmLearn(d.by,d.nm,d.nt))ch=true;if(d.k=='st'){m.op={ends:(d.ends||[]).slice(0,60),done:!!d.done,t:d.t};m.seen=Date.now();if(m.status=='declined-by-opp')m.status='active'}if(d.k=='no'&&!m.op)m.status='declined-by-opp';ch=true});save()}}
 if(ch){const v=$("#h2hview"),chip=$("#h2hchip"),card=$("#h2hcard");if(v)h2hView(window._h2hv);else if(chip&&cur&&cur.h2h)chip.outerHTML=h2hChip(cur);else if(card&&!cur&&view=='score'&&!($('#h2hnew')||{}).open)score()}}finally{h2hBusy=false}}
const _h2hV=window.h2hView;window.h2hView=c=>{window._h2hv=c;_h2hV(c)};
setInterval(h2hTick,8000);setTimeout(()=>h2hTick(true),1500);document.addEventListener('visibilitychange',()=>{if(!document.hidden)h2hTick(true)});
