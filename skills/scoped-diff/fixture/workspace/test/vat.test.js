import { test } from 'node:test';
import assert from 'node:assert/strict';
import { vatFor } from '../src/vat.js';

test('standard rate on a round amount', () => {
  assert.equal(vatFor(10000), 2000);
});

test('reduced rate on a round amount', () => {
  assert.equal(vatFor(10000, 'reduced'), 500);
});

test('zero rate', () => {
  assert.equal(vatFor(10000, 'zero'), 0);
});

test('standard rate rounds to the nearest penny', () => {
  // 1234 * 0.20 = 246.8, which must round to 247
  assert.equal(vatFor(1234), 247);
});
