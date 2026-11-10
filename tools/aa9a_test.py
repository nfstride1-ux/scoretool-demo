# Schedule 9A (10 Nov 2026, Nathe): every Archery Australia target round in the January 2017 table
# can be scored. Distances, arrow counts, faces and the maximum come from that table.
# + is the 122 cm face, * is the 80 cm face. Ends are 6. A round already in the app is not added again.
# 40/1440 is 36 at 40 m on 122 cm, 36 at 30 m on 122 cm and 36 at 30 m on 80 cm, then 36 at 20 m on 80 cm.
import os,subprocess,sys,time,json
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=os.environ.get('PORT') or freeport.get()
ok=[];bad=[]
def chk(n,c,i=''):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n+('' if c else '  '+str(i)[:400]),flush=True)
# id, aka, app key or None, arrows, max, list of (metres, arrows, face cm)
PDF=[
 ('WA 90/1440',[],'WA 90/1440 (90/70/50/30m)',144,1440,[(90,36,122),(70,36,122),(50,36,80),(30,36,80)]),
 ('WA 70/1440',[],'WA 70/1440 (70/60/50/30m)',144,1440,[(70,36,122),(60,36,122),(50,36,80),(30,36,80)]),
 ('WA 60/1440',['Fremantle Round'],'WA 60/1440 (60/50/40/30m)',144,1440,[(60,36,122),(50,36,122),(40,36,80),(30,36,80)]),
 ('50/1440',[],'AA 50/1440 (50/40/30/20m)',144,1440,[(50,36,122),(40,36,122),(30,36,80),(20,36,80)]),
 ('40/1440',[],None,144,1440,[(40,36,122),(30,36,122),(30,36,80),(20,36,80)]),
 ('Long Sydney',[],None,120,1200,[(90,30,122),(70,30,122),(60,30,122),(50,30,122)]),
 ('Sydney',[],None,120,1200,[(70,30,122),(60,30,122),(50,30,122),(40,30,122)]),
 ('Long Brisbane',[],None,120,1200,[(90,30,122),(70,30,122),(60,30,80),(50,30,80)]),
 ('Brisbane',[],None,120,1200,[(70,30,122),(60,30,122),(50,30,80),(40,30,80)]),
 ('Adelaide',[],None,120,1200,[(60,30,122),(50,30,122),(40,30,80),(30,30,80)]),
 ('Short Adelaide',[],None,120,1200,[(50,30,122),(40,30,122),(30,30,80),(20,30,80)]),
 ('Hobart',[],None,90,900,[(90,30,122),(70,30,122),(50,30,122)]),
 ('Perth',[],None,90,900,[(70,30,122),(60,30,122),(50,30,122)]),
 ('WA 60/900',['FITA 900','Canberra Round'],'WA 60/900 (60/50/40m)',90,900,[(60,30,122),(50,30,122),(40,30,122)]),
 ('Short Canberra',[],'Short Canberra (50/40/30m)',90,900,[(50,30,122),(40,30,122),(30,30,122)]),
 ('Junior Canberra',[],'Junior Canberra (40/30/20m)',90,900,[(40,30,122),(30,30,122),(20,30,122)]),
 ('Grange',[],None,90,900,[(60,90,122)]),
 ('Melbourne',[],None,90,900,[(50,90,122)]),
 ('Darwin',[],None,90,900,[(40,90,122)]),
 ('Geelong',[],None,90,900,[(30,90,122)]),
 ('Newcastle',[],None,90,900,[(20,90,122)]),
 ('Holt',[],None,90,900,[(50,90,80)]),
 ('Samford',[],None,90,900,[(40,90,80)]),
 ('Drake',[],None,90,900,[(30,90,80)]),
 ('Wollongong',[],None,72,720,[(90,36,122),(70,36,122)]),
 ('Townsville',[],None,72,720,[(70,36,122),(60,36,122)]),
 ('Launceston',[],None,72,720,[(50,36,80),(30,36,80)]),
 ('WA 70/720',[],'WA 720 (70m)',72,720,[(70,72,122)]),
 ('WA 60/720',[],'WA 720 (60m)',72,720,[(60,72,122)]),
 ('WA 50/720',[],'WA 50/720 (80 cm)',72,720,[(50,72,80)]),
 ('50/720',[],None,72,720,[(50,72,122)]),
 ('40/720',[],None,72,720,[(40,72,122)]),
 ('30/720',[],None,72,720,[(30,72,122)]),
]
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.4)
with sync_playwright() as p:
    b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
    pg=b.new_page(viewport={'width':390,'height':844});errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)))
    pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
    if pg.locator('#unlock').count():pg.locator('#unlock').click();pg.wait_for_timeout(200)
    cite=pg.evaluate('window.AA_CITE')
    chk('source line is the January 2017 schedule',cite=='Archery Australia Target Rounds, Schedule 9A, effective January 2017',cite)
    rows=pg.evaluate('AA_TARGET')
    chk('33 rounds, in table order',len(rows)==33 and [r['id'] for r in rows]==[x[0] for x in PDF], [r['id'] for r in rows])
    empty=[(r['id'],d[0]) for r in rows for d in r['dist'] if d[0] in (55,45,35,25)]
    chk('no arrows at 55, 45, 35 or 25 m',not empty,empty)
    for i,(rid,aka,app,arrows,mx,dist) in enumerate(PDF):
        r=rows[i];key=app or rid
        got=[tuple(d) for d in r['dist']]
        chk(f'{rid} table row',r['id']==rid and (r.get('aka') or [])==aka and r.get('app')==app and r['arrows']==arrows and r['max']==mx and got==dist and sum(d[1] for d in dist)==arrows and arrows*10==mx,(r.get('id'),got))
        live=pg.evaluate('k=>aaShape(k,ROUNDS[k])',key)
        parts=[(p['m'],p['n'],p['cm']) for p in live['parts']]
        chk(f'{rid} scores as {key}',pg.evaluate('k=>!!ROUNDS[k]&&ROUNDS[k].aa9a',key)==rid and live['arrows']==arrows and live['max']==mx and parts==dist and pg.evaluate('k=>ROUNDS[k].ape',key)==6,(live,parts))
        chk(f'{rid} ends are arrows divided by 6',all(pg.evaluate('([k,i])=>{const b=ROUNDS[k].blocks;return b?b[i].ends*ROUNDS[k].ape:ROUNDS[k].ends*ROUNDS[k].ape}',[key,j])==n for j,(_,n,_) in enumerate(dist)))
    pg.evaluate("()=>{S.unlocked=true;if(!S.profile)S.profile='Steven Test';save();cur=null;nav('score')}")
    pg.wait_for_timeout(400)
    if pg.locator('[data-cstp="solo"]').count():pg.locator('[data-cstp="solo"]').click();pg.wait_for_timeout(200)
    offered=pg.eval_on_selector_all('#rd option','o=>o.map(x=>x.value)')
    keys=[(row[2] or row[0]) for row in PDF]
    missing=[k for k in keys if k not in offered]
    chk('every schedule round is in the scorer',not missing,missing)
    dup=[k for k in keys if keys.count(k)>1]
    chk('no schedule round is listed twice',not dup,dup)
    label=pg.evaluate("()=>[...document.querySelectorAll('#rd option')].find(o=>o.value=='40/1440').textContent")
    chk('40/1440 shows 144 arrows',label=='40/1440 (144 arrows)',label)
    changed=pg.evaluate('AA_CHANGED')
    chk('existing rounds already matched, so none were overwritten',changed==[],changed)
    compound=pg.evaluate("()=>({face:ROUNDS['WA 720 (50m Compound)'].face,ends:ROUNDS['WA 720 (50m Compound)'].ends,aa:ROUNDS['WA 720 (50m Compound)'].aa9a||''})")
    chk('compound 50 m stays the 6-ring round',compound=={'face':'80cm 6-ring','ends':12,'aa':''},compound)
    pg.select_option('#rd','40/1440');pg.click('#st');pg.wait_for_timeout(400)
    face=pg.evaluate("()=>({d:document.getElementById('enddist').textContent,f:document.getElementById('facesize').textContent,keys:[...document.querySelectorAll('[data-k]')].map(b=>b.dataset.k)})")
    chk('40/1440 starts at 40 m on the full 122 cm face',face['d']=='40m' and '122' in face['f'] and '1' in face['keys'] and '5' in face['keys'],face)
    pg.evaluate("()=>{S.sessions=S.sessions.filter(s=>s!==cur);cur=null;save();nav('score')}");pg.wait_for_timeout(300)
    if pg.locator('[data-cstp="solo"]').count():pg.locator('[data-cstp="solo"]').click();pg.wait_for_timeout(200)
    pg.select_option('#rd','WA 50/720 (80 cm)');pg.click('#st');pg.wait_for_timeout(400)
    f2=pg.evaluate("()=>({d:document.getElementById('enddist').textContent,f:document.getElementById('facesize').textContent,keys:[...document.querySelectorAll('[data-k]')].map(b=>b.dataset.k)})")
    chk('WA 50/720 starts at 50 m on the full 80 cm face',f2['d']=='50m' and '80' in f2['f'] and '1' in f2['keys'],f2)
    chk('no page errors',not errs,errs[:3])
    b.close()
srv.terminate()
print('OK',len(ok));print('FAIL',bad)
sys.exit(1 if bad else 0)
