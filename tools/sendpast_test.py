# Send past rounds to Archery Calendar (calsync.js). Not linked: the Send button opens the link prompt.
# C2: once linked, every finished round is sent on its own, including ones finished before the link.
# A round goes once. Samples and discarded rounds stay out. The RPC is stubbed.
# Tester 'steven' on a fresh 390px phone, seeded TEST sessions only; archerycalendars.com events and the Supabase RPC are mocked.
import subprocess,sys,time,os,json,re
from playwright.sync_api import sync_playwright
import guard   # stubs the ntfy.sh relay and blocks the service worker in every browser context (1 Nov 2026)
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)));import nm_seed
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));SH=os.path.join(ROOT,'shots-sendpast');os.makedirs(SH,exist_ok=True)
PORT='8798';ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n,flush=True)
srv=subprocess.Popen([sys.executable,'-m','http.server',PORT],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
EMO=re.compile('[\U0001F300-\U0001FAFF\u2600-\u27BF]')
EVS={'generated':'test','events':[
 {'id':'t-one','name':'Test Indoor – Club A','start_date':'2026-09-05','end_date':'2026-09-05','state':'WA','discipline':'Indoor','category':'competition','host':'Club A','location':'Hall A'},
 {'id':'t-two-a','name':'Test Target Shoot','start_date':'2026-09-11','end_date':'2026-09-13','state':'WA','discipline':'Target','category':'competition','host':'Club B'},
 {'id':'t-two-b','name':'Test Club Day','start_date':'2026-09-12','end_date':'2026-09-12','state':'VIC','discipline':'Indoor','category':'club','host':'Club C'},
 {'id':'t-bulk','name':'Test Bulk Shoot','start_date':'2026-08-01','end_date':'2026-08-01','state':'WA','discipline':'Indoor','category':'competition','host':'Club D'}]}
SENT=[]
def rpc(route):
  if 'scoretool_save_score' in route.request.url:SENT.append(json.loads(route.request.post_data or '{}'))
  route.fulfill(status=200,content_type='application/json',body='null')
with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new'])
  ctx=b.new_context(viewport={'width':390,'height':844},device_scale_factor=2);pg=ctx.new_page();errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
  ctx.route('https://archerycalendars.com/data/events.json*',lambda r:r.fulfill(status=200,content_type='application/json',body=json.dumps(EVS),headers={'access-control-allow-origin':'*'}))
  ctx.route('https://sllsqpfqwckwtljzjxli.supabase.co/**',rpc)
  pg.goto(f'http://localhost:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
  E=pg.evaluate
  E("""()=>{S.unlocked=true;if(!S.profile)S.profile='Steven Test';const e=n=>[...Array(n)].map(()=>['10','9','8']);
   S.sessions=S.sessions.filter(s=>!/^sp/.test(s.id));
   [['sp1','2026-09-05'],['sp2','2026-09-12'],['sp3','2026-09-19'],['sp7','2026-08-01'],['sp8','2026-08-02']].forEach(([id,d])=>S.sessions.push({id,date:d,round:'Indoor WA 18m',ends:e(20),pos:[],src:'practice'}));
   S.sessions.push({id:'sp4',date:'2026-09-20',round:'Indoor WA 18m',ends:e(5),pos:[],src:'practice'});save();
   Object.keys(localStorage).filter(k=>k.startsWith('scoretool.cal.steven.')).forEach(k=>localStorage.removeItem(k));
   localStorage.setItem('scoretool.cal.steven.prompted','1')}""")
  OTHER=E("()=>JSON.stringify(Object.keys(localStorage).filter(k=>!k.startsWith('scoretool.cal.steven.')&&!/^scoretool\\.(v|state|steven|dname)/.test(k)).sort().map(k=>[k,localStorage.getItem(k)]))")
  pg.reload();pg.wait_for_timeout(2500)
  if pg.locator('#unlock').count():pg.locator('#unlock').first.click();pg.wait_for_timeout(400)
  SN="JSON.stringify(S.sessions)";s0=E(SN)
  base=E("JSON.parse(localStorage.getItem('scoretool.cal.steven.base')||'null')")
  chk('past rounds are in the baseline (never sent on their own)',isinstance(base,list) and 'sp1' in base)
  def past():
    E("()=>{cur=null;sv='sheet';nav('score')}");pg.wait_for_timeout(700)
  past()
  chk('Send button on finished unsent rounds',all(pg.locator(f'[data-calsend="{i}"]').count()==1 for i in ['sp1','sp2','sp3']))
  chk('no button on an unfinished round',pg.locator('[data-calsend="sp4"]').count()==0)
  chk('button uses a line icon, no emoji',pg.locator('[data-calsend="sp1"] svg').count()==1 and not EMO.search(pg.locator('[data-calsend="sp1"]').inner_text()))
  # not linked: the link prompt shows even though it was shown before
  pg.click('[data-calsend="sp1"]');pg.wait_for_timeout(600)
  chk('not linked: shows the link prompt',pg.locator('#calPrompt').count()==1 and pg.locator('#calov').count()==0 and not SENT)
  pg.locator('#calPrompt').screenshot(path=os.path.join(SH,'01-not-linked-prompt.png')) if pg.locator('#calPrompt').count() else None
  E("()=>{const d=document.getElementById('calPrompt');if(d)d.remove()}")
  past();pg.locator('[data-calsend="sp1"]').scroll_into_view_if_needed();pg.screenshot(path=os.path.join(SH,'02-past-sessions.png'))
  # a sample and a discarded round must stay out once linking turns auto-send on
  E("""()=>{const e=n=>[...Array(n)].map(()=>['10','9','8']);
    S.sessions.push({id:'sp9',date:'2026-07-01',round:'Indoor WA 18m',ends:e(20),pos:[],src:'practice'});
    S.sessions.push({id:'spsamp',date:'2026-07-02',round:'Indoor WA 18m',ends:e(20),pos:[],src:'practice',sample:true});
    save();window.calDiscard('sp9');
    localStorage.setItem('scoretool.cal.steven.link',JSON.stringify('ab'.repeat(24)))}""")
  s0=E(SN)
  pg.wait_for_timeout(7000)
  def got(i):return [x for x in SENT if x.get('p_source_id')=='steven:'+i]
  for i,d in [('sp1','2026-09-05'),('sp2','2026-09-12'),('sp3','2026-09-19'),('sp7','2026-08-01'),('sp8','2026-08-02')]:
    rows=got(i)
    chk(f'{i} sent once under its round',len(rows)==1 and rows[0]['p_score']==540 and rows[0]['p_shot_date']==d and rows[0]['p_round'].startswith('Indoor WA 18m') and rows[0]['p_token']=='ab'*24)
  chk('unfinished, sample and discarded are not sent',not got('sp4') and not got('spsamp') and not got('sp9'))
  n0=len(SENT);pg.wait_for_timeout(5000)
  chk('a second pass does not send them again',len(SENT)==n0)
  past()
  chk('sent round shows On Archery Calendar (no button)',pg.locator('[data-calsend="sp1"]').count()==0 and 'On Archery Calendar' in pg.locator('[data-calst=sent]').first.inner_text())
  pg.locator('[data-calst=sent]').first.scroll_into_view_if_needed();pg.screenshot(path=os.path.join(SH,'05-offline-waiting.png'))
  E("()=>{cur=null;nav('lab_settings')}");pg.wait_for_timeout(900)
  chk('Settings no longer lists those rounds as waiting','(' not in pg.locator('#calPast').inner_text())
  pg.locator('#calcard').scroll_into_view_if_needed();pg.screenshot(path=os.path.join(SH,'06-settings-card.png'))
  # nothing else changed
  chk('session records unchanged',E(SN)==s0)
  NOW=E("()=>JSON.stringify(Object.keys(localStorage).filter(k=>!k.startsWith('scoretool.cal.steven.')&&!/^scoretool\\.(v|state|steven|dname)/.test(k)).sort().map(k=>[k,localStorage.getItem(k)]))")
  if NOW!=OTHER:print(' key diff:',sorted(set(map(tuple,json.loads(NOW)))^set(map(tuple,json.loads(OTHER))))[:6])
  chk('only scoretool.cal.steven.* keys written',NOW==OTHER)
  css=open(os.path.join(ROOT,'lab.css')).read();blk=css[css.find('/* Send past rounds'):]
  chk('no purple in the new styles',not re.search(r'purple|#(7c3aed|8b5cf6|a855f7|9333ea|6d28d9)',blk,re.I))
  chk('no page errors',not [e for e in errs if 'favicon' not in e and 'net::' not in e]);print(' errors:',errs[:5])
  b.close()
srv.terminate();print(f'\n{len(ok)} passed, {len(bad)} failed');sys.exit(1 if bad else 0)
