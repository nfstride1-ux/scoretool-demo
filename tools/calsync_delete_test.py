# Deleting a ScoreTool session must remove it from Archery Calendar (calsync.js).
# Tester 'steven' on a fresh 390px phone; seeded TEST sessions only; Supabase RPCs are mocked. No live league data.
import subprocess, sys, time, os, json, re
from playwright.sync_api import sync_playwright
import guard
import nm_seed
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SH = os.path.join(ROOT, 'shots-caldel')
OUT = '/workspace/ac-deleted-scores'
os.makedirs(SH, exist_ok=True)
os.makedirs(OUT, exist_ok=True)
PORT = '8799'
ok, bad = [], []
def chk(n, c):
    (ok if c else bad).append(n)
    print(('PASS ' if c else 'FAIL ') + n, flush=True)

srv = subprocess.Popen([sys.executable, '-m', 'http.server', PORT], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1)
TOK = 'a' * 48
SAVED, DELETED = [], []

def rpc(route):
    url = route.request.url
    body = json.loads(route.request.post_data or '{}')
    if 'scoretool_delete_score' in url:
        DELETED.append(body)
        route.fulfill(status=200, content_type='application/json', body='{"ok":true}')
        return
    if 'scoretool_save_score' in url:
        SAVED.append(body)
        route.fulfill(status=200, content_type='application/json', body='{"ok":true}')
        return
    if 'scoretool_unlink' in url:
        route.fulfill(status=200, content_type='application/json', body='null')
        return
    route.fulfill(status=200, content_type='application/json', body='null')

def seed_js():
    # two finished full rounds + one incomplete round marked finished (partial), all already sent
    return """()=>{
      S.unlocked=true;if(!S.profile)S.profile='Steven Test';
      const full=()=>[...Array(20)].map(()=>['10','9','8']);
      const part=()=>[...Array(5)].map(()=>['10','9','8']);
      S.sessions=(S.sessions||[]).filter(s=>!/^ds/.test(s.id));
      S.sessions.push({id:'ds1',date:'2026-11-05',round:'Indoor WA 18m',ends:full(),pos:[],src:'practice',finished:true});
      S.sessions.push({id:'ds2',date:'2026-11-12',round:'Indoor WA 18m',ends:part(),pos:[],src:'practice',finished:true});
      S.sessions.push({id:'ds3',date:'2026-11-20',round:'Indoor WA 18m',ends:full(),pos:[],src:'practice',finished:true});
      save();
      Object.keys(localStorage).filter(k=>k.startsWith('scoretool.cal.steven.')).forEach(k=>localStorage.removeItem(k));
      const sig=s=>JSON.stringify([s.date,s.round, (typeof total==='function'?total(s):0), null, null]);
      const sent={};
      S.sessions.filter(s=>/^ds/.test(s.id)).forEach(s=>{sent[s.id]=sig(s)});
      /* use the real sig() once calsync is loaded after reload — placeholder overwritten below */
      localStorage.setItem('scoretool.cal.steven.link', JSON.stringify('""" + TOK + """'));
      localStorage.setItem('scoretool.cal.steven.prompted','1');
      localStorage.setItem('scoretool.cal.steven.sent', JSON.stringify(sent));
      localStorage.setItem('scoretool.cal.steven.base', JSON.stringify(['ds1','ds2','ds3']));
    }"""

