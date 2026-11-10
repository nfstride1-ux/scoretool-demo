# C13 (11 Nov 2026): draft Terms and Refund policy. No home address. Listed AUD prices.
import os,subprocess,sys,time,re
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=os.environ.get('PORT') or freeport.get()
ok=[];bad=[]
def chk(n,c,i=''):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n+('' if c else '  '+str(i)[:300]),flush=True)
ADDR=re.compile(r'\b(\d{1,5}\s+\w+\s+(street|st|road|rd|avenue|ave|drive|dr|lane|ln|way|court|ct|crescent|cres)\b)|PO Box|P\.O\. Box|postcode|WA 6\d{3}',re.I)
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.5)
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
  pg=b.new_page();pg.set_viewport_size({'width':390,'height':844})
  errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
  if pg.locator('#unlock').count():pg.locator('#unlock').first.click();pg.wait_for_timeout(300)
  pg.evaluate("()=>{S.unlocked=true;save();nav('lab_settings')}");pg.wait_for_timeout(500)
  chk('Settings links to the draft Terms and Refund policy', pg.locator('a[data-go=lab_terms]').count()>=1 and pg.locator('a[data-go=lab_refund]').count()>=1)
  pg.evaluate("nav('lab_terms')");pg.wait_for_timeout(300)
  terms=pg.inner_text('#app')
  chk('Terms is marked DRAFT for Nathe to review', 'DRAFT' in terms and 'review' in terms.lower())
  chk('Terms names NFS Strategic Holdings Pty Ltd', 'NFS Strategic Holdings Pty Ltd' in terms)
  chk('Terms uses Plus $5/$49 and Pro $12/$99 AUD', '$5' in terms and '$49' in terms and '$12' in terms and '$99' in terms and 'AUD' in terms)
  chk('Terms says Lemon Squeezy is merchant of record', 'Lemon Squeezy' in terms and 'merchant of record' in terms.lower())
  chk('Terms says the first release is web only', 'web only' in terms.lower())
  chk('Terms does not show a home address', not ADDR.search(terms), ADDR.search(terms) and ADDR.search(terms).group(0))
  pg.evaluate("nav('lab_refund')");pg.wait_for_timeout(300)
  ref=pg.inner_text('#app')
  chk('Refund policy is marked DRAFT', 'DRAFT' in ref and 'review' in ref.lower())
  chk('Refund policy names the same seller and prices', 'NFS Strategic Holdings Pty Ltd' in ref and '$5' in ref and '$99' in ref and 'AUD' in ref)
  chk('Refunds only when the customer asks', 'only when the customer asks' in ref.lower())
  chk('Refund policy names Lemon Squeezy as merchant of record', 'Lemon Squeezy' in ref and 'merchant of record' in ref.lower())
  chk('Refund policy says web only and has no home address', 'web only' in ref.lower() and not ADDR.search(ref), ADDR.search(ref) and ADDR.search(ref).group(0))
  chk('no page errors', not errs, errs[:4])
  b.close()
finally:
  srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed')
for x in bad:print('FAILED:',x)
sys.exit(1 if bad else 0)
