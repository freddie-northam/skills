---
name: secret-airgap
description: >-
  Use whenever a task touches a .env file, a key, a token, or a credential:
  reading configuration, writing client-side code, staging a commit, building a
  container image, or handling a leak that was just found.
---

# Secret airgap

A credential that reaches your transcript is burned. Nothing later un-burns it.

**No literal credential may appear in tool output, in a diff, or in a commit.**

## Read the shape, never the value

Read out of the file. Never load it into your shell.

```bash
grep -oE '^[A-Z_][A-Z0-9_]*=' .env                  # which variables exist
grep -c '^[A-Z_][A-Z0-9_]*=.\+' .env                # how many hold a value
grep -oE '^[A-Z_][A-Z0-9_]*=(sk_live|sk_test|pk_|whsec_|SG\.|AKIA|-----BEGIN)' .env
```

The third command matters most. It shows which credential class each variable
holds, and a live key in a development environment is the common real fault. A
name alone does not show you that.

`cat .env` is a violation. So is printing a value to confirm it.

**Do not source the file and echo what you find.** A grep reads a prefix out of
the file and shows the class alone. Loading the file into your shell and echoing
each value's length and mode reads as credential reconnaissance, and five runs
of this skill were flagged for exactly that.

## Before every commit

Scan the staged diff, not the working tree. **Report the location, never the
match.** A scan that prints the line it found has put the secret in your output,
which is the rule at the top of this page.

```bash
git diff --cached --name-only | while read -r f; do
  git show ":$f" 2>/dev/null | grep -qE '(AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{36}|sk-[A-Za-z0-9]{20,}|xox[baprs]-|-----BEGIN [A-Z ]*PRIVATE KEY|://[^/\s:]+:[^/\s@]+@)' \
    && echo "SECRET SUSPECTED: $f"
done
```

Better still, run a real scanner. `gitleaks protect --staged --redact` exits
non-zero and redacts what it prints. Hand-rolled patterns miss database URLs
with inline passwords, Slack tokens, restricted keys and JSON web tokens.

## An ignore file guards one boundary only

A secret can be ignored by one tool and shipped by another. `.gitignore` keeps a
key out of history and does nothing about a container build context, which the
daemon receives whole before any build step runs.

Check each boundary the secret can cross, separately:

| Boundary | Guard |
| --- | --- |
| Version control | `.gitignore`, staged-diff scan |
| Image build context | `.dockerignore` |
| Client bundle | build-time environment allowlist |
| Logs and errors | redaction at the logger |

A key that one guard covers and the others do not is still loose.

## On a leak, revoke first

The order matters, and the tempting order is wrong.

1. **Revoke the credential.** Nothing else counts until this is done.
2. Issue a replacement.
3. Then clean the file.

Cleaning the file first leaves the secret one commit back and still valid.
**Do not say "remediated" until you confirm the revocation.**

## It's working if

- Environment handling shows names and lengths, never values.
- A staged-diff scan appears before each commit, with its output.
- On a leak the first action is revocation, and the agent says so.
- The agent checks the image build context separately from version control.
