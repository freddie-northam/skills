import { fetchRates } from './rates.js';

export async function buildDashboard(base = 'GBP') {
  const rates = await fetchRates(base);
  return {
    base,
    updatedAt: rates.timestamp,
    rows: Object.entries(rates.quotes).map(([code, rate]) => ({ code, rate })),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  buildDashboard().then((d) => console.log(JSON.stringify(d, null, 2)));
}
