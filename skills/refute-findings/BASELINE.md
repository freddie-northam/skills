# Baseline: refute-findings

Run it yourself. The fixture is in `fixture/`, and the oracle is `check.sh`,
which the agent never sees.

```bash
cd harness
./run-arm.sh ../skills/refute-findings/fixture/workspace \
             ../skills/refute-findings/fixture/task.txt none ctl-1
bash ../skills/refute-findings/fixture/check.sh runs/ctl-1
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

_Pending. This file was committed before the runs._

## Honest limits

_Pending._
