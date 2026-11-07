# C5 (6 Nov 2026, Nathe): attach a screenshot while typing an official result. The picture is not read.
# After save it is deleted unless Keep the photo is ticked. A kept photo stays in IndexedDB and is not sent.
# The RPC is stubbed. The link token is fake.
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
Image.new('RGB',(240,160),(30,60,120)).save(IMG)
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
    pg.set_input_files('#ofshot',IMG);pg.wait_for_timeout(300)
    chk('screenshot is shown and the score is not filled in',pg.locator('#ofshotprev').is_visible() and pg.input_value('#ofscore')=='')
    chk('the note says the picture is not read','does not read the picture' in pg.inner_text('#ofshotnote').lower())
    pg.locator('#ofshotprev').scroll_into_view_if_needed();pg.screenshot(path=os.path.join(ART,'c5-attached.png'))
    pg.fill('#ofdate','2026-08-15');pg.fill('#ofroundx','C5 Official Round');pg.fill('#ofscore','540');pg.fill('#ofevent','Screenshot round')
    pg.click('#ofsave');pg.wait_for_timeout(500)
    row=json.loads(E("localStorage.getItem('scoretool.official.steven')"))[0]
    chk('saved without keeping the photo',row['official'] is True and row['score']==540 and not row.get('photoKept') and 'photo' not in row and pg.locator('#ofshotprev').is_hidden())
    chk('deleted photo is not in IndexedDB',E(IDB,row['id'])==0)
    pg.set_input_files('#ofshot',IMG);pg.wait_for_timeout(200)
    pg.fill('#ofdate','2026-08-16');pg.fill('#ofroundx','C5 Kept Round');pg.fill('#ofscore','555');pg.check('#ofkeep')
    pg.click('#ofsave');pg.wait_for_timeout(1500)
    rows=json.loads(E("localStorage.getItem('scoretool.official.steven')"))
    kept=[r for r in rows if r.get('photoKept')]
    chk('kept photo is on this phone only',len(kept)==1 and E(IDB,kept[0]['id'])>0 and 'photo' not in kept[0])
    E("()=>localStorage.setItem('scoretool.cal.steven.link',JSON.stringify('ab'.repeat(24)))")
    pg.wait_for_timeout(18000)
    mine=[x for x in SENT if str(x.get('p_source_id','')).startswith('steven:off-')]
    kept_send=[x for x in mine if x.get('p_shot_date')=='2026-08-16']
    chk('calendar payload has the score and no picture',len(kept_send)==1 and kept_send[0]['p_score']==555 and kept_send[0]['p_token']=='ab'*24 and not any('photo' in k or 'image' in k for k in kept_send[0]))
    chk('no page errors',not errs)
    open(os.path.join(ART,'c5-payload.json'),'w').write(json.dumps({'kept_id':kept[0]['id'] if kept else None,'calendar':kept_send[-1] if kept_send else None},indent=2))
    b.close()
srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed')
sys.exit(1 if bad else 0)
