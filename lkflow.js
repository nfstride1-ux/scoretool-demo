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
          <input type="checkbox" data-lkid="${esc(r.id)}" ${on?'checked':''} ${other?'disabled':''}>
          <span class="nm">${esc(r.name)}</span>
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

  function scoreScreen(){
    const lg=typeof lkEnsure==='function'?lkEnsure():null;
    if(!lg){home();return}
    const w=nightOf(lg);
    const ids=window._lkScoreIds||window._lkPicked||[];
    if(!ids.length){selectArchers();return}
    let i=Math.max(0,Math.min(ids.length-1,+(window._lkScoreI||0)));
    const id=ids[i];
    window._lgAct=id;
    hideChrome(true);
    const e=(typeof lgEnt==='function'&&lgEnt(lg,id,w))||{e:[]};
    const E=e.e||[];
    const last=E[E.length-1];
    const cur=last&&last.length<3?last:[];
    const done=typeof lgDoneE==='function'&&lgDoneE(e);
    const tot=typeof lgTot==='function'?lgTot(E,e):0;
    const ends=E.filter(z=>z&&z.length===3).length;
    const info=typeof lgInfo==='function'?lgInfo(lg,w):{ends:20};
    const NE=info.ends||20;
    const en=Math.min(NE, ends+(cur.length?0:1));
    const el=appEl();if(!el)return;
    const keys=(typeof LG_KEYS!=='undefined'?LG_KEYS:['X','10','9','8','7','6','M']);
    el.innerHTML=`<div class="lkf" id="lgentry">
      <div class="lk-score-head">
        <h1>${esc((typeof lgName==='function'&&lgName(id))||id)}</h1>
        <div class="tot">${tot}</div>
      </div>
      <p class="lk-end" id="lkendmsg">${esc(info.title||'Lancaster 660')} · ${done?(info.done||'Finished'):('End '+en+' of '+NE)}</p>
      <div class="lk-slots">${[0,1,2].map(j=>`<span class="${cur[j]?'on':''}">${cur[j]?esc(cur[j]):''}</span>`).join('')}</div>
      ${done?'':`<div class="lk-pad ad-pad lc-pad">${keys.map(k=>`<button type="button" class="${k==='M'?'m':''}" data-lgk="${k}" aria-label="score ${k}">${k}</button>`).join('')}</div>`}
      ${bar(btn('lkscoreback','Back','grey'), (done||ids.length>1)?btn('lknextarcher', i<ids.length-1?'Next archer':'Done','green'):btn('lkundo','Undo','grey'))}
    </div>`;
    el.querySelectorAll('[data-lgk]').forEach(b=>b.onclick=()=>{
      window._lgAct=id;window._lgKeep=1;
      if(typeof lgKey==='function')lgKey(lg.code,w,id,b.getAttribute('data-lgk'));
      window._lgKeep=null;
      scoreScreen();
    });
    $id('lkscoreback').onclick=()=>selectArchers();
    if($id('lkundo'))$id('lkundo').onclick=()=>{
      window._lgAct=id;window._lgKeep=1;
      if(typeof lgUndo==='function')lgUndo(lg.code,w,id);
      window._lgKeep=null;
      scoreScreen();
    };
    if($id('lknextarcher'))$id('lknextarcher').onclick=()=>{
      if(i<ids.length-1){window._lkScoreI=i+1;scoreScreen();return}
      selectArchers();
    };
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
