# R1 (3 Nov 2026, Nathe via Archery Coach): sane ranges on the arrow and bow figures. A figure outside its usual range (12365 gr was
# accepted) or not a number is flagged on its own box in plain English and left out; the speed estimate shows '-' with the reason and is
# never negative (it showed -3643 fps). IBO 379 (the Concept X 40 prefill) is in range. Arrow chooser, Calculators speed and KE cards,
# Is this arrow right. 390px, no emoji on the new text, no console errors, saved tester data unchanged. Test data only. BASE=<url> for a deployed copy.
import subprocess,sys,time,os,json,re
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
import guard
import nm_seed,freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=os.environ.get('PORT') or freeport.get();BASE=os.environ.get('BASE');URL=BASE or f'http://localhost:{PORT}/'
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n)
srv=None if BASE else subprocess.Popen([sys.executable,'-m','http.server',PORT,'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
OLD="(()=>{const d=JSON.parse(localStorage.getItem('scoretool.v1')||'{}');return JSON.stringify({b:d.bows,s:d.sessions,t:d.tune,u:d.setup,sel:d.bowSel,spec:d.bowSpec,a:d.arrowInfo})})()"
SEEDJS="""()=>{const d=JSON.parse(localStorage.getItem('scoretool.v1')||'{}');d.bowSel=d.bowSel||{};delete d.bowSel[d.profile];
 localStorage.setItem('scoretool.v1',JSON.stringify(d));localStorage.removeItem('scoretool.arrowchooser.nathe')}"""
SHOTS=os.environ.get('SHOTS')
def shot(pg,name):
    if SHOTS:os.makedirs(SHOTS,exist_ok=True);pg.screenshot(path=os.path.join(SHOTS,name+'.png'),full_page=False)
def setR(pg,R):pg.evaluate("R=>localStorage.setItem('scoretool.arrowchooser.nathe',JSON.stringify(R))",R)
def chooser(pg):pg.evaluate("nav('lab_chooser')");pg.wait_for_timeout(500)
def calc(pg,C):
    pg.evaluate("C=>{S.calc=C;save()}",C);pg.evaluate("nav('lab_calc')");pg.wait_for_timeout(500)
def fillc(pg,k,v):pg.fill(f'#c_{k}',str(v));pg.press(f'#c_{k}','Tab');pg.wait_for_timeout(300)
def est(pg):return pg.inner_text('#c_est').strip()
def has(pg,sel):return pg.locator(sel).count()>=1
NEG=re.compile(r'(?<![\d\w])-\s?\d+(\.\d+)?\s*fps')
EMO=lambda t:any(ord(c)>0x1F000 or 0x2600<=ord(c)<0x27C0 for c in t)
with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
  ctx=b.new_context(viewport={'width':390,'height':844});pg=ctx.new_page();errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
  pg.goto(URL);pg.wait_for_timeout(1500);nm_seed.pick(pg,'nathe');pg.wait_for_timeout(500)
  if pg.get_by_text('Demo unlock').count():pg.get_by_text('Demo unlock').first.click();pg.wait_for_timeout(500)
  for _ in range(3):
    if pg.locator('nav [data-v=home]').is_visible():break
    pg.locator('#app button').first.click();pg.wait_for_timeout(400)
  pg.evaluate(SEEDJS);pg.reload();pg.wait_for_timeout(1800)
  before=pg.evaluate(OLD);calc0=pg.evaluate("JSON.stringify(S.calc||null)")
  # --- Calculators speed card
  calc(pg,{'gr':'400','ibo':'379','dl':'29','dw':'60','sg':'0','len':'29','bp':'17','spdOn':1})
  chk('calc: good figures give the estimate (379 IBO)',est(pg)=='336' and not has(pg,'.labbad'))
  chk('calc: IBO 379 not flagged',not has(pg,'#cbad_ibo'))
  fillc(pg,'gr',12365)
  t=pg.inner_text('#app')
  chk('calc: 12365 gr flagged on the arrow weight box',has(pg,'#cbad_gr') and 'outside the usual range of 100 to 1000 gr' in pg.inner_text('#cbad_gr'))
  chk('calc: flagged box keeps what was typed',pg.input_value('#c_gr')=='12365' and pg.get_attribute('#c_gr','aria-invalid')=='true')
  chk('calc: speed shows - with the reason, not -3643',est(pg)=='-' and has(pg,'#c_estwhy') and 'flagged' in pg.inner_text('#c_estwhy'))
  chk('calc: no negative fps anywhere',not NEG.search(t))
  chk('calc: KE not worked out from a flagged weight','Energy' not in t or not re.search(r'-\d',pg.inner_text('#app')))
  shot(pg,'r1-calc-12365gr');pg.locator('#c_est').scroll_into_view_if_needed();pg.evaluate("scrollBy(0,150)");shot(pg,'r1-calc-speed-dash')
  fillc(pg,'gr',400);chk('calc: fixing the box clears the note',est(pg)=='336' and not has(pg,'#cbad_gr'))
  for k,v,word in [('ibo',500,'Speed rating'),('dw',200,'Draw weight'),('dl',45,'Draw length')]:
    fillc(pg,k,v);chk(f'calc: {k} {v} flagged',has(pg,f'#cbad_{k}') and word in pg.inner_text(f'#cbad_{k}') and est(pg)=='-')
  calc(pg,{'gr':'400','ibo':'379','dl':'29','dw':'60','sg':'0','len':'29','bp':'17','spdOn':1})
  fillc(pg,'dw','abc');chk('calc: not a number flagged in plain English',has(pg,'#cbad_dw') and 'is not a number' in pg.inner_text('#cbad_dw'))
  calc(pg,{'gr':'1000','ibo':'200','dl':'14','dw':'5','sg':'0','len':'29','bp':'17','spdOn':1})
  chk('calc: in-range figures that would go negative show - and say why',est(pg)=='-' and 'under 100 fps' in pg.inner_text('#c_estwhy') and not NEG.search(pg.inner_text('#app')))
  calc(pg,{'gr':'400','ibo':'379','dl':'29','dw':'60','sg':'0','len':'29','bp':'17','spdOn':1,'fpsU':'-50'})
  chk('calc: own speed -50 flagged',has(pg,'#cbad_fpsU'))
  chk('calc: page has no emoji in the new notes',not EMO(' '.join(pg.locator('.labbad,#c_estwhy').all_inner_texts())))
  chk('calc 390px no sideways scroll',pg.evaluate("document.documentElement.scrollWidth")<=392)
  # --- Arrow chooser
  base={'bow':'compound','use':'target','dw':'60','dl':'29','ibo':'379','len':'28','pt':'100','gpiU':'9'}
  setR(pg,base);chooser(pg)
  chk('chooser: good figures, nothing flagged, IBO 379 fine',not has(pg,'.labbad'))
  S0=pg.evaluate("JSON.stringify(arrowSetup())");s0=json.loads(S0)
  chk('chooser: speed estimate is positive',s0 and s0.get('fps') and s0['fps']>0)
  setR(pg,dict(base,pt='12365'));chooser(pg)
  chk('chooser: 12365 gr point flagged on its box',pg.locator('#acbad_pt').count()==1 and 'Point weight: 12365 gr is outside the usual range' in pg.text_content('#acbad_pt'))
  chk('chooser: flagged box keeps the typed text',pg.input_value('#ac_pt')=='12365' and pg.get_attribute('#ac_pt','aria-invalid')=='true')
  chk('chooser: flagged point not used in a session snapshot',pg.evaluate("arrowSetup()") is None)
  setR(pg,dict(base,gpiU='30',len='36',pt='400',ins='150'));chooser(pg)
  chk('chooser: total weight over 1000 gr flagged',has(pg,'#actwbad') and 'Arrow weight' in pg.inner_text('#actwbad'))
  s=pg.evaluate("arrowSetup()")
  chk('chooser: no weight or negative speed passed on',s is not None and s.get('tw') in (None,) and (s.get('fps') is None or s['fps']>0))
  shot(pg,'r1-chooser-heavy')
  pg.evaluate("C=>{S.calc=C;save()}",{'gr':'400','ibo':'379','dl':'29','dw':'60','sg':'0','len':'29','bp':'17'})
  if pg.locator('#acuse').count() and pg.locator('#acuse').is_enabled():
    pg.click('#acuse');pg.wait_for_timeout(300)
    chk('chooser: Use this arrow does not send a weight over 1000 gr',pg.evaluate("S.calc.gr")=='400')
  else:chk('chooser: Use this arrow does not send a weight over 1000 gr',True)
  setR(pg,dict(base,dw='200',dl='45',ibo='900'));chooser(pg)
  chk('chooser: draw weight, draw length, IBO flagged',all(pg.locator(f'#acbad_{k}').count()==1 for k in ('dw','dl','ibo')))
  shot(pg,'r1-chooser-bowfigures')
  t=pg.inner_text('#app');chk('chooser: no negative fps',not NEG.search(t))
  chk('chooser: no emoji',not EMO(t))
  chk('chooser 390px no sideways scroll',pg.evaluate("document.documentElement.scrollWidth")<=392)
  setR(pg,dict(base,dw='38',bow='recurve',ibo=''));chooser(pg);chk('chooser: recurve 38 lb fine',not has(pg,'.labbad'))
  wn=pg.evaluate("JSON.stringify((window.WHATSNEW||[])[0]||'')");V=pg.evaluate("fetch('version.json',{cache:'no-store'}).then(r=>r.json()).then(j=>j.version)")
  allwn=pg.evaluate("JSON.stringify(window.WHATSNEW||[])").lower()
  chk('release note present',('usual range' in wn.lower()) if V.endswith('-r1') else ('usual range' in allwn))
  pg.evaluate("C=>{S.calc=C;save()}",json.loads(calc0));pg.evaluate("localStorage.removeItem('scoretool.arrowchooser.nathe')")
  chk('old data unchanged',json.loads(pg.evaluate(OLD))==json.loads(before))
  chk('no console errors',not errs);errs and print(errs[:5])
  ctx.close();b.close()
if srv:srv.terminate()
print(f'{len(ok)} passed, {len(bad)} failed');bad and print('FAIL',bad)
sys.exit(1 if bad else 0)
