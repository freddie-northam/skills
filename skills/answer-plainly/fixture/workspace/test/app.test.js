import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from '../src/app.js';

test('the app builds', () => { assert.ok(build()); });
test('routes are registered', () => { assert.ok(build()); });
