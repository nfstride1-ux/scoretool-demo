/* One-time sight marks seed for tester 'nathe' (23 Oct 2026, from Nathe via Archery Coach). Runs only on Nathe's own app,
   once. Source: his Precision Cut Archery sheet "Target Sight Marks, Concept x (Axcel Achieve XP Compound) - Ace (85 m density
   altitude)", 23 Oct 2026 12:10 AWST. Vertical marks for every metre 2-120 m copied exactly as printed (text, no rounding);
   the sheet has no horizontal marks.
   - Finds his EXISTING bow setup 'Hoyt concept x' by name (case and spaces ignored). Never creates a bow. Not found: does
     nothing and tries again next open.
   - Adds a NEW arrow set 'ACE' with these marks under that bow, only if no ACE set has marks on that bow yet.
   - Nothing else is touched: his other sets on that bow (e.g. SuperDrive 23's, SuperDrive mini), other bows, the bow/set
     he has selected, and every other tester. The flag (its own key) is written only after the save is read back. */
(function(){
const FLAG='scoretool.seed.nathe.ace-sightmarks-20261023';
const BOW='hoyt concept x',SET='ACE';
const MARKS={"2m":"60.70","3m":"44.60","4m":"36.90","5m":"32.50","6m":"29.75","7m":"28.00","8m":"26.80","9m":"26.05","10m":"25.55","11m":"25.25","12m":"25.10","13m":"25.10","14m":"25.20","15m":"25.35","16m":"25.55","17m":"25.80","18m":"26.15","19m":"26.50","20m":"26.90","21m":"27.30","22m":"27.75","23m":"28.20","24m":"28.65","25m":"29.15","26m":"29.70","27m":"30.20","28m":"30.75","29m":"31.30","30m":"31.90","31m":"32.45","32m":"33.05","33m":"33.65","34m":"34.25","35m":"34.90","36m":"35.50","37m":"36.15","38m":"36.80","39m":"37.45","40m":"38.10","41m":"38.75","42m":"39.40","43m":"40.10","44m":"40.80","45m":"41.45","46m":"42.15","47m":"42.85","48m":"43.55","49m":"44.30","50m":"45.00","51m":"45.70","52m":"46.45","53m":"47.20","54m":"47.95","55m":"48.65","56m":"49.45","57m":"50.20","58m":"50.95","59m":"51.70","60m":"52.50","61m":"53.25","62m":"54.05","63m":"54.85","64m":"55.65","65m":"56.45","66m":"57.25","67m":"58.05","68m":"58.85","69m":"59.65","70m":"60.50","71m":"61.35","72m":"62.15","73m":"63.00","74m":"63.85","75m":"64.70","76m":"65.55","77m":"66.40","78m":"67.30","79m":"68.15","80m":"69.05","81m":"69.90","82m":"70.80","83m":"71.70","84m":"72.60","85m":"73.50","86m":"74.40","87m":"75.35","88m":"76.25","89m":"77.20","90m":"78.10","91m":"79.05","92m":"80.00","93m":"80.95","94m":"81.90","95m":"82.85","96m":"83.85","97m":"84.80","98m":"85.80","99m":"86.75","100m":"87.75","101m":"88.75","102m":"89.75","103m":"90.75","104m":"91.80","105m":"92.80","106m":"93.85","107m":"94.85","108m":"95.90","109m":"96.95","110m":"98.00","111m":"99.05","112m":"100.15","113m":"101.20","114m":"102.30","115m":"103.40","116m":"104.45","117m":"105.55","118m":"106.65","119m":"107.80","120m":"108.90"};
window.NATHE_ACE_SEED={FLAG,BOW,SET,MARKS};
const norm=x=>String(x||'').toLowerCase().replace(/\s+/g,'');
function run(){try{
 if(typeof TESTER=='undefined'||!TESTER||TESTER.id!='nathe'||typeof S=='undefined'||!S||!S.profile)return false;
 if(localStorage.getItem(FLAG))return false;
 const me=S.profile,b=(S.bows||[]).find(x=>x.archer==me&&norm(x.name)==norm(BOW));
 if(!b)return false;                                   /* no bow yet: retry next open, flag stays unset */
 const sets=S.arrowSets||[],ex=sets.find(a=>a.archer==me&&norm(a.name)==norm(SET));
 const has=a=>{const m=a.id=='arrows1'?(b.marks||{}):((b.setMarks||{})[a.id]||{});return Object.keys(m).some(d=>m[d]&&(m[d].v||m[d].h))};
 let a=ex,added=false;
 if(ex&&(ex.id=='arrows1'||has(ex))){ /* an ACE set already has marks on this bow: leave it */ }
 else{
  if(!a){a={id:'as-nathe-ace-20261023',archer:me,name:SET,src:'Precision Cut Archery sheet, 23 Oct 2026 12:10 AWST (Concept x - Ace, 85 m density altitude)'};S.arrowSets=sets;sets.push(a)}
  const m={};for(const d in MARKS)m[d]={v:MARKS[d]};b.setMarks=b.setMarks||{};b.setMarks[a.id]=m;added=true;
  save();
  const back=JSON.parse(localStorage.getItem(KEY)||'null'),bb=back&&(back.bows||[]).find(x=>x.id==b.id);
  if(!bb||!bb.setMarks||Object.keys(bb.setMarks[a.id]||{}).length!=Object.keys(MARKS).length||!(back.arrowSets||[]).some(x=>x.id==a.id))return false;
 }
 localStorage.setItem(FLAG,JSON.stringify({at:new Date().toISOString(),bow:b.id,set:a.id,rows:added?Object.keys(MARKS).length:0,added}));
 return true;
}catch(e){console.warn('sight marks seed not done',e);return false}}
run();window.natheAceSeed=run;
})();
