# ScoreTool changelog

Newest first. Each entry names the version tag shown in Settings.
One entry per release, newest first. Every release records: what changed, the files touched, and the tests run (before the deploy, and again on the live URL after).
Process (agreed 26 Oct 2026): do not change anything that already works while fixing something else. Before every deploy run `python3 qa/run_regression.py` (all areas, see `qa/regression.md`), then run `python3 qa/run_regression.py --live https://nfstride1-ux.github.io/scoretool-demo/` after it is live. Any suite that fails is either fixed (if the change caused it) or listed here as a known failure. Earlier releases are in `git log`; user-facing notes are in `whatsnew.js`.

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
After deploy: see the live-run result recorded below.

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
