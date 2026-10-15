import { useEffect, useState } from 'react';
import { api } from '../../api';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/orders').then(setOrders).catch((e) => setError(e.message));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const updated = await api(`/orders/${id}/status`, { method: 'PUT', body: { status } });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: updated.status } : o)));
    } catch (err) {
      setError(err.message);
    }
  };

  if (!orders) return <p>{error || 'Loading...'}</p>;

  return (
    <>
      <h1>Manage Orders</h1>
      {error && <p className="error">{error}</p>}
      <table>
        <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td>#{o._id.slice(-6).toUpperCase()}</td>
              <td>{o.user?.name}<br /><span className="muted">{o.user?.email}</span></td>
              <td>{o.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</td>
              <td>₹{o.totalPrice.toLocaleString('en-IN')}</td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td>
                <select value={o.status} onChange={(e) => updateStatus(o._id, e.target.value)}>
                  {STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
