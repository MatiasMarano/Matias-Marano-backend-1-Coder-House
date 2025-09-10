import { Router } from 'express';
import { ProductModel } from '../models/product.model.js';
import { CartModel } from '../models/cart.model.js';

const router = Router();

// Crear carrito si no existe
async function getOrCreateCart() {
  let cart = await CartModel.findOne();
  if (!cart) cart = await CartModel.create({});
  return cart;
}

// Vista productos
router.get('/products', async (req, res) => {
  const products = await ProductModel.find().lean();
  const cart = await getOrCreateCart();

  res.render('products', {
    products,
    cartId: cart._id.toString()
  });
});

// Vista carrito
router.get('/carts/:cid', async (req, res) => {
  const cart = await CartModel.findById(req.params.cid).populate('products.product').lean();
  if (!cart) return res.status(404).send('Carrito no encontrado');
  res.render('cart', cart);
});

// Vista detalle producto
router.get('/products/:pid', async (req, res) => {
  const product = await ProductModel.findById(req.params.pid).lean();
  res.render('productDetail', { product });
});

export default router;
