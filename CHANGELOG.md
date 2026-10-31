# ScoreTool changelog

Newest first. Each entry names the version tag shown in Settings.
One entry per release, newest first. Every release records: what changed, the files touched, and the tests run (before the deploy, and again on the live URL after).
Process (agreed 26 Oct 2026): do not change anything that already works while fixing something else. Before every deploy run `python3 qa/run_regression.py` (all areas, see `qa/regression.md`), then run `python3 qa/run_regression.py --live https://nfstride1-ux.github.io/scoretool-demo/` after it is live. Any suite that fails is either fixed (if the change caused it) or listed here as a known failure. Earlier releases are in `git log`; user-facing notes are in `whatsnew.js`.

## v2026-10-31-1646-pbnote (2026-10-31)
### What changed
- Queue B1, PB note (Needs Nathe's decision in QA audit A: "your PB" in the finish compare card counted official results while the Personal best line at the finish was practice-only). Fixed so both use the same scores: the Personal best note at the end of a shoot now counts the same earlier shoots as "your PB" / "previous PB" in This shoot vs your usual (practice and official results for the round, full rounds only, earlier dates), so the two can never disagree.
- Wording: "New PB for this round, beating N." / "Equal to your PB for this round." (the word practice is gone, as it now counts official results too), and a small line under it: "Your PB counts your practice and official scores for this round, full rounds only." "First time you have scored this round here." is unchanged. The party emoji in the message is left for its own release (queue C2).
- If the analysis code is not loaded, the note falls back to the old practice-only best, so nothing breaks.
- The Best Score row and everything else on the card are unchanged; no saved data changed.
- What's new: one plain-text note; the fullround note now names its commit 8c8bfb8.
### Files
app.js (pbPrev helper + roundSummary note), tools/pbnote_test.py (new), qa/run_regression.py and qa/regression.md (new PB note area), whatsnew.js, CHANGELOG.md, version.json, sw.js (rebuilt with tools/build_sw.py), index.html (?v= bump).
### Tests
- pbnote_test (new): 13 passed / 0 failed. On the old code (8c8bfb8) 6 passed / 7 failed, so the test catches the old behaviour (practice-only note, "beating 590" while the card shows an official 640).
- whatsnew_test 33/0.
- Before (baseline): the fullround after-run (8c8bfb8): 61 passed / 5 failed, only the known five: nav, real, field_faces, ghost ("waiting for [data-tester=nathe]": these four use port 8765, which another local app's server already holds on the test machine, so they load the wrong page; fixed in the failing-tests release) and vegas 58/2 (two stale checks, same release).
- After: 62 passed / 5 failed (3041 s), the same known five only (nav, real, field_faces, ghost on port 8765; vegas 58/2). pbnote_test 13 passed / 0 failed.

## v2026-10-31-1642-fullround (2026-10-31)
### What changed
- Data integrity check (paid-ready programme item 1). The Vegas 300 report (End 3 blank in the ghost table, End box 0 while Prog 144) was root-caused on 26 Oct: End 3 was saved (30) and the total 144 was right; the tied 30-30 end was drawn white on white in the light theme, fixed in v2026-10-26-1955-ghosttie (c1072bd). End box 0 on a new, empty end is by design (the box shows the end being shot). Re-checked today: no data fault.
- New automated full-round check, tools/fullround_test.py (WebKit, 390 px, touch, installed iPhone app emulated). Every round offered in Score is scored start to finish by real taps on the keys with seeded random arrows: WA 720 x3, Short and Junior Canberra, Indoor WA 18 m, Australian Indoor 18 m, WA 90/70/60/1440, AA 50/1440, WA 60/900, Indoor WA 25 m and Combined, the three WA Field rounds (gold/black), Vegas 300 and Vegas 300 (18 m), both practice rounds, ABA Interclub 3D, a custom block round (full face then 6-ring) and a custom 3D round, plus a League 300 week (Onion Shed, Vegas 300 18 m, relay mocked) and a Peel group card two-day competition (three test archers, Day 1, Day 2, Competition complete).
- Checked for each: every end on the sheet (arrows highest first, End box, running total), the finish (round finishes by itself when full, the X/10 or 6/5 counts and total), the Score row, the saved record (every arrow, hits, total, counted as a finished shoot), the record unchanged after reloading the app, the Past sessions row total, and Open from Past sessions showing the same ends and total. League: the league record and the copy in my sessions. Peel: every target per archer, archer chips, days unchanged after reload, event and Competition complete totals equal Day 1 + Day 2, nothing written into the archer's own sessions. No page errors.
- Clout is not a scored round in the app (it only appears in the official results arrow table), so there is no clout check.
- App code unchanged. What's new: one plain-text note; the clarity note now names its commit 99bc9de.
### Files
tools/fullround_test.py (new), qa/run_regression.py and qa/regression.md (new Full round area), whatsnew.js, version.json, sw.js (rebuilt with tools/build_sw.py), index.html (?v= bump).
### Tests
- Before (baseline): the clarity after-run on identical app code (99bc9de): 60 passed / 5 failed, the known nav, real, field_faces, ghost ("waiting for [data-tester=nathe]") and vegas 58/2.
- fullround_test: 409 passed / 0 failed. Every failure found: none in the app. (Test-side fixes while writing it: keys re-read each end for block rounds; League sheet read from its own table; Nathe's 17 May 2025 paper-sheet ABA seed, added by aba.js by design, excluded from the Peel "own sessions" check.)
- After: 61 passed / 5 failed, the same known five. (league_test failed once in that run because I ran a changed copy of it on the same port at the same time; rerun alone on 8c8bfb8: 61 passed / 0 failed.)
- Live (https://nfstride1-ux.github.io/scoretool-demo/, version.json v2026-10-31-1642-fullround): fullround_test 408 passed / 1 failed. Every score check passed (all ends, totals, counts, saved records, reloads). The one failure is a page error during the league part: "Can't find variable: squad", seen only on the live site, not locally, and app code is unchanged in this release, so it is older than this release. Likely cause: on a slow load a screen draw runs before squads.js has arrived. Noted for the Level 1 live diagnostic; not fixed here.

## v2026-10-31-1409-clarity (2026-10-31)
### What changed
- Microsoft Clarity (Nathe, 31 Oct, approved: project z660yw0kiw, to see how the app is used). New clarity.js, loaded from the page head: the official Clarity snippet, which adds https://www.clarity.ms/tag/z660yw0kiw as an async script.
- Masking: every typed field (text, search, email, phone, number, textarea, select and the like) gets data-clarity-mask="true" as soon as it is drawn, including fields drawn later on any screen (a MutationObserver), so names, emails, notes and messages are never sent. Tick boxes, radio buttons and buttons are left alone. Strict masking is also set in the Clarity dashboard.
- Privacy line, plain text, in Me > Settings & help (Settings card): "We use Microsoft Clarity to see how the app is used (taps and scrolling) so we can improve it; typed details are hidden."
- Service worker: clarity.ms requests are passed straight through (an explicit hostname check before the existing cross-origin rule); nothing from clarity.ms is cached.
- Offline: if clarity.ms cannot be reached the script just fails to load and the app carries on; the app still reopens from the cache with no signal.
- Automated test browsers (navigator.webdriver) load nothing, so test runs are not recorded and every other suite sees the app exactly as before.
- analytics.js (the in-app Analytics) is unchanged. There is no GoatCounter in this app, so there was nothing there to change.
- What's new: one plain-text note; the endviewer note now names its commit 0f46036.
### Files
clarity.js (new), index.html (one script tag in the head), app.js (the privacy line in the Settings card), tools/sw_template.js and sw.js (clarity.ms pass-through, rebuilt with tools/build_sw.py so clarity.js is precached), whatsnew.js, version.json, tools/clarity_test.py (new), qa/run_regression.py and qa/regression.md (clarity_test in App shell).
### Tests
- Before (baseline): full regression on code identical to origin/main 0f46036: 59 passed / 5 failed, the known nav, real, field_faces, ghost ("waiting for [data-tester=nathe]") and vegas 58/2.
- New clarity_test (WebKit, 390 px, touch, installed iPhone app emulated; then Chromium with the service worker): 16 passed / 0 failed. Snippet once, async, right project; 17 typed fields masked across Me, Settings, Send a suggestion and Following, and fields drawn later; privacy line word for word; nothing loaded in test browsers; clarity.ms unreachable: every tab draws, no page errors; no clarity.ms entry in the service worker cache; offline reopen works.
- whatsnew_test after the bump: 33 passed / 0 failed.
- After: full regression 60 passed / 5 failed out of 65 suites (the new clarity suite passed, 16 / 0). Same known nav, real, field_faces, ghost and vegas 58/2 as before; nothing new failed.

## v2026-10-31-1345-endviewer (2026-10-31)
### What changed
- End by end plot viewer (Nathe via Archery Coach, 31 Oct: each end's target face with that end's arrows plotted arrow by arrow, numbered in shot order, at the true size already used; swipe left and right between ends, plus arrow buttons; "End 3 of 10" and the end total; three spots on 3-spot faces). Clarification from Nathe the same day: only after a shoot is finished, so the end-of-shoot summary and Open on a finished shoot in Past sessions, and nothing on the live scoring screen changes.
- New card "End by end" on a finished shoot's sheet (`scoreSheet` with `fin`), under the shoot comparison. One end at a time: End k of N, the end total and the running total, the face with only that end's arrows (three spots for that end on 3-spot faces, else the face the shoot was plotted on), each arrow drawn exactly as on the rest of the card (true shaft size on new shoots, the old line-cutter size on old ones) with a numbered badge, and a list of the end's arrows with their scores (keypad arrows listed as not plotted). The face keeps one zoom for the whole shoot so it does not jump between ends.
- Moving between ends: swipe left or right on the face (touch, mostly sideways, more than 40 px; a vertical swipe still scrolls the page), the Previous end / Next end buttons (48 px, stop at the first and last end), or the left and right arrow keys. The page does not jump.
- Shot order: completed ends have always been saved highest score first (`sortEnd`), and the shot order was only kept in memory for undo, so it was never saved. New plotted arrows now carry their shot number in the end (`sn` on the plotted point, set in `putArrow` and kept on a fix, carried with the arrow when the end is sorted). Nothing else about the save changes and the scoring screen shows exactly the same thing. Older shoots, and ends with a keypad arrow, have no shot numbers, so the viewer numbers them in the saved order and says so on the card. No saved shoot is changed or recalculated.
- Not included: casual and league shoots (they have their own screens and their own analysis card); the League Next tap is not touched (on hold).
### Files touched
shotview.js (new `endViewHTML`, `endViewBind` and helpers; `shotPts` passes `sn` through), app.js (`scoreSheet` adds the card and binds it on finished shoots only; `putArrow` records `sn`), style.css (`.evcard`), help.js (End by end line under Arrow plot), tools/endview_test.py (new), qa/run_regression.py and qa/regression.md (endview_test added to Solo scoring), whatsnew.js, CHANGELOG.md, sw.js, index.html, version.json.
### Tests run
- Before (baseline): full regression on code identical to origin/main 7b8b2ed: 58 passed / 5 failed, the known nav, real, field_faces, ghost ("waiting for [data-tester=nathe]") and vegas 58/2.
- Targeted on this change: endview 40/0 (new; WebKit, the iPhone engine, at 390 px with touch, emulating the installed home-screen app), plot3spot all pass, arrowsize 59/0, linecut 14/0, shotview all pass, spotgroups 81/0, colourblind 20/0, ausindoor all pass.
- Live scoring screen unchanged: endview_test compares the scoring screen HTML at four points (before the first arrow, mid end, end just completed, score sheet during the shoot) with the 7b8b2ed snapshot, all four identical, and checks that no viewer appears there.
- After: full regression 58 passed / 6 failed out of 64 suites (the new endview suite passed, 40 / 0). The failures were the same known nav, real, field_faces, ghost and vegas 58/2, plus whatsnew_test, which was run before the version bump while the newest note still had a placeholder version.
- whatsnew_test after the bump (the arrowsize note now names its commit 7b8b2ed): 33 passed / 0 failed.

## v2026-10-30-2036-arrowsize (2026-10-30)
### What changed
- Arrow size (Nathe, 30 Oct: "We need to choose arrow size. Because I'm shooting 23s and the target should not be touching X from outside of the 10. If someone was shooting 27s it would. And if someone was shooting thin arrows it would be inside the lines with gaps between lines."). Cause: every arrow marker was drawn at the line-cutter scoring radius or a fixed dot, not the shaft: on a 40 cm 3-spot the scoring-face dot was 13.3 mm wide, the plot card 14 mm, the single face 10 mm. A 23 shaft is 9.1 mm.
- On new Just me shoots, arrows are now drawn at the true shaft diameter on the real face size everywhere they appear: the scoring face and loupe, the end-of-shoot card ("Where this shoot landed" and the three spots strip), Past sessions, the Analytics Arrow plot and the ghost face. The marker's outer edge is the shaft edge.
- New Arrow size picker per shoot, beside the target face while scoring, shown only until the first arrow is plotted (then the size is shown as text and is fixed; the Past sessions card shows it as text): 27, 26, 25, 24, 23, 22, 20, 19 (64ths of an inch, so 23 = 23/64 in = 9.13 mm, the WA shaft-size convention), thin shafts at Easton's published outside diameter (X10 Parallel Pro 4MM by spine, e.g. 610 = .218 in = 5.54 mm; 3.2MM 600 = .194 in), and Custom mm (3 to 12 mm). It starts on the arrow set ticked in My arrows (SuperDrive 23 -> 23/64 in); with no set, 23/64 in. A new shoot (`startRound`) is saved with `lcT:1` and `arrowD` {k, mm} locked from that default; the picker can change it only before the first plotted arrow.
- Geometry check (40 cm face, 10 ring radius 20 mm, X radius 10 mm): a 23 sitting just inside the 10 line reaches 0.87 mm short of the X line; a 27 in the same place crosses it by 0.72 mm; a thin 610 centred between the lines leaves 2.2 mm each side.
- Scoring change (Nathe chose option A, 30 Oct): line cutters on new Just me shoots (`lcT:1`) are scored with the shoot's true arrow radius (`arrowLC`, passed to `plotScore` through `tapScore`), so the drawn edge and the score agree. A 23 now cuts the line only within 4.56 mm, instead of the old fixed 7 mm on 3-spot faces and 5.6 mm on other faces; a borderline arrow just outside that scores the lower ring. Bug faces keep their own rule.
- Old shoots are never recalculated: sessions without `lcT` keep their stored ends untouched and are still drawn at the old line-cutter size that scored them (byte-identical SVG to before), so plot3spot's promise (each arrow touches the ring it scored) holds for old and new shoots. Casual and league shoots are not started by `startRound`, so they keep the old allowance for now.
- Colour-blind mode keeps its larger labelled markers. The tuning lab dots are unchanged.
- Not added: a Pandora 600 size (no maker outside diameter found); use Custom mm.
- Release (2) v2026-10-30-1840-spotgroups after deploy, recorded here: live version.json confirmed; live spotgroups_test 81 passed / 0 failed; live regression (Solo scoring area, `--live`): 18 passed / 4 failed, the known nav, real, field_faces ("waiting for [data-tester=nathe]") and vegas 58/2 failures, spotgroups_test 81/0 and plot3spot pass; LIVE smoke 22 ok / 0 fail; live screenshots /workspace/shots-spotgroups/live/.
### Files touched
app.js (arrow size options, parsing, `arrowMM`, `arrowRU`, `arrowPick`, picker change handler, `arrowLC`, `plotScore` and `tapScore` line-cutter radius, `startRound` sets `lcT`/`arrowD`, picker only before the first arrow, `arrowDot` and `faceSVG` draw at shaft size), shotview.js (`shotPts` shaft radius for `lcT` shoots only, `plotSvg`/`cleanSvg`/`spotsSvg` shaft edge, size text on the card), insights.js (ghost face), style.css (`.shsz`, `.arrowsz`), help.js (Arrow plot), tools/arrowsize_test.py (new), tools/linecut_test.py (new: borderline arrow scores 9 on a new shoot, old saved shoot keeps its 10 byte-for-byte), tools/ausindoor_test.py (its plotted == scored check now uses the shoot's own line-cutter rule, `arrowLC` for new shoots, 0.035 for old ones), qa/run_regression.py and qa/regression.md (arrowsize_test and linecut_test added to Solo scoring), whatsnew.js, CHANGELOG.md, sw.js, index.html, version.json.
### Tests run
- Before (baseline): full regression on code identical to origin/main 4369eee (release 2 after run): 55 passed / 6 failed, the known nav, real, field_faces, ghost ("waiting for [data-tester=nathe]"), vegas 58/2 and custom3d (passes on rerun).
- Targeted on this change: plot3spot 18/0, arrowsize 59/0, linecut 14/0, shotview 38/0, spotgroups 81/0, colourblind 20/0 (baseline 20/0).
- After: full regression 55 passed / 8 failed (2 more suites than before: arrowsize, linecut). Same known nav, real, field_faces, ghost, vegas 58/2, custom3d failures, plus ausindoor (its check hard-coded the old 0.035 allowance; under option A the new shoot correctly scored 10 where the old rule said X; check updated to the shoot's own rule) and sightseed (255 s box timeout). Rerun alone: ausindoor all pass (33 ok), sightseed 32/0, custom3d 55/0.

## v2026-10-30-1840-spotgroups (2026-10-30)
### What changed
- Arrow plot sight guide (Nathe, 30 Oct, 30-arrow vertical 3-spot shoot: "Each target has different landing locations for each target, that clearly means something is not correct either with form or bow. Windage could move over to the right slightly. You need to do better with this analysis." and "The point is to try get all arrows center of the X.").
- Every group is now measured against the exact centre of the X (the centre of the face on field faces), in mm on the true face size (40 cm face: 200 mm per face radius unit). The "centred" tolerance is gone.
- Each offset shows its standard error (SD / sqrt(n), at least 1 mm). A sight move with direction and amount is given only when the offset is bigger than that (and at least half a ring step of 0.05 rings); otherwise "no change yet" with the reason. A move under one ring says "a little". Still "move the sight towards the group".
- 3-spot faces: new "Each spot" table (arrows, left/right, up/down, spread in mm per spot). Spot pairs are compared; a difference bigger than both a quarter ring and twice the combined standard error raises a flag: the spots land in different places, the sight is the same for every spot, so look at head and body position, bow cant (level bubble on each spot) and anchor first. Otherwise it shows the biggest difference and how big it would need to be.
- Unchanged: the 3-spot strip, the plotted data, the drawing, scores, saved data (nothing is written).
- Job 1 (v2026-10-30-1657-landedface) after deploy, recorded here: live regression 7 passed / 1 failed (field_faces, the known "waiting for [data-tester=nathe]" box timeout); LIVE smoke 22 ok / 0 fail; live card screenshots in /workspace/shots-landed-face/live-*.png.
### Files touched
shotview.js (`group` per-spot stats and mm, `guide`, `spotShift`, usual group text), style.css (`.shg-flag`), help.js (Arrow plot), tools/shotview_test.py (sight guide checks use the standard error), tools/spotgroups_test.py (new), qa/run_regression.py, qa/regression.md, whatsnew.js, CHANGELOG.md, sw.js, index.html, version.json.
### Tests run
Baseline, untouched origin/main d76beb7 (full `python3 qa/run_regression.py`, 2565 s): 54 passed / 6 failed, all known box issues: nav_test, real_test, field_faces_test, ghost_test ("waiting for [data-tester=nathe]"), vegas_test 58/2 (stale), sightest_test (waiting for #smest).
After (this build, full run, 2785 s, 63 suites with spotgroups_test added): 55 passed / 6 failed: the same nav, real, field_faces, ghost and vegas failures; sightest_test passed; custom3d_test failed once (the Archery Calendar prompt covered a button) and passed 55/0 on a rerun, also 55/0 on the base. tools/spotgroups_test.py 81 passed / 0 failed, shotview_test all pass, plot3spot_test pass.
Logs on the build box: /workspace/spotgroups-baseline-regression.log, /workspace/spotgroups-after-regression.log. Screenshots (test data only, 390 px and desktop, light and dark, before and after): /workspace/shots-spotgroups/. Live results: recorded in the next release.

## v2026-10-30-1657-landedface (2026-10-30)
### What changed
- "Where this shoot landed" single face (Nathe, 30 Oct, 30-arrow vertical 3-spot shoot: "I like the 3 spot idea under. But the single face looks shit", "It doesn't look correct"). Cause: the card's big face used the Analytics plot drawing, which lays a navy layer at 50% through a radial mask over the face (the "darker face = no arrows there" shading). That darkened every ring (teal blue, maroon red, dull gold) and smeared a glow over the rings; and it always showed rings 6 to 10, so a group inside the 9 ring was small and the arrows, the gold group-centre cross and the usual-group circle piled on top of each other.
- Now the card draws a clean face (`cleanSvg` in shotview.js, used only by `shotPlotCard`): the same WA colours as the 3-spot faces, no glow or shading, zoomed to only the scoring rings the arrows (at their real size) and group circles reach (never fewer than rings 8 to 10). Draw order: rings, usual group (dashed blue), this shoot's group (dashed navy), arrows, then a small usual-group centre ring and an open gold cross with a navy outline and a gap in the middle so the arrows under it stay visible. The legend drops "darker face = no arrows there" because that shading is gone.
- Unchanged on purpose: the three spots strip, the Analytics Arrow plot (`plotCards` still uses the old drawing), the rest of the legend, the plotted positions, field faces (gold and black, full face, no zoom), saved data (nothing written).
### Files touched
shotview.js (`cleanSvg` new, `faceSvg` optional zoom, `plotSvg` clean option, `shotPlotCard`), whatsnew.js, CHANGELOG.md, sw.js, index.html, version.json.
### Tests run
Baseline, untouched origin/main 07197e1 (`python3 qa/run_regression.py`, run in two parts because the box cleared /tmp mid-run): 57 passed / 5 failed. vegas_test 58/2 (the known stale failure); nav_test and real_test could not find the `nathe` tester ("waiting for [data-tester=nathe]"), the known box issue; field_faces_test failed the same way in part 1 and passed (54/0) in part 2; whatsnew_test 32/1 because on origin/main the newest What's new entry (v2026-10-28-2103-plot3spot) does not match version.json (v2026-10-28-2112-auto, the pre-commit hook relabelled the follow-up commit).
After (this build, full `python3 qa/run_regression.py`, 2530 s): 56 passed / 4 failed. vegas_test 58/2 (same stale failure); ghost_test "waiting for [data-tester=nathe]" (the known box issue, it also failed this way before); h2h_test timed out on one click and passed 90/0 when re-run alone (it does not touch this card); whatsnew_test 32/1 for the same version.json mismatch, fixed in this release by bumping sw.js in the same commit as the What's new entry (re-run below). nav_test, real_test and field_faces_test passed this time. Targeted: shotview 38/0, plot3spot 18/0, casual_indoor 36/0, league_indoor 35/1 (the same "analysis directly under the score card" failure on untouched origin/main, not caused by this change).
Screenshots before and after (30-arrow vertical 3-spot test shoot, Australian Indoor 18m, test data only, 390 px and desktop, light and dark): /workspace/shots-landed-face/ on the build box.

## v2026-10-28-2103-plot3spot (2026-10-28)
### What changed
- Arrow plot on 3-spot shoots (Nathe, 28 Oct, Vegas 300, 30 plotted arrows: "I only hit the 9 4 times, this looks like it hit all over the place. Line the 3 spot targets properly"). Investigated first: positions are NOT wrong. Tap, score and plotted position agree on the Vegas triangle and the vertical face, at Z1 and Z2, Vegas 300 solo and Indoor 18m (probe tapping known offsets per spot, then comparing `shotPts` with the intended offset: all within rounding). Cause is visual: every arrow was drawn as a tiny dot at its centre, but scoring lets the arrow's edge (3-spot 0.035, other faces 0.028) touch a ring, so X, 10 and 9 arrows sat visibly outside the ring they scored in and the group looked wider than the score. With 16 X, 10 tens and 4 nines the dots were all inside the 9 ring but looked loose.
- Now each arrow is drawn as a translucent circle at its real size (the same radius scoring uses) plus a centre dot, so a scored 9 touches the 9 ring and nothing outside it. Applies to the end-of-shoot card, Past sessions Open and the Analytics Arrow plot (all use `plotSvg`).
- New "three spots as on the target" picture under the combined plot: Vegas shows the real triangle (Spot 1 top left, Spot 2 top right, Spot 3 bottom), the vertical face a row of three, each with rings 6 to 10, its own arrows at real size, and a count per spot. The combined one-spot plot and sight guide are kept as they were.
- Old saved sessions: no data written or changed. Sessions without `face3` that were plotted on the full face still plot on the full face (no spots view); single-face sessions unchanged; 3-spot sessions replot from the same stored positions, so past Vegas and vertical shoots get the new picture too.
- Help (Arrow plot) and What's new updated.
### Files touched
shotview.js (`shotPts` carries arrow radius and spot, `plotSvg` arrows at real size, new `spotsSvg` in `plotCards` and `shotPlotCard`), style.css, help.js, whatsnew.js, qa/run_regression.py and qa/regression.md (plot3spot_test added to Solo scoring), tools/plot3spot_test.py (new), sw.js, index.html, version.json.
### Tests run
tools/plot3spot_test.py 18 checks, all pass (16 X / 10 tens / 4 nines Vegas shoot: exactly four 9s, each arrow scores the ring its edge touches, 10 per spot, triangle and vertical layouts, old full-face and single-face sessions untouched, nothing rewritten, no page errors). Full regression `python3 qa/run_regression.py` 54 passed / 6 failed (2270 s) on the pre-rebase build: vegas_test 58/2 is the known stale failure; nav_test, real_test, field_faces_test and ghost_test could not find the `nathe` tester in this box ("waiting for [data-tester=nathe]"), and fail the same way on untouched origin/main 6a3bf5c, so not caused by this change; whatsnew_test failed only because the new note had no commit hash yet (33/0 after). After rebase on 6a3bf5c re-ran plot3spot 18/0, shotview 38/0, zoompersist 59/0, whatsnew 33/0, offline 12/0.
After deploy: live at v2026-10-28-2103-plot3spot (5d9c7cd). `qa/run_regression.py --live` on plot3spot, shotview, zoompersist, whatsnew, offline: all pass; LIVE smoke 22 ok / 0 fail. plot3spot_test also run against the live URL (BASE env): 18/0, 390 px light screenshots taken.

## v2026-10-28-1948-zoompersist (2026-10-28)
### What changed
- Zoom now persists on the indoor 3-spot face (Nathe, 28 Oct, Just me vs ghost on Australian Indoor 18m vertical 3-spot: "keep the zoom as I set it, no reset every end, restart back to target 1 but keep the zoom unless I change it"). Root cause: release c2a35af (undozoom, 26 Oct) deliberately reset the shared zoom `PZ` on a spot tab tap, on a new end (`window._pzEnd`), on return from the sheet and, in Casual and League, on a new end (`window._csZk`); and `cur.spot` / `window._csSpot` were never reset at a new end, so the last spot (Spot 3) carried into the next end.
- Now one shared set of helpers in app.js (`zkLoad`, `zkSet`, `zkOpen`) keeps the zoom level the archer chose (Z1, Z2, Reset 3x) across spot tabs, ends and the sheet until the archer changes it, and stores it on the device (`scoretool.zoomk`, additive, so an app reload keeps it). Each new end starts on Spot 1 (only when the archer was on a specific spot; "All spots" is left as chosen). The spot tab tap re-centres the pan only.
- Covers every indoor 3-spot mode through the same code: Just me (including vs ghost), match nights (they use the Just me screen), Casual and League (casual.js `csFaceBind` / `csFaceHtml`). In Casual with mixed faces each archer's own face decides: a 3-spot archer keeps the zoom, a single-face archer still opens each end on the full face.
- Unchanged on purpose: single face and the field / bug faces still open every end on the full face; pinch and the pill behave as before; saved scores, plots and history untouched.
- Help (Plot your arrows) and What's new updated; undozoom_test's old "opens on the full face" checks now assert the kept zoom.
### Files touched
app.js (zkLoad / zkSet / zkOpen, new-end and spot tab handling, sheet return, applyZ), casual.js (csFaceHtml new-end spot, csFaceBind, spot tab, applyZ, keepZ), help.js, whatsnew.js, qa/run_regression.py and qa/regression.md (zoompersist_test added to Solo scoring), tools/undozoom_test.py (updated), tools/zoompersist_test.py (new), sw.js, index.html, version.json.
### Tests run
Baseline: origin/main 008ee14. New tools/zoompersist_test.py: 59 checks, all pass (Just me, Just me vs ghost, Australian Indoor triangular face, match night, Casual and League: Z2 set on Spot 3, Spot 2 keeps Z2, next end opens on Spot 1 at Z2, third end the same, change to Z1 and Z1 stays; reload read-back; single face unchanged). undozoom_test 46/0 after updating. Full regression `python3 qa/run_regression.py` 54 passed / 5 failed (2175 s) on the pre-fix build: vegas_test 58/2 is the known stale failure (unchanged); photos_test caught that the first build wrote the new `scoretool.zoomk` key just by opening a face (fixed: the key is only written once the archer picks a zoom other than Z1; photos_test now 29/0); peel_share_test, peel_comp_test and ghost_test could not reach the app because the box's /tmp/stwork/srv.py helper was missing, and passed when re-run alone (peel_share 26/0, peel_comp 52/0, ghost 92/0). After the fix re-ran photos, undozoom 46/0, zoompersist 59/0, casual 82/0, mixedface 59/0, whatsnew 33/0, offline.
After deploy (live v2026-10-28-1948-zoompersist, a2179d1): `--live` zoompersist_test 59/0, undozoom_test 46/0, casual 82/0, mixedface 59/0, photos 29/0, whatsnew 33/0, offline 12/0 and the live smoke (ghost picker) all passed. The live version.json showed v2026-10-28-1948-zoompersist.

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
