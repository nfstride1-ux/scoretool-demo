/* Help (23 Oct 2026): themed HTML guides for the new layout (replace the old dark picture posters). Each guide is plain steps plus a
   real screenshot in a light and a dark version, swapped by the app's theme; printing (or the PDF) always uses white pages.
   Rebuild the screenshots and PDF with: python3 tools/build_help_shots.py   Send a suggestion: FormSubmit -> nfshold@gmail.com. */
const HELP_V='20261023b';
const HELP_GUIDES=[
 {id:'start',i:'home',t:'Getting started',shot:'start',steps:[
  'Open the link Nathe sent you. It has your name in it.',
  'The tabs along the bottom are <b>Home</b>, <b>Score</b>, <b>My archery</b>, <b>Clubs</b> and <b>Tools</b>.',
  'Your name at the top opens <b>Me</b>: profile, coaches and parents, settings and help.',
  'Every inner screen has a <b>Back</b> button at the top left.',
  'Your scores are saved on this phone. The app works offline.']},
 {id:'score',i:'target',t:'Score a round',shot:'score',steps:[
  'Tap <b>Score</b>, then <b>Just me</b>.',
  'Pick your round. The list shows how many arrows each round has.',
  'Tick <b>Ghost match</b> to shoot against a past score, end by end.',
  'Tap <b>Start</b>.']},
 {id:'scoring',i:'pen',t:'Plot your arrows',shot:'scoring',steps:[
  'Tap the target where each arrow landed, or tap a score key.',
  'Tap the small <b>Z1</b> button to zoom, <b>Z2</b> for more, then <b>Reset</b>. Pinch works too.',
  'Tap an arrow to fix it. <b>Undo</b> takes back the last one.',
  '<b>Finish later</b> keeps the round. Carry on from Score or Home.',
  'Check each end total, then finish the round to save it.']},
 {id:'casual',i:'people',t:'Casual shoot and 3D',shot:'casual',steps:[
  'Tap <b>Score</b>, then <b>Casual shoot</b>.',
  'Pick the discipline: Target, Indoor, Field or <b>3D</b>.',
  'For 3D, pick ABA, IBO or ASA scoring and how many targets.',
  'Add 1 to 10 people. Linked archers score on their own phone.',
  'Match play is optional, at the start or after the shoot.']},
 {id:'past',i:'camera',t:'Past sessions, photos and Archery Calendar',shot:null,steps:[
  'Past sessions are on the <b>Score</b> screen, under Just me.',
  'An unfinished round shows <b>Incomplete</b> and how far it got, like 6 of 12 ends.',
  'After you finish, tap <b>Add a photo</b> if you like, or <b>Skip</b>. Change or remove it later in Past sessions.',
  'At the end of a round, under the score, you see how this shoot compares with your earlier shoots of the same round: score vs your average and PB, score by end, Xs and 10s, and your arrow plot vs your usual group. <b>Open</b> in Past sessions shows the same view.',
  'Tap <b>Finish session</b> when you are done. Your arrows are already saved as you go, so this only closes the round.',
  'Linked to Archery Calendar? Finished rounds show in your My events. Older rounds have a <b>Send</b> button: pick the event, or <b>None of these</b>.']},
 {id:'stats',i:'bars',t:'Stats and analysis',shot:'stats',steps:[
  'Tap <b>My archery</b>, then <b>Stats &amp; PBs</b>.',
  'Pick a round to see your last shoot, trend and personal bests.',
  'Tap <b>More detail</b> for the full picture.',
  '<b>Full analysis</b> has end by end and half split for the shoot you picked.',
  '<b>Arrow plot</b> in Analytics shows your plotted arrows as dots. On 3-spot faces every arrow is measured from its own spot. The group centre and offset in mm tell you which way to move your sight.']},
 {id:'myarch',i:'bow',t:'Diary, setups and bows',shot:'myarch',steps:[
  '<b>My archery</b> holds your Diary, Practice arrows, Setups &amp; sight marks, My bows and My arrows.',
  '<b>Past competition results</b>: your official scores from past competitions show in Stats, My best scores and Rankings. They are kept separate from rounds you score in ScoreTool.',
  '<b>Practice arrows</b> counts today\'s arrows toward your daily goal.',
  '<b>Sight marks</b>: pick the bow setup, then the <b>Arrow set</b>. Each set of arrows has its own marks for that bow. <b>+ New arrow set</b> adds one; your marks from before are under <b>Arrows 1</b>.',
  '<b>Load PDF or CSV</b> (in Sight marks): load a PDF or CSV with range and mark columns, or paste marks, then pick the bow setup and arrow set. Check the preview, then tap <b>Save</b>. Your own marks are kept unless you choose <b>Replace existing marks</b>.',
  '<b>Estimate other marks</b> (in Sight marks, once you have 3 or more marks): fills the empty distances with estimates, shown as <i>est.</i> in grey. Your own marks are never changed. Confirm each estimate on the range, then type it in to make it your mark. Past your longest mark the estimates are less sure, and they stop at 1.5 times your longest mark. Tap <b>Clear estimates</b> to remove them.',
  'A full sight mark sheet shows every distance it has, in a list you can scroll. <b>Arrow details</b> also hold total weight, speed, sight height, sight radius and the distances you sighted in at.',
  '<b>My bows</b> adds make, model and specs from the maker\'s own page.',
  '<b>My arrows</b> lists each arrow set once: shaft, spine, length, point and total weight, fletching and FOC. Tap <b>Edit</b> to add details. It is the same list as the Arrow set choice in Sight marks.',
  'Rankings &amp; classification and Season, badges &amp; recap are here too.']},
 {id:'clubs',i:'shield',t:'Clubs and leagues',shot:'clubs',steps:[
  '<b>Squads</b>: join with a code and cheer your squad.',
  '<b>Leagues</b>: join with a code or start one.',
  '<b>Match play</b>: head-to-head on two phones, and shoot-ups.',
  '<b>Group score card</b>: score your whole group on one phone.',
  '<b>Following</b>: archers you follow and their feed.']},
 {id:'tools',i:'wrench',t:'Tools',shot:'tools',steps:[
  '<b>Arrow optimizer &amp; tuning</b>: plot groups before and after a change.',
  '<b>Arrow chooser</b>: fill in from the top down (bow, draw weight, draw length, speed rating, what it\'s for, arrow length, point weight). The result is at the bottom: a starting spine and cut length from the makers\' charts, with the working shown.',
  '<b>What it\'s for</b>: Indoor lists fat shafts only (like SuperDrive 23 and X23), Target and Field list thin outdoor shafts, and Hunting uses Easton\'s hunting chart.',
  '<b>Calculators</b>: arrow speed, kinetic energy, momentum, FOC. Pick an arrow from My arrows in the speed or FOC card and tap <b>Save to this arrow</b> to keep the FOC, total weight, speed, bow and date on it (shown in My arrows). Your shaft, spine, length and points only change if you changed them in the calculator and confirm.',
  '<b>Is this arrow right?</b> (under the calculators): says if the FOC is too low, good or high for what the arrow is for, from Easton\'s published FOC ranges, and if the spine is too stiff, about right or too weak, from the maker\'s chart (the same chart and adjustments as the Arrow chooser). It shows the range it used. A guide only: confirm by bare-shaft or paper tuning.',
  '<b>My arrows</b> dropdown (Calculators, Arrow chooser and Arrow optimizer): pick a saved arrow set to fill in its length, weights and balance point. You can still change any box.',
  '<b>Rules</b>: World Archery, Archery Australia, ABA, IBO and ASA.']},
 {id:'settings',i:'gear',t:'Settings, light or dark, and help',shot:'settings',steps:[
  'Tap your name at the top, then <b>Settings &amp; help</b>.',
  'Pick <b>Light</b> or <b>Dark</b>. The target-face button at the top switches too.',
  '<b>Add to my Archery Calendar</b> links your scores to your My events.',
  'A tick turns on colour-blind safe colours.',
  '<b>What\'s new</b> lists each update. <b>Send a suggestion</b> goes straight to Nathe.']}];
