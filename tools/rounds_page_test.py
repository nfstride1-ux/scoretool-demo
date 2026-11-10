# Tools > Rounds (10 Nov 2026, Nathe): a phone-sized list of the Schedule 9A target rounds.
# Search filters the names, and tapping a name shows the distances, arrows, face, total and maximum.
import os,subprocess,sys,time
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART=os.environ.get('ROUNDS_ART') or '/opt/cursor/artifacts'
os.makedirs(ART,exist_ok=True)
PORT=os.environ.get('PORT') or freeport.get()
ok=[];bad=[]
def chk(n,c,i=''):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n+('' if c else '  '+str(i)[:300]),flush=True)
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.4)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
    if pg.locator('#unlock').count():pg.locator('#unlock').click();pg.wait_for_timeout(200)
    pg.evaluate("()=>{S.unlocked=true;if(!S.profile)S.profile='Steven Test';save();localStorage.setItem('scoretool.cal.steven.prompted','1');nav('tools')}")
    pg.wait_for_timeout(400)
    gos=pg.eval_on_selector_all('.labrow','b=>b.map(x=>x.dataset.go)')
    iR,iU=gos.index('lab_rounds') if 'lab_rounds' in gos else -1, gos.index('lab_rules') if 'lab_rules' in gos else -1
    chk('Rounds sits next to Rules',iR>=0 and iU>=0 and abs(iR-iU)==1,(gos,iR,iU))
    pg.locator('[data-go=lab_rounds]').click();pg.wait_for_timeout(300)
    chk('the page names every round',pg.locator('[data-aa]').count()==33)
    chk('the source is cited',pg.locator('#aacite').inner_text().startswith('Archery Australia Target Rounds, Schedule 9A, effective January 2017'))
    chk('the page says what the list is for','leave out the distances and the face' in pg.locator('#aaintro').inner_text())
    pg.locator('#aaq').fill('fremantle');pg.wait_for_timeout(200)
    names=pg.eval_on_selector_all('[data-aa]','b=>b.map(x=>x.dataset.aa)')
    chk('search finds the Fremantle Round',names==['WA 60/1440'] and 'Fremantle Round' in pg.locator('[data-aa=WA\\ 60\\/1440]').inner_text(),names)
    pg.locator('#aaq').fill('zzzz');pg.wait_for_timeout(200)
    chk('a search with no match says so',pg.locator('[data-aa]').count()==0 and pg.locator('#aaempty').count()==1)
    pg.locator('#aaq').fill('');pg.wait_for_timeout(200)
    chk('clearing the search shows every round',pg.locator('[data-aa]').count()==33)
    pg.locator('#aaq').fill('40/1440');pg.wait_for_timeout(200)
    pg.locator('[data-aa="40/1440"]').click();pg.wait_for_timeout(200)
    rows=pg.eval_on_selector_all('#aadetail tbody tr','r=>r.map(x=>[x.dataset.aaD,x.dataset.aaN,x.dataset.aaF])')
    chk('40/1440 shows both faces at 30 m',rows==[['40','36','122'],['30','36','122'],['30','36','80'],['20','36','80']],rows)
    chk('40/1440 shows 144 arrows and 1440',pg.locator('#aatotal').inner_text()=='144 arrows' and '1440' in pg.locator('#aamax').inner_text())
    pg.locator('#aadetail').scroll_into_view_if_needed();pg.wait_for_timeout(200)
    pg.screenshot(path=os.path.join(ART,'rounds_390.png'))
    wide=pg.evaluate('document.documentElement.scrollWidth<=document.documentElement.clientWidth+1')
    chk('the page fits a 390 px screen',pg.viewport_size['width']==390 and wide,pg.viewport_size)
    pg.locator('#aaq').fill('canberra');pg.wait_for_timeout(200)
    found=pg.eval_on_selector_all('[data-aa]','b=>b.map(x=>x.dataset.aa)')
    chk('Canberra finds the 900 and both shorter rounds',found==['WA 60/900','Short Canberra','Junior Canberra'],found)
    chk('no page errors',not errs,errs[:3])
    b.close()
srv.terminate()
print('OK',len(ok));print('FAIL',bad)
sys.exit(1 if bad else 0)
