import express from "express";
import { createReservation } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

/**
 * @route   POST /api/reservations
 * @desc    Create a new reservation
 * @access  Private - Only authenticated users can create reservations
 */
router.post("/", authenticateToken, createReservation);

export default router;
