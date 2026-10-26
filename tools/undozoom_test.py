# Undo, zoom and End box on the indoor 3-spot (26 Oct 2026): Just me, Casual and League share the same face behaviour.
#  1) Undo takes the arrow just shot AND its plot (a finished end is sorted, so before this the lowest score went, and a plot on another spot stayed behind).
#     Plots, chips and the saved positions always agree, for every spot, zoomed and unzoomed, mid end and after the end is complete.
#  2) The next spot / end / return from the sheet opens on the full face (zoom is only kept while plotting the same end).
#  3) The right-hand End box is the running total of the end on the screen (0 on an empty end), Prog the total up to and including it.
# Phone-sized browser, tester profile "nate" only (throwaway test profile, never Nathe's). Relay mocked in memory. Saved data is never rewritten.
import subprocess,sys,time,os,json
from playwright.sync_api import sync_playwright
import nm_seed
from indoor_common import click_face
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=8874
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT)],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
def relay(route,req):route.fulfill(status=200,body='{}',headers={'access-control-allow-origin':'*'})
def phone(b,tid='nate'):
  ctx=b.new_context(viewport={'width':390,'height':844},has_touch=True,is_mobile=True);ctx.route('https://ntfy.sh/**',relay);pg=ctx.new_page();errs=[]
  pg.on('pageerror',lambda e:errs.append(str(e)));pg.goto(f'http://localhost:{PORT}/?tester={tid}');pg.wait_for_timeout(1200)
  pg.evaluate("S.unlocked=true;if(!S.profile)S.profile='Nate';save()");pg.reload();pg.wait_for_timeout(2200);return ctx,pg,errs
