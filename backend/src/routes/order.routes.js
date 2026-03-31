const express = require("express");
const router  = express.Router();
const Order   = require("../models/order.models");
const { protect, authorize } = require("../middleware/auth.middleware");

router.use(protect);

// GET /api/orders  — get orders for logged-in user
router.get("/", async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("items.product", "title images")
      .sort("-createdAt");
    res.json({ orders });
  } catch (err) { next(err); }
});

// POST /api/orders  — place order (buyers only)
router.post("/", async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, totalPrice, shippingPrice, taxPrice } = req.body;
    if (!items?.length) return res.status(400).json({ message: "No order items" });

    const order = await Order.create({
      buyer: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      totalPrice,
      shippingPrice,
      taxPrice,
    });
    res.status(201).json(order);
  } catch (err) { next(err); }
});

// GET /api/orders/my  — buyer sees own orders
router.get("/my", async (req, res, next) => {
  try {
    const orders = await Order.find({ buyer: req.user._id })
      .populate("items.product", "title images")
      .sort("-createdAt");
    res.json(orders);
  } catch (err) { next(err); }
});

// GET /api/orders/:id  — single order (owner or seller)
router.get("/:id", async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyer", "name email")
      .populate("items.product", "title images seller");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.buyer._id.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your order" });
    res.json(order);
  } catch (err) { next(err); }
});

// GET /api/orders/seller-dashboard — seller dashboard data
router.get("/seller/dashboard", async (req, res, next) => {
  try {
    // Get all orders (we'll filter by seller if needed)
    const allOrders = await Order.find()
      .populate("buyer", "name email")
      .populate("items.product", "title images seller");

    // Today's date (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Calculate today's orders
    const todayOrdersList = allOrders.filter(order => {
      const orderDate = new Date(order.createdAt);
      orderDate.setHours(0, 0, 0, 0);
      return orderDate.getTime() === today.getTime();
    });

    // Calculate pending orders
    const pendingOrdersList = allOrders.filter(
      order => order.orderStatus === "Pending " || order.orderStatus === "Pending"
    );

    // Calculate returns
    const returnsList = allOrders.filter(
      order => order.returnStatus && order.returnStatus !== "Not Requested"
    );

    // Calculate chart data (last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = allOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= date && orderDate < nextDate;
      });

      chartData.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        orders: dayOrders.length,
      });
    }

    res.json({
      todayOrders: todayOrdersList.length,
      pendingOrders: pendingOrdersList.length,
      returns: returnsList.length,
      todayOrdersList,
      pendingOrdersList,
      returnsList,
      chartData,
    });
  } catch (err) { next(err); }
});

module.exports = router;
