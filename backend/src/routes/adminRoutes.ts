import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import * as flightController from "../controllers/flightController.js";
import { getDashboardStats } from "../controllers/adminController.js";

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard statistics
router.get("/dashboard", getDashboardStats);

// Flight management routes
router.get("/flights", flightController.getAllFlights);
router.post("/flights", flightController.createFlight);
router.get("/flights/:id", flightController.getFlightById);
router.put("/flights/:id", flightController.updateFlight);
router.delete("/flights/:id", flightController.deleteFlight);

// Aircraft management routes
router.get("/aircraft", flightController.getAllAircraft);

export default router;
