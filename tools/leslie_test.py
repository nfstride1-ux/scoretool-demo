# League: the host can move an archer who has already started this week (Leslie, scored by the host) between Own phone and Phone 1 and
# back; the ends already scored stay exactly as saved, and scoring carries on from the same end. TEST data only; relay mocked.
import subprocess,sys,time,os,json
from playwright.sync_api import sync_playwright
import guard   # stubs the ntfy.sh relay and blocks the service worker in every browser context (1 Nov 2026)
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=8897
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT)],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
errs=[]
def phone(b,tid):
  ctx=b.new_context(viewport={'width':390,'height':844});ctx.route('https://ntfy.sh/**',lambda r:r.fulfill(status=200,body='',headers={'access-control-allow-origin':'*'}))
  pg=ctx.new_page();pg.on('pageerror',lambda e:errs.append(f'{tid}: {e}'));pg.on('dialog',lambda d:d.accept())
  pg.goto(f'http://localhost:{PORT}/?tester={tid}');pg.wait_for_timeout(1200)
  pg.evaluate("()=>{S.unlocked=true;if(!S.profile)S.profile='Test';save()}");pg.reload();pg.wait_for_timeout(2000);return ctx,pg
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  c,H=phone(b,'nathe')
  code=H.evaluate("(()=>{const lg=lgCreate('Leslie test',['logan','estiaan','nate'],[]);return lg.code})()")
  gid=H.evaluate(f"(()=>{{const r=lgAddGuest('{code}','Leslie Anderson',false);return Object.keys(lgGet('{code}').gn||{{}})[0]}})()")
  chk('guest Leslie added',bool(gid) and H.evaluate(f"lgName('{gid}')")=='Leslie Anderson')
  H.evaluate(f"window._csMode='league';lgView('{code}')");H.wait_for_timeout(500)
  H.evaluate(f"lgSetGroups('{code}',1,[])")
  # Leslie scored two ends by the host, Logan scored one end on his own phone
  H.evaluate("""([c,g])=>{for(let i=0;i<6;i++)lgKey(c,1,g,['X','10','9','8','7','6'][i%6]);const lg=lgGet(c);lg.sc.logan={1:{e:[['10','10','9']],by:'logan',u:Date.now(),f:'vert'}};save();lgView(c)}""",[code,gid])
  H.wait_for_timeout(400)
  snap=lambda:H.evaluate(f"JSON.stringify(lgGet('{code}').sc)")
  sc0=snap()
  chk('Leslie is shown as started on Own phone',H.locator(f'#lggrp [data-lggb="{gid}"][data-g=""].on').count()==1 and '(started)' in H.inner_text('#lggrp'))
  chk('started archer buttons are not disabled (own phone and phones 1-3)',H.evaluate(f"[...document.querySelectorAll('#lggrp [data-lggb=\"{gid}\"]')].every(b=>!b.disabled)") and H.locator(f'#lggrp [data-lggb="{gid}"]').count()==4)
  H.click(f'#lggrp [data-lggb="{gid}"][data-g="0"]');H.wait_for_timeout(400)
  chk('Leslie moved to Phone 1',H.evaluate(f"lgGroupOf(lgGet('{code}'),1,'{gid}')")==0 and H.locator(f'#lggrp [data-lggb="{gid}"][data-g="0"].on').count()==1)
  chk('no error message shown',H.inner_text('#lggmsg').strip()=='')
  chk('scores untouched by the move',snap()==sc0)
  chk('Phone 1 now holds exactly Leslie',H.evaluate(f"lgGroups(lgGet('{code}'),1)[0]")==[gid])
  H.evaluate(f"lgView('{code}')");H.wait_for_timeout(300)
  # the host's phone is in group 1 only if host is a member; host nathe not in group list here, so score via the added-shooters card
  H.click(f'#lggrp [data-lggb="{gid}"][data-g=""]');H.wait_for_timeout(400)
  chk('moved back to Own phone',H.evaluate(f"lgGroupOf(lgGet('{code}'),1,'{gid}')")==None and snap()==sc0)
  # put host in Phone 1 with Leslie and keep scoring him from the shared card
  H.click(f'#lggrp [data-lggb="nathe"][data-g="0"]');H.wait_for_timeout(300)
  H.click(f'#lggrp [data-lggb="{gid}"][data-g="0"]');H.wait_for_timeout(400)
  chk('host and Leslie share Phone 1',H.evaluate(f"lgGroups(lgGet('{code}'),1)[0].slice().sort()")==sorted(['nathe',gid]))
  H.click('[data-lgsg="0"]');H.wait_for_timeout(400)
  H.click(f'#lgentry [data-lgid="{gid}"]');H.wait_for_timeout(300)
  chk('Leslie can be scored from the shared card, no lock',H.locator('#lglock').count()==0 and H.locator('#lgentry [data-lgk]').count()==7)
  for k in ['X','X','9']:H.click(f'#lgentry [data-lgk="{k}"]');H.wait_for_timeout(120)
  e=H.evaluate(f"lgGet('{code}').sc['{gid}'][1].e")
  chk('his earlier ends kept, new end added after them (3 ends, first two unchanged)',len(e)==3 and e[:2]==json.loads(sc0)[gid]['1']['e'][:2] and e[2]==['X','X','9'])
  # Logan started on his own phone; host moves him: ends kept, lock shows whose phone, takeover possible
  sc1=snap()
  H.click('#lgtoleague');H.wait_for_timeout(400)  # scoring now opens on its own page (lgpage): go back to the league screen first
  H.click('#lggrp [data-lggb="logan"][data-g="0"]');H.wait_for_timeout(400)
  chk('Logan (started on his own phone) moved to Phone 1, ends kept',H.evaluate(f"lgGroupOf(lgGet('{code}'),1,'logan')")==0 and H.evaluate(f"lgGet('{code}').sc.logan[1].e")==[['10','10','9']])
  H.click('[data-lgsg="0"]');H.wait_for_timeout(300);H.click('#lgentry [data-lgid="logan"]');H.wait_for_timeout(300)
  chk("his week says it is on Logan's phone, with a take-over button, nothing is lost",H.locator('#lglock').count()==1 and H.locator('#lgtake').count()==1 and H.evaluate(f"lgGet('{code}').sc.logan[1].e.length")==1)
  # everyone buttons now move started archers too
  H.click('#lgtoleague');H.wait_for_timeout(300)
  H.evaluate(f"lgView('{code}')");H.wait_for_timeout(300)
  H.click('#lgallown');H.wait_for_timeout(300)
  chk('Everyone on own phone moves every archer including started ones',H.evaluate(f"lgGroups(lgGet('{code}'),1)")==[])
  H.click('#lgallone');H.wait_for_timeout(300)
  chk('Everyone on one phone puts the whole league (incl. started) on phone 1',H.evaluate(f"lgGroups(lgGet('{code}'),1).length")==1 and gid in H.evaluate(f"lgGroups(lgGet('{code}'),1)[0]"))
  chk('Leslie three scored ends intact after all moves',H.evaluate(f"lgGet('{code}').sc['{gid}'][1].e.length")==3)
  chk('page errors: none',not errs)
finally:
 srv.terminate();print('leslie checks: PASS',len(ok),'FAIL',len(bad),bad);print(len(ok),'passed,',len(bad),'failed')
