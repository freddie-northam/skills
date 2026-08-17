# Baseline: refute-findings

Run it yourself. The fixture is in `experiments/refute-findings/`, and the oracle is `check.sh`,
which the agent never sees.

```bash
cd harness
./run-arm.sh ../experiments/refute-findings/workspace \
             ../experiments/refute-findings/task.txt none ctl-1
bash ../experiments/refute-findings/check.sh runs/ctl-1
```

## The bar, written before the run

This section was committed before any arm ran. Git history holds the proof.

**What is measured.** Precision, not recall. The workspace holds two real
defects and four decoys. A decoy is a real shape in the source that is not a
defect: it is deliberate, unreachable, standard, or harmless. The oracle counts
how many decoys reach the `## Findings` section of the agent's report.

**The bar the skill must clear.** The control must report decoys at a rate the
skill visibly reduces. Concretely, to ship:

- the control must average **at least 1.5 decoys** an arm, or the fixture is not
  tempting and the fixture is at fault, not the skill;
- the skill must average **at most half** the control's decoy count;
- the skill must not lose recall to get there. If the skill reports no decoys
  and also finds neither real defect, that is TIER1 and it is not a win.

**What would falsify the skill.** Either arm landing in the same tier band, or
the skill trading precision for silence.

## The prediction, written before the run

Recorded so that the theory is tested rather than fitted afterwards.

**Prediction: the skill wins on D2 and D3, and probably not on D1.**

The reasoning. D2 dies to a count of callers and D3 dies to naming a convention.
Both are cheap checks an agent will run once told to, and both produce a hard
answer. D1 dies to reading a comment that is already three lines above the code,
so a careful control should catch it without any skill. D4 is the one I am least
sure of, because the direction argument needs the agent to trace the consumer,
which is real work under time pressure.

**Secondary prediction: the control will not report zero decoys.** The task
names a Friday release and asks for what matters. That pressure is there to make
a plausible finding attractive.

**Stated risk to this experiment.** The skill's demand for four artifacts per
finding may suppress reporting in general rather than suppress wrong reporting
in particular. If the skill arm returns TIER1 with nothing found, that is the
failure mode, and it is a real possibility. The oracle scores it as a
non-win on purpose.

## Results

26 runs. `gpt-5.6-sol` through `codex exec`, and Claude through `claude -p`.

**The short version.** On Codex the skill works and the claim is legibility, not
precision. On Claude it does nothing, because the control already does what the
skill asks. Install it for Codex.

### Fixture v1: the precision claim could not be measured

| Arm | 1 | 2 | 3 | 4 | 5 | Decoys an arm |
| --- | --- | --- | --- | --- | --- | --- |
| Control | T3 | T3 | T3 | T3 | T1 | **0.2** |
| Skill | T3 | T3 | T3 | T3 | T3 | **0.0** |

The bar required the control to average at least 1.5 decoys. It averaged 0.2.

**The fixture is at fault, and the bar said so before the run.** Every decoy in
v1 carried a comment stating its own defence: `wire.js` explained the round-trip
requirement in eight lines, `compareJobs` was labelled a sort comparator, and
`isTerminal` explained the poller. Rejecting those costs a glance, not a check.
No skill is needed to read the line above the code. This repeats the
`fix-the-code-not-the-gate` result in METHOD.md, where the fixture stated its own
answer and ten of ten runs got it right in both arms.

Both arms found both real defects in every run. The skill cost no recall.

### What v1 did measure: the audit's negative space

| | Rejection section | Killed candidates listed | Mean lines |
| --- | --- | --- | --- |
| Control | **0 of 5** | 0 | 33.0 |
| Skill | **5 of 5** | up to 9 | 46.4 |

No control wrote a rejection section in any run. Every skill run did. The skill
runs also killed candidates nobody planted, and killed them with artifacts:
caller counts, `test/wire.roundtrip.test.js:8-16`, `src/worker.js:13`, a computed
maximum delay of 1600ms.

This is a real effect and a smaller claim than precision. A reader of a control
audit cannot tell "I considered these and rejected them" from "I never looked".
A reader of a skill audit can.

### The defect this found in the skill itself

One candidate separated the arms in the direction that matters.

| Run | Verdict on `attemptsFor` returning 0 for an absent ID |
| --- | --- |
| `ctl-5`, no skill | Reported it, high severity |
| `tre-3`, skill v1 | **Killed it**, citing "`planNext` has zero in-repository callers" |

The control was right. The defect is reachable through the other planted defect:
once `remove` drops the id, `attemptsFor` returns 0 for a job still in flight and
`recordAttempt` no-ops, so the job retries at 100ms forever and never reaches
`MAX_ATTEMPTS`.

