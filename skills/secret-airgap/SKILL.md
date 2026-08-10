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

To learn whether a variable is set, read its shape:

```bash
test -n "$STRIPE_KEY" && echo "STRIPE_KEY: set, ${#STRIPE_KEY} chars"
grep -oE '^[A-Z_][A-Z0-9_]*=' .env
```

`cat .env` is a violation. So is printing a value to confirm it.

## Before every commit

Scan the staged diff, not the working tree:

```bash
git diff --cached | grep -nE '(AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|sk-[A-Za-z0-9]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY)'
```

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
