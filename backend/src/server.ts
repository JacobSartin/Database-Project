import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import flightRoutes from "./routes/flightRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import airportRoutes from "./routes/airportRoutes.js";
import reservationRoutes from "./routes/reservationRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { testConnection } from "./db/connection.js";
import { initializeDatabase } from "./db/initModels.js";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT ?? "5000";

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? "http://localhost:5173", // Frontend URL
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add cookie parser middleware

// Initialize database
try {
  // Test database connection
  await testConnection();

  // Initialize database models and relationships
  const forceSync = process.env.DB_FORCE_SYNC === "true";
  await initializeDatabase(forceSync);
  console.log("Database initialized successfully");
} catch (error) {
  console.error("Error initializing database:", error);
  process.exit(1);
}

// Define routes
app.use("/api/flights", flightRoutes);
app.use("/api/users", userRoutes);
app.use("/api/airports", airportRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Basic Route
app.get("/", (_req, res) => {
  res.send("Airline Reservation Backend API");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
