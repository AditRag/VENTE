const express  = require("express");
const router   = express.Router();
const Product  = require("../models/product.models");
const { protect, authorize } = require("../middleware/auth.middleware");
const { upload } = require("../middleware/error.middleware");

// GET /api/products  — public, supports ?category=&search=&sort=&page=&limit=
router.get("/", async (req, res, next) => {
  try {
    const { category, search, sort = "-createdAt", page = 1, limit = 12 } = req.query;
    const query = {};
    if (category) query.category = category;
    if (search)   query.title = { $regex: search, $options: "i" };

    const total    = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate("seller", "name storeName")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
});

// GET /api/products/:id  — public
router.get("/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate("seller", "name storeName");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) { next(err); }
});

// POST /api/products  — sellers only
router.post(
  "/",
  protect,
  authorize("seller"),
  upload.array("images", 5),
  async (req, res, next) => {
    try {
      const images = req.files?.map((f) => f.filename) || [];
      const product = await Product.create({ ...req.body, seller: req.user._id, images });
      res.status(201).json(product);
    } catch (err) { next(err); }
  }
);

// PUT /api/products/:id  — seller who owns it
router.put(
  "/:id",
  protect,
  authorize("seller"),
  upload.array("images", 5),
  async (req, res, next) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      if (product.seller.toString() !== req.user._id.toString())
        return res.status(403).json({ message: "Not your product" });

      const newImages = req.files?.map((f) => f.filename) || product.images;
      Object.assign(product, { ...req.body, images: newImages });
      await product.save();
      res.json(product);
    } catch (err) { next(err); }
  }
);

// DELETE /api/products/:id  — seller who owns it
router.delete("/:id", protect, authorize("seller"), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    if (product.seller.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not your product" });
    await product.deleteOne();
    res.json({ message: "Product deleted" });
  } catch (err) { next(err); }
});

module.exports = router;
