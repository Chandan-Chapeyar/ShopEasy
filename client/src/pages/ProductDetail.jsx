import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api, money } from '../api';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    api(`/products/${id}`).then(setProduct).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="alert">{error}</p>;
  if (!product) return <p className="center">Loading...</p>;
  const out = product.stock === 0;

  return (
    <div className="detail">
      <img src={product.image || 'https://placehold.co/600x400?text=No+Image'} alt={product.name} />
      <div>
        <span className="tag">{product.category}</span>
        <h1>{product.name}</h1>
        <h2>{money(product.price)}</h2>
        <p>{product.description}</p>
        <p className={out ? 'danger' : 'muted'}>{out ? 'Out of stock' : `${product.stock} in stock`}</p>
        {!out && (
          <div className="row">
            <input
              type="number" min="1" max={product.stock} value={qty} className="qty"
              onChange={(e) => setQty(Math.max(1, Math.min(Number(e.target.value) || 1, product.stock)))}
            />
            <button className="btn" onClick={() => add(product, qty)}>Add to cart</button>
            <button className="btn ghost" onClick={() => { add(product, qty); navigate('/cart'); }}>Buy now</button>
          </div>
        )}
      </div>
    </div>
  );
}
