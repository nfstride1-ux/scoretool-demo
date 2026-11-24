/* Paste from Archer's Diary Bests. The archer copies the table themselves.
   Nothing here contacts Archer's Diary. */
(function(root){
function decode(s){return String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;/gi,' ').replace(/&amp;/gi,'&').replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&quot;/gi,'"').replace(/&#39;|&apos;/gi,"'").replace(/&#(\d+);/g,function(_,n){return String.fromCharCode(+n)}).replace(/\s+/g,' ').trim()}
function htmlRows(text){const tables=text.match(/<table[\s\S]*?<\/table>/gi);const src=tables&&tables.length?tables.join('\n'):text;
 const out=[];const re=/<tr[\s\S]*?<\/tr>/gi;let m;while((m=re.exec(src))){const cells=[];const cre=/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi;let c;while((c=cre.exec(m[0])))cells.push(decode(c[1]));if(cells.length)out.push(cells)}return out}
function splitLine(line){if(line.indexOf('\t')>=0)return line.split('\t').map(function(s){return s.trim()});
 if(/\s{2,}/.test(line))return line.trim().split(/\s{2,}/).map(function(s){return s.trim()});
 if(line.indexOf(',')>=0)return line.split(',').map(function(s){return s.trim().replace(/^"|"$/g,'')});
 return [line.trim()]}
function textRows(text){return String(text||'').replace(/^\uFEFF/,'').split(/\r?\n/).map(function(l){return l.trim()}).filter(Boolean).map(splitLine)}
const KEYS={discipline:/^disc(ipline)?\.?$/,round:/^rounds?$|^round name$/,division:/^div(ision)?\.?$|^bow$/,score:/^scores?$|^totals?$|^results?$|^points$/,date:/^dates?$/,event:/^events?$|^competition$|^tournament$/};
function headerMap(cells){const map={};cells.forEach(function(c,i){const t=c.toLowerCase().replace(/\s+/g,' ').trim();Object.keys(KEYS).forEach(function(k){if(map[k]==null&&KEYS[k].test(t))map[k]=i})});return map}
function looksHeader(cells){const m=headerMap(cells);return m.score!=null&&(m.round!=null||m.discipline!=null||m.event!=null)}
function parseDate(s){s=String(s||'').trim();if(!s)return '';
 let m=/^(\d{4})-(\d{2})-(\d{2})/.exec(s);if(m)return m[1]+'-'+m[2]+'-'+m[3];
 m=/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/.exec(s);if(m){let y=m[3];if(y.length===2)y=(+y>50?'19':'20')+y;return y+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0')}
 const mon={jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12};
 m=/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/.exec(s);if(m&&mon[m[2].slice(0,3).toLowerCase()])return m[3]+'-'+String(mon[m[2].slice(0,3).toLowerCase()]).padStart(2,'0')+'-'+m[1].padStart(2,'0');
 return ''}
function parseScore(s){const n=parseInt(String(s||'').replace(/[^\d]/g,''),10);return n>0&&n<=2000?n:0}
function canonDisc(s){const t=String(s||'').toLowerCase();if(/clout/.test(t))return 'Clout';if(/field/.test(t))return 'Field';if(/3\s*-?\s*d/.test(t))return '3D';if(/indoor/.test(t))return 'Indoor';if(/outdoor|target/.test(t))return 'Outdoor';return String(s||'').trim()}
function rowFrom(cells,map){const g=function(k){const i=map[k];return i==null?'':(cells[i]||'')};
 return {discipline:canonDisc(g('discipline')),round:g('round').replace(/\s+/g,' ').trim(),division:g('division').replace(/\s+/g,' ').trim(),score:parseScore(g('score')),date:parseDate(g('date')),event:g('event').replace(/\s+/g,' ').trim()}}
function guessMap(width){if(width>=6)return {discipline:0,round:1,division:2,score:3,date:4,event:5};if(width===5)return {round:0,division:1,score:2,date:3,event:4};return {round:0,date:1,score:2,event:3}}
function parseDiaryPaste(text){const raw=String(text||'').replace(/^\uFEFF/,'').trim();if(!raw)return {rows:[],skipped:0};
 const grid=/<t[dh]\b/i.test(raw)?htmlRows(raw):textRows(raw);
 if(!grid.length)return {rows:[],skipped:0};
 let start=0,map;if(looksHeader(grid[0])){map=headerMap(grid[0]);start=1}else map=guessMap(grid[0].length);
 const rows=[],seen={};let skipped=0;
 for(let i=start;i<grid.length;i++){const cells=grid[i];if(cells.every(function(c){return !String(c||'').trim()}))continue;
  const r=rowFrom(cells,map);if(!r.round||!r.score){skipped++;continue}
  const k=[r.date,r.round.toLowerCase(),r.score,r.division.toLowerCase(),r.discipline.toLowerCase()].join('|');
  if(seen[k]){skipped++;continue}seen[k]=1;rows.push(r)}
 return {rows:rows,skipped:skipped}}
root.parseDiaryPaste=parseDiaryPaste;
})(typeof window!=='undefined'?window:globalThis);
