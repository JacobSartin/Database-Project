import express from "express";
import {
  register,
  login,
  getReservations,
} from "../controllers/userController.js";

const router = express.Router();

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post("/register", register);

/**
 * @route   POST /api/users/login
 * @desc    Login a user
 * @access  Public
 */
router.post("/login", login);

/**
 * @route   GET /api/users/:id/reservations
 * @desc    Get all reservations for a user
 * @access  Private (would need auth middleware in a real app)
 */
router.get("/:id/reservations", getReservations);

export default router;
