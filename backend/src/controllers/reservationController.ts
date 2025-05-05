import { Request, Response } from "express";
import Reservation from "../models/reservationModel.js";
import Flight from "../models/flightModel.js";
import Seat from "../models/seatModel.js";
import Airport from "../models/airportsModel.js";
import User from "../models/usersModel.js";
import { AuthRequest } from "../middleware/auth.js";
import {
  CreateReservationBody,
  ReservationIdParams,
  ApiResponse,
  UserIdParams,
} from "../types/requestTypes.js";

/**
 * Get all reservations for a user
 * @param req Request with user ID (from auth middleware)
 * @param res Response object
 */
export function getUserReservations(
  req: Request<UserIdParams>,
  res: Response
): void {
  const userId = Number(req.query.userId) || 0;

  Reservation.findAll({
    where: { UserID: userId },
    include: [
      {
        model: Flight,
        include: [
          { model: Airport, as: "OriginAirport" },
          { model: Airport, as: "DestinationAirport" },
        ],
      },
      { model: Seat },
    ],
    order: [[Flight, "DepartureTime", "ASC"]],
  })
    .then((reservations) => {
      const response: ApiResponse<typeof reservations> = {
        message: "Reservations retrieved successfully",
        data: reservations,
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      console.error(
        `Error fetching reservations for user ${userId.toString()}:`,
        error
      );
      const response: ApiResponse<null> = {
        message: "Error fetching reservations",
        error: error instanceof Error ? error.message : String(error),
      };
      res.status(500).json(response);
    });
}

/**
 * Create a new reservation
 * @param req Request with reservation details
 * @param res Response object
 */
export function createReservation(
  req: Request<unknown, unknown, CreateReservationBody>,
  res: Response
): void {
  const { FlightID, SeatID, UserID } = req.body;

  // Validate required fields
  if (!FlightID || !SeatID || !UserID) {
    const response: ApiResponse<null> = {
      message: "Missing required fields",
      error: "Flight ID, Seat ID, and User ID are required",
    };
    res.status(400).json(response);
    return;
  }

  // Check if seat is available
  Seat.findByPk(SeatID)
    .then((seat) => {
      if (!seat) {
        const response: ApiResponse<null> = {
          message: "Seat not found",
          error: "The selected seat does not exist",
        };
        res.status(404).json(response);
        return Promise.reject(new Error("Seat not found"));
      }

      // Check if seat is already reserved for this flight
      return Reservation.findOne({
        where: {
          FlightID,
          SeatID,
        },
      });
    })
    .then((existingReservation) => {
      if (existingReservation) {
        const response: ApiResponse<null> = {
          message: "Seat already reserved",
          error: "The selected seat is already reserved for this flight",
        };
        res.status(400).json(response);
        return Promise.reject(new Error("Seat already reserved"));
      }

      // Create the reservation
      return Reservation.create({
        FlightID,
        SeatID,
        UserID,
        BookingTime: new Date(),
      });
    })
    .then((reservation) => {
      const response: ApiResponse<typeof reservation> = {
        message: "Reservation created successfully",
        data: reservation,
      };
      res.status(201).json(response);
    })
    .catch((error: unknown) => {
      if (!res.headersSent) {
        console.error("Error creating reservation:", error);
        const response: ApiResponse<null> = {
          message: "Error creating reservation",
          error: error instanceof Error ? error.message : String(error),
        };
        res.status(500).json(response);
      }
    });
}

/**
 * Cancel a reservation
 * @param req Request with reservation ID
 * @param res Response object
 */
export function deleteReservation(req: Request, res: Response): void {
  const reservationId = parseInt(req.params.id);
  if (isNaN(reservationId)) {
    const response: ApiResponse<null> = {
      message: "Invalid reservation ID",
      error: "The provided reservation ID is not a valid number",
    };
    res.status(400).json(response);
    return;
  }

  Reservation.findByPk(reservationId)
    .then((reservation) => {
      if (!reservation) {
        const response: ApiResponse<null> = {
          message: "Reservation not found",
          error: "The requested reservation does not exist",
        };
        res.status(404).json(response);
        return Promise.reject(new Error("Reservation not found"));
      }

      return reservation.destroy();
    })
    .then(() => {
      const response: ApiResponse<{ message: string }> = {
        message: "Reservation cancelled successfully",
        data: {
          message: `Reservation #${reservationId.toString()} has been cancelled`,
        },
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      if (!res.headersSent) {
        console.error(
          `Error cancelling reservation ${reservationId.toString()}:`,
          error
        );
        const response: ApiResponse<null> = {
          message: "Error cancelling reservation",
          error: error instanceof Error ? error.message : String(error),
        };
        res.status(500).json(response);
      }
    });
}

/**
 * Get a specific reservation by ID
 * @param req Request with reservation ID
 * @param res Response object
 */
export function getReservationById(
  req: Request<ReservationIdParams>,
  res: Response
): void {
  const reservationId = parseInt(req.params.id);
  if (isNaN(reservationId)) {
    const response: ApiResponse<null> = {
      message: "Invalid reservation ID",
      error: "The provided reservation ID is not a valid number",
    };
    res.status(400).json(response);
    return;
  }

  Reservation.findByPk(reservationId, {
    include: [
      {
        model: Flight,
        include: [
          { model: Airport, as: "OriginAirport" },
          { model: Airport, as: "DestinationAirport" },
        ],
      },
      { model: Seat },
    ],
  })
    .then((reservation) => {
      if (!reservation) {
        const response: ApiResponse<null> = {
          message: "Reservation not found",
          error: "The requested reservation does not exist",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<typeof reservation> = {
        message: "Reservation retrieved successfully",
        data: reservation,
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      console.error(
        `Error fetching reservation ${reservationId.toString()}:`,
        error
      );
      const response: ApiResponse<null> = {
        message: "Error fetching reservation",
        error: error instanceof Error ? error.message : String(error),
      };
      res.status(500).json(response);
    });
}

/**
 * Get all reservations - Admin only
 * @param req Request
 * @param res Response object
 */
export function getAllReservations(req: Request, res: Response): void {
  Reservation.findAll({
    include: [
      {
        model: Flight,
        include: [
          { model: Airport, as: "OriginAirport" },
          { model: Airport, as: "DestinationAirport" },
        ],
      },
      { model: Seat },
    ],
    order: [[Flight, "DepartureTime", "ASC"]],
  })
    .then((reservations) => {
      const response: ApiResponse<typeof reservations> = {
        message: "All reservations retrieved successfully",
        data: reservations,
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      console.error("Error fetching all reservations:", error);
      const response: ApiResponse<null> = {
        message: "Error fetching reservations",
        error: error instanceof Error ? error.message : String(error),
      };
      res.status(500).json(response);
    });
}

/**
 * Get all reservations with pagination
 */
export async function getAdminReservations(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    // Parse pagination parameters only
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    // Use Promise.all to perform both queries concurrently
    const [reservations, totalCount] = await Promise.all([
      Reservation.findAll({
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "UserID",
              "Username",
              "FirstName",
              "LastName",
              "Email",
            ],
          },
          {
            model: Flight,
            as: "flight",
            include: [
              { association: "originAirport" },
              { association: "destinationAirport" },
              { association: "aircraft" },
            ],
          },
          { model: Seat, as: "seat" },
        ],
        order: [["ReservationID", "DESC"]],
        limit: pageSize,
        offset,
      }),
      Reservation.count(), // Get total count for pagination metadata
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    const response: ApiResponse<{
      reservations: typeof reservations;
      totalCount: number;
      totalPages: number;
      currentPage: number;
    }> = {
      message: "Reservations retrieved successfully",
      data: {
        reservations,
        totalCount,
        totalPages,
        currentPage: page,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    const response: ApiResponse<null> = {
      message: "Error retrieving reservations",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
}

/**
 * Get a specific reservation by ID
 */
export async function getAdminReservationById(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const reservationId = parseInt(req.params.id);
    if (isNaN(reservationId)) {
      const response: ApiResponse<null> = {
        message: "Invalid reservation ID",
        error: "Reservation ID must be a number",
      };
      res.status(400).json(response);
      return;
    }

    const reservation = await Reservation.findByPk(reservationId, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["UserID", "Username", "FirstName", "LastName", "Email"],
        },
        {
          model: Flight,
          as: "flight",
          include: [
            { association: "originAirport" },
            { association: "destinationAirport" },
            { association: "aircraft" },
          ],
        },
        { model: Seat, as: "seat" },
      ],
    });

    if (!reservation) {
      const response: ApiResponse<null> = {
        message: "Reservation not found",
        error: "The requested reservation does not exist",
      };
      res.status(404).json(response);
      return;
    }

    const response: ApiResponse<typeof reservation> = {
      message: "Reservation retrieved successfully",
      data: reservation,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching reservation:", error);
    const response: ApiResponse<null> = {
      message: "Error retrieving reservation",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
}

/**
 * Delete a reservation (admin only)
 */
export async function deleteAdminReservation(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const reservationId = parseInt(req.params.id);
    if (isNaN(reservationId)) {
      const response: ApiResponse<null> = {
        message: "Invalid reservation ID",
        error: "Reservation ID must be a number",
      };
      res.status(400).json(response);
      return;
    }

    // Check if reservation exists
    const reservation = await Reservation.findByPk(reservationId);
    if (!reservation) {
      const response: ApiResponse<null> = {
        message: "Reservation not found",
        error: "The requested reservation does not exist",
      };
      res.status(404).json(response);
      return;
    }

    // Delete the reservation
    await reservation.destroy();

    const response: ApiResponse<{ message: string }> = {
      message: "Reservation deleted successfully",
      data: {
        message: `Reservation #${reservationId.toString()} has been cancelled`,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error deleting reservation:", error);
    const response: ApiResponse<null> = {
      message: "Error deleting reservation",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
}
