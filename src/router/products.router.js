import { Router } from 'express';
import { ProductModel } from '../models/product.model.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const {
      limit = 10,
      page = 1,
      sort,
      query,
      category,
      status
    } = req.query;

    // Filtro
    const filter = {};

    if (query) {
      const [key, ...rest] = String(query).split(':');
      const value = rest.join(':');
      if (key && value !== undefined) {
        if (key === 'status') filter.status = value === 'true';
        else if (key === 'price') filter.price = Number(value);
        else filter[key] = value;
      }
    }
    if (category) filter.category = category;
    if (status !== undefined) filter.status = String(status) === 'true';

    // Orden
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

    const baseURL = `${req.protocol}://${req.get('host')}${req.baseUrl}`;
    const mkLink = (p) =>
      `${baseURL}?page=${p}&limit=${options.limit}` +
      (sort ? `&sort=${sort}` : '') +
      (query ? `&query=${encodeURIComponent(query)}` : '') +
      (category ? `&category=${encodeURIComponent(category)}` : '') +
      (status !== undefined ? `&status=${status}` : '');

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

// CRUD 
router.get('/:pid', async (req, res) => {
  try {
    const prod = await ProductModel.findById(req.params.pid).lean();
    if (!prod) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', payload: prod });
  } catch {
    res.status(400).json({ status: 'error', error: 'ID inválido' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, code, price, stock, category, description, status, thumbnails } = req.body;
    if (!title || !code || price == null || stock == null)
      return res.status(400).json({ status: 'error', error: 'Campos requeridos: title, code, price, stock' });

    const created = await ProductModel.create({
      title, code, price, stock,
      category, description, status, thumbnails
    });
    res.status(201).json({ status: 'success', payload: created });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    const updated = await ProductModel.findByIdAndUpdate(
      req.params.pid,
      req.body,
      { new: true, runValidators: true }
    ).lean();
    if (!updated) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', payload: updated });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    const del = await ProductModel.findByIdAndDelete(req.params.pid).lean();
    if (!del) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', payload: del });
  } catch {
    res.status(400).json({ status: 'error', error: 'ID inválido' });
  }
});

export default router;
