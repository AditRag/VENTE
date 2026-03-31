const express = require("express");
const router  = express.Router();
const User    = require("../models/user.models");
const Product = require("../models/product.models");
const { protect } = require("../middleware/auth.middleware");

// All cart routes are protected
router.use(protect);

// GET /api/cart
router.get("/", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate("cart.product");
    res.json(user?.cart || []);
  } catch (err) { next(err); }
});

// POST /api/cart  — add item  { productId, quantity }
router.post("/", async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.stock < quantity)
      return res.status(400).json({ message: "Insufficient stock" });

    const user = await User.findById(req.user._id);
    const existing = user.cart?.find((i) => i.product.toString() === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      user.cart = [...(user.cart || []), { product: productId, quantity }];
    }
    await user.save();
    res.json(user.cart);
  } catch (err) { next(err); }
});

// PUT /api/cart/:productId  — update quantity  { quantity }
router.put("/:productId", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const item = user.cart?.find((i) => i.product.toString() === req.params.productId);
    if (!item) return res.status(404).json({ message: "Item not in cart" });
    item.quantity = req.body.quantity;
    if (item.quantity <= 0) user.cart = user.cart.filter((i) => i !== item);
    await user.save();
    res.json(user.cart);
  } catch (err) { next(err); }
});

// DELETE /api/cart/:productId
router.delete("/:productId", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.cart = (user.cart || []).filter(
      (i) => i.product.toString() !== req.params.productId
    );
    await user.save();
    res.json({ message: "Item removed from cart" });
  } catch (err) { next(err); }
});

module.exports = router;
