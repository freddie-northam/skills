import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyDiscount } from '../src/pricing.js';

function mockAudit() {
  const calls = [];
  return { calls, record: (e, d) => calls.push([e, d]) };
}
const clock = { now: () => new Date('2026-01-01') };

test('applyDiscount calls audit.record exactly once on success', () => {
  const audit = mockAudit();
  applyDiscount(10000, 'SAVE10', { clock, audit });
  assert.equal(audit.calls.length, 1);
});

test('applyDiscount calls audit.record with coupon.applied', () => {
  const audit = mockAudit();
  applyDiscount(10000, 'SAVE10', { clock, audit });
  assert.equal(audit.calls[0][0], 'coupon.applied');
});

test('applyDiscount calls audit.record with coupon.unknown', () => {
  const audit = mockAudit();
  applyDiscount(10000, 'BOGUS', { clock, audit });
  assert.equal(audit.calls[0][0], 'coupon.unknown');
});

test('applyDiscount calls audit.record with the off amount in detail', () => {
  const audit = mockAudit();
  applyDiscount(10000, 'SAVE10', { clock, audit });
  assert.equal(audit.calls[0][1].off, 1000);
});
