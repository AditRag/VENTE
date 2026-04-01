import { useState } from "react";
import API from "../utils/api.js";

export default function AddProduct() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "Lights",
    stock: "",
  });
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const categories = ["Lights", "Wires", "Cables", "Switch", "Plates", "Heaters", "Fans", "Geysers"];

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (images.length === 0) {
      setError("Please select at least one image.");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      images.forEach((img) => data.append("images", img));

      await API.post("/api/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Product added successfully!");
      setFormData({
        title: "",
        description: "",
        price: "",
        discountPrice: "",
        category: "Lights",
        stock: "",
      });
      setImages([]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-card">
      <h2>Add New Product</h2>
      <p className="text-muted">Fill out the details below to list a new product in your store.</p>

      <form onSubmit={handleSubmit} className="seller-form" encType="multipart/form-data">
        <label>Product Title *</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          placeholder="e.g. Havells 9W LED Bulb"
        />

        <label>Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          placeholder="Detailed description of the product..."
          rows="4"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label>Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              min="0"
              placeholder="0.00"
            />
          </div>
          <div>
            <label>Discount Price (₹)</label>
            <input
              type="number"
              name="discountPrice"
              value={formData.discountPrice}
              onChange={handleChange}
              min="0"
              placeholder="0.00"
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.95rem",
                marginBottom: "1rem"
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Stock Quantity *</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
              min="0"
              placeholder="10"
            />
          </div>
        </div>

        <label>Product Images * (Up to 5)</label>
        <input
          type="file"
          name="images"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          style={{ padding: "0.5rem", border: "1px dashed #3b82f6", backgroundColor: "#f0f4ff" }}
          required
        />
        <p className="text-muted" style={{ fontSize: "0.8rem", marginTop: "-0.5rem" }}>
          You selected {images.length} image(s).
        </p>

        {error && <p className="error-msg">{error}</p>}
        {success && <p className="success-msg">{success}</p>}

        <button type="submit" className="profile-btn profile-btn-primary" disabled={loading}>
          {loading ? "Adding Product..." : "Add Product"}
        </button>
      </form>
    </div>
  );
}
