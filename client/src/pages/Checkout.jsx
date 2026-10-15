import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api, money } from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: user?.name || '', address: '', city: '', postalCode: '', phone: '', paymentMethod: 'COD',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (items.length === 0) return <Navigate to="/cart" replace />;

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { paymentMethod, ...shippingAddress } = form;
      const order = await api('/orders', {
        method: 'POST',
        body: {
          items: items.map((i) => ({ product: i._id, quantity: i.quantity })),
          shippingAddress,
          paymentMethod,
        },
      });
      clear();
      navigate(`/orders/${order._id}`, { state: { placed: true } });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h1>Checkout</h1>
      <div className="cart">
        <form className="card form" onSubmit={submit}>
          <h3>Shipping details</h3>
          {error && <p className="alert">{error}</p>}
          <label>Full name<input required value={form.fullName} onChange={set('fullName')} /></label>
          <label>Address<input required value={form.address} onChange={set('address')} /></label>
          <div className="row">
            <label className="grow">City<input required value={form.city} onChange={set('city')} /></label>
            <label className="grow">Postal code<input required value={form.postalCode} onChange={set('postalCode')} /></label>
          </div>
          <label>Phone<input required value={form.phone} onChange={set('phone')} /></label>
          <label>
            Payment method
            <select value={form.paymentMethod} onChange={set('paymentMethod')}>
              <option value="COD">Cash on delivery</option>
              <option value="Card">Card (demo, no real payment)</option>
            </select>
          </label>
          <button className="btn full" disabled={busy}>{busy ? 'Placing order...' : `Place order (${money(total)})`}</button>
        </form>
        <aside className="card summary">
          <h3>Your items</h3>
          {items.map((i) => (
            <div className="row between" key={i._id}>
              <span>{i.name} × {i.quantity}</span>
              <span>{money(i.price * i.quantity)}</span>
            </div>
          ))}
          <hr />
          <div className="row between big"><span>Total</span><strong>{money(total)}</strong></div>
        </aside>
      </div>
    </>
  );
}
