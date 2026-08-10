import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeCode } from '../src/pricing.js';

test('normalizeCode trims', () => assert.equal(normalizeCode(' A '), 'A'));
test('normalizeCode uppercases', () => assert.equal(normalizeCode('ab'), 'AB'));
test('normalizeCode strips punctuation', () => assert.equal(normalizeCode('a-b'), 'AB'));
test('normalizeCode handles non-strings', () => assert.equal(normalizeCode(null), ''));
test('normalizeCode handles numbers', () => assert.equal(normalizeCode(42), ''));
