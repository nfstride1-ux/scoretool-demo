# Handoff

Read this file first, then [PROJECT_RULES.md](PROJECT_RULES.md).

Before you stop, add a signed entry in Australia/Perth time. Say who you are, what is done, what is half-done, what is next, and any decision. Sign with one tag: `[Claude]` `[ChatGPT]` `[Jarvis]` `[Grok Bot]` `[Cursor]`.

## 25 Nov 2026, 11:10 AM AWST — [Jarvis]

- Who: Jarvis.
- Done: On a finished Casual shoot, the Scores list keeps rank, name, score, 10s/X. The plain "Ends for each archer" dump is gone. Tapping a name (including name-only archers) opens that archer's full coloured scorecard, reused from the scoring-screen renderer (`csOneSheet`), with a Back button. Service worker cache is `v2026-11-25-1110-casual-sheet`. Scoring, saving and Lingkana/league code were not changed. Phone-sized test passed 20 of 20.
- Half-done: Nothing in this change.
- Next: Nathe reviews the pull request and says go live when he wants it up.
- Decisions: Rebased onto main after PR #74 landed (569d298). This pull request is not merged from here.

## 25 Nov 2026, 11:03 AWST — [Jarvis]

- Who: Jarvis.
- Done: PR #74 (`cursor/lk-night-pin`, cache `v2026-11-25-1103-nightpin4`). Lingkana sign-up is now per night: a registered archer ticks the night and enters name + own PIN (no passcode); a brand-new archer registers from the link with name, bow and a new PIN for the ticked nights (no passcode). Per-night records post as relay kind `lkreg2` (old app versions ignore it); old all-nights registrations still cover every night, so nobody already registered loses a night. Night login, group and paid lists show that night's sign-ups plus Nathe and Nate and anyone already paid or grouped. No PIN is reset; passcode unchanged and still checked at scoring login. Test: `tools/lk_night_pin_test.py` (needs `LK_TEST_PASSCODE` and `LK_SNAPSHOT`, a private copy of the live league).
- Half-done: not merged; Nathe approves go-live. `/test/` staging still has the old registration. Older scripts `lingkana_groups_test.py`, `live_go_live_test.py`, `lingkana_live_test.py` fill the old register form.
- Decision: a name already on the list without a PIN can't be claimed from the open link; that archer sets the PIN at login on the night (passcode).
## 25 Nov 2026, 10:55 AWST — [Cursor]

- Who: Cursor.
- Done: Added `PROJECT_RULES.md`, this handoff, `AGENTS.md`, `CLAUDE.md`, and `IDEAS.md`. Added the `safety-smoke` and `privacy-scan` GitHub Actions checks, and a pull-request preview that publishes to `scoretool-lab` and comments the URL. Local smoke passed 15 of 15 in about 2 seconds. The privacy scan passed on current main. No app behaviour was changed.
- Half-done: Branch protection is written in `PROJECT_RULES.md` and is not switched on, because other open pull requests would wait for checks that are not on main yet. The preview workflow is in place. This session cannot add a deploy key on scoretool-lab, so `SCORETOOL_LAB_KEY` is not saved. The preview check stays green and comments the clicks. The address, once Nathe saves the key and re-runs the workflow, is `https://nfstride1-ux.github.io/scoretool-lab/pr/<number>/`.
- Next: Nathe reviews this pull request and merges it when he wants the checks on main. After that, he turns on the branch protection steps in `PROJECT_RULES.md`. Ideas in `IDEAS.md` stay queued. One at a time, and only when he asks.
- Decisions: One pull request, and it is not merged from here. Pull request 72 was open when this task started and was already on main (`dc6937d`) when this branch was cut, so this work sits on top of it and does not revert it. The privacy scan is strict, with no allow-list, because those personal files are already gone. The full `qa/run_regression.py` suite stays the manual pre-deploy check because it is too long for the pull-request gate. Previews go to `https://nfstride1-ux.github.io/scoretool-lab/pr/<number>/` and do not copy personal scoresheets or sight marks.

