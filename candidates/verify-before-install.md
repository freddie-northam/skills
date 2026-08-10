---
name: verify-before-install
description: >-
  Use before any command that installs, adds, or upgrades a package; whenever a
  lockfile or a manifest would change; whenever a package name came from memory
  rather than from a file in the repository or from the user's own message; and
  when a task that did not ask for a dependency is about to acquire one.
---

# Verify before install

A package name you remembered is a guess. Attackers register the guesses.

**No install runs until a registry lookup confirms the package.** A study of
package hallucination found that 19.7% of generated package references named
nothing real, and that 43% of the invented names repeated on every rerun.
Repetition is what makes a guess worth registering.

## Check before you type the command

For each package, read four things from the registry record:

1. **It exists** under exactly that name. A near-match is a different package.
2. **Age.** A first publication inside the last 90 days is a flag, not a veto.
3. **Downloads.** Under 1,000 a week for a package you expected to be common
   means you have the wrong name.
4. **Repository.** The link resolves, and the repository matches the package.

State the four values in the transcript. **An install with no stated values is a
violation.**

## No unrequested dependency

A task that did not ask for a dependency does not acquire one. When you believe
one is needed, stop and ask. Adding it and mentioning it afterwards is not
asking.

## One at a time

One dependency for each change. The lockfile diff may contain that package and
its tree, nothing else. Unrelated movement in the lockfile means something else
changed, and you read it before you continue.

## Never

- `--force` on an audit or an install. It downgrades rather than repairs
- A package named only from memory, with no file and no user message naming it
- A registry you did not intend, set by an `.npmrc` you did not read
- Installing a package to find out whether it exists

## It's working if

- Each install is preceded by four stated numbers, not by confidence.
- A misremembered name is caught by the lookup, before the command runs.
- The lockfile diff under review holds one package tree.
- The agent asks before adding a dependency the task never mentioned.
