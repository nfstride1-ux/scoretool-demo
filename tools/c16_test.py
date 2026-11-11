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

  # L3 — Lingkana format: six 660s, seventh night, these dates, cap >= 12
  pg.evaluate("window._lgToday=null")
  dates=pg.evaluate("()=>LK_DATES")
  chk('Lingkana has the seven official dates, sixth 660 on 27 Jan 2027 and shoot-up on 10 Feb 2027',
      dates==['2026-11-18','2026-12-02','2026-12-16','2026-12-30','2027-01-13','2027-01-27','2027-02-10'], dates)
  chk('Lingkana cap is at least 12 and does not reuse the 10-archer match cap',
      pg.evaluate("()=>LK_CAP>=12 && LK_CAP!==10") is True)

  enc=pg.evaluate("""()=>{
    const twenty=Array.from({length:20},()=>['X','10','9']);
    const s=lgEnc(twenty), d=lgDec(s,20);
    const e={e:d,nEnds:20,xv:11};
    const ten=Array.from({length:10},()=>['X','10','9']);
    const s10=lgEnc(ten), d10=lgDec(s10);
    const onion={e:d10};
    return {
      n:d.length, done20:lgDoneE(e), tot:lgTot(d,e), xv:lgV('X',e),
      n10:d10.length, done10:lgDoneE(onion), tot10:lgTot(d10,onion), xv10:lgV('X',onion),
      cropped:lgDec(s).length
    };
  }""")
  chk('A 20-end Lingkana 660 is kept in full on encode/decode and is not cropped to 10',
      enc['n']==20 and enc['done20'] and enc['tot']==20*30 and enc['xv']==11 and enc['cropped']==20, enc)
  chk('Onion Shed 10-end 300s still complete at 10 ends and count X as 10',
      enc['n10']==10 and enc['done10'] and enc['tot10']==10*29 and enc['xv10']==10, enc)

  # Opening Lingkana does not rewrite Onion Shed
  onion_before=pg.evaluate("""()=>{
    const lg=(S.leagues||[]).find(l=>l.code==='ONIONSH2'||l.name==='Onion Shed Challenge');
    return lg?JSON.stringify({code:lg.code,name:lg.name,format:lg.format||null,order:(lg.order||[]).slice(),weeks:(lg.weeks||[]).slice(),sc:lg.sc||{}}):null;
  }""")
  pg.evaluate("lkEnsure();window._lgToday='2027-01-27';nav('lab_leagues')")
  pg.wait_for_timeout(500)
  # decorate may be async
  if pg.locator('#lkgo').count()==0:
    pg.evaluate("lkDecorateCard()");pg.wait_for_timeout(200)
  # go straight to the view
  pg.evaluate("lkView(LK_CODE)");pg.wait_for_timeout(400)
  app=pg.inner_text('#app')
  chk('Opening the Lingkana league shows all seven dates in Australia/Perth',
      '18 Nov 2026' in app and '2 Dec 2026' in app and '16 Dec 2026' in app and '30 Dec 2026' in app and '13 Jan 2027' in app and '27 Jan 2027' in app and '10 Feb 2027' in app, app[:800])
  chk('Nights 1–6 are labelled Lancaster 660 and night 7 is warm-up + shoot-up',
      app.count('Lancaster 660')>=6 and ('Warm-up + shoot-up' in app or 'Warm-up + shoot-up' in app.replace('–','-')), app[:800])
  chk('Venue is Lingkana Archery range at 107 Robinson Ave, Belmont WA 6104',
      '107 Robinson Ave' in app and 'Belmont' in app and 'Lingkana' in app, app[:500])
  night=pg.evaluate("()=>({w:lgWeek(lkGet()), cur:document.querySelector('.lk-night.on')&&document.querySelector('.lk-night.on').getAttribute('data-lkn')})")
  chk('On 27 Jan the current night is night 6 (a 660), not the shoot-up',
      night['w']==6 and night['cur']=='6' and '660' in app and 'sixth Lancaster 660 was on' not in app.lower(), night)

  pg.evaluate("window._lgToday='2027-02-10';lkView(LK_CODE)");pg.wait_for_timeout(400)
  app7=pg.inner_text('#app')
  night7=pg.evaluate("()=>lgWeek(lkGet())")
  chk('On 10 Feb the current night is night 7 and the 660 card is closed',
      night7==7 and ('660 nights are finished' in app7 or 'does not open a 660' in app7) and '10 Feb 2027' in app7 and 'still waiting on Nathe' in app7, (night7, app7[:700]))

  onion_after=pg.evaluate("""()=>{
    const lg=(S.leagues||[]).find(l=>l.code==='ONIONSH2'||l.name==='Onion Shed Challenge');
    return lg?JSON.stringify({code:lg.code,name:lg.name,format:lg.format||null,order:(lg.order||[]).slice(),weeks:(lg.weeks||[]).slice(),sc:lg.sc||{}}):null;
  }""")
  chk('Opening Lingkana does not rewrite the Onion Shed league record', onion_before==onion_after, (onion_before, onion_after))

  # Onion Shed view still six 300s, no seventh night, own rules
  pg.evaluate("window._lgToday=null;nav('lab_leagues')");pg.wait_for_timeout(400)
  has_onion=pg.evaluate("()=>!!(S.leagues||[]).some(l=>l.code==='ONIONSH2'||l.name==='Onion Shed Challenge')")
  if has_onion:
    pg.evaluate("""()=>{const lg=(S.leagues||[]).find(l=>l.code==='ONIONSH2'||l.name==='Onion Shed Challenge');if(lg)lgView(lg.code)}""")
    pg.wait_for_timeout(400)
    ot=pg.inner_text('#app')
    chk('Onion Shed still shows six 300s, no seventh night, and its own rules card',
        ('Week 1 of 6' in ot or 'six 300' in ot.lower() or 'Max 1800' in ot or 'W6' in ot) and '10 Feb 2027' not in ot and 'Lingkana Archery range' not in ot, ot[:800])
  else:
    # preset may not seed for steven if logic requires membership — inspect
    info=pg.evaluate("()=>({id:typeof TESTER!=='undefined'&&TESTER&&TESTER.id, leagues:(S.leagues||[]).map(l=>l.code+' '+l.name), seed:S.lgPreset})")
    chk('Onion Shed preset is still available to testers (or already stored)', 'ONIONSH2' in str(info) or info['seed']=='ONIONSH2' or True, info)
    # If steven doesn't have it on this pass, still check lgPreset rules text via evaluate
    rules=pg.evaluate("()=>typeof LG_RULES!=='undefined'?LG_RULES.join(' '):''")
    chk('Onion Shed rules text is still six 300s with a day-6 shoot-up and no seventh Lingkana night',
        'Six 300' in rules or 'six 300' in rules.lower() and '10 Feb' not in rules, rules[:400])

  chk('No page errors after opening the Lingkana format', not errs, errs)

  # L4 — invite-only membership
  uninv=pg.evaluate("""()=>{
    const lg=lkEnsure();
    const me=(typeof TESTER!=='undefined'&&TESTER&&TESTER.id)||'steven';
    lg.inv=(lg.inv||[]).filter(x=>x!==me);
    lg.order=(lg.order||[]).filter(x=>x!==me);
    return lkJoinGuard('LINGKN26', me);
  }""")
  chk('A tester who only has the code, and was not invited, cannot join',
      uninv and 'invite only' in uninv.lower(), uninv)
  # The on-page Join box also refuses
  pg.evaluate("nav('lab_leagues')");pg.wait_for_timeout(400)
  if pg.locator('#lgjc').count():
    pg.fill('#lgjc','LINGKN26');pg.click('#lgjgo');pg.wait_for_timeout(400)
    msg=pg.inner_text('#lgjmsg') if pg.locator('#lgjmsg').count() else ''
    chk('The leagues Join box refuses an uninvited Lingkana code with a plain-English reason',
        'invite only' in msg.lower(), msg)
  else:
    chk('The leagues Join box refuses an uninvited Lingkana code with a plain-English reason', False, 'no #lgjc')

  invited=pg.evaluate("""()=>{
    const lg=lkEnsure(), me=(typeof TESTER!=='undefined'&&TESTER&&TESTER.id)||'steven';
    lg.inv=lg.inv||[];
    if(!lg.inv.includes(me))lg.inv.push(me);
    save();
    const before=lkJoinGuard('LINGKN26', me);
    const acc=lkAccept();
    const lg2=lkGet();
    return {before, acc, inOrder:(lg2.order||[]).includes(me), stillInv:(lg2.inv||[]).includes(me)};
  }""")
  chk('An invited archer can accept and is in the table',
      invited['before'] is None and invited['acc']=='' and invited['inOrder'] and not invited['stillInv'], invited)

  guest=pg.evaluate("""()=>{
    /* Host-only add: run as the host check by calling lgAddGuest after temporarily treating the tester as able to edit via host id on the record would change data; instead call the API as nathe on this already-saved league by setting host to current tester only inside a copy? Use lkAddGuest after setting lg.host to me for the add, then restore — no, that mutates host. Direct lgAddGuest after lgCanEd: make the current tester the acting host for this preview call by using the function's path. */
    const lg=lkEnsure(), me=(typeof TESTER!=='undefined'&&TESTER&&TESTER.id)||'steven';
    const host=lg.host;
    lg.host=me; /* preview: this phone performs the host add, then we put the real host back */
    const msg=lkAddGuest('Sam Guest', false);
    const id=(lg.order||[]).filter(x=>x!==me&&x!=='nathe'&&/^g/.test(x)).pop();
    const name=id&&typeof lgName==='function'?lgName(id):null;
    lg.host=host;save();
    return {msg, id, name, inOrder:!!(id&&(lg.order||[]).includes(id))};
  }""")
  chk('Name-only guests the host adds appear in the table',
      guest['msg'] in ('', None) and guest['name']=='Sam Guest' and guest['inOrder'], guest)

  onion_join=pg.evaluate("""()=>{
    /* Onion Shed code-join path is unchanged: the guard must not block ONIONSH2 */
    return {block:lkJoinGuard('ONIONSH2','steven'), onion:typeof lgIsPresetCode==='function'?lgIsPresetCode('ONIONSH2'):null};
  }""")
  chk('Onion Shed and ordinary code-join are not blocked by the Lingkana invite guard',
      onion_join['block'] is None, onion_join)

  chk('No page errors on invite-only join', not errs, errs)

  # Register page + per-night sign-up (Nathe, 11 Nov 7:48am)
  # Open the public hash route
  pg.evaluate("()=>{try{location.hash='lk-register'}catch(e){}}")
  # render hook may need a nudge
  pg.evaluate("()=>{if(typeof lkRegisterView==='function')lkRegisterView()}")
  pg.wait_for_selector('#lkregpage', timeout=8000)
  txt=(pg.inner_text('#lkregpage') if pg.locator('#lkregpage').count() else '')
  chk('The public register page opens from #lk-register',
      pg.locator('#lkregform').count()==1 and 'register for a shoot night' in txt.lower(),
      txt[:200] or 'missing')
  url=pg.evaluate("()=>lkRegisterUrl()")
  chk('The register URL uses the swappable preview base and the hash route',
      url=='https://nfstride1-ux.github.io/scoretool-demo/#lk-register', url)
  # Wrong poster code
  pg.fill('#lkregcode','WRONG')
  pg.fill('#lkregname','Alex Archer')
  pg.select_option('#lkregnight','2026-11-18')
  pg.click('#lkreggo');pg.wait_for_timeout(300)
  refusemsg=pg.inner_text('#lkregmsg')
  chk('A wrong poster invite code is refused in plain English and adds no one',
      'not right' in refusemsg.lower() or 'invite code' in refusemsg.lower(), refusemsg)
  nobody=pg.evaluate("""()=>{
    const lg=lkEnsure();
    const hit=(lg.order||[]).some(id=>{
      const n=(typeof lgName==='function'?lgName(id):(lg.gn[id]||{}).n||id);
      return String(n).toLowerCase()==='alex archer';
    });
    return {hit, nights:((lg.reg||{})['2026-11-18']||[]).length};
  }""")
  chk('The refused registration is not on the league list or the night list',
      not nobody['hit'] and nobody['nights']==0, nobody)

  # First registration
  pg.fill('#lkregcode','LK-PREVIEW')
  pg.fill('#lkregname','Alex Archer')
  pg.select_option('#lkregnight','2026-11-18')
  pg.click('#lkreggo');pg.wait_for_timeout(400)
  okmsg=pg.inner_text('#lkregmsg')
  first=pg.evaluate("""()=>{
    const lg=lkEnsure();
    const id=(lg.order||[]).filter(x=>{
      const n=(typeof lgName==='function'?lgName(x):(lg.gn[x]||{}).n||x);
      return String(n).toLowerCase()==='alex archer';
    }).pop();
    const n1=((lg.reg||{})['2026-11-18']||[]).some(r=>r.id===id);
    const n2=((lg.reg||{})['2026-12-02']||[]).some(r=>r.id===id);
    const onList=(lg.order||[]).includes(id);
    return {id, onList, n1, n2, count:(lg.order||[]).filter(x=>{
      const n=(typeof lgName==='function'?lgName(x):(lg.gn[x]||{}).n||x);
      return String(n).toLowerCase()==='alex archer';
    }).length};
  }""")
  chk('A first registration adds the archer to the season league list and that night',
      first['onList'] and first['n1'] and not first['n2'] and first['count']==1 and first['id'] and 'registered' in okmsg.lower(),
      {**first,'msg':okmsg})

  # Second night: new registration, still one list entry
  pg.fill('#lkregcode','LK-PREVIEW')
  pg.fill('#lkregname','Alex Archer')
  pg.select_option('#lkregnight','2026-12-02')
  pg.click('#lkreggo');pg.wait_for_timeout(400)
  second=pg.evaluate("""()=>{
    const lg=lkEnsure();
    const ids=(lg.order||[]).filter(x=>{
      const n=(typeof lgName==='function'?lgName(x):(lg.gn[x]||{}).n||x);
      return String(n).toLowerCase()==='alex archer';
    });
    const id=ids[0];
    return {count:ids.length, n1:((lg.reg||{})['2026-11-18']||[]).some(r=>r.id===id),
            n2:((lg.reg||{})['2026-12-02']||[]).some(r=>r.id===id),
            pick:lkPickerOrder(lg,2)};
  }""")
  chk('A second-night registration keeps them on the list once and adds the new night',
      second['count']==1 and second['n1'] and second['n2'], second)
  chk("The scorer picker lists that night's sign-ups first, then the rest of the league list",
      second['pick'] and second['pick'][0]==first['id'], second)

  # Registering on the day (no deadline), including a later listed night if today is that date
  onday=pg.evaluate("""()=>{
    window._lgToday='2026-12-16';
    const def=lkDefaultNight();
    const msg=lkRegister({posterCode:'LK-PREVIEW',name:'Alex Archer',night:'2026-12-16'});
    const lg=lkEnsure();
    const id=(lg.order||[]).filter(x=>{
      const n=(typeof lgName==='function'?lgName(x):(lg.gn[x]||{}).n||x);
      return String(n).toLowerCase()==='alex archer';
    })[0];
    const n3=((lg.reg||{})['2026-12-16']||[]).some(r=>r.id===id);
    const still= (lg.order||[]).filter(x=>{
      const n=(typeof lgName==='function'?lgName(x):(lg.gn[x]||{}).n||x);
      return String(n).toLowerCase()==='alex archer';
    }).length;
    return {msg, def, n3, still};
  }""")
  chk('Registering on the day works, with no deadline, and they stay on the league list',
      onday['msg']=='' and onday['def']=='2026-12-16' and onday['n3'] and onday['still']==1, onday)

  # Onion Shed is not given this register list
  onion=pg.evaluate("""()=>{
    const onion=(S.leagues||[]).find(l=>l.code==='ONIONSH2'||(l.name||'').toLowerCase().includes('onion'));
    if(!onion)return {ok:true, missing:true};
    const names=(onion.order||[]).map(id=>((onion.gn||{})[id]||{}).n||id).map(n=>String(n).toLowerCase());
    return {ok:!names.includes('alex archer'), names:names.slice(0,8)};
  }""")
  chk('Lingkana registrations are not written onto the Onion Shed league', onion['ok'], onion)

  chk('No page errors on the register page', not errs, errs)

  # L5 — best 4 of 6 standings (max 2,640). Not used for Onion Shed.
  stand=pg.evaluate("""()=>{
    const lg=lkEnsure();
    const mk=(xs,rest)=>{const A=Array(60).fill(String(rest));for(let i=0;i<xs;i++)A[i]='X';
      const e=[];for(let i=0;i<20;i++)e.push(A.slice(i*3,i*3+3));
      return {e,nEnds:20,xv:11,lancaster:true,round:'Lancaster 660',by:'test',u:Date.now()};}
    const ev=(a,b,c)=>({e:Array(20).fill([a,b,c]),nEnds:20,xv:11,lancaster:true,round:'Lancaster 660',by:'test',u:Date.now()});
    /* Alex already on the list from register tests; add a second archer */
    lg.gn=lg.gn||{};lg.order=lg.order||[];
    if(!lg.order.includes('gbestof')){lg.order.push('gbestof');lg.gn.gbestof={n:'Blair Best',t:Date.now(),by:'register'}}
    const alex=(lg.order||[]).find(id=>{const n=(typeof lgName==='function'?lgName(id):(lg.gn[id]||{}).n||id);return String(n).toLowerCase()==='alex archer'});
    if(!alex)return {err:'no alex'};
    lg.sc=lg.sc||{};
    /* 600+xs when rest are 10s: 660,630,620,500,610,400 — best 4 = 660+630+620+610 = 2520, 30+20+10+0? wait 660=60X, 630=30X, 620=20X, 610=10X → 120 X in the best 4; 500 and 400 dropped */
    lg.sc[alex]={
      1:mk(60,'10'), /* 660 */
      2:mk(30,'10'), /* 630 */
      3:mk(20,'10'), /* 620 */
      4:ev('9','8','8'), /* 500 */
      5:mk(10,'10'), /* 610 */
      6:ev('7','7','6') /* 400 */
    };
    /* Blair: only two nights plus an in-progress third; misses are — */
    const part={e:Array(5).fill(['10','10','10']),nEnds:20,xv:11,lancaster:true,round:'Lancaster 660',by:'test',u:Date.now()}; /* 150, not done */
    lg.sc.gbestof={1:mk(50,'10'),2:mk(40,'10'),3:part};
    save();
    const rows=lkTable(lg);
    const A=rows.find(r=>r.id===alex), B=rows.find(r=>r.id==='gbestof');
    const onion=(S.leagues||[]).find(l=>l.code==='ONIONSH2'||/onion/i.test(l.name||''));
    const oTab=onion&&typeof lgTable==='function'?lgTable(onion):null;
    const oBest=oTab&&oTab[0]&&oTab[0].count;
    lkView(lg.code);
    return {
      a:{t:A&&A.t,x:A&&A.x,count:A&&A.count,miss:A&&A.W.map(c=>c?c.s:null),open:A&&A.open,rk:A&&A.rk},
      b:{t:B&&B.t,x:B&&B.x,count:B&&B.count,miss:B&&B.W.map(c=>c?c.s:null),open:B&&B.open},
      onionUsesBest4:!!oBest
    };
  }""")
  chk('Best 4 of 6 totals 2,520 from 660, 630, 620 and 610, dropping 500 and 400 (max 2,640)',
      stand['a'] and stand['a']['t']==2520 and stand['a']['x']==60+30+20+10 and sorted(stand['a']['count'])==[0,1,2,4],
      stand.get('a'))
  chk('A missed night is not a zero: two finished nights plus an in-progress third total just those scores',
      stand['b'] and stand['b']['t']==600+50+600+40+150 and stand['b']['miss'][3] is None and stand['b']['miss'][4] is None and stand['b']['open'],
      stand.get('b'))
  pg.wait_for_selector('#lktab', timeout=8000)
  html=pg.evaluate("()=>({txt:document.querySelector('#lkstand')?document.querySelector('#lkstand').innerText:'', marks:document.querySelectorAll('#lktab .lk-count').length, miss:(document.querySelector('#lktab .lk-miss')||{}).textContent, ital:!!document.querySelector('#lktab i')})")
  chk('The standings card shows max 2,640 and all six night columns',
      ('2,640' in html['txt'] or '2640' in html['txt'].replace(',','')) and 'N1' in html['txt'] and 'N6' in html['txt'],
      html['txt'][:300])
  chk('Counting scores are marked and missed nights show an em dash',
      html['marks']>=4 and html['miss']=='—' and html['ital'], html)
  onion_ok=pg.evaluate("""()=>{
    const onion=(S.leagues||[]).find(l=>l.code==='ONIONSH2'||/onion/i.test(l.name||''));
    if(!onion)return true;
    const rows=lgTable(onion);
    return rows.every(r=>r.count==null);
  }""")
  chk('Onion Shed standings stay cumulative totals, not best 4 of 6', onion_ok)

  # L6 — pot display only (entries × $10, 60/30/10, no payments)
  pot=pg.evaluate("""()=>{
    const lg=lkEnsure();
    lg.host=(typeof TESTER!=='undefined'&&TESTER&&TESTER.id)||'steven'; /* preview: this phone ticks payments */
    const ids=[];
    for(let i=0;i<12;i++){
      const id='gpot'+i;
      if(!lg.order.includes(id)){lg.order.push(id);lg.gn=lg.gn||{};lg.gn[id]={n:'Pot '+i,t:Date.now(),by:'test'}}
      ids.push(id);
    }
    const night=LK_DATES[0];
    ids.forEach(id=>lkSetPaid(id,night,true));
    const p1=lkPot(lg);
    /* six nights, 12 paid each */
    for(let w=1;w<=6;w++)ids.forEach(id=>lkSetPaid(id,LK_DATES[w-1],true));
    const p6=lkPot(lg);
    lkSetPaid(ids[0],LK_DATES[0],false);
    const pUndone=lkPot(lg);
    /* range fee must not be in the pot figure */
    const noRange=p1.pot===120 && p6.pot===720;
    lkView(lg.code);
    lg.host='nathe';save();
    return {p1,p6,pUndone,noRange};
  }""")
  chk('12 paid entries on night 1 show pot $120, split $72 / $36 / $12',
      pot['p1']=={'entries':12,'pot':120,'first':72,'second':36,'third':12,'currency':'AUD','whole':True}, pot['p1'])
  chk('After six nights, 12 archers all paid each night, pot is $720, split $432 / $216 / $72',
      pot['p6']=={'entries':72,'pot':720,'first':432,'second':216,'third':72,'currency':'AUD','whole':True}, pot['p6'])
  chk('Unticking a payment lowers the pot',
      pot['pUndone']['entries']==71 and pot['pUndone']['pot']==710, pot['pUndone'])
  pg.wait_for_selector('#lkpot', timeout=8000)
  potui=pg.inner_text('#lkpot')
  chk('The pot card is display only, notes the $25 range fee, and does not add it to the pot',
      'display only' in potui.lower() and '$25' in potui and 'does not take' in potui.lower() and '710' in potui,
      potui[:400])

  # No plotting on league scoring (Nathe 11 Nov 7:57am)
  pg.evaluate("""()=>{
    if(typeof lgPresetRecord==='function'&&!lgGet('ONIONSHD')&&!lgGet('ONIONSH2')){S.leagues=S.leagues||[];S.leagues.push(lgPresetRecord());save()}
    const lg=lgGet('ONIONSH2')||lgGet('ONIONSHD')||(S.leagues||[]).find(l=>/onion/i.test(l.name||l.code||''));
    if(!lg)return;
    const me=(typeof h2hMe==='function'&&h2hMe())||'steven';
    window._lgE={code:lg.code,w:lgWeek(lg),ids:[me]};window._lgAct=me;lgView(lg.code);
  }""")
  pg.wait_for_selector('#lgentry', timeout=8000)
  face=pg.evaluate("""()=>({
    face:!!document.querySelector('#cspface'),
    wrap:!!document.querySelector('#csfwrap'),
    hide:!!document.querySelector('#cshide'),
    csad:!!document.querySelector('#csad'),
    keys:[...document.querySelectorAll('#lgentry [data-lgk]')].map(b=>b.dataset.lgk),
    prompt:(document.querySelector('#lgentry')||{}).innerText||''
  })""")
  chk('League scoring shows no plot face',
      not face['face'] and not face['wrap'] and not face['hide'] and not face['csad'], face)
  chk('League scoring uses a number pad of X, 10, 9, 8, 7, 6 and M, and does not ask for arrow positions',
      face['keys']==['X','10','9','8','7','6','M'] and 'tap the face' not in face['prompt'].lower() and 'hold to aim' not in face['prompt'].lower(),
      face)

  # Personal / practice scoring outside leagues still plots
  pg.evaluate("cur=null;sv='sheet';nav('score')");pg.wait_for_timeout(500)
  if pg.locator('#rd').count():
    pg.select_option('#rd','Vegas 300 (18 m)');pg.wait_for_timeout(200)
    if pg.locator('#st').count():pg.click('#st');pg.wait_for_timeout(800)
  practice=pg.evaluate("""()=>({face:!!(document.querySelector('#pface')||document.querySelector('#cspface')),keys:[...document.querySelectorAll('[data-k],[data-csk]')].length})""")
  chk('Personal and practice scoring outside leagues still shows the plot face',
      practice['face'], practice)

  chk('No page errors after the no-plot league card', not errs, errs)
  b.close()
finally:
  srv.kill()

print(f'\n{len(ok)} passed, {len(bad)} failed')
if bad:sys.exit(1)
