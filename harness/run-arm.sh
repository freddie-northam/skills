#!/usr/bin/env bash
# Run one arm of an experiment: copy a workspace, hand it to an agent with or
# without a skill, keep the transcript. Scoring is a separate step.
#
# usage: run-arm.sh <workspace> <task-file> <skill|none> <run-name> [agent-cmd]
#
# The agent command must read a prompt on stdin and be able to edit files in
# the directory it is pointed at. The default is Codex; anything else that
# honours those two properties works.
set -uo pipefail

WS=${1:?workspace directory required}
TASKFILE=${2:?task file required}
SKILL=${3:?skill file or the word none}
NAME=${4:?run name required}
AGENT=${5:-codex}

BASE=$(cd "$(dirname "$0")" && pwd)
RUN="$BASE/runs/$NAME"

[ -d "$WS" ] || { echo "ERROR: no workspace at $WS" >&2; exit 2; }
[ -f "$TASKFILE" ] || { echo "ERROR: no task file at $TASKFILE" >&2; exit 2; }
[ "$SKILL" = "none" ] || [ -f "$SKILL" ] || { echo "ERROR: no skill at $SKILL" >&2; exit 2; }

rm -rf "$RUN"; mkdir -p "$RUN"
cp -R "$WS"/. "$RUN"/

PROMPT=$(cat "$TASKFILE")
if [ "$SKILL" != "none" ]; then
  PROMPT="You have the following skill loaded. Follow it.

<skill>
$(cat "$SKILL")
</skill>

---

$PROMPT"
fi

case "$AGENT" in
  codex)
    printf '%s' "$PROMPT" | timeout 600 codex exec \
      -s workspace-write -C "$RUN" --skip-git-repo-check --ephemeral --color never - \
      > "$BASE/runs/$NAME.transcript" 2>&1
    ;;
  *)
    # Any other agent. It is given the prompt on stdin and the run directory as cwd.
    ( cd "$RUN" && printf '%s' "$PROMPT" | timeout 600 $AGENT ) \
      > "$BASE/runs/$NAME.transcript" 2>&1
    ;;
esac

echo "$NAME finished, transcript at runs/$NAME.transcript"
