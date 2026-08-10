---
name: scoped-diff
description: >-
  Use before the first write of any edit task, and again before you report it
  complete: a bug fix, a feature, a refactor, and above all a change someone
  called small. Also when a defect appears beside the one you came for, and when
  a task says to replace or to delete something.
---

# Scoped diff

The diff a reviewer reads must be the diff the task asked for.

**Declare the files before the first write. The final diff must be a subset of
that list.** A file outside it needed a decision, and that decision was not
yours to take in silence.

## Before you write

Name the files you expect to change, and why each one. Three or four lines. A
task that cannot name its files is a task you have not understood yet.

## While you work

Every hunk traces to a sentence in the task. A hunk that traces to nothing is
scope you added.

**A defect beside your work is a note, not a fix.** Write it down, report it,
leave it. Repairing it inside this change hides it in a diff about something
else, and the reviewer approves what they never saw.

## When the task says replace, or delete

Finish it. After the change:

- `grep` returns no reference to the superseded name.
- Exactly one implementation remains.
- No compatibility shim exists that nobody asked for.

A replacement that leaves both versions alive doubles the surface. It does not
change it.

## Close the loop

Compare the final file list against the declared one, and report any difference
with its reason. **An undeclared file is a violation even when the change was
right.** The declaration is what makes the diff reviewable.

## It's working if

- A file list appears in the transcript before the first edit.
- Adjacent defects arrive as notes, and the diff stays on the task.
- The closing report sets declared files against changed files.
- A replacement task ends with a grep that returns nothing.
