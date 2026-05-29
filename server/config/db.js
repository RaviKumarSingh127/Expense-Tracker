const mongoose = require("mongoose");
const logger = require("./logger");

const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI;

  const connect = async (attempt = 1) => {
    try {
      const conn = await mongoose.connect(MONGO_URI, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      logger.info(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
      logger.error(`MongoDB connection attempt ${attempt} failed: ${err.message}`);
      if (attempt < 5) {
        const delay = Math.min(1000 * 2 ** attempt, 30000);
        logger.info(`Retrying in ${delay / 1000}s...`);
        setTimeout(() => connect(attempt + 1), delay);
      } else {
        logger.error("MongoDB connection failed after 5 attempts. Exiting.");
        process.exit(1);
      }
    }
  };

  await connect();

  mongoose.connection.on("disconnected", () => {
    logger.warn("MongoDB disconnected. Attempting reconnect...");
    connect();
  });
};

module.exports = connectDB;
