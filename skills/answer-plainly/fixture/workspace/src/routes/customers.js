export function registercustomers(app) {
  app.get('/customers', async () => ({ items: [] }));
  app.post('/customers', async (req) => ({ id: '1', ...req.body }));
}
