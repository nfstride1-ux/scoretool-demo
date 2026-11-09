# D1 (9 Nov 2026, Nathe): a finished score sheet is edited in place. On a finished Vegas 300,
# deleting an X left 287/290 from 29 arrows and the X could not be put back. After the fix the
# missing X is entered on that same sheet, and the total, X count, 10s count and PB all follow.
import json,os,subprocess,sys,time
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=os.environ.get('PORT') or freeport.get()
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n,flush=True)
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.4)
SEED=r"""()=>{
  const tens=()=>['10','10','10'];
  const hi={id:'vgfix',date:'2026-06-01',round:'Vegas 300',face3:'vegas',ends:[['X','10','7'],...Array.from({length:9},tens)],pos:[],note:'',finished:true};
  const lo={id:'vglo',date:'2026-01-01',round:'Vegas 300',face3:'vegas',ends:Array.from({length:10},()=>['10','10','9']),pos:[],note:'',finished:true};
  S.sessions=[lo,hi];save();
  return {n:S.sessions.filter(s=>s.id=='vgfix').length,t:total(hi),x:hi.ends.flat().filter(a=>a=='X').length};
}"""
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
    ctx=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
    E=pg.evaluate
    if pg.locator('#unlock').count():pg.locator('#unlock').click();pg.wait_for_timeout(200)
    E("()=>{S.unlocked=true;if(!S.profile)S.profile='Steven Test';save()}")
    seeded=E(SEED)
    chk('seed is one Vegas 300 of 297 with one X',seeded['n']==1 and seeded['t']==297 and seeded['x']==1)
    E("()=>{cur=null;sv='sheet';nav('score')}");pg.wait_for_timeout(400)
    pg.locator('[data-open=vgfix]').scroll_into_view_if_needed();pg.locator('[data-open=vgfix]').click();pg.wait_for_timeout(400)
    sheet=E("""()=>{const t=document.querySelector('.ad-sum');return {big:document.querySelector('.ad-sum b.big').textContent,sum:t.textContent.replace(/\\s+/g,' ').trim(),id:cur.id,copies:S.sessions.filter(s=>s.id=='vgfix').length}}""")
    chk('opened sheet is the same session, 297 out of 300',sheet['id']=='vgfix' and sheet['copies']==1 and sheet['big']=='297' and '/ 300' in sheet['sum'] and "X's:" in sheet['sum'])
    pg.locator('[data-fix="0,0"]').click();pg.wait_for_timeout(300)
    chk('the X can be deleted from the finished sheet',pg.locator('#delarrow').count()==1)
    pg.locator('#delarrow').click();pg.wait_for_timeout(300)
    mid=E("""()=>{const live=!!document.querySelector('[data-k="X"]')&&!document.querySelector('[data-k="X"]').disabled;return {arrows:cur.ends.flat().length,t:total(cur),live,end:document.querySelector('#endno')&&document.querySelector('#endno').textContent,id:cur.id,copies:S.sessions.filter(s=>s.id==cur.id).length}}""")
    chk('after deleting the X: 287 from 29 arrows, still the same sheet, and a score key is live',mid['t']==287 and mid['arrows']==29 and mid['live'] and mid['id']=='vgfix' and mid['copies']==1 and mid['end']=='End 1 of 10')
    pg.locator('[data-k="X"]').click();pg.wait_for_timeout(400)
    done=E("""()=>{const sum=document.querySelector('.ad-sum').textContent.replace(/\\s+/g,' ').trim();const pb=[...document.querySelectorAll('.ad-sheet p')].map(p=>p.textContent.replace(/\\s+/g,' ').trim()).find(t=>/personal best|PB/i.test(t))||'';
      const xs=(cur.ends.flat().filter(a=>a=='X').length),tens=(cur.ends.flat().filter(a=>a=='X'||a=='10').length);
      return {sum,pb,t:total(cur),xs,tens,arrows:cur.ends.flat().length,id:cur.id,copies:S.sessions.filter(s=>s.id=='vgfix').length,full:isFull(cur),best:pbs()['Vegas 300']}}""")
    chk('the X is back on the same sheet and the round is full again',done['t']==297 and done['arrows']==30 and done['full'] and done['id']=='vgfix' and done['copies']==1)
    chk('total is 297 out of 300',done['sum'].startswith("X's: 1") and '10\'s/X\'s: 29' in done['sum'] and '/ 300' in done['sum'] and '297' in done['sum'])
    chk('X count and 10s count match the arrows',done['xs']==1 and done['tens']==29)
    chk('PB status recalculates: this 297 beats the earlier 290',done['best'] and done['best']['score']==297 and 'beating 290' in done['pb'])
    chk('no page errors',not errs)
    b.close()
srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed')
if bad:print('FAILED',bad)
sys.exit(1 if bad else 0)
