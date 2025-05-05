import express from "express";
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import * as flightController from "../controllers/flightController.js";
import * as adminController from "../controllers/adminController.js";
import * as aircraftController from "../controllers/aircraftController.js";
import * as reservationController from "../controllers/reservationController.js";

const router = express.Router();

// first get the token from the cookie and then authenticate it
router.use(authenticateToken);
// if the token is valid, check if the user is an admin
// return 403 if not
router.use(requireAdmin);

// Dashboard statistics
router.get("/dashboard", adminController.getDashboardStats);

// User management routes
router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);
router.post("/users/:id/reset-password", adminController.resetUserPassword);

// Reservation management routes
router.get("/reservations", reservationController.getAdminReservations);
router.get("/reservations/:id", reservationController.getAdminReservationById);
router.delete(
  "/reservations/:id",
  reservationController.deleteAdminReservation
);

// Aircraft management routes
router.get("/aircraft", aircraftController.getAircraft);
router.get("/aircraft/:id", aircraftController.getAircraftById);
router.post("/aircraft", aircraftController.createAircraft);
router.put("/aircraft/:id", aircraftController.updateAircraft);
router.delete("/aircraft/:id", aircraftController.deleteAircraft);

// Flight management routes
router.get("/flights", flightController.getFlights);
router.post("/flights", flightController.createFlight);
router.get("/flights/:id", flightController.getFlightById);
router.put("/flights/:id", flightController.updateFlight);
router.delete("/flights/:id", flightController.deleteFlight);

export default router;
