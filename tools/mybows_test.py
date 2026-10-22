# My bows: 390px and 1366px, no console errors. Suggests 'Add your Hoyt Concept X' from a setup name, adds it, fills the
# Arrow chooser (IBO, draw weight, draw length), then overrides; Calculators fill; tuning snapshot on a new session; old data unchanged.
import subprocess,sys,time,os,json
from playwright.sync_api import sync_playwright
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)));import nm_seed
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));SH=os.path.join(ROOT,'shots-fix1022')
URL=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:8767/'
ok=[];bad=[]
def chk(n,c):(ok if c else bad).append(n)
srv=subprocess.Popen([sys.executable,'-m','http.server','8767'],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
OLD="(()=>{const d=JSON.parse(localStorage.getItem('scoretool.v1')||'{}');return JSON.stringify({b:(d.bows||[]).filter(x=>x.id=='bOLD'),s:d.sessions,t:d.tune,u:d.setup})})()"
with sync_playwright() as p:
  b=p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--headless=new'])
  for w,hh in [(390,844),(1366,900)]:
    tag=f'{w}px';ctx=b.new_context(viewport={'width':w,'height':hh});pg=ctx.new_page();errs=[]
    pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append(m.text))
    pg.goto(URL);pg.wait_for_timeout(1200);nm_seed.pick(pg,'nathe');pg.wait_for_timeout(500)
    if pg.get_by_text('Demo unlock').count():pg.get_by_text('Demo unlock').first.click();pg.wait_for_timeout(500)
    for _ in range(3):
      if pg.locator('nav [data-v=home]').is_visible():break
      pg.locator('#app button').first.click();pg.wait_for_timeout(400)
    pg.evaluate("()=>{const d=JSON.parse(localStorage.getItem('scoretool.v1')||'{}');d.bows=d.bows||[];if(!d.bows.find(x=>x.id=='bOLD'))d.bows.push({id:'bOLD',archer:d.profile,name:'Hoyt Concept X',extra:[],marks:{'70m':{v:'5.2'}}});localStorage.setItem('scoretool.v1',JSON.stringify(d))}")
    pg.reload();pg.wait_for_timeout(1500)
    for _ in range(3):
      if pg.locator('nav [data-v=home]').is_visible():break
      pg.locator('#app button').first.click();pg.wait_for_timeout(400)
    pg.add_style_tag(content='nav.tabs button:not([data-v=home]):not([data-v=score]):not([data-v=myarch]):not([data-v=clubs]):not([data-v=tools]){display:none!important}')
    before=pg.evaluate(OLD)
    pg.click('nav [data-v=myarch]');pg.wait_for_timeout(400);chk(tag+' My bows row',pg.locator('[data-go=lab_mybows]').count()==1)
    pg.click('[data-go=lab_mybows]');pg.wait_for_timeout(700)
    chk(tag+' back button',pg.locator('.labbar .labback').count()==1)
    chk(tag+' suggests Hoyt Concept X',pg.get_by_text('Add your Hoyt Concept X').count()>0)
    chk(tag+' no emoji',not any(ord(c)>0x1F000 for c in pg.inner_text('#app')))
    if w==390:pg.screenshot(path=os.path.join(SH,'mybows-suggest-390.png'))
    pg.click('[data-sug=hoyt-cx40]');pg.wait_for_timeout(500)
    chk(tag+' CX40 specs filled',pg.input_value('#mb_speed')=='327' and pg.input_value('#mb_bh')=='7.25' and pg.input_value('#mb_ata')=='40')
    chk(tag+' let-off left blank',pg.input_value('#mb_lo')=='')
    pg.fill('#mb_dw','58');pg.fill('#mb_dl','29.5');pg.click('#mbsave');pg.wait_for_timeout(500)
    chk(tag+' saved',pg.get_by_text('Concept X 40').count()>0 and pg.locator('#mbform').count()==0)
    st=pg.evaluate("JSON.parse(localStorage.getItem('scoretool.v1')).bowSpec")
    chk(tag+' attached to existing setup',list(st.keys())==['bOLD'])
    if w==390:pg.screenshot(path=os.path.join(SH,'mybows-390.png'))
    pg.click('.labback');pg.wait_for_timeout(300);pg.click('nav [data-v=tools]');pg.wait_for_timeout(400)
    pg.get_by_text('Arrow chooser').first.click();pg.wait_for_timeout(500)
    pg.select_option('#ac_mybow','bOLD');pg.wait_for_timeout(500)
    chk(tag+' chooser compound',pg.locator('[data-seg=bow][data-val=compound][aria-pressed=true]').count()==1)
    chk(tag+' chooser filled',pg.input_value('#ac_ibo')=='327' and pg.input_value('#ac_dw')=='58' and pg.input_value('#ac_dl')=='29.5')
    chk(tag+' note',pg.locator('#mbnote').count()==1)
    if w==390:pg.screenshot(path=os.path.join(SH,'mybows-chooser-390.png'))
    pg.fill('#ac_dw','60');pg.press('#ac_dw','Tab');pg.wait_for_timeout(300);pg.fill('#ac_ibo','335');pg.press('#ac_ibo','Tab');pg.wait_for_timeout(300)
    chk(tag+' override kept',pg.input_value('#ac_dw')=='60' and pg.input_value('#ac_ibo')=='335' and pg.input_value('#ac_dl')=='29.5')
    pg.click('.labback');pg.wait_for_timeout(300)
    pg.get_by_text('Calculators').first.click();pg.wait_for_timeout(400);pg.select_option('#c_mybow','bOLD');pg.wait_for_timeout(400)
    chk(tag+' calc filled',pg.input_value('#c_ibo')=='327' and pg.input_value('#c_dw')=='58' and pg.input_value('#c_dl')=='29.5')
    pg.fill('#c_dw','62');pg.press('#c_dw','Tab');pg.wait_for_timeout(300);chk(tag+' calc override',pg.input_value('#c_dw')=='62')
    pg.click('.labback');pg.wait_for_timeout(300);pg.get_by_text('Arrow optimizer').first.click();pg.wait_for_timeout(500)
    chk(tag+' tuning picker',pg.locator('#t_mybow').count()==1)
    pg.select_option('#t_mybow','bOLD');pg.click('#tgo');pg.wait_for_timeout(500)
    t=pg.evaluate("(()=>{const d=JSON.parse(localStorage.getItem('scoretool.v1'));return d.tune[d.tune.length-1]})()")
    chk(tag+' tuning snapshot',t.get('bowSpec',{}).get('speed')=='327' and t['bowSpec']['dw']=='58')
    after=pg.evaluate(OLD);a=json.loads(after);bf=json.loads(before)
    chk(tag+' old data unchanged',a.get('b')==bf.get('b') and a.get('s')==bf.get('s') and a.get('u')==bf.get('u') and (a.get('t') or [])[:len(bf.get('t') or [])]==(bf.get('t') or []))
    pg.click('nav [data-v=myarch]');pg.wait_for_timeout(300);pg.click('[data-go=lab_analysis]') if pg.locator('[data-go=lab_analysis]').count() else None;pg.wait_for_timeout(1500)
    chk(tag+' PB card no emoji',not any(ord(c)>0x1F000 for c in pg.inner_text('#app')))
    chk(tag+' no console errors',not errs);errs and print(errs[:5])
    ctx.close()
  b.close()
srv.terminate()
print('OK',len(ok));print('FAIL',bad)
