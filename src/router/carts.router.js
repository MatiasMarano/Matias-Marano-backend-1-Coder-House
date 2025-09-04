import { Router } from 'express';
import { CartModel } from '../models/cart.model.js';
import { ProductModel } from '../models/product.model.js';

const router = Router();

// Crear carrito
router.post('/', async (_req, res) => {
  const cart = await CartModel.create({});
  res.status(201).json({ status: 'success', payload: cart });
});

// Obtener carrito
router.get('/:cid', async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.cid)
      .populate('products.product')
      .lean();

    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch {
    res.status(400).json({ status: 'error', error: 'ID inválido' });
  }
});

// Agregar producto al carrito 
router.post('/:cid/product/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const [cart, prod] = await Promise.all([
      CartModel.findById(cid),
      ProductModel.findById(pid).lean()
    ]);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    if (!prod) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });

    const idx = cart.products.findIndex(p => p.product.toString() === pid);
    if (idx >= 0) cart.products[idx].quantity += 1;
    else cart.products.push({ product: pid, quantity: 1 });

    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

// DELETE
router.delete('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    cart.products = cart.products.filter(p => p.product.toString() !== pid);
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch {
    res.status(400).json({ status: 'error', error: 'ID inválido' });
  }
});

// PUT 
router.put('/:cid', async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body; 
  if (!Array.isArray(products))
    return res.status(400).json({ status: 'error', error: 'Se espera products: []' });

  try {
    // validar que los product ids existan
    const ids = products.map(p => p.product);
    const found = await ProductModel.find({ _id: { $in: ids } }, { _id: 1 }).lean();
    const foundSet = new Set(found.map(f => f._id.toString()));
    const invalid = ids.filter(id => !foundSet.has(String(id)));
    if (invalid.length) return res.status(400).json({ status: 'error', error: `IDs inválidos: ${invalid.join(', ')}` });

    const cart = await CartModel.findByIdAndUpdate(
      cid,
      { products: products.map(p => ({ product: p.product, quantity: p.quantity ?? 1 })) },
      { new: true, runValidators: true }
    );
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

// PUT 
router.put('/:cid/products/:pid', async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;
  if (!Number.isInteger(quantity) || quantity < 1)
    return res.status(400).json({ status: 'error', error: 'quantity debe ser un entero >= 1' });

  try {
    const cart = await CartModel.findById(cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });

    const idx = cart.products.findIndex(p => p.product.toString() === pid);
    if (idx < 0) return res.status(404).json({ status: 'error', error: 'Producto no está en el carrito' });

    cart.products[idx].quantity = quantity;
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

// DELETE
router.delete('/:cid', async (req, res) => {
  try {
    const cart = await CartModel.findById(req.params.cid);
    if (!cart) return res.status(404).json({ status: 'error', error: 'Carrito no encontrado' });
    cart.products = [];
    await cart.save();
    res.json({ status: 'success', payload: cart });
  } catch {
    res.status(400).json({ status: 'error', error: 'ID inválido' });
  }
});

export default router;
