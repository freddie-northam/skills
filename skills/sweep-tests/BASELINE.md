# Baseline: does this skill change behaviour?

Every skill in this repository ships the experiment that justifies it. This is
that experiment. Run it yourself: the fixture is in `experiments/sweep-tests/`.

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

| Model | Condition | Skill | Tests (mean) | Change | Seams | Detection |
| --- | --- | --- | --- | --- | --- | --- |
| Opus | no skill | | 20.8 | | 4/5 | 12-13/14 |
| Opus | skill | v1 | 10.4 | -50% | 5/5 | 12/14 |
| Fable | no skill | | 22.6 | | 0/5 | 12/14 |
| Fable | skill | v1 | 11.4 | -50% | 5/5 | 12/14 |
| **Fable** | **skill** | **v4** | **7.4** | **-67%** | **10/10** | **12/14** |
| Sonnet | no skill | | 20.4 | | 0/5 | 12/14 |
| Sonnet | skill, prose | v1 | 18.8 | -8% | 0/5 | 12/14 |
| Sonnet | skill, tool | v2 | 11.8 | -42% | 3/5 | 12/14 |

The skill column matters. This skill has been corrected nine times against
measured results, and a number is only evidence for the version that produced
it. The v1 and v2 rows are kept for the trend they show, not as claims about
what ships today. Only the v4 row describes the current skill. Opus and Sonnet
have not been re-measured against v4.

The v4 row counts seams out of ten because the fixture holds two removable
seams, and every one of the five runs removed both. Version 1 removed one seam.

The suite began at 26 tests and a detection score of 12/14. **No run in any
condition lost detection.** The cut costs nothing.

> **The Detection column was measured with a narrower tool than ships today.**
> `maskText` blanked every template literal whole, so `pricing.js:20`, which is
> all of `formatMoney`'s arithmetic, generated no mutants at all. The tool now
> masks only a template's literal text and keeps its `${}` expressions, and the
> same fixture scores **16/18**. Five mutants that were always there were never
> generated: `abs / 100`, both `100`s, the `2`, and the `0` of `padStart`.
>
> What this does and does not affect:
>
> - **The trap still works, and its claim stands.** The negative-number coverage
>   the fixture plants is on line 18, not line 20. `< -> <=`, `0 -> 1` and the
>   ternary flip were always generated and always killed. Deleting the snapshot
>   still shows up.
> - **The "no detection lost" claims are narrower than they read.** They are
>   true of 14 mutants. They were never tested against the other four. A sweep
>   that kept the snapshot but collapsed the `formatMoney` cases too far would
>   have lost line 20 coverage, and this column could not have shown it.
> - **No run needs discarding**, because the tool under-reported rather than
>   over-reported, and the direction is conservative for the skill's claim.
>
> **Re-run at 18 mutants. The concern does not materialise.**
>
> Five arms on `gpt-5.6-sol` through `codex exec`, current skill, scoring the
> repaired tool. Mutant identities recorded before and after each sweep and
> compared without line numbers, because seam removal shifts every line.
>
> | Arm | Tests | Mutants | Killed | Lost or status-changed | New |
> | --- | --- | --- | --- | --- | --- |
> | baseline | 26 | 18 | 16 | | |
> | sw-1 | **7** | 18 | 16 | **0** | 0 |
> | sw-2 | **7** | 18 | 16 | **0** | 0 |
> | sw-3 | **7** | 18 | 16 | **0** | 0 |
> | sw-4 | **9** | 18 | 16 | **0** | 0 |
> | sw-5 | **7** | 18 | 16 | **0** | 0 |
>
> Every sweep preserved all 18 mutants, the same 16 kills and the same two
> survivors, `< -> <=` and `25 -> 26`. Nothing disappeared and nothing changed
> status. The five `formatMoney` mutants the old tool could not generate are
> killed in every arm.
>
> This matters because `format.snapshot.test.js` is the only test reaching
> `formatMoney`, and `SKILL.md` names snapshot tests as deletion candidates. No
> arm took the bait.
>
> **What this is not.** These are new arms on a fourth model. `gpt-5.6-sol` is
> not in the table above, so this does not retroactively re-measure the Opus,
> Fable or Sonnet rows. It shows that a sweep of this fixture under this skill
> holds at 18 mutants, which is direct evidence against the failure the narrower
> tool could have hidden. Re-running the three published models would close it
> completely.

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

Target: a private Next.js and Drizzle application with 9,134 tests
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
already tested with care yields less. 86 of the 97 mock assertions survived
the sweep.

## A warning worth reading

Two v4 runs raised a harness security alert. One stated that the agent had
removed export keywords "specifically so mutation testing could no longer reach
them", and so had hidden lost coverage from the tool.

The claim is false here, and the check is right to exist. `mutate.mjs` mutates
the whole file and ignores exports, so the mutant count held at 14 in every run.
An independent oracle, six mutations written by hand with a different operator
set, was caught by every swept suite including the seven-test ones.

