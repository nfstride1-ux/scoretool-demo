# Onion Shed Challenge restored (27 Oct 2026): same name, same rules, same ten members plus Leslie Anderson (no app, scored by the host).
# New league code ONIONSH2; the hidden 26 Oct record (ONIONSHD) is never touched. Seeding is additive and idempotent (no duplicates, no overwrite).
# Rules are shown on the league screen. TEST data only; relay mocked.
import subprocess,sys,time,os,json
from playwright.sync_api import sync_playwright
import guard   # stubs the ntfy.sh relay and blocks the service worker in every browser context (1 Nov 2026)
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=8935
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT)],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[]
MEM=['nathe','logan','steven','joseph','michael','dana','tahuri','estiaan','nate','darnie']
RULES=["Six 300s at 18 m on the vertical 3-spot.","Each week for 5 weeks everyone shoots a 300 round, in person or over FaceTime.","On the 6th day they all shoot another 300 together in person in the Onion Shed.","The running total of all six 300s (maximum 1800, ties split on X count) sets the league table.","Shoot-up match play happens on day 6 only, starting once everyone's day-6 300 is in. Final: 3 ends of 3 arrows, X = 10, no 12 dot. Ties: 1 arrow each, closest to the middle wins (host picks).","Entry is $10 each night, winner takes all, minus a jokey 75%."]
def phone(b,tid,pre=None):
  ctx=b.new_context(viewport={'width':390,'height':844});ctx.route('https://ntfy.sh/**',lambda r:r.fulfill(status=200,body='',headers={'access-control-allow-origin':'*'}))
  pg=ctx.new_page();pg.on('pageerror',lambda e:errs.append(f'{tid}: {e}'));pg.on('dialog',lambda d:d.accept())
  pg.goto(f'http://localhost:{PORT}/?tester={tid}');pg.wait_for_timeout(1200)
  pg.evaluate("()=>{S.unlocked=true;if(!S.profile)S.profile='Test';save()}")
  if pre:pg.evaluate("(s)=>{eval(s);save()}",pre)
  pg.reload();pg.wait_for_timeout(2000);return ctx,pg
def card(pg):
  pg.evaluate("cur=null;sv='sheet';window._csMode='league';nav('score')");pg.wait_for_timeout(400);return pg.text_content('#lgcard')
