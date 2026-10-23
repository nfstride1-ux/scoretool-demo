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
 skylonB:['Skylon Brixxon specification page (grains per inch, recommended point)','https://skylonarchery.com/arrows/2023-06-29-08-52-09/brixxon'],
 eastonAL:['Easton 2026 catalogue, Aluminum Arrow Cut Length chart (pp. 56-57) and X23 / X27 and SuperDrive 23 / 25 / 27 specification tables','https://eastonarchery.com/wp-content/uploads/2026/03/Easton-2026.pdf'],
 eastonH:['Easton 2026 catalogue, Hunting Arrow Size Selection chart (pp. 58-59) and hunting shaft tables (pp. 18-29)','https://eastonarchery.com/wp-content/uploads/2026/03/Easton-2026.pdf'],
 gt25:['Gold Tip & Beestinger 2025 catalogue, target shaft table (O.D. of Series 22, Nine.3 Max, X-Cutter, 30X, Triple X)','https://jvd-archery.com/Files/Images/Brands/Catalogues/2025_GoldTip_Beestinger_Catalog_Web.pdf'],
 park11:['Park J.L. (2011) The behaviour of an arrow shot from a compound archery bow. Proc IMechE Part P 225(1):8-21','https://doi.org/10.1177/17543371JSET82'],
 park13:['Park J.L. (2013) Arrow behaviour in the lateral plane during and immediately following launch from a recurve archery bow. Proc IMechE Part P 227(3):172-183','https://doi.org/10.1177/1754337112464844'],
 williams25:['Williams A. (2025) arrow spine study using Park\'s model, BILT Student Research Journal (University of Bristol), summarising Park 2013','https://research-information.bris.ac.uk/ws/portalfiles/portal/469033637/1_EMT.pdf'],
 rieck12:['Rieckmann M., Park J.L., Codrington J., Cazzolato B. (2012) Modelling the three-dimensional vibration of composite archery arrows under free-free boundary conditions. Proc IMechE Part P 226(2):114-122','https://doi.org/10.1177/1754337112442273'],
 parkSel:['Park J.L., "Modelling arrows - how to select the best arrow", Bow International, 26 Jan 2022','https://www.bow-international.com/features/modelling-arrows-how-to-select-the-best-arrow/'],
 parkFly:['Park J.L., "Modelling arrows in flight", Bow International, 5 Apr 2022','https://www.bow-international.com/features/modelling-arrows-in-flight/'],
 parkField:['Park J.L., "Tips on optimising your field archery gear", Bow International, 14 Dec 2021','https://www.bow-international.com/features/technique/tips-on-optimising-your-field-archery-gear/'],
 parkFA:['Park J.L., "Arrow selection: Field archery", Bow International','https://www.bow-international.com/features/arrow-selection-field-archery/']};
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

/* catalogue O.D. (inches; tapered shafts give their range) for the small-diameter target shafts above */
const EA_OD={'X10':[.182,.221],'X10 Parallel Pro 3.2mm':[.177,.215],'X10 4MM Parallel Pro':[.204,.245],'A/C/E':[.205,.230],'Superdrive Micro':[.210,.233],'Avance':[.198,.240],'Vector':[.198,.228]};
/* large-diameter (23/64" and up) shafts, Easton 2026 catalogue. SuperDrive: all-carbon, read on the A/C chart above.
   X23 / X27: aluminium-carbon sizes, read on the Aluminum Arrow Cut Length chart. use = what Easton says the line is for. */
const EA_FAT=[
 {m:'SuperDrive 23',for:'C',od:[.356,.361],use:['indoor','3d'],note:'23/64" (9.3 mm), Easton: World Archery compliant diameter',s:[[325,7.8],[375,7.3],[475,6.8]]},
 {m:'SuperDrive 25',for:'C',od:[.396,.396],use:['indoor','3d'],note:'25/64", Easton: engineered for indoor and 3D; over the World Archery 9.3 mm limit',s:[[290,7.8]]},
 {m:'SuperDrive 27',for:'C',od:[.420,.420],use:['indoor'],note:'27/64", over the World Archery 9.3 mm limit',s:[[280,9.0]]}];
const EA_ALSZ=[{m:'X23',for:'RC',use:['indoor'],sz:{2312:[9.5,.363,''],2314:[10.8,.357,'Easton: World Archery compliant'],2315:[11.8,.365,'Easton: World Archery compliant'],2318:[13.7,.365,'']}},
 {m:'X27',for:'RC',use:['indoor'],sz:{2712:[11.3,.420,'over the World Archery 9.3 mm limit']}}];
/* Aluminum Arrow Cut Length chart: same rows as the A/C chart, columns 21"-32"; each cell is AL_SEQ[row+col] (checked cell by cell) */
const AL_SEQ=['','','1214','1214','1416, 1516, 1514','1514','1614','1616, 1714','1716','1816, 1814','1914, 1913','1914, 1916, 2013, RX7-21','1916, 2013, 2014, RX7-21','2114, 2016, RX7-22','2114, 2213, RX7-23','2213, 2214, 2312, RX7-23','2214, 2314, 2413','2314, 2413, 2315','2512, 2613, 2712','2512, 2613, 2712','2512, 2613, 2712','2613, 2712',''];
/* Hunting Arrow Size Selection chart: compound (release, 301-340 fps ATA, 100 gr screw-in points) and traditional recurve rows,
   columns 23"-34" measured from the nock throat to the end of the shaft (not the point or insert). Cell = H_SEQ[row+col]. */
