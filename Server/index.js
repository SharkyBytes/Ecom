import e from "express";
import dotenv from "dotenv";
import { pool } from "./db/db.js";
import Redis from "ioredis";
import { createServer } from "http";
import cors from "cors";
import { initializeSocket } from "./socket.js";

dotenv.config();
import cancelRoutes from "./routes/cancel.js";
import flashDealsRoutes from "./routes/flash-deals.js";

const app = e();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);

// Middleware
app.use(cors());
app.use(e.json());
app.use(e.urlencoded({ extended: true }));

// Routes
app.use("/api/cancel", cancelRoutes);
app.use("/api/flash-deals", flashDealsRoutes);

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
    httpServer.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
      console.log(`Socket.IO server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
