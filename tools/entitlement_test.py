# Free score card is not behind a paywall. Plus and Pro are upgrades.
# A phone that already has unlocked:true keeps full access and that flag is not rewritten.
# With no sign-in, entitlementVerify grants no paid tier.
# Lingkana Register: the Register button is green when it can be used, and dull when it is disabled. 390px.
import json, os, subprocess, sys, time
from playwright.sync_api import sync_playwright
import guard
import freeport
ok=[]; bad=[]
def chk(n,c):
    (ok if c else bad).append(n)
    print(('PASS ' if c else 'FAIL ')+n)
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT=freeport.get()
SHOTS='/opt/cursor/artifacts'
os.makedirs(SHOTS, exist_ok=True)
srv=subprocess.Popen([sys.executable,'-m','http.server',PORT], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(0.4)
def css(page, sel):
    return page.evaluate("""sel=>{
      const el=document.querySelector(sel); if(!el) return null;
      const cs=getComputedStyle(el);
      return {bg:cs.backgroundColor, color:cs.color, op:cs.opacity, dis:!!el.disabled};
    }""", sel)
try:
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--headless=new'])
        pg=b.new_page(viewport={'width':390,'height':844})
        pg.goto(f'http://127.0.0.1:{PORT}/?tester=nathe')
        pg.wait_for_timeout(1200)
        pg.evaluate("""()=>{ localStorage.setItem('scoretool.whatsnew.seen', (window.WHATSNEW&&WHATSNEW[0]&&WHATSNEW[0].v)||'x'); localStorage.setItem('scoretool.cal.nathe.prompted','1'); localStorage.setItem('scoretool.theme','dark'); }""")
        # fresh record, unlocked left false
        pg.evaluate("""()=>{ const k='scoretool.v1'; const d=JSON.parse(localStorage.getItem(k)||'{}'); d.unlocked=false; d.profile=d.profile||'Nathaniel Stride'; localStorage.setItem(k, JSON.stringify(d)); }""")
        pg.reload(); pg.wait_for_timeout(1200)
        chk('no unlock button', pg.locator('#unlock').count()==0 and pg.get_by_text('Demo unlock').count()==0)
        chk('unpaid phone opens on the score card', pg.locator('#gate').count()==0 and pg.locator('.hub-score').count()>=1 and pg.evaluate('S.unlocked')==False and pg.locator('#tabs').is_visible())
        pg.screenshot(path=os.path.join(SHOTS,'free-home-390.png'))
        pg.locator('.hub-score').first.click(); pg.wait_for_timeout(500)
        chk('score card lists rounds and can save', pg.locator('#st').count()==1 and pg.get_by_text('Saved on this phone').count()==1 and pg.locator('#rd').count()==1)
        pg.screenshot(path=os.path.join(SHOTS,'free-score-390.png'))
        pg.evaluate("nav('lab_leagues')"); pg.wait_for_timeout(300)
        chk('league scoring is not behind a paywall', pg.locator('#tierlock').count()==0 and pg.locator('#lgcard').count()==1)
        pg.evaluate("nav('lab_analysis')"); pg.wait_for_timeout(300)
        chk('analysis asks for Plus', 'AVAILABLE ON PLUS' in pg.locator('#tierlock').inner_text().upper() and pg.locator('#tierplans').count()==1)
        pg.screenshot(path=os.path.join(SHOTS,'plus-lock-390.png'))
        pg.locator('#tierplans').click(); pg.wait_for_timeout(300)
        chk('plans show Plus and Pro monthly prices', pg.locator('#plans').count()==1 and 'A$4.99 a month' in pg.locator('#plusprice').inner_text() and 'A$7.99 a month' in pg.locator('#proprice').inner_text())
        pg.locator('#billyear').click(); pg.wait_for_timeout(100)
        chk('yearly prices are A$49 and A$79', pg.locator('#plusprice').inner_text()=='A$49 a year' and pg.locator('#proprice').inner_text()=='A$79 a year')
        pg.locator('#billmonth').click(); pg.wait_for_timeout(80)
        pg.screenshot(path=os.path.join(SHOTS,'plans-390.png'))
        before=pg.evaluate("localStorage.getItem('scoretool.v1')")
        r=pg.evaluate("entitlementVerify()")
        after=pg.evaluate("localStorage.getItem('scoretool.v1')")
        chk('verify grants nothing and does not rewrite storage', r.get('ok')==False and r.get('reason')=='signed-out' and before==after and pg.evaluate('S.unlocked')==False)
        # someone already unlocked keeps that flag and the app
        pg.evaluate("""()=>{ S.unlocked=true; S.profile='Nathaniel Stride'; S.sessions=(S.sessions||[]).filter(s=>s.id!='keepme'); S.sessions.push({id:'keepme',round:'x',ends:[['10']],date:'2026-11-01',pos:[],note:''}); save(); }""")
        pg.reload(); pg.wait_for_timeout(1200)
        chk('an already unlocked phone still opens', pg.locator('#gate').count()==0 and pg.locator('#tabs').is_visible() and pg.evaluate('S.unlocked')==True)
        chk('their saved session is still there', pg.evaluate("(S.sessions||[]).some(s=>s.id=='keepme')")==True)
        # paid plan: server says Pro, the legacy flag stays false, the app opens
        pg.evaluate("""()=>{ S.unlocked=false; S.profile='Nathaniel Stride'; save(); localStorage.setItem('scoretool.stripe.auth', JSON.stringify({access_token:'test-token-abcdefghijklmnopqrstuvwxyz',refresh_token:'',email:'ada@example.com'})); localStorage.removeItem('scoretool.stripe.entitlement'); }""")
        state={'tier':'pro'}
        def entitlement(route):
            if route.request.method=='OPTIONS':
                route.fulfill(status=204, headers={'access-control-allow-origin':'*','access-control-allow-headers':'authorization, content-type, apikey'})
                return
            route.fulfill(status=200, content_type='application/json', headers={'access-control-allow-origin':'*'},
                body=json.dumps({'valid':True,'server':True,'tier':state['tier'],'status':'active','current_period_end':'2099-01-01T00:00:00.000Z','customer_id':'cus_test'}))
        pg.route('https://sllsqpfqwckwtljzjxli.supabase.co/**', entitlement)
        paid=pg.evaluate("entitlementVerify()")
        flag=pg.evaluate('S.unlocked')
        pg.evaluate("""()=>{ try{localStorage.setItem('scoretool.whatsnew.seen', WHATSNEW[0].v)}catch(e){} nav('home') }""")
        pg.wait_for_timeout(400)
        chk('a valid Pro entitlement is stored without setting the legacy flag', paid.get('ok')==True and paid.get('tier')=='pro' and flag==False and pg.evaluate('tierOf()')=='pro' and pg.locator('#gate').count()==0)
        chk('manage subscription is on the unlocked phone', pg.locator('#planmanage').count()==1)
        pg.screenshot(path=os.path.join(SHOTS,'unlocked-390.png'))
        state['tier']='plus'
        second=pg.evaluate("entitlementVerify().then(v=>{nav('lab_tune'); return {v:v, tier:tierOf(), view:view, lock:(document.getElementById('tierlock')||{}).innerText||''}})")
        chk('Plus does not open the Tune helper', second.get('v',{}).get('tier')=='plus' and second.get('tier')=='plus' and 'AVAILABLE ON PRO' in (second.get('lock') or '').upper())
        # founding / tester grant still opens on a fresh phone
        ctx=b.new_context(viewport={'width':390,'height':844})
        ph=ctx.new_page()
        ph.goto(f'http://127.0.0.1:{PORT}/?tester=phill')
        ph.wait_for_timeout(1200)
        chk('a tester grant still opens', ph.locator('#gate').count()==0 and ph.evaluate('S.unlocked')==True and ph.evaluate("tierOf()")=='founding')
        ctx.close()
        # register buttons
        pg.evaluate("document.body.classList.add('lk-flow'); lkRegisterView()")
        pg.wait_for_timeout(250)
        on=css(pg,'#lkreggo')
        back=css(pg,'#lkregback')
        chk('Register is green and enabled', on and on['dis']==False and on['bg']=='rgb(46, 125, 50)' and on['color']=='rgb(255, 255, 255)')
        chk('Back is a light button, not a dull grey', back and back['bg']=='rgb(255, 255, 255)' and back['color']=='rgb(17, 24, 39)')
        pg.evaluate("document.getElementById('lkreggo').scrollIntoView({block:'center'})")
        pg.wait_for_timeout(100)
        pg.screenshot(path=os.path.join(SHOTS,'lk-register-active-390.png'))
        pg.evaluate("document.getElementById('lkreggo').disabled=true")
        pg.wait_for_timeout(80)
        off=css(pg,'#lkreggo')
        chk('disabled Register is not green', off and off['dis']==True and off['bg']!='rgb(46, 125, 50)' and off['bg']=='rgb(55, 65, 81)')
        pg.screenshot(path=os.path.join(SHOTS,'lk-register-disabled-390.png'))
        b.close()
finally:
    srv.terminate()
print(f'entitlement checks: PASS {len(ok)} FAIL {len(bad)}')
[print('FAIL',x) for x in bad]
sys.exit(1 if bad else 0)
