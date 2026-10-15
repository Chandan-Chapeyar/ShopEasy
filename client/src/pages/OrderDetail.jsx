import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { api, money } from '../api';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';

const STEPS = ['Pending', 'Processing', 'Shipped', 'Delivered'];

export default function OrderDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  const load = () => api(`/orders/${id}`).then(setOrder).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [id]);

  const cancel = async () => {
    if (!confirm('Cancel this order?')) return;
    try { setOrder(await api(`/orders/${id}/cancel`, { method: 'PUT' })); } catch (e) { setError(e.message); }
  };

  if (error && !order) return <p className="alert">{error}</p>;
  if (!order) return <p className="center">Loading...</p>;

  const step = STEPS.indexOf(order.status);
  const a = order.shippingAddress;

  return (
    <>
      {state?.placed && <p className="success">Order placed successfully. Thank you!</p>}
      {error && <p className="alert">{error}</p>}
      <div className="row between">
        <h1>Order #{order._id.slice(-6).toUpperCase()}</h1>
        <StatusBadge status={order.status} />
      </div>

      {order.status === 'Cancelled' ? (
        <p className="alert">This order was cancelled.</p>
      ) : (
        <div className="tracker">
          {STEPS.map((s, i) => (
            <div key={s} className={`step ${i <= step ? 'done' : ''}`}><span>{i + 1}</span>{s}</div>
          ))}
        </div>
      )}

      <div className="cart">
        <div className="card list">
          {order.items.map((i) => (
            <div className="cart-row" key={i.product}>
              <img src={i.image || 'https://placehold.co/100'} alt={i.name} />
              <div className="grow">{i.name}<div className="muted">{money(i.price)} × {i.quantity}</div></div>
              <strong>{money(i.price * i.quantity)}</strong>
            </div>
          ))}
        </div>
        <aside className="card summary">
          <h3>Shipping to</h3>
          <p>{a.fullName}<br />{a.address}<br />{a.city} - {a.postalCode}<br />{a.phone}</p>
          <p className="muted">Payment: {order.paymentMethod}<br />Placed: {new Date(order.createdAt).toLocaleString()}</p>
          <hr />
          <div className="row between big"><span>Total</span><strong>{money(order.totalPrice)}</strong></div>
          {order.status === 'Pending' && order.user?._id === user?.id && (
            <button className="btn danger-btn full" onClick={cancel}>Cancel order</button>
          )}
        </aside>
      </div>
    </>
  );
}
