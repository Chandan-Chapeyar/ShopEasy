const Product = require('../models/Product');

// GET /api/products?search=&category=&page=&limit=&sort=
exports.list = async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 100);

    const filter = {};
    if (search) filter.name = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    if (category && category !== 'All') filter.category = category;

    const sortMap = {
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
      newest: { createdAt: -1 },
    };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortMap[sort] || { createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({ products, page, pages: Math.ceil(total / limit), total });
  } catch (err) {
    next(err);
  }
};

exports.categories = async (req, res, next) => {
  try {
    res.json(await Product.distinct('category'));
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

const pick = (body) => {
  const out = {};
  ['name', 'description', 'price', 'category', 'image', 'stock'].forEach((k) => {
    if (body[k] !== undefined) out[k] = body[k];
  });
  return out;
};

exports.create = async (req, res, next) => {
  try {
    res.status(201).json(await Product.create(pick(req.body)));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, pick(req.body), {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    next(err);
  }
};
