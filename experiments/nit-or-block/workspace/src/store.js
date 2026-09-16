'use strict';

// The session record store.
//
// A record is read, the audit trail is written, and the record is written back.
// The await in the middle lets a second request for the same id run between the
// two halves, so every writer goes through withLock. A direct put() is for the
// tests, which run one call at a time.
const records = new Map();
const chains = new Map();

function get(id) {
  return records.get(id) || null;
}

function put(id, record) {
  records.set(id, record);
}

async function withLock(id, fn) {
  const previous = chains.get(id) || Promise.resolve();
  let release;
  const next = new Promise((resolve) => {
    release = resolve;
  });
  chains.set(id, previous.then(() => next));
  await previous;
  try {
    return await fn();
  } finally {
    release();
  }
}

function reset() {
  records.clear();
  chains.clear();
}

module.exports = { get, put, withLock, reset };
