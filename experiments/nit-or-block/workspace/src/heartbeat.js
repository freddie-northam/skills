'use strict';

const store = require('./store');
const audit = require('./audit');
const { now } = require('./clock');

const MAX_TRIES = 3;

// The client pings this every 30 seconds while a tab is open.
const touch = async (id, at = now()) => {
  let tries = 0;
  for (;;) {
    try {
      const record = store.get(id);
      if (!record) {
        return { status: 'unknown' };
      }
      await audit.log(id, 'touch');
      store.put(id, { ...record, lastSeen: at });
      return { status: 'touched' };
    } catch (err) {
      tries += 1;
      if (tries >= MAX_TRIES) throw err;
      await new Promise((resolve) => setTimeout(resolve, 10 * tries));
    }
  }
};

// The tab closed. Drop the session so the seat is free again.
const evict = async (id) => {
  let tries = 0;
  for (;;) {
    try {
      const record = store.get(id);
      if (!record) {
        return { status: 'unknown' };
      }
      await audit.log(id, 'evict');
      store.put(id, { ...record, evicted: true, seats: 0 });
      return { status: 'evicted' };
    } catch (err) {
      tries += 1;
      if (tries >= MAX_TRIES) throw err;
      await new Promise((resolve) => setTimeout(resolve, 10 * tries));
    }
  }
};

module.exports = { touch, evict };
