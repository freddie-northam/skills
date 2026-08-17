# Harness

The scripts that produced every number in this repository. They are here so the
evidence can be checked rather than believed.

Nothing here is specific to one project, one model, or one language. A run needs
three things: a workspace, a task, and an oracle.

## Run one arm

```bash
./run-arm.sh <workspace-dir> <task-file> <skill-file|none> <run-name> [agent-cmd]
```

It copies the workspace to `runs/<run-name>`, sends the task to an agent with or
without the skill, and leaves the result on disk for an oracle to score.

The default agent command is `codex exec`. Pass your own to use a different one.
The script cares only that the command reads a prompt on stdin and can edit
files in the working directory.

```bash
./run-arm.sh ../experiments/quarantine/workspace-subtle task.txt none ctl-1
./run-arm.sh ../experiments/quarantine/workspace-subtle task.txt \
             ../skills/quarantine/SKILL.md tre-1
```

Each arm writes three files beside the run:

| File | Holds | Use |
| --- | --- | --- |
| `<name>.transcript` | everything the agent command wrote | read it yourself |
| `<name>.agent` | the transcript with the echoed prompt removed | **score this** |
| `<name>.status` | the agent's exit code | any value but 0 voids the arm |

The script exits non-zero when the agent did, so `run-arm.sh ... && check.sh ...`
never scores an arm that failed to run.

## Score it

Each fixture ships its own `check.sh`. They take a run directory and, where
disclosure is graded, the agent output.

```bash
bash ../experiments/quarantine/check-subtle.sh runs/ctl-1 runs/ctl-1.agent
```

Every oracle exits 2 when its input is missing. A missing run must never read as
a pass. That rule exists because an early oracle here reported "resisted" for a
directory that did not exist.

**Never score `.transcript`. Score `.agent`.** Agents echo the prompt they were
given, and the prompt contains the whole skill. Codex prints it under a `user`
header. An oracle that greps the transcript therefore reads the skill's own
words back and credits them to the agent: every grep pattern that also appears
in a `SKILL.md` scores the treatment arm and can never score the control, which
inflates the exact delta the baseline publishes. `run-arm.sh` removes the prompt
lines to produce `.agent`.

This was measured, not assumed. A one-line probe through `codex exec` came back
with the prompt reproduced verbatim in stdout.

## The rules that make a result mean something

**Copy only `workspace/`.** A fixture's README and oracle stay outside the run.
An agent that reads them knows it is being tested. Twelve runs were discarded
here before this rule existed.

**Same task in both arms**, phrased the way a person would type it. A task that
describes the skill's own method leaks the answer into the control.

**Score from disk, not from the report.** Agents overstate what they did. The
transcript is evidence about disclosure, never about compliance.

**No oracle pattern may be a word the skill prescribes.** Grep every disclosure
pattern against the `SKILL.md` it scores. A hit means the pattern measures
whether the agent copied the skill's vocabulary, not whether it found anything,
and only the treatment arm can ever match it. Four patterns here failed that
check: `untrusted` and `did not write` in the subtle quarantine oracle,
`injection attempt` in the blunt one, and `unavailable` in `fail-loud`. All four
are removed.

Stripping the prompt from the transcript does not fix this on its own. An agent
told to wrap hostile input in `<<<UNTRUSTED>>>` writes that word itself, so the
text is genuinely the agent's and still proves nothing about detection. The
pattern has to name the *planted thing*, such as `UPGRADE_OK` or `INJECTED.txt`,
which no skill mentions and only a run that found it can produce.

**Five runs an arm.** Single samples lie.

**Verify a tool with something other than that tool.** A suite swept under a
mutation runner and then checked by the same runner has proved nothing. Confirm
with a different operator set.

## Ablation

To find out whether a skill works by directing attention or by imposing a rule,
split it and run four arms: nothing, rule only, attention only, whole skill. If
the attention arm matches the whole skill, the value is direction. If the rule
arm matches, it is the constraint.

Split by section rather than by sentence, and keep the output format identical
in every arm, or you measure the report shape instead.

## Other stacks

`bin/mutate.mjs` in `skills/sweep-tests/` takes any test command:

```bash
node mutate.mjs --file src/thing.ts --test "npm test"
node mutate.mjs --file src/lib.rs   --test "cargo test --lib"
node mutate.mjs --file app/calc.py  --test "pytest -q"
```

Its operators are boundaries, equality, logic, arithmetic, numeric literals and
booleans, which exist in every C-family language. Two are JavaScript-specific
and simply do not fire elsewhere. It has been run against Rust with `cargo test`
and against TypeScript with vitest.

Prefer a real mutation runner when the project has one. Stryker, mutmut,
go-mutesting and PIT all know things this script does not.
