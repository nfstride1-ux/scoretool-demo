/* Tester profiles. Each tester's data lives in its own localStorage key so testing never mixes.
   Nathe keeps the original key (his real built-in data). Phill and Logan start EMPTY: no built-in or sample data. Names only, no contact details. */
const TESTERS=[{id:'nathe',name:'Nathaniel Stride',short:'Nathe'},{id:'phill',name:'Phill Arthur',short:'Phill'},{id:'logan',name:'Logan Wolfe',short:'Logan'}];
const TESTER=(function(){const q=new URLSearchParams(location.search).get('tester');let id=(q||'').toLowerCase();
 if(id=='nathan'||id=='nathaniel')id='nathe';if(id=='phil')id='phill';
 if(TESTERS.some(t=>t.id==id))localStorage.setItem('scoretool.tester',id);else id=localStorage.getItem('scoretool.tester');
 return TESTERS.find(t=>t.id==id)||null})();
function setTester(id){localStorage.setItem('scoretool.tester',id);const u=new URL(location.href);u.searchParams.delete('tester');u.hash='';location.href=u.toString()}
function testerLink(id){return location.origin+location.pathname+'?tester='+id}
function testerPicker(){return`<div class="card dark"><span class="kicker">Tester sign-in</span><h1>Who's testing?</h1><p>Pick your name. Your scores are saved on this phone, separate from the other testers.</p>
${TESTERS.map(t=>`<button class="btn full" style="margin:8px 0" data-tester="${t.id}">${t.name}</button>`).join('')}<p class="small muted">You can change this later in Me.</p></div>`}
function bindTesterPicker(root){(root||document).querySelectorAll('[data-tester]').forEach(b=>b.onclick=()=>setTester(b.dataset.tester))}
function testerCard(){return`<div class="card"><span class="kicker">Tester</span><h2>Testing as ${TESTER?TESTER.name:'nobody'}</h2><p class="small muted">Each tester's data is kept separate on this phone.</p>
<div class="row" style="gap:6px;flex-wrap:wrap;justify-content:flex-start">${TESTERS.filter(t=>!TESTER||t.id!=TESTER.id).map(t=>`<button class="btn ghost" data-tester="${t.id}">Switch to ${t.short}</button>`).join('')}</div></div>`}
