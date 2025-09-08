import { Router } from 'express';
import { ProductModel } from '../models/product.model.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    // Filtro
    const filter = {};
    if (query) {
      const [key, ...rest] = query.split(':');
      const value = rest.join(':');
      if (key === 'category') filter.category = value;
      if (key === 'status') filter.status = value === 'true';
    }

    // Orden
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

    // Links
    const baseURL = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const mkLink = (p) =>
      `${baseURL}?page=${p}&limit=${options.limit}` +
      (sort ? `&sort=${sort}` : '') +
      (query ? `&query=${encodeURIComponent(query)}` : '');

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? mkLink(result.prevPage) : null,
      nextLink: result.hasNextPage ? mkLink(result.nextPage) : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', error: 'Error interno' });
  }
});

export default router;
