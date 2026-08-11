export function registerpayments(app) {
  app.get('/payments', async () => ({ items: [] }));
  app.post('/payments', async (req) => ({ id: '1', ...req.body }));
}
