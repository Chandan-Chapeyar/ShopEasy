import { Link, useNavigate } from 'react-router-dom';
import { money } from '../api';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { items, setQty, remove, total } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="center">
        <h2>Your cart is empty</h2>
        <Link to="/" className="btn">Continue shopping</Link>
      </div>
    );
  }

  return (
    <>
      <h1>Shopping Cart</h1>
      <div className="cart">
        <div className="card list">
          {items.map((i) => (
            <div className="cart-row" key={i._id}>
              <img src={i.image || 'https://placehold.co/100'} alt={i.name} />
              <div className="grow">
                <Link to={`/product/${i._id}`} className="title">{i.name}</Link>
                <div className="muted">{money(i.price)} each</div>
              </div>
              <input
                type="number" min="1" max={i.stock} value={i.quantity} className="qty"
                onChange={(e) => setQty(i._id, Number(e.target.value) || 1)}
              />
              <strong className="line-total">{money(i.price * i.quantity)}</strong>
              <button className="btn small danger-btn" onClick={() => remove(i._id)}>Remove</button>
            </div>
          ))}
        </div>
        <aside className="card summary">
          <h3>Order Summary</h3>
          <div className="row between"><span>Subtotal</span><strong>{money(total)}</strong></div>
          <div className="row between"><span>Shipping</span><span>Free</span></div>
          <hr />
          <div className="row between big"><span>Total</span><strong>{money(total)}</strong></div>
          <button className="btn full" onClick={() => navigate('/checkout')}>Proceed to checkout</button>
        </aside>
      </div>
    </>
  );
}
