#!/usr/bin/env python3
"""390px: ranking card (saved list, and a list that includes a WA rank) and the results paste."""
import json, os, subprocess, sys, time
from playwright.sync_api import sync_playwright
import guard
import freeport
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ART = os.environ.get('SHOT_DIR', '/opt/cursor/artifacts')
os.makedirs(ART, exist_ok=True)
ok, bad = [], []
def chk(n, c):
    (ok if c else bad).append(n)
    print(('PASS ' if c else 'FAIL ') + n, flush=True)
PORT = freeport.get()
srv = subprocess.Popen([sys.executable, '-m', 'http.server', PORT], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(0.8)
WA = {
 "as_of": "2026-10-15",
 "source": "saved",
 "national": {"outdoor": [{"name": "Nathaniel Stride", "club": "Gosnells Archers Inc", "state": "Western Australia", "rank": 1047, "class_rank": 199, "class_size": 331, "age_class": "Open", "gender": "Male", "division": "Compound", "rating": "44.5", "discipline": "outdoor"}], "indoor": [], "field": [], "clout": []},
 "states": {"WA": {"outdoor": [{"name": "Nathaniel Stride", "club": "Gosnells Archers Inc", "state": "Western Australia", "rank": 12, "class_rank": 8, "class_size": 22, "age_class": "Open", "gender": "Male", "division": "Compound", "rating": "44.5", "discipline": "outdoor"}], "indoor": [], "field": [], "clout": []}},
 "archers": {}
}
PASTE = "Discipline\tRound\tDivision\tScore\tDate\tEvent\nOutdoor\tWA 70/720\tOpen Male Compound\t650\t12/03/2026\tState Target\nIndoor\tDiary Barebow Round\tBarebow\t540\t04/07/2026\tIndoor champs\n"
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--headless=new'])
        pg = b.new_page(viewport={'width': 390, 'height': 844})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto('http://127.0.0.1:'+PORT+'/?tester=nathe')
        pg.wait_for_timeout(1200)
        pg.evaluate("""()=>{localStorage.setItem('scoretool.resultsSource.nathe', JSON.stringify({body:'aa', url:'https://archery.org.au/', member:'24601'})); if(typeof S!=='undefined'){S.unlocked=true; if(!S.profile)S.profile='Nathaniel Stride'; save();} }""")
        pg.click('nav [data-v=myarch]')
        pg.wait_for_timeout(400)
        pg.click('[data-go=lab_ranks]')
        pg.wait_for_timeout(800)
        card = pg.locator('#rank-slot')
        chk('saved ranking card is on the rankings screen', card.count()==1)
        text = card.inner_text()
        chk('national class rank from the saved file', '199th' in text and '331' in text and 'National' in text)
        chk('WA line when that state list is empty', 'WA rank is not in this saved list' in text)
        chk('as of date', '15 Oct 2026' in text)
        chk('rank card fits 390px', pg.evaluate('document.documentElement.scrollWidth')<=390)
        pg.locator('#rank-slot').evaluate('e=>e.scrollIntoView({block:"start"})')
        pg.wait_for_timeout(200)
        pg.screenshot(path=os.path.join(ART, 'rankings-saved-390.png'))
        # home must stay free of the card
        pg.click('nav [data-v=home]')
        pg.wait_for_timeout(400)
        chk('home has no ranking card', pg.locator('#rank-slot').count()==0)
        pg.click('nav [data-v=tools]')
        pg.wait_for_timeout(300)
        pg.click('[data-go=lab_results]')
        pg.wait_for_timeout(500)
        chk('diary opens in a new tab', pg.get_attribute('#rsdiaryopen', 'href')=='https://www.archersdiary.com/Performance.aspx' and pg.get_attribute('#rsdiaryopen', 'target')=='_blank')
        chk('saved AA number is shown with copy', pg.locator('#rsaa').inner_text()=='24601' and pg.locator('#rscopy').count()==1)
        pg.fill('#rsdiarypaste', PASTE)
        pg.click('#rsdiaryread')
        pg.wait_for_timeout(400)
        prev = pg.locator('#rsdiarypreview').inner_text()
        chk('preview shows both bests', 'WA 70/720' in prev and '650' in prev and 'Barebow' in prev and '540' in prev)
        chk('paste screen fits 390px', pg.evaluate('document.documentElement.scrollWidth')<=390)
        pg.screenshot(path=os.path.join(ART, 'results-paste-390.png'))
        # a non-diary import must survive the confirm
        pg.evaluate("""()=>{const k='scoretool.imported.nathe'; localStorage.setItem(k, JSON.stringify([{id:'keep', round:'Holt', date:'2026-01-02', score:800, event:'Typed', imported:true}]));}""")
        pg.click('#rsdiaryconfirm')
        pg.wait_for_timeout(400)
        saved = pg.evaluate("""()=>{const a=JSON.parse(localStorage.getItem('scoretool.imported.nathe')||'[]'); return a.map(r=>[r.round, r.score, r.division, r.discipline, !!r.diary]);}""")
        chk('confirm saves diary rows and keeps the other import', any(r[0]=='Holt' and r[4] is False for r in saved))
        chk('compound and barebow both saved', any(r[0]=='WA 70/720' and r[2]=='Open Male Compound' and r[3]=='Outdoor' for r in saved) and any(r[0]=='Diary Barebow Round' and r[2]=='Barebow' for r in saved))
        chk('confirm note', 'replaces' in pg.locator('#rsdiarydone').inner_text().lower())
        pg.click('nav [data-v=myarch]')
        pg.wait_for_timeout(300)
        pg.click('[data-go=lab_analysis]')
        pg.wait_for_timeout(900)
        bows = pg.locator('#bscard [data-bsb]').all_inner_texts()
        chk('bow tabs stay separate', any('Compound' in t for t in bows) and any('Barebow' in t for t in bows))
        pg.click('#bscard [data-bsb="Barebow"]')
        pg.wait_for_timeout(500)
        rec = pg.locator('#bscard').inner_text()
        chk('barebow tab shows the barebow import', 'Diary Barebow Round' in rec and 'WA 70/720' not in rec)
        pg.click('nav [data-v=tools]')
        pg.wait_for_timeout(300)
        pg.click('[data-go=lab_results]')
        pg.wait_for_timeout(400)
        # second paste replaces the diary rows and does not duplicate
        pg.fill('#rsdiarypaste', "Round\tDate\tScore\tDivision\tDiscipline\tEvent\nDiary Compound Round\t01/02/2026\t600\tCompound\tOutdoor\tClub\n")
        pg.click('#rsdiaryread')
        pg.wait_for_timeout(300)
        pg.click('#rsdiaryconfirm')
        pg.wait_for_timeout(300)
        saved2 = pg.evaluate("""()=>JSON.parse(localStorage.getItem('scoretool.imported.nathe')||'[]').map(r=>r.round)""")
        chk('re-import replaces diary rows', saved2.count('Diary Compound Round')==1 and 'WA 70/720' not in saved2 and 'Diary Barebow Round' not in saved2 and 'Holt' in saved2)
        pg.click('#rssyncpaste')
        pg.wait_for_timeout(300)
        chk('sync paste still finds the csv box', pg.locator('#rsimport').count()==1 and pg.locator('#rspaste').count()==1)
        pg.click('nav [data-v=myarch]')
        pg.wait_for_timeout(300)
        pg.click('[data-go=lab_analysis]')
        pg.wait_for_timeout(900)
        bows2 = pg.locator('#bscard [data-bsb]').all_inner_texts()
        chk('barebow tab leaves when that division is replaced', not any('Barebow' in t for t in bows2))
        has = pg.evaluate("""()=>[...document.querySelectorAll('#bssel option')].some(o=>o.textContent.includes('Diary Compound Round'))""")
        chk('compound personal bests include the pasted round', has)
        b.close()
    # second page: fixture with a WA rank, so the card can show both numbers
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--headless=new'])
        pg = b.new_page(viewport={'width': 390, 'height': 844})
        pg.route('**/data/rankings.json', lambda r: r.fulfill(status=200, content_type='application/json', body=json.dumps(WA)))
        pg.goto('http://127.0.0.1:'+PORT+'/?tester=nathe')
        pg.wait_for_timeout(1200)
        pg.click('nav [data-v=myarch]')
        pg.wait_for_timeout(300)
        pg.click('[data-go=lab_ranks]')
        pg.wait_for_timeout(800)
        text = pg.locator('#rank-slot').inner_text()
        chk('card shows national and WA class rank', '199th' in text and '331' in text and '8th' in text and '22' in text and 'WA' in text)
        chk('wa card fits 390px', pg.evaluate('document.documentElement.scrollWidth')<=390)
        pg.locator('#rank-slot').evaluate('e=>e.scrollIntoView({block:"start"})')
        pg.wait_for_timeout(200)
        pg.screenshot(path=os.path.join(ART, 'rankings-wa-390.png'))
        b.close()
    chk('no page errors on the first screen', not errs)
finally:
    srv.terminate()
print('rankings card: PASS', len(ok), 'FAIL', len(bad))
if bad:
    print('FAIL', bad)
sys.exit(1 if bad else 0)