So the first version of this skill was **worse than no skill** on that finding.
Its reachability killer suppressed a real defect that the control caught, because
the agent read "no caller in this repository" as proof of unreachability. For an
exported symbol that is backwards: no internal caller means it is a public
interface, and its inputs are hostile rather than absent.

The skill now says so, in the reachability killer itself. That edit is measured
separately below, on the same fixture, so the edit cannot hide behind a fixture
change.

### The edit, measured on its own

Two arms on the **v1** fixture with the edited skill, so the edit cannot hide
behind a fixture change.

| Skill version | Runs | Used "no callers in this repository" as a kill | Tier |
| --- | --- | --- | --- |
| v1, unedited | 5 | **2 runs** (`tre-2` once, `tre-3` three times) | T3 ×4, T3 |
| v2, edited | 2 | **0 runs** | T3, T3 |

No recall cost: both edited arms found both real defects.

The mechanism is worth naming. Closing the "no callers" escape hatch removed the
cheap answer to the reachability killer. `edit-1` then answered it the expensive
way, by running the code:

> A direct run that gave job `a` five attempts, queued a fresh job `b`, and
> removed `a` left array lengths of `1/1/2`. `attemptsFor('b')` returned `5`...
> The error therefore runs in both harmful directions.

That is a better account of R1 than the fixture author wrote. Two arms is not
proof. It rules out an obvious regression and is consistent with the edit working.

### Fixture v2: signposts removed, facts unchanged

v2 deletes the comments that stated each decoy's own defence, moves the retry cap
behind a config indirection, and renames `compareJobs` to `rank`. Every killer
still works. None costs a glance any more.

| Arm | 1 | 2 | 3 | Decoys an arm |
| --- | --- | --- | --- | --- |
| Control | T1 | T1 | T3 | **0.67** |
| Skill | T3 | T3 | T3 | **0.00** |

**This does not clear the bar.** The bar required the control to average 1.5
decoys. It averaged 0.67, which is two decoy events across three runs. The
direction is consistent and the sample is too small to carry the precision claim,
so the claim is not made.

Both control failures were the same decoy, D1. My v2 changes to D2, D3 and D4 did
not make them tempting, so three of the four killers were never put under load.

What the two events do show, concretely, is the killer working as designed:

| | D1, the envelope flags |
| --- | --- |
| `v2c-1`, no skill | Reported it. "High: Independent envelope flags permit contradictory lifecycle states" |
| `v2t-1`, skill | Killed it. "killed by stated intent. `test/wire.roundtrip.test.js:5-15` exhaustively constructs all eight flag combinations and requires byte-identical round trips." |

The comment stating that requirement was removed in v2. The only remaining
evidence is the test. The skill run read the test. The control did not, and
reported a non-defect as high severity in a release week.

### What is actually measured, on `gpt-5.6-sol`

Across all 20 Codex runs, on both fixtures:

| Measure | Control | Skill |
| --- | --- | --- |
| **Wrote a rejection section** | **0 of 8** | **8 of 8** |
| Cited file and line | 0 in the two v2 arms checked | 10 and 2 |
| Found both real defects | every run | every run |
| Mean report length, v1 | 33.0 lines | 46.4 lines |

**The measured claim is legibility, not precision.** No Codex control in twenty
runs wrote down what it considered and rejected. Every skill run did, with
artifacts: caller counts, `test/wire.roundtrip.test.js:8-16`, `src/worker.js:13`,
a computed maximum delay of 1600ms.

### On Claude the control already does it, so the skill adds nothing

Six arms, three pairs, v2 fixture, `claude -p`. All six exited 0.

| Measure | Claude control | Claude skill |
| --- | --- | --- |
| Wrote a rejection section | **3 of 3** | **3 of 3** |
| Decoys reported | 0 | 0 |
| Both real defects found | 3 of 3 | 3 of 3 |

**The arms are indistinguishable on every measure.** Against the Codex result of
0 of 8 versus 8 of 8, this is a complete null.

The controls had no skill loaded, which is verified rather than assumed: the
control prompt is the eleven-line task, with no `<skill>` block and no occurrence
of "four killers". They wrote refutation sections anyway, titled "Candidates that
died", "Candidates I killed" and "Candidates that were killed". Two added a
section the skill never asks for: "Reviewed with nothing to claim" and "Note for
the Friday release". They cited `wire.roundtrip.test.js:5` and killed the decoy
that two Codex controls reported as a high-severity defect.

The section titles are the strongest evidence that this is model-native rather
than skill-induced. The skill says "say how many candidates you killed". Claude
controls that never saw that sentence produced "Candidates I killed" verbatim,
and each control matched its paired skill run's title exactly.

