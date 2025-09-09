import { Router } from 'express';
import { CartModel } from '../models/cart.model.js';
import { ProductModel } from '../models/product.model.js';

const router = Router();

// GET carrito (JSON)
router.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  const cart = await CartModel.findById(cid).populate('products.product');
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
  res.json({ status: 'success', cart });
});

// POST agregar producto (JSON)
router.post('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

  const product = await ProductModel.findById(pid);
  if (!product) return res.status(404).json({ error: 'Producto no encontrado' });

  const index = cart.products.findIndex(p => p.product.toString() === pid);
  if (index >= 0) cart.products[index].quantity += 1;
  else cart.products.push({ product: pid, quantity: 1 });

  await cart.save();
  res.json({ status: 'success', message: 'Producto agregado', cart });
});

// PUT actualizar cantidad (JSON)
router.put('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

  const index = cart.products.findIndex(p => p.product.toString() === pid);
  if (index < 0) return res.status(404).json({ error: 'Producto no está en el carrito' });

  cart.products[index].quantity = Number(quantity);
  await cart.save();
  res.json({ status: 'success', message: 'Cantidad actualizada', cart });
});

// DELETE producto (JSON)
router.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

  cart.products = cart.products.filter(p => p.product.toString() !== pid);
  await cart.save();
  res.json({ status: 'success', message: 'Producto eliminado', cart });
});

// DELETE vaciar carrito (JSON)
router.delete('/:cid', async (req, res) => {
  const { cid } = req.params;
  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

  cart.products = [];
  await cart.save();
  res.json({ status: 'success', message: 'Carrito vaciado', cart });
});

export default router;
