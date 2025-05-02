// Only non-model types should be defined here.
// For model types (Airport, Flight, Seat, Reservation, User, Aircraft, etc.), import directly from '../models/<modelName>Model'.

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
  userId: number;
}

export interface SearchFlightQuery {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}
