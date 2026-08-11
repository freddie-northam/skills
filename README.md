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

Or copy any `skills/<name>/` directory into the place your harness reads:

| Harness | Path |
| --- | --- |
| Claude Code | `~/.claude/skills/` |
| Codex, Copilot CLI, Gemini CLI | `~/.agents/skills/` |
| Cursor, Windsurf | paste `SKILL.md` into a rules file |
| Anything else | paste `SKILL.md` into the instruction file it loads |

Nothing here is harness-specific. A skill is a Markdown file with frontmatter, it
names no vendor tool, and the one bundled script takes your own test command.

**The tools work outside JavaScript.** `bin/mutate.mjs` accepts any test command
and its operators are language-agnostic. It has been run against a Rust project
with `--test "cargo test --lib"`, and against TypeScript with vitest. Two of its
fifteen operators are JavaScript-specific and simply do not fire elsewhere.

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
| [fail-loud](./skills/fail-loud/) | Turning a failure into success-shaped output | [Measured](./skills/fail-loud/BASELINE.md), 14 runs, **3 model families**. Control fabricated rate data in 5 of 7 runs, 0 of 7 with the skill |

Every skill in `skills/` has been measured against a control. Anything that did
not beat its control was cut, not softened.

## The layer question

A skill is a mitigation, not a fix. It helps only while it is loaded, it
competes with everything else in context, and it can be reasoned around. Two
control runs here recognised an injected instruction as agent-targeted and
followed it anyway, having judged it harmless.

So each baseline now answers a question the rest of this genre does not ask:
**would a hook do this better?** For most of these skills the answer is yes.

| Skill | Deterministic alternative | Right layer? |
| --- | --- | --- |
| `secret-airgap` | a `gitleaks` pre-commit hook, `.dockerignore`, push protection | No, except for the transcript, which no hook reaches |
| `test-value-sweep` | a mutation-score threshold in CI | The gate is the control; the skill does the work |
| `fail-loud` | lint rules for empty catches, literal returns, mocks outside tests | Partly. Rules catch the shape, not fabricated data |
| **`quarantine`** | **none exists** | **Yes** |

Install the hooks first. They handle their boundaries better than any
instruction can. Load a skill where no deterministic check can reach.

This is the uncomfortable finding of the project, and it holds up across three
separate experiments: a `SPEC.md` already in a repository beat a skill written
to enforce the same rule, and a `CLAUDE.md` already in a repository beat four
skills written to carry the same facts. **The repository beats the prompt.**

## What did not work

Three skills have been cut. One made the outcome **worse** than no skill at
all. One was matched exactly by the control in twelve runs. One had its headline
claim disproven across two fixtures and 24 runs, in which no agent ever went out
of scope, on any model, under pressure, with the bait in front of it. See
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
