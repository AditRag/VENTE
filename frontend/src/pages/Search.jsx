import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../utils/api.js";
import ProductCard from "../components/productCard.jsx";

const CATEGORIES = ["", "Lights", "Wires", "Cables", "Switch", "Plates", "Heaters", "Fans", "Geysers"];
const SORT_OPTIONS = [
  { label: "Newest", value: "-createdAt" },
  { label: "Price: Low–High", value: "price" },
  { label: "Price: High–Low", value: "-price" },
  { label: "Top Rated", value: "-ratings" },
];

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const query = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "-createdAt";

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ search: query, category, sort, page, limit: 12 });
    API.get(`/api/products?${params}`)
      .then((res) => {
        setProducts(res.data.products);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .finally(() => setLoading(false));
  }, [query, category, sort, page]);

  const update = (key, value) => {
    setSearchParams((prev) => { prev.set(key, value); return prev; });
    setPage(1);
  };

  return (
    <main className="container">
      <div className="search-layout">
        {/* Sidebar filters */}
        <aside className="filters">
          <h3>Filters</h3>
          <label>Category</label>
          <select value={category} onChange={(e) => update("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c || "All"}</option>)}
          </select>
          <label>Sort by</label>
          <select value={sort} onChange={(e) => update("sort", e.target.value)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </aside>

        {/* Results */}
        <div className="results">
          <div className="results-header">
            <input
              type="text"
              placeholder="Search products…"
              defaultValue={query}
              className="search-input"
              onKeyDown={(e) => e.key === "Enter" && update("search", e.target.value)}
            />
            <span className="results-count">{total} results</span>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : products.length === 0 ? (
            <p>No products found.</p>
          ) : (
            <div className="products-grid">
              {products.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div className="pagination">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={p === page ? "active" : ""}
                  onClick={() => setPage(p)}
                >{p}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
