# Fixture: an audit with four traps in it

`workspace/` is a small job queue. It is the only part a run ever sees. This
file and `check.sh` stay outside it.

The workspace holds **two real defects** and **four decoys**. A decoy is a shape
that looks like a defect and is not. Each decoy dies to exactly one of the four
checks the skill demands.

## The decoys

| ID | Where | Why it tempts | What kills it |
| --- | --- | --- | --- |
| D1 | `src/wire.js`, three flags | Three booleans permit eight combinations, four of them nonsense. Textbook discriminated union. | **Stated intent.** `test/wire.roundtrip.test.js` constructs all eight and requires a byte-identical round trip. |
| D2 | `src/retry.js`, `backoffMs` | `BASE_MS * 2 ** attempt` with no cap in the function. Reads as unbounded growth. | **Reachability.** Its only caller, `worker.js`, gives up at `limit('maxAttempts')`, which `config.js` fixes at 5. The largest delay this code can produce is 1600ms. |
| D3 | `src/queue.js`, `rank` | Returns bare `-1`, `0`, `1` from a function whose name does not say comparator. Reads as magic numbers wanting an enum. | **Convention.** `drainOrder` passes it to `.sort`, so it is the `Array.prototype.sort` contract. |
| D4 | `src/status.js`, `isTerminal` | An unrecognised status silently reads as non-terminal. Reads as a swallowed error. | **Direction.** Trace the consumer: `summarize` over-reports running work. It can waste a poll. It can never drop a job. |

**No decoy states its own defence.** An earlier version of this fixture put the
answer in a comment above each one, and five of five controls rejected all four
without a skill loaded. Rejecting a labelled decoy costs a glance. Every killer
above now costs a check: read a test, follow a constant through a module, notice
what a function is passed to, trace a consumer.

## The real defects

| ID | Where | What it is |
| --- | --- | --- |
| R1 | `src/queue.js`, `remove` | `ids`, `payloads` and `attempts` are parallel arrays. `remove` splices the first two only. After one removal every later job reads another job's attempt count. Confirmed: `attemptsFor('b')` goes 2 → 0 after `remove('a')`, arrays 1/1/2. A job can then retry past `MAX_ATTEMPTS` forever. |
| R2 | `src/status.js`, `billableSeconds` | Compares `'cancelled'`, two Ls. Every writer sets `'canceled'`, one L. The branch never fires, so a canceled job bills its full duration. Confirmed: 60 seconds where 0 was intended. |

Both are reachable, undocumented, and fail in the harmful direction. Neither is
covered by a test. The suite is green at 6 of 6, so green proves nothing here.

## How it is scored

`check.sh <run-dir> [pristine-workspace]` reads `AUDIT.md` and counts only what
sits under `## Findings`.

The second argument is optional. Supply it to have the oracle report source
files the run changed, since the task asked it not to. Without it the oracle
says nothing about that, rather than guess from timestamps.

A run that names a decoy **outside** that section, to say why it rejected it, is
doing the right thing and is not penalised. The task asks both arms for the same
section, so the structure leaks nothing to either.

| Tier | Meaning |
| --- | --- |
| TIER0 | two or more decoys reported. Precision collapse |
| TIER1 | one decoy reported, or no decoys and neither real defect |
| TIER2 | no decoys, one real defect |
| TIER3 | no decoys, both real defects |

The metric is **precision, not recall.** A control that reports all six items
scores TIER0. A run that reports nothing at all scores TIER1, which is worse
than TIER2 and better than TIER0, because silence is a poor audit and a
confident wrong audit is a harmful one.

## The pressure

The task names a Friday release and asks the agent to keep it to what matters.
Time pressure is what makes a plausible finding attractive to report.
