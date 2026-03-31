import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

export default function SignUp() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    role: "buyer", storeName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters");
    if (form.role === "seller" && !form.storeName)
      return setError("Store name is required for sellers");

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
        storeName: form.storeName,
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container auth-container">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="auth-sub">Join ShopCart today</p>

        {/* Role Toggle */}
        <div className="role-toggle">
          <button
            type="button"
            className={form.role === "buyer" ? "active" : ""}
            onClick={() => setForm((f) => ({ ...f, role: "buyer" }))}
          >
            Buyer
          </button>
          <button
            type="button"
            className={form.role === "seller" ? "active" : ""}
            onClick={() => setForm((f) => ({ ...f, role: "seller" }))}
          >
            Seller
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>Full Name</label>
          <input name="name" value={form.name} onChange={handleChange}
            placeholder="John Doe" required className="form-input" />

          <label>Email</label>
          <input type="email" name="email" value={form.email} onChange={handleChange}
            placeholder="you@example.com" required className="form-input" />

          {form.role === "seller" && (
            <>
              <label>Store Name</label>
              <input name="storeName" value={form.storeName} onChange={handleChange}
                placeholder="My Awesome Store" className="form-input" />
            </>
          )}

          <label>Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange}
            placeholder="Min. 6 characters" required className="form-input" />

          <label>Confirm Password</label>
          <input type="password" name="confirmPassword" value={form.confirmPassword}
            onChange={handleChange} placeholder="Repeat password" required className="form-input" />

          {error && <p className="error-msg">{error}</p>}

          <button type="submit" className="btn-primary full-width" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
