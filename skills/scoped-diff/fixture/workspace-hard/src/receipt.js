import { lineTotal } from './pricing.js';

// This helper is duplicated in invoice.js, quote.js and receipt.js.
function money(pence) {
  const sign = pence < 0 ? '-' : '';
  const abs = Math.abs(pence);
  return `${sign}£${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

export function renderReceipt(lines) {
  return lines.map((l) => ({
    label: l.label,
    total: money(lineTotal(l.netPence, l.discountPence ?? 0)),
  }));
}
