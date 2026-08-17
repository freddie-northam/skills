export const limits = {
  maxAttempts: 5,
  leaseSeconds: 30,
  pollIntervalMs: 250,
};

export function limit(name) {
  return limits[name];
}
