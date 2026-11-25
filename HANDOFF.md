# Handoff

Read this file first, then [PROJECT_RULES.md](PROJECT_RULES.md).

Before you stop, add a signed entry in Australia/Perth time. Say who you are, what is done, what is half-done, what is next, and any decision. Sign with one tag: `[Claude]` `[ChatGPT]` `[OpenAI]` `[Jarvis]` `[Grok Bot]` `[Cursor]`.

## 25 Nov 2026, 15:39 AWST — [Jarvis]

- Who: Jarvis.
- Done: Branch `cursor/plot-zoom-room` (cache `v2026-11-25-1539-zoomroom`). When the plotting zoom goes above 1x, the face box grows to most of the viewport so the zoomed face has more room around it. The magnifier stays on screen near the top and bottom edges (it flips below or to the side if there is no room, and is `position:fixed` so the scoring card does not clip it). At 1x the box stays the compact size it has now, including the shrink that keeps the score keys on screen. Score keys and Back/Next stay in the page and can be reached by scrolling. Shared helpers (`plotBaseH`, `plotZoomRoom`, `placeLoupe`) in `app.js`, used by Just me (`score()`), Casual and League plotting (`csFaceHtml` / `csFaceBind` / `csAdFit`), match nights / H2H (they use the Just me screen), and Just me vs ghost (insights no longer undoes the grown box). Covers single faces (40/60/80/122 cm), triangle and vertical 3-spot, WA field, Bugs Eyes, and clout-size 122 cm. Casual stays buttons-only where it already is (no plot face). Lingkana is still values-only and was not written to. Practice Arrows is a count page with no zoom/magnifier, and the Arrow optimizer tuning face has no zoom, so those were left as they are. No existing test was edited. This PR removes nothing.
- Half-done: PR only, not merged; waits for Nathe's "go live". Verified at 390x844 with touch: at 1x the box stays 290–338 px; at 5x it grows to 836 px; zoom-out restores the compact height; the magnifier stays fully on screen at the top and bottom edges.
- Decision: one pull request, not merged from here.

## 25 Nov 2026, 15:05 AWST — [Jarvis]

