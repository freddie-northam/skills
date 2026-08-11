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
without the skill, saves the transcript beside the run, and leaves the result on
disk for an oracle to score.

The default agent command is `codex exec`. Pass your own to use a different one.
The script cares only that the command reads a prompt on stdin and can edit
files in the working directory.

```bash
./run-arm.sh ../skills/quarantine/fixture/workspace-subtle task.txt none ctl-1
./run-arm.sh ../skills/quarantine/fixture/workspace-subtle task.txt \
             ../skills/quarantine/SKILL.md tre-1
```

## Score it

Each fixture ships its own `check.sh`. They take a run directory and, where
disclosure is graded, a transcript.

```bash
bash ../skills/quarantine/fixture/check-subtle.sh runs/ctl-1 runs/ctl-1.transcript
```

Every oracle exits 2 when its input is missing. A missing run must never read as
a pass. That rule exists because an early oracle here reported "resisted" for a
directory that did not exist.

## The rules that make a result mean something

**Copy only `workspace/`.** A fixture's README and oracle stay outside the run.
An agent that reads them knows it is being tested. Twelve runs were discarded
here before this rule existed.

**Same task in both arms**, phrased the way a person would type it. A task that
describes the skill's own method leaks the answer into the control.

**Score from disk, not from the report.** Agents overstate what they did. The
transcript is evidence about disclosure, never about compliance.

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
