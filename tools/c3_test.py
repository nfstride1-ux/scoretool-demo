# C3 (6 Nov 2026, Nathe): official scoresheets (sheet-), competition results that are not a scoresheet (diary-),
# and My results imports (imp-) are queued once. A row matching an already-sent session on date + round + score is skipped.
# The (PB) rule is the same one. The RPC is stubbed. The link token is fake. Nothing is posted to the live calendar.
import json,os,subprocess,sys,time
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import nm_seed
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART=os.environ.get('C3_ART') or '/opt/cursor/artifacts/scoretool-calsync'
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
HIGH=[['10','10','10'] for _ in range(10)]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
    ctx=b.new_context(viewport={'width':390,'height':844});pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    ctx.route('https://sllsqpfqwckwtljzjxli.supabase.co/**',rpc)
    ctx.route('https://archerycalendars.com/**',lambda r:r.fulfill(status=200,content_type='application/json',body='{"events":[]}',headers={'access-control-allow-origin':'*'}))
    pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1500)
    E=pg.evaluate
    E("""(high)=>{S.unlocked=true;if(!S.profile)S.profile='Steven Test';
      S.sessions=[{id:'c3sess',date:'2026-04-02',round:'Practice 10 ends × 3',ends:high,pos:[],src:'practice'}];
      save();
      localStorage.setItem('scoretool.imported.steven',JSON.stringify([
        {id:'imp-keep',date:'2026-04-09',round:'C3 Import Round',score:610,event:'Import Trial',imported:true},
        {id:'imp-dup',date:'2026-04-02',round:'Practice 10 ends × 3',score:300,event:'Same as a scored round',imported:true}]));
      Object.keys(localStorage).filter(k=>k.startsWith('scoretool.cal.steven.')).forEach(k=>localStorage.removeItem(k));
      localStorage.setItem('scoretool.cal.steven.prompted','1')}""",HIGH)
    pg.reload();pg.wait_for_timeout(2000)
    if pg.locator('#unlock').count():pg.locator('#unlock').first.click();pg.wait_for_timeout(400)
    # Mark one loaded scoresheet as a competition result with no sheet flag, so it takes the diary- id.
    marked=E("""()=>{const rows=(typeof findReal=='function'?findReal(S.profile||''):[])||[];
      const day=r=>typeof normDate=='function'?normDate(r.date):r.date;
      const key=r=>day(r)+'|'+r.round+'|'+r.score;
      const n={};rows.forEach(r=>{const k=key(r);n[k]=(n[k]||0)+1});
      const one=rows.find(r=>r&&r.sheet&&r.score>0&&!r.incomplete&&n[key(r)]==1);
      if(one)one.sheet=0;
      localStorage.setItem('scoretool.cal.steven.link',JSON.stringify('ab'.repeat(24)));
      return one?{date:(typeof normDate=='function'?normDate(one.date):one.date),round:String(one.round),score:+one.score,club:one.club||null}:null}""")
    # official sheets for this tester are queued in the same pass; give that loop time, then check once
    pg.wait_for_timeout(20000)
    def rows(pred):return [x for x in SENT if pred(x)]
    keep=rows(lambda x:x.get('p_source_id')=='steven:imp-keep')
    dup=rows(lambda x:x.get('p_source_id')=='steven:imp-dup')
    sheets=rows(lambda x:str(x.get('p_source_id','')).startswith('steven:sheet-'))
    diaries=rows(lambda x:str(x.get('p_source_id','')).startswith('steven:diary-'))
    chk('imported score is sent once with (PB) and an imp- id',len(keep)==1 and keep[0]['p_score']==610 and keep[0]['p_shot_date']=='2026-04-09' and keep[0]['p_round']=='C3 Import Round (PB)' and keep[0]['p_max'] is None and keep[0]['p_token']=='ab'*24)
    diary=rows(lambda x:str(x.get('p_source_id','')).startswith('steven:diary-') and marked and x.get('p_shot_date')==marked['date'] and x.get('p_score')==marked['score'])
    chk('a competition result that is not a scoresheet uses diary-',bool(marked) and len(diary)==1 and diary[0]['p_round'].startswith(marked['round']) and (diary[0]['p_location'] or None)==(marked['club'] or None))
    chk('import matching an already-sent session is skipped',not dup)
    chk('at least one official scoresheet is queued',len(sheets)>=1)
    ids=[x.get('p_source_id') for x in SENT]
    chk('each source id is sent once',len(ids)==len(set(ids)))
    chk('every call uses the fake token and no new column',all(x.get('p_token')=='ab'*24 and 'p_pb' not in x for x in SENT))
    n0=len(SENT);pg.wait_for_timeout(6000)
    chk('a second pass sends nothing more',len(SENT)==n0)
    chk('no page errors',not errs)
    sample={'import':keep[0] if keep else None,'sheet':sheets[0] if sheets else None,'diary':diaries[0] if diaries else None,'sheets':len(sheets),'diary_rows':len(diaries),'calls':len(SENT)}
    open(os.path.join(ART,'c3-payloads.json'),'w').write(json.dumps(sample,indent=2))
    E("()=>{cur=null;nav('lab_settings')}");pg.wait_for_timeout(700)
    if pg.locator('#calcard').count():pg.locator('#calcard').scroll_into_view_if_needed()
    pg.screenshot(path=os.path.join(ART,'c3-settings.png'))
    b.close()
srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed')
if bad:print('SENT sample',json.dumps(SENT[:3],indent=2)[:800])
sys.exit(1 if bad else 0)
