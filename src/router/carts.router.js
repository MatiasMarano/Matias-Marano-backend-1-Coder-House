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
router.post('/:cid/product/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const cart = await CartModel.findById(cid);
  if (!cart) return res.status(404).send('Carrito no encontrado');

  const product = await ProductModel.findById(pid);
  if (!product) return res.status(404).send('Producto no encontrado');

  const index = cart.products.findIndex(p => p.product.toString() === pid);
  if (index >= 0) cart.products[index].quantity += 1;
  else cart.products.push({ product: pid, quantity: 1 });

  await cart.save();
  res.redirect(`/carts/${cid}`);
});

export default router;
