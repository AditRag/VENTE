import { useState, useEffect } from "react";
import API from "../utils/api.js";
import "../styles/ProductEditor.css";

export default function ProductEditor({ productId, onClose, onProductUpdated }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    price: "",
    discountPrice: "",
    stock: "",
  });

  const categories = [
    "Lights",
    "Wires",
    "Cables",
    "Switch",
    "Plates",
    "Heaters",
    "Fans",
    "Geysers",
  ];

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/products/${productId}`);
      setProduct(res.data);
      setFormData({
        title: res.data.title,
        category: res.data.category,
        description: res.data.description,
        price: res.data.price,
        discountPrice: res.data.discountPrice,
        stock: res.data.stock,
      });
    } catch (err) {
      setError("Failed to load product details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const res = await API.put(`/products/${productId}`, formData);
      setMessage("Product updated successfully!");
      if (onProductUpdated) {
        onProductUpdated(res.data);
      }
      setTimeout(() => {
        setMessage("");
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    ) {
      try {
        await API.delete(`/products/${productId}`);
        setMessage("Product deleted successfully!");
        setTimeout(() => {
          setMessage("");
          onClose();
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete product");
      }
    }
  };

  if (loading) {
    return (
      <div className="product-editor-modal">
        <div className="modal-content">
          <p>Loading product details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-editor-modal" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Product</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {message && <div className="success-msg">{message}</div>}
        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSaveChanges} className="product-form">
          {/* Product Name */}
          <div className="form-group">
            <label>Product Name *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="LED Light Bulb"
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your product..."
              rows="4"
            />
          </div>

          {/* Price Row */}
          <div className="form-row">
            <div className="form-group">
              <label>Original Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="999"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Discounted Price (₹)</label>
              <input
                type="number"
                name="discountPrice"
                value={formData.discountPrice}
                onChange={handleInputChange}
                placeholder="799"
                min="0"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Stock Quantity *</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="100"
                min="0"
                required
              />
            </div>
          </div>

          {/* Discount % Display */}
          {formData.price && formData.discountPrice && (
            <div className="discount-display">
              <p>
                Discount:{" "}
                <strong>
                  {Math.round(
                    ((formData.price - formData.discountPrice) / formData.price) *
                    100
                  )}
                  %
                </strong>
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              type="submit"
              className="profile-btn profile-btn-primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              className="profile-btn profile-btn-danger"
              onClick={handleDeleteProduct}
              disabled={saving}
            >
              Delete Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
