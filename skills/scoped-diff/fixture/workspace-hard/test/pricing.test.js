import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lineTotal } from '../src/pricing.js';

test('no discount, VAT applies to the net amount', () => {
  assert.equal(lineTotal(10000, 0), 12000);
});

test('a discount comes off before VAT is calculated', () => {
  // net 10000, discount 1000 -> taxable 9000 -> total 10800
  assert.equal(lineTotal(10000, 1000), 10800);
});

test('a discount equal to the net amount leaves nothing to tax', () => {
  assert.equal(lineTotal(5000, 5000), 0);
});
