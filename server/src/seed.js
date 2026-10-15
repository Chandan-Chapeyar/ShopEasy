require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

const img = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=70`;

const products = [
  { name: 'Wireless Headphones', category: 'Electronics', price: 59.99, stock: 25, image: img('photo-1505740420928-5e560c06d30e'), description: 'Over-ear Bluetooth headphones with 30-hour battery life and deep bass.' },
  { name: 'Smart Watch', category: 'Electronics', price: 89.5, stock: 15, image: img('photo-1523275335684-37898b6baf30'), description: 'Fitness tracking, heart-rate monitor and notifications on your wrist.' },
  { name: 'Mechanical Keyboard', category: 'Electronics', price: 74.0, stock: 30, image: img('photo-1587829741301-dc798b83add3'), description: 'Tactile RGB mechanical keyboard with hot-swappable switches.' },
  { name: 'Running Shoes', category: 'Fashion', price: 64.99, stock: 40, image: img('photo-1542291026-7eec264c27ff'), description: 'Lightweight breathable running shoes with cushioned soles.' },
  { name: 'Classic Backpack', category: 'Fashion', price: 39.0, stock: 50, image: img('photo-1553062407-98eeb64c6a62'), description: 'Water-resistant 20L backpack with a padded laptop sleeve.' },
  { name: 'Sunglasses', category: 'Fashion', price: 24.99, stock: 60, image: img('photo-1572635196237-14b3f281503f'), description: 'UV400 polarized sunglasses with a durable frame.' },
  { name: 'Ceramic Coffee Mug', category: 'Home', price: 12.0, stock: 100, image: img('photo-1514228742587-6b1558fcf93a'), description: 'Hand-glazed 350ml mug, microwave and dishwasher safe.' },
  { name: 'Desk Lamp', category: 'Home', price: 28.5, stock: 35, image: img('photo-1507473885765-e6ed057f782c'), description: 'Adjustable LED desk lamp with three brightness levels.' },
  { name: 'Yoga Mat', category: 'Sports', price: 19.99, stock: 45, image: img('photo-1601925260368-ae2f83cf8b7f'), description: 'Non-slip 6mm yoga mat with carry strap.' },
  { name: 'Water Bottle', category: 'Sports', price: 15.0, stock: 80, image: img('photo-1602143407151-7111542de6e8'), description: 'Insulated stainless steel bottle, keeps drinks cold for 24h.' },
  { name: 'Novel: The Silent Sea', category: 'Books', price: 9.99, stock: 70, image: img('photo-1544947950-fa07a98d237f'), description: 'A gripping mystery set on a remote island.' },
  { name: 'JavaScript Handbook', category: 'Books', price: 29.0, stock: 20, image: img('photo-1516116216624-53e697fedbea'), description: 'Practical guide to modern JavaScript for web developers.' },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce');
  await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany()]);

  await User.create([
    { name: 'Admin', email: 'admin@shop.com', password: 'admin123', role: 'admin' },
    { name: 'Demo User', email: 'user@shop.com', password: 'user123', role: 'user' },
  ]);
  await Product.insertMany(products);

  console.log('Seeded: admin@shop.com / admin123  |  user@shop.com / user123');
  await mongoose.disconnect();
})();