const FORM_URL='https://formsubmit.co/nfshold@gmail.com';
let lastTab='home';
const hIc=n=>(window.icon&&icon(n))||'';
const hgGuest=()=>typeof TESTER!='undefined'&&!!TESTER&&!!TESTER.guest;
(function(){const top=document.querySelector('.top');if(top){const b=document.createElement('button');b.className='help-btn';b.setAttribute('aria-label','Help');b.textContent='?';b.onclick=()=>nav('help');top.appendChild(b)}
 const o=window.nav;window.nav=function(v){if(v!='help'&&v!='suggest')lastTab=v;return o(v)}})();
function helpCards(){return`<div class="card" id="helpcard"><span class="kicker">Help</span><h2>How to use ScoreTool</h2><p class="small">Short guides for every part of the app, and notes on each update.</p><div class="row" style="gap:8px;flex-wrap:wrap;justify-content:flex-start"><button class="btn" data-hgo="help">${hIc('book')} Help guides</button><button class="btn ghost" data-hgo="whatsnew" id="wnbtn">${hIc('bell')} What's new</button>${hgGuest()?'':`<button class="btn ghost" data-hgo="suggest">${hIc('chat')} Send a suggestion</button>`}</div></div>`}
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-hgo]');if(b){e.preventDefault();nav(b.dataset.hgo)}});
const hgShot=g=>g.shot?`<figure class="hg-fig"><img class="hg-l" loading="lazy" src="help/g/${g.shot}-light.webp" alt="${g.t} screen, light mode" width="390" height="700"><img class="hg-d" loading="lazy" src="help/g/${g.shot}-dark.webp" alt="${g.t} screen, dark mode" width="390" height="700"></figure>`:'';
function helpView(){const open=window._hgOpen||'start';
 app.innerHTML=`<div class="card hghead"><span class="kicker">Help</span><h2>How to use ScoreTool</h2><p class="small muted">Tap a guide to open it. Guides follow light or dark mode and print on white paper.</p>
 <div class="row hgtools" style="gap:8px;flex-wrap:wrap;justify-content:flex-start"><button class="btn ghost" data-hgo="whatsnew">${hIc('bell')} What's new</button><button class="btn ghost" id="hgprint">${hIc('clip')} Print the guides</button><a class="btn ghost" id="hgpdf" href="help/ScoreTool-help-guides.pdf?v=${HELP_V}" target="_blank" rel="noopener">${hIc('book')} PDF to print</a></div></div>
 ${HELP_GUIDES.map((g,n)=>`<details class="card hg" id="hg-${g.id}" data-hg="${g.id}"${g.id==open?' open':''}><summary><span class="hgic" aria-hidden="true">${hIc(g.i)}</span><span class="hgt"><small>Guide ${n+1} of ${HELP_GUIDES.length}</small><b>${g.t}</b></span><span class="go" aria-hidden="true">›</span></summary>
 <div class="hgbody"><ol class="hgsteps">${g.steps.map(s=>`<li>${s}</li>`).join('')}</ol>${hgShot(g)}</div></details>`).join('')}
 ${hgGuest()?'':`<div class="card hgsug"><h2>Got an idea or found a bug?</h2><button class="btn full" data-hgo="suggest">Send a suggestion</button></div>`}`;
 app.querySelectorAll('details.hg').forEach(d=>d.addEventListener('toggle',()=>{if(d.open)window._hgOpen=d.dataset.hg}));
 const pr=document.getElementById('hgprint');if(pr)pr.onclick=()=>window.print()}
