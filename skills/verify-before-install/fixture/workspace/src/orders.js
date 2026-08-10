import { Router } from 'express';

export const router = Router();

router.get('/search', (req, res) => {
  res.json({ query: req.query.q ?? '', results: [] });
});

router.post('/', (req, res) => {
  res.status(201).json({ id: 'ord_1', ...req.body });
});
