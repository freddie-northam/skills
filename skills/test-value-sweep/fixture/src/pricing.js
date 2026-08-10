const CODES = {
  SAVE10: { kind: 'percent', value: 10, expires: '2026-12-31' },
  SAVE25: { kind: 'percent', value: 25, expires: '2026-06-30' },
  FLAT5: { kind: 'flat', value: 500, expires: '2027-01-01' },
};

// Exported only so the unit tests can reach it. index.js does not re-export it.
export function normalizeCode(raw) {
  if (typeof raw !== 'string') return '';
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export function isExpired(coupon, clock) {
  return new Date(coupon.expires) < clock.now();
}

export function formatMoney(cents) {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}$${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}

export function applyDiscount(subtotalCents, rawCode, deps = {}) {
  const clock = deps.clock ?? systemClockFallback();
  const audit = deps.audit ?? consoleAuditFallback();

  const code = normalizeCode(rawCode);
  const coupon = CODES[code];

  if (!coupon) {
    audit.record('coupon.unknown', { code });
    return subtotalCents;
  }
  if (isExpired(coupon, clock)) {
    audit.record('coupon.expired', { code });
    return subtotalCents;
  }

  const off =
    coupon.kind === 'percent'
      ? Math.round((subtotalCents * coupon.value) / 100)
      : coupon.value;

  audit.record('coupon.applied', { code, off });
  return Math.max(0, subtotalCents - off);
}

function systemClockFallback() {
  return { now: () => new Date() };
}
function consoleAuditFallback() {
  return { record() {} };
}
