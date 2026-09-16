---
name: nit-or-block
description: >-
  Use when you review a change: a diff, a patch, a pull request, a commit. Also
  when you decide whether a change can merge, and whenever you write "prefer",
  "cleaner", "not idiomatic", "inconsistent with", "I would have done it", or
  "clean it up later".
---

# Nit or block

A review answers one question. What must the author repair before this merges?

Every other comment is a gift. It holds no power over the change.

Most reviews never split the two. The author reads twelve comments, guesses
which four matter, and picks wrong. The reviewer moved the work, not the risk.

Google's standard: approve a change once it improves the health of the code,
even when the change is not perfect.

## Two piles

Each comment goes in one pile, and says which.

**Must fix.** This change makes the code worse, and it merges in that state.

**Nit.** Taste, a lesson, a better idea, a repair for another day.

A comment with no pile does not count. Write the pile in the text.

## An item in Must fix costs you an artifact

Name the artifact inside the item. Four kinds count:

| Authority | The artifact to cite |
| --- | --- |
| A case that fails | the input, and the wrong result the code returns |
| A rule this repository holds | the config file, and the name of the rule |
| A principle of design | the principle, and the caller that pays for the breach |
| The habit of the code around it | two call sites, file and line, that do the opposite |

Anything below that line is your preference. Preference goes in Nit.

Count the call sites before you claim a habit. A tree that does it both ways
gives you no precedent, so the author picks.

When the author shows their approach is as sound as yours, take theirs.

## What this change owes, and what it does not

**New difficulty that this change adds: repair it now.** "I will tidy it in the
next change" is a promise, not a repair. The tidy-up rarely arrives. The work
is cheap today and dear after the merge.

**A fault older than this change: never a blocker.** Ask for a TODO note and a
bug report instead. The author who edits a file near an old fault does not own
it.

## The hunk lies

A diff shows three lines of context around each edit. Those three lines hide
the guard above and the return below.

Open each file the change touches. Read every function the change enters, from
its first line to its last.

Then write, for each edit, the function that holds it and how far you read
away from it. Three new lines can be correct in the hunk and wrong in the
function.

## Say the decision

End with one line: the change can merge, or it cannot, plus the count of Must
fix items.

A merge with open Nit items is the normal outcome. Say so when it applies.

An empty Must fix pile with a refusal to merge is not a review. It is a mood.

## Never

- A Must fix item whose authority is your taste
- A comment about the author. Write about the code
- A Must fix item for a fault this change did not create
- "Consider", "it would be cleaner", with no pile and no artifact
- A pile that grows because the release is near, or shrinks for the same reason
- A decision you leave out because the list felt long enough

## It's working if

- Each Must fix item cites a rule, two call sites, or a case that fails.
- The review names the function around each edit, not the line numbers alone.
- A deadline changes the size of the Nit pile, and never the Must fix pile.
- The author repairs every Must fix item without a question about your intent.
- A sound change gets one line of approval, and no invented list.

## Source

Google's engineering practices, the code review reviewer guide. The standard,
the principles, the severity labels and the pushback rules come from there:
https://google.github.io/eng-practices/review/reviewer/
