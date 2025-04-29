import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { testConnection } from "./db/connection.js";
import db, { initializeDatabase } from "./db/initModels.js";
import flightRoutes from "./routes/flightRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Basic Route
app.get("/", (req, res) => {
  res.send("Airline Reservation Backend API");
});

// Test database connection
app.get("/api/test-db", async (req, res) => {
  try {
    const result = await db.sequelize.query("SELECT NOW() as current_time");
    res.json({
      status: "success",
      message: "Database connection successful",
      timestamp: (result[0][0] as { current_time: Date }).current_time,
    });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
    });
  }
});

// API Routes
app.use("/api/flights", flightRoutes);
app.use("/api/users", userRoutes);
// TODO: Add reservation routes

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({
      status: "error",
      message: err.message || "Something went wrong on the server",
    });
  }
);

// Initialize database and start the server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    // Initialize database models and relationships
    const forceSync = process.env.DB_FORCE_SYNC === "true";
    await initializeDatabase(forceSync);

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Handle graceful shutdown
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

function shutdown() {
  console.log("Closing database connection and shutting down server...");
  db.sequelize.close().then(() => {
    console.log("Database connection closed");
    process.exit(0);
  });
}
