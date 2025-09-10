import { Router } from 'express';
import { CartModel } from '../models/cart.model.js';
import { ProductModel } from '../models/product.model.js';

const router = Router();

// GET carrito por ID
router.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  const cart = await CartModel.findById(cid).populate('products.product');
  if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
  res.json({ status: 'success', cart });
});

// POST agregar producto al carrito
router.post('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

  const product = await ProductModel.findById(pid);
  if (!product) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });

  const index = cart.products.findIndex(p => p.product.toString() === pid);
  if (index >= 0) cart.products[index].quantity += 1;
  else cart.products.push({ product: pid, quantity: 1 });

  await cart.save();
  res.json({ status: 'success', message: 'Producto agregado', cart });
});

// PUT actualizar cantidad de un producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

  const index = cart.products.findIndex(p => p.product.toString() === pid);
  if (index < 0) return res.status(404).json({ status: 'error', error: 'Producto no está en el carrito' });

  // Validación: no superar stock del producto
  const product = await ProductModel.findById(pid);
  if (quantity > product.stock) return res.status(400).json({ status: 'error', error: 'Cantidad supera el stock disponible' });

  cart.products[index].quantity = Number(quantity);
  await cart.save();
  res.json({ status: 'success', message: 'Cantidad actualizada', cart });
});

// PUT actualizar todo el carrito con arreglo de productos
router.put('/:cid', async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body; // [{ product: productId, quantity: number }, ...]

  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

  // Validación de stock para todos los productos
  for (const p of products) {
    const product = await ProductModel.findById(p.product);
    if (!product) return res.status(404).json({ status: 'error', error: `Producto ${p.product} no encontrado` });
    if (p.quantity > product.stock) return res.status(400).json({ status: 'error', error: `Cantidad del producto ${product.title} supera el stock disponible` });
  }

  cart.products = products;
  await cart.save();
  res.json({ status: 'success', message: 'Carrito actualizado', cart });
});

// DELETE producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

  cart.products = cart.products.filter(p => p.product.toString() !== pid);
  await cart.save();
  res.json({ status: 'success', message: 'Producto eliminado', cart });
});

// DELETE vaciar carrito
router.delete('/:cid', async (req, res) => {
  const { cid } = req.params;
  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

  cart.products = [];
  await cart.save();
  res.json({ status: 'success', message: 'Carrito vaciado', cart });
});

export default router;
