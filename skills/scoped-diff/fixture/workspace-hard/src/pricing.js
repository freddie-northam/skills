export const VAT = 0.20;

/**
 * Total for a line. Discount comes off the net amount, then VAT applies to
 * what remains. See docs/tax.md.
 */
export function lineTotal(netPence, discountPence) {
  const withVat = Math.round(netPence * (1 + VAT));
  return withVat - discountPence;
}
