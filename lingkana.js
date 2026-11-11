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
/* Swap LK_PUBLIC_BASE for the live site before printing posters. This branch is preview-only and is not on GitHub Pages yet. */
const LK_PUBLIC_BASE='https://nfstride1-ux.github.io/scoretool-demo/';
const LK_REGISTER_HASH='#lk-register';
/* Printed on the poster; gates the public register page. Not a scoring password. Easy to swap before go-live. */
const LK_POSTER_CODE='LK-PREVIEW';
const LK_REG_KEY='scoretool.lk.reg';
const LK_FEE=10; /* entry fee used later by the pot display; the $25 range fee is separate and excluded */


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
    order:[LK_HOST],weeks:LK_DATES.slice(),wt:Date.now(),cw:1,cwt:0,grp:{},gn:{},sc:{},reg:{},status:'active',
    created:Date.now(),preset:1,inviteOnly:true};
}

function lkEnsure(){
  if(typeof S==='undefined'||!S)return null;
  const L=S.leagues=S.leagues||[];
  let lg=L.find(lkIs);
  if(!lg){lg=lkRecord();L.push(lg);if(typeof save==='function')save()}
  if(lg.name==='Lingkana Indoor League')lg.name=LK_NAME;
  if('cap' in lg)delete lg.cap;
  if(typeof lkPullReg==='function')lkPullReg(lg);
  return lg;
}
function lkSeed(){/* do not auto-insert a league record into existing tester lists; the card offers Open */return}

