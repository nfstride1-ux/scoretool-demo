/* ScoreTool demo: teen rewards (rarity badges, ranks, cheers, cards, league, seasons, recap).
   Uses only real stored data: the archer's own logged sessions, added arrows, notes, and official
   results/arrows imported from Archer's Diary (data/*.csv, read-only). No sample people, no fake numbers. */
const SVGI=p=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const ICON={
 dayone:SVGI('<path d="M5 19 19 5"/><path d="M15 5h4v4"/><path d="M5 15v4h4"/>'),
 century:'<svg viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="16.5" text-anchor="middle" font-size="11" font-weight="800" fill="currentColor" font-family="Barlow Condensed,Arial Narrow,sans-serif">100</text></svg>',
 locked:SVGI('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><path d="M12 15v2"/>'),
 xfactor:SVGI('<path d="M6 6l12 12M18 6 6 18"/><circle cx="12" cy="12" r="10" stroke-width="1.4"/>'),
 ceiling:SVGI('<path d="M4 4h16"/><path d="M12 20V8"/><path d="m7 13 5-5 5 5"/>'),
 ironarm:SVGI('<path d="M7 20V9l5-5 5 5v11"/><path d="M7 14h10"/><path d="M10 20v-3h4v3"/>'),
 hattrick:SVGI('<circle cx="6" cy="12" r="2.5"/><circle cx="12" cy="12" r="2.5"/><circle cx="18" cy="12" r="2.5"/><path d="M3 18h18"/>'),
 flawless:SVGI('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/>'),
 unbreak:SVGI('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
 weather:SVGI('<path d="M7 15a4 4 0 1 1 1-7.9A5 5 0 0 1 18 9a3.5 3.5 0 0 1-.5 7H7z"/><path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2"/>'),
 freeze:SVGI('<path d="M12 2v20M4.9 6.5l14.2 11M19.1 6.5 4.9 17.5"/>')};
const RARITY={common:'Common',rare:'Rare',epic:'Epic',legendary:'Legendary',mythic:'Mythic'};
/* [id, icon, name, rarity, how to earn] */
const BADGE_DEFS=[
 ['dayone','dayone','Day One','common','Log your first session or official round'],
 ['century','century','Century','common','100 arrows logged in total'],
 ['locked','locked','Locked In','rare','Practise 3 weeks in a row'],
 ['xfactor','xfactor','X Factor','rare','10 X\'s in total'],
 ['hattrick','hattrick','Hat Trick','rare','Three 10s or X\'s in a row in one end'],
 ['ceiling','ceiling','New Ceiling','epic','Beat your own personal best'],
 ['ironarm','ironarm','Iron Arm','epic','300 arrows in one day'],
 ['weather','weather','All Weather','epic','Shoot in the rain (add "rain" to that day\'s note)'],
 ['flawless','flawless','Flawless','legendary','A perfect end: every arrow a 10 or X'],
 ['unbreak','unbreak','Unbreakable','mythic','Practise 12 weeks in a row']];
const isTen=a=>a=='X'||a=='10';
/* Every end we have for an archer: own scored sessions + official arrows from Archer's Diary. */
function allEnds(name){const own=name==S.profile;const E=[];
 if(own)(S.sessions||[]).filter(s=>!s.sample).forEach(s=>s.ends.forEach(e=>E.push({date:s.date,arrows:e.map(String),src:'session'})));
 (OFF[name]||[]).forEach(o=>o.ends.forEach(e=>{if(!e.flag)E.push({date:normDate(o.date),arrows:e.arrows,src:'official'})}));return E}
function dayMap(name){if(name==S.profile)return dayArrows();const m={};(OFF[name]||[]).forEach(o=>{const d=normDate(o.date);m[d]=(m[d]||0)+o.ends.reduce((t,e)=>t+e.arrows.length,0)});return m}
function realFor(name){return name==S.profile?findReal(name):(REAL[name]||findReal(name))}
/* Weekly practice streak with streak freezes: 1 freeze earned per 4 straight weeks (max 2 banked). A missed week uses a freeze instead of breaking the streak. */
const wkNo=d=>Math.floor((new Date(d)-new Date('2024-01-01'))/6048e5);
function streakInfo(dm){const W=new Set(Object.keys(dm).filter(d=>dm[d]>0).map(wkNo));if(!W.size)return{cur:0,best:0,freezes:0,used:0};
 const ws=[...W].sort((a,b)=>a-b),now=wkNo(today());let run=0,best=0,fr=0,used=0,since=0;
 for(let w=ws[0];w<=now;w++){if(W.has(w)){run++;since++;if(since%4==0&&fr<2)fr++;best=Math.max(best,run)}
  else if(w==now){/* this week isn't over yet */}
  else if(fr>0){fr--;used++}else{run=0;since=0}}
 return{cur:run,best,freezes:fr,used}}
function pbBeaten(name){const own=name==S.profile;if(own&&done().some(s=>winsFor(s).some(w=>w[0]=='🏆')))return true;
 const m={};for(const r of realFor(name)){if(r.incomplete)continue;const k=r.round+'|'+r.division;if(m[k]!=null&&r.score>m[k])return true;m[k]=Math.max(m[k]||0,r.score)}return false}
function badgeFacts(name){const E=allEnds(name),dm=dayMap(name),st=streakInfo(dm),tot=Object.values(dm).reduce((a,b)=>a+b,0),xs=E.reduce((t,e)=>t+e.arrows.filter(a=>a=='X').length,0);
 const notes=name==S.profile?Object.values(S.notes||{}).join(' \n'):'';
 const has={dayone:tot>0||realFor(name).length>0,century:tot>=100,locked:st.best>=3,xfactor:xs>=10,
  hattrick:E.some(e=>e.arrows.some((a,i)=>isTen(a)&&isTen(e.arrows[i+1])&&isTen(e.arrows[i+2]))),
  ceiling:pbBeaten(name),ironarm:Object.values(dm).some(n=>n>=300),weather:/\brain(y|ing|ed)?\b/i.test(notes),
  flawless:E.some(e=>e.arrows.length>=3&&e.arrows.every(isTen)),unbreak:st.best>=12};
 return{has,E,dm,st,tot,xs}}
function earnedBadges(name){const f=badgeFacts(name);return BADGE_DEFS.map(d=>({id:d[0],icon:ICON[d[1]],name:d[2],rarity:d[3],how:d[4],on:!!f.has[d[0]]}))}
const hexIcon=(b,sm)=>`<span class="rc-${b.rarity}" style="display:inline-block"><span class="hex${sm?' sm':''}" title="${b.name} · ${RARITY[b.rarity]}">${b.icon}</span></span>`;
function badgeCard(b){return`<div class="bcard rc-${b.rarity} ${b.on?'':'off'}" tabindex="0" title="${esc(b.how)}">${hexIcon(b)}<b>${b.name}</b><small>${RARITY[b.rarity]}${b.on?'':' · locked'}</small><div class="small muted" style="font-size:12px;margin-top:4px">${esc(b.how)}</div></div>`}
/* Keep the old helpers working with the new set: [iconHTML, name, earned] */
badges=function(){return earnedBadges(S.profile).map(b=>[hexIcon(b,1),b.name,b.on])};
shelf=function(){const B=earnedBadges(S.profile),n=B.filter(b=>b.on).length;return`<div class="card"><div class="row"><span class="kicker">Badges · ${n}/${B.length}</span><button class="btn ghost" style="padding:6px 12px;min-height:36px" onclick="nav('badges')">View all</button></div>${iconRow(badges(),26)}</div>`};
function badgesView(){const B=earnedBadges(S.profile),f=badgeFacts(S.profile),order=['mythic','legendary','epic','rare','common'];
 app.innerHTML=`<div class="card dark"><span class="kicker">Badges</span><h1>The Collection</h1><p class="small muted" style="margin:0">${B.filter(b=>b.on).length} of ${B.length} unlocked. Earned only from your real logged arrows and official results.</p></div>
 <div class="card"><div class="grid3">${B.map(badgeCard).join('')}</div>
 <p class="small muted" style="margin-top:10px">Rarity: <b style="color:var(--r-common)">Common</b> · <b style="color:var(--r-rare)">Rare</b> · <b style="color:var(--r-epic)">Epic</b> · <b style="color:var(--r-leg)">Legendary</b> · <b style="color:var(--r-myth)">Mythic</b>. "% of archers who have this" appears once ScoreTool is live and there are enough archers to count.</p></div>
 <div class="card"><span class="kicker">Streak</span><div class="row"><span><b style="font:800 30px var(--disp)">${f.st.cur}</b> week${f.st.cur==1?'':'s'} in a row · best ${f.st.best}</span><span class="small" title="Streak freezes">${ICON.freeze.replace('<svg','<svg width="18" height="18" style="vertical-align:-3px"')} ${f.st.freezes} freeze${f.st.freezes==1?'':'s'}</span></div>
 <p class="small muted" style="margin:6px 0 0">You earn a freeze every 4 weeks in a row (up to 2). Miss a week and a freeze keeps your streak alive automatically. Rest weeks are fine.</p></div>`}
window.EXTRA_VIEWS={badges:badgesView};
/* ---------- Rank tiers from real Archery Australia classifications ----------
   AA Shooting Rules v7.2 (July 2026) 4.1 + Schedule 4A.1: a classification needs THREE rounds in the
   calendar year at or above the rating level for your category (bow type + age/gender), rating from the
   Archer's Diary calculator (ratings.js reproduces it). Only verified official results from Archer's Diary count.
   Game tier = ScoreTool's own label for each AA level; the I-III split inside a band is ScoreTool's, not AA's. */
const TIER_OF={'White':'Bronze','Black':'Silver','Blue':'Gold','Red':'Platinum','Gold':'Diamond','Master':'Champion','Grand Master':'Champion','Elite Bronze':'Elite','Elite Silver':'Elite','Elite Gold':'Elite'};
const FIXED_DIV={'Master':'II','Grand Master':'I','Elite Bronze':'III','Elite Silver':'II','Elite Gold':'I'};
const AA_NAME={'Master':'Master Bowman','Grand Master':'Grand Master Bowman'};
const isIndoor=r=>/indoor/i.test(r.round);
function ratedRounds(name,year,disc){return realFor(name).filter(r=>!r.incomplete&&(!year||normDate(r.date).slice(0,4)==year)&&(!disc||(disc=='Indoor')==isIndoor(r))).map(r=>{const c=aaCategory(r.division);
 const rt=c?aaRating(r.score,r.round,c.bow=='Compound'&&r.round=='WA Indoor 18m'):null;return{...r,cat:c,rating:rt}})}
function rankFor(name,disc){if(!disc){const o=rankFor(name,'Outdoor'),i=rankFor(name,'Indoor'),sc=r=>({ranked:3,below:2,placement:1}[r.state]||0)*1000+(r.r3||r.best||0);const x=sc(i)>sc(o)?i:o;x.other=x===o?i:o;return x}
 const yr=today().slice(0,4),all=ratedRounds(name,yr,disc),latest=realFor(name).filter(r=>!r.incomplete&&(disc=='Indoor')==isIndoor(r)).slice(-1)[0];
 const bowTxt=latest?(latest.division.match(/compound|recurve|barebow|longbow/i)||['?'])[0]:null;
 if(!latest)return{state:'none',disc};const cat=aaCategory(latest.division);
 if(!cat)return{state:'provisional',disc,bow:bowTxt,why:`Rank tiers for ${bowTxt} aren't loaded yet. ScoreTool currently has Archery Australia's Recurve and Compound tables. Treat any rank here as provisional.`};
 const R=all.filter(r=>r.cat&&r.cat.bow==cat.bow&&r.cat.key==cat.key&&r.rating!=null).sort((a,b)=>b.rating-a.rating),unrated=all.filter(r=>r.rating==null).length;
 const L=AA_CLASS[cat.bow][cat.key];if(!L)return{state:'provisional',bow:bowTxt,why:'No Archery Australia table for this age class yet.'};
 const base={disc,bow:cat.bow,cls:cat.key,n:R.length,unrated,rounds:R};
 if(R.length<3)return{...base,state:'placement',best:R[0]?R[0].rating:null};
 const r3=R[2].rating,i=L.findIndex(v=>r3>=v);if(i<0){return{...base,state:'below',r3,toWhite:+(L[9]-r3).toFixed(1)}}
 const lvl=AA_LEVELS[i],tier=TIER_OF[lvl];let div=FIXED_DIV[lvl],next=null;
 if(!div){const lo=L[i],hi=L[i-1],step=(hi-lo)/3,k=Math.min(2,Math.floor((r3-lo)/step));div=['III','II','I'][k];const nxtNeed=k<2?lo+step*(k+1):hi;next={need:nxtNeed,pts:+(nxtNeed-r3).toFixed(1),label:k<2?tier+' '+['III','II','I'][k+1]:TIER_OF[AA_LEVELS[i-1]]+' '+(FIXED_DIV[AA_LEVELS[i-1]]||'III'),p:(r3-lo)/(hi-lo)}}
 else if(i>0)next={need:L[i-1],pts:+(L[i-1]-r3).toFixed(1),label:TIER_OF[AA_LEVELS[i-1]]+' '+FIXED_DIV[AA_LEVELS[i-1]],p:(r3-L[i])/(L[i-1]-L[i])};
 return{...base,state:'ranked',prov:i<=4,lvl,aa:AA_NAME[lvl]||lvl,tier,div,r3,next,date:normDate(R.map(r=>r.date).sort()[R.length-1])}}
const tierPill=rk=>rk&&rk.state=='ranked'?`<span class="pill t-${rk.tier.toLowerCase()}">${rk.tier} ${rk.div}</span>`:`<span class="pill t-none">${rk&&rk.state=='placement'?'Placement':'Unranked'}</span>`;
function emblem(rk,size=64){const t=rk&&rk.state=='ranked'?rk.tier.toLowerCase():'none',C={bronze:'#c07a3a',silver:'#c9d1dc',gold:'#ffc629',platinum:'#38e1ff',diamond:'#a5f3fc',champion:'#ff6b6b',elite:'#d48bff',none:'#475569'}[t];
 const pips=rk&&rk.state=='ranked'?({I:3,II:2,III:1}[rk.div]):0;
 return`<svg width="${size}" height="${size}" viewBox="0 0 64 64" role="img" aria-label="${rk&&rk.state=='ranked'?rk.tier+' '+rk.div:'Unranked'}"><defs><linearGradient id="eg${t}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C}"/><stop offset="1" stop-color="${C}" stop-opacity=".35"/></linearGradient></defs><path d="M32 3 57 15v18c0 14-11 24-25 28C18 57 7 47 7 33V15z" fill="url(#eg${t})" stroke="${C}" stroke-width="2"/><circle cx="32" cy="29" r="11" fill="none" stroke="#0b0f17" stroke-width="3"/><circle cx="32" cy="29" r="4" fill="#0b0f17"/>${[...Array(pips)].map((_,k)=>`<rect x="${32-(pips*8-3)/2+k*8}" y="46" width="5" height="5" fill="#0b0f17" transform="rotate(45 ${32-(pips*8-3)/2+k*8+2.5} 48.5)"/>`).join('')}</svg>`}
function rankCard(name){const rk=rankFor(name),yr=today().slice(0,4);let body;
 if(rk.state=='none')body=`<p><b>Unranked.</b> Rank tiers come from official scores in Archer's Diary. Shoot a round at a registered club or tournament shoot and it'll count.</p>`;
 else if(rk.state=='provisional')body=`<p><span class="est">Provisional</span> ${esc(rk.why)}</p>`;
 else if(rk.state=='placement')body=`<p><b>Placement rounds: ${rk.n} of 3</b> in ${yr}.</p><div class="bar"><i style="width:${rk.n/3*100}%"></i></div><p class="small muted">Archery Australia needs three official rounds in the calendar year to set a classification, so your tier unlocks after round 3.${rk.best!=null?` Best rating so far: ${rk.best}.`:''}</p>`;
 else if(rk.state=='below')body=`<p><b>Unranked</b> · ${rk.toWhite} rating points to <b>Bronze III</b>.</p>`;
 else body=`<div class="row" style="justify-content:flex-start;gap:12px">${emblem(rk,72)}<div><h2 style="margin:0">${rk.tier} ${rk.div}</h2><div class="small muted">${rk.disc} · Archery Australia <b>${rk.aa}</b> · ${rk.bow} · ${rk.cls}</div>${rk.prov?'<span class="est" title="Not checked by ScoreTool">Provisional</span>':''}</div></div>
  ${rk.prov?'<p class="small muted" style="margin:6px 0 0">Master Bowman and above also need rounds at an open tournament or QRE (AA rule 4.1). ScoreTool can\'t check that yet, so this tier is provisional until your club confirms it.</p>':''}
  ${rk.next?`<div class="bar" style="margin-top:10px"><i style="width:${Math.round(Math.max(.03,Math.min(1,rk.next.p))*100)}%"></i></div><p class="small" style="margin:6px 0 0">${rk.next.pts} rating points to <b>${rk.next.label}</b> (on your 3rd-best round)</p>`:'<p class="small">Top of the ladder.</p>'}`;
 const oth=rk.other;const othTxt=oth&&oth.state=='ranked'?`${oth.disc}: <b>${oth.tier} ${oth.div}</b> (${oth.aa})`:oth&&oth.state=='placement'?`${oth.disc}: placement ${oth.n}/3`:oth&&oth.state=='below'?`${oth.disc}: unranked`:'';
 return`<div class="card" id="rankcard"><span class="kicker">Rank · ${yr} · verified scores only</span>${body}${othTxt?`<p class="small muted" style="margin:8px 0 0">Also ${othTxt}. Outdoor and indoor are separate classifications.</p>`:''}
 <details style="margin-top:8px"><summary class="small"><b>How ranks work</b></summary><p class="small muted">Your tier is your Archery Australia classification for ${yr}: your <b>third-best</b> rating from official rounds this calendar year, by bow type and age class, with outdoor and indoor counted separately (AA Shooting Rules v7.2, Schedule 4A.1). Practice and self-logged scores never count, so nobody can grind or buy a rank.</p>
 <table class="small" style="width:100%;border-collapse:collapse">${['White','Black','Blue','Red','Gold','Master','Grand Master','Elite Bronze','Elite Silver','Elite Gold'].map(l=>`<tr><td style="padding:2px 0">${AA_NAME[l]||l}</td><td style="text-align:right"><span class="pill t-${TIER_OF[l].toLowerCase()}">${TIER_OF[l]}${FIXED_DIV[l]?' '+FIXED_DIV[l]:' III–I'}</span></td></tr>`).join('')}</table>
 <p class="small muted">I–III inside Bronze to Diamond splits each AA band into thirds by rating. That split is ScoreTool's, not Archery Australia's. Barebow and Longbow tables aren't loaded yet, so those show as provisional.${rk.unrated?` ${rk.unrated} of your rounds this year use a round ScoreTool can't rate yet.`:''}</p></details></div>`}
function rankFeed(m,n){const rk=rankFor(m.name);return rk.state=='ranked'?[{id:m.id+'r'+rk.tier+rk.div,date:rk.date,who:m,html:`<b>${esc(n)}</b> ranked <b style="color:var(--cyan)">${rk.tier} ${rk.div}</b>`,sub:'Archery Australia '+rk.aa+' · verified',ver:'official'}]:[]}
function rewardsView(){const p=S.profile;
 app.innerHTML=`${window.profileCard?profileCard(p,true):''}${rankCard(p)}${window.leagueCard?leagueCard():''}${window.seasonCard?seasonCard():''}${window.recapTeaser?recapTeaser():''}${shelf()}`;
 if(window.bindRewards)bindRewards()}
window.EXTRA_VIEWS.rewards=rewardsView;
