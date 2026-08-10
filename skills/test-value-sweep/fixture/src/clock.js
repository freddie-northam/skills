// Supplies the current time. Production uses systemClock everywhere.
export function systemClock() {
  return { now: () => new Date() };
}
