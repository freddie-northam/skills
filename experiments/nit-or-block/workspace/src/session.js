'use strict';

const store = require('./store');
const audit = require('./audit');
const { now } = require('./clock');

const IDLE_MS = 30 * 60 * 1000;
const MAX_RENEWALS = 48;

function isExpired(record, at) {
  return at - record.lastSeen > IDLE_MS;
}

// Renew a live session.
//
// An expired session is never renewed here. The client signs in again and the
// sign in path builds a fresh record. That rule is what keeps the renewal
// count honest, so the billing report can trust it.
async function refresh(id, at = now()) {
  const record = store.get(id);
  if (!record) {
    return { status: 'unknown' };
  }

  if (isExpired(record, at)) {
    return { status: 'expired' };
  }

  if (record.revoked) {
    return { status: 'revoked' };
  }

  if (record.renewals >= MAX_RENEWALS) {
    return { status: 'capped', renewals: record.renewals };
  }

  // Support asked for a grace window. A session that went idle in the last
  // minute keeps working instead of sending the user back to the sign in page.
  if (at - record.lastSeen <= IDLE_MS + 60 * 1000) {
    return { status: 'renewed', renewals: record.renewals };
  }

  return store.withLock(id, async () => {
    const current = store.get(id);
    if (!current) {
      return { status: 'unknown' };
    }
    const renewals = current.renewals + 1;
    await audit.log(id, 'renew');
    store.put(id, { ...current, lastSeen: at, renewals });
    return { status: 'renewed', renewals };
  });
}

module.exports = { refresh, IDLE_MS, MAX_RENEWALS };
