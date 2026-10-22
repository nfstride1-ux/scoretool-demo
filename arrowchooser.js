/* Arrow chooser (22 Oct 2026, Nathe). Tools > Arrow chooser.
   Suggests a starting spine range and cut length from the manufacturers' own published spine charts, encoded below as lookup
   tables (no spine formula of our own). Every figure is cited to its chart. FOC uses Easton's AMO-standard formula.
   Stored data: only this page's own inputs, under the new key scoretool.arrowchooser.<tester>. Nothing else is written here,
   except when the archer taps 'Use this arrow', which fills the Calculators' own boxes (S.calc) as they asked. */
(function(){
const E=window.EXTRA_VIEWS=window.EXTRA_VIEWS||{};
const h=t=>String(t??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=n=>(window.icon&&window.icon(n))||'';
const tid=()=>(typeof TESTER!='undefined'&&TESTER&&TESTER.id)||'guest';
const KEY=()=>'scoretool.arrowchooser.'+tid();
const load=()=>{try{return JSON.parse(localStorage.getItem(KEY())||'{}')||{}}catch(e){return{}}};
const store=st=>localStorage.setItem(KEY(),JSON.stringify(st));
const num=v=>{const x=parseFloat(String(v??'').replace(',','.'));return isFinite(x)?x:NaN};
const f1=(x,d=1)=>isFinite(x)?(+x).toFixed(d):'-';

/* ---------- Sources ---------- */
const SRC={
 easton:['Easton 2026 catalogue, Target Arrow Size Selection chart (pp. 56-57) and shaft specification tables (pp. 2-7)','https://eastonarchery.com/wp-content/uploads/2026/03/Easton-2026.pdf'],
 eastonTM:['Easton Arrow Tuning and Maintenance Guide (Bare Shaft Planing Test p. 5; Adjustments Within the Bow and Arrow System p. 10; F.O.C. p. 32)','https://eastonarchery.com/wp-content/uploads/2019/08/TuningGuideEaston.pdf'],
 eastonFOC:['Easton: The Simple Guidelines to Correct Arrow Balance (FOC), George Tekmitchov, June 2022','https://eastonarchery.com/2022/06/the-simple-guidelines-to-correct-arrow-balance-foc/'],
 gt:['Gold Tip Arrow Spine Selector charts (Recurve Bow; Compound Bow IBO 315- and 315+)','https://goldtip.com/pages/spine-selector'],
 victory:['Victory Archery Arrow Guide, compound chart "VF/RIP XV/RVL Spine Chart" (bow rating 300-340 fps)','https://victoryarchery.com/arrow-guide/'],
 skylon:['Skylon Archery target chart "Correct arrow length for Target - Field - 3D"','https://www.skylonarchery.com/images/chart/chart%20target.pdf'],
 skylonB:['Skylon Brixxon specification page (grains per inch, recommended point)','https://skylonarchery.com/arrows/2023-06-29-08-52-09/brixxon']};
const cite=k=>`<a href="${SRC[k][1]}" target="_blank" rel="noopener">${h(SRC[k][0])}</a>`;

/* ---------- Easton target chart (A/C, all-carbon), 2026 catalogue pp. 56-57 ----------
   Rows: compound (release aid, 301-320 fps, 100 gr points) / recurve (carbon limbs) bow weight. Columns: cut length 21"-34",
   measured to the throat of the nock. The printed grid steps one place per row and per column, so each cell is EA_SEQ[row+col]. */
const EA_SEQ=['2000','2000','2000-1800','1800-1700','1750-1400','1450-1200','1250-1050','1080-880','900-750','800-700','720-625','675-600','640-570','575-500','525-450','475-400','440-370','400-340','370-310','340-300','300-250','250-200','250-200','250-200','200-150'];
const EA_C=[['<17',16],['17-23',23],['24-28',28],['29-34',34],['35-39',39],['40-44',44],['45-49',49],['50-54',54],['55-59',59],['60-64',64],['65-69',69],['70-76',76]];
const EA_R=[['<20',20],['21-26',26],['27-31',31],['32-35',35],['36-39',39],['40-43',43],['44-47',47],['48-52',52],['53-57',57],['58-62',62],['63-67',67],['68-73',73]];
/* shaft specs (spine, grains per inch) from the same catalogue */
const EA_SHAFTS=[
 {m:'X10',for:'R',note:'Barrelled; GPI is Easton\'s average over a 29" shaft',s:[[325,9.2],[350,8.8],[380,8.9],[410,8.5],[450,8.1],[500,7.8],[550,7.5],[600,7.0],[650,6.8],[700,6.7],[750,6.4],[830,6.2],[900,5.8],[1000,5.3]]},
 {m:'X10 Parallel Pro 3.2mm',for:'RC',note:'Easton: recurves may need up to two spines weaker',s:[[340,10.0],[380,9.3],[420,8.9],[460,8.5],[500,8.0],[550,7.6],[600,7.3],[650,7.0],[700,6.8],[750,6.5],[800,6.0],[900,5.8],[1000,5.5]]},
 {m:'X10 4MM Parallel Pro',for:'RC',note:'Easton: recurves may need up to two spines weaker',s:[[250,10.8],[300,9.5],[340,8.9],[380,8.3],[420,7.8],[470,7.3],[520,7.0],[570,6.6],[610,7.3],[660,6.9],[710,6.5],[810,6.1],[880,5.9],[1000,5.5],[1150,5.5]]},
 {m:'A/C/E',for:'R',s:[[370,7.9],[400,7.5],[430,7.0],[470,6.8],[520,6.7],[570,6.3],[620,6.1],[670,5.9],[720,6.4],[780,6.0],[850,5.7],[920,5.8],[1000,5.7],[1100,5.1],[1250,5.1]]},
 {m:'Superdrive Micro',for:'C',s:[[325,8.1],[375,7.4],[425,6.8],[475,6.4],[525,6.2],[575,5.9],[625,5.7],[675,5.6],[750,5.5],[850,5.3],[950,5.1]]},
 {m:'Avance',for:'RC',s:[[340,8.8],[400,7.9],[450,7.4],[500,6.9],[550,6.5],[600,6.5],[660,6.2],[730,5.7],[810,5.5],[900,5.2],[1000,4.9],[1150,4.9],[1400,4.2],[1600,3.8],[1800,3.6],[2000,3.4]]},
 {m:'Vector',for:'RC',s:[[600,7.6],[800,6.2],[1000,5.4],[1200,5.1],[1400,4.2],[1600,3.8],[1800,3.6],[2000,3.4]]}];

/* ---------- Gold Tip spine selector (goldtip.com). Columns 25"-32", measured from the throat of the nock to the end of the insert.
   Point weight = point + insert + Ballistic Collar + FACT weight. Row r of each chart; the 100/125/150 gr columns give the
   draw-weight band for that row (lower bound shown; each band is 5 lb, e.g. 30 = 30-34). */
const GT={
 R:{lo:{100:[30,35,40,45,50,55,60,65,70,75,80],125:[30,35,40,45,50,55,60,65,70,75,80],150:[null,30,35,40,45,50,55,60,65,70,75]},
  g:[[700,600,600,600,500,500,500,400],[600,600,600,500,500,500,400,400],[600,600,500,500,500,400,400,400],[600,500,500,500,400,400,400,340],[500,500,500,400,400,400,340,340],[500,500,400,400,400,340,340,340],[500,400,400,400,340,340,340,300],[400,400,400,340,340,340,300,300],[400,400,340,340,340,300,300,300],[400,340,340,340,300,300,300,250],[340,340,300,300,250,250,250,250]]},
 C1:{t:'IBO speed under 315 fps',lo:{100:[30,35,40,45,50,55,60,65,70,75,80,null,null],125:[null,30,35,40,45,50,55,60,65,70,75,80,null],150:[null,null,30,35,40,45,50,55,60,65,70,75,80]},
  g:[[700,600,600,600,500,500,500,400],[600,600,600,500,500,500,400,400],[600,600,500,500,500,400,400,400],[600,500,500,500,400,400,400,340],[500,500,500,400,400,400,340,340],[500,500,400,400,400,340,340,300],[500,400,400,400,340,340,300,300],[400,400,400,340,340,300,300,300],[400,400,340,340,300,300,300,250],[400,340,340,300,300,300,250,250],[340,340,300,300,250,250,250,200],[300,300,300,300,250,250,200,200],[300,300,300,250,250,200,200,200]]},
 C2:{t:'IBO speed 315 fps and over',lo:{100:[30,35,40,45,50,55,60,65,70,75,80,null,null],125:[null,30,35,40,45,50,55,60,65,70,75,80,null],150:[null,null,30,35,40,45,50,55,60,65,70,75,80]},
  g:[[700,600,600,500,500,500,400,400],[600,600,500,500,500,400,400,400],[600,500,500,500,400,400,400,340],[500,500,500,400,400,400,340,340],[500,500,400,400,400,340,340,300],[500,400,400,400,340,340,300,300],[400,400,400,340,340,300,300,300],[400,400,340,340,300,300,300,250],[400,340,340,300,300,300,250,250],[340,340,300,300,300,250,250,200],[340,300,300,300,250,250,200,200],[300,300,300,250,250,200,200,200],[300,300,250,250,200,200,200,150]]}};

/* ---------- Victory Archery: compound only, bow rating 300-340 fps, 23"-31". null = no option on the chart ---------- */
const VI={rows:[[32,36],[37,41],[42,46],[47,51],[52,56],[57,61],[62,66],[67,72],[73,78],[79,84],[85,90],[90,95],[95,100]],
 g:[[0,0,0,0,0,500,500,500,500],[0,0,0,0,500,500,500,500,500],[0,0,0,500,500,500,500,500,400],[0,500,500,500,500,400,400,400,400],[500,500,500,400,400,400,400,400,350],[500,500,400,400,400,400,400,350,350],[400,400,400,400,350,350,350,350,300],[400,400,400,350,350,350,350,300,300],[400,400,350,350,300,300,300,300,300],[350,350,350,300,300,300,300,250,250],[350,350,300,300,300,250,250,250,250],[300,300,300,250,250,250,250,200,200],[300,300,250,250,250,200,200,200,200]]};

/* ---------- Skylon target chart (Target - Field - 3D). Lengths 23"-32", measured cut to cut. ---------- */
const SK_REC=[[16,19],[20,23],[24,29],[30,35],[36,40],[41,45],[46,50],[51,55],[56,60],[61,65],[66,70]];
const SK_CMP={'<276':[null,[29,35],[35,40],[40,45],[45,50],[50,55],[55,60],[60,65],[65,70],[70,76],[76,82]],
 '276-300':[null,null,[29,35],[35,40],[40,45],[45,50],[50,55],[55,60],[60,65],[65,70],[70,76]],
 '301-340':[null,null,null,[29,35],[35,40],[40,45],[45,50],[50,55],[55,60],[60,65],[65,70]],
 '340-360':[null,null,null,null,[29,35],[35,40],[40,45],[45,50],[50,55],[55,60],[60,65]]};
const SK_G=(()=>{const A=n=>'A'+n,r=(pre,start,from,to)=>{const o=Array(10).fill(null);for(let i=from;i<=to;i++)o[start+i-from]=A(i);return pre?pre.concat(o).slice(0,10):o};
 return[['Y1','Y1','Y2','Y3','Y4',null,null,null,null,null],['Y1','Y2','Y3','Y4','A1','A2','A3','A4',null,null],['Y2','Y3','Y4','A1','A2','A3','A4','A5','A6',null],
  r(null,2,1,7),r(null,1,1,9),r(null,0,1,10),r(null,0,2,11),r(null,0,3,12),r(null,0,4,13),r(null,0,5,13),r(null,0,6,13)]})();
/* group contents: [model, recurve spine, compound spine]; '' = not listed for that bow; same value both = no R/C split on the chart */
const SK_GRP={
 Y1:[['Radius','2000','']],Y2:[['Radius','1800','']],Y3:[['Radius','1500','']],
 Y4:[['Brixxon','1100','1100'],['Paragon','1000',''],['Performa','1000',''],['Precium','1000',''],['Radius','1300 or 1100','']],
 A1:[['Brixxon','1000','900'],['Performa / Precium / Paragon','1000-900','900'],['Radius','1000-900','900']],
 A2:[['Brixxon','900-850','800'],['Performa / Precium / Paragon','900-850','800'],['Radius','850-800','800']],
 A3:[['Brixxon','850-800','750'],['Edge','800','800'],['Performa / Precium / Paragon','850-800','750'],['Radius','750-700','700']],
 A4:[['Brixxon','750-700','650'],['Edge','800-700','800-700'],['Performa / Precium / Paragon','750-700','650'],['Radius','700-650','650']],
 A5:[['Brixxon','700-650','600'],['Edge','700','700'],['Performa / Precium / Paragon','700-650','600'],['Radius','650-600','600']],
 A6:[['Brixxon','600-550','600-550'],['Edge','700-600','700-600'],['Empros','500','500'],['Performa / Precium / Paragon','600-550','600-550'],['Radius','600-550','550']],
 A7:[['Brixxon','550-500','500'],['Edge','500','500'],['Empros','500-400','500-400'],['Maverick','500','500'],['Performa / Precium / Paragon','550-500','500'],['Radius','550-500','500']],
 A8:[['Brixxon','500','450'],['Edge','500-400','500-400'],['Empros','400','400'],['Maverick','500-400','500-400'],['Performa / Precium / Paragon','500','450'],['Radius','500-450','450']],
 A9:[['Brixxon','450','400'],['Edge','400','400'],['Empros','400-350','400-350'],['Maverick','400','400'],['Performa / Precium / Paragon','450','400'],['Radius','450-400','400']],
 A10:[['Brixxon','400','400'],['Edge','400-350','400-350'],['Empros','350','350'],['Maverick','400-350','400-350'],['Performa / Precium / Paragon','400','400'],['Radius','400','400']],
 A11:[['Bruxx','350-300','350-300'],['Edge','350','350'],['Empros','350-300','350-300'],['Maverick','350','350'],['Performa / Precium / Paragon','400','400']],
 A12:[['Bruxx','300','300'],['Edge','350-300','350-300'],['Empros','300','300'],['Maverick','350-300','350-300'],['Performa / Precium / Paragon','','350']],
 A13:[['Bruxx','300','300'],['Edge','300','300'],['Empros','300','300'],['Maverick','300','300']]};
/* Brixxon spec page: spine -> [GPI, recommended point] */
const SK_BRX={1100:[4.64,'60-70-80'],1000:[4.90,'60-70-80'],900:[5.34,'60-70-80'],850:[5.48,'60-80 or 80-100'],800:[5.80,'60-80 or 80-100'],750:[5.94,'80-90-100'],700:[6.17,'80-90-100'],650:[6.42,'80-90-100'],600:[7.09,'80-100 or 100-120'],550:[7.47,'80-100 or 100-120'],500:[8.00,'80-100 or 100-120'],450:[8.63,'80-100 or 100-120'],400:[9.47,'80-100 or 100-120']};

/* ---------- Look-ups ---------- */
const rng=s=>{const p=String(s).split('-').map(Number);return p.length>1?[Math.max(p[0],p[1]),Math.min(p[0],p[1])]:[p[0],p[0]]};
function easton(st){const fing=st.bow!='compound',L=Math.round(st.len),pt=st.pt;const adj=[];let w=st.dw;
 if(!fing){const ibo=st.ibo;if(isFinite(ibo)){const a=ibo<=275?-10:ibo<=300?-5:ibo<=320?0:ibo<=340?5:ibo<=350?10:15;if(a)adj.push([`IBO ${ibo} fps`,a]);w+=a}}
 else if(st.limb=='wood'){adj.push(['Wood/glass beginner limbs',-5]);w-=5}
 if(isFinite(pt)&&pt!=100){const a=Math.round((pt-100)/25*3*10)/10;adj.push([`${pt} gr point (3 lb per 25 gr, pro rata)`,a]);w+=a}
 const W=Math.round(w),rows=fing?EA_R:EA_C;let r=rows.findIndex(x=>W<=x[1]);
 const out={brand:'Easton',src:'easton',lenDef:'cut length to the throat of the nock',adj,w:W};
 if(r<0)return Object.assign(out,{off:`${W} lb is above the chart (max ${rows[rows.length-1][0]} lb)`});
 if(L<21||L>34)return Object.assign(out,{off:`${L}" is outside the chart (21" to 34")`});
 const cell=EA_SEQ[r+L-21],[hi,lo]=rng(cell),kind=fing?'R':'C';
 const shafts=[];EA_SHAFTS.forEach(m=>{if(!m.for.includes(kind))return;m.s.forEach(([sp,g])=>{if(sp<=hi&&sp>=lo)shafts.push({brand:'Easton',model:m.m,spine:sp,gpi:g,note:m.note||''})})});
 return Object.assign(out,{cell:`${fing?'Recurve':'Compound'} row ${rows[r][0]} lb, ${L}" column`,spine:cell,hi,lo,shafts,
  tip:fing?'Easton: for recurve, choose the weaker side of the range (the higher number) when there is a choice.':''})}
function goldtip(st){const fing=st.bow!='compound',L=Math.round(st.len);const front=(isFinite(st.pt)?st.pt:100)+(isFinite(st.ins)?st.ins:0);
 const col=front<112.5?100:front<137.5?125:150,ch=fing?GT.R:(isFinite(st.ibo)&&st.ibo>=315?GT.C2:GT.C1);
 const out={brand:'Gold Tip',src:'gt',lenDef:'throat of the nock to the end of the insert',col,front};
 const lows=ch.lo[col],W=Math.round(st.dw);let r=lows.findIndex(lo=>lo!=null&&W>=lo&&W<=lo+4);
 const chartName=fing?'Recurve Bow':'Compound Bow, '+ch.t+(isFinite(st.ibo)?'':' (IBO not entered)');
 if(r<0)return Object.assign(out,{off:`${W} lb is not on the ${chartName} chart in the ${col} gr point column`});
 if(L<25||L>32)return Object.assign(out,{off:`${L}" is outside the chart (25" to 32")`});
 const sp=ch.g[r][L-25];
 return Object.assign(out,{cell:`${chartName}: ${lows[r]}-${lows[r]+4} lb in the ${col} gr column, ${L}"`,spine:String(sp),hi:sp,lo:sp,shafts:[],
  tip:(front<100?'Your front weight is under 100 gr, the lightest column on this chart. ':'')+(fing?'Gold Tip: start 1" longer than your finished arrow and cut down 1/4" at a time while bare-shaft tuning.':'')})}
function victory(st){const out={brand:'Victory',src:'victory',lenDef:'arrow length as printed on the chart'};
 if(st.bow!='compound')return Object.assign(out,{off:'Victory\'s recurve chart could not be read from its official page, so recurve and barebow are left out'});
 const W=Math.round(st.dw),L=Math.round(st.len);let r=VI.rows.findIndex(x=>W>=x[0]&&W<=x[1]);
 if(r<0)return Object.assign(out,{off:`${W} lb is outside the chart (32 to 100 lb)`});
 if(L<23||L>31)return Object.assign(out,{off:`${L}" is outside the chart (23" to 31")`});
 const sp=VI.g[r][L-23];if(!sp)return Object.assign(out,{off:'The chart shows no option for this weight and length'});
 return Object.assign(out,{cell:`${VI.rows[r][0]}-${VI.rows[r][1]} lb, ${L}" (bow rating 300-340 fps)`,spine:String(sp),hi:sp,lo:sp,
  shafts:[{brand:'Victory',model:'VF / RIP XV / RVL (chart lines)',spine:sp,gpi:NaN}],
  tip:'Chart footnote, as printed: "Spine Calculation based on Standard 30 Grains or less. *RIVAL(X) if 20gr back weight is NOT used".'+(isFinite(st.ibo)&&(st.ibo<300||st.ibo>340)?' Your IBO is outside the 300-340 fps this chart is for.':'')})}
function skylon(st){const fing=st.bow!='compound',W=Math.round(st.dw),L=Math.round(st.len);const out={brand:'Skylon',src:'skylon',lenDef:'cut to cut'};
 let r,band='';
 if(fing)r=SK_REC.findIndex(x=>W>=x[0]&&W<=x[1]);
 else{const ibo=st.ibo;band=!isFinite(ibo)?'301-340':ibo<276?'<276':ibo<=300?'276-300':ibo<=340?'301-340':'340-360';
  const R=SK_CMP[band];r=R.findIndex((x,i)=>x&&W>=x[0]&&(W<x[1]||(W==x[1]&&!R.slice(i+1).some(y=>y&&W>=y[0]&&W<=y[1]))))}
 if(r<0)return Object.assign(out,{off:`${W} lb is not on the chart${band?' for '+band+' fps':''}`});
 if(L<23||L>32)return Object.assign(out,{off:`${L}" is outside the chart (23" to 32")`});
 const g=SK_G[r][L-23];if(!g)return Object.assign(out,{off:'The chart shows no group for this weight and length'});
 const k=fing?1:2,list=SK_GRP[g].filter(x=>x[k]);const all=[];list.forEach(x=>x[k].split(/ or |-/).forEach(v=>all.push(+v)));
 const shafts=[];list.forEach(x=>{const sps=x[k].split(/ or |-/).map(Number);if(x[0]=='Brixxon')sps.forEach(sp=>shafts.push({brand:'Skylon',model:'Brixxon',spine:sp,gpi:SK_BRX[sp]?SK_BRX[sp][0]:NaN,rp:SK_BRX[sp]?SK_BRX[sp][1]:''}));else shafts.push({brand:'Skylon',model:x[0],spine:x[k],gpi:NaN})});
 return Object.assign(out,{cell:`Group ${g}: ${fing?'recurve '+SK_REC[r][0]+'-'+SK_REC[r][1]+' lb':'compound '+band+' fps, '+SK_CMP[band][r][0]+'-'+SK_CMP[band][r][1]+' lb'}${!fing&&!isFinite(st.ibo)?' (IBO not entered)':''}, ${L}"`,
  spine:Math.max(...all)==Math.min(...all)?String(all[0]):Math.max(...all)+'-'+Math.min(...all),hi:Math.max(...all),lo:Math.min(...all),group:g,list,k,shafts,
  tip:g[0]=='Y'?'Group '+g+' is in Skylon\'s "Low poundage recurve bow" list.':''})}

/* ---------- FOC: Easton AMO-standard formula, F.O.C. % = 100 x (A - L/2) / L ----------
   L = bottom of nock groove to end of shaft. A = bottom of nock groove to the finished arrow's balance point.
   If A was not measured, it is estimated from the component weights: shaft centred at L/2, point + insert at the end of the
   shaft (L), nock at 0, vanes at the distance the archer enters (or at the nock end if left blank). Clearly labelled as an estimate. */
function build(st,d){d=d||{};const L=st.len+(d.dlen||0),pt=(isFinite(st.pt)?st.pt:NaN)+(d.dpt||0),gpi=st.gpi;
 const ins=isFinite(st.ins)?st.ins:0,nk=isFinite(st.nock)?st.nock:0,vn=isFinite(st.vanes)?st.vanes:0,vp=isFinite(st.vpos)?st.vpos:0;
 const shaft=gpi*L,tw=shaft+pt+ins+nk+vn;let A,meas=false;
 if(isFinite(st.bp)){meas=true;/* move the measured balance point by the change in mass and position */
  const L0=st.len,pt0=st.pt,W0=gpi*L0+pt0+ins+nk+vn;A=(st.bp*W0-gpi*L0*L0/2-(pt0+ins)*L0+gpi*L*L/2+(pt+ins)*L)/tw;if(!d.dpt&&!d.dlen)A=st.bp}
 else A=(shaft*L/2+(pt+ins)*L+vn*vp)/tw;
 const foc=100*(A-L/2)/L;return{L,pt,tw,A,foc,meas,missing:[!isFinite(gpi)&&'shaft GPI',!isFinite(st.pt)&&'point weight',!isFinite(st.nock)&&'nock',!isFinite(st.vanes)&&'vanes'].filter(Boolean)}}
const speedEst=(st,tw)=>{/* the Calculators' own rule of thumb (IBO rating, compound only) */if(st.bow!='compound'||!isFinite(st.ibo)||!isFinite(st.dl)||!isFinite(tw))return NaN;
 return Math.round(st.ibo-10*(30-st.dl)-Math.max(0,tw-5*st.dw)/3)};

/* state, with numbers parsed */
function parsed(){const R=load();const st={bow:R.bow||'recurve',use:R.use||'target',limb:R.limb||'carbon',hand:R.hand||'R'};
 ['dw','dl','len','pt','ibo','ins','nock','vanes','vpos','bp','fps','gpiU'].forEach(k=>st[k]=num(R[k]));
 st.lenIn=st.len;if(!isFinite(st.len))st.len=st.dl;st.pick=R.pick||null;st.gpi=isFinite(st.gpiU)?st.gpiU:(st.pick&&isFinite(st.pick.gpi)?st.pick.gpi:NaN);return{R,st}}
function results(st){if(!isFinite(st.dw)||!isFinite(st.len))return null;return[easton(st),goldtip(st),victory(st),skylon(st)]}

/* the archer's current arrow setup (used by the Arrow optimizer); null until there is a length and point weight */
window.arrowSetup=function(){const{st}=parsed();if(!isFinite(st.len)||!isFinite(st.pt))return null;const b=build(st);
 const fps=isFinite(st.fps)?st.fps:speedEst(st,b.tw);
 return{bow:st.bow,spine:st.pick?String(st.pick.spine):'',model:st.pick?st.pick.brand+' '+st.pick.model:'',len:st.len,pt:st.pt,
  foc:isFinite(b.foc)?+b.foc.toFixed(1):null,tw:isFinite(b.tw)?Math.round(b.tw):null,fps:isFinite(fps)?Math.round(fps):null,fpsSrc:isFinite(st.fps)?'measured':isFinite(fps)?'estimate':''}};
/* FOC after a change (point grains / length inches), for the tuning 'Next step to try' card */
window.arrowFocWith=function(d){const{st}=parsed();if(!isFinite(st.len)||!isFinite(st.pt)||!isFinite(st.gpi))return null;const a=build(st),b=build(st,d);return isFinite(a.foc)&&isFinite(b.foc)?{from:a.foc,to:b.foc,meas:a.meas}:null};
window.ARROW_SRC=SRC;

/* ---------- Page ---------- */
let OPEN=null;
const CSS=`.acf .labseg{margin:0 0 10px}.acf label{display:block;margin:10px 0 4px;font-weight:700}#app .hint{margin:2px 0 0;font-size:13px;color:var(--muted)}
.acres .brand{border:1px solid var(--line);border-radius:12px;padding:10px 12px;margin:10px 0}.acres .brand h3{margin:0 0 4px;font-size:17px;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}
.acres .spn{font:800 24px var(--disp);color:var(--blue)}.acres .off{color:var(--muted);font-size:14px}.acshaft{display:flex;gap:8px;align-items:center;padding:6px 0;border-top:1px dashed var(--line);font-size:15px}
.acshaft input{width:22px;height:22px;flex:none}.acshaft small{color:var(--muted);font-weight:400}.acshaft{font-weight:400}.acwarn{border-left:4px solid var(--gold,#c9a227);background:var(--blue-bg);border-radius:10px;padding:10px 12px;font-size:15px;margin:8px 0}
.acwarn .ic{width:18px;height:18px;vertical-align:-3px;margin-right:4px}.acmore{border:1px solid var(--line);border-radius:12px;margin:10px 0;background:var(--surf,transparent)}
.acmore>summary{padding:12px 14px;font-weight:800;cursor:pointer;list-style:none;display:flex;justify-content:space-between}.acmore>summary::after{content:'+';font-weight:800}.acmore[open]>summary::after{content:'\\2212'}
.acmore>div{padding:0 14px 12px}.acbig{font:800 30px var(--disp)}.aclinks{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.aclinks .btn{display:inline-flex;gap:6px;align-items:center}.aclinks .ic{width:18px;height:18px}
.acfrm{font-family:ui-monospace,Menlo,monospace;font-size:14px;background:var(--blue-bg);border-radius:8px;padding:8px 10px}`;
function css(){if(!document.getElementById('accss')){const s=document.createElement('style');s.id='accss';s.textContent=CSS;document.head.appendChild(s)}}
const seg=(k,v,opts)=>`<div class="labseg" role="group" aria-label="${k}">${opts.map(([val,l])=>`<button type="button" data-seg="${k}" data-val="${val}" aria-pressed="${v==val}">${l}</button>`).join('')}</div>`;
const inp=(k,R,l,unit,ph,hint)=>`<label for="ac_${k}">${l}${unit?` <span class="muted small">(${unit})</span>`:''}</label><input id="ac_${k}" data-k="${k}" inputmode="decimal" value="${h(R[k]??'')}"${ph?` placeholder="${h(ph)}"`:''}>${hint?`<p class="hint">${hint}</p>`:''}`;

E.lab_chooser=function(){css();const{R,st}=parsed();const res=results(st),fing=st.bow!='compound';
 const pickKey=s=>s.brand+'|'+s.model+'|'+s.spine;const pk=st.pick?pickKey(st.pick):'';
 const brandHTML=b=>{if(b.off)return`<div class="brand"><h3>${h(b.brand)}</h3><p class="off">Not shown: ${h(b.off)}.</p><p class="labsrc">Chart: ${cite(b.src)}</p></div>`;
  const shafts=b.shafts.length?b.shafts.map(s=>{const w=isFinite(s.gpi)&&isFinite(st.len)?Math.round(s.gpi*st.len):NaN;const id='p'+Math.random().toString(36).slice(2,8);
   return`<label class="acshaft" for="${id}"><input type="radio" name="acpick" id="${id}" data-pick='${h(JSON.stringify({brand:s.brand,model:s.model,spine:s.spine,gpi:isFinite(s.gpi)?s.gpi:null}))}' ${pickKey(s)==pk?'checked':''}><span><b>${h(s.model)} ${h(s.spine)}</b> <small>${isFinite(s.gpi)?`${s.gpi} gr/in · shaft about ${w} gr at ${st.len}"`:'grains per inch not on this chart'}${s.rp?` · Skylon recommended point ${h(s.rp)} gr`:''}${s.note?' · '+h(s.note):''}</small></span></label>`}).join(''):'';
  const skList=b.list&&b.list.length?`<p class="small" style="margin:6px 0 0">${b.list.map(x=>`${h(x[0])} ${h(x[b.k])}`).join(' · ')}</p>`:'';
  return`<div class="brand"><h3>${h(b.brand)} <span class="spn">${h(b.spine)}</span></h3><p class="small muted" style="margin:0">${h(b.cell)}. Length on this chart: ${h(b.lenDef)}.</p>
  ${b.adj&&b.adj.length?`<p class="small muted" style="margin:4px 0 0">Chart adjustments: ${b.adj.map(a=>`${h(a[0])} ${a[1]>0?'+':''}${a[1]} lb`).join(', ')} → read at ${b.w} lb.</p>`:''}
  ${b.brand=='Skylon'?skList:''}${shafts}${b.tip?`<p class="small" style="margin:6px 0 0">${h(b.tip)}</p>`:''}<p class="labsrc" style="margin:6px 0 0">Chart: ${cite(b.src)}${b.brand=='Skylon'?' · '+cite('skylonB'):''}</p></div>`};
 const cutLen=isFinite(st.len)?(isFinite(st.lenIn)?`${st.len}" (your measured length)`:`about ${st.len}" (your draw length; measure to be sure)`):'-';
 const B=build(st),fps=isFinite(st.fps)?st.fps:speedEst(st,B.tw);
 const focRanges=`<table class="labtbl"><thead><tr><th>Use</th><th>FOC</th><th>Source</th></tr></thead><tbody>
  <tr><th>Target, outdoor</th><td><b>10-15%</b></td><td class="small">Easton 2022 (0-90 m)</td></tr>
  <tr><th>Target, by shaft type</th><td><b>A/C/E 11-16%</b><br>A/C/C 9-11%<br>Aluminium 7-9%</td><td class="small">Easton Tuning Guide p. 32</td></tr>
  <tr><th>Indoor</th><td><b>7-15%</b></td><td class="small">Easton 2022. Easton: at short range FOC matters less</td></tr>
  <tr><th>Field</th><td>No field-only figure</td><td class="small">None of these sources publishes one. Easton's outdoor target 10-15% covers 0-90 m</td></tr>
  <tr><th>3D</th><td>No 3D-only figure</td><td class="small">None of these sources publishes one. For reference: Easton indoor 7-15%, hunting 10-15%</td></tr>
  <tr><th>Point-weight tuning</th><td>stay within 7-16%</td><td class="small">Easton Tuning Guide p. 10</td></tr></tbody></table>`;
 const useFoc={target:'Easton outdoor target: 10-15%',indoor:'Easton indoor target: 7-15%',field:'No field-only figure published; Easton outdoor target is 10-15%',['3d']:'No 3D-only figure published; Easton hunting is 10-15%, indoor 7-15%'}[st.use];
 const ptLines=res?res.filter(b=>!b.off).map(b=>b.brand=='Easton'?`<li><b>Easton</b>: the chart assumes <b>100 gr</b> glue-in points. Under 100 gr: −3 lb of bow weight per 25 gr; over 100 gr: +3 lb per 25 gr (the chooser already applies this).</li>`
  :b.brand=='Gold Tip'?`<li><b>Gold Tip</b>: the chart has <b>100, 125 and 150 gr</b> columns, where point weight means point + insert + Ballistic Collar + FACT weight. Yours (${b.front} gr) was read in the ${b.col} gr column.</li>`
  :b.brand=='Victory'?`<li><b>Victory</b>: the compound chart gives no point weight; its footnote reads "Spine Calculation based on Standard 30 Grains or less".</li>`
  :`<li><b>Skylon</b>: the target chart gives no point weight. The Brixxon page recommends a point per spine${b.shafts.filter(s=>s.rp).length?': '+b.shafts.filter(s=>s.rp).map(s=>`${s.spine} → ${h(s.rp)} gr`).join(', '):''}.</li>`).join(''):'';
 const dP=window.arrowFocWith?{p:arrowFocWith({dpt:25}),m:arrowFocWith({dpt:-25})}:{};
 app.innerHTML=`<div class="labbar"><button class="btn ghost labback" data-go="tools">‹ Tools</button><h1>Arrow chooser</h1></div>
 <div class="card acf"><span class="kicker">Your bow</span><h2 style="margin:2px 0 8px">Find a starting arrow</h2>
  ${seg('bow',st.bow,[['recurve','Recurve'],['barebow','Barebow'],['compound','Compound']])}
  ${inp('dw',R,fing?'Draw weight on your fingers':'Peak draw weight','lb',fing?'e.g. 40':'e.g. 60',fing?'The weight you actually hold at your own draw length, not the number on the limbs.':'')}
  ${inp('dl',R,'Draw length','inches','e.g. 28')}
  ${inp('pt',R,'Point weight','grains','e.g. 100')}
  ${fing?`<label for="ac_limb">Limbs</label><select id="ac_limb" data-k="limb"><option value="carbon"${st.limb=='carbon'?' selected':''}>Carbon or foam competition limbs</option><option value="wood"${st.limb=='wood'?' selected':''}>Wood/glass beginner limbs</option></select>`
   :inp('ibo',R,'IBO speed rating','fps, optional','e.g. 330','On the bow or its spec sheet. Charts change with bow speed.')}
  <label>What it's for</label>${seg('use',st.use,[['target','Target'],['indoor','Indoor'],['field','Field'],['3d','3D']])}
  <details class="acmore"${isFinite(st.lenIn)?' open':''}><summary>Measured arrow length (optional)</summary><div>${inp('len',R,'Arrow length','inches','same as draw length','Easton: draw an extra-long arrow and mark it about 1" in front of where it touches the rest. Leave blank to use your draw length.')}</div></details>
 </div>
 <div class="card acres"><span class="kicker">Result</span>
  <div class="acwarn" role="note">${ic('warn')}<b>A starting point only.</b> Confirm it with a bare-shaft tune before buying a full set.</div>
  ${res?`<p style="margin:6px 0 2px">Cut length: <b>${cutLen}</b></p>${fing?'<p class="small muted" style="margin:0">Gold Tip: start 1" longer and cut 1/4" at a time while bare-shaft tuning.</p>':''}
  <p class="small" style="margin:8px 0 0">Each brand's own chart. They differ, so use the chart for the brand you buy. Tap a shaft to choose it.</p>
  ${fing&&st.bow=='barebow'?'<p class="small muted" style="margin:4px 0 0">None of these charts has a barebow column, so the recurve (finger release) charts are used.</p>':''}
  ${res.map(brandHTML).join('')}`:'<p class="lab-note">Enter your draw weight and draw length to see the charts.</p>'}
  <div class="aclinks"><button class="btn alt" id="acuse"${res?'':' disabled'}>${ic('calc')} Use this arrow</button><button class="btn ghost" data-go="lab_calc">${ic('calc')} Calculators</button><button class="btn ghost" data-go="lab_opt">${ic('target')} Arrow optimizer</button></div>
  <p class="small muted" id="acusemsg" aria-live="polite" style="margin:6px 0 0"></p>
 </div>
 <details class="acmore card" id="acfoc"${OPEN=='foc'?' open':''}><summary>FOC: front of centre</summary><div>
  <p class="small" style="margin:0 0 6px">Easton's AMO-standard formula, as printed:</p>
  <p class="acfrm">F.O.C. % = 100 x (A - L/2) / L<br>L = Correct Arrow Length: bottom of nock groove to end of shaft<br>A = bottom of nock groove to the finished arrow's balance point (with point, insert, nock and fletching)</p>
  <div class="labgrid2"><div>${inp('gpiU',R,'Shaft weight','grains per inch',st.pick&&isFinite(st.pick.gpi)?String(st.pick.gpi):'pick a shaft above')}
   ${inp('ins',R,'Insert, pin or collar','grains','0','Easton 2026: 4MM Pin 9 gr; nock collar 3 gr; one-piece points need none.')}
   ${inp('nock',R,'Nock','grains','e.g. 6','Easton 2026: 4MM Microlite nock 6 gr; G Nock 7 gr; Pin nock 2 gr.')}</div><div>
   ${inp('vanes',R,'All vanes together','grains','weigh or check the pack')}
   ${inp('vpos',R,'Vane middle from the nock throat','inches','blank = counted at the nock')}
   ${inp('bp',R,'Measured balance point','inches from the nock throat, optional','','Measured beats worked out. Balance the finished arrow on a knife edge.')}
   ${inp('fps',R,'Measured arrow speed','fps, chronograph, optional')}</div></div>
  <p style="margin:10px 0 0" id="acfocout">FOC <span class="labout">${isFinite(B.foc)?f1(B.foc)+'%':'-'}</span> ${isFinite(B.foc)?`<span class="small muted">${B.meas?'from your measured balance point':'worked out from the component weights (an estimate)'}</span>`:''}</p>
  <p class="small" style="margin:2px 0 0">Total arrow weight <b>${isFinite(B.tw)?Math.round(B.tw)+' gr':'-'}</b>${isFinite(B.tw)?` <span class="muted">= ${st.gpi} gr/in x ${st.len}" + point ${st.pt}${isFinite(st.ins)?' + insert '+st.ins:''}${isFinite(st.nock)?' + nock '+st.nock:''}${isFinite(st.vanes)?' + vanes '+st.vanes:''}</span>`:''}${B.missing.length?`<br><span class="muted">Not counted yet: ${B.missing.join(', ')}.</span>`:''}</p>
  <p class="small" style="margin:6px 0 0">For ${h({target:'target',indoor:'indoor',field:'field','3d':'3D'}[st.use])}: <b>${h(useFoc)}</b>.</p>
  ${focRanges}<p class="small muted">The Calculators page has the same FOC formula for a measured balance point. "Use this arrow" sends the length and balance point there.</p>
  <p class="labsrc">${cite('eastonTM')} · ${cite('eastonFOC')}</p></div></details>
 <details class="acmore card" id="acpt"${OPEN=='pt'?' open':''}><summary>Point weight</summary><div>
  <ul style="padding-left:18px;margin:0">
  <li><b>Heavier point = acts weaker. Lighter point = acts stiffer.</b> Easton: "If your arrow is too weak, go to a lighter insert/point. If your arrow is too stiff, try a heavier insert/point." Easton also notes that excess FOC lowers an arrow's dynamic spine.</li>
  <li><b>FOC:</b> more weight at the front moves the balance point forward, so FOC goes up. ${dP.p?`For this arrow: +25 gr → ${f1(dP.p.to)}%, −25 gr → ${f1(dP.m.to)}% (now ${f1(dP.p.from)}%).`:'Pick a shaft and fill in the FOC step to see the numbers.'}</li>
  <li><b>Speed:</b> a heavier point makes the whole arrow heavier, so it leaves the bow slower. The Calculators' estimate (compound, IBO rule of thumb) takes about 1 fps off per 3 gr over 5 gr per lb of draw weight.</li></ul>
  <h3 style="margin:12px 0 4px;font-size:16px">Starting point weight, from each chart</h3>
  ${ptLines?`<ul style="padding-left:18px;margin:0">${ptLines}</ul>`:'<p class="small muted">Enter your bow above first.</p>'}
  <p class="small" style="margin:8px 0 0">Change point weight within Easton's 7-16% FOC range while tuning, and confirm with a bare-shaft tune.</p>
  <p class="labsrc">${cite('eastonTM')} · ${cite('eastonFOC')} · ${cite('easton')} · ${cite('gt')} · ${cite('skylonB')}</p></div></details>
 <p class="small muted" style="margin:4px 4px 16px">Charts last checked 22 Oct 2026. Easton, Gold Tip, Victory (compound only) and Skylon. If the printed chart and this page ever differ, the printed chart wins.</p>`;
 /* events */
 app.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>nav(b.dataset.go));
 const put=(k,v)=>{const X=load();X[k]=v;store(X)};
 app.querySelectorAll('[data-seg]').forEach(b=>b.onclick=()=>{put(b.dataset.seg,b.dataset.val);render()});
 app.querySelectorAll('[data-k]').forEach(i=>i.onchange=()=>{put(i.dataset.k,i.value.trim());render()});
 app.querySelectorAll('[data-pick]').forEach(i=>i.onchange=()=>{const X=load();X.pick=JSON.parse(i.dataset.pick);delete X.gpiU;store(X);render()});
 ['acfoc','acpt'].forEach(id=>{const d=document.getElementById(id);if(d)d.ontoggle=()=>{OPEN=d.open?id.slice(2):(OPEN==id.slice(2)?null:OPEN)}});
 const u=$('#acuse');if(u)u.onclick=()=>{const C=S.calc=S.calc||{gr:'400',ibo:'340',dl:'29',dw:'60',sg:'0',len:'29',bp:'17'};const sent=[],left=[];
  if(isFinite(st.len)){C.len=String(st.len);sent.push('arrow length')}
  const b=build(st);
  if(isFinite(st.bp)){C.bp=String(st.bp);sent.push('balance point (measured)')}else if(isFinite(b.A)&&!b.missing.length){C.bp=b.A.toFixed(2);sent.push('balance point (worked out)')}else left.push('balance point');
  if(isFinite(b.tw)&&!b.missing.includes('shaft GPI')&&isFinite(st.pt)){C.gr=String(Math.round(b.tw));C.grU='';C.spdOn=1;sent.push('arrow weight'+(b.missing.length?' (without '+b.missing.join(', ')+')':''))}else left.push('arrow weight');
  if(st.bow=='compound'){if(isFinite(st.dw)){C.dw=String(st.dw);sent.push('draw weight')}if(isFinite(st.dl)){C.dl=String(st.dl);sent.push('draw length')}if(isFinite(st.ibo)){C.ibo=String(st.ibo);sent.push('IBO speed')}else left.push('IBO speed')}
  if(isFinite(st.fps)){C.fpsU=String(st.fps);sent.push('measured speed')}
  if(!sent.length){$('#acusemsg').textContent='Nothing to send yet. Enter your draw length first.';return}
  save();window._acFrom={sent,left};nav('lab_calc')};
};
})();
