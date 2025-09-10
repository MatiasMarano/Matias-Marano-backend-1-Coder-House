import { Router } from 'express';
import { ProductModel } from '../models/product.model.js';

const router = Router();

// Listar productos con filtros, paginación y ordenamiento
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

    res.json({
      status: 'success',
      payload: result.docs,
      totalPages: result.totalPages,
      prevPage: result.prevPage,
      nextPage: result.nextPage,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.hasPrevPage ? `/api/products?page=${result.prevPage}&limit=${limit}` : null,
      nextLink: result.hasNextPage ? `/api/products?page=${result.nextPage}&limit=${limit}` : null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', error: 'Error interno' });
  }
});

// Crear producto
router.post('/', async (req, res) => {
  try {
    const product = await ProductModel.create(req.body);
    res.status(201).json({ status: 'success', payload: product });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

// Obtener detalle de producto
router.get('/:pid', async (req, res) => {
  try {
    const product = await ProductModel.findById(req.params.pid).lean();
    if (!product) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', payload: product });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

// Actualizar producto
router.put('/:pid', async (req, res) => {
  try {
    const product = await ProductModel.findByIdAndUpdate(req.params.pid, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', payload: product });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

// Eliminar producto
router.delete('/:pid', async (req, res) => {
  try {
    const product = await ProductModel.findByIdAndDelete(req.params.pid);
    if (!product) return res.status(404).json({ status: 'error', error: 'Producto no encontrado' });
    res.json({ status: 'success', payload: product });
  } catch (err) {
    res.status(400).json({ status: 'error', error: err.message });
  }
});

export default router;
