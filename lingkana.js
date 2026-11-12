/* C16: Lingkana League format (11 Nov 2026, Nathe).
   Separate from the Onion Shed Challenge. Do not retune Onion Shed scoring, table or final.
   Name: Lingkana League. No field cap (80+). Shoot-up is the top 12. Host defaults to Nathe pending Q11. */
(function(){
const LK_CODE='LINGKN26';
const LK_NAME='Lingkana League';
const LK_VENUE='Lingkana Archery range, 107 Robinson Ave, Belmont WA 6104';
const LK_HOURS='6:00 pm induction, shooting 6:30 pm to about 9:00 pm';
const LK_R='Lancaster 660';
const LK_DATES=['2026-11-18','2026-12-02','2026-12-16','2026-12-30','2027-01-13','2027-01-27','2027-02-10'];
const LK_NIGHTS=7;
const LK_CAP=0; /* no hard cap; shoot-up stays the top 12 */
const LK_HOST='nathe';
/* Test URL on GitHub Pages. The live root app at /scoretool-demo/ is unchanged. */
const LK_PUBLIC_BASE='https://nfstride1-ux.github.io/scoretool-demo/';
const LK_REGISTER_HASH='#lk-register';
const LK_HOME_HASH='#lk-home';
/* Printed on the poster; gates first-time registration only. Exact code: lk-onion26 (Lingkana, not Onion Shed). Not a scoring password. */
const LK_POSTER_CODE='lk-onion26';
/* Default scoring password hash (SHA-256 of salt + NUL + the default). The plaintext is not stored on the league record. Host can change it. */
const LK_PW_SALT='c16go1a2';
const LK_PW_HASH='0b2b4ba61065596219e55c1d32631b22f19943d13a8f23ade80336cce4aacee1';
const LK_REG_KEY='scoretool.lk.reg';
const LK_FEE=10; /* entry fee used later by the pot display; the $25 range fee is separate and excluded */
/* One-time live wipe: drop test sign-ups and claims from before this moment so all 660 nights start empty for 18 Nov. Do not bump — other archers' later registrations must be kept. */
const LK_FRESH=1794401520000; /* 2026-11-11 20:52 Australia/Perth: wipe slime and drop the host from the registered list */

/* Locked by Nathe 12 Nov 2026. Do not invent extras. Shown on the Lingkana rules page only. */
const LK_RULES=[
  'Name: Lingkana League. Venue: Lingkana Archery range, 107 Robinson Ave, Belmont WA 6104. Invite only.',
  'Dates: Wed 18 Nov, 2, 16 and 30 Dec, 13 and 27 Jan, shoot-up 10 Feb. Start 6:30pm, induction 6pm.',
  'Six nights of a 660 (60 arrows, 20 ends of 3, 18 m, 40 cm triangular 3-spot, X=11, max 660). Ranked on best 4 of 6, no minimum if a night is missed. Ties on 11s then 10s.',
  '$25 range plus $10 pot each night including night 7; pot paid 60/30/10.',
  'Groups of up to 4, one scorer. Value entry only. Scoring password for host and scorers only, not on the poster or share link.',
  'Night 7: 150 warm-up is not scored, then a ladder shoot-up for the top 12 (#12 v #11, winner moves up).'
];
function lkRulesHTML(){
  return`<ul>${LK_RULES.map(x=>`<li>${h(x)}</li>`).join('')}</ul>`;
}



const h=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const lkIs=lg=>!!(lg&&(lg.format==='lingkana'||lg.code===LK_CODE));
const lkNights=lg=>lkIs(lg)?LK_NIGHTS:6;
const lkRound=(lg,w)=>lkIs(lg)&&(+w||0)>=1&&(+w||0)<=6?LK_R:null;
const lkNight7=w=>+w===7;
const lkDate=(lg,w)=>(lg&&lg.weeks&&lg.weeks[w-1])||LK_DATES[w-1]||'';
const lkLabel=w=>w===7?'Shoot-up (top 12)':'Lancaster 660';
const lkFmtD=d=>{if(!d)return'';const x=new Date(d+'T00:00:00');return x.toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'Australia/Perth'})};

function lkRecord(){
  return{code:LK_CODE,name:LK_NAME,format:'lingkana',host:LK_HOST,venue:LK_VENUE,hours:LK_HOURS,
    order:[],weeks:LK_DATES.slice(),wt:Date.now(),cw:1,cwt:0,grp:{},gn:{},sc:{},reg:{},status:'active',
    created:Date.now(),preset:1,inviteOnly:true,
    pwSalt:LK_PW_SALT,pwHash:LK_PW_HASH,pwt:1};
}

function lkEnsure(){
  if(typeof S==='undefined'||!S)return null;
  const L=S.leagues=S.leagues||[];
  let lg=L.find(lkIs);
  if(!lg){lg=lkRecord();L.push(lg);if(typeof save==='function')save()}
  if(lg.name==='Lingkana Indoor League')lg.name=LK_NAME;
  if('cap' in lg)delete lg.cap;
  if(!lg.pwHash){lg.pwSalt=LK_PW_SALT;lg.pwHash=LK_PW_HASH;lg.pwt=lg.pwt||1}
  lkFresh(lg);
  if(typeof lkPullReg==='function')lkPullReg(lg);
  lkStripHostEntries(lg);
  lkDropHostIfUnregistered(lg);
  return lg;
}
function lkFresh(lg){
  if(!lg||!lkIs(lg))return lg;
  if((lg.fresh||0)<LK_FRESH){
    lg.sc={};lg.reg={};lg.claim={};lg.claimt=0;lg.gn={};lg.paid={};lg.paidt=0;lg.grp={};lg.inv=[];
    lg.order=[];
    lg.fresh=LK_FRESH;lg.dirty=1;lg.since=null;lg.posted=0;
    if(typeof save==='function')save();
  }
  lkDropHostIfUnregistered(lg);
  return lg;
}
function lkIsHostPerson(id,name){
  if(id&&(id===LK_HOST||id==='nathe'))return true;
  const n=lkCleanName(name||'').toLowerCase();
  return n==='nathe'||n==='nathaniel stride';
}
/* The host stays host (password, host tools) even when not on the registered list. Drop them from order unless they have a non-host sign-up or a score. */
function lkDropHostIfUnregistered(lg){
  if(!lg||!lkIs(lg))return lg;
  const host=lg.host||LK_HOST;
  const hasReg=Object.values(lg.reg||{}).some(list=>Array.isArray(list)&&list.some(r=>r&&!lkIsHostPerson(r.id,r.name)&&(r.id===host)));
  const hasSc=!!(lg.sc&&lg.sc[host]&&Object.keys(lg.sc[host]).length);
  if(hasReg||hasSc)return lg;
  const next=(lg.order||[]).filter(id=>id!==host&&id!=='nathe');
  if(next.length!==(lg.order||[]).length){
    lg.order=next;
    if(typeof save==='function')save();
  }
  return lg;
}
/* Clear the host's personal/test identity from the event-league register and known-name list only. Does not bump LK_FRESH or wipe other archers. */
function lkStripHostEntries(lg){
  if(!lg||!lkIs(lg))return lg;
  let ch=false;
  const next=(lg.order||[]).filter(id=>{
    const n=(lg.gn&&lg.gn[id]&&lg.gn[id].n)||'';
    return !lkIsHostPerson(id,n);
  });
  if(next.length!==(lg.order||[]).length){lg.order=next;ch=true}
  if(lg.gn){
    for(const id of Object.keys(lg.gn)){
      if(lkIsHostPerson(id,(lg.gn[id]&&lg.gn[id].n)||'')){delete lg.gn[id];ch=true}
    }
  }
  if(lg.reg){
    for(const night of Object.keys(lg.reg)){
      const L=(lg.reg[night]||[]).filter(r=>r&&!lkIsHostPerson(r.id,r.name));
      if(L.length!==(lg.reg[night]||[]).length){lg.reg[night]=L;ch=true}
    }
  }
  if(lg.claim){
    for(const night of Object.keys(lg.claim)){
      const bag=lg.claim[night]||{};
      for(const id of Object.keys(bag)){
        if(lkIsHostPerson(id,(bag[id]&&bag[id].name)||'')){delete bag[id];ch=true}
      }
    }
  }
  if(ch&&typeof save==='function')save();
  return lg;
}
function lkSeed(){/* do not auto-insert a league record into existing tester lists; the card offers Open */return}

function lkDecorateCard(){
  /* 12 Nov 2026: Lingkana is already one flyer card in the league list. Do not add a second row. */
  return;
}

function lkGet(){return (typeof lgGet==='function'&&lgGet(LK_CODE))||((typeof S!=='undefined'&&S.leagues)||[]).find(lkIs)||null}


