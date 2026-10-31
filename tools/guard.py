# Imported by every test that loads the app (1 Nov 2026). Every browser context and page then has the ntfy.sh relay stubbed and the
# service worker blocked, so no test can reach the real relay or be served an old cached copy of the app.
# A test's own ntfy.sh route (added later) still wins, and a test that sets service_workers itself (offline_test needs 'allow') keeps it.
import re
from playwright.sync_api import Browser
RELAY=re.compile(r'^https?://([^/]*\.)?ntfy\.sh(/|$)')
STUBBED=[]
def _stub(route):
    STUBBED.append(route.request.url)
    route.fulfill(status=200,body='',headers={'access-control-allow-origin':'*','content-type':'application/json'})
def _arm(ctx):
    ctx.route(RELAY,_stub);return ctx
if not getattr(Browser,'_st_guard',False):
    _nc=Browser.new_context;_np=Browser.new_page
    def _new_context(self,*a,**k):
        k.setdefault('service_workers','block');return _arm(_nc(self,*a,**k))
    def _new_page(self,*a,**k):
        k.setdefault('service_workers','block');pg=_np(self,*a,**k);_arm(pg.context);return pg
    Browser.new_context=_new_context;Browser.new_page=_new_page;Browser._st_guard=True
