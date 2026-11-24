/* My results source (24 Nov 2026). Results region, website and member number stay on this phone.
   Nothing is fetched. Australian regions open Archer's Diary. Other keeps a name and results website you type.
   Saved imports are tagged imported, never replace a scored session, and are left out of ratings. */
(function(){
const E=window.EXTRA_VIEWS=window.EXTRA_VIEWS||{};
const h=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const who=()=>(typeof TESTER!='undefined'&&TESTER&&TESTER.id)||'guest';
const SKEY=()=>'scoretool.resultsSource.'+who();
const IKEY=()=>'scoretool.imported.'+who();
const OKEY=()=>'scoretool.official.'+who();
const DIARY_URL='https://www.archersdiary.com/Performance.aspx';
const WA_RESULTS_URL='https://www.worldarchery.sport/events/results';
/* Archer's Diary regions (24 Nov 2026). World Archery opens the public results list. */
const BODIES=[
 ['aa','National Results',DIARY_URL],
 ['act','Archery ACT',DIARY_URL],
 ['nsw','Archery NSW',DIARY_URL],
 ['tas','Archery Society of Tasmania',DIARY_URL],
 ['sa','Archery South Australia',DIARY_URL],
 ['vic','Archery Victoria',DIARY_URL],
 ['awa','Archery WA',DIARY_URL],
 ['nqaa','North Queensland Archery Association',DIARY_URL],
 ['sqas','South Queensland Archery Society',DIARY_URL],
 ['world','World Archery results',WA_RESULTS_URL],
 ['other','Other','']
];
const AA_IDS={'aa':1,'act':1,'nsw':1,'tas':1,'sa':1,'vic':1,'awa':1,'nqaa':1,'sqas':1};
const OLD_NAMES={agb:'Archery GB',usa:'USA Archery'};
const bodyOf=id=>BODIES.find(b=>b[0]==id)||BODIES[0];
function read(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
function migrateSrc(o){
 const member=(o&&typeof o=='object'&&o.member)||'';
 const name=(o&&typeof o=='object'&&o.name)||'';
 if(!o||typeof o!='object'||!o.body)return {body:'aa',url:DIARY_URL,member,name:''};
 if(o.body==='other'||(o.body&&!BODIES.some(b=>b[0]==o.body))){
  return {body:'other',url:(o.url||''),member,name:(name||OLD_NAMES[o.body]||'').trim()};
 }
 const known=bodyOf(o.body);
 return {body:known[0],url:known[2],member,name:''};
}
function src(){
 const o=read(SKEY());
 const next=migrateSrc(o);
 try{
  const prev=o&&typeof o=='object'?o:null;
  if(!prev||prev.body!=next.body||prev.url!=next.url||(prev.member||'')!=next.member||(prev.name||'')!=(next.name||'')){
   localStorage.setItem(SKEY(),JSON.stringify(next));
  }
 }catch(e){}
 return next;
}
function imports(){const a=read(IKEY());return Array.isArray(a)?a:[]}
window.importedShoots=function(){return imports().filter(r=>r&&r.imported&&r.date&&r.round&&r.score>0).map(r=>({
 id:r.id,date:r.date,round:r.round,score:+r.score,ends:[],dists:[],flagged:0,src:'imported',inc:false,
 event:r.event||'',club:'',rating:null,url:'',field:/field/i.test(r.round)||/field/i.test(r.discipline||''),imported:true,
 division:r.division||'',discipline:r.discipline||'',diary:!!r.diary}))};
function officials(){const a=read(OKEY());return Array.isArray(a)?a:[]}
/* C4: a finished official round the archer typed in. Not a scored session, so it cannot replace one. */
window.officialAdded=function(){return officials().filter(r=>r&&r.official&&r.finished&&r.date&&r.round&&r.score>0).map(r=>({
 id:r.id,date:r.date,round:r.round,score:+r.score,max:r.max>0?+r.max:null,tens:r.tens===0||r.tens>0?+r.tens:null,xs:r.xs===0||r.xs>0?+r.xs:null,
 ends:Array.isArray(r.ends)?r.ends:[],event:r.event||'',official:true,finished:true,src:'official'}))};
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
 const mon={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
 m=/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/.exec(s);if(m&&mon[m[2].slice(0,3).toLowerCase()])return m[3]+'-'+String(mon[m[2].slice(0,3).toLowerCase()]).padStart(2,'0')+'-'+m[1].padStart(2,'0');
 const d=new Date(s);if(!isNaN(d)&&/\d{4}/.test(s))return d.toISOString().slice(0,10);
 return ''}
/* Read a paper scorecard or a results-app screenshot. Only a clearly labelled score is used.
   Anything else is a misread: the form is not filled and nothing is saved. */
function readCardText(text){const t=String(text||'').replace(/\r/g,'');
 const grab=re=>{const m=t.match(re);return m?String(m[1]).trim():''};
 const date=parseDate(grab(/date\s*[:\-]?\s*(\d{4}-\d{2}-\d{2}|\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{4}|\d{1,2}\s+[A-Za-z]{3,9}\s+\d{4})/i));
 let score=grab(/score\s*[:\-]\s*(\d{1,4})\b/i),max=grab(/(?:max(?:imum)?|out of)\s*[:\-]\s*(\d{2,4})\b/i);
 const slash=t.match(/\b(\d{2,4})\s*\/\s*(\d{2,4})\b/);
 if(!score&&slash)score=slash[1];
 if(!max&&slash)max=slash[2];
 const sc=parseInt(score,10),mx=max?parseInt(max,10):null;
 if(!(sc>0&&sc<=1440)||(mx!=null&&(mx<sc||mx>1440)))return {ok:false};
 const round=grab(/round\s*[:\-]\s*([^\n]+)/i).replace(/\s+/g,' ').slice(0,80);
 const event=grab(/event\s*[:\-]\s*([^\n]+)/i).replace(/\s+/g,' ').slice(0,80);
 const tens=grab(/\b10s?\s*[:\-]\s*(\d{1,3})\b/i),xs=grab(/\bxs\s*[:\-]\s*(\d{1,3})\b/i);
 return {ok:true,date,round,event,score:sc,max:mx,tens:tens===''?null:parseInt(tens,10),xs:xs===''?null:parseInt(xs,10)}}
function pbWords(round,score){let pb=null;try{pb=round&&window.bsCurrentPb?bsCurrentPb(round):null}catch(e){}
 if(!round||!score)return 'Check the score, then save. Nothing is saved until you do.';
 if(!pb)return 'No personal best for this round yet. Check the score, then save. Nothing is saved until you do.';
 const d=score-+pb.score;
 const how=d>0?d+' above your PB of '+pb.score:d<0?(-d)+' below your PB of '+pb.score:'level with your PB of '+pb.score;
 return how+'. Check it, then save. Nothing is saved until you do.'}
let ocrBusy=false;
function loadOcr(){if(window.Tesseract)return Promise.resolve();return new Promise((res,rej)=>{const s=document.createElement('script');s.src='vendor/ocr/tesseract.min.js';s.onload=()=>res();s.onerror=()=>rej(new Error('ocr'));document.head.appendChild(s)})}
async function readScorePhoto(file){await loadOcr();const worker=await Tesseract.createWorker('eng',1,{workerPath:'vendor/ocr/worker.min.js',corePath:'vendor/ocr/tesseract-core-simd-lstm.wasm.js',langPath:'vendor/ocr',gzip:true});
 try{const r=await worker.recognize(file);return readCardText(r&&r.data&&r.data.text)}finally{try{await worker.terminate()}catch(e){}}}
function parseScore(s){const n=parseInt(String(s||'').replace(/[^\d]/g,''),10);return n>0?n:0}
let grid=[],header=false,map={round:0,date:1,score:2,event:3};
let diaryText='',diaryRows=[],diarySkipped=0,diaryMsg='';
function applyMap(){const rows=header?grid.slice(1):grid;
 return rows.map(r=>{const g=i=>i<0?'':(r[i]||'');return {round:g(map.round).trim(),date:parseDate(g(map.date)),score:parseScore(g(map.score)),event:g(map.event).trim()}}).filter(r=>r.round||r.date||r.score||r.event)}
function taken(date,round,score){
 const same=(d,rd,sc)=>d===date && String(rd)===String(round) && +sc===+score;
 if((S.sessions||[]).some(s=>!s.sample&&s.ends&&same(s.date,s.round,typeof total=='function'?total(s):s.score)))return 'scored';
 if(typeof findReal=='function'&&findReal(S.profile||'').some(r=>same(typeof normDate=='function'?normDate(r.date):r.date,r.round,r.score)))return 'scored';
 if(imports().some(r=>r.imported&&same(r.date,r.round,r.score)))return 'already';
 if(officials().some(r=>r.official&&same(r.date,r.round,r.score)))return 'already';
 return ''}
function optNum(v){const t=String(v??'').trim();if(t==='')return null;const n=parseInt(t.replace(/[^\d]/g,''),10);return n>=0&&String(n)===t?n:null}
function parseEnds(text){return String(text||'').split(/\n/).map(l=>l.trim()).filter(Boolean).map(l=>l.split(/[\s,]+/).map(a=>a.toUpperCase()).filter(a=>a==='X'||a==='M'||/^\d+$/.test(a))).filter(e=>e.length)}
function endsTotal(ends){return ends.reduce((t,e)=>t+e.reduce((s,a)=>s+(a==='X'?10:a==='M'?0:+a),0),0)}
let offMsg='',shotFile=null;
function syncOn(){try{return localStorage.getItem('scoretool.flag.waSync')==='1'}catch(e){return false}}
function dropShot(){shotFile=null;const prev=$('#ofshotprev'),inp=$('#ofshot');if(prev&&prev._url){URL.revokeObjectURL(prev._url);prev._url='';prev.removeAttribute('src');prev.hidden=true}if(inp)inp.value=''}
function keepPhoto(id,file){return new Promise(res=>{const img=new Image(),url=URL.createObjectURL(file);img.onload=()=>{const m=800,s=Math.min(1,m/Math.max(img.width,img.height,1)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*s));c.height=Math.max(1,Math.round(img.height*s));c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);
  c.toBlob(blob=>{if(!blob){res(false);return}
   const put=db=>{try{const tx=db.transaction('photos','readwrite');tx.objectStore('photos').put(blob,who()+':'+id);tx.oncomplete=()=>res(true);tx.onerror=()=>res(false)}catch(e){res(false)}};
   const req=indexedDB.open('scoretool-official-photos');req.onerror=()=>res(false);req.onblocked=()=>res(false);
   req.onsuccess=()=>{const db=req.result;if(db.objectStoreNames.contains('photos')){put(db);return}const v=db.version+1;db.close();const req2=indexedDB.open('scoretool-official-photos',v);req2.onerror=()=>res(false);
    req2.onupgradeneeded=()=>{if(!req2.result.objectStoreNames.contains('photos'))req2.result.createObjectStore('photos')};req2.onsuccess=()=>put(req2.result)}},'image/jpeg',0.7)};img.onerror=()=>{URL.revokeObjectURL(url);res(false)};img.src=url})}
function view(){
 const o=src(),other=o.body==='other',aa=!!AA_IDS[o.body],url=httpUrl(o.url);
 const cols=grid[0]?grid[0].map((_,i)=>header?grid[0][i]||('Column '+(i+1)):'Column '+(i+1)):[];
 const sel=(k,label)=>{const opts=cols.map((c,i)=>`<option value="${i}" ${map[k]===i?'selected':''}>${h(c)}</option>`).join('');
  return `<label for="rm_${k}">${label}</label><select id="rm_${k}"><option value="-1" ${map[k]<0?'selected':''}>Not in this table</option>${opts}</select>`};
 const prev=grid.length?applyMap():[];
 const show=prev.slice(0,8);
 app.innerHTML=`<div class="labbar"><button class="btn ghost labback" type="button" id="rsback">‹ Tools</button><h1>My results source</h1></div>
 <div class="card" id="rssource"><span class="kicker">My results source</span><h2 style="margin:2px 0 8px">Where your results live</h2>
 <p class="small" style="margin:0 0 8px">Kept on this phone only. Not sent anywhere. Nothing is fetched from the organisation.</p>
 <label for="rsbody">Results region</label>
 <select id="rsbody">${BODIES.map(b=>`<option value="${b[0]}" ${o.body===b[0]?'selected':''}>${h(b[1])}</option>`).join('')}</select>
 ${other?`<label for="rsname">Organisation or country</label>
 <input id="rsname" autocomplete="off" value="${h(o.name||'')}" placeholder="Name of the organisation or country">
 <label for="rsurl">Results website</label>
 <input id="rsurl" type="url" inputmode="url" autocomplete="off" value="${h(o.url||'')}" placeholder="https://…">
 <p class="small muted" style="margin:4px 0 0">Type the name and the results website. It is kept on this phone. Open my results opens that page.</p>`:aa?`<p class="small muted" style="margin:4px 0 0">Pick ${h(bodyOf(o.body)[1])} in Archer's Diary and use your AA member number.</p>`:`<p class="small muted" style="margin:4px 0 0">Opens the World Archery results list.</p>`}
 <label for="rsmem">${aa?'AA member number':'Member / archer ID'}</label>
 <input id="rsmem" autocomplete="off" value="${h(o.member||'')}" placeholder="${aa?'Your AA member number':'Your member or archer number'}">
 <button class="btn full" id="rssave" type="button" style="margin-top:10px">Save</button>
 <p class="small" id="rssaved" style="margin:6px 0 0"></p>
 <a class="btn alt full" id="rsopen" href="${h(url||'#')}" target="_blank" rel="noopener" ${url?'':'aria-disabled="true" style="pointer-events:none;opacity:.55"'}>Open my results</a>
 <p class="small muted" style="margin:6px 0 0">${aa?`Opens Archer's Diary. Pick ${h(bodyOf(o.body)[1])} in the region drop-down and use your AA member number. ScoreTool does not sign in or read the page.`:other?`Opens the website you saved. ScoreTool does not sign in or read the page.`:`Opens the World Archery results list. ScoreTool does not sign in or read the page.`}</p>
 </div>
 <div class="card" id="rsdiary"><span class="kicker">Archer's Diary</span><h2 style="margin:2px 0 8px">Paste my results</h2>
 <p class="small" style="margin:0 0 8px">Opens Bests in a new tab. You copy the table and paste it here. ScoreTool does not sign in and does not read that page.</p>
 <a class="btn alt full" id="rsdiaryopen" href="${DIARY_URL}" target="_blank" rel="noopener">Open my Archer's Diary results</a>
 ${o.member?`<p class="small" style="margin:10px 0 0">Your AA number, kept on this phone. Copy it into the search on that page.</p>
 <div class="row" style="gap:8px;align-items:center;margin-top:6px"><b id="rsaa" style="flex:1;min-width:0;word-break:break-all">${h(o.member)}</b><button class="btn ghost" id="rscopy" type="button">Copy</button></div>
 <p class="small" id="rscopynote" style="margin:6px 0 0"></p>`:'<p class="small muted" style="margin:8px 0 0">Save your AA number above and it can be copied from here. It stays on this phone.</p>'}
 <label for="rsdiarypaste" style="margin-top:10px">Paste my results</label>
 <textarea id="rsdiarypaste" rows="5" placeholder="Paste the results table from Archer's Diary">${h(diaryText)}</textarea>
 <button class="btn ghost" id="rsdiaryread" type="button">Read the paste</button>
 ${diaryRows.length?`<h3 style="margin:12px 0 6px">Preview</h3>
 <table class="labtbl" id="rsdiarypreview"><thead><tr><th>Discipline</th><th>Round</th><th>Division</th><th>Score</th><th>Date</th><th>Event</th></tr></thead><tbody>
 ${diaryRows.slice(0,8).map(r=>`<tr><td>${h(r.discipline||'—')}</td><td>${h(r.round)}</td><td>${h(r.division||'—')}</td><td>${r.score}</td><td>${h(r.date||'—')}</td><td>${h(r.event||'—')}</td></tr>`).join('')}</tbody></table>
 <p class="small muted">${diaryRows.length} best${diaryRows.length==1?'':'s'}${diaryRows.length>8?`, first 8 shown`:''}.${diarySkipped?` ${diarySkipped} line${diarySkipped==1?'':'s'} left out.`:''} Confirm replaces the bests you pasted before. It does not add a second copy.</p>
 <button class="btn alt full" id="rsdiaryconfirm" type="button">Confirm import</button>`:diaryText?`<p class="small" id="rsdiaryempty" style="margin:8px 0 0">No results found in that paste. Copy the bests table: discipline, round, division, score, date and event.</p>`:''}
 <p class="small" id="rsdiarydone" style="margin:6px 0 0">${h(diaryMsg)}</p>
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
 </div>
 <div class="card" id="rsofficial"><span class="kicker">Official result</span><h2 style="margin:2px 0 8px">Add an official result</h2>
 <p class="small" style="margin:0 0 8px">A finished official round, kept on this phone. It counts for personal bests. A round you already scored is left as it is.</p>
 <label for="ofdate">Date</label><input id="ofdate" type="date">
 <label for="ofevent">Event</label><input id="ofevent" autocomplete="off" placeholder="Event name">
 <label for="ofround">Round</label><select id="ofround"><option value="">Choose a round, or type one below</option>${(typeof ROUNDS=='object'?Object.keys(ROUNDS):[]).map(n=>`<option>${h(n)}</option>`).join('')}</select>
 <label for="ofroundx">Round name</label><input id="ofroundx" autocomplete="off" placeholder="Filled from the list, or type a round">
 <label for="ofscore">Score</label><input id="ofscore" inputmode="numeric" autocomplete="off">
 <label for="ofmax">Maximum, if you know it</label><input id="ofmax" inputmode="numeric" autocomplete="off" placeholder="Optional">
 <label for="oftens">10s, if you know them</label><input id="oftens" inputmode="numeric" autocomplete="off" placeholder="Optional">
 <label for="ofxs">Xs, if you know them</label><input id="ofxs" inputmode="numeric" autocomplete="off" placeholder="Optional">
 <label for="ofends">Ends, if you have them</label><textarea id="ofends" rows="3" placeholder="One end a line, arrows separated by spaces. Optional."></textarea>
 <p class="small" id="ofpb" style="margin:6px 0 0"></p>
 <label for="ofshot">Photo of a scorecard, or a screenshot</label>
 <input id="ofshot" type="file" accept="image/*">
 <p class="small muted" id="ofshotnote" style="margin:4px 0 0">The picture is read into this form. Check the score, then save. The picture is deleted once it has been read. It is not kept on this phone.</p>
 <img id="ofshotprev" alt="Your scorecard" hidden style="max-width:100%;margin-top:8px;border-radius:8px">
 <button class="btn full" id="ofsave" type="button" style="margin-top:10px">Save official result</button>
 <p class="small" id="ofnote" style="margin:6px 0 0">${h(offMsg)}</p>
 </div>
 ${(typeof tierHas!='function'||tierHas('plus'))?`<div class="card" id="rssyncard"><span class="kicker">Sync</span><h2 style="margin:2px 0 8px">Sync now</h2>
 <button class="btn" id="rssync" type="button" disabled aria-disabled="true" style="background:#4b5563;color:#d1d5db;cursor:not-allowed;opacity:1">Sync now</button>
 <p class="small" id="rssyncnote" style="margin:8px 0 0">Coming once Archery Australia, World Archery or ianseo approve data sharing. Nothing is fetched until then.</p>
 <button class="btn ghost" id="rssyncpaste" type="button" style="margin-top:8px">Paste a table or a CSV</button>
 </div>`:''}`;
 $('#rsback').onclick=()=>nav('tools');
 const grab=()=>{const b=$('#rsbody').value,mem=$('#rsmem').value.trim();
  if(b==='other')return {body:'other',url:($('#rsurl')&&$('#rsurl').value.trim())||'',member:mem,name:($('#rsname')&&$('#rsname').value.trim())||''};
  const known=bodyOf(b);return {body:known[0],url:known[2],member:mem,name:''}};
 $('#rsbody').onchange=()=>{const mem=$('#rsmem').value.trim(),b=$('#rsbody').value;
  const g=b==='other'?{body:'other',url:'',member:mem,name:''}:{body:b,url:bodyOf(b)[2],member:mem,name:''};
  localStorage.setItem(SKEY(),JSON.stringify(g));view()};
 $('#rssave').onclick=()=>{const g=grab();if(g.body==='other'&&g.url&&!httpUrl(g.url)){$('#rssaved').textContent='The website needs to start with https://';return}
  localStorage.setItem(SKEY(),JSON.stringify(g));$('#rssaved').textContent='Saved on this phone.';view()};
 const copy=$('#rscopy');if(copy)copy.onclick=()=>{const t=($('#rsaa')&&$('#rsaa').textContent)||'';const note=$('#rscopynote');
  const say=m=>{if(note)note.textContent=m};if(!t){say('Nothing to copy.');return}
  const done=()=>say('Copied. Paste it into the search on Archer\'s Diary.');
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(t).then(done).catch(()=>{const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(e){say('Select the number and copy it yourself.')}ta.remove()})}
  else {const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');done()}catch(e){say('Select the number and copy it yourself.')}ta.remove()}};
 const box=$('#rsdiarypaste');if(box)box.oninput=()=>{diaryText=box.value};
 $('#rsdiaryread')&&($('#rsdiaryread').onclick=()=>{diaryText=($('#rsdiarypaste')&&$('#rsdiarypaste').value)||'';
  const parsed=window.parseDiaryPaste?parseDiaryPaste(diaryText):{rows:[],skipped:0};diaryRows=(parsed.rows||[]).filter(r=>r.date);diarySkipped=(parsed.skipped||0)+(parsed.rows||[]).length-diaryRows.length;
  diaryMsg=diaryRows.length?'Check the preview, then confirm. Nothing is saved until you do.':'';view()});
 const confirm=$('#rsdiaryconfirm');if(confirm)confirm.onclick=()=>{
  const fresh=[];const seen={};diaryRows.forEach(r=>{if(!r.round||!r.date||!r.score)return;const k=r.date+'|'+r.round.toLowerCase()+'|'+r.score+'|'+(r.division||'').toLowerCase();if(seen[k])return;seen[k]=1;
   fresh.push({id:'diary-'+fresh.length,round:r.round,date:r.date,score:r.score,event:r.event||'',division:r.division||'',discipline:r.discipline||'',imported:true,diary:true})});
  const keep=imports().filter(r=>!r.diary);localStorage.setItem(IKEY(),JSON.stringify(keep.concat(fresh)));
  diaryMsg=`Saved ${fresh.length} best${fresh.length==1?'':'s'} on this phone. Pasting again replaces these, and does not add a second copy. They show on personal bests under the bow in the division.`;
  diaryRows=[];view()};
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
  }}
 const or=$('#ofround');if(or)or.onchange=()=>{if(or.value)$('#ofroundx').value=or.value;pbLine()};
 const touch=()=>pbLine();
 ['ofroundx','ofscore'].forEach(id=>{const el=$('#'+id);if(el)el.oninput=touch});
 pbLine();
 const shot=$('#ofshot');if(shot)shot.onchange=async()=>{const file=shot.files&&shot.files[0]||null;shotFile=null;const prev=$('#ofshotprev');if(prev&&prev._url){URL.revokeObjectURL(prev._url);prev._url=''}if(!file){if(prev){prev.hidden=true;prev.removeAttribute('src')}return}
  if(prev){prev._url=URL.createObjectURL(file);prev.src=prev._url;prev.hidden=false}
  const say=t=>{offMsg=t;const n=$('#ofnote');if(n)n.textContent=t};
  if(ocrBusy)return;ocrBusy=true;say('Reading the picture…');
  let got=null;try{got=await readScorePhoto(file)}catch(e){got=null}
  ocrBusy=false;
  if(prev&&prev._url){URL.revokeObjectURL(prev._url);prev._url='';prev.removeAttribute('src');prev.hidden=true}
  shot.value='';
  if(!got||!got.ok){say('Could not read a score from that picture. Type it in. Nothing was saved.');return}
  if(got.date&&$('#ofdate'))$('#ofdate').value=got.date;
  if(got.event&&$('#ofevent'))$('#ofevent').value=got.event;
  if(got.round&&$('#ofroundx'))$('#ofroundx').value=got.round;
  if($('#ofscore'))$('#ofscore').value=String(got.score);
  if($('#ofmax')&&got.max!=null)$('#ofmax').value=String(got.max);
  if($('#oftens')&&got.tens!=null)$('#oftens').value=String(got.tens);
  if($('#ofxs')&&got.xs!=null)$('#ofxs').value=String(got.xs);
  pbLine();
  say('Read from the picture. Check it, then save. The picture was not kept.');
 };
 function pbLine(){const el=$('#ofpb');if(!el)return;const round=(($('#ofroundx')&&$('#ofroundx').value)||($('#ofround')&&$('#ofround').value)||'').trim();const score=parseScore($('#ofscore')&&$('#ofscore').value);el.textContent=pbWords(round,score)}
 const os=$('#ofsave');if(os)os.onclick=async()=>{
  const date=$('#ofdate').value,event=$('#ofevent').value.trim();
  let round=($('#ofroundx').value||$('#ofround').value).trim();
  const score=parseScore($('#ofscore').value),max=optNum($('#ofmax').value),tens=optNum($('#oftens').value),xs=optNum($('#ofxs').value);
  const ends=parseEnds($('#ofends').value);
  const say=t=>{offMsg=t;const n=$('#ofnote');if(n)n.textContent=t};
  if(!date||!round||!score){say('Date, round and score are needed.');return}
  if((($('#ofmax').value||'').trim()&&max==null)||(($('#oftens').value||'').trim()&&tens==null)||(($('#ofxs').value||'').trim()&&xs==null)){say('Maximum, 10s and Xs need a whole number, or leave them blank.');return}
  if(ends.length&&endsTotal(ends)!==score){say(`Those ends add up to ${endsTotal(ends)}, not ${score}. Fix them, or clear the ends.`);return}
  if(taken(date,round,score)){say('That round is already scored on this phone. It was left as it is.');return}
  const id='off-'+Date.now();
  const row={id,date,event,round,score,max,tens,xs,ends,official:true,finished:true};
  const keep=officials();keep.push(row);
  localStorage.setItem(OKEY(),JSON.stringify(keep));
  dropShot();
  say('Saved on this phone as an official result. The picture was not kept.');
  pbLine();
 };
 const sp=$('#rssyncpaste');if(sp)sp.onclick=()=>{const box=$('#rsimport');if(box)box.scrollIntoView({block:'start'})};
}
E.lab_results=view;
})();