MK="id=>[...document.querySelectorAll('#'+id+' circle')].filter(c=>c.getAttribute('fill')=='#22c55e'||(c.getAttribute('fill')=='#fff'&&c.getAttribute('stroke')=='#000')).map(c=>[+c.getAttribute('cx'),+c.getAttribute('cy')])"
CH="document.querySelectorAll('.ad-chips .adb:not(.adb-empty)').length"
VW="id=>+document.querySelector('#'+id).getAttribute('viewBox').split(' ')[2]"
BOX="[...document.querySelectorAll('.ad-right .ad-num b')].map(b=>b.textContent)"
C=[[0,-0.62],[0,0],[0,0.62]]
def kit(pg,fid,undo,chip_sel):
  """returns helpers for one scoring screen"""
  st=[[]]
  def mk():return pg.evaluate(MK,fid)
  def plot(x,y):click_face(pg,fid,x,y);st.append(mk())
  def un():pg.click(undo);pg.wait_for_timeout(300);st.pop()
  def agree(lbl):
    m=mk();chips=pg.evaluate("s=>document.querySelectorAll(s).length",chip_sel)
    return m==st[-1] and chips==len(st)-1
  return st,mk,plot,un,agree
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  # ================= Just me =================
  c1,pg,e1=phone(b)
  pg.evaluate("cur=null;sv='sheet';nav('score')");pg.wait_for_timeout(500)
  pg.select_option('#rd','Australian Indoor 18m');pg.wait_for_timeout(300);pg.click('#f3row [data-f3=vert]');pg.wait_for_timeout(200);pg.click('#st');pg.wait_for_timeout(800)
  def clean():pg.evaluate("document.querySelectorAll('#fpm,.modal').forEach(e=>e.remove())")
  st,mk,plot,un,agree=kit(pg,'pface','#undo','.ad-chips .adb:not(.adb-empty)')
  chk('Just me: vertical 3-spot, Australian Indoor 18m',pg.evaluate("cur.face3")=='vert')
  # (1) the reported case: spot 1 (not an X), spot 2 X, spot 3 X zoomed on its bullseye; Undo must take the spot 3 arrow and plot
  v1=pg.evaluate("plotScore(0,-0.45,face3R(faceR(ROUNDS[cur.round],0),cur))");chk('spot 1 test arrow is not an X',v1!='X')
  plot(0,-0.45);plot(0,0)
  pg.click('[data-spot="3"]');pg.wait_for_timeout(250);pg.click('#zcycle');pg.click('#zcycle');pg.wait_for_timeout(200)
  chk('zoomed on spot 3 (3x)',abs(pg.evaluate(VW,'pface')-0.62/3)<0.01)
  plot(0,0.62);clean();chk('end complete: X X and the spot 1 score (sorted)',pg.evaluate("cur.ends[0]")==['X','X',v1])
  chk('end complete: three plots, three chips',agree('full'))
  un()
  chk('Undo removed the spot 3 arrow and its plot (no marker left on spot 3)',agree('u1') and all(y<0.3 for x,y in mk()) and len(mk())==2)
  pos=pg.evaluate("cur.pos[0]");chk('saved positions match the two arrows left',len(pos)==2 and all(pos))
  chk('the two arrows left are spot 1 (score '+v1+') and spot 2 (X), each plot beside its own arrow',sorted(pg.evaluate("cur.ends[0].map((a,i)=>a+'@'+(cur.pos[0][i].y<-0.3?1:2))"))==sorted([v1+'@1','X@2']))
  un();un();chk('undo to an empty end: no plots, no chips',agree('u3') and len(mk())==0 and pg.evaluate("cur.ends[0].length")==0)
  # (1b) every spot, zoomed and unzoomed: plot three, undo each, check plots, chips and saved positions agree every time
  for spot in [0,1,2,3]:
    for zoom in [0,1]:
      pg.click(f'[data-spot="{spot}"]');pg.wait_for_timeout(200)
      if zoom:pg.click('#zcycle');pg.wait_for_timeout(150)
      cs=[C[1]] if spot==0 and zoom else [C[spot-1]] if spot else C
      allok=True
      for i in range(3):
        c=cs[i%len(cs)];plot(c[0]+0.004*i,c[1]+0.003*i);clean();allok&=agree('p')
      posok=pg.evaluate("(()=>{const e=cur.ends[0],p=cur.pos[0];return e.length==3&&p.filter(Boolean).length==3})()")
      for i in range(3):un();allok&=agree('u')
      chk(f'Just me spot {spot} {"zoomed" if zoom else "full"}: plots, chips agree after every plot and Undo; saved positions complete',allok and posok and pg.evaluate("cur.ends[0].length==0&&(cur.pos[0]||[]).filter(Boolean).length==0"))
  # (2) zoom
  pg.click('[data-spot="3"]');pg.wait_for_timeout(200);pg.click('#zcycle');pg.click('#zcycle');pg.wait_for_timeout(150)
  chk('zoomed on spot 3',abs(pg.evaluate(VW,'pface')-0.62/3)<0.01)
  pg.click('[data-spot="2"]');pg.wait_for_timeout(250);chk('Spot 2 opens on the full face',abs(pg.evaluate(VW,'pface')-0.62)<0.01)
  pg.click('[data-spot="3"]');pg.wait_for_timeout(250);chk('then Spot 3 also opens on the full face',abs(pg.evaluate(VW,'pface')-0.62)<0.01)
  pg.click('#zcycle');pg.wait_for_timeout(150);plot(0,0.62);clean()
  chk('zoom is kept while plotting the same end',abs(pg.evaluate(VW,'pface')-0.31)<0.01)
  plot(0,0.62);plot(0,0.62);clean()
  chk('Just me: end complete, zoom still the same on the end just finished',abs(pg.evaluate(VW,'pface')-0.31)<0.01)
  chk('End box = end total (30), Prog 30 after the end',pg.evaluate(BOX)==['30','30'])
  pg.click('#enext');pg.wait_for_timeout(300);pg.click('#addsc');pg.wait_for_timeout(400)
  chk('Next end opens on the full face',abs(pg.evaluate(VW,'pface')-0.62)<0.01 and pg.evaluate("PZ.k")==1)
  chk('End 2: left box says End 2 of 10, End box 0 (nothing shot yet), Prog 30',pg.evaluate("document.querySelector('.ad-line').textContent").startswith('End 2 of 10') and pg.evaluate(BOX)==['0','30'])
  st[:]=[[]]
  plot(0,0.62);clean();chk('partly filled end: End box is the running total of this end (10), Prog 40',pg.evaluate(BOX)==['10','40'])
  plot(0.005,0.62);clean();chk('two arrows: End 20, Prog 50',pg.evaluate(BOX)==['20','50'])
  un();chk('Undo: End 10, Prog 40 again',pg.evaluate(BOX)==['10','40'] and agree('x'))
  # zoom reset when a different end is shown (Undo from an empty end back to the finished one) and when the sheet is visited
  pg.click('#zcycle');pg.wait_for_timeout(150);pg.click('#eback');pg.wait_for_timeout(300)
  pg.evaluate("sv='end';score()");pg.wait_for_timeout(300)
  chk('coming back from the sheet opens on the full face',abs(pg.evaluate(VW,'pface')-0.62)<0.01)
  chk('page errors (Just me): none',not e1)
  # ================= Casual =================
  c2,pg,e2=phone(b)
  pg.evaluate("nav('score')");pg.wait_for_timeout(500)
  CODE=pg.evaluate("csCreate({name:'Undo test',round:'Australian Indoor 18m',face3:'vert',self:true,ppl:[]}).code")
  pg.evaluate(f"csView('{CODE}')");pg.wait_for_timeout(600)
  st,mk,plot,un,agree=kit(pg,'cspface','#csundo','#csad .ad-chips .adb:not(.adb-empty)')
  VWC=VW;BOXC="[...document.querySelectorAll('#csad .ad-num b')].map(b=>b.textContent)"
  v1=pg.evaluate("plotScore(0,-0.45,face3R(faceR(ROUNDS['Australian Indoor 18m'],0),{face3:'vert'}))")
  plot(0,-0.45);plot(0,0)
  pg.click('[data-csspot="3"]');pg.wait_for_timeout(250);pg.click('#cszcycle');pg.click('#cszcycle');pg.wait_for_timeout(200)
  chk('Casual: zoomed on spot 3 (3x)',abs(pg.evaluate(VWC,'cspface')-0.62/3)<0.01)
  plot(0,0.62)
  # the end is complete: the next end opens on the full face, End box 0, Prog = the end just shot
  tot=pg.evaluate(f"csGet('{CODE}').sc[csMe()].e[0].reduce((t,a)=>t+(a=='X'?10:+a),0)")
  chk('Casual: after the end completes the next end opens on the full face',abs(pg.evaluate(VWC,'cspface')-0.62)<0.01)
  chk('Casual: End 2 of 10, End box 0, Prog = end 1 total',pg.evaluate("document.querySelector('#csad .ad-line').textContent").find('End 2 of 10')>=0 and pg.evaluate(BOXC)==['0',str(tot)])
  plot(0,0.62);pg.wait_for_timeout(200);chk('Casual: partly filled end: End 10, Prog = total + 10',pg.evaluate(BOXC)==['10',str(tot+10)])
  un();chk('Casual: Undo from the partly filled end: End 0',pg.evaluate(BOXC)==['0',str(tot)])
  # undo back into the finished end: takes the spot 3 arrow (shot last), not the lowest score
  st[:]=[[]]
  pg.click('#csundo');pg.wait_for_timeout(300)
  m=pg.evaluate(MK,'cspface');chk('Casual: Undo into the finished end removes the spot 3 arrow and plot',len(m)==2 and all(y<0.3 for x,y in m) and pg.evaluate(f"csGet('{CODE}').sc[csMe()].e[0].length")==2)
  chk('Casual: saved plots match the arrows (2 and 2)',pg.evaluate(f"(()=>{{const e=csGet('{CODE}').sc[csMe()];return e.p[0].filter(Boolean).length==e.e[0].length&&e.e[0].length==2}})()"))
  pg.click('[data-csspot="3"]');pg.click('#cszcycle');pg.wait_for_timeout(150);pg.click('[data-csspot="2"]');pg.wait_for_timeout(300)
  chk('Casual: Spot 2 opens on the full face',abs(pg.evaluate(VWC,'cspface')-0.62)<0.01)
  chk('page errors (Casual): none',not e2)
  # ================= League =================
  c3,pg,e3=phone(b)
  pg.evaluate("nav('score')");pg.wait_for_timeout(500);pg.evaluate("(()=>{if(!lgGet('ONIONSHD')){S.leagues.push(lgPresetRecord());save()}lgView('ONIONSHD')})()");pg.wait_for_timeout(500)
  pg.click('[data-lgme]');pg.wait_for_timeout(500)
  st,mk,plot,un,agree=kit(pg,'cspface','#lgundo','#csad .ad-chips .adb:not(.adb-empty)')
  if pg.locator('#cspface').count()==0:pg.click('#cshide') if pg.locator('#cshide').count() else None
  v1=pg.evaluate("plotScore(0,-0.45,face3R(faceR(ROUNDS[Object.keys(ROUNDS).find(r=>/Vegas 300/.test(r))],0),{face3:'vert'}))")
  chk('League: spot 1 test arrow is not an X',v1!='X')
  plot(0,-0.45);plot(0,0)
  pg.click('[data-csspot="3"]');pg.wait_for_timeout(250);pg.click('#cszcycle');pg.click('#cszcycle');pg.wait_for_timeout(200)
  chk('League: zoomed on spot 3 (3x)',abs(pg.evaluate(VW,'cspface')-0.62/3)<0.01)
  plot(0,0.62)
  chk('League: end complete, the next end opens on the full face',abs(pg.evaluate(VW,'cspface')-0.62)<0.01)
  b2=pg.evaluate(BOXC)
  chk('League: End 2, End box 0 on the empty end, Prog = end 1 total',b2[0]=='0' and int(b2[1])>=27)
  plot(0,0.62);chk('League: partly filled end: End 10, Prog = total + 10',pg.evaluate(BOXC)==['10',str(int(b2[1])+10)])
  un();pg.click('#lgundo');pg.wait_for_timeout(300)
  m=pg.evaluate(MK,'cspface');chk('League: Undo into the finished end removes the spot 3 arrow and plot',len(m)==2 and all(y<0.3 for x,y in m))
  chk('page errors (League): none',not e3)
  b.close()
finally:srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed');
for n in bad:print('  FAILED:',n)
sys.exit(1 if bad else 0)
