---
name: test-value-sweep
description: >-
  Use when asked to prune, audit, or improve a test suite; when tests break on
  refactors that change no behavior; when a test file changes in the same commit
  as its source again and again; when coverage is high but defects still ship;
  or when production code carries interfaces, mocks, dependency hooks, or
  exported symbols that only tests use.
---

# Test value sweep

A test must justify its presence. A test that changes when the implementation
changes, while the behavior stays the same, asserts implementation. Delete it.

Then simplify the source. Seams in production code often exist only because
those tests demanded them. When the test goes, the seam goes with it.

## The gate

**Run this only when the suite is green.**

A red check makes test deletion fraud, not maintenance. When a check is red,
repair the source. You may not touch a test at all until the suite is green
again.

This skill is a separate task. Announce it. Never run it inside another task.

## Prove each deletion

You may not read a test and then declare it worthless. That judgment certifies
itself, and it always says yes. Run the mutation check instead.

**If the repository already has a mutation runner, use it.** Look for Stryker,
mutmut, go-mutesting, PIT, or a `test:mutation` script. Its configuration holds
knowledge this skill does not have, such as which files repay the run and which
generate thousands of worthless mutants.

**The mutation scope must cover the subject file of every test you delete in the
batch.** A test whose subject sits outside the scope is never proved, however
green the score looks. Widen the scope, or split the batch.

Only when the repository has none, use the tool that ships here:

```bash
node <skill-dir>/bin/mutate.mjs --file src/thing.js --fn theFunction
```

Either tool breaks the source on purpose, one change at a time, and runs the
suite after each change. A mutant that survives is a behavior that no test
covers.

**Take the report before you delete anything. Take it again at the end.**

Compare the status of every mutant, not the total. Two mutants can trade places
and leave the total unmoved while a real kill is gone. No mutant may move from
killed to survived. If one does, restore tests until it returns.

The suite stays green throughout, so green proves nothing here. The score is the
proof. A sweep that reports no score proved nothing.

Write the before-report and the after-report to different paths. A runner that
overwrites its own baseline leaves you unable to find the mutant you lost.

**The report names one killer for each mutant: the first test that reached it.**
That is run order, not ownership. A test credited with no kills can still be the
only real net under a mutant that another test happens to reach first. Use the
report to shortlist candidates. Never use it as proof. The rerun is the proof.

### Delete in batches

Time one scoped run before you plan the sweep. The cost ranges from seconds to
many minutes, so whether one run for each candidate is affordable depends on the
repository. When it is not, delete a batch and run once.

- The score holds. The whole batch stands.
- The score falls. One test in the batch was the only killer of a mutant.
  Restore the batch, halve it, and run again. Repeat until you find the test
  that matters, then keep it and delete the rest.

A batch proof is weaker than a proof for each test. It shows that no deletion
was the unique killer of a mutant. That is enough, and it is affordable.

## Delete

- Tests that assert that a call happened, when the call is not the contract
- Tests whose assertions restate the source line above them
- Snapshot tests that you regenerate instead of read
- Tests that exercise only a mock
- Repeated coverage of one behavior across many cases
- Tests for a private function that a public function already reaches

## Keep

- The only test that covers a behavior, however ugly it is
- Call assertions on a unit whose whole job is to drive other units. There the
  call and its arguments are the result, and the mutation score will show it
- Regression tests that name a defect or an issue
- Contract tests at a boundary that you do not own
- Property tests and fuzz tests

## Remove the seams

A deleted test may have been the only caller of a seam. Grep for each one.

- An interface with one implementation
- A constructor parameter that only a test supplies
- An exported symbol that only tests import
- A mock or fake, and the hook it plugs into
- A flag that only a test reads

Delete the seam, or inline it. Follow each simplification to its end. When you
remove a seam and a wrapper becomes a pass-through, remove the wrapper too.

**A seam can have one caller, and that caller can be a test in another file.
Leave that seam alone.** Report it as a candidate for a later sweep. A sweep that
reaches past its own scope breaks files that nobody asked you to touch.

## Report

Close with the two scores and one table.

```
Tests: 26 -> 9 (-65%)   Mutation score: 12/14 -> 12/14 (no change)
```

The table lists each test you deleted and each seam you removed. Prose is not
the report.

## Don't

- Delete a test to turn a red check green
- Delete a test that you did not prove by mutation
- Rewrite a test and count that as a sweep
- Add a test in this pass
- Change anything outside the test suite and its seams
