import { Router } from 'express';
import { ProductManager } from '../managers/ProductManager.js';

const router = Router();
const productManager = new ProductManager();

router.get('/', async (req, res) => {
  const products = await productManager.getProducts();
  res.json(products);
});

router.get('/:pid', async (req, res) => {
  const product = await productManager.getProductById(req.params.pid);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(product);
});

router.post('/', async (req, res) => {
  try {
    const newProduct = await productManager.addProduct(req.body);
    res.status(201).json(newProduct);
  } catch {
    res.status(500).json({ error: 'Error al agregar producto' });
  }
});

router.put('/:pid', async (req, res) => {
  const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
  if (!updatedProduct) return res.status(404).json({ error: 'Producto no encontrado' });
  res.json(updatedProduct);
});

router.delete('/:pid', async (req, res) => {
  await productManager.deleteProduct(req.params.pid);
  res.json({ message: 'Producto eliminado' });
});

export default router;
