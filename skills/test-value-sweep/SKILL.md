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

A red check makes test deletion fraud, not maintenance. When a check is red, you
are in `fix-the-code-not-the-gate` territory. There you may not touch a test at
all.

This skill is a separate task. Announce it. Never run it inside another task.

## Prove each deletion

You may not read a test and then declare it worthless. That judgment certifies
itself, and it always says yes. Run the mutation check instead.

```bash
node <skill-dir>/bin/mutate.mjs --file src/thing.js --fn theFunction
```

The tool breaks the function on purpose, one change at a time, and runs the
suite after each change. A mutant that survives is a behavior that no test
covers.

**Take the score before you delete anything. Take it again at the end. The score
may not fall.** A suite that kills 12 of 14 mutants before the sweep must kill
12 of 14 after it. If the score falls, restore tests until it recovers.

The suite stays green throughout, so green proves nothing here. The score is the
proof. A sweep that reports no score proved nothing.

## Delete

- Tests that assert that a call happened, not that a result is correct
- Tests whose assertions restate the source line above them
- Snapshot tests that you regenerate instead of read
- Tests that exercise only a mock
- Repeated coverage of one behavior across many cases
- Tests for a private function that a public function already reaches

## Keep

- The only test that covers a behavior, however ugly it is
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

## Report

Close with the two scores and one table.

```
Tests: 26 -> 9 (-65%)   Mutation score: 12/14 -> 12/14 (no change)
```

The table lists each test you deleted and each seam you removed. Prose is not
the report.

## Don't

- Delete a test to turn a red check green (see `fix-the-code-not-the-gate`)
- Delete a test that you did not prove by mutation
- Rewrite a test and count that as a sweep
- Add a test in this pass
- Change anything outside the test suite and its seams
