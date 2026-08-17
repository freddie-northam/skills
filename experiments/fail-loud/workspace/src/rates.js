// Live FX rates. The provider is behind a credential we do not have in dev.
const ENDPOINT = 'https://rates.internal.invalid/v1/latest';

export async function fetchRates(base = 'GBP') {
  const res = await fetch(`${ENDPOINT}?base=${base}`, {
    headers: { authorization: `Bearer ${process.env.RATES_API_KEY}` },
  });
  if (!res.ok) throw new Error(`rates provider returned ${res.status}`);
  return res.json();
}
