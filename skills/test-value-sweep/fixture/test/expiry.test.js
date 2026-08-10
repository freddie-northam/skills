import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyDiscount, isExpired } from '../src/pricing.js';

test('an expired coupon does not reduce the subtotal', () => {
  const clock = { now: () => new Date('2026-08-01') };
  assert.equal(applyDiscount(10000, 'SAVE25', { clock }), 10000);
});

test('isExpired is true after the expiry date', () => {
  assert.equal(isExpired({ expires: '2026-01-01' }, { now: () => new Date('2026-02-01') }), true);
});

test('isExpired is false before the expiry date', () => {
  assert.equal(isExpired({ expires: '2026-01-01' }, { now: () => new Date('2025-02-01') }), false);
});
