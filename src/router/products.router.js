import { Router } from 'express';
import { ProductModel } from '../models/product.model.js';
import { CartModel } from '../models/cart.model.js';

const router = Router();

// Función para obtener o crear un carrito
async function getOrCreateCart() {
  let cart = await CartModel.findOne();
  if (!cart) cart = await CartModel.create({});
  return cart;
}

// Vista de productos
router.get('/', async (req, res) => {
  try {
    const products = await ProductModel.find().lean();
    const cart = await getOrCreateCart(); // <-- aseguramos cartId válido
    res.render('products', { products, cartId: cart._id.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar productos');
  }
});

export default router;
