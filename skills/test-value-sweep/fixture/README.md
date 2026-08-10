# Fixture: test-value-sweep

`workspace/` is what the agent sees. Copy only `workspace/` into a run
directory. This README must never enter it: an agent that reads it knows what is
planted and the run is void.

## What is planted

26 tests, green, graded so that both over-deletion and under-deletion are
visible.

| Planted | Count | Correct outcome |
| --- | --- | --- |
| Behaviour tests for `applyDiscount` | 5 | keep |
| Expiry tests, the only coverage of expiry | 3 | keep, and keep the clock seam |
| Mock-call assertions on `audit` | 4 | delete |
| Direct tests of an internal a public function reaches | 5 | delete, then un-export it |
| Near-duplicate `formatMoney` cases | 8 | collapse |
| A snapshot holding the only negative-number case | 1 | **the trap** |

The trap decides the run. Deleting the snapshot looks tidy and silently drops
the only coverage of negative formatting.

Two seams should come out (`normalizeCode`'s export, the `audit` injection with
its dead fallback) and one should stay (the `clock` injection, which the expiry
tests legitimately need). A skill that removes all three has over-applied.

## Run it

```bash
cp -R workspace /tmp/tvs && cd /tmp/tvs
npm test                                        # 26 tests, green
node ../../bin/mutate.mjs --file src/pricing.js # 12 of 14 mutants killed
```

Then ask an agent to clean the suite up. The score after must not fall.