const H_SEQ=['','','','700-600','700-600','600-500','600-500','500-400','500-400','500-400','400-350','400-350','400-350','350-300','350-300','350-300','300-250','300-250','300-250','250-200','250-200','250-200','200-150','200-150'];
const H_C=[[22,26],[27,31],[32,36],[37,41],[42,46],[47,51],[52,56],[57,61],[62,66],[67,72],[73,78],[79,84],[85,90]];
const H_R=[[24,28],[29,32],[33,36],[37,41],[42,46],[47,51],[52,56],[57,61],[62,66],[67,72],[73,78],[79,84],[85,90]];
const EA_HUNT=[
 {m:'4MM Axis Long Range',od:[.229,.244],s:[[250,9.8],[300,9.3],[340,8.3],[400,7.6]]},
 {m:'5MM Axis',od:[.245,.286],s:[[200,12],[260,11.5],[300,10.7],[340,9.5],[400,9.0],[500,8.1],[600,7.2],[700,6.1]]},
 {m:'Easton 5.0',od:[.249,.273],s:[[200,10.6],[250,9.5],[300,8.4],[340,7.5],[400,6.8],[500,6.2]]},
 {m:'Sonic 6.0',od:[.268,.291],s:[[250,9.5],[300,8.8],[340,7.8],[400,7.2],[500,6.7],[600,5.8]]},
 {m:'6.5 Classic / Bowhunter',od:[.287,.298],s:[[340,9.3],[400,8.4],[500,7.3]]},
 {m:'6.5 Whiteout',od:[.291,.301],s:[[300,9.6],[340,8.8],[400,8.1],[500,7.5]]},
 {m:'4MM FMJ',od:[.234,.247],s:[[250,12.3],[300,11.7],[340,11.0],[400,9.8]]},
 {m:'5MM FMJ Max',od:[.257,.280],s:[[200,13.3],[250,11.3],[300,10.3],[340,9.8],[400,9.0]]},
 {m:'5MM FMJ Classic',od:[.256,.273],s:[[250,11.5],[300,12.0],[340,11.3],[400,10.2],[500,9.1]]},
 {m:'5MM Carbon Legacy',od:[.254,.272],s:[[340,9.8],[400,8.9],[500,8.0],[600,7.0],[700,6.8]]},
 {m:'6.5MM Carbon Legacy',od:[.289,.307],s:[[340,10.1],[400,9.3],[500,8.3],[600,7.5],[700,7.1]]}];
/* Gold Tip large-diameter target shafts (2025 catalogue O.D.); the spine selector chart is the same for every Gold Tip shaft */
const GT_FAT=[['Series 22','.338'],['Nine.3 Max','.365'],['X-Cutter','.380'],['30X','.399','made in 150 spine only'],['Triple X','.421']];
const USES=[['target','Target'],['indoor','Indoor'],['field','Field'],['3d','3D'],['hunting','Hunting']];

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
const fmtN=x=>(Math.round(x*10)/10).toString();
const mm=x=>(x*25.4).toFixed(1);
const spdT=f=>f<=275?-10:f<=300?-5:f<=320?0:f<=340?5:f<=350?10:15; /* Easton target chart, bow rating */
const spdH=f=>f<=300?-5:f<=340?0:f<=350?5:10;                     /* Easton hunting chart, ATA rating */
/* the chart weight and how it was reached, always shown so the archer can check every step */
function eaWeight(st){const fing=st.bow!='compound',hunt=st.use=='hunting',adj=[];let w=st.dw;
 if(!fing){if(isFinite(st.ibo)){const a=hunt?spdH(st.ibo):spdT(st.ibo);adj.push([`speed rating ${st.ibo} fps`,a]);w+=a}
  else adj.push([`speed rating not entered, read as ${hunt?'301-340':'301-320'} fps`,0])}
 else if(!hunt&&st.limb=='wood'){adj.push(['wood/glass limbs',-5]);w-=5}
 if(isFinite(st.pt)){const a=Math.round((st.pt-100)/25*3*10)/10;adj.push([`${st.pt} gr point (3 lb per 25 gr from 100 gr)`,a]);w+=a}
 else adj.push(['point weight not entered, read as 100 gr',0]);
 if(hunt&&isFinite(st.ins)&&st.ins>25){const a=Math.round(st.ins/25*3*10)/10;adj.push([`${st.ins} gr insert (chart: over 25 gr add 3 lb per 25 gr)`,a]);w+=a}
 const W=Math.round(w);
 const work=`${fmtN(st.dw)} lb `+adj.map(([l,a])=>`${a<0?'−':'+'} ${fmtN(Math.abs(a))} (${l}) `).join('')+`= ${fmtN(w)} lb, read at ${W} lb`;
 return{adj,w,W,work}}
/* sizes just outside the chart range, per family: one weaker (higher spine number) and one stiffer (lower number) */
function nearNum(m,hi,lo){const o=[],up=m.s.filter(x=>x[0]>hi).sort((a,b)=>a[0]-b[0])[0],dn=m.s.filter(x=>x[0]<lo).sort((a,b)=>b[0]-a[0])[0];
 if(up)o.push({model:m.m,spine:up[0],gpi:up[1],side:'weaker'});if(dn)o.push({model:m.m,spine:dn[0],gpi:dn[1],side:'stiffer'});return o}
