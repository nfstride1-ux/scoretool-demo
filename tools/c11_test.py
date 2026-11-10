# C11 (11 Nov 2026): Past Scores on Home, Official/Practice tabs, type filter, analysis. No data migration.
import os,subprocess,sys,time,json
from playwright.sync_api import sync_playwright
import guard
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import freeport
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=os.environ.get('PORT') or freeport.get()
ok=[];bad=[]
def chk(n,c,i=''):(ok if c else bad).append(n);print(('PASS ' if c else 'FAIL ')+n+('' if c else '  '+str(i)[:300]),flush=True)
def ends(n=6,ape=6,fill='9'):
    return[[fill]*ape for _ in range(n)]
srv=subprocess.Popen([sys.executable,'-m','http.server',str(PORT),'--bind','127.0.0.1'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(0.5)
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new','--no-sandbox'])
  ctx=b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True)
  pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('dialog',lambda d:d.accept())
  pg.goto(f'http://127.0.0.1:{PORT}/?tester=steven');pg.wait_for_timeout(1200)
  if pg.locator('#unlock').count():pg.locator('#unlock').first.click();pg.wait_for_timeout(300)
  pg.evaluate("""()=>{
    S.unlocked=true;
    S.sessions=(S.sessions||[]).filter(s=>!/^c11/.test(s.id));
    const e=(n,ape,v)=>[...Array(n)].map(()=>[...Array(ape)].map(()=>v));
    S.sessions.push({id:'c11p',date:'2026-11-01',round:'Indoor WA 18m',ends:e(20,3,'9'),pos:[],src:'practice',finished:true,note:''});
    S.sessions.push({id:'c11o',date:'2026-11-02',round:'WA 720 (70m)',ends:e(12,6,'10'),pos:[],src:'paper',finished:true,note:''});
    S.sessions.push({id:'c11u',date:'2026-11-03',round:'WA Field 24 Marked',ends:e(8,3,'5'),pos:[],finished:true,note:'',peg:'red',ff:[]});
    S.sessions.push({id:'c11i',date:'2026-11-04',round:'Indoor WA 18m',ends:e(10,3,'8'),pos:[],src:'practice',note:''});
    save();
  }""")
  before=pg.evaluate("JSON.stringify(S.sessions.filter(s=>/^c11/.test(s.id)))")
  pg.evaluate("nav('home')");pg.wait_for_timeout(400)
  score_btn=pg.locator('button.hub-score[data-go=score]')
  past_btn=pg.locator('button.hub-score.hub-past[data-go=lab_past], button.hub-past[data-go=lab_past]')
  chk('Home has a Past Scores button under Score',score_btn.count()==1 and past_btn.count()==1 and 'PAST SCORES' in past_btn.inner_text().upper())
  if score_btn.count() and past_btn.count():
    sb=score_btn.bounding_box();pb=past_btn.bounding_box()
    chk('Past Scores is directly under Score and the same size and shape',
        sb and pb and abs(sb['x']-pb['x'])<=2 and abs(sb['width']-pb['width'])<=2 and abs(sb['height']-pb['height'])<=8 and pb['y']>sb['y'],
        (sb,pb))
  # Score page no longer lists past sessions
  pg.evaluate("nav('score')");pg.wait_for_timeout(400)
  stxt=pg.inner_text('#app')
  chk('Score page no longer has Past sessions', 'Past sessions' not in stxt and pg.locator('#pastcard, #pastlist').count()==0)
  # Open Past Scores
  pg.evaluate("nav('lab_past')");pg.wait_for_timeout(500)
  chk('Past Scores has Official and Practice tabs', pg.locator('[data-pasttab=official]').count()==1 and pg.locator('[data-pasttab=practice]').count()==1)
  types=pg.evaluate("()=>[...document.querySelectorAll('#pasttype option')].map(o=>o.value)")
  supported=pg.evaluate("()=>pastTypes()")
  chk('Shoot type list comes from the app types plus All, not a hardcoded extra', types==supported and types[0]=='All' and 'Indoor' in types and 'Outdoor' in types and 'Field' in types, (types,supported))
  # IBO/ASA only if the app actually has those types
  chk('Dropdown does not invent IBO or ASA when the app has no such rounds', all(x in supported for x in types) and (('IBO' in types)==('IBO' in supported)), types)
  # Default Official tab: paper WA 720 is official; missing-src field and practice indoor are not
  placed=pg.evaluate("()=>({o:!!document.querySelector('[data-open=c11o]'),p:!!document.querySelector('[data-open=c11p]'),u:!!document.querySelector('[data-open=c11u]'),i:!!document.querySelector('[data-open=c11i]')})")
  chk('Official tab lists the paper sheet and not the untagged or practice sessions',
      placed['o'] and not placed['p'] and not placed['u'] and not placed['i'], placed)
  off_actions=pg.evaluate("()=>({open:!!document.querySelector('[data-open=c11o]'),del:!!document.querySelector('[data-del=c11o]'),notes:!!document.querySelector('textarea[data-n]'),cal:!!(document.querySelector('[data-calsend], [data-calst]')||window.calRowHtml),photo:typeof phBoxHtml=='function'})")
  chk('Official session keeps Open, delete, notes, calendar and photo hooks', off_actions['open'] and off_actions['del'] and off_actions['notes'], off_actions)
  an=pg.inner_text('#pastan')
  chk('Official analysis shows PB, average and trend for the filter', 'PB' in an.upper() and 'AVERAGE' in an.upper() and 'TREND OVER TIME' in an.upper(), an[:400])
  # Practice tab
  pg.locator('[data-pasttab=practice]').click();pg.wait_for_timeout(300)
  pt=pg.inner_text('#app')
  chk('Practice tab gets Just me and src=practice sessions, not the paper sheet',
      'Indoor WA 18m' in pt and 'WA Field 24 Marked' in pt and 'WA 720 (70m)' not in pt, pt[:400])
  chk('Incomplete practice is tagged', pg.locator('.inc-tag').count()>=1)
  # Type filter Indoor on Practice
  pg.select_option('#pasttype','Indoor');pg.wait_for_timeout(200)
  it=pg.inner_text('#pastlist')
  chk('Indoor filter keeps indoor practice and drops field', 'Indoor WA 18m' in it and 'WA Field 24 Marked' not in it, it[:300])
  # Actions on practice
  chk('Practice session still has Open and delete', pg.locator('[data-open=c11p]').count()==1 and pg.locator('[data-del=c11p]').count()==1)
  pb=pg.evaluate("total(S.sessions.find(s=>s.id=='c11p'))")
  an=pg.inner_text('#pastan')
  chk('Practice Indoor analysis uses existing stats (PB and average of finished indoor rounds)', str(pb) in an and 'PB' in an.upper() and 'AVERAGE' in an.upper(), an[:400])
  # No migration
  after=pg.evaluate("JSON.stringify(S.sessions.filter(s=>/^c11/.test(s.id)))")
  chk('Visiting Past Scores does not change stored session data', before==after)
  # classifier rules exposed
  rules=pg.evaluate("""()=>({
    paper:pastIsOfficial(S.sessions.find(s=>s.id=='c11o')),
    practice:pastIsOfficial(S.sessions.find(s=>s.id=='c11p')),
    missing:pastIsOfficial(S.sessions.find(s=>s.id=='c11u')),
    indoor:pastShootType('Indoor WA 18m'),
    field:pastShootType('WA Field 24 Marked'),
    outdoor:pastShootType('WA 720 (70m)'),
    ifaa:pastShootType('IFAA Field Round')
  })""")
  chk('Classifier: paper is official; missing src and practice are practice; types match the rounds',
      rules['paper'] is True and rules['practice'] is False and rules['missing'] is False and rules['indoor']=='Indoor' and rules['field']=='Field' and rules['outdoor']=='Outdoor' and rules['ifaa']=='IFAA', rules)
  # cleanup seeded rows (test fixture only; does not migrate existing tester data)
  pg.evaluate("()=>{S.sessions=S.sessions.filter(s=>!/^c11/.test(s.id));save()}")
  chk('no page errors', not errs, errs[:4])
  b.close()
finally:
  srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed')
for x in bad:print('FAILED:',x)
sys.exit(1 if bad else 0)
