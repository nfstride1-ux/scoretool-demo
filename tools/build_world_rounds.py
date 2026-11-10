#!/usr/bin/env python3
"""Build world_data.js from the 11 Nov 2026 catalogue. Confirmed rows only. Do not invent values."""
import csv, json, re, sys
from pathlib import Path

CSV = Path('/workspace/scoretool/world-rounds-2026-11-11.csv')
OUT = Path('/workspace/wt-c10/world_data.js')

ALREADY = {
  'Australian Indoor 1': 'Australian Indoor 18m',
  'AGB Vegas 300': 'Vegas 300 (18 m)',
  'NFAA Vegas 300': 'Vegas 300',
  'WA 18m Indoor': 'Indoor WA 18m',
  'WA 25m Indoor': 'Indoor WA 25m',
  'WA Combined Indoor (25m + 18m)': 'Indoor WA Combined 25m + 18m',
  'AA 30/720': '30/720',
  'AA 40/1440': '40/1440',
  'AA 40/720': '40/720',
  'AA 50/1440': 'AA 50/1440 (50/40/30/20m)',
  'AA50/720 (also WABB50/720)': '50/720',
  'Canberra': 'WA 60/900 (60/50/40m)',
  'Junior Canberra': 'Junior Canberra (40/30/20m)',
  'Short Canberra': 'Short Canberra (50/40/30m)',
  'Sydney': 'Sydney',
  'WA50/720 (80 cm)': 'WA 50/720 (80 cm)',
  'WA 30m Round (Barebow U15)': '30/720',
  'WA 40m Round (U15)': '40/720',
  'WA 50m Round (Barebow)': '50/720',
  'WA 50m Round (Compound)': 'WA 720 (50m Compound)',
  'WA 60/1440 (Fremantle)': 'WA 60/1440 (60/50/40/30m)',
  'WA 60/900': 'WA 60/900 (60/50/40m)',
  'WA 60m Round': 'WA 720 (60m)',
  'WA 70/1440': 'WA 70/1440 (70/60/50/30m)',
  'WA 70m Round': 'WA 720 (70m)',
  'WA 90/1440': 'WA 90/1440 (90/70/50/30m)',
  'WA Field 12 Unmarked + 12 Marked': 'WA Field 12 Unmarked + 12 Marked',
  'WA Field 24 Marked': 'WA Field 24 Marked',
  'WA Field 24 Unmarked': 'WA Field 24 Unmarked',
  'ABA Interclub 3D (3-arrow half then 1-arrow half)': 'ABA Interclub 3D (40 targets: 3-arrow half, then 1-arrow half)',
  'Adelaide': 'Adelaide', 'Brisbane': 'Brisbane', 'Darwin': 'Darwin', 'Drake': 'Drake',
  'Geelong': 'Geelong', 'Grange': 'Grange', 'Hobart': 'Hobart', 'Holt': 'Holt',
  'Launceston': 'Launceston', 'Long Brisbane': 'Long Brisbane', 'Long Sydney': 'Long Sydney',
  'Melbourne': 'Melbourne', 'Newcastle': 'Newcastle', 'Perth': 'Perth', 'Samford': 'Samford',
  'Short Adelaide': 'Short Adelaide', 'Townsville': 'Townsville', 'Wollongong': 'Wollongong',
}
# Names that share a pre-existing key (C10) but are 'new' in the CSV, not part of the original 48.
SHARE_KEY = {
  'IFAA Field': 'IFAA Field Round',
  'IFAA Hunter': 'IFAA Hunter Round',
}


def status(v):
    vl = (v or '').lower()
    if 'unconfirmed' in vl: return 'unconfirmed'
    if vl.startswith('already'): return 'already'
    if 'historical' in vl: return 'historical'
    return 'new'