function easton(st){const fing=st.bow!='compound',kind=fing?'R':'C',L=Math.round(st.len),use=st.use,hunt=use=='hunting';
 const{adj,W,work}=eaWeight(st);
 const out={brand:'Easton',src:hunt?'eastonH':'easton',adj,w:W,work,shafts:[],near:[],extra:[]};
 if(hunt){const rows=fing?H_R:H_C;Object.assign(out,{lenDef:'nock throat to the end of the shaft, not counting the point or insert'});
  if(W<rows[0][0])return Object.assign(out,{off:`${W} lb is below the hunting chart (lowest ${fing?'traditional recurve':'compound'} row ${rows[0][0]}-${rows[0][1]} lb)`});
  const r=rows.findIndex(x=>W<=x[1]);
  if(r<0)return Object.assign(out,{off:`${W} lb is above the hunting chart (top ${fing?'traditional recurve':'compound'} row ${rows[rows.length-1][0]}-${rows[rows.length-1][1]} lb)`});
  if(L<23||L>34)return Object.assign(out,{off:`${L}" is outside the hunting chart (23" to 34")`});
  const cell=H_SEQ[r+L-23];if(!cell)return Object.assign(out,{off:`the hunting chart has no size for ${rows[r][0]}-${rows[r][1]} lb at ${L}"`});
  const[hi,lo]=rng(cell);EA_HUNT.forEach(m=>{const inR=m.s.filter(([sp])=>sp<=hi&&sp>=lo);inR.forEach(([sp,g])=>out.shafts.push({brand:'Easton',model:m.m,spine:sp,gpi:g,od:m.od}));if(!inR.length)out.near.push(...nearNum(m,hi,lo))});
  return Object.assign(out,{cell:`Hunting chart, ${fing?'traditional recurve':'compound (release, 301-340 fps ATA, 100 gr screw-in points)'} row ${rows[r][0]}-${rows[r][1]} lb, ${L}" column`,spine:cell,hi,lo,
   fams:EA_HUNT,tip:fing?'Easton\'s hunting chart lists recurve rows for traditional (hunting) recurves; it has no barebow or Olympic recurve column.':''})}
 const rows=fing?EA_R:EA_C;Object.assign(out,{lenDef:'cut length to the throat of the nock'});
 const r=rows.findIndex(x=>W<=x[1]);
 if(r<0)return Object.assign(out,{off:`${W} lb is above the chart (top row ${rows[rows.length-1][0]} lb)`});
 if(L<21||L>34)return Object.assign(out,{off:`${L}" is outside the chart (21" to 34")`});
 const cell=EA_SEQ[r+L-21],[hi,lo]=rng(cell);
 let fams;
 if(use=='indoor')fams=EA_FAT.filter(m=>m.for.includes(kind));
 else if(use=='3d'){fams=EA_FAT.filter(m=>m.for.includes(kind)&&m.use.includes('3d'));if(!fams.length){fams=EA_SHAFTS.filter(m=>m.for.includes(kind)).map(m=>Object.assign({od:EA_OD[m.m]},m));out.tip3d='Easton names no 3D shaft for recurve or barebow, so its small-diameter target shafts are listed.'}}
 else fams=EA_SHAFTS.filter(m=>m.for.includes(kind)).map(m=>Object.assign({od:EA_OD[m.m]},m));
 fams.forEach(m=>{const inR=m.s.filter(([sp])=>sp<=hi&&sp>=lo);inR.forEach(([sp,g])=>out.shafts.push({brand:'Easton',model:m.m,spine:sp,gpi:g,od:m.od,note:m.note||''}));if(!inR.length||st.use=='indoor'||st.use=='3d')out.near.push(...nearNum(m,hi,lo))});
 /* indoor: X23 / X27 sizes from the aluminium chart (columns 21"-32") */
 let alInfo='';if(use=='indoor'){
  if(L>32)alInfo=`X23 / X27: ${L}" is past the aluminium chart (21" to 32").`;
  else{const ix=r+L-21,cellA=AL_SEQ[ix]||'',sizes=cellA.split(', ').filter(Boolean);alInfo=`Aluminium chart cell: ${cellA||'no size'}.`;
   EA_ALSZ.filter(f=>f.for.includes(kind)).forEach(f=>{const got=sizes.filter(z=>f.sz[z]);got.forEach(z=>out.shafts.push({brand:'Easton',model:f.m,spine:z,gpi:f.sz[z][0],od:[f.sz[z][1],f.sz[z][1]],note:f.sz[z][2],al:1}));
    if(!got.length){/* nearest chart cells either side that hold this family */
     for(let k=ix-1;k>=0;k--){const z=(AL_SEQ[k]||'').split(', ').filter(x=>f.sz[x]);if(z.length){z.forEach(x=>out.near.push({model:f.m,spine:x,gpi:f.sz[x][0],side:'weaker',al:1}));break}}
     for(let k=ix+1;k<AL_SEQ.length;k++){const z=(AL_SEQ[k]||'').split(', ').filter(x=>f.sz[x]);if(z.length){z.forEach(x=>out.near.push({model:f.m,spine:x,gpi:f.sz[x][0],side:'stiffer',al:1}));break}}}})}}
 return Object.assign(out,{cell:`${fing?'Recurve':'Compound'} row ${rows[r][0]} lb, ${L}" column`,spine:cell,hi,lo,alInfo,fams,
  tip:[fing?'Easton: for recurve, choose the weaker side of the range (the higher number) when there is a choice.':'',out.tip3d||''].filter(Boolean).join(' ')})}
