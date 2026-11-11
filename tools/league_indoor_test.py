# League indoor scoring, values only (updated 11 Nov 2026, Nathe: no plotting for league scores).
# Phone-sized browser, tester profile "nate" only (his own localStorage key; never Nathe's). Relay mocked in memory, so no real traffic.
# Just me still plots on the face. League scoring uses the number pad only: no plot face, no arrow positions.
# The same 30 values entered in Just me (by plotting) and in the league (by keys) give the same ordered scores.
import subprocess,sys,time,os,json
from playwright.sync_api import sync_playwright
import guard   # stubs the ntfy.sh relay and blocks the service worker in every browser context (1 Nov 2026)
import nm_seed
from indoor_common import GEN,click_face,snap
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
srv=subprocess.Popen([sys.executable,'-m','http.server','8861'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
POSTS=[]
def relay(route,req):
  if req.method=='POST':POSTS.append(req.post_data or '');return route.fulfill(status=200,body='{}',headers={'access-control-allow-origin':'*'})
  route.fulfill(status=200,body='',headers={'access-control-allow-origin':'*'})
def phone(b,tid='nate'):
  ctx=b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True);ctx.route('https://ntfy.sh/**',relay);pg=ctx.new_page();errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)));pg.goto(f'http://localhost:8861/?tester={tid}');pg.wait_for_timeout(1200)
  pg.evaluate("S.unlocked=true;if(!S.profile)S.profile='Nate';save()");pg.reload();pg.wait_for_timeout(2200);return ctx,pg,errs
