import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="brand">ShopEasy</Link>
        <nav>
          <NavLink to="/">Shop</NavLink>
          {user?.role === 'admin' && (
            <>
              <NavLink to="/admin/products">Manage Products</NavLink>
              <NavLink to="/admin/orders">All Orders</NavLink>
            </>
          )}
          {user && user.role !== 'admin' && <NavLink to="/orders">My Orders</NavLink>}
          <NavLink to="/cart">Cart{count > 0 && <span className="badge">{count}</span>}</NavLink>
          {user ? (
            <>
              <span className="muted hello">Hi, {user.name.split(' ')[0]}</span>
              <button className="btn small ghost" onClick={() => { logout(); navigate('/'); }}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <Link to="/register" className="btn small">Sign up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
