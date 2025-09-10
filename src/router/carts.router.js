import { Router } from 'express';
import { CartModel } from '../models/cart.model.js';
import { ProductModel } from '../models/product.model.js';

const router = Router();

// Mostrar carrito
router.get('/:cid', async (req, res) => {
  const { cid } = req.params;
  const cart = await CartModel.findById(cid).populate('products.product').lean();
  if (!cart) return res.status(404).send('Carrito no encontrado');
  res.render('carts', { cart });
});

// Agregar producto
router.post('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).send('Carrito no encontrado');

  const product = await ProductModel.findById(pid);
  if (!product) return res.status(404).send('Producto no encontrado');

  const index = cart.products.findIndex(p => p.product.toString() === pid);
  if (index >= 0) {
    cart.products[index].quantity += 1;
  } else {
    cart.products.push({ product: pid, quantity: 1 });
  }

  await cart.save();
  res.redirect(`/carts/${cid}`);
});

// Actualizar cantidad
router.put('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).send('Carrito no encontrado');

  const index = cart.products.findIndex(p => p.product.toString() === pid);
  if (index < 0) return res.status(404).send('Producto no está en el carrito');

  cart.products[index].quantity = Number(quantity);
  await cart.save();
  res.redirect(`/carts/${cid}`);
});

// Eliminar producto
router.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).send('Carrito no encontrado');

  cart.products = cart.products.filter(p => p.product.toString() !== pid);
  await cart.save();
  res.redirect(`/carts/${cid}`);
});

// Vaciar carrito
router.delete('/:cid', async (req, res) => {
  const { cid } = req.params;
  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).send('Carrito no encontrado');

  cart.products = [];
  await cart.save();
  res.redirect(`/carts/${cid}`);
});

export default router;
