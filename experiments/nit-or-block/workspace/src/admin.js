'use strict';

const store = require('./store');
const audit = require('./audit');
const { now } = require('./clock');

// Support tool. An operator raises the seat count on a live session.
const setSeats = async (id, seats) => store.withLock(id, async () => {
  const current = store.get(id);
  if (!current) return { status: 'unknown' };
  await audit.log(id, 'seats');
  store.put(id, { ...current, seats, changedAt: now() });
  return { status: 'updated', seats };
});

// Support tool. An operator marks a session as reviewed.
const markReviewed = async (id, operator) => store.withLock(id, async () => {
  const current = store.get(id);
  if (!current) return { status: 'unknown' };
  await audit.log(id, 'reviewed');
  store.put(id, { ...current, reviewedBy: operator });
  return { status: 'reviewed' };
});

module.exports = { setSeats, markReviewed };
