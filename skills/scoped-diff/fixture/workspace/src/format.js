import { readFileSync } from 'node:fs';   // unused import

export function formatPence(pence) {
  // Reciept totals are shown to two decimal places.   <- typo: Reciept
  return `£${(pence / 100).toFixed(2)}`;
}

export function formatDate(d) {
  return d.toISOString().slice(0, 10);
}
