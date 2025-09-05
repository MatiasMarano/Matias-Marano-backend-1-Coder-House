import { Router } from 'express';
import { ProductModel } from '../models/product.model.js';
import { CartModel } from '../models/cart.model.js';

const router = Router();

// Mostrar todos los productos
router.get('/products', async (req, res) => {
  const { limit = 10, page = 1, sort, query } = req.query;
  const filter = {};

  if (query) {
    const [key, ...rest] = query.split(':');
    const value = rest.join(':');
    if (key === 'category') filter.category = value;
    if (key === 'status') filter.status = value === 'true';
  }

  const sortOpt = {};
  if (sort === 'asc') sortOpt.price = 1;
  if (sort === 'desc') sortOpt.price = -1;

  const options = {
    limit: Number(limit),
    page: Number(page),
    sort: Object.keys(sortOpt).length ? sortOpt : undefined,
    lean: true
  };

  const result = await ProductModel.paginate(filter, options);


  const cartId = 'defaultCartId';

  res.render('products', {
    products: result.docs,
    page: result.page,
    totalPages: result.totalPages,
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevPage: result.prevPage,
    nextPage: result.nextPage,
    limit,
    sort,
    query,
    cartId
  });
});

// Mostrar un producto específico
router.get('/products/:pid', async (req, res) => {
  const product = await ProductModel.findById(req.params.pid).lean();
  res.render('productDetail', { product });
});

// Mostrar carrito específico
router.get('/carts/:cid', async (req, res) => {
  const cart = await CartModel.findById(req.params.cid).populate('products.product').lean();
  if (!cart) return res.status(404).send('Carrito no encontrado');
  res.render('cart', cart);
});

export default router;
