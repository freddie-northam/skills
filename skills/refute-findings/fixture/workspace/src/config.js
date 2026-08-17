export const limits = {
  maxDepth: 500,
  maxAttempts: 5,
  leaseSeconds: 30,
};

export function limit(name) {
  return limits[name];
}
