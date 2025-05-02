import { Request, Response } from "express";
import Airport from "../models/airportsModel.js";
import { ApiResponse } from "../types/index.js";

/**
 * Get all airports
 * @route GET /api/airports
 */
export const getAllAirports = async (req: Request, res: Response) => {
  try {
    const airports = await Airport.findAll({
      attributes: ["AirportID", "Name", "Code", "City", "Country"],
    });

    const response: ApiResponse<typeof airports> = {
      message: "Airports retrieved successfully",
      data: airports,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching airports:", error);
    const response: ApiResponse<null> = {
      message: "Failed to fetch airports",
      error: "An error occurred while fetching airports",
    };
    res.status(500).json(response);
  }
};

/**
 * Get airport by ID
 * @route GET /api/airports/:id
 */
export const getAirportById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const airport = await Airport.findByPk(id);

    if (!airport) {
      const response: ApiResponse<null> = {
        message: "Airport not found",
        error: "The requested airport does not exist",
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<Airport> = {
      message: "Airport retrieved successfully",
      data: airport,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching airport:", error);
    const response: ApiResponse<null> = {
      message: "Failed to fetch airport",
      error: "An error occurred while fetching the airport",
    };
    res.status(500).json(response);
  }
};
