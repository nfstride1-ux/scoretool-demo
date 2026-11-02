# R2 (3 Nov 2026, Nathe via Archery Coach): every Before and After box on a tuning session's Arrow setup card can be typed in, with the
# R1 range check. Edits save to that session only (t.arrow / t.arrowAfter), never to the Arrow chooser, My bows or My arrows. Out-of-range
# typing is flagged and not saved; out-of-range figures saved before (12365 gr, -3643 fps) are flagged when shown and left unchanged
# until typed over. Other sessions untouched, 390px, no emoji on the card, no console errors. Test data only. BASE=<url> for a deployed copy.
import subprocess,sys,time,os,json
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
import guard
import nm_seed,freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=os.environ.get('PORT') or freeport.get();BASE=os.environ.get('BASE');URL=BASE or f'http://localhost:{PORT}/'
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n)
srv=None if BASE else subprocess.Popen([sys.executable,'-m','http.server',PORT,'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
OTHER="(()=>{const d=JSON.parse(localStorage.getItem('scoretool.v1')||'{}');return JSON.stringify({b:d.bows,s:d.sessions,u:d.setup,sel:d.bowSel,spec:d.bowSpec,a:d.arrowInfo,c:d.calc,ch:localStorage.getItem('scoretool.arrowchooser.nathe'),keys:Object.keys(localStorage).filter(k=>/arrow|bow/i.test(k)).sort()})})()"
SHOTS=os.environ.get('SHOTS')
def shot(pg,name,sel=None):
    if not SHOTS:return
    os.makedirs(SHOTS,exist_ok=True)
    if sel:pg.evaluate(f"document.querySelector('{sel}').scrollIntoView()");pg.wait_for_timeout(200)
    pg.screenshot(path=os.path.join(SHOTS,name+'.png'))
SNAP={'bow':'compound','spine':'400','model':'X10','len':28,'pt':100,'foc':11.2,'tw':12365,'fps':-3643,'fpsSrc':'estimate'}
def T(pg):return pg.evaluate("JSON.parse(JSON.stringify(S.tune.find(t=>t.id==S._tuneId)))")
def typ(pg,id,v):pg.fill('#'+id,str(v));pg.press('#'+id,'Tab');pg.wait_for_timeout(300)
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
  pg.evaluate("""S=>{S0=S;}""",{})
  tune0=pg.evaluate("JSON.stringify(S.tune||null)")
  pg.evaluate("""a=>{S.tune=(S.tune||[]).concat([
    {id:'tr2old',archer:S.profile,date:'2026-10-20',name:'Old group',change:'Group test',dist:'18m',face:'40cm',before:[[0.1,0.1,'2026-10-20']],after:[],grp:'before'},
    {id:'tr2one',archer:S.profile,date:'2026-11-02',name:'One group',change:'Just a group',dist:'18m',face:'40cm',before:[],after:[],grp:'before',arrow:Object.assign({},a,{tw:420,fps:280})},
    {id:'tr2bare',archer:S.profile,date:'2026-11-03',name:'Bare test',change:'Bare shaft vs fletched',dist:'18m',face:'122cm',hand:'R',before:[],after:[],grp:'before',arrow:a}]);save()}""",SNAP)
  pg.reload();pg.wait_for_timeout(1500)
  others0=pg.evaluate("JSON.stringify(S.tune.filter(t=>t.id!='tr2bare'))")
  def open_(id):pg.evaluate(f"S._tuneId='{id}';save();nav('lab_opt')");pg.wait_for_timeout(500)
  open_('tr2bare')
  other0=pg.evaluate(OTHER)
  chk('card shown with Before and After boxes for every field',all(pg.locator(f'#ta_{s}_{k}').count()==1 for s in 'ba' for k in ['model','spine','len','pt','foc','tw','fps']))
  chk('saved values in the Before boxes',pg.input_value('#ta_b_len')=='28' and pg.input_value('#ta_b_pt')=='100' and pg.input_value('#ta_b_spine')=='400')
  chk('saved 12365 gr flagged',pg.locator('#ta_b_tw_bad').count()==1 and 'outside the usual range' in pg.inner_text('#ta_b_tw_bad'))
  chk('saved -3643 fps flagged',pg.locator('#ta_b_fps_bad').count()==1)
  chk('showing changes nothing saved',T(pg)['arrow']==SNAP and 'arrowAfter' not in T(pg))
  shot(pg,'r2-card-flagged','#tarwcard')
  typ(pg,'ta_b_tw',99999)
  chk('out-of-range typing flagged and kept in the box',pg.input_value('#ta_b_tw')=='99999' and pg.locator('#ta_b_tw_bad').count()==1)
  chk('out-of-range typing not saved',T(pg)['arrow']['tw']==12365)
  typ(pg,'ta_b_tw',420)
  chk('good figure saved to this session',T(pg)['arrow']['tw']==420 and pg.locator('#ta_b_tw_bad').count()==0)
  typ(pg,'ta_b_fps',281)
  chk('speed saved, marked as your figure',T(pg)['arrow']['fps']==281 and T(pg)['arrow']['fpsSrc']=='own')
  typ(pg,'ta_b_spine','500');chk('spine text saved',T(pg)['arrow']['spine']=='500')
  typ(pg,'ta_a_pt',120)
  t=T(pg);chk('first After edit starts from Before',t.get('arrowAfter',{}).get('pt')==120 and t['arrowAfter'].get('len')==28 and t['arrowAfter'].get('tw')==420)
  chk('What changed shows the point','point 100 gr → 120 gr' in pg.inner_text('#tarwcard'))
  typ(pg,'ta_a_dl' if pg.locator('#ta_a_dl').count() else 'ta_a_len','abc')
  chk('not a number flagged on After',pg.locator('#ta_a_len_bad').count()==1 and 'is not a number' in pg.inner_text('#ta_a_len_bad') and T(pg)['arrowAfter']['len']==28)
  typ(pg,'ta_a_len','27.5');chk('After length saved',T(pg)['arrowAfter']['len']==27.5)
  typ(pg,'ta_a_fps','');chk('cleared box saved as blank',T(pg)['arrowAfter']['fps'] is None)
  shot(pg,'r2-card-edited','#tarwcard')
  chk('390px no sideways scroll',pg.evaluate("document.documentElement.scrollWidth")<=392)
  chk('no emoji on the card',not EMO(pg.inner_text('#tarwcard')))
  # any save() writes the app's own empty defaults (bows [], bowSel {}) for a tester who had none; that is not a change to their data
  NZ=lambda j:{k:v for k,v in json.loads(j).items() if v not in (None,[],{})}
  chk('Arrow chooser, My bows, My arrows, calculators not changed',NZ(pg.evaluate(OTHER))==NZ(other0))
  chk('other sessions not changed',pg.evaluate("JSON.stringify(S.tune.filter(t=>t.id!='tr2bare'))")==others0)
  open_('tr2one')
  chk('one group: a single Arrow column',pg.locator('#ta_b_len').count()==1 and pg.locator('#ta_a_len').count()==0)
  typ(pg,'ta_b_pt',110);chk('one group edit saved',T(pg)['arrow']['pt']==110)
  open_('tr2old')
  chk('old session without a setup: empty boxes, nothing written',pg.locator('#ta_b_len').count()==1 and pg.input_value('#ta_b_len')=='' and 'arrow' not in T(pg) and 'arrowAfter' not in T(pg))
  wn=pg.evaluate("JSON.stringify((window.WHATSNEW||[])[0]||'')");V=pg.evaluate("fetch('version.json',{cache:'no-store'}).then(r=>r.json()).then(j=>j.version)")
  allwn=pg.evaluate("JSON.stringify(window.WHATSNEW||[])").lower()
  chk('release note present',('arrow setup card' in wn.lower()) if V.endswith('-r2') else ('arrow setup card' in allwn))
  pg.evaluate(f"S.tune={tune0};S._tuneId=null;save()")
  chk('no console errors',not errs);errs and print(errs[:5])
  ctx.close();b.close()
if srv:srv.terminate()
print(f'{len(ok)} passed, {len(bad)} failed');bad and print('FAIL',bad)
sys.exit(1 if bad else 0)
