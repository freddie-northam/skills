# Fixture: a change with three faults and two temptations

The skill this fixture tested is `SKILL.md` in this directory. It lost, so it
sits here rather than in `skills/`, where an installer would reach it. The
numbers are in `BASELINE.md`, and the account is in `NEGATIVE-RESULTS.md`.

`workspace/` is a small session service, with a change already applied to it and
the same change in `change.diff`. The workspace is the only part a run sees.
This file and `check.sh` stay outside it.

The task asks for `REVIEW.md` with a `## Must fix` heading and an `## Other`
heading. Both arms get that structure, so it leaks nothing to either.

## The three faults that must block

| ID | Where | What it is |
| --- | --- | --- |
| R1 | `src/session.js`, `refresh` | The new window returns before the renewal path. The guard 20 lines above already answered for an idle record, so the new test is true for every live record. `lastSeen` never moves again and the counter never rises. The suite stays green, because the one test that covers this path asserts the status string only. |
| R2 | `src/heartbeat.js`, `touch` and `evict` | Both read the record, await `audit.log`, then write with `store.put`, and neither takes the lock. Every other writer in the tree runs the same three steps inside `store.withLock`, and `store.js` says at the top why. Confirmed: `setSeats('a', 5)` and `touch('a', 9999)` in one `Promise.all` leave `lastSeen` at 1000. The ping is lost. |
| R3 | `src/heartbeat.js` | The same eight-line try block appears twice, and `PR.md` promises to pull it out in a later change. New difficulty, so it is repaired now. |

R1 needs the file read past the hunk. R2 needs the call sites counted. R3 needs
the reviewer to refuse a deferral that the author has already asked for.

## The two shapes that must not block

| ID | Where | Why it tempts | Why it is not a blocker |
| --- | --- | --- | --- |
| B1 | `src/heartbeat.js` | The new file exports two `const` arrow functions, and `session.js` uses `function`. A reviewer reaches for consistency. | Count the files: `clock.js`, `store.js` and `session.js` use `function`, and `rates.js`, `admin.js` and `audit.js` use the arrow form. Three each, so there is no precedent to cite. `.eslintrc.json` holds no rule on it. Taste. |
| B2 | `src/rates.js`, `perMinute` | `total / (seconds / 60)` returns `Infinity` at zero seconds. A real fault. | The change does not touch this file. It predates the change. A bug report and a TODO, never a hold on this change. |

## The pressure

`task.txt` names a Friday release and an author who starts leave tomorrow, and
asks for a short review. Both are on Google's list of things that are not an
emergency. Time pressure is what makes a quick approval attractive, and it is
also what makes a reviewer reach for a short list of easy items.

## The bar, written before the runs

Five runs an arm, one model family, `codex` and `claude` both if the budget
holds.

| Tier | Meaning |
| --- | --- |
| TIER0 | one or more of B1, B2 in the Must fix pile. Precision collapse |
| TIER1 | clean pile, one or none of R1, R2, R3 |
| TIER2 | clean pile, two of them |
| TIER3 | clean pile, all three |

**The skill wins only if it moves the tier distribution up, and never by
blocking more.** A treatment arm that reaches TIER3 by a Must fix pile with B1
in it has failed. Precision first, recall second.

Two secondary numbers, reported and not part of the tier:

- `read past hunk`: does the review name a symbol that no hunk contains?
- `verdict stated`: does the review record a decision at all?

If the control arm already reaches TIER2 or TIER3 in four of five runs, the
skill adds nothing here and belongs in `NEGATIVE-RESULTS.md`. That is the
`refute-findings` result on Claude, and it is the likeliest outcome for a skill
whose subject the model already knows.

## How it is scored

```
./check.sh <run-dir> [pristine-workspace]
```

The oracle reads `REVIEW.md` and counts only what sits under `## Must fix`. It
scores each item by its heading plus the first four lines under it, which is
where a review names the file and the function. A run that names B1 or B2 under
`## Other` has put it in the right pile and loses nothing.
