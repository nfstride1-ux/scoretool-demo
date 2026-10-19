# Display names: rules (length, characters, rude words incl. l33t, real surnames, unique), first-open screen, change on Me,
# sync through the (mocked, in-memory) ntfy names topic, clash re-check, and NO real tester name rendering anywhere
# (every tab, the parent share link, the coach link, the coach summary text). No real ntfy traffic. Port 8783.
# Saves 390x844 screenshots to /workspace/names-shots if it exists.
import subprocess,sys,time,os,json,re,base64
from urllib.parse import urlparse,parse_qs,unquote
from playwright.sync_api import sync_playwright
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT='/workspace/names-shots';SHOT=os.path.isdir(OUT)
srv=subprocess.Popen([sys.executable,'-m','http.server','8783'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
RELAY={};N=[0]
def post(topic,obj):N[0]+=1;RELAY.setdefault(topic,[]).append({'id':'m%06d'%N[0],'event':'message','topic':topic,'message':json.dumps(obj)})
def relay(route,req):
  u=urlparse(req.url);topic=u.path.strip('/').split('/')[0];L=RELAY.setdefault(topic,[])
  if req.method=='POST':
    N[0]+=1;L.append({'id':'m%06d'%N[0],'event':'message','topic':topic,'message':req.post_data or ''});return route.fulfill(status=200,body='{}',headers={'access-control-allow-origin':'*'})
  since=parse_qs(u.query).get('since',['all'])[0];out=[m for m in L if since=='all' or m['id']>since]
  route.fulfill(status=200,body='\n'.join(json.dumps(m) for m in out)+('\n' if out else ''),headers={'access-control-allow-origin':'*'})
NT='scoretool-h2h-q7m4-names'
# every real name part of every tester (adults too) and the Archer's Diary aliases
REALN=['Nathaniel','Stride','Arthur','George Philip','Wolfe','Snook','Joseph Snook','Joe Snook','Choong','Chapman','Bureny','Burney','Engelen','Evans','Matete',
 'Logan W','Joseph S','Tahuri E','Tahuri B','Steven S','Michael C','Dana C','Nate E','Phill A']
errs=[]
SCAN="document.body.innerText+' '+document.title+' '+[...document.querySelectorAll('[value],[title],[aria-label],[placeholder],[alt]')].map(e=>[e.getAttribute('value'),e.getAttribute('title'),e.getAttribute('aria-label'),e.getAttribute('placeholder'),e.getAttribute('alt'),e.value].join(' ')).join(' ')"
def found(txt):return[n for n in REALN if re.search(r'\b'+re.escape(n)+r'\b',txt)]
def phone(b,tid):
  ctx=b.new_context(viewport={'width':390,'height':844});ctx.route('https://ntfy.sh/**',relay);pg=ctx.new_page()
  pg.on('pageerror',lambda e:errs.append(f'{tid}: {e}'));pg.on('dialog',lambda d:d.accept())
  pg.goto(f'http://localhost:8783/?tester={tid}');pg.wait_for_timeout(1200)
  pg.evaluate("S.unlocked=true;save()");pg.reload();pg.wait_for_timeout(2200);return ctx,pg
def sync(pg):pg.evaluate("nmSync()");pg.wait_for_timeout(400)
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  cj,J=phone(b,'joseph')
  # ---------- rules ----------
  C=lambda s,who='joseph':J.evaluate("([s,w])=>nmCheck(s,w)",[s,who])
  for s,want in [('Arrowhead_7','Arrowhead_7'),('  Big   Joe  ','Big Joe'),('Zap','Zap'),('X-Ray 99','X-Ray 99'),('Jo','Jo'),('A'*16,'A'*16),('Cassie','Cassie'),('Grape','Grape'),('Hitchcock','Hitchcock'),('Scunthorpe Arrow','')]:
    r=C(s)
    if want:chk(f'allowed: {s!r} -> {want!r}',r['ok'] and r['n']==want)
  for s,why in [('A','too short'),(' ',' blank'),('A'*17,'too long'),('Joe!','bad char'),('J@ck','bad char'),('Zap.','bad char'),('Émile','bad char'),
                ('fuck','rude'),('FUCK','rude caps'),('FuCk Yeah','rude mixed'),('Sh1t','rude 1=i'),('5hit','rude 5=s'),('B1tch','rude'),('sh1tAim','rude inside'),
                ('c0ck','rude 0=o word'),('Ass','rude word'),('Big Ass','rude word'),('Fuuuck','rude repeated'),('Shiiit','rude repeated'),('P3nis','rude 3=e'),('Wh0re','rude'),
                ('Snook','real surname'),('Joe Snook','real name'),('Logan Wolfe','real name'),('Wolfe_7','real surname'),('Engelen','real surname'),('Burney','real surname'),
                ('Stride','adult surname'),('Choong','adult surname'),('Tester 3','neutral label'),('tester','neutral label')]:
    chk(f'rejected ({why}): {s!r}',not C(s)['ok'])
  chk('rule messages are plain words',C('A')['msg']=='Use at least 2 characters.' and C('Joe!')['msg'].startswith('Use letters'))
  # ---------- first open ----------
  chk('first open shows the display-name screen',J.locator('#nmscreen').count()==1)
  t=J.inner_text('#nmscreen');chk('screen has the nickname hint','Pick a nickname, not your full real name.' in t)
  chk('screen shows no real name',not found(J.evaluate(SCAN)))
  if SHOT:J.screenshot(path=OUT+'/1-first-open.png')
  J.fill('#nmin','Joe Snook');J.click('#nmingo');J.wait_for_timeout(200)
  chk('real name refused with the hint','nickname' in J.inner_text('#nminerr').lower())
  J.fill('#nmin','b1tch');J.click('#nmingo');J.wait_for_timeout(200);chk('rude name refused',J.inner_text('#nminerr').strip()!='' and J.locator('#nmscreen').count()==1)
  if SHOT:J.screenshot(path=OUT+'/2-refused.png')
  J.fill('#nmin','  Joey  ');J.click('#nmingo');J.wait_for_timeout(900)
  chk('saved: home greets the chosen name',"G'day Joey" in J.text_content('#app'))
  chk('name posted to the names topic: id + name only',any(json.loads(m['message']).get('n')=='Joey' and set(json.loads(m['message']))<={'k','id','n','nt','t'} for m in RELAY.get(NT,[])))
  # ---------- change on Me ----------
  J.evaluate("nav('me')");J.wait_for_timeout(500)
  chk('Me tab has the display-name card',J.locator('#nmcard').count()==1 and 'Joey' in J.text_content('#nmcard'))
  J.fill('#nmme','JoJo');J.click('#nmmego');J.wait_for_timeout(500)
  chk('Me: name changed',J.text_content('#nmcard h2')=='JoJo' and J.evaluate("myName()")=='JoJo')
  if SHOT:J.screenshot(path=OUT+'/3-me-card.png')
  # ---------- second phone: Not now, then learns names from the relay ----------
  cl,L=phone(b,'logan');chk('Logan: first-open screen too',L.locator('#nmscreen').count()==1)
  L.click('#nmlater');L.wait_for_timeout(700)
  chk('Not now: shows as a neutral Tester N, never the real name',"G'day Tester 3" in L.text_content('#app') and not found(L.evaluate(SCAN)))
  sync(L);chk('Logan learned JoJo from the names topic',L.evaluate("testerName('joseph')")=='JoJo')
  chk('unpicked testers show as Tester N',L.evaluate("testerName('steven')")=='Tester 4' and L.evaluate("testerName('nathe')")=='Tester 1')
  L.evaluate("nav('me')");L.wait_for_timeout(400);L.fill('#nmme','jojo');L.click('#nmmego');L.wait_for_timeout(300)
  chk('unique among testers, case-insensitive','already has that name' in L.inner_text('#nmmeerr'))
  L.fill('#nmme','Zap');L.click('#nmmego');L.wait_for_timeout(400);sync(J)
  chk('Joseph sees Zap',J.evaluate("testerName('logan')")=='Zap')
  # ---------- clash found on a later poll: later picker asked to choose again ----------
  cm,M=phone(b,'michael');M.fill('#nmin','Rocket');M.click('#nmingo');M.wait_for_timeout(500)
  t0=M.evaluate("JSON.parse(localStorage.getItem('scoretool.dname.michael')).nt")
  post(NT,{'k':'nm','id':'steven','n':'ROCKET','nt':t0-60000,'t':t0})  # Steven picked it a minute earlier, his post just arrived
  sync(M);M.evaluate("render()");M.wait_for_timeout(300)
  chk('clash: later picker is asked to pick another','Pick another name' in M.text_content('#app'))
  if SHOT:M.screenshot(path=OUT+'/4-clash.png')
  sync(L);chk('clash: others show the earlier picker\'s name, later one as Tester N',L.evaluate("testerName('steven')")=='ROCKET' and L.evaluate("testerName('michael')")=='Tester 6')
  M.fill('#nmin','Comet');M.click('#nmingo');M.wait_for_timeout(500);sync(L)
  chk('after re-pick everyone sees the new name',L.evaluate("testerName('michael')")=='Comet' and M.locator('#nmscreen').count()==0)
  chk('bad names from the relay are ignored',(post(NT,{'k':'nm','id':'dana','n':'Sh1tHead','nt':int(time.time()*1000),'t':int(time.time()*1000)}),sync(L),L.evaluate("testerName('dana')"))[2]=='Tester 7')
  # ---------- newest post per id wins; own past names never clash; stale test posts ignored ----------
  now=lambda:int(time.time()*1000)
  t1=now();post(NT,{'k':'nm','id':'dana','n':'DeeOne','nt':t1,'t':t1});sync(L);chk('relay: a name is learned',L.evaluate("testerName('dana')")=='DeeOne')
  t2=now()+5;post(NT,{'k':'nm','id':'dana','n':'DeeTwo','nt':t2,'t':t2});sync(L);chk('relay: a newer post from the same id replaces the older one',L.evaluate("testerName('dana')")=='DeeTwo')
  post(NT,{'k':'nm','id':'dana','n':'DeeOld','nt':t1-1,'t':t1-1});sync(L);chk('relay: an older post arriving late does not win',L.evaluate("testerName('dana')")=='DeeTwo')
  chk('own past name is free again (one entry per id, no self clash)',L.evaluate("nmCheck('DeeOne','logan').ok") and not L.evaluate("nmClash('dana')"))
  J.evaluate("nav('me')");J.wait_for_timeout(300);J.fill('#nmme','JoJo2');J.click('#nmmego');J.wait_for_timeout(300);J.fill('#nmme','JoJo');J.click('#nmmego');J.wait_for_timeout(300)
  chk('changing back to my own earlier name is allowed',J.evaluate("myName()")=='JoJo' and not J.evaluate("nmClash('joseph')"));sync(L)
  post(NT,{'k':'nm','id':'nathe','n':'NatheTest','nt':1792449217608,'t':1792449217609});sync(L)
  chk("stale 'NatheTest' relay post (before the reset) is ignored",L.evaluate("testerName('nathe')")=='Tester 1')
  L.evaluate("(()=>{const D=JSON.parse(localStorage.getItem('scoretool.names')||'{}');D.nathe={n:'NatheTest',nt:1792449217608};localStorage.setItem('scoretool.names',JSON.stringify(D))})()")
  chk("stale 'NatheTest' already cached on a phone is dropped",L.evaluate("testerName('nathe')")=='Tester 1')
  post(NT,{'k':'nm','id':'nathe','n':'Skipper','nt':now(),'t':now()});sync(L);chk("Nathe's real pick shows, NatheTest can't block it",L.evaluate("testerName('nathe')")=='Skipper' and L.evaluate("nmCheck('NatheTest','logan').ok"))
  tc=now();post(NT,{'k':'nm','id':'dana','clr':1,'t':tc});sync(L);chk('a clear entry removes a cached name',L.evaluate("testerName('dana')")=='Tester 7')
  post('scoretool-h2h-q7m4-in-logan',{'k':'inv','g':1,'code':'FTH4ML5U','round':'Indoor WA 18m','mode':'total','from':'nathe','to':'logan','when':'','nm':'NatheTest','nt':1792449217608,'t':1792449249108})
  L.evaluate("S.h2hIn=undefined;h2hTick(true)");L.wait_for_timeout(600);chk('stale test invite from before the reset is ignored',L.evaluate("!h2hGet('FTH4ML5U')"))
  L.evaluate("S.matches.push({code:'OLDINV01',round:'Indoor WA 18m',mode:'total',g:1,host:'nathe',opp:'nathe',created:1792449249108,status:'invite'});save()");L.reload();L.wait_for_timeout(2200)
  chk('a stale invite already on a phone is dropped on load',L.evaluate("!h2hGet('OLDINV01')"))
  cn_,Nn=phone(b,'nathe');Nn.click('#nmlater') if Nn.locator('#nmlater').count() else None
  Nn.evaluate("localStorage.setItem('scoretool.dname.nathe',JSON.stringify({n:'NatheTest',nt:1792449217608}));localStorage.setItem('scoretool.dname.asked.nathe','1')");Nn.reload();Nn.wait_for_timeout(2200)
  chk("the test browser's own stale 'NatheTest' pick is not used: asked to pick again",Nn.locator('#nmscreen').count()==1 and Nn.evaluate("myName()")=='Tester 1')
  chk('the stale own pick is never posted',not any(json.loads(m['message']).get('n')=='NatheTest' and m['id']>'m%06d'%(N[0]-50) and json.loads(m['message']).get('t',0)>1792449217609 for m in RELAY.get(NT,[])))
  cn_.close()
  # ---------- no real tester name renders anywhere ----------
  VIEWS=['home','score','stats','rewards','follow','diary','me','squad','badges','recap','help','suggest','analytics']
  for nm,pg in (('Joseph',J),('Logan',L),('Michael',M)):
    hits={}
    for v in VIEWS:
      try:pg.evaluate(f"cur=null;nav('{v}')");pg.wait_for_timeout(450)
      except Exception as e:hits[v]=['error '+str(e)[:60]];continue
      f=found(pg.evaluate(SCAN))
      if f:hits[v]=f
    chk(f'{nm}: no real name on any tab',not hits)
    if hits:print('   ',hits)
    pg.evaluate("cur=null;nav('squad')");pg.wait_for_timeout(400)
    if SHOT and nm=='Logan':pg.screenshot(path=OUT+'/5-squad-logan.png')
  sq=L.evaluate("nav('squad')") or L.inner_text('#app')
  chk('squad lists display names / Tester N','JoJo' in sq and 'Comet' in sq and 'Skipper' in sq and 'Tester 7' in sq)
  # shared outside the app
  J.evaluate("nav('me')");J.wait_for_timeout(400);url=J.input_value('#sh');cl_=J.input_value('#clink')
  dec=lambda u:json.loads(base64.b64decode(unquote(u.split('#',1)[1].split('=',1)[1])).decode('utf-8'))
  chk('parent share link carries the display name only',dec(url)['n']=='JoJo')
  chk('coach link carries the display name only',dec(cl_)['n']=='JoJo')
  P=cj.new_page();P.goto(url);P.wait_for_timeout(3500);chk('parent view shows no real name',not found(P.evaluate(SCAN)) and 'JoJo' in P.text_content('#app'));P.close()
  P=cj.new_page();P.goto(cl_);P.wait_for_timeout(3500);chk('coach landing shows no real name',not found(P.evaluate(SCAN)));P.close()
  old=base64.b64encode(json.dumps({'n':'Joseph Snook','s':[],'b':[],'st':0}).encode()).decode()
  P=cj.new_page();P.goto('http://localhost:8783/#share='+old);P.wait_for_timeout(3500);chk('an old share link with the real name shows the display name',not found(P.evaluate(SCAN)));P.close()
  chk('coach summary text uses the display name',J.evaluate("coachText('2000-01-01','2100-01-01')").startswith('JoJo:'))
  chk('suggestion form sends the display name, id hidden',J.evaluate("nav('suggest'),document.querySelector('[name=tester]').value")=='JoJo')
  chk('no page errors',not errs)
  if errs:print(errs[:5])
finally:
  srv.terminate()
print(f'{len(ok)} passed, {len(bad)} failed');sys.exit(1 if bad else 0)
