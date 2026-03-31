
import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import API from "../utils/api";
import SellerDashboard from "../components/SellerDashboard";
import AddressPaymentSettings from "../components/AddressPaymentSettings";
import "../styles/Profile.css";

export default function Profile() {
  const { user, logout, updateUser } = useAuth();
  const [activeSection, setActiveSection] = useState("account");
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (user?.storeName) {
      setStoreName(user.storeName);
      setStoreDescription(user.storeDescription || "");
    }
  }, [user]);

  // Fetch orders when needed
  useEffect(() => {
    if ((activeSection === "placed" || activeSection === "received") && orders.length === 0) {
      fetchOrders();
    }
  }, [activeSection]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await API.get("/orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleBecomeSeller = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!storeName.trim()) {
      return setError("Store name is required");
    }

    setLoading(true);
    try {
      const res = await API.put("/auth/become-seller", {
        storeName: storeName.trim(),
        storeDescription: storeDescription.trim()
      });
      setMessage(res.data.message);
      updateUser({
        role: res.data.user.role,
        storeName: res.data.user.storeName
      });
      setTimeout(() => {
        setMessage("");
        setActiveSection("account");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to become a seller");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <main className="container auth-container">
        <div className="auth-card profile-empty">
          <p>Please log in to view your profile.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container profile-container">
      <section className="section">
        <div className="profile-header">
          <h1>My Dashboard</h1>
          <p className="profile-subtext">Welcome back, {user.name}!</p>
        </div>

        {/* Circular Navigation Buttons */}
        <div className="circular-nav">
          <button
            className={`circular-btn ${activeSection === "account" ? "active" : ""}`}
            onClick={() => setActiveSection("account")}
            title="Account Information"
          >
            <span className="icon">👤</span>
            <span className="label">Account Info</span>
          </button>

          <button
            className={`circular-btn ${activeSection === "address" ? "active" : ""}`}
            onClick={() => setActiveSection("address")}
            title="Delivery Address"
          >
            <span className="icon">📍</span>
            <span className="label">Delivery Address</span>
          </button>

          <button
            className={`circular-btn ${activeSection === "payment" ? "active" : ""}`}
            onClick={() => setActiveSection("payment")}
            title="Payment Method"
          >
            <span className="icon">💳</span>
            <span className="label">Payment Method</span>
          </button>

          <button
            className={`circular-btn ${activeSection === "placed" ? "active" : ""}`}
            onClick={() => setActiveSection("placed")}
            title="Orders Placed"
          >
            <span className="icon">📦</span>
            <span className="label">Orders Placed</span>
          </button>

          <button
            className={`circular-btn ${activeSection === "received" ? "active" : ""}`}
            onClick={() => setActiveSection("received")}
            title="Orders Received"
          >
            <span className="icon">✓</span>
            <span className="label">Orders Received</span>
          </button>

          {user.role === "seller" && (
            <button
              className={`circular-btn ${activeSection === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveSection("dashboard")}
              title="Seller Dashboard"
            >
              <span className="icon">📊</span>
              <span className="label">Dashboard</span>
            </button>
          )}

          {user.role === "buyer" && (
            <button
              className={`circular-btn ${activeSection === "seller" ? "active" : ""}`}
              onClick={() => setActiveSection("seller")}
              title="Become a Seller"
            >
              <span className="icon">🏪</span>
              <span className="label">Become Seller</span>
            </button>
          )}

          <button
            className={`circular-btn ${activeSection === "support" ? "active" : ""}`}
            onClick={() => setActiveSection("support")}
            title="Customer Support"
          >
            <span className="icon">🎧</span>
            <span className="label">Customer Support</span>
          </button>
        </div>

        {/* Content Sections */}
        <div className="content-sections">
          {/* Account Information Section */}
          {activeSection === "account" && (
            <div className="profile-card">
              <h2>Account Information</h2>
              <div className="info-group">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Account Type:</strong> <span className={`badge ${user.role === 'seller' ? 'badge-seller' : 'badge-buyer'}`}>{user.role === 'seller' ? 'Seller' : 'Buyer'}</span></p>
                {user.role === "seller" && (
                  <>
                    <p><strong>Store Name:</strong> {user.storeName}</p>
                    <p><strong>Store Description:</strong> {user.storeDescription || "No description"}</p>
                  </>
                )}
              </div>
              <button
                onClick={logout}
                className="profile-btn profile-btn-secondary"
              >
                Logout
              </button>
            </div>
          )}

          {/* Delivery Address Section */}
          {activeSection === "address" && (
            <AddressPaymentSettings section="address" />
          )}

          {/* Payment Method Section */}
          {activeSection === "payment" && (
            <AddressPaymentSettings section="payment" />
          )}

          {/* Orders Placed Section */}
          {activeSection === "placed" && (
            <div className="profile-card">
              <h2>Orders Placed</h2>
              {ordersLoading ? (
                <p className="text-muted">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-muted">You haven't placed any orders yet.</p>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order._id} className="order-item">
                      <p><strong>Order ID:</strong> {order.orderId}</p>
                      <p><strong>Status:</strong> <span className="badge badge-info">{order.orderStatus}</span></p>
                      <p><strong>Amount:</strong> ₹{order.totalPrice}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Received Section */}
          {activeSection === "received" && user.role === "seller" && (
            <div className="profile-card">
              <h2>Orders Received</h2>
              {ordersLoading ? (
                <p className="text-muted">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-muted">You haven't received any orders yet.</p>
              ) : (
                <div className="orders-list">
                  {orders.map((order) => (
                    <div key={order._id} className="order-item">
                      <p><strong>Order ID:</strong> {order.orderId}</p>
                      <p><strong>Buyer:</strong> {order.buyer?.name || "Unknown"}</p>
                      <p><strong>Amount:</strong> ₹{order.totalPrice}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Seller Dashboard Section */}
          {activeSection === "dashboard" && user.role === "seller" && (
            <SellerDashboard />
          )}

          {activeSection === "received" && user.role === "buyer" && (
            <div className="profile-card">
              <h2>Orders Received</h2>
              <p className="text-muted">Only sellers can view received orders. Become a seller to track orders from your store.</p>
            </div>
          )}

          {/* Become Seller Section */}
          {activeSection === "seller" && user.role === "buyer" && (
            <div className="profile-card">
              <h2>Become a Seller</h2>
              <p className="text-muted">Start selling products on ShopCart today!</p>

              <form onSubmit={handleBecomeSeller} className="seller-form">
                <label>Store Name *</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="My Awesome Store"
                  required
                />

                <label>Store Description (Optional)</label>
                <textarea
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="Tell customers about your store..."
                  rows="4"
                />

                {error && <p className="error-msg">{error}</p>}
                {message && <p className="success-msg">{message}</p>}

                <button type="submit" className="profile-btn profile-btn-primary" disabled={loading}>
                  {loading ? "Upgrading..." : "Become a Seller"}
                </button>
              </form>
            </div>
          )}

          {/* Customer Support Section */}
          {activeSection === "support" && (
            <div className="profile-card">
              <h2>Customer Support</h2>
              <p className="text-muted">We're here to help! Reach out to us anytime.</p>

              <div className="support-section">
                <div className="support-channels">
                  <div className="support-channel-card">
                    <span className="support-icon">📧</span>
                    <h4>Email Us</h4>
                    <p>support@vente.com</p>
                  </div>
                  <div className="support-channel-card">
                    <span className="support-icon">📞</span>
                    <h4>Call Us</h4>
                    <p>+91 1800-123-4567</p>
                  </div>
                  <div className="support-channel-card">
                    <span className="support-icon">💬</span>
                    <h4>Live Chat</h4>
                    <p>Available 9 AM – 9 PM</p>
                  </div>
                </div>

                <div className="support-faq">
                  <h3>Frequently Asked Questions</h3>
                  <details className="faq-item">
                    <summary>How do I track my order?</summary>
                    <p>Go to "Orders Placed" in your dashboard to view the status of all your orders.</p>
                  </details>
                  <details className="faq-item">
                    <summary>How can I return a product?</summary>
                    <p>Contact us within 7 days of delivery via email or call, and we'll initiate the return process.</p>
                  </details>
                  <details className="faq-item">
                    <summary>How do I become a seller?</summary>
                    <p>Click the "Become Seller" tab in your dashboard and fill in your store details to get started.</p>
                  </details>
                  <details className="faq-item">
                    <summary>How do I update my payment method?</summary>
                    <p>Go to the "Payment Method" tab to add, remove, or set a default payment method.</p>
                  </details>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
