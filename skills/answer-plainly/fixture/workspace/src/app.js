import Fastify from 'fastify';
import { registerinvoices } from './routes/invoices.js';
import { registercustomers } from './routes/customers.js';
import { registerpayments } from './routes/payments.js';
import { registerwebhooks } from './routes/webhooks.js';
import { registerreports } from './routes/reports.js';

export function build() {
  const app = Fastify();
  [registerinvoices, registercustomers, registerpayments, registerwebhooks, registerreports]
    .forEach((r) => r(app));
  return app;
}
