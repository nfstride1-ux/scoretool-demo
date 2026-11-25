#!/usr/bin/env python3
"""Finished casual results: names stay in a simple list; tap a name to open that
archer's coloured scorecard (same layout as the scoring screen). Phone-sized
headless Chrome. Relay and the service worker are stubbed.
"""
import os, sys, time, subprocess, socket, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import guard  # noqa: E402
from playwright.sync_api import sync_playwright

ok, bad = [], []
SHOT = pathlib.Path('/workspace/st-casual-shots')
SHOT.mkdir(parents=True, exist_ok=True)

def chk(name, cond, extra=''):
    (ok if cond else bad).append(name)
    line = ('PASS ' if cond else 'FAIL ') + name
    if extra and not cond:
        line += '  ' + extra[:240]
    print(line, flush=True)

def free_port():
    s = socket.socket(); s.bind(('127.0.0.1', 0)); port = s.getsockname()[1]; s.close(); return port

def chrome_path():
    for cand in ('/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium'):
        if os.path.isfile(cand):
            return cand
    return None

SETUP = """() => { try {
  const cs = csCreate({name:'Friday casual',round:'Australian Indoor 18m',face3:'vert',self:true,ppl:[{n:'Alex'},{n:'Sam'}]});
  if(!cs) return {err:'create failed'};
  const host = csMe();
  const ids = cs.ppl.map(p => p.id);
  const now = Date.now();
  cs.sc[ids[0]] = {e:[['X','10','9'],['8','7','M']], u:now, by:host};
  cs.sc[ids[1]] = {e:[['10','9','8'],['7','6','5']], u:now, by:host};
  cs.sc[ids[2]] = {e:[['4','3','2'],['X','10','M']], u:now, by:host};
  cs.fin = 1; cs.fint = now; save();
  csView(cs.code);
  return {code: cs.code, ids, names: ids.map(id => csNm(cs, id)), host, tots: ids.map(id => csRow(cs, id).tot)};
  } catch (e) { return {err: String(e && e.message || e)} }
}"""

