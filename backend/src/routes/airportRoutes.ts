import express from "express";
import {
  getAllAirports,
  getAirportById,
} from "../controllers/airportController.js";

const router = express.Router();

/**
 * @route   GET /api/airports
 * @desc    Get all airports
 * @access  Public
 */
router.get("/", getAllAirports);

/**
 * @route   GET /api/airports/:id
 * @desc    Get a specific airport by ID
 * @access  Public
 */
router.get("/:id", getAirportById);

export default router;
