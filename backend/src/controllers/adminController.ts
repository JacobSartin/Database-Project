import { Request, Response } from "express";
import { ApiResponse } from "../types/requestTypes.js";
import { User, Flight, Aircraft, Reservation } from "../models/relations.js";

/**
 * Get dashboard statistics for admin
 */
export function getDashboardStats(req: Request, res: Response): void {
  // Get counts from different models in parallel
  Promise.all([
    Flight.count(),
    User.count(),
    Aircraft.count(),
    Reservation.count(),
  ])
    .then(([totalFlights, totalUsers, totalAircraft, totalReservations]) => {
      const dashboardData = {
        totalFlights,
        totalUsers,
        totalAircraft,
        totalReservations,
      };

      const response: ApiResponse<typeof dashboardData> = {
        message: "Dashboard statistics retrieved successfully",
        data: dashboardData,
      };

      res.json(response);
    })
    .catch((error: unknown) => {
      console.error("Error fetching dashboard statistics:", error);
      const response: ApiResponse<null> = {
        message: "Error fetching dashboard statistics",
        error: error instanceof Error ? error.message : String(error),
      };
      res.status(500).json(response);
    });
}
