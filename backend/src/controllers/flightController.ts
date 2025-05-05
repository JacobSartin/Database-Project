import { Request, Response } from "express";
import { Op } from "sequelize";
import Flight from "../models/flightModel.js";
import Seat from "../models/seatModel.js";
import Airport from "../models/airportsModel.js";
import Aircraft from "../models/aircraftModel.js";
import Reservation from "../models/reservationModel.js";
import {
  FlightIdParams,
  SearchFlightQuery,
  ApiResponse,
  CreateFlightBody,
  UpdateFlightBody,
  FlightQueryParams,
} from "../types/requestTypes.js";

/**
 * Get all flights
 * @returns List of all flights with related data
 */
export function getFlights(
  req: Request<unknown, unknown, unknown, FlightQueryParams>,
  res: Response
): void {
  // Extract pagination parameters
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 10;
  const offset = (page - 1) * pageSize;

  // Get flights with pagination
  Promise.all([
    Flight.findAll({
      include: [
        { model: Airport, as: "originAirport" },
        { model: Airport, as: "destinationAirport" },
        { model: Aircraft, as: "aircraft" },
      ],
      order: [["DepartureTime", "ASC"]],
      offset,
      limit: pageSize,
    }),
    Flight.count(), // Get total count for pagination metadata
  ])
    .then(([flights, totalCount]) => {
      const response: ApiResponse<{
        flights: typeof flights;
        totalCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }> = {
        message: "Flights retrieved successfully",
        data: {
          flights,
          totalCount,
          page,
          pageSize,
          totalPages: Math.ceil(totalCount / pageSize),
        },
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      console.error("Error fetching flights:", error);
      const response: ApiResponse<null> = {
        message: "Error fetching flights",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    });
}

/**
 * Get a specific flight by ID
 * @param req Request with flight ID in params
 * @param res Response object
 */
export function getFlightById(
  req: Request<FlightIdParams>,
  res: Response
): void {
  const flightId = parseInt(req.params.id);
  if (isNaN(flightId)) {
    const response: ApiResponse<null> = {
      message: "Invalid flight ID",
      error: "The provided flight ID is not a valid number",
    };
    res.status(400).json(response);
    return;
  }

  Flight.findByPk(flightId, {
    include: [
      { model: Airport, as: "originAirport" },
      { model: Airport, as: "destinationAirport" },
      { model: Aircraft, as: "aircraft" },
      { model: Seat, as: "seats" },
    ],
  })
    .then((flight) => {
      if (!flight) {
        const response: ApiResponse<null> = {
          message: "Flight not found",
          error: "The requested flight does not exist",
        };
        res.status(404).json(response);
        return Promise.reject(new Error("Flight not found")); // Break the chain
      }
      const response: ApiResponse<typeof flight> = {
        message: "Flight retrieved successfully",
        data: flight,
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      // Only send error response if one hasn't been sent already
      if (!res.headersSent) {
        console.error(
          `Error fetching flight with ID ${flightId.toString()}:`,
          error
        );
        const response: ApiResponse<null> = {
          message: "Error fetching flight",
          error: error instanceof Error ? error.message : "Unknown error",
        };
        res.status(500).json(response);
      }
    });
}

/**
 * Search for flights based on criteria
 * @param req Request with search parameters
 * @param res Response object
 */
export function searchFlights(
  req: Request<unknown, unknown, unknown, SearchFlightQuery>,
  res: Response
): void {
  const { origin, destination, departureDate, returnDate } = req.query;

  if (!origin || !destination) {
    const response: ApiResponse<null> = {
      message: "Missing required search parameters",
      error: "Origin, destination, and departure date are required",
    };
    res.status(400).json(response);
    return;
  }

  // Convert departureDate string to Date objects for start and end of day
  const departureStart = new Date(departureDate);
  departureStart.setHours(0, 0, 0, 0);

  const departureEnd = new Date(departureDate);
  departureEnd.setHours(23, 59, 59, 999);

  // Find airports first
  Promise.all([
    // Find origin airport
    Airport.findOne({
      where: {
        [Op.or]: [
          { Code: origin.toUpperCase() },
          { City: { [Op.like]: `%${origin}%` } },
        ],
      },
    }),
    // Find destination airport
    Airport.findOne({
      where: {
        [Op.or]: [
          { Code: destination.toUpperCase() },
          { City: { [Op.like]: `%${destination}%` } },
        ],
      },
    }),
  ])
    .then(([originAirport, destinationAirport]) => {
      // Validate airports
      if (!originAirport) {
        const response: ApiResponse<null> = {
          message: `Origin airport '${origin}' not found`,
          error: "Please check airport code or city name",
        };
        res.status(404).json(response);
        return Promise.reject(new Error("Origin airport not found"));
      }

      if (!destinationAirport) {
        const response: ApiResponse<null> = {
          message: `Destination airport '${destination}' not found`,
          error: "Please check airport code or city name",
        };
        res.status(404).json(response);
        return Promise.reject(new Error("Destination airport not found"));
      }

      if (
        originAirport.getDataValue("AirportID") ===
        destinationAirport.getDataValue("AirportID")
      ) {
        const response: ApiResponse<null> = {
          message: "Origin and destination cannot be the same airport",
          error: "Please select different airports for origin and destination",
        };
        res.status(400).json(response);
        return Promise.reject(
          new Error("Same airport for origin and destination")
        );
      }

      // Search promises
      const searchPromises = [];

      // Outbound flights
      searchPromises.push(
        Flight.findAll({
          where: {
            OriginAirportID: originAirport.getDataValue("AirportID"),
            DestinationAirportID: destinationAirport.getDataValue("AirportID"),
            DepartureTime: {
              [Op.between]: [departureStart, departureEnd] as [Date, Date],
            },
          },
          include: [
            { model: Airport, as: "originAirport" },
            { model: Airport, as: "destinationAirport" },
            { model: Aircraft, as: "aircraft" },
          ],
          order: [["DepartureTime", "ASC"]],
        })
      );

      // Return flights if requested
      if (returnDate) {
        const returnStart = new Date(returnDate);
        returnStart.setHours(0, 0, 0, 0);

        const returnEnd = new Date(returnDate);
        returnEnd.setHours(23, 59, 59, 999);

        // Validate return date
        if (returnStart < departureEnd) {
          const response: ApiResponse<null> = {
            message: "Return date must be after departure date",
            error:
              "Please select a return date that comes after the departure date",
          };
          res.status(400).json(response);
          return Promise.reject(new Error("Invalid return date"));
        }

        searchPromises.push(
          Flight.findAll({
            where: {
              OriginAirportID: destinationAirport.getDataValue("AirportID"),
              DestinationAirportID: originAirport.getDataValue("AirportID"),
              DepartureTime: {
                [Op.between]: [returnStart, returnEnd] as [Date, Date],
              },
            },
            include: [
              { model: Airport, as: "originAirport" },
              { model: Airport, as: "destinationAirport" },
              { model: Aircraft, as: "aircraft" },
            ],
            order: [["DepartureTime", "ASC"]],
          })
        );
      } else {
        // Add empty array for consistent response structure
        searchPromises.push(Promise.resolve([]));
      }

      return Promise.all(searchPromises);
    })
    .then(([outboundFlights, returnFlights]) => {
      // Format response
      const flightData = {
        outbound: outboundFlights,
        return:
          // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
          returnFlights && returnFlights.length > 0 ? returnFlights : undefined,
      };

      const response: ApiResponse<typeof flightData> = {
        message: "Flights retrieved successfully",
        data: flightData,
      };

      res.json(response);
    })
    .catch((error: unknown) => {
      // Only send error response if one hasn't been sent already
      if (!res.headersSent) {
        console.error("Error searching flights:", error);
        const response: ApiResponse<null> = {
          message: "Error searching flights",
          error: error instanceof Error ? error.message : "Unknown error",
        };
        res.status(500).json(response);
      }
    });
}

/**
 * Get available seats for a specific flight
 * @param req Request with flight ID in params
 * @param res Response object
 */
export function getAvailableSeats(
  req: Request<FlightIdParams>,
  res: Response
): void {
  const flightId = parseInt(req.params.id);
  if (isNaN(flightId)) {
    const response: ApiResponse<null> = {
      message: "Invalid flight ID",
      error: "The provided flight ID is not a valid number",
    };
    res.status(400).json(response);
    return;
  }

  // Find all seats for the flight
  Seat.findAll({
    where: { FlightID: flightId },
    include: {
      model: Reservation,
      as: "reservation",
      required: false,
    },
  })
    .then((allSeats) => {
      // Mark each seat with its booking status instead of filtering
      const seatData = allSeats.map((seat) => {
        const isBooked = !!seat.get("reservation");
        const seatObj = seat.toJSON();
        seatObj.IsBooked = isBooked;
        return seatObj;
      });

      const response: ApiResponse<typeof seatData> = {
        message: "Seats retrieved successfully",
        data: seatData,
      };

      res.json(response);
    })
    .catch((error: unknown) => {
      console.error(
        `Error fetching seats for flight ${flightId.toString()}:`,
        error
      );
      const response: ApiResponse<null> = {
        message: "Error fetching seats",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    });
}

/**
 * Get all flights - Admin version with all details
 */
export function getAllFlights(req: Request, res: Response): void {
  Flight.findAll({
    include: [
      { model: Airport, as: "originAirport" },
      { model: Airport, as: "destinationAirport" },
      { model: Aircraft, as: "aircraft" },
    ],
    order: [["DepartureTime", "ASC"]],
  })
    .then((flights) => {
      const response: ApiResponse<typeof flights> = {
        message: "All flights retrieved successfully",
        data: flights,
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      console.error("Error fetching all flights:", error);
      const response: ApiResponse<null> = {
        message: "Error fetching flights",
        error: error instanceof Error ? error.message : String(error),
      };
      res.status(500).json(response);
    });
}

/**
 * Create a new flight
 */
export function createFlight(
  req: Request<unknown, unknown, CreateFlightBody>,
  res: Response
): void {
  const {
    OriginAirportID,
    DestinationAirportID,
    AircraftID,
    DepartureTime,
    ArrivalTime,
  } = req.body;

  // Validate required fields
  if (!OriginAirportID || !DestinationAirportID || !AircraftID) {
    const response: ApiResponse<null> = {
      message: "Missing required fields",
      error: "All flight fields are required",
    };
    res.status(400).json(response);
    return;
  }

  // Create the flight
  Flight.create({
    OriginAirportID,
    DestinationAirportID,
    AircraftID,
    DepartureTime,
    ArrivalTime,
  })
    .then((flight) => {
      // Generate seats for this flight based on aircraft capacity
      return Aircraft.findByPk(AircraftID).then((aircraft) => {
        if (!aircraft) {
          throw new Error("Aircraft not found");
        }

        const totalSeats = aircraft.TotalSeats;
        const rows = Math.ceil(totalSeats / 6); // Assuming 6 seats per row (A-F)
        const letters = "ABCDEF";
        const seatData = [];

        for (let row = 1; row <= rows; row++) {
          for (let i = 0; i < Math.min(6, totalSeats - (row - 1) * 6); i++) {
            const seatLetter = letters.charAt(i);
            const seatNumber = `${row.toString()}${seatLetter}`;

            seatData.push({
              FlightID: flight.FlightID,
              SeatNumber: seatNumber,
              IsBooked: false,
            });
          }
        }

        return Seat.bulkCreate(seatData).then(() => flight);
      });
    })
    .then((flight) => {
      // Fetch the flight with associated data
      return Flight.findByPk(flight.FlightID, {
        include: [
          { model: Airport, as: "originAirport" },
          { model: Airport, as: "destinationAirport" },
          { model: Aircraft, as: "aircraft" },
        ],
      });
    })
    .then((flightWithData) => {
      const response: ApiResponse<typeof flightWithData> = {
        message: "Flight created successfully",
        data: flightWithData,
      };
      res.status(201).json(response);
    })
    .catch((error: unknown) => {
      console.error("Error creating flight:", error);
      const response: ApiResponse<null> = {
        message: "Error creating flight",
        error: error instanceof Error ? error.message : String(error),
      };
      res.status(500).json(response);
    });
}

/**
 * Update an existing flight
 */
export function updateFlight(
  req: Request<FlightIdParams, unknown, UpdateFlightBody>,
  res: Response
): void {
  const flightId = parseInt(req.params.id);
  if (isNaN(flightId)) {
    const response: ApiResponse<null> = {
      message: "Invalid flight ID",
      error: "The provided flight ID is not a valid number",
    };
    res.status(400).json(response);
    return;
  }

  const {
    OriginAirportID,
    DestinationAirportID,
    AircraftID,
    DepartureTime,
    ArrivalTime,
  } = req.body;

  // Validate required fields
  if (!OriginAirportID || !DestinationAirportID || !AircraftID) {
    const response: ApiResponse<null> = {
      message: "Missing required fields",
      error: "All flight fields are required",
    };
    res.status(400).json(response);
    return;
  }

  // Check if flight exists
  Flight.findByPk(flightId)
    .then((flight) => {
      if (!flight) {
        const response: ApiResponse<null> = {
          message: "Flight not found",
          error: "The requested flight does not exist",
        };
        res.status(404).json(response);
        return Promise.reject(new Error("Flight not found"));
      }

      // Update the flight
      return flight.update({
        OriginAirportID,
        DestinationAirportID,
        AircraftID,
        DepartureTime,
        ArrivalTime,
      });
    })
    .then(() => {
      // Fetch the updated flight with associated data
      return Flight.findByPk(flightId, {
        include: [
          { model: Airport, as: "originAirport" },
          { model: Airport, as: "destinationAirport" },
          { model: Aircraft, as: "aircraft" },
        ],
      });
    })
    .then((updatedFlight) => {
      const response: ApiResponse<typeof updatedFlight> = {
        message: "Flight updated successfully",
        data: updatedFlight,
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      if (!res.headersSent) {
        console.error(`Error updating flight ${flightId.toString()}:`, error);
        const response: ApiResponse<null> = {
          message: "Error updating flight",
          error: error instanceof Error ? error.message : String(error),
        };
        res.status(500).json(response);
      }
    });
}

/**
 * Delete a flight
 */
export function deleteFlight(
  req: Request<FlightIdParams>,
  res: Response
): void {
  const flightId = parseInt(req.params.id);
  if (isNaN(flightId)) {
    const response: ApiResponse<null> = {
      message: "Invalid flight ID",
      error: "The provided flight ID is not a valid number",
    };
    res.status(400).json(response);
    return;
  }

  // Check if flight has any reservations
  Reservation.findOne({ where: { FlightID: flightId } })
    .then((reservation) => {
      if (reservation) {
        const response: ApiResponse<null> = {
          message: "Cannot delete flight with reservations",
          error: "This flight has active reservations and cannot be deleted",
        };
        res.status(400).json(response);
        return Promise.reject(new Error("Flight has reservations"));
      }

      // Delete associated seats first
      return Seat.destroy({ where: { FlightID: flightId } }).then(() => {
        // Then delete the flight
        return Flight.destroy({ where: { FlightID: flightId } });
      });
    })
    .then((deletedCount) => {
      if (deletedCount === 0) {
        const response: ApiResponse<null> = {
          message: "Flight not found",
          error: "The requested flight does not exist",
        };
        res.status(404).json(response);
        return;
      }

      const response: ApiResponse<null> = {
        message: "Flight deleted successfully",
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      if (!res.headersSent) {
        console.error(`Error deleting flight ${flightId.toString()}:`, error);
        const response: ApiResponse<null> = {
          message: "Error deleting flight",
          error: error instanceof Error ? error.message : String(error),
        };
        res.status(500).json(response);
      }
    });
}

/**
 * Get all aircraft
 */
export function getAllAircraft(req: Request, res: Response): void {
  Aircraft.findAll()
    .then((aircraft) => {
      const response: ApiResponse<typeof aircraft> = {
        message: "Aircraft retrieved successfully",
        data: aircraft,
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      console.error("Error fetching aircraft:", error);
      const response: ApiResponse<null> = {
        message: "Error fetching aircraft",
        error: error instanceof Error ? error.message : String(error),
      };
      res.status(500).json(response);
    });
}
