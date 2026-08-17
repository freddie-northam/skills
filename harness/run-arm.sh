#!/usr/bin/env bash
# Run one arm of an experiment: copy a workspace, hand it to an agent with or
# without a skill, keep the transcript. Scoring is a separate step.
#
# usage: run-arm.sh <workspace> <task-file> <skill|none> <run-name> [agent-cmd]
#
# The agent command must read a prompt on stdin and be able to edit files in
# the directory it is pointed at. The default is Codex; anything else that
# honours those two properties works.
#
# Three files land in runs/ for each arm:
#   <name>.transcript  everything the agent command wrote
#   <name>.agent       the transcript with the echoed prompt removed. Score this
#   <name>.status      the agent's exit code. Any value but 0 voids the arm
set -uo pipefail

WS=${1:?workspace directory required}
TASKFILE=${2:?task file required}
SKILL=${3:?skill file or the word none}
NAME=${4:?run name required}
AGENT=${5:-codex}

BASE=$(cd "$(dirname "$0")" && pwd)

# A run name names a run inside runs/. It is not a path. Without this check a
# name of `..` makes RUN the harness directory itself, and the rm below deletes
# the harness, this script included.
case "$NAME" in
  */*|*\\*|.|..|'') echo "ERROR: run name must not contain a path separator: $NAME" >&2; exit 2 ;;
esac

RUN="$BASE/runs/$NAME"

[ -d "$WS" ] || { echo "ERROR: no workspace at $WS" >&2; exit 2; }
[ -f "$TASKFILE" ] || { echo "ERROR: no task file at $TASKFILE" >&2; exit 2; }
[ "$SKILL" = "none" ] || [ -f "$SKILL" ] || { echo "ERROR: no skill at $SKILL" >&2; exit 2; }

rm -rf "$RUN"; mkdir -p "$RUN"
cp -R "$WS"/. "$RUN"/

PROMPT=$(cat "$TASKFILE")
if [ "$SKILL" != "none" ]; then
  # A skill may name a tool it expects to invoke. Put that tool in the run and
  # tell the agent where it is.
  #
  # Without this the experiment is not controlled. sweep-tests tells the agent to
  # run <skill-dir>/bin/mutate.mjs, and nothing supplied it. Codex found the file
  # anyway by walking up the repository tree; Claude, started with cwd at the run
  # directory, did not, and correctly refused to delete a test it could not prove
  # redundant. That difference was the runner's filesystem reach, not the model's
  # behaviour, and it was being read as the latter.
  SKILLBIN="$(cd "$(dirname "$SKILL")" && pwd)/bin"
  if [ -d "$SKILLBIN" ]; then
    mkdir -p "$RUN/.skill-bin"
    cp -R "$SKILLBIN"/. "$RUN/.skill-bin"/
    TOOLNOTE="

The skill's tools are in \`.skill-bin/\` in your working directory. Where the
skill writes \`<skill-dir>/bin/\`, read \`.skill-bin/\`."
  else
    TOOLNOTE=""
  fi
  PROMPT="You have the following skill loaded. Follow it.

<skill>
$(cat "$SKILL")
</skill>$TOOLNOTE

---

$PROMPT"
fi

TRANSCRIPT="$BASE/runs/$NAME.transcript"
AGENTOUT="$BASE/runs/$NAME.agent"
STATUS="$BASE/runs/$NAME.status"

case "$AGENT" in
  codex)
    printf '%s' "$PROMPT" | timeout 600 codex exec \
      -s workspace-write -C "$RUN" --skip-git-repo-check --ephemeral --color never - \
      > "$TRANSCRIPT" 2>&1
    ;;
  *)
    # Any other agent. It is given the prompt on stdin and the run directory as cwd.
    ( cd "$RUN" && printf '%s' "$PROMPT" | timeout 600 $AGENT ) \
      > "$TRANSCRIPT" 2>&1
    ;;
esac
CODE=$?
printf '%s\n' "$CODE" > "$STATUS"

# Agents echo the prompt they were given. Codex prints it under a `user` header,
# so an oracle that greps the transcript reads the skill's own words back and
# credits them to the agent. Every grep pattern that appears in a SKILL.md then
# scores the treatment arm and can never score the control, which inflates the
# exact delta a baseline publishes.
#
# So strip every line of the prompt from the transcript and let oracles score
# what is left. Removing a line the agent happened to write verbatim biases
# against the treatment arm, which is the safe direction to be wrong in.
printf '%s\n' "$PROMPT" > "$BASE/runs/$NAME.prompt"
# Match on the prompt's non-blank lines only. A blank line in the prompt would
# otherwise delete every blank line in the transcript, which changes the line
# count without removing any prompt text.
grep -v '^[[:space:]]*$' "$BASE/runs/$NAME.prompt" > "$BASE/runs/$NAME.prompt.keys"
grep -vxF -f "$BASE/runs/$NAME.prompt.keys" "$TRANSCRIPT" > "$AGENTOUT" || true
rm -f "$BASE/runs/$NAME.prompt.keys"

if [ "$CODE" -ne 0 ]; then
  echo "ERROR: $NAME did not complete, agent exited $CODE. This arm is void." >&2
  echo "       transcript at runs/$NAME.transcript" >&2
  exit 1
fi

echo "$NAME finished, score runs/$NAME.agent (exit 0)"
