import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/cartContext.jsx";
import { useAuth } from "../context/authContext.jsx";
import API from "../utils/api.js";

export default function BuyNow() {
  const { cart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    zip: user?.address?.zip || "",
    country: user?.address?.country || "India",
    paymentMethod: "COD",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const shipping = cartTotal > 500 ? 0 : 49;
  const tax = Math.round(cartTotal * 0.05);
  const total = cartTotal + shipping + tax;

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleOrder = async () => {
    if (!form.street || !form.city || !form.zip)
      return setError("Please fill in all address fields");
    setLoading(true);
    try {
      const items = cart.map((i) => ({
        product: i.product._id,
        title: i.product.title,
        image: i.product.images?.[0] || "",
        price: i.product.discountPrice || i.product.price,
        quantity: i.quantity,
      }));
      await API.post("/api/orders", {
        items,
        shippingAddress: { street: form.street, city: form.city, state: form.state, zip: form.zip, country: form.country },
        paymentMethod: form.paymentMethod,
        totalPrice: total,
        shippingPrice: shipping,
        taxPrice: tax,
      });
      navigate("/", { state: { orderPlaced: true } });
    } catch (err) {
      setError(err.response?.data?.message || "Order failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <h1 className="page-title">Checkout</h1>
      <div className="checkout-layout">

        {/* Shipping Form */}
        <div className="checkout-form">
          <h3>Shipping Address</h3>
          {[
            { name: "street", placeholder: "Street address" },
            { name: "city", placeholder: "City" },
            { name: "state", placeholder: "State" },
            { name: "zip", placeholder: "ZIP / PIN code" },
            { name: "country", placeholder: "Country" },
          ].map(({ name, placeholder }) => (
            <input
              key={name}
              name={name}
              value={form[name]}
              onChange={handleChange}
              placeholder={placeholder}
              className="form-input"
            />
          ))}

          <h3 style={{ marginTop: "1.5rem" }}>Payment Method</h3>
          {["COD", "Card", "UPI"].map((m) => (
            <label key={m} className="radio-label">
              <input
                type="radio"
                name="paymentMethod"
                value={m}
                checked={form.paymentMethod === m}
                onChange={handleChange}
              />
              {m === "COD" ? "Cash on Delivery" : m}
            </label>
          ))}
        </div>

        {/* Order Summary */}
        <div className="cart-summary">
          <h3>Order Summary</h3>
          {cart.map((item) => (
            <div key={item.product._id} className="summary-item">
              <span>{item.product.title} × {item.quantity}</span>
              <span>₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}</span>
            </div>
          ))}
          <hr />
          <div className="summary-row"><span>Subtotal</span><span>₹{cartTotal.toLocaleString()}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? "Free" : `₹${shipping}`}</span></div>
          <div className="summary-row"><span>Tax (5%)</span><span>₹{tax}</span></div>
          <div className="summary-row total"><span>Total</span><span>₹{total.toLocaleString()}</span></div>

          {error && <p className="error-msg">{error}</p>}

          <button
            className="btn-primary full-width"
            onClick={handleOrder}
            disabled={loading || cart.length === 0}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </div>
      </div>
    </main>
  );
}
