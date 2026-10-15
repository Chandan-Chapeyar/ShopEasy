# ShopEasy: E-Commerce Web Application (MERN)

A full-stack online store with product management and order tracking.

**Stack:** React (Vite) · Node.js + Express · MongoDB (Mongoose) · JWT authentication

## Features

| Requirement | Implementation |
|---|---|
| Product catalog, add to cart, checkout | Search, category filter, sorting and pagination; cart saved in localStorage; checkout with shipping details |
| User login and role-based access | JWT login/register; `user` and `admin` roles enforced on the backend (`restrict('admin')`) and in the UI route guards |
| Backend APIs for product and order management | REST API (see below); admin CRUD for products; order status updates |
| Database integration | MongoDB with `User`, `Product`, `Order` models |

Extras: server-side price calculation (client prices are never trusted), atomic stock decrement so items cannot be oversold, restock on cancellation, order-tracking progress bar, order cancellation while Pending.

## Setup

Prerequisites: Node.js 18+ and MongoDB running locally (or a free MongoDB Atlas URI).

```bash
# 1. Backend
cd server
npm install
cp .env.example .env      # then edit JWT_SECRET (and MONGO_URI if using Atlas)
npm run seed              # creates demo users and 12 products
npm run dev               # API on http://localhost:5000

# 2. Frontend (new terminal)
cd client
npm install
npm run dev               # App on http://localhost:5173
```

Demo accounts (created by the seed script):

- Admin: `admin@shop.com` / `admin123`
- User: `user@shop.com` / `user123`

## Run the tests

```bash
cd server
npm test
```

The test uses an in-memory MongoDB and covers register/login, role restrictions, product search, order creation, stock handling, order privacy, status updates and restock on cancel.

## API reference

Base URL: `/api`. Send `Authorization: Bearer <token>` for protected routes.

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register` | public | Create account (always role `user`) |
| POST | `/auth/login` | public | Get JWT |
| GET | `/auth/me` | user | Current user |
| GET | `/products` | public | List (`search`, `category`, `sort`, `page`, `limit`) |
| GET | `/products/categories` | public | Category list |
| GET | `/products/:id` | public | Product details |
| POST | `/products` | admin | Create product |
| PUT | `/products/:id` | admin | Update product |
| DELETE | `/products/:id` | admin | Delete product |
| POST | `/orders` | user | Place order `{ items:[{product,quantity}], shippingAddress, paymentMethod }` |
| GET | `/orders/mine` | user | My orders |
| GET | `/orders/:id` | owner/admin | Order details |
| PUT | `/orders/:id/cancel` | owner | Cancel while Pending |
| GET | `/orders` | admin | All orders |
| PUT | `/orders/:id/status` | admin | Pending, Processing, Shipped, Delivered, Cancelled |

## Project structure

```
server/
  src/
    models/        User, Product, Order
    controllers/   auth, product, order logic
    middleware/    auth.js (protect, restrict), error.js
    routes/        route table
    app.js, server.js, seed.js
  tests/api.test.js
client/
  src/
    context/       AuthContext, CartContext
    components/    Navbar, ProductCard, StatusBadge
    pages/         Home, ProductDetail, Cart, Checkout, Login, Register,
                   Orders, OrderDetail, AdminProducts, AdminOrders
```

## Deployment notes

- Backend: Render/Railway; set `MONGO_URI` (MongoDB Atlas), `JWT_SECRET`, `CLIENT_URL`.
- Frontend: Vercel/Netlify; set `VITE_API_URL` to the deployed API URL + `/api`, then `npm run build`.
- To create more admins, change a user's `role` to `admin` in the database (registration never allows it).

## Possible improvements

Real payment gateway (Stripe/Razorpay), image uploads, product reviews, email notifications, input validation with a schema library.
