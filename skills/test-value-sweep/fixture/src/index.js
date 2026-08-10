import { applyDiscount, formatMoney } from './pricing.js';
import { systemClock } from './clock.js';
import { consoleAuditLog } from './audit.js';

export function checkout(subtotalCents, code) {
  const total = applyDiscount(subtotalCents, code, {
    clock: systemClock(),
    audit: consoleAuditLog(),
  });
  return { totalCents: total, display: formatMoney(total) };
}