So the effect this skill was measured on is **absent on Claude, because the
control is already there.** That is the same shape as `sweep-tests`, which cuts
67 percent on Fable and 8 percent on Sonnet.

If you run Claude, this skill is insurance, not a fix. Install it for Codex.

### A correction to this document's own instrument

The oracle originally grepped the whole `## Findings` section. A Claude run
described how the parallel-array defect pins a job at `backoffMs(0)` forever,
which is a correct account of a real defect, and the grep counted it as
reporting the backoff decoy. Scoring only headings then over-corrected: a
genuine report titled "Independent envelope flags permit contradictory lifecycle
states" names the decoy without using any of its identifiers.

The oracle now splits the section into findings and scores each one's heading
plus the first few lines, which is where a report names its file and function.

**Every arm above was re-scored with the corrected oracle and the Codex numbers
are unchanged**: 0.2 and 0.0 decoys an arm on v1, 0.67 and 0.0 on v2. The
correction moved only the Claude arms, which had not been published. The
mis-scored Claude control was reported once in conversation as having fallen for
a decoy. It had rejected it.

The skill runs also killed candidates nobody planted, and killed them correctly:
unstable drain order, killed by convention, "ECMAScript specifies stable
`Array.prototype.sort`"; a first-retry off-by-one, killed by convention, because
the count is zero-based. Those are the plausible-but-wrong findings that pad a
release-week audit.

So a reader of a control audit cannot tell "I considered these and rejected them"
from "I never looked". A reader of a skill audit can. That is a smaller claim
than the one this skill was written to make, and it is the one the evidence
supports.

## Honest limits

- **The precision claim is not established.** 0.67 decoys an arm in the control,
  against a pre-registered bar of 1.5. Two events. The fixture never reached the
  temptation threshold I committed to before running, on either version.
- **The separation rests on one decoy.** D1 in both control failures. D2, D3 and
  D4 never tempted a control, so the reachability, convention and direction
  killers are untested against a control that actually falls for something.
- **Recall was never under pressure.** Both arms found both real defects in all
  26 runs. This fixture cannot detect a recall cost, and the skill's demand for
  four artifacts is exactly the kind of thing that would cause one.
- **Two models, and they disagree.** The whole effect is on `gpt-5.6-sol`. On
  Claude the control writes the rejection section unprompted in 3 of 3 runs, so
  the skill adds nothing measurable. Do not read the headline as a general
  result. A third family would tell you which of the two is the outlier, and
  that has not been run.
- **Small n.** Five pairs on v1, three on v2, two edit-regression arms, three
  pairs on Claude. 26 runs in total.
- **The oracle was corrected after the runs.** It scored prose where it should
  have scored each finding's subject. Everything was re-scored and the Codex
  numbers did not move, but the instrument was wrong for part of this
  document's history and a reader should know that.
- **The oracle greps a report, not a disk.** Unavoidable: an audit's output *is*
  a report. `answer-plainly` has the same property and ships no `check.sh` at
  all. It is only sound here because the harness now strips the prompt from the
  transcript. Before that fix, every pattern in a `SKILL.md` scored its own
  treatment arm.
- **The Findings-section split is imperfect.** A run that names a decoy inside
  `## Findings` in order to reject it scores as reporting it. That biases against
  the skill, which is the safe direction, but it is not exact.
- **The 26 runs predate one fixture change.** `config.js` originally carried
  `maxDepth: 500`, duplicating `MAX_DEPTH` in `queue.js`. That was clutter I
  added, not a planted defect, and controls on both models correctly reported it
  as a third finding. It has been removed. Every published metric here counts
  decoys, planted defects and rejection sections, and the duplicate appears in
  none of those patterns, so no number moves. But the workspace you can run
  today is not byte-identical to the one that produced these numbers, and the
  difference is that one key.
- **The fixture was rebuilt twice.** Once for a structural bug that made the
  retry path unreachable and broke two decoys, found by a control run. Once for
  temptation. The bar was committed before the first arm and never moved. The
  run made against the broken fixture is discarded, not reported.
- **The skill was edited mid-experiment**, on evidence from the runs. The edit is
  measured separately on the unchanged fixture, but two arms is thin.
- **A hook would not do this.** No linter can tell a well-evidenced finding from
  a plausible one. But neither can this skill, reliably: it is an instruction,
  and `tre-3` reasoned around it three times in one run before the edit.

## Would a hook do this better?

No, and no deterministic check exists. A finding's soundness is not a property of
the diff. But the honest position is that this skill's effect is on the *shape*
of the report rather than on its correctness, and the shape is checkable: a CI
step could reject an audit that has no rejection section. That gate would be the
control, and the skill would do the work, which is the same split
`sweep-tests` has.
