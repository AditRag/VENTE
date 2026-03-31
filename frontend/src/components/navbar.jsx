import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout }   = useAuth();
  const { cartCount }      = useCart();
  const navigate           = useNavigate();
  const [query, setQuery]  = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?search=${query.trim()}`);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">ShopCart</Link>

      <form onSubmit={handleSearch} className="nav-search">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products…"
        />
        <button type="submit">🔍</button>
      </form>

      <div className="nav-actions">
        <Link to="/search" className="nav-link">Browse</Link>

        {user ? (
          <>
            <Link to="/cart" className="nav-link cart-link">
              Cart {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
            <button 
              onClick={() => navigate("/profile")}
              className="btn-ghost"
              style={{ cursor: "pointer", padding: "0.5rem 1rem", borderRadius: "0.375rem" }}
            >
              Hi, {user.name.split(" ")[0]}
            </button>
            <button className="btn-ghost" onClick={() => { logout(); navigate("/"); }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login"  className="nav-link">Login</Link>
            <Link to="/signup" className="btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
