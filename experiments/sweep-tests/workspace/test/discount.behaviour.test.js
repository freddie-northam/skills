import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyDiscount } from '../src/pricing.js';

const farFuture = { now: () => new Date('2026-01-01') };

test('percent coupon reduces the subtotal', () => {
  assert.equal(applyDiscount(10000, 'SAVE10', { clock: farFuture }), 9000);
});

test('flat coupon subtracts a fixed amount', () => {
  assert.equal(applyDiscount(10000, 'FLAT5', { clock: farFuture }), 9500);
});

test('unknown coupon leaves the subtotal untouched', () => {
  assert.equal(applyDiscount(10000, 'NOPE', { clock: farFuture }), 10000);
});

test('discount never pushes the total below zero', () => {
  assert.equal(applyDiscount(100, 'FLAT5', { clock: farFuture }), 0);
});

test('lowercase and spaced codes still apply', () => {
  assert.equal(applyDiscount(10000, '  save10 ', { clock: farFuture }), 9000);
});
