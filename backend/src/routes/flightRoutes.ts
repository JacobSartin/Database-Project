import express, { Request, Response } from "express";
import {
  getFlights,
  getFlightById,
  searchFlights,
  getAvailableSeats,
} from "../controllers/flightController.js";

const router = express.Router();

/**
 * @route   GET /api/flights
 * @desc    Get all flights
 * @access  Public
 */
router.get("/", (req: Request, res: Response) => {
  getFlights(req, res);
});

/**
 * @route   GET /api/flights/search
 * @desc    Search for flights based on criteria
 * @access  Public
 */
router.get("/search", searchFlights);

/**
 * @route   GET /api/flights/:id/seats
 * @desc    Get available seats for a specific flight
 * @access  Public
 */
router.get("/:id/seats", getAvailableSeats);

/**
 * @route   GET /api/flights/:id
 * @desc    Get a specific flight by ID
 * @access  Public
 */
router.get("/:id", getFlightById);

export default router;
