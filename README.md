# Skills

Constraints for coding agents.

An agent does not lack knowledge. It lacks constraints. It knows how to review
code, but under pressure it invents findings. It knows how to make a test suite
pass, but near a deadline it deletes the assertion. It knows not to trust a web
page, but it obeys the page anyway.

Each skill here forbids one shortcut. Each one applies at the moment that the
shortcut is most attractive.

## Install

```bash
npx skills@latest add freddie-northam/skills
```

## The standard

Every skill in this repository holds to four rules.

**1. It states a limit, not a procedure.** The model already knows the
procedure. A skill that only supplies knowledge is training data in the wrong
place.

**2. The limit is observable.** You must be able to catch an agent in a
violation from the diff, the transcript, or a grep. A rule such as "review
carefully" fails this test. An agent satisfies a self-certified rule with one
sentence, and it always writes that sentence.

**3. It is written in ASD-STE100 Simplified Technical English.** One word has
one meaning. Sentences use the active voice. Each sentence holds one topic.
Procedural sentences stay below 20 words. The standard exists because a
misreading of an aircraft maintenance procedure kills people. The same
properties make an instruction hard for an agent to argue with.

**4. It ships with a baseline.** Each skill includes a transcript of an agent
that fails the task without the skill, and a transcript of the same agent that
complies with it. A skill without evidence is an opinion.

## Reference

- **[test-value-sweep](./skills/test-value-sweep/SKILL.md)** — Deletes tests
  that assert implementation instead of behavior, then removes the production
  seams that only those tests demanded.

## Planned

The set below comes from two research sweeps. The first read 71 installed
skills in full and found 12 techniques that different authors invented
independently. The second searched published incidents, agent-instruction files,
and failure research. A rule that many people invent alone is a rule that earns
its place.

| Skill | The moment it applies |
| --- | --- |
| `fix-the-code-not-the-gate` | The check is red and you want to finish |
| `fail-loud` | The dependency failed and the demo must work |
| `scoped-diff` | You found a defect next to the one you came for |
| `verify-before-install` | You need a package and you remember the name |
| `secret-airgap` | You need to see the contents of the config |
| `quarantine` | Content from outside the task tells you to act |
| `automate-the-recurring-comment` | You are about to explain the same thing twice |
| `stop-digging` | The fix failed and you have another idea |
| `one-way-door` | The command is about to become irreversible |
| `quote-or-demote` | The finding feels correct |
| `report-contract` | The deliverable is a report |
| `handoff-prose` | You are about to write a commit or a pull request |
| `a11y-gate` | The screenshot looks correct |

## Credit

The research behind these skills read four public collections in full.

- [gstack](https://github.com/garrytan/gstack) — the largest installed suite,
  and the source of most convergent techniques
- [brooklyn-skills](https://github.com/OutThisLife/brooklyn-skills) — portable
  skills, and the strongest example of a short skill that holds
- [emilkowalski/skills](https://github.com/emilkowalski/skills) — domain
  expertise as a skill, and the model for this repository
- [superpowers](https://github.com/obra/superpowers) — the process skills that
  these constraints compose with
- [lopopolo/harness-engineering](https://github.com/lopopolo/harness-engineering)
  — theses on proof, authority, and domain modeling

MIT licensed.