VAL="a=>a=='X'?10:a=='M'?0:+a"
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  # ---------- Just me: the reference ----------
  c1,jm,e1=phone(b)
  jm.evaluate("cur=null;sv='sheet';nav('score')");jm.wait_for_timeout(500)
  jm.select_option('#rd','Vegas 300 (18 m)');jm.wait_for_timeout(300);jm.click('#st');jm.wait_for_timeout(800)
  PTS=jm.evaluate(GEN,'Vegas 300 (18 m)');chk('30 robust arrow positions made',len(PTS)==30)
  chk('Just me is on the vertical 3-spot',jm.evaluate("cur.face3")=='vert')
  for i,(x,y,v) in enumerate(PTS):
    click_face(jm,'pface',x,y)
    if i%3==2:
      jm.evaluate("document.querySelector('#fpm')?.remove()");jm.click('#enext');jm.wait_for_timeout(300)
      if i<29:jm.click('#addsc');jm.wait_for_timeout(300)
  JT=jm.evaluate("document.body.innerText");JSUM=jm.evaluate("(()=>{const a=document.querySelector('#finsess');return !!a&&!!document.querySelector('.ad-sum')&&!!document.querySelector('.shcard')})()")
  chk('Just me finishing shows the summary and the plotted group',JSUM)
  jm.screenshot(path='/tmp/lgx_ind_just.png',full_page=True)
  J=jm.evaluate("(()=>{const s=S.sessions[S.sessions.length-1];return{ends:s.ends,pos:s.pos,face3:s.face3}})()")
  chk('Just me scored all 30 arrows',sum(len(e) for e in J['ends'])==30)
  # ---------- League: values only, no plot face (Nathe 11 Nov 7:57am) ----------
  c2,pg,e2=phone(b)
  KEY=pg.evaluate("KEY");before=snap(pg)
  pg.evaluate("nav('score')");pg.wait_for_timeout(500);pg.evaluate("(()=>{if(!lgGet('ONIONSHD')){S.leagues.push(lgPresetRecord());save()}lgView('ONIONSHD')})()");pg.wait_for_timeout(500)
  chk('tester sees the league',pg.locator('[data-lgme]').count()==1)
  pg.click('[data-lgme]');pg.wait_for_timeout(500)
  chk('league scoring shows no plot face',pg.locator('#cspface').count()==0 and pg.locator('#csfwrap').count()==0 and pg.locator('#csad').count()==0 and pg.locator('#cshide').count()==0)
  chk('score keys X 10 9 8 7 6 M on a number pad',pg.evaluate("[...document.querySelectorAll('#lgentry [data-lgk]')].map(b=>b.dataset.lgk)")==['X','10','9','8','7','6','M'])
  vis=pg.evaluate("(()=>{const q=s=>document.querySelector(s).getBoundingClientRect(),nv=document.querySelector('nav').getBoundingClientRect();return{pad:q('#lgentry .lc-pad').bottom<=nv.top+1,keys:q('#lgentry .lc-pad').top>=0}})()")
  chk('phone: the score keys are on the screen',vis['pad'] and vis['keys'])
  pg.screenshot(path='/tmp/lgx_ind_league0.png')
  def L():return pg.evaluate("(()=>{const e=lgGet('ONIONSHD').sc.nate[1];return{e:e.e,p:e.p||[]}})()")
  def tap(v):
    pg.click(f'#lgentry [data-lgk="{v}"]');pg.wait_for_timeout(120)
  # end 1: the same three values Just me scored, via the pad
  for x,y,v in PTS[:3]:tap(v)
  d=L();exp=sorted([v for _,_,v in PTS[:3]],key=lambda a:(-(10 if a=='X' else 0 if a=='M' else int(a)),a!='X'))
  chk('end 1 scored from the pad, put in order',d['e'][0]==exp==J['ends'][0])
  chk('end 1 stores no arrow positions',not d['p'] or not any(d['p']))
  tot=sum(pg.evaluate(f"({VAL})('{a}')") for a in d['e'][0])
  # undo mid-end
  for x,y,v in PTS[3:5]:tap(v)
  chk('two arrows in end 2',len(L()['e'][1])==2)
  pg.click('#lgundo');pg.wait_for_timeout(300)
  chk('undo takes the last arrow',len(L()['e'][1])==1)
  pg.click('#lgundo');pg.wait_for_timeout(200)
  d=L();chk('undo again leaves only end 1',len(d['e'])==1)
  # the rest, same values as Just me
  for x,y,v in PTS[3:]:tap(v)
  d=L()
  chk('league ends equal Just me ends (same values, entered on the pad)',d['e']==J['ends'])
  chk('league stores no plot positions',not d['p'] or not any(any(x for x in (row or []) if x) for row in d['p']))
  tots=[sum(pg.evaluate(f"({VAL})('{a}')") for a in e) for e in d['e']]
  body=pg.evaluate("document.querySelector('#lgscores')?document.querySelector('#lgscores').innerText:document.body.innerText")
  chk('finished week total is shown on the scores table',str(sum(tots)) in body)
  chk('no plot face after the card is finished',pg.locator('#cspface').count()==0)
  # saved record: values only
  lg=pg.evaluate("lgGet('ONIONSHD').sc.nate[1]");chk('saved record keeps e (ends) and does not add plot positions',('e' in lg) and not lg.get('p'))
  S=pg.evaluate("S.sessions.find(x=>x.id=='lg-ONIONSHD-w1')")
  chk('own session saved with the same scores',bool(S) and S['ends']==J['ends'])
  chk('relay carried the ends but no plot positions',len(POSTS)>0 and not any('"x"' in x or '"p"' in x for x in POSTS))
  # undo after finishing still works
  pg.click('#lgundo');pg.wait_for_timeout(400)
  chk('undo after finishing takes the last arrow back (pad returns, no face)',pg.locator('#cspface').count()==0 and pg.locator('#lgentry [data-lgk]').count()==7 and len(L()['e'][9])==2)
  x,y,v=PTS[29];tap(v)
  chk('re-scored, finished again',L()['e']==J['ends'])
  # only this tester's own key was written
  after=snap(pg);chg=sorted(k for k in set(before)|set(after) if before.get(k)!=after.get(k))
  print('keys changed while scoring:',chg)
  chk('only the tester\'s own keys changed (scoretool.v1.nate)',chg==['scoretool.v1.nate'] and KEY=='scoretool.v1.nate')
  chk('no data under Nathe\'s or the shared key',not any(k in after for k in ('scoretool.v1','scoretool.v1.nathe')))
  chk('no page errors',not e1 and not e2)
  b.close()
finally: srv.kill()
print(f'\n{len(ok)} passed, {len(bad)} failed');sys.exit(1 if bad else 0)
