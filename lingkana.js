/* C16: Lingkana Indoor League format (11 Nov 2026, Nathe).
   Separate from the Onion Shed Challenge. Do not retune Onion Shed scoring, table, cap or final.
   Working name pending Q1. Host defaults to Nathe pending Q11. Cap 24 pending Q4 (at least 12, room for a field larger than the top-12 shoot-up). */
(function(){
const LK_CODE='LINGKN26';
const LK_NAME='Lingkana Indoor League';
const LK_VENUE='Lingkana Archery range, 107 Robinson Ave, Belmont WA 6104';
const LK_HOURS='6:00 pm induction, shooting 6:30 pm to about 9:00 pm';
const LK_R='Lancaster 660';
const LK_DATES=['2026-11-18','2026-12-02','2026-12-16','2026-12-30','2027-01-13','2027-01-27','2027-02-10'];
const LK_NIGHTS=7;
const LK_CAP=24;
const LK_HOST='nathe';

const h=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const lkIs=lg=>!!(lg&&(lg.format==='lingkana'||lg.code===LK_CODE));
const lkNights=lg=>lkIs(lg)?LK_NIGHTS:6;
const lkRound=(lg,w)=>lkIs(lg)&&(+w||0)>=1&&(+w||0)<=6?LK_R:null;
const lkNight7=w=>+w===7;
const lkDate=(lg,w)=>(lg&&lg.weeks&&lg.weeks[w-1])||LK_DATES[w-1]||'';
const lkLabel=w=>w===7?'Warm-up + shoot-up':'Lancaster 660';
const lkFmtD=d=>{if(!d)return'';const x=new Date(d+'T00:00:00');return x.toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short',year:'numeric',timeZone:'Australia/Perth'})};

function lkRecord(){
  return{code:LK_CODE,name:LK_NAME,format:'lingkana',host:LK_HOST,venue:LK_VENUE,hours:LK_HOURS,cap:LK_CAP,
    order:[LK_HOST],weeks:LK_DATES.slice(),wt:Date.now(),cw:1,cwt:0,grp:{},gn:{},sc:{},reg:{},status:'active',
    created:Date.now(),preset:1,inviteOnly:true};
}

function lkEnsure(){
  if(typeof S==='undefined'||!S)return null;
  const L=S.leagues=S.leagues||[];
  let lg=L.find(lkIs);
  if(!lg){lg=lkRecord();L.push(lg);if(typeof save==='function')save()}
  return lg;
}
function lkSeed(){/* do not auto-insert a league record into existing tester lists; the card offers Open */return}

function lkDecorateCard(){
  const c=typeof $==='function'&&$('#lgcard');if(!c||c.querySelector('#lkgo'))return;
  const bit=`<div class="list-item" id="lkrow"><b>${h(LK_NAME)}</b><div class="small muted">${h(LK_VENUE)} · invite only · six 660s and a seventh-night shoot-up</div><button class="btn alt" id="lkgo" style="margin-top:6px">Open</button></div>`;
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
  const n7=w===7?`<div class="card" id="lkn7"><span class="kicker">Night 7 · ${h(lkFmtD(LK_DATES[6]))}</span><h3>Warm-up + shoot-up</h3>
    <p>The sixth Lancaster 660 was on ${h(lkFmtD(LK_DATES[5]))}. This night is the 150 warm-up and then the shoot-up for the top 12. Those formats are still waiting on Nathe, so scoring for them is not open yet.</p></div>`:'';
  const score660=!closed660?`<p class="small muted">Night ${w} is a Lancaster 660 (20 ends of 3, X = 11, max 660). Group scoring for this card is on the same shared-phone flow as other leagues.</p>
    <p class="small muted">${h(LK_HOURS)}.</p>`:`<p class="small muted">The 660 nights are finished. Night 7 does not open a 660 card.</p>`;
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
    <p class="small muted">In the league: ${(lg.order||[]).map(id=>h((typeof lgName==='function'&&lgName(id))||id)).join(', ')||'no one yet'}.</p>
    </div>`:'';
  app.innerHTML=`<div class="card" id="lgview" data-lk="1"><span class="kicker">Invite-only league</span>
    <h1>${h(lg.name)}</h1>
    <p class="small" style="margin:0">${h(LK_VENUE)}</p>
    <p class="small muted" style="margin:4px 0 0">${h(LK_HOURS)}</p>
    <p class="small muted" style="margin:4px 0 0">Cap ${lg.cap||LK_CAP} archers · off-bow scores, no age or bow-type divisions in this first pot.</p>
    <ol class="lk-dates" style="padding-left:1.2em;margin:10px 0 0">${days}</ol>
    ${score660}</div>${n7}
    ${hostUI}${acceptUI}
    <p class="small muted" style="margin:8px 4px">This league is invite only. The eight-character code does not let someone join unless they have already been invited. Onion Shed Challenge stays a separate six-300 league, and its code-join is unchanged.</p>
    <p><button class="btn ghost" id="lgback">Back to leagues</button></p>`;
  if($('#lgback'))$('#lgback').onclick=()=>{window._lgv=null;nav(view==='lab_leagues'?'lab_leagues':'score')};
  if($('#lkacc'))$('#lkacc').onclick=()=>{const m=lkAccept();if(m){const e=$('#lkaccmsg');if(e)e.textContent=m;return}lkView(lg.code)};
  if($('#lkivgo'))$('#lkivgo').onclick=()=>{const m=lkInvite(($('#lkivid')||{}).value);const e=$('#lkivmsg');if(e)e.textContent=m||'Invited.';if(!m)lkView(lg.code)};
  if($('#lkgadd'))$('#lkgadd').onclick=()=>{const m=lkAddGuest(($('#lkgname')||{}).value,!!(($('#lkgjr')||{}).checked));const e=$('#lkgmsg');if(e)e.textContent=m||'Added.';if(!m)lkView(lg.code)};
}

const _lkH2H=window.h2hCard;
if(_lkH2H){window.h2hCard=function(){const html=_lkH2H.apply(this,arguments);setTimeout(lkDecorateCard,0);return html}}

Object.assign(window,{
  LK_CODE,LK_NAME,LK_VENUE,LK_HOURS,LK_R,LK_DATES,LK_NIGHTS,LK_CAP,LK_HOST,
  lkIs,lkNights,lkRound,lkNight7,lkDate,lkLabel,lkRecord,lkSeed,lkEnsure,lkGet,lkView,lkFmtD,lkDecorateCard,lkJoinGuard,lkInvite,lkAccept,lkAddGuest,lkIsMember,lkCanHost
});
})();
