/* My results source (test build, 6 Nov 2026). Country or body, website and member number stay on this phone.
   Nothing is fetched. The archer opens the site themselves, or pastes a table / CSV, maps the columns, and confirms before anything is saved.
   Saved imports are tagged imported, never replace a scored session, and are left out of ratings. */
(function(){
const E=window.EXTRA_VIEWS=window.EXTRA_VIEWS||{};
const h=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const who=()=>(typeof TESTER!='undefined'&&TESTER&&TESTER.id)||'guest';
const SKEY=()=>'scoretool.resultsSource.'+who();
const IKEY=()=>'scoretool.imported.'+who();
/* Home pages checked 6 Nov 2026. Archery GB answers 403 to a scripted fetch and 200 in a browser; the address is the body's own site. */
const BODIES=[
 ['aa','Archery Australia','https://archery.org.au/'],
 ['awa','Archery WA (state)','https://www.archerywa.com.au/'],
 ['world','World Archery','https://www.worldarchery.sport/'],
 ['agb','Archery GB','https://www.archerygb.org/'],
 ['usa','USA Archery','https://www.usarchery.org/'],
 ['other','Other','']
];
const bodyOf=id=>BODIES.find(b=>b[0]==id)||BODIES[0];
function read(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function src(){const o=read(SKEY());return o&&typeof o=='object'?o:{body:'aa',url:BODIES[0][2],member:''}}
function imports(){const a=read(IKEY());return Array.isArray(a)?a:[]}
window.importedShoots=function(){return imports().filter(r=>r&&r.imported&&r.date&&r.round&&r.score>0).map(r=>({
 id:r.id,date:r.date,round:r.round,score:+r.score,ends:[],dists:[],flagged:0,src:'imported',inc:false,
 event:r.event||'',club:'',rating:null,url:'',field:/field/i.test(r.round),imported:true}))};
function httpUrl(u){const s=String(u||'').trim();return /^https:\/\/.+/i.test(s)?s:''}
function parseTable(text){const raw=String(text||'').replace(/^\uFEFF/,'').trim();if(!raw)return [];
 const lines=raw.split(/\r?\n/).filter(l=>l.trim());
 const delim=lines.some(l=>l.includes('\t'))?'\t':lines.some(l=>l.includes(';'))&&!lines.some(l=>l.includes(','))?';':',';
 return lines.map(l=>delim=='\t'?l.split('\t').map(c=>c.trim()):l.split(delim).map(c=>c.trim().replace(/^"|"$/g,'')))}
function looksHeader(row){return row.some(c=>/round|date|score|event|competition|total/i.test(c))}
function guess(headers){const i=n=>headers.findIndex(c=>new RegExp(n,'i').test(c));
 return {round:i('round|distance'),date:i('date'),score:i('score|total|points'),event:i('event|competition|name')}}
function parseDate(s){s=String(s||'').trim();
 let m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);if(m)return m[1]+'-'+m[2]+'-'+m[3];
 m=/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/.exec(s);if(m)return m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');
 const d=new Date(s);if(!isNaN(d)&&/\d{4}/.test(s))return d.toISOString().slice(0,10);
 return ''}
function parseScore(s){const n=parseInt(String(s||'').replace(/[^\d]/g,''),10);return n>0?n:0}
let grid=[],header=false,map={round:0,date:1,score:2,event:3};
function applyMap(){const rows=header?grid.slice(1):grid;
 return rows.map(r=>{const g=i=>i<0?'':(r[i]||'');return {round:g(map.round).trim(),date:parseDate(g(map.date)),score:parseScore(g(map.score)),event:g(map.event).trim()}}).filter(r=>r.round||r.date||r.score||r.event)}
function taken(date,round,score){
 const same=(d,rd,sc)=>d===date && String(rd)===String(round) && +sc===+score;
 if((S.sessions||[]).some(s=>!s.sample&&s.ends&&same(s.date,s.round,typeof total=='function'?total(s):s.score)))return 'scored';
 if(typeof findReal=='function'&&findReal(S.profile||'').some(r=>same(typeof normDate=='function'?normDate(r.date):r.date,r.round,r.score)))return 'scored';
 if(imports().some(r=>r.imported&&same(r.date,r.round,r.score)))return 'already';
 return ''}
function view(){
 const o=src(),other=o.body==='other',url=httpUrl(o.url);
 const cols=grid[0]?grid[0].map((_,i)=>header?grid[0][i]||('Column '+(i+1)):'Column '+(i+1)):[];
 const sel=(k,label)=>{const opts=cols.map((c,i)=>`<option value="${i}" ${map[k]===i?'selected':''}>${h(c)}</option>`).join('');
  return `<label for="rm_${k}">${label}</label><select id="rm_${k}"><option value="-1" ${map[k]<0?'selected':''}>Not in this table</option>${opts}</select>`};
 const prev=grid.length?applyMap():[];
 const show=prev.slice(0,8);
 app.innerHTML=`<div class="labbar"><button class="btn ghost labback" type="button" id="rsback">‹ Tools</button><h1>My results source</h1></div>
 <div class="card" id="rssource"><span class="kicker">My results source</span><h2 style="margin:2px 0 8px">Where your results live</h2>
 <p class="small" style="margin:0 0 8px">Kept on this phone only. Not sent anywhere. Nothing is fetched from the organisation.</p>
 <label for="rsbody">Country or body</label>
 <select id="rsbody">${BODIES.map(b=>`<option value="${b[0]}" ${o.body===b[0]?'selected':''}>${h(b[1])}</option>`).join('')}</select>
 <label for="rsurl">Website</label>
 <input id="rsurl" type="url" inputmode="url" autocomplete="off" value="${h(o.url||'')}" ${other?'':'readonly'} placeholder="${other?'https://…':'Filled from the body you picked'}">
 ${other?'<p class="small muted" style="margin:4px 0 0">Other: type the address yourself. It is not filled in for you.</p>':'<p class="small muted" style="margin:4px 0 0">This is the body\'s home page. Change the body to pick another.</p>'}
 <label for="rsmem">Member / archer ID</label>
 <input id="rsmem" autocomplete="off" value="${h(o.member||'')}" placeholder="Your member or archer number">
 <button class="btn full" id="rssave" type="button" style="margin-top:10px">Save</button>
 <p class="small" id="rssaved" style="margin:6px 0 0"></p>
 <a class="btn alt full" id="rsopen" href="${h(url||'#')}" target="_blank" rel="noopener" ${url?'':'aria-disabled="true" style="pointer-events:none;opacity:.55"'}>Open my results</a>
 <p class="small muted" style="margin:6px 0 0">Opens the saved website in your browser. ScoreTool does not sign in or read the page.</p>
 </div>
 <div class="card" id="rsimport"><span class="kicker">Bring scores in yourself</span><h2 style="margin:2px 0 8px">Paste a table or a CSV</h2>
 <p class="small" style="margin:0 0 8px">Map the columns, check the preview, then confirm. Nothing is saved until you confirm. A round you already scored is left as it is.</p>
 <label for="rspaste">Paste</label>
 <textarea id="rspaste" rows="4" placeholder="Round, Date, Score, Event"></textarea>
 <button class="btn ghost" id="rsread" type="button">Read the paste</button>
 <label for="rscsv" style="margin-top:10px">Or a CSV file</label>
 <input id="rscsv" type="file" accept=".csv,text/csv,text/plain">
 ${grid.length?`<div id="rsmap"><h3 style="margin:12px 0 6px">Map the columns</h3>${sel('round','Round')}${sel('date','Date')}${sel('score','Score')}${sel('event','Event')}</div>
 <h3 style="margin:12px 0 6px">Preview</h3>
 <table class="labtbl" id="rspreview"><thead><tr><th>Round</th><th>Date</th><th>Score</th><th>Event</th></tr></thead><tbody>
 ${show.map(r=>`<tr><td>${h(r.round)}</td><td>${h(r.date||'—')}</td><td>${r.score||'—'}</td><td>${h(r.event)}</td></tr>`).join('')}</tbody></table>
 <p class="small muted">${prev.length} row${prev.length==1?'':'s'}${prev.length>show.length?`, first ${show.length} shown`:''}. Ratings are not worked out from these.</p>
 <button class="btn alt full" id="rsconfirm" type="button">Confirm and save</button>
 <p class="small" id="rsdone" style="margin:6px 0 0"></p>`:''}
 </div>`;
 $('#rsback').onclick=()=>nav('tools');
 const grab=()=>{const b=$('#rsbody').value,known=bodyOf(b);return {body:b,url:b==='other'?$('#rsurl').value.trim():known[2],member:$('#rsmem').value.trim()}};
 $('#rsbody').onchange=()=>{const b=$('#rsbody').value,mem=$('#rsmem').value.trim();
  const g=b==='other'?{body:'other',url:'',member:mem}:{body:b,url:bodyOf(b)[2],member:mem};
  localStorage.setItem(SKEY(),JSON.stringify(g));view()};
 $('#rssave').onclick=()=>{const g=grab();if(g.body==='other'&&g.url&&!httpUrl(g.url)){$('#rssaved').textContent='The website needs to start with https://';return}
  localStorage.setItem(SKEY(),JSON.stringify(g));$('#rssaved').textContent='Saved on this phone.';view()};
 const open=$('#rsopen');if(open&&!url)open.onclick=e=>e.preventDefault();
 const readText=t=>{grid=parseTable(t);header=grid.length>1&&looksHeader(grid[0]);
  map=header?guess(grid[0]):{round:0,date:1,score:2,event:grid[0]&&grid[0].length>3?3:-1};view();
  const box=$('#rspaste');if(box)box.value=t};
 $('#rsread').onclick=()=>readText($('#rspaste').value);
 $('#rscsv').onchange=()=>{const f=$('#rscsv').files&&$('#rscsv').files[0];if(!f)return;const r=new FileReader();r.onload=()=>readText(String(r.result||''));r.readAsText(f)};
 if(grid.length){['round','date','score','event'].forEach(k=>{const s=$('#rm_'+k);if(s)s.onchange=()=>{map[k]=+s.value;view()}});
  const go=$('#rsconfirm');if(go)go.onclick=()=>{
   if(map.round<0||map.date<0||map.score<0){$('#rsdone').textContent='Map round, date and score first.';return}
   const rows=applyMap(),keep=imports();let n=0,skip=0,bad=0;
   rows.forEach(r=>{if(!r.round||!r.date||!r.score){bad++;return}const why=taken(r.date,r.round,r.score);if(why){skip++;return}
    keep.push({id:'imp'+Date.now()+'-'+n,round:r.round,date:r.date,score:r.score,event:r.event,imported:true});n++});
   localStorage.setItem(IKEY(),JSON.stringify(keep));
   $('#rsdone').textContent=`Saved ${n} on this phone.${skip?` Left ${skip} that were already scored or already saved.`:''}${bad?` ${bad} row${bad==1?'':'s'} had no round, date or score.`:''} They show on your personal bests as imported, and they are not used for ratings.`;
  }}}
E.lab_results=view;
})();
