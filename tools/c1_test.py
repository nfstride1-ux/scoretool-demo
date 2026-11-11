# C1 (6 Nov 2026, Nathe): a finished full round that is the Personal bests card's PB for that round is sent
# with " (PB)" on the round string. ScoreTool side only. The Supabase RPC is stubbed. The link token is fake.
# Nothing is posted to the live Archery Calendar. Tester steven, 390px, test sessions only.
import json,os,subprocess,sys,time
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import nm_seed
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART=os.environ.get('C1_ART') or '/opt/cursor/artifacts/scoretool-calsync'
os.makedirs(ART,exist_ok=True)
import freeport
PORT=os.environ.get('PORT') or freeport.get()
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n,flush=True)
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.4)
SENT=[]
def rpc(route):
    if 'scoretool_save_score' in route.request.url:
        SENT.append(json.loads(route.request.post_data or '{}'))
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
    E("""()=>{S.unlocked=true;if(!S.profile)S.profile='Steven Test';S.sessions=(S.sessions||[]).filter(s=>!/^c1/.test(s.id||''));save();
      Object.keys(localStorage).filter(k=>k.startsWith('scoretool.cal.steven.')).forEach(k=>localStorage.removeItem(k));
      localStorage.setItem('scoretool.cal.steven.prompted','1')}""")
    pg.reload();pg.wait_for_timeout(1800)
    if pg.locator('#unlock').count():pg.locator('#unlock').first.click();pg.wait_for_timeout(300)
    # link after the baseline, then add the rounds so they are new finished rounds
    E("""([low,high])=>{
      localStorage.setItem('scoretool.cal.steven.link',JSON.stringify('ab'.repeat(24)));
      S.sessions.push({id:'c1low',date:'2026-06-01',round:'Practice 10 ends × 3',ends:low,pos:[],src:'practice'});
      S.sessions.push({id:'c1high',date:'2026-06-02',round:'Practice 10 ends × 3',ends:high,pos:[],src:'practice'});
      S.sessions.push({id:'c1sample',date:'2026-06-03',round:'Practice 10 ends × 3',ends:high,pos:[],src:'practice',sample:true});
      S.sessions.push({id:'c1part',date:'2026-06-04',round:'Practice 10 ends × 3',ends:high.slice(0,3),pos:[],src:'practice'});
      save()}""",[LOW,HIGH])
    pg.wait_for_timeout(5500)
    def rows(i):return [x for x in SENT if x.get('p_source_id')=='steven:'+i]
    hi,lo,sa,pa=rows('c1high'),rows('c1low'),rows('c1sample'),rows('c1part')
    chk('PB round is sent with (PB) on the round string',bool(hi) and hi[-1]['p_round']=='Practice 10 ends × 3 (PB)' and hi[-1]['p_score']==300 and hi[-1]['p_shot_date']=='2026-06-02' and hi[-1]['p_max']==300 and hi[-1]['p_token']=='ab'*24)
    chk('a lower full round is sent without (PB)',bool(lo) and lo[-1]['p_round']=='Practice 10 ends × 3' and lo[-1]['p_score']==150)
    chk('sample and unfinished are not sent',not sa and not pa)
    chk('each sent round goes once',len(hi)==1 and len(lo)==1)
    chk('token is the fake test token, not a live link',all(x.get('p_token')=='ab'*24 for x in SENT) and all('p_pb' not in x for x in SENT))
    chk('no page errors',not errs)
    open(os.path.join(ART,'c1-payloads.json'),'w').write(json.dumps({'pb':hi[-1] if hi else None,'other':lo[-1] if lo else None,'calls':len(SENT)},indent=2))
    E("()=>{cur=null;nav('score')}");pg.wait_for_timeout(600)
    pg.screenshot(path=os.path.join(ART,'c1-sent.png'))
    b.close()
srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed')
sys.exit(1 if bad else 0)
