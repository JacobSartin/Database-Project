// This file contains only type declarations without implementation code
// to be used by the frontend without bringing in backend dependencies

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

export interface AirportOption {
  value: string;
  label: string;
  airportId: number;
}

export interface UserIdParams {
  userId: string;
}

export interface FlightIdParams {
  flightId: string;
}

export interface RegisterRequestBody {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequestBody {
  username: string;
  password: string;
}

export interface CreateReservationBody {
  flightId: number;
  seatId: number;
  userId: number; // Now required since we're using authentication
}

export interface SearchFlightQuery {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
}

export interface User {
  UserID: number;
  Username: string;
  Email: string;
  FirstName: string;
  LastName: string;
  isAdmin?: boolean;
}

export interface UserResponse {
  UserID: number;
  Username: string;
  Email: string;
  FirstName: string;
  LastName: string;
  isAdmin?: boolean;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}

// Declare function signatures without implementations
export declare function formatDateTime(isoString: string): string;
export declare function formatDuration(
  departureTime: string,
  arrivalTime: string
): string;
export declare function convertToAirportOption(airport: Airport): AirportOption;
