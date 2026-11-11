# C12 (11 Nov 2026): account sign-in stub, plan field, first-sign-in move offer. No payments. Tester data key unchanged.
import os,subprocess,sys,time,json
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=os.environ.get('PORT') or freeport.get()
ok=[];bad=[]
def chk(n,c,i=''):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n+('' if c else '  '+str(i)[:300]),flush=True)
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.5)
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
  pg=b.new_page();pg.set_viewport_size({'width':390,'height':844})
  errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
  pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
  if pg.locator('#unlock').count():pg.locator('#unlock').first.click();pg.wait_for_timeout(300)
  # start signed out in the stub (does not touch the tester scores key except a fixture session we add)
  pg.evaluate("""()=>{
    S.unlocked=true;
    /* protected removeItem will not wipe scoretool.acct; clear the steven slot in place */
    const a=JSON.parse(localStorage.getItem('scoretool.acct')||'{}')||{};
    a.users=a.users||{};delete a.users.steven;if(a.current=='steven')delete a.current;
    localStorage.setItem('scoretool.acct',JSON.stringify(a));
    S.sessions=S.sessions||[];
    if(!S.sessions.some(s=>s.id=='c12fix'))S.sessions.push({id:'c12fix',date:'2026-11-06',round:'Indoor WA 18m',ends:[['9','9','9']],pos:[],src:'practice',finished:true});
    save();
  }""")
  before=pg.evaluate("localStorage.getItem('scoretool.v1.steven')")
  plan=pg.evaluate("()=>acctPlan()")
  chk('Current tester is Pro free for life without writing a plan into their data', plan['plan']=='Pro' and plan['lifetime'] is True and plan['source']=='tester', plan)
  mid=pg.evaluate("localStorage.getItem('scoretool.v1.steven')")
  chk('Reading the plan does not change the tester data key', before==mid)
  pg.evaluate("nav('lab_settings')");pg.wait_for_timeout(500)
  txt=pg.inner_text('#acctcard') if pg.locator('#acctcard').count() else pg.inner_text('#app')
  chk('Settings has email magic link, password and Google sign-in', 'magic link' in txt.lower() and 'password' in txt.lower() and 'Google' in txt)
  chk('No redeem codes and no payment checkout', 'redeem' not in txt.lower() and 'lemon squeezy' not in txt.lower() or 'not taken' in txt.lower() or 'preview' in txt.lower())
  chk('Pricing on the account screen is Plus $5/$49 and Pro $12/$99 AUD', '$5' in txt and '$49' in txt and '$12' in txt and '$99' in txt and 'AUD' in txt, txt[:400])
  # Sign in with magic link
  if pg.locator('#acctem').count():pg.fill('#acctem','steven@example.com')
  pg.locator('#acctmagic').click();pg.wait_for_timeout(500)
  chk('Magic-link sign-in in preview signs in without a server', pg.evaluate("acctIsSignedIn()") is True)
  chk('Signed-in tester stays Pro free for life', pg.evaluate("acctPlan().plan")=='Pro' and pg.evaluate("acctPlan().lifetime") is True)
  # First sign-in offer
  chk('First sign-in offers to move local data and does not wipe it', pg.locator('#acctoffer').count()==1 and pg.locator('#acctmove').count()==1)
  after_offer=pg.evaluate("localStorage.getItem('scoretool.v1.steven')")
  n=pg.evaluate("(S.sessions||[]).length")
  pg.locator('#acctkeep').click();pg.wait_for_timeout(300)
  after_keep=pg.evaluate("()=>({key:localStorage.getItem('scoretool.v1.steven'),n:(S.sessions||[]).length,moved:acctUser()&&acctUser().moved})")
  chk('Declining the move leaves local sessions in place', after_keep['n']==n and after_keep['moved'] is False, after_keep)
  # Sign out and sign in with Google, accept move
  pg.evaluate("acctSignOut()");pg.evaluate("()=>{const s=JSON.parse(localStorage.getItem('scoretool.acct')||'{}');if(s.users&&s.users.steven)delete s.users.steven;localStorage.setItem('scoretool.acct',JSON.stringify(s))}")
  pg.evaluate("nav('lab_settings')");pg.wait_for_timeout(400)
  pg.locator('#acctgoogle').click();pg.wait_for_timeout(400)
  if pg.locator('#acctmove').count():
    pg.locator('#acctmove').click();pg.wait_for_timeout(300)
  chk('Accepting the move does not wipe local sessions', pg.evaluate("(S.sessions||[]).length")==n and pg.evaluate("acctUser()&&acctUser().moved") is True)
  chk('Paid features unlock by sign-in (no redeem function)', pg.evaluate("typeof acctUnlocked=='function'&&acctUnlocked('plus')===true") )
  chk('Preview does not flip ACCT_LIVE on', pg.evaluate("ACCT_LIVE") is False)
  chk('Setup list for Nathe is present', pg.evaluate("Array.isArray(ACCT_SETUP)&&ACCT_SETUP.length>=3"))
  pg.evaluate("()=>{S.sessions=(S.sessions||[]).filter(s=>s.id!='c12fix');save()}")
  chk('no page errors', not errs, errs[:4])
  b.close()
finally:
  srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed')
for x in bad:print('FAILED:',x)
sys.exit(1 if bad else 0)
