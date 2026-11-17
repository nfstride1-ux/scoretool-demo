/* Plans (Stripe). The secret key stays on the Edge Function. See docs/stripe-entitlement.md.
   Free: the score card (every round, plotting, saving), totals, averages, past sessions, and league and Lingkana scoring.
   Plus: analysis, diary, photos, squads and group scoring. Pro: bows, arrows and the Tune helper.
   Plans is an upgrade from a locked screen and from Me. It is not a lock on the first screen.
   A phone with S.unlocked already true keeps full access (founding member, or the tester grant).
   The non-Nathe first-run shortcut in app.js still sets S.unlocked. That is not a purchase. */
(function(){
const SB='https://sllsqpfqwckwtljzjxli.supabase.co';
const KEY_PUB='sb_publishable_t2g3KYdoGeTtcXTO-URK9g_Nf69SEFq';
const AUTH='scoretool.stripe.auth',ENT='scoretool.stripe.entitlement';
const PLANS={
 plus:{name:'Plus',month:['scoretool_plus_month','A$4.99 a month'],year:['scoretool_plus_year','A$49 a year'],line:'Analysis, diary, photos, squads and group scoring.'},
 pro:{name:'Pro',month:['scoretool_pro_month','A$7.99 a month'],year:['scoretool_pro_year','A$79 a year'],line:'Bows, arrows and the Tune helper, as well as Plus.'}
};
const PLUS=new Set(['stats','analytics','lab_analysis','diary','lab_diary','lab_squad','squad','lab_group']);
const PRO=new Set(['lab_mybows','lab_myarrows','lab_chooser','lab_tune','lab_opt','lab_calc']);
const RANK={free:0,plus:1,pro:2,grant:2,founding:3};
let bill='month';
const esc=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const base=()=>String(typeof SCORETOOL_ENTITLEMENT_URL==='string'?SCORETOOL_ENTITLEMENT_URL:'').trim().replace(/\/$/,'');
function read(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function legacyFull(){return !!(typeof S!=='undefined'&&S&&S.unlocked)}
function paidOpen(){
 const e=read(ENT);
 if(!e||e.server!==true||e.valid!==true||(e.tier!=='plus'&&e.tier!=='pro'))return false;
 if(e.status==='canceled'||e.status==='incomplete'||e.status==='incomplete_expired')return false;
 const end=e.current_period_end?Date.parse(e.current_period_end):NaN;
 if(Number.isFinite(end)&&end<=Date.now())return false;
 return true}
window.scoretoolPaidOpen=paidOpen;
window.tierOf=function(){
 if(legacyFull())return (typeof TESTER!=='undefined'&&TESTER&&!TESTER.guest&&!TESTER.custom)?'founding':'grant';
 if(paidOpen())return read(ENT).tier;
 return 'free'};
window.tierHas=function(need){const n=need==='pro'?'pro':need==='plus'?'plus':'free';return RANK[tierOf()]>=RANK[n]};
window.tierLabel=function(t){return {free:'No plan',plus:'Plus',pro:'Pro',grant:'Tester access',founding:'Founding member, free for life'}[t||tierOf()]||'No plan'};
function storeEnt(j){
 if(!j||j.server!==true)return;
 try{localStorage.setItem(ENT,JSON.stringify({server:true,valid:j.valid===true,tier:j.tier==='pro'?'pro':j.tier==='plus'?'plus':null,status:j.status||'',current_period_end:j.current_period_end||null,customer_id:j.customer_id||null}))}catch(e){}}
function saveAuth(a){try{localStorage.setItem(AUTH,JSON.stringify({access_token:a.access_token||'',refresh_token:a.refresh_token||'',email:a.email||''}))}catch(e){}}
async function refresh(auth){
 const r=await fetch(SB+'/auth/v1/token?grant_type=refresh_token',{method:'POST',headers:{'Content-Type':'application/json',apikey:KEY_PUB,Authorization:'Bearer '+KEY_PUB},body:JSON.stringify({refresh_token:auth.refresh_token})});
 if(!r.ok)return '';
 const j=await r.json();
 if(!j.access_token)return '';
 saveAuth({access_token:j.access_token,refresh_token:j.refresh_token||auth.refresh_token,email:auth.email||''});
 return j.access_token}
async function scoretoolEntitlementVerify(){
 const root=base();
 if(!root)return {ok:false,reason:'no-server'};
 const auth=read(AUTH);
 if(!auth||!auth.access_token)return {ok:false,reason:'signed-out'};
 const call=token=>fetch(root+'/entitlement',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json',apikey:KEY_PUB,Authorization:'Bearer '+token},body:'{}'});
 try{
  let r=await call(auth.access_token);
  if(r.status===401&&auth.refresh_token){const t=await refresh(auth);if(!t)return {ok:false,reason:'signed-out'};r=await call(t)}
  if(!r.ok)return {ok:false,reason:'rejected'};
  const j=await r.json();
  if(!j||j.server!==true)return {ok:false,reason:'rejected'};
  storeEnt(j);
  return j.valid===true?{ok:true,tier:j.tier}:{ok:false,reason:'inactive'}}
 catch(e){return paidOpen()?{ok:true,tier:read(ENT).tier,reason:'offline-cache'}:{ok:false,reason:'unreachable'}}}
window.scoretoolEntitlementVerify=scoretoolEntitlementVerify;
function planMsg(t){const n=document.getElementById('planmsg');if(n)n.textContent=t||''}
async function startCheckout(lookup){
 const root=base();
 if(!root){planMsg('Checkout is not connected on this copy. This phone stays locked.');return}
 const here=location.origin+location.pathname+location.search;
 const email=(document.getElementById('planemail')||{}).value||'';
 planMsg('Opening Stripe Checkout…');
 try{
  const r=await fetch(root+'/checkout',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json',apikey:KEY_PUB,Authorization:'Bearer '+KEY_PUB},body:JSON.stringify({lookup_key:lookup,success_url:here,cancel_url:here,email})});
  const j=await r.json();
  if(j&&j.url){location.href=j.url;return}
  planMsg('Checkout did not start. Nothing was charged, and this phone is still locked.')}
 catch(e){planMsg('Checkout could not be reached. Nothing was charged, and this phone is still locked.')}}
async function sendCode(){
 const email=((document.getElementById('planemail')||{}).value||'').trim();
 if(!email){planMsg('Enter the email on the payment.');return}
 planMsg('Sending the email…');
 try{
  const back=location.origin+location.pathname+location.search;
  const r=await fetch(SB+'/auth/v1/otp',{method:'POST',headers:{'Content-Type':'application/json',apikey:KEY_PUB,Authorization:'Bearer '+KEY_PUB},body:JSON.stringify({email,create_user:true,options:{email_redirect_to:back}})});
  planMsg(r.ok?'Check that email for a code and a link.':'The sign-in email could not be sent.')}
 catch(e){planMsg('The sign-in email could not be sent.')}}
async function confirmCode(){
 const email=((document.getElementById('planemail')||{}).value||'').trim();
 const token=((document.getElementById('plancode')||{}).value||'').replace(/\s/g,'');
 if(!email||!token){planMsg('Enter the email and the code.');return}
 planMsg('Checking the code…');
 try{
  const r=await fetch(SB+'/auth/v1/verify',{method:'POST',headers:{'Content-Type':'application/json',apikey:KEY_PUB,Authorization:'Bearer '+KEY_PUB},body:JSON.stringify({type:'email',email,token})});
  const j=await r.json();
  if(!r.ok||!j.access_token){planMsg('That code was not accepted.');return}
  saveAuth({access_token:j.access_token,refresh_token:j.refresh_token||'',email:(j.user&&j.user.email)||email});
  const v=await scoretoolEntitlementVerify();
  if(v.ok){planMsg('');if(typeof render==='function')render()}
  else planMsg('Signed in. There is no paid plan on that email yet.')}
 catch(e){planMsg('The code could not be checked.')}}
async function openPortal(){
 const root=base(),auth=read(AUTH);
 if(!root||!auth||!auth.access_token){planMsg('Sign in with the payment email first.');return}
 try{
  const r=await fetch(root+'/portal',{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json',apikey:KEY_PUB,Authorization:'Bearer '+auth.access_token},body:JSON.stringify({return_url:location.origin+location.pathname+location.search})});
  const j=await r.json();
  if(j&&j.url){location.href=j.url;return}
  planMsg('The subscription page did not open.')}
 catch(e){planMsg('The subscription page did not open.')}}
function paintPrices(){
 const k=bill==='year'?'year':'month';
 const p=document.getElementById('plusprice'),r=document.getElementById('proprice');
 if(p)p.textContent=PLANS.plus[k][1];
 if(r)r.textContent=PLANS.pro[k][1];
 const bp=document.getElementById('buyplus'),br=document.getElementById('buypro');
 if(bp)bp.dataset.lookup=PLANS.plus[k][0];
 if(br)br.dataset.lookup=PLANS.pro[k][0];
 const m=document.getElementById('billmonth'),y=document.getElementById('billyear');
 if(m)m.setAttribute('aria-pressed',k==='month'?'true':'false');
 if(y)y.setAttribute('aria-pressed',k==='year'?'true':'false')}
function plansInner(){
 const e=read(ENT)||{},manage=e.customer_id?'<button class="btn ghost full" id="planmanage" type="button">Manage subscription</button>':'';
 const note=window._planNotice?'<p id="plannotice">'+esc(window._planNotice)+'</p>':'';
 return `<div class="card dark" id="plans"><span class="kicker">ScoreTool</span><h1>Plans</h1>
 ${note}
 <p>The score card, totals, averages, past sessions and league scoring are free. Plus and Pro are paid with Stripe, in Australian dollars. A refund is made only if you ask. Nothing is refunded automatically.</p>
 <div class="labseg" role="group" aria-label="Billing period"><button type="button" id="billmonth" aria-pressed="true">Monthly</button><button type="button" id="billyear" aria-pressed="false">Yearly</button></div>
 <div class="card" id="planplus"><h2 style="margin:0">Plus</h2><p class="planprice" id="plusprice">A$4.99 a month</p><p>${PLANS.plus.line}</p><button class="btn full" id="buyplus" type="button" data-lookup="scoretool_plus_month">Continue to Plus checkout</button></div>
 <div class="card" id="planpro"><h2 style="margin:0">Pro</h2><p class="planprice" id="proprice">A$7.99 a month</p><p>${PLANS.pro.line}</p><button class="btn alt full" id="buypro" type="button" data-lookup="scoretool_pro_month">Continue to Pro checkout</button></div>
 <p id="planmsg" role="status"></p>
 ${manage}
 <h2>Already paid?</h2>
 <label for="planemail">Email on the payment</label><input id="planemail" type="email" autocomplete="email" inputmode="email">
 <button class="btn ghost full" id="plansend" type="button">Email me a code</button>
 <label for="plancode">Code from the email</label><input id="plancode" inputmode="numeric" autocomplete="one-time-code" aria-describedby="planhint">
 <button class="btn full" id="planconfirm" type="button">Unlock this phone</button>
 <p class="small" id="planhint">The email has a code and a link. Either one signs this phone in, then the app checks the plan on the server. A phone that was already opened stays open.</p></div>`}
function plansGateHTML(){return '<div id="gate">'+plansInner()+'</div>'}
window.plansGateHTML=plansGateHTML;
function plansBind(){
 paintPrices();
 const m=document.getElementById('billmonth'),y=document.getElementById('billyear');
 if(m)m.onclick=()=>{bill='month';paintPrices()};
 if(y)y.onclick=()=>{bill='year';paintPrices()};
 const bp=document.getElementById('buyplus'),br=document.getElementById('buypro');
 if(bp)bp.onclick=()=>startCheckout(bp.dataset.lookup);
 if(br)br.onclick=()=>startCheckout(br.dataset.lookup);
 const s=document.getElementById('plansend'),c=document.getElementById('planconfirm'),g=document.getElementById('planmanage');
 if(s)s.onclick=sendCode;if(c)c.onclick=confirmCode;if(g)g.onclick=openPortal}
window.plansBind=plansBind;
function planHomeHTML(){
 const e=read(ENT)||{};
 const manage=e.customer_id?'<button class="btn ghost" id="planmanage" type="button">Manage subscription</button> ':'';
 return `<div class="card" id="planhome"><span class="kicker">Plan</span><h2 style="margin:2px 0 6px">${esc(tierLabel(e.tier))}</h2><p class="small" style="margin:0 0 8px">This phone is unlocked on ${esc(tierLabel(e.tier))}.</p>${manage}<button class="btn ghost" id="plansee" type="button">See plans</button></div>`}
function bindHomePlan(){
 const m=document.getElementById('planmanage'),s=document.getElementById('plansee');
 if(m)m.onclick=openPortal;if(s)s.onclick=()=>nav('plans')}
if(typeof home==='function'){const _home=home;home=function(){_home.apply(this,arguments);if(!paidOpen()||document.getElementById('planhome'))return;const html=planHomeHTML();if(app.firstElementChild)app.firstElementChild.insertAdjacentHTML('beforebegin',html);else app.insertAdjacentHTML('beforeend',html);bindHomePlan()}}
const E=window.EXTRA_VIEWS=window.EXTRA_VIEWS||{};
E.plans=function(){app.innerHTML='<button class="btn ghost" id="planback" type="button">Back</button>'+plansInner();plansBind();document.getElementById('planback').onclick=()=>nav('home')};
if(E.lab_me){const baseMe=E.lab_me;E.lab_me=function(){baseMe.apply(this,arguments);const menu=app.querySelector('.labmenu');if(!menu||document.getElementById('planrow'))return;menu.insertAdjacentHTML('beforeend','<button class="labrow" id="planrow" type="button"><span><b>Plans</b><small>Free score card. Plus and Pro add more.</small></span><span class="go" aria-hidden="true">›</span></button>');document.getElementById('planrow').onclick=()=>nav('plans')}}
if(E.lab_settings){const baseSet=E.lab_settings;E.lab_settings=function(){baseSet.apply(this,arguments);if(document.getElementById('plancard'))return;const host=document.getElementById('themecard')||document.getElementById('settingscard');if(!host)return;host.insertAdjacentHTML('beforebegin','<div class="card" id="plancard"><span class="kicker">Plan</span><h2 style="margin:2px 0 6px">'+esc(tierLabel())+'</h2><p class="small" style="margin:0 0 8px">The score card is free. Plus and Pro add more. Open Plans to upgrade, or the Stripe page to cancel or update the card.</p><button class="btn" id="plansee" type="button">See plans</button></div>');document.getElementById('plansee').onclick=()=>nav('plans')}}
const _nav=nav;
nav=function(v){
 const need=PRO.has(v)?'pro':PLUS.has(v)?'plus':null;
 if(need&&!tierHas(need)){
  view=v;$('#tabs').hidden=false;
  const sec={stats:'myarch',analytics:'myarch',lab_analysis:'myarch',diary:'myarch',lab_diary:'myarch',lab_squad:'clubs',squad:'clubs',lab_group:'clubs',lab_mybows:'myarch',lab_myarrows:'myarch',lab_chooser:'tools',lab_tune:'tools',lab_opt:'tools',lab_calc:'tools'}[v]||'home';
  document.querySelectorAll('#tabs button').forEach(b=>b.setAttribute('aria-current',b.dataset.v===sec?'true':'false'));
  app.innerHTML=`<div class="card" id="tierlock"><span class="kicker">Plan</span><h2>Available on ${need==='pro'?'Pro':'Plus'}</h2><p>This stays on the menu. Your scores on this phone are unchanged.</p><button class="btn" id="tierplans" type="button">See plans</button></div><button class="btn ghost" id="tierback" type="button">Back</button>`;
  document.getElementById('tierplans').onclick=()=>nav('plans');
  document.getElementById('tierback').onclick=()=>nav('home');
  scrollTo(0,0);return}
 return _nav.apply(this,arguments)};
document.addEventListener('click',function(ev){
 if(tierHas('plus'))return;
 const photo=ev.target.closest&&ev.target.closest('[data-phact="add"]');
 if(photo){ev.preventDefault();ev.stopPropagation();if(!document.getElementById('phlock'))photo.insertAdjacentHTML('afterend',' <span class="small" id="phlock">Photos are on Plus. <button type="button" class="btn ghost" data-plans="1">See plans</button></span>');return}
 const b=ev.target.closest&&ev.target.closest('#ghon');
 if(!b)return;ev.preventDefault();ev.stopPropagation();if(!document.getElementById('ghlock'))b.insertAdjacentHTML('afterend',' <span class="small" id="ghlock">Available on Plus.</span>')
},true);
document.addEventListener('click',function(ev){const b=ev.target.closest&&ev.target.closest('[data-plans]');if(!b)return;ev.preventDefault();nav('plans')});
(function boot(){
 const q=new URLSearchParams(location.search);
 window._planNotice=q.get('checkout')==='success'?'Stripe has the payment. Sign in with the same email to unlock this phone.':q.get('checkout')==='cancel'?'Checkout was cancelled. Nothing was charged.':'';
 const h=new URLSearchParams((location.hash||'').replace(/^#/,''));
 if(!h.get('access_token'))return;
 saveAuth({access_token:h.get('access_token'),refresh_token:h.get('refresh_token')||'',email:''});
 const u=new URL(location.href);u.hash='';history.replaceState(null,'',u.pathname+u.search);
 scoretoolEntitlementVerify().then(function(){if(typeof render==='function')render()})})();
})();
