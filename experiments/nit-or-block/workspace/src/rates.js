'use strict';

// Billing helpers. Every rate in this file is per minute.
const perMinute = (total, seconds) => total / (seconds / 60);

const asCents = (amount) => Math.round(amount * 100);

module.exports = { perMinute, asCents };
