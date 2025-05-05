import { Request, Response } from "express";
import Airport from "../models/airportsModel.js";
import {
  CreateAirportBody,
  UpdateAirportBody,
  ApiResponse,
} from "../types/requestTypes.js";

// CRUD operations for airports

/**
 * Get all airports
 */
export function getAirports(req: Request, res: Response): void {
  Airport.findAll({ order: [["Code", "ASC"]] })
    .then((airports) => {
      const response: ApiResponse<typeof airports> = {
        message: "Airports retrieved successfully",
        data: airports,
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      console.error("Error fetching airports:", error);
      const response: ApiResponse<null> = {
        message: "Error fetching airports",
        error: error instanceof Error ? error.message : String(error),
      };
      res.status(500).json(response);
    });
}

/**
 * Get a specific airport by ID
 */
export function getAirportById(
  req: Request<{ id: string }>,
  res: Response
): void {
  const airportId = parseInt(req.params.id);
  if (isNaN(airportId)) {
    const response: ApiResponse<null> = {
      message: "Invalid airport ID",
      error: "The provided airport ID is not a valid number",
    };
    res.status(400).json(response);
    return;
  }

  Airport.findByPk(airportId)
    .then((airport) => {
      if (!airport) {
        const response: ApiResponse<null> = {
          message: "Airport not found",
          error: "The requested airport does not exist",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof airport> = {
        message: "Airport retrieved successfully",
        data: airport,
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      console.error(`Error fetching airport ${airportId.toString()}:`, error);
      const response: ApiResponse<null> = {
        message: "Error fetching airport",
        error: error instanceof Error ? error.message : String(error),
      };
      res.status(500).json(response);
    });
}

/**
 * Create a new airport - Admin only
 */
export function createAirport(req: Request, res: Response): void {
  const { Code, Name, City, Country } = req.body as CreateAirportBody;

  if (!Code || !Name || !City || !Country) {
    const response: ApiResponse<null> = {
      message: "Missing required fields",
      error: "All airport fields are required",
    };
    res.status(400).json(response);
    return;
  }

  // Check for duplicate code
  Airport.findOne({ where: { Code: Code.toUpperCase() } })
    .then((existingAirport) => {
      if (existingAirport) {
        const response: ApiResponse<null> = {
          message: "Airport code already exists",
          error: `An airport with code ${Code.toUpperCase()} already exists`,
        };
        res.status(400).json(response);
        return Promise.reject(new Error("Airport code already exists"));
      }

      // Create the airport
      return Airport.create({
        Code: Code.toUpperCase(),
        Name,
        City,
        Country,
      });
    })
    .then((airport) => {
      const response: ApiResponse<typeof airport> = {
        message: "Airport created successfully",
        data: airport,
      };
      res.status(201).json(response);
    })
    .catch((error: unknown) => {
      if (!res.headersSent) {
        console.error("Error creating airport:", error);
        const response: ApiResponse<null> = {
          message: "Error creating airport",
          error: error instanceof Error ? error.message : String(error),
        };
        res.status(500).json(response);
      }
    });
}

/**
 * Update an existing airport - Admin only
 */
export function updateAirport(
  req: Request<{ id: string }, unknown, UpdateAirportBody>,
  res: Response
): void {
  const airportId = parseInt(req.params.id);
  if (isNaN(airportId)) {
    const response: ApiResponse<null> = {
      message: "Invalid airport ID",
      error: "The provided airport ID is not a valid number",
    };
    res.status(400).json(response);
    return;
  }

  const { Code, Name, City, Country } = req.body;

  if (!Code || !Name || !City || !Country) {
    const response: ApiResponse<null> = {
      message: "Missing required fields",
      error: "All airport fields are required",
    };
    res.status(400).json(response);
    return;
  }

  // Check if airport exists
  Airport.findByPk(airportId)
    .then((airport) => {
      if (!airport) {
        const response: ApiResponse<null> = {
          message: "Airport not found",
          error: "The requested airport does not exist",
        };
        res.status(404).json(response);
        return Promise.reject(new Error("Airport not found"));
      }

      // Check for duplicate code if code is changed
      if (
        Code.toUpperCase() !== airport.getDataValue("Code") &&
        Code.toUpperCase() !== airport.Code
      ) {
        return Airport.findOne({ where: { Code: Code.toUpperCase() } }).then(
          (existingAirport) => {
            if (existingAirport) {
              const response: ApiResponse<null> = {
                message: "Airport code already exists",
                error: `An airport with code ${Code.toUpperCase()} already exists`,
              };
              res.status(400).json(response);
              return Promise.reject(new Error("Airport code already exists"));
            }
            return airport;
          }
        );
      }
      return airport;
    })
    .then((airport) => {
      // Update the airport
      return airport.update({
        Code: Code.toUpperCase(),
        Name,
        City,
        Country,
      });
    })
    .then((updatedAirport) => {
      const response: ApiResponse<typeof updatedAirport> = {
        message: "Airport updated successfully",
        data: updatedAirport,
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      if (!res.headersSent) {
        console.error(`Error updating airport ${airportId.toString()}:`, error);
        const response: ApiResponse<null> = {
          message: "Error updating airport",
          error: error instanceof Error ? error.message : String(error),
        };
        res.status(500).json(response);
      }
    });
}

/**
 * Delete an airport - Admin only
 */
export function deleteAirport(
  req: Request<{ id: string }>,
  res: Response
): void {
  const airportId = parseInt(req.params.id);
  if (isNaN(airportId)) {
    const response: ApiResponse<null> = {
      message: "Invalid airport ID",
      error: "The provided airport ID is not a valid number",
    };
    res.status(400).json(response);
    return;
  }

  // Delete the airport
  Airport.destroy({ where: { AirportID: airportId } })
    .then((deletedCount) => {
      if (deletedCount === 0) {
        const response: ApiResponse<null> = {
          message: "Airport not found",
          error: "The requested airport does not exist",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        message: "Airport deleted successfully",
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      console.error(`Error deleting airport ${airportId.toString()}:`, error);
      const response: ApiResponse<null> = {
        message: "Error deleting airport",
        error: error instanceof Error ? error.message : String(error),
      };
      res.status(500).json(response);
    });
}
