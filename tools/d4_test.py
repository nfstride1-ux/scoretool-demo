# D4 (9 Nov 2026): a photo of a scorecard prefills Add official result. The archer confirms
# before it counts. The picture is not stored. The form shows points above or below the PB.
# A confirmed new PB is on the personal-best list and can be a Ghost match opponent.
# A picture that cannot be read never saves a score.
import os,subprocess,sys,time
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=os.environ.get('PORT') or freeport.get()
ok=[];bad=[]
def chk(n,c,info=''):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n+(('  '+str(info)) if not c and info!='' else ''),flush=True)
def card(path, lines):
    im=Image.new('RGB',(900,80+64*len(lines)),'white');dr=ImageDraw.Draw(im)
    font=ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',42)
    y=30
    for line in lines:
        dr.text((40,y),line,fill='black',font=font);y+=64
    im.save(path)
card('/tmp/d4-card.png',['Event: Club target day','Date: 2026-08-20','Round: Vegas 300','Score: 287','Maximum: 300','10s: 22','Xs: 8'])
Image.new('RGB',(200,120),(20,20,20)).save('/tmp/d4-bad.png')
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.4)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
    E=pg.evaluate
    if pg.locator('#unlock').count():pg.locator('#unlock').click();pg.wait_for_timeout(200)
    E("""()=>{S.unlocked=true;S.profile='Steven Test';S.sessions=[{id:'vg250',date:'2026-05-01',round:'Vegas 300',face3:'vegas',ends:Array.from({length:10},()=>['9','8','8']),pos:[],note:'',finished:true}];save();
      localStorage.removeItem('scoretool.official.steven')}""")
    pg.evaluate("()=>nav('lab_results')");pg.wait_for_timeout(400)
    chk('the earlier PB is 250',E("bsCurrentPb('Vegas 300').score")==250)
    pg.set_input_files('#ofshot','/tmp/d4-bad.png')
    pg.wait_for_function("()=>/could not read/i.test(document.querySelector('#ofnote').textContent)",timeout=20000)
    chk('a misread picture does not save a score',E("localStorage.getItem('scoretool.official.steven')") is None and pg.input_value('#ofscore')=='')
    pg.set_input_files('#ofshot','/tmp/d4-card.png')
    pg.wait_for_function("()=>document.querySelector('#ofscore').value==='287'",timeout=20000)
    note=pg.inner_text('#ofpb')
    chk('the form shows how far the score is above the PB','37 above your PB of 250' in note,note)
    chk('nothing is saved before confirm',E("localStorage.getItem('scoretool.official.steven')") is None)
    chk('the picture is not still on screen',pg.locator('#ofshotprev').is_hidden())
    pg.click('#ofsave');pg.wait_for_timeout(400)
    row=E("JSON.parse(localStorage.getItem('scoretool.official.steven'))[0]")
    chk('confirm saves the read score and no picture',row['score']==287 and row['round']=='Vegas 300' and row['official'] and row['finished'] and 'photo' not in row and not row.get('photoKept'))
    pb=E("bsCurrentPb('Vegas 300')")
    chk('the new score is the personal best',pb and pb['score']==287 and pb['date']=='2026-08-20',pb)
    pg.fill('#ofscore','240');pg.dispatch_event('#ofscore','input');pg.wait_for_timeout(100)
    below=pg.inner_text('#ofpb')
    chk('a lower score shows points below the PB','47 below your PB of 287' in below,below)
    chk('the lower score was not saved by itself',E("JSON.parse(localStorage.getItem('scoretool.official.steven')).length")==1)
    E("()=>{cur=null;sv='sheet';nav('score')}");pg.wait_for_timeout(400)
    pg.select_option('#rd','Vegas 300');pg.wait_for_timeout(300)
    if pg.locator('#ghon').count() and not pg.locator('#ghon').is_checked():pg.locator('#ghon').check();pg.wait_for_timeout(200)
    if pg.locator('[data-gm=pick]').count():pg.locator('[data-gm=pick]').click();pg.wait_for_timeout(200)
    ghost=pg.inner_text('#ghwrap') if pg.locator('#ghwrap').count() else ''
    chk('the new PB can be a Ghost match opponent','287' in ghost and 'competition' in ghost.lower(),ghost[:400])
    chk('no page errors',not errs,errs[:3])
    b.close()
srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed')
if bad:print('FAILED',bad)
sys.exit(1 if bad else 0)
