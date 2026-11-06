# My results source (6 Nov 2026, test build): body picker, member number on this phone only,
# Open my results is a link, paste or CSV is mapped and confirmed, imports are tagged and do not
# replace a scored session or feed ratings. Plus says Available on Plus. Nothing is fetched.
import subprocess,sys,time,os,json
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)));import nm_seed,freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=freeport.get();URL=f'http://127.0.0.1:{PORT}/'
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n,flush=True)
srv=subprocess.Popen([sys.executable,'-m','http.server',PORT,'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.6)
CSV=os.path.join(ROOT,'tools','_results_sample.csv')
open(CSV,'w').write('Round,Date,Score,Event\nImport Trial 70,15/03/2024,601,State trial\n')
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
  ctx=b.new_context(viewport={'width':390,'height':844})
  seen=[]
  ctx.on('request',lambda r:seen.append(r.url))
  pg=ctx.new_page();errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.goto(URL+'?tester=nathe');pg.wait_for_timeout(1200)
  if pg.locator('#unlock').count():pg.click('#unlock');pg.wait_for_timeout(400)
  if pg.locator('#nmingo').count():
    pg.fill('#nmin','Nathe');pg.click('#nmingo');pg.wait_for_timeout(400)
  pg.click('nav [data-v=tools]');pg.wait_for_timeout(400)
  pg.get_by_text('My results source').first.click();pg.wait_for_timeout(500)
  chk('Australia home is filled in',pg.input_value('#rsurl')=='https://archery.org.au/')
  chk('nothing stored until you change it',pg.evaluate("localStorage.getItem('scoretool.resultsSource.nathe')") is None)
  pg.select_option('#rsbody','awa');pg.wait_for_timeout(300)
  chk('Archery WA home is filled in',pg.input_value('#rsurl')=='https://www.archerywa.com.au/')
  pg.select_option('#rsbody','world');pg.wait_for_timeout(200)
  chk('World Archery home',pg.input_value('#rsurl')=='https://www.worldarchery.sport/')
  pg.select_option('#rsbody','agb');pg.wait_for_timeout(200)
  chk('Archery GB home',pg.input_value('#rsurl')=='https://www.archerygb.org/')
  pg.select_option('#rsbody','usa');pg.wait_for_timeout(200)
  chk('USA Archery home',pg.input_value('#rsurl')=='https://www.usarchery.org/')
  pg.select_option('#rsbody','other');pg.wait_for_timeout(200)
  chk('Other starts empty and can be typed',pg.input_value('#rsurl')=='' and pg.locator('#rsurl').get_attribute('readonly') is None)
  pg.fill('#rsurl','https://example.com/my-results');pg.fill('#rsmem','32545');pg.click('#rssave');pg.wait_for_timeout(300)
  saved=json.loads(pg.evaluate("localStorage.getItem('scoretool.resultsSource.nathe')"))
  chk('saved on this phone only',saved=={'body':'other','url':'https://example.com/my-results','member':'32545'})
  chk('Open my results uses the saved address',pg.get_attribute('#rsopen','href')=='https://example.com/my-results' and pg.get_attribute('#rsopen','target')=='_blank')
  chk('no request to an organisation',not any(x for x in seen if 'archery.org' in x or 'archerywa' in x or 'worldarchery' in x or 'archerygb' in x or 'usarchery' in x or 'example.com' in x))
  # a scored session with the same date, round and total must stay byte for byte
  before=pg.evaluate("""()=>{S.sessions.push({id:'scored-keep',date:'2024-02-02',round:'Import Trial 70',ends:[['10','10','10','10']],note:'scored here'});save();return JSON.stringify(S.sessions.find(s=>s.id=='scored-keep'))}""")
  pg.fill('#rspaste','Round\tDate\tScore\tEvent\nImport Trial 70\t2024-02-02\t40\tAlready scored\nImport Trial 70\t2024-06-01\t610\tPasted shoot\n');pg.click('#rsread');pg.wait_for_timeout(400)
  chk('preview before confirm',pg.locator('#rspreview').count()==1 and '610' in pg.inner_text('#rspreview') and 'Pasted shoot' in pg.inner_text('#rspreview'))
  chk('nothing imported before confirm',pg.evaluate("localStorage.getItem('scoretool.imported.nathe')") is None)
  pg.click('#rsconfirm');pg.wait_for_timeout(400)
  chk('scored session not overwritten',pg.evaluate("JSON.stringify(S.sessions.find(s=>s.id=='scored-keep'))")==before)
  rows=json.loads(pg.evaluate("localStorage.getItem('scoretool.imported.nathe')"))
  chk('only the new row is saved, tagged imported',len(rows)==1 and rows[0]['score']==610 and rows[0]['imported'] is True and rows[0]['date']=='2024-06-01')
  chk('not in the rating list',not any(r.get('score')==610 and 'Import Trial' in str(r.get('round')) for r in pg.evaluate("findReal(S.profile)")))
  pg.evaluate("nav('stats')");pg.wait_for_timeout(800)
  pg.select_option('#srd','Import Trial 70');pg.wait_for_timeout(400)
  chk('PB shows imported',pg.locator('#pbscore').inner_text()=='610' and pg.locator('#c-pb [data-imported]').count()>=1)
  # CSV upload of a second round
  pg.evaluate("nav('lab_results')");pg.wait_for_timeout(400)
  pg.set_input_files('#rscsv',CSV);pg.wait_for_timeout(400)
  chk('CSV preview', '601' in pg.inner_text('#rspreview') and 'State trial' in pg.inner_text('#rspreview'))
  pg.click('#rsconfirm');pg.wait_for_timeout(300)
  both=json.loads(pg.evaluate("localStorage.getItem('scoretool.imported.nathe')"))
  chk('CSV added, paste kept',sorted(r['score'] for r in both)==[601,610])
  pg.evaluate("localStorage.setItem('scoretool.tierpreview.nathe','free')");pg.evaluate("nav('lab_results')");pg.wait_for_timeout(400)
  chk('Free sees Available on Plus', 'available on plus' in pg.inner_text('#tierlock').lower() and pg.locator('#rssource').count()==0)
  chk('no page errors',not errs)
  if errs:print(errs[:4])
  b.close()
finally:
 srv.terminate()
 try:os.remove(CSV)
 except Exception:pass
print('results',len(ok),'passed,',len(bad),'failed',bad)
sys.exit(1 if bad else 0)
