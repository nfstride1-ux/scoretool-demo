# Event list and event home on the /test/ page only (12 Nov 2026).
# Stubs the ntfy relay. Does not change the live root app.
import json, os, sys, time, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'tools'))
import guard
from playwright.sync_api import sync_playwright

ok, bad = [], []
def chk(n, c, extra=''):
    (ok if c else bad).append(n)
    print(('PASS ' if c else 'FAIL ') + n + (('  ' + extra) if extra and not c else ''))

PORT = '8796'
BASE = f'http://localhost:{PORT}'
SHOT = Path('/workspace/scoretool/test-ui')
SHOT.mkdir(parents=True, exist_ok=True)

srv = subprocess.Popen([sys.executable, '-m', 'http.server', PORT], cwd=str(ROOT),
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(0.6)

LOCKED = [
    'Name: Lingkana League. Venue: Lingkana Archery range, 107 Robinson Ave, Belmont WA 6104. Invite only.',
    'Dates: Wed 18 Nov, 2, 16 and 30 Dec, 13 and 27 Jan, shoot-up 10 Feb. Start 6:30pm, induction 6pm.',
    'Six nights of a 660 (60 arrows, 20 ends of 3, 18 m, 40 cm triangular 3-spot, X=11, max 660). Ranked on best 4 of 6, no minimum if a night is missed. Ties on 11s then 10s.',
    '$25 range plus $10 pot each night including night 7; pot paid 60/30/10.',
    'Groups of up to 4, one scorer. Value entry only. Scoring password for host and scorers only, not on the poster or share link.',
    'Night 7: 150 warm-up is not scored, then a ladder shoot-up for the top 12 (#12 v #11, winner moves up).',
]
OS_RULES = [
    'Six 300s at 18 m on the vertical 3-spot.',
    'Each week for 5 weeks everyone shoots a 300 round, in person or over FaceTime.',
    'On the 6th day they all shoot another 300 together in person in the Onion Shed.',
    'The running total of all six 300s (maximum 1800, ties split on X count) sets the league table.',
    "Shoot-up match play happens on day 6 only, starting once everyone's day-6 300 is in. Final: 3 ends of 3 arrows, X = 10, no 12 dot. Ties: 1 arrow each, closest to the middle wins (host picks).",
    'Entry is $10 each night, winner takes all, minus a jokey 75%.',
]

def names_once(text, name):
    return text.lower().count(name.lower()) == 1

try:
    live_v = json.loads((ROOT / 'version.json').read_text())['version']
    test_v = json.loads((ROOT / 'test' / 'version.json').read_text())['version']
    chk('live-root version.json is still v2026-11-11-2216-live', live_v == 'v2026-11-11-2216-live', live_v)
    chk('test version.json is the new test build', test_v == 'v2026-11-12-0815-test', test_v)

    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome',
                              args=['--no-sandbox', '--disable-dev-shm-usage', '--headless=new'])
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2)
        guard.attach(ctx) if hasattr(guard, 'attach') else None
        # guard patches context at construction time via wrap; also belt-and-braces route
        page = ctx.new_page()
        page.route(guard.RELAY, lambda route: route.fulfill(status=200, body='', headers={
            'access-control-allow-origin': '*', 'content-type': 'application/json'}))

        # --- public test URL: league list ---
        page.goto(f'{BASE}/test/', wait_until='networkidle')
        page.wait_for_timeout(800)
        page.wait_for_selector('#lkevlist, .st-evcard', timeout=8000)
        cards = page.locator('.st-evcard')
        chk('list shows two event cards', cards.count() == 2, str(cards.count()))
        titles = [cards.nth(i).locator('b').inner_text().strip() for i in range(cards.count())]
        chk('Lingkana League appears once on the list', titles.count('Lingkana League') == 1, str(titles))
        chk('Onion Shed Challenge appears once on the list', titles.count('Onion Shed Challenge') == 1, str(titles))
        bgs = [cards.nth(i).evaluate('e => getComputedStyle(e).backgroundImage') for i in range(cards.count())]
        chk('Lingkana card uses the venue flyer', any('lingkana-flyer' in x for x in bgs), str(bgs))
        chk('Onion Shed card uses the venue flyer', any('onion-shed-flyer' in x for x in bgs), str(bgs))
        page.screenshot(path=str(SHOT / '01-league-list.png'), full_page=False)

        # --- Lingkana event home ---
        cards.filter(has_text='Lingkana League').click()
        page.wait_for_selector('#lkhome', timeout=5000)
        chk('opening Lingkana goes to event home, not a flyer page', page.locator('#lkhome').count() == 1)
        logo = page.locator('#lkhome img').get_attribute('src') or ''
        chk('Lingkana event home shows the mountain logo', 'lingkana-logo' in logo, logo)
        brand = page.locator('#lkhome').inner_text()
        chk('event home does not use iScored or Archer\'s Diary branding',
            'iscored' not in brand.lower() and "archer" + "'s diary" not in brand.lower() and 'archery australia' not in brand.lower())
        bg = page.evaluate("() => getComputedStyle(document.querySelector('#lkhome') || document.body).backgroundImage")
        body_bg = page.evaluate("() => getComputedStyle(document.body).backgroundImage")
        chk('event home is not a full-page flyer background',
            'lingkana-flyer' not in (bg or '') and 'lingkana-flyer' not in (body_bg or ''), bg + ' | ' + body_bg)
        for lab in ['Login to Event', 'Login with QR Code', 'Event Registration', 'Review Scoresheet', 'Rules']:
            chk(f'Lingkana event home has {lab}', page.locator('.lk-btn', has_text=lab).count() == 1)
        page.screenshot(path=str(SHOT / '02-lingkana-event-home.png'), full_page=False)

        # Rules
        page.locator('#lkrules').click()
        page.wait_for_selector('#lkrulespage', timeout=5000)
        rules_txt = page.locator('#lkrulespage').inner_text()
        for line in LOCKED:
            chk('Lingkana rules include locked line', line in rules_txt, line[:60])
        chk('Lingkana rules do not invent extras (no off-bow / AA branding)',
            'off-bow' not in rules_txt.lower() and 'archery australia' not in rules_txt.lower() and 'iscore' not in rules_txt.lower())
        chk('Lingkana rules page is not a 300-round Onion Shed text', 'FaceTime' not in rules_txt)
        page.screenshot(path=str(SHOT / '03-lingkana-rules.png'), full_page=True)

        page.locator('#lkruleback').click()
        page.wait_for_selector('#lkhome', timeout=4000)

        # Event Registration -> existing register page
        page.locator('#lkereg').click()
        page.wait_for_timeout(400)
        reg = page.inner_text('body')
        chk('Event Registration opens the existing register page',
            'Register for a shoot night' in reg or 'Poster invite code' in reg, reg[:200])

        if page.locator('#lkregback').count():
            page.locator('#lkregback').click()
            page.wait_for_selector('#lkhome', timeout=4000)
        else:
            page.evaluate("() => window.lkFlowHome && window.lkFlowHome('LINGKN26')")
            page.wait_for_selector('#lkhome', timeout=4000)

        # Review
        page.locator('#lkreview').click()
        page.wait_for_timeout(500)
        rev = page.inner_text('body')
        low = rev.lower()
        chk('Review Scoresheet reaches night scores / standings / pot',
            ('tonight' in low and 'score' in low or 'standings' in low or 'night 1' in low) and ('pot' in low or 'share' in low or 'print' in low),
            rev[:300])
        if page.locator('#lkresback').count():
            page.locator('#lkresback').click()
        elif page.locator('#lkrevback').count():
            page.locator('#lkrevback').click()
        else:
            page.evaluate("() => window.lkFlowHome && window.lkFlowHome('LINGKN26')")
        page.wait_for_selector('#lkhome', timeout=4000)

        # Login
        page.locator('#lklogin').click()
        page.wait_for_selector('#lkloginpage', timeout=4000)
        chk('Login to Event shows league / passcode login',
            page.locator('#lkpw').count() == 1 and page.locator('#lkevent').count() == 1)
        page.locator('#lkloginback').click()
        page.wait_for_selector('#lkhome', timeout=4000)

        # QR
        page.locator('#lkqr').click()
        page.wait_for_selector('#lkqrpage', timeout=4000)
        qtxt = page.inner_text('body')
        chk('Login with QR Code opens the existing QR scan page',
            page.locator('#lkqrpage').count()==1 or 'qr' in qtxt.lower(),
            qtxt[:200])
        page.locator('#lkqrback').click()
        page.wait_for_selector('#lkhome', timeout=4000)

        # back to list, then Onion Shed
        page.locator('#lkhomeback').click()
        page.wait_for_selector('#lkevlist', timeout=4000)
        page.locator('.st-evcard', has_text='Onion Shed Challenge').click()
        page.wait_for_selector('#lkhome', timeout=4000)
        ologo = page.locator('#lkhome img').get_attribute('src') or ''
        chk('Onion Shed event home shows the shed-and-target logo', 'onion-shed-logo' in ologo, ologo)
        chk('Onion Shed event home is not a flyer page background',
            'onion-shed-flyer' not in (page.evaluate("() => getComputedStyle(document.body).backgroundImage") or ''))
        for lab in ['Login to Event', 'Login with QR Code', 'Event Registration', 'Review Scoresheet', 'Rules']:
            chk(f'Onion Shed event home has {lab}', page.locator('.lk-btn', has_text=lab).count() == 1)
        page.screenshot(path=str(SHOT / '04-onion-shed-event-home.png'), full_page=False)

        page.locator('#lkrules').click()
        page.wait_for_selector('#lkrulespage', timeout=4000)
        os_txt = page.locator('#lkrulespage').inner_text()
        for line in OS_RULES:
            chk('Onion Shed rules include current line', line in os_txt, line[:60])
        chk('Onion Shed rules are not converted to the 660 format',
            '660' not in os_txt and 'best 4 of 6' not in os_txt.lower() and 'triangular' not in os_txt.lower())

        page.locator('#lkruleback').click()
        page.wait_for_selector('#lkhome', timeout=4000)
        page.locator('#lklogin').click()
        page.wait_for_selector('#lkloginpage', timeout=4000)
        chk('Onion Shed login uses the league code, not a new scoring password',
            page.locator('#lkcode').count() == 1 and page.locator('#lkpw').count() == 0)
        page.locator('#lkloginback').click()
        page.wait_for_selector('#lkhome', timeout=4000)
        page.locator('#lkereg').click()
        page.wait_for_timeout(400)
        rtxt = page.inner_text('body')
        chk('Onion Shed Event Registration is its own page',
            'event registration' in rtxt.lower() or page.locator('#lkregpage').count()==1,
            rtxt[:240])
        if page.locator('#lkregback').count():
            page.locator('#lkregback').click()
        else:
            page.evaluate("() => window.lkFlowHome && window.lkFlowHome('ONIONSH2')")
        page.wait_for_selector('#lkhome', timeout=4000)
        page.locator('#lkreview').click()
        page.wait_for_timeout(400)
        rv = page.inner_text('body')
        chk('Onion Shed Review Scoresheet shows the existing table heading',
            'review scoresheet' in rv.lower() and ('total' in rv.lower() or 'not on this phone' in rv.lower() or 'archer' in rv.lower()),
            rv[:240])

        # live root still the previous live version
        root_page = ctx.new_page()
        root_page.route(guard.RELAY, lambda route: route.fulfill(status=200, body='', headers={
            'access-control-allow-origin': '*', 'content-type': 'application/json'}))
        root_page.goto(f'{BASE}/version.json')
        live = json.loads(root_page.inner_text('body'))
        chk('HTTP /version.json is still v2026-11-11-2216-live', live.get('version') == 'v2026-11-11-2216-live', str(live))
        root_page.goto(f'{BASE}/test/version.json')
        tv = json.loads(root_page.inner_text('body'))
        chk('HTTP /test/version.json is the new test build', tv.get('version') == 'v2026-11-12-0815-test', str(tv))

        # Score tab with tester: each league once as a flyer card
        tpage = ctx.new_page()
        tpage.route(guard.RELAY, lambda route: route.fulfill(status=200, body='', headers={
            'access-control-allow-origin': '*', 'content-type': 'application/json'}))
        tpage.goto(f'{BASE}/test/?tester=nathe&app=1')
        tpage.wait_for_timeout(1000)
        tpage.evaluate("""() => {
          try { localStorage.setItem('scoretool.whatsnew.seen','v2026-11-12-0815-test'); } catch(e) {}
          if (typeof S !== 'undefined' && S) { S.unlocked = true; if (!S.profile) S.profile = 'nathe'; if (typeof save === 'function') save(); }
        }""")
        tpage.reload()
        tpage.wait_for_timeout(1200)
        if tpage.locator('#wnx').count():
            tpage.locator('#wnx').click()
            tpage.wait_for_timeout(200)
        tpage.evaluate("() => { if (typeof nav === 'function') { cur=null; nav('score'); } }")
        tpage.wait_for_timeout(600)
        if tpage.locator('[data-cstp="league"]').count():
            tpage.locator('[data-cstp="league"]').click()
            tpage.wait_for_timeout(500)
        # if lgcard not there yet, try again
        if tpage.locator('#lgcard').count() == 0:
            tpage.evaluate("() => { window._csMode='league'; if (typeof score==='function') score(); }")
            tpage.wait_for_timeout(500)
        ev = tpage.locator('#lgcard .st-evcard')
        ev_titles = [ev.nth(i).locator('b').inner_text().strip() for i in range(ev.count())] if ev.count() else []
        chk('Score tab lists Lingkana once as a flyer card', ev_titles.count('Lingkana League') == 1, str(ev_titles))
        chk('Score tab lists Onion Shed once as a flyer card', ev_titles.count('Onion Shed Challenge') == 1, str(ev_titles))
        chk('Score tab has no second Lingkana catalog row', tpage.locator('#lkrow').count() == 0)
        # name text on the whole card should not list Lingkana twice
        card_txt = tpage.locator('#lgcard').inner_text() if tpage.locator('#lgcard').count() else ''
        chk('Score tab league card text does not repeat Lingkana League',
            card_txt.count('Lingkana League') == 1, card_txt[:400])

        b.close()
finally:
    srv.terminate()

print(f'\n{len(ok)} passed, {len(bad)} failed')
if bad:
    print('FAILED:', *bad, sep='\n  ')
    sys.exit(1)
