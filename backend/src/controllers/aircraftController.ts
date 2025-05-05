import { Response } from "express";
import Aircraft from "../models/aircraftModel.js";
import Flight from "../models/flightModel.js";
import { AuthRequest } from "../middleware/auth.js";
import {
  ApiResponse,
  CreateAircraftBody,
  UpdateAircraftBody,
} from "../types/requestTypes.js";

// CRUD operations for aircraft management

/**
 * Get all aircraft with pagination
 */
export async function getAircraft(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    // Parse pagination parameters only
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    // Use Promise.all to perform both queries concurrently
    const [aircraft, totalCount] = await Promise.all([
      Aircraft.findAll({
        order: [["AircraftID", "ASC"]],
        limit: pageSize,
        offset,
      }),
      Aircraft.count(), // Get total count for pagination metadata
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    // Get flight counts for each aircraft
    const aircraftIds = aircraft.map((a) => a.AircraftID);

    // Use Promise.all to get flight counts for each aircraft individually
    // This is more type-safe than using raw queries with group by
    const flightCountPromises = aircraftIds.map((id) =>
      Flight.count({
        where: { AircraftID: id },
      }).then((count) => ({ id, count }))
    );

    const flightCounts = await Promise.all(flightCountPromises);

    // Create a map of aircraft ID to flight count using properly typed results
    const flightCountMap = new Map<number, number>();
    flightCounts.forEach(({ id, count }) => {
      flightCountMap.set(id, count);
    });

    // Add flight counts to aircraft data
    const aircraftWithCounts = aircraft.map((a) => {
      const aircraftData = a.toJSON();
      return {
        ...aircraftData,
        FlightCount: flightCountMap.get(a.AircraftID) ?? 0,
      };
    });

    const response: ApiResponse<{
      aircraft: typeof aircraftWithCounts;
      totalCount: number;
      totalPages: number;
      currentPage: number;
    }> = {
      message: "Aircraft retrieved successfully",
      data: {
        aircraft: aircraftWithCounts,
        totalCount,
        totalPages,
        currentPage: page,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching aircraft:", error);
    const response: ApiResponse<null> = {
      message: "Error retrieving aircraft",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
}

/**
 * Get a specific aircraft by ID
 */
export async function getAircraftById(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const aircraftId = parseInt(req.params.id);
    if (isNaN(aircraftId)) {
      const response: ApiResponse<null> = {
        message: "Invalid aircraft ID",
        error: "Aircraft ID must be a number",
      };
      res.status(400).json(response);
      return;
    }

    const aircraft = await Aircraft.findByPk(aircraftId);
    if (!aircraft) {
      const response: ApiResponse<null> = {
        message: "Aircraft not found",
        error: "The requested aircraft does not exist",
      };
      res.status(404).json(response);
      return;
    }

    // Get flight count
    const flightCount = await Flight.count({
      where: { AircraftID: aircraftId },
    });

    const aircraftData = {
      ...aircraft.toJSON(),
      FlightCount: flightCount,
    };

    const response: ApiResponse<typeof aircraftData> = {
      message: "Aircraft retrieved successfully",
      data: aircraftData,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching aircraft:", error);
    const response: ApiResponse<null> = {
      message: "Error retrieving aircraft",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
}

/**
 * Update an aircraft
 */
export async function updateAircraft(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const aircraftId = parseInt(req.params.id);
    if (isNaN(aircraftId)) {
      const response: ApiResponse<null> = {
        message: "Invalid aircraft ID",
        error: "Aircraft ID must be a number",
      };
      res.status(400).json(response);
      return;
    }

    const { Model, TotalSeats } = req.body as UpdateAircraftBody;

    const aircraft = await Aircraft.findByPk(aircraftId);
    if (!aircraft) {
      const response: ApiResponse<null> = {
        message: "Aircraft not found",
        error: "The requested aircraft does not exist",
      };
      res.status(404).json(response);
      return;
    }

    // Update aircraft fields
    await aircraft.update({
      Model,
      TotalSeats,
    });

    const response: ApiResponse<{ message: string }> = {
      message: "Aircraft updated successfully",
      data: { message: `Aircraft #${aircraftId.toString()} has been updated` },
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating aircraft:", error);
    const response: ApiResponse<null> = {
      message: "Error updating aircraft",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
}

/**
 * Create a new aircraft
 */
export async function createAircraft(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { Model, TotalSeats } = req.body as CreateAircraftBody;

    // Check if registration already exists
    const existingAircraft = await Aircraft.findOne({
      where: { Model: Model },
    });

    if (existingAircraft) {
      const response: ApiResponse<null> = {
        message: "Registration already exists",
        error: "An aircraft with this registration number already exists",
      };
      res.status(400).json(response);
      return;
    }

    // Create the new aircraft
    const newAircraft = await Aircraft.create({
      Model,
      TotalSeats,
    });

    const response: ApiResponse<typeof newAircraft> = {
      message: "Aircraft created successfully",
      data: newAircraft,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating aircraft:", error);
    const response: ApiResponse<null> = {
      message: "Error creating aircraft",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
}

/**
 * Delete an aircraft
 */
export async function deleteAircraft(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const aircraftId = parseInt(req.params.id);
    if (isNaN(aircraftId)) {
      const response: ApiResponse<null> = {
        message: "Invalid aircraft ID",
        error: "Aircraft ID must be a number",
      };
      res.status(400).json(response);
      return;
    }

    // Check if aircraft exists
    const aircraft = await Aircraft.findByPk(aircraftId);
    if (!aircraft) {
      const response: ApiResponse<null> = {
        message: "Aircraft not found",
        error: "The requested aircraft does not exist",
      };
      res.status(404).json(response);
      return;
    }

    // Check if aircraft has associated flights
    const flightCount = await Flight.count({
      where: { AircraftID: aircraftId },
    });

    if (flightCount > 0) {
      const response: ApiResponse<null> = {
        message: "Cannot delete aircraft",
        error: "This aircraft has associated flights and cannot be deleted",
      };
      res.status(400).json(response);
      return;
    }

    // Delete the aircraft
    await aircraft.destroy();

    const response: ApiResponse<{ message: string }> = {
      message: "Aircraft deleted successfully",
      data: { message: `Aircraft #${aircraftId.toString()} has been deleted` },
    };

    res.json(response);
  } catch (error) {
    console.error("Error deleting aircraft:", error);
    const response: ApiResponse<null> = {
      message: "Error deleting aircraft",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
}
