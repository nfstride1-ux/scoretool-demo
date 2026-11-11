# D3 (9 Nov 2026): a custom round saved with a blank name is named from its type and distance.
# Target, clout, indoor, field and 3D. No distance: the other details. A typed name is kept.
import os,subprocess,sys,time
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=os.environ.get('PORT') or freeport.get()
ok=[];bad=[]
def chk(n,c,info=''):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n+(('  '+str(info)) if not c and info!='' else ''),flush=True)
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.4)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
    pg=b.new_page(viewport={'width':390,'height':844})
    errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
    pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
    E=pg.evaluate
    if pg.locator('#unlock').count():pg.locator('#unlock').click();pg.wait_for_timeout(200)
    E("()=>{S.unlocked=true;S.profile='Steven Test';S.customRounds=[];save();cur=null;sv='sheet';nav('score')}")
    pg.wait_for_timeout(300)
    def fresh():
        E("()=>{cur=null;crEdit=null;sv='sheet';score()}")
        pg.wait_for_timeout(250)
        pg.select_option('#rd','__new');pg.wait_for_timeout(250)
    def save_blank(disc,dist=None,unit=None):
        fresh();pg.select_option('#cdisc',disc);pg.wait_for_timeout(200)
        if dist is not None:pg.fill('[data-f=dist]',str(dist));pg.dispatch_event('[data-f=dist]','input')
        if unit:pg.select_option('[data-f=unit]',unit)
        pg.fill('#cn','');pg.click('#csave');pg.wait_for_timeout(300)
    save_blank('target','70')
    chk('blank target 70m is named Target 70m',E("S.customRounds.map(c=>c.name)").count('Target 70m')==1 and E("!!ROUNDS['Target 70m']"))
    save_blank('indoor')
    chk('blank indoor is named Indoor 18m', 'Indoor 18m' in E("S.customRounds.map(c=>c.name)"))
    save_blank('field')
    chk('blank field is named Field 50m','Field 50m' in E("S.customRounds.map(c=>c.name)") and 'field' in E("ROUNDS['Field 50m'].face"))
    save_blank('clout')
    chk('blank clout is named Clout 180m','Clout 180m' in E("S.customRounds.map(c=>c.name)"))
    save_blank('target','20','yd')
    chk('yards are kept in the name','Target 20yd' in E("S.customRounds.map(c=>c.name)"))
    fresh();pg.fill('[data-f=dist]','');pg.dispatch_event('[data-f=dist]','input');pg.fill('#cn','');pg.click('#csave');pg.wait_for_timeout(300)
    named=E("S.customRounds[S.customRounds.length-1].name")
    chk('no distance uses the face and the ends',named.startswith('Target ') and 'cm' in named and 'end' in named and '70' not in named,named)
    fresh();pg.select_option('#cdisc','3d');pg.wait_for_timeout(250)
    chk('3D form opens from the round type',pg.locator('#cform3d').count()==1)
    pg.fill('#cn','');pg.click('#csave');pg.wait_for_timeout(300)
    row=E("S.customRounds.find(c=>c.kind=='3d')")
    chk('blank 3D is named from its targets and stores no extra fields',row=={'name':'3D 20 targets','kind':'3d','targets':20})
    fresh();pg.fill('#cn','Tuesday blast');pg.click('#csave');pg.wait_for_timeout(300)
    chk('a typed name is kept','Tuesday blast' in E("S.customRounds.map(c=>c.name)"))
    save_blank('target','70')
    chk('a second blank Target 70m is numbered', 'Target 70m 2' in E("S.customRounds.map(c=>c.name)"))
    chk('no page errors',not errs)
    b.close()
srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed')
if bad:print('FAILED',bad)
sys.exit(1 if bad else 0)
