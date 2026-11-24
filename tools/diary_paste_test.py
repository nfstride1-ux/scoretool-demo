#!/usr/bin/env python3
"""Paste parser for Archer's Diary bests. Several clipboard shapes, no network."""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JS = os.path.join(ROOT, 'diarypaste.js')
ok, bad = [], []
def chk(n, c):
    (ok if c else bad).append(n)
    print(('PASS ' if c else 'FAIL ') + n)

SAMPLES = {
 'tsv': "Discipline\tRound\tDivision\tScore\tDate\tEvent\nOutdoor\tWA 70/720\tOpen Male Compound\t650\t12/03/2026\tState Target\nIndoor\tWA Indoor 18m\tRecurve\t540\t2026-07-04\tIndoor champs\n",
 'html': """<html><body><!--StartFragment--><table><tr><th>Event</th><th>Date</th><th>Score</th><th>Division</th><th>Round</th><th>Discipline</th></tr>
<tr><td>Club shoot</td><td>3 Oct 2026</td><td><b>1,336</b></td><td>Compound</td><td>WA 90/1440</td><td>Outdoor</td></tr>
<tr><td>Field day</td><td>17/10/2026</td><td>351</td><td>Barebow Recurve</td><td>Field Red</td><td>Field</td></tr>
</table><!--EndFragment--></body></html>""",
 'spaces': "Discipline  Round           Division  Score  Date          Event\nOutdoor     WA 50/720       Compound  632    05/09/2026    Saturday club\nClout       Aus Clout 180m  Compound  331    9 Nov 2026    State Clout\n",
 'dupes': "Round\tDate\tScore\tEvent\tDivision\tDiscipline\nWA 70/720\t12/03/2026\t650\tState Target\tCompound\tOutdoor\nWA 70/720\t12/03/2026\t650\tState Target\tCompound\tOutdoor\nnope\t\t\t\t\t\n",
 'messy': "<table><tr><td>Discipline</td><td>Round</td><td>Division</td><td>Score</td><td>Date</td><td>Event</td></tr><tr><td>Indoor&nbsp;</td><td>Australian Indoor 18m</td><td>Open&nbsp;Compound</td><td>283</td><td>30/07/2026</td><td>Thursday&amp; night</td></tr></table>",
}

RUNNER = r'''
const fs=require('fs'), vm=require('vm');
const ctx={window:{}, console};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(process.argv[1],'utf8'), ctx);
const samples=JSON.parse(process.argv[2]);
const out={};
for(const k of Object.keys(samples)) out[k]=ctx.window.parseDiaryPaste(samples[k]);
process.stdout.write(JSON.stringify(out));
'''
raw = subprocess.check_output(['node', '-e', RUNNER, JS, json.dumps(SAMPLES)], text=True)
got = json.loads(raw)

tsv = got['tsv']['rows']
chk('tsv two rows', len(tsv)==2 and got['tsv']['skipped']==0)
chk('tsv outdoor compound', tsv[0]['discipline']=='Outdoor' and tsv[0]['round']=='WA 70/720' and tsv[0]['division']=='Open Male Compound' and tsv[0]['score']==650 and tsv[0]['date']=='2026-03-12' and tsv[0]['event']=='State Target')
chk('tsv iso date and recurve', tsv[1]['date']=='2026-07-04' and tsv[1]['division']=='Recurve' and tsv[1]['discipline']=='Indoor' and tsv[1]['score']==540)

html = got['html']['rows']
chk('html columns in any order', len(html)==2 and html[0]['round']=='WA 90/1440' and html[0]['score']==1336 and html[0]['date']=='2026-10-03' and html[0]['division']=='Compound' and html[0]['event']=='Club shoot')
chk('html field and barebow', html[1]['discipline']=='Field' and html[1]['division']=='Barebow Recurve' and html[1]['score']==351 and html[1]['date']=='2026-10-17')

sp = got['spaces']['rows']
chk('multi-space two rows', len(sp)==2 and sp[0]['round']=='WA 50/720' and sp[0]['score']==632 and sp[0]['date']=='2026-09-05')
chk('multi-space clout round keeps its spaces', sp[1]['discipline']=='Clout' and sp[1]['round']=='Aus Clout 180m' and sp[1]['date']=='2026-11-09' and sp[1]['score']==331)

du = got['dupes']
chk('duplicate line collapses', len(du['rows'])==1 and du['skipped']>=1 and du['rows'][0]['score']==650)
chk('blank score line is skipped', du['skipped']>=2)

me = got['messy']['rows']
chk('nbsp and amp in html cells', len(me)==1 and me[0]['discipline']=='Indoor' and me[0]['division']=='Open Compound' and me[0]['event']=='Thursday& night' and me[0]['score']==283 and me[0]['date']=='2026-07-30')

print('diary paste: PASS', len(ok), 'FAIL', len(bad))
sys.exit(1 if bad else 0)
