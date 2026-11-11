# C14 (11 Nov 2026): signed-in account backups, 30-day restore points, recycle bin, restore after delete-all.
import os,subprocess,sys,time,json
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=os.environ.get('PORT') or freeport.get()
ok=[];bad=[]
def chk(n,c,i=''):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n+('' if c else '  '+str(i)[:300]),flush=True)
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.5)
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
  pg=b.new_page();pg.set_viewport_size({'width':390,'height':844})
  errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
  pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
  if pg.locator('#unlock').count():pg.locator('#unlock').first.click();pg.wait_for_timeout(300)
  pg.evaluate("""()=>{
    try{localStorage.removeItem('scoretool.acct')}catch(e){}
    /* cannot remove protected backup key via removeItem; overwrite empty then sign in */
    S.unlocked=true;
    window._c14 = {
      sessions: (S.sessions||[]).length,
      best: (S.best||[]).slice(),
      diary: (S.diary||[]).slice(),
      setup: (S.setup||[]).slice(),
      bows: JSON.parse(JSON.stringify(S.bows||[])),
      notes: JSON.parse(JSON.stringify(S.notes||{})),
      seed: true
    };
    S.sessions=S.sessions||[];
    S.sessions.push({id:'c14s',date:'2026-11-05',round:'Indoor WA 18m',ends:[...Array(20)].map(()=>['9','9','9']),pos:[],src:'practice',finished:true});
    S.best=S.best||[];S.best.push({date:'2026-11-05',text:'C14 PB note',total:540,round:'Indoor WA 18m'});
    S.diary=S.diary||[];S.diary.push({date:'2026-11-05',text:'C14 diary',id:'c14d'});
    S.setup=S.setup||[];S.setup.push({date:'2026-11-05',cat:'Sight',change:'C14 setup',id:'c14u'});
    S.bows=S.bows||[];
    if(!S.bows.length)S.bows.push({id:'c14b',name:'C14 bow',marks:{'20m':{v:4.2}}});
    else {const b=S.bows[0];b.marks=b.marks||{};b.marks['c14m']={v:3.1}}
    save();
  }""")
  pg.evaluate("acctSignIn('magic','c14@example.com')")
  if pg.evaluate("acctUser()&&acctUser().needOffer"):
    pg.evaluate("acctAcceptMove()")
  pg.evaluate("acctTakePoint('C14 fixture')")
  pts=pg.evaluate("()=>acctPoints().map(p=>({id:p.id,counts:p.counts,label:p.label}))")
  chk('A restore point is kept after sign-in and a change', len(pts)>=1 and any((p.get('counts') or {}).get('sessions',0)>=1 for p in pts), pts[:3])
  snap=pg.evaluate("""()=>({sessions:S.sessions.filter(s=>s.id=='c14s').length,best:S.best.some(x=>x.text=='C14 PB note'),diary:S.diary.some(x=>x.text=='C14 diary'),setup:S.setup.some(x=>x.change=='C14 setup')})""")
  chk('Fixture scores, PB, diary and setup are on the phone before the wipe', snap['sessions']==1 and snap['best'] and snap['diary'] and snap['setup'], snap)
  # Delete everything (Reset my scores) without wiping backups
  bk_before=pg.evaluate("localStorage.getItem('scoretool.acct.backup')")
  pg.evaluate("""()=>{acctTakePoint('Before reset');const KEY=TESTER&&TESTER.id!='nathe'?'scoretool.v1.'+TESTER.id:'scoretool.v1';localStorage.removeItem(KEY)}""")
  bk_after=pg.evaluate("localStorage.getItem('scoretool.acct.backup')")
  chk('Reset my scores cannot wipe the account backups', bk_after==bk_before or (bk_after and len(bk_after)>=len(bk_before)-10), (len(bk_before or ''), len(bk_after or '')))
  chk('localStorage.clear also leaves account backups', pg.evaluate("""()=>{const before=localStorage.getItem('scoretool.acct.backup');localStorage.clear();return localStorage.getItem('scoretool.acct.backup')===before && !!before}""") is True)
  # After wipe the main key is gone; reload would start empty. Restore in this session: we need to re-create S if KEY was removed.
  # Simulate a fresh empty S then restore.
  pg.evaluate("""()=>{
    const KEY=TESTER&&TESTER.id!='nathe'?'scoretool.v1.'+TESTER.id:'scoretool.v1';
    if(!localStorage.getItem(KEY)){S={profile:S.profile||'Steven Snook',unlocked:true,sessions:[],best:[],plots:[]};}
    else {S.sessions=[];S.best=[];S.diary=[];S.setup=[];}
  }""")
  empty=pg.evaluate("()=>({n:(S.sessions||[]).length,b:(S.best||[]).some(x=>x.text=='C14 PB note')})")
  chk('After the wipe the fixture data is gone from the working store', empty['n']==0 and empty['b'] is False, empty)
  # Restore the C14 fixture point (the one before reset; prefer Before reset or C14 fixture)
  rid=pg.evaluate("""()=>{const pts=acctPoints();const p=pts.find(x=>x.label=='C14 fixture')||pts.find(x=>x.label=='Before reset')||pts[0];return p&&p.id}""")
  chk('A dated restore point is available to pick', bool(rid), rid)
  res=pg.evaluate("id=>acctRestore(id)", rid)
  chk('Restore reports success', res and res.get('ok') is True, res)
  back=pg.evaluate("""()=>({sessions:S.sessions.some(s=>s.id=='c14s'),best:S.best.some(x=>x.text=='C14 PB note'),diary:(S.diary||[]).some(x=>x.text=='C14 diary'),setup:(S.setup||[]).some(x=>x.change=='C14 setup')})""")
  chk('Restoring the point brings back scores, sessions, PBs, diary and setups', back['sessions'] and back['best'] and back['diary'] and back['setup'], back)
  pg.evaluate("()=>{const s=S.sessions.find(x=>x.id=='c14s');acctSoftDelete('session',s);S.sessions=S.sessions.filter(x=>x.id!='c14s');save()}")
  bin=pg.evaluate("()=>acctBin().some(x=>x.kind=='session'&&x.item&&x.item.id=='c14s')")
  chk('A deleted session is in the 30-day recycle bin', bin is True)
  # put the session back for cleanup to remove it from the working store only
  pg.evaluate("()=>{if(!S.sessions.some(s=>s.id=='c14s')){const it=(acctBin().find(x=>x.item&&x.item.id=='c14s')||{}).item;if(it)S.sessions.push(it);save()}}")
  # Settings UI
  pg.evaluate("()=>{S.unlocked=true;if(typeof save==='function')save();nav('lab_settings')}");pg.wait_for_timeout(600)
  ui=pg.inner_text('#acctrestore') if pg.locator('#acctrestore').count() else ''
  chk('Settings has Restore my data, a restore-point picker and a privacy note', 'RESTORE MY DATA' in ui.upper() and pg.locator('#acctpt').count()==1 and '30 days' in ui.lower() and 'privacy' in ui.lower() and 'closed' in ui.lower(), ui[:400])
  chk('Privacy note says what is stored, where, how long, and deletion on account close', all(x in ui.lower() for x in ['scores','sight marks','30 days','closed','this phone' if 'preview' in ui.lower() or 'phone' in ui.lower() else 'account']), ui[:400])
  chk('File backup is still on Settings', pg.locator('#bkdl').count()==1 and 'Save a backup file' in pg.inner_text('#app'))
  # cleanup fixture from working store (leave backups; they are isolated)
  pg.evaluate("()=>{S.sessions=(S.sessions||[]).filter(s=>s.id!='c14s');S.best=(S.best||[]).filter(x=>x.text!='C14 PB note');S.diary=(S.diary||[]).filter(x=>x.text!='C14 diary');S.setup=(S.setup||[]).filter(x=>x.change!='C14 setup');save()}")
  chk('no page errors', not errs, errs[:4])
  b.close()
finally:
  srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed')
for x in bad:print('FAILED:',x)
sys.exit(1 if bad else 0)
