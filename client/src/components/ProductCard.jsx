import { Link } from 'react-router-dom';
import { money } from '../api';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { add } = useCart();
  const out = product.stock === 0;

  return (
    <div className="card product">
      <Link to={`/product/${product._id}`}>
        <img src={product.image || 'https://placehold.co/600x400?text=No+Image'} alt={product.name} loading="lazy" />
      </Link>
      <div className="card-body">
        <span className="tag">{product.category}</span>
        <Link to={`/product/${product._id}`} className="title">{product.name}</Link>
        <div className="row between">
          <strong>{money(product.price)}</strong>
          <span className={out ? 'danger' : 'muted'}>{out ? 'Out of stock' : `${product.stock} left`}</span>
        </div>
        <button className="btn" disabled={out} onClick={() => add(product)}>
          {out ? 'Unavailable' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}
