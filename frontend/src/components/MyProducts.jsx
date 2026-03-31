import { useState, useEffect } from "react";
import API from "../utils/api";
import ProductEditor from "./ProductEditor";
import "../styles/MyProducts.css";

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    setLoading(true);
    setError("");
    try {
      // Fetch all products (in real app, you'd have a dedicated endpoint for seller's products)
      const res = await API.get("/products?limit=100");
      setProducts(res.data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch products");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProductUpdated = (updatedProduct) => {
    setProducts(
      products.map((p) => (p._id === updatedProduct._id ? updatedProduct : p))
    );
    setEditingProductId(null);
  };

  const handleProductDeleted = () => {
    fetchMyProducts();
    setEditingProductId(null);
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="profile-card">
        <h2>My Products</h2>
        <p className="text-muted">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="my-products-container">
      <div className="profile-card">
        <div className="products-header">
          <h2>My Products</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  {product.images && product.images[0] ? (
                    <img
                      src={`http://localhost:5000/images/${product.images[0]}`}
                      alt={product.title}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/200?text=No+Image";
                      }}
                    />
                  ) : (
                    <div className="placeholder-image">No Image</div>
                  )}
                </div>

                <div className="product-details">
                  <h3>{product.title}</h3>
                  <p className="category">{product.category}</p>

                  <div className="price-section">
                    <span className="price">₹{product.price}</span>
                    {product.discountPrice && (
                      <>
                        <span className="discount-price">
                          ₹{product.discountPrice}
                        </span>
                        <span className="discount-badge">
                          {Math.round(
                            ((product.price - product.discountPrice) /
                              product.price) *
                              100
                          )}
                          % OFF
                        </span>
                      </>
                    )}
                  </div>

                  <div className="stock-section">
                    <span
                      className={`stock-badge ${
                        product.stock > 0 ? "in-stock" : "out-of-stock"
                      }`}
                    >
                      Stock: {product.stock}
                    </span>
                  </div>

                  <div className="product-actions">
                    <button
                      className="action-btn edit-btn"
                      onClick={() => setEditingProductId(product._id)}
                      title="Edit this product"
                    >
                      ✎ Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="profile-empty">
            <p>
              {searchQuery
                ? "No products match your search"
                : "You haven't added any products yet"}
            </p>
          </div>
        )}
      </div>

      {editingProductId && (
        <ProductEditor
          key={editingProductId}
          productId={editingProductId}
          onClose={() => setEditingProductId(null)}
          onProductUpdated={handleProductUpdated}
        />
      )}
    </div>
  );
}
