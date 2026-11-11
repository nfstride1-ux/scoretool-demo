# D2 (9 Nov 2026, Nathe): the last-arrow plot, then auto-advance.
#
# What Nathe saw, reproduced here on a phone-sized screen (390x844), Just me, Vegas 300, target showing:
#   1. Start Vegas 300 and open Spot 3 (the bottom spot). Enter two arrows with the score keys (X, then 10).
#   2. For the third arrow, tap the bottom edge of the target picture, 1px inside the face.
#      The picture used to be letterboxed, so that tap mapped past the 6-ring and was stored as M.
#      The end then locked (End complete, score keys disabled). Undo was the way back.
#   3. Hide target, and the same arrow can be entered with a score key. That is why it "only worked
#      after hiding the target", and why he may have hit M and had to undo.
# After the fix that bottom-edge tap is not stored as a miss that locks the end.
#
# Then: once the arrows for a target face are plotted, the next target opens.
# On a 3-spot, Spot 1 then Spot 2 then Spot 3. After Spot 3 (the last target on this face) the end
# stays until Next. After the last end of the round, Next is still required; nothing opens an 11th end.
# On a single face or a field target, plotting the last arrow of that face opens the next target,
# and the last target of the round waits for Next.
import os,subprocess,sys,time
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=os.environ.get('PORT') or freeport.get()
ok=[];bad=[]
def chk(n,c,info=''):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n+(('  '+str(info)) if not c and info!='' else ''),flush=True)
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.4)
def tap_svg(pg,x,y):
    q=pg.evaluate("""([x,y])=>{const sv=document.querySelector('#pface'),p=sv.createSVGPoint();p.x=x;p.y=y;const r=p.matrixTransform(sv.getScreenCTM());return [r.x,r.y]}""",[x,y])
    pg.mouse.click(q[0],q[1]);pg.wait_for_timeout(250)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
    ctx=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
    pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
    E=pg.evaluate
    if pg.locator('#unlock').count():pg.locator('#unlock').click();pg.wait_for_timeout(200)
    E("()=>{S.unlocked=true;S.profile='Steven Test';S.hideFace=false;save();cur=null;sv='sheet';nav('score')}")
    pg.wait_for_timeout(300)
    pg.select_option('#rd','Vegas 300');pg.click('#st');pg.wait_for_timeout(500)
    # --- reproduction: bottom edge of Spot 3 on the last arrow of the end ---
    pg.click('[data-spot="3"]');pg.wait_for_timeout(200)
    pg.click('[data-k="X"]');pg.click('[data-k="10"]');pg.wait_for_timeout(200)
    box=pg.locator('#pface').bounding_box()
    pg.mouse.click(box['x']+box['width']/2, box['y']+box['height']-1);pg.wait_for_timeout(300)
    edge=E("()=>({a:cur.ends.flat().slice(),locked:[...document.querySelectorAll('[data-k]')].every(b=>b.disabled),end:document.querySelector('#endno').textContent})")
    print('bottom edge of Spot 3 recorded',edge)
    chk('bottom edge of Spot 3 is not stored as a miss that locks the end',edge['a']!=['X','10','M'] or not edge['locked'])
    # clear that arrow if one landed, so the advance check starts clean
    E("()=>{cur.ends=[[]];cur.pos=[[]];justDone=false;cur.spot=1;score()}")
    pg.wait_for_timeout(300)
    # spot centres on the Vegas triangle
    C=E("()=>spots3(face3R(faceR(ROUNDS[cur.round],0),cur))")
    for n,expect in ((1,2),(2,3)):
        pg.click(f'[data-spot="{n}"]');pg.wait_for_timeout(150)
        tap_svg(pg,C[n-1][0],C[n-1][1])
        st=E("()=>({spot:cur.spot||0,n:cur.ends.flat().length,end:document.querySelector('#endno').textContent})")
        chk(f'after the arrow on Spot {n}, the next spot opens',st['spot']==expect and st['n']==n and st['end']=='End 1 of 10',st)
    pg.click('[data-spot="3"]');pg.wait_for_timeout(150)
    tap_svg(pg,C[2][0],C[2][1])
    st=E("()=>({spot:cur.spot||0,n:cur.ends[0].length,end:document.querySelector('#endno').textContent,next:document.querySelector('#enext')&&!document.querySelector('#enext').disabled,ends:cur.ends.length})")
    chk('after the last spot the end stays and Next is the way on',st['n']==3 and st['spot']==3 and st['end']=='End 1 of 10' and st['next'] and st['ends']==1,st)
    pg.click('#enext');pg.wait_for_timeout(250);pg.click('#addsc');pg.wait_for_timeout(300)
    chk('Next then Add Scores opens End 2 on Spot 1',E("document.querySelector('#endno').textContent")=='End 2 of 10' and (E("cur.spot||0") in (0,1)))
    # last end of the round: do not open an 11th end
    E("""()=>{cur.ends=Array.from({length:9},()=>['X','X','X']);cur.pos=cur.ends.map(()=>[null,null,null]);cur.ends.push([]);cur.pos.push([]);cur.spot=1;justDone=false;sv='entry';score()}""")
    pg.wait_for_timeout(300)
    C=E("()=>spots3(face3R(faceR(ROUNDS[cur.round],0),cur))")
    for n in (1,2,3):
        pg.click(f'[data-spot="{n}"]');pg.wait_for_timeout(120)
        tap_svg(pg,C[n-1][0],C[n-1][1])
    last=E("()=>({end:document.querySelector('#endno').textContent,n:cur.ends.length,full:cur.ends[9].length,next:!!(document.querySelector('#enext')&&!document.querySelector('#enext').disabled)})")
    chk('after the last target of the round, stay on End 10 and wait for Next',last['end']=='End 10 of 10' and last['n']==10 and last['full']==3 and last['next'],last)
    # single face: plotting the face's arrows opens the next end; the last end waits
    E("()=>{cur=null;sv='sheet';nav('score')}");pg.wait_for_timeout(300)
    pg.select_option('#rd','Indoor WA 18m');pg.wait_for_timeout(200)
    pg.click('#f3row [data-f1=single]');pg.click('#st');pg.wait_for_timeout(500)
    for _ in range(3):tap_svg(pg,0,0)
    one=E("()=>({end:document.querySelector('#endno').textContent,a:(cur.ends[0]||[]).length,box:document.querySelector('.ad-right .ad-num b').textContent})")
    chk('single face: after its arrows are plotted the next end is open',one['a']==3 and one['end']=='End 2 of 20' and one['box']=='0',one)
    E("""()=>{cur.ends=Array.from({length:19},()=>['X','X','X']);cur.pos=cur.ends.map(()=>[null,null,null]);cur.ends.push([]);cur.pos.push([]);justDone=false;sv='entry';cur.spot=0;score()}""")
    pg.wait_for_timeout(300)
    for _ in range(3):tap_svg(pg,0,0)
    fin=E("()=>({end:document.querySelector('#endno')&&document.querySelector('#endno').textContent,n:cur.ends.length,next:!!(document.querySelector('#enext')&&!document.querySelector('#enext').disabled)})")
    chk('single face: the last end waits for Next',fin['end']=='End 20 of 20' and fin['n']==20 and fin['next'],fin)
    # field: each face is a target
    E("()=>{cur=null;sv='sheet';nav('score')}");pg.wait_for_timeout(250)
    pg.select_option('#rd','WA Field 24 Marked');pg.click('#st');pg.wait_for_timeout(400)
    for _ in range(3):tap_svg(pg,0,0)
    fld=E("()=>({end:document.querySelector('#endno').textContent,a:(cur.ends[0]||[]).length})")
    chk('field: plotting the target opens the next target',fld['a']==3 and fld['end']=='End 2 of 24',fld)
    E("""()=>{cur.ends=Array.from({length:23},()=>['6','6','6']);cur.pos=cur.ends.map(()=>[null,null,null]);cur.ends.push([]);cur.pos.push([]);cur.ff=Array.from({length:24},(_,i)=>({p:cur.peg,f:80,d:50}));justDone=false;sv='entry';score()}""")
    pg.wait_for_timeout(300)
    for _ in range(3):tap_svg(pg,0,0)
    fld2=E("()=>({end:document.querySelector('#endno').textContent,n:cur.ends.length,next:!!(document.querySelector('#enext')&&!document.querySelector('#enext').disabled)})")
    chk('field: the last target waits for Next',fld2['end']=='End 24 of 24' and fld2['n']==24 and fld2['next'],fld2)
    chk('no page errors',not errs)
    b.close()
srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed')
if bad:print('FAILED',bad)
sys.exit(1 if bad else 0)
