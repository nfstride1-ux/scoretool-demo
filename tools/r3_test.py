# R3 (3 Nov 2026, Nathe via Archery Coach): in a Fletched vs Bare session the "X% tighter" line becomes a plain tuning verdict.
# Right-handed: bare shafts right of the fletched group = weak, left = stiff; mirrored for a left-handed archer (session bow hand).
# High or low points to the nocking point (or tiller on recurve/barebow). Usual next step labelled general tuning guidance.
# Compound sessions get the finger-release note. Other change types keep the % line. Saved data unchanged, no emoji, 390px.
import subprocess,sys,time,os,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
import guard
import nm_seed,freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=os.environ.get('PORT') or freeport.get();BASE=os.environ.get('BASE');URL=BASE or f'http://localhost:{PORT}/'
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n)
srv=None if BASE else subprocess.Popen([sys.executable,'-m','http.server',PORT,'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
OTHER="(()=>{const d=JSON.parse(localStorage.getItem('scoretool.v1')||'{}');return JSON.stringify({b:d.bows,s:d.sessions,u:d.setup,sel:d.bowSel,spec:d.bowSpec,a:d.arrowInfo,c:d.calc,ch:localStorage.getItem('scoretool.arrowchooser.nathe'),keys:Object.keys(localStorage).filter(k=>/arrow|bow/i.test(k)).sort()})})()"
SHOTS=os.environ.get('SHOTS')
def shot(pg,name,sel=None):
    if not SHOTS:return
    os.makedirs(SHOTS,exist_ok=True)
    if sel:pg.evaluate(f"document.querySelector('{sel}').scrollIntoView()");pg.wait_for_timeout(200)
    pg.screenshot(path=os.path.join(SHOTS,name+'.png'))
#SNAP={'bow':'compound','spine':'400','model':'X10','len':28,'pt':100,'foc':11.2,'tw':12365,'fps':-3643,'fpsSrc':'estimate'}
def _T(pg):return pg.evaluate("JSON.parse(JSON.stringify(S.tune.find(t=>t.id==S._tuneId)))")
def typ(pg,id,v):pg.fill('#'+id,str(v));pg.press('#'+id,'Tab');pg.wait_for_timeout(300)
EMO=lambda t:any(ord(c)>0x1F000 or 0x2600<=ord(c)<0x27C0 for c in t)
with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
  ctx=b.new_context(viewport={'width':390,'height':844});pg=ctx.new_page();errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
  pg.goto(URL);pg.wait_for_timeout(1500);nm_seed.pick(pg,'nathe');pg.wait_for_timeout(500)
  if pg.get_by_text('Demo unlock').count():pg.get_by_text('Demo unlock').first.click();pg.wait_for_timeout(500)
  for _ in range(3):
    if pg.locator('nav [data-v=home]').is_visible():break
    pg.locator('#app button').first.click();pg.wait_for_timeout(400)

  tune0=pg.evaluate("JSON.stringify(S.tune||null)")
  F=[[0.0,0.0],[0.02,0.01],[-0.02,-0.01],[0.01,-0.02]]
  def ses(id,hand,bx,by,bow='recurve',change='Bare shaft vs fletched'):
    t={'id':id,'archer':'X','date':'2026-11-03','name':id,'change':change,'dist':'18m','face':'122cm','before':[p+['2026-11-03'] for p in F],'after':[[bx,by,'2026-11-03'],[bx+0.01,by,'2026-11-03']],'grp':'before','arrow':{'bow':bow,'len':28,'pt':100,'spine':'600','model':'X10'}}
    if hand:t['hand']=hand
    return t
  L=[ses('r3rw','R',0.3,0),ses('r3rs','R',-0.3,0),ses('r3lw','L',-0.3,0),ses('r3ls','L',0.3,0),ses('r3hi','R',0,-0.3),ses('r3lo','R',0,0.3),
     ses('r3ok','R',0.005,0.005),ses('r3nh',None,0.3,0),ses('r3cmp','R',0.3,0,'compound'),ses('r3grp','R',0.3,0,change='Group test')]
  pg.evaluate("L=>{L.forEach(t=>t.archer=S.profile);S.tune=(S.tune||[]).concat(L);save()}",L)
  pg.reload();pg.wait_for_timeout(1500)
  saved0=pg.evaluate("JSON.stringify(S.tune.filter(t=>/^r3/.test(t.id)))")
  def open_(id):pg.evaluate(f"S._tuneId='{id}';save();nav('lab_opt')");pg.wait_for_timeout(500)
  def V():return pg.inner_text('#bareverdict') if pg.locator('#bareverdict').count() else ''
  open_('r3rw');v=V()
  chk('right-handed, bare right: verdict weak',pg.locator('#bareverdict').count()==1 and 'acting weak' in v and 'tighter' not in pg.inner_text('#app') and 'wider' not in v)
  chk('weak next step: lighter point, more plunger tension, less draw weight','lighter point' in v and 'more plunger tension' in v and 'less draw weight' in v)
  chk('next step labelled general tuning guidance','general tuning guidance' in v)
  chk('reading card agrees (weak)','reads this as weak' in pg.inner_text('#app'))
  shot(pg,'r3-verdict-right-weak','#bareverdict')
  open_('r3rs');v=V();chk('right-handed, bare left: verdict stiff','acting stiff' in v and 'heavier point' in v and 'less plunger tension' in v)
  open_('r3lw');v=V();chk('left-handed, bare left: mirrored to weak','acting weak' in v and 'left-handed' in v and 'reads as weak' in pg.inner_text('#app'))
  shot(pg,'r3-verdict-left-weak','#bareverdict')
  open_('r3ls');v=V();chk('left-handed, bare right: mirrored to stiff','acting stiff' in v and 'reads as stiff' in pg.inner_text('#app'))
  open_('r3hi');v=V();chk('bare high: nocking point or tiller, move up','high of the fletched' in v and 'nocking point' in v and 'tiller' in v and 'nocking point up' in v and 'spine looks right' in v)
  open_('r3lo');v=V();chk('bare low: nocking point down','low of the fletched' in v and 'nocking point down' in v)
  open_('r3ok');v=V();chk('together: basically tuned, no next step','basically tuned' in v and 'Usual next step' not in v)
  open_('r3nh');v=V();chk('no bow hand: asks for it, no weak or stiff guess','choose the bow hand' in v and 'acting' not in v and pg.locator('#tvhand').count()==1)
  pg.select_option('#tvhand','L');pg.wait_for_timeout(400)
  chk('choosing the bow hand saves it to that session and shows the verdict',pg.evaluate("S.tune.find(t=>t.id=='r3nh').hand")=='L' and 'acting stiff' in V())
  pg.select_option('#tvhand','');pg.wait_for_timeout(400)
  chk('Not set puts it back',pg.evaluate("'hand' in S.tune.find(t=>t.id=='r3nh')")==False)
  open_('r3cmp');v=V();chk('compound: finger-release note, no tiller','finger release' in v and 'paper tuning' in v and 'tiller' not in v)
  shot(pg,'r3-verdict-compound','#bareverdict')
  open_('r3grp');chk('other change types keep the % line',pg.locator('#bareverdict').count()==0 and ('tighter' in pg.inner_text('#app') or 'wider' in pg.inner_text('#app')))
  pg.evaluate("S.tune.find(t=>t.id=='r3rw').after=[[0.3,0,'2026-11-03']];save()");open_('r3rw')
  chk('too few arrows: asks for more','at least 3 fletched' in V())
  pg.evaluate("S.tune.find(t=>t.id=='r3rw').after=[[0.3,0,'2026-11-03'],[0.31,0,'2026-11-03']];save()")
  chk('390px no sideways scroll',pg.evaluate("document.documentElement.scrollWidth")<=392)
  open_('r3rw');chk('no emoji in the verdict',not EMO(V()))
  chk('viewing sessions changed nothing saved',pg.evaluate("JSON.stringify(S.tune.filter(t=>/^r3/.test(t.id)))")==saved0)
  wn=pg.evaluate("JSON.stringify((window.WHATSNEW||[])[0]||'')");Vv=pg.evaluate("fetch('version.json',{cache:'no-store'}).then(r=>r.json()).then(j=>j.version)")
  allwn=pg.evaluate("JSON.stringify(window.WHATSNEW||[])").lower()
  chk('release note present',('verdict' in wn.lower()) if Vv.endswith('-r3') else ('verdict' in allwn))
  pg.evaluate(f"S.tune={tune0};S._tuneId=null;save()")
  chk('no console errors',not errs);errs and print(errs[:5])
  ctx.close();b.close()
if srv:srv.terminate()
print(f'{len(ok)} passed, {len(bad)} failed');bad and print('FAIL',bad)
sys.exit(1 if bad else 0)
