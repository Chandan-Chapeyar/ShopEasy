process.env.JWT_SECRET = 'test_secret';
const { test, before, after } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const User = require('../src/models/User');
const Product = require('../src/models/Product');

let mongod, server, base;
const call = async (method, path, body, token) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, data: await res.json() };
};

before(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  server = app.listen(0);
  base = `http://localhost:${server.address().port}/api`;
});

after(async () => {
  server.close();
  await mongoose.disconnect();
  await mongod.stop();
});

const address = { fullName: 'A B', address: '1 Street', city: 'Pune', postalCode: '411001', phone: '9999999999' };

test('full shopping flow with roles', async () => {
  // register + cannot self-assign admin
  const reg = await call('POST', '/auth/register', { name: 'Sam', email: 'sam@x.com', password: 'secret1', role: 'admin' });
  assert.equal(reg.status, 201);
  assert.equal(reg.data.user.role, 'user');
  const userToken = reg.data.token;

  // duplicate email + wrong login
  assert.equal((await call('POST', '/auth/register', { name: 'S', email: 'sam@x.com', password: 'secret1' })).status, 400);
  assert.equal((await call('POST', '/auth/login', { email: 'sam@x.com', password: 'nope' })).status, 401);
  assert.equal((await call('POST', '/auth/login', { email: 'sam@x.com', password: 'secret1' })).status, 200);

  // admin
  await User.create({ name: 'Boss', email: 'boss@x.com', password: 'admin123', role: 'admin' });
  const adminToken = (await call('POST', '/auth/login', { email: 'boss@x.com', password: 'admin123' })).data.token;

  // role-based access on products
  const payload = { name: 'Lamp', price: 10, stock: 5, category: 'Home' };
  assert.equal((await call('POST', '/products', payload)).status, 401);
  assert.equal((await call('POST', '/products', payload, userToken)).status, 403);
  const created = await call('POST', '/products', payload, adminToken);
  assert.equal(created.status, 201);
  const pid = created.data._id;

  // catalog
  const list = await call('GET', '/products?search=lam');
  assert.equal(list.data.total, 1);
  assert.equal((await call('GET', '/products/categories')).data[0], 'Home');

  // order: stock reduces, price from DB
  const order = await call('POST', '/orders', { items: [{ product: pid, quantity: 2 }], shippingAddress: address, totalPrice: 1 }, userToken);
  assert.equal(order.status, 201);
  assert.equal(order.data.totalPrice, 20);
  assert.equal((await Product.findById(pid)).stock, 3);

  // overselling blocked, stock untouched
  const over = await call('POST', '/orders', { items: [{ product: pid, quantity: 4 }], shippingAddress: address }, userToken);
  assert.equal(over.status, 400);
  assert.equal((await Product.findById(pid)).stock, 3);

  // order tracking
  assert.equal((await call('GET', '/orders/mine', null, userToken)).data.length, 1);
  assert.equal((await call('GET', '/orders', null, userToken)).status, 403);
  assert.equal((await call('GET', '/orders', null, adminToken)).data.length, 1);
  const upd = await call('PUT', `/orders/${order.data._id}/status`, { status: 'Shipped' }, adminToken);
  assert.equal(upd.data.status, 'Shipped');

  // cannot cancel once shipped
  assert.equal((await call('PUT', `/orders/${order.data._id}/cancel`, null, userToken)).status, 400);

  // another user's order is private
  const other = (await call('POST', '/auth/register', { name: 'O', email: 'o@x.com', password: 'secret1' })).data.token;
  assert.equal((await call('GET', `/orders/${order.data._id}`, null, other)).status, 403);

  // admin cancel restocks
  await call('PUT', `/orders/${order.data._id}/status`, { status: 'Cancelled' }, adminToken);
  assert.equal((await Product.findById(pid)).stock, 5);
});
