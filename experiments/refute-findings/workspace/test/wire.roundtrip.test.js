import { test } from 'node:test';
import assert from 'node:assert';
import { readEnvelope, writeEnvelope } from '../src/wire.js';

test('every flag combination round-trips byte-identical', () => {
  for (let bits = 0; bits < 8; bits += 1) {
    const raw = {
      id: `env-${bits}`,
      is_draft: Boolean(bits & 1),
      is_published: Boolean(bits & 2),
      is_archived: Boolean(bits & 4),
      body: 'x',
    };
    assert.deepStrictEqual(writeEnvelope(readEnvelope(raw)), raw);
  }
});
