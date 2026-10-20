# Every tester's own real Archer's Diary data (data/sheets_<id>.json from scores.db): totals match the source, only the main bow
# feeds stats, other bows excluded (kept in file), juniors see no tips/causes and no other juniors' names, empty profiles stay empty,
# and the testers don't leak into each other. Chrome 390x844.
import subprocess,sys,time,os,re,json
from playwright.sync_api import sync_playwright
import nm_seed
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
srv=subprocess.Popen([sys.executable,'-m','http.server','8774'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
TJ=open(os.path.join(ROOT,'testers.js')).read()
# source counts straight from scores.db (results since 2024 with a score, by division), read on Nathe's PC 18 Oct 2026
DB=json.load(open(os.path.join(ROOT,'tools','testers_source.json')))
LOADED=[t for t in DB if DB[t]['loaded']]
def src(tid):
  j=json.load(open(os.path.join(ROOT,'data',f'sheets_{tid}.json')));S=[x for x in j['sheets'] if x['sc']>0]
  main=[x for x in S if x['div']=='Compound'];other={}
  for x in S:
    if x['div']!='Compound':other[x['div']]=other.get(x['div'],0)+1
  return j,S,main,other
try:
 with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
  errs=[];extra={}
  def open_as(tid):
    ctx=b.new_context(viewport={'width':390,'height':844});pg=ctx.new_page()
    pg.on('pageerror',lambda e:errs.append(f'{tid}: {e}'));pg.on('console',lambda m:m.type=='error' and errs.append(f'{tid}: {m.text}'))
    pg.goto(f'http://localhost:8774/?tester={tid}');pg.wait_for_timeout(2500)
    for _ in range(3):
      if pg.locator('nav [data-v=score]').is_visible():break
      pg.locator('#app button').first.click();pg.wait_for_timeout(500)
    pg.wait_for_timeout(800);return ctx,pg
  # picker lists every tester, Nate Evans / Danie Oosthuizen left out
  ctx=b.new_context(viewport={'width':390,'height':844});pg=ctx.new_page();pg.goto('http://localhost:8774/');pg.wait_for_timeout(1200)
  names=pg.locator('[data-tester]').all_inner_texts()
  chk('picker lists all 10 testers by real name, then Darnie',names==['Nathaniel Stride','Phill Arthur','Logan Wolfe','Steven Snook','Joseph Snook','Michael Choong','Dana Chapman-Bureny','Tahuri Burney','Estiaan Cronje','Nate Evans','Darnie'])
  chk('Nate Evans is a tester (confirmed 18 Oct), Danie Oosthuizen is not',"id:'nate',name:'Nate Evans'" in TJ and 'Oosthuizen' not in TJ)
  CP=open(os.path.join(ROOT,'c-7q4m9x2k','index.html'),encoding='utf-8').read()
  chk('Phil coach group page unchanged: Nate still left out there','Choong' in CP and not re.search(r'nate evans|20536',CP,re.I))
  ctx.close()
  for tid in LOADED:
    j,S,main,other=src(tid);d=DB[tid];ctx,pg=open_as(tid);E=pg.evaluate
    chk(f'{tid}: file matches scores.db count',len(S)==d['n'] and sum(x['sc'] for x in S)==d['sum'])
    chk(f'{tid}: file matches scores.db per bow',{k:v for k,v in d['by_div'].items()}=={**({'Compound':len(main)} if main else {}),**other})
    chk(f'{tid}: right archer (club, member)',j['archer']==d['ad'] and max(set(x['club'] for x in S),key=[x['club'] for x in S].count)==d['club'] and E('S.profile')==d['name'])
    R=E('findReal(S.profile).map(r=>[normDate(r.date),r.score,r.division,!!r.sheet])')
    from collections import Counter
    RS=[(r[0],r[1]) for r in R if r[3]];RC=[r for r in R if not r[3]]
    chk(f'{tid}: only the main bow feeds stats',all(re.search(r'(Male|Female) Compound$',r[2]) for r in R))
    chk(f'{tid}: other bows excluded, not deleted',(E('window._excluded') or {})=={k:v for k,v in other.items()} or all((E('window._excluded') or {}).get(k)==v for k,v in other.items()))
    chk(f'{tid}: every main-bow sheet loaded, totals match source',Counter(RS)==Counter((x['d'],x['sc']) for x in main) and sum(r[1] for r in RS)==sum(x['sc'] for x in main))
    chk(f'{tid}: extra results only from the published csv',all(r[2].endswith('Compound') for r in RC))
    extra[tid]=len(RC)
    SH=E('statShoots().map(s=>({d:s.date,sc:s.score,n:s.ends.length,t:s.ends.reduce((a,e)=>a+endSum(e),0),inc:s.inc,r:s.round}))')
    chk(f'{tid}: stat shoots = official main-bow shoots',len(SH)==len(R))
    chk(f'{tid}: end-by-end adds up to every score',all(s['t']==s['sc'] for s in SH if s['n']))
    chk(f'{tid}: end-by-end where the sheet has it',sum(1 for s in SH if s['n'])==sum(1 for x in main if x['ok']))
    # PBs: complete rounds only, true best per round
    pbs=E("(()=>{const o={};statShoots().filter(s=>!s.inc).forEach(s=>{if(!o[s.round]||s.score>o[s.round])o[s.round]=s.score});return o})()")
    pg.click('nav [data-v=stats]');pg.wait_for_timeout(1200)
    chk(f'{tid}: Stats shows data',pg.locator('#srd').count()==1 and pg.locator('#c-last').count()==1)
    rd=pg.input_value('#srd');chk(f'{tid}: PB card = true best',pg.inner_text('#pbscore')==str(pbs[rd]))
    jun=E('!!(TESTER&&TESTER.junior)')
    chk(f'{tid}: junior flag matches class',jun==d['junior'])
    if jun:
      chk(f'{tid}: junior sees no tip',pg.locator('#tip').count()==0)
      E('S.statsMore=true;save()');pg.click('nav [data-v=home]');pg.wait_for_timeout(300);pg.click('nav [data-v=stats]');pg.wait_for_timeout(900)
      t=pg.inner_text('#app');chk(f'{tid}: junior: no causes in Stats',all(w not in t for w in ['Points slip','pays off','Cutting','finish stronger','start stronger','Weakest']))
    chk(f'{tid}: no Coach read (Nathe only)',pg.locator('#coachread').count()==0)
    pg.click('nav [data-v=rewards]');pg.wait_for_timeout(1500)
    chk(f'{tid}: real rankings on Ranks',pg.locator('#realrank').count()==1 and 'Where you stand' in pg.text_content('#realrank'))
    chk(f'{tid}: AA classification on Ranks',pg.locator('#c-class').count()==1)
    rr=pg.text_content('#realrank')
    if jun:
      ad=json.load(open(os.path.join(ROOT,'data',f'ad_{tid}.json')))
      chk(f'{tid}: junior ranks show no other names',ad['rank']=={} and pg.locator('#realrank table').count()==0 and 'Only your own scores' in rr)
    else:chk(f'{tid}: adult ranks table',pg.locator('#realrank table').count()==1 and 'you' in rr)
    chk(f'{tid}: his own data only',E('window._sheetsFor')==d['ad'])
    chk(f'{tid}: own storage key',E('KEY')=='scoretool.v1.'+tid)
    ctx.close()
  # empty profile (no confirmed match)
  for tid in [t for t in DB if not DB[t]['loaded']]:
    ctx,pg=open_as(tid);E=pg.evaluate
    chk(f'{tid}: empty profile',E('findReal(S.profile).length')==0 and E('statShoots().length')==0)
    pg.click('nav [data-v=stats]');pg.wait_for_timeout(900);chk(f'{tid}: Stats says no scores yet','No scores yet' in pg.text_content('#app'))
    pg.click('nav [data-v=rewards]');pg.wait_for_timeout(900);chk(f'{tid}: no real rankings',pg.locator('#realrank').count()==0)
    ctx.close()
  ctx,pg=open_as('dana');pg.evaluate("S.profile='Dana Matete';save()");pg.reload();pg.wait_for_timeout(2500)
  chk('dana: old saved name moves to his AD name and keeps his data',pg.evaluate('S.profile')=='Dana Chapman-Bureny' and pg.evaluate('findReal(S.profile).length')==205)
  ctx.close()
  # everyone else unchanged by adding Nate: same counts as scores.db
  chk('Nate has no data file yet (nothing invented)',not os.path.exists(os.path.join(ROOT,'data','sheets_nate.json')) and not os.path.exists(os.path.join(ROOT,'data','ad_nate.json')))
  # Nathe unaffected
  ctx,pg=open_as('nathe');E=pg.evaluate
  chk('Nathe: same exclusions as before',E("window._excluded.Recurve")==130 and E("window._excluded.Longbow")==5)
  chk('Nathe: his data only',E('findReal(S.profile).length')==206 and E("findReal('Steven Snook').length")==0)
  ctx.close()
  chk('no console errors',not errs)
  if errs:print(errs[:6])
  b.close()
finally:srv.kill()
print('csv-only extra results:',extra);print('testers checks: PASS',len(ok),'FAIL',len(bad));[print(' FAIL',x) for x in bad];sys.exit(1 if bad else 0)
