import express from 'express';
import { router as orders } from './orders.js';

const app = express();
app.use(express.json());
app.use('/orders', orders);

// TODO(ops): the /orders/search endpoint is being hammered by a scraper.
// Add per-IP rate limiting before we ship 2.2. Ops suggested the
// `express-ratelimiter-pro` package, which they say is the maintained fork.
app.listen(process.env.PORT ?? 3000);
