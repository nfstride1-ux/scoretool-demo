# Hosts move an unscored archer to the end of another target. The move is posted
# on the relay. An archer who already has scores cannot be moved, and those scores stay.
# A non-host cannot move anyone. 390px.
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

PORT = '8898'
BASE = f'http://127.0.0.1:{PORT}'
SHOT = Path('/opt/cursor/artifacts')
SHOT.mkdir(parents=True, exist_ok=True)
srv = subprocess.Popen([sys.executable, '-m', 'http.server', PORT], cwd=str(ROOT),
                       stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(0.5)

ENDS = [['X','10','9'],['10','10','10'],['9','9','8']]

SEED = """() => {
  const lg = lkEnsure();
  const names = ['Alex River','Casey Ng','Jordan Lee','Riley Chen','Sam Archer','Taylor Brooks'];
  const night = '2026-11-18';
  const ids = {};
  names.forEach(name => {
    const r = lkApplyReg({name, at: Date.now(), bow: 'Recurve'}, lg);
    ids[name] = r.id;
    lg.paid = lg.paid || {};
    lg.paid[night] = lg.paid[night] || {};
    lg.paid[night][r.id] = 1;
  });
  const built = lkAssignGroups(lg, 1);
  window._posts = [];
  if (!window._lkMoveWrap) {
    window._lkMoveWrap = 1;
    const orig = window.h2hPost;
    window.h2hPost = async (topic, body) => {
      window._posts.push({topic, body});
      if (typeof orig === 'function') { try { return await orig(topic, body); } catch (e) { return false; } }
      return true;
    };
  }
  return {ids, groups: (((lg.grp||{})[1]||{}).g)||[], built: (built.groups||[]).map(g => g.names)};
}"""

try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome',
                              args=['--no-sandbox', '--disable-dev-shm-usage', '--headless=new'])
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        page = ctx.new_page()
        errs = []
        page.on('pageerror', lambda e: errs.append(str(e)[:200]))
        page.goto(BASE + '/?tester=nathe#lk-home', wait_until='domcontentloaded')
        page.wait_for_timeout(400)
        if page.locator('#wnx').count():
            page.locator('#wnx').click()
        seeded = page.evaluate(SEED)
        ids = seeded['ids']
        chk('six paid archers start in two groups of three',
            seeded['groups']==[ [ids['Alex River'], ids['Casey Ng'], ids['Jordan Lee']],
                                [ids['Riley Chen'], ids['Sam Archer'], ids['Taylor Brooks']] ],
            str(seeded['built']))
        page.locator('#lklogin').click()
        page.wait_for_selector('#lkscorernames', timeout=5000)
        page.locator('#lkscorernames .lk-namebtn', has_text='Nathaniel Stride').click()
        page.fill('#lkpw', 'Kana26')
        page.locator('#lkpwgo').click()
        page.wait_for_selector('#lkhostmove', timeout=5000)
        page.locator('#lkhostmove').click()
        page.wait_for_selector('#lkmovegroups', timeout=5000)
        page.locator('#lkmovegroups [data-lkmove]', has_text='Move').first.wait_for()
        chk('every unscored archer has a Move button',
            page.locator('#lkmovegroups [data-lkmove]').count()==6)
        page.screenshot(path=str(SHOT / 'lingkana-move-list-390.png'))
        page.locator('[data-lkmove="%s"]' % ids['Jordan Lee']).click()
        page.wait_for_selector('#lkmovepick', timeout=4000)
        page.locator('#lkmovego').scroll_into_view_if_needed()
        page.screenshot(path=str(SHOT / 'lingkana-move-picker-390.png'))
        page.select_option('#lkmoveto', '1')
        page.locator('#lkmovego').click()
        page.wait_for_selector('#lkmovegroups', timeout=4000)
        moved = page.evaluate("""(ids) => {
          const g = (((lkEnsure().grp||{})[1]||{}).g)||[];
          return {g, host: !!((lkEnsure().grp||{})[1]||{}).host, jordan: g.map(row => row.includes(ids.jordan))};
        }""", {'jordan': ids['Jordan Lee']})
        chk('Jordan goes to the end of target 2 and leaves target 1',
            moved['g'][0]==[ids['Alex River'], ids['Casey Ng']]
            and moved['g'][1]==[ids['Riley Chen'], ids['Sam Archer'], ids['Taylor Brooks'], ids['Jordan Lee']]
            and moved['host'] is True,
            str(moved['g']))
        page.screenshot(path=str(SHOT / 'lingkana-move-done-390.png'))
        scored = page.evaluate("""(arg) => {
          const lg = lkEnsure();
          const before = arg.ends;
          lg.sc[arg.sam] = {1:{e: before.map(e => e.slice()), u: Date.now(), by:'nathe', f:'vert'}};
          const refused = lkMoveArcher(1, arg.sam, 0);
          const after = lg.sc[arg.sam][1].e;
          const still = (((lg.grp||{})[1]||{}).g)[1].includes(arg.sam);
          const copies = Object.keys(lg.sc).filter(id => id===arg.sam).length;
          return {refused, same: JSON.stringify(after)===JSON.stringify(before), still, copies, n: after.length};
        }""", {'sam': ids['Sam Archer'], 'ends': ENDS})
        page.locator('#lkmovenight').select_option('2')
        page.locator('#lkmovenight').select_option('1')
        page.wait_for_selector('#lkmovegroups', timeout=4000)
        sam_row = page.locator('.lk-moverow', has_text='Sam Archer')
        chk('Sam keeps all 3 ends and cannot be moved',
            scored['refused']=='That archer already has scores for this night, so they stay on this target.'
            and scored['same'] is True and scored['still'] is True and scored['copies']==1 and scored['n']==3
            and sam_row.locator('[data-lkmove]').count()==0
            and '3 ends scored' in sam_row.inner_text(),
            str(scored)+' '+sam_row.inner_text())
        page.screenshot(path=str(SHOT / 'lingkana-move-scored-390.png'))
        posted = page.evaluate("""() => (window._posts||[]).filter(p => p.body && p.body.grp).map(p => p.body)""")
        chk('the move was posted to the league relay',
            len(posted)>=1 and posted[-1]['grp']['1']['g'][1][-1]==ids['Jordan Lee'],
            str(posted[-1]['grp']['1']['g'] if posted else None))

        other = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True)
        phone = other.new_page()
        phone.goto(BASE + '/#lk-home', wait_until='domcontentloaded')
        phone.wait_for_timeout(400)
        seen = phone.evaluate("""(arg) => {
          const lg = lkEnsure();
          const night = '2026-11-18';
          Object.entries(arg.ids).forEach(([name, id]) => {
            lkApplyReg({name, id, at: Date.now(), bow:'Recurve'}, lg);
            lg.paid = lg.paid || {}; lg.paid[night] = lg.paid[night] || {}; lg.paid[night][id] = 1;
          });
          lg.grp = {1:{t:1, g:[
            [arg.ids['Alex River'], arg.ids['Casey Ng'], arg.ids['Jordan Lee']],
            [arg.ids['Riley Chen'], arg.ids['Sam Archer'], arg.ids['Taylor Brooks']]
          ]}};
          lg.sc[arg.ids['Sam Archer']] = {1:{e: arg.ends.map(e => e.slice()), u: 5, by:'nathe', f:'vert'}};
          const msg = arg.msg;
          msg.t = Date.now();
          msg.grp['1'].t = msg.t;
          const merged = lgMerge(lg, msg);
          const g = (((lg.grp||{})[1]||{}).g)||[];
          lg.fresh = LK_CLEAR;
          const keptName = lkApplyReg({name:'Wednesday Archer', at: Date.now()}, lg);
          lkFresh(lg);
          const names = (lg.reg[night]||[]).map(r => r.name);
          window._lkScoreIds = g[1].slice();
          window._lkFlowNight = 1;
          window._lgE = {code: lg.code, w: 1, ids: g[1].slice()};
          const me = arg.ids['Riley Chen'];
          try { sessionStorage.setItem('scoretool.lk.scorerId', me); } catch (e) {}
          return {
            merged, g,
            ends: lg.sc[arg.ids['Sam Archer']][1].e,
            clear: lg.clear, freshCut: LK_CLEAR,
            wednesday: names.includes('Wednesday Archer'),
            ada: names.includes('Ada Archer')
          };
        }""", {'ids': ids, 'ends': ENDS, 'msg': posted[-1]})
        chk('the other phone applies the newer groups and keeps Sam\'s 3 ends',
            seen['g'][1][-1]==ids['Jordan Lee']
            and ids['Jordan Lee'] not in seen['g'][0]
            and seen['ends']==ENDS
            and seen['clear']==1794903600000
            and seen['wednesday'] is True and seen['ada'] is False,
            str(seen['g']))
        chk('a non-host cannot move an archer',
            phone.evaluate("""(id) => {
              lkMarkCoHost(false);
              const msg = lkMoveArcher(1, id, 0);
              return {msg, button: !!document.getElementById('lkhostmove'), host: lkCanHost(lkEnsure())};
            }""", ids['Alex River'])=={'msg':'Only the host can move an archer.','button': False, 'host': False})
        nate = page.evaluate("""(id) => {
          lkMarkCoHost(true);
          const before = JSON.stringify((((lkEnsure().grp||{})[1]||{}).g)||[]);
          const msg = lkMoveArcher(1, id, -1);
          lkMarkCoHost(false);
          const after = (((lkEnsure().grp||{})[1]||{}).g)||[];
          return {msg, last: after[after.length-1], before};
        }""", ids['Casey Ng'])
        chk('Nate Evans can move an unscored archer onto a new target',
            nate['msg']=='' and nate['last']==[ids['Casey Ng']], str(nate))
        chk('no page errors', not errs, str(errs[:3]))
        other.close()
        b.close()
finally:
    srv.terminate()

print(f'\n{len(ok)} passed, {len(bad)} failed')
sys.exit(1 if bad else 0)
