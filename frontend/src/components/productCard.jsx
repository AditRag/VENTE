import { Link } from "react-router-dom";
import { useCart } from "../context/cartContext";
import { useAuth } from "../context/authContext";
import { useNavigate } from "react-router-dom";

export default function ProductCard({ product }) {
  const { addToCart }  = useCart();
  const { user }       = useAuth();
  const navigate       = useNavigate();
  const displayPrice   = product.discountPrice || product.price;
  const hasDiscount    = product.discountPrice && product.discountPrice < product.price;

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!user) return navigate("/login");
    await addToCart(product._id, 1);
  };

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="card-img-wrap">
        <img
          src={
            product.images?.[0]
              ? `${import.meta.env.VITE_API_URL?.replace("/api", "")}/images/${product.images[0]}`
              : "/placeholder.png"
          }
          alt={product.title}
          className="card-img"
        />
        {hasDiscount && (
          <span className="discount-badge">{product.discountPercent}% off</span>
        )}
      </div>

      <div className="card-body">
        <h3 className="card-title">{product.title}</h3>
        <p className="card-seller">{product.seller?.storeName || product.seller?.name}</p>

        <div className="card-price-row">
          <span className="card-price">₹{displayPrice.toLocaleString()}</span>
          {hasDiscount && (
            <span className="card-original">₹{product.price.toLocaleString()}</span>
          )}
        </div>

        <button className="btn-secondary card-btn" onClick={handleAdd}>
          Add to Cart
        </button>
      </div>
    </Link>
  );
}