def scheme(r):
    s = (r['scoring'] or '').lower()
    name = r['name']
    nl = name.lower()
    if 'gold scoring area +20' in s: return 'special1'
    if 'aiming spot 15' in s or 'same as foresters' in s: return 'foresters'
    if s.startswith('kill 10, wound 5'): return 'natanimal'
    if 'first arrow 21' in s: return 'nfaa-animal'
    if '1st arrow 20 kill / 18' in s or '20/18, 16/14, 12/10' in s or 'same as marked animal' in s: return 'ifaa-animal'
    if '1st arrow 20 kill / 16' in s: return 'big-game'
    if '11 / 10 / 8 / 5 (book 4)' in s: return 'wa3d'
    if '11 / 10 / 8 / 5 / 0' in s: return 'ibo'
    if '12 / 10 / 8 / 5' in s: return 'asa'
    if 'kill 20, vital 16' in s: return 'ifaa-3d-hunt'
    if 'both arrows count: kill 10' in s: return 'ifaa-3d-std'
    if '11-10-8 per arrow' in s: return 'nfaa-marked3d'
    if '12-10-8 for the three rings' in s: return 'nfaa-unmarked3d'
    if 'arrow 1: a/b/c' in s: return 'aba'
    if 'x = 5 points, then 5, 4, 3, 2, 1' in s: return 'aa-field'
    if 'same as field: 5-4-3' in s or (r['body']=='IFAA' and '5 for the spot' in s and '2, 1' not in s):
        return 'ifaa53'
    if '5, 4, 3, 2, 1 from the centre' in s: return 'ifaa51'  # Expert
    if 'worcester' in nl or '5, 4, 3, 2, 1 from the centre white' in s or ( '5, 4, 3, 2, 1 from the spot' in s):
        return 'worcester'
    if 'spot 5, then 4-3-2-1' in s: return 'nfaa-indoor'
    if '5 for the centre spot' in s: return 'nfaa-field'
    if 'portsmouth' in nl: return 'portsmouth'
    if '5-zone imperial' in s or s.startswith('5-zone 9-7-5-3-1'): return 'imperial5'
    if 'clout flag' in s or r['category']=='Clout': return 'clout'
    if 'organiser-set' in (r['ends_or_targets'] or '').lower() or r['max']=='':
        return 'config3d'
    return 'wa10'

def parse_ape(r):
    s = r['arrows_per_end'] or ''
    if 'not stated in Schedule 9A' in s: return 6
    if '10 ends of 3' in s: return 3
    if '6-arrow ends would be' in s: return 6
    m = re.match(r'^(\d+)\b', s.strip())
    if m: return int(m.group(1))
    if 'up to 3' in s: return 3
    if '1 to 4' in s: return 4  # Foresters max; per-target apes set below
    return None

def parse_ends(r, ape):
    s = r['ends_or_targets'] or ''
    if 'organiser-set' in s.lower():
        return None  # configurable
    m = re.search(r'(\d+)\s+ends', s)
    if m: return int(m.group(1))
    m = re.search(r'(\d+)\s+targets', s)
    if m: return int(m.group(1))
    m = re.search(r'(\d+)\s+arrows', s)
    if m and ape:
        arrows = int(m.group(1))
        if arrows % ape == 0:
            return arrows // ape
    return None

def parse_max(r):
    s = (r['max'] or '').strip()
    if not s: return None
    if s.isdigit(): return int(s)
    return None

