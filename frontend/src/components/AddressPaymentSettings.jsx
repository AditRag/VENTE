import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext.jsx";
import API from "../utils/api.js";
import "../styles/AddressPaymentSettings.css";

export default function AddressPaymentSettings({ section }) {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [paymentType, setPaymentType] = useState("card");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Address form
  const [address, setAddress] = useState({
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    pinCode: user?.address?.pinCode || "",
    country: user?.address?.country || "",
  });

  // Payment form
  const [paymentForm, setPaymentForm] = useState({
    type: "card",
    cardNumber: "",
    cardholderName: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    upiId: "",
  });

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await API.put("/auth/update-address", address);
      setMessage("Address updated successfully!");
      updateUser(res.data.user);
      setIsEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update address");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPaymentMethod = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await API.post("/auth/payment-method", paymentForm);
      setMessage("Payment method added successfully!");
      updateUser(res.data.user);
      setPaymentForm({
        type: "card",
        cardNumber: "",
        cardholderName: "",
        expiryMonth: "",
        expiryYear: "",
        cvv: "",
        upiId: "",
      });
      setIsAddingPayment(false);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add payment method");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId) => {
    if (window.confirm("Are you sure you want to delete this payment method?")) {
      try {
        const res = await API.delete(`/auth/payment-method/${paymentMethodId}`);
        setMessage("Payment method deleted successfully!");
        updateUser(res.data.user);
        setTimeout(() => setMessage(""), 3000);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete payment method");
      }
    }
  };

  const handleSetDefaultPayment = async (paymentMethodId) => {
    try {
      const res = await API.put(`/auth/payment-method/default/${paymentMethodId}`);
      setMessage("Default payment method updated!");
      updateUser(res.data.user);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update default payment method");
    }
  };

  return (
    <div className="address-payment-container">
      {message && <div className="success-msg">{message}</div>}
      {error && <div className="error-msg">{error}</div>}

      {/* Address Section */}
      {section === "address" && (
        <div className="profile-card">
          <div className="card-header">
            <h3>📍 Delivery Address</h3>
            <button
              className="edit-btn"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit"}
            </button>
          </div>

          {!isEditing ? (
            <div className="address-display">
              {address.street ||
                address.city ||
                address.state ||
                address.pinCode ? (
                <p>
                  {address.street && <span>{address.street}, </span>}
                  {address.city && <span>{address.city}, </span>}
                  {address.state && <span>{address.state} </span>}
                  {address.pinCode && <span>- {address.pinCode}</span>}
                  {address.country && <span>, {address.country}</span>}
                </p>
              ) : (
                <p className="text-muted">No address saved. Click Edit to add one.</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleSaveAddress} className="address-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Street Address *</label>
                  <input
                    type="text"
                    name="street"
                    value={address.street}
                    onChange={handleAddressChange}
                    placeholder="123 Main Street"
                  />
                </div>
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
                    placeholder="Mumbai"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={address.state}
                    onChange={handleAddressChange}
                    placeholder="Maharashtra"
                  />
                </div>
                <div className="form-group">
                  <label>Pin Code *</label>
                  <input
                    type="text"
                    name="pinCode"
                    value={address.pinCode}
                    onChange={handleAddressChange}
                    placeholder="400001"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Country *</label>
                <input
                  type="text"
                  name="country"
                  value={address.country}
                  onChange={handleAddressChange}
                  placeholder="India"
                />
              </div>

              <button
                type="submit"
                className="profile-btn profile-btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Address"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Payment Methods Section */}
      {section === "payment" && (
        <div className="profile-card">
          <div className="card-header">
            <h3>💳 Payment Methods</h3>
            <button
              className="add-btn"
              onClick={() => setIsAddingPayment(!isAddingPayment)}
            >
              {isAddingPayment ? "Cancel" : "+ Add Payment"}
            </button>
          </div>

          {!isAddingPayment ? (
            <div className="payment-methods">
              {user?.paymentMethods && user.paymentMethods.length > 0 ? (
                user.paymentMethods.map((method) => (
                  <div key={method._id} className="payment-card">
                    <div className="payment-info">
                      <div className="payment-type">
                        {method.type === "card" ? (
                          <>
                            <span className="badge-card">💳 Card</span>
                            <p className="payment-details">
                              {method.cardholderName} • {method.cardNumber}
                            </p>
                            <p className="payment-expiry">
                              Expires: {method.expiryMonth}/{method.expiryYear}
                            </p>
                          </>
                        ) : (
                          <>
                            <span className="badge-upi">📱 UPI</span>
                            <p className="payment-details">{method.upiId}</p>
                          </>
                        )}
                      </div>
                      {method.isDefault && (
                        <span className="badge-default">Default</span>
                      )}
                    </div>

                    <div className="payment-actions">
                      {!method.isDefault && (
                        <button
                          className="action-btn primary"
                          onClick={() => handleSetDefaultPayment(method._id)}
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        className="action-btn danger"
                        onClick={() => handleDeletePaymentMethod(method._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No payment methods saved yet.</p>
              )}
            </div>
          ) : (
            <form onSubmit={handleAddPaymentMethod} className="payment-form">
              <div className="form-group">
                <label>Payment Type *</label>
                <select
                  name="type"
                  value={paymentForm.type}
                  onChange={handlePaymentChange}
                  className="form-select"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="upi">UPI</option>
                </select>
              </div>

              {paymentForm.type === "card" ? (
                <>
                  <div className="form-group">
                    <label>Cardholder Name *</label>
                    <input
                      type="text"
                      name="cardholderName"
                      value={paymentForm.cardholderName}
                      onChange={handlePaymentChange}
                      placeholder="Jai Shree Ram"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Card Number *</label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentForm.cardNumber}
                      onChange={handlePaymentChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Month *</label>
                      <input
                        type="text"
                        name="expiryMonth"
                        value={paymentForm.expiryMonth}
                        onChange={handlePaymentChange}
                        placeholder="MM"
                        maxLength="2"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Expiry Year *</label>
                      <input
                        type="text"
                        name="expiryYear"
                        value={paymentForm.expiryYear}
                        onChange={handlePaymentChange}
                        placeholder="YY"
                        maxLength="2"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV *</label>
                      <input
                        type="password"
                        name="cvv"
                        value={paymentForm.cvv}
                        onChange={handlePaymentChange}
                        placeholder="***"
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label>UPI ID *</label>
                  <input
                    type="text"
                    name="upiId"
                    value={paymentForm.upiId}
                    onChange={handlePaymentChange}
                    placeholder="yourname@upi"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                className="profile-btn profile-btn-primary"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Payment Method"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
