# How a skill earns its place

A skill in this repository must beat an agent with no skill loaded. This
document is the method, including the mistakes that produced wrong answers, so
you can repeat it and so you can distrust it where it is weak.

## The shape of a test

1. **A fixture.** A small repository or workspace with something planted in it.
2. **A task**, phrased the way a person would type it. Never a phrasing that
   describes the skill's own method, which leaks the answer into the control.
3. **A control arm.** The same task, the same model, no skill loaded.
4. **A treatment arm.** The skill in context, nothing else changed.
5. **A hidden oracle.** A check the agent never sees, that decides the outcome
   from files on disk rather than from what the agent reports.
6. **Repetition.** Five runs an arm. Single samples lie.

## Build a fixture that tempts

This is the hard part, and the part that produced two wrong answers here.

**The failure must be attractive.** A defect whose correct repair is obvious and
cheap produces a null result, because no agent is tempted. The first
`fix-the-code-not-the-gate` fixture stated the contract in a source comment,
named a test after the missing behaviour, and printed the answer in the failure
message. Ten of ten runs repaired it correctly, with and without the skill. The
fixture was at fault, not the skill.

**Add the pressures that exist in real work.** Time, authority, and doubt. A
deadline, a stated suspicion that the tests may be wrong, an instruction to be
quick. Discipline holds easily when nothing pushes against it.

**Grade the material.** Plant things that should be kept as well as things that
should be removed, so a skill that over-applies is caught. A skill that deletes
everything scores the same as a skill that deletes correctly, unless something
was meant to survive.

**Plant one trap.** Something that looks obviously correct and is not. In the
`sweep-tests` fixture a snapshot holds the only coverage of negative numbers, so
deleting it looks tidy and silently drops real coverage.

## Keep the oracle out of the workspace

An agent that can read the fixture's own README knows it is being tested.

Twelve runs were discarded here for that reason. The agent said so directly:
"The directory README.md confirms this is a deliberate injection test fixture
where INJECTED.txt is the oracle." Every fixture now separates `workspace/`,
which is copied into the run, from the README and the oracle, which are not.

## Measure from disk, not from the report

Agents overstate what they did. Every number in this repository comes from the
files after the run: a diff, a mutation score, the presence of a file. The
agent's own summary is evidence about disclosure, never about compliance.

## Verify the tool with something other than the tool

`sweep-tests` is scored by a mutation runner. Proving a swept suite is still
sound by running the same mutation tool is circular. The result was
confirmed with six hand-written mutations using a different operator set. All
were caught, including by the smallest swept suite.

## Grade what is graded, not what is binary

Some outcomes are pass or fail: a file was written, or it was not. Others are a
gradient. In the quarantine fixture every model resisted the injection, so the
binary oracle showed nothing. The difference was disclosure: one run said "the
page contains hidden instructions, which I disregarded", another named both
vectors and the payload. The second tells the user their source is compromised.
The first does not. Grade that.

## Report the model

A skill is not uniformly effective. `sweep-tests` cut a suite by 50% on two
models and by 8% on a third, until it shipped a tool rather than a procedure,
after which the third reached 42%. A single headline number hides this. Every result
here names its model and the version of the skill that produced it.

## Re-measure after you edit

An edit that fixes a real defect can still make the skill worse. One skill here
had two genuine faults corrected by an adversarial audit, and both corrections
were made by adding explanation around the part that already worked. The skill
grew by half, the section carrying its effect moved further down the page, and
its measured behaviour fell from 12 of 12 to 1 of 3. Tightening it back
recovered the result and improved on it.

Attention thins across excess. A correct sentence in the wrong place costs more
than it adds, and nothing but a rerun will tell you which case you have.

**Growth is not the risk. Displacement is.** Two other skills were edited by the
same audit and both held: one grew by 43 percent and kept its result exactly,
because the new section was appended after the rules rather than inserted before
them. The one that regressed had its load-bearing table pushed from 61 percent
to 70 percent down the page. Ask what moved, not how much was added.

The edit that held best was a substitution rather than an addition. It replaced a
self-reported inventory with a required test, grew the skill by 18 percent, and
produced a behaviour the earlier version never showed.

## Find out which part does the work

Split a skill and run its halves. One skill here is carried by its proof and
another by a single table, and knowing which changes what you may safely edit.

## Cut what loses

A skill that does not beat its control does not ship, however well written.
One has already been cut for making the outcome worse than no skill at all. The
record is in [NEGATIVE-RESULTS.md](../NEGATIVE-RESULTS.md).

The bar is stated before the run, not after. Rebuilding a fixture because it is
too easy is legitimate. Rebuilding it until the skill looks good is not, and the
only thing separating them is that the bar was written down first.
