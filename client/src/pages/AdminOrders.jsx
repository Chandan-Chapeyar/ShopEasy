import { useEffect, useState } from 'react';
import { api, money } from '../api';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api('/orders').then(setOrders).catch((e) => setError(e.message));
  }, []);

  const changeStatus = async (id, status) => {
    try {
      const updated = await api(`/orders/${id}/status`, { method: 'PUT', body: { status } });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status: updated.status } : o)));
    } catch (err) {
      setError(err.message);
    }
  };

  if (!orders) return <p className="center">{error || 'Loading...'}</p>;

  return (
    <>
      <h1>All Orders</h1>
      {error && <p className="alert">{error}</p>}
      <div className="card table-wrap">
        <table>
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>#{o._id.slice(-6).toUpperCase()}</td>
                <td>{o.user?.name}<div className="muted">{o.user?.email}</div></td>
                <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                <td>{o.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}</td>
                <td>{money(o.totalPrice)}</td>
                <td>
                  <select value={o.status} onChange={(e) => changeStatus(o._id, e.target.value)}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="center">No orders yet.</p>}
      </div>
    </>
  );
}
