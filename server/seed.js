// Run once:  npm run seed
// Creates an admin, a normal user, and sample products.
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');

const products = [
  { name: 'Wireless Headphones', description: 'Bluetooth over-ear headphones with 30h battery.', price: 2499, category: 'Electronics', stock: 25, image: 'https://picsum.photos/seed/headphones/400/300' },
  { name: 'Smart Watch', description: 'Fitness tracking, heart-rate monitor and notifications.', price: 3999, category: 'Electronics', stock: 15, image: 'https://picsum.photos/seed/watch/400/300' },
  { name: 'Mechanical Keyboard', description: 'RGB mechanical keyboard with blue switches.', price: 3299, category: 'Electronics', stock: 20, image: 'https://picsum.photos/seed/keyboard/400/300' },
  { name: 'Running Shoes', description: 'Lightweight breathable shoes for daily running.', price: 1899, category: 'Fashion', stock: 40, image: 'https://picsum.photos/seed/shoes/400/300' },
  { name: 'Cotton T-Shirt', description: '100% cotton, regular fit.', price: 499, category: 'Fashion', stock: 100, image: 'https://picsum.photos/seed/tshirt/400/300' },
  { name: 'Backpack', description: 'Water-resistant 25L laptop backpack.', price: 1299, category: 'Fashion', stock: 30, image: 'https://picsum.photos/seed/backpack/400/300' },
  { name: 'Coffee Mug Set', description: 'Set of 4 ceramic mugs.', price: 699, category: 'Home', stock: 50, image: 'https://picsum.photos/seed/mug/400/300' },
  { name: 'Desk Lamp', description: 'LED lamp with adjustable brightness.', price: 899, category: 'Home', stock: 35, image: 'https://picsum.photos/seed/lamp/400/300' },
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Promise.all([User.deleteMany({}), Product.deleteMany({})]);
    await User.create([
      { name: 'Admin', email: 'admin@shop.com', password: 'admin123', role: 'admin' },
      { name: 'Test User', email: 'user@shop.com', password: 'user123', role: 'user' },
    ]);
    await Product.insertMany(products);
    console.log('Seeded: admin@shop.com / admin123  |  user@shop.com / user123');
  } catch (e) {
    console.error(e);
  } finally {
    await mongoose.disconnect();
  }
})();