with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--headless=new'])
    ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
    ctx.add_init_script("""(()=>{
      let A=[];try{A=JSON.parse(localStorage.getItem('scoretool.archers')||'[]')||[]}catch(e){A=[]}
      if(!A.some(a=>a&&a.id==='steven')){A.push({id:'steven',name:'Steven Test',short:'Steven',bow:'Compound',founding:true});localStorage.setItem('scoretool.archers',JSON.stringify(A))}
      localStorage.setItem('scoretool.tester','steven');
    })()""")
    pg = ctx.new_page()
    errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
    pg.on('dialog', lambda d: d.accept())
    ctx.route('https://archerycalendars.com/data/events.json*', lambda r: r.fulfill(status=200, content_type='application/json', body='{"events":[]}', headers={'access-control-allow-origin':'*'}))
    ctx.route('https://sllsqpfqwckwtljzjxli.supabase.co/**', rpc)
    pg.goto(f'http://localhost:{PORT}/?tester=steven')
    pg.wait_for_timeout(1200)
    E = pg.evaluate
    E(seed_js())
    # Rewrite sent signatures with the real calsync sig() after functions exist
    E("""()=>{
      const sent={};
      S.sessions.filter(s=>/^ds/.test(s.id)).forEach(s=>{
        const label=(typeof roundOut==='function')?null:null;
        sent[s.id]=JSON.stringify([s.date, s.round, total(s), (typeof maxOf==='function'?null:null), null]);
      });
      /* After reload, calsync's sig() will be used; store a value we refresh then. */
    }""")
    pg.reload()
    pg.wait_for_timeout(2000)
    if pg.get_by_text('Demo unlock').count():
        pg.get_by_text('Demo unlock').first.click()
        pg.wait_for_timeout(400)
    who=E("()=>[typeof TESTER!=='undefined'&&TESTER&&TESTER.id, typeof window.calTick, typeof window.calDiscard, S&&S.unlocked]")
    print(' who/calTick/calDiscard/unlocked:', who)
    # Re-seed after reload (state is in localStorage) and fix sent to real sig()
    E("""()=>{
      S.unlocked=true;
      const full=()=>[...Array(20)].map(()=>['10','9','8']);
      const part=()=>[...Array(5)].map(()=>['10','9','8']);
      if(!S.sessions.some(s=>s.id==='ds1')){
        S.sessions.push({id:'ds1',date:'2026-11-05',round:'Indoor WA 18m',ends:full(),pos:[],src:'practice',finished:true});
        S.sessions.push({id:'ds2',date:'2026-11-12',round:'Indoor WA 18m',ends:part(),pos:[],src:'practice',finished:true});
        S.sessions.push({id:'ds3',date:'2026-11-20',round:'Indoor WA 18m',ends:full(),pos:[],src:'practice',finished:true});
        save();
      }
      const sent={};
      S.sessions.filter(s=>/^ds/.test(s.id)).forEach(s=>{
        const R=ROUNDS[s.round], fullR=typeof isFull==='function'&&isFull(s);
        const mx=(fullR && R && !R.aba)? (R.max||null):null;
        sent[s.id]=JSON.stringify([s.date, s.round, total(s), mx, null]);
      });
      localStorage.setItem('scoretool.cal.steven.link', JSON.stringify('""" + TOK + """'));
      localStorage.setItem('scoretool.cal.steven.prompted','1');
      localStorage.setItem('scoretool.cal.steven.sent', JSON.stringify(sent));
    }""")
    # Prefer the in-page sig if exposed; otherwise tick should not re-save if sig matches calsync's
    # Recompute with a hook: call todo by triggering tick after aligning sig via evaluating calsync internals is hard.
    # Instead, pull sig by sending and seeing; we set sent after a no-op: force-align using a small helper if present.
    # Align by reading calsync sig through a temporary send of identical payload: call window and parse from a probe.
    aligned = E("""()=>{
      const probe=document.createElement('script');
      // Recreate sig the same way as calsync: [date, roundOut, total, maxOf, locOf]
      // roundOut = withPb(tiedRound||s.round, sessionIsPb). No event tie, not PB.
      const sent={};
      S.sessions.filter(s=>/^ds/.test(s.id)).forEach(s=>{
        const label=s.round;
        const R=ROUNDS[s.round];
        const full=typeof isFull==='function'&&isFull(s);
        const mx=(!full)?null:(R && !R.aba && R.max>0 && R.max<=5000?R.max:null);
        sent[s.id]=JSON.stringify([s.date, label, total(s), mx, null]);
      });
      localStorage.setItem('scoretool.cal.steven.sent', JSON.stringify(sent));
      return sent;
    }""")
    SAVED.clear(); DELETED.clear()
    E("()=>typeof tick==='function'?0:0")  # tick is not on window
    # Trigger cleanup tick by removing ds2 from sessions WITHOUT calDiscard (already-deleted case)
    E("""()=>{
      S.sessions=S.sessions.filter(s=>s.id!=='ds2');
      save();
    }""")
    # Force a tick: calDiscard is the public hook; for already-deleted we wait for the 4s interval or call via a side door.
    # Expose: setTimeout path — wait up to 5s for interval, or invoke by toggling online event after a dummy calDiscard of a never-sent id? 
    # Better: call calDiscard on a fake id then the tick also sees stale ds2. Use a short wait after online event... tick is interval 4s and online listener.
    pg.evaluate("()=>window.calTick && calTick()")
    deadline = time.time() + 6
    while time.time() < deadline and not any(x.get('p_source_id')=='steven:ds2' for x in DELETED):
        pg.wait_for_timeout(200)
    chk('already-deleted incomplete session posts scoretool_delete_score for steven:ds2',
        any(x.get('p_source_id')=='steven:ds2' and x.get('p_token')==TOK for x in DELETED))
    chk('already-deleted path does not delete the other two sessions',
        not any(x.get('p_source_id') in ('steven:ds1','steven:ds3') for x in DELETED))
    sent_after = E("()=>JSON.parse(localStorage.getItem('scoretool.cal.steven.sent')||'{}')")
    chk('sent map drops ds2 and keeps ds1 and ds3', 'ds2' not in sent_after and 'ds1' in sent_after and 'ds3' in sent_after)
    chk('no re-save of the deleted incomplete session', not any(x.get('p_source_id')=='steven:ds2' for x in SAVED))

    # Restore the three sessions, mark sent again, then delete through dropScore (UI path)
    DELETED.clear(); SAVED.clear()
    E("""()=>{
      const part=()=>[...Array(5)].map(()=>['10','9','8']);
      if(!S.sessions.some(s=>s.id==='ds2')){
        S.sessions.push({id:'ds2',date:'2026-11-12',round:'Indoor WA 18m',ends:part(),pos:[],src:'practice',finished:true});
        save();
      }
      const sent=JSON.parse(localStorage.getItem('scoretool.cal.steven.sent')||'{}');
      const label='Indoor WA 18m';
      const s=S.sessions.find(x=>x.id==='ds2');
      sent.ds2=JSON.stringify([s.date,label,total(s),null,null]);
      localStorage.setItem('scoretool.cal.steven.sent', JSON.stringify(sent));
      const gone=JSON.parse(localStorage.getItem('scoretool.cal.steven.discarded')||'[]').filter(id=>id!=='ds2');
      localStorage.setItem('scoretool.cal.steven.discarded', JSON.stringify(gone));
    }""")
    # Open past sessions / score list if possible and screenshot before
    try:
        E("()=>{if(typeof nav==='function')nav('score')}")
        pg.wait_for_timeout(800)
        pg.screenshot(path=os.path.join(SH, '01-scoretool-before-delete.png'), full_page=True)
        pg.screenshot(path=os.path.join(OUT, '01-scoretool-before-delete.png'), full_page=True)
    except Exception as e:
        print('screenshot before:', e)
    dropped = E("()=>typeof dropScore==='function' && dropScore('ds2')")
    chk('dropScore removes the incomplete session after confirm', dropped is True)
    still = E("()=>S.sessions.some(s=>s.id==='ds2')")
    chk('ds2 is gone from S.sessions', still is False)
    discarded = E("()=>JSON.parse(localStorage.getItem('scoretool.cal.steven.discarded')||'[]')")
    chk('dropScore records ds2 in discarded', 'ds2' in discarded)
    deadline = time.time() + 6
    while time.time() < deadline and not any(x.get('p_source_id')=='steven:ds2' for x in DELETED):
        pg.wait_for_timeout(200)
    chk('dropScore triggers scoretool_delete_score for steven:ds2',
        any(x.get('p_source_id')=='steven:ds2' and x.get('p_token')==TOK for x in DELETED))
    sent2 = E("()=>JSON.parse(localStorage.getItem('scoretool.cal.steven.sent')||'{}')")
    chk('sent map drops ds2 after dropScore', 'ds2' not in sent2 and 'ds1' in sent2 and 'ds3' in sent2)
    try:
        E("()=>{if(typeof nav==='function')nav('score')}")
        pg.wait_for_timeout(600)
        pg.screenshot(path=os.path.join(SH, '02-scoretool-after-delete.png'), full_page=True)
        pg.screenshot(path=os.path.join(OUT, '02-scoretool-after-delete.png'), full_page=True)
    except Exception as e:
        print('screenshot after:', e)

    # Missing RPC should not wipe sent (retry later) and should not block later saves
    DELETED.clear(); SAVED.clear()
    E("""()=>{
      const sent=JSON.parse(localStorage.getItem('scoretool.cal.steven.sent')||'{}');
      sent.ds9=JSON.stringify(['2026-11-01','Indoor WA 18m',27,null,null]);
      localStorage.setItem('scoretool.cal.steven.sent', JSON.stringify(sent));
    }""")
    # Temporarily fulfill delete with 404
    ctx.unroute('https://sllsqpfqwckwtljzjxli.supabase.co/**')
    def rpc_off(route):
        url = route.request.url
        body = json.loads(route.request.post_data or '{}')
        if 'scoretool_delete_score' in url:
            DELETED.append(body)
            route.fulfill(status=404, content_type='application/json', body='{"code":"PGRST202","message":"Could not find the function"}')
            return
        if 'scoretool_save_score' in url:
            SAVED.append(body)
            route.fulfill(status=200, content_type='application/json', body='{"ok":true}')
            return
        route.fulfill(status=200, content_type='application/json', body='null')
    ctx.route('https://sllsqpfqwckwtljzjxli.supabase.co/**', rpc_off)
    pg.evaluate("()=>window.calTick && calTick()")
    deadline = time.time() + 6
    while time.time() < deadline and not any(x.get('p_source_id')=='steven:ds9' for x in DELETED):
        pg.wait_for_timeout(200)
    sent_off = E("()=>JSON.parse(localStorage.getItem('scoretool.cal.steven.sent')||'{}')")
    chk('if delete RPC is not live yet, ds9 stays in sent to retry', 'ds9' in sent_off)
    chk('page errors are only ignored noise', not [e for e in errs if 'favicon' not in e and 'net::' not in e and 'Failed to load resource' not in e])
    print(' errors:', errs[:5])
    b.close()
srv.terminate()
print(f'\n{len(ok)} passed, {len(bad)} failed')
sys.exit(1 if bad else 0)
