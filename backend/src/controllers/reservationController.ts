import { Response } from "express";
import { CreateReservationBody, ApiResponse } from "../types/requestTypes.js";
import Seat from "../models/seatModel.js";
import Reservation from "../models/reservationModel.js";
import { AuthRequest } from "../middleware/auth.js";

export function createReservation(req: AuthRequest, res: Response): void {
  console.log("Reservation request received:", req.body);
  const { FlightID, SeatID } = req.body as CreateReservationBody;

  // Get userId from the authenticated token instead of request body
  if (!req.user) {
    const response: ApiResponse<null> = {
      message: "Authentication required",
      error: "You must be logged in to create a reservation",
    };
    res.status(401).json(response);
    return;
  }

  // Prevent admins from making reservations
  if (req.user.isAdmin) {
    const response: ApiResponse<null> = {
      message: "Admins cannot make reservations",
      error: "Admin users are not allowed to make reservations",
    };
    res.status(403).json(response);
    return;
  }

  const userId = req.user.id;

  if (!FlightID || !SeatID) {
    const response: ApiResponse<null> = {
      message: "Missing required fields",
      error: "Flight ID and Seat ID are required",
    };
    console.log("Sending error response:", response);
    res.status(400).json(response);
    return;
  }

  // Check if the seat exists and is available
  Seat.findOne({
    where: {
      SeatID: SeatID,
      FlightID: FlightID,
    },
    include: {
      model: Reservation,
      as: "reservation",
      required: false,
    },
  })
    .then((seat) => {
      if (!seat) {
        const response: ApiResponse<null> = {
          message: "Seat not found",
          error: "The requested seat does not exist",
        };
        console.log("Seat not found:", SeatID);
        res.status(404).json(response);
        return Promise.reject(new Error("Seat not found"));
      }

      console.log("Seat found:", seat.toJSON());

      // Check if seat is already booked
      if (seat.get("reservation")) {
        const response: ApiResponse<null> = {
          message: "Seat already booked",
          error: "The selected seat is already booked",
        };
        console.log("Seat already booked:", SeatID);
        res.status(400).json(response);
        return Promise.reject(new Error("Seat already booked"));
      }

      // Create reservation
      console.log("Creating reservation for seat:", SeatID);
      return Reservation.create({
        FlightID: FlightID,
        SeatID: SeatID,
        BookingTime: new Date(),
        UserID: userId,
      });
    })
    .then((reservation) => {
      console.log("Reservation created successfully:", reservation.toJSON());
      const response: ApiResponse<typeof reservation> = {
        message: "Reservation created successfully",
        data: reservation,
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      // Only send error response if one hasn't been sent already
      if (!res.headersSent) {
        console.error("Error creating reservation:", error);
        const response: ApiResponse<null> = {
          message: "Error creating reservation",
          error: error instanceof Error ? error.message : "Unknown error",
        };
        res.status(500).json(response);
      }
    });
}

export function deleteReservation(req: AuthRequest, res: Response): void {
  const reservationId = parseInt(req.params.id);
  if (isNaN(reservationId)) {
    const response: ApiResponse<null> = {
      message: "Invalid reservation ID",
      error: "The provided reservation ID is not a valid number",
    };
    res.status(400).json(response);
    return;
  }

  // Only allow the user to delete their own reservation
  if (!req.user) {
    const response: ApiResponse<null> = {
      message: "Authentication required",
      error: "You must be logged in to delete a reservation",
    };
    res.status(401).json(response);
    return;
  }

  Reservation.findOne({
    where: { ReservationID: reservationId, UserID: req.user.id },
  })
    .then((reservation) => {
      if (!reservation) {
        const response: ApiResponse<null> = {
          message: "Reservation not found",
          error:
            "The requested reservation does not exist or does not belong to you",
        };
        res.status(404).json(response);
        return Promise.reject(
          new Error("Reservation not found or not owned by user")
        );
      }
      return reservation.destroy();
    })
    .then(() => {
      const response: ApiResponse<null> = {
        message: "Reservation deleted successfully",
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      if (!res.headersSent) {
        console.error("Error deleting reservation:", error);
        const response: ApiResponse<null> = {
          message: "Error deleting reservation",
          error: error instanceof Error ? error.message : "Unknown error",
        };
        res.status(500).json(response);
      }
    });
}
