# Baseline: not yet measured

**This skill does not ship yet.** The repository's rule is that a skill ships
after it beats an agent with no skill loaded, measured. No arm has run. Nothing
below is a result.

The fixture, the oracle and the bar exist, and they were written before any run.
That order is the point: a fixture built after a result flatters the skill.

- Fixture and bar: [`experiments/nit-or-block/README.md`](../../experiments/nit-or-block/README.md)
- Oracle: `experiments/nit-or-block/check.sh`
- Task: `experiments/nit-or-block/task.txt`

## What the runs will ask

```bash
harness/run-arm.sh experiments/nit-or-block/workspace \
  experiments/nit-or-block/task.txt none control-1
harness/run-arm.sh experiments/nit-or-block/workspace \
  experiments/nit-or-block/task.txt skills/nit-or-block/SKILL.md skill-1
experiments/nit-or-block/check.sh harness/runs/control-1 experiments/nit-or-block/workspace
```

Five runs an arm. The tier table and the win condition sit in the fixture
README. In short: the skill wins only if it lifts the tier, and never if it
lifts the count of items that hold the change.

## The result this expects to find

The honest prediction is a small delta or none.

The subject is Google's reviewer guide, which is public, widely quoted, and
certainly in training data. `CONTRIBUTING.md` calls that the training-data test,
and a skill that fails it belongs in a repository's own instructions file
instead. Two results here already say the same thing: a `SPEC.md` in the
repository beat a skill written for the same rule, and the `refute-findings`
control on Claude matched its treatment arm three of three.

So the claim under test is narrow, and it is not "the model does not know how to
review".

**The claim: an agent reviewer knows the categories and still fails to split
them.** It writes one flat list, it holds a change over a taste call, and it
adopts an author's offer to tidy up later. The skill demands a check that costs
work before an item may hold a change: count the call sites, open the config,
read the function past the hunk.

## Honest limits, before the fact

- **The fixture may be too kind.** R1 is a live defect with a green suite over
  it, and a careful reviewer finds it without any skill. If every control finds
  all three, the fixture measures attention, not the split.
- **One fixture, one domain.** A small Node service, in memory, single process.
  A review of a schema change or a user interface change is not covered.
- **The oracle reads words, not intent.** It scores an item by its heading and
  first four lines. A review that buries the lock fault in a paragraph under an
  unrelated heading scores as a miss.
- **`## Must fix` comes from the task, not the skill.** Both arms get the pile
  names. The skill is therefore tested on what it puts in each pile, not on
  whether it invents piles. A weaker claim than the skill makes.
- **Deadline pressure is a text string.** The run has no real Friday.
