# C2 (6 Nov 2026, Nathe): every finished round is sent, practice and club alike, including ones already
# finished before linking. Dedupe on source id and the sent payload. Samples and discarded rounds stay out.
# The RPC is stubbed. The link token is fake. Nothing is posted to the live calendar.
import json,os,subprocess,sys,time
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import nm_seed
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART=os.environ.get('C2_ART') or '/opt/cursor/artifacts/scoretool-calsync'
os.makedirs(ART,exist_ok=True)
import freeport
PORT=os.environ.get('PORT') or freeport.get()
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n,flush=True)
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.4)
SENT=[]
def rpc(route):
    if 'scoretool_save_score' in route.request.url:SENT.append(json.loads(route.request.post_data or '{}'))
    route.fulfill(status=200,content_type='application/json',body='null')
LOW=[['5','5','5'] for _ in range(10)]
HIGH=[['10','10','10'] for _ in range(10)]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
    ctx=b.new_context(viewport={'width':390,'height':844});pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    ctx.route('https://sllsqpfqwckwtljzjxli.supabase.co/**',rpc)
    ctx.route('https://archerycalendars.com/**',lambda r:r.fulfill(status=200,content_type='application/json',body='{"events":[]}',headers={'access-control-allow-origin':'*'}))
    pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
    E=pg.evaluate
    E("""([low,high])=>{S.unlocked=true;if(!S.profile)S.profile='Steven Test';
      S.sessions=[{id:'c2prac',date:'2026-05-01',round:'Practice 10 ends × 3',ends:low,pos:[],src:'practice'},
        {id:'c2club',date:'2026-05-02',round:'Practice 10 ends × 3',ends:high,pos:[],src:'paper'},
        {id:'c2drop',date:'2026-05-03',round:'Practice 10 ends × 3',ends:high,pos:[],src:'practice'},
        {id:'c2samp',date:'2026-05-04',round:'Practice 10 ends × 3',ends:high,pos:[],src:'practice',sample:true}];
      save();
      Object.keys(localStorage).filter(k=>k.startsWith('scoretool.cal.steven.')).forEach(k=>localStorage.removeItem(k));
      localStorage.setItem('scoretool.cal.steven.prompted','1')}""",[LOW,HIGH])
    pg.reload();pg.wait_for_timeout(2000)
    if pg.locator('#unlock').count():pg.locator('#unlock').first.click();pg.wait_for_timeout(300)
    base=E("JSON.parse(localStorage.getItem('scoretool.cal.steven.base')||'null')")
    chk('already-finished rounds are recorded and not sent before linking',isinstance(base,list) and 'c2prac' in base and 'c2club' in base and not SENT)
    E("""()=>{window.calDiscard('c2drop');localStorage.setItem('scoretool.cal.steven.link',JSON.stringify('ab'.repeat(24)))}""")
    pg.wait_for_timeout(6000)
    def got(i):return [x for x in SENT if x.get('p_source_id')=='steven:'+i]
    prac,club,drop,samp=got('c2prac'),got('c2club'),got('c2drop'),got('c2samp')
    chk('baselined practice round is sent once',len(prac)==1 and prac[0]['p_score']==150 and prac[0]['p_round']=='Practice 10 ends × 3' and prac[0]['p_token']=='ab'*24)
    chk('baselined club round is sent once and tagged PB',len(club)==1 and club[0]['p_score']==300 and club[0]['p_round']=='Practice 10 ends × 3 (PB)')
    chk('discarded and sample rounds are not sent',not drop and not samp)
    n0=len([x for x in SENT if str(x.get('p_source_id','')).startswith('steven:c2')])
    pg.wait_for_timeout(5000)
    n1=len([x for x in SENT if str(x.get('p_source_id','')).startswith('steven:c2')])
    chk('nothing sends a second time',n0==n1==2)
    chk('no page errors',not errs)
    open(os.path.join(ART,'c2-payloads.json'),'w').write(json.dumps({'practice':prac[-1] if prac else None,'club':club[-1] if club else None},indent=2))
    E("()=>{cur=null;nav('score')}");pg.wait_for_timeout(500)
    pg.screenshot(path=os.path.join(ART,'c2-sent.png'))
    b.close()
srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed')
sys.exit(1 if bad else 0)
