# Tab bar must sit on the viewport bottom after scrolling on every tab (and after typing in a field) at 390x844.
import subprocess,sys,time,os
from playwright.sync_api import sync_playwright
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n)
srv=subprocess.Popen([sys.executable,'-m','http.server','8765'],cwd=os.path.dirname(os.path.dirname(os.path.abspath(__file__))),stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
NAVB="(()=>{const r=document.getElementById('tabs').getBoundingClientRect();return [Math.round(r.bottom),innerHeight,getComputedStyle(document.getElementById('tabs')).display]})()"
def run(b,tag,mobile):
  ctx=b.new_context(viewport={'width':390,'height':844},has_touch=mobile,is_mobile=mobile) if mobile else b.new_context(viewport={'width':390,'height':844})
  pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
  pg.goto('http://localhost:8765/');pg.wait_for_timeout(1000);pg.get_by_text('Nathaniel Stride').first.click();pg.wait_for_timeout(500);pg.get_by_text('Demo unlock').first.click();pg.wait_for_timeout(500)
  for _ in range(3):
    if pg.locator('nav [data-v=home]').is_visible():break
    pg.locator('#app button').first.click();pg.wait_for_timeout(400)
  for v in ['home','score','stats','rewards','follow','diary','me']:
    pg.evaluate(f"nav('{v}')");pg.wait_for_timeout(700)
    for y in ['document.documentElement.scrollHeight/2','document.documentElement.scrollHeight']:
      pg.evaluate(f'scrollTo(0,{y})');pg.wait_for_timeout(200)
      bt,h,d=pg.evaluate(NAVB);chk(f'{tag} {v} bottom after scroll',bt==h and d!='none')
  pg.evaluate("nav('follow')");pg.wait_for_timeout(600)
  inp=pg.locator('#app input[type=text],#app input:not([type]),#app input[type=search]').first
  if inp.count():
    inp.click();pg.keyboard.type('nat');pg.wait_for_timeout(200)
    if mobile:chk(f'{tag} bar hidden while typing (touch)',pg.evaluate(NAVB)[2]=='none')
    pg.evaluate('document.activeElement.blur()');pg.wait_for_timeout(300);pg.evaluate('scrollTo(0,99999)');pg.wait_for_timeout(200)
    bt,h,d=pg.evaluate(NAVB);chk(f'{tag} bar back at bottom after typing',bt==h and d!='none')
  bp=pg.evaluate("parseFloat(getComputedStyle(document.body).paddingBottom)>=document.getElementById('tabs').offsetHeight");chk(f'{tag} content padding clears bar',bp)
  chk(f'{tag} no console errors',not errs)
  ctx.close()
try:
  with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox']);run(b,'chrome',False);run(b,'chrome-touch',True);b.close()
    try:
      w=p.webkit.launch();run(w,'webkit',True);w.close()
    except Exception as e: print('webkit unavailable:',str(e).splitlines()[0][:120])
finally: srv.terminate()
print('nav checks: PASS',len(ok),'FAIL',len(bad),bad[:8]);sys.exit(1 if bad else 0)
