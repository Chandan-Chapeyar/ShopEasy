import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';

// Redirects to /login if not signed in; to / if the role is not allowed
function Guard({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="center">Loading...</p>;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<Guard><Checkout /></Guard>} />
          <Route path="/orders" element={<Guard><Orders /></Guard>} />
          <Route path="/orders/:id" element={<Guard><OrderDetail /></Guard>} />
          <Route path="/admin/products" element={<Guard role="admin"><AdminProducts /></Guard>} />
          <Route path="/admin/orders" element={<Guard role="admin"><AdminOrders /></Guard>} />
          <Route path="*" element={<p className="center">Page not found</p>} />
        </Routes>
      </main>
    </>
  );
}
