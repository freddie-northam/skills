import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { formatMoney } from '../src/pricing.js';

test('formatMoney matches the committed snapshot', () => {
  const snap = JSON.parse(readFileSync(new URL('./format.snap.json', import.meta.url)));
  const actual = snap.inputs.map((c) => formatMoney(c));
  assert.deepEqual(actual, snap.outputs);
});

test('formatMoney 0', () => assert.equal(formatMoney(0), '$0.00'));
test('formatMoney 1', () => assert.equal(formatMoney(1), '$0.01'));
test('formatMoney 10', () => assert.equal(formatMoney(10), '$0.10'));
test('formatMoney 99', () => assert.equal(formatMoney(99), '$0.99'));
test('formatMoney 100', () => assert.equal(formatMoney(100), '$1.00'));
test('formatMoney 101', () => assert.equal(formatMoney(101), '$1.01'));
test('formatMoney 1000', () => assert.equal(formatMoney(1000), '$10.00'));
test('formatMoney 12345', () => assert.equal(formatMoney(12345), '$123.45'));