/* the diameter class this purpose lists, from the catalogue O.D. of every family on the list */
function diaClass(st){const use=st.use,kind=st.bow!='compound'?'R':'C';
 const fams=use=='hunting'?EA_HUNT:use=='indoor'?EA_FAT.filter(m=>m.for.includes(kind)).concat(EA_ALSZ.map(f=>({m:f.m,od:[Math.min(...Object.values(f.sz).map(v=>v[1])),Math.max(...Object.values(f.sz).map(v=>v[1]))]})))
  :use=='3d'&&kind=='C'?EA_FAT.filter(m=>m.use.includes('3d')):EA_SHAFTS.filter(m=>m.for.includes(kind)).map(m=>({m:m.m,od:EA_OD[m.m]}));
 const lo=Math.min(...fams.map(m=>m.od[0])),hi=Math.max(...fams.map(m=>m.od[1]));
 const name={target:'Small-diameter target shafts',field:'Small-diameter target shafts',indoor:'Large-diameter indoor shafts',hunting:'Hunting shafts','3d':kind=='C'?'Large-diameter shafts Easton makes for indoor and 3D':'Small-diameter target shafts'}[use];
 const not={target:'Large-diameter indoor shafts are left out.',field:'Large-diameter indoor shafts are left out.',indoor:'Small-diameter outdoor shafts are never listed for Indoor.',hunting:'Target-only shafts are left out.','3d':''}[use];
 return{name,lo,hi,txt:`${name}: ${lo.toFixed(3).replace(/^0/,'')}"-${hi.toFixed(3).replace(/^0/,'')}" (${mm(lo)}-${mm(hi)} mm) outside diameter, from Easton's catalogue.`,not,fams:fams.map(m=>m.m)}}
function goldtip(st){const fing=st.bow!='compound',L=Math.round(st.len);const front=(isFinite(st.pt)?st.pt:100)+(isFinite(st.ins)?st.ins:0);
 const col=front<112.5?100:front<137.5?125:150,ch=fing?GT.R:(isFinite(st.ibo)&&st.ibo>=315?GT.C2:GT.C1);
 const out={brand:'Gold Tip',src:'gt',lenDef:'throat of the nock to the end of the insert',col,front};
 const lows=ch.lo[col],W=Math.round(st.dw);let r=lows.findIndex(lo=>lo!=null&&W>=lo&&W<=lo+4);
 const chartName=fing?'Recurve Bow':'Compound Bow, '+ch.t+(isFinite(st.ibo)?'':' (IBO not entered)');
 if(r<0)return Object.assign(out,{off:`${W} lb is not on the ${chartName} chart in the ${col} gr point column`});
 if(L<25||L>32)return Object.assign(out,{off:`${L}" is outside the chart (25" to 32")`});
 const sp=ch.g[r][L-25];
 return Object.assign(out,{cell:`${chartName}: ${lows[r]}-${lows[r]+4} lb in the ${col} gr column, ${L}"`,spine:String(sp),hi:sp,lo:sp,shafts:[],
  tip:(front<100?'Your front weight is under 100 gr, the lightest column on this chart. ':'')+(fing?'Gold Tip: start 1" longer than your finished arrow and cut down 1/4" at a time while bare-shaft tuning.':''),
  gtFat:st.use=='indoor'})}
function victory(st){const out={brand:'Victory',src:'victory',lenDef:'arrow length as printed on the chart'};
 if(st.use=='indoor')return Object.assign(out,{off:'Indoor lists large-diameter shafts only. Victory\'s chart covers its VF / RIP XV / RVL lines, and we have not confirmed any of them as a large-diameter indoor shaft'});
 if(st.bow!='compound')return Object.assign(out,{off:'Victory\'s recurve chart could not be read from its official page, so recurve and barebow are left out'});
 const W=Math.round(st.dw),L=Math.round(st.len);let r=VI.rows.findIndex(x=>W>=x[0]&&W<=x[1]);
 if(r<0)return Object.assign(out,{off:`${W} lb is outside the chart (32 to 100 lb)`});
 if(L<23||L>31)return Object.assign(out,{off:`${L}" is outside the chart (23" to 31")`});
 const sp=VI.g[r][L-23];if(!sp)return Object.assign(out,{off:'The chart shows no option for this weight and length'});
 return Object.assign(out,{cell:`${VI.rows[r][0]}-${VI.rows[r][1]} lb, ${L}" (bow rating 300-340 fps)`,spine:String(sp),hi:sp,lo:sp,
  shafts:[{brand:'Victory',model:'VF / RIP XV / RVL (chart lines)',spine:sp,gpi:NaN}],
  tip:'Chart footnote, as printed: "Spine Calculation based on Standard 30 Grains or less. *RIVAL(X) if 20gr back weight is NOT used".'+(isFinite(st.ibo)&&(st.ibo<300||st.ibo>340)?' Your IBO is outside the 300-340 fps this chart is for.':'')})}
