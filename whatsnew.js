/* What's new (23 Oct 2026). Release notes people can see: Me > Settings & help > What's new, plus a small one-time card on Home
   after an update. Newest first. Every note comes from a real commit (c = the commit it describes).
   To add a release: put a new entry at the TOP with v = the version written to version.json by tools/build_sw.py.
   The Home card shows once when WHATSNEW[0].v is newer than the one this phone has seen (key scoretool.whatsnew.seen). */
window.WHATSNEW=[
 {v:'v2026-10-23-1000-whatsnew',d:'2026-10-23',items:[
  ['bell',"What's new","This page. After each update a short note shows once on Home.",'this release'],
  ['book','Help guides rebuilt',"New guides for the new layout. They follow light or dark mode and print on white.",'this release']]},
 {v:'v2026-10-23-0915-photos',d:'2026-10-23',items:[
  ['camera','Score photos',"After you finish a round you can add a photo, or tap Skip. Change or remove it later in Past sessions. Photos are made small and kept on your phone.",'959ac11'],
  ['calendar','Send past rounds to Archery Calendar',"Rounds finished before you linked now have a Send button in Past sessions. Pick the right event, or None of these.",'3465077'],
  ['target','Arrow counts in round lists',"Round pickers show how many arrows each round has, like 72 arrows.",'4948a08'],
  ['bars','How far an unfinished round got',"Past sessions shows progress beside Incomplete, like 6 of 12 ends.",'4948a08'],
  ['ghost','Ghost match icon',"Ghost match has its own line icon.",'4948a08'],
  ['check','My rounds buttons fixed',"Start, Edit and Delete in My rounds always work, and the card only shows under Just me.",'9afb505 6050980'],
  ['bow','Casual shoot: 3D',"Casual shoot has a 3D choice: ABA, IBO and ASA scoring, with the number of targets you pick.",'3ba9958'],
  ['flag','Events on score sheets',"Tie a score to an Archery Calendar event. The event name heads the score sheet.",'31af716']]},
 {v:'v2026-10-22-2215-mybows-all',d:'2026-10-22',items:[
  ['home','New layout',"Home, Score, My archery, Clubs and Tools. Me is at the top. Finish later keeps a round for another time.",'edd2d9a'],
  ['check','Back buttons',"Every inner screen has a Back button, and the phone's own back works too.",'edd2d9a'],
  ['sun','Light or dark',"Switch in Me > Settings & help, or with the target-face button at the top.",'edd2d9a 010ddb2'],
  ['star','Line icons',"Simple navy and gold icons replace emoji.",'65c1109'],
  ['bow','My bows',"Add your bow's make, model and specs from a list of 245 bows from the makers' own pages.",'6550cbf 9696d94'],
  ['search','Arrow chooser',"Tools > Arrow chooser gives a starting spine and cut length from the makers' charts.",'e2a5cbe'],
  ['book','Rules',"Tools > Rules has World Archery, Archery Australia, ABA, IBO and ASA, with sources.",'733638d'],
  ['trend','Full analysis follows your pick',"End by end and Half split use the shoot you pick in Personal bests.",'0b77a71 3781099'],
  ['clip','Peel State Titles: Day 1 and Day 2',"The group score card shows both days and an event total.",'358890c'],
  ['target','Tuning arrows count',"Arrows plotted in the Arrow optimizer count toward the day's arrows.",'b8c67e0'],
  ['check','iPhone tab bar',"The tab bar sits right at the bottom in the iPhone home-screen app.",'010ddb2 9e6d102']]},
 {v:'v2026-10-21-1735-casual-shoot',d:'2026-10-21',items:[
  ['people','Casual shoot',"Score tab: Just me, Casual shoot or League shoot. A casual shoot is a one-off group shoot for 1 to 10 people, with match play if you want it.",'8fa9cc2']]},
 {v:'v2026-10-20-1830-offline',d:'2026-10-20',items:[
  ['globe','Works offline',"The app opens and scores with no signal. It catches up when you are back online.",'a0aaf00'],
  ['trophy','Leagues and shoot-ups',"Onion Shed Challenge league: six 300 rounds at 18 m, then a shoot-up final.",'971b79b 37c3276'],
  ['swords','Match night',"Head-to-head with up to 10 archers, each on their own phone.",'0e6ea9b df27f5a'],
  ['clip','Group score card',"Score your whole group on one phone at the Peel State Titles.",'e5eea68'],
  ['card','Display names',"Pick a nickname. It shows in squads, leagues and matches.",'adf7a84']]},
 {v:'v2026-10-18-1936-colourblind',d:'2026-10-18',items:[
  ['gear','Colour-blind safe mode',"A Settings tick for red-green safe colours: white marks, numbered arrow dots, blue and orange.",'81b7c78'],
  ['bulb','Side hill tip',"A tip card for field and 3D rounds on the Score screen.",'b956191'],
  ['up','Share your score sheet',"Share a score sheet as a picture.",'f06ab36'],
  ['bars','Stats redesign',"One round picker, four main cards and More detail, in plain words.",'cd86e07']]},
 {v:'v2026-10-17',d:'2026-10-17',items:[
  ['search','Zoom button',"One small button on the target: Z1, Z2, then Reset. Pinch still works.",'43dba93'],
  ['medal','My best scores',"Your best full round for each round, end by end, from Archer's Diary.",'7c03766'],
  ['ghost','Ghost match',"Shoot against a past score, end by end, or against top-ranked archers.",'be54eb3 c46826e']]}
];
(function(){
const KEY='scoretool.whatsnew.seen';
const h=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=n=>(window.icon&&icon(n))||(window.icon&&icon('dot'))||'';
const fmt=d=>{const [y,m,x]=d.split('-').map(Number);return new Date(y,m-1,x).toLocaleDateString('en-AU',{weekday:'short',day:'numeric',month:'short',year:'numeric'})};
const L=()=>window.WHATSNEW||[];
const seen=()=>{try{return localStorage.getItem(KEY)||''}catch(e){return''}};
const markSeen=()=>{try{if(L()[0])localStorage.setItem(KEY,L()[0].v)}catch(e){}};
window.wnMarkSeen=markSeen;
function wnView(){markSeen();shownNow=false;const days=[];L().forEach(e=>{const g=days.find(x=>x.d==e.d);if(g)g.items.push(...e.items);else days.push({d:e.d,items:[...e.items]})});
 app.innerHTML=`<div class="card wnhead"><span class="kicker">Release notes</span><h2>What's new in ScoreTool</h2><p class="small muted" style="margin:0">Newest first. Short notes on each update.</p></div>
 ${days.map(g=>`<section class="card wnday"><h3 class="wndate">${h(fmt(g.d))}</h3><ul class="wnlist">${g.items.map(([i,t,s])=>`<li><span class="wnic" aria-hidden="true">${ic(i)}</span><span><b>${h(t)}</b><small>${h(s)}</small></span></li>`).join('')}</ul></section>`).join('')}
 <div class="card"><button class="btn ghost full" data-go="help">${ic('book')} Help guides</button></div>`;
 app.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>nav(b.dataset.go))}
window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},{whatsnew:wnView});
/* one-time card on Home after an update; never while a round is being scored */
let shownNow=false;
function maybeCard(){try{
 if(typeof TESTER=='undefined'||!TESTER||typeof S=='undefined'||!S.unlocked||!S.profile)return;
 if(/^#(share|coach)=/.test(location.hash))return;const tabs=document.getElementById('tabs');if(tabs&&tabs.hidden)return;
 if(typeof cur!='undefined'&&cur)return;if(currentView()!='home')return;
 const top=L()[0];if(!top||(!shownNow&&seen()==top.v))return;if(document.getElementById('wncard'))return;
 if(!shownNow){shownNow=true;markSeen()}
 const items=top.items.slice(0,3).map(x=>x[1]);
 app.insertAdjacentHTML('afterbegin',`<div class="card wncard" id="wncard" role="status"><span class="wnic" aria-hidden="true">${ic('bell')}</span><div class="wntx"><b>Updated: what's new</b><small>${h(items.join(' · '))}</small><button class="btn ghost" id="wnopen">See what's new</button></div><button class="wnx" id="wnx" aria-label="Dismiss what's new">${ic('cross')}</button></div>`);
 document.getElementById('wnopen').onclick=()=>{shownNow=false;nav('whatsnew')};
 document.getElementById('wnx').onclick=()=>{shownNow=false;const c=document.getElementById('wncard');if(c)c.remove()};
}catch(e){}}
function currentView(){try{return view}catch(e){return null}}
window.wnMaybeCard=maybeCard;
let q=false;const watch=()=>{const a=document.getElementById('app');if(!a)return;new MutationObserver(()=>{if(q)return;q=true;queueMicrotask(()=>{q=false;maybeCard()})}).observe(a,{childList:true})};
if(document.readyState=='loading')document.addEventListener('DOMContentLoaded',()=>{watch();maybeCard()});else{watch();setTimeout(maybeCard,0)}
})();
