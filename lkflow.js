/* Lingkana scoring flow for the /test/ page: one job per screen, like a simple event scorer.
   Data, relay, codes and the scoring password stay in lingkana.js / league.js. */
(function(){
  const CLASSES=['Compound','Recurve','Barebow','Longbow'];
  const DIVS=['Open','Women','Men','Junior'];
  const ROUNDS=['Lancaster 660','150 warm-up (not scored)','Ladder shoot-up'];
  const CLAIM_MS=6*60*60*1000;

  const $id=id=>document.getElementById(id);
  const esc=s=>typeof h==='function'?h(s):String(s==null?'':s).replace(/[&<>"]/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));
  const me=()=>(typeof h2hMe==='function'&&h2hMe())||(typeof TESTER!=='undefined'&&TESTER&&TESTER.id)||'';
  const myName=()=>{try{return sessionStorage.getItem('scoretool.lk.scorer')||''}catch(e){return''}};
  const setMyName=n=>{try{sessionStorage.setItem('scoretool.lk.scorer',n)}catch(e){}};
  const appEl=()=>typeof app!=='undefined'?app:document.getElementById('app');

  function hideChrome(on){
    document.body.classList.toggle('lk-flow',!!on);
    window._lkFlow=!!on;
    const tabs=document.getElementById('tabs');
    if(tabs)tabs.hidden=!!on;
    const hd=document.querySelector('header.top');
    if(hd)hd.hidden=!!on;
  }
  function bar(left,right){
    return `<div class="lk-bar">${left||''}${right||''}</div>`;
  }
  function btn(id,lab,kind,extra){
    return `<button type="button" class="lk-btn ${kind||'green'}" id="${id}" ${extra||''}>${lab}</button>`;
  }
  function nightLabel(i){
    const d=LK_DATES[i], n=i+1;
    const rd=n===7?'150 warm-up (not scored), then ladder shoot-up for the top 12':LK_R;
    return `Night ${n} · ${typeof lkFmtD==='function'?lkFmtD(d):d} · ${rd}`;
  }
  function claimKey(lg,w){return (typeof lkNightKey==='function'&&lkNightKey(lg,w))||(LK_DATES[(w||1)-1]||'')}
  function claims(lg,w){
    const k=claimKey(lg,w), bag=((lg.claim||{})[k])||{}, now=Date.now(), out={};
    for(const id in bag){const c=bag[id];if(c&&c.by&&(now-(c.at||0))<CLAIM_MS)out[id]=c}
    return out;
  }
  function claimedByOther(lg,w,id){
    const c=claims(lg,w)[id], who=me();
    if(!c||!c.by||c.by===who)return null;
    return c;
  }
  function applyClaim(d,lg){
    if(!d||!lg||d.code!==lg.code||!d.night||!d.id)return false;
    lg.claim=lg.claim||{};lg.claim[d.night]=lg.claim[d.night]||{};
    const cur=lg.claim[d.night][d.id];
    if(d.on){
      if(cur&&cur.by&&cur.by!==d.by&&(cur.at||0)>=(d.at||0)&&(Date.now()-(cur.at||0))<CLAIM_MS)return false;
      lg.claim[d.night][d.id]={by:d.by,name:d.name||d.by,at:d.at||Date.now()};
      return true;
    }
    if(cur&&cur.by&&cur.by!==d.by&&(Date.now()-(cur.at||0))<CLAIM_MS)return false;
    delete lg.claim[d.night][d.id];
    return true;
  }
  function setClaim(lg,w,id,on){
    const k=claimKey(lg,w), who=me(), name=myName()||(typeof TESTER!=='undefined'&&TESTER&&TESTER.name)||who||'Scorer';
    lg.claim=lg.claim||{};lg.claim[k]=lg.claim[k]||{};
    const cur=lg.claim[k][id];
    if(on){
      if(cur&&cur.by&&cur.by!==who&&(Date.now()-(cur.at||0))<CLAIM_MS)return 'That archer is already selected on another phone.';
      lg.claim[k][id]={by:who,name,at:Date.now()};
    }else{
      if(cur&&cur.by&&cur.by!==who&&(Date.now()-(cur.at||0))<CLAIM_MS)return 'Another scorer has this archer.';
      delete lg.claim[k][id];
    }
    lg.claimt=Date.now();lg.dirty=1;
    if(typeof save==='function')save();
    try{
      if(typeof h2hPost==='function'&&typeof lgTopic==='function'){
        Promise.resolve(h2hPost(lgTopic(lg.code),{k:'lkclaim',code:lg.code,night:k,id,on:on?1:0,by:who,name,at:Date.now(),t:Date.now()})).catch(function(){});
      }
    }catch(e){}
    return '';
  }
  function mergeClaims(lg,d){
    if(!d||!d.claim||typeof d.claim!=='object')return false;
    let ch=false;
    lg.claim=lg.claim||{};
    for(const night in d.claim){
      const bag=d.claim[night];if(!bag||typeof bag!=='object')continue;
      lg.claim[night]=lg.claim[night]||{};
      for(const id in bag){
        const rec=bag[id];
        if(!rec){if(lg.claim[night][id]){delete lg.claim[night][id];ch=true}continue}
        const cur=lg.claim[night][id];
        if(rec.by){
          if(cur&&cur.by&&cur.by!==rec.by&&(cur.at||0)<=CLAIM_MS+Date.now()&&(cur.at||0)<(Date.now())&&(cur.at||0)<=(rec.at||0)&& (Date.now()-(cur.at||0))<CLAIM_MS && (cur.at||0)<=(rec.at||0) && (cur.at||0)<(rec.at||0)===false){
            /* first-claim wins if still fresh */
          }
          if(cur&&cur.by&&cur.by!==rec.by&&(Date.now()-(cur.at||0))<CLAIM_MS&&(cur.at||0)<=(rec.at||0)&& (cur.at||0)<(rec.at||0) ){
            /* incoming is later — keep earlier claim */
            continue;
          }
          if(cur&&cur.by&&cur.by!==rec.by&&(Date.now()-(cur.at||0))<CLAIM_MS&&(cur.at||0)<=(rec.at||0)){
            if((cur.at||0)<(rec.at||0))continue;
          }
          if(cur&&cur.by&&cur.by!==rec.by&&(Date.now()-(cur.at||0))<CLAIM_MS){
            if((cur.at||0)<=(rec.at||0))continue;
          }
          lg.claim[night][id]={by:rec.by,name:rec.name||rec.by,at:rec.at||0};
          ch=true;
        }
      }
    }
    return ch;
  }
  /* Cleaner first-claim-wins merge for a snapshot bag */
  function mergeClaimBag(lg,incoming){
    if(!incoming||typeof incoming!=='object')return false;
    let ch=false;
    lg.claim=lg.claim||{};
    for(const night in incoming){
      const bag=incoming[night];if(!bag||typeof bag!=='object')continue;
      lg.claim[night]=lg.claim[night]||{};
      for(const id in bag){
        const rec=bag[id], cur=lg.claim[night][id];
        if(!rec||!rec.by){
          if(cur&&(!cur.by||cur.by===((rec&&rec.by)||''))){delete lg.claim[night][id];ch=true}
          continue;
        }
        if(cur&&cur.by&&cur.by!==rec.by&&(Date.now()-(cur.at||0))<CLAIM_MS&&(cur.at||0)<=(rec.at||Date.now()))continue;
        if(!cur||(rec.at||0)>(cur.at||0)||cur.by!==rec.by){
          lg.claim[night][id]={by:rec.by,name:rec.name||rec.by,at:rec.at||Date.now()};
          ch=true;
        }
      }
    }
    return ch;
  }

  function signups(lg,w){
    if(typeof lkNightSignups==='function')return lkNightSignups(lg,w)||[];
    const k=claimKey(lg,w);
    return ((lg.reg||{})[k]||[]).slice();
  }
  function targetOf(rec,i){
    if(rec&&rec.target)return String(rec.target);
    return String(Math.floor(i/4)+1);
  }
  function grouped(list){
    const m={};
    list.forEach((rec,i)=>{const t=targetOf(rec,i);(m[t]=m[t]||[]).push(rec)});
    return Object.keys(m).sort((a,b)=>a.localeCompare(b,undefined,{numeric:true})).map(t=>({t,rows:m[t]}));
  }
  function nightOf(lg){
    const w=+(window._lkFlowNight||0);
    if(w>=1&&w<=LK_NIGHTS)return w;
    return Math.min(LK_NIGHTS, (typeof lgWeek==='function'?lgWeek(lg):1)||1);
  }
  function setNight(w){window._lkFlowNight=+w||1}

  function home(){
    const lg=typeof lkEnsure==='function'?lkEnsure():null;
    hideChrome(true);
    const el=appEl();if(!el)return;
    el.innerHTML=`<div class="lkf" id="lkhome">
      <div class="lk-home">
        ${btn('lklogin','Login to Event','green')}
        ${btn('lkqr','Login with QR Code','green')}
        ${btn('lkereg','Event Registration','grey')}
        ${btn('lkreview','Review Scoresheet','grey')}
      </div>
    </div>`;
    $id('lklogin').onclick=()=>login();
    $id('lkqr').onclick=()=>qrLogin();
    $id('lkereg').onclick=()=>regSearch();
    $id('lkreview').onclick=()=>review();
  }

  function login(){
    const lg=typeof lkEnsure==='function'?lkEnsure():null;
    hideChrome(true);
    const el=appEl();if(!el)return;
    const name=myName()||(typeof TESTER!=='undefined'&&TESTER&&TESTER.name)||'';
    const ev=lg?lg.name:LK_NAME;
    el.innerHTML=`<div class="lkf" id="lkloginpage">
      <h1>Login</h1>
      <label for="lkevent">Select Event</label>
      <select id="lkevent"><option value="${esc(LK_CODE)}" selected>${esc(ev)}</option></select>
      <label for="lkscorer">Scorer Full Name</label>
      <input id="lkscorer" type="text" maxlength="40" autocomplete="name" value="${esc(name)}">
      <label for="lkpw">Enter the Passcode</label>
      <input id="lkpw" type="password" autocomplete="current-password">
      <p class="lk-msg" id="lkpwmsg" role="alert"></p>
      ${typeof lkCanHost==='function'&&lg&&lkCanHost(lg)?`<button type="button" class="lk-host" id="lkhostpw">Host: change scoring password</button>`:''}
      ${bar('',btn('lkpwgo','Login','green'))}
    </div>`;
    const go=()=>{
      const n=($id('lkscorer').value||'').trim();
      const pw=$id('lkpw').value||'';
      const msg=$id('lkpwmsg');
      if(n.length<2){if(msg)msg.textContent='Type the scorer\'s full name.';return}
      setMyName(n);
      (typeof lkUnlock==='function'?lkUnlock(pw):Promise.resolve('')).then(m=>{
        if(m){if(msg)msg.textContent=m;return}
        selectArchers();
      });
    };
    $id('lkpwgo').onclick=go;
    $id('lkpw').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go()}};
    if($id('lkhostpw'))$id('lkhostpw').onclick=()=>hostPw();
  }

  function qrLogin(){
    hideChrome(true);
    const el=appEl();if(!el)return;
    el.innerHTML=`<div class="lkf" id="lkqrpage">
      <h1>Login with QR Code</h1>
      <div class="lk-qrbox">
        <p>Point the camera at the event QR, or choose a photo of it.</p>
        <input id="lkqrfile" type="file" accept="image/*" capture="environment">
        <video id="lkqrcam" playsinline style="display:none;width:100%;border-radius:10px;margin-top:10px"></video>
      </div>
      <p class="lk-msg" id="lkqrmsg" role="alert"></p>
      ${bar(btn('lkqrback','Back','grey'),btn('lkqrgo','Continue','green'))}
    </div>`;
    $id('lkqrback').onclick=()=>home();
    $id('lkqrgo').onclick=()=>login();
    const msg=$id('lkqrmsg');
    const accept=text=>{
      const s=String(text||'');
      if(/scoretool-demo\/test|LK-TEST26|LINGKN26|lk-register|lk-login/i.test(s)){login();return true}
      if(msg)msg.textContent='That code is not for this event.';
      return false;
    };
    const file=$id('lkqrfile');
    if(file)file.onchange=()=>{
      const f=file.files&&file.files[0];if(!f)return;
      if(window.BarcodeDetector){
        const det=new BarcodeDetector({formats:['qr_code']});
        createImageBitmap(f).then(bmp=>det.detect(bmp)).then(c=>{
          if(c&&c[0]&&c[0].rawValue)accept(c[0].rawValue);
          else if(msg)msg.textContent='No QR code found in that photo.';
        }).catch(()=>{if(msg)msg.textContent='Could not read that photo.'});
      }else if(msg)msg.textContent='This phone cannot read a QR here. Use Login to Event.';
    };
    const vid=$id('lkqrcam');
    if(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia&&window.BarcodeDetector&&vid){
      navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(stream=>{
        vid.srcObject=stream;vid.style.display='block';vid.play();
        const det=new BarcodeDetector({formats:['qr_code']});
        const tick=()=>{
          if(!document.body.contains(vid)){stream.getTracks().forEach(t=>t.stop());return}
          det.detect(vid).then(c=>{if(c&&c[0]&&c[0].rawValue){stream.getTracks().forEach(t=>t.stop());accept(c[0].rawValue)}else requestAnimationFrame(tick)}).catch(()=>requestAnimationFrame(tick));
        };
        requestAnimationFrame(tick);
      }).catch(()=>{});
    }
  }

  function hostPw(){
    const lg=typeof lkEnsure==='function'?lkEnsure():null;
    if(!lg||typeof lkCanHost!=='function'||!lkCanHost(lg)){login();return}
    hideChrome(true);
    const el=appEl();if(!el)return;
    el.innerHTML=`<div class="lkf" id="lkpwset">
      <h1>Scoring password</h1>
      <p>A default password is already set. Change it here and it is sent to the other scorers' phones. It is stored as a hash, never as the typed secret.</p>
      <label for="lkpwnew">Set or change the password</label>
      <input id="lkpwnew" type="password" autocomplete="new-password">
      <p class="lk-msg" id="lkpwsetmsg" role="alert">${lg.pwHash?'A scoring password is set.':''}</p>
      ${bar(btn('lkpwback','Back','grey'),btn('lkpwsave','Save password','green'))}
    </div>`;
    $id('lkpwback').onclick=()=>login();
    $id('lkpwsave').onclick=()=>{
      const pw=$id('lkpwnew').value||'';
      (typeof lkSetPassword==='function'?lkSetPassword(pw):Promise.resolve('Could not save.')).then(m=>{
        const e=$id('lkpwsetmsg');
        if(e)e.textContent=m||'Password saved.';
        if(!m)$id('lkpwnew').value='';
      });
    };
  }

  function selectArchers(){
    const lg=typeof lkEnsure==='function'?lkEnsure():null;
    if(!lg){home();return}
    if(typeof lkAuthed==='function'&&lg.pwHash&&!lkAuthed(lg)){login();return}
    hideChrome(true);
    const w=nightOf(lg);
    const list=signups(lg,w);
    const season=(lg.order||[]).map(id=>({id,name:(typeof lgName==='function'&&lgName(id))||id}));
    /* Show tonight's sign-ups; if none yet, show the season list so a scorer can still pick */
    const rows=list.length?list.map(r=>({id:r.id,name:r.name||((typeof lgName==='function'&&lgName(r.id))||r.id),target:r.target,round:r.round||LK_R})):season;
    const selected=(window._lkPicked||[]).filter(id=>rows.some(r=>r.id===id)&&!claimedByOther(lg,w,id));
    window._lkPicked=selected.slice();
    const groups=grouped(rows.map(r=>({...r,target:r.target})));
    const el=appEl();if(!el)return;
    const selHtml=selected.length?`<div class="lk-selbox" id="lkselections"><h3>Selections</h3><ul>${selected.map(id=>`<li>${esc((rows.find(r=>r.id===id)||{}).name||id)}</li>`).join('')}</ul></div>`:'';
    const body=groups.map(g=>{
      const items=g.rows.map(r=>{
        const other=claimedByOther(lg,w,r.id);
        const on=selected.includes(r.id);
        const lock=other||on;
        return `<label class="lk-row${other?' locked':''}" data-lkid="${esc(r.id)}">
          <span class="nm">${esc(r.name)}</span>
          <input type="checkbox" data-lkid="${esc(r.id)}" ${on?'checked':''} ${other?'disabled':''}>
          ${lock?`<span class="lk-padlock" title="${other?'Selected on another phone':'Selected'}">🔒</span>`:''}
        </label>`;
      }).join('');
      return `<div class="lk-tgt">Target ${esc(g.t)}</div>${items}`;
    }).join('')||'<p>No archers registered for this night yet.</p>';
    el.innerHTML=`<div class="lkf" id="lkselect">
      <h1>${esc(lg.name)} <span class="lk-count" id="lkcount">${rows.length} / ${Math.max(rows.length,(lg.order||[]).length)}</span></h1>
      <label for="lknight">Night</label>
      <select id="lknight">${LK_DATES.map((d,i)=>`<option value="${i+1}" ${i+1===w?'selected':''}>${esc(nightLabel(i))}</option>`).join('')}</select>
      ${selHtml}
      <div id="lkarchlist">${body}</div>
      ${btn('lkregarch','Register Archer','grey')}
      ${typeof lkCanHost==='function'&&lkCanHost(lg)?`<button type="button" class="lk-host" id="lkhostpw">Host: change scoring password</button>`:''}
      <p class="lk-msg" id="lkselmsg" role="alert"></p>
      ${bar(btn('lkbacklogin','Back / Login','grey'),btn('lkstart',`Start (${selected.length})`,'green'))}
    </div>`;
    $id('lknight').onchange=()=>{setNight(+$id('lknight').value);window._lkPicked=[];selectArchers()};
    $id('lkregarch').onclick=()=>regSearch();
    $id('lkbacklogin').onclick=()=>{window._lkPicked=[];login()};
    if($id('lkhostpw'))$id('lkhostpw').onclick=()=>hostPw();
    const toggle=id=>{
      const msg=$id('lkselmsg');
      const other=claimedByOther(lg,w,id);
      if(other){if(msg)msg.textContent=(other.name||'Another scorer')+' already has this archer.';return}
      const has=window._lkPicked.includes(id);
      if(!has&&window._lkPicked.length>=4){if(msg)msg.textContent='Pick up to 4 archers for this phone.';return}
      const err=setClaim(lg,w,id,!has);
      if(err){if(msg)msg.textContent=err;return}
      if(has)window._lkPicked=window._lkPicked.filter(x=>x!==id);
      else window._lkPicked.push(id);
      selectArchers();
    };
    el.querySelectorAll('[data-lkid]').forEach(box=>{
      if(box.tagName==='INPUT')box.onchange=()=>toggle(box.getAttribute('data-lkid'));
    });
    $id('lkstart').onclick=()=>{
      const ids=window._lkPicked||[];
      const msg=$id('lkselmsg');
      if(!ids.length){if(msg)msg.textContent='Tick the archers you are scoring.';return}
      const add=typeof lkSetGroups==='function'?lkSetGroups(w,[ids]):'';
      if(add){if(msg)msg.textContent=add;return}
      window._lkScoreIds=ids.slice();
      window._lkScoreI=0;
      window._lgE={code:lg.code,w:+w,ids:ids.slice()};
      window._lgAct=ids[0];
      window._lgHold=null;
      scoreScreen();
    };
  }

  function regSearch(){
    const lg=typeof lkEnsure==='function'?lkEnsure():null;
    hideChrome(true);
    const el=appEl();if(!el)return;
    const all=[];
    const seen={};
    (lg&&lg.order||[]).forEach(id=>{
      const n=(typeof lgName==='function'&&lgName(id))||id;
      all.push({id,name:n});seen[id]=1;seen[n.toLowerCase()]=1;
    });
    if(typeof TESTERS!=='undefined')TESTERS.forEach(t=>{
      if(!t||!t.id||seen[t.id]||seen[String(t.name||'').toLowerCase()])return;
      all.push({id:t.id,name:t.name||t.id});
    });
    el.innerHTML=`<div class="lkf" id="lkregsearch">
      <h1>Event Registration</h1>
      <label for="lkregq">Select Archer</label>
      <input id="lkregq" type="search" autocomplete="off" placeholder="Search name or number">
      <div class="lk-search-list" id="lkreghits"></div>
      <p class="lk-msg" id="lkregmsg" role="alert"></p>
      ${bar(btn('lkregback','Back','grey'),btn('lkregsel','Select','green'))}
    </div>`;
    let pick=null;
    const draw=q=>{
      const s=String(q||'').trim().toLowerCase();
      const hits=all.filter(a=>!s||a.name.toLowerCase().includes(s)||String(a.id).toLowerCase().includes(s)).slice(0,20);
      $id('lkreghits').innerHTML=hits.map(a=>`<button type="button" data-rid="${esc(a.id)}" class="${pick&&pick.id===a.id?'on':''}">${esc(a.name)}</button>`).join('')||'<p>No matching archer. You can still Select to add a new name.</p>';
      $id('lkreghits').querySelectorAll('[data-rid]').forEach(b=>b.onclick=()=>{
        pick=all.find(a=>a.id===b.getAttribute('data-rid'))||null;
        draw(s);
      });
    };
    draw('');
    $id('lkregq').oninput=()=>draw($id('lkregq').value);
    $id('lkregback').onclick=()=> (typeof lkAuthed==='function'&&lkEnsure()&&lkAuthed(lkEnsure())?selectArchers():home());
    $id('lkregsel').onclick=()=>{
      const typed=($id('lkregq').value||'').trim();
      if(!pick&&typed.length<2){$id('lkregmsg').textContent='Search and tap an archer, or type a new name.';return}
      window._lkRegPick=pick||{id:null,name:typed};
      regDetail();
    };
  }

  function regDetail(){
    const lg=typeof lkEnsure==='function'?lkEnsure():null;
    const pick=window._lkRegPick||{};
    hideChrome(true);
    const el=appEl();if(!el)return;
    const w=nightOf(lg||{});
    el.innerHTML=`<div class="lkf" id="lkregdetail">
      <h1>Register</h1>
      <p><b>${esc(lg?lg.name:LK_NAME)}</b></p>
      <p>${esc(pick.name||'')}</p>
      <label class="lk-tick"><input type="checkbox" id="lkregnighton" checked> Night ${w} · ${esc(typeof lkFmtD==='function'?lkFmtD(LK_DATES[w-1]):LK_DATES[w-1]||'')}</label>
      <label for="lkregclass">Class</label>
      <select id="lkregclass">${CLASSES.map(c=>`<option>${esc(c)}</option>`).join('')}</select>
      <label for="lkregdiv">Division</label>
      <select id="lkregdiv">${DIVS.map(c=>`<option>${esc(c)}</option>`).join('')}</select>
      <label for="lkreground">Round</label>
      <select id="lkreground">${ROUNDS.map((c,i)=>`<option ${w<7&&i===0||w===7&&i===2?'selected':''}>${esc(c)}</option>`).join('')}</select>
      <p class="lk-msg" id="lkregdmsg" role="alert"></p>
      ${bar(btn('lkregdback','Back','grey'),btn('lkregsave','Save','green'))}
    </div>`;
    $id('lkregdback').onclick=()=>regSearch();
    $id('lkregsave').onclick=()=>{
      const on=$id('lkregnighton').checked;
      const night=on?(typeof lkNightKey==='function'?lkNightKey(lg,w):LK_DATES[w-1]):'';
      const rec={
        name:pick.name,
        id:pick.id,
        night,
        className:$id('lkregclass').value,
        division:$id('lkregdiv').value,
        round:$id('lkreground').value,
        at:Date.now()
      };
      let msg='';
      if(on&&typeof lkRegister==='function'){
        msg=lkRegister({posterCode:LK_POSTER_CODE,name:rec.name,night:rec.night,bow:rec.className})||'';
      }else if(!on){
        /* season list only */
        if(typeof lkAddGuest==='function'&&!pick.id)msg=lkAddGuest(rec.name,false)||'';
      }
      if(msg){$id('lkregdmsg').textContent=msg;return}
      const L=typeof lkEnsure==='function'?lkEnsure():lg;
      if(L){
        const id=(typeof lkFindArcher==='function'&&lkFindArcher(L,rec.name))||pick.id;
        if(id){
          L.gn=L.gn||{};
          if(L.gn[id]){L.gn[id].className=rec.className;L.gn[id].division=rec.division;L.gn[id].round=rec.round}
          if(on&&L.reg&&L.reg[rec.night]){
            const row=L.reg[rec.night].find(r=>r&&(r.id===id||r.name===rec.name));
            if(row){row.className=rec.className;row.division=rec.division;row.round=rec.round}
          }
          if(typeof save==='function')save();
        }
      }
      regList();
    };
  }

  function regList(){
    const lg=typeof lkEnsure==='function'?lkEnsure():null;
    hideChrome(true);
    const el=appEl();if(!el)return;
    const w=nightOf(lg||{});
    const list=signups(lg,w);
    const rows=list.map((r,i)=>`<tr><td>${esc(targetOf(r,i))}</td><td>${esc(r.name||((typeof lgName==='function'&&lgName(r.id))||''))}</td><td>${esc(r.round||LK_R)}</td></tr>`).join('')||'<tr><td colspan="3">No archers registered for this night.</td></tr>';
    el.innerHTML=`<div class="lkf" id="lkreglist">
      <h1>Registered archers</h1>
      <p>${esc(lg?lg.name:LK_NAME)} · Night ${w}</p>
      <div class="lk-list"><table><thead><tr><th>Target</th><th>Archer</th><th>Round</th></tr></thead><tbody>${rows}</tbody></table></div>
      ${bar(btn('lkreglback','Back','grey'),btn('lkaddarch','Add Archer','green'))}
    </div>`;
    $id('lkreglback').onclick=()=> (typeof lkAuthed==='function'&&lg&&lkAuthed(lg)?selectArchers():home());
    $id('lkaddarch').onclick=()=>regSearch();
  }

  function endsOf(e){return ((e&&e.e)||[]).filter(z=>z&&z.length===3)}
  function nEndsOf(e){return endsOf(e).length}
  function lastEnd(e){const E=(e&&e.e)||[];return E.length?E[E.length-1]:null}
  function hasPartial(e){const L=lastEnd(e);return!!(L&&L.length&&L.length<3)}
  function sessOf(e){return {round:'Lancaster 660',ends:endsOf(e),face3:'vegas',max:660,lancaster:true,xv:11}}
  function waveReady(lg,w,ids){return ids.every(id=>!hasPartial((typeof lgEnt==='function'&&lgEnt(lg,id,w))||{e:[]}))}
  function anyScored(lg,w,ids){return ids.some(id=>nEndsOf((typeof lgEnt==='function'&&lgEnt(lg,id,w))||{e:[]})>0||hasPartial((typeof lgEnt==='function'&&lgEnt(lg,id,w))||{e:[]}))}
  function allDone(lg,w,ids){return ids.length>0&&ids.every(id=>typeof lgDoneE==='function'&&lgDoneE((typeof lgEnt==='function'&&lgEnt(lg,id,w))||{e:[]}))}
  function pickEntryId(lg,w,ids){
    const fx=window._csFx;
    if(fx&&fx.ns&&ids.some(id=>fx.ns==='lg|'+lg.code+'|'+w+'|'+id)){
      const id=fx.ns.split('|').pop();if(ids.includes(id))return id;
    }
    const part=ids.find(id=>hasPartial((typeof lgEnt==='function'&&lgEnt(lg,id,w))||{e:[]}));
    if(part)return part;
    const act=window._lgAct&&ids.includes(window._lgAct)?window._lgAct:null;
    if(act&&!((typeof lgDoneE==='function')&&lgDoneE(lgEnt(lg,act,w))))return act;
    const ns=ids.map(id=>nEndsOf((typeof lgEnt==='function'&&lgEnt(lg,id,w))||{e:[]}));
    const m=Math.min.apply(null,ns);
    return ids.find((id,i)=>ns[i]===m&&!(typeof lgDoneE==='function'&&lgDoneE(lgEnt(lg,id,w))))||ids[0];
  }
  function faceSub(s,info){
    if(typeof sheetSections==='function'&&s.ends&&s.ends.length){
      const sec=sheetSections(s)[0];if(sec&&sec.k)return sec.k;
    }
    return ((info&&info.face)||'triangular 40 cm 3-spot')+((info&&info.dist)?' @ '+info.dist:'');
  }
  function oneSheet(id,lg,w,info){
    const e=(typeof lgEnt==='function'&&lgEnt(lg,id,w))||{e:[]};
    const ends=endsOf(e),s=sessOf(e);
    let run=0;
    const arrowsAll=ends.flat();
    const tot=typeof lgTot==='function'?lgTot(ends,e):arrowsAll.reduce((t,a)=>t+(a==='X'?11:a==='M'?0:(+a||0)),0);
    const shot=arrowsAll.length,early=ends.length<(info.ends||20),fullMax=660,per=11;
    const stats=typeof hiStats==='function'?hiStats(arrowsAll,s):'';
    const rows=ends.map((end,i)=>{
      const es=typeof endSum==='function'?endSum(end,s):(typeof lgTot==='function'?lgTot([end],e):0);
      run+=es;
      return `<tr><td>${i+1}</td><td>${end.map((a,j)=>`<span class="adb ${typeof col==='function'?col(a):''}" role="button" tabindex="0" data-lkfix="${esc(id)},${i},${j}" aria-label="fix end ${i+1} arrow ${a}">${esc(a)}</span>`).join('')}</td><td>${es}</td><td>${run}</td></tr>`;
    }).join('');
    return `<div class="ad-sheet" data-lksid="${esc(id)}"><div class="ad-name">${esc((typeof lgName==='function'&&lgName(id))||id)}</div><div class="ad-band">${esc(info.title||'Lancaster 660')}</div>
      <table class="ad-tab"><thead><tr><th>#</th><th>Scores<div style="font-weight:400">${esc(faceSub(s,info))}</div></th><th>End</th><th>Prog</th></tr></thead><tbody>${rows}</tbody></table>
      <div class="ad-sum">${stats}&nbsp; <b class="big">${tot}</b><span class="small muted">&nbsp;/ ${early?shot*per+' <span class="small">('+shot+' arrows shot)</span>':fullMax}</span></div></div>`;
  }
  function finishLater(){
    window._lkScoreMode=null;window._csFx=null;window._lgHold=null;
    home();
  }
  function groupSheet(){
    const lg=typeof lkEnsure==='function'?lkEnsure():null;
    if(!lg){home();return}
    const w=nightOf(lg);
    const ids=window._lkScoreIds||window._lkPicked||[];
    if(!ids.length){selectArchers();return}
    hideChrome(true);
    window._lkScoreMode='sheet';
    window._csFx=null;
    const info=typeof lgInfo==='function'?lgInfo(lg,w):{ends:20,title:'Lancaster 660',face:'triangular 40 cm 3-spot',dist:'18 m'};
    const done=allDone(lg,w,ids);
    const arrows=ids.some(id=>{const e=(typeof lgEnt==='function'&&lgEnt(lg,id,w))||{e:[]};return ((e.e||[]).flat().length)>0});
    const el=appEl();if(!el)return;
    el.innerHTML=`<div class="ad" id="lksheet">
      <div class="ad-title"><button type="button" class="labfl" id="labfl" title="Every arrow is already saved. Carry on later from Select Archers.">Finish later</button>Score Sheet</div>
      ${ids.map(id=>oneSheet(id,lg,w,info)).join('')}
      <div class="ad-foot"><button class="ad-back" id="sback">‹ Back</button>${arrows?`<button class="ad-fin" id="finnow">Finished</button>`:''}${done?'':`<button class="ad-go" id="addsc">Add Scores</button>`}</div>
      ${done?'':'<button type="button" class="ad-discard" id="labdiscard">Discard card</button>'}
    </div>`;
    $id('labfl').onclick=()=>finishLater();
    $id('sback').onclick=()=>{window._lkScoreMode=null;selectArchers()};
    if($id('addsc'))$id('addsc').onclick=()=>{
      window._csFx=null;window._lgHold=null;
      const next=pickEntryId(lg,w,ids);
      window._lgAct=next;window._lkScoreI=Math.max(0,ids.indexOf(next));
      window._lkScoreMode='entry';
      entryScreen();
    };
    if($id('finnow'))$id('finnow').onclick=()=>{
      if(!done){
        const shotN=ids.reduce((t,id)=>t+(((typeof lgEnt==='function'&&lgEnt(lg,id,w))||{e:[]}).e||[]).flat().length,0);
        const totN=ids.reduce((t,id)=>{const e=(typeof lgEnt==='function'&&lgEnt(lg,id,w))||{e:[]};return t+(typeof lgTot==='function'?lgTot(endsOf(e),e):0)},0);
        if(!confirm(`Finish round now? ${shotN} arrows, ${totN} points across the group.`))return;
      }
      window._lkScoreMode=null;review();
    };
    if($id('labdiscard'))$id('labdiscard').onclick=()=>{
      if(!confirm("Discard this card? These archers' scores for this night are deleted from this phone."))return;
      lg.sc=lg.sc||{};
      ids.forEach(id=>{if(lg.sc[id])delete lg.sc[id][w]});
      lg.dirty=1;if(typeof save==='function')save();
      window._lkScoreMode=null;window._csFx=null;window._lgHold=null;
      selectArchers();
    };
    el.querySelectorAll('[data-lkfix]').forEach(b=>{
      const go=()=>{
        const [id,i,j]=b.getAttribute('data-lkfix').split(',');
        const ns='lg|'+lg.code+'|'+w+'|'+id;
        const fx=window._csFx;
        window._csFx=(fx&&fx.ns===ns&&fx.i=== +i&&fx.j=== +j)?null:{ns,i:+i,j:+j};
        if(!window._csFx)return;
        window._lgAct=id;window._lkScoreI=Math.max(0,ids.indexOf(id));
        window._lkFixRet=1;window._lkScoreMode='entry';
        entryScreen();
      };
      b.onclick=b.onkeydown=ev=>{if(ev.type==='keydown'&&ev.key!=='Enter'&&ev.key!==' ')return;go()};
    });
  }
  function entryScreen(){
    const lg=typeof lkEnsure==='function'?lkEnsure():null;
    if(!lg){home();return}
    const w=nightOf(lg);
    const ids=window._lkScoreIds||window._lkPicked||[];
    if(!ids.length){selectArchers();return}
    const id=pickEntryId(lg,w,ids);
    window._lgAct=id;
    window._lkScoreI=Math.max(0,ids.indexOf(id));
    window._lkScoreMode='entry';
    hideChrome(true);
    const e=(typeof lgEnt==='function'&&lgEnt(lg,id,w))||{e:[]};
    const E=e.e||[];
    const last=E[E.length-1];
    const fx=window._csFx&&window._csFx.ns==='lg|'+lg.code+'|'+w+'|'+id?window._csFx:null;
    const hold=!!(window._lgHold&&window._lgHold.id===id&&last&&last.length===3);
    const cur=fx&&E[fx.i]?E[fx.i]:(last&&(last.length<3||hold)?last:[]);
    const ei=fx?fx.i:(last&&(last.length<3||hold)?E.length-1:E.length);
    const done=typeof lgDoneE==='function'&&lgDoneE(e);
    const info=typeof lgInfo==='function'?lgInfo(lg,w):{ends:20,title:'Lancaster 660',face:'triangular 40 cm 3-spot',dist:'18 m'};
    const NE=info.ends||20;
    const s=sessOf(e);
    const endTot=typeof endSum==='function'?endSum(cur,s):(typeof lgTot==='function'?lgTot([cur],e):0);
    const completed=E.filter(z=>z&&z.length===3);
    const before=completed.slice(0,fx?fx.i:completed.length-(hold?1:0));
    const prog=(typeof lgTot==='function'?lgTot(before,e):0)+endTot;
    const keys=(typeof LG_KEYS!=='undefined'?LG_KEYS:['X','10','9','8','7','6','M']);
    const lock=typeof lgLockedBy==='function'&&lgLockedBy(lg,w,id);
    const endDone=cur.length===3||done;
    const el=appEl();if(!el)return;
    const ape=3;
    const chips=Array.from({length:ape},(_,j)=>cur[j]!=null?`<span class="adb ${typeof col==='function'?col(cur[j]):''}" role="button" tabindex="0" data-lkfix="${esc(id)},${ei},${j}" aria-label="fix arrow ${esc(cur[j])}"${fx&&fx.i===ei&&fx.j===j?' style="outline:3px solid #3b82f6;outline-offset:2px"':''}>${esc(cur[j])}</span>`:'<span class="adb adb-empty"></span>').join('');
    const hint=lock?`Being scored on ${esc((typeof lgName==='function'&&lgName(lock))||lock)}'s phone.`
      :fx?'Tap a score to fix this arrow.'
      :endDone?(done?(info.done||'Finished')+'.':'End complete. Tap an arrow to fix it, or press Next.')
      :'Tap a score.';
    el.innerHTML=`<div class="ad" id="lgentry">
      <div class="ad-title"><button type="button" class="labfl" id="labfl" title="Every arrow is already saved. Carry on later from Select Archers.">Finish later</button>Score End</div>
      <div class="ad-head"><div class="ad-left">
        <div class="ad-box ad-line" title="${esc((typeof lgName==='function'&&lgName(id))||id)}"><b>${esc((typeof lgName==='function'&&lgName(id))||id)}</b></div>
        <div class="ad-box ad-line"><b id="endno">${done?(info.done||'Finished'):`End ${Math.min(NE,ei+1)} of ${NE}`}</b> · <span id="roundname">${esc(info.title||'Lancaster 660')}</span>${info.dist?` · <b id="enddist">${esc(info.dist)}</b>`:''} · <span id="facesize">${esc(info.face||'triangular 40 cm 3-spot')}</span></div>
      </div>
      <div class="ad-right"><div class="ad-num"><span>End</span><b>${endTot}</b></div><div class="ad-num"><span>Prog</span><b>${prog}</b></div></div></div>
      <div class="ad-chips" aria-label="Arrows this end">${chips}
        <button class="ad-small" id="lgundo" ${(!E.some(x=>x&&x.length)||lock||fx)?'disabled':''}>↶ Undo</button>
        ${fx?`<button class="ad-small" id="delarrow">✕ Delete arrow</button><button class="ad-small" id="fixcancel">Done</button>`:''}
      </div>
      <p class="small muted" id="lkendmsg" style="margin:2px 12px">${hint}</p>
      ${lock||(done&&!fx)?'':`<div class="ad-pad lc-pad" style="--cols:${keys.length}">${keys.map(k=>`<button type="button" class="${typeof col==='function'?col(k):''}" data-lgk="${k}" aria-label="score ${k}" ${endDone&&!fx?'disabled':''}>${k}</button>`).join('')}</div>`}
      <div class="ad-foot"><button class="ad-back" id="eback">‹ Back</button><button class="ad-go" id="enext" ${endDone&&!fx?'':'disabled'}>Next ›</button></div>
    </div>`;
    $id('labfl').onclick=()=>finishLater();
    $id('eback').onclick=()=>{window._csFx=null;window._lgHold=null;window._lkFixRet=null;window._lkScoreMode='sheet';groupSheet()};
    if($id('enext'))$id('enext').onclick=()=>goNext(lg,w,ids,id);
    const tapKey=k=>{
      if(lock)return;
      window._lgAct=id;window._lgKeep=1;
      if(typeof lgKey==='function')lgKey(lg.code,w,id,k);
      window._lgAct=id;window._lgKeep=null;
      const e2=(typeof lgEnt==='function'&&lgEnt(lg,id,w))||{e:[]};
      const L=lastEnd(e2);
      if(L&&L.length===3)window._lgHold={id,n:e2.e.length};
      if(window._lkFixRet&&!window._csFx){window._lkFixRet=null;window._lkScoreMode='sheet';groupSheet();return}
      entryScreen();
    };
    el.querySelectorAll('[data-lgk]').forEach(b=>b.onclick=()=>tapKey(b.getAttribute('data-lgk')));
    el.querySelectorAll('[data-lkfix]').forEach(b=>{
      const go=()=>{
        const [aid,i,j]=b.getAttribute('data-lkfix').split(',');
        const ns='lg|'+lg.code+'|'+w+'|'+aid;
        const curFx=window._csFx;
        window._csFx=(curFx&&curFx.ns===ns&&curFx.i=== +i&&curFx.j=== +j)?null:{ns,i:+i,j:+j};
        entryScreen();
      };
      b.onclick=b.onkeydown=ev=>{if(ev.type==='keydown'&&ev.key!=='Enter'&&ev.key!==' ')return;go()};
    });
    if($id('lgundo'))$id('lgundo').onclick=()=>{
      window._lgAct=id;window._lgKeep=1;window._csFx=null;window._lgHold=null;
      if(typeof lgUndo==='function')lgUndo(lg.code,w,id);
      window._lgKeep=null;
      entryScreen();
    };
    if($id('fixcancel'))$id('fixcancel').onclick=()=>{
      window._csFx=null;
      if(window._lkFixRet){window._lkFixRet=null;window._lkScoreMode='sheet';groupSheet();return}
      entryScreen();
    };
    if($id('delarrow'))$id('delarrow').onclick=()=>{
      window._lgAct=id;window._lgKeep=1;
      if(typeof lgFxDel==='function')lgFxDel(lg.code,w,id);
      window._lgKeep=null;window._lgHold=null;
      if(window._lkFixRet){window._lkFixRet=null;window._lkScoreMode='sheet';groupSheet();return}
      entryScreen();
    };
  }
  function goNext(lg,w,ids,id){
    window._csFx=null;window._lgHold=null;window._lkFixRet=null;
    const mine=nEndsOf((typeof lgEnt==='function'&&lgEnt(lg,id,w))||{e:[]});
    const i=ids.indexOf(id);
    for(let j=1;j<ids.length;j++){
      const n=ids[(i+j)%ids.length];
      const en=(typeof lgEnt==='function'&&lgEnt(lg,n,w))||{e:[]};
      if(hasPartial(en)||nEndsOf(en)<mine){
        if(typeof lgLockedBy==='function'&&lgLockedBy(lg,w,n))continue;
        window._lgAct=n;window._lkScoreI=ids.indexOf(n);window._lkScoreMode='entry';
        entryScreen();return;
      }
    }
    window._lkScoreMode='sheet';
    groupSheet();
  }
  function scoreScreen(){
    const lg=typeof lkEnsure==='function'?lkEnsure():null;
    if(!lg){home();return}
    const w=nightOf(lg);
    const ids=window._lkScoreIds||window._lkPicked||[];
    if(!ids.length){selectArchers();return}
    if(window._lkScoreMode==='sheet'){groupSheet();return}
    if(window._lkScoreMode!=='entry'&&waveReady(lg,w,ids)&&(allDone(lg,w,ids)||ids.some(id=>nEndsOf((typeof lgEnt==='function'&&lgEnt(lg,id,w))||{e:[]})>0))){groupSheet();return}
    entryScreen();
  }

  function review(){
    const lg=typeof lkEnsure==='function'?lkEnsure():null;
    hideChrome(true);
    const el=appEl();if(!el)return;
    const stand=typeof lkTableHTML==='function'&&lg?lkTableHTML(lg):'<p>No scores yet.</p>';
    const pot=(typeof lkPotHTML==='function'&&lg)?lkPotHTML(lg):'';
    const w=nightOf(lg||{});
    const scores=typeof lkNightScores==='function'&&lg?lkNightScores(lg,w):null;
    el.innerHTML=`<div class="lkf" id="lkreviewpage">
      <h1>Review Scoresheet</h1>
      ${stand}${pot}
      ${bar(btn('lkrevback','Back','grey'),'')}
    </div>`;
    $id('lkrevback').onclick=()=>home();
    if($id('lkpotnight'))$id('lkpotnight').onchange=()=>{window._lkPotNight=+$id('lkpotnight').value;review()};
    document.querySelectorAll('[data-lkpaid]').forEach(box=>box.onchange=()=>{
      const nw=+(window._lkPotNight||w);
      if(typeof lkSetPaid==='function')lkSetPaid(box.getAttribute('data-lkpaid'),typeof lkNightKey==='function'?lkNightKey(lg,nw):'',box.checked);
      review();
    });
    if(typeof lkBindStandUI==='function')lkBindStandUI(lg);
  }

  function enter(code){
    if(typeof lkEnsure==='function')lkEnsure();
    hideChrome(true);
    const lg=typeof lkGet==='function'?lkGet():null;
    if(typeof lkAuthed==='function'&&lg&&lkAuthed(lg))selectArchers();
    else login();
  }


  if(!window._lkNavHooked && typeof nav==='function'){
    const _nav=nav;
    window.nav=function(){
      if(shouldBoot()&&document.body.classList.contains('lk-flow'))return;
      hideChrome(false);
      window._lkFlow=false;
      return _nav.apply(this,arguments);
    };
    window._lkNavHooked=1;
  }

  function shouldBoot(){
    if(!/\/test(\/|$)/.test(String(location.pathname||'')))return false;
    const q=new URLSearchParams(location.search);
    if(q.get('app')==='1')return false;
    if(q.has('tester'))return false;
    if(typeof lkIsRegHash==='function'&&lkIsRegHash())return false;
    if(typeof lkIsResHash==='function'&&lkIsResHash())return false;
    return true;
  }

  /* Expose for tests and relay refresh */
  window.lkFlowHome=home;
  window.lkFlowLogin=login;
  window.lkFlowSelect=selectArchers;
  window.lkFlowReview=review;
  window.lkFlowScore=scoreScreen;
  window.lkFlowEnter=enter;
  window.lkFlowHost=hostPw;
  window.lkApplyClaim=applyClaim;
  window.lkMergeClaims=mergeClaimBag;
  window.lkSetClaim=setClaim;
  window.lkClaims=claims;
  window.lkClaimedByOther=claimedByOther;
  window.lkFlowHideChrome=hideChrome;

  const origView=window.lkView;
  window.lkView=function(code){
    hideChrome(true);
    if(typeof lkEnsure==='function')lkEnsure();
    enter(code);
  };
  if(typeof origView==='function')window._lkViewOld=origView;

  /* After the app first paints, take over when this is the public test URL. */
  function boot(){
    if(!shouldBoot())return;
    if(window._lkFlowStarted)return;
    window._lkFlowStarted=1;
    if(typeof lkEnsure==='function')lkEnsure();
    hideChrome(true);
    home();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0));
  else setTimeout(boot,0);
})();
