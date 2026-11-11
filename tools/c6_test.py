# C6 (6 Nov 2026, Nathe): Sync now is Plus/Pro only and the pull flag defaults off.
# The note says coming once the national body approves, with a way to paste or CSV.
# No organisation is called, even if the flag is switched on. The RPC is stubbed.
import os,subprocess,sys,time
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import nm_seed,freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART=os.environ.get('C6_ART') or '/opt/cursor/artifacts/scoretool-calsync'
os.makedirs(ART,exist_ok=True)
PORT=os.environ.get('PORT') or freeport.get()
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n,flush=True)
ORG=('worldarchery','archery.org','archerywa','archerygb','usarchery','api.worldarchery')
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.4)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
    ctx=b.new_context(viewport={'width':390,'height':844});seen=[]
    ctx.on('request',lambda r:seen.append(r.url))
    pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    ctx.route('https://sllsqpfqwckwtljzjxli.supabase.co/**',lambda r:r.fulfill(status=200,content_type='application/json',body='null'))
    pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
    E=pg.evaluate
    if pg.locator('#unlock').count():pg.locator('#unlock').click();pg.wait_for_timeout(200)
    E("""()=>{S.unlocked=true;if(!S.profile)S.profile='Steven Test';save();
      localStorage.removeItem('scoretool.flag.waSync')}""")
    pg.evaluate("()=>nav('lab_results')");pg.wait_for_timeout(400)
    chk('flag defaults off',E("localStorage.getItem('scoretool.flag.waSync')") is None)
    chk('Sync now is on the results screen',pg.locator('#rssync').count()==1)
    note=pg.inner_text('#rssyncnote')
    chk('off note names national body approval','coming once your national body approves' in note.lower())
    pg.locator('#rssyncard').scroll_into_view_if_needed();pg.screenshot(path=os.path.join(ART,'c6-sync-off.png'))
    n0=len(seen)
    pg.click('#rssync');pg.wait_for_timeout(400)
    chk('clicking Sync now still says approval is needed','coming once your national body approves' in pg.inner_text('#rssyncnote').lower())
    pg.click('#rssyncpaste');pg.wait_for_timeout(300)
    chk('paste or CSV is the way in',pg.locator('#rsimport').count()==1 and pg.locator('#rspaste').is_visible())
    E("()=>{localStorage.setItem('scoretool.flag.waSync','1');nav('lab_results')}")
    pg.wait_for_timeout(400)
    chk('flag on still fetches nothing','no organisation has approved a pull' in pg.inner_text('#rssyncnote').lower())
    pg.click('#rssync');pg.wait_for_timeout(500)
    hits=[u for u in seen[n0:] if any(h in u for h in ORG)]
    chk('no organisation was called',not hits)
    E("()=>{localStorage.setItem('scoretool.tierpreview.steven','free');nav('lab_results')}")
    pg.wait_for_timeout(400)
    chk('Free does not get Sync now',pg.locator('#rssync').count()==0 and 'available on plus' in pg.inner_text('#tierlock').lower())
    chk('no page errors',not errs)
    if hits:print(hits[:5])
    b.close()
srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed')
sys.exit(1 if bad else 0)
