/* Finished rounds -> the archer's My events on Archery Calendar (22 Oct 2026).
   Link once: Me › Settings › Archery Calendar (or the one-time prompt) opens archerycalendars.com/#/scoretool, where the archer signs in
   and taps Link. The calendar hands back a secret that can ONLY add/update this archer's own ScoreTool scores (supabase/scoretool_scores.sql
   in the calendar repo). Stored data: NEW keys only (scoretool.cal.<tester>.*). Scores already finished before this update are never sent,
   and no score, session or other stored record is changed. Never blocks scoring: everything is async and silent on failure. */
(function(){
const SB='https://sllsqpfqwckwtljzjxli.supabase.co',KEY_PUB='sb_publishable_t2g3KYdoGeTtcXTO-URK9g_Nf69SEFq',CAL='https://archerycalendars.com/';
const WHO=()=>typeof TESTER!='undefined'&&TESTER&&TESTER.id||null;
const K=n=>'scoretool.cal.'+WHO()+'.'+n,get=n=>{try{return JSON.parse(localStorage.getItem(K(n))||'null')}catch(e){return null}},put=(n,v)=>localStorage.setItem(K(n),JSON.stringify(v));
const TARGET=/scoretool-lab/.test(location.pathname)?'lab':'demo';
const linkUrl=()=>CAL+'#/scoretool?to='+TARGET;
const okTok=t=>/^[0-9a-f]{48}$/.test(t||'');
let state={err:'',live:null,busy:false};
/* the calendar sends the secret back as #stcal=... (never sent to any server); keep it, then tidy the address */
function takeHash(){const m=/^#stcal=([0-9a-f]{48})$/.exec(location.hash||'');if(!m)return;
 if(WHO()){put('link',m[1]);put('prompted',1);state.err='';setTimeout(()=>{toast2('Linked to your Archery Calendar. Finished rounds will show in My events.');tick()},300)}else sessionStorage.setItem('scoretool.cal.pending',m[1]);
 history.replaceState(history.state,'',location.pathname+location.search)}
takeHash();addEventListener('hashchange',takeHash);
function adoptPending(){const p=sessionStorage.getItem('scoretool.cal.pending');if(p&&WHO()&&okTok(p)){put('link',p);put('prompted',1);sessionStorage.removeItem('scoretool.cal.pending')}}
/* Event ties (23 Oct 2026): a score can be tied to an Archery Calendar event. Kept under the NEW key scoretool.cal.<tester>.events
   ({sessionId:{id,name,club,date,fun,official,send}}); the score record itself is never changed. A tie made by the archer ('send')
   also sends that score to My events, even if it was shot before the link or isn't finished (the total so far, marked partial). */
const evs=()=>get('events')||{};
window.calEvOf=s=>{if(!WHO()||!s||!s.id)return null;try{seedNathe()}catch(e){}return evs()[s.id]||null};
window.calSetEv=(id,o)=>{if(!WHO()||!id)return;const E=evs();if(o)E[id]=o;else delete E[id];put('events',E);setTimeout(tick,50)};
/* Nathe asked (23 Oct) for his 18 Oct 2026 score to show on that day's Melville 3D in My events: tie it once, his own score only */
function seedNathe(){if(WHO()!='nathe'||get('mel1018'))return;const E=evs();let n=0;
 (S.sessions||[]).filter(s=>s&&!s.sample&&s.date=='2026-10-18'&&ROUNDS[s.round]&&ROUNDS[s.round].aba&&Array.isArray(s.ends)&&arrowsIn(s)>0&&!E[s.id])
  .forEach(s=>{E[s.id]={id:'ad-melville-3d-2026-10-18',name:'3D - Bowmen of Melville',club:'Bowmen of Melville',date:'2026-10-18',fun:1,send:1};n++});
 if(n){put('events',E);put('mel1018',1)}}
const forced=s=>{const e=s&&s.id&&evs()[s.id];return !!(e&&e.send&&!s.sample&&Array.isArray(s.ends)&&ROUNDS[s.round]&&arrowsIn(s)>0)};
const tiedRound=s=>{const e=evs()[s.id];if(!e)return null;const R=ROUNDS[s.round],n=s.ends.filter(x=>x&&x.length).length;
 return (e.name+(R.aba?' · ABA scoring':'')+(isFull(s)?'':' (partial: '+n+' of '+R.ends+(R.aba?' targets)':' ends)'))).slice(0,120)};
const finished=s=>s&&!s.sample&&Array.isArray(s.ends)&&ROUNDS[s.round]&&(isDone(s)||(!!s.finished&&arrowsIn(s)>0));
const maxOf=s=>{const R=ROUNDS[s.round];if(!isFull(s))return null;const m=bugsOn(s)?R.ends*R.ape*6:R.max;return m>0&&m<=5000?m:null};
const sig=s=>{const t=tiedRound(s);return JSON.stringify(t?[s.date,t,total(s),maxOf(s),evs()[s.id].club||null]:[s.date,s.round,total(s),maxOf(s),s.loc||null])};
/* first run for this archer: everything already finished is marked as 'before the update' and never sent */
function baseline(){if(get('base'))return;put('base',(S.sessions||[]).filter(finished).map(s=>s.id))}
function todo(){const base=new Set(get('base')||[]),gone=new Set(get('discarded')||[]),sent=get('sent')||{};return (S.sessions||[]).filter(s=>(forced(s)||finished(s)&&!base.has(s.id))&&!gone.has(s.id)&&sent[s.id]!==sig(s))}
window.calDiscard=id=>{if(!WHO()||!id)return;const d=get('discarded')||[];if(!d.includes(id)){d.push(id);put('discarded',d.slice(-500))}};
async function send(s,tok){const r=await fetch(SB+'/rest/v1/rpc/scoretool_save_score',{method:'POST',headers:{apikey:KEY_PUB,Authorization:'Bearer '+KEY_PUB,'Content-Type':'application/json'},
  body:JSON.stringify({p_token:tok,p_source_id:WHO()+':'+s.id,p_shot_date:s.date,p_round:String(tiedRound(s)||s.round).slice(0,120),p_score:total(s),p_max:maxOf(s),p_location:(c=>c?String(c).slice(0,120):null)(tiedRound(s)?evs()[s.id].club:s.loc)})});
 if(r.ok)return 'ok';const j=await r.json().catch(()=>({}));if(r.status==404||/PGRST202/.test(j.code||''))return 'off';if(/not linked/i.test(j.message||''))return 'unlinked';return 'err'}
async function tick(){try{if(!WHO()||typeof S=='undefined'||!S.unlocked||state.busy)return;adoptPending();baseline();seedNathe();const L=todo();if(!L.length)return;
 const tok=get('link');if(!okTok(tok)){maybePrompt();return}
 if(!navigator.onLine)return;state.busy=true;const sent=get('sent')||{};
 for(const s of L){const r=await send(s,tok);if(r=='ok'){sent[s.id]=sig(s);put('sent',sent);state.live=true;state.err=''}
  else if(r=='off'){state.live=false;break}else if(r=='unlinked'){localStorage.removeItem(K('link'));state.err='The link was removed on Archery Calendar. Link again to keep adding scores.';break}else{state.err='Couldn’t reach Archery Calendar. Will try again.';break}}
}catch(e){}finally{state.busy=false}}
setInterval(tick,4000);addEventListener('online',tick);setTimeout(tick,1500);
/* once only, never in the way: a small card after a round is finished, if not linked */
function scoringNow(){try{return typeof cur!='undefined'&&!!cur&&typeof isDone=='function'&&!isDone(cur)&&view=='score'}catch(e){return false}}
setInterval(()=>{const d=document.getElementById('calPrompt');if(d&&scoringNow())d.remove()},500);
function maybePrompt(){if(get('prompted')||scoringNow()||document.getElementById('calPrompt')||document.getElementById('leaveov')||document.querySelector('[role=dialog],[aria-modal=true]'))return;put('prompted',1);
 const d=document.createElement('div');d.id='calPrompt';d.className='calprompt';d.setAttribute('role','status');
 d.innerHTML='<b>'+(window.icon?icon('calendar'):'')+' Add finished scores to your Archery Calendar?</b><span>They show in My events on the day you shot them. Only you can see them.</span><span style="font-size:1rem;line-height:1.5">How: 1. Tap Add to my Archery Calendar. 2. Sign in on archerycalendars.com, then tap Link ScoreTool. 3. Tap Back to ScoreTool.</span><div><a class="btn alt" id="calGo" href="'+linkUrl()+'">Add to my Archery Calendar</a> <button class="btn ghost" id="calNo">Not now</button></div>';
 document.body.appendChild(d);d.querySelector('#calNo').onclick=()=>d.remove();d.querySelector('#calGo').onclick=()=>d.remove();setTimeout(()=>d.remove(),20000)}
function toast2(t){const d=document.createElement('div');d.className='calprompt';d.setAttribute('role','status');d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),4000)}
/* Me › Settings & help: link status */
window.calCard=function(){if(!WHO())return'';const tok=get('link'),n=Object.keys(get('sent')||{}).length;
 return`<div class="card" id="calcard"><span class="kicker">Archery Calendar</span><h2>Scores in My events</h2>
 ${okTok(tok)?`<p class="small" style="margin:0 0 8px">${(window.icon?icon('check'):'')} Linked. Rounds you finish are added to My events on archerycalendars.com on the day you shot them${n?` (${n} so far)`:''}.${state.live===false?' Waiting for Archery Calendar to switch this on; nothing is lost, they’ll go when it’s ready.':''}</p><button class="btn ghost" id="calUn">Unlink</button>`
 :`<p class="small" style="margin:0 0 8px">Link once and every round you finish from now on shows in your Archery Calendar's My events. Rounds finished before you link aren't sent. Only you can see them.</p><a class="btn alt" href="${linkUrl()}">Add to my Archery Calendar</a>
 <div style="margin-top:12px;font-size:1.05rem;line-height:1.55"><b>How to link</b><ol style="margin:6px 0 6px 1.3em;padding:0"><li>Tap <b>Add to my Archery Calendar</b>.</li><li>On archerycalendars.com, sign in (or make a free account), then tap <b>Link ScoreTool</b>.</li><li>Tap <b>Back to ScoreTool</b>. This card will say <b>Linked</b>.</li></ol><p style="margin:4px 0">Finished rounds then show in My events on the day you shot them. Rounds from before you link aren't sent. Only you can see them.</p><p style="margin:4px 0">Using ScoreTool from your home screen? Copy the code shown on the link page and paste it below.</p></div>
 <details style="margin-top:10px"><summary class="small">Using ScoreTool as an installed app? Paste the code instead</summary><label for="calCode">Link code from Archery Calendar</label><input id="calCode" autocomplete="off" inputmode="latin" placeholder="48 letters and numbers"><button class="btn ghost" id="calPaste" style="margin-top:8px">Link</button></details>`}
 ${state.err?`<p class="small" role="alert" style="margin:8px 0 0">${state.err}</p>`:''}</div>`};
window.calBind=function(){const u=document.getElementById('calUn');if(u)u.onclick=async()=>{if(!confirm('Unlink Archery Calendar? Scores already added stay there.'))return;const tok=get('link');localStorage.removeItem(K('link'));
  try{await fetch(SB+'/rest/v1/rpc/scoretool_unlink',{method:'POST',headers:{apikey:KEY_PUB,Authorization:'Bearer '+KEY_PUB,'Content-Type':'application/json'},body:JSON.stringify({p_token:tok})})}catch(e){}render()};
 const p=document.getElementById('calPaste');if(p)p.onclick=()=>{const v=(document.getElementById('calCode').value||'').trim().toLowerCase();if(!okTok(v)){alert('That code doesn’t look right. It is 48 letters and numbers.');return}put('link',v);put('prompted',1);state.err='';render();tick()}};
})();
