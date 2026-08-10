# Skills

Constraints for coding agents, and the experiments that prove they work.

An agent does not lack knowledge. It lacks constraints. It knows how to review
code, and under pressure it invents findings. It knows how to make a suite pass,
and near a deadline it deletes the assertion. It knows not to trust a web page,
and it obeys the page anyway.

Each skill here forbids one shortcut, at the moment that shortcut is most
attractive. Each one ships the experiment that shows it beats an agent with no
skill loaded, or it does not ship.

## Install

```bash
npx skills@latest add freddie-northam/skills
```

Or copy any `skills/<name>/` directory into `~/.claude/skills/`.

## The standard

Every skill in this repository holds to four rules.

**1. It states a limit, not a procedure.** The model already knows the
procedure. A skill that only supplies knowledge is training data in the wrong
place.

**2. The limit is observable.** You must be able to catch an agent in a
violation from the diff, the transcript, or a grep. A rule such as "review
carefully" fails this test: an agent satisfies a self-certified rule with one
sentence, and it always writes that sentence.

**3. It is written in ASD-STE100 Simplified Technical English.** One word has one
meaning. Each sentence holds one topic and stays under 20 words. Instructions
use the imperative and name the actor. The standard exists because misreading an
aircraft maintenance procedure kills people, and the same properties make an
instruction hard to argue with.

Four of the STE rules are checked mechanically here: sentence length, `-ing`
verb forms, passive constructions, and undefined abbreviations. The full
approved dictionary is not enforced, because it is aerospace vocabulary and
holds no entry for `commit` or `repository`.

**4. It ships with a baseline.** A fixture, a measured result with the skill and
without it, and the limits of that measurement. A skill without evidence is an
opinion.

## Skills

| Skill | Forbids | Evidence |
| --- | --- | --- |
| [test-value-sweep](./skills/test-value-sweep/) | Deleting a test you cannot prove is redundant | [Measured](./skills/test-value-sweep/BASELINE.md), 41 runs, **4 model families**, plus two production files |
| [quarantine](./skills/quarantine/) | Acting on content the task did not write | [Measured](./skills/quarantine/BASELINE.md), 26 runs, 4 model families. Control breached 5 of 6 on the two susceptible models, 0 of 6 with the skill |
| [secret-airgap](./skills/secret-airgap/) | Letting a credential reach a transcript, diff, or build context | [Measured](./skills/secret-airgap/BASELINE.md), 26 runs, **3 model families**. Control leaked a credential in 3 of 11 valid runs. All 13 skill runs clean and flagged |
| [scoped-diff](./skills/scoped-diff/) | Letting a change touch files the task never named | [Measured](./skills/scoped-diff/BASELINE.md), 14 runs, 3 model families. Adjacent defects reported in 2 of 6 control runs, 6 of 6 with the skill on Claude. **No effect on Codex, and scope prevention itself is untested** |
| [fail-loud](./skills/fail-loud/) | Turning a failure into success-shaped output | [Measured](./skills/fail-loud/BASELINE.md), 14 runs, **3 model families**. Control fabricated rate data in 5 of 7 runs, 0 of 7 with the skill |

Every skill in `skills/` has been measured against a control. Anything that did
not beat its control was cut, not softened.

## What did not work

Two skills have been cut. One made the outcome **worse** than no skill at all,
stalling every run it touched. The other was matched exactly by the control in
twelve runs: every agent already checked the registry before installing. See
[negative results](./NEGATIVE-RESULTS.md).

That file is the point of the repository, not an apology. A library that
publishes only its wins is asserting, not measuring.

## Verify it yourself

Every skill with a fixture can be re-run against your own model.

```bash
cd skills/test-value-sweep/fixture/workspace
npm test                                          # 26 tests, green
node ../../bin/mutate.mjs --file src/pricing.js   # 12 of 14 mutants killed
```

Then ask your agent to clean the suite up, with and without the skill, and
measure again. Post your numbers.

The method, including how to build a fixture that actually tempts an agent, is
in [docs/METHOD.md](./docs/METHOD.md).

## Credit

The research behind these skills read six public collections in full: 363 files
and 320,000 words of prose.

- [superpowers](https://github.com/obra/superpowers) — process skills these
  constraints compose with
- [mattpocock/skills](https://github.com/mattpocock/skills) — the `It's working
  if` convention, and the clearest theory of writing for agents
- [emilkowalski/skills](https://github.com/emilkowalski/skills) — domain
  expertise as a skill, and the model for this repository
- [shadcn/improve](https://github.com/shadcn/improve) — the advisor and executor
  split
- [brooklyn-skills](https://github.com/OutThisLife/brooklyn-skills) — the
  strongest example of a short skill that holds
- [lopopolo/harness-engineering](https://github.com/lopopolo/harness-engineering)
  — theses on proof, authority, and domain modelling

MIT licensed.
