/* Arrow plots and round analysis (23 Oct 2026, Steven: the stats heatmap was blocky squares that didn't match where arrows landed).
   - shotPts(s): every PLOTTED arrow of a session, put on one face per family: 'target' (WA 10-zone, 3-spot arrows moved onto one
     spot, units of the full face: 0.1 = one ring) or 'field' (WA field 6-1, 20cm column arrows already per spot: 1 = face edge).
     Keypad arrows have no position and are never drawn or guessed.
   - plotCard(list): real dots at real positions, soft density shading (the face is dimmed where no arrows landed), the group
     centre, the average offset in rings (and mm when every arrow's face size is known) and a windage / elevation sight guide.
   - shotPlotCard(s,prev): this shoot's plot with its group centre against the archer's usual group (earlier shoots of the same round),
     used on the end-of-shoot screen and Past sessions > Open (insights.js shootCompareHTML). Read only: never changes a session.
   - Session finished (EXTRA_VIEWS.shotdone): the done state after Finish session. The round is already saved; nothing is written. */
(function(){
const H=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const IC=n=>(window.icon&&icon(n))||'';
/* WA face colours (Book 2 / Book 4): white, black, light blue, red, gold. Field faces are black with a gold centre. */
const WA={w:'#ffffff',k:'#111111',b:'#00a3e0',r:'#e4002b',g:'#ffe552'};
const NAVY='#0b1f4d',GOLD='#ffc629',BLUE='#5ab0ff';
const fin=v=>typeof v=='number'&&isFinite(v);
function shotPts(s){const R0=s&&ROUNDS[s.round];const out={target:[],field:[]};if(!R0||R0.aba)return out;
 (s.pos||[]).forEach((E,i)=>(E||[]).forEach((p,j)=>{if(!p||!fin(p.x)||!fin(p.y))return;const F=faceR(R0,i);let x=p.x,y=p.y,mm=null,k;
  let r=0.028,sp,lay,rx,ry;/* r = the arrow's own radius on the face (the same line-cutter allowance plotScore scores with), so a dot that scored a ring touches it */
  if(bugsOn(s)){const c=BUGC.reduce((b,q)=>Math.hypot(p.x-q[0],p.y-q[1])<Math.hypot(p.x-b[0],p.y-b[1])?q:b,BUGC[0]);x=(p.x-c[0])/0.3;y=(p.y-c[1])/0.3;k='bugs';r=0.023/0.3}
  else if(isFld(F)){const e=(s.ff||[])[i];mm=e&&e.f?e.f*5:null;k='field'}/* 20cm column: stored per spot already */
  else{if(use3(s,R0,F)){const L=s.face3=='vegas'?TRIC:BUGC,q=to1spot(p,L);x=q.x;y=q.y;k='spot';r=0.035;lay=s.face3=='vegas'?'vegas':'vert';sp=L.reduce((b,c,n)=>Math.hypot(p.x-c[0],p.y-c[1])<Math.hypot(p.x-L[b][0],p.y-L[b][1])?n:b,0);rx=p.x;ry=p.y}else k=isSix(F)?'six':isSpot(F)?'spot':'full';
   const cm=+(((F.face||'').match(/^(\d+)cm/)||[])[1]||0);mm=cm?cm*5:null}
  out[k=='field'||k=='bugs'?'field':'target'].push({x,y,mm,k,r,sp,lay,rx,ry,e:i,j,a:(s.ends[i]||[])[j]})}));
 return out}
let uid=0;
function faceSvg(fam,P,zR){const ks=new Set(P.map(p=>p.k));let g='',hw;
 if(fam=='field'){hw=1.06;if(ks.size==1&&ks.has('bugs'))[6,5,4,3,2,1].forEach(z=>{const y=z<=2;g+=`<circle r="${(z/6).toFixed(4)}" fill="${y?WA.g:WA.k}" stroke="${y?WA.k:WA.w}" stroke-width="0.006"/>`});
  else[1,.8,.6,.4,.2,.1].forEach((r,i)=>{const y=i>3;g+=`<circle r="${r}" fill="${y?WA.g:WA.k}" stroke="${y?WA.k:WA.w}" stroke-width="0.006"/>`})}
 else{let lo=ks.has('full')?0:ks.has('six')?4:5;hw=lo==0?1.06:lo==4?0.64:0.54;
  if(zR){const z=Math.max(lo,Math.min(7,Math.round((1-zR.R)*10)));if(z>lo){lo=z;hw=Math.max(1-lo*0.1,zR.ext)*1.08}}/* zoomed: only the scoring rings the arrows reach (never fewer than 8 to 10) */
  const C=[WA.w,WA.w,WA.k,WA.k,WA.b,WA.b,WA.r,WA.r,WA.g,WA.g],L=[WA.k,WA.k,WA.w,WA.w,WA.k,WA.k,WA.k,WA.k,WA.k,WA.k];
  for(let i=lo;i<10;i++)g+=`<circle r="${(1-i*0.1).toFixed(2)}" fill="${C[i]}" stroke="${L[i]}" stroke-width="0.005"/>`;g+=`<circle r="0.05" fill="none" stroke="${WA.k}" stroke-width="0.004"/>`}
 const s=hw/1.06;return{g,hw,s}}
/* average offset and spread; ring = 0.1 face units on target faces, 0.2 (one outer zone) on field faces */
function group(P,fam){const n=P.length;if(!n)return null;const cx=P.reduce((t,p)=>t+p.x,0)/n,cy=P.reduce((t,p)=>t+p.y,0)/n,ring=fam=='field'?0.2:0.1;
 const allMM=P.every(p=>p.mm),mx=allMM?P.reduce((t,p)=>t+p.x*p.mm,0)/n:null,my=allMM?P.reduce((t,p)=>t+p.y*p.mm,0)/n:null;
 const sp=P.reduce((t,p)=>t+Math.hypot(p.x-cx,p.y-cy),0)/n,spm=allMM?P.reduce((t,p)=>t+Math.hypot((p.x-cx)*p.mm,(p.y-cy)*p.mm),0)/n:null;
 return{n,cx,cy,ring,mx,my,sp,spm}}
const rs=(v,ring,unit)=>{const r=Math.abs(v)/ring;return(r<0.95?r.toFixed(1):r<9.5?(Math.round(r*10)/10).toFixed(1):Math.round(r))+' '+unit};
function guide(G,fam){if(!G||G.n<3)return`<p class="small muted shg-note">Plot at least 3 arrows to see the group centre and a sight guide.</p>`;
 const unit=fam=='field'?'zones':'rings',TH=G.ring*0.25,mmT=v=>v==null?'':` (${Math.round(Math.abs(v))} mm)`;
 const lr=Math.abs(G.cx)<TH?null:G.cx<0?'left':'right',ud=Math.abs(G.cy)<TH?null:G.cy<0?'high':'low';
 const off=`<div class="shg-row"><span>Left / right</span><b>${lr?rs(G.cx,G.ring,unit)+mmT(G.mx)+' '+lr:'centred'}</b></div><div class="shg-row"><span>Up / down</span><b>${ud?rs(G.cy,G.ring,unit)+mmT(G.my)+' '+ud:'centred'}</b></div><div class="shg-row"><span>Average spread</span><b>${rs(G.sp,G.ring,unit)}${mmT(G.spm)} from the group centre</b></div>`;
 const w=lr?`Windage: move the sight <b>${lr}</b>.`:'Windage: no change, the group is centred left to right.',e=ud?`Elevation: move the sight <b>${ud=='high'?'up':'down'}</b>.`:'Elevation: no change, the group is centred up and down.';
 return`<div class="shg-tab">${off}</div><div class="shg-guide"><span class="kicker">Sight move guide</span><p>${w}<br>${e}</p><p class="small muted" style="margin:0">Move the sight towards the group. Based on ${plN(G.n,'plotted arrow','plotted arrows')}; small offsets are left alone. Change marks a little at a time.</p></div>`}
function plotSvg(fam,P,label,U,o){if(o&&o.clean)return cleanSvg(fam,P,label,U);const F=faceSvg(fam,P.concat(U||[])),hw=F.hw,s=F.s,G=group(P,fam),UG=U&&U.length>=3?group(U,fam):null,id='shm'+(++uid);
 let g=`<svg class="shplot" viewBox="${-hw} ${-hw} ${2*hw} ${2*hw}" role="img" aria-label="${H(label)}"><defs><radialGradient id="${id}g"><stop offset="0" stop-color="#000" stop-opacity=".9"/><stop offset=".55" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
 <mask id="${id}"><rect x="${-hw}" y="${-hw}" width="${2*hw}" height="${2*hw}" fill="#fff"/>${P.map(p=>`<circle cx="${p.x.toFixed(3)}" cy="${p.y.toFixed(3)}" r="${(0.16*s).toFixed(3)}" fill="url(#${id}g)"/>`).join('')}</mask></defs>${F.g}
 <rect x="${-hw}" y="${-hw}" width="${2*hw}" height="${2*hw}" fill="${NAVY}" opacity=".5" mask="url(#${id})"/>`;
 P.forEach(p=>{const x=p.x.toFixed(3),y=p.y.toFixed(3);/* the arrow itself (its edge is what touches a ring line when it is scored), with its centre dot */
  g+=`<circle cx="${x}" cy="${y}" r="${(p.r||0.028).toFixed(4)}" fill="#fefefe" fill-opacity=".3" stroke="${NAVY}" stroke-opacity=".55" stroke-width="${(0.006*s).toFixed(4)}"/><circle cx="${x}" cy="${y}" r="${(0.014*s).toFixed(4)}" fill="#fff" stroke="${NAVY}" stroke-width="${(0.008*s).toFixed(4)}"/>`});
 if(UG){const x=UG.cx.toFixed(3),y=UG.cy.toFixed(3),r=Math.max(UG.sp,0.02).toFixed(3);/* usual group: blue dashed ring + hollow centre */
  g+=`<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${NAVY}" stroke-width="${(0.02*s).toFixed(3)}"/><circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${BLUE}" stroke-width="${(0.009*s).toFixed(3)}" stroke-dasharray="${0.02*s} ${0.025*s}"/><circle cx="${x}" cy="${y}" r="${(0.045*s).toFixed(3)}" fill="none" stroke="${NAVY}" stroke-width="${(0.03*s).toFixed(3)}"/><circle cx="${x}" cy="${y}" r="${(0.045*s).toFixed(3)}" fill="none" stroke="${BLUE}" stroke-width="${(0.014*s).toFixed(3)}"/>`}
 if(G&&G.n>=3){const c=0.075*s,x=G.cx.toFixed(3),y=G.cy.toFixed(3),d=`M${G.cx-c} ${G.cy}H${G.cx+c}M${G.cx} ${G.cy-c}V${G.cy+c}`;
  g+=`<circle cx="${x}" cy="${y}" r="${Math.max(G.sp,0.02).toFixed(3)}" fill="none" stroke="${NAVY}" stroke-width="${(0.02*s).toFixed(3)}"/><circle cx="${x}" cy="${y}" r="${Math.max(G.sp,0.02).toFixed(3)}" fill="none" stroke="${GOLD}" stroke-width="${(0.009*s).toFixed(3)}" stroke-dasharray="${0.04*s} ${0.03*s}"/>
  <path d="${d}" stroke="${NAVY}" stroke-width="${(0.04*s).toFixed(3)}" stroke-linecap="round"/><path d="${d}" stroke="${GOLD}" stroke-width="${(0.018*s).toFixed(3)}" stroke-linecap="round"/>`}
 return{svg:g+'</svg>',G,UG}}
/* 'Where this shoot landed' face (30 Oct 2026, Nathe: "the single face looks shit ... it doesn't look correct"): clean WA colours like the three-spot view,
   no dimming or glow over the rings, zoomed to the scoring rings the arrows reach, the group and usual-group rings drawn under the arrows,
   and an open centre cross (gap in the middle) plus a small usual-group ring on top, so no arrow is covered. Same points, same group maths. */
function cleanSvg(fam,P,label,U){const G=group(P,fam),UG=U&&U.length>=3?group(U,fam):null;let zR=null;
 if(fam=='target'){let ext=0;P.forEach(p=>{ext=Math.max(ext,Math.hypot(p.x,p.y)+(p.r||0.028))});
  [G&&G.n>=3?G:null,UG].forEach(q=>{if(q)ext=Math.max(ext,Math.hypot(q.cx,q.cy)+Math.max(q.sp,0.02))});
  zR={ext,R:Math.min(1,Math.ceil((ext+0.004)*10-1e-9)/10)}}
 const F=faceSvg(fam,P.concat(U||[]),zR),hw=F.hw,s=F.s,K='#0b1f4d';
 let g=`<svg class="shplot shclean" viewBox="${-hw} ${-hw} ${2*hw} ${2*hw}" role="img" aria-label="${H(label)}">${F.g}`;
 if(UG)g+=`<circle cx="${UG.cx.toFixed(3)}" cy="${UG.cy.toFixed(3)}" r="${Math.max(UG.sp,0.02).toFixed(3)}" fill="none" stroke="${BLUE}" stroke-width="${(0.011*s).toFixed(4)}" stroke-dasharray="${(0.03*s).toFixed(4)} ${(0.022*s).toFixed(4)}"/>`;
 if(G&&G.n>=3)g+=`<circle cx="${G.cx.toFixed(3)}" cy="${G.cy.toFixed(3)}" r="${Math.max(G.sp,0.02).toFixed(3)}" fill="none" stroke="${K}" stroke-width="${(0.011*s).toFixed(4)}" stroke-dasharray="${(0.03*s).toFixed(4)} ${(0.022*s).toFixed(4)}"/>`;
 P.forEach(p=>{const x=p.x.toFixed(3),y=p.y.toFixed(3);
  g+=`<circle cx="${x}" cy="${y}" r="${(p.r||0.028).toFixed(4)}" fill="#fefefe" fill-opacity=".3" stroke="${K}" stroke-opacity=".6" stroke-width="${(0.005*s).toFixed(4)}"/><circle cx="${x}" cy="${y}" r="${(0.0125*s).toFixed(4)}" fill="#fff" stroke="${K}" stroke-width="${(0.0075*s).toFixed(4)}"/>`});
 if(UG)g+=`<circle cx="${UG.cx.toFixed(3)}" cy="${UG.cy.toFixed(3)}" r="${(0.02*s).toFixed(4)}" fill="none" stroke="${K}" stroke-width="${(0.02*s).toFixed(4)}"/><circle cx="${UG.cx.toFixed(3)}" cy="${UG.cy.toFixed(3)}" r="${(0.02*s).toFixed(4)}" fill="none" stroke="${BLUE}" stroke-width="${(0.011*s).toFixed(4)}"/>`;
 if(G&&G.n>=3){const a=0.032*s,c=0.12*s,X=G.cx,Y=G.cy,d=`M${(X-c).toFixed(4)} ${Y.toFixed(4)}H${(X-a).toFixed(4)}M${(X+a).toFixed(4)} ${Y.toFixed(4)}H${(X+c).toFixed(4)}M${X.toFixed(4)} ${(Y-c).toFixed(4)}V${(Y-a).toFixed(4)}M${X.toFixed(4)} ${(Y+a).toFixed(4)}V${(Y+c).toFixed(4)}`;
  g+=`<path d="${d}" stroke="${K}" stroke-width="${(0.032*s).toFixed(4)}" stroke-linecap="round"/><path d="${d}" stroke="${GOLD}" stroke-width="${(0.017*s).toFixed(4)}" stroke-linecap="round"/>`}
 return{svg:g+'</svg>',G,UG}}
/* The three spots as they are on the target (Vegas triangle) or side by side (vertical 3-spot), each arrow on the spot it was shot at, own rings, same ring colours.
   Each arrow is drawn at its true place with its own radius, so the ring it scored is the ring its edge touches. Read only. */
const SPW={vegas:[[-0.34,-0.2],[0.34,-0.2],[0,0.39]],vert:[[-0.66,0],[0,0],[0.66,0]]};
function spotsSvg(P){const S=P.filter(p=>p.sp!=null&&p.lay);if(!S.length||S.some(p=>p.lay!=S[0].lay))return'';const lay=S[0].lay,C=SPW[lay],vb=lay=='vegas'?'-0.66 -0.56 1.32 1.3':'-0.99 -0.34 1.98 0.68';
 const Cc=[WA.w,WA.w,WA.k,WA.k,WA.b,WA.b,WA.r,WA.r,WA.g,WA.g],L=[WA.k,WA.k,WA.w,WA.w,WA.k,WA.k,WA.k,WA.k,WA.k,WA.k],orig=lay=='vegas'?TRIC:BUGC;let g='';
 C.forEach((c,n)=>{for(let i=5;i<10;i++)g+=`<circle cx="${c[0]}" cy="${c[1]}" r="${((1-i*0.1)*0.6).toFixed(3)}" fill="${Cc[i]}" stroke="${L[i]}" stroke-width="0.004"/>`;
  g+=`<text x="${c[0]}" y="${(c[1]-0.315).toFixed(3)}" text-anchor="middle" font-size="0.07" font-weight="700" fill="#cfe0ff">Spot ${n+1}</text>`});
 S.forEach(p=>{const c=C[p.sp],o=orig[p.sp],x=(c[0]+p.rx-o[0]).toFixed(3),y=(c[1]+p.ry-o[1]).toFixed(3);
  g+=`<circle cx="${x}" cy="${y}" r="${(p.r*0.6).toFixed(4)}" fill="#fefefe" fill-opacity=".3" stroke="${NAVY}" stroke-opacity=".6" stroke-width="0.003"/><circle cx="${x}" cy="${y}" r="0.0075" fill="#fff" stroke="${NAVY}" stroke-width="0.0045"/>`});
 const n=[0,0,0];S.forEach(p=>n[p.sp]++);
 return`<div class="shwrap shspots"><svg class="shspotsvg" viewBox="${vb}" role="img" aria-label="${S.length} plotted arrows on the three spots (${n.join(', ')})">${g}</svg></div><p class="small muted shkey">The three spots${lay=='vegas'?' as on the Vegas target':' side by side, Spot 1 at the top of the target'} · arrows per spot: ${n.join(', ')}</p>`}
const famName={target:'target face',field:'field face'};
/* one card per face family that has plotted arrows */
function plotCards(sessions,o={}){const A={target:[],field:[]};sessions.forEach(s=>{const q=shotPts(s);A.target.push(...q.target);A.field.push(...q.field)});
 const fams=['target','field'].filter(f=>A[f].length);if(!fams.length)return'';
 return fams.map(f=>{const P=A[f],{svg,G}=plotSvg(f,P,`${P.length} plotted arrows on a ${famName[f]}`),spot=f=='target'&&!P.some(p=>p.k=='full');
  return`<div class="card shcard"><span class="kicker">${plN(P.length,'plotted arrow','plotted arrows')}${fams.length>1?' · '+famName[f]:''}</span><h3>${H(o.title||'Where your arrows landed')}</h3>
  <div class="shwrap">${svg}</div><p class="small muted shkey"><span class="shk-dot"></span> each arrow <span class="shk-x"></span> group centre · darker face = no arrows there${spot?' · 3-spot arrows shown on one spot':''}${f=='field'&&P.some(p=>p.k=='bugs')?' · Bugs Eyes arrows shown on one spot':''}</p>
  ${f=='target'?spotsSvg(P):''}${guide(G,f)}${o.multi&&sessions.length>1?`<p class="small muted" style="margin:6px 0 0">From ${plN(sessions.length,'shoot','shoots')}. Sight marks change with distance, so check one round and distance at a time for sight moves.</p>`:''}</div>`}).join('')}
window.shotPts=shotPts;window.shotPlotCards=plotCards;
/* end-of-shoot / Past sessions: this shoot's plot, its group centre and sight guide, and the usual group from earlier plotted shoots of the same round */
const offTxt=(G,fam)=>{const unit=fam=='field'?'zones':'rings',TH=G.ring*0.25,mmT=v=>v==null?'':` (${Math.round(Math.abs(v))} mm)`;
 const a=Math.abs(G.cx)<TH?'centred':rs(G.cx,G.ring,unit)+mmT(G.mx)+' '+(G.cx<0?'left':'right'),b=Math.abs(G.cy)<TH?'centred':rs(G.cy,G.ring,unit)+mmT(G.my)+' '+(G.cy<0?'high':'low');return a+', '+b};
function shotPlotCard(sess,prev){const q=shotPts(sess),fams=['target','field'].filter(f=>q[f].length);if(!fams.length)return'';
 return fams.map(f=>{const U=[];let nU=0;(prev||[]).forEach(p=>{const x=shotPts(p)[f];if(x.length){U.push(...x);nU++}});
  const P=q[f],{svg,G,UG}=plotSvg(f,P,`${P.length} plotted arrows on a ${famName[f]}`,U,{clean:true}),spot=f=='target'&&!P.concat(U).some(p=>p.k=='full');
  return`<div class="card shcard"><span class="kicker">Where this shoot landed</span><h3>${plN(P.length,'plotted arrow','plotted arrows')}</h3><div class="shwrap">${svg}</div>
  <p class="small muted shkey"><span class="shk-dot"></span> this shoot <span class="shk-x"></span> its group centre${UG?' <span class="shk-u"></span> your usual group':''}${spot?' · 3-spot arrows shown on one spot':''}</p>
  ${f=='target'?spotsSvg(P):''}${guide(G,f)}${UG&&G&&G.n>=3?`<div class="shg-tab" style="margin-top:8px"><div class="shg-row"><span>Your usual group</span><b>${offTxt(UG,f)}</b></div><div class="shg-row"><span>Usual spread</span><b>${rs(UG.sp,UG.ring,f=='field'?'zones':'rings')}</b></div></div><p class="small muted" style="margin:4px 0 0">Usual = ${plN(UG.n,'plotted arrow','plotted arrows')} from ${plN(nU,'earlier shoot','earlier shoots')} of this round.</p>`:''}</div>`}).join('')}
window.shotPlotCard=shotPlotCard;

/* done state after Finish session: the round is already saved; this screen only says so and offers next steps */
const KEY='scoretool.doneId';
function shotDone(id){try{sessionStorage.setItem(KEY,id)}catch(e){}window._doneId=id;nav('shotdone')}
window.shotDone=shotDone;
function bindBack(){const b=$('#shback');if(b)b.onclick=()=>nav(b.dataset.go)}
function doneView(){let id=window._doneId;try{id=id||sessionStorage.getItem(KEY)}catch(e){}const s=(S.sessions||[]).find(x=>x.id==id);
 app.innerHTML=`<div class="labbar"><button class="btn ghost labback" id="shback" data-go="score">‹ Score</button><h1>Session finished</h1></div>
 <div class="card shdone"><div class="shdone-ic" aria-hidden="true">${IC('check')}</div><h2>All done</h2>${s?`<p><b>${H(s.round)}</b> · ${total(s)} · ${H(fmtD(s.date))}</p>`:''}<p class="small muted">Saved on this phone. You'll find it in Past sessions.</p>
 <div class="shdone-act"><button class="btn full" id="shwins">See my wins</button><button class="btn ghost full" id="shnew">Score another round</button></div></div>`;
 bindBack();$('#shwins').onclick=()=>nav('home');$('#shnew').onclick=()=>nav('score')}
window.EXTRA_VIEWS=Object.assign(window.EXTRA_VIEWS||{},{shotdone:doneView});
})();