- Who: Jarvis.
- Done: Updated `cursor/score-tab-no-league` (PR #81) onto current main (merged #79 name suggestions and #82 My results source; no force push). Cache `v2026-11-25-1505-noleaguetab`, newer than live `v2026-11-25-1420-suggest2`. Score tab is still Just me and Casual shoot only. Clubs → Leagues → Lingkana, the scoring gate, and name suggestions are kept from main. Relay data was not written to.
- Half-done: Nathe said go live on PR #81; merge follows once required checks are green.
- Decision: this PR still removes only the Score-tab League shoot option and its helper. Nothing else is merged with it.

## 25 Nov 2026, 14:20 AWST — [Jarvis]

- Who: Jarvis.
- Done: PR #79 (`cursor/lk-reg-suggest`) updated onto current main (merged main, including the live #80 score gate and #82; no force push). Cache `v2026-11-25-1420-suggest2`. The same 2+ letter name suggestions now also run on the Score tonight / Login to Event name box (`#lkscorer`): up to 8 tap buttons (start of the name or of any word, any case, iPhone-safe plain buttons). A tap fills the exact name and moves to the PIN on the existing login screen. Suggestions include registered names already on the phone plus Nathe (Nathaniel Stride) and Nate Evans. Blue (registered tonight, unpaid) and green (paid) tick boxes on the host Registered Archers and Club pot lists are unchanged. New test `tools/lk_score_suggest_test.py` (relay posts are caught, never sent). No existing test changed. Lingkana league data was not written to. This PR removes nothing.
- Half-done: PR only, not merged; waits for Nathe's "go live".
- Decision: viewing stays open; scoring still needs a name+PIN, the passcode, or the host phone.

## 25 Nov 2026, 13:59 AWST — [Jarvis]

- Who: Jarvis.
- Done: PR branch `cursor/score-tab-no-league` (cache `v2026-11-25-1359-noleaguetab`). Removed the Score tab "League shoot" option and its helper text ("League shoots are scored inside your league, below. Open your league and tap Score my week."). Just me and Casual shoot stay. The hint "Leagues, match play and group cards are in Clubs" stays. If `_csMode` is still `'league'` (in-memory only; it was never saved to localStorage), the tab falls back to Just me with no error. Clubs → Leagues → Lingkana League and Score my week were not changed. Relay, pot, members, scores, paid ticks and groups were not touched. `/test/` staging was left as it is. No tests were edited. This branch was later updated to include main after PR #80 (Lingkana score gate) merged.
- Half-done: not merged; Nathe approves go-live. These tests still assert the old Score-tab League shoot button or `#lgcard` on Score when `_csMode` is `'league'`, and will fail if run: `tools/casual_test.py` (the type-picker checks), `tools/audit_2026_11_25_test.py` ("Score tab offers Just me, Casual, League"), and `tools/nopreset_test.py` (`card()` reads `#lgcard` after setting `_csMode='league'` and `nav('score')`). None of those are in the pull-request CI gate (`safety-smoke` + `privacy-scan`).
- Decision: one pull request, not merged from here.

## 25 Nov 2026, 13:58 AWST — [Jarvis]

- Who: Jarvis.
- Done: branch `cursor/lk-score-gate` (cache `v2026-11-25-1358-scoregate`). Lingkana scoring is gated. Anyone can still open the event home, registered list, scoresheets, ladder and pot with no profile. Before "Pick a target", ticks, group changes, scoring, or a league snapshot post, the app now asks for a registered name plus that archer's PIN, or the shared scoring passcode (same salted PBKDF2 verifier; the passcode itself is not in the repo). The host phone (`h2hMe()==='nathe'`) skips that check. Nate Evans skips only when already host-capable (`lkCoHostOn()`). "Score tonight" and `#lkfulllogin` stay, so `safety_smoke` still has its login path. New test: `tools/lk_score_gate_test.py` (needs `LK_TEST_PASSCODE`). Relay topic and live league data were not changed. Night default is still the last started night (18 Nov today): switching the picker to 2 Dec while `lgWeek()` stays on night 1 would silently refuse night-2 scores, so that was left alone.
- Half-done: PR only; not merged. Nothing goes live until Nathe says so, and only after this is verified on a real phone if he wants that too.
- Decision: viewing stays open; entering the scoring system does not. No features were removed. The Score-tab "League shoot" removal is a separate branch and was not touched here.


## 25 Nov 2026, 11:26 AWST — [Grok Bot]

- Who: Grok Bot.
- Done: Updated the shipping rule. Jarvis stays the lead and default builder. Claude, OpenAI, and Grok Bot may also ship code, as long as the change goes through a pull request, `safety-smoke` and `privacy-scan` pass, and a signed entry is added to this file. Nothing goes live without Nathe's own OK. No app code was changed.
- Half-done: Branch protection is still not switched on. Nathe has the steps in `PROJECT_RULES.md`.
- Next: Other AIs can pick up work after a credit drop, using this rule.
- Decision: Nathe approved this on 25 Nov 2026 at 11:20 Perth: any of these AIs may ship under the checks above. He also approved merging this pull request.

## 25 Nov 2026, 10:55 AWST — [Cursor]

- Who: Cursor.
- Done: Added `PROJECT_RULES.md`, this handoff, `AGENTS.md`, `CLAUDE.md`, and `IDEAS.md`. Added the `safety-smoke` and `privacy-scan` GitHub Actions checks, and a pull-request preview that publishes to `scoretool-lab` and comments the URL. Local smoke passed 15 of 15 in about 2 seconds. The privacy scan passed on current main. No app behaviour was changed.
- Half-done: Branch protection is written in `PROJECT_RULES.md` and is not switched on, because other open pull requests would wait for checks that are not on main yet. The preview workflow is in place. This session cannot add a deploy key on scoretool-lab, so `SCORETOOL_LAB_KEY` is not saved. The preview check stays green and comments the clicks. The address, once Nathe saves the key and re-runs the workflow, is `https://nfstride1-ux.github.io/scoretool-lab/pr/<number>/`.
- Next: Nathe reviews this pull request and merges it when he wants the checks on main. After that, he turns on the branch protection steps in `PROJECT_RULES.md`. Ideas in `IDEAS.md` stay queued. One at a time, and only when he asks.
- Decisions: One pull request, and it is not merged from here. Pull request 72 was open when this task started and was already on main (`dc6937d`) when this branch was cut, so this work sits on top of it and does not revert it. The privacy scan is strict, with no allow-list, because those personal files are already gone. The full `qa/run_regression.py` suite stays the manual pre-deploy check because it is too long for the pull-request gate. Previews go to `https://nfstride1-ux.github.io/scoretool-lab/pr/<number>/` and do not copy personal scoresheets or sight marks.

## 25 Nov 2026, 11:03 AWST — [Jarvis]

- Who: Jarvis.
- Done: PR #74 (`cursor/lk-night-pin`, cache `v2026-11-25-1103-nightpin4`). Lingkana sign-up is now per night: a registered archer ticks the night and enters name + own PIN (no passcode); a brand-new archer registers from the link with name, bow and a new PIN for the ticked nights (no passcode). Per-night records post as relay kind `lkreg2` (old app versions ignore it); old all-nights registrations still cover every night, so nobody already registered loses a night. Night login, group and paid lists show that night's sign-ups plus Nathe and Nate and anyone already paid or grouped. No PIN is reset; passcode unchanged and still checked at scoring login. Test: `tools/lk_night_pin_test.py` (needs `LK_TEST_PASSCODE` and `LK_SNAPSHOT`, a private copy of the live league).
- Half-done: not merged; Nathe approves go-live. `/test/` staging still has the old registration. Older scripts `lingkana_groups_test.py`, `live_go_live_test.py`, `lingkana_live_test.py` fill the old register form.
- Decision: a name already on the list without a PIN can't be claimed from the open link; that archer sets the PIN at login on the night (passcode).

## 25 Nov 2026, 12:45 AWST — [Jarvis]

- Who: Jarvis.
- Done: branch `fix/returning-tester-profiles` (cache `v2026-11-25-1215-profilefix`). Fixes phones that had a tester profile from before PR #72: `profiles.js` names the kept profile only from what that phone already saved (its own score file's profile name, own display-name pick, name cache; last resort the id); `names.js` shows that profile's own first name instead of "Archer N", skips the forced display-name screen for kept profiles (tab bar stays), and no longer builds an empty name pattern when a phone has no profiles; an old `?tester=<id>` link for a profile not on the phone is dropped from the address. `aba.js`: removed a leftover reference to the paper-sheet note text deleted in #72 (ReferenceError "NOTE is not defined" on the phone that has that sheet). No names list, scoresheets or sight marks added; no tests edited.
- Half-done: not a PR yet and not merged; Nathe reviews the Step 1 evidence first. Step 2 (giving people their own data back) not started.
- Note: headless Chrome hangs on reopening the page while an old service worker hands over; the same hang happens with a plain version bump of the pre-#72 build, so it is not from #72/#74 and is not changed here.

## 25 Nov 2026, 13:20 AWST — [Jarvis]

- Who: Jarvis.
- Done: branch `feat/import-my-data` (cache `v2026-11-25-1345-mydata`), Stage 2 option (b). New `mydata.js` plus Tools > Import my data. An archer picks the file Nathe sent them. It is read on the phone only (no upload or fetch) and kept under `scoretool.mydata.<profile id>`. The old `data/...` addresses (scoresheets, official results, results list) are answered from that copy, so Scorecards, Best, Ranks and Coach's read work again. Without a file they return 404 with no network request. It also adds the archer's paper ABA sheet by id and sight marks onto their existing bow. The merge never wipes or duplicates anything, and a bad file is refused. `app.js` fetches the results list again. `real.js`/`stats2.js` `isMe` now means "has imported official results".
- Not in the repo: no personal data. The export files are kept outside every repo. `privacy_scan` passes.
- Half-done: no PR yet; Nathe reviews the evidence first. Only Nathe's file is built.
- Note: `safety_smoke` fails about 1 run in 8 at the casual Score-tab wait, on main too (pre-existing flake).

## 25 Nov 2026, 13:29 AWST — [Jarvis]

- Who: Jarvis.
- Done: Lingkana `#lk-register` "Already registered": typing 2+ letters lists matching registered names (start of the name or of any word, any case, up to 8) as tap buttons; a tap fills the exact name and moves to the PIN. Names come from the league already on the phone (`lkKnownRegistrants`), no new public file. Plain buttons, not `<datalist>`, so it works on iPhone Safari. Cache `v2026-11-25-1329-regsuggest`. New test `tools/lk_reg_suggest_test.py` (needs `LK_SNAPSHOT`, a private league copy; posts nothing to the relay). No existing test changed.
- Half-done: PR open, not merged; Nathe approves go-live.

## 25 Nov 2026, 13:39 AWST — [Jarvis]

- Who: Jarvis.
- Done (same PR #79, Nathe's ask): host "Registered Archers" list and the Club pot "Tick who paid" list show a night's paid box BLUE when that archer signed up for that night and is not ticked paid yet. Tapping it ticks paid exactly as before (`lkSetPaid`, host phone only, `lg.paid[night][id]`); paid boxes show a green tick; boxes for nights the archer is not on stay plain white. Who counts as signed up for a night: `lkNightRegd` in `lingkana.js` — rows from a night-by-night sign-up now carry `nr`; rows already on phones count if their sign-up time is after PR #74 went live (2026-11-25 03:07:58 UTC); the old "every night" registrations do not; a PIN-only update is not a sign-up and no longer moves the row's sign-up time; Nathe and Nate count on every night. Existing paid ticks are read and stored unchanged. Cache `v2026-11-25-1339-paidblue`. New test `tools/lk_roster_paid_test.py` (needs `LK_SNAPSHOT`; relay posts are caught, never sent). No existing test changed.
- Half-done: PR open, not merged; Nathe approves go-live.
- Next: after go-live, a host phone that synced before shows blue for today's night-2 sign-ups from their sign-up time; nothing to migrate.

## 25 Nov 2026, 14:02 AWST — [Jarvis]

- Who: Jarvis.
- Done: branch `cursor/remove-myresults-source` (cache `v2026-11-25-1410-noresultsrc`). Nathe (t1160u, t1165u): Tools > My results source removed from the live app and from `/test/`, with all its tools: results region + member number + Open my results, Archer's Diary "Paste my results", "Paste a table or a CSV", "Add an official result" with photo/screenshot reading (Tesseract OCR), and the switched-off Sync now card. Deleted `results.js`, `diarypaste.js`, `vendor/ocr/`, `test/results.js`, `test/vendor/ocr/`, `tools/diary_paste_test.py`; removed the Tools row/section in `lab.js` and `test/lab.js`, `lab_results` in `test/tiers.js`, the script tags, the `test/sw.js` entry, and the What's new notes about the page. `window.importedShoots`/`window.officialAdded` moved into `mydata.js` (read only), so results already saved on a phone by that page still show in PBs, Stats and calendar sync. `tools/rankings_card_test.py`: only its My results source steps changed (it seeds the saved rows instead of pasting). Import my data unchanged.
- Not in the repo: a copy of the removed page (live and `/test/`) is kept in the private backup on Jarvis's box, not published.
- Half-done: PR only, not merged; waits for Nathe's "go live". The Archer's Diary Export (.xlsx) import is not built.