function lkDecorateCard(){
  const c=typeof $==='function'&&$('#lgcard');if(!c||c.querySelector('#lkgo'))return;
  const bit=`<div class="list-item" id="lkrow"><b>${h(LK_NAME)}</b><div class="small muted">${h(LK_VENUE)} · invite only · six 660s and a top-12 shoot-up</div><button class="btn alt" id="lkgo" style="margin-top:6px">Open</button></div>`;
  c.insertAdjacentHTML('beforeend',bit);
  const b=c.querySelector('#lkgo');if(b)b.onclick=()=>{lkEnsure();lkView(LK_CODE)};
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
    <p>The sixth Lancaster 660 was on ${h(lkFmtD(LK_DATES[5]))}. Night 7 goes straight into match play for the top 12. There is no scored 150 warm-up. The ladder (#12 v #11, the winner v #10, and so on to #1) will open closer to 10 Feb and is not built yet.</p></div>`:'';
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
    <p class="small muted" style="margin-top:8px">Poster register link (swap LK_PUBLIC_BASE before printing): <code id="lkregurl">${h(lkRegisterUrl())}</code></p>
    <p class="small muted">Invite code to print on the poster: <b id="lkpostercode">${h(LK_POSTER_CODE)}</b>. This is not the scoring password.</p>
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

}


function lkRegisterUrl(){
  const base=String(window.LK_PUBLIC_BASE||LK_PUBLIC_BASE||'').replace(/\/?$/,'/');
  return base+LK_REGISTER_HASH;
}
function lkNormPoster(s){return String(s||'').toUpperCase().replace(/\s+/g,'').replace(/^#/,'')}
function lkPosterOk(code){return lkNormPoster(code)===lkNormPoster(window.LK_POSTER_CODE||LK_POSTER_CODE)}
function lkIsRegHash(){
  const raw=String(location.hash||'').replace(/^#/,'').split('?')[0].split('&')[0];
  const q=new URLSearchParams(location.search);
  return raw==='lk-register'||q.get('page')==='lk-register';
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
  if(!id&&me&&(typeof lgName==='function'?lgName(me):me).toLowerCase()===name.toLowerCase())id=me;
  if(!id)id=lkFindArcher(lg,name);
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
  const code=opts.posterCode||opts.code||'';
  if(!lkPosterOk(code))return 'That invite code is not right. Use the code printed on the poster.';
  const name=lkCleanName(opts.name);if(name.length<2)return'Type a name (at least 2 characters).';
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
  }
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
function lkBootReg(){
  if(!lkIsRegHash())return false;
  try{if($('#tabs'))$('#tabs').hidden=true}catch(e){}
  lkRegisterView();
  return true;
}
function lkRegisterView(){
  const appEl=typeof app!=='undefined'?app:(typeof $==='function'&&$('#app'));
  if(!appEl)return;
  const nights=LK_DATES.map(d=>{
    const i=LK_DATES.indexOf(d),lab=lkLabel(i+1);
    return`<option value="${h(d)}">${h(lkFmtD(d))} · Night ${i+1} · ${h(lab)}</option>`;
  }).join('');
  const def=lkDefaultNight();
  const me=(typeof h2hMe==='function'&&h2hMe())||'';
  const myName=me&&typeof lgName==='function'?lgName(me):(me||'');
  appEl.innerHTML=`<div class="card" id="lkregpage"><span class="kicker">Lingkana League</span>
    <h1>Register for a shoot night</h1>
    <p class="small">${h(LK_VENUE)}</p>
    <p class="small muted">${h(LK_HOURS)}</p>
    <p>This page is invite-only. Type the invite code printed on the poster, then register for the night you will shoot. There is no deadline — you can register on the night.</p>
    <p class="small muted">The first time you register, your name stays on the league list for the season. You still need to sign up again for every shoot night.</p>
    <form id="lkregform" autocomplete="on">
      <label for="lkregcode">Poster invite code</label>
      <input id="lkregcode" name="code" required autocomplete="off" autocapitalize="characters" placeholder="Code on the poster">
      <label for="lkregname">Name</label>
      <input id="lkregname" name="name" required maxlength="24" autocomplete="name" value="${h(myName)}" placeholder="Your name">
      <label for="lkregnight">Shoot night</label>
      <select id="lkregnight" name="night">${nights}</select>
      <label for="lkregbow">Bow type <span class="muted">(optional)</span></label>
      <input id="lkregbow" name="bow" maxlength="24" placeholder="e.g. Compound">
      <label for="lkregemail">Email <span class="muted">(optional)</span></label>
      <input id="lkregemail" name="email" type="email" maxlength="80" autocomplete="email">
      <label for="lkregphone">Phone <span class="muted">(optional)</span></label>
      <input id="lkregphone" name="phone" maxlength="24" autocomplete="tel">
      <button class="btn alt" type="submit" id="lkreggo" style="margin-top:10px">Register</button>
      <p class="small" id="lkregmsg" role="alert"></p>
    </form>
    <p class="small muted">Scoring on the night is separate and password-protected. This page does not take payments.</p>
    <p><button class="btn ghost" type="button" id="lkregback">Back</button></p>
    </div>`;
  const nightEl=appEl.querySelector('#lkregnight');if(nightEl)nightEl.value=def;
  const form=appEl.querySelector('#lkregform');
  if(form)form.onsubmit=e=>{
    e.preventDefault();
    const msg=lkRegister({
      posterCode:(appEl.querySelector('#lkregcode')||{}).value,
      name:(appEl.querySelector('#lkregname')||{}).value,
      night:(appEl.querySelector('#lkregnight')||{}).value,
      bow:(appEl.querySelector('#lkregbow')||{}).value,
      email:(appEl.querySelector('#lkregemail')||{}).value,
      phone:(appEl.querySelector('#lkregphone')||{}).value
    });
    const box=appEl.querySelector('#lkregmsg');
    if(msg){if(box)box.textContent=msg;return}
    if(box)box.textContent='You are registered for that night. Your name stays on the league list; sign up again for each shoot.';
  };
  const back=appEl.querySelector('#lkregback');
  if(back)back.onclick=()=>{try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}if(typeof lkView==='function'&&lkGet())lkView(LK_CODE);else if(typeof nav==='function')nav('lab_leagues')};
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
function lkTable(lg){
  const A=(typeof lgArchers==='function'?lgArchers(lg):(lg&&lg.order)||[]);
  const rows=A.map(id=>{
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
    const b=lkPickBest(W);
    const nm=(typeof lgName==='function'?lgName(id):id);
    return{id,nm,W,t:b.t,x:b.x,tens:b.tens,count:b.count,open:b.open};
  });
  rows.sort((a,b)=>b.t-a.t||b.x-a.x||(b.tens||0)-(a.tens||0)||String(a.nm).localeCompare(String(b.nm)));
  rows.forEach((r,k)=>{r.rk=k&&rows[k-1].t==r.t&&rows[k-1].x==r.x&&(rows[k-1].tens||0)==(r.tens||0)?rows[k-1].rk:k+1});
  rows.forEach(r=>r.tie=rows.filter(o=>o.rk==r.rk).length>1);
  return rows;
}
function lkTableHTML(lg){
  const me=(typeof h2hMe==='function'&&h2hMe())||'';
  const rows=lkTable(lg);
  const cells=(r,c,i)=>{
    if(!c)return'<td class="lk-miss">—</td>';
    const on=r.count.includes(i);
    const body=c.d?String(c.s):`<i class="muted">${c.s}</i>`;
    return`<td class="${on?'lk-count':''}" title="${on?'Counts in the best 4':''}">${body}<span class="small muted"> · ${c.x}×11</span></td>`;
  };
  const tot=r=>r.open?`<i class="muted">${r.t}</i>`:`<b>${r.t}</b>`;
  return`<div class="card" id="lkstand"><h3>Standings · best 4 of 6</h3>
    <div class="lg-wrap lk-standwrap"><table class="ad-tab lg-tab" id="lktab"><thead><tr><th></th><th>Archer</th>${[1,2,3,4,5,6].map(k=>`<th>N${k}</th>`).join('')}<th>Best 4</th><th>11s</th><th>10s</th></tr></thead>
    <tbody>${rows.map((r,k)=>`<tr class="${k==0&&r.t>0&&!r.tie?'lead':''}" data-lkrow="${h(r.id)}"><td>${r.tie?'=':''}${r.rk}</td><td>${k==0&&r.t>0&&!r.tie?'▲ ':''}${h(r.nm)}${r.id==me?' (you)':''}</td>${r.W.map((c,i)=>cells(r,c,i)).join('')}<td>${tot(r)}</td><td>${r.x}</td><td>${r.tens||0}</td></tr>`).join('')||'<tr><td colspan="11">No scores yet.</td></tr>'}</tbody></table></div>
    <p class="small muted" style="margin:4px 0 0">No minimum nights. The total is the best 4 scores from the nights they shot (or all of them if they have fewer than four). Max 2,640. The four that count are marked. A missed night is — and is not a zero. Italics = still shooting. Rank is by highest total, then 11s on the counting scores, then 10s. The shoot-up is the top 12. Night 7 is not in this table.</p>
    </div>`;
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
  lg.dirty=1;if(typeof save==='function')save();
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
    return`<label class="lk-paidrow" style="display:flex;gap:8px;align-items:center;margin:2px 0">${box}<span>${nm}</span></label>`;
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
    <div id="lkpaidlist" style="max-height:240px;overflow:auto">${rows}</div>
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
  window._lgE={code:lg.code,w:+w,ids:G.slice()};window._lgAct=null;window._lgHold=null;
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
  lg.pwSalt=salt;lg.pwHash=await lkHashPw(s,salt);lg.dirty=1;
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
    if(want)lkScoreGroup(want.w,want.gi);else lkView(lg.code);
  })};
  if($('#lkpwgo'))$('#lkpwgo').onclick=go;
  if($('#lkpw'))$('#lkpw').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go()}};
  if($('#lkpwback'))$('#lkpwback').onclick=()=>{window._lkWantScore=null;lkView(lg.code)};
}
function lkPwHTML(lg){
  if(!lkCanHost(lg))return '';
  return`<div class="card" id="lkpwset"><span class="kicker">Host</span><h3>Scoring password</h3>
    <p class="small muted">Archers need this password to score on a group card. It is stored as a hash on this phone, never in the source. Do not reuse the poster invite code.</p>
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
if(_lkRender){window.render=function(){if(lkBootReg())return;if(lkBootResults())return;return _lkRender.apply(this,arguments)}}
addEventListener('hashchange',()=>{if(lkIsRegHash())lkBootReg();else if(lkIsResHash())lkBootResults()});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{lkBootReg()||lkBootResults()},0));
else setTimeout(()=>{lkBootReg()||lkBootResults()},0);

Object.assign(window,{
  LK_CODE,LK_NAME,LK_VENUE,LK_HOURS,LK_R,LK_DATES,LK_NIGHTS,LK_CAP,LK_HOST,
  LK_PUBLIC_BASE,LK_REGISTER_HASH,LK_POSTER_CODE,LK_REG_KEY,LK_FEE,
  lkIs,lkNights,lkRound,lkNight7,lkDate,lkLabel,lkRecord,lkSeed,lkEnsure,lkGet,lkView,lkFmtD,lkDecorateCard,lkJoinGuard,lkInvite,lkAccept,lkAddGuest,lkIsMember,lkCanHost,
  lkRegisterUrl,lkPosterOk,lkRegister,lkApplyReg,lkPullReg,lkNightSignups,lkPickerOrder,lkDefaultNight,lkRegisterView,lkBootReg,lkIsRegHash,lkRegInbox,lkPickBest,lkTable,lkTableHTML,lkTens,lkNightPaid,lkPot,lkPaidCount,lkSetPaid,lkPotHTML,lkSetGroups,lkAddToGroup,lkScoreGroup,lkGroupHTML,lkHashPw,lkAuthed,lkSetPassword,lkUnlock,lkUnlockView,lkPwHTML,lkResultsUrl,lkResultsView,lkShareResults,lkBootResults,lkIsResHash,lkNightScores
});
})();