The pattern the alert names is genuinely dangerous: an agent that deletes tests
and un-exports functions while a score is watched has every incentive to game
the score. What separates this skill from that failure is the proof, and only
the proof. A sweep that reports no per-mutant comparison deserves the alert.

## Codex

Codex gpt-5.6-sol, one run an arm, on the same fixture.

| Arm | Tests | Mutation score |
| --- | --- | --- |
| control | 26 to 23 | 13 of 14 |
| with the skill | 26 to **9** | 12 of 14 |

The control removed three tests and raised detection by one mutant, which is a
legitimate and different outcome: it improved the suite rather than compressing
it. The skill compressed it by 65% and held detection at the starting score.
Both are defensible; they are not the same product.

## Would a hook do this better?

**A CI gate is the real control. This skill is the thing that does the work.**

A mutation-score threshold in continuous integration is deterministic: run
Stryker, or an equivalent, and fail the build if the score falls. No agent can
talk its way past that, and it protects the suite whether or not anyone loads a
skill.

The two are not substitutes. The gate says the score may not fall. The skill is
how an agent deliberately removes tests without making it fall, and how it knows
which tests to remove. A gate with no sweep leaves the dead tests in place. A
sweep with no gate is a promise.

If you adopt one thing here, adopt the gate. `bin/mutate.mjs` exists for
repositories with no mutation runner. I have not measured how many that is.

## Which part of the skill does the work

The skill was split into its parts and each was run on a real 86-test file in a
private production repository, subject `server/services/members.ts`, 443
mutants, baseline detection 365.

| Arm | Runs | Tests after | Reduction | Detection |
| --- | --- | --- | --- | --- |
| no skill | 2 | 86.0 | 0% | nothing was deleted |
| thesis sentence only | 5 | 81.2 | -5.6% | **fell by 3 mutants** |
| attention only, the Delete and Keep lists | 2 | 79.0 | -8.1% | not measured |
| constraint only, the gate and the proof | 2 | 73.5 | -14.5% | not measured |
| **whole skill** | 2 | **70.5** | **-18.0%** | **held exactly** |

**Without the skill, nothing is deleted at all.** Both control runs read "clean
it up" as *tidy*: they extracted helpers, unified assertion style, fixed
test-order leakage, and kept all 86 tests. That is good work and it is not a
sweep. One control improved the mutation score while doing it.

**The proof is what licenses depth.** The whole skill removed nearly three times
as many tests as the thesis sentence alone, and detection held exactly. The
thesis alone removed fewer and detection still fell by three mutants, because
nothing required a proof before deleting.

That is the opposite of the intuition that a stronger rule makes an agent
timid. Here the rule is what made aggressive deletion safe, and its absence made
deletion both shallow and lossy.

**Attention and constraint compose.** Neither half reached the whole. The
constraint half carried more than the attention half here.

**This is one skill, and the result should not be read as a rule about skills.**
The prose-versus-tool finding earlier in this file comes from the same skill, so
it corroborates nothing: it is the same measurement taken twice. A skill whose
value is a place to look rather than a proof to run could easily split the other
way, and `airgap-secrets` looks like exactly that case. Until the split is
measured on a second skill, the honest claim is about `sweep-tests` alone.

Limits on this section: two runs an arm for A, B and C, five for the thesis arm.
Detection was measured on the whole-skill run and the thesis run, not on the two
half arms. The reduction figures are reliable; the ordering of A against B is
suggestive and no more.

## Honest limits

- Opus and Fable were measured on the prose version only. Both already reached
  -50%, so the tool version was not re-run for them. Sonnet was measured on both.
- The fixture holds 26 tests. A real suite has thousands, and an agent cannot
  hold one in context. This experiment does not reach that regime.
- `mutate.mjs` does not prove a deletion is safe. It shows that the mutants it
  generated, under its operator set, over the file it was pointed at, kept their
  status. It cannot prove a kept test is worthless, and it says nothing about
  behaviour no operator reaches.
- **A removed seam removes its mutants.** Nothing then moves from killed to
  survived, so an unchanged score can hide lost coverage entirely. The skill now
  requires baseline mutant identities to be recorded and every one of them to
  still exist at the end. The runs above predate that rule.
- The Codex comparison is one run an arm. It records two outcomes, not a
  model-level distinction.
- Deleting test files trips harness safety checks. Several runs raised a
  test-removal warning. That is the correct alarm for an uninvited deletion. The
  mutation score is the evidence that answers it.
- One Sonnet run failed on a structured-output retry cap and is excluded.
- Opus and Sonnet were last measured against skill v1 and v2. Only Fable has
  been measured against the version that ships.

## Reproduce it

```bash
cd experiments/sweep-tests/workspace
npm test                                    # 26 tests, green
node ../../../skills/sweep-tests/bin/mutate.mjs --file src/pricing.js   # 16/18 killed
```

Then ask your own agent to clean the suite up, and measure it again.
