import express from "express";
import {
  createReservation,
  deleteReservation,
} from "../controllers/reservationController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   POST /api/reservations
 * @desc    Create a new reservation
 * @access  Private - Only authenticated users can create reservations
 */
router.post("/", authenticateToken, createReservation);

/**
 * @route   DELETE /api/reservations/:id
 * @desc    Delete a reservation
 * @access  Private - Only authenticated users can delete reservations
 */
router.delete("/:id", authenticateToken, deleteReservation);

export default router;
