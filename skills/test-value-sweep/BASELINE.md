# Baseline: does this skill change behaviour?

Every skill in this repository ships the experiment that justifies it. This is
that experiment. Run it yourself: the fixture is in `fixture/`.

## Method

A 26-test JavaScript suite, green, with graded material planted in it.

| Planted | Count | Correct outcome |
| --- | --- | --- |
| Behaviour tests for `applyDiscount` | 5 | keep |
| Expiry tests, the only coverage of expiry | 3 | keep, and keep the clock seam |
| Mock-call assertions on `audit` | 4 | delete |
| Direct tests of an internal that a public function reaches | 5 | delete, then un-export it |
| Near-duplicate `formatMoney` cases | 8 | collapse |
| A snapshot holding the only negative-number case | 1 | the trap |

The trap decides the experiment. Deleting the snapshot looks obviously correct,
because nobody reads snapshots. It silently drops the only coverage of negative
formatting.

Every agent received the same task, in the phrasing a person actually types:

> The test suite in this JavaScript repo has grown messy over time. Clean it up.

Each run had a private copy of the fixture. Results come from the files on disk,
not from what the agents reported. Five runs per condition.

## Results

35 runs. `mutate.mjs` produced every detection score.

| Model | Condition | Tests (mean) | Change | Seams removed | Detection |
| --- | --- | --- | --- | --- | --- |
| Opus | no skill | 20.8 | | 4/5 | 12-13/14 |
| Opus | skill | 10.4 | **-50%** | 5/5 | 12/14 |
| Fable | no skill | 22.6 | | 0/5 | 12/14 |
| Fable | skill | 11.4 | **-50%** | 5/5 | 12/14 |
| Sonnet | no skill | 20.4 | | 0/5 | 12/14 |
| Sonnet | skill, prose form | 18.8 | -8% | 0/5 | 12/14 |
| Sonnet | skill, tool form | 11.8 | **-42%** | 3/5 | 12/14 |

The suite began at 26 tests and a detection score of 12/14. **No run in any
condition lost detection.** The cut costs nothing.

## The finding that matters most

The first version of this skill described the mutation check in prose and asked
the agent to perform it by hand. That version moved Sonnet by 8%.

The second version ships `bin/mutate.mjs` and requires the score in the report.
The same rules, the same model, and the same fixture then moved Sonnet by 42%.

**A tool that emits a number beats a procedure that asks for care.** Sonnet did
not refuse the prose version. It substituted: it consolidated files, added
`describe` blocks, and renamed a fixture, then called that the cleanup. One
control run kept the mock-call tests because they assert "different observable
surfaces, not duplicated coverage". A required score leaves no room for that
substitution, because 26 tests to 25 tests is visibly not a sweep.

## On a real repository

The fixture is 26 tests. This is the same skill on production code.

Target: `takerecord-ai`, a Next.js and Drizzle application with 9,134 tests
across 952 files, and 1,970 mock-call assertions. One file swept:
`comments-service.test.ts`, 83 cases and 97 mock-call assertions, against a
909-line source. Scored with the repository's own Stryker, not with the tool
that ships here.

| | Before | After |
| --- | --- | --- |
| Tests | 83 | 72 (-13%) |
| Lines of test code | | -205 |
| Mutation score | 514/841 (61.1%) | 514/841 (61.1%) |
| Seams removed | | none |

The status breakdown was identical either side: 514 killed, 185 survived, 142
without coverage.

**The gate caught a bad deletion.** The first batch removed 12 tests and the
score fell to 513. One test judged an obvious duplicate was the only killer of a
`return false` to `return true` mutant. It was restored and the score recovered.
Reading alone had produced a confident and wrong answer, which is the exact
failure the mutation proof exists to catch.

**No seam came out, and that is the correct result.** Every export of the source
had a caller outside the test file. The skill removes seams that only tests use.
It found none, and it changed no production code.

The cut is 13 percent here, against 50 percent on the fixture. Real code that is
already tested with care yields less. Most of the 97 mock assertions were
legitimate.

## Honest limits

- Opus and Fable were measured on the prose version only. Both already reached
  -50%, so the tool version was not re-run for them. Sonnet was measured on both.
- The fixture holds 26 tests. A real suite has thousands, and an agent cannot
  hold one in context. This experiment does not reach that regime.
- `mutate.mjs` proves a deletion is safe. It cannot prove a kept test is
  worthless, because it generates no mutant for code that no operator matches.
  An agent found this limit during a run and correctly kept the tests it could
  not disprove.
- Deleting test files trips harness safety checks. Several runs raised a
  test-removal warning. That is the correct alarm for an uninvited deletion. The
  mutation score is the evidence that answers it.
- One Sonnet run failed on a structured-output retry cap and is excluded.

## Reproduce it

```bash
cd fixture
npm test                                    # 26 tests, green
node ../bin/mutate.mjs --file src/pricing.js   # 12/14 killed
```

Then ask your own agent to clean the suite up, and measure it again.
