# Head-to-head matches between testers on separate phones (separate browser contexts = separate localStorage), relay mocked in memory
# (no real ntfy traffic, no real score data: every context starts empty and is thrown away). Pairs: Joseph vs Logan (highest total)
# and Nate (colour-blind mode) vs Dana (set points). Also checks the indoor 3-spot faces (no Bugs Eyes off field rounds) and the
# 9-member ScoreTool Testers squad. Saves 390x844 screenshots to /workspace/h2h if it exists.
import subprocess,sys,time,os,json,re
from urllib.parse import urlparse,parse_qs
from playwright.sync_api import sync_playwright
import nm_seed
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT='/workspace/h2h';SHOT=os.path.isdir(OUT)
srv=subprocess.Popen([sys.executable,'-m','http.server','8781'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
RELAY={};N=[0]
def relay(route,req):
  u=urlparse(req.url);parts=u.path.strip('/').split('/');topic=parts[0];L=RELAY.setdefault(topic,[])
  if req.method=='POST':
    N[0]+=1;L.append({'id':'m%06d'%N[0],'event':'message','topic':topic,'message':req.post_data or ''});return route.fulfill(status=200,body='{}',headers={'access-control-allow-origin':'*'})
  since=parse_qs(u.query).get('since',['all'])[0];out=[m for m in L if since=='all' or m['id']>since]
  route.fulfill(status=200,body='\n'.join(json.dumps(m) for m in out)+('\n' if out else ''),headers={'access-control-allow-origin':'*'})
NAMES={'joseph':'Joseph Snook','logan':'Logan Wolfe','nate':'Nate Evans','dana':'Dana Chapman-Bureny'}
errs=[]
def phone(b,tid):
  ctx=b.new_context(viewport={'width':390,'height':844});ctx.route('https://ntfy.sh/**',relay)
  # each phone only knows its OWN display name; the others must arrive through the (mocked) relay
  ctx.add_init_script("for(const id of %s)if(id!='%s')localStorage.removeItem('scoretool.dname.'+id)"%(json.dumps(nm_seed.IDS),tid));pg=ctx.new_page()
  pg.on('pageerror',lambda e:errs.append(f'{tid}: {e}'));pg.on('dialog',lambda d:d.accept())
  pg.goto(f'http://localhost:8781/?tester={tid}');pg.wait_for_timeout(1200)
  pg.evaluate("n=>{S.unlocked=true;if(!S.profile)S.profile=n;save()}",NAMES[tid]);pg.reload();pg.wait_for_timeout(2200);return ctx,pg
def tick(pg):pg.evaluate("h2hTick(true)");pg.wait_for_timeout(500)
def keys(pg,E):
  if pg.locator('#addsc').count():pg.click('#addsc');pg.wait_for_timeout(250)
  for k in E:pg.click(f'.ad-pad [data-k="{k}"]');pg.wait_for_timeout(120)
  pg.evaluate("document.querySelector('#fpm')?.remove()");pg.click('#enext');pg.wait_for_timeout(250)
def challenge(pg,opp,mode):
  pg.evaluate("cur=null;sv='sheet';nav('score')");pg.wait_for_timeout(400)
  pg.click('#h2hnew summary');pg.select_option('#h2hrd','Indoor WA 18m');pg.select_option('#h2hop',opp);pg.select_option('#h2hmd',mode)
  return pg
FILL="([E,fin])=>{const m=S.matches[S.matches.length-1],s=S.sessions.find(x=>x.id==m.sid);s.ends=E.map(e=>e.slice());s.pos=E.map(()=>[]);if(fin)s.finished=true;save()}"
# Labelled TEST ends (not real scores): deterministic pattern so each side's total is known
def ends(seed,n=20):
  P=['X','10','9','8','7','6'];out=[];x=seed
  for i in range(n):
    e=[];
    for a in range(3):x=(x*1103515245+12345)%2147483648;e.append(P[(x>>16)%4])
    out.append(sorted(e,key=lambda k:-(10.5 if k=='X' else int(k))))
  return out
val=lambda k:10 if k=='X' else int(k)
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  # ---------- Pair 1: Joseph vs Logan, highest total ----------
  cj,J=phone(b,'joseph');cl,L=phone(b,'logan')
  challenge(J,'logan','total')
  if SHOT:J.screenshot(path=OUT+'/1-start-match.png')
  chk('opponent list has every other tester (8), not just the squad',J.locator('#h2hop option').count()==8)
  chk('round list is the indoor rounds',J.locator('#h2hrd option').all_inner_texts()==['Indoor WA 18m','Indoor WA 25m','Indoor WA Combined 25m + 18m'])
  J.click('#h2hgo');J.wait_for_timeout(500)
  chk('Joseph: scorer opens with the match chip',J.locator('#h2hchip').count()==1 and 'vs' not in J.inner_text('#h2hchip').lower() or 'Zap' in J.inner_text('#h2hchip'))
  chk('invite sent to Logan\'s inbox',any('-in-logan' in t for t in RELAY))
  tick(L);L.evaluate("cur=null;sv='sheet';nav('score')");L.wait_for_timeout(400)
  chk('Logan sees "Joseph challenged you"','Joey challenged you' in L.inner_text('#h2hcard'))
  if SHOT:L.screenshot(path=OUT+'/2-invite.png')
  L.click('[data-h2hacc]');L.wait_for_timeout(500)
  chk('Logan: accepting starts his scorer on the same round','Indoor WA 18m' in L.inner_text('#roundname') and L.locator('#h2hchip').count()==1)
  keys(J,['X','10','9']);keys(L,['10','10','9'])
  tick(J);tick(L);tick(J)
  chk('Joseph sees Logan\'s end 1 live: chip 29 - 29','29 – 29' in J.inner_text('#h2hchip'))
  keys(J,['10','9','9']);tick(J);tick(L)
  chk('Logan sees Joseph ahead after end 2 (28 vs end not shot yet)','You 29 – 57 Joey' in L.inner_text('#h2hchip'))
  if SHOT:L.screenshot(path=OUT+'/3-scoring-live-chip.png')
  L.click('#h2hchip');L.wait_for_timeout(300)
  t=L.inner_text('#h2hview')
  chk('match view shows end by end and running totals',"X 10 9" in t and '29 – 57' in t and "Joey has shot 2 ends" in t)
  if SHOT:L.screenshot(path=OUT+'/4-match-view-live.png')
  EJ=ends(11);EL=ends(23);EJ[0]=['X','10','9'];EJ[1]=['10','9','9'];EL[0]=['10','10','9']
  J.evaluate(FILL,[EJ,True]);L.evaluate(FILL,[EL,True])
  for _ in range(2):tick(J);tick(L)
  tj=sum(val(k) for e in EJ for k in e);tl=sum(val(k) for e in EL for k in e)
  J.evaluate("h2hView(S.matches[S.matches.length-1].code)");L.evaluate("h2hView(S.matches[S.matches.length-1].code)");J.wait_for_timeout(300)
  vj=J.inner_text('#h2hview');vl=L.inner_text('#h2hview')
  print('test totals',tj,tl)
  chk('both phones show the same final totals',f'{tj} – {tl}' in vj and f'{tl} – {tj}' in vl)
  w='J' if tj>tl else 'L' if tl>tj else 'D'
  chk('both agree on the winner',(w=='J' and '▲ You win' in vj and '▲ Joey wins' in vl) or (w=='L' and '▲ Zap wins' in vj and '▲ You win' in vl) or (w=='D' and ('Draw' in vj or 'decided' in vj)))
  if SHOT:J.screenshot(path=OUT+'/5-final-joseph.png',full_page=True);L.screenshot(path=OUT+'/6-final-logan.png')
  # ---------- indoor 3-spot faces (Joseph's phone) ----------
  J.evaluate("cur=null;sv='sheet';nav('score')");J.wait_for_timeout(300);J.select_option('#rd','Indoor WA 18m');J.click('#st');J.wait_for_timeout(400)
  body=J.inner_text('.ad')
  chk('Indoor 18m: no Bugs Eyes anywhere','Bugs' not in body and 'Bugs' not in J.inner_html('#fwrap'))
  chk('Indoor 18m: face button says Vertical 3-spot',J.inner_text('#face3')=='Face: Vertical 3-spot' and 'Vertical 3-spot' in J.get_attribute('#pface','aria-label'))
  chk('Indoor 18m: keys X 10 9 8 7 6 M',J.locator('.ad-pad button').all_inner_texts()==['X','10','9','8','7','6','M'])
  fills=set(re.findall(r'fill="(#[0-9a-f]+)"',J.inner_html('#pface')))
  chk('3-spot face is gold/red/blue only (no 5-1 zones) '+str(fills),fills<={'#ffd84d','#d62828','#2563eb','#fff'} and '#111' not in fills)
  chk('3 spots drawn',J.inner_html('#pface').count('r="0.030"')+J.inner_html('#pface').count('r="0.03"')==3)
  if SHOT:J.screenshot(path=OUT+'/7-indoor-vertical.png')
  J.click('#face3');J.wait_for_timeout(300)
  chk('tap switches to Vegas 3-spot',J.inner_text('#face3')=='Face: Vegas 3-spot' and 'Vegas' in J.get_attribute('#pface','aria-label'))
  chk('plot scoring on Vegas: spot centre X, edge 6, outside M',J.evaluate("[plotScore(-0.34,-0.2,{tri:1}),plotScore(0.34,-0.2+0.27,{tri:1}),plotScore(0,0,{tri:1}),plotScore(0,0.39,{vert:1})]")==['X','6','M','10'] or J.evaluate("[plotScore(-0.34,-0.2,{tri:1}),plotScore(0.34,-0.2+0.27,{tri:1}),plotScore(0,0,{tri:1})]")[:3]==['X','6','M'])
  bx=J.locator('#pface').bounding_box();J.mouse.click(bx['x']+bx['width']/2-0.34/1.34*bx['width'],bx['y']+bx['height']*((-0.2+0.53)/1.25));J.wait_for_timeout(300)
  chk('tapping a Vegas spot centre scores X',J.locator('.ad-chips .adb').first.inner_text().strip() in ('X','10'))
  if SHOT:J.screenshot(path=OUT+'/8-indoor-vegas.png')
  chk('face choice remembered for the next indoor session',J.evaluate("S.face3")=='vegas')
  # old data: indoor session saved with the old Bugs Eyes flag + bug-layout positions -> vertical WA 3-spot, scores untouched
  J.evaluate("""cur=null;S.sessions.push({id:'h2htest-old1',date:'2026-10-01',round:'Indoor WA 18m',bugs:true,ends:[['6','5','4']],pos:[[{x:0,y:-0.62},{x:0.06,y:0},{x:0,y:0.75}]],note:'TEST'});
   S.sessions.push({id:'h2htest-old2',date:'2026-10-02',round:'Indoor WA 18m',ends:[['10','9','8']],pos:[[{x:0.05,y:0},{x:0.15,y:0},{x:0.25,y:0}]],note:'TEST'});save()""")
  J.evaluate("cur=S.sessions.find(s=>s.id=='h2htest-old1');sv='entry';score()");J.wait_for_timeout(300)
  chk('old Bugs-flag indoor session now shows the WA vertical 3-spot, scores kept','Vertical' in J.get_attribute('#pface','aria-label') and 'Bugs' not in J.inner_text('.ad') and J.evaluate("cur.ends[0].join()")=='6,5,4')
  J.evaluate("sv='sheet';score()");J.wait_for_timeout(200);chk('old Bugs-flag indoor sheet header not Bugs Eyes','Bugs' not in J.inner_text('.ad'))
  J.evaluate("cur=S.sessions.find(s=>s.id=='h2htest-old2');sv='entry';score()");J.wait_for_timeout(300)
  chk('old full-face plotted indoor session keeps its full 40cm face',J.get_attribute('#pface','aria-label')=='Target face, tap where the arrow landed')
  chk('group plot of a 3-spot session draws one spot',J.evaluate("plottedCard(S.sessions.find(s=>s.id=='h2htest-old1'))").count('<circle r=')>=5)
  J.evaluate("cur=null;S.sessions=S.sessions.filter(s=>!/^h2htest/.test(s.id));save()")
  # other non-field rounds: no Bugs Eyes; field rounds keep it, gold and black only
  J.evaluate("cur=null;sv='sheet';score()");J.select_option('#rd','WA 720 (70m)');J.click('#st');J.wait_for_timeout(300)
  chk('WA 720: no face toggle, no Bugs Eyes',J.locator('#bugface').count()==0 and J.locator('#face3').count()==0 and 'Bugs' not in J.inner_text('.ad'))
  J.evaluate("S.sessions=S.sessions.filter(s=>s!==cur);cur=null;sv='sheet';score()");J.select_option('#rd','WA Field 24 Marked');J.click('#st');J.wait_for_timeout(300)
  chk('field round still offers Bugs Eyes',J.inner_text('#bugface')=='Face: Field');J.click('#bugface');J.wait_for_timeout(300)
  ff=set(re.findall(r'fill="(#[0-9a-f]+)"',J.inner_html('#pface')))
  chk('field Bugs Eyes is gold and black only '+str(ff),J.inner_text('#bugface')=='Face: Bugs Eyes' and ff<={'#ffd84d','#111','#fff'})
  J.evaluate("S.sessions=S.sessions.filter(s=>s!==cur);cur=null;save()")
  # squad: all 9 testers
  J.evaluate("nav('squad')");J.wait_for_timeout(500)
  chk('squad has all 9 testers',J.evaluate("S.squad.members.length")==9 and '9 members' in J.inner_text('.card.dark'))
  chk('weekly league lists 9',J.evaluate("leagueTable().length")==9)
  if SHOT:J.screenshot(path=OUT+'/9-squad-9-members.png')
  J.evaluate("S.squad.members=S.squad.members.slice(0,3);delete S.presetTop;save()");J.reload();J.wait_for_timeout(2200);J.evaluate("nav('squad')");J.wait_for_timeout(400)
  chk('an old 3-member tester squad is topped up to 9 once',J.evaluate("S.squad.members.length")==9 and J.evaluate("S.squad.code")=='STRIDE-3T7')
  # ---------- display names through the relay ----------
  REALN=['Nathaniel','Stride','Arthur','Wolfe','Snook','Choong','Chapman','Bureny','Burney','Engelen','Evans','Matete','George Philip']
  msgs=[json.loads(m['message']) for L_ in RELAY.values() for m in L_]
  chk('relay never carries a real name',not any(n.lower() in json.dumps(msgs).lower() for n in REALN))
  inv=[m for m in msgs if m.get('k')=='inv'];st=[m for m in msgs if m.get('k')=='st']
  chk('invite carries only id, round, code, mode, display name',inv and all(set(m)<= {'k','code','round','mode','from','to','nm','nt','t'} for m in inv) and inv[0].get('nm')=='Joey')
  chk('match state carries only id, code, round, scores and display name',st and all(set(m)<= {'k','code','by','round','mode','a','b','ends','done','nm','nt','t'} for m in st))
  dirm=RELAY.get('scoretool-h2h-q7m4-names',[]);dm=[json.loads(m['message']) for m in dirm]
  chk('names directory topic: id + display name only',dm and all(set(m)<={'k','id','n','nt','t'} for m in dm) and {m['id']:m['n'] for m in dm}.get('joseph')=='Joey')
  chk('Logan learned Joey from the relay (not a real name)',L.evaluate("testerName('joseph')")=='Joey' and L.evaluate("testerName('steven')")=='Tester 4')
  for nm_,pg_ in (('Joseph',J),('Logan',L)):
    for v in ('home','score','squad','rewards','me'):
      pg_.evaluate(f"cur=null;nav('{v}')");pg_.wait_for_timeout(350)
      txt=pg_.evaluate("document.body.innerText+' '+[...document.querySelectorAll('[value],[title],[aria-label],[placeholder]')].map(e=>[e.getAttribute('value'),e.title,e.getAttribute('aria-label'),e.placeholder].join(' ')).join(' ')")
      bad_=[n for n in REALN if re.search(r'\b'+n+r'\b',txt)]
      chk(f'{nm_} {v}: no real names on screen',not bad_)
      if bad_:print('   found',bad_)
  cj.close();cl.close()
  # ---------- Pair 2: Nate (colour-blind) vs Dana, set points ----------
  cn,Nt=phone(b,'nate');cd,D=phone(b,'dana')
  chk('Nate in colour-blind mode',Nt.evaluate("CB()"))
  challenge(Nt,'dana','sets');Nt.click('#h2hgo');Nt.wait_for_timeout(400)
  fills=set(re.findall(r'fill="(#[0-9a-f]+)"',Nt.inner_html('#pface')))
  bx=Nt.locator('#pface').bounding_box();Nt.mouse.click(bx['x']+bx['width']/2,bx['y']+bx['height']*0.5);Nt.wait_for_timeout(300)
  chk('Nate: indoor 3-spot plotted arrow shows its number (colour-blind)',Nt.locator('#pface text').count()==1)
  Nt.evaluate("cur.ends=[[]];cur.pos=[[]];save();score()")
  tick(D);D.evaluate("cur=null;sv='sheet';nav('score')");D.wait_for_timeout(300);D.click('[data-h2hacc]');D.wait_for_timeout(400)
  # sets: Nate 30,29,27,28 ; Dana 29,29,28,27 -> 2-0,3-1,3-3,5-3 then Nate 30 v 26 -> 7-3 Nate wins
  EN=[['X','10','10'],['10','10','9'],['9','9','9'],['10','9','9'],['X','X','10']];ED=[['10','10','9'],['10','10','9'],['10','9','9'],['9','9','9'],['9','9','8']]
  Nt.evaluate(FILL,[EN,False]);D.evaluate(FILL,[ED,False])
  for _ in range(2):tick(Nt);tick(D)
  Nt.evaluate("h2hView(S.matches[S.matches.length-1].code)");D.evaluate("h2hView(S.matches[S.matches.length-1].code)");Nt.wait_for_timeout(300)
  vn=Nt.inner_text('#h2hview');vd=D.inner_text('#h2hview')
  chk('set points: Nate 7 - 3, Nate wins on both phones','7 – 3' in vn and '▲ You win' in vn and '3 – 7' in vd and '▲ Navy wins' in vd)
  chk('draw set gives 1 each','3 – 1 (draw)' in vn)
  html=Nt.inner_html('#h2hview')
  chk('colour-blind safe: winner marked with ▲ and words, no red/green/purple in the match view',('▲' in vn) and not re.search(r'#(22c55e|16a34a|39ff14|d62828|dc2626|ef4444|7c3aed|8b5cf6|a855f7)',html))
  if SHOT:Nt.screenshot(path=OUT+'/10-nate-sets-final.png',full_page=True)
  cn.close();cd.close()
  chk('no page errors '+str(errs[:3]),not errs)
finally:
 srv.terminate()
print(f'h2h checks: PASS {len(ok)} FAIL {len(bad)}');[print(' FAIL',x) for x in bad];sys.exit(1 if bad else 0)
