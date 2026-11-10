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
  app.innerHTML=`<div class="card" id="lgview" data-lk="1"><span class="kicker">Invite-only league</span>
    <h1>${h(lg.name)}</h1>
    <p class="small" style="margin:0">${h(LK_VENUE)}</p>
    <p class="small muted" style="margin:4px 0 0">${h(LK_HOURS)}</p>
    <p class="small muted" style="margin:4px 0 0">Cap ${lg.cap||LK_CAP} archers · off-bow scores, no age or bow-type divisions in this first pot.</p>
    <ol class="lk-dates" style="padding-left:1.2em;margin:10px 0 0">${days}</ol>
    ${score660}</div>${n7}
    <p class="small muted" style="margin:8px 4px">This is a preview of the Lingkana format. Onion Shed Challenge stays a separate six-300 league.</p>
    <p><button class="btn ghost" id="lgback">Back to leagues</button></p>`;
  if($('#lgback'))$('#lgback').onclick=()=>{window._lgv=null;nav(view==='lab_leagues'?'lab_leagues':'score')};
}

const _lkH2H=window.h2hCard;
if(_lkH2H){window.h2hCard=function(){const html=_lkH2H.apply(this,arguments);setTimeout(lkDecorateCard,0);return html}}

Object.assign(window,{
  LK_CODE,LK_NAME,LK_VENUE,LK_HOURS,LK_R,LK_DATES,LK_NIGHTS,LK_CAP,LK_HOST,
  lkIs,lkNights,lkRound,lkNight7,lkDate,lkLabel,lkRecord,lkSeed,lkEnsure,lkGet,lkView,lkFmtD,lkDecorateCard
});
})();