def parse_blocks(r, ape):
    """Parse simple 'N arrows at D m/yd on F cm' lists. Leave None if not a clean target list."""
    d = r['distances'] or ''
    # Mini Canberra / VI Outdoor / 1440-style
    parts = re.findall(r'(\d+)\s+arrows at\s+(\d+)\s*(m|yd|yards)\s*(?:\((\d+)\s*cm\))?', d, re.I)
    # "36 at 60 cm, 36 at 80 cm" (same distance)
    if not parts:
        # 36 at 60 cm, 36 at 80 cm, 36 at 80 cm, 36 at 122 cm  (VI Outdoor all 30 m)
        alt = re.findall(r'(\d+)\s+at\s+(\d+)\s*cm', d, re.I)
        if alt and 'all at' in d.lower():
            dm = re.search(r'all at\s+(\d+)\s*m', d, re.I)
            dist = int(dm.group(1)) if dm else None
            if dist is not None and ape:
                blocks=[]
                for n, cm in alt:
                    ends = int(n)//ape
                    blocks.append({'dist':dist,'unit':'m','size':int(cm),'type':'full','ends':ends})
                return blocks
        # "30 arrows at 30 m; 30 at 20 m; 30 at 10 m, all 122 cm"
        alt2 = re.findall(r'(\d+)\s+(?:arrows\s+)?at\s+(\d+)\s*m', d, re.I)
        face = re.search(r'all\s+(\d+)\s*cm', d, re.I)
        if alt2 and face and ape:
            cm=int(face.group(1))
            return [{'dist':int(m),'unit':'m','size':cm,'type':'full','ends':int(n)//ape} for n,m in alt2]
    if parts and ape:
        blocks=[]
        for n, dist, unit, cm in parts:
            unit='yd' if unit.lower().startswith('yd') else 'm'
            size=int(cm) if cm else None
            if not size:
                fm=re.search(r'all\s+(\d+)\s*cm', d, re.I)
                size=int(fm.group(1)) if fm else None
            blocks.append({'dist':int(dist),'unit':unit,'size':size or 122,'type':'full','ends':int(n)//ape})
        if blocks: return blocks
    # single distance "30 m" / "20 yards"
    m=re.match(r'^\s*(\d+)\s*(m|yards|yd)\b', d, re.I)
    if m and ape and parse_ends(r,ape):
        unit='yd' if m.group(2).lower().startswith('yd') else 'm'
        # face size
        fm=re.search(r'(\d+)\s*cm', r['face'] or '')
        size=int(fm.group(1)) if fm else (40 if r['category']=='Indoor' else 122)
        typ='6-ring' if '6-ring' in (r['face'] or '') else 'full'
        return [{'dist':int(m.group(1)),'unit':unit,'size':size,'type':typ,'ends':parse_ends(r,ape)}]
    return None

def foresters_apes():
    # CSV: unit 3x4, 4x3, 4x2, 3x1 shots; two units
    u = [4]*3 + [3]*4 + [2]*4 + [1]*3
    return u + u

def aliases(r, key):
    out=[]
    name=r['name']
    if name != key: out.append(name)
    if name=='AA50/720 (also WABB50/720)':
        out += ['AA50/720','WABB50/720','50/720','WABB 50/720']
    if name=='WA50/720 (80 cm)':
        out += ['WA50/720','WA 50/720']
    if name=='Canberra':
        out += ['Canberra','WA 60/900']
    if name=='WA 60/900':
        out += ['Canberra']
    if 'Vegas' in name:
        out += ['Vegas','Vegas 300']
    if name.startswith('AA 50/1440') or name=='AA 50/1440':
        out += ['50/1440']
    # unique
    seen=set(); res=[]
    for a in out:
        if a and a not in seen:
            seen.add(a); res.append(a)
    return res

def wave(r):
    """Build-order wave for apply()."""
    st=status(r['in_scoretool'])
    if st=='already':
        return 0  # already in ROUNDS
    if st=='historical':
        return 6
    body=r['body']
    cat=r['category']
    if body=='Archery Australia':
        return 2
    if body=='IFAA':
        return 3
    if body=='Archery GB':
        return 4
    if body in ('NFAA','ASA','IBO','Archery Canada') or r['name']=='WA 3D Round':
        return 5
    return 5

def face_field(r):
    f=r['face'] or ''
    sch=scheme(r)
    if sch.startswith('ifaa') and '3d' not in sch:
        return 'IFAA 20-65cm'
    if 'field' in (f+r['category']).lower() and sch in ('aa-field','special1'):
        return 'field 20-80cm'
    if r['category']=='3D' or '3d' in sch or sch=='aba':
        return f or '3D animal'
    if sch=='clout':
        return 'Clout 75cm zones'
    # first cm in face
    m=re.search(r'(\d+)\s*cm', f)
    if m: return m.group(1)+'cm'
    if r['category']=='Indoor': return '40cm'
    return '122cm'

rows=list(csv.DictReader(CSV.open()))
conf=[]
unconf=[]
for r in rows:
    st=status(r['in_scoretool'])
    if st=='unconfirmed':
        unconf.append(r['name']); continue
    ape=parse_ape(r)
    ends=parse_ends(r, ape)
    mx=parse_max(r)
    sch=scheme(r)
    key=ALREADY.get(r['name']) or SHARE_KEY.get(r['name'])
    already=r['name'] in ALREADY
    if not key:
        key=r['name']
    rec={
        'cat': r['category'],
        'body': r['body'],
        'name': r['name'],
        'key': key,
        'already': already,
        'hist': st=='historical',
        'wave': 0 if already else wave(r),
        'ape': ape,
        'ends': ends,
        'max': mx,
        'scheme': sch if not already else None,  # existing keep their engine
        'face': face_field(r),
        'aliases': aliases(r, key),
        'note': None,
        'config': sch=='config3d' or (ends is None and not already),
        'stop': 'stop on the first' in (r['arrows_per_end'] or '').lower() or 'stop on the first' in (r['scoring'] or '').lower(),
        'bonus': sch=='nfaa-animal',
        'portsmouth': sch=='portsmouth',
        'source': r['source'],
    }
    if 'not stated in Schedule 9A' in (r['arrows_per_end'] or ''):
        rec['note']='OzBow end length is not printed in Schedule 9A; other AA outdoor rounds use 6-arrow ends (5 ends for 30 arrows).'
        rec['ape']=6; rec['ends']=5
    if 'not separately restated (6-arrow' in (r['arrows_per_end'] or ''):
        rec['note']='End length is not restated in Book 2; 6-arrow ends are the usual match for these arrow counts and are noted on the card.'
    if 'not separately restated (10 ends of 3' in (r['arrows_per_end'] or ''):
        rec['note']='End length is not restated in Book 2; 3-arrow ends (10 ends) are the usual match for this indoor 300 and are noted on the card.'
        rec['ape']=3; rec['ends']=10
    if r['name']=='Foresters':
        rec['apes']=foresters_apes()
        rec['ends']=28
        rec['ape']=4
    blocks=parse_blocks(r, rec['ape'])
    if blocks: rec['blocks']=blocks
    if rec['config']:
        rec['minTargets']=30 if 'sectional' in r['name'].lower() or 'unmarked' in r['name'].lower() and 'NFAA' in r['body'] else 10
        if 'National Unmarked minimum 60' in (r['ends_or_targets'] or ''):
            rec['minTargets']=30  # default a practical course; National min 60 is a note, default 30 for sectional/state? Spec: configurable, no invented official max. Default 20 like casual? Use 20 as a starting fill-in, user sets count.
            rec['minTargets']=20
            rec['hint']='Organiser-set target count. National Unmarked minimum 60; sectional/state minimum 30. There is no single official maximum.'
        elif 'IBO' in r['body']:
            rec['minTargets']=20
            rec['hint']='Organiser-set target count. There is no single official maximum.'
    conf.append(rec)

assert len(conf)==221, len(conf)
assert len(unconf)==6, unconf
# IFAA Field/Hunter already
assert any(c['name']=='IFAA Field' and not c['already'] and c['key']=='IFAA Field Round' and c['wave']==3 for c in conf)

text='/* Generated from /workspace/scoretool/world-rounds-2026-11-11.csv. Confirmed rows only (221). Do not edit by hand. */\n'
text+='window.WORLD_UNCONFIRMED='+json.dumps(unconf, ensure_ascii=False)+';\n'
text+='window.WORLD_ROUNDS='+json.dumps(conf, ensure_ascii=False, separators=(',',':'))+';\n'
OUT.write_text(text)
print('wrote', OUT, 'bytes', len(text), 'confirmed', len(conf), 'unconfirmed', unconf)
# sanity: new waves
from collections import Counter
print('waves', Counter((c['wave'], c['already']) for c in conf))
print('schemes new', Counter(c['scheme'] for c in conf if not c['already'] and c['scheme']))
# missing ends/ape for non-config
bad=[c for c in conf if not c['already'] and not c['config'] and (not c['ends'] or not c['ape'] or (c['max'] is None and c['scheme']!='config3d'))]
print('incomplete new', len(bad))
for b in bad[:20]:
    print(' ', b['name'], 'ape', b['ape'], 'ends', b['ends'], 'max', b['max'], 'scheme', b['scheme'])
