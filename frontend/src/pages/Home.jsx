import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import ProductCard from "../components/ProductCard";

const CATEGORIES = ["Lights", "Wires", "Cables", "Switch", "Plates", "Heaters", "Fans", "Geysers"];

export default function Home() {
  const [featured, setFeatured]   = useState([]);
  const [products, setProducts]   = useState([]);
  const [selected, setSelected]   = useState("");
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    API.get("/products?limit=8&sort=-createdAt").then((res) => {
      setProducts(res.data.products);
      setLoading(false);
    });
    API.get("/products?isFeatured=true&limit=4").then((res) =>
      setFeatured(res.data.products)
    );
  }, []);

  const handleCategory = (cat) => {
    setSelected(cat === selected ? "" : cat);
  };

  return (
    <main className="container">
      {/* Hero */}
      <section className="hero">
        <h1>Shop Everything,<br />Delivered Fast</h1>
        <p>Discover thousands of products from verified sellers.</p>
        <Link to="/search" className="btn-primary">Browse All Products →</Link>
      </section>

      {/* Categories */}
      <section className="section">
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              to={`/search?category=${cat}`}
              className={`category-chip ${selected === cat ? "active" : ""}`}
              onClick={() => handleCategory(cat)}
            >
              {cat}
            </Link>
          ))}
        </div>
      </section>

      {/* Latest Products */}
      <section className="section">
        <h2 className="section-title">New Arrivals</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="products-grid">
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </section>
    </main>
  );
}
