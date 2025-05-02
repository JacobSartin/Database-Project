// This file serves as the main export point for shared types between frontend and backend
// Export all types from requestTypes.ts that the frontend will need

export type {
  UserIdParams,
  FlightIdParams,
  RegisterRequestBody,
  LoginRequestBody,
  CreateReservationBody,
  SearchFlightQuery,
  UserResponse,
  ApiResponse,
} from "./requestTypes.js";

// Additional shared types for the application
export interface Airport {
  AirportID: number;
  Name: string;
  Code: string;
  City: string;
  Country: string;
}

export interface Flight {
  flightId: number;
  aircraftId: number;
  originAirportId: number;
  destinationAirportId: number;
  departureTime: string;
  arrivalTime: string;
  originCode: string;
  destinationCode: string;
  originName: string;
  destinationName: string;
  aircraftModel: string;
}

export interface Seat {
  seatId: number;
  flightId: number;
  seatNumber: string;
  isBooked: boolean;
}

export interface Reservation {
  reservationId: number;
  userId: number;
  flightId: number;
  seatId: number;
  reservationDate: string;
  status: ReservationStatus;
  flight?: Flight;
  seat?: Seat;
}

export enum ReservationStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  CANCELLED = "cancelled",
}

// Frontend specific types (useful for UI components)
export interface AirportOption {
  value: string;
  label: string;
  airportId: number;
}

// Utility functions
export const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDuration = (
  departureTime: string,
  arrivalTime: string
): string => {
  const departure = new Date(departureTime);
  const arrival = new Date(arrivalTime);
  const durationMs = arrival.getTime() - departure.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours.toString()}h ${minutes.toString()}m`;
};

export const convertToAirportOption = (airport: Airport): AirportOption => {
  return {
    value: airport.Code,
    label: `${airport.City} - ${airport.Code} (${airport.Name})`,
    airportId: airport.AirportID,
  };
};
