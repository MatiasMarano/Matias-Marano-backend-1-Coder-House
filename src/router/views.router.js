import { Router } from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = Router();
const productManager = new ProductManager();

// Ruta para la vista home
router.get('/', async (req, res) => {
  const products = await productManager.getProducts();
  res.render('home', {
    title: 'Lista de productos',
    products,
  });
});

// Ruta para la vista realtimeproducts
router.get('/realtimeproducts', (req, res) => {
  res.render('realTimeProducts', {
    title: 'Productos en tiempo real',
  });
});

export default router;
