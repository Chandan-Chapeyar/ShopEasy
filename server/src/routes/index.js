const router = require('express').Router();
const { protect, restrict } = require('../middleware/auth');
const auth = require('../controllers/authController');
const products = require('../controllers/productController');
const orders = require('../controllers/orderController');

// Auth
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', protect, auth.me);

// Products (public read, admin write)
router.get('/products', products.list);
router.get('/products/categories', products.categories);
router.get('/products/:id', products.get);
router.post('/products', protect, restrict('admin'), products.create);
router.put('/products/:id', protect, restrict('admin'), products.update);
router.delete('/products/:id', protect, restrict('admin'), products.remove);

// Orders
router.post('/orders', protect, orders.create);
router.get('/orders/mine', protect, orders.mine);
router.get('/orders', protect, restrict('admin'), orders.all);
router.get('/orders/:id', protect, orders.get);
router.put('/orders/:id/cancel', protect, orders.cancel);
router.put('/orders/:id/status', protect, restrict('admin'), orders.updateStatus);

module.exports = router;
