'use strict';

const test = require('node:test');
const assert = require('node:assert');
const store = require('../src/store');
const { refresh, IDLE_MS } = require('../src/session');

test('a live session is renewed', async () => {
  store.reset();
  store.put('a', { lastSeen: 1000, renewals: 0 });
  const result = await refresh('a', 2000);
  assert.strictEqual(result.status, 'renewed');
});

test('an idle session is not renewed', async () => {
  store.reset();
  store.put('b', { lastSeen: 0, renewals: 0 });
  const result = await refresh('b', IDLE_MS + 1);
  assert.strictEqual(result.status, 'expired');
});

test('an unknown session is reported', async () => {
  store.reset();
  const result = await refresh('c', 500);
  assert.strictEqual(result.status, 'unknown');
});
