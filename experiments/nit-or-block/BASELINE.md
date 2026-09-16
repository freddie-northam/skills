# Baseline: nit-or-block

**The skill did not beat its control. It does not ship, so `SKILL.md` sits
here in `experiments/` rather than in `skills/`.** The full account is in
[NEGATIVE-RESULTS.md](../../NEGATIVE-RESULTS.md). This file holds the numbers.

Run it yourself. The fixture is in `experiments/nit-or-block/`, and the oracle is
`check.sh`, which the agent never sees.

```bash
cd harness
./run-arm.sh ../experiments/nit-or-block/workspace \
             ../experiments/nit-or-block/task.txt none ctl-1
bash ../experiments/nit-or-block/check.sh runs/ctl-1 ../experiments/nit-or-block/workspace
```

## The bar, written before the runs

The bar sits in
[`README.md`](./README.md),
and git history holds the proof: commit `e8991ef` carries the fixture, the tier
table and the skill, and no arm had run.

**The skill wins only if it lifts the tier distribution, and never by a longer
Must fix pile.** The fixture plants three faults that must hold the change and
two shapes that must not.

The same file also states the null condition: if the control reaches TIER2 or
TIER3 in four of five runs, the skill adds nothing here.

## 16 runs, two model families. All 16 exited 0

`gpt-6-astra` through `codex exec`, five pairs. Claude through
`claude -p --permission-mode acceptEdits`, three pairs.

| Measure | Control, 8 runs | Skill, 8 runs |
| --- | --- | --- |
| Tier, corrected oracle | 8 of 8 TIER2 | 8 of 8 TIER2 |
| R1, the window that skips the write | **8 of 8** | **8 of 8** |
| R2, the two writes with no lock | **8 of 8** | **8 of 8** |
| R3, the duplicate the author deferred | **0 of 8** | **0 of 8** |
| A taste call in the Must fix pile | 0 of 8 | 0 of 8 |
| An inherited fault in the Must fix pile | 0 of 8 | 0 of 8 |
| **A decision recorded in the review** | **0 of 8** | **8 of 8** |
| Named a symbol that no hunk contains | 5 of 8 | 8 of 8 |
| Mean review length, Codex arms | 13.6 lines | 17.0 lines |

The numbers above come from a hand read of all 16 reviews, not from the oracle.
The oracle agrees with the hand read after two corrections, both recorded below.

**The tier metric is a complete null.** Every arm, on both model families, put
the same two items in the Must fix pile.

## What the runs actually showed

**The deferral rule did not transfer, at all.** Google's guide says new
complexity is repaired before the merge, and the author's own `PR.md` asks to
defer it. Every run saw the duplicate and every run let it go, with the skill
loaded and without: "The duplicated retry code can wait", "do not independently
justify blocking or requiring a shared helper". 16 of 16. The skill states the
opposite rule in a sentence, and that sentence moved nothing.

**The precision half of the fixture never fired.** No run in either arm
mentioned the idiom split or the inherited fault, anywhere in the review. The
bait needs to sit inside the diff. A temptation that a reviewer never meets is
not a temptation, and the TIER0 column measured nothing.

**Two deltas are real. Both are disclosure, and both are instruction-following.** Every skill run
ended with a decision, and no control run did. Every skill run also wrote a
coverage line that names the functions it read end to end. The task never asked either arm for a decision, and only the skill does, so the
0 against 8 measures obedience to a format rule. Neither delta changed which
item holds the change.

**Both models found a fault the fixture did not plan.** Three runs reported that
`touch()` revives a session that already expired, because it writes `lastSeen`
with no expiry check. That is correct, and it is not on the list above.

## Honest limits

- **The oracle was corrected twice after the runs, and both corrections raised
  skill arms.** `cla-skl-1` and `skl-2` both found R1 in prose the pattern list
  did not hold, which a read of the two files confirms. The window went from
  four lines to eight, and three phrases went in. The published numbers come
  from the hand read, which does not depend on either correction, and the
  conclusion is the same before and after.
- **One fixture, one domain.** A small Node service, in memory, single process.
- **The Must fix heading comes from the task, not the skill.** Both arms were
  told to split the review in two. The skill was therefore never tested on
  whether it invents the split, only on what it puts in each pile.
- **The reproductions are what the reviews claim, not what the disk shows.**
  Codex reviews state that they ran assertions. `cla-ctl-2` says "Traced by
  reading the code. I did not run it", and `cla-skl-1` says the sandbox has no
  `node`. Each account of the fault is correct either way, and each rests on the
  agent's own word.
- **Deadline pressure is a text string.** The run has no real Friday.
- **Eight pairs is small.** It is enough to reject a large effect on the tier,
  and not enough to measure a small one.
