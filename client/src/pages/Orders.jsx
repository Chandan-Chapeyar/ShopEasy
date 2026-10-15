import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../api';
import StatusBadge from '../components/StatusBadge';

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/orders/mine').then(setOrders).catch((e) => setError(e.message));
  }, []);

  if (error) return <p className="alert">{error}</p>;
  if (!orders) return <p className="center">Loading...</p>;
  if (orders.length === 0) {
    return <div className="center"><h2>No orders yet</h2><Link to="/" className="btn">Start shopping</Link></div>;
  }

  return (
    <>
      <h1>My Orders</h1>
      <div className="card list">
        {orders.map((o) => (
          <Link to={`/orders/${o._id}`} className="order-row" key={o._id}>
            <div className="grow">
              <strong>#{o._id.slice(-6).toUpperCase()}</strong>
              <div className="muted">{new Date(o.createdAt).toLocaleDateString()} · {o.items.length} item(s)</div>
            </div>
            <StatusBadge status={o.status} />
            <strong>{money(o.totalPrice)}</strong>
          </Link>
        ))}
      </div>
    </>
  );
}
