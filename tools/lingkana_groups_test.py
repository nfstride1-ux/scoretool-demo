# Lingkana registration link, shared passcode, and automatic groups of 4.
# Stubs the ntfy relay. Does not post to the live topic.
import os, sys, time, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import guard
from playwright.sync_api import sync_playwright

ok, bad = [], []
def chk(n, c, extra=''):
    (ok if c else bad).append(n)
    print(('PASS ' if c else 'FAIL ') + n + (('  ' + extra) if extra and not c else ''))

PORT = '8803'
BASE = f'http://localhost:{PORT}'
SHOT = Path('/opt/cursor/artifacts')
SHOT.mkdir(parents=True, exist_ok=True)
REG = 'https://nfstride1-ux.github.io/scoretool-demo/lk-register.html'

srv = subprocess.Popen([sys.executable, '-m', 'http.server', PORT], cwd=str(ROOT),
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(0.6)

try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome',
                              args=['--no-sandbox', '--disable-dev-shm-usage', '--headless=new'])
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
        page = ctx.new_page()
        page.goto(f'{BASE}/#lk-register', wait_until='networkidle')
        page.wait_for_selector('#lkregpage', timeout=8000)
        reg = page.inner_text('#lkregpage')
        chk('register page has name, night, optional bow, email and phone',
            page.locator('#lkregname').count()==1 and page.locator('#lkregnight').count()==1
            and page.locator('#lkregbow').count()==1 and page.locator('#lkregemail').count()==1
            and page.locator('#lkregphone').count()==1)
        chk('register page has no invite-code field',
            page.locator('#lkregcode').count()==0 and 'invite code' not in reg.lower() and 'poster' not in reg.lower(),
            reg[:240])
        qr = page.evaluate("""(url) => {
          const box = document.getElementById('lkregqr');
          const live = document.querySelector('#lkqrsvg svg path');
          const qr = qrcode(0, 'M');
          qr.addData(url);
          qr.make();
          const hold = document.createElement('div');
          hold.innerHTML = qr.createSvgTag({cellSize:4, margin:2, scalable:true});
          const again = hold.querySelector('path');
          const imgs = [...document.querySelectorAll('#lkregqr img')].map(i => i.getAttribute('src')||'');
          const d = live && live.getAttribute('d') || '';
          return {data: box && box.getAttribute('data-url'), same: !!d && d===(again && again.getAttribute('d')),
                  svg: d.length>100, external: imgs.some(s => /^https?:/i.test(s))};
        }""", REG)
        chk('QR is drawn on this phone for the registration link',
            qr.get('data')==REG and qr.get('same') and qr.get('svg') and not qr.get('external'), str(qr))
        page.locator('#lkregpage').screenshot(path=str(SHOT / 'lingkana-register-390.png'))
        page.fill('#lkregname', 'Sam Archer')
        page.fill('#lkregbow', 'Recurve')
        page.fill('#lkregemail', 'sam@example.com')
        page.fill('#lkregphone', '0400111222')
        page.locator('#lkregnight').select_option('2026-11-18')
        page.locator('#lkreggo').click()
        page.wait_for_selector('#lkregok', timeout=4000)
        saved = page.evaluate("""() => {
          const lg = lkEnsure();
          const row = ((lg.reg||{})['2026-11-18']||[]).find(r => r && r.name==='Sam Archer');
          return {msg: (document.querySelector('#lkregok')||{}).textContent||'',
                  id: row && row.id, bow: row && row.bow, email: row && row.email};
        }""")
        chk('a name can be registered with no invite code',
            'Night 1' in saved['msg'] and saved.get('id') and saved.get('bow')=='Recurve' and saved.get('email')=='sam@example.com',
            str(saved))

        seeded = page.evaluate("""() => {
          const lg = lkEnsure();
          const night = '2026-11-18';
          const names = ['Alex River','Casey Ng','Jordan Lee','Riley Chen','Morgan Blake'];
          const ids = {sam: ((lg.reg[night]||[]).find(r => r.name==='Sam Archer')||{}).id};
          names.forEach(name => {
            const r = lkApplyReg({name, night, at: Date.now()}, lg);
            ids[name] = r && r.id;
          });
          lg.paid = lg.paid || {};
          lg.paid[night] = {};
          ['sam','Alex River','Casey Ng','Jordan Lee','Riley Chen'].forEach(k => { lg.paid[night][ids[k]] = 1; });
          window._lkFlowNight = 1;
          window._lkAuthed = null;
          try { sessionStorage.removeItem('scoretool.lk.auth'); sessionStorage.removeItem('scoretool.lk.scorerId'); } catch(e) {}
          const built = lkAssignGroups(lg, 1);
          const flat = (built.groups||[]).map(g => g.names);
          return {ids, mode: built.mode, flat, waiting: (built.waiting||[]).map(p => p.name), remainder: built.remainder};
        }""")
        chk('night 1 with 5 paid archers is a group of 3 then a group of 2',
            seeded['mode']=='alpha'
            and seeded['flat']==[['Alex River','Casey Ng','Jordan Lee'],['Riley Chen','Sam Archer']]
            and seeded['waiting']==[],
            str(seeded['flat']))
        chk('an unpaid registrant is not in a group',
            'Morgan Blake' not in [n for g in seeded['flat'] for n in g])

        page.evaluate("() => lkFlowHome('LINGKN26')")
        page.wait_for_selector('#lklogin', timeout=5000)
        page.locator('#lklogin').click()
        page.wait_for_selector('#lkscorernames', timeout=5000)
        labels = page.locator('#lkscorernames .lk-namebtn').all_inner_texts()
        chk('login lists registered names and has no free-text name box',
            page.locator('input#lkscorer').count()==0
            and labels==['Alex River','Casey Ng','Jordan Lee','Morgan Blake','Riley Chen','Sam Archer'],
            str(labels))
        page.screenshot(path=str(SHOT / 'lingkana-login-names-390.png'), full_page=False)
        page.locator('#lkscorernames .lk-namebtn', has_text='Alex River').click()
        page.fill('#lkpw', 'kana26')
        page.locator('#lkpwgo').click()
        page.wait_for_timeout(300)
        chk('a passcode other than Kana26 is refused',
            'not right' in (page.inner_text('#lkpwmsg') or '').lower() and page.locator('#lkassigned').count()==0)
        page.fill('#lkpw', 'Kana26')
        page.locator('#lkpwgo').click()
        page.wait_for_selector('#lkassigned', timeout=5000)
        group = page.inner_text('#lkassigned')
        chk('login opens Alex River on target 1 with the first three names',
            page.locator('#lktargets').count()==0
            and page.get_attribute('#lkassigned','data-target')=='1'
            and 'target 1' in group.lower() and 'Alex River (you)' in group
            and 'Casey Ng' in group and 'Jordan Lee' in group
            and 'Riley Chen' not in group and 'Sam Archer' not in group
            and 'This target has 3 archers.' in group,
            group[:300])
        page.screenshot(path=str(SHOT / 'lingkana-assigned-group-390.png'), full_page=False)

        page.evaluate("""() => {
          try { sessionStorage.setItem('scoretool.lk.scorerId', (lkEnsure().reg['2026-11-18'].find(r=>r.name==='Morgan Blake')||{}).id); } catch(e) {}
          window._lkAuthed = 'LINGKN26';
          lkFlowAssigned();
        }""")
        page.wait_for_timeout(200)
        unpaid = page.inner_text('#lkassigned')
        chk('an unpaid name is told they are not in a group',
            page.get_attribute('#lkassigned','data-target')=='0' and 'paid list' in unpaid.lower(),
            unpaid[:200])

        ranked = page.evaluate("""() => {
          const lg = lkEnsure();
          const n1 = '2026-11-18', n2 = '2026-12-02';
          const end = (v) => ({e:[[v,v,v]], u:1});
          const scores = {'Alex River':'5','Casey Ng':'X','Jordan Lee':'9','Riley Chen':'1','Sam Archer':'10'};
          const ids = {};
          (lg.reg[n1]||[]).forEach(r => { ids[r.name]=r.id; });
          lg.sc = lg.sc || {};
          Object.entries(scores).forEach(([name,v]) => { lg.sc[ids[name]] = {1: end(v)}; });
          ['Alex River','Casey Ng','Jordan Lee','Riley Chen','Sam Archer'].forEach(name => {
            lkApplyReg({name, night:n2, at:Date.now(), id:ids[name]}, lg);
          });
          lg.paid[n2] = {};
          Object.values(ids).forEach(id => { if(id) lg.paid[n2][id]=1; });
          delete lg.paid[n2][ids['Morgan Blake']];
          const built = lkAssignGroups(lg, 2);
          return {mode: built.mode, flat: (built.groups||[]).map(g => g.names), prior: lkHasPriorResult(lg, 2)};
        }""")
        chk('a later night groups by best-4 so far, not by name',
            ranked['prior'] is True and ranked['mode']=='rank'
            and ranked['flat']==[['Casey Ng','Sam Archer','Jordan Lee'],['Alex River','Riley Chen']],
            str(ranked))

        sizes = page.evaluate("""() => {
          const out = [];
          for (let n=1;n<=52;n++) out.push({n, sizes: lkGroupSizes(n)});
          const one = lkChunkFour([{id:'only', name:'Only One'}]);
          return {out, solo: (one.solo||[]).map(p=>p.name), oneGroups: one.groups.length};
        }""")
        want = {5:[3,2], 6:[3,3], 7:[4,3], 9:[3,3,3], 10:[4,3,3], 13:[4,3,3,3], 52:[4]*13}
        bad_sizes = []
        for row in sizes['out']:
            n, got = row['n'], row['sizes']
            if n==1:
                if got is not None: bad_sizes.append('1 should not be grouped')
                continue
            if not got or sum(got)!=n or any(s not in (2,3,4) for s in got):
                bad_sizes.append(f'{n}:{got}')
                continue
            if n not in (2,5) and 2 in got:
                bad_sizes.append(f'{n} has a 2:{got}')
            if n in want and got!=want[n]:
                bad_sizes.append(f'{n} expected {want[n]} got {got}')
            if len(got)>13:
                bad_sizes.append(f'{n} uses more than 13 targets')
        chk('group sizes for 1 to 52 prefer 4, then 3, then 2, and never a lone 1',
            bad_sizes==[] and sizes['oneGroups']==0 and sizes['solo']==['Only One'],
            str(bad_sizes[:8]))

        cap = page.evaluate("""() => {
          try { localStorage.removeItem('scoretool.lk.reg'); } catch(e) {}
          const lg = lkEnsure();
          lg.order=[]; lg.gn={}; lg.reg={}; lg.paid={}; lg.sc={};
          const night='2026-11-18';
          let failed=null;
          for (let i=1;i<=52;i++){
            const name='P'+String(i).padStart(2,'0');
            const r=lkApplyReg({name, night, at:1}, lg);
            if(!r.ok){failed=r.msg; break}
          }
          const extra=lkApplyReg({name:'Past Cap', night, at:1}, lg);
          const again=lkApplyReg({name:'P01', night:'2026-12-02', at:2}, lg);
          return {count: lkKnownRegistrants(lg).length, failed, extraOk: !!(extra&&extra.ok), extraMsg: extra&&extra.msg,
                  again: !!(again&&again.ok), onNight2: ((lg.reg['2026-12-02']||[]).some(r=>r.name==='P01'))};
        }""")
        chk('the league closes at 52 registered archers, and an existing name can still add a night',
            cap['count']==52 and cap['failed'] is None and cap['extraOk'] is False
            and cap['extraMsg']=='This league already has 52 archers. Registration is closed.'
            and cap['again'] is True and cap['onNight2'] is True,
            str(cap))

        onion = page.evaluate("""() => {
          if (typeof lkFlowHome==='function') lkFlowHome('ONIONSH2');
          return true;
        }""")
        page.wait_for_selector('#lklogin', timeout=4000)
        page.locator('#lklogin').click()
        page.wait_for_selector('#lkloginpage', timeout=4000)
        chk('Onion Shed login still has a typed name',
            onion and page.locator('input#lkscorer').count()==1 and page.locator('#lkscorernames').count()==0)
        b.close()
finally:
    srv.terminate()

print(f'\n{len(ok)} passed, {len(bad)} failed')
if bad:
    print('FAILED:')
    for n in bad:
        print(' ', n)
    sys.exit(1)
