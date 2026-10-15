import { useEffect, useState } from 'react';
import { api, money } from '../api';

const empty = { name: '', description: '', price: '', category: '', image: '', stock: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/products?limit=100').then((d) => setProducts(d.products)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
      await api(editingId ? `/products/${editingId}` : '/products', { method: editingId ? 'PUT' : 'POST', body });
      setForm(empty);
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const edit = (p) => {
    setEditingId(p._id);
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, image: p.image, stock: p.stock });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try { await api(`/products/${p._id}`, { method: 'DELETE' }); load(); } catch (err) { setError(err.message); }
  };

  return (
    <>
      <h1>Manage Products</h1>
      {error && <p className="alert">{error}</p>}
      <form className="card form" onSubmit={submit}>
        <h3>{editingId ? 'Edit product' : 'Add new product'}</h3>
        <div className="row wrap">
          <label className="grow">Name<input required value={form.name} onChange={set('name')} /></label>
          <label className="grow">Category<input value={form.category} onChange={set('category')} placeholder="e.g. Electronics" /></label>
        </div>
        <div className="row wrap">
          <label className="grow">Price ($)<input type="number" min="0" step="0.01" required value={form.price} onChange={set('price')} /></label>
          <label className="grow">Stock<input type="number" min="0" required value={form.stock} onChange={set('stock')} /></label>
        </div>
        <label>Image URL<input value={form.image} onChange={set('image')} /></label>
        <label>Description<textarea rows="3" value={form.description} onChange={set('description')} /></label>
        <div className="row">
          <button className="btn">{editingId ? 'Save changes' : 'Add product'}</button>
          {editingId && <button type="button" className="btn ghost" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</button>}
        </div>
      </form>

      <div className="card table-wrap">
        <table>
          <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td><img className="thumb" src={p.image || 'https://placehold.co/60'} alt="" /></td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{money(p.price)}</td>
                <td className={p.stock === 0 ? 'danger' : ''}>{p.stock}</td>
                <td className="actions">
                  <button className="btn small ghost" onClick={() => edit(p)}>Edit</button>
                  <button className="btn small danger-btn" onClick={() => remove(p)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
