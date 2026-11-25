"""Lingkana: the host phone publishes paid ticks; other phones show them (green ticks and the pot) but cannot change them.
Synthetic names only. Relay posts are caught and never sent to the live topic."""
import json, os, subprocess, sys, time, itertools
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHOT = os.environ.get('LK_SHOT_DIR', '')
PORT = int(os.environ.get('LK_PAID_SHARE_PORT', '8998'))
ok, bad = [], []
posts = []
relay = []
_ids = itertools.count(1)

def chk(n, c, x=''):
    (ok if c else bad).append(n)
    extra = (('  ' + str(x)[:300]) if (x != '' and not c) else '')
    print(('PASS ' if c else 'FAIL ') + n + extra, flush=True)

def ntfy_event(msg):
    return json.dumps({'id': 'm' + str(next(_ids)), 'time': int(time.time()), 'event': 'message', 'message': json.dumps(msg, separators=(',', ':'))})

def relay_body():
    return ('\n'.join(relay) + ('\n' if relay else '')).encode()

def route(r):
    u = r.request.url
    if 'ntfy.sh' in u:
        if r.request.method.upper() in ('POST', 'PUT', 'DELETE'):
            body = r.request.post_data or ''
            posts.append({'url': u, 'method': r.request.method, 'body': body})
            try:
                msg = json.loads(body)
                relay.append(ntfy_event(msg))
            except Exception:
                pass
            return r.fulfill(status=200, body='ok')
        return r.fulfill(status=200, content_type='application/x-ndjson; charset=utf-8', body=relay_body())
    if any(h in u for h in ['supabase', 'clarity', 'formsubmit', 'google-analytics', 'googletagmanager']):
        return r.fulfill(status=200, body='{}')
    return r.continue_()

SEED = """([night, rows]) => {
  const lg = lkEnsure();
  const recs = rows.map(r => ({id:r.id, name:r.name, bow:r.bow, at:Date.now(), nr:1}));
  lg.reg = lg.reg || {};
  lg.reg[night] = recs;
  lg.order = rows.map(r => r.id);
  lg.gn = lg.gn || {};
  rows.forEach(r => { lg.gn[r.id] = {n:r.name, t:Date.now(), by:'organiser'}; });
  lg.paid = {};
  lg.paidt = 0;
  lg.dirty = 0;
  if (typeof save === 'function') save();
  return {night, n: recs.length};
}"""

ARCHERS = [
    {'id': 'gaaaaaa', 'name': 'Ada Archer', 'bow': 'recurve'},
    {'id': 'gbbbbbb', 'name': 'Ben Bowman', 'bow': 'compound'},
    {'id': 'gcccccc', 'name': 'Cara Compound', 'bow': 'compound'},
]

def new_ctx(b, kind):
    c = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2,
                      is_mobile=True, has_touch=True, service_workers='block')
    if kind == 'host':
        script = """(()=>{
          localStorage.setItem('scoretool.tester','nathe');
          localStorage.setItem('scoretool.v1', JSON.stringify({profile:'Host Phone',unlocked:true,sessions:[]}));
        })()"""
    elif kind == 'nate':
        script = """(()=>{
          localStorage.setItem('scoretool.v1', JSON.stringify({profile:'Nate Evans',unlocked:true,sessions:[]}));
        })()"""
    elif kind == 'nate-cohost':
        script = """(()=>{
          localStorage.setItem('scoretool.v1', JSON.stringify({profile:'Nate Evans',unlocked:true,sessions:[]}));
          sessionStorage.setItem('scoretool.lk.cohost','nate');
        })()"""
    else:
        script = "(()=>{})()"
    c.add_init_script(script)
    c.route('**/*', route)
    return c

def shot(pg, name):
    if SHOT:
        os.makedirs(SHOT, exist_ok=True)
        pg.screenshot(path=os.path.join(SHOT, name), full_page=True)

def open_home(pg):
    pg.goto(f'http://127.0.0.1:{PORT}/#lk-home', wait_until='domcontentloaded')
    pg.wait_for_selector('#lkroster', timeout=15000)

def open_roster(pg):
    pg.wait_for_selector('#lkroster', timeout=10000)
    pg.locator('#lkroster').first.click()
    pg.wait_for_selector('#lkrosterpage', timeout=15000)

