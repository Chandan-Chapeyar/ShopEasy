const Order = require('../models/Order');
const Product = require('../models/Product');

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

// POST /api/orders  { items: [{ product, quantity }], shippingAddress, paymentMethod }
// Prices are always read from the database, never trusted from the client.
exports.create = async (req, res, next) => {
  const decremented = []; // for manual rollback if something fails midway
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const orderItems = [];
    let total = 0;

    for (const { product: id, quantity } of items) {
      const qty = parseInt(quantity);
      if (!qty || qty < 1) return res.status(400).json({ message: 'Invalid quantity' });

      // Atomic stock decrement: only succeeds if enough stock is available
      const product = await Product.findOneAndUpdate(
        { _id: id, stock: { $gte: qty } },
        { $inc: { stock: -qty } },
        { new: true }
      );
      if (!product) {
        await rollback(decremented);
        const exists = await Product.findById(id).select('name stock');
        return res.status(400).json({
          message: exists
            ? `Not enough stock for "${exists.name}" (available: ${exists.stock})`
            : 'A product in your cart no longer exists',
        });
      }
      decremented.push({ id: product._id, qty });
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: qty,
      });
      total += product.price * qty;
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalPrice: Math.round(total * 100) / 100,
    });
    res.status(201).json(order);
  } catch (err) {
    await rollback(decremented);
    next(err);
  }
};

async function rollback(list) {
  await Promise.all(list.map((d) => Product.updateOne({ _id: d.id }, { $inc: { stock: d.qty } })));
  list.length = 0;
}

// GET /api/orders/mine
exports.mine = async (req, res, next) => {
  try {
    res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }));
  } catch (err) {
    next(err);
  }
};

// GET /api/orders/:id  (owner or admin)
exports.get = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    const ownerId = order.user._id.toString();
    if (req.user.role !== 'admin' && ownerId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You do not have permission to view this order' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// GET /api/orders  (admin)
exports.all = async (req, res, next) => {
  try {
    res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 }));
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/status  (admin)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Restock when an order gets cancelled
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      await rollback(order.items.map((i) => ({ id: i.product, qty: i.quantity })));
    }
    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
};

// PUT /api/orders/:id/cancel  (owner, only while Pending)
exports.cancel = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not your order' });
    }
    if (order.status !== 'Pending') {
      return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    }
    await rollback(order.items.map((i) => ({ id: i.product, qty: i.quantity })));
    order.status = 'Cancelled';
    await order.save();
    res.json(order);
  } catch (err) {
    next(err);
  }
};
