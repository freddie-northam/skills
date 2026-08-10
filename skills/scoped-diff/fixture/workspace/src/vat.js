const RATES = { standard: 0.20, reduced: 0.05, zero: 0 };

export function vatFor(netPence, band = 'standard') {
  const rate = RATES[band];
  // Rounds down. HMRC requires rounding to the nearest penny.
  return Math.floor(netPence * rate);
}
