const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDB = require("./db/index.js");

dotenv.config({ path: path.join(__dirname, "..", ".env") });
console.log("MONGO_URI:", process.env.MONGO_URI);


const app = express();

// Middlewares
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/images", express.static(path.join(__dirname, "images")));

// Routes
const authRoutes    = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes    = require("./routes/cart.routes");
const orderRoutes   = require("./routes/order.routes");

app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart",     cartRoutes);
app.use("/api/orders",   orderRoutes);

// Health check
app.get("/", (req, res) => res.json({ message: "ShopCart API is running 🛒" }));

// MongoDB connection

connectDB()
.then(()=>{

    app.on("error",(error)=>{
        console.log("ERRR: ", error);
        throw error
    })

    app.listen(process.env.PORT || 5000 ,()=>{
        console.log(`Server running`)
    })
})
.catch((err)=>{
    console.log("MongoDB db connection failed !!!")
})
