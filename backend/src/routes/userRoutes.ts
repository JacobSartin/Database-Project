import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
  getReservations,
} from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";

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
 * @route   POST /api/users/logout
 * @desc    Logout a user
 * @access  Public
 */
router.post("/logout", logout);

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get("/profile", authenticateToken, getProfile);

/**
 * @route   GET /api/users/:id/reservations
 * @desc    Get all reservations for a user
 * @access  Private
 */
router.get("/:id/reservations", authenticateToken, getReservations);

export default router;
