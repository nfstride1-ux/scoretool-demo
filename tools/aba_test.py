# ABA Interclub (3A + 1A) scorer, score sheet view, seeded 17 May 2025 round. 390x844 Chrome.
import subprocess,sys,time,os
from playwright.sync_api import sync_playwright
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
srv=subprocess.Popen([sys.executable,'-m','http.server','8771'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
IC='ABA Interclub (3A + 1A, 40 targets)'
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox']);pg=b.new_page(viewport={'width':390,'height':844})
  errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
  pg.goto('http://localhost:8771/');pg.wait_for_timeout(1000);pg.get_by_text('Nathaniel Stride').first.click();pg.wait_for_timeout(500);pg.get_by_text('Demo unlock').first.click();pg.wait_for_timeout(500)
  for _ in range(3):
    if pg.locator('nav [data-v=score]').is_visible():break
    pg.locator('#app button').first.click();pg.wait_for_timeout(400)
  E=pg.evaluate
  pg.click('nav [data-v=score]');pg.wait_for_timeout(500)
  # seeded paper round
  s=E("S.sessions.find(s=>s.id=='aba20250517')")
  chk('17 May 2025 seeded',bool(s) and s['date']=='2025-05-17' and len(s['ends'])==40)
  chk('seed total 782',E("total(S.sessions.find(s=>s.id=='aba20250517'))")==782)
  H=E("abaHalves(S.sessions.find(s=>s.id=='aba20250517')).map(o=>[o.sub,o.tot])")
  chk('seed subtotals 196/196 392, 194/196 390',H==[[[196,196],392],[[194,196],390]])
  E("abaSeed();abaSeed()");chk('seed only once',E("S.sessions.filter(s=>s.id=='aba20250517').length")==1)
  E("cur=S.sessions.find(s=>s.id=='aba20250517');score()");pg.wait_for_timeout(300)
  chk('finished round opens on sheet',pg.locator('#abapaper').count()==1)
  t=pg.text_content('#abapaper')
  chk('sheet header fields',all(x in t for x in ['ABA INTERCLUB','Name','ABA #','Date','Grade','Division','Target','63268','TBA']))
  chk('sheet half totals + round total',pg.inner_text('#abahalf3A')=='392' and pg.inner_text('#abahalf1A')=='390' and pg.inner_text('#abaround')=='782')
  chk('points table',pg.locator('.aba-pts td').all_inner_texts()==['20','18','16','14','12','10','8','6','4'])
  E("cur=null;sv='sheet';score()");pg.wait_for_timeout(300)
  # new interclub round
  pg.select_option('#rd',IC);pg.click('#st');pg.wait_for_timeout(500)
  chk('starts 3A target 1/20',pg.inner_text('#abatg')=='1 / 20' and '3A' in pg.text_content('#abacard'))
  z=lambda:pg.locator('[data-z]').all_inner_texts()
  chk('arrow 1 buttons 20/18/16',[x.split('\n')[0] for x in z()][:3]==['20','18','16'])
  pg.click('[data-z=M]');chk('after miss arrow 2 = 14/12/10',[x.split('\n')[0] for x in z()][:3]==['14','12','10'] and 'Arrow 2' in pg.inner_text('#abaarrow'))
  pg.click('[data-z=M]');chk('after 2 misses arrow 3 = 8/6/4',[x.split('\n')[0] for x in z()][:3]==['8','6','4'])
  pg.click('[data-z=B]');chk('arrow 3 B = 6',pg.inner_text('#abatot')=='6' and pg.inner_text('#abatg')=='2 / 20')
  pg.click('#abaundo');chk('undo back to target 1',pg.inner_text('#abatg')=='1 / 20' and pg.inner_text('#abatot')=='0')
  pg.click('[data-z=A]');pg.click('[data-z=M]');pg.click('[data-z=M]');pg.click('[data-z=M]')
  chk('3 misses = 0, next target',pg.inner_text('#abatg')=='3 / 20' and pg.inner_text('#abatot')=='20')
  for _ in range(18):pg.click('[data-z=A]')
  chk('1A half starts at target 21',pg.inner_text('#abatg')=='1 / 20' and '1A' in pg.text_content('#abacard') and 'first arrow only' in pg.inner_text('#abaarrow'))
  pg.click('[data-z=M]');chk('1A miss = 0, moves on (no arrow 2)',pg.inner_text('#abatg')=='2 / 20' and pg.inner_text('#abatot')=='380')
  chk('half totals line',('3A: 380' in pg.inner_text('#abahalves')) and '1A: 0' in pg.inner_text('#abahalves'))
  for _ in range(19):pg.click('[data-z=C]')
  chk('round done 380+304',pg.inner_text('#abatot')=='684')
  pg.click('[data-abv=sheet]');pg.wait_for_timeout(200)
  chk('sheet view 3A/1A totals',pg.inner_text('#abahalf3A')=='380' and pg.inner_text('#abahalf1A')=='304' and pg.inner_text('#abaround')=='684')
  chk('no horizontal overflow',E('document.querySelector("#scroller").scrollWidth<=390'))
  pg.screenshot(path='/workspace/aba_sheet.png',full_page=True)
  pg.click('[data-abv=score]');pg.click('#abadone');pg.wait_for_timeout(300)
  E("window._r='"+IC+"'");pg.click('nav [data-v=stats]');pg.wait_for_timeout(500)
  chk('stats ABA card',pg.locator('#abastats').count()==1)
  chk('no JS errors',not errs)
  if errs:print(errs)
  b.close()
finally:srv.kill()
print(f'{len(ok)} passed, {len(bad)} failed');[print('FAIL',x) for x in bad];sys.exit(1 if bad else 0)
