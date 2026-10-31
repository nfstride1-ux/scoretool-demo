# ScoreTool regression checklist

Run before every deploy, and again on the live URL after it:

    python3 qa/run_regression.py                                   # this checkout, served locally, headless Chrome 390x844
    python3 qa/run_regression.py --live https://nfstride1-ux.github.io/scoretool-demo/
    python3 qa/run_regression.py --only ghost                      # one area while working

It prints PASS/FAIL per area and a total, and exits non-zero on any failure. Record the result in CHANGELOG.md. Rule: do not change anything that already works while fixing something else. If a suite fails, first check whether this change caused it (`git stash` or run it on the previous deploy); fix it if so, otherwise list it as a known failure in CHANGELOG.md.

Each suite uses a fresh browser profile and test data only. Nothing is sent anywhere.

| Area | Suites (tools/) | What must still work |
|---|---|---|
| Solo scoring | redesign, ausindoor, singleface, nav, real, pickers, halfsplit, shotview, sidehill, grouppattern, todayarrows, photos, names, colourblind, field_faces, vegas, h2h, undozoom, zoompersist, plot3spot, spotgroups, arrowsize, linecut, endview | Just me rounds on every face, key entry and tap plotting, undo/fix arrow, PBs, finish analysis, Past sessions, photos, names rules, tab bar |
| Full round | fullround | Every round type scored start to finish by real taps (WA outdoor, indoor, field gold/black, Vegas 300, practice, custom block, ABA Interclub 3D, custom 3D, League 300 week, Peel two-day comp): every end, running total, X/10 (field 6/5) counts, hits, total; saved record unchanged after reload; Past sessions row and Open match. Clout is not a scored round in the app |
| PB note | pbnote | Finish Personal best note uses the same earlier shoots as "your PB" in This shoot vs your usual (practice and official, full rounds, earlier dates): first time, beats practice, official higher (no New PB), equal, beats official, later-dated shoot ignored; no page errors. Official result stubbed in the test browser only. |
| Personal bests | pbbest | My archery > Personal bests counts finished practice shoots on this phone as well as official results, every round type (outdoor, indoor, field, Vegas, practice, own rounds, 3D), labelled practice or official; no page errors. |
| Bow filter | bowfilter | My archery > Analysis bow filter lists Compound, Recurve, Barebow, Longbow (plus Other only when a shoot has no bow type), no All bows, starts on your own bow; no page errors. |
| Admin view relay | avrelay | Viewing another tester's app (read only): league, casual, match, name, calendar and photo background sync do not run, nothing is sent, no 'this would change' notice without a tap; normal use still syncs; no page errors. |
| Ghost X count | ghostx | Ghost match result card shows 'X count: you N, ghost M.' when either shot an X, 'Level on points.' first on a draw, nothing on total-only ghosts; no page errors. |
| Test guards | guards | Every test that loads the app imports tools/guard.py: each browser context and page has the ntfy.sh relay stubbed and the service worker blocked (a test that sets service_workers itself, such as offline_test, keeps its choice). field_faces_test exits non-zero on a failed check. |
| Casual shoot | casual, mixedface, casual3d, custom3d, mel3d | Setup choice, discipline faces and keys, 3D/ABA, custom rounds |
| League | league | Onion Shed 6 x Vegas 300, cumulative ranking, X ties, missing weeks |
| ABA | aba | ABA Interclub first half 3-arrow, second half 1-arrow, sheet view |
| Peel group card | peel, peel_data, peel_next, peel_scroll, peel_share, peel_comp | Day 1/Day 2, Next hold, Save, Competition complete, share names, saved data untouched |
| Ghost match | ghost, ghost_pick | Unlock on any past score of the round (any face, part-shot, competition result), Race who? list, PB/average, records pace line and Record not available, different-face note, top-ranked ghosts, stored data unchanged |
| Sight marks | sightest, sightseed, sightimport, arrowsets | Typed marks stay, estimates are italic, import CSV/PDF exact, per-setup sets |
| Sight card | sightcard | Print card PDF, 2 per A4, no purple |
| My arrows / My bows | myarrows, mybows, arrowpick, todayarrows | Add/edit lists, dropdowns fill calculators |
| Calculators | arrowcheck, arrowchooser, arrowuse | FOC, speed, spine verdicts, chart look-ups |
| Analysis | coach2, coach3, testers, sendpast | Stats vs Analytics lists, coach read, tester data, send past rounds |
| App shell | whatsnew, offline, clarity | What's new/help rules (no emoji, line icons, newest first), service worker precache, offline reopen; Clarity snippet async, typed fields masked, privacy line, clarity.ms never cached, app fine when clarity.ms is unreachable |

## Manual spot checks (2 minutes, on a phone, after the live deploy)
1. Score > Just me > Australian Indoor 18m: Ghost match is tickable; Choose who lists past scores; pick a record row and start.
2. Settings & help > What's new: the top entry matches this release.
3. Settings & help > About (or version.json): the version equals the cache name in sw.js.

## Rules every release must keep
No emoji in the app; no other archery app names in user-facing text; palette navy/blue/gold (no purple); field faces gold and black only; saved user data is read, never rewritten by a fix.
