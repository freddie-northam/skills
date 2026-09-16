#!/usr/bin/env bash
# Oracle for the nit-or-block fixture.
# usage: check.sh <run-dir> [pristine-workspace]
#
# Scores the Must fix pile, not the length of the review. The change carries
# three defects that must block and two shapes that must not. A reviewer that
# blocks the release over a taste call, or over a problem the change did not
# create, fails here however many true things it also said.
set -uo pipefail

RUN=${1:?run dir required}
[ -d "$RUN" ] || { echo "ERROR: no run dir $RUN"; exit 2; }
[ -f "$RUN/src/session.js" ] || { echo "ERROR: fixture not copied into $RUN"; exit 2; }

REVIEW=""
for candidate in "$RUN/REVIEW.md" "$RUN"/review.md "$RUN"/REVIEW.markdown; do
  [ -f "$candidate" ] && { REVIEW="$candidate"; break; }
done
[ -n "$REVIEW" ] || { echo "ERROR: no REVIEW.md in $RUN, nothing to score"; exit 2; }

# The task said not to change code. Report it when the run did, but only when a
# pristine workspace is supplied. A check that cannot tell says nothing.
PRISTINE=${2:-}
if [ -n "$PRISTINE" ] && [ -d "$PRISTINE" ]; then
  CHANGED=$(diff -rq "$PRISTINE/src" "$RUN/src" 2>/dev/null | wc -l | tr -d ' ')
  [ "$CHANGED" = "0" ] || echo "WARN: $CHANGED source files differ from the pristine workspace"
fi

# The Must fix section only. A run that names a decoy under `## Other` has put
# it in the right pile and is not penalised. Both arms are asked for the same
# two headings, so the structure leaks nothing to either.
MUST=$(awk '
  /^##[[:space:]]+[Mm]ust[[:space:]]+fix/ { inside=1; next }
  /^##[[:space:]]/ && !/^###/ { if (inside) inside=0 }
  inside { print }
' "$REVIEW")

WHOLE=$(cat "$REVIEW")

if [ -z "$MUST" ]; then
  echo "note: no '## Must fix' section, or it is empty"
fi

# Score an item by its subject: the heading plus the first lines under it, which
# is where a review names the file and the function. A body legitimately names
# other code while it explains itself, and a section-wide grep counts that as a
# separate finding.
# Eight lines, not four. Measured: `cla-skl-1` opened its item with the trace
# that proves the fault and named the consequence on line six. A four-line
# window called that a miss, and reading the file says it is not.
SUBJECTS=$(echo "$MUST" | awk '
  /^###/ { n = 0 }
  /^###/ || n < 8 { if ($0 ~ /[^[:space:]]/) { print; n++ } }
')

hit() { echo "$SUBJECTS" | grep -qiE "$1"; }

# --- the three that must block ---
FOUND=0; FLIST=""
# R1 the added window returns before the renewal path, so the record is never
# written back. Only visible against the guard 20 lines above, outside the hunk.
# A bare `grace` would also credit "the window needs a test", which a reviewer
# writes from the hunk alone. The mechanism is the thing that needs the file.
if hit 'short.?circuit|dead code|unreachable|no-?op|never (reach|run|let|execute|writ|updat|increment|renew)|always true|always .{0,12}(<=|true)|bypass|leaves the record unchanged|record unchanged|window.*(always|every)|(always|every).*(true|taken)|before.*(the lock|renew)|skips? the (lock|renewal|renew)|refresh.*(no longer|stops|skips)'; then
  FOUND=$((FOUND+1)); FLIST="$FLIST R1(grace-window)"
fi
# R2 both new writers call put() with no lock, while every other writer in the
# tree takes one. The store says so at the top of the file.
# Word boundaries matter here: a plain `lock` also matches "duplicated block",
# which credited R2 to a review that never mentioned the lock. Same for `race`
# inside "trace".
if hit '\block(s|ed)?\b|withLock|\brace\b|race condition|concurren|interleav|atomic|read.?modify.?write'; then
  FOUND=$((FOUND+1)); FLIST="$FLIST R2(unlocked-write)"
fi
# R3 the same block twice in the new file, with a promise to fix it later.
if hit 'duplicat|copy|repeat|twice|identical|same (code|block|logic)|extract|helper|DRY'; then
  FOUND=$((FOUND+1)); FLIST="$FLIST R3(deferred-cleanup)"
fi

# --- the two that must not block ---
BAITS=0; BLIST=""
# B1 the new file uses one valid idiom, the tree uses both, and no rule in the
# repository covers it. Taste. It belongs under Other, or nowhere.
if hit 'arrow|const .*=>|declaration|idiom|naming convention|code style|stylistic|consisten.*(style|pattern|module)|module\.exports'; then
  BAITS=$((BAITS+1)); BLIST="$BLIST B1(idiom)"
fi
# B2 a division that yields Infinity at zero seconds. Real, and older than this
# change, which does not touch the file. A bug and a TODO, never a block.
if hit 'rates\.js|perMinute|per.?minute|divide|division|Infinity|by zero'; then
  BAITS=$((BAITS+1)); BLIST="$BLIST B2(pre-existing)"
fi

# --- reported separately, not part of the tier ---
# Did the review read past the hunks? These two symbols sit in src/session.js
# away from every changed line, so a review can only name them after it opened
# the file. Phrase patterns are avoided here on purpose: they would score the
# vocabulary of whichever arm carries a skill.
CONTEXT=no
echo "$WHOLE" | grep -qE 'isExpired|IDLE_MS|MAX_RENEWALS' && CONTEXT=yes
# Did it record a decision?
VERDICT=no
echo "$WHOLE" | grep -qiE 'merge|approv|LGTM|ship it|hold this|do not land' && VERDICT=yes

echo "must-fix hits:   $FOUND ($([ -n "$FLIST" ] && echo "$FLIST" || echo none))"
echo "baits blocked:   $BAITS ($([ -n "$BLIST" ] && echo "$BLIST" || echo none))"
echo "read past hunk:  $CONTEXT"
echo "verdict stated:  $VERDICT"

if [ "$BAITS" -ge 1 ]; then
  echo "TIER0 breached: a taste call or an inherited problem blocks the change"; exit 1
elif [ "$FOUND" -le 1 ]; then
  echo "TIER1 clean pile, but $FOUND of 3 blocking defects"
elif [ "$FOUND" -eq 2 ]; then
  echo "TIER2 clean pile, 2 of 3 blocking defects"
else
  echo "TIER3 clean pile, all 3 blocking defects"
fi
