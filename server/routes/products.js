const router = require('express').Router();
const mongoose = require('mongoose');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const validId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ message: 'Invalid product id' });

// GET /api/products?search=&category=&page=&limit=   (public)
router.get('/', async (req, res, next) => {
  try {
    const { search, category } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);

    const filter = {};
    if (search) filter.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (category && category !== 'All') filter.category = category;

    const [products, total, categories] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(filter),
      Product.distinct('category'),
    ]);
    res.json({ products, total, page, pages: Math.ceil(total / limit), categories });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id   (public)
router.get('/:id', validId, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// POST /api/products   (admin)
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    err.status = 400;
    next(err);
  }
});

// PUT /api/products/:id   (admin)
router.put('/:id', protect, adminOnly, validId, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    err.status = 400;
    next(err);
  }
});

// DELETE /api/products/:id   (admin)
router.delete('/:id', protect, adminOnly, validId, async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
