#!/usr/bin/env bash
# Check the repository's own claims. CI runs this. So can you.
#
#   ./harness/verify.sh
#
# It runs no agent, so it costs nothing and needs no key. It checks what can be
# checked without one: structure, the oracles, the fixture suites that are meant
# to pass, and the published mutation score.
#
# Failures stop the build. Warnings do not, because some of them are findings
# about skills that were measured before this script existed, and editing a
# measured skill needs a re-run rather than a tidy-up.
set -uo pipefail
cd "$(dirname "$0")/.."
FAIL=0
WARN=0
ok()   { printf '  ok    %s\n' "$1"; }
warn() { printf '  warn  %s\n' "$1"; WARN=$((WARN+1)); }
bad()  { printf '  FAIL  %s\n' "$1"; FAIL=1; }

echo "== structure =="
for d in skills/*/; do
  s=$(basename "$d")
  [ -f "$d/SKILL.md" ]    || bad "$s has no SKILL.md"
  [ -f "$d/BASELINE.md" ] || bad "$s has no BASELINE.md"
  grep -q '^name:' "$d/SKILL.md" 2>/dev/null        || bad "$s SKILL.md has no name"
  grep -q '^description:' "$d/SKILL.md" 2>/dev/null || bad "$s SKILL.md has no description"
  # The frontmatter name must match the directory or a runtime installs it wrong.
  n=$(sed -n 's/^name:[[:space:]]*//p' "$d/SKILL.md" 2>/dev/null | head -1 | tr -d '\r')
  [ "$n" = "$s" ] || bad "$s SKILL.md declares name: $n"
  grep -qi "It's working if" "$d/SKILL.md" 2>/dev/null \
    || warn "$s has no \"It's working if\" section, which CONTRIBUTING requires"
done
[ "$FAIL" = "0" ] && ok "every skill has its files, frontmatter and a matching name"

echo
echo "== an oracle must not score the skill's own vocabulary =="
# A disclosure pattern that also appears in the SKILL.md it scores measures
# whether the agent copied the skill, not whether it found anything, and only
# the treatment arm can ever match it. Four patterns here once failed this.
# Single generic words are skipped: they carry no signal either way.
STOP='instruction|instructions|credential|source|record|report|result|missing|written|create|write'
for oracle in experiments/*/check*.sh; do
  [ -f "$oracle" ] || continue
  name=$(basename "$(dirname "$oracle")")
  skill="skills/$name/SKILL.md"
  [ -f "$skill" ] || continue
  pats=$(grep -oE "grep -[a-zA-Z]*E [\"'][^\"']+[\"']" "$oracle" \
         | sed -E "s/grep -[a-zA-Z]*E [\"']//; s/[\"']$//" \
         | tr '|' '\n' \
         | sed -E 's/\\\\[a-zA-Z]//g; s/[\\^$()?+*.]//g; s/\[[^]]*\]//g' \
         | sed -E 's/^[[:space:]]+//; s/[[:space:]]+$//' \
         | grep -vE "^($STOP)$" \
         | grep -E '^[A-Za-z][A-Za-z0-9_ -]{6,}$' | sort -u)
  while IFS= read -r p; do
    [ -z "$p" ] && continue
    grep -qiF -- "$p" "$skill" && bad "$name: oracle pattern \"$p\" appears in its own SKILL.md"
  done <<< "$pats"
done
ok "checked every oracle pattern against the skill it scores"

echo
echo "== fixture suites that are meant to pass =="
# Not every fixture is green. fail-loud's dependency is unreachable on purpose,
# which is the whole fixture, and answer-plainly's workspace has uninstalled
# dependencies by design. Only these two assert a green suite.
for ws in experiments/sweep-tests/workspace experiments/refute-findings/workspace; do
  [ -d "$ws" ] || continue
  # Capture first, then match. Piping straight into `grep -q` under pipefail
  # reports a failure that never happened: grep exits on the first match, npm
  # dies of SIGPIPE with 141, and pipefail returns 141 for a passing suite.
  out=$( cd "$ws" && npm test 2>&1 )
  if printf '%s' "$out" | grep -qE 'fail 0'; then ok "$ws green"
  else bad "$ws suite is not green, and this one must be"; fi
done

echo
echo "== the published mutation score reproduces =="
WS=experiments/sweep-tests/workspace
if [ -d "$WS" ]; then
  # Mutate a copy. The runner rewrites its target file and restores it, so
  # running it against the tracked fixture leaves a window in which the working
  # tree holds broken source. Anything reading the fixture at that moment, a
  # concurrent run or a second checkout, gets the mutant.
  TMP=$(mktemp -d)
  cp -R "$WS/." "$TMP/"
  MUTBIN=$(cd skills/sweep-tests/bin && pwd)/mutate.mjs
  score=$( cd "$TMP" && node "$MUTBIN" --file src/pricing.js --test "npm test" 2>&1 \
           | grep -oE 'Detection: [0-9]+/[0-9]+' | head -1 | grep -oE '[0-9]+/[0-9]+' )
  rm -rf "$TMP"
  claimed=$(grep -oE '[0-9]+ of [0-9]+ mutants killed' experiments/sweep-tests/README.md 2>/dev/null \
            | head -1 | sed -E 's/ of /\//; s/ mutants killed//')
  if [ -n "$score" ] && [ "$score" = "$claimed" ]; then ok "fixture README claims $claimed, measured $score"
  else bad "fixture README claims ${claimed:-none}, measured ${score:-none}"; fi
fi

echo
echo "== writing rules, ASD-STE100 subset =="
# Advisory. The shipped skills were measured before this check existed, and an
# edit to a measured skill needs a re-run, not a tidy-up. See METHOD.md.
node harness/ste.mjs skills/*/SKILL.md || warn "STE violations above, advisory only"

echo
if [ "$FAIL" = "0" ]; then
  echo "PASS ($WARN warning(s))"
else
  echo "FAIL"
fi
exit $FAIL
