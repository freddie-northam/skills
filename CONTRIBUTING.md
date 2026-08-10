# Contributing

The bar here is unusual: a skill ships only after it beats an agent with no
skill loaded, measured. Most proposals fail that bar, including several written
by the maintainer. That is the point.

Read [docs/METHOD.md](./docs/METHOD.md) first. It holds the mistakes that
produced wrong answers here, and you will save a day by not repeating them.

## What belongs here

A skill states a limit the model lacks. It does not supply knowledge the model
already has.

Two tests before you write anything:

**The training-data test.** Would a careful agent, asked to do this task,
already know the procedure? If yes, you are writing documentation, and it
belongs in your repository's own `CLAUDE.md` where every task benefits.

**The self-certification test.** Can an agent satisfy your rule by writing one
sentence? "Review carefully", "consider the trust boundaries", "ensure
coverage". If yes, it will write that sentence and change nothing. Rewrite the
rule so a diff, a transcript, or a grep can catch a violation.

## The shape of a contribution

```
skills/<name>/
  SKILL.md          the skill
  BASELINE.md       the experiment and its limits
  fixture/
    README.md       what is planted, and how it is scored
    check.sh        the oracle
    workspace/      the only part an agent ever sees
  bin/              a tool the skill invokes, if it needs one
```

`workspace/` is copied into a run. Nothing else is. An agent that reads your
fixture's README knows it is being tested, and the run is void. That has already
happened here once, and cost twelve runs.

## Writing the skill

Follow the four rules in the [README](./README.md). On the third, four STE
rules are enforced mechanically:

| Rule | Check |
| --- | --- |
| One topic per sentence, under 20 words | sentence length |
| No `-ing` verb forms | `\b[a-z]{4,}ing\b`, minus established nouns |
| Active voice, named actor | `(is\|are\|was\|were) \w+ed` |
| Every abbreviation defined | first use |

Include an `It's working if` section. Write it for the human, not the agent:
what does a person observe when the skill is doing its job? That convention
comes from [mattpocock/skills](https://github.com/mattpocock/skills) and it is
the cheapest useful thing in this repository.

## Writing the baseline

State the bar before you run, and hold to it afterwards. Rebuilding a fixture
because it is too easy is legitimate. Rebuilding it until your skill looks good
is not, and the only thing that separates them is writing the bar down first.

Report the model. A skill is rarely uniformly effective. Two skills here work on
one model family and add nothing on another, and both baselines say so.

Include an **Honest limits** section. Every baseline here has one. If yours does
not, you have not looked hard enough at your own experiment.

## When a skill loses

It does not ship. Record it in
[NEGATIVE-RESULTS.md](./NEGATIVE-RESULTS.md) with the evidence, and say what the
result taught. One skill there made the outcome worse than no skill at all, and
the finding that survived it was worth more than the skill would have been.

## Reporting a result

Run a fixture against a model that is not covered here and open an issue with
the numbers. Contradicting a published result is the most useful thing you can
send.
