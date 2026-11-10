# B1 (11 Nov 2026): Estimate other marks after typing three marks in the table.
# Repro: My archery > Setups & sight marks, type Vertical 20 / 40 / 60 at 20m / 40m / 60m and tick each.
# Before the fix the bar still said "you have 0" and the button stayed off, so no estimates appeared.
# The marks had saved (green flash); the bar was not re-counted until the screen was drawn again.
import subprocess,sys,time,os
from playwright.sync_api import sync_playwright
import guard
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ok=[];bad=[]
def chk(n,c,i=''):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n+('' if c else '  '+str(i)[:300]),flush=True)
PORT=int(os.environ.get('PORT','8841'))
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT)],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
PREP="""()=>{const me=S.profile||'Steven';S.profile=me;S.unlocked=true;S.bows=[{id:'b1',archer:me,name:'B1 test bow',extra:[],marks:{}}];S.bowSel={};S.bowSel[me]='b1';S.arrowSets=[];S.arrowSel={};S.arrowSel[me]='arrows1';delete S.sightEst;save()}"""
def typemark(pg,dist,val):
    sel=f'.smk[data-d="{dist}"][data-k=v]'
    pg.fill(sel,val);pg.dispatch_event(sel,'input');pg.dispatch_event(sel,'change');pg.wait_for_timeout(200)
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new'])
  ctx=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
  pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.goto(f'http://localhost:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
  if pg.locator('#unlock').count():pg.locator('#unlock').first.click();pg.wait_for_timeout(400)
  pg.evaluate(PREP);pg.reload();pg.wait_for_timeout(1200)
  pg.evaluate("nav('lab_gear')");pg.wait_for_timeout(600)
  chk('empty table starts at 0 and the button is off','you have 0' in pg.inner_text('#smestmsg') and pg.is_disabled('#smest'),pg.inner_text('#smestmsg'))
  typemark(pg,'20m','20');typemark(pg,'40m','40')
  chk('after two typed marks the count is not stuck at 0','you have 2' in pg.inner_text('#smestmsg') and pg.is_disabled('#smest'),pg.inner_text('#smestmsg'))
  typemark(pg,'60m','60')
  chk('after three typed marks the button is on and the 0 warning is gone',(not pg.is_disabled('#smest')) and 'you have 0' not in pg.inner_text('#smestmsg') and 'you have 2' not in pg.inner_text('#smestmsg'),pg.inner_text('#smestmsg'))
  saved=pg.evaluate("()=>{const b=curBow(),a=curSet(),M=peekMarks(b,a);return {n:['20m','40m','60m'].filter(d=>M[d]&&M[d].v).length,v:[M['20m']&&M['20m'].v,M['40m']&&M['40m'].v,M['60m']&&M['60m'].v]}}")
  chk('the three typed marks are in the same store the estimator reads',saved['n']==3 and saved['v']==['20','40','60'],saved)
  pg.click('#smest');pg.wait_for_timeout(500)
  em=pg.evaluate("()=>{const E=((S.sightEst||{}).b1||{}).arrows1||{};return E.marks||{}}")
  chk('estimates filled for the other distances in range',set(em)>= {'30m','50m'} and '20m' not in em and '40m' not in em and '60m' not in em,em)
  chk('typed marks unchanged on screen',pg.input_value('.smk[data-d="20m"][data-k=v]')=='20' and pg.input_value('.smk[data-d="40m"][data-k=v]')=='40' and pg.input_value('.smk[data-d="60m"][data-k=v]')=='60')
  ph=pg.get_attribute('.smk[data-d="30m"][data-k=v]','placeholder') or ''
  chk('30m shows an est. placeholder, not a typed value',ph.startswith('est. ') and pg.input_value('.smk[data-d="30m"][data-k=v]')=='',ph)
  chk('no page errors',not errs,errs[:3])
  b.close()
finally:
  srv.terminate()
print(f'{len(ok)} passed, {len(bad)} failed')
for x in bad:print('FAILED:',x)
sys.exit(1 if bad else 0)
