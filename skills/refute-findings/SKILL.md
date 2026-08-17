---
name: refute-findings
description: >-
  Use when you audit or review code and are about to report a finding: a bug, a
  smell, a simplification, a security hole, a performance problem. Also when a
  subagent hands you findings to accept, and whenever you write "should be",
  "could be simplified", "permits an invalid state", "fragile", or "consider".
---

# Refute findings

A finding is a claim about the code. Most audit findings are wrong.

They are wrong in a particular way. They describe a real shape in the source,
and they are still not defects. The shape is deliberate, or unreachable, or
standard, or harmless.

So do not ask whether the shape is there. Ask what would kill the claim.

## The four killers

Run all four against every candidate. Each kills a different class of
plausible-but-wrong claim.

**1. Reachability.** Does the state occur with the inputs the code has?
Count the callers. Read the constructors. Compute the number.

An absent caller is not an absent input. A symbol the package exports has
callers you cannot see, and their inputs are hostile rather than missing. Use
this killer inside a boundary you own. Never use it on a public interface. If
you wrote "no callers in this repository", you found an API, not a proof.

**2. Stated intent.** Does the code say it is deliberate?
Read the comments, the usage line, the tests, and the docs at the site.

**3. Convention.** Is this the standard meaning in this domain?
Name a tool, a standard, or an idiom that does the same thing.

**4. Direction.** Which way does the error run?
A defect that raises a false alarm is not a defect that grants silent
acceptance. Name which one it is, and name who consumes the result.

## Report the attempt, never the verdict

Each killer needs an artifact. A verdict is not an artifact.

| Killer | Not this | This |
| --- | --- | --- |
| Reachability | "reachable" | "3 callers, 2 set the field: `a.js:14`, `b.js:9`" |
| Stated intent | "not intentional" | "no comment at the site, grep of `docs/` empty" |
| Convention | "not conventional" | "Stryker and PIT both count a crash as a kill" |
| Direction | "harmful" | "false kill, never false survivor, and the survivor list is the output" |

A killer you answered in one word is a killer you did not run.

## Skip is a complete answer

Report nothing when every candidate dies. That is a result.

Say how many candidates you killed and which killer killed each one. A reader
who sees only survivors cannot tell a careful audit from a lazy one.

An audit that reports a finding for every file reports its own expectations.

## Never

- A finding you did not try to kill
- A finding whose four killers are four single words
- "Consider", "may want to", "could be cleaner". These have no truth value
- A rewrite for style, for line count, or for a need nobody has yet
- A second finding that restates the first at a different altitude

## It's working if

- The report names how many candidates died, and to which killer.
- Each finding that survives names the observation that would have killed it.
- An audit of clean code returns nothing at all.
- A reader checks one finding without a full reread of the file.
- The findings you drop are the ones a reviewer would have argued with.
