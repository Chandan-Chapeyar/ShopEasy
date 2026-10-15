import { useEffect, useState } from 'react';
import { api } from '../../api';

const empty = { name: '', description: '', price: '', category: '', image: '', stock: '' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  const load = () => api('/products?limit=50').then((d) => setProducts(d.products)).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const body = { ...form, price: Number(form.price), stock: Number(form.stock) };
    try {
      if (editingId) await api('/products/' + editingId, { method: 'PUT', body });
      else await api('/products', { method: 'POST', body });
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

  const del = async (id) => {
    if (!confirm('Delete this product?')) return;
    try { await api('/products/' + id, { method: 'DELETE' }); load(); } catch (err) { setError(err.message); }
  };

  return (
    <>
      <h1>Manage Products</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={submit} className="form">
        <h3>{editingId ? 'Edit product' : 'Add product'}</h3>
        <input name="name" placeholder="Name" value={form.name} onChange={change} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={change} />
        <div className="row">
          <input name="price" type="number" min="0" placeholder="Price" value={form.price} onChange={change} required />
          <input name="stock" type="number" min="0" placeholder="Stock" value={form.stock} onChange={change} required />
          <input name="category" placeholder="Category" value={form.category} onChange={change} />
        </div>
        <input name="image" placeholder="Image URL" value={form.image} onChange={change} />
        <div className="row">
          <button className="btn">{editingId ? 'Update' : 'Add'}</button>
          {editingId && <button type="button" className="btn btn-outline" onClick={() => { setEditingId(null); setForm(empty); }}>Cancel</button>}
        </div>
      </form>

      <table>
        <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td><td>{p.category}</td><td>₹{p.price}</td><td>{p.stock}</td>
              <td className="row">
                <button className="btn btn-outline" onClick={() => edit(p)}>Edit</button>
                <button className="btn btn-danger" onClick={() => del(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