def onion(pg):return pg.evaluate("(S.leagues||[]).filter(l=>l.code=='ONIONSH2')")
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  # ---- A: a user who never had the preset (fresh phone) ----
  for tid in MEM:
    c,pg=phone(b,tid);t=card(pg);L=onion(pg)
    chk(f'{tid}: fresh phone gets exactly one Onion Shed Challenge',len(L)==1 and 'Onion Shed Challenge' in t and pg.locator('#lgcard [data-lgopen="ONIONSH2"]').count()==1)
    if tid=='nathe':ref=json.dumps({k:L[0][k] for k in('name','host','order','gn','weeks','cw','status','sc')},sort_keys=True)
    else:chk(f'{tid}: same league as every other member (name, host, order, Leslie, weeks, empty scores)',json.dumps({k:L[0][k] for k in('name','host','order','gn','weeks','cw','status','sc')},sort_keys=True)==ref)
    pg.reload();pg.wait_for_timeout(1800);card(pg)
    chk(f'{tid}: reload keeps one copy, no duplicate',len(onion(pg))==1 and pg.evaluate("S.leagues.length")==1)
    if tid!='nathe':c.close()
    else:H=pg;Hc=c
  d=onion(H)[0]
  chk('league record: name, host nathe, week 1, active, no scores',d['name']=='Onion Shed Challenge' and d['host']=='nathe' and d['cw']==1 and d['status']=='active' and d['sc']=={} and d.get('preset')==1)
  chk('members: the 10 testers in order, then Leslie',d['order']==MEM+['gleslie'])
  chk('Phill is not a member and not shown',('phill' not in d['order']) and H.evaluate("lgArchers(lgGet('ONIONSH2')).every(id=>id!='phill')"))
  chk('11 archers listed (no 10-archer cap on this league)',H.evaluate("lgArchers(lgGet('ONIONSH2')).length")==11 and H.evaluate("h2hCap(lgGet('ONIONSH2'))")>=11)
  chk('other leagues keep the 10-archer cap',H.evaluate("h2hCap({code:'ABCDEF'})")==10)
  chk('Leslie Anderson is a guest scored by the host',H.evaluate("lgIsG('gleslie')&&lgName('gleslie')=='Leslie Anderson'&&lgCanEd(lgGet('ONIONSH2'))&&lgLockedBy(lgGet('ONIONSH2'),1,'gleslie')===null"))
  chk('Anderson: Leslie is the only Anderson among the members',H.evaluate("[...lgArchers(lgGet('ONIONSH2'))].filter(id=>/anderson/i.test(lgName(id))).join()")=='gleslie')
  # ---- rules on the league page ----
  H.evaluate("lgView('ONIONSH2')");H.wait_for_timeout(500)
  rt=H.evaluate("[...document.querySelectorAll('#lgrules2 li')].map(x=>x.textContent)")
  chk('rules card shown on the league screen, exact wording',rt==RULES and H.locator('#lgrules2').count()==1)
  chk('rules are plain text: no emoji, no purple, no horizontal overflow',H.evaluate("(()=>{const e=document.querySelector('#lgrules2');const t=e.textContent;const emo=/[\\u{1F000}-\\u{1FFFF}\\u{2600}-\\u{27BF}]/u.test(t);const cs=[e,...e.querySelectorAll('*')].map(x=>getComputedStyle(x).color+getComputedStyle(x).backgroundColor).join(' ');const purple=[...cs.matchAll(/rgba?\\((\\d+), (\\d+), (\\d+)/g)].some(m=>+m[3]>+m[2]+40&&+m[1]>+m[2]+40);return !emo&&!purple&&document.documentElement.scrollWidth<=390&&e.getBoundingClientRect().right<=390})()"))
  H.screenshot(path='/tmp/onion_rules.png')
  # ---- Leslie: host moves a started Leslie between Own phone and Phone 1; scores untouched ----
  H.evaluate("lgSetGroups('ONIONSH2',1,[])")
  H.evaluate("""()=>{for(let i=0;i<6;i++)lgKey('ONIONSH2',1,'gleslie',['X','10','9','8','7','6'][i%6]);const lg=lgGet('ONIONSH2');lg.sc.logan={1:{e:[['10','10','9']],by:'logan',u:Date.now(),f:'vert'}};save();lgView('ONIONSH2')}""");H.wait_for_timeout(400)
  snap=lambda:H.evaluate("JSON.stringify(lgGet('ONIONSH2').sc)");sc0=snap()
  chk('Leslie shown as started on Own phone, buttons enabled',H.locator('#lggrp [data-lggb="gleslie"][data-g=""].on').count()==1 and H.evaluate("[...document.querySelectorAll('#lggrp [data-lggb=\"gleslie\"]')].every(b=>!b.disabled)"))
  H.click('#lggrp [data-lggb="gleslie"][data-g="0"]');H.wait_for_timeout(400)
  chk('Leslie moved to Phone 1, scores untouched, no error',H.evaluate("lgGroupOf(lgGet('ONIONSH2'),1,'gleslie')")==0 and snap()==sc0 and H.inner_text('#lggmsg').strip()=='')
  H.click('#lggrp [data-lggb="gleslie"][data-g=""]');H.wait_for_timeout(400)
  chk('Leslie moved back to Own phone, scores untouched',H.evaluate("lgGroupOf(lgGet('ONIONSH2'),1,'gleslie')")==None and snap()==sc0)
  # ---- B: a user whose hidden 26 Oct league record (with scores) already exists ----
  c2,L2=phone(b,'logan',"S.leagues=[Object.assign(lgPresetRecord(),{host:'logan',sc:{logan:{1:{e:Array(10).fill(['X','10','9']),by:'logan',u:5,f:'vert'}},gleslie:{1:{e:[['9','9','9']],by:'nathe',u:6,f:'vert'}}}})];S.lgPreset='ONIONSHD'")
  # the preset flag is set at load; run seeding again from scratch on this stored state
  before=json.loads(L2.evaluate("JSON.stringify(S.leagues.find(l=>l.code=='ONIONSHD'))"))
  card(L2);L2.evaluate("lgTick(true)");L2.wait_for_timeout(800);card(L2)
  after=json.loads(L2.evaluate("JSON.stringify(S.leagues.find(l=>l.code=='ONIONSHD'))"))
  for x in(before,after):[x.pop(k,None) for k in('posted','dirty','qfail')]
  chk('hidden 26 Oct record kept byte-for-byte (Leslie and Logan scores unchanged)',before==after and after['sc']['gleslie']['1']['e']==[['9','9','9']] and after['sc']['logan']['1']['e']==[['X','10','9']]*10)
  chk('that phone also gets the one restored league, empty scores, and the old one stays hidden',len(onion(L2))==1 and onion(L2)[0]['sc']=={} and L2.locator('#lgcard [data-lgopen="ONIONSHD"]').count()==0)
  chk('the old code still can not be joined or invited',L2.evaluate("(async()=>await lgJoin('ONIONSHD'))()").startswith('No league found') and L2.evaluate("(async()=>await lgJoin('ONIONSH2'))()").startswith('No league found') and L2.evaluate("lgInvite({to:h2hMe(),from:'nathe',code:'ONIONSH2',name:'x',t:Date.now()})")==False)
  # ---- C: a user whose restored league already exists with saved data (no duplicate, no overwrite) ----
  pre="""const r=lgPresetRecord('ONIONSH2');r.order=r.order.filter(x=>x!='gleslie'&&x!='estiaan');r.gn={};r.host='nathe';r.cw=3;r.weeks=[{d:'2026-10-28'}];r.sc={logan:{1:{e:Array(10).fill(['X','10','9']),by:'logan',u:5,f:'vert'}},gleslie:{1:{e:[['9','9','9']],by:'nathe',u:6,f:'vert'}}};r.name='Onion Shed Challenge';S.leagues=[r];S.lgPreset=null"""
  c3,L3=phone(b,'nate',pre)
  L=onion(L3)
  chk('existing league: no duplicate created',len(L)==1 and L3.evaluate("S.leagues.length")==1)
  chk('existing league: missing members (Estiaan, Leslie) added, nobody removed or reordered',L[0]['order'][:8]==['nathe','logan','steven','joseph','michael','dana','tahuri','nate'] and set(L[0]['order'])>=set(MEM+['gleslie']) and len(L[0]['order'])==len(set(L[0]['order'])) and 'gleslie' in L[0]['gn'])
  chk('existing league: week, weeks list and every saved score untouched',L[0]['cw']==3 and L[0]['weeks']==[{'d':'2026-10-28'}] and L[0]['sc']['gleslie']['1']['e']==[['9','9','9']] and L[0]['sc']['logan']['1']['e']==[['X','10','9']]*10)
  s1=L3.evaluate("JSON.stringify(S.leagues)");card(L3);L3.reload();L3.wait_for_timeout(1800);card(L3)
  chk('existing league: re-running seeding changes nothing (idempotent)',L3.evaluate("JSON.stringify(S.leagues)")==s1)
  # same-name league the user made themselves is not replaced or duplicated
  c4,L4=phone(b,'steven',"S.leagues=[{code:'MINE12',name:'Onion Shed Challenge',host:'steven',order:['steven','logan'],weeks:[],cw:1,grp:{},sc:{},status:'active',created:1}];S.lgPreset=null")
  chk("a league the user made with the same name is left alone (no second Onion Shed)",L4.evaluate("S.leagues.length")==1 and L4.evaluate("S.leagues[0].code")=='MINE12')
  # ---- D: nobody else is given it ----
  c5,P5=phone(b,'phill');card(P5)
  chk('Phill is not given the league',P5.evaluate("(S.leagues||[]).length")==0)
  c6,J=phone(b,'dana');J.evaluate("S.leagues=[];S.lgPreset=null;save()")
  chk('rules card not shown on an ordinary league',J.evaluate("(()=>{const lg=lgCreate('Other',['logan'],[]);window._csMode='league';lgView(lg.code);return document.querySelectorAll('#lgrules2').length})()")==0)
  chk('page errors: none',not errs)
finally:
 srv.terminate();print('onionrestore checks: PASS',len(ok),'FAIL',len(bad),bad);print(len(ok),'passed,',len(bad),'failed')
