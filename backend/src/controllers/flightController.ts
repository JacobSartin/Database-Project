import { Request, Response } from "express";
import { Op } from "sequelize";
import Flight from "../models/flightModel.js";
import Seat from "../models/seatModel.js";
import Airport from "../models/airportsModel.js";
import Aircraft from "../models/aircraftModel.js";
import Reservation from "../models/reservationModel.js";

/**
 * Get all flights
 * @returns List of all flights with related data
 */
export function getFlights(req: Request, res: Response): void {
  Flight.findAll({
    include: [
      { model: Airport, as: "originAirport" },
      { model: Airport, as: "destinationAirport" },
      { model: Aircraft, as: "aircraft" },
    ],
    order: [["DepartureTime", "ASC"]],
  })
    .then((flights) => {
      res.json(flights);
    })
    .catch((error) => {
      console.error("Error fetching flights:", error);
      res.status(500).json({
        message: "Error fetching flights",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    });
}

/**
 * Get a specific flight by ID
 * @param req Request with flight ID in params
 * @param res Response object
 */
export function getFlightById(req: Request, res: Response): void {
  const flightId = parseInt(req.params.id);
  if (isNaN(flightId)) {
    res.status(400).json({ message: "Invalid flight ID" });
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
        res.status(404).json({ message: "Flight not found" });
        return;
      }
      res.json(flight);
    })
    .catch((error) => {
      console.error(`Error fetching flight with ID ${flightId}:`, error);
      res.status(500).json({
        message: "Error fetching flight",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    });
}

/**
 * Search for flights based on criteria
 * @param req Request with search parameters
 * @param res Response object
 */
export function searchFlights(req: Request, res: Response): void {
  const { origin, destination, departureDate, returnDate } = req.query;

  if (!origin || !destination || !departureDate) {
    res.status(400).json({ message: "Missing required search parameters" });
    return;
  }

  // Convert departureDate string to Date objects for start and end of day
  const departureStart = new Date(departureDate as string);
  departureStart.setHours(0, 0, 0, 0);

  const departureEnd = new Date(departureDate as string);
  departureEnd.setHours(23, 59, 59, 999);

  // First, find airports by code
  const originAirportPromise = Airport.findOne({
    where: {
      [Op.or]: [
        { Code: (origin as string).toUpperCase() },
        { City: { [Op.like]: `%${origin}%` } },
      ],
    },
  });

  const destinationAirportPromise = Airport.findOne({
    where: {
      [Op.or]: [
        { Code: (destination as string).toUpperCase() },
        { City: { [Op.like]: `%${destination}%` } },
      ],
    },
  });

  Promise.all([originAirportPromise, destinationAirportPromise])
    .then(([originAirport, destinationAirport]) => {
      if (!originAirport) {
        res.status(404).json({
          message: `Origin airport '${origin}' not found. Please check airport code or city name.`,
        });
        return Promise.reject(new Error("Origin airport not found"));
      }

      if (!destinationAirport) {
        res.status(404).json({
          message: `Destination airport '${destination}' not found. Please check airport code or city name.`,
        });
        return Promise.reject(new Error("Destination airport not found"));
      }

      if (
        originAirport.getDataValue("AirportID") ===
        destinationAirport.getDataValue("AirportID")
      ) {
        res.status(400).json({
          message: "Origin and destination cannot be the same airport.",
        });
        return Promise.reject(
          new Error("Same airport for origin and destination")
        );
      }

      // Find outbound flights
      const outboundFlightsPromise = Flight.findAll({
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
      });

      let returnFlightsPromise: Promise<Flight[]> = Promise.resolve([]);

      // If returnDate is provided, search for return flights
      if (returnDate) {
        const returnStart = new Date(returnDate as string);
        returnStart.setHours(0, 0, 0, 0);

        const returnEnd = new Date(returnDate as string);
        returnEnd.setHours(23, 59, 59, 999);

        // Validate that return date is after departure date
        if (returnStart < departureEnd) {
          res.status(400).json({
            message: "Return date must be after departure date.",
          });
          return Promise.reject(new Error("Invalid return date"));
        }

        returnFlightsPromise = Flight.findAll({
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
        });
      }

      return Promise.all([outboundFlightsPromise, returnFlightsPromise]);
    })
    .then(([outboundFlights, returnFlights]) => {
      if (!outboundFlights) return; // If execution reached here, response was already sent

      res.json({
        outbound: outboundFlights,
        return: returnFlights.length > 0 ? returnFlights : undefined,
      });
    })
    .catch((error) => {
      // Only send error response if one hasn't been sent already
      if (!res.headersSent) {
        console.error("Error searching flights:", error);
        res.status(500).json({
          message:
            error instanceof Error ? error.message : "Error searching flights",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
}

/**
 * Get available seats for a specific flight
 * @param req Request with flight ID in params
 * @param res Response object
 */
export function getAvailableSeats(req: Request, res: Response): void {
  const flightId = parseInt(req.params.id);
  if (isNaN(flightId)) {
    res.status(400).json({ message: "Invalid flight ID" });
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
      // Filter out seats that have reservations
      const availableSeats = allSeats.filter((seat) => {
        return seat.get("reservation") === null;
      });
      res.json(availableSeats);
    })
    .catch((error) => {
      console.error(
        `Error fetching available seats for flight ${flightId}:`,
        error
      );
      res.status(500).json({
        message: "Error fetching available seats",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    });
}