function lkIsMember(lg,id){return!!(lg&&id&&((lg.order||[]).includes(id)||(lg.inv||[]).includes(id)))}
function lkJoinGuard(code,me){
  const c=String(code||'').toUpperCase();
  const lg=(typeof lgGet==='function'&&lgGet(c))||(c===LK_CODE?lkGet():null);
  const isLk=c===LK_CODE||(lg&&lkIs(lg))||(lg&&lg.inviteOnly);
  if(!isLk)return null;
  if(lkIsMember(lg,me))return null; /* already invited or in; existing join flow may open the view */
  return 'This league is invite only. Ask the host to invite you, or use the register page with the invite code printed on the poster.';
}
function lkCanHost(lg){
  const me=typeof h2hMe==='function'?h2hMe():'';
  return!!(lg&&(lg.host===me||me==='nathe'||(typeof lgCanEd==='function'&&lgCanEd(lg))));
}
function lkInvite(id){
  const lg=lkEnsure();if(!lg)return 'The league is not on this phone yet.';
  if(!lkCanHost(lg))return 'Only the host can invite archers.';
  const who=String(id||'').trim();if(!who)return 'Pick someone to invite.';
  if((lg.order||[]).includes(who))return lgName?lgName(who)+' is already in this league.': 'Already in this league.';
  lg.inv=lg.inv||[];
  if(!lg.inv.includes(who))lg.inv.push(who);
  if(typeof save==='function')save();
  if(typeof h2hPost==='function'&&typeof h2hInbox==='function'&&typeof h2hNm==='function'){
    try{h2hPost(h2hInbox(who),{k:'lginv',code:lg.code,name:lg.name,from:h2hMe(),to:who,...h2hNm(),t:Date.now(),inviteOnly:1})}catch(e){}
  }
  return '';
}
function lkAccept(){
  const lg=lkEnsure(),me=typeof h2hMe==='function'?h2hMe():'';if(!lg||!me)return 'No league on this phone.';
  if(!((lg.inv||[]).includes(me)))return 'You have not been invited to this league.';
  lg.order=lg.order||[];
  if(!lg.order.includes(me))lg.order.push(me);
  lg.inv=(lg.inv||[]).filter(x=>x!==me);
  if(typeof save==='function')save();
  return '';
}
function lkAddGuest(name,jr){
  const lg=lkEnsure();if(!lg)return 'The league is not on this phone yet.';
  if(typeof lgAddGuest==='function')return lgAddGuest(lg.code,name,jr);
  return 'Cannot add a guest on this phone.';
}

function lkView(code){
  const lg=(typeof lgGet==='function'&&lgGet(code))||lkGet();
  if(!lg||!lkIs(lg))return;
  window._lgv=code||lg.code;cur=null;
  if($('#tabs'))$('#tabs').hidden=false;
  const me=typeof h2hMe==='function'?h2hMe():'';
  const w=lgWeek(lg),n=lkNights(lg);
  const days=LK_DATES.map((d,i)=>{
    const nite=i+1,on=w===nite,rd=lkLabel(nite);
    return`<li class="lk-night${on?' on':''}" data-lkn="${nite}"><b>Night ${nite}</b> · ${h(lkFmtD(d))} · ${h(rd)}${on?' <span class="lk-now">Current</span>':''}</li>`;
  }).join('');
  const closed660=w>=7;
  const n7=w===7?`<div class="card" id="lkn7"><span class="kicker">Night 7 · ${h(lkFmtD(LK_DATES[6]))}</span><h3>Shoot-up · top 12</h3>
    <p>The sixth Lancaster 660 was on ${h(lkFmtD(LK_DATES[5]))}. Night 7 starts with a 150 warm-up (not scored), then the ladder shoot-up for the top 12 (#12 v #11, the winner v #10, and so on to #1). The ladder will open closer to 10 Feb and is not built yet.</p></div>`:'';
  const score660=!closed660?`<p class="small muted">Night ${w} is a Lancaster 660 (20 ends of 3, X = 11, max 660) on a triangular 40 cm 3-spot. Values only: no plot face.</p>
    <p class="small muted">${h(LK_HOURS)}.</p>`:`<p class="small muted">The 660 nights are finished. Night 7 is the top-12 shoot-up (ladder not open yet).</p>`;
  const inList=(lg.order||[]).includes(me), invited=(lg.inv||[]).includes(me);
  const acceptUI=(!inList&&invited)?`<div class="card" id="lkaccept"><p>You have been invited to this league.</p><button class="btn alt" id="lkacc">Join this league</button><p class="small" id="lkaccmsg" role="alert"></p></div>`:'';
  const testers=(typeof TESTERS!=='undefined'?TESTERS:[]).filter(t=>t.id!==me&&t.id!==lg.host&&!(lg.order||[]).includes(t.id));
  const hostUI=lkCanHost(lg)?`<div class="card" id="lkhost"><span class="kicker">Host</span><h3>Invite or add a shooter</h3>
    <p class="small muted">Invite someone who uses ScoreTool, or add a name-only shooter you will score on this phone. Nobody can join with the league code alone.</p>
    <label for="lkivid">Invite a tester</label>
    <div class="row" style="gap:6px"><select id="lkivid" style="flex:1">${testers.map(t=>`<option value="${h(t.id)}">${h(t.name||t.id)}</option>`).join('')||'<option value="">No one left to invite</option>'}</select>
    <button class="btn alt" id="lkivgo">Invite</button></div>
    <p class="small" id="lkivmsg" role="alert"></p>
    <label for="lkgname" style="margin-top:8px">Add a name-only shooter</label>
    <input id="lkgname" maxlength="24" autocomplete="off" placeholder="Name">
    <label class="h2htk" style="margin-top:6px"><input type="checkbox" id="lkgjr"> Under 16 (nickname only)</label>
    <button class="btn alt" id="lkgadd" style="margin-top:6px">Add</button>
    <p class="small" id="lkgmsg" role="alert"></p>
    <p class="small muted">In the league: ${(lg.order||[]).length} archer${(lg.order||[]).length===1?'':'s'}.</p>
    <p class="small muted" style="margin-top:8px">Poster / share link (opens the event home): <code id="lkregurl">${h(lkEventHomeUrl())}</code></p>
    <p class="small muted">Invite code to print on the poster: <b id="lkpostercode">${h(LK_POSTER_CODE)}</b>. First-time registration only. This is not the scoring password.</p>
    </div>`:'';
  app.innerHTML=`<div class="card" id="lgview" data-lk="1"><span class="kicker">Invite-only league</span>
    <h1>${h(lg.name)}</h1>
    <p class="small" style="margin:0">${h(LK_VENUE)}</p>
    <p class="small muted" style="margin:4px 0 0">${h(LK_HOURS)}</p>
    <p class="small muted" style="margin:4px 0 0">No field cap · shoot-up is the top 12 · off-bow scores, no age or bow-type divisions in this first pot.</p>
    <ol class="lk-dates" style="padding-left:1.2em;margin:10px 0 0">${days}</ol>
    ${score660}</div>${n7}
    ${lkTableHTML(lg)}${lkPotHTML(lg)}${lkPwHTML(lg)}${lkGroupHTML(lg)}
    <p class="row" style="gap:6px;flex-wrap:wrap"><button class="btn alt" id="lkregopen">Register for a shoot night</button>
    <button class="btn alt" id="lkresultsgo">Print or share results</button></p>
    ${hostUI}${acceptUI}
    <p class="small muted" style="margin:8px 4px">This league is invite only. The eight-character code does not let someone join unless they have already been invited. Onion Shed Challenge stays a separate six-300 league, and its code-join is unchanged.</p>
    <p><button class="btn ghost" id="lgback">Back to leagues</button></p>`;
  if($('#lgback'))$('#lgback').onclick=()=>{window._lgv=null;nav(view==='lab_leagues'?'lab_leagues':'score')};
  if($('#lkregopen'))$('#lkregopen').onclick=()=>{try{history.replaceState(null,'',location.pathname+location.search+LK_REGISTER_HASH)}catch(e){}lkRegisterView()};
  if($('#lkacc'))$('#lkacc').onclick=()=>{const m=lkAccept();if(m){const e=$('#lkaccmsg');if(e)e.textContent=m;return}lkView(lg.code)};
  if($('#lkivgo'))$('#lkivgo').onclick=()=>{const m=lkInvite(($('#lkivid')||{}).value);const e=$('#lkivmsg');if(e)e.textContent=m||'Invited.';if(!m)lkView(lg.code)};
  if($('#lkgadd'))$('#lkgadd').onclick=()=>{const m=lkAddGuest(($('#lkgname')||{}).value,!!(($('#lkgjr')||{}).checked));const e=$('#lkgmsg');if(e)e.textContent=m||'Added.';if(!m)lkView(lg.code)};
  if($('#lkpotnight'))$('#lkpotnight').onchange=()=>{window._lkPotNight=+$('#lkpotnight').value;lkView(lg.code)};
  document.querySelectorAll('[data-lkpaid]').forEach(box=>box.onchange=()=>{const nw=+(window._lkPotNight||Math.min(LK_NIGHTS,lgWeek(lg)||1));const m=lkSetPaid(box.getAttribute('data-lkpaid'),lkNightKey(lg,nw),box.checked);if(m){box.checked=!box.checked;return}lkView(lg.code)});
  if($('#lkpwsave'))$('#lkpwsave').onclick=()=>{lkSetPassword(($('#lkpwnew')||{}).value).then(m=>{const e=$('#lkpwsetmsg');if(e)e.textContent=m||'Password saved.';if(!m){const i=$('#lkpwnew');if(i)i.value=''}})};
  if($('#lkaddg'))$('#lkaddg').onclick=()=>{const m=lkAddToGroup(Math.min(6,lgWeek(lg)),+(($('#lkpickg')||{}).value||0),(($('#lkpick')||{}).value||''));const e=$('#lkgrpmsg');if(e)e.textContent=m||'Added.';if(!m)lkView(lg.code)};
  document.querySelectorAll('[data-lkscore]').forEach(b=>b.onclick=()=>{const m=lkScoreGroup(Math.min(6,lgWeek(lg)),+b.getAttribute('data-lkscore'));const e=$('#lkgrpmsg');if(e&&m)e.textContent=m});
  if($('#lkpickq'))$('#lkpickq').oninput=()=>{const q=(($('#lkpickq')||{}).value||'').toLowerCase();document.querySelectorAll('#lkpick option').forEach(o=>{o.hidden=!!q&&!o.textContent.toLowerCase().includes(q)})};
  if($('#lkresultsgo'))$('#lkresultsgo').onclick=()=>{const w=Math.min(6,typeof lgWeek==='function'?lgWeek(lg):1);window._lkResNight=w;try{history.replaceState(null,'',location.pathname+location.search+'#lk-results&n='+w)}catch(e){}lkResultsView(w)};
  lkBindStandUI(lg);

}


