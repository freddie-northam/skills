# Grace window, and the heartbeat endpoints

## What this does

- `refresh()` now keeps a session alive when it went idle less than a minute
  ago. Support has asked for this three times this quarter: people lose a form
  because they took a phone call.
- New `src/heartbeat.js`. The client pings `touch()` every 30 seconds while a
  tab is open, and calls `evict()` when the tab closes, so the seat is freed.

## Notes

- The try block in `touch()` and `evict()` is the same code twice. I know. I
  will pull it into a shared helper in a follow up change, this one is already
  big enough.
- `npm test` is green, 6 of 6.
