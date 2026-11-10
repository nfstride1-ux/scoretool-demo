# C16 (11 Nov 2026): Lingkana indoor league, preview only.
# L1: official Lancaster 660, X = 11 on this round only. Onion Shed / Vegas / Indoor WA unchanged.
import os,sys,time,json,subprocess
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=os.environ.get('PORT') or freeport.get()
ok=[];bad=[]
def chk(n,c,i=''):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n+('' if c else '  '+str(i)[:400]),flush=True)

LG660='Lancaster 660'
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.5)
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
  ctx=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
  pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
  pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
  if pg.locator('#unlock').count():pg.locator('#unlock').first.click();pg.wait_for_timeout(300)
  pg.evaluate("S.unlocked=true;save()")

  card=pg.evaluate("""()=>{
    const R=ROUNDS['Lancaster 660'], wa=ROUNDS['Indoor WA 18m'], vg=ROUNDS['Vegas 300 (18 m)'], vgs=ROUNDS['Vegas 300'];
    return {
      R:R?{ends:R.ends,ape:R.ape,max:R.max,xv:R.xv,lancaster:!!R.lancaster,face:R.face,dist:R.blocks&&R.blocks[0]&&R.blocks[0].dist,unit:R.blocks&&R.blocks[0]&&R.blocks[0].unit}:null,
      wa:wa?{ends:wa.ends,max:wa.max}:null,
      vg:vg?{ends:vg.ends,max:vg.max,league:!!vg.league,vegas:!!vg.vegas}:null,
      vgs:vgs?{ends:vgs.ends,max:vgs.max}:null
    };
  }""")
  chk('Lancaster 660 is 20 ends of 3 at 18 m, max 660, xv 11',
      card['R']=={'ends':20,'ape':3,'max':660,'xv':11,'lancaster':True,'face':'40cm','dist':18,'unit':'m'}, card.get('R'))
  chk('Indoor WA 18m still has 20 ends and max 600', card['wa']=={'ends':20,'max':600}, card.get('wa'))
  chk('Vegas 300 (18 m) still has 10 ends, max 300, and remains the Onion Shed league round',
      card['vg']=={'ends':10,'max':300,'league':True,'vegas':True}, card.get('vg'))
  chk('Vegas 300 still has max 300', card['vgs']=={'ends':10,'max':300}, card.get('vgs'))

  scores=pg.evaluate("""()=>{
    const mk=(rd,fill)=>{
      const R=ROUNDS[rd], ends=Array.from({length:R.ends},()=>[...fill]);
      const s={round:rd,ends};
      return {total:total(s), xs:ends.flat().filter(a=>a==='X').length, tens:ends.flat().filter(a=>a==='10').length, xVal:val('X',s), tensVal:val('10',s)};
    };
    const mix={round:'Lancaster 660',ends:[['X','10','9']]};
    return {
      perfect:mk('Lancaster 660',['X','X','X']),
      tens:mk('Lancaster 660',['10','10','10']),
      mix:{total:total(mix), end:endSum(mix.ends[0],mix)},
      waX:mk('Indoor WA 18m',['X','X','X']),
      vgX:mk('Vegas 300 (18 m)',['X','X','X']),
      vg300X:mk('Vegas 300',['X','X','X'])
    };
  }""")
  chk('A perfect 20-end card of X, X, X totals 660, with 60 Xs, not 600',
      scores['perfect']['total']==660 and scores['perfect']['xs']==60 and scores['perfect']['xVal']==11, scores['perfect'])
  chk('20 ends of 10, 10, 10 total 600, with 0 Xs',
      scores['tens']['total']==600 and scores['tens']['xs']==0, scores['tens'])
  chk('A mixed end X, 10, 9 totals 30 (11 + 10 + 9)',
      scores['mix']['end']==30 and scores['mix']['total']==30, scores['mix'])
  chk('Indoor WA 18m still counts X as 10 (perfect card 600)',
      scores['waX']['xVal']==10 and scores['waX']['total']==600, scores['waX'])
  chk('Vegas 300 (18 m) still counts X as 10 (perfect card 300)',
      scores['vgX']['xVal']==10 and scores['vgX']['total']==300, scores['vgX'])
  chk('Vegas 300 still counts X as 10 (perfect card 300)',
      scores['vg300X']['xVal']==10 and scores['vg300X']['total']==300, scores['vg300X'])

  # Existing tester sessions are not rewritten by opening the 660
  before=pg.evaluate("()=>JSON.stringify((S.sessions||[]).map(s=>({id:s.id,round:s.round,t:typeof total==='function'?total(s):null,ends:(s.ends||[]).length})))")
  pg.evaluate("cur=null;sv='sheet';nav('score')");pg.wait_for_timeout(500)
  pg.select_option('#rdcat','Indoor');pg.wait_for_timeout(200)
  names=pg.evaluate("()=>[...document.querySelectorAll('#wrdlist [data-wrd] b')].map(e=>e.textContent)")
  opts=pg.evaluate("()=>[...document.querySelectorAll('#rd option')].map(o=>o.value)")
  chk('Lancaster 660 appears under Indoor in the practice picker',
      'Lancaster 660' in names and 'Lancaster 660' in opts, (names[:8], 'Lancaster 660' in opts))
  # label mentions 660
  lab=pg.evaluate("""()=>{
    const b=[...document.querySelectorAll('#wrdlist [data-wrd]')].find(x=>x.getAttribute('data-wrd')==='Lancaster 660');
    return b?b.innerText:null;
  }""")
  chk('The Indoor picker labels it as Lancaster, max 660',
      lab and 'Lancaster 660' in lab and '660' in lab, lab)
  pg.select_option('#rd','Lancaster 660');pg.wait_for_timeout(300)
  note=pg.evaluate("()=>(document.querySelector('#wrdcfg')||{}).innerText||''")
  chk('The 660 card cites the official Classic rules and does not invent a 12-dot',
      '4.1' in note and '11' in note and '12-dot' in note.lower() or '12 dot' in note.lower(), note[:400])
  pg.click('#st');pg.wait_for_timeout(700)
  keys=pg.evaluate("""()=>{
    const ks=[],seen=new Set();
    document.querySelectorAll('button').forEach(b=>{const t=b.textContent.trim();if(/^(X|12|11|10|9|8|7|6|5|4|3|2|1|M)$/.test(t)&&!seen.has(t)){seen.add(t);ks.push(t)}});
    return ks;
  }""")
  chk('Lancaster 660 keys are X, 10, 9, 8, 7, 6 and M (no 12, no 5–1)',
      keys==['X','10','9','8','7','6','M'], keys)
  # tap X and confirm the end shows 11
  pg.evaluate("""()=>{
    const b=[...document.querySelectorAll('button')].find(x=>x.textContent.trim()==='X');
    if(b)b.click();
  }""")
  pg.wait_for_timeout(250)
  live=pg.evaluate("()=>({end:endSum(cur.ends[0],cur),x:cur.ends[0]&&cur.ends[0][0],of:(document.getElementById('endno')||{}).textContent})")
  chk('Tapping X on a live 660 end scores 11, and the card is End 1 of 20',
      live['end']==11 and live['x']=='X' and live['of'] and '1' in live['of'] and '20' in live['of'], live)

  after=pg.evaluate("()=>JSON.stringify((S.sessions||[]).filter(s=>s.round!=='Lancaster 660').map(s=>({id:s.id,round:s.round,t:typeof total==='function'?total(s):null,ends:(s.ends||[]).length})))")
  # compare ids of pre-existing sessions (ignore the new 660 we just started)
  before_ids=json.loads(before)
  after_ids=json.loads(after)
  # same set of non-660 sessions, same totals
  chk('Opening and starting a 660 does not rewrite existing saved sessions',
      before_ids==after_ids, (len(before_ids), len(after_ids)))

  # Onion Shed helpers still treat X as 10
  onion=pg.evaluate("()=>({lgV:typeof lgV==='function'?lgV('X'):null, lgR:typeof LG_R!=='undefined'?LG_R:null, lgKeys:typeof LG_KEYS!=='undefined'?LG_KEYS:null})")
  chk('Onion Shed league still scores X as 10 on its 300',
      onion['lgV']==10 and onion['lgR']=='Vegas 300 (18 m)', onion)

  chk('No page errors on the Lancaster 660 card', not errs, errs)
  b.close()
finally:
  srv.kill()

print(f'\n{len(ok)} passed, {len(bad)} failed')
if bad:sys.exit(1)
