# Handoff

Read this file first, then [PROJECT_RULES.md](PROJECT_RULES.md).

Before you stop, add a signed entry in Australia/Perth time. Say who you are, what is done, what is half-done, what is next, and any decision. Sign with one tag: `[Claude]` `[ChatGPT]` `[OpenAI]` `[Jarvis]` `[Grok Bot]` `[Cursor]`.

## 25 Nov 2026, 14:25 AWST — [Jarvis]

- Who: Jarvis.
- Done: branch `cursor/cal-delete-sync` (cache `v2026-11-25-1425-caldel`). Deleting a ScoreTool session now removes it from the linked Archery Calendar My events list and the score-shot day marks. `dropScore` and Discard round call `calDiscard`. On each sync, sessions (and official/imported rows) that were already sent but are no longer in ScoreTool, including ones deleted before this change, are posted to `scoretool_delete_score`. If that function is not on the calendar yet, the id stays in `sent` and is retried; new scores still send. New test: `tools/calsync_delete_test.py` (tester Steven Test, mocked RPC, no live league data). Lingkana data was not touched. No features were removed.
- Half-done: PR only; not merged. The calendar SQL (`scoretool_delete_score` in nfstride1-ux/archery-calendar branch `cursor/scoretool-delete-score`) must be run in the live Supabase SQL Editor or deletes will wait and retry. Nothing goes live until Nathe says so.
- Next: Nathe reviews both pull requests. Apply the SQL, then this ScoreTool change, then verify on a phone if he wants.
- Decision: Incomplete sessions should not auto-sync unless they are marked finished or tied to an event (existing rule, unchanged). The calendar should only keep what ScoreTool still has. Already-deleted incomplete scores are cleaned up on the next successful sync once the SQL is live.

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

## 25 Nov 2026, 14:02 AWST — [Jarvis]

- Who: Jarvis.
- Done: branch `cursor/remove-myresults-source` (cache `v2026-11-25-1410-noresultsrc`). Nathe (t1160u, t1165u): Tools > My results source removed from the live app and from `/test/`, with all its tools: results region + member number + Open my results, Archer's Diary "Paste my results", "Paste a table or a CSV", "Add an official result" with photo/screenshot reading (Tesseract OCR), and the switched-off Sync now card. Deleted `results.js`, `diarypaste.js`, `vendor/ocr/`, `test/results.js`, `test/vendor/ocr/`, `tools/diary_paste_test.py`; removed the Tools row/section in `lab.js` and `test/lab.js`, `lab_results` in `test/tiers.js`, the script tags, the `test/sw.js` entry, and the What's new notes about the page. `window.importedShoots`/`window.officialAdded` moved into `mydata.js` (read only), so results already saved on a phone by that page still show in PBs, Stats and calendar sync. `tools/rankings_card_test.py`: only its My results source steps changed (it seeds the saved rows instead of pasting). Import my data unchanged.
- Not in the repo: a copy of the removed page (live and `/test/`) is kept in the private backup on Jarvis's box, not published.
- Half-done: PR only, not merged; waits for Nathe's "go live". The Archer's Diary Export (.xlsx) import is not built.
