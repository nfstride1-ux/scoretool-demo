# Handoff

Read this file first, then [PROJECT_RULES.md](PROJECT_RULES.md).

Before you stop, add a signed entry in Australia/Perth time. Say who you are, what is done, what is half-done, what is next, and any decision. Sign with one tag: `[Claude]` `[ChatGPT]` `[Jarvis]` `[Grok Bot]` `[Cursor]`.

## 25 Nov 2026, 10:55 AWST — [Cursor]

- Who: Cursor.
- Done: Added `PROJECT_RULES.md`, this handoff, `AGENTS.md`, `CLAUDE.md`, and `IDEAS.md`. Added the `safety-smoke` and `privacy-scan` GitHub Actions checks, and a pull-request preview that publishes to `scoretool-lab` and comments the URL. Local smoke passed 15 of 15 in about 2 seconds. The privacy scan passed on current main. No app behaviour was changed.
- Half-done: Branch protection is written in `PROJECT_RULES.md` and is not switched on, because other open pull requests would wait for checks that are not on main yet. The preview workflow is in place. This session cannot add a deploy key on scoretool-lab, so `SCORETOOL_LAB_KEY` is not saved. The preview check stays green and comments the clicks. The address, once Nathe saves the key and re-runs the workflow, is `https://nfstride1-ux.github.io/scoretool-lab/pr/<number>/`.
- Next: Nathe reviews this pull request and merges it when he wants the checks on main. After that, he turns on the branch protection steps in `PROJECT_RULES.md`. Ideas in `IDEAS.md` stay queued. One at a time, and only when he asks.
- Decisions: One pull request, and it is not merged from here. Pull request 72 was open when this task started and was already on main (`dc6937d`) when this branch was cut, so this work sits on top of it and does not revert it. The privacy scan is strict, with no allow-list, because those personal files are already gone. The full `qa/run_regression.py` suite stays the manual pre-deploy check because it is too long for the pull-request gate. Previews go to `https://nfstride1-ux.github.io/scoretool-lab/pr/<number>/` and do not copy personal scoresheets or sight marks.
