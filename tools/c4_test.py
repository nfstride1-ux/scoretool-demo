# C4 (6 Nov 2026, Nathe): add a finished official result. It counts for personal bests, is queued
# to the calendar through the C3 path, and does not replace a scored session. The RPC is stubbed.
import json,os,subprocess,sys,time
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import nm_seed,freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART=os.environ.get('C4_ART') or '/opt/cursor/artifacts/scoretool-calsync'
os.makedirs(ART,exist_ok=True)
PORT=os.environ.get('PORT') or freeport.get()
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n,flush=True)
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.4)
SENT=[]
def rpc(route):
    if 'scoretool_save_score' in route.request.url:SENT.append(json.loads(route.request.post_data or '{}'))
    route.fulfill(status=200,content_type='application/json',body='null')
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
    ctx=b.new_context(viewport={'width':390,'height':844});pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    ctx.route('https://sllsqpfqwckwtljzjxli.supabase.co/**',rpc)
    ctx.route('https://archerycalendars.com/**',lambda r:r.fulfill(status=200,content_type='application/json',body='{"events":[]}',headers={'access-control-allow-origin':'*'}))
    pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
    E=pg.evaluate
    if pg.locator('#unlock').count():pg.locator('#unlock').click();pg.wait_for_timeout(300)
    E("""()=>{S.unlocked=true;if(!S.profile)S.profile='Steven Test';save();
      localStorage.removeItem('scoretool.official.steven');
      Object.keys(localStorage).filter(k=>k.startsWith('scoretool.cal.steven.')).forEach(k=>localStorage.removeItem(k));
      localStorage.setItem('scoretool.cal.steven.prompted','1')}""")
    pg.click('nav [data-v=tools]');pg.wait_for_timeout(400)
    pg.get_by_text('My results source').first.click();pg.wait_for_timeout(500)
    pg.locator('#rsofficial').scroll_into_view_if_needed()
    pg.screenshot(path=os.path.join(ART,'c4-form.png'))
    pg.fill('#ofdate','2026-08-08');pg.fill('#ofevent','Club championship')
    pg.fill('#ofroundx','C4 Official Round');pg.fill('#ofscore','580');pg.fill('#ofmax','600');pg.fill('#oftens','40');pg.fill('#ofxs','12')
    pg.fill('#ofends','10 10 9\n10 9 8')
    pg.click('#ofsave');pg.wait_for_timeout(300)
    chk('ends that do not match the score are refused', 'add up to' in pg.inner_text('#ofnote').lower())
    chk('nothing saved yet',E("localStorage.getItem('scoretool.official.steven')") is None)
    pg.fill('#ofends','')
    before=E("""()=>{S.sessions.push({id:'c4scored',date:'2026-08-01',round:'C4 Official Round',ends:[['10','10','10','10','10','10','10','10','10','10']],note:'keep'});save();return JSON.stringify(S.sessions.find(s=>s.id=='c4scored'))}""")
    pg.fill('#ofdate','2026-08-01');pg.fill('#ofscore','100');pg.click('#ofsave');pg.wait_for_timeout(200)
    chk('a scored session is left as it is', 'already scored' in pg.inner_text('#ofnote').lower() and E("JSON.stringify(S.sessions.find(s=>s.id=='c4scored'))")==before and E("localStorage.getItem('scoretool.official.steven')") is None)
    pg.fill('#ofdate','2026-08-08');pg.fill('#ofscore','580');pg.fill('#ofmax','600');pg.fill('#oftens','40');pg.fill('#ofxs','12');pg.click('#ofsave');pg.wait_for_timeout(300)
    chk('saved message', 'official result' in pg.inner_text('#ofnote').lower())
    rows=json.loads(E("localStorage.getItem('scoretool.official.steven')"))
    chk('saved as a finished official round',len(rows)==1 and rows[0]['official'] is True and rows[0]['finished'] is True and rows[0]['score']==580 and rows[0]['max']==600 and rows[0]['tens']==40 and rows[0]['xs']==12 and rows[0]['event']=='Club championship' and rows[0]['date']=='2026-08-08' and str(rows[0]['id']).startswith('off-'))
    pb=E("()=>window.bsCurrentPb('C4 Official Round')")
    chk('it counts as the personal best',pb and pb['date']=='2026-08-08' and pb['score']==580)
    E("()=>localStorage.setItem('scoretool.cal.steven.link',JSON.stringify('ab'.repeat(24)))")
    pg.wait_for_timeout(15000)
    mine=[x for x in SENT if str(x.get('p_source_id','')).startswith('steven:off-')]
    chk('queued to the calendar once, with (PB)',len(mine)==1 and mine[0]['p_score']==580 and mine[0]['p_shot_date']=='2026-08-08' and mine[0]['p_round']=='C4 Official Round (PB)' and mine[0]['p_max']==600 and mine[0]['p_token']=='ab'*24)
    chk('no page errors',not errs)
    open(os.path.join(ART,'c4-payload.json'),'w').write(json.dumps(mine[-1] if mine else None,indent=2))
    pg.locator('#rsofficial').scroll_into_view_if_needed();pg.screenshot(path=os.path.join(ART,'c4-saved.png'))
    b.close()
srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed')
sys.exit(1 if bad else 0)