function lkEventHomeUrl(){
  const base=String(window.LK_PUBLIC_BASE||LK_PUBLIC_BASE||'').replace(/\/?$/,'/');
  return base+(window.LK_HOME_HASH||LK_HOME_HASH||'#lk-home');
}
function lkRegisterUrl(){
  /* Poster and share links open the event home, not a standalone register page. */
  return lkEventHomeUrl();
}
function lkNormPoster(s){return String(s||'').toUpperCase().replace(/\s+/g,'').replace(/^#/,'')}
function lkPosterOk(code){return lkNormPoster(code)===lkNormPoster(window.LK_POSTER_CODE||LK_POSTER_CODE)}
function lkHashName(){
  return String(location.hash||'').replace(/^#/,'').split('?')[0].split('&')[0];
}
function lkIsRegHash(){
  const raw=lkHashName();
  const q=new URLSearchParams(location.search);
  return raw==='lk-register'||q.get('page')==='lk-register';
}
function lkIsHomeHash(){
  const raw=lkHashName();
  const q=new URLSearchParams(location.search);
  return raw==='lk-home'||raw==='lingkana'||q.get('page')==='lk-home'||q.get('page')==='lingkana';
}
function lkDeviceRegistered(){
  try{return (lkRegInbox()||[]).some(r=>r&&(r.league===LK_CODE||r.poster||r.name))}catch(e){return false}
}
function lkAlreadyRegistered(opts){
  opts=opts||{};
  const id=opts.id||null;
  const name=lkCleanName(opts.name||'');
  if(lkDeviceRegistered()&&(id||name)){
    const box=lkRegInbox()||[];
    if(box.some(r=>r&&((id&&r.id===id)||(name&&lkCleanName(r.name).toLowerCase()===name.toLowerCase()))))return true;
  }
  const lg=lkGet()||(typeof lkEnsure==='function'&&lkEnsure())||null;
  const known=typeof lkKnownRegistrants==='function'?lkKnownRegistrants(lg):[];
  if(known.some(a=>(id&&a.id===id)||(name&&lkCleanName(a.name).toLowerCase()===name.toLowerCase())))return true;
  if(lg&&lg.reg){
    for(const night of Object.keys(lg.reg)){
      const L=lg.reg[night]||[];
      if(L.some(r=>r&&((id&&r.id===id)||(name&&lkCleanName(r.name).toLowerCase()===name.toLowerCase()))))return true;
    }
  }
  return false;
}
function lkRegInbox(){try{const v=JSON.parse(localStorage.getItem(LK_REG_KEY)||'[]');return Array.isArray(v)?v:[]}catch(e){return[]}}
function lkRegPush(rec){const box=lkRegInbox();box.push(rec);try{localStorage.setItem(LK_REG_KEY,JSON.stringify(box))}catch(e){}}
function lkCleanName(raw){
  let n=String(raw||'').trim();
  if(typeof nmClean==='function')n=nmClean(n);
  return n.slice(0,24);
}
function lkFindArcher(lg,name){
  const n=lkCleanName(name).toLowerCase();if(!n||!lg)return null;
  for(const id of (lg.order||[])){
    const nm=(typeof lgName==='function'?lgName(id):((lg.gn||{})[id]&&(lg.gn||{})[id].n)||id);
    if(String(nm||'').toLowerCase()===n)return id;
  }
  return null;
}
function lkNewGuestId(lg){
  const L='abcdefghjkmnpqrstuvwxyz23456789';
  const rnd=()=>{try{return Array.from(crypto.getRandomValues(new Uint32Array(6)),x=>L[x%L.length]).join('')}catch(e){return Math.random().toString(36).slice(2,8)}};
  let id;do{id='g'+rnd()}while(((lg&&lg.order)||[]).includes(id));
  return id;
}
function lkApplyReg(rec,lg){
  lg=lg||(typeof lkEnsure==='function'?lkEnsure():null);if(!lg||!rec)return {ok:false,msg:'The league is not on this phone yet.'};
  const name=lkCleanName(rec.name);if(name.length<2)return{ok:false,msg:'Type a name (at least 2 characters).'};
  const night=String(rec.night||'');
  if(!LK_DATES.includes(night)&&(lg.weeks||[]).indexOf(night)<0)return{ok:false,msg:'Pick a shoot night.'};
  lg.reg=lg.reg||{};lg.gn=lg.gn||{};lg.order=lg.order||[];
  const me=(typeof h2hMe==='function'&&h2hMe())||'';
  let id=rec.id||null;
  if(id&&lkIsHostPerson(id,name))id=null;
  if(!id&&me&&!lkIsHostPerson(me,'')&&(typeof lgName==='function'?lgName(me):me).toLowerCase()===name.toLowerCase())id=me;
  if(!id)id=lkFindArcher(lg,name);
  if(id&&lkIsHostPerson(id,name))id=null;
  const first=!id||!(lg.order||[]).includes(id);
  if(!id){
    if(me&&!(lg.order||[]).includes(me)&&!(lgArchers&&false)){
      /* signed-in archer registering under a new name: still a named guest unless they used their own name */
      id=lkNewGuestId(lg);
    }else id=id||lkNewGuestId(lg);
  }
  if(!(lg.order||[]).includes(id)){
    lg.order.push(id);
    if(!TESTERS||!TESTERS.some(t=>t.id===id)){
      lg.gn[id]={n:name,j:rec.jr?1:0,t:rec.at||Date.now(),by:'register'};
    }
  }
  lg.reg[night]=lg.reg[night]||[];
  const already=lg.reg[night].some(r=>r.id===id);
  if(!already)lg.reg[night].push({id,name,at:rec.at||Date.now(),bow:rec.bow||'',email:rec.email||'',phone:rec.phone||''});
  lg.dirty=1;if(typeof save==='function')save();
  return{ok:true,id,first:first&&!already?1:0,night,already,name};
}
function lkPullReg(lg){
  lg=lg||lkGet();if(!lg)return 0;
  let n=0;for(const rec of lkRegInbox()){
    if(!rec||rec._applied)continue;
    const r=lkApplyReg(rec,lg);
    if(r&&r.ok){rec._applied=1;n++}
  }
  if(n){try{localStorage.setItem(LK_REG_KEY,JSON.stringify(lkRegInbox()))}catch(e){}}
  return n;
}
function lkRegister(opts){
  opts=opts||{};
  const name=lkCleanName(opts.name);if(name.length<2)return'Type a name (at least 2 characters).';
  const returning=!!opts.returning||lkAlreadyRegistered({id:opts.id,name:name});
  const code=opts.posterCode||opts.code||'';
  if(!returning&&!lkPosterOk(code))return 'That invite code is not right. Use the code printed on the poster.';
  if(typeof nmRude==='function'&&nmRude(name))return'Please use a different name.';
  const night=String(opts.night||'');
  if(!LK_DATES.includes(night))return'Pick a shoot night.';
  /* No registration deadline: a sign-up on the night, or after it has started, is accepted. */
  const rec={name,night,at:Date.now(),bow:String(opts.bow||'').slice(0,24),email:String(opts.email||'').slice(0,80),phone:String(opts.phone||'').slice(0,24),league:LK_CODE,poster:1};
  lkRegPush(rec);
  if(typeof S!=='undefined'&&S){
    const r=lkApplyReg(rec);
    if(!r.ok)return r.msg||'Could not add that registration.';
    rec.id=r.id;rec._applied=1;
    try{const box=lkRegInbox();const last=box[box.length-1];if(last&&last.at===rec.at){last.id=r.id;last._applied=1;localStorage.setItem(LK_REG_KEY,JSON.stringify(box))}}catch(e){}
    rec.id=rec.id||r.id;
  }
  try{
    if(typeof h2hPost==='function'&&typeof lgTopic==='function'){
      Promise.resolve(h2hPost(lgTopic(LK_CODE),{k:'lkreg',code:LK_CODE,rec:{name:rec.name,night:rec.night,at:rec.at,bow:rec.bow,email:rec.email,phone:rec.phone,id:rec.id||null,poster:1},t:rec.at,by:(typeof h2hMe==='function'&&h2hMe())||''})).catch(function(){});
    }
  }catch(e){}
  return '';
}
function lkNightKey(lg,w){return lkDate(lg,w)||LK_DATES[(+w||1)-1]||''}
function lkNightSignups(lg,w){
  const k=lkNightKey(lg,w);
  return ((lg&&lg.reg)||{})[k]||[];
}
function lkPickerOrder(lg,w){
  const night=lkNightSignups(lg,w).map(r=>r.id);
  const seen=new Set();const out=[];
  for(const id of night){if(!seen.has(id)){seen.add(id);out.push(id)}}
  for(const id of (lg&&lg.order)||[]){if(!seen.has(id)){seen.add(id);out.push(id)}}
  return out;
}
function lkDefaultNight(){
  /* Prefer the current or next listed night; never close a night because of a deadline. */
  const today=(typeof window!=='undefined'&&window._lgToday)||(typeof lgToday==='function'&&lgToday())||new Date().toLocaleDateString('en-CA');
  let pick=LK_DATES[0];
  for(const d of LK_DATES){if(d>=today){pick=d;break}pick=d}
  return pick;
}
function lkBootHome(){
  if(!(lkIsHomeHash()||lkIsRegHash()))return false;
  const homeHash=window.LK_HOME_HASH||LK_HOME_HASH||'#lk-home';
  const stay=()=>{try{if(location.hash!==homeHash)history.replaceState(null,'',location.pathname+location.search+homeHash)}catch(e){}};
  stay();
  setTimeout(stay,0);
  try{if($('#tabs'))$('#tabs').hidden=true}catch(e){}
  if(typeof lkFlowHome==='function'){lkFlowHome(LK_CODE);setTimeout(stay,0);return true}
  return false;
}
function lkBootReg(){
  /* Old #lk-register links and lk-register.html now open the event home, not a standalone register page. */
  return lkBootHome();
}
function lkKnownRegistrants(lg){
  lg=lg||lkGet()||(typeof lkEnsure==='function'&&lkEnsure())||null;
  const by=new Map();
  const generic=n=>/^Archer(\s+\d+)?$/i.test(String(n||'').trim());
  const add=(id,name,extra)=>{
    const fromGn=id&&lg&&(lg.gn||{})[id]&&(lg.gn||{})[id].n;
    const fromFn=id&&typeof lgName==='function'?lgName(id):'';
    const n=lkCleanName(name||fromGn||(!generic(fromFn)&&fromFn)||'');
    if(n.length<2)return;
    let rec=id&&[...by.values()].find(x=>x.id===id);
    if(!rec)rec=by.get(n.toLowerCase());
    if(!rec){rec={id:id||null,name:n,email:'',phone:'',bow:'',nights:[]};by.set(n.toLowerCase(),rec)}
    if(id&&!rec.id)rec.id=id;
    if(n&&rec.name!==n&&(generic(rec.name)||n.length>rec.name.length)){
      by.delete(String(rec.name).toLowerCase());
      rec.name=n;
      by.set(n.toLowerCase(),rec);
    }
    if(extra){
      if(extra.email&&!rec.email)rec.email=String(extra.email);
      if(extra.phone&&!rec.phone)rec.phone=String(extra.phone);
      if(extra.bow&&!rec.bow)rec.bow=String(extra.bow);
      if(extra.night&&!rec.nights.includes(extra.night))rec.nights.push(extra.night);
    }
  };
  if(lg){
    const reg=lg.reg||{};
    for(const night in reg){
      (reg[night]||[]).forEach(r=>{if(r)add(r.id,r.name,r)});
    }
    (lg.order||[]).forEach(id=>{
      const n=((lg.gn||{})[id]&&(lg.gn||{})[id].n)||'';
      if(lkIsHostPerson(id,n))return;
      add(id,n);
    });
  }
  try{
    (lkRegInbox()||[]).forEach(r=>{if(r&&!lkIsHostPerson(r.id,r.name))add(r.id,r.name,r)});
  }catch(e){}
  return [...by.values()].filter(a=>!lkIsHostPerson(a.id,a.name)).sort((a,b)=>String(a.name).localeCompare(String(b.name)));
}
function lkRegisterView(){
  const appEl=typeof app!=='undefined'?app:(typeof $==='function'&&$('#app'));
  if(!appEl)return;
  if(typeof lkEnsure==='function')lkEnsure();
  const lg=lkGet();
  const known=lkKnownRegistrants(lg);
  const pick=window._lkRetPick||null;
  const nights=LK_DATES.map(d=>{
    const i=LK_DATES.indexOf(d),lab=lkLabel(i+1);
    return`<option value="${h(d)}">${h(lkFmtD(d))} · Night ${i+1} · ${h(lab)}</option>`;
  }).join('');
  const ticks=LK_DATES.map(d=>{
    const i=LK_DATES.indexOf(d),lab=lkLabel(i+1);
    const on=pick&&(pick.nights||[]).includes(d);
    return`<label class="lk-tick"><input type="checkbox" name="nights" value="${h(d)}" ${on?'checked':''}> ${h(lkFmtD(d))} · Night ${i+1} · ${h(lab)}</label>`;
  }).join('');
  const def=lkDefaultNight();
  const myName=pick?pick.name:'';
  const skipCode=!!pick||lkDeviceRegistered();
  const knownHtml=known.length?`<div class="lk-known" id="lkknown"><p class="small muted">If you have already registered, tap your name, tick the nights you will shoot and save. You will not need the invite code or to enter your email or phone again.</p>${known.map(a=>`<button type="button" class="lk-known-btn${pick&&((pick.id&&pick.id===a.id)||pick.name===a.name)?' on':''}" data-lkret="${h(a.id||a.name)}">${h(a.name)}</button>`).join('')}</div>`:'';
  const contact=pick?`<p id="lkretnote">Signing in as <b>${h(pick.name)}</b>. Your email and phone are already saved.</p>`:
    `<label for="lkregemail">Email <span class="muted">(optional)</span></label>
      <input id="lkregemail" name="email" type="email" maxlength="80" autocomplete="email">
      <label for="lkregphone">Phone <span class="muted">(optional)</span></label>
      <input id="lkregphone" name="phone" maxlength="24" autocomplete="tel">`;
  const nightFields=pick?`<p>Nights</p><div id="lkregnights">${ticks}</div>`:
    `<label for="lkregnight">Shoot night</label>
      <select id="lkregnight" name="night">${nights}</select>`;
  appEl.innerHTML=`<div class="card" id="lkregpage"><span class="kicker">Lingkana League</span>
    <h1>Register for a shoot night</h1>
    <p class="small">${h(LK_VENUE)}</p>
    <p class="small muted">${h(LK_HOURS)}</p>
    <p>${skipCode?'Tap your name to sign up for more nights, or register someone new. There is no deadline — you can register on the night.':'This page is invite-only. Type the invite code printed on the poster, then register for the night you will shoot. There is no deadline — you can register on the night.'}</p>
    <p class="small muted">The first time you register, your name stays on the league list for the season. You still need to sign up again for every shoot night. After that you will not need the invite code again.</p>
    ${knownHtml}
    <form id="lkregform" autocomplete="on">
      ${skipCode?'':`<label for="lkregcode">Poster invite code</label>
      <input id="lkregcode" name="code" required autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Code on the poster">`}
      <label for="lkregname">Name</label>
      <input id="lkregname" name="name" required maxlength="24" autocomplete="name" value="${h(myName)}" placeholder="Your name" ${pick?'readonly':''}>
      ${nightFields}
      <label for="lkregbow">Bow type <span class="muted">(optional)</span></label>
      <input id="lkregbow" name="bow" maxlength="24" placeholder="e.g. Compound" value="${h(pick&&pick.bow||'')}">
      ${contact}
      <button class="btn alt" type="submit" id="lkreggo" style="margin-top:10px">${pick?'Save':'Register'}</button>
      <p class="small" id="lkregmsg" role="alert"></p>
    </form>
    <p class="small muted">Scoring on the night is separate and password-protected. This page does not take payments.</p>
    <div id="lkgetbox" style="margin:16px 0 8px">
      <p><a class="btn" id="lkgetapp" href="${h(LK_PUBLIC_BASE)}">Get ScoreTool</a></p>
      <p class="small muted">To keep it: tap Share or the ⋮ menu, then Add to Home Screen.</p>
    </div>
    <p><button class="btn ghost" type="button" id="lkregback">Back</button></p>
    </div>`;
  const nightEl=appEl.querySelector('#lkregnight');if(nightEl)nightEl.value=def;
  appEl.querySelectorAll('[data-lkret]').forEach(b=>b.onclick=()=>{
    const key=b.getAttribute('data-lkret');
    const rec=known.find(a=>(a.id&&a.id===key)||a.name===key)||null;
    window._lkRetPick=rec;
    lkRegisterView();
  });
  const nameEl=appEl.querySelector('#lkregname');
  if(nameEl&&pick)nameEl.addEventListener('input',()=>{
    if(lkCleanName(nameEl.value)!==lkCleanName(pick.name)){window._lkRetPick=null;lkRegisterView();const n=appEl.querySelector('#lkregname');if(n){n.value=nameEl.value;n.focus()}}
  });
  const form=appEl.querySelector('#lkregform');
  if(form)form.onsubmit=e=>{
    e.preventDefault();
    const box=appEl.querySelector('#lkregmsg');
    const code=(appEl.querySelector('#lkregcode')||{}).value;
    const name=(appEl.querySelector('#lkregname')||{}).value;
    const bow=(appEl.querySelector('#lkregbow')||{}).value;
    const returning=!!pick||lkAlreadyRegistered({id:pick&&pick.id,name:name});
    let nightsToSave=[];
    if(pick){
      nightsToSave=[...appEl.querySelectorAll('#lkregnights input:checked')].map(x=>x.value);
      if(!nightsToSave.length){if(box)box.textContent='Tick the nights you will shoot.';return}
    }else{
      nightsToSave=[(appEl.querySelector('#lkregnight')||{}).value].filter(Boolean);
    }
    const email=pick?(pick.email||''):(appEl.querySelector('#lkregemail')||{}).value;
    const phone=pick?(pick.phone||''):(appEl.querySelector('#lkregphone')||{}).value;
    let last='';
    for(const night of nightsToSave){
      last=lkRegister({posterCode:code,name,night,bow,email,phone,id:pick&&pick.id,returning:returning});
      if(last){if(box)box.textContent=last;return}
    }
    window._lkRetPick=null;
    if(box)box.textContent=pick?'You are registered for those nights. Tap your name next time — you will not need to enter your email or phone again.':'You are registered for that night. Your name stays on the league list; sign up again for each shoot.';
    /* Re-draw so the name now appears in the list, without exposing email or phone. */
    setTimeout(()=>lkRegisterView(),400);
  };
  const back=appEl.querySelector('#lkregback');
  if(back)back.onclick=()=>{window._lkRetPick=null;try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}if(typeof lkFlowHome==='function')lkFlowHome(LK_CODE);else if(typeof lkView==='function'&&lkGet())lkView(LK_CODE);else if(typeof nav==='function')nav('lab_leagues')};
}


function lkTens(E){return(E||[]).flat().filter(a=>a==='10').length}
function lkPickBest(W){
  /* No minimum nights. Total is the best 4 scores from the nights they shot (or all of them if fewer than four). A miss is —, not a zero. */
  const idx=[];(W||[]).forEach((c,i)=>{if(c)idx.push(i)});
  idx.sort((a,b)=>(W[b].s-W[a].s)||(W[b].x-W[a].x)||((W[b].t10||0)-(W[a].t10||0))||a-b);
  const count=idx.slice(0,4);
  return{
    count,
    t:count.reduce((n,i)=>n+W[i].s,0),
    x:count.reduce((n,i)=>n+W[i].x,0),
    tens:count.reduce((n,i)=>n+(W[i].t10||0),0),
    open:count.some(i=>!W[i].d)
  };
}
function lkNormName(nm){return String(nm||'').trim().replace(/\s+/g,' ').toLowerCase()}
function lkMergeNight(a,b){
  if(!a)return b||null;
  if(!b)return a;
  if(a.d&&!b.d)return a;
  if(b.d&&!a.d)return b;
  if((b.s||0)!==(a.s||0))return (b.s||0)>(a.s||0)?b:a;
  if((b.x||0)!==(a.x||0))return (b.x||0)>(a.x||0)?b:a;
  return a;
}
function lkApplyBest(r){const b=lkPickBest(r.W);r.t=b.t;r.x=b.x;r.tens=b.tens;r.count=b.count;r.open=b.open;return r}
function lkTable(lg){
  const A=(typeof lgArchers==='function'?lgArchers(lg):(lg&&lg.order)||[]);
  const seen=new Set(), ids=[];
  for(const id of A){if(!id||seen.has(id))continue;seen.add(id);ids.push(id)}
  const raw=ids.map(id=>{
    const W=[];
    for(let w=1;w<=6;w++){
      const e=(typeof lgEnt==='function'&&lgEnt(lg,id,w))||((lg.sc||{})[id]||{})[w]||null;
      if(typeof lgHas==='function'?lgHas(e):(e&&e.e&&e.e.some(x=>x&&x.length))){
        const ctx=Object.assign({xv:11,lancaster:true,round:LK_R,nEnds:20},e);
        const s=(typeof lgTot==='function'?lgTot(e.e,ctx):0);
        const x=(typeof lgXs==='function'?lgXs(e.e):0);
        const t10=lkTens(e.e);
        const d=typeof lgDoneE==='function'?lgDoneE(Object.assign({},e,{nEnds:e.nEnds||20})):!!(e.e&&e.e.filter(z=>z&&z.length==3).length>=20);
        W.push({s,x,t10,d});
      }else W.push(null);
    }
    const stored=lg&&lg.gn&&lg.gn[id]&&lg.gn[id].n;
    const nm=stored||(typeof lgName==='function'?lgName(id):id);
    return lkApplyBest({id,nm,W,named:!!stored});

  });
  const byName=new Map(), rows=[];
  for(const r of raw){
    const key=lkNormName(r.nm);
    const generic=!key||key==='archer'||key==='you'||key==='someone';
    const prev=(!generic&&key)?byName.get(key):null;
    if(prev){
      prev.W=prev.W.map((c,i)=>lkMergeNight(c,r.W[i]));
      const nights=row=>(row.W||[]).filter(Boolean).length;
      const ga=/^g[a-z0-9]{6}$/.test(String(prev.id||'')), gb=/^g[a-z0-9]{6}$/.test(String(r.id||''));
      if(nights(r)>nights(prev)||(nights(r)===nights(prev)&&ga&&!gb))prev.id=r.id;
      if(r.named||!prev.named)prev.nm=r.nm;
      lkApplyBest(prev);
    }else{
      if(!generic&&key)byName.set(key,r);
      rows.push(r);
    }
  }
  rows.sort((a,b)=>b.t-a.t||b.x-a.x||(b.tens||0)-(a.tens||0)||String(a.nm).localeCompare(String(b.nm)));
  rows.forEach((r,k)=>{r.rk=k&&rows[k-1].t==r.t&&rows[k-1].x==r.x&&(rows[k-1].tens||0)==(r.tens||0)?rows[k-1].rk:k+1});
  rows.forEach(r=>r.tie=rows.filter(o=>o.rk==r.rk).length>1);
  return rows;
}
function lkLastScoredNight(lg){
  let n=0;
  (lkTable(lg)||[]).forEach(r=>((r&&r.W)||[]).forEach((c,i)=>{if(c)n=Math.max(n,i+1)}));
  return n;
}
function lkStandSubtitle(lg){
  const n=lkLastScoredNight(lg);
  return n?('After Night '+n+' · '+lkFmtD(lkNightKey(lg,n))):'No nights scored yet';
}
function lkTableHTML(lg){
  const me=(typeof h2hMe==='function'&&h2hMe())||'';
  const rows=lkTable(lg);
  const cells=(r,c,i)=>{
    if(!c)return'<td class="lk-miss">—</td>';
    const on=r.count.includes(i);
    const body=c.d?String(c.s):`<i>${c.s}</i>`;
    return`<td class="${on?'lk-keep':'lk-drop'}"${on?' title="Counts in the best 4"':''}>${body}</td>`;
  };
  const tot=r=>r.open?`<i>${r.t}</i>`:String(r.t);
  return`<div class="card" id="lkstand"><h3>Standings · best 4 of 6</h3>
    <div class="lk-printhead"><p class="lk-printbrand">ScoreTool</p><h2>Lingkana Indoor League · Standings</h2><p>${h(lkStandSubtitle(lg))}</p></div>
    <div class="lk-standwrap"><table class="lk-stand" id="lktab"><colgroup><col class="rk"><col class="nm"><col class="n"><col class="n"><col class="n"><col class="n"><col class="n"><col class="n"><col class="best"><col class="xs"><col class="ts"></colgroup>
    <thead><tr><th></th><th class="nm">Archer</th>${[1,2,3,4,5,6].map(k=>`<th>N${k}</th>`).join('')}<th>Best 4</th><th>11s</th><th>10s</th></tr></thead>
    <tbody>${rows.map(r=>`<tr data-lkrow="${h(r.id)}"><td class="rk">${r.tie?'=':''}${r.rk}</td><td class="nm">${h(r.nm)}${r.id==me?' (you)':''}</td>${r.W.map((c,i)=>cells(r,c,i)).join('')}<td class="best">${tot(r)}</td><td class="xs">${r.x}</td><td class="ts">${r.tens||0}</td></tr>`).join('')||'<tr><td colspan="11">No scores yet.</td></tr>'}</tbody></table></div>
    <div class="lk-standbar">
      <button class="btn alt" type="button" id="lkstandshare">Share</button>
      <button class="btn alt" type="button" id="lkstandprint">Print</button>
      <p class="small" id="lkstandsharemsg" role="status"></p>
    </div>
    <p class="small muted" style="margin:4px 0 0">No minimum nights. The total is the best 4 scores from the nights they shot (or all of them if they have fewer than four). Max 2,640. The four that count are marked. A missed night is — and is not a zero. Italics = still shooting. Rank is by highest total, then 11s on the counting scores, then 10s. The shoot-up is the top 12. Night 7 is not in this table.</p>
    </div>`;
}
function lkBindStandUI(lg){
  if($('#lkstandshare'))$('#lkstandshare').onclick=()=>lkShareStandings(lg);
  if($('#lkstandprint'))$('#lkstandprint').onclick=()=>lkPrintStandings();
}
function lkPrintStandings(){
  const b=document.body;
  b.classList.add('lk-print-stand');
  const done=()=>{if(!b.classList.contains('lk-print-stand'))return;b.classList.remove('lk-print-stand');window.removeEventListener('afterprint',done)};
  window.addEventListener('afterprint',done);
  window.print();
  setTimeout(done,60000);
}
function lkLoadLogo(){
  return new Promise(res=>{
    const img=new Image();
    img.onload=()=>res(img);
    img.onerror=()=>res(null);
    img.src='icons/icon-192.png';
  });
}
async function lkStandingsPng(lg){
  const league=lg||lkEnsure();
  const rows=lkTable(league);
  const sub=lkStandSubtitle(league);
  const cols=['','Archer','N1','N2','N3','N4','N5','N6','Best 4','11s','10s'];
  const cw=[36,170,52,52,52,52,52,52,60,44,44];
  const pad=28, rowH=28, headH=26, scale=2;
  const tableW=cw.reduce((a,b)=>a+b,0);
  const W=Math.max(794, tableW+pad*2);
  const top=92;
  const H=top+headH+Math.max(rows.length,1)*rowH+pad+16;
  const c=document.createElement('canvas');c.width=W*scale;c.height=H*scale;
  const g=c.getContext('2d');g.scale(scale,scale);
  g.fillStyle='#fff';g.fillRect(0,0,W,H);
  const logo=await lkLoadLogo();
  if(logo)g.drawImage(logo,pad,16,28,28);
  g.fillStyle='#0f172a';
  g.font='600 15px system-ui,sans-serif';
  g.textBaseline='middle';
  g.textAlign='left';
  g.fillText('ScoreTool',pad+(logo?36:0),30);
  g.textBaseline='alphabetic';
  g.font='bold 22px system-ui,sans-serif';
  g.fillText('Lingkana Indoor League · Standings',pad,66);
  g.font='13px system-ui,sans-serif';
  g.fillStyle='#475569';
  g.fillText(sub,pad,84);
  const xs=[];let acc=pad;for(const w of cw){xs.push(acc);acc+=w}
  const drawCell=(i,yy,h,txt,opts)=>{
    const ox=xs[i], w=cw[i];
    g.fillStyle=(opts&&opts.bg)||'#fff';
    g.fillRect(ox,yy,w,h);
    g.fillStyle=(opts&&opts.color)||'#0f172a';
    g.font=((opts&&opts.bold)?'600 ':'500 ')+'12px system-ui,sans-serif';
    g.textBaseline='middle';
    const left=i<=1;
    g.textAlign=left?'left':'right';
    let t=String(txt);
    if(i===1){while(t.length>1&&g.measureText(t).width>w-16)t=t.slice(0,-2)+'\u2026'}
    g.fillText(t,left?ox+8:ox+w-8,yy+h/2);
    g.strokeStyle='#e5e7eb';g.lineWidth=1;
    g.beginPath();g.moveTo(ox+w+0.5,yy);g.lineTo(ox+w+0.5,yy+h);g.stroke();
  };
  let y=top;
  cols.forEach((t,i)=>drawCell(i,y,headH,t,{bold:true,color:'#475569'}));
  g.strokeStyle='#d1d5db';g.beginPath();g.moveTo(pad,y+headH+0.5);g.lineTo(pad+tableW,y+headH+0.5);g.stroke();
  y+=headH;
  rows.forEach(r=>{
    const line=[(r.tie?'=':'')+r.rk, r.nm];
    (r.W||[]).forEach(c=>line.push(c?String(c.s):'\u2014'));
    while(line.length<8)line.push('\u2014');
    line.push(String(r.t), String(r.x||0), String(r.tens||0));
    line.forEach((t,i)=>{
      const night=i>=2&&i<=7;
      const on=night&&r.count&&r.count.includes(i-2);
      drawCell(i,y,rowH,t,{bg:on?'#edf2f7':'#fff',bold:i===8,color:'#0f172a'});
    });
    g.strokeStyle='#e5e7eb';g.beginPath();g.moveTo(pad,y+rowH+0.5);g.lineTo(pad+tableW,y+rowH+0.5);g.stroke();
    y+=rowH;
  });
  if(!rows.length){
    g.fillStyle='#475569';g.font='13px system-ui,sans-serif';g.textAlign='left';g.textBaseline='alphabetic';
    g.fillText('No scores yet.',pad,y+18);
  }
  return new Promise(res=>c.toBlob(b=>res(b?new File([b],'lingkana-standings.png',{type:'image/png'}):null),'image/png'));
}
async function lkShareStandings(lg){
  const league=lg||lkEnsure();
  const title='Lingkana Indoor League · Standings';
  const text=title+' \u00b7 '+lkStandSubtitle(league);
  const msg=$('#lkstandsharemsg');
  const say=s=>{if(msg)msg.textContent=s};
  let file=null;try{file=await lkStandingsPng(league)}catch(e){file=null}
  const nav=typeof navigator!=='undefined'?navigator:null;
  if(nav&&typeof nav.share==='function'){
    if(file&&(typeof nav.canShare!=='function'||nav.canShare({files:[file]}))){
      try{await nav.share({title,text,files:[file]});say('Shared.');return}catch(e){if(e&&e.name==='AbortError')return}
    }
    try{await nav.share({title,text});say('Shared.');return}catch(e){if(e&&e.name==='AbortError')return}
  }
  if(file){
    try{
      const a=document.createElement('a');
      a.href=URL.createObjectURL(file);
      a.download=file.name;
      a.rel='noopener';
      document.body.appendChild(a);a.click();a.remove();
      say('Saved the standings picture.');
      return;
    }catch(e){}
  }
  say('Could not make a picture to share.');
}


const LK_ENTRY_FEE=10, LK_RANGE_FEE=25, LK_SPLIT=[0.6,0.3,0.1];
function lkPaidMap(lg){return (lg&&lg.paid)||{}}
function lkNightPaid(lg,w){
  const k=lkNightKey(lg,w), bag=(lkPaidMap(lg)[k]||lkPaidMap(lg)[String(w)]||{});
  const paid=Object.keys(bag).filter(id=>bag[id]);
  const sign=lkNightSignups(lg,w).map(r=>r.id);
  const expected=[...new Set(sign.concat(paid))];
  const out=expected.filter(id=>!bag[id]);
  return{w,date:k,paid:paid.length,due:expected.length,out:out.length,total:paid.length*LK_ENTRY_FEE,owed:out.length*LK_ENTRY_FEE,ids:paid,outstanding:out};
}
function lkPaidCount(lg){
  let n=0;for(let w=1;w<=LK_NIGHTS;w++)n+=lkNightPaid(lg,w).paid;
  return n;
}
function lkPot(lg){
  const nights=[];for(let w=1;w<=LK_NIGHTS;w++)nights.push(lkNightPaid(lg,w));
  const entries=nights.reduce((n,x)=>n+x.paid,0), pot=entries*LK_ENTRY_FEE, owed=nights.reduce((n,x)=>n+x.owed,0);
  return {entries,pot,owed,nights,first:Math.round(pot*LK_SPLIT[0]),second:Math.round(pot*LK_SPLIT[1]),third:Math.round(pot*LK_SPLIT[2]),currency:'AUD',whole:true};
}
function lkSetPaid(id,night,on){
  const lg=lkEnsure();if(!lg)return 'The league is not on this phone yet.';
  if(!lkCanHost(lg))return 'Only the host can tick who paid.';
  const who=String(id||'');if(!who)return 'Pick an archer.';
  const k=LK_DATES.includes(night)?night:lkNightKey(lg,night);
  if(!k||!LK_DATES.includes(k))return 'Pick a shoot night.';
  lg.paid=lg.paid||{};lg.paid[k]=lg.paid[k]||{};
  if(on)lg.paid[k][who]=1;else delete lg.paid[k][who];
  lg.paidt=Date.now();lg.dirty=1;if(typeof save==='function')save();
  return '';
}
function lkPotHTML(lg){
  const p=lkPot(lg), host=lkCanHost(lg);
  const curW=typeof lgWeek==='function'?Math.min(LK_NIGHTS,lgWeek(lg)||1):1;
  const w=+(window._lkPotNight||curW)||curW;
  const night=lkNightKey(lg,w);
  const paid=(lg.paid&&lg.paid[night])||{};
  const people=lkPickerOrder(lg,w);
  const rows=people.map(id=>{
    const nm=h((typeof lgName==='function'&&lgName(id))||id);
    const on=!!paid[id];
    const box=host?`<input type="checkbox" data-lkpaid="${h(id)}" ${on?'checked':''}>`:(on?'Paid':'—');
    return`<label class="lk-paidrow"><span class="nm">${nm}</span>${box}</label>`;
  }).join('')||'<p class="small muted">No one on the list yet.</p>';
  const nightRows=p.nights.map(n=>`<tr data-lkpn="${n.w}"${n.w===w?' class="on"':''}><td>N${n.w}</td><td>${h(lkFmtD(n.date))}</td><td>${n.paid}</td><td>$${n.total}</td><td>${n.out?('$'+n.owed):'—'}</td></tr>`).join('');
  return`<div class="card" id="lkpot"><span class="kicker">Club pot · display only</span>
    <h3>$${p.pot} in the pot</h3>
    <p class="small">${p.entries} paid ${p.entries==1?'entry':'entries'} × $${LK_ENTRY_FEE}. ScoreTool does not take this payment.</p>
    <p>Live split 60 / 30 / 10: <b>$${p.first}</b> / <b>$${p.second}</b> / <b>$${p.third}</b> (whole Australian dollars — these pots always divide evenly).</p>
    ${p.owed?`<p class="small">Outstanding: <b>$${p.owed}</b> still unticked across the season.</p>`:''}
    <p class="small muted">The $${LK_RANGE_FEE} range fee is paid to the venue and is not in this pot. Night 7 also puts $${LK_ENTRY_FEE} into the pot.</p>
    <div class="lg-wrap"><table class="ad-tab" id="lkpotnights"><thead><tr><th></th><th>Night</th><th>Paid</th><th>Total</th><th>Outstanding</th></tr></thead><tbody>${nightRows}</tbody></table></div>
    <label for="lkpotnight" style="margin-top:8px">Tick who paid on</label>
    <select id="lkpotnight">${LK_DATES.map((d,i)=>`<option value="${i+1}" ${i+1===w?'selected':''}>Night ${i+1} · ${h(lkFmtD(d))}${i===6?' · shoot-up':''}</option>`).join('')}</select>
    <p class="small muted">$${LK_ENTRY_FEE} each. A no-show is not charged until you tick them.</p>
    <div id="lkpaidlist">${rows}</div>
    </div>`;
}


function lkSetGroups(w,G){
  const lg=lkEnsure();if(!lg)return 'The league is not on this phone yet.';
  if(+w>=7)return 'Night 7 scoring is not open yet.';
  const N=(G||[]).map(g=>(g||[]).filter(Boolean));
  if(N.some(g=>g.length>4))return 'A group can have at most 4 archers.';
  lg.grp=lg.grp||{};lg.grp[w]={t:Date.now(),g:N.filter(g=>g.length)};
  lg.dirty=1;if(typeof save==='function')save();
  return '';
}
function lkAddToGroup(w,gi,id){
  const lg=lkEnsure();if(!lg)return 'The league is not on this phone yet.';
  const who=String(id||'');if(!who)return 'Pick an archer.';
  const G=(((lg.grp||{})[w]||{}).g||[]).map(g=>g.slice());
  while(G.length<=gi)G.push([]);
  if(G[gi].includes(who))return '';
  if(G[gi].length>=4)return 'A group can have at most 4 archers.';
  G.forEach(g=>{const i=g.indexOf(who);if(i>=0)g.splice(i,1)});
  G[gi].push(who);
  return lkSetGroups(w,G);
}
function lkScoreGroup(w,gi){
  const lg=lkEnsure();if(!lg)return 'The league is not on this phone yet.';
  if(+w>=7)return 'Night 7 scoring is not open yet.';
  const G=(((lg.grp||{})[w]||{}).g||[])[gi]||[];
  if(!G.length)return 'Add archers to the group first.';
  if(G.length>4)return 'A group can have at most 4 archers.';
  if(lg.pwHash&&!lkAuthed(lg)){window._lkWantScore={w:+w,gi:+gi};lkUnlockView(lg);return 'Type the league scoring password.';}
  window._lgE={code:lg.code,w:+w,ids:G.slice()};window._lgAct=G[0]||null;window._lgHold=null;
  window._lkScoreIds=G.slice();window._lkScoreI=0;window._lkFlowNight=+w;
  if(typeof lkFlowScore==='function'){lkFlowScore();return ''}
  if(typeof lgView==='function')lgView(lg.code);
  return '';
}
function lkGroupHTML(lg){
  const w=Math.min(6,typeof lgWeek==='function'?lgWeek(lg):1);
  if((typeof lgWeek==='function'?lgWeek(lg):1)>=7)return '';
  const pick=lkPickerOrder(lg,w);
  const G=(((lg.grp||{})[w]||{}).g||[]).map(g=>g.slice());
  const show=G.concat([[]]);
  const names=id=>h((typeof lgName==='function'&&lgName(id))||id);
  const gBlocks=`<div class="lg-wrap" style="max-height:320px;overflow:auto"><table class="ad-tab" id="lkgrptab"><thead><tr><th>Group</th><th>Archers</th><th></th></tr></thead><tbody>`+
    show.map((g,i)=>`<tr data-lkgi="${i}"><td>G${i+1} · ${g.length}/4</td><td>${g.length?g.map(names).join(', '):'<span class="muted">empty</span>'}</td><td>${g.length?`<button class="btn alt" data-lkscore="${i}">Score</button>`:''}</td></tr>`).join('')+
    `</tbody></table></div>`;
  const opts=pick.map(id=>`<option value="${h(id)}">${names(id)}</option>`).join('')||'<option value="">No one on the list</option>';
  const gopts=show.map((g,i)=>`<option value="${i}">Group ${i+1}${g.length?' ('+g.length+'/4)':''}</option>`).join('');
  return`<div class="card" id="lkgrp"><span class="kicker">Night ${w} · groups</span>
    <h3>Up to 4 archers, one scorer</h3>
    <p class="small muted">The scorer picks from tonight's sign-ups first, then the rest of the league list. Groups of up to 4, as many groups as needed (20+ on a big night). Scoring is on this phone, with a number pad (no plot face).</p>
    <label for="lkpick">Add an archer</label>
    <input id="lkpickq" maxlength="40" autocomplete="off" placeholder="Filter names">
    <div class="row" style="gap:6px;flex-wrap:wrap"><select id="lkpick" style="flex:1">${opts}</select>
    <select id="lkpickg">${gopts}</select>
    <button class="btn alt" id="lkaddg">Add to group</button></div>
    <p class="small" id="lkgrpmsg" role="alert"></p>
    ${gBlocks}
    </div>`;
}


const LK_PW_SESSION='scoretool.lk.auth';
async function lkHashPw(pw,salt){
  const enc=new TextEncoder();
  const buf=await crypto.subtle.digest('SHA-256',enc.encode(String(salt||'')+'\0'+String(pw||'')));
  return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function lkAuthed(lg){
  if(!lg||!lg.pwHash)return true;
  try{if(sessionStorage.getItem(LK_PW_SESSION)===lg.code)return true}catch(e){}
  return window._lkAuthed===lg.code;
}
function lkMarkAuth(lg){
  window._lkAuthed=lg.code;
  try{sessionStorage.setItem(LK_PW_SESSION,lg.code)}catch(e){}
}
async function lkSetPassword(pw){
  const lg=lkEnsure();if(!lg)return 'The league is not on this phone yet.';
  if(!lkCanHost(lg))return 'Only the host can set the scoring password.';
  const s=String(pw||'');if(s.length<6)return 'Use at least 6 characters.';
  const salt=lg.pwSalt||[...crypto.getRandomValues(new Uint8Array(8))].map(b=>b.toString(16).padStart(2,'0')).join('');
  lg.pwSalt=salt;lg.pwHash=await lkHashPw(s,salt);lg.pwt=Date.now();lg.dirty=1;
  if(typeof save==='function')save();
  return '';
}
async function lkUnlock(pw){
  const lg=lkEnsure();if(!lg)return 'The league is not on this phone yet.';
  if(!lg.pwHash){lkMarkAuth(lg);return ''}
  const h=await lkHashPw(String(pw||''),lg.pwSalt);
  if(h!==lg.pwHash)return 'That scoring password is not right.';
  lkMarkAuth(lg);return '';
}
function lkUnlockView(lg){
  const appEl=typeof app!=='undefined'?app:null;if(!appEl)return;
  appEl.innerHTML=`<div class="card" id="lkpwpage"><span class="kicker">Password-protected scoring</span>
    <h1>${h(lg.name)}</h1>
    <p>Type the league scoring password to score tonight. This is not the poster invite code.</p>
    <label for="lkpw">Scoring password</label>
    <input id="lkpw" type="password" autocomplete="current-password">
    <button class="btn alt" id="lkpwgo" style="margin-top:8px">Unlock scoring</button>
    <p class="small" id="lkpwmsg" role="alert"></p>
    <p><button class="btn ghost" type="button" id="lkpwback">Back to league</button></p>
    </div>`;
  const go=()=>{lkUnlock((document.querySelector('#lkpw')||{}).value).then(m=>{
    const e=document.querySelector('#lkpwmsg');
    if(m){if(e)e.textContent=m;return}
    const want=window._lkWantScore;window._lkWantScore=null;
    if(want)lkScoreGroup(want.w,want.gi);else if(typeof lkFlowSelect==='function')lkFlowSelect();else lkView(lg.code);
  })};
  if($('#lkpwgo'))$('#lkpwgo').onclick=go;
  if($('#lkpw'))$('#lkpw').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go()}};
  if($('#lkpwback'))$('#lkpwback').onclick=()=>{window._lkWantScore=null;lkView(lg.code)};
}
function lkPwHTML(lg){
  if(!lkCanHost(lg))return '';
  return`<div class="card" id="lkpwset"><span class="kicker">Host</span><h3>Scoring password</h3>
    <p class="small muted">Archers need this password to score on a group card. A default password is already set. Change it here and it is sent to the other scorers' phones. It is stored as a hash, never as the typed secret. Do not reuse the poster invite code.</p>
    <label for="lkpwnew">Set or change the password</label>
    <input id="lkpwnew" type="password" autocomplete="new-password">
    <button class="btn alt" id="lkpwsave" style="margin-top:8px">Save password</button>
    <p class="small" id="lkpwsetmsg" role="alert">${lg.pwHash?'A scoring password is set.':''}</p>
    </div>`;
}


const LK_RESULTS_HASH='#lk-results';
function lkIsResHash(){const raw=(location.hash||'').replace(/^#/,'');return raw==='lk-results'||raw.startsWith('lk-results')}
function lkResNightFromHash(){
  const raw=(location.hash||'').replace(/^#/,'');
  const m=/n=(\d+)/.exec(raw)||/lk-results-(\d+)/.exec(raw);
  const n=+(m&&m[1]||window._lkResNight||0);
  return n>=1&&n<=6?n:0;
}
function lkResultsUrl(w){
  const base=String(window.LK_PUBLIC_BASE||LK_PUBLIC_BASE||'').replace(/\/?$/,'/');
  return base+LK_RESULTS_HASH+'&n='+(+w||1);
}
function lkNightScores(lg,w){
  const rows=lkTable(lg).map(r=>{
    const c=(r.W||[])[w-1];
    return c?{id:r.id,nm:r.nm,s:c.s,x:c.x,t10:c.t10||0,d:c.d}:null;
  }).filter(Boolean);
  rows.sort((a,b)=>b.s-a.s||b.x-a.x||(b.t10||0)-(a.t10||0)||String(a.nm).localeCompare(String(b.nm)));
  rows.forEach((r,k)=>{r.rk=k&&rows[k-1].s==r.s&&rows[k-1].x==r.x&&(rows[k-1].t10||0)==(r.t10||0)?rows[k-1].rk:k+1});
  return rows;
}
function lkResultsView(w){
  const appEl=typeof app!=='undefined'?app:null;if(!appEl)return;
  const lg=lkEnsure();if(!lg)return;
  const n=+w||lkResNightFromHash()||Math.min(6,typeof lgWeek==='function'?lgWeek(lg):1);
  const night=n>=1&&n<=6?n:1;
  window._lkResNight=night;
  const scores=lkNightScores(lg,night);
  const stand=lkTable(lg);
  const p=lkPot(lg);
  const d=lkFmtD(lkNightKey(lg,night));
  const scoreRows=scores.map(r=>`<tr><td>${r.rk}</td><td>${h(r.nm)}</td><td>${r.d?r.s:`<i>${r.s}</i>`}</td><td>${r.x}</td><td>${r.t10||0}</td></tr>`).join('')||'<tr><td colspan="5">No scores this night.</td></tr>';
  const standRows=stand.map(r=>`<tr><td>${r.tie?'=':''}${r.rk}</td><td>${h(r.nm)}</td>${r.W.map(c=>`<td>${c?c.s:'—'}</td>`).join('')}<td>${r.t}</td><td>${r.x}</td><td>${r.tens||0}</td></tr>`).join('')||'<tr><td colspan="11">No standings yet.</td></tr>';
  const potRows=(p.nights||[]).map(x=>`<tr><td>N${x.w}</td><td>${x.paid}</td><td>$${x.total}</td><td>${x.out?('$'+x.owed):'—'}</td></tr>`).join('');
  appEl.innerHTML=`<div class="card" id="lkresults" data-lkn="${night}">
    <div class="lk-printbar">
      <button class="btn alt" type="button" id="lkprint">Print A4</button>
      <button class="btn alt" type="button" id="lkshare">Share</button>
      <button class="btn ghost" type="button" id="lkresback">Back to league</button>
      <p class="small" id="lksharemsg" role="status"></p>
    </div>
    <span class="kicker">Results · Night ${night}</span>
    <h1>${h(lg.name)}</h1>
    <p class="small">${h(d)} · ${h(LK_VENUE)}</p>
    <p class="small muted">Lancaster 660 · triangular 40 cm 3-spot · values only. The app does not post these results itself.</p>
    <h3>Tonight's scores</h3>
    <table id="lknightscores"><thead><tr><th></th><th>Archer</th><th>Score</th><th>11s</th><th>10s</th></tr></thead>
    <tbody>${scoreRows}</tbody></table>
    <h3>Standings · best 4 of 6</h3>
    <p class="small muted">No minimum nights. Rank is by highest total, then 11s on the counting scores, then 10s. The shoot-up is the top 12.</p>
    <table id="lkresstand"><thead><tr><th></th><th>Archer</th>${[1,2,3,4,5,6].map(k=>`<th>N${k}</th>`).join('')}<th>Best 4</th><th>11s</th><th>10s</th></tr></thead>
    <tbody>${standRows}</tbody></table>
    <h3>Pot</h3>
    <p>Running pot <b>$${p.pot}</b> from ${p.entries} paid ${p.entries==1?'entry':'entries'} × $${LK_ENTRY_FEE}. Live split 60 / 30 / 10: <b>$${p.first}</b> / <b>$${p.second}</b> / <b>$${p.third}</b>.</p>
    ${p.owed?`<p class="small">Outstanding: $${p.owed} still unticked.</p>`:''}
    <p class="small muted">The $${LK_RANGE_FEE} range fee is not in this pot. Night 7 also costs $${LK_ENTRY_FEE}.</p>
    <table id="lkrespot"><thead><tr><th>Night</th><th>Paid</th><th>Total</th><th>Outstanding</th></tr></thead><tbody>${potRows}</tbody></table>
    </div>`;
  if($('#lkprint'))$('#lkprint').onclick=()=>window.print();
  if($('#lkshare'))$('#lkshare').onclick=()=>lkShareResults(lg,night);
  if($('#lkresback'))$('#lkresback').onclick=()=>{try{history.replaceState(null,'',location.pathname+location.search+(location.hash||'').replace(/#lk-results[^#]*/,''))}catch(e){}lkView(lg.code)};
}
async function lkResultsPng(lg,w){
  const scores=lkNightScores(lg,w), stand=lkTable(lg), p=lkPot(lg);
  const row=16, pad=28, W=794;
  const H=Math.max(1123, pad+90+(scores.length+stand.length+12)*row+120);
  const c=document.createElement('canvas');c.width=W;c.height=H;
  const g=c.getContext('2d');
  g.fillStyle='#fff';g.fillRect(0,0,W,H);
  g.fillStyle='#111';
  let y=pad;
  const line=(txt,size,bold)=>{g.font=`${bold?'bold ':''}${size}px sans-serif`;g.fillText(txt,pad,y);y+=size+8};
  line((lg.name||'Lingkana League')+' — Night '+w+' results',22,true);
  line(lkFmtD(lkNightKey(lg,w))+' · '+LK_VENUE,13,false);
  line("Tonight's scores",16,true);
  g.font='12px sans-serif';
  scores.forEach(r=>{g.fillText(`${r.rk}. ${r.nm}  ${r.s}  ${r.x}×11  ${r.t10||0}×10`,pad,y);y+=row});
  if(!scores.length){g.fillText('No scores this night.',pad,y);y+=row}
  y+=10;line('Standings · best 4 of 6',16,true);
  g.font='12px sans-serif';
  stand.forEach(r=>{g.fillText(`${r.rk}. ${r.nm}  ${r.t}  ${r.x}×11  ${r.tens||0}×10`,pad,y);y+=row});
  y+=10;line('Pot $'+p.pot+' · 60/30/10 $'+p.first+' / $'+p.second+' / $'+p.third,16,true);
  g.font='12px sans-serif';g.fillText((p.entries||0)+' paid entries × $'+LK_ENTRY_FEE+'. Range fee excluded.',pad,y);
  return new Promise(res=>c.toBlob(b=>res(b?new File([b],'lingkana-night-'+w+'-results.png',{type:'image/png'}):null),'image/png'));
}
async function lkShareResults(lg,w){
  const url=lkResultsUrl(w);
  const title=(lg.name||'Lingkana League')+' · Night '+w+' results';
  const text=title+' · '+lkFmtD(lkNightKey(lg,w))+'. Best-4 standings and pot. The app does not post this for you.';
  const msg=$('#lksharemsg');
  const say=s=>{if(msg)msg.textContent=s};
  let file=null;try{file=await lkResultsPng(lg,w)}catch(e){file=null}
  const nav=typeof navigator!=='undefined'?navigator:null;
  if(nav&&typeof nav.share==='function'){
    const payload={title,text,url};
    if(file&&typeof nav.canShare==='function'&&nav.canShare({files:[file]})){
      try{await nav.share({title,text,url,files:[file]});say('Shared.');return}catch(e){if(e&&e.name==='AbortError')return}
    }
    try{await nav.share(payload);say('Shared.');return}catch(e){if(e&&e.name==='AbortError')return}
  }
  try{if(nav&&nav.clipboard)await nav.clipboard.writeText(url)}catch(e){}
  say('Share link ready: '+url+'. The app does not post this itself.');
}
function lkBootResults(){
  if(!lkIsResHash())return false;
  const n=lkResNightFromHash();
  try{lkResultsView(n||undefined)}catch(e){return false}
  return true;
}

const _lkH2H=window.h2hCard;
if(_lkH2H){window.h2hCard=function(){const html=_lkH2H.apply(this,arguments);setTimeout(lkDecorateCard,0);return html}}
const _lkRender=window.render;
if(_lkRender){window.render=function(){if(lkBootHome())return;if(lkBootResults())return;return _lkRender.apply(this,arguments)}}
addEventListener('hashchange',()=>{if(lkIsHomeHash()||lkIsRegHash())lkBootHome();else if(lkIsResHash())lkBootResults()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{lkBootHome()||lkBootResults()},0));
else setTimeout(()=>{lkBootHome()||lkBootResults()},0);

Object.assign(window,{
  LK_CODE,LK_NAME,LK_VENUE,LK_HOURS,LK_R,LK_DATES,LK_NIGHTS,LK_CAP,LK_HOST,
  LK_PUBLIC_BASE,LK_REGISTER_HASH,LK_HOME_HASH,LK_POSTER_CODE,LK_REG_KEY,LK_FEE,LK_FRESH,lkFresh,
  lkIs,lkNights,lkRound,lkNight7,lkDate,lkLabel,lkRecord,lkSeed,lkEnsure,lkGet,lkView,lkFmtD,lkDecorateCard,lkJoinGuard,lkInvite,lkAccept,lkAddGuest,lkIsMember,lkCanHost,LK_RULES,lkRulesHTML,
  lkEventHomeUrl,lkRegisterUrl,lkPosterOk,lkRegister,lkAlreadyRegistered,lkDeviceRegistered,lkIsHomeHash,lkBootHome,lkIsHostPerson,lkDropHostIfUnregistered,lkStripHostEntries,lkApplyReg,lkPullReg,lkNightSignups,lkPickerOrder,lkDefaultNight,lkKnownRegistrants,lkRegisterView,lkBootReg,lkIsRegHash,lkRegInbox,lkNormName,lkMergeNight,lkPickBest,lkTable,lkTableHTML,lkLastScoredNight,lkStandSubtitle,lkBindStandUI,lkPrintStandings,lkStandingsPng,lkShareStandings,lkTens,lkNightPaid,lkPot,lkPaidCount,lkSetPaid,lkPotHTML,lkSetGroups,lkAddToGroup,lkScoreGroup,lkGroupHTML,lkHashPw,lkAuthed,lkSetPassword,lkUnlock,lkUnlockView,lkPwHTML,lkResultsUrl,lkResultsView,lkShareResults,lkBootResults,lkIsResHash,lkNightScores
});
})();
