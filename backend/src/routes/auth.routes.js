const express  = require("express");
const router   = express.Router();
const jwt      = require("jsonwebtoken");
const User     = require("../models/user.models");
const { protect } = require("../middleware/auth.middleware");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

// POST /api/auth/register
router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, role, storeName } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, role, storeName });
    const token = signToken(user._id);

    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user._id);
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me  — get current logged-in user
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

// PUT /api/auth/become-seller  — upgrade buyer to seller
router.put("/become-seller", protect, async (req, res, next) => {
  try {
    const { storeName, storeDescription } = req.body;
    
    if (!storeName || storeName.trim() === "") {
      return res.status(400).json({ message: "Store name is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        role: "seller",
        storeName: storeName.trim(),
        storeDescription: storeDescription?.trim() || ""
      },
      { new: true }
    );

    res.json({
      message: "Successfully became a seller!",
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, storeName: user.storeName }
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/update-address  — update user address
router.put("/update-address", protect, async (req, res, next) => {
  try {
    const { street, city, state, pinCode, country } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        address: {
          street: street || "",
          city: city || "",
          state: state || "",
          pinCode: pinCode || "",
          country: country || ""
        }
      },
      { new: true }
    );

    res.json({
      message: "Address updated successfully",
      user
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/payment-method  — add payment method
router.post("/payment-method", protect, async (req, res, next) => {
  try {
    const { type, cardNumber, cardholderName, expiryMonth, expiryYear, cvv, upiId } = req.body;

    if (!type || !["card", "upi"].includes(type)) {
      return res.status(400).json({ message: "Invalid payment type" });
    }

    if (type === "card" && (!cardNumber || !cardholderName || !expiryMonth || !expiryYear || !cvv)) {
      return res.status(400).json({ message: "Card details are required" });
    }

    if (type === "upi" && !upiId) {
      return res.status(400).json({ message: "UPI ID is required" });
    }

    const newPaymentMethod = {
      type,
      cardNumber: type === "card" ? cardNumber.slice(-4).padStart(cardNumber.length, "*") : "",
      cardholderName: cardholderName || "",
      expiryMonth: expiryMonth || "",
      expiryYear: expiryYear || "",
      cvv: cvv ? cvv.slice(-2).padStart(cvv.length, "*") : "",
      upiId: type === "upi" ? upiId : "",
      isDefault: false
    };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { paymentMethods: newPaymentMethod } },
      { new: true }
    );

    res.json({
      message: "Payment method added successfully",
      user
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/auth/payment-method/:id  — delete payment method
router.delete("/payment-method/:id", protect, async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { paymentMethods: { _id: req.params.id } } },
      { new: true }
    );

    res.json({
      message: "Payment method deleted successfully",
      user
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/payment-method/default/:id  — set default payment method
router.put("/payment-method/default/:id", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Reset all to non-default
    user.paymentMethods.forEach(pm => pm.isDefault = false);
    
    // Set the selected one as default
    const paymentMethod = user.paymentMethods.id(req.params.id);
    if (paymentMethod) paymentMethod.isDefault = true;
    
    await user.save();
    
    res.json({
      message: "Default payment method updated",
      user
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
