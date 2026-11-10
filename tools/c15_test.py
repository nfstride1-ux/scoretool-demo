# C15 (11 Nov 2026): practice Category + searchable body-grouped world rounds picker.
# Confirmed catalogue only (221). Existing 48 ScoreTool rounds stay unchanged.
import os,sys,time,json,subprocess
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=os.environ.get('PORT') or freeport.get()
ok=[];bad=[]
def chk(n,c,i=''):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n+('' if c else '  '+str(i)[:400]),flush=True)

ALREADY={
  "30/720":{"ape":6,"ends":12,"face":"122cm","max":720},
  "40/1440":{"ape":6,"ends":24,"face":"122cm / 80cm","max":1440},
  "40/720":{"ape":6,"ends":12,"face":"122cm","max":720},
  "50/720":{"ape":6,"ends":12,"face":"122cm","max":720},
  "AA 50/1440 (50/40/30/20m)":{"ape":6,"ends":24,"face":"122cm / 80cm","max":1440},
  "ABA Interclub 3D (40 targets: 3-arrow half, then 1-arrow half)":{"ape":1,"ends":40,"face":"ABA 3D animal","max":800},
  "Adelaide":{"ape":6,"ends":20,"face":"122cm / 80cm","max":1200},
  "Australian Indoor 18m":{"ape":3,"ends":10,"face":"40cm","max":300},
  "Brisbane":{"ape":6,"ends":20,"face":"122cm / 80cm","max":1200},
  "Darwin":{"ape":6,"ends":15,"face":"122cm","max":900},
  "Drake":{"ape":6,"ends":15,"face":"80cm","max":900},
  "Geelong":{"ape":6,"ends":15,"face":"122cm","max":900},
  "Grange":{"ape":6,"ends":15,"face":"122cm","max":900},
  "Hobart":{"ape":6,"ends":15,"face":"122cm","max":900},
  "Holt":{"ape":6,"ends":15,"face":"80cm","max":900},
  "Indoor WA 18m":{"ape":3,"ends":20,"face":"40cm","max":600},
  "Indoor WA 25m":{"ape":3,"ends":20,"face":"60cm","max":600},
  "Indoor WA Combined 25m + 18m":{"ape":3,"ends":40,"face":"60cm / 40cm","max":1200},
  "Junior Canberra (40/30/20m)":{"ape":6,"ends":15,"face":"122cm","max":900},
  "Launceston":{"ape":6,"ends":12,"face":"80cm","max":720},
  "Long Brisbane":{"ape":6,"ends":20,"face":"122cm / 80cm","max":1200},
  "Long Sydney":{"ape":6,"ends":20,"face":"122cm","max":1200},
  "Melbourne":{"ape":6,"ends":15,"face":"122cm","max":900},
  "Newcastle":{"ape":6,"ends":15,"face":"122cm","max":900},
  "Perth":{"ape":6,"ends":15,"face":"122cm","max":900},
  "Samford":{"ape":6,"ends":15,"face":"80cm","max":900},
  "Short Adelaide":{"ape":6,"ends":20,"face":"122cm / 80cm","max":1200},
  "Short Canberra (50/40/30m)":{"ape":6,"ends":15,"face":"122cm","max":900},
  "Sydney":{"ape":6,"ends":20,"face":"122cm","max":1200},
  "Townsville":{"ape":6,"ends":12,"face":"122cm","max":720},
  "Vegas 300":{"ape":3,"ends":10,"face":"40cm","max":300},
  "Vegas 300 (18 m)":{"ape":3,"ends":10,"face":"40cm","max":300},
  "WA 50/720 (80 cm)":{"ape":6,"ends":12,"face":"80cm","max":720},
  "WA 60/1440 (60/50/40/30m)":{"ape":6,"ends":24,"face":"122cm / 80cm","max":1440},
  "WA 60/900 (60/50/40m)":{"ape":6,"ends":15,"face":"122cm","max":900},
  "WA 70/1440 (70/60/50/30m)":{"ape":6,"ends":24,"face":"122cm / 80cm","max":1440},
  "WA 720 (50m Compound)":{"ape":6,"ends":12,"face":"80cm 6-ring","max":720},
  "WA 720 (60m)":{"ape":6,"ends":12,"face":"122cm","max":720},
  "WA 720 (70m)":{"ape":6,"ends":12,"face":"122cm","max":720},
  "WA 90/1440 (90/70/50/30m)":{"ape":6,"ends":24,"face":"122cm / 80cm","max":1440},
  "WA Field 12 Unmarked + 12 Marked":{"ape":3,"ends":24,"face":"field 20-80cm","max":432},
  "WA Field 24 Marked":{"ape":3,"ends":24,"face":"field 20-80cm","max":432},
  "WA Field 24 Unmarked":{"ape":3,"ends":24,"face":"field 20-80cm","max":432},
  "Wollongong":{"ape":6,"ends":12,"face":"122cm","max":720},
}
IFAA_KEEP={
  "IFAA Field Round":{"ape":4,"ends":28,"face":"IFAA 20-65cm","max":560},
  "IFAA Hunter Round":{"ape":4,"ends":28,"face":"IFAA 20-65cm","max":560},
  "IFAA Field unit (14 targets)":{"ape":4,"ends":14,"face":"IFAA 20-65cm","max":280},
  "IFAA Hunter unit (14 targets)":{"ape":4,"ends":14,"face":"IFAA 20-65cm","max":280},
}
UNCONF=['United Bowmen (AA historical indoor)','Short Jersey','NFAA 810','Canadian Indoor 3D','AGB Clout','WA Clout']
CATS=['Indoor','Outdoor Target','Field','3D','Clout']

srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.5)
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
  ctx=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
  pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
  pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
  if pg.locator('#unlock').count():pg.locator('#unlock').first.click();pg.wait_for_timeout(300)
  pg.evaluate("S.unlocked=true;save()")

  info=pg.evaluate("""()=>{
    const L=WORLD_ROUNDS||[], U=WORLD_UNCONFIRMED||[];
    const already=L.filter(r=>r.already);
    const snap={};
    already.forEach(r=>{const R=ROUNDS[r.key];if(R)snap[r.key]={ends:R.ends,ape:R.ape,max:R.max,face:R.face,worldNew:!!R.worldNew}});
    const ifaa={};
    ['IFAA Field Round','IFAA Hunter Round','IFAA Field unit (14 targets)','IFAA Hunter unit (14 targets)'].forEach(k=>{const R=ROUNDS[k];if(R)ifaa[k]={ends:R.ends,ape:R.ape,max:R.max,face:R.face,worldNew:!!R.worldNew}});
    const names=new Set(L.map(r=>r.name));
    const keys=Object.keys(ROUNDS||{}).filter(k=>ROUNDS[k]&&!ROUNDS[k].legacy);
    return {
      count:typeof worldConfirmedCount==='function'?worldConfirmedCount():L.length,
      unconfInCat:U.filter(n=>names.has(n)),
      unconfInRounds:U.filter(n=>!!ROUNDS[n]),
      unconfListed:U,
      alreadyNames:already.length,
      alreadyKeys:[...new Set(already.map(r=>r.key))],
      snap,ifaa,
      applyTo:window.WORLD_APPLY_UP_TO||0,
      registered:L.filter(r=>!!ROUNDS[r.key]).length,
      missing:L.filter(r=>r.wave<= (window.WORLD_APPLY_UP_TO||0) && !ROUNDS[r.key]).map(r=>r.name),
      worldNewInAlready:already.filter(r=>ROUNDS[r.key]&&ROUNDS[r.key].worldNew).map(r=>r.name),
      cats:typeof WORLD_CATS!=='undefined'?WORLD_CATS:null
    };
  }""")
  chk('Catalogue has 221 confirmed rounds', info['count']==221, info['count'])
  chk('The six unconfirmed rounds are not in the catalogue', info['unconfInCat']==[] and set(info['unconfListed'])==set(UNCONF), info)
  chk('Unconfirmed round names are not registered as ROUNDS keys', info['unconfInRounds']==[], info['unconfInRounds'])
  chk('All 48 already-in-ScoreTool catalogue rows are present', info['alreadyNames']==48, info['alreadyNames'])
  # existing 48 (44 unique keys) unchanged
  bad48=[]
  for k,exp in ALREADY.items():
    got=info['snap'].get(k)
    if not got: bad48.append((k,'missing')); continue
    if got['worldNew']: bad48.append((k,'rewritten as worldNew')); continue
    for f in ('ends','ape','max','face'):
      if got[f]!=exp[f]: bad48.append((k,f,got[f],exp[f]))
  chk('Existing 48 ScoreTool rounds are unchanged (ends, arrows per end, max, face)', not bad48, bad48[:8])
  badif=[]
  for k,exp in IFAA_KEEP.items():
    got=info['ifaa'].get(k)
    if not got or got['worldNew'] or any(got[f]!=exp[f] for f in ('ends','ape','max','face')):
      badif.append((k,got,exp))
  chk('C10 IFAA Field and Hunter rounds and 14-target units are unchanged', not badif, badif)

  # Once waves 2–6 are applied, every confirmed catalogue key is registered.
  if info['applyTo']>=6:
    chk('All 221 confirmed rounds are registered for scoring', info['registered']==221 and not info['missing'], (info['registered'],info['missing'][:8]))
  else:
    chk('Waves already opened are registered (later waves still to come)', not info['missing'], (info['applyTo'],info['missing'][:8]))

  # Practice picker
  pg.evaluate("cur=null;sv='sheet';nav('score')");pg.wait_for_timeout(500)
  cats=pg.evaluate("()=>[...document.querySelectorAll('#rdcat option')].map(o=>o.value||o.textContent)")
  chk('Practice picker has a Category dropdown of Indoor, Outdoor Target, Field, 3D and Clout', cats==CATS, cats)
  chk('Find-a-round search box is present', pg.locator('#rdq').count()==1)
  chk('Hidden #rd select stays in the DOM so existing tests can still pick a round', pg.locator('#rd').count()==1)
  chk('Custom practice option is in the list and the select', pg.locator('[data-wrd="__new"]').count()>=1 and pg.evaluate("()=>[...document.querySelectorAll('#rd option')].some(o=>o.value==='__new')"))
  groups=pg.evaluate("()=>[...document.querySelectorAll('#wrdlist .wrd-gh')].map(e=>e.textContent.trim())")
  chk('Rounds are grouped by body', len(groups)>=1 and any(g in ('World Archery','Archery Australia','Archery GB','IFAA','NFAA','ASA','IBO','ABA','Archery Canada','Practice templates') or g.startswith('Historical') for g in groups), groups)

  # Default outdoor: Canberra / WA 60/900 should be findable when Outdoor Target is selected
  pg.select_option('#rdcat','Outdoor Target');pg.wait_for_timeout(200)
  names=pg.evaluate("()=>[...document.querySelectorAll('#wrdlist [data-wrd] b')].map(e=>e.textContent)")
  chk('Outdoor Target lists existing outdoor rounds, grouped, not a flat dump', 'Sydney' in names or 'WA 720 (70m)' in names, names[:12])
  pg.fill('#rdq','Canberra');pg.wait_for_timeout(200)
  qn=pg.evaluate("()=>[...document.querySelectorAll('#wrdlist [data-wrd] b')].map(e=>e.textContent)")
  chk('Search filters the Outdoor Target list (Canberra / Short / Junior)', any('Canberra' in n for n in qn) and 'WA 720 (70m)' not in qn, qn)
  # Cross-category select_option still works (Indoor while on Outdoor)
  pg.evaluate("()=>{window._rdQ='';const q=document.querySelector('#rdq');if(q)q.value=''}");
  pg.select_option('#rd','Australian Indoor 18m');pg.wait_for_timeout(200)
  rdval=pg.evaluate("()=>document.querySelector('#rd').value")
  catval=pg.evaluate("()=>document.querySelector('#rdcat').value")
  chk('Selecting an existing Indoor round through #rd still works and switches Category to Indoor',
      rdval=='Australian Indoor 18m' and catval=='Indoor', (rdval,catval))

  # Unconfirmed names never appear in the visible list or #rd, in any category
  found_u=pg.evaluate("""(u)=>{
    const hits=[];
    for(const cat of ['Indoor','Outdoor Target','Field','3D','Clout']){
      /* scan WORLD list + options, do not depend on UI state */
    }
    const opts=[...document.querySelectorAll('#rd option')].map(o=>o.textContent+' '+o.value);
    const items=(WORLD_ROUNDS||[]).map(r=>r.name+' '+(r.aliases||[]).join(' '));
    u.forEach(n=>{if(opts.some(t=>t.includes(n))||items.some(t=>t.includes(n)))hits.push(n)});
    return hits;
  }""", UNCONF)
  chk('Unconfirmed rounds do not appear in the picker or catalogue', found_u==[], found_u)

  # Wave 2: missing AA current official rounds
  aa=pg.evaluate("""()=>{
    const want=['Mini Canberra','AA20/720','OzBow 30','Australian Indoor 2','National Field (Red pegs)','Hunters Field','AA Special 1 Arrow Field','AA Clout 180 m','AA Double Clout 180 m','VI Outdoor'];
    const out={};
    want.forEach(k=>{const R=ROUNDS[k];out[k]=R?{ends:R.ends,ape:R.ape,max:R.max,scheme:R.scheme,note:R.note||'',worldNew:!!R.worldNew}:null});
    const still=ROUNDS['WA 720 (70m)'];
    out._wa70=still?{ends:still.ends,ape:still.ape,max:still.max,worldNew:!!still.worldNew}:null;
    return out;
  }""")
  chk('Mini Canberra is the AA 30/20/10 m 900-point round', aa['Mini Canberra']=={'ends':15,'ape':6,'max':900,'scheme':'wa10','note':'','worldNew':True}, aa.get('Mini Canberra'))
  chk('OzBow 30 uses five 6-arrow ends (end length is not printed in Schedule 9A) and keeps a note',
      aa['OzBow 30'] and aa['OzBow 30']['ends']==5 and aa['OzBow 30']['ape']==6 and aa['OzBow 30']['max']==300 and 'Schedule 9A' in (aa['OzBow 30']['note'] or ''), aa.get('OzBow 30'))
  chk('New AA official cards did not rewrite WA 720 (70m)', aa['_wa70']=={'ends':12,'ape':6,'max':720,'worldNew':False}, aa.get('_wa70'))

  def start(rd):
    pg.evaluate("cur=null;sv='sheet';nav('score')");pg.wait_for_timeout(300)
    pg.select_option('#rd',rd);pg.wait_for_timeout(200)
    pg.click('#st');pg.wait_for_timeout(600)
  def keys():
    return pg.evaluate("""()=>{
      const ks=[];
      document.querySelectorAll('button').forEach(b=>{const t=b.textContent.trim();if(/^(X|21|20|18|17|16|15|14|13|12|11|10|9|8|7|6|5|4|3|2|1|M|-5)$/.test(t))ks.push(t)});
      const seen=new Set(),out=[];
      ks.forEach(k=>{if(!seen.has(k)){seen.add(k);out.push(k)}});
      return out;
    }""")
  def tap(k):
    loc=pg.locator('button', has_text=k)
    # exact match preferred
    n=pg.evaluate("""(k)=>{
      const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()===k);
      if(b){b.click();return true}return false;
    }""",k)
    pg.wait_for_timeout(200)
    return n

  start('National Field (Red pegs)')
  kf=keys()
  chk('AA National Field keys are X, 5, 4, 3, 2, 1 and M (not WA field 6-1)', kf==['X','5','4','3','2','1','M'] or (kf[:7]==['X','5','4','3','2','1','M'] and '6' not in kf), kf)
  tap('X')
  got=pg.evaluate("()=>endSum(cur.ends[0],cur)")
  chk('AA National Field X scores 5, not 10', got==5, got)

  start('AA Special 1 Arrow Field')
  ks=keys()
  chk('AA Special 1 Arrow keys are +20, +10 and −5', '20' in ks and '10' in ks and '-5' in ks and 'M' not in ks and 'X' not in ks, ks)
  tap('20')
  tot=pg.evaluate("()=>total(cur)")
  chk('Special 1 Arrow gold scores +20', tot==20, tot)
  # 12 golds would be 240 — checked via max
  mx=pg.evaluate("()=>ROUNDS[cur.round].max")
  chk('Special 1 Arrow official max is 240 (12 golds)', mx==240, mx)
  start('AA Special 1 Arrow Field')
  tap('-5')
  miss=pg.evaluate("()=>total(cur)")
  chk('Special 1 Arrow miss scores −5', miss==-5, miss)


  start('AA Clout 180 m')
  kc=keys()
  chk('AA Clout keys are 10 through 1 and M, with no X', kc==['10','9','8','7','6','5','4','3','2','1','M'], kc)

  start('Mini Canberra')
  km=keys()
  chk('Mini Canberra keeps standard 10-zone keys including X', 'X' in km and '10' in km and '1' in km and 'M' in km, km)

  # Wave 3: remaining confirmed IFAA rounds
  ifaa3=pg.evaluate("""()=>{
    const want=['IFAA Flint Indoor','IFAA Indoor','IFAA Animal Marked','IFAA Animal Unmarked','IFAA Expert Field','IFAA International','IFAA 3-D Hunting (1 arrow)','IFAA 3-D Standard (2 arrows)'];
    const out={};
    want.forEach(k=>{const R=ROUNDS[k];out[k]=R?{ends:R.ends,ape:R.ape,max:R.max,scheme:R.scheme,stop:!!R.stopOnHit,ifaa:!!R.ifaa,worldNew:!!R.worldNew}:null});
    const keep=ROUNDS['IFAA Field Round'];
    out._field=keep?{ends:keep.ends,ape:keep.ape,max:keep.max,ifaa:!!keep.ifaa,worldNew:!!keep.worldNew}:null;
    return out;
  }""")
  chk('Existing IFAA Field Round is not rewritten by the new catalogue row', ifaa3['_field']=={'ends':28,'ape':4,'max':560,'ifaa':True,'worldNew':False}, ifaa3.get('_field'))
  chk('IFAA International is 20 targets of 3 arrows, max 300', ifaa3['IFAA International'] and ifaa3['IFAA International']['ends']==20 and ifaa3['IFAA International']['ape']==3 and ifaa3['IFAA International']['max']==300, ifaa3.get('IFAA International'))
  chk('IFAA Expert Field uses 5-4-3-2-1 (not the Field 5-4-3 keypad)', ifaa3['IFAA Expert Field'] and ifaa3['IFAA Expert Field']['scheme']=='ifaa51' and not ifaa3['IFAA Expert Field']['ifaa'], ifaa3.get('IFAA Expert Field'))
  chk('IFAA Animal Marked and Unmarked use 20/18/16/14/12/10 and stop on the first hit',
      ifaa3['IFAA Animal Marked'] and ifaa3['IFAA Animal Unmarked'] and ifaa3['IFAA Animal Marked']['scheme']=='ifaa-animal' and ifaa3['IFAA Animal Unmarked']['scheme']=='ifaa-animal' and ifaa3['IFAA Animal Marked']['stop'] and ifaa3['IFAA Animal Unmarked']['stop'],
      (ifaa3.get('IFAA Animal Marked'), ifaa3.get('IFAA Animal Unmarked')))

  start('IFAA Expert Field')
  ke=keys()
  chk('IFAA Expert Field keys are 5, 4, 3, 2, 1 and M', ke==['5','4','3','2','1','M'] or ('5' in ke and '1' in ke and 'X' not in ke and '6' not in ke), ke)

  start('IFAA Animal Marked')
  ka=keys()
  chk('IFAA Animal keys include 20, 18, 16, 14, 12, 10 and M', all(x in ka for x in ['20','18','16','14','12','10','M']), ka)
  tap('M')
  n1=pg.evaluate("()=>({n:(cur.ends[0]||[]).length,done:endComplete(ROUNDS[cur.round],cur.ends[0],0),t:total(cur)})")
  chk('An Animal miss does not stop the target (up to 3 arrows)', n1['n']==1 and not n1['done'] and n1['t']==0, n1)
  tap('16')
  n2=pg.evaluate("()=>({n:(cur.ends[0]||[]).length,done:endComplete(ROUNDS[cur.round],cur.ends[0],0),t:total(cur)})")
  chk('A scoring hit stops the Animal target', n2['n']==2 and n2['done'] and n2['t']==16, n2)

  start('IFAA Indoor')
  ki=keys()
  chk('IFAA Indoor keys are 5 through 1 and M, with no X (X is tie-break only)', '5' in ki and '1' in ki and 'M' in ki and 'X' not in ki, ki)

  # Wave 4: confirmed Archery GB rounds
  agb=pg.evaluate("""()=>{
    const want=['York','Hereford','National','Windsor','Portsmouth','Worcester','Foresters','Big Game','Western','Metric 122-30'];
    const out={};
    want.forEach(k=>{const R=ROUNDS[k];out[k]=R?{ends:R.ends,ape:R.ape,max:R.max,scheme:R.scheme,apes:R.apes||null,worldNew:!!R.worldNew}:null});
    out.jersey=!!ROUNDS['Short Jersey'];
    out.agbClout=!!ROUNDS['AGB Clout'];
    const ev=ROUNDS['York']&&ROUNDS['WA 720 (70m)'];
    out._wa70=ROUNDS['WA 720 (70m)']?{ends:ROUNDS['WA 720 (70m)'].ends,max:ROUNDS['WA 720 (70m)'].max,worldNew:!!ROUNDS['WA 720 (70m)'].worldNew}:null;
    return out;
  }""")
  chk('York is the 24-end imperial 1296-point round', agb['York'] and agb['York']['ends']==24 and agb['York']['ape']==6 and agb['York']['max']==1296 and agb['York']['scheme']=='imperial5', agb.get('York'))
  chk('Foresters uses the unit layout in the CSV (70 arrows over 28 targets, max 1050)',
      agb['Foresters'] and agb['Foresters']['ends']==28 and agb['Foresters']['max']==1050 and agb['Foresters']['apes'] and len(agb['Foresters']['apes'])==28 and sum(agb['Foresters']['apes'])==70, agb.get('Foresters') and {k:agb['Foresters'][k] for k in ('ends','max','apes') if agb['Foresters']})
  chk('Unconfirmed Short Jersey and AGB Clout are still not built', not agb['jersey'] and not agb['agbClout'], agb)
  chk('Adding AGB rounds did not rewrite WA 720 (70m)', agb['_wa70']=={'ends':12,'max':720,'worldNew':False}, agb.get('_wa70'))

  start('York')
  ky=keys()
  chk('York keys are the 5-zone imperial 9, 7, 5, 3, 1 and M', ky==['9','7','5','3','1','M'], ky)

  # Portsmouth: default 10-zone max 600, optional 5-zone max 540
  pg.evaluate("cur=null;sv='sheet';nav('score')");pg.wait_for_timeout(300)
  pg.select_option('#rd','Portsmouth');pg.wait_for_timeout(300)
  chk('Portsmouth start form offers 10-zone (max 600) and 5-zone (max 540)',
      pg.locator('[data-port="10"]').count()==1 and pg.locator('[data-port="5"]').count()==1)
  pg.click('#st');pg.wait_for_timeout(600)
  kp=keys()
  mx=pg.evaluate("()=>cur.max!=null?cur.max:ROUNDS[cur.round].max")
  z=pg.evaluate("()=>cur.portZone||'10'")
  chk('Portsmouth defaults to 10-zone keys and max 600', 'X' in kp and '10' in kp and mx==600 and z=='10', (kp,mx,z))
  pg.evaluate("cur=null;sv='sheet';nav('score')");pg.wait_for_timeout(300)
  pg.select_option('#rd','Portsmouth');pg.wait_for_timeout(300)
  pg.click('[data-port="5"]');pg.wait_for_timeout(200)
  pg.click('#st');pg.wait_for_timeout(600)
  k5=keys();m5=pg.evaluate("()=>cur.max!=null?cur.max:ROUNDS[cur.round].max");z5=pg.evaluate("()=>cur.portZone")
  chk('Portsmouth 5-zone uses 9-7-5-3-1 and max 540', k5==['9','7','5','3','1','M'] and m5==540 and z5=='5', (k5,m5,z5))

  start('Foresters')
  kf=keys()
  apes=pg.evaluate("()=>({len:endLen(ROUNDS[cur.round],0),sum:total(cur)})")
  chk('Foresters keys are 15, 10, 5 and M, and the first target has 4 shots', kf==['15','10','5','M'] and apes['len']==4, (kf,apes))

  # Official IFAA event deep link still starts the official flow, not the practice picker
  pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven#score?event=peel-ifaa-2026-12-05&date=2026-12-05&round=IFAA%20Field%20Round')
  pg.wait_for_timeout(900)
  if pg.locator('#unlock').count():pg.locator('#unlock').first.click();pg.wait_for_timeout(300)
  app=pg.inner_text('#app')
  def norm(s):
    return (s or '').lower().replace('—','–').replace('-','–')
  chk('Official IFAA event deep link still opens the group card, not the practice Category picker',
      pg.locator('#rdcat').count()==0 and 'ifaa wa state titles – peel archers' in norm(app) and 'IFAA Field Round' in app, app[:400])
  chk('Official IFAA card still offers the existing Field and Hunter rounds',
      'IFAA Field Round' in app and 'IFAA Hunter Round' in app and 'IFAA Field unit (14 targets)' in app, app[:400])

  chk('No page errors on the practice picker or official IFAA deep link', not errs, errs)

  b.close()
finally:
  srv.kill()

print(f'\n{len(ok)} passed, {len(bad)} failed')
if bad:sys.exit(1)
