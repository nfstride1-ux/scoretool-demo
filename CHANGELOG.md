# ScoreTool changelog

Newest first. Each entry names the version tag shown in Settings.
One entry per release, newest first. Every release records: what changed, the files touched, and the tests run (before the deploy, and again on the live URL after).
Process (agreed 26 Oct 2026): do not change anything that already works while fixing something else. Before every deploy run `python3 qa/run_regression.py` (all areas, see `qa/regression.md`), then run `python3 qa/run_regression.py --live https://nfstride1-ux.github.io/scoretool-demo/` after it is live. Any suite that fails is either fixed (if the change caused it) or listed here as a known failure. Earlier releases are in `git log`; user-facing notes are in `whatsnew.js`.

## v2026-10-28-1314-mixedface (2026-10-28)
### What changed
- Per-archer target face in a Casual indoor shoot (Nathe, 28 Oct, shooting with Logan and Ema: "me and Logan shoot against each other, he on a Vegas face, I on a single 40 cm"; Ema is scored on Logan's phone). On Indoor WA 18m, Indoor WA 25m, Indoor WA Combined 25m + 18m and Australian Indoor 18m, every archer in the shoot now has their own Face: Three spot or Single face. At setup it sits beside each name (self, name-only friends and linked archers) and starts on the shoot's face; changing one archer never changes the others. On the score card a Face row shows for the archer being scored and can be changed until that archer's first arrow (it locks, and unlocks again if they Undo back to zero arrows, same idea as the Just me Face button).
- "Three spot" keeps the shoot's 3-spot layout (vertical or Vegas), so Logan stays on Vegas 3-spot. A single face is one 40 cm face at 18 m (60 cm at 25 m), keys X 10 9 8 7 6 5 4 3 2 1 M, and tap plotting + zoom when that archer is alone on the phone (several archers on one phone stay button-only, as before). Every archer sees only their own face's keys and ring values. Totals use the one X/10..1/M scale, so mixed faces compare directly; the Scores table tags each archer's face, the header names both faces, and a small "Different faces" note appears when they differ (like the ghost "Different face" note).
- Storage: host choices in `cs.fa{id:'single'|'three'}` (only written when someone actually chose); a linked archer's own change is `cs.sc[id].f`. Both travel in the relay snapshot (`csSnapParts` / `csMerge`), same permission rules as scores (host for self and name-only people, the linked person for themselves; the host's own phone ignores stale relay copies of `fa`). A saved own-session gets `face3:'single'` for a single-face archer (the field Just me single face already uses), `vegas`/`vert` otherwise. Shoots and sessions without per-archer data load and behave exactly as before; nothing already saved is rewritten.
- Match play on a mixed shoot uses the widest key set so nobody is blocked.
- Match nights (head-to-head and match night): Single face is now offered on the start screen (the same Three spot / Single face row as Just me), each archer on their own phone; the face rides in the shared state (`sf`), and a small "Different faces" note shows when the other archer is on a different face. `f3Can` now allows the in-scoring Face button for match-night sessions.
- Scope on purpose: Vegas 300 and Vegas 300 (18 m) are NOT in the per-archer choice (they stay 3-spot games so the Vegas analytics stay clean). Leagues are unchanged. League scoring rules, saved scores and history are untouched.
- Help (Casual shoot, Score steps) and What's new updated.
### Files touched
casual.js (csSplit/csAF/csMixed/csSetFace, csFace/csKeys/csEndFace per archer, setup and score-card Face rows, Scores table tags and note, relay), app.js (f3Can), h2h.js (start uses the remembered face, Face row, `sf` flag, note), help.js, whatsnew.js, tools/mixedface_test.py (new, added to the Casual shoot area of qa/run_regression.py and qa/regression.md), CHANGELOG.md, sw.js, index.html, version.json.

### Tests run
Baseline: origin/main 064db47 (singleface follow-up). New tools/mixedface_test.py: 59 checks (setup defaults and independent per-archer choice, Vegas 300 excluded, keys per archer, face lock and Undo, relay round-trip for a linked archer, mixed totals and note, old shoots unchanged, solo plotting on a single face, Australian Indoor, match play keys, match night face and note). This release: full regression `python3 qa/run_regression.py` 57 passed / 1 failed (2145 s). The one failure is vegas_test 58/2, the known stale one-phone relay checks (unchanged). casual_test 82/0, h2h_test 90/0, singleface 44/0, mixedface 59/0, whatsnew 33/0, league suites all pass.
After deploy (live v2026-10-28-1314-mixedface, ec1e13e): `--live --suite mixedface_test,whatsnew_test,casual_test` all passed (mixedface 59/0, casual 82/0, whatsnew 33/0) plus the live smoke 22/0 (ghost picker on the live site). The live version.json showed v2026-10-28-1314-mixedface. Suites run on fresh browser profiles with the relay stubbed; no real data written.

