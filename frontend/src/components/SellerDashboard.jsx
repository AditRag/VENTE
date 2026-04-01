import { useState, useEffect } from "react";
import API from "../utils/api.js";
import MyProducts from "./MyProducts.jsx";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "../styles/SellerDashboard.css";

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dashboardData, setDashboardData] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    returns: 0,
    chartData: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderDetails, setOrderDetails] = useState({
    today: [],
    pending: [],
    returns: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/api/orders/seller/dashboard");
      if (res.data) {
        setDashboardData(res.data);
        setOrderDetails({
          today: res.data.todayOrdersList || [],
          pending: res.data.pendingOrdersList || [],
          returns: res.data.returnsList || [],
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to fetch dashboard data. Please refresh."
      );
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-card">
        <h2>Seller Dashboard</h2>
        <p className="text-muted">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-card">
        <h2>Seller Dashboard</h2>
        <div className="error-msg">{error}</div>
        <button
          onClick={fetchDashboardData}
          className="profile-btn profile-btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="seller-dashboard">
      {/* Dashboard Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          onClick={() => setActiveTab("overview")}
        >
          📊 Overview
        </button>
        <button
          className={`tab-btn ${activeTab === "products" ? "active" : ""}`}
          onClick={() => setActiveTab("products")}
        >
          📦 My Products
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <>
          {/* KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon">📦</div>
              <div className="kpi-content">
                <p className="kpi-label">Today's Orders</p>
                <p className="kpi-value">{dashboardData.todayOrders}</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">⏳</div>
              <div className="kpi-content">
                <p className="kpi-label">Pending Orders</p>
                <p className="kpi-value">{dashboardData.pendingOrders}</p>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon">↩️</div>
              <div className="kpi-content">
                <p className="kpi-label">Returns</p>
                <p className="kpi-value">{dashboardData.returns}</p>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="charts-section">
            <div className="profile-card">
              <h3>Orders Trend</h3>
              {dashboardData.chartData && dashboardData.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={dashboardData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Orders"
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted">No chart data available</p>
              )}
            </div>
          </div>

          {/* Today's Orders */}
          <div className="profile-card">
            <h3>Orders Received Today</h3>
            {orderDetails.today.length > 0 ? (
              <div className="orders-list">
                {orderDetails.today.map((order) => (
                  <div key={order._id} className="order-item">
                    <p>
                      <strong>Order ID:</strong> {order.orderId}
                    </p>
                    <p>
                      <strong>Buyer:</strong> {order.buyer?.name || "Unknown"}
                    </p>
                    <p>
                      <strong>Amount:</strong> ₹{order.totalPrice}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className="badge badge-info">{order.orderStatus}</span>
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No orders received today</p>
            )}
          </div>

          {/* Pending Orders */}
          <div className="profile-card">
            <h3>Pending Orders</h3>
            {orderDetails.pending.length > 0 ? (
              <div className="orders-list">
                {orderDetails.pending.map((order) => (
                  <div key={order._id} className="order-item order-pending">
                    <p>
                      <strong>Order ID:</strong> {order.orderId}
                    </p>
                    <p>
                      <strong>Buyer:</strong> {order.buyer?.name || "Unknown"}
                    </p>
                    <p>
                      <strong>Items:</strong> {order.items?.length || 0}
                    </p>
                    <p>
                      <strong>Amount:</strong> ₹{order.totalPrice}
                    </p>
                    <p>
                      <strong>Order Date:</strong>{" "}
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No pending orders</p>
            )}
          </div>

          {/* Returns */}
          <div className="profile-card">
            <h3>Return Requests</h3>
            {orderDetails.returns.length > 0 ? (
              <div className="orders-list">
                {orderDetails.returns.map((order) => (
                  <div key={order._id} className="order-item order-return">
                    <p>
                      <strong>Order ID:</strong> {order.orderId}
                    </p>
                    <p>
                      <strong>Buyer:</strong> {order.buyer?.name || "Unknown"}
                    </p>
                    <p>
                      <strong>Return Status:</strong>{" "}
                      <span className="badge badge-warning">
                        {order.returnStatus}
                      </span>
                    </p>
                    <p>
                      <strong>Reason:</strong> {order.returnReason || "No reason provided"}
                    </p>
                    <p>
                      <strong>Amount:</strong> ₹{order.totalPrice}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No return requests</p>
            )}
          </div>
        </>
      )}

      {/* Products Tab */}
      {activeTab === "products" && <MyProducts />}
    </div>
  );
}
