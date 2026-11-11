# C9 (9 Nov 2026, Nathe): IFAA tab on Tools > Rules, beside WA, AA, ABA, IBO and ASA.
# Text and citations come from the supplied summary. No organisation is called.
import os,subprocess,sys,time
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import nm_seed,freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART=os.environ.get('C9_ART') or '/opt/cursor/artifacts/scoretool-ifaa'
os.makedirs(ART,exist_ok=True)
PORT=os.environ.get('PORT') or freeport.get()
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n,flush=True)
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.4)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
    pg=b.new_page(viewport={'width':390,'height':844});errs=[];seen=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.context.on('request',lambda r:seen.append(r.url))
    pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
    if pg.locator('#unlock').count():pg.locator('#unlock').click();pg.wait_for_timeout(200)
    pg.evaluate("()=>{S.unlocked=true;if(!S.profile)S.profile='Steven Test';save();nav('lab_rules')}")
    pg.wait_for_timeout(500)
    tabs=pg.evaluate("[...document.querySelectorAll('[data-r]')].map(b=>b.dataset.r)")
    chk('IFAA sits with the other rule books',tabs==['WA','AA','ABA','IBO','ASA','IFAA'])
    pg.evaluate("()=>localStorage.setItem('scoretool.cal.steven.prompted','1')")
    if pg.locator('#calNo').count():pg.locator('#calNo').click();pg.wait_for_timeout(200)
    pg.locator('[data-r=IFAA]').click();pg.wait_for_timeout(400)
    if pg.locator('#calNo').count():pg.locator('#calNo').click();pg.wait_for_timeout(200)
    body=pg.inner_text('#app')
    low=body.lower()
    chk('Field scoring is 5, 4 and 3','5 spot, 4 inner, 3 outer' in body)
    chk('3D hunting scores are kill 20, vital 16, wound 10','Kill 20, vital 16, wound 10' in body)
    chk('outdoor time is the Field Captain, not a fixed limit','field captain may set one' in low and 'no fixed time limit' in low)
    chk('junior and cub distances are marked as a summary','full tables are in art. v' in low)
    chk('course layout is left out','course layout' in low and 'not on this page' in low)
    chk('a local ABA variant is not confirmed','not confirmed' in low and 'aba variant' in low)
    chk('both official PDFs are linked',
        pg.locator('a[href="https://www.ifaa-archery.org/download/247/rules/6711/2021-book-of-rules.pdf"]').count()>=1
        and pg.locator('a[href="https://www.ifaa-archery.org/download/247/rules/14449/ifaa-executive-clarifications_final-01_20260601.pdf"]').count()>=1)
    chk('4 April 2021 is named from the IFAA page','4 april 2021' in low)
    chk('18th edition is not stated as a checked fact','18th edition' not in low)
    chk('pending Sports By-Laws are not stated','sports by-laws' not in low)
    chk('citation Art. V A is on the Field section','art. v a' in pg.locator('#app').evaluate('e=>e.textContent').lower())
    chk('opening the tab did not call IFAA',not any('ifaa-archery.org' in u for u in seen))
    chk('no page errors',not errs)
    pg.screenshot(path=os.path.join(ART,'c9-ifaa-390.png'))
    b.close()
srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed')
sys.exit(1 if bad else 0)