function skylon(st){const fing=st.bow!='compound',W=Math.round(st.dw),L=Math.round(st.len);const out={brand:'Skylon',src:'skylon',lenDef:'cut to cut'};
 if(st.use=='indoor')return Object.assign(out,{off:'Indoor lists large-diameter shafts only, and the diameters of the shafts on Skylon\'s chart have not been checked'});
 if(st.use=='hunting')return Object.assign(out,{off:'Skylon\'s chart is for target, field and 3D, not hunting'});
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
function parsed(){const R=load();const st={bow:R.bow||'recurve',use:USES.some(u=>u[0]==R.use)?R.use:'target',limb:R.limb||'carbon',hand:R.hand||'R'};
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
/* the same FOC and total-weight maths for a saved arrow (My arrows): o = {len, pt, gpi, ins, nock, vanes, vpos, bp} as typed */
window.arrowBuild=function(o){const st={};['len','pt','gpi','ins','nock','vanes','vpos','bp'].forEach(k=>st[k]=num(o&&o[k]));if(!isFinite(st.len))return null;const b=build(st);return{foc:isFinite(b.foc)?b.foc:NaN,tw:b.tw,meas:b.meas,missing:b.missing}};
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
.acnear{margin:8px 0 0;border-top:1px dashed var(--line);padding-top:6px}.acnear>summary{font-weight:700;cursor:pointer;font-size:14px}.acdia{border-left:4px solid var(--blue);padding:6px 10px;background:var(--blue-bg);border-radius:8px}.acfrm{font-family:ui-monospace,Menlo,monospace;font-size:14px;background:var(--blue-bg);border-radius:8px;padding:8px 10px}`;
function css(){if(!document.getElementById('accss')){const s=document.createElement('style');s.id='accss';s.textContent=CSS;document.head.appendChild(s)}}
const seg=(k,v,opts)=>`<div class="labseg" role="group" aria-label="${k}">${opts.map(([val,l])=>`<button type="button" data-seg="${k}" data-val="${val}" aria-pressed="${v==val}">${l}</button>`).join('')}</div>`;
const inp=(k,R,l,unit,ph,hint)=>`<label for="ac_${k}">${l}${unit?` <span class="muted small">(${unit})</span>`:''}</label><input id="ac_${k}" data-k="${k}" inputmode="decimal" value="${h(R[k]??'')}"${ph?` placeholder="${h(ph)}"`:''}>${hint?`<p class="hint">${hint}</p>`:''}`;

E.lab_chooser=function(){css();const{R,st}=parsed();const res=results(st),fing=st.bow!='compound';
 const pickKey=s=>s.brand+'|'+s.model+'|'+s.spine;const pk=st.pick?pickKey(st.pick):'';
 const nearHTML=b=>{if(!b.near||!b.near.length)return'';const cmp=st.bow=='compound';
  const lab=n=>n.side=='weaker'?(n.al?'next chart cell on the weaker side':'one size weaker than the chart range'):(n.al?'next chart cell on the stiffer side':'one size stiffer than the chart range');
  return`<details class="acnear"${st.use=='indoor'||st.use=='3d'?' open':''}><summary>Sizes just outside the chart range</summary>
  <p class="small muted" style="margin:4px 0">${st.use=='indoor'||st.use=='3d'?'The next size either side of the chart range for each shaft listed for this use.':'Listed because no size of these shafts falls inside the range above.'} They are outside the maker's chart, so tune before buying a set.</p>
  ${b.near.map(n=>{const w=isFinite(n.gpi)&&isFinite(st.len)?Math.round(n.gpi*st.len):NaN;const id='p'+Math.random().toString(36).slice(2,8);
   return`<label class="acshaft" for="${id}"><input type="radio" name="acpick" id="${id}" data-pick='${h(JSON.stringify({brand:'Easton',model:n.model,spine:n.spine,gpi:isFinite(n.gpi)?n.gpi:null}))}' ${pickKey({brand:'Easton',model:n.model,spine:n.spine})==pk?'checked':''}><span><b>${h(n.model)} ${h(n.spine)}</b> <small>${lab(n)}${isFinite(n.gpi)?` · ${n.gpi} gr/in · shaft about ${w} gr at ${st.len}"`:''}</small></span></label>`}).join('')}
  <p class="small" style="margin:6px 0 0">${cmp?`Dr James Park tested compound arrows at the chart's recommended size and one and two sizes stiffer: all of them behaved similarly. He did not report on weaker sizes, so a weaker size needs a bare-shaft or paper tune. <span class="labsrc">${cite('park11')}</span>`
   :`Dr James Park's recurve study found that for any one bow there is usually no more than one size that matches it well, so outside the chart confirm with a bare-shaft tune. <span class="labsrc">${cite('park13')} (as summarised in ${cite('williams25')})</span>`}</p></details>`};
 const brandHTML=b=>{const working=b.work?`<p class="small" style="margin:4px 0 0">Chart weight: ${h(b.work)}.</p>`:'';
  if(b.off)return`<div class="brand"><h3>${h(b.brand)}</h3><p class="off">Not shown: ${h(b.off)}.</p>${working}${b.work&&/above|below/.test(b.off)?'<p class="small muted" style="margin:4px 0 0">If that weight looks wrong, check the draw weight, speed rating and point weight boxes above. A saved bow fills in the maker\'s speed rating.</p>':''}<p class="labsrc">Chart: ${cite(b.src)}</p></div>`;
  const shafts=b.shafts.length?b.shafts.map(s=>{const w=isFinite(s.gpi)&&isFinite(st.len)?Math.round(s.gpi*st.len):NaN;const id='p'+Math.random().toString(36).slice(2,8);
   const od=s.od?` · O.D. ${s.od[0]==s.od[1]?s.od[0].toFixed(3).replace(/^0/,''):s.od[0].toFixed(3).replace(/^0/,'')+'-'+s.od[1].toFixed(3).replace(/^0/,'')}"`:'';
   return`<label class="acshaft" for="${id}"><input type="radio" name="acpick" id="${id}" data-pick='${h(JSON.stringify({brand:s.brand,model:s.model,spine:s.spine,gpi:isFinite(s.gpi)?s.gpi:null}))}' ${pickKey(s)==pk?'checked':''}><span><b>${h(s.model)} ${h(s.spine)}</b> <small>${isFinite(s.gpi)?`${s.gpi} gr/in · shaft about ${w} gr at ${st.len}"`:'grains per inch not on this chart'}${od}${s.rp?` · Skylon recommended point ${h(s.rp)} gr`:''}${s.note?' · '+h(s.note):''}</small></span></label>`}).join('')
   :(b.brand=='Easton'?`<p class="small muted" style="margin:6px 0 0">No ${h(DC.name.toLowerCase())} size falls inside this range.</p>`:'');
  const skList=b.list&&b.list.length?`<p class="small" style="margin:6px 0 0">${b.list.map(x=>`${h(x[0])} ${h(x[b.k])}`).join(' · ')}</p>`:'';
  const gtFat=b.gtFat?`<p class="small" style="margin:6px 0 0">Gold Tip's chart is the same for every Gold Tip shaft. Its large-diameter target shafts: ${GT_FAT.map(x=>`${h(x[0])} (${x[1]}"${x[2]?', '+x[2]:''})`).join(', ')}. Check the catalogue for the spines each is made in. <span class="labsrc">${cite('gt25')}</span></p>`:'';
  return`<div class="brand" data-brand="${h(b.brand)}"><h3>${h(b.brand)} <span class="spn">${h(b.spine)}</span></h3><p class="small muted" style="margin:0">${h(b.cell)}. Length on this chart: ${h(b.lenDef)}.</p>
  ${working}${b.alInfo?`<p class="small muted" style="margin:4px 0 0">${h(b.alInfo)}</p>`:''}
  ${b.brand=='Skylon'?skList:''}${shafts}${b.brand=='Easton'?nearHTML(b):''}${gtFat}${b.tip?`<p class="small" style="margin:6px 0 0">${h(b.tip)}</p>`:''}<p class="labsrc" style="margin:6px 0 0">Chart: ${cite(b.src)}${b.alInfo?' · '+cite('eastonAL'):''}${b.brand=='Skylon'?' · '+cite('skylonB'):''}</p></div>`};
 const DC=diaClass(st);
 const cutLen=isFinite(st.len)?(isFinite(st.lenIn)?`${st.len}" (your measured length)`:`about ${st.len}" (your draw length; measure to be sure)`):'-';
 const B=build(st),fps=isFinite(st.fps)?st.fps:speedEst(st,B.tw);
 const focRanges=`<table class="labtbl"><thead><tr><th>Use</th><th>FOC</th><th>Source</th></tr></thead><tbody>
  <tr><th>Target, outdoor</th><td><b>10-15%</b></td><td class="small">Easton 2022 (0-90 m)</td></tr>
  <tr><th>Target, by shaft type</th><td><b>A/C/E 11-16%</b><br>A/C/C 9-11%<br>Aluminium 7-9%</td><td class="small">Easton Tuning Guide p. 32</td></tr>
  <tr><th>Indoor</th><td><b>7-15%</b></td><td class="small">Easton 2022. Easton: at short range FOC matters less</td></tr>
  <tr><th>Field</th><td>No field-only figure</td><td class="small">None of these sources publishes one. Easton's outdoor target 10-15% covers 0-90 m</td></tr>
  <tr><th>3D</th><td>No 3D-only figure</td><td class="small">None of these sources publishes one. For reference: Easton indoor 7-15%, hunting 10-15%</td></tr>
  <tr><th>Hunting</th><td><b>10-15%</b></td><td class="small">Easton 2022</td></tr>
  <tr><th>Point-weight tuning</th><td>stay within 7-16%</td><td class="small">Easton Tuning Guide p. 10</td></tr></tbody></table>`;
 const useFoc={target:'Easton outdoor target: 10-15%',indoor:'Easton indoor target: 7-15%',field:'No field-only figure published; Easton outdoor target is 10-15%',['3d']:'No 3D-only figure published; Easton hunting is 10-15%, indoor 7-15%',hunting:'Easton hunting: 10-15%'}[st.use];
 const ptLines=res?res.filter(b=>!b.off).map(b=>b.brand=='Easton'?`<li><b>Easton</b>: the ${st.use=='hunting'?'hunting chart assumes <b>100 gr</b> screw-in points':'chart assumes <b>100 gr</b> glue-in points'}. Under 100 gr: −3 lb of bow weight per 25 gr; over 100 gr: +3 lb per 25 gr (the chooser already applies this).</li>`
  :b.brand=='Gold Tip'?`<li><b>Gold Tip</b>: the chart has <b>100, 125 and 150 gr</b> columns, where point weight means point + insert + Ballistic Collar + FACT weight. Yours (${b.front} gr) was read in the ${b.col} gr column.</li>`
  :b.brand=='Victory'?`<li><b>Victory</b>: the compound chart gives no point weight; its footnote reads "Spine Calculation based on Standard 30 Grains or less".</li>`
  :`<li><b>Skylon</b>: the target chart gives no point weight. The Brixxon page recommends a point per spine${b.shafts.filter(s=>s.rp).length?': '+b.shafts.filter(s=>s.rp).map(s=>`${s.spine} → ${h(s.rp)} gr`).join(', '):''}.</li>`).join(''):'';
 const dP=window.arrowFocWith?{p:arrowFocWith({dpt:25}),m:arrowFocWith({dpt:-25})}:{};
 const parkUse={target:`Outdoor target: Dr Park recommends small-diameter, high-mass shafts (for example X10 or ProTour) for the least wind drift, and the heaviest point that tunes. <span class="labsrc">${cite('parkField')} · ${cite('parkFA')}</span>`,
  field:`Field: Dr Park suggests A/C/E-type shafts, the lowest mass for their stiffness, for more speed and closer sight marks; X10 or ProTour if it is windy, and a lighter point than for target. <span class="labsrc">${cite('parkField')} · ${cite('parkFA')}</span>`,
  indoor:`Indoor: large shafts cut more lines. Dr Park notes the large diameter is a disadvantage outdoors in wind, which is why they are listed for Indoor only. The fat-shaft choice itself comes from the makers, not from Dr Park. <span class="labsrc">${cite('parkField')}</span>`,
  '3d':`3D: Dr Park's published notes do not cover 3D arrows, so this list is Easton's own ("engineered for indoor and 3D"). <span class="labsrc">${cite('eastonAL')}</span>`,
  hunting:`Hunting: Dr Park's published notes do not cover hunting arrows, so this is Easton's hunting chart only. <span class="labsrc">${cite('eastonH')}</span>`}[st.use];
 app.innerHTML=`<div class="labbar"><button class="btn ghost labback" data-go="tools">‹ Tools</button><h1>Arrow chooser</h1></div>
 <div class="card acf"><span class="kicker">Your bow</span><h2 style="margin:2px 0 8px">Find a starting arrow</h2>
  ${seg('bow',st.bow,[['recurve','Recurve'],['barebow','Barebow'],['compound','Compound']])}
  ${inp('dw',R,fing?'Draw weight on your fingers':'Peak draw weight','lb',fing?'e.g. 40':'e.g. 60',fing?'The weight you actually hold at your own draw length, not the number on the limbs.':'The weight your limbs are set to now, not the maximum on the limb label.')}
  ${inp('dl',R,'Draw length','inches','e.g. 28')}
  ${fing?`<label for="ac_limb">Limbs</label><select id="ac_limb" data-k="limb"><option value="carbon"${st.limb=='carbon'?' selected':''}>Carbon or foam competition limbs</option><option value="wood"${st.limb=='wood'?' selected':''}>Wood/glass beginner limbs</option></select>`
   :inp('ibo',R,'Speed rating (IBO or ATA)','fps, optional','e.g. 330','On the bow or its spec sheet. Easton\'s charts move the weight up or down by bow speed.')}
  <label>What it's for</label>${seg('use',st.use,USES)}
  <p class="small acdia" id="acdia" style="margin:6px 0 0"><b>Listed:</b> ${h(DC.txt)} ${h(DC.not)}</p>
  ${inp('len',R,'Arrow length','inches, optional','same as draw length','Easton: draw an extra-long arrow and mark it about 1" in front of where it touches the rest. Leave blank to use your draw length.')}
  ${inp('pt',R,'Point weight','grains','e.g. 100')}
  <details class="acmore" id="acfoc"${OPEN=='foc'?' open':''}><summary>Arrow parts for FOC (optional)</summary><div>
  <div class="labgrid2"><div>${inp('gpiU',R,'Shaft weight','grains per inch',st.pick&&isFinite(st.pick.gpi)?String(st.pick.gpi):'from the shaft you pick below')}
   ${inp('ins',R,'Insert, pin or collar','grains','0','Easton 2026: 4MM Pin 9 gr; nock collar 3 gr; one-piece points need none.'+(st.use=='hunting'?' Easton hunting chart: inserts or outserts over 25 gr add 3 lb per 25 gr.':''))}
   ${inp('nock',R,'Nock','grains','e.g. 6','Easton 2026: 4MM Microlite nock 6 gr; G Nock 7 gr; Pin nock 2 gr.')}</div><div>
   ${inp('vanes',R,'All vanes together','grains','weigh or check the pack')}
   ${inp('vpos',R,'Vane middle from the nock throat','inches','blank = counted at the nock')}
   ${inp('bp',R,'Measured balance point','inches from the nock throat, optional','','Measured beats worked out. Balance the finished arrow on a knife edge.')}
   ${inp('fps',R,'Measured arrow speed','fps, chronograph, optional')}</div></div></div></details>
 </div>
 <div class="card acres"><span class="kicker">Result</span>
  <div class="acwarn" role="note">${ic('warn')}<b>A starting point only.</b> Confirm it with a bare-shaft tune before buying a full set.</div>
  ${res?`<p style="margin:6px 0 2px">Cut length: <b>${cutLen}</b></p>${fing?'<p class="small muted" style="margin:0">Gold Tip: start 1" longer and cut 1/4" at a time while bare-shaft tuning.</p>':''}
  <p class="small" style="margin:8px 0 0">Each brand's own chart. They differ, so use the chart for the brand you buy. Tap a shaft to choose it.</p>
  ${fing&&st.bow=='barebow'?'<p class="small muted" style="margin:4px 0 0">None of these charts has a barebow column, so the recurve (finger release) charts are used.</p>':''}
  ${res.map(brandHTML).join('')}`:'<p class="lab-note">Enter your draw weight and draw length to see the charts.</p>'}
  <div class="acfocres" id="acfocres"><h3 style="margin:12px 0 4px;font-size:16px">FOC: front of centre</h3>
  <p class="small" style="margin:0 0 6px">Easton's AMO-standard formula, as printed:</p>
  <p class="acfrm">F.O.C. % = 100 x (A - L/2) / L<br>L = Correct Arrow Length: bottom of nock groove to end of shaft<br>A = bottom of nock groove to the finished arrow's balance point (with point, insert, nock and fletching)</p>
  <p style="margin:10px 0 0" id="acfocout">FOC <span class="labout">${isFinite(B.foc)?f1(B.foc)+'%':'-'}</span> ${isFinite(B.foc)?`<span class="small muted">${B.meas?'from your measured balance point':'worked out from the component weights (an estimate)'}</span>`:'<span class="small muted">pick a shaft above and fill in the arrow parts</span>'}</p>
  <p class="small" style="margin:2px 0 0">Total arrow weight <b>${isFinite(B.tw)?Math.round(B.tw)+' gr':'-'}</b>${isFinite(B.tw)?` <span class="muted">= ${st.gpi} gr/in x ${st.len}" + point ${st.pt}${isFinite(st.ins)?' + insert '+st.ins:''}${isFinite(st.nock)?' + nock '+st.nock:''}${isFinite(st.vanes)?' + vanes '+st.vanes:''}</span>`:''}${B.missing.length?`<br><span class="muted">Not counted yet: ${B.missing.join(', ')}.</span>`:''}</p>
  <p class="small" style="margin:6px 0 0">For ${h({target:'target',indoor:'indoor',field:'field','3d':'3D',hunting:'hunting'}[st.use])}: <b>${h(useFoc)}</b>.</p>
  <details class="acmore"><summary>FOC ranges</summary><div>${focRanges}<p class="small muted">The Calculators page has the same FOC formula for a measured balance point. "Use this arrow" sends the length and balance point there.</p></div></details>
  <p class="labsrc">${cite('eastonTM')} · ${cite('eastonFOC')}</p></div>
  <details class="acmore" id="acpt"${OPEN=='pt'?' open':''}><summary>Point weight</summary><div>
  <ul style="padding-left:18px;margin:0">
  <li><b>Heavier point = acts weaker. Lighter point = acts stiffer.</b> Easton: "If your arrow is too weak, go to a lighter insert/point. If your arrow is too stiff, try a heavier insert/point." Dr Park's modelling shows the same trade-off: two A/C/E spines (620 and 670) could both be tuned to one bow, with the weaker 670 needing a much lighter point. <span class="labsrc">${cite('parkFly')}</span></li>
  <li><b>FOC:</b> more weight at the front moves the balance point forward, so FOC goes up. ${dP.p?`For this arrow: +25 gr → ${f1(dP.p.to)}%, −25 gr → ${f1(dP.m.to)}% (now ${f1(dP.p.from)}%).`:'Pick a shaft and fill in the arrow parts to see the numbers.'}</li>
  <li><b>Speed:</b> a heavier point makes the whole arrow heavier, so it leaves the bow slower. The Calculators' estimate (compound, IBO rule of thumb) takes about 1 fps off per 3 gr over 5 gr per lb of draw weight.</li></ul>
  <h3 style="margin:12px 0 4px;font-size:16px">Starting point weight, from each chart</h3>
  ${ptLines?`<ul style="padding-left:18px;margin:0">${ptLines}</ul>`:'<p class="small muted">Enter your bow above first.</p>'}
  <p class="small" style="margin:8px 0 0">Change point weight within Easton's 7-16% FOC range while tuning, and confirm with a bare-shaft tune.</p>
  <p class="labsrc">${cite('eastonTM')} · ${cite('eastonFOC')} · ${cite('easton')} · ${cite('gt')} · ${cite('skylonB')}</p></div></details>
  <details class="acmore" id="acpark"${OPEN=='park'?' open':''}><summary>Dr James Park: what his research says</summary><div>
  <p class="small" style="margin:0 0 6px">Dr Park (Monash University) publishes measurements and models, not a spine chart or formula. So the spine numbers above come from the makers' charts, and nothing here is a formula of our own. Where his work is clear, the page follows it:</p>
  <ul style="padding-left:18px;margin:0" class="small">
  <li><b>Diameter by use.</b> ${parkUse}</li>
  <li><b>Static spine</b> is the bend, in thousandths of an inch, of a bare shaft supported 28" apart with 1.94 lb (880 g) hung at the middle. <span class="labsrc">${cite('rieck12')}</span></li>
  <li><b>Static spine is not the whole story.</b> How the arrow bends when shot also depends on its length, point mass and the bow. A shaft's bend under load goes with the cube of its length, so a small cut changes it a lot. Tapered (barrelled) shafts such as X10 and A/C/E need modelling section by section, so their spine number alone is a rougher guide. <span class="labsrc">${cite('parkSel')}</span></li>
  <li><b>Compound:</b> the chart size and one or two sizes stiffer all behaved similarly; weaker sizes were not reported. <span class="labsrc">${cite('park11')}</span></li>
  <li><b>Recurve:</b> usually no more than one size suits a given bow well. <span class="labsrc">${cite('park13')} (as summarised in ${cite('williams25')})</span></li></ul></div></details>
  <div class="aclinks"><button class="btn alt" id="acuse"${res?'':' disabled'}>${ic('calc')} Use this arrow</button><button class="btn ghost" data-go="lab_calc">${ic('calc')} Calculators</button><button class="btn ghost" data-go="lab_opt">${ic('target')} Arrow optimizer</button></div>
  <p class="small muted" id="acusemsg" aria-live="polite" style="margin:6px 0 0"></p>
  <p class="small muted" style="margin:10px 0 0">Charts last checked 23 Oct 2026. Easton (target, aluminium and hunting charts), Gold Tip, Victory (compound only) and Skylon. If the printed chart and this page ever differ, the printed chart wins.</p>
 </div>`;
 /* events */
 app.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>nav(b.dataset.go));
 const put=(k,v)=>{const X=load();X[k]=v;store(X)};
 app.querySelectorAll('[data-seg]').forEach(b=>b.onclick=()=>{put(b.dataset.seg,b.dataset.val);render()});
 app.querySelectorAll('[data-k]').forEach(i=>i.onchange=()=>{put(i.dataset.k,i.value.trim());render()});
 app.querySelectorAll('[data-pick]').forEach(i=>i.onchange=()=>{const X=load();X.pick=JSON.parse(i.dataset.pick);delete X.gpiU;store(X);render()});
 ['acfoc','acpt','acpark'].forEach(id=>{const d=document.getElementById(id);if(d)d.ontoggle=()=>{OPEN=d.open?id.slice(2):(OPEN==id.slice(2)?null:OPEN)}});
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
