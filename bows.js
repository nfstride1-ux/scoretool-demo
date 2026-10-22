/* My bows (22 Oct 2026, Nathe). My archery > My bows. Each bow setup (the existing Setups & sight marks list, S.bows) can carry
   its make, model, year and specs. Specs come only from the maker's own published page (data/bow_specs.json, cited per bow);
   anything not published is left blank for the archer to type. Stored data: specs go under the NEW key S.bowSpec[setupId];
   existing setups, sessions and sight marks are never rewritten (a new bow adds a new setup, as '+ New bow setup' does).
   Picking a saved bow fills IBO, draw weight and draw length in the Arrow chooser and Calculators (the archer can still
   override them), and new tuning sessions save a snapshot of the chosen bow (t.bowSpec). Old sessions are untouched. */
(function(){
const E=window.EXTRA_VIEWS=window.EXTRA_VIEWS||{};
const h=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=n=>(window.icon&&window.icon(n))||'';
let LIST=null,SKIP=[];
fetch('data/bow_specs.json').then(r=>r.json()).then(j=>{LIST=j.bows||[];SKIP=j.skipped||[];if(typeof view!='undefined'&&view=='lab_mybows')render()}).catch(()=>{LIST=[]});
const specs=()=>(S.bowSpec=S.bowSpec||{});
const mine=()=>(typeof myBows=='function'?myBows():[]);
const withSpec=()=>mine().filter(b=>specs()[b.id]);
const bname=(b,s)=>s&&(s.make||s.model)?[s.make,s.model].filter(Boolean).join(' '):b.name;
const fnum=v=>{const x=parseFloat(String(v??'').replace(',','.'));return isFinite(x)?x:NaN};
const sum=s=>[s.type=='recurve'?(s.limbLb?s.limbLb+' lb limbs':''):(s.speed?(s.kind||'IBO')+' '+s.speed+' fps':''),s.dw?s.dw+' lb':'',s.dl?s.dl+'"':''].filter(Boolean).join(' · ')||'no figures yet';
window.bowSnap=id=>{const b=mine().find(x=>x.id==id),s=b&&specs()[id];if(!s)return null;
 return{setup:id,name:bname(b,s),type:s.type||'compound',make:s.make||'',model:s.model||'',year:s.year||'',speed:s.speed||'',kind:s.kind||'IBO',bh:s.bh||'',ata:s.ata||'',dw:s.dw||'',dl:s.dl||'',lo:s.lo||'',limbLb:s.limbLb||'',limbLen:s.limbLen||'',url:s.url||''}};
/* bows the archer has already named (setup names, setup diary, tuning sessions) that are on the list and have no specs yet */
function named(){if(!LIST)return[];const me=S.profile,txt=[...mine().filter(b=>!specs()[b.id]).map(b=>b.name),...(S.setup||[]).filter(x=>x.archer==me).map(x=>x.bow),...(S.tune||[]).filter(x=>x.archer==me).map(x=>x.bowName)].filter(Boolean).map(x=>String(x).toLowerCase());
 const fams={};LIST.forEach(x=>{const f=x.fam.toLowerCase();if(txt.some(t=>t.includes(f)))(fams[x.make+' '+x.fam]=fams[x.make+' '+x.fam]||[]).push(x)});
 return Object.entries(fams).filter(([k,L])=>!withSpec().some(b=>L.some(x=>x.id==specs()[b.id].specId)))}
const fromList=x=>({type:'compound',make:x.make,model:x.model,year:x.year||'',specId:x.id,speed:x.speed?String(x.speed):'',kind:x.speedKind||'IBO',bh:x.bh?String(x.bh):'',ata:x.ata?String(x.ata):'',lo:x.lo||'',dw:'',dl:'',src:x.src,url:x.url,dlRange:x.dlRange||'',dwRange:x.dwRange||''});
function addBow(s,famName){S.bowSel=S.bowSel||{};/* attach to the setup that already names this bow if it has no specs, else add a new setup */
 const f=(famName||'').toLowerCase();let b=f&&mine().find(x=>!specs()[x.id]&&String(x.name).toLowerCase().includes(f));
 if(!b){b={id:'b'+Date.now(),archer:S.profile,name:[s.make,s.model].filter(Boolean).join(' ')||'My bow',extra:[],marks:{}};S.bows=S.bows||[];S.bows.push(b);if(!S.bowSel[S.profile])S.bowSel[S.profile]=b.id}
 specs()[b.id]=s;save();return b.id}
let EDIT=null;/* form state in memory: {id|null, s} */
const F=(k,l,u,ph)=>`<label for="mb_${k}">${l}${u?` <span class="muted small">(${u})</span>`:''}</label><input id="mb_${k}" data-f="${k}" ${['make','model','lo','riser','limbs'].includes(k)?'':'inputmode="decimal"'} value="${h(EDIT.s[k]??'')}" placeholder="${h(ph||'')}">`;
function form(){const s=EDIT.s,rec=s.type=='recurve',L=(LIST||[]);const mk=[...new Set(L.map(x=>x.make))];
 return`<div class="card" id="mbform"><span class="kicker">${EDIT.id?'Edit bow':'Add a bow'}</span>
 <div class="labseg" role="group" aria-label="Bow type"><button type="button" data-ty="compound" aria-pressed="${!rec}">Compound</button><button type="button" data-ty="recurve" aria-pressed="${rec}">Recurve or barebow</button></div>
 ${rec?'':`<label for="mb_pick">Pick from the list</label><select id="mb_pick"><option value="">Other, I'll type it in</option>${mk.map(m=>`<optgroup label="${h(m)}">${L.filter(x=>x.make==m).map(x=>`<option value="${x.id}"${s.specId==x.id?' selected':''}>${h(x.make+' '+x.model)}${x.year?' ('+x.year+')':''}</option>`).join('')}</optgroup>`).join('')}</select>`}
 ${s.url&&!rec?`<p class="small muted" style="margin:6px 0">Specs from <a href="${h(s.url)}" target="_blank" rel="noopener">${h(s.src||'the maker')}</a>. Blank boxes weren't published there: type your own.</p>`:''}
 ${rec?F('riser','Riser','make and model','e.g. Hoyt Formula Xi')+F('limbs','Limbs','make and model','e.g. Uukha VX1000')+F('limbLb','Limb poundage','lb on the limbs','e.g. 38')+F('limbLen','Limb length','e.g. long, medium or inches','')+F('dw','Draw weight on your fingers','lb','e.g. 40')+F('dl','Draw length','inches','e.g. 28')
 :F('make','Make','','e.g. Hoyt')+F('model','Model','','e.g. Concept X 40')+F('year','Year','','e.g. 2025')
  +`<label for="mb_speed">Speed rating <span class="muted small">(fps)</span></label><div class="row" style="gap:6px"><input id="mb_speed" data-f="speed" inputmode="decimal" value="${h(s.speed||'')}" style="flex:1"><select id="mb_kind" aria-label="Speed standard" style="width:90px"><option${s.kind!='ATA'?' selected':''}>IBO</option><option${s.kind=='ATA'?' selected':''}>ATA</option></select></div>${s.kind=='ATA'?'<p class="hint">Hoyt publish ATA speed (350 gr, 70 lb, 30"), which reads lower than IBO. It is used as the IBO figure in the Arrow chooser and Calculators.</p>':''}`
  +F('bh','Brace height','inches')+F('ata','Axle-to-axle','inches')+F('dw','Your draw weight','lb',s.dwRange?'published: '+s.dwRange:'e.g. 60')+F('dl','Your draw length','inches',s.dlRange?'published: '+s.dlRange:'e.g. 29')+F('lo','Let-off','%','')}
 <div class="row" style="gap:8px;margin-top:10px"><button class="btn" id="mbsave">Save bow</button><button class="btn ghost" id="mbcancel">Cancel</button></div></div>`}
E.lab_mybows=function(){const L=withSpec(),N=named();
 app.innerHTML=`<div class="labbar"><button class="btn ghost labback" data-go="myarch">‹ My archery</button><h1>My bows</h1></div>
 ${N.map(([k,V])=>`<div class="card mbsug"><span class="kicker">From your setups</span><h2 style="margin:2px 0 8px">Add your ${h(k)}</h2><div class="row" style="gap:8px;flex-wrap:wrap">${V.map(x=>`<button class="btn" data-sug="${x.id}" data-fam="${h(x.fam)}">${V.length>1?h(x.model):'Add your '+h(k)}</button>`).join('')}</div><p class="small muted" style="margin:8px 0 0">One tap adds its published specs. You then add your own draw weight and length.</p></div>`).join('')}
 ${EDIT?form():''}
 <div class="card"><span class="kicker">Saved</span>${L.length?L.map(b=>{const s=specs()[b.id];return`<div class="mbrow" style="display:flex;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)"><span class="i" aria-hidden="true">${ic('bow')}</span><div style="flex:1"><b>${h(bname(b,s))}</b>${s.year?` <span class="muted small">${h(s.year)}</span>`:''}<br><span class="small muted">${h(sum(s))}</span>${s.url?`<br><a class="small" href="${h(s.url)}" target="_blank" rel="noopener">Specs source</a>`:''}</div><button class="btn ghost" data-ed="${b.id}" style="padding:6px 12px">Edit</button></div>`}).join('')
  :'<p class="muted">No bows yet.</p>'}
  ${EDIT?'':'<button class="btn alt full" id="mbadd" style="margin-top:10px">Add a bow</button>'}
  <p class="small muted" style="margin-top:8px">Each bow is one of your setups, so its sight marks stay in Setups &amp; sight marks. Pick it in the Arrow chooser, Calculators or a new tuning session to fill in its speed, draw weight and draw length.</p></div>
 ${SKIP.length?`<details class="small muted"><summary>Not on the list yet</summary><ul>${SKIP.map(x=>`<li>${h(x)}</li>`).join('')}</ul></details>`:''}`;
 app.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{EDIT=null;nav(b.dataset.go)});
 setTimeout(()=>document.querySelectorAll('#tabs button').forEach(b=>b.setAttribute('aria-current',b.dataset.v=='myarch')),0);
 app.querySelectorAll('[data-sug]').forEach(b=>b.onclick=()=>{const x=LIST.find(y=>y.id==b.dataset.sug);const id=addBow(fromList(x),b.dataset.fam);EDIT={id,s:{...specs()[id]}};render();const f=$('#mb_dw');if(f)f.focus()});
 app.querySelectorAll('[data-ed]').forEach(b=>b.onclick=()=>{EDIT={id:b.dataset.ed,s:{...specs()[b.dataset.ed]}};render()});
 const ad=$('#mbadd');if(ad)ad.onclick=()=>{EDIT={id:null,s:{type:'compound'}};render()};
 if(!EDIT)return;
 const grab=()=>app.querySelectorAll('[data-f]').forEach(i=>EDIT.s[i.dataset.f]=i.value.trim());
 app.querySelectorAll('[data-ty]').forEach(b=>b.onclick=()=>{grab();EDIT.s.type=b.dataset.ty;render()});
 const pk=$('#mb_pick');if(pk)pk.onchange=()=>{grab();const x=(LIST||[]).find(y=>y.id==pk.value);const keep={dw:EDIT.s.dw,dl:EDIT.s.dl};EDIT.s=x?{...fromList(x),...keep}:{type:'compound',...keep};render()};
 const kd=$('#mb_kind');if(kd)kd.onchange=()=>{grab();EDIT.s.kind=kd.value;render()};
 $('#mbcancel').onclick=()=>{EDIT=null;render()};
 $('#mbsave').onclick=()=>{grab();const s=EDIT.s;if(s.type=='recurve'){s.make=s.riser||'';s.model=s.limbs||''}
  if(EDIT.id){specs()[EDIT.id]=s;save()}else addBow(s,'');EDIT=null;render()}};

/* My archery menu: a My bows row after Setups & sight marks */
const _ma=E.myarch;if(_ma)E.myarch=function(){_ma();const g=app.querySelector('[data-go=lab_gear]');if(g&&!app.querySelector('[data-go=lab_mybows]')){
 g.insertAdjacentHTML('afterend',`<button class="labrow" data-go="lab_mybows"><span class="i" aria-hidden="true">${ic('bow')}</span><span><b>My bows</b><small>Make, model and specs for each bow, from the maker's page</small></span><span class="go" aria-hidden="true">›</span></button>`);
 app.querySelector('[data-go=lab_mybows]').onclick=()=>nav('lab_mybows')}};

/* a 'Saved bow' picker that fills boxes; the archer can still change any of them afterwards */
const picker=(id,sel,lbl)=>{const L=withSpec();if(!L.length)return`<p class="small muted" id="${id}w" style="margin:0 0 8px">Save your bow in <a href="#" data-mb="1">My archery › My bows</a> to fill these in.</p>`;
 return`<div id="${id}w" style="margin:0 0 8px"><label for="${id}">${lbl}</label><select id="${id}"><option value="">None, I'll type them</option>${L.map(b=>`<option value="${b.id}"${b.id==sel?' selected':''}>${h(bname(b,specs()[b.id]))}</option>`).join('')}</select></div>`};
const bindMb=()=>app.querySelectorAll('[data-mb]').forEach(a=>a.onclick=e=>{e.preventDefault();nav('lab_mybows')});
const filled=(s,keys)=>keys.filter(([k])=>s[k]).map(([,l])=>l);

/* Arrow chooser: writes only its own inputs (scoretool.arrowchooser.<tester>), the same boxes the archer types into */
const _ch=E.lab_chooser;if(_ch)E.lab_chooser=function(){_ch();const K='scoretool.arrowchooser.'+((typeof TESTER!='undefined'&&TESTER&&TESTER.id)||'guest');
 let R={};try{R=JSON.parse(localStorage.getItem(K)||'{}')||{}}catch(e){}
 const card=app.querySelector('.acf');if(!card)return;const k=card.querySelector('h2');
 k.insertAdjacentHTML('afterend',picker('ac_mybow',R.bowId,'Saved bow')+(window._mbNote?`<p class="lab-note" id="mbnote">${h(window._mbNote)}</p>`:''));window._mbNote=null;bindMb();
 const p=$('#ac_mybow');if(p)p.onchange=()=>{const s=bowSnap(p.value);R.bowId=p.value;
  if(s){R.bow=s.type=='compound'?'compound':(R.bow=='barebow'?'barebow':'recurve');if(s.dw)R.dw=s.dw;if(s.dl)R.dl=s.dl;if(s.type=='compound'&&s.speed)R.ibo=s.speed;
   const f=filled(s,s.type=='compound'?[['speed','IBO speed'],['dw','draw weight'],['dl','draw length']]:[['dw','draw weight'],['dl','draw length']]);
   window._mbNote=`From your ${s.name}: ${f.join(', ')||'nothing'} filled in${s.kind=='ATA'&&s.type=='compound'?' (ATA rating used as IBO)':''}. Change any box to override.`}
  localStorage.setItem(K,JSON.stringify(R));render()}};

/* Calculators: fills the speed card's IBO, draw length and draw weight (S.calc, as typing would) */
const _ca=E.lab_calc;if(_ca)E.lab_calc=function(){_ca();const C=S.calc||{};const first=app.querySelector('.labgrid2 .card .kicker');if(!first)return;
 first.insertAdjacentHTML('afterend',picker('c_mybow',C.bowId,'Saved bow'));bindMb();
 const p=$('#c_mybow');if(p)p.onchange=()=>{const s=bowSnap(p.value);C.bowId=p.value;if(s){if(s.type=='compound'&&s.speed)C.ibo=s.speed;if(s.dw)C.dw=s.dw;if(s.dl)C.dl=s.dl;C.spdOn=1}S.calc=C;save();render()}};

/* Tuning: new sessions only get a snapshot of the chosen bow */
const _op=E.lab_opt;if(_op)E.lab_opt=function(){if(typeof seedBows=='function')seedBows();_op();const go=$('#tgo');if(!go)return;const cb=typeof curBow=='function'&&curBow();
 go.insertAdjacentHTML('beforebegin',picker('t_mybow',cb&&specs()[cb.id]?cb.id:'','Bow specs for this session'));bindMb();
 const o=go.onclick;go.onclick=function(){const p=$('#t_mybow'),snap=p&&p.value?bowSnap(p.value):null;const n0=(S.tune||[]).length;o.apply(this,arguments);
  if(snap&&(S.tune||[]).length>n0){const t=S.tune[S.tune.length-1];if(t&&t.id==S._tuneId&&!t.bowSpec){t.bowSpec=snap;save();render()}}}};
})();
