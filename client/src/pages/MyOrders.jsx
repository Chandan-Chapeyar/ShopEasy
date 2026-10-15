import { useEffect, useState } from 'react';
import { api } from '../api';

const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

export function StatusTracker({ status }) {
  if (status === 'Cancelled') return <span className="status cancelled">Cancelled</span>;
  const current = STEPS.indexOf(status);
  return (
    <div className="tracker">
      {STEPS.map((s, i) => (
        <span key={s} className={'step' + (i <= current ? ' done' : '')}>{s}</span>
      ))}
    </div>
  );
}

export default function MyOrders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/orders/mine').then(setOrders).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!orders) return <p>Loading...</p>;
  if (orders.length === 0) return <p>You have no orders yet.</p>;

  return (
    <>
      <h1>My Orders</h1>
      {orders.map((o) => (
        <div className="order" key={o._id}>
          <div className="line">
            <strong>Order #{o._id.slice(-6).toUpperCase()}</strong>
            <span className="muted">{new Date(o.createdAt).toLocaleString()}</span>
          </div>
          <StatusTracker status={o.status} />
          <ul>
            {o.items.map((i, idx) => <li key={idx}>{i.name} × {i.qty} — ₹{(i.price * i.qty).toLocaleString('en-IN')}</li>)}
          </ul>
          <p><strong>Total: ₹{o.totalPrice.toLocaleString('en-IN')}</strong> ({o.paymentMethod})</p>
        </div>
      ))}
    </>
  );
}
