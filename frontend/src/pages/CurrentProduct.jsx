import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";
import { useCart } from "../context/cartContext.jsx";
import { useAuth } from "../context/authContext.jsx";

export default function CurrentProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  useEffect(() => {
    API.get(`/products/${id}`)
      .then((res) => { setProduct(res.data); setLoading(false); })
      .catch(() => navigate("/"));
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) return navigate("/login");
    try {
      await addToCart(product._id, quantity);
      setMessage("Added to cart ✓");
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!user) return navigate("/login");
    await addToCart(product._id, quantity);
    navigate("/buy-now");
  };

  if (loading) return <p className="container">Loading...</p>;
  if (!product) return null;

  const displayPrice = product.discountPrice || product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <main className="container">
      <div className="product-detail">
        {/* Image Gallery */}
        <div className="product-images">
          <img
            src={
              product.images?.[activeImg]
                ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}/images/${product.images[activeImg]}`
                : "/placeholder.png"
            }
            alt={product.title}
            className="main-image"
          />
          <div className="thumb-row">
            {product.images?.map((img, i) => (
              <img
                key={i}
                src={`${import.meta.env.VITE_API_URL?.replace("/api", "")}/images/${img}`}
                alt=""
                className={`thumb ${i === activeImg ? "active" : ""}`}
                onClick={() => setActiveImg(i)}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="product-info">
          <span className="badge">{product.category}</span>
          <h1>{product.title}</h1>
          <p className="seller-name">by {product.seller?.storeName || product.seller?.name}</p>

          <div className="price-row">
            <span className="price">₹{displayPrice.toLocaleString()}</span>
            {hasDiscount && (
              <>
                <span className="original-price">₹{product.price.toLocaleString()}</span>
                <span className="discount-badge">{product.discountPercent}% off</span>
              </>
            )}
          </div>

          <p className="stock">
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </p>

          <p className="description">{product.description}</p>

          {/* Quantity Selector */}
          <div className="quantity-row">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}>+</button>
          </div>

          {/* Actions */}
          <div className="action-row">
            <button
              className="btn-secondary"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              Add to Cart
            </button>
            <button
              className="btn-primary"
              onClick={handleBuyNow}
              disabled={product.stock === 0}
            >
              Buy Now
            </button>
          </div>

          {message && <p className="feedback-msg">{message}</p>}
        </div>
      </div>
    </main>
  );
}
