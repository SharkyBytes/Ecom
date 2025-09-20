import e from "express";
import dotenv from "dotenv";
import { pool } from "./db/db.js";
import Redis from "ioredis";

dotenv.config();
import cancelRoutes from "./routes/cancel.js";

const app = e();

// Middleware
app.use(e.json());
app.use(e.urlencoded({ extended: true }));

// Routes
app.use("/api/cancel", cancelRoutes);

// Database connection test
const testDatabaseConnection = async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Database connected successfully:", result.rows[0]);
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

// Redis connection setup
const redisClient = new Redis(process.env.REDIS_URL);

redisClient.on("error", (error) => {
  console.error("Redis error:", error);
});

redisClient.on("connect", () => {
  console.log("Redis connected successfully");
});

// Start server
const startServer = async () => {
  try {
    await testDatabaseConnection();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