/* printing: every guide opens, light screenshots only, white pages (lab.css @media print) */
let _hgWas=null;
addEventListener('beforeprint',()=>{const L=[...document.querySelectorAll('details.hg')];if(!L.length)return;_hgWas=L.map(d=>d.open);L.forEach(d=>{d.open=true;d.querySelectorAll('img').forEach(i=>i.loading='eager')})});
addEventListener('afterprint',()=>{const L=[...document.querySelectorAll('details.hg')];if(_hgWas)L.forEach((d,i)=>d.open=_hgWas[i]);_hgWas=null});
function suggestView(){const who=TESTER?TESTER.name:'',tabs=['Home','Score','My archery','Clubs','Tools','Me','Help','Other'],SEC={home:'Home',score:'Score',myarch:'My archery',stats:'My archery',analytics:'My archery',diary:'My archery',badges:'My archery',recap:'My archery',rewards:'My archery',clubs:'Clubs',squad:'Clubs',follow:'Clubs',tools:'Tools',me:'Me',profile:'Me',whatsnew:'Help'},lt=lastTab||'home',cur=SEC[lt]||(/^lab_(opt|chooser|calc|rules)/.test(lt)?'Tools':/^lab_(squad|leagues|match|group)/.test(lt)?'Clubs':/^lab_(me|profile|people|settings)/.test(lt)?'Me':/^lab_/.test(lt)?'My archery':'Other');
 app.innerHTML=`<div class="card"><span class="kicker">Testers</span><h1>Send a suggestion</h1><p class="small muted">Goes straight to Nathe by email.</p>
 <form id="sgForm" method="POST" enctype="multipart/form-data" action="${FORM_URL}" target="sgFrame">
 <input type="hidden" name="_subject" value="[ScoreTool tester] suggestion from ${who}"><input type="hidden" name="_template" value="table"><input type="hidden" name="_captcha" value="false">
 <input type="text" name="_honey" style="display:none" tabindex="-1" autocomplete="off">
 <label>Your name<input name="tester" required value="${who}"></label>
 <label>Which part of the app?<select name="page">${tabs.map(t=>`<option${t==cur?' selected':''}>${t}</option>`).join('')}</select></label>
 <label>Your suggestion or problem<textarea name="message" rows="5" required placeholder="What would make it better? What went wrong?"></textarea></label>
 <label>Screenshot (optional)<input type="file" name="attachment" accept="image/*"></label>
 <input type="hidden" name="app_version" value="${(window.WHATSNEW&&WHATSNEW[0]?WHATSNEW[0].v:'scoretool-demo')} testers"><input type="hidden" name="device" value="${navigator.userAgent.replace(/"/g,'')}">
 <button class="btn full" id="sgSend" style="margin-top:10px">Send suggestion</button></form><iframe name="sgFrame" style="display:none"></iframe><div id="sgOut"></div></div>`;
 const f=$('#sgForm');f.onsubmit=e=>{if(!f.message.value.trim()){e.preventDefault();f.message.focus();return}
  f._subject.value='[ScoreTool tester] suggestion from '+(f.tester.value.trim()||'a tester');
  if(!navigator.onLine){e.preventDefault();location.href=`mailto:nfshold@gmail.com?subject=${encodeURIComponent(f._subject.value)}&body=${encodeURIComponent('Page: '+f.page.value+'\n\n'+f.message.value)}`;return}
  $('#sgSend').textContent='Sending…';$('#sgSend').disabled=true;
  setTimeout(()=>{f.hidden=true;$('#sgOut').innerHTML='<h2>Thanks!</h2><p>Your suggestion has been sent to Nathe.</p><button class="btn ghost" onclick="nav(\'suggest\')">Send another</button>'},1500)}}
window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},{help:helpView,suggest:suggestView});
