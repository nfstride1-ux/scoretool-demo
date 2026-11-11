# C5, updated by D4 (9 Nov 2026): a scorecard photo is read into the form. The archer confirms
# before it is saved. The picture is not kept and is not sent. The RPC is stubbed. The link token is fake.
import json,os,subprocess,sys,time
from playwright.sync_api import sync_playwright
from PIL import Image
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import nm_seed,freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART=os.environ.get('C5_ART') or '/opt/cursor/artifacts/scoretool-calsync'
os.makedirs(ART,exist_ok=True)
PORT=os.environ.get('PORT') or freeport.get()
IMG='/tmp/c5-score.png'
from PIL import ImageDraw, ImageFont
im=Image.new('RGB',(900,520),'white');dr=ImageDraw.Draw(im);font=ImageFont.truetype('/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf',42)
y=30
for line in ['Event: Screenshot round','Date: 2026-08-15','Round: C5 Official Round','Score: 540','Maximum: 600']:
    dr.text((40,y),line,fill='black',font=font);y+=64
im.save(IMG)
NOISE='/tmp/c5-noise.png'
Image.new('RGB',(240,160),(30,60,120)).save(NOISE)
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n,flush=True)
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.4)
SENT=[]
def rpc(route):
    if 'scoretool_save_score' in route.request.url:SENT.append(json.loads(route.request.post_data or '{}'))
    route.fulfill(status=200,content_type='application/json',body='null')
IDB="(id)=>new Promise(r=>{const o=indexedDB.open('scoretool-official-photos');o.onerror=()=>r(0);o.onsuccess=()=>{const db=o.result;if(!db.objectStoreNames.contains('photos')){db.close();r(0);return}const g=db.transaction('photos').objectStore('photos').get('steven:'+id);g.onsuccess=()=>{const n=g.result&&g.result.size||0;db.close();r(n)};g.onerror=()=>{db.close();r(0)}}})"
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
    ctx=b.new_context(viewport={'width':390,'height':844});pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    ctx.route('https://sllsqpfqwckwtljzjxli.supabase.co/**',rpc)
    pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
    E=pg.evaluate
    if pg.locator('#unlock').count():pg.locator('#unlock').click();pg.wait_for_timeout(200)
    E("""()=>{S.unlocked=true;if(!S.profile)S.profile='Steven Test';save();
      localStorage.removeItem('scoretool.official.steven');
      Object.keys(localStorage).filter(k=>k.startsWith('scoretool.cal.steven.')).forEach(k=>localStorage.removeItem(k));
      localStorage.setItem('scoretool.cal.steven.prompted','1')}""")
    pg.evaluate("()=>nav('lab_results')");pg.wait_for_timeout(400)
    pg.set_input_files('#ofshot',NOISE);pg.wait_for_timeout(2500)
    chk('a picture with no score does not fill the form or save','could not read' in pg.inner_text('#ofnote').lower() and pg.input_value('#ofscore')=='' and E("localStorage.getItem('scoretool.official.steven')") is None)
    pg.set_input_files('#ofshot',IMG);pg.wait_for_timeout(4000)
    chk('the scorecard is read into the form and not saved yet',pg.input_value('#ofscore')=='540' and pg.input_value('#ofroundx')=='C5 Official Round' and pg.input_value('#ofdate')=='2026-08-15' and E("localStorage.getItem('scoretool.official.steven')") is None)
    chk('the note says the picture is not kept','not kept' in pg.inner_text('#ofshotnote').lower())
    pg.locator('#rsofficial').scroll_into_view_if_needed();pg.screenshot(path=os.path.join(ART,'c5-attached.png'))
    pg.click('#ofsave');pg.wait_for_timeout(500)
    row=json.loads(E("localStorage.getItem('scoretool.official.steven')"))[0]
    chk('saved only after confirm, with no photo',row['official'] is True and row['score']==540 and not row.get('photoKept') and 'photo' not in row and pg.locator('#ofshotprev').is_hidden())
    chk('the picture is not in IndexedDB',E(IDB,row['id'])==0)
    pg.fill('#ofdate','2026-08-16');pg.fill('#ofroundx','C5 Kept Round');pg.fill('#ofscore','555')
    pg.click('#ofsave');pg.wait_for_timeout(400)
    rows=json.loads(E("localStorage.getItem('scoretool.official.steven')"))
    kept=[r for r in rows if r.get('photoKept')]
    chk('nothing is kept as a photo',len(kept)==0 and all('photo' not in r for r in rows))
    E("()=>localStorage.setItem('scoretool.cal.steven.link',JSON.stringify('ab'.repeat(24)))")
    pg.wait_for_timeout(18000)
    mine=[x for x in SENT if str(x.get('p_source_id','')).startswith('steven:off-')]
    kept_send=[x for x in mine if x.get('p_shot_date')=='2026-08-16']
    chk('calendar payload has the score and no picture',len(kept_send)==1 and kept_send[0]['p_score']==555 and kept_send[0]['p_token']=='ab'*24 and not any('photo' in k or 'image' in k for k in kept_send[0]))
    chk('no page errors',not errs)
    open(os.path.join(ART,'c5-payload.json'),'w').write(json.dumps({'calendar':kept_send[-1] if kept_send else None},indent=2))
    b.close()
srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed')
sys.exit(1 if bad else 0)
