/* Photo scoresheet for competitions. The photo stays on this phone (never uploaded or saved).
   On-device OCR (Tesseract.js, loaded only when asked) prefills arrows; the archer checks every value before saving. */
(function(){
const VALID=['X','10','9','8','7','6','5','4','3','2','1','M'];
function layoutFor(round){const d=typeof AA_ROUNDS!='undefined'&&AA_ROUNDS[round],ape=/indoor|18m|25m/i.test(round)?3:6,G=[];
 if(d&&d.r){d.r.forEach(p=>{const n=Math.round(p[0]/ape),dist=(+p[1])+'m';const last=G[G.length-1];if(last&&last.dist==dist)last.ends+=n;else G.push({dist,ends:n})})}
 else{const n=window.roundArrows&&roundArrows(round);if(n)G.push({dist:'',ends:Math.round(n/ape)})}
 return{ape,groups:G}}
window.applySheets=function(L){const SH=S.sheets||{};Object.values(SH).forEach(sh=>{const o=L.find(x=>normDate(x.date)==sh.date&&x.round==sh.round);const ends=sh.ends.map(e=>({dist:e.dist,arrows:e.arrows.slice(),flag:false}));
 if(o){if(!o.ends.length){o.ends=ends;o.sheet=true}}else L.push({key:sh.date+'|'+sh.round,date:sh.date,round:sh.round,event:(sh.event||'My scoresheet')+' · from my scoresheet',url:'#',ends,score:ends.reduce((t,e)=>t+endSum(e.arrows),0),division:sh.division||'',sheet:true})})};
window.sheetEnds=(date,round)=>{const sh=(S.sheets||{})[date+'|'+round];return sh?sh.ends:null};
let st=null;
window.openSheet=function(info){const lay=layoutFor(info.round);st={...info,lay,cells:[],ocr:{},photo:null};
 lay.groups.forEach(g=>{for(let i=0;i<g.ends;i++)st.cells.push({dist:g.dist,arrows:Array(lay.ape).fill('')})});
 const old=(S.sheets||{})[info.date+'|'+info.round];if(old)old.ends.forEach((e,i)=>{if(st.cells[i])st.cells[i].arrows=e.arrows.slice()});
 nav('sheet')};
const norm=v=>{v=String(v||'').trim().toUpperCase();if(v=='0')return'M';return VALID.includes(v)?v:null};
function sums(){let run=0;return st.cells.map(c=>{const a=c.arrows.map(norm);const ok=a.every(Boolean),t=a.reduce((s,x)=>s+(x?val(x):0),0);run+=t;return{ok,t,run}})}
function view(){if(!st){app.innerHTML='<div class="card">Pick a shoot first.</div>';return}
 const S2=sums(),filled=st.cells.every((c,i)=>S2[i].ok),tot=S2.length?S2[S2.length-1].run:0;
 let h=`<div class="card dark"><span class="kicker" style="color:#ffc629">Photo scoresheet</span><h2 style="margin:0">${esc(st.round)}</h2><p class="small muted" style="margin:4px 0">${esc(st.date)}${st.event?' · '+esc(st.event):''}${st.score?` · published total <b>${st.score}</b>`:''}</p>
 <button class="btn ghost" id="shback" style="padding:6px 12px;min-height:34px">‹ Back</button></div>`;
 if(!st.cells.length){app.innerHTML=h+'<div class="card"><p>This round isn\'t in the round list, so the grid can\'t be laid out.</p></div>';bind();return}
 h+=`<div class="card"><h3>1. Photo</h3><label class="btn full" style="text-align:center">📷 Take or choose a photo<input id="shf" type="file" accept="image/*" capture="environment" hidden></label>
 ${st.photo?`<img src="${st.photo}" alt="Your scoresheet photo" style="width:100%;border-radius:10px;margin-top:8px"><button class="btn alt full" id="shocr" style="margin-top:8px">🔎 Read arrows from photo</button>`:''}<p class="small muted" id="shmsg">${st.msg||'The photo stays on this phone. Reading is done on the phone and is a first guess: check every arrow.'}</p></div>
 <div class="card"><h3>2. Check every arrow</h3><p class="small muted" style="margin-top:0">Type X, 10–1 or M. <span style="background:#5b4a00;color:#ffe08a;padding:0 4px;border-radius:4px">Yellow</span> = read from the photo, not yet checked by you.</p>`;
 let gi=-1;st.cells.forEach((c,i)=>{if(i==0||c.dist!=st.cells[i-1].dist){gi++;h+=`<div style="margin:10px 0 4px;font-weight:800;color:#ffc629">${esc(c.dist||'Ends')}</div>`}
  h+=`<div style="display:grid;grid-template-columns:28px repeat(${st.lay.ape},1fr) 34px 40px;gap:3px;align-items:center;margin:2px 0"><span class="small muted">${i+1}</span>${c.arrows.map((a,j)=>`<input data-i="${i}" data-j="${j}" value="${esc(a)}" maxlength="2" autocapitalize="characters" autocomplete="off" aria-label="End ${i+1} arrow ${j+1}" style="padding:6px 0;text-align:center;font-weight:700;${st.ocr[i+'_'+j]?'background:#5b4a00;color:#ffe08a;':''}${a&&!norm(a)?'border:2px solid #ef4444;':''}">`).join('')}<b class="small" style="text-align:right">${S2[i].t}</b><span class="small muted" style="text-align:right">${S2[i].run}</span></div>`});
 const left=Object.keys(st.ocr).length;
 h+=`<div class="stats" style="grid-template-columns:1fr 1fr;margin-top:10px"><div class="stat"><b>${tot}</b>sheet total</div><div class="stat"><b>${st.score?(tot-st.score==0?'✓':(tot>st.score?'+':'')+(tot-st.score)):'–'}</b>vs published</div></div>
 ${st.score&&filled&&tot!=st.score?`<p class="small" style="color:#fca5a5">Your sheet adds up to ${tot}, but ${st.score} was published. Check the arrows before saving.</p>`:''}
 <label style="display:flex;gap:8px;align-items:center;margin-top:10px"><input type="checkbox" id="shok" style="width:auto"> I've checked every arrow against my scoresheet</label>
 <button class="btn full" id="shsave" style="margin-top:8px" ${filled?'':'disabled'}>Save scoresheet</button><p class="small muted" id="shwhy">${filled?(left?left+' arrow(s) still yellow: tap each to confirm, or tick the box after checking.':''):'Fill every arrow to save.'}</p></div>`;
 app.innerHTML=h;bind()}
function bind(){const b=$('#shback');if(b)b.onclick=()=>history.length>1&&window._sheetFrom?nav(window._sheetFrom):nav('stats');
 const f=$('#shf');if(f)f.onchange=()=>{const x=f.files&&f.files[0];if(!x)return;if(st.photo)URL.revokeObjectURL(st.photo);st.photo=URL.createObjectURL(x);st.file=x;st.msg='';view()};
 const o=$('#shocr');if(o)o.onclick=runOCR;
 app.querySelectorAll('input[data-i]').forEach(inp=>{inp.onfocus=()=>{const k=inp.dataset.i+'_'+inp.dataset.j;if(st.ocr[k]){delete st.ocr[k];inp.style.background='';inp.style.color=''}};
  inp.onchange=()=>{st.cells[+inp.dataset.i].arrows[+inp.dataset.j]=inp.value.trim().toUpperCase();const y=scrollY;view();scrollTo(0,y)}});
 const sv=$('#shsave');if(sv)sv.onclick=()=>{if(!$('#shok').checked){$('#shwhy').textContent='Tick "I\'ve checked every arrow" first. Nothing is saved until you do.';return}
  const ends=st.cells.map(c=>({dist:c.dist,arrows:c.arrows.map(norm)}));if(ends.some(e=>e.arrows.some(a=>!a)))return;
  S.sheets=S.sheets||{};S.sheets[st.date+'|'+st.round]={date:st.date,round:st.round,event:st.event||'',division:st.division||'',ends,saved:today(),checked:true};save();
  if(st.photo)URL.revokeObjectURL(st.photo);const back={date:st.date,round:st.round};st=null;
  const L=offRounds(),i=L.findIndex(x=>normDate(x.date)==back.date&&x.round==back.round);if(i>=0)window._o=i;nav('stats')}}
function loadTess(){return window.Tesseract?Promise.resolve():new Promise((ok,no)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';s.onload=ok;s.onerror=()=>no(new Error('Could not load the reader (offline?)'));document.head.appendChild(s)})}
async function runOCR(){const m=$('#shmsg');const say=t=>{st.msg=t;if(m)m.textContent=t};
 try{say('Loading the on-phone reader (first time only, about 3 MB)…');await loadTess();say('Reading the photo…');
  const w=await Tesseract.createWorker('eng');await w.setParameters({tessedit_char_whitelist:'0123456789XxMm ',tessedit_pageseg_mode:'6'});
  const {data}=await w.recognize(st.file);await w.terminate();
  const toks=[];(data.text||'').toUpperCase().split(/\n/).forEach(line=>line.split(/\s+/).forEach(t=>{if(/^(X|M|10|[1-9])$/.test(t))toks.push(t)}));
  let k=0,n=0;st.cells.forEach((c,i)=>c.arrows.forEach((a,j)=>{if(!a&&k<toks.length){c.arrows[j]=toks[k++];st.ocr[i+'_'+j]=1;n++}}));
  st.window=window._lastOCR={text:data.text,tokens:toks.length};
  say(n?`Read ${n} arrow value(s) from the photo (yellow). Check each one against your sheet; fix anything wrong and fill the rest.`:'Couldn\'t read arrow values from this photo. Type them in below.');view()}
 catch(e){say((e&&e.message||'Reading failed')+'. You can type the arrows in below.');}}
window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},{sheet:view});
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('[data-sheet]');if(!b)return;try{window._sheetFrom="stats";openSheet(JSON.parse(b.dataset.sheet))}catch(x){}});
/* Score tab: Add competition scoresheet */
const _sc=score;score=function(){_sc.apply(this,arguments);if(typeof cur!='undefined'&&cur)return;if($('#addsheet'))return;
 const L=offRounds().filter(o=>!o.ends.length),R=typeof AA_ROUNDS!='undefined'?Object.keys(AA_ROUNDS).sort():[];
 app.insertAdjacentHTML('afterbegin',`<div class="card" id="addsheet"><span class="kicker" style="color:#ffc629">Competitions</span><h3 style="margin:2px 0 6px">📷 Add competition scoresheet</h3><p class="small muted" style="margin-top:0">Photo your paper scoresheet, check the arrows, and get end-by-end stats for that shoot.</p>
 <label for="shpick">Shoot</label><select id="shpick">${L.map((o,i)=>`<option value="${i}">${esc(normDate(o.date))} · ${esc(o.round)} · ${o.score}</option>`).join('')}<option value="new">Another competition…</option></select>
 <div id="shnew" ${L.length?'hidden':''}><label for="shr">Round</label><select id="shr">${R.map(r=>`<option>${esc(r)}</option>`).join('')}</select><label for="shd">Date</label><input id="shd" type="date" value="${today()}"><label for="she">Event (optional)</label><input id="she" autocomplete="off"></div>
 <button class="btn full" id="shgo" style="margin-top:10px">Photo scoresheet</button></div>`);
 $('#shpick').onchange=e=>{$('#shnew').hidden=e.target.value!='new'};
 $('#shgo').onclick=()=>{const v=$('#shpick').value;window._sheetFrom='score';if(v=='new')openSheet({date:$('#shd').value,round:$('#shr').value,event:$('#she').value.trim()});else{const o=L[+v];openSheet({date:normDate(o.date),round:o.round,event:o.event||'',score:o.score,division:o.division||''})}}};
})();
