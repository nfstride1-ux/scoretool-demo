# ScoreTool changelog

Newest first. Each entry names the version tag shown in Settings.

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
