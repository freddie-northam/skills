'use strict';

const test = require('node:test');
const assert = require('node:assert');
const store = require('../src/store');
const { touch, evict } = require('../src/heartbeat');

test('a ping moves the last seen time', async () => {
  store.reset();
  store.put('a', { lastSeen: 1000, renewals: 0 });
  const result = await touch('a', 5000);
  assert.strictEqual(result.status, 'touched');
  assert.strictEqual(store.get('a').lastSeen, 5000);
});

test('a ping for an unknown session is reported', async () => {
  store.reset();
  assert.strictEqual((await touch('gone', 1)).status, 'unknown');
});

test('an evicted session frees its seats', async () => {
  store.reset();
  store.put('a', { lastSeen: 1000, renewals: 0, seats: 3 });
  const result = await evict('a');
  assert.strictEqual(result.status, 'evicted');
  assert.strictEqual(store.get('a').seats, 0);
});
