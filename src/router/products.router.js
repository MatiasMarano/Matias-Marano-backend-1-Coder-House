import { Router } from 'express';
import { ProductModel } from '../models/product.model.js';
import { CartModel } from '../models/cart.model.js';

const router = Router();

// Obtener o crear carrito
async function getOrCreateCart() {
  let cart = await CartModel.findOne();
  if (!cart) cart = await CartModel.create({});
  return cart;
}

// Vista productos con paginación y filtros
router.get('/', async (req, res) => {
  try {
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

    const cart = await getOrCreateCart();

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
      cartId: cart._id.toString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar productos');
  }
});

// Vista detalle de un producto
router.get('/:pid', async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.pid).lean();
    if (!product) return res.status(404).send('Producto no encontrado');

    const cart = await getOrCreateCart();

    res.render('productDetail', {
      product,
      cartId: cart._id.toString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar detalle de producto');
  }
});


export default router;
