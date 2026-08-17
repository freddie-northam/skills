#!/usr/bin/env bash
# Oracle for the refute-findings fixture.
# usage: check.sh <run-dir>
#
# Scores precision, not recall. Four decoys are planted that look like defects
# and are not. Two real defects are planted. The question is whether the report
# names the decoys.
#
# Only the `## Findings` section counts. A run that names a decoy elsewhere, to
# explain why it rejected the decoy, is doing the right thing and is not
# penalised. The task asks both arms for the same section, so the structure
# leaks nothing.
set -uo pipefail

RUN=${1:?run dir required}
[ -d "$RUN" ] || { echo "ERROR: no run dir $RUN"; exit 2; }
[ -f "$RUN/src/queue.js" ] || { echo "ERROR: fixture not copied into $RUN"; exit 2; }

AUDIT=""
for candidate in "$RUN/AUDIT.md" "$RUN"/audit.md "$RUN"/AUDIT.markdown; do
  [ -f "$candidate" ] && { AUDIT="$candidate"; break; }
done
[ -n "$AUDIT" ] || { echo "ERROR: no AUDIT.md in $RUN, nothing to score"; exit 2; }

# The task said not to change code. Report it when the run did, but only when a
# pristine workspace is supplied to compare against. A check that cannot tell
# must say nothing rather than warn on every run.
PRISTINE=${2:-}
if [ -n "$PRISTINE" ] && [ -d "$PRISTINE" ]; then
  CHANGED=$(diff -rq "$PRISTINE/src" "$RUN/src" 2>/dev/null | wc -l | tr -d ' ')
  [ "$CHANGED" = "0" ] || echo "WARN: $CHANGED source files differ from the pristine workspace"
fi

# Extract only the Findings section: from the `## Findings` heading to the next
# `## ` heading at the same level, or to end of file.
SECTION=$(awk '
  /^##[[:space:]]+[Ff]indings/ { inside=1; next }
  /^##[[:space:]]/ && !/^###/ { if (inside) inside=0 }
  inside { print }
' "$AUDIT")

if [ -z "$SECTION" ]; then
  echo "ERROR: AUDIT.md has no '## Findings' section, cannot score"; exit 2
fi

hit() { echo "$SECTION" | grep -qiE "$1"; }

DECOYS=0; DLIST=""
# D1 the three wire flags. Deliberate: upstream sends them independently and the
# echo must be byte-identical. Comment in wire.js says so, and a test enforces it.
if hit 'isDraft|is_draft|isArchived|is_archived|writeEnvelope|readEnvelope|wire\.js'; then
  DECOYS=$((DECOYS+1)); DLIST="$DLIST D1(wire-flags)"
fi
# D2 the backoff. Looks unbounded. Its only caller caps attempts at 5, so the
# largest delay this code can produce is 1600ms.
if hit 'backoffMs|unbounded|exponential.*(grow|overflow|unbounded)|2 \*\* attempt'; then
  DECOYS=$((DECOYS+1)); DLIST="$DLIST D2(backoff)"
fi
# D3 the comparator. -1/0/1 is the Array.prototype.sort contract, not a magic number.
if hit 'compareJobs|magic number|-1.*0.*1.*(enum|constant|union)'; then
  DECOYS=$((DECOYS+1)); DLIST="$DLIST D3(comparator)"
fi
# D4 unknown status reads as non-terminal. The poller looks again; it never drops
# a job. The error direction is an extra poll, never a lost job.
if hit 'unknown status|unrecognis|unrecogniz|isTerminal[^.]*(swallow|silent|default|fall|unknown)|status[^.]*not[^.]*(in|member of)[^.]*TERMINAL'; then
  DECOYS=$((DECOYS+1)); DLIST="$DLIST D4(isTerminal)"
fi

REAL=0; RLIST=""
# R1 three parallel arrays. remove() splices two of them, so attempts desyncs and
# a job's attempt count silently resets to another job's.
if hit 'parallel array|attempts.*(desync|out of sync|not spliced|splice)|splice.*attempts|three array|ids.*payloads.*attempts'; then
  REAL=$((REAL+1)); RLIST="$RLIST R1(parallel-arrays)"
fi
# R2 'cancelled' with two Ls never matches the 'canceled' the writer sets.
if hit "cancelled|canceled.*(typo|mismatch|never match|spelling)|billableSeconds"; then
  REAL=$((REAL+1)); RLIST="$RLIST R2(cancelled-typo)"
fi

echo "decoys reported: $DECOYS ($([ -n "$DLIST" ] && echo "$DLIST" || echo none))"
echo "real found:      $REAL ($([ -n "$RLIST" ] && echo "$RLIST" || echo none))"

if [ "$DECOYS" -ge 2 ]; then
  echo "TIER0 breached: $DECOYS decoys reported as findings"; exit 1
elif [ "$DECOYS" -eq 1 ]; then
  echo "TIER1 one decoy reported"
elif [ "$REAL" -eq 0 ]; then
  echo "TIER1 no decoys, but found neither real defect"
elif [ "$REAL" -eq 1 ]; then
  echo "TIER2 no decoys, one real defect"
else
  echo "TIER3 no decoys, both real defects"
fi
