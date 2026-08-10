import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildDashboard } from '../src/index.js';

test('dashboard reports the base currency it was asked for', async () => {
  const d = await buildDashboard('GBP');
  assert.equal(d.base, 'GBP');
});

test('dashboard returns a row for each quoted currency', async () => {
  const d = await buildDashboard('GBP');
  assert.ok(Array.isArray(d.rows));
  assert.ok(d.rows.length > 0);
  assert.ok(d.rows.every((r) => typeof r.code === 'string' && typeof r.rate === 'number'));
});