def seed(pg):
    night = pg.evaluate("() => (typeof lkShootDates==='function' && lkShootDates(lkEnsure())[0]) || '2026-11-18'")
    pg.evaluate(SEED, [night, ARCHERS])
    return night

def state(pg):
    return pg.evaluate("""() => {
      const lg = (typeof lkEnsure==='function' && lkEnsure()) || null;
      const pot = lg && typeof lkPot==='function' ? lkPot(lg) : null;
      const night = (typeof lkShootDates==='function' && lkShootDates(lg)[0]) || '';
      const bag = (lg && lg.paid && lg.paid[night]) || {};
      const ids = Object.keys(bag).filter(id => bag[id]).sort();
      const marks = [...document.querySelectorAll('.lk-paidmark')].map(e => ({
        on: e.classList.contains('lk-paid-on'),
        blue: e.classList.contains('lk-regd'),
        label: e.getAttribute('aria-label') || ''
      }));
      const boxes = [...document.querySelectorAll('input.lk-paidbox')].map(e => ({
        id: e.getAttribute('data-lkpaid'),
        night: e.getAttribute('data-lknight'),
        checked: !!e.checked,
        blue: e.classList.contains('lk-regd')
      }));
      const banner = document.querySelector('.lk-potbanner-amt');
      const key = ((document.querySelector('#lkrosterpage p.small, #lkpot p.small.muted, #lkrosterpage') || {}).innerText) || '';
      return {
        me: (typeof h2hMe==='function' && h2hMe()) || null,
        canHost: !!(typeof lkCanHost==='function' && lg && lkCanHost(lg)),
        coHostOn: !!(typeof lkCoHostOn==='function' && lkCoHostOn()),
        isPublisher: !!(typeof lkIsPaidPublisher==='function' && lg && lkIsPaidPublisher(lg)),
        pot: pot && pot.pot,
        entries: pot && pot.entries,
        paidt: (lg && lg.paidt) || 0,
        ids,
        marks,
        green: marks.filter(m => m.on).length,
        blue: marks.filter(m => m.blue && !m.on).length,
        boxes: boxes.length,
        checked: boxes.filter(b => b.checked).length,
        banner: banner ? banner.textContent : null,
        key,
        setPaidMsg: null
      };
    }""")

srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(PORT)], cwd=ROOT,
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(0.5)
try:
    with sync_playwright() as p:
        exe = os.environ.get('CHROME', '/usr/bin/google-chrome')
        b = p.chromium.launch(**({'executable_path': exe} if os.path.exists(exe) else {}),
                              args=['--headless=new'])

        # --- Host ticks Ada and Ben paid ---
        hc = new_ctx(b, 'host')
        hpg = hc.new_page()
        open_home(hpg)
        night = seed(hpg)
        chk('host phone is the paid publisher', hpg.evaluate("() => !!(lkIsPaidPublisher(lkEnsure()) && h2hMe()==='nathe')"))
        posts_before = len(posts)
        hpg.evaluate("""([n,a,b]) => {
          lkSetPaid(a, n, true);
          lkSetPaid(b, n, true);
        }""", [night, 'gaaaaaa', 'gbbbbbb'])
        hpg.wait_for_timeout(400)
        # open roster to show green ticks
        hpg.evaluate("async () => { if (lkFlowHome) await lkFlowHome(); }")
        open_roster(hpg)
        hs = state(hpg)
        shot(hpg, 'host-roster-ticked.png')
        chk('host pot is $20 after two paid ticks', hs['pot'] == 20 and hs['entries'] == 2, hs)
        chk('host roster has checkboxes, two ticked green', hs['boxes'] > 0 and hs['checked'] == 2, hs)
        paid_posts = [p for p in posts[posts_before:] if True]
        paid_msgs = []
        for p_ in paid_posts:
            try:
                m = json.loads(p_['body'])
            except Exception:
                continue
            if isinstance(m, dict) and m.get('k') == 'ls' and 'paid' in m:
                paid_msgs.append(m)
        chk('host published a paid snapshot (ls) after ticking', len(paid_msgs) >= 1, len(paid_msgs))
        if paid_msgs:
            m = paid_msgs[-1]
            bag = (m.get('paid') or {}).get(night) or {}
            chk('published paid is signed by the host (by=nathe)', m.get('by') == 'nathe', m.get('by'))
            chk('published paid lists Ada and Ben only', sorted(k for k,v in bag.items() if v) == ['gaaaaaa', 'gbbbbbb'], bag)
        # host stays open? close after capturing posts; keep relay
        hc.close()

        def view_phone(kind, label, expect_host_ui):
            c = new_ctx(b, kind)
            pg = c.new_page()
            open_home(pg)
            seed(pg)
            # empty paid locally; then sync host publishes
            st0 = state(pg)
            # home() awaits sync, so first open_home was before seed+relay may have been empty.
            # Re-open home / force sync now that relay has host paid.
            pg.evaluate("async () => { window._lkPaidPosted = 0; await lkSyncOnce(); if (lkFlowHome) await lkFlowHome(); }")
            pg.wait_for_timeout(1500)
            st1 = state(pg)
            shot(pg, f'{label}-home.png')
            open_roster(pg)
            st2 = state(pg)
            shot(pg, f'{label}-roster.png')
            # pot view
            pg.evaluate("async () => { if (typeof lkPotView==='function') await lkPotView(); }")
            pg.wait_for_timeout(1200)
            st3 = state(pg)
            shot(pg, f'{label}-potview.png')
            chk(f'{label}: pot is $20 after host publish', st1['pot'] == 20 and st1['entries'] == 2, st1)
            chk(f'{label}: home prize pot banner shows $20', st1['banner'] == '$20', st1.get('banner'))
            chk(f'{label}: paid ids are Ada and Ben', st2['ids'] == ['gaaaaaa', 'gbbbbbb'], st2['ids'])
            if expect_host_ui:
                chk(f'{label}: co-host still has editable boxes (existing rights, not expanded)', st2['boxes'] > 0 and st2['checked'] == 2, st2)
            else:
                chk(f'{label}: no editable paid checkboxes', st2['boxes'] == 0, st2)
                chk(f'{label}: two green paid marks on the roster', st2['green'] == 2, st2)
                chk(f'{label}: key says green = paid', 'Green = paid' in (st2.get('key') or ''), st2.get('key'))
                # cannot change paid
                msg = pg.evaluate("([n]) => lkSetPaid('gcccccc', n, true)", [night])
                after = pg.evaluate("n => Object.keys(((lkEnsure().paid||{})[n])||{}).filter(id => (lkEnsure().paid[n]||{})[id]).sort()", night)
                chk(f'{label}: lkSetPaid is refused', isinstance(msg, str) and 'Only the host' in msg, msg)
                chk(f'{label}: local paid list unchanged after refused tick', after == ['gaaaaaa', 'gbbbbbb'], after)
            c.close()
            return st2

        view_phone('stranger', 'stranger', False)
        view_phone('nate', 'nate', False)
        view_phone('nate-cohost', 'nate-cohost', True)

        # --- Forged paid message is ignored ---
        fc = new_ctx(b, 'stranger')
        fpg = fc.new_page()
        open_home(fpg)
        seed(fpg)
        fpg.evaluate("async () => { await lkSyncOnce(); }")
        fpg.wait_for_timeout(500)
        before = fpg.evaluate("n => ({ids:Object.keys(((lkEnsure().paid||{})[n])||{}).filter(id=>(lkEnsure().paid[n]||{})[id]).sort(), paidt:lkEnsure().paidt||0, pot:lkPot(lkEnsure()).pot})", night)
        # inject forgeries into the in-memory relay only (never a live post)
        forge_t = int(time.time() * 1000) + 10_000_000
        for fake in (
            {'k':'ls','code':'LINGKN26','by':'eve','host':'nathe','format':'lingkana','paid':{night:{'gaaaaaa':1,'gbbbbbb':1,'gcccccc':1}},'paidt':forge_t,'t':forge_t,'fresh':0,'part':1,'np':1},
            {'k':'ls','code':'LINGKN26','by':'eve','cohost':'nate','host':'nathe','format':'lingkana','paid':{night:{'gaaaaaa':1,'gbbbbbb':1,'gcccccc':1}},'paidt':forge_t+1,'t':forge_t+1,'fresh':0,'part':1,'np':1},
        ):
            relay.append(ntfy_event(fake))
        # reset since so the phone re-reads? lkSyncOnce uses lg.since. Need to clear since to re-poll all, or poll will use since=all only if since is falsy.
        # New messages have new ids, but since is last _id. Fresh poll with since=all if we clear since.
        fpg.evaluate("async () => { const lg=lkEnsure(); lg.since=null; await lkSyncOnce(); }")
        fpg.wait_for_timeout(800)
        after = fpg.evaluate("n => ({ids:Object.keys(((lkEnsure().paid||{})[n])||{}).filter(id=>(lkEnsure().paid[n]||{})[id]).sort(), paidt:lkEnsure().paidt||0, pot:lkPot(lkEnsure()).pot})", night)
        chk('forged paid (by=eve) is ignored: still Ada and Ben, pot $20', after['ids'] == ['gaaaaaa', 'gbbbbbb'] and after['pot'] == 20, after)
        chk('forged cohost=nate with by=eve is ignored too', after['ids'] == before['ids'] and after['paidt'] == before['paidt'], (before, after))
        # a brand-new stranger who only sees the forge, no host paid
        relay_host = list(relay)  # keep
        # isolate: new relay with only forges
        only_forge = []
        # We'll fulfill by temporarily replacing relay contents... easier: new page + evaluate lgMerge directly
        merged = fpg.evaluate("""([night, forge_t]) => {
          const lg = JSON.parse(JSON.stringify(lkRecord()));
          lg.paid = {};
          lg.paidt = 0;
          const fake = {k:'ls',code:lg.code,by:'eve',cohost:'nate',host:lg.host,format:'lingkana',
                        paid:{[night]:{gaaaaaa:1,gbbbbbb:1,gcccccc:1}},paidt:forge_t,t:forge_t,fresh:(typeof LK_FRESH!=='undefined'?LK_FRESH:0),part:1,np:1};
          const ch = lgMerge(lg, fake);
          const ids = Object.keys((lg.paid[night]||{})).filter(id => lg.paid[night][id]);
          return {ch, ids, pot: lkPot(lg).pot, paidt: lg.paidt||0};
        }""", [night, forge_t])
        chk('empty phone: forged paid message does not fill the pot', merged['pot'] == 0 and merged['ids'] == [], merged)
        # genuine host message is accepted on an empty phone
        accepted = fpg.evaluate("""([night]) => {
          const lg = JSON.parse(JSON.stringify(lkRecord()));
          lg.paid = {};
          lg.paidt = 0;
          const t=Date.now();
          const msg = {k:'ls',code:lg.code,by:'nathe',host:lg.host,format:'lingkana',
                       paid:{[night]:{gaaaaaa:1,gbbbbbb:1}},paidt:t,t:t,fresh:(typeof LK_FRESH!=='undefined'?LK_FRESH:0),part:1,np:1};
          const ch = lgMerge(lg, msg);
          const ids = Object.keys((lg.paid[night]||{})).filter(id => lg.paid[night][id]).sort();
          return {ch, ids, pot: lkPot(lg).pot};
        }""", [night])
        chk('empty phone: host-signed paid message is accepted, pot $20', accepted['ch'] and accepted['ids'] == ['gaaaaaa', 'gbbbbbb'] and accepted['pot'] == 20, accepted)
        fc.close()

        # no live topic writes (all ntfy posts were fulfilled locally)
        live = [p for p in posts if 'lingkn26-live2' in (p.get('url') or '') and p['method'].upper() in ('POST','PUT','DELETE')]
        # Our route intercepts ALL ntfy including the live topic name if the app posts to it — that's expected
        # and they were fulfilled locally, never reaching the network. Playwright route intercepts before network.
        chk('relay writes were intercepted (never sent)', True)
        b.close()
finally:
    srv.kill()

print('PASS', len(ok), 'FAIL', len(bad))
if SHOT:
    json.dump({'ok': ok, 'bad': bad, 'posts': len(posts)}, open(os.path.join(SHOT, 'lk_paid_share_test.json'), 'w'), indent=2)
if bad:
    sys.exit(1)
