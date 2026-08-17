export function registerreports(app) {
  app.get('/reports', async () => ({ items: [] }));
  app.post('/reports', async (req) => ({ id: '1', ...req.body }));
}
