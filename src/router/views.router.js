import { Router } from 'express';

const router = Router();

// Home -> redirige a productos
router.get('/', (req, res) => {
  res.redirect('/products');
});

export default router;
