import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import pool from "./db/connection";

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

// Placeholder API Routes (Implement these in ./routes)
// const flightRoutes = require('./routes/flights');
// const userRoutes = require('./routes/users');
// const reservationRoutes = require('./routes/reservations');
// app.use('/api/flights', flightRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/reservations', reservationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
