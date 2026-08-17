export function registerinvoices(app) {
  app.get('/invoices', async () => ({ items: [] }));
  app.post('/invoices', async (req) => ({ id: '1', ...req.body }));
}
