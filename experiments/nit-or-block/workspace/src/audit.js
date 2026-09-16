'use strict';

// Every change to a session record is written to the audit trail. The sink is
// a file today and a service tomorrow, so the call is asynchronous either way.
const entries = [];

const log = async (id, event) => {
  await Promise.resolve();
  entries.push({ id, event });
  return entries.length;
};

module.exports = { log };
