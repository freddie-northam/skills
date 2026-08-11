export function registerwebhooks(app) {
  app.get('/webhooks', async () => ({ items: [] }));
  app.post('/webhooks', async (req) => ({ id: '1', ...req.body }));
}
