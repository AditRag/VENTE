const mongoose = require("mongoose");
const dns = require("dns");
const DB_NAME = require("../constants.js");

// Workaround for Indian ISPs like Jio blocking SRV queries over TCP (port 53)
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is undefined. Check .env loading.");
        }

        const connectionInstance = await mongoose.connect(
            process.env.MONGO_URI,
            { dbName: DB_NAME }
        );

        console.log(`MongoDB connected !! HOST: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MongoDB connection failed :", error.message);
        process.exit(1);
    }
}; 
module.exports = connectDB;














