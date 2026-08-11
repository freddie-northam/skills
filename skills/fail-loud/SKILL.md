---
name: fail-loud
description: >-
  Use when writing a catch block, a default value, a retry wrapper, or a mock
  outside a test directory; when an external dependency fails during a task; and
  when a deadline or a demonstration makes a working-looking result tempting.
---

# Fail loud

Software that hides a failure looks finished and is not.

**A failure may not become success-shaped output.** No catch block returns a
default in place of an error. No missing integration returns a plausible value.
No absent credential quietly downgrades to a local stub.

## What a catch block may do

A catch block does one of three things, and the code says which:

1. Rethrows, with context added.
2. Handles a named condition that the code states.
3. Reports the failure to the caller as a failure.

A catch block that returns a normal-looking value is none of the three.

## Fabrication

Data that did not come from the source may not appear as though it did. No
invented rows, no placeholder totals, no example values standing in for a call
that failed. When the source is unavailable, that is the result.

## Prove it with a failing dependency

Some fallbacks are correct. A cache miss falls back to origin. A missing
optional setting falls back to a documented default.

A list of them in your report proves nothing. A list is a claim, it rewards
confidence rather than completeness, and it assumes every fallback has one
obvious line, which is false for configuration, injected dependencies,
middleware and caches.

**For every production integration you changed, add a test that forces the
dependency to fail and asserts that no success-shaped output crosses the public
boundary.** Name that test in the closing report.

A negative-path test is checkable by someone who does not trust you. An
inventory is not.

## The demonstration case

Pressure to show something working is the moment this rule earns its place. A
demonstration built on a hidden fallback demonstrates the fallback. Say the
integration is down and show the part that works.

## It's working if

- A broken integration announces itself on the first run, not in production.
- The closing report names a negative-path test for each changed integration.
- A failed call produces an error, not an empty array.
- Mocks appear only under a test directory.
