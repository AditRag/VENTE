import { useCart } from "../context/CartContext";
import { Link, useNavigate } from "react-router-dom";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0)
    return (
      <main className="container center">
        <h2>Your cart is empty</h2>
        <Link to="/" className="btn-primary">Start Shopping</Link>
      </main>
    );

  return (
    <main className="container">
      <h1 className="page-title">Your Cart</h1>
      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items">
          {cart.map((item) => {
            const p = item.product;
            const price = p?.discountPrice || p?.price || 0;
            return (
              <div key={p?._id} className="cart-card">
                <img
                  src={
                    p?.images?.[0]
                      ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}/images/${p.images[0]}`
                      : "/placeholder.png"
                  }
                  alt={p?.title}
                  className="cart-img"
                />
                <div className="cart-details">
                  <Link to={`/product/${p?._id}`} className="cart-title">{p?.title}</Link>
                  <p className="cart-price">₹{price.toLocaleString()}</p>

                  <div className="quantity-row">
                    <button onClick={() => updateQuantity(p._id, item.quantity - 1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(p._id, item.quantity + 1)}>+</button>
                  </div>
                </div>

                <div className="cart-right">
                  <p className="cart-subtotal">₹{(price * item.quantity).toLocaleString()}</p>
                  <button className="remove-btn" onClick={() => removeFromCart(p._id)}>
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{cartTotal.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{cartTotal > 500 ? "Free" : "₹49"}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{(cartTotal + (cartTotal > 500 ? 0 : 49)).toLocaleString()}</span>
          </div>
          <button className="btn-primary full-width" onClick={() => navigate("/buy-now")}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </main>
  );
}
