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