## v2026-10-28-0640-singleface (2026-10-28)
### What changed
- Single face for indoor rounds (Nathe via Coach, 28 Oct: "They just me scoring for indoor it has the three spot or the Vegas style face. Can you add the single face for those that can't shoot the three spot?"). On the Score start screen, Just me, Indoor WA 18m, Indoor WA 25m and Indoor WA Combined 25m + 18m now show a Face choice: Three spot (the default, exactly as before) or Single face. Single face is one full face per end (40 cm at 18 m, 60 cm at 25 m), scored X, 10 down to 1 and M with the same ring values as every other single-face target; plotting an arrow and zoom (Z1, Z2, Reset) work as on other single faces. Indoor keeps its normal colours (no purple).
- The choice is remembered in a new flag `S.face1` (independent of the vertical or Vegas 3-spot layout in `S.face3` and of Australian Indoor's own pick `S.face3a`); anyone who never picks Single face sees no change. The session stores `face3:'single'` (the field Australian Indoor 18m already used), so saved scores, totals, history, ghost match and the plotted-arrow views read it the same way. Existing saved sessions are not rewritten.
- Inside scoring, the Face button now cycles vertical 3-spot, Vegas 3-spot and single face on these rounds until the first arrow is plotted (same rule as Australian Indoor; positions are per face so the button locks after plotting).
- Ghost match says "Different face" when a past score was on the 3-spot and today is on the single face (or the reverse), the existing note, now for these rounds too.
- Scope on purpose: Just me only. NOT offered on Vegas 300 and Vegas 300 (18 m), on Casual, head-to-head match nights or leagues, on custom or ABA rounds, or on field and target rounds. League scoring is unchanged. Australian Indoor 18m keeps its own three-way pick (traffic light, triangular, single).
- Help (Score steps) and What's new updated; ausindoor_test's stale check "WA 18m: no extra face row" now checks the new Three spot / Single face row.
### Files touched
app.js (f3Name, f3One, f3Start, f3Can, f3Row, f3Bind, start-screen call, startRound, scoring Face button), insights.js (faceCls, faceLong, curCls, faceDiff call), help.js, whatsnew.js, tools/singleface_test.py (new, 44 checks, added to the Solo scoring area of qa/run_regression.py and qa/regression.md), tools/ausindoor_test.py (one stale check), CHANGELOG.md, sw.js, index.html, version.json.

### Tests run
Baseline: origin/main 23c3e1f (onion). New tools/singleface_test.py: 44 checks, all pass: default stays Three spot and a default start is unchanged; the choice only appears on Indoor WA 18m, 25m and Combined (not Vegas 300, Vegas 300 18 m, Australian Indoor, field, target); Single face gives keys X 10 9 8 7 6 5 4 3 2 1 M on one 40 cm face (60 cm at 25 m); plotted arrows score with the app's own ring values (full-face mapping, plotted == scored); zoom Z1/Z2/Reset; Face button cycles and locks after plotting; the choice is remembered across reload; saved session stores face3 single with positions and the same totals; ghost shows the Different face note; match nights (f3Pref) and Casual unchanged; existing saved sessions byte-identical; no page errors.
This release: full regression `python3 qa/run_regression.py` 51 passed / 6 failed (3177 s). vegas_test 58/2 is the known stale failure (unchanged). The other five were not code failures: nav_test, real_test, field_faces_test and ghost_test could not reach the app because a stray server from another job (/workspace/map-mockup) held port 8765 on the test box; re-run on a free port they pass (nav 99/0, real 250/0, field_faces 54/0, ghost 92/0). aba_test timed out once on the Archery Calendars prompt while the box was busy and passes on its own re-run (79/0). ausindoor_test: its stale check 'WA 18m: no extra face row' was updated to the new row and now passes. whatsnew_test 33/0, league 61/0, h2h 90/0, casual 82/0, offline 12/0.
After deploy (live v2026-10-28-0640-singleface, 9e73f2b): live copy of redesign 142/0, ausindoor, singleface (44 checks), pickers, whatsnew 33/0, offline 12/0, plus the live smoke (ghost picker on the live site); all passed. The live version.json shows v2026-10-28-0640-singleface. Suites run on fresh browser profiles; no real data written.

## v2026-10-27-1834-onion (2026-10-27)
### What changed
- Onion Shed Challenge restored (Nathe via Coach, 27 Oct, league starts Wed 28 Oct: "Re-create the onion shed challenge with the same rules as before. Add all the people that were there before plus the one person without the app. Keep the league scorer the same. Show the rules on the league page."). The removal was commit a639320 (v2026-10-26-2106-nopreset, 26 Oct 21:39 +0800; Nathe asked for it at 8:52 pm, that is the time of the request, not of the commit). Restored from the pre-removal code in a639320^ (lgPresetFix, lgSeed and the seed call, originally from 971b79b, 010ddb2 and 42ab94d) with the same name, host, members and added shooter.
- It is a NEW league record with the NEW code ONIONSH2. The old record (code ONIONSHD) is kept in storage byte-for-byte, stays hidden (not listed, not joinable, not invited, not counted toward the 3-league host limit) and nothing is read from or written to it, so the 26 Oct test scores can never leak into the real league, and the old relay topic's leftover posts are never used. Its saved scores are not deleted or changed.
- Members (same as the preset before it was removed): Nathe (host), Logan, Steven, Joseph, Michael, Dana, Tahuri, Estiaan, Nate, Danie (each scores on their own phone or a phone group), plus Leslie Anderson, who has no app and is scored by the host (guest id gleslie, "scored by host"). Phill stays excluded (LG_EXCL). "Anderson" (Nathe's one-word answer for the person without the app): Leslie is the only Anderson in the old preset, git history and the tester list. 11 archers, so ONIONSH2 is added to H2H_NOCAP like ONIONSHD was; every other league keeps the 10-archer cap.
- Seeding is additive and idempotent: on a member's phone the league is ADDED once when missing; if the phone already holds ONIONSH2 only missing members or the added shooter are appended to the end of the order (nothing removed, reordered or overwritten; weeks, current week and scores untouched). It is skipped if the user already has a visible league with the same name (no second Onion Shed) and is not re-added after the user removes it. People who are not members (Phill, anyone else) are never given it.
- Leslie: she is a guest of a fresh league, so she cannot be locked on Own phone; the host can still move her between Own phone and Phone 1-3 at any time after she has started (the existing reassign logic is unchanged) and her scores (keyed by archer and week) stay byte-identical (tested).
- Rules shown on the league screen (card at the top, plain text, no emoji, no purple, phone width). Wording: Nathe's 20 Oct 2026 rules (from memory) plus the app's own final text (LG_FINTXT): "Six 300s at 18 m on the vertical 3-spot." / "Each week for 5 weeks everyone shoots a 300 round, in person or over FaceTime." / "On the 6th day they all shoot another 300 together in person in the Onion Shed." / "The running total of all six 300s (maximum 1800, ties split on X count) sets the league table." / "Shoot-up match play happens on day 6 only, starting once everyone's day-6 300 is in. Final: 3 ends of 3 arrows, X = 10, no 12 dot. Ties: 1 arrow each, closest to the middle wins (host picks)." / "Entry is $10 each night, winner takes all, minus a jokey 75%." The old preset code itself contained no rules text; the $10, FaceTime and winner-takes-all lines exist only in Nathe's 20 Oct wording, which ends "minus a jokey 75%" (the 75% line needs Nathe to confirm). Only the Onion Shed league shows the card.
- Not touched: league scoring page (lgpage, lgnext), scoring, relay, snapshot merge (except the `since` cut-off is now a per-code table), the 10-archer cap for other leagues, saved scores, New league and Use the usual group.

### Files touched
league.js (LG_OLD, LG_PRESET with new code, LG_SINCE, lgIsPresetCode, lgPresetFix, lgSeed, lgCard seeding call, LG_RULES and lgRulesCard, join/invite/merge use the code check), h2h.js (H2H_NOCAP), help.js, whatsnew.js, tools/onionrestore_test.py (new, 52 checks, added to the League area of qa/run_regression.py), tools/nopreset_test.py (stale-by-design checks updated: a fresh phone now holds the restored league; the old ONIONSHD record checks are kept), sw.js, index.html, version.json.

### Tests run
Baseline (b262737, League area before changes): 5/5 (league_test 61/0, nopreset 29/0, leslie 17/0, lgscroll 19/0, lgpage 40/0). Full-suite baseline is the recorded e9285cf run (53 passed / 2 failed: vegas_test 58/2 known, custom3d load flake).
This release: full regression 53 passed / 3 failed (2051 s) on the final league.js: vegas_test 58/2 (known, same two checks as the baseline, unrelated) plus two stale-by-design failures found and fixed: league_test 'go-live: new user sees no leagues, no Onion Shed shown' (no longer true on purpose, updated: a new member sees only the restored ONIONSH2) and whatsnew_test 'every older note names its real commit' (lgnext's note said 'this release', now e9285cf). Re-run after those fixes: League area 6/6 (league_test 61/0, nopreset 29/0 with its stale 'fresh phone is not given the preset' checks updated, onionrestore 52/0, leslie 17/0, lgscroll 19/0, lgpage 40/0), whatsnew_test 33/0, offline_test 12/0. Everything else in the full run passed (incl. h2h 90/0, undozoom 46/0, casual 5/5, testers 189/0).
New onionrestore_test (52 checks): every member's fresh phone gets exactly one Onion Shed Challenge with identical record (no duplicate after reload); 10 testers then Leslie, 11 archers with no cap, other leagues still capped at 10, Phill not a member; Leslie scored by the host and the only Anderson; rules card present with the exact wording, no emoji, no purple, no overflow at 390 px; Leslie moved Own phone to Phone 1 and back with scores byte-identical; a phone holding the hidden 26 Oct record with scores keeps it byte-for-byte and gets the new league; a phone that already holds ONIONSH2 with saved scores gets no duplicate, missing members appended, week and scores untouched, re-run changes nothing; a same-name user league is left alone; Phill gets nothing; other leagues show no rules card.
After deploy (live v2026-10-27-1834-onion, e60ba0a): `--live --only league` League 6/6 (league 61/0, nopreset 29/0, onionrestore, leslie 17/0, lgscroll 19/0, lgpage 40/0), live smoke 22/0. Suites run on fresh browser profiles with the relay stubbed; no real relay submits and no tester's saved data touched.

## v2026-10-27-1045-lgnext (2026-10-27)
### What changed
- League scoring page (Nathe, 27 Oct: "The instant I click the 3rd score it changes to the next person. I don't want that. I want to push next."): when several archers share a phone, the card no longer moves to the next archer after the third arrow. It stays on that archer with the three arrows shown (score keys hidden) and a large Next button; Next moves on in the same order the old auto-advance used (skipping finished archers; after the last archer it goes round to the first archer still to shoot). Undo still takes back the last arrow, including the third (the keys come back and Next goes away until the third arrow is in again). After a finished 300 (10th end) the card also stays with a Next button.
- A single archer on their own phone (target face plotting) has nothing to move on to, so no Next button; unchanged.
- Display only. Casual, league scoring rules, the relay, the 10-archer cap and saved scores are untouched (a `lgNextArcher` helper replaces the advance loop that sat in `lgKey`; `lgKey` still saves exactly the same data).
- Last archer of the league: when the final arrow finishes the league the final shoot-up screen opens as before.
- Next hold is cleared when a scoring page is opened or left (a hold left over from earlier scoring made Leslie's card show Next instead of the keys in leslie_test; found by the full regression).
- Page jump fix (Nathe, 27 Oct: "I don't like the page flicking up. It doesn't do it when the targets are showing. Only when they are hidden."): on the league scoring page with Hide target on, the first arrow of each end scrolled the page so the Score card sat at the top of the screen (the target-fit placement `csAdFit` ran on every re-render even though there is no face to fit), and Undo did the same. `lgView` now keeps the current scroll position on those re-renders when the target is hidden, exactly as it does for the shared-phone keys, and Next keeps position too. With the target showing the fit placement is unchanged. Opening the page and Hide/Show target behave as before.

### Files touched
league.js (lgView scroll rule with hidden target, lgKey, new lgNextArcher, lgEntryCard hold state and Next button, Next handler), help.js, whatsnew.js, tools/lgpage_test.py (now also: hidden target, scrollY unchanged after the first arrow, later arrows, next end and Undo, and on a shared phone after the first arrow and Next; 40 checks), tools/league_test.py, tools/lgscroll_test.py (the only tests that assumed auto-advance; each now taps Next), CHANGELOG.md, sw.js, index.html, version.json (bump).

### Tests run
Baseline (e08c3cf, previous release): full suite 51/4 as recorded for lgpage; the only real failure was vegas_test 58/2 (known); the other three were the two tests that assumed the old layout (since fixed) and a load timeout.
This release: full regression 53 passed / 2 failed (4240 s): vegas_test 58/2 (known, unrelated); custom3d_test failed once from a calendar-prompt overlay intercepting a click under load and passes alone 55/0. All League suites 5/5 (lgpage 40/0 incl. new hidden-target and shared-phone scroll checks; lgscroll 19/0; league; leslie 17/0 after the hold-clear fix; ). Casual 5/5 except that overlay flake.
After deploy (live v2026-10-27-1045-lgnext, e9285cf): `--live --only league` League 5/5 (league 61/0, nopreset 29/0, leslie 17/0, lgscroll 19/0, lgpage 40/0), live smoke 22/0; custom3d_test alone on the new code 55/0 (the one full-run failure was a load flake).

## v2026-10-27-0815-lgpage (2026-10-27)
### What changed
- League scoring page (Nathe, 27 Oct, league starts Wed 28 Oct): tapping Score my week, Score group (Phone 1/2/3) or the added shooters now opens the scoring on its OWN page, laid out like Casual scoring: header card with a Back to league button, the Score card (archer chips, slots, X 10 9 8 7 6 M keys, Undo), a Scores table for the group (with an "Ends for each archer" list), the analysis card, and Refresh now plus a second Back to league at the bottom. The league screen is not changed: "One phone or own phones" (and the group buttons) stay where they were, "How it's scored" stays there, and Back to league returns to the same scroll position.
- A single archer scoring on their own phone still gets the target face to plot arrows (with Hide target), the same as Just me. Several archers on one phone use the buttons only, as Casual does. Archers still move on to the next one after the third arrow. The 10-archer cap is unchanged.
- Leaving by a tab or any other screen closes the scoring page, so reopening the league starts on the league screen. The in-app header back arrow on the scoring page also goes to the league screen.
- Display only. League scoring rules, relay, and saved scores (keyed by archer and week) are untouched; Back to league leaves the stored scores byte-identical (checked by the test).
- Also: lgscroll "After deploy" line filled in, and its What's new entry now points at ea09434.

### Files touched
league.js (lgView scoring page, Back to league, nav reset), lab.js (inner back arrow), help.js, whatsnew.js, tools/lgpage_test.py (new, 28 checks, port 8899, test-only league codes, relay stubbed so nothing is posted to a real topic), qa/run_regression.py (lgpage_test added to the League area), CHANGELOG.md, sw.js, index.html, version.json (bump).

### Tests run
Baseline (ea09434): lgpage_test fails the page checks (scoring does not open on its own page, no Back to league, no Scores card).
This release, full suite (56 suites, sequential, 2816 s): all pass except: vegas_test 58/2 (the same 2 stale checks as the previous releases, vegas.js untouched); leslie_test and lgscroll_test failed on the first run because they assumed the old inline scoring card (they clicked the league group buttons while scoring, and needed the page scrolled to find the keys); both tests were updated (go Back to league first; scroll down a little in setup) and now pass, leslie_test 17/0, lgscroll_test 19/0, league_test 60/0, nopreset_test 29/0, lgpage_test 28/0 (re-run of the League area 5/5). peel_scroll_test timed out under load while other tests ran; re-run alone 15/0.
After deploy (live URL, v2026-10-27-0815-lgpage, commit e08c3cf): version.json matched; League area 5/5 (league_test 60/0, nopreset 29/0, leslie 17/0, lgscroll 19/0, lgpage 28/0); live smoke 22/0; Casual area live pass.

## v2026-10-26-2235-lgscroll (2026-10-26)
### What changed
- League multi-archer scoring (several archers on one phone, e.g. Vegas 300 18m 3-spot, 7 archers on Phone 1): the page no longer jumps to the top after every arrow, Undo, face plot or background refresh. Reproduced with the new test on the previous deploy (a3cd686): the first score tap, Undo and a relay refresh all returned the page to y=0. Cause: `lgView` ended with `scrollTo(0,0)` on every render except the single-archer card, and every score tap, Undo and `lgTick` refresh re-rendered it. Fix (same kind as the Peel `pgscroll` fix d1d963d): `lgView` keeps the scroll position when the render was caused by a score tap, face plot, arrow delete, Undo or refresh (`window._lgKeep`), then nudges the keys fully clear of the nav and header. Choosing a different archer chip, opening a week and leaving it still start at the top.
- The active archer still moves to the next unfinished archer after the third arrow, as before; it just no longer scrolls the page.
- Display only. Scoring, saved scores and the relay are unchanged. Peel, Casual and Just me code is untouched (their tests were run).
- Casual "only 5 of 6 arrows" (WA 720 50m Compound): looked at a second time, still not reproduced and no code change. Checked: 1, 2, 4 and 10 archers; buttons and face taps (touch and mouse); 6th arrow as every key; widths 320, 360, 375, 390, 412 px; light and dark; a random run of 12 ends per archer with chip switching, Undo and relay refreshes mid-end (every complete end held 6 arrows); encode/decode for the relay (6 characters per end); merge rules. Nothing drops or caps an arrow at 5. Needs Nathe's screen recording or the exact steps.

### Files touched
league.js (lgView, score/plot/delete/Undo handlers, lgTick refresh), tools/lgscroll_test.py (new, 19 checks, port 8898), qa/run_regression.py, whatsnew.js, CHANGELOG.md, sw.js, index.html, version.json (bump).

### Tests run
Baseline (a3cd686, after the Leslie release): full suite as recorded for the Leslie release; lgscroll_test fails 6 of 19 on this code (page jumps to y=0 on the first tap, on Undo and on a refresh).
This release, full suite: all 56 suites run (parallel run a11). Passing: everything including lgscroll_test 19/0, league_test 60/0, nopreset_test 29/0, leslie_test 17/0, h2h, names, casual, just-me, peel suites. Six suites failed only from the parallel runner (shifted ports and load) and were re-run on their normal ports: offline 12/0, peel_comp 52/0, peel_share 26/0, field_faces pass, sightimport 43 ok/0 bad. vegas_test 58 passed, 2 failed: the same 2 checks fail on the previous release (a3cd686) and on earlier ones, in vegas.js code this release does not touch; they are on the failing-test investigation list. peel_test exit 2 is its known name bug; peel_scroll 15/0, peel_data 2/0, peel_next pass.
After deploy (live URL, v2026-10-26-2235-lgscroll, commit ea09434): version.json matched; league_test 60/0, nopreset_test 29/0, leslie_test 17/0, lgscroll_test 19/0; live smoke 22/0.

## v2026-10-26-2145-leslie (2026-10-26)
### What changed
- League weekly screen: the host can now move an archer who has already started this week between Own phone and Phone 1/2/3 (and back). Before, a started archer's buttons were greyed (the Leslie Anderson "(started)" case Nathe reported) because `lgSetGroups` refused to move anyone with scores, the buttons were disabled, and the hint said "Archers can move only before they start". The refusal is removed; that is all.
- Why it is data-safe: a week's scores are keyed by archer and week (`lg.sc[id][w]`), never by group, so moving an archer does not touch his ends. Scoring carries on from the next end on the phone that now scores him. The cross-phone sync (`lgMerge`) never had the check. The existing take-over rule still protects a real member who is being scored on another phone (a "Take over scoring here" button is shown); guests like Leslie are never locked for the host.
- Also changed, same lock: the Everyone on own phones / Everyone on one phone buttons used to leave started archers where they were; they now move everyone. Only the host can change groups (unchanged).
- League scoring rules were NOT changed.
- Stale league_test check fixed (test only, no app change): "weekly screen: the one-phone / own-phone choice is a visible card near the top (not folded away)" asserted the card is one of the first 3 cards; the host's "Add a shooter" card was later put above it, so it is the 4th card. The check still requires it visible, not folded away, with the same heading, and within the first 4 cards (`<=3`).
- Tests: league_test line 104 asserted the old rule ("a started archer can't move"). It is replaced by 3 checks of the new behaviour (a started archer can be moved with the scores identical by JSON compare; moved back; only the host can change groups).

### Files touched
league.js (lgSetGroups, group buttons, hint text), tools/leslie_test.py (new, 17 checks), tools/league_test.py (one stale assertion replaced), qa/run_regression.py, whatsnew.js, CHANGELOG.md, sw.js, index.html, version.json (bump).

### Tests run
Baseline (1c75ce3 plus preset removal, a639320): leslie_test fails "started archer buttons are not disabled" on the old code.
This release, full suite (parallel run a10, all areas): every area passed except vegas_test (the known 58 pass / 2 fail, unchanged) and runner artefacts (shifted ports and CPU load) in field_faces, offline, peel_comp, peel_share, peel_scroll, sightimport; each of those passed when re-run alone and unshifted (peel_scroll 15/0, peel_data 2/0, peel_next exit 0, offline 12/0, field_faces exit 0, peel_comp 52/0, peel_share 26/0, sightimport 43 ok). league_test 60/0 (after the two stale-check fixes above), leslie_test 17/0.
After deploy (live URL, v2026-10-26-2145-leslie, commit a3cd686): version.json matched; league_test 60/0, nopreset_test 29/0, leslie_test 17/0; live smoke 22/0.

## v2026-10-26-2106-nopreset (2026-10-26)
### What changed
- The preset Onion Shed Challenge league (LG_PRESET, code ONIONSHD) is no longer shown to anyone. `lgSeed` / `lgPresetFix` (which added the league to every member's phone on load and appended members to an existing copy) are removed, so nothing adds or edits it. A copy already in a phone's storage is simply not listed in "Your leagues" (`lgPresetHidden`); it is not deleted and its scores, weeks and linked sessions are untouched. It also no longer counts toward the 3-leagues-per-host limit, its code can't be joined again, and an invite for it is ignored.
- Template kept for new leagues (Nathe, 26 Oct): LG_PRESET stays in the code; New league has a "Use the usual group" button that ticks the same members. Creating a league, weekly scoring, groups, relay and the shoot-up are unchanged. League scoring rules were NOT changed (a new method is to come from Nathe).
- Tests: league_indoor_test and undozoom_test used to get the preset league by opening the Score tab; they now add the old record themselves (`lgPresetRecord`). This is the only edit to existing tests. The stale league_test check "go-live: new user sees no leagues, no Onion Shed shown" now passes (it failed only because the preset was being seeded).
- Housekeeping: the previous commit (1c75ce3) accidentally included test screenshot folders (shots-3d, shots-arrowcheck, shots-ausindoor, two shots-fix1022 files); they are removed from git here. No app code is affected.

### Files touched
league.js, tools/nopreset_test.py (new, 29 checks), tools/league_indoor_test.py, tools/undozoom_test.py, qa/run_regression.py, whatsnew.js, CHANGELOG.md, sw.js, index.html, version.json (bump).

### Tests run
Baseline = previous deploy 1c75ce3: the new nopreset_test fails 12 of 18 before it can finish (preset seeded for every member); full suite as a8 (only vegas_test 58/2 and league_test 56/2 plus runner artefacts).
This release, full suite: every test passes except the same known failures as before (vegas_test 58/2) and league_test (57 of 58). league_test's 'go-live: new user sees no leagues, no Onion Shed shown' now PASSES (it was the stale failure); the one left, 'weekly screen: one-phone / own-phone card near the top', failed before this release too and is investigated in the next release. New nopreset_test 29/29. peel_next_test had a stale debug line that indexed leagues[0] (now guarded; its checks are unchanged). Runner-load artefacts (names, offline, peel_comp, peel_share, field_faces, h2h, sightimport) all pass when run alone.
After deploy (live URL, v2026-10-26-2106-nopreset, commit a639320): version.json matched; nopreset_test 29/0; live smoke 22/0; league_test 57/1 (the known weekly-screen check).

## v2026-10-26-2027-chipcolors (2026-10-26)

### What changed
- Light theme only: on the Casual score card (and League, and Vegas match play, which use the same classes) the chips for the end being scored (`.vg-slot.on`, background #13294b) and the archer pills (`.lc-chip`, background #0b1f4d) were navy. The chip text takes the theme's dark ink colour, so X 10 9 8 7 were unreadable. Added 4 light-theme rules in lab.css: light chips with dark text (#e3ecff / #0f172a), light archer pills, the selected archer pill stays blue with white text. The dark theme is unchanged (style.css untouched).
- Report "only 5 arrows register on Casual" (WA 720 (50m Compound), 80cm 6-ring, 12 ends of 6, host + 9 name-only archers): not reproduced. No code change. In a phone-viewport run on Casual (10 archers, WA 720 Compound) all 6 arrows register for every key as the 6th arrow (X 10 9 8 7 6 5 M), in light and dark, with clicks and with touch taps and a slow relay; 8 ends in a row each hold 6 arrows, and after the 6th arrow the card moves on to the next archer. The screenshot shows 5 shot and the 6th slot still empty (score 44 = the 5 arrows, 0 of 12 ends complete); the 6th slot is waiting for the next tap. Just me on the same round also takes 6. Locked in by tests so a real cap would be caught. If it happens again on his phone I need the steps and the version shown in Settings.
- Saved data is not changed.

### Files touched
lab.css (4 light-theme rules), tools/chipcolors_test.py (new, 53 checks), qa/run_regression.py (added to the Casual shoot area), whatsnew.js, CHANGELOG.md, sw.js, index.html, version.json (bump).

### Tests run
Baseline = previous deploy c1072bd (v2026-10-26-1955-ghosttie): the new test fails 3 of 53 (light theme: the filled chips on the Casual card and the shared League/Vegas chips are below contrast 4.5; the other archers' pills are navy); the 6-arrow checks pass.
This release, full suite: all `tools/*_test.py` (parallel runner) - chipcolors_test 53/0; every file exits 0 except the known stale vegas_test 58/2 and league_test 56/2 (same checks as the baseline), and offline, peel_comp, peel_share, field_faces, h2h (timed out under load) and sightimport (port clash), which fail only because of the runner's shifted ports/load; re-run alone: offline 12/0, peel_comp 52/0, peel_share 26/0, field_faces 0, h2h 90/0, sightimport 43 ok / 0 bad.
After deploy (live URL, v2026-10-26-2027-chipcolors, commit 1c75ce3): version.json matched; casual live 6/0.

## v2026-10-26-1955-ghosttie (2026-10-26)

### What changed
- Ghost match panel (`ghostSheet`) and the ghost bar (`ghostBar`) in insights.js: a tie with the ghost was drawn in `#fff`. On the light theme (default) the panel card is `#fff`, so a tied end looked blank. Example from Nathe's Vegas 300 session: You 29, 30, (30), 28, 27 against ghost 30 28 30 29 30. End 3 was a 30-30 tie. The tie colour is now `var(--ink)`, the same as the Ghost row. Nothing else changed.
- Investigation finding (full write-up in /workspace/end3-findings.md): end 3 was saved with 3 arrows worth 30, the saved total of 144 is correct (29+30+30+28+27), and no scoring code drops, skips or mis-indexes an end (checked on Vegas 300 with Back/Next, undo then re-shoot, the End N back button, Add Scores, ghost "My best"). The End box showing 0 on a new empty end is by design (it is the total of the end on screen; Prog keeps the running total). The End box logic is the same before and after indoorparity.
- Saved data is not changed.

### Files touched
insights.js (two colour values), tools/ghosttie_test.py (new, 23 checks, light and dark), qa/run_regression.py (ghosttie_test.py added to the Ghost match area), whatsnew.js, CHANGELOG.md, sw.js, index.html, version.json (bump).

### Tests run
Baseline = previous deploy f0f9d07 (v2026-10-26-1946-vgtab): the new test fails 3 of 23 (tie colour: light theme white on white, and tie not the ink colour in both themes); the data checks pass; the rest of the suite is as before: only vegas_test 58/2 and league_test 56/2 fail (the known stale checks).
This release, full suite: all `tools/*_test.py` (parallel runner, shifted ports) - every file exits 0 except the known stale vegas_test 58/2 and league_test 56/2 (the same two checks each as the baseline), and offline, peel_comp, peel_share, which fail only because the runner shifts their fixed ports; re-run unshifted: offline 12/0, peel_comp 52/0, peel_share 26/0, field_faces and peel_scroll/peel_data pass. New ghosttie_test 23/0. No previously passing check failed.
After deploy (live URL, v2026-10-26-1955-ghosttie, Ghost match area): ghost_test 92/0, ghost_pick_test and ghosttie_test pass, live smoke passes (3/3 suites + smoke, 66 s).

## v2026-10-26-1946-vgtab (2026-10-26)

### What changed
- Vegas 300 and Vegas 300 (18 m) scoring: the "Ends so far" card (`#vgtab`, the table under Back/Next added by `vgExtras`) is removed. Nathe chose to remove it entirely. Nothing else on the Vegas scoring screen changed (header, End box, face, Back/Next, ad pad, scorecard screen), and no other round or screen builds this card.
- Saved data is not changed.

### Files touched
shootup.js (`vgExtras` no longer builds or inserts the card), tools/vegas_test.py (the old check that the card showed the ends is replaced by a check that the card is gone while the header, End count and score pad are still there), whatsnew.js, CHANGELOG.md, index.html, sw.js, version.json.

### Tests run
Before deploy (local copy, headless Chrome 390x844). Baseline = previous deploy c2a35af (v2026-10-26-1843-undozoom).
- Baseline: only vegas_test 58/2 and league_test 56/2 fail (the known stale checks).
- This release, full suite (all `tools/*_test.py`): same. vegas_test 58/2 (the same two stale checks: header "End 4 of 10" in `#vghead`, relay silence counting the Onion Shed snapshot POST; the changed card check passes), league_test 56/2 (same two stale checks). Every other suite passes, with peel_comp 52/0, peel_share 26/0, offline 12/0, field_faces 54/0 and the Peel scroll/data/next suites run unshifted on port 8765/their own ports (the parallel runner's port shift makes those four fail falsely).
After deploy: see the live-run result recorded below.

## v2026-10-26-1843-undozoom (2026-10-26)

### What changed
- Undo on indoor faces (Just me, League, Casual) now removes the arrow just shot and its plotted marker. Reproduced on the previous deploy (v2026-10-26-1756-ghostpick) with the new test: shoot a full end in order spot 1, 2, 3 where the spot 3 arrow is not the lowest, tap Undo: the lowest arrow was removed instead of the spot 3 arrow, the spot 3 marker stayed on the zoomed face and the arrow list and plots disagreed. Cause: a completed end is sorted high to low (`sortEnd`, `csKey`, `lgKey`) and Undo then popped the last (lowest) arrow of the sorted end. Fix: the order the arrows were shot in is kept in memory only (`window.stOrd`, never saved) when an end sorts, and Undo restores that order before removing the last shot, only if the end is still exactly as sorted. If it is not (for example after a fix or a reload), Undo behaves as before. Markers are also only drawn for arrows that exist, so a stray plot cannot show.
- Zoom clears on a new end, on Next, on coming back from the sheet, and on changing spot (Just me, League, Casual). The face opens at full size unless you zoom.
- End box: no regression and no logic change. In Just me, `app.js` is unchanged between 6b32f31 and c1a513a. The End box is, and was before indoorparity, the running total of the end on screen: 0 on an empty end, the total of the arrows so far on a part-filled end. Prog is the total through that end. After the last arrow of an end the screen stays on that end until Next, which opens the next empty end (End box 0, Prog unchanged). League and Casual show the same. The new test locks this in for all three.
- Saved data is not changed or migrated; the shot order is memory only.

### Files touched
app.js (`stOrd`, `putArrow`, `#undo`, marker filter, zoom key), casual.js (`csKey`, `csUndo`, `csAdCard`, `csFaceBind`), league.js (`lgKey`, `lgUndo`), tools/undozoom_test.py (new, 46 checks, headless 390x844), qa/run_regression.py (adds undozoom_test), whatsnew.js, index.html (?v=), sw.js, version.json, CHANGELOG.md.

### Tests run
Before deploy (local copy, headless Chrome 390x844). Baseline = previous deploy 068b45c (v2026-10-26-1756-ghostpick), run the same way.
- New tools/undozoom_test.py: 46 passed, 0 failed on this release. Run against the previous deploy's files it fails 8 of 46 (Undo leaves the spot 3 plot and arrow lists disagree in Just me, Casual and League; zoom stays on after Next, after coming back from the sheet, and in Casual and League after the end completes), which reproduces the bug.
- Full suite (all `tools/*_test.py`, 51 suites, run in parallel): same result as the baseline. Only league_test 56/2 and vegas_test 58/2 fail, the same two checks each as on the previous deploy (stale tests, not caused by this release). Every other suite passes, including casual 82/0, casual_indoor, league_indoor, ausindoor, redesign, real, nav, h2h, offline 12/0 (run on its own port), field_faces (run with the server on 8765), peel_test 37/0, peel_data 2/0, peel_next, peel_scroll 15/0, peel_comp 52/0, peel_share 26/0, whatsnew 33/0. peel_scroll timed out once under parallel load and passed 15/0 when run alone (flaky under load, not a change). Peel scoring files are untouched.
After deploy: see the live-run result recorded below.

## v2026-10-26-1756-ghostpick (2026-10-26)

### What changed
- Ghost match unlocks on Australian Indoor 18m. Cause: the 23 Oct 2026 commit 3a1ec58 that added the Australian Indoor 18m round did not add it to `GHOST_MAP` in best.js, so none of Nathe's competition scoresheets for that round could be raced (Best official was never offered), and the practice ghost sources only counted full, not-finished Just-me sessions of that exact round. A part-shot, finished-early or casual score never unlocked the box. No later commit made the unlock rule stricter; the practice rule (`ghostFor`, from be54eb3) is unchanged for the existing buttons.
- The unlock rule now: any valid past score of the round counts (a different face of the same round, part-shot sessions, competition results with end-by-end sheets). Stored scores are only read.
- New Choose who list on the ghost box: any past score (date, score, PB and Best marked, face, part-shot noted, competition results), My PB, My best ever, My average, and the world and national record for that round.
- Records race as an even pace line, labelled "Pace line, not real ends". A record that is not confirmed shows "Record not available" with no number.
- If the ghost was shot on a different face from the one being shot (3-spot vs single), a note says so and the ghost's arrow positions are not drawn. The same note applies to Last round / My best.
- Records are kept in `data/records.json` with sources and check dates. World Archery 18 m records are listed; no Australian national record could be confirmed for any round (see the file's `national._status`).
- Added this change log, `qa/regression.md` and `qa/run_regression.py` (runs every suite by area; `--live URL` re-runs on the deployed files).

### Files touched
best.js (GHOST_MAP entry, `offGhosts`, `ghostBowNow`), insights.js (Race who? picker, unlock, face note), style.css (`.gh-note`), data/records.json (new), help.js, whatsnew.js, index.html (?v= busters), sw.js, version.json (cache name v2026-10-26-1756-ghostpick, 106 files precached), tools/ghost_pick_test.py (new), qa/ (new), CHANGELOG.md (new).

### Tests run
See the result block appended below after the run.

Before deploy (local copy, headless Chrome 390x844). Other releases landed on main while this one was being tested, so the work was rebased three times. Full run of `python3 qa/run_regression.py` (48 suites) on the first rebase base (after v2026-10-26-1720-adminback): 45 pass, 3 fail, and all three also fail on the previous deploy with the same assertions, so they are not caused by this release:
- vegas_test 58/2: "header with the round info and End 4 of 10" looks for an element the Vegas solo view no longer has; "nothing sent to the relay (fully offline)" counts the Onion Shed ntfy snapshot POST. Stale tests.
- league_test 56/2: "new user sees no leagues, no Onion Shed shown" and the weekly one-phone/own-phone card check (leagues moved from Score to Clubs). Stale tests (being handled with the league work).
- field_faces_test needs a server already running on port 8765; the runner now starts one. It passes 54/0.
- whatsnew_test needed older notes to name their commit; fixed (33/0).
After the final rebase onto c1a513a (v2026-10-26-1732-indoorparity) the quick set was re-run: ghost_pick 22/0, ghost 92/0, whatsnew 33/0, ausindoor all pass, offline 12/0, aba 79/0, redesign 142/0. The full set is re-run on the live copy after the deploy (below). One aba_test run timed out on a locator once and passed on the re-run (flaky, not a change).
Also passing in the full run: nav 99/0, real 250/0, casual 82/0, custom3d 55/0, peel suites, h2h 90/0, names 104/0, sight marks, sight card, My arrows/bows, calculators, analysis suites.

After deploy (live copy of https://nfstride1-ux.github.io/scoretool-demo/, version v2026-10-26-1756-ghostpick confirmed): full run 44 pass, 5 fail on the first run; three of the five (real_test, testers_test, whatsnew_test) failed only because the live-copy runner did not fetch non-precached pages or the git log. After fixing the runner they pass (real 250/0, testers 189/0, whatsnew 33/0). Remaining failures: vegas_test (2) and league_test (2), the same stale assertions as before this release. Live ghost smoke: OK 22, FAIL 0. Combined defect list: qa/defects.md.

## v2026-10-26-1732-indoorparity (2026-10-26)

League and Casual indoor scoring now match Just me (single archer on the phone). ABA and 3D, the Peel group card and shared-phone multi-archer cards are untouched.

Differences found against Just me and fixed (league.js, casual.js; Just me code reused: faceSVG/plot helpers, sortEnd order, endSum, roundSummary, shootCompareHTML):
- A complete end was saved in tap order (league). It is now put in order like Just me (X, 10, 9 ... M), with plots kept in step.
- No End and Prog boxes, no tappable arrow chips (fix, delete arrow), no table of ends with a total each end. All added, same look as Just me.
- The face was too tall and the score keys fell off the phone screen, and the page jumped to the top after every tap. The face now uses Just me's heights and the face, End/Prog and keys fit on the phone screen together, staying put after each tap.
- League did not save the arrows as a session, so groups and heatmaps ignored league. It now writes `lg-<code>-w<week>` into your own sessions (ends, plot positions, vertical 3-spot tag). Casual already wrote `cs-<code>`.
- No analysis on finishing. Round summary plus where-this-shoot-landed and sight move guide now show directly under the score in both.
- Ends sent to other phones are now in order (still end scores only, no plot positions).
- Saved data: old league and casual scores load unchanged; only plot positions (`p`) are added. Nothing is migrated and past league weeks are not backfilled into sessions.

Left as is on purpose:
- A finished end moves on automatically in league and casual (Just me waits for Next). Undo or the arrow chips on the current end change mistakes; an earlier end is changed with Undo.
- Fair-play quick-end prompt stays on Just me practice only (league and casual scores are not held for XP).
- League relay still sends end scores to the public relay, as before (tester Nate included).

Tests: new league_indoor_test.py and casual_indoor_test.py (phone viewport, tester profile, relay mocked) score a full 10-end indoor round on the vertical 3-spot with plotted arrows, undo, fix, delete and finishing, and compare against Just me for the same 30 arrow positions.

## v2026-10-26-1727-adminback2 (2026-10-26)

Follow-up to adminback.

- Recovery check tightened: the bar is only auto-enabled on a phone whose `scoretool.v1` has a sessions list and a profile starting "Nathaniel Stride" (case-sensitive).
- Fixed the What's new test: earlier notes (adminback and pgcomp) now name their real commits (e0a11de, 4348def).
- league_test: the same 2 checks fail on 4348def and on e0a11de ("go-live: new user sees no leagues, no Onion Shed shown", "weekly screen: the one-phone / own-phone choice is a visible card near the top"). Not caused by adminback.
- Tests: whatsnew, adminview, testers re-run (see commit message).

## v2026-10-26-1720-adminback (2026-10-26)

Admin return bar and read-only profile viewing.

- When Nathe switches to another tester from Me, a navy and gold bar sits under the top bar on every screen: "Viewing as <name>" with a "Back to my profile" button. One tap returns to his own profile.
- Works retroactively: a phone that holds Nathe's own data (`scoretool.v1`, profile "Nathaniel Stride") but is on another tester gets the bar and the switch card with no flag needed. Normal testers' phones never show it.
- The flag `scoretool.adminReturn` is written only by the admin's switch (or the recovery check) and removed on return. `?tester=nathe` always works and clears it.
- Viewing is read only. Writes to localStorage (except `scoretool.adminReturn`, `scoretool.tester`, `scoretool.theme`), network POSTs and IndexedDB writes are blocked while viewing, with a "not saved" notice when the user taps something that would save. Forced name prompt skipped while viewing.
- Audit of the old code: merely viewing Nate rewrote `scoretool.v1.nate` fields setup, leagues, bowSel, squad, peel, bows, casual, diary, presetSeeded, removed `scoretool.dname.nate`, and posted a league sync as Nate.
- Tests (tools/): adminview 41/41, testers 189/189, names 104/104, nav 99/99, ghost 92/92, offline 12/12, h2h 90/90, casual 82/82, redesign 142/142, sightcard 12 ok, mybows 60 ok. league 56 passed, 2 failed (compared with the previous build separately).
