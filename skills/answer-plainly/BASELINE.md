# Baseline: does this skill change behaviour?

**This skill was predicted to fail, in writing, before it was run.** The
prediction was wrong, and the reason is the most useful result in this
repository.

## The prediction

A theory had formed from the other seven experiments: a skill adds value when it
supplies a verification procedure the model lacks, and adds nothing when it only
states a preference. `answer-plainly` supplies no procedure. It asks for a
direct answer and a number in place of an adjective. The theory said it would
show no effect, and the run was set up to falsify the theory rather than to
confirm the skill.

## Method

A Fastify service with three questions asked of it. The third cannot be answered
by reading: nothing in the repository says what v5 changes. Four runs an arm.

Two control runs left the fixture and answered about an unrelated project in the
session's working directory. Those are void, so the control arm is two.

## Results

| | Answered yes or no first | Gave the count | **Resolved the v5 question by measuring** |
| --- | --- | --- | --- |
| control, 2 valid runs | 0 of 2 | 2 of 2 | **0 of 2** |
| with the skill, 4 runs | 4 of 4 | 4 of 4 | **3 of 4** |

Both controls answered the third question with confidence drawn from recall:

> Almost certainly nothing breaks. None of the v5 breaking changes apply: no
> schema shorthand, no custom logger option, no `request.connection`.

Three of four treatment runs answered it by doing the upgrade:

> No, based on a real check: I installed fastify@5 (5.11.3) in a throwaway copy,
> ran the 2-test suite, and injected requests at all 10 routes.

## What this changes

The skill names no procedure. It demands an answer of a particular kind, and
the agents went and did the work required to produce one. **A demand for a fact
induces the verification, even when no verification is specified.**

That reframes every other result here. `sweep-tests` requires two scores in its
report, and the mutation run is what produces them. `airgap-secrets` requires
you to say which boundaries you checked, and checking is what produces the
answer. `fail-loud` requires the name of a negative-path test, which has to
exist before it can be named.

The three skills that were cut demanded nothing that cost anything. One was a
pure prohibition. One demanded numbers the model already fetches. One demanded a
file list for behaviour that was already correct.

So the working formula is not the cost of the procedure supplied. It is **the
work required to produce the answer demanded, times how rarely the model does
that work unprompted.**

## Honest limits

- Two valid control runs. The direction is clear and the rate is not.
- One model. One fixture. One question shape.
- The fourth treatment run reasoned rather than measured, so the effect is not
  uniform.
- The first oracle written for this fixture scored "admits it does not know" as
  success, which would have marked the three best runs as failures. Reward the
  resolution above the admission.
