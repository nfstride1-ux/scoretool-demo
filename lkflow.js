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
    const max=isOnion()?6:((typeof LK_NIGHTS==='number'&&LK_NIGHTS)||7);
    const w=+(window._lkFlowNight||0);
    if(w>=1&&w<=max)return w;
    const cur=(typeof lgWeek==='function'?lgWeek(lg):1)||1;
    return Math.min(max, cur);
  }
  function setNight(w){window._lkFlowNight=+w||1}


  function evCode(code){
    const onion=(typeof LG_PRESET!=='undefined'&&LG_PRESET&&LG_PRESET.code)||'ONIONSH2';
    const lk=(typeof LK_CODE==='string'&&LK_CODE)||'LINGKN26';
    const c=String(code||window._lkEvent||'').toUpperCase();
    if(c===onion||c==='ONIONSHD'||c==='ONION SHED CHALLENGE')return onion;
    return lk;
  }
  function isOnion(code){
    const onion=(typeof LG_PRESET!=='undefined'&&LG_PRESET&&LG_PRESET.code)||'ONIONSH2';
    return evCode(code)===onion;
  }
  function setEv(code){window._lkEvent=evCode(code);return window._lkEvent}
  function evName(code){
    if(isOnion(code))return (typeof LG_PRESET!=='undefined'&&LG_PRESET&&LG_PRESET.name)||'Onion Shed Challenge';
    return (typeof LK_NAME==='string'&&LK_NAME)||'Lingkana League';
  }
  function backToList(){
    window._lkEvent=null;
    if(shouldBoot()){list();return}
    hideChrome(false);
    window._lkFlow=false;
    if(typeof nav==='function')nav((typeof view!=='undefined'&&view==='lab_leagues')?'lab_leagues':'score');
    else if(typeof score==='function')score();
  }

  function list(){
    hideChrome(true);
    window._lkEvent=null;
    const el=appEl();if(!el)return;
    el.innerHTML=`<div class="lkf" id="lkevlist">
      <h1>Leagues</h1>
      <p class="small muted">Open a league to log in, register, review scores or read the rules.</p>
      ${typeof lgEventCardsHTML==='function'?lgEventCardsHTML():''}
    </div>`;
    el.querySelectorAll('[data-evopen]').forEach(b=>b.onclick=()=>home(b.getAttribute('data-evopen')));
  }

  function home(code){
    setEv(code);
    if(isOnion()){if(typeof lgSeed==='function')lgSeed()}
    else if(typeof lkEnsure==='function')lkEnsure();
    hideChrome(true);
    const el=appEl();if(!el)return;
    const onion=isOnion();
    const logo=onion?'img/onion-shed-logo.jpg':'img/lingkana-logo.png';
    const alt=onion?'Onion Shed Championships':'Lingkana Indoor Archery';
    el.innerHTML=`<div class="lkf" id="lkhome" data-ev="${esc(evCode())}">
      <div class="lk-evhome">
        <div class="lk-evbrand ${onion?'onion':'lingkana'}">
          <img src="${logo}" alt="${esc(alt)}">
          <p class="lk-evname">${esc(evName())}</p>
        </div>
        <div class="lk-home">
          ${btn('lklogin','Login to Event','green')}
          ${btn('lkqr','Login with QR Code','green')}
          ${btn('lkereg','Event Registration','grey')}
          ${btn('lkreview','Review Scoresheet','grey')}
          ${btn('lkrules','Rules','grey')}
        </div>
        ${bar(btn('lkhomeback','Back to leagues','grey'),'')}
        ${onion?'':`<div id="lkgetbox" style="margin:16px 0 4px;text-align:center">
          <p><a class="lk-btn grey" id="lkgetapp" href="${esc((typeof LK_PUBLIC_BASE==='string'&&LK_PUBLIC_BASE)||'./')}">Get ScoreTool</a></p>
          <p class="small muted">To keep it: tap Share or the ⋮ menu, then Add to Home Screen.</p>
        </div>`}
      </div>
    </div>`;
    $id('lklogin').onclick=()=>login();
    $id('lkqr').onclick=()=>qrLogin();
    $id('lkereg').onclick=()=>regEntry();
    $id('lkreview').onclick=()=>review();
    $id('lkrules').onclick=()=>rules();
    $id('lkhomeback').onclick=()=>backToList();
  }


  function login(){
    if(isOnion())return osLogin();
    const lg=typeof lkEnsure==='function'?lkEnsure():null;
    hideChrome(true);
    const el=appEl();if(!el)return;
    const name=myName()||'';
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
      ${bar(btn('lkloginback','Back','grey'),btn('lkpwgo','Login','green'))}
    </div>`;
    if($id('lkloginback'))$id('lkloginback').onclick=()=>home(evCode());
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
    $id('lkqrback').onclick=()=>home(evCode());
    $id('lkqrgo').onclick=()=>login();
    const msg=$id('lkqrmsg');
    const accept=text=>{
      const s=String(text||'');
      /* lk-onion26 is the Lingkana invite code — do not treat it as Onion Shed. */
      if(/ONIONSH2|ONIONSHD|#os-|onion-shed|onion shed/i.test(s)&&!/lk-onion26/i.test(s)){setEv((typeof LG_PRESET!=='undefined'&&LG_PRESET&&LG_PRESET.code)||'ONIONSH2');home(evCode());return true}
      if(/scoretool-demo|lk-onion26|lk-home|LINGKN26|lk-register|lk-login|#lingkana/i.test(s)){setEv((typeof LK_CODE==='string'&&LK_CODE)||'LINGKN26');home(LK_CODE||evCode());return true}
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


  const LK_TARGETS=13; /* Lingkana: 13 shooting lanes. Onion Shed: Nathe, 12 Nov 8:09am, also a max of 13 lanes. */
  function eventLg(){
    if(isOnion()){
      if(typeof lgSeed==='function')lgSeed();
      return (typeof lgGet==='function'&&lgGet(evCode()))||null;
    }
    return (typeof lkEnsure==='function'&&lkEnsure())||null;
  }
  function nightKey(lg,w){
    if(isOnion())return String(w);
    return (typeof lkNightKey==='function'&&lkNightKey(lg,w))||((typeof LK_DATES!=='undefined'&&LK_DATES[(w||1)-1])||'');
  }
  function nightSignups(lg,w){
    if(isOnion())return (((lg||{}).reg)||{})[nightKey(lg,w)]||[];
    if(typeof lkNightSignups==='function')return lkNightSignups(lg,w)||[];
    return signups(lg,w);
  }
  function nightChoices(lg,w){
    if(isOnion()){
      return [1,2,3,4,5,6].map(n=>{
        const d=(lg&&lg.weeks&&lg.weeks[n-1])||'';
        const lab=n<6?('Week '+n):'Day 6 (together)';
        return`<option value="${n}" ${n===w?'selected':''}>${esc(lab)}${d?' · '+esc(d):''}</option>`;
      }).join('');
    }
    return (LK_DATES||[]).map((d,i)=>`<option value="${i+1}" ${i+1===w?'selected':''}>${esc(nightLabel(i))}</option>`).join('');
  }
  function archerTarget(lg,w,id){
    const rec=(nightSignups(lg,w)||[]).find(r=>r&&r.id===id);
    const t=rec&&rec.target!=null?+rec.target:0;
    if(t>=1&&t<=LK_TARGETS)return t;
    if(!isOnion()){
      const G=((((lg||{}).grp)||{})[w]||{}).g||[];
      for(let i=0;i<G.length;i++){
        if((G[i]||[]).includes(id)){
          /* Prefer an explicit target stored on the group when present; otherwise this is only a scoring group, not a lane. */
          const gt=G[i]&&G[i]._target;
          if(gt>=1&&gt<=LK_TARGETS)return +gt;
        }
      }
    }
    return 0;
  }
  function setTargets(lg,w,target,ids){
    if(!lg)return 'The league is not on this phone yet.';
    const k=nightKey(lg,w);
    lg.reg=lg.reg||{};
    const list=lg.reg[k]||[];
    const set=new Set(ids||[]);
    list.forEach(r=>{
      if(!r||!r.id)return;
      if(set.has(r.id))r.target=+target;
      else if(+r.target===+target)delete r.target;
    });
    lg.reg[k]=list;
    lg.dirty=1;
    if(typeof save==='function')save();
    return '';
  }
  function startScoring(lg,w,ids){
    window._lkScoreIds=ids.slice();
    window._lkScoreI=0;
    window._lkScoreMode=null;
    window._lgE={code:lg.code,w:+w,ids:ids.slice()};
    window._lgAct=ids[0];
    window._lgHold=null;
    window._lkFlowNight=+w;
    if(isOnion()){
      /* lgView scores the current week (lgWeek). With no week dates set, cw is what that uses. Do not change 300 scoring. */
      if(!((lg.weeks||[]).filter(Boolean).length))lg.cw=+w;
      hideChrome(false);
      window._lkFlow=false;
      if(typeof lgView==='function')lgView(lg.code);
      return;
    }
    if(typeof scoreScreen==='function')scoreScreen();
  }

  function selectArchers(){
    const lg=eventLg();
    if(!lg){home();return}
    if(!isOnion()&&typeof lkAuthed==='function'&&lg.pwHash&&!lkAuthed(lg)){login();return}
    hideChrome(true);
    const w=nightOf(lg);
    const target=+(window._lkTarget||0);
    const list=nightSignups(lg,w);
    const rows=list.map(r=>({id:r.id,name:r.name||((typeof lgName==='function'&&lgName(r.id))||r.id),target:archerTarget(lg,w,r.id)}));
    const el=appEl();if(!el)return;
    const title=esc(lg.name||evName());
    const nightSel=`<label for="lknight">Night</label><select id="lknight">${nightChoices(lg,w)}</select>`;
    const hostPwBtn=(!isOnion()&&typeof lkCanHost==='function'&&lkCanHost(lg))?`<button type="button" class="lk-host" id="lkhostpw">Host: change scoring password</button>`:'';

    if(!(target>=1&&target<=LK_TARGETS)){
      const counts={};
      rows.forEach(r=>{if(r.target)counts[r.target]=(counts[r.target]||0)+1});
      const grid=Array.from({length:LK_TARGETS},(_,i)=>{
        const n=i+1, c=counts[n]||0;
        return `<button type="button" class="lk-tbtn" data-lktgt="${n}" id="lktgt${n}">${n}${c?`<span class="lk-tcount">${c}</span>`:''}</button>`;
      }).join('');
      el.innerHTML=`<div class="lkf" id="lkselect" data-ev="${esc(evCode())}">
        <h1>${title}</h1>
        ${nightSel}
        <p class="small muted">Tap a target, then tick up to 4 archers already registered for this night. Registration is on the Event Registration page.</p>
        <div class="lk-tgrid" id="lktargets">${grid}</div>
        ${hostPwBtn}
        ${bar(btn('lkbacklogin','Back / Login','grey'),'')}
      </div>`;
      $id('lknight').onchange=()=>{setNight(+$id('lknight').value);window._lkTarget=0;window._lkPicked=[];selectArchers()};
      $id('lkbacklogin').onclick=()=>{window._lkTarget=0;window._lkPicked=[];home(evCode())};
      if($id('lkhostpw'))$id('lkhostpw').onclick=()=>hostPw();
      el.querySelectorAll('[data-lktgt]').forEach(b=>b.onclick=()=>{window._lkTarget=+b.getAttribute('data-lktgt');window._lkPicked=[];selectArchers()});
      return;
    }

    const selected=(window._lkPicked||[]).filter(id=>{
      const row=rows.find(r=>r.id===id);
      if(!row)return false;
      if(claimedByOther(lg,w,id))return false;
      const on=archerTarget(lg,w,id);
      return !on||on===target;
    });
    window._lkPicked=selected.slice();
    const selHtml=selected.length?`<div class="lk-selbox" id="lkselections"><h3>Selections</h3><ul>${selected.map(id=>`<li>${esc((rows.find(r=>r.id===id)||{}).name||id)}</li>`).join('')}</ul></div>`:'';
    const body=rows.map(r=>{
      const other=claimedByOther(lg,w,r.id);
      const onT=archerTarget(lg,w,r.id);
      const taken=!!other||(onT&&onT!==target);
      const on=selected.includes(r.id);
      const why=other?((other.name||'Another scorer')+' already has this archer.'):('Already on target '+onT);
      return `<label class="lk-row${taken?' locked':''}" data-lkid="${esc(r.id)}">
        <span class="nm">${esc(r.name)}</span>
        <input type="checkbox" data-lkid="${esc(r.id)}" ${on?'checked':''} ${taken?'disabled':''}>
        ${taken?`<span class="lk-padlock" title="${esc(why)}">🔒</span>`:''}
      </label>`;
    }).join('')||'<p>No archers registered for this night yet. They sign up on the Event Registration page.</p>';
    el.innerHTML=`<div class="lkf" id="lkselect" data-ev="${esc(evCode())}" data-target="${target}">
      <h1>${title}</h1>
      ${nightSel}
      <div class="lk-tgt" id="lktgtlabel">Target ${target}</div>
      ${selHtml}
      <div id="lkarchlist">${body}</div>
      ${hostPwBtn}
      <p class="lk-msg" id="lkselmsg" role="alert"></p>
      ${bar(btn('lkbacklogin','Back','grey'),btn('lkstart',`Start (${selected.length})`,'green'))}
    </div>`;
    $id('lknight').onchange=()=>{setNight(+$id('lknight').value);window._lkTarget=0;window._lkPicked=[];selectArchers()};
    $id('lkbacklogin').onclick=()=>{window._lkTarget=0;window._lkPicked=[];selectArchers()};
    if($id('lkhostpw'))$id('lkhostpw').onclick=()=>hostPw();
    const toggle=id=>{
      const msg=$id('lkselmsg');
      const other=claimedByOther(lg,w,id);
      if(other){if(msg)msg.textContent=(other.name||'Another scorer')+' already has this archer.';return}
      const onT=archerTarget(lg,w,id);
      if(onT&&onT!==target){if(msg)msg.textContent='That archer is already on target '+onT+'.';return}
      const has=window._lkPicked.includes(id);
      if(!has&&window._lkPicked.length>=4){if(msg)msg.textContent='Pick up to 4 archers for this target.';const box=el.querySelector('#lkarchlist input[data-lkid="'+id+'"]');if(box)box.checked=false;return}
      if(!isOnion()){
        const err=setClaim(lg,w,id,!has);
        if(err){if(msg)msg.textContent=err;return}
      }
      if(has)window._lkPicked=window._lkPicked.filter(x=>x!==id);
      else window._lkPicked.push(id);
      selectArchers();
    };
    el.querySelectorAll('#lkarchlist input[data-lkid]').forEach(box=>{
      box.onchange=()=>toggle(box.getAttribute('data-lkid'));
    });
    $id('lkstart').onclick=()=>{
      const ids=window._lkPicked||[];
      const msg=$id('lkselmsg');
      if(!ids.length){if(msg)msg.textContent='Tick the archers you are scoring.';return}
      if(ids.length>4){if(msg)msg.textContent='Pick up to 4 archers for this target.';return}
      const put=setTargets(lg,w,target,ids);
      if(put){if(msg)msg.textContent=put;return}
      if(!isOnion()&&typeof lkSetGroups==='function'){
        const add=lkSetGroups(w,[ids]);
        if(add){if(msg)msg.textContent=add;return}
      }
      startScoring(lg,w,ids);
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
    if(isOnion())return osReview();
    const lg=typeof lkEnsure==='function'?lkEnsure():null;
    hideChrome(true);
    const w=nightOf(lg||{});
    if(typeof lkResultsView==='function'){
      try{history.replaceState(null,'',location.pathname+location.search+'#lk-results&n='+w)}catch(e){}
      lkResultsView(w);
      const back=$id('lkresback');
      if(back)back.onclick=()=>{try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}home(evCode())};
      return;
    }
    const el=appEl();if(!el)return;
    const stand=typeof lkTableHTML==='function'&&lg?lkTableHTML(lg):'<p>No scores yet.</p>';
    const pot=(typeof lkPotHTML==='function'&&lg)?lkPotHTML(lg):'';
    el.innerHTML=`<div class="lkf" id="lkreviewpage">
      <h1>Review Scoresheet</h1>
      ${stand}${pot}
      ${bar(btn('lkrevback','Back','grey'),'')}
    </div>`;
    $id('lkrevback').onclick=()=>home(evCode());
    if($id('lkpotnight'))$id('lkpotnight').onchange=()=>{window._lkPotNight=+$id('lkpotnight').value;review()};
    document.querySelectorAll('[data-lkpaid]').forEach(box=>box.onchange=()=>{
      const nw=+(window._lkPotNight||w);
      if(typeof lkSetPaid==='function')lkSetPaid(box.getAttribute('data-lkpaid'),typeof lkNightKey==='function'?lkNightKey(lg,nw):'',box.checked);
      review();
    });
    if(typeof lkBindStandUI==='function')lkBindStandUI(lg);
  }

  function regEntry(){
    if(isOnion())return osRegister();
    hideChrome(true);
    try{history.replaceState(null,'',location.pathname+location.search+(window.LK_HOME_HASH||(typeof LK_HOME_HASH==='string'&&LK_HOME_HASH)||'#lk-home'))}catch(e){}
    if(typeof lkRegisterView==='function')lkRegisterView();
    const back=document.getElementById('lkregback');
    if(back)back.onclick=()=>{try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}home(evCode())};
  }

  function rules(){
    hideChrome(true);
    const el=appEl();if(!el)return;
    const onion=isOnion();
    const title=onion?'Onion Shed Challenge rules':'Lingkana League rules';
    let body='';
    if(onion){
      const R=(typeof LG_RULES!=='undefined'&&LG_RULES)||[];
      body=`<ul>${R.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
    }else{
      body=typeof lkRulesHTML==='function'?lkRulesHTML():'';
    }
    el.innerHTML=`<div class="lkf lk-rules" id="lkrulespage">
      <h1>${esc(title)}</h1>
      ${body}
      ${bar(btn('lkruleback','Back','grey'),'')}
    </div>`;
    $id('lkruleback').onclick=()=>home(evCode());
  }

  function osLogin(){
    if(typeof lgSeed==='function')lgSeed();
    hideChrome(true);
    const el=appEl();if(!el)return;
    const code=(typeof LG_PRESET!=='undefined'&&LG_PRESET&&LG_PRESET.code)||'ONIONSH2';
    const ev=evName();
    el.innerHTML=`<div class="lkf" id="lkloginpage" data-ev="${esc(code)}">
      <h1>Login</h1>
      <label for="lkevent">Select Event</label>
      <select id="lkevent"><option value="${esc(code)}" selected>${esc(ev)}</option></select>
      <label for="lkscorer">Scorer Full Name</label>
      <input id="lkscorer" type="text" maxlength="40" autocomplete="name" value="">
      <label for="lkcode">League code</label>
      <input id="lkcode" type="text" maxlength="8" autocapitalize="characters" autocomplete="off" value="">
      <label for="lkpw">Password</label>
      <input id="lkpw" type="password" autocomplete="off" value="">
      <p class="small muted">This is a demo league. Login and password can be left blank — no code or scoring password is required.</p>
      <p class="lk-msg" id="lkpwmsg" role="alert"></p>
      ${bar(btn('lkloginback','Back','grey'),btn('lkpwgo','Login','green'))}
    </div>`;
    const go=()=>{
      const n=($id('lkscorer').value||'').trim();
      if(n)setMyName(n);
      window._lkTarget=0;window._lkPicked=[];
      selectArchers();
    };
    $id('lkpwgo').onclick=go;
    $id('lkloginback').onclick=()=>home(code);
    $id('lkscorer').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go()}};
    $id('lkcode').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go()}};
    $id('lkpw').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go()}};
  }

  function osKnown(lg){
    const out=[];
    const add=(id,name)=>{
      const n=String(name||(id&&typeof lgName==='function'&&lgName(id))||id||'').trim();
      if(!n)return;
      let rec=id&&out.find(x=>x.id===id);
      if(!rec)rec=out.find(x=>x.name.toLowerCase()===n.toLowerCase());
      if(!rec){rec={id:id||null,name:n,nights:[]};out.push(rec)}
      if(id&&!rec.id)rec.id=id;
      if(n&&rec.name!==n){
        const looksLikeId=rec.name.toLowerCase()===(rec.id||'').toLowerCase();
        if(looksLikeId||n.length>rec.name.length)rec.name=n;
      }
      rec.nights=rec.nights||[];
      for(let w=1;w<=6;w++){
        if(!rec.nights.includes(w)&&((lg.reg||{})[String(w)]||[]).some(r=>r&&((id&&r.id===id)||String(r.name||'').toLowerCase()===n.toLowerCase())))rec.nights.push(w);
      }
    };
    for(const k in ((lg&&lg.reg)||{})){
      ((lg.reg[k])||[]).forEach(r=>{if(r)add(r.id,r.name)});
    }
    ((lg&&lg.order)||[]).forEach(id=>add(id,(typeof lgName==='function'&&lgName(id))||id));
    const hostId=(lg&&lg.host)||'nathe';
    return out.filter(a=>{
      const n=String(a.name||'').trim().toLowerCase();
      if(a.id===hostId||a.id==='nathe')return false;
      if(n==='nathe'||n==='nathaniel stride')return false;
      return true;
    });
  }
  function osSaveNights(lg,id,name,weeks){
    if(!lg)return 'The league is not on this phone yet.';
    lg.reg=lg.reg||{};
    const who=id||name;
    for(const w of weeks){
      const k=String(w);
      lg.reg[k]=lg.reg[k]||[];
      if(!lg.reg[k].some(r=>r&&(r.id===id||(name&&String(r.name||'').toLowerCase()===String(name).toLowerCase())))){
        lg.reg[k].push({id:id||null,name,at:Date.now()});
      }
    }
    lg.dirty=1;
    if(typeof save==='function')save();
    return '';
  }
  function osRegister(){
    if(typeof lgSeed==='function')lgSeed();
    hideChrome(true);
    const el=appEl();if(!el)return;
    const code=(typeof LG_PRESET!=='undefined'&&LG_PRESET&&LG_PRESET.code)||'ONIONSH2';
    const lg=typeof lgGet==='function'?lgGet(code):null;
    const can=!!(lg&&typeof lgCanEd==='function'&&lgCanEd(lg));
    const known=lg?osKnown(lg):[];
    const pick=window._osRegPick||null;
    const weekBoxes=[1,2,3,4,5,6].map(w=>{
      const d=(lg&&lg.weeks&&lg.weeks[w-1])||'';
      const lab=w<6?('Week '+w):'Day 6 (together)';
      const on=pick&&(pick.nights||[]).includes(w);
      return `<label class="lk-tick"><input type="checkbox" data-osw="${w}" ${on?'checked':''}> ${esc(lab)}${d?' · '+esc(d):''}</label>`;
    }).join('');
    const names=known.length?`<div class="lk-known" id="osknown"><p class="small muted">If you have already registered, tap your name, tick the weeks you will shoot and save.</p>${known.map(a=>`<button type="button" class="lk-known-btn${pick&&pick.id===a.id?' on':''}" data-osid="${esc(a.id)}">${esc(a.name)}</button>`).join('')}</div>`:'';
    el.innerHTML=`<div class="lkf" id="lkregpage" data-ev="${esc(code)}">
      <h1>Event Registration</h1>
      <p class="small muted">${esc(evName())}. Weeks 1 to 5 are a 300, in person or over FaceTime. Day 6 is a 300 together in the Onion Shed, then the shoot-up.</p>
      ${names}
      ${pick?`<p id="ospicked">Signing in as <b>${esc(pick.name)}</b>.</p>`:`<label for="lkgname">Name</label>
        <input id="lkgname" maxlength="24" autocomplete="name" placeholder="Your name">
        ${can?`<label class="h2htk" style="margin-top:6px"><input type="checkbox" id="lkgjr"> Under 16 (nickname only)</label>`:''}`}
      <p class="small" style="margin-top:10px">Weeks</p>
      <div id="osweeks">${weekBoxes}</div>
      <p class="lk-msg" id="lkregmsg" role="alert"></p>
      ${bar(btn('lkregback','Back','grey'),btn('lkreggo',pick?'Save':'Register','green'))}
      ${!can&&!known.length?'<p class="small muted">Ask the host to add you to this league if your name is not listed.</p>':''}
    </div>`;
    $id('lkregback').onclick=()=>{window._osRegPick=null;home(code)};
    el.querySelectorAll('[data-osid]').forEach(b=>b.onclick=()=>{
      const a=known.find(x=>x.id===b.getAttribute('data-osid'));
      window._osRegPick=a||null;
      osRegister();
    });
    $id('lkreggo').onclick=()=>{
      const msg=$id('lkregmsg');
      const weeks=[...el.querySelectorAll('[data-osw]:checked')].map(x=>+x.getAttribute('data-osw'));
      if(!weeks.length){if(msg)msg.textContent='Tick the weeks you will shoot.';return}
      let id=pick&&pick.id, name=pick&&pick.name;
      if(!pick){
        name=(($id('lkgname')||{}).value||'').trim();
        if(name.length<2){if(msg)msg.textContent='Type a name.';return}
        if(can&&typeof lgAddGuest==='function'){
          const already=known.find(a=>a.name.toLowerCase()===name.toLowerCase());
          if(!already){
            const jr=!!($id('lkgjr')&&$id('lkgjr').checked);
            const out=lgAddGuest(code,name,jr);
            if(out){if(msg)msg.textContent=out;return}
          }
        }else if(!known.some(a=>a.name.toLowerCase()===name.toLowerCase())){
          if(msg)msg.textContent='Ask the host to add you to this league first.';return
        }
        const fresh=typeof lgGet==='function'?lgGet(code):lg;
        const got=(typeof osKnown==='function'&&osKnown(fresh)||[]).find(a=>a.name.toLowerCase()===name.toLowerCase());
        if(got){id=got.id;name=got.name}
      }
      const L=typeof lgGet==='function'?lgGet(code):lg;
      const err=osSaveNights(L,id,name,weeks);
      if(err){if(msg)msg.textContent=err;return}
      window._osRegPick=null;
      if(msg)msg.textContent='You are registered for those weeks. Tap your name next time — you will not need to type it again.';
      setTimeout(()=>osRegister(),400);
    };
  }


  function osReview(){
    if(typeof lgSeed==='function')lgSeed();
    hideChrome(true);
    const el=appEl();if(!el)return;
    const code=(typeof LG_PRESET!=='undefined'&&LG_PRESET&&LG_PRESET.code)||'ONIONSH2';
    const lg=typeof lgGet==='function'?lgGet(code):null;
    if(!lg||typeof lgTable!=='function'){
      el.innerHTML=`<div class="lkf" id="lkreviewpage"><h1>Review Scoresheet</h1><p>This league is not on this phone yet.</p>${bar(btn('lkrevback','Back','grey'),'')}</div>`;
      $id('lkrevback').onclick=()=>home(code);
      return;
    }
    const rows=lgTable(lg);
    const tab=`<div class="lg-wrap"><table class="ad-tab lg-tab" id="ostab"><thead><tr><th></th><th>Archer</th>${[1,2,3,4,5,6].map(k=>`<th>W${k}</th>`).join('')}<th>Total</th><th>X</th></tr></thead><tbody>${rows.map((r,k)=>`<tr class="${k==0&&r.t>0&&!r.tie?'lead':''}"><td>${r.tie?'=':''}${r.rk}</td><td>${esc(r.nm)}</td>${r.W.map(c=>`<td>${c?(c.d?c.s:`<i class="muted">${c.s}</i>`):'-'}</td>`).join('')}<td><b>${r.t}</b></td><td>${r.x}</td></tr>`).join('')||'<tr><td colspan="9">No scores yet.</td></tr>'}</tbody></table></div>
      <p class="small muted">Max 1800. Ties split on X count. '-' = not shot; italics = still shooting.</p>`;
    el.innerHTML=`<div class="lkf" id="lkreviewpage">
      <h1>Review Scoresheet</h1>
      <p class="small muted">${esc(evName())}. Running total of all six 300s.</p>
      <div class="card">${tab}</div>
      ${bar(btn('lkrevback','Back','grey'),'')}
    </div>`;
    $id('lkrevback').onclick=()=>home(code);
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

  function pathIsPublicEvent(){
    const path=String(location.pathname||'');
    return /\/test(\/|$)/.test(path)||/scoretool-demo/i.test(path)||path==='/'||/\/index\.html$/.test(path);
  }
  function shouldBoot(){
    const q=new URLSearchParams(location.search);
    if(q.get('app')==='1')return false;
    if(q.has('tester'))return false;
    if(typeof lkIsResHash==='function'&&lkIsResHash())return false;
    const path=String(location.pathname||'');
    /* The /test/ page still opens the public event list. The live ScoreTool app at the root stays the normal app unless the URL is an event-home or old register link. */
    if(/\/test(\/|$)/.test(path))return true;
    return wantsEventHome();
  }
  function wantsEventHome(){
    if(typeof lkIsHomeHash==='function'&&lkIsHomeHash())return true;
    if(typeof lkIsRegHash==='function'&&lkIsRegHash())return true;
    return false;
  }

  /* Expose for tests and relay refresh */
  window.lkFlowHome=home;
  window.lkFlowList=list;
  window.lkFlowLogin=login;
  window.lkFlowSelect=selectArchers;
  window.lkFlowReview=review;
  window.lkFlowScore=scoreScreen;
  window.lkFlowEnter=enter;
  window.lkFlowHost=hostPw;
  window.lkFlowRules=rules;
  window.lkApplyClaim=applyClaim;
  window.lkMergeClaims=mergeClaimBag;
  window.lkSetClaim=setClaim;
  window.lkClaims=claims;
  window.lkClaimedByOther=claimedByOther;
  window.lkFlowHideChrome=hideChrome;

  const origView=window.lkView;
  window.lkView=function(code){
    hideChrome(true);
    if(typeof lkEnsure==='function'&&!isOnion(code))lkEnsure();
    home(code);
  };
  if(typeof origView==='function')window._lkViewOld=origView;

  /* After the app first paints, take over when this is the public test URL. */
  function boot(){
    if(!shouldBoot())return;
    if(window._lkFlowStarted)return;
    window._lkFlowStarted=1;
    hideChrome(true);
    if(wantsEventHome()){
      const code=(typeof LK_CODE==='string'&&LK_CODE)||'LINGKN26';
      try{history.replaceState(null,'',location.pathname+location.search+(window.LK_HOME_HASH||(typeof LK_HOME_HASH==='string'&&LK_HOME_HASH)||'#lk-home'))}catch(e){}
      home(code);
      return;
    }
    list();
  }
  addEventListener('hashchange',()=>{
    if(!pathIsPublicEvent())return;
    if(typeof lkIsResHash==='function'&&lkIsResHash())return;
    if(wantsEventHome()){
      const code=(typeof LK_CODE==='string'&&LK_CODE)||'LINGKN26';
      try{history.replaceState(null,'',location.pathname+location.search+(window.LK_HOME_HASH||(typeof LK_HOME_HASH==='string'&&LK_HOME_HASH)||'#lk-home'))}catch(e){}
      home(code);
    }
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(boot,0));
  else setTimeout(boot,0);
})();
