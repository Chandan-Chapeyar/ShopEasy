const router = require('express').Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

// POST /api/orders   (logged-in user) - checkout
// Body: { items: [{ product, qty }], shippingAddress, paymentMethod }
// Prices are always read from the DB, never trusted from the client.
router.post('/', protect, async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const orderItems = [];
    let total = 0;
    for (const it of items) {
      const qty = parseInt(it.qty);
      if (!mongoose.isValidObjectId(it.product) || !(qty > 0)) {
        return res.status(400).json({ message: 'Invalid cart item' });
      }
      const product = await Product.findById(it.product);
      if (!product) return res.status(404).json({ message: 'A product in your cart no longer exists' });
      if (product.stock < qty) {
        return res.status(400).json({ message: `Only ${product.stock} left of "${product.name}"` });
      }
      orderItems.push({ product: product._id, name: product.name, price: product.price, qty });
      total += product.price * qty;
    }

    // Reduce stock only after every item is validated
    for (const it of orderItems) {
      await Product.updateOne({ _id: it.product }, { $inc: { stock: -it.qty } });
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod === 'Card' ? 'Card' : 'COD',
      totalPrice: Math.round(total * 100) / 100,
    });
    res.status(201).json(order);
  } catch (err) {
    err.status = err.name === 'ValidationError' ? 400 : 500;
    next(err);
  }
});

// GET /api/orders/mine   (logged-in user) - order tracking
router.get('/mine', protect, async (req, res, next) => {
  try {
    res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
  } catch (err) {
    next(err);
  }
});

// GET /api/orders   (admin) - all orders
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 }));
  } catch (err) {
    next(err);
  }
});

// PUT /api/orders/:id/status   (admin) - update tracking status
router.put('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid order id' });
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