def main():
    port = free_port()
    base = f'http://127.0.0.1:{port}'
    srv = subprocess.Popen([sys.executable, '-m', 'http.server', str(port), '--bind', '127.0.0.1'],
                           cwd=str(ROOT), stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(0.4)
    t0 = time.time()
    try:
        with sync_playwright() as p:
            args = {'headless': True, 'args': ['--no-sandbox', '--disable-dev-shm-usage']}
            exe = chrome_path()
            if exe:
                args['executable_path'] = exe
            browser = p.chromium.launch(**args)
            ctx = browser.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
            page = ctx.new_page()
            page.set_default_timeout(15000)
            errs = []
            page.on('pageerror', lambda e: errs.append(str(e)))
            page.on('dialog', lambda d: d.accept())
            page.goto(f'{base}/?app=1', wait_until='domcontentloaded')
            page.wait_for_selector('#app', timeout=15000)
            if page.locator('#wnx').count():
                page.locator('#wnx').click()
            if page.locator('#npc').count():
                page.fill('#npname', 'Nate')
                page.click('#npc')
                page.wait_for_selector('#app', timeout=15000)
            welcome = time.time() + 8
            ready = False
            while time.time() < welcome:
                if page.locator('#wnx').count():
                    page.locator('#wnx').click()
                if page.locator('#nmlater').count():
                    page.click('#nmlater')
                    page.wait_for_timeout(250)
                    continue
                if page.locator('#nmin').count():
                    page.fill('#nmin', 'Nate')
                    page.click('#nmingo')
                    page.wait_for_timeout(250)
                    continue
                ready = page.evaluate("""() => {
                  const tabs = document.querySelector('#tabs');
                  const b = document.querySelector('#tabs button[data-v="score"]');
                  if (!tabs || tabs.hidden || !b || document.querySelector('#nmscreen')) return false;
                  return b.getBoundingClientRect().height > 20 && typeof csCreate === 'function' && !!h2hMe();
                }""")
                if ready:
                    break
                page.wait_for_timeout(200)
            chk('profile ready and casual helpers loaded', ready)
            page.evaluate("() => document.body.classList.remove('kb-open')")
            if page.locator('#wnx').count():
                page.locator('#wnx').click()
            info = page.evaluate(SETUP)
            chk('created a finished casual shoot with 3 archers', isinstance(info, dict) and len(info.get('ids') or []) == 3 and not info.get('err'), str(info))
            page.wait_for_selector('#csscores')
            chk('the scores list is on screen', page.locator('#csscores').count() == 1)
            chk('the plain ends dump is gone', page.locator('#csends').count() == 0)
            rows = page.locator('#csscores tbody tr[data-cssheet]')
            chk('the list has 3 tappable names', rows.count() == 3)
            text = page.inner_text('#csscores')
            chk('the list shows names, scores, 10s and X, including name-only archers',
                'Alex' in text and 'Sam' in text and 'name only' in text and 'Score' in text and '10s' in text,
                text[:300])
            chk('a hint tells you to tap a name', 'Tap a name' in page.inner_text('#csview'))
            # Ranked highest first: host X,10,9 + 8,7,M = 10+10+9+8+7+0 = 44
            # Alex 10+9+8+7+6+5 = 45, so Alex is #1
            first = rows.nth(0).inner_text()
            chk('Alex (name only) is first with score 45', 'Alex' in first and 'name only' in first and '45' in first, first)
            page.screenshot(path=str(SHOT / '01-scores-list.png'), full_page=True)

            rows.nth(0).click()
            page.wait_for_selector('#csarchsheet')
            chk('tapping a name opens their scorecard', page.locator('#csarchsheet').count() == 1)
            sheet = page.inner_text('#csarchsheet')
            chk('the scorecard uses the scoring-screen layout (ends, arrows, end totals, running total)',
                'Score Sheet' in sheet and 'Scores' in sheet and 'End' in sheet and 'Prog' in sheet and 'Alex' in sheet,
                sheet[:400])
            chk('the heading marks a name-only archer', 'name only' in sheet)
            chips = page.evaluate("""() => [...document.querySelectorAll('#csarchsheet .adb')].map(el => ({t: el.textContent.trim(), c: el.className}))""")
            chk('arrow chips are coloured like the scoring screen (gold/red/blue)',
                any('k-y' in c['c'] for c in chips) and any('k-r' in c['c'] for c in chips) and any('k-b' in c['c'] for c in chips),
                str(chips))
            chk('Alex\'s arrows and end totals match the scoring-screen renderer',
                [c['t'] for c in chips] == ['10','9','8','7','6','5']
                and '27' in sheet and '45' in sheet,
                str(chips)+' | '+sheet[:300])
            same = page.evaluate("""() => {
              const cs = csGet(window._csv), id = window._csSheetId;
              const expect = csOneSheet(cs, id, true);
              const got = document.querySelector('#csarchsheet .ad-sheet').outerHTML;
              return {same: got.indexOf('ad-tab')>=0 && expect.indexOf('ad-tab')>=0 && got.indexOf('k-y')>=0 && expect.indexOf('k-y')>=0, id};
            }""")
            chk('the open card reuses csOneSheet (same renderer as while scoring)', same.get('same'), str(same))
            chk('arrow chips are view-only (not the fix-an-arrow controls)',
                page.locator('#csarchsheet [data-cssfix]').count() == 0 and page.locator('#csarchback').count() == 1)
            page.screenshot(path=str(SHOT / '02-alex-scorecard.png'), full_page=True)

            page.click('#csarchback')
            page.wait_for_selector('#csscores')
            chk('Back returns to the names-and-scores list', page.locator('#csscores').count() == 1 and page.locator('#csarchsheet').count() == 0)

            # Host's card (includes X = gold) and Sam (includes white/black/miss)
            page.locator('tr[data-cssheet]').filter(has_text='(you)').click()
            page.wait_for_selector('#csarchsheet')
            host_chips = page.evaluate("""() => [...document.querySelectorAll('#csarchsheet .adb')].map(el => ({t: el.textContent.trim(), c: el.className}))""")
            chk("the host's card shows coloured X/10/9/8/7/M chips",
                [c['t'] for c in host_chips] == ['X','10','9','8','7','M']
                and all('k-y' in host_chips[i]['c'] for i in (0,1,2))
                and 'k-r' in host_chips[3]['c'] and 'k-r' in host_chips[4]['c'] and 'k-m' in host_chips[5]['c'],
                str(host_chips))
            page.screenshot(path=str(SHOT / '03-host-scorecard.png'), full_page=True)
            page.click('#csarchback')
            page.wait_for_selector('#csscores')

            page.locator('tr[data-cssheet]').filter(has_text='Sam').click()
            page.wait_for_selector('#csarchsheet')
            sam = page.evaluate("""() => [...document.querySelectorAll('#csarchsheet .adb')].map(el => ({t: el.textContent.trim(), c: el.className}))""")
            chk("Sam's name-only card shows black, white, gold and miss colours",
                [c['t'] for c in sam] == ['4','3','2','X','10','M']
                and 'k-k' in sam[0]['c'] and 'k-k' in sam[1]['c'] and 'k-w' in sam[2]['c']
                and 'k-y' in sam[3]['c'] and 'k-y' in sam[4]['c'] and 'k-m' in sam[5]['c'],
                str(sam))
            page.screenshot(path=str(SHOT / '04-sam-scorecard.png'), full_page=True)
            page.click('#csarchback')
            page.wait_for_selector('#csscores')
            page.screenshot(path=str(SHOT / '05-back-to-list.png'), full_page=True)

            # Scoring was not altered: saved ends still match what we wrote
            saved = page.evaluate("""(code) => {
              const cs = csGet(code);
              return cs.ppl.map(p => ({n: csNm(cs,p.id), e: (cs.sc[p.id]||{}).e, tid: p.tid||null, tot: csRow(cs,p.id).tot}));
            }""", info['code'])
            chk('saved scores are unchanged',
                saved[0]['e']==[['X','10','9'],['8','7','M']] and saved[0]['tot']==44
                and saved[1]['e']==[['10','9','8'],['7','6','5']] and saved[1]['tot']==45
                and saved[2]['e']==[['4','3','2'],['X','10','M']] and saved[2]['tot']==29,
                str(saved))
            chk('no page errors', not errs, ' | '.join(errs[:3]))
            browser.close()
    finally:
        srv.terminate()
        try:
            srv.wait(timeout=3)
        except Exception:
            srv.kill()
    print(f'\n{len(ok)} passed, {len(bad)} failed, {time.time()-t0:.0f}s', flush=True)
    return 1 if bad else 0

if __name__ == '__main__':
    sys.exit(main())
