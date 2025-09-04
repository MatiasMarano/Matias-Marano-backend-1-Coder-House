import { Router } from 'express';
import { ProductModel } from '../models/product.model.js';
import { CartModel } from '../models/cart.model.js';

const router = Router();

// /products
router.get('/products', async (req, res) => {
  const { limit = 10, page = 1, sort, query, category, status } = req.query;

  const filter = {};
  if (query) {
    const [k, ...r] = String(query).split(':');
    const v = r.join(':');
    if (k && v !== undefined) {
      if (k === 'status') filter.status = v === 'true';
      else filter[k] = v;
    }
  }
  if (category) filter.category = category;
  if (status !== undefined) filter.status = String(status) === 'true';

  const sortOpt = {};
  if (sort === 'asc') sortOpt.price = 1;
  if (sort === 'desc') sortOpt.price = -1;

  const options = {
    limit: Number(limit) || 10,
    page: Number(page) || 1,
    sort: Object.keys(sortOpt).length ? sortOpt : undefined,
    lean: true
  };

  const result = await ProductModel.paginate(filter, options);

  const mkQS = (p) =>
    `?page=${p}&limit=${options.limit}` +
    (sort ? `&sort=${sort}` : '') +
    (query ? `&query=${encodeURIComponent(query)}` : '') +
    (category ? `&category=${encodeURIComponent(category)}` : '') +
    (status !== undefined ? `&status=${status}` : '');

  res.render('products', {
    title: 'Productos',
    products: result.docs,
    page: result.page,
    totalPages: result.totalPages,
    hasPrevPage: result.hasPrevPage,
    hasNextPage: result.hasNextPage,
    prevLink: result.hasPrevPage ? mkQS(result.prevPage) : null,
    nextLink: result.hasNextPage ? mkQS(result.nextPage) : null
  });
});

// Detalle de producto 
router.get('/products/:pid', async (req, res) => {
  const prod = await ProductModel.findById(req.params.pid).lean();
  if (!prod) return res.status(404).render('404', { title: 'No encontrado' });
  res.render('productDetail', { title: prod.title, product: prod });
});

// Vista carrito
router.get('/carts/:cid', async (req, res) => {
  const cart = await CartModel.findById(req.params.cid)
    .populate('products.product')
    .lean();

  if (!cart) return res.status(404).render('404', { title: 'Carrito no encontrado' });

  res.render('cart', {
    title: `Carrito ${cart._id}`,
    cart
  });
});

export default router;
