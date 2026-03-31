const multer = require("multer");
const path = require("path");

// ─── Global Error Handler ────────────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  console.error("💥 Error:", err.message);
    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({ message: `${field} already in use` });
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ message: messages.join(", ") });
    }

    // JWT error
    if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token" });
    }

    res.status(err.statusCode || 500).json({
        message: err.message || "Internal server error",
    });
}

// ─── Multer Image Upload ─────────────────────────────────────────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "images/"),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    ext && mime ? cb(null, true) : cb(new Error("Only image files are allowed"));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

module.exports = { errorHandler, upload };