import axios, { AxiosError } from "axios";
import {
  ApiResponse,
  UserResponse,
  FlightResponse,
  AirportResponse,
  AircraftResponse,
  SeatResponse,
  ReservationResponse,
  SearchFlightResponse,
  DashboardStatsResponse,
  RegisterRequestBody,
  LoginRequestBody,
  CreateReservationBody,
} from "../../../backend/src/types/requestTypes";
import { AirportOption } from "../types/shared";

// Base API URL - should match the backend server address
const API_BASE_URL = "http://localhost:5000/api";

// Configure axios defaults
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Include cookies for authentication
  headers: {
    "Content-Type": "application/json",
  },
});

// Error handling helper
const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    if (axiosError.response?.data?.error) {
      throw new Error(axiosError.response.data.error);
    }
  }
  throw new Error(error instanceof Error ? error.message : "Unknown API error");
};

// Convert airport data to select options
export const convertToAirportOption = (
  airport: AirportResponse
): AirportOption => {
  return {
    value: airport.Code,
    label: `${airport.City} - ${airport.Code} (${airport.Name})`,
    airportId: airport.AirportID,
  };
};

/* Authentication API Functions */

/**
 * Register a new user
 */
export function register(userData: RegisterRequestBody): Promise<UserResponse> {
  return apiClient
    .post<ApiResponse<UserResponse>>("/users/register", userData)
    .then((response) => response.data.data!)
    .catch(handleApiError);
}

/**
 * Log in an existing user
 */
export function login(credentials: LoginRequestBody): Promise<UserResponse> {
  return apiClient
    .post<ApiResponse<UserResponse>>("/users/login", credentials)
    .then((response) => response.data.data!)
    .catch(handleApiError);
}

/**
 * Log out the current user
 */
export function logout(): Promise<void> {
  return apiClient
    .post<ApiResponse<null>>("/users/logout")
    .then(() => undefined)
    .catch(handleApiError);
}

/**
 * Get the current user's profile
 */
export function getCurrentUser(): Promise<UserResponse | null> {
  return apiClient
    .get<ApiResponse<UserResponse>>("/users/profile")
    .then((response) => response.data.data || null)
    .catch((error) => {
      // Don't throw for 401 errors - just return null
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return null;
      }
      return handleApiError(error);
    });
}

/* Airport API Functions */

/**
 * Fetch all airports
 */
export function fetchAirports(): Promise<AirportOption[]> {
  return apiClient
    .get<ApiResponse<AirportResponse[]>>("/airports")
    .then((response) => (response.data.data || []).map(convertToAirportOption))
    .catch(handleApiError);
}

/* Flight API Functions */

/**
 * Convert flight date strings to Date objects
 */
function convertFlightDates(flight: FlightResponse): Omit<
  FlightResponse,
  "DepartureTime" | "ArrivalTime"
> & {
  DepartureTime: Date;
  ArrivalTime: Date;
} {
  return {
    ...flight,
    DepartureTime: flight.DepartureTime
      ? new Date(flight.DepartureTime)
      : new Date(),
    ArrivalTime: flight.ArrivalTime ? new Date(flight.ArrivalTime) : new Date(),
  };
}

/**
 * Convert reservation date strings to Date objects
 */
export type ConvertedFlight = Omit<
  FlightResponse,
  "DepartureTime" | "ArrivalTime"
> & {
  DepartureTime: Date;
  ArrivalTime: Date;
};
export type ConvertedReservation = Omit<
  ReservationResponse,
  "BookingTime" | "flight"
> & {
  BookingTime: Date;
  flight?: ConvertedFlight;
};

function convertReservationDates(
  reservation: ReservationResponse
): ConvertedReservation {
  // Convert BookingTime to Date
  const bookingTime = reservation.BookingTime
    ? new Date(reservation.BookingTime)
    : new Date();

  // Convert nested flight if present
  let convertedFlight: ConvertedFlight | undefined = undefined;
  if (reservation.flight) {
    convertedFlight = convertFlightDates(reservation.flight);
  }

  return {
    ...reservation,
    BookingTime: bookingTime,
    flight: convertedFlight,
  };
}

/**
 * Get paginated flights
 */
export function getPaginatedFlights(params: {
  page: number;
  pageSize: number;
}): Promise<{
  flights: ConvertedFlight[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  return apiClient
    .get<
      ApiResponse<{
        flights: FlightResponse[];
        totalCount: number;
        page: number;
        pageSize: number;
        totalPages: number;
      }>
    >("/flights", { params })
    .then((response) => {
      const data = response.data.data;
      if (!data) {
        return {
          flights: [],
          totalCount: 0,
          page: params.page,
          pageSize: params.pageSize,
          totalPages: 0,
        };
      }

      // Convert date strings to Date objects
      const flightsWithDates = data.flights.map(convertFlightDates);

      return {
        flights: flightsWithDates,
        totalCount: data.totalCount,
        page: data.page,
        pageSize: data.pageSize,
        totalPages: data.totalPages,
      };
    })
    .catch(handleApiError);
}

/**
 * Search for flights
 */
export function searchFlights(params: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
}): Promise<
  (Omit<FlightResponse, "DepartureTime" | "ArrivalTime"> & {
    DepartureTime: Date;
    ArrivalTime: Date;
  })[]
> {
  return apiClient
    .get<ApiResponse<SearchFlightResponse>>("/flights/search", { params })
    .then((response) => {
      const data = response.data.data;
      if (!data || !data.outbound) return [];

      // Convert date strings to Date objects
      return data.outbound.map(convertFlightDates);
    })
    .catch(handleApiError);
}

/**
 * Get a flight by ID
 */
export function getFlightById(flightId: number): Promise<
  | (Omit<FlightResponse, "DepartureTime" | "ArrivalTime"> & {
      DepartureTime: Date;
      ArrivalTime: Date;
    })
  | null
> {
  return apiClient
    .get<ApiResponse<FlightResponse>>(`/flights/${flightId}`)
    .then((response) => {
      const flight = response.data.data;
      return flight ? convertFlightDates(flight) : null;
    })
    .catch(handleApiError);
}

/**
 * Fetch available seats for a flight
 */
export function fetchAvailableSeats(flightId: number): Promise<SeatResponse[]> {
  return apiClient
    .get<ApiResponse<SeatResponse[]>>(`/flights/${flightId}/seats`)
    .then((response) => response.data.data || [])
    .catch(handleApiError);
}

/* Reservation API Functions */

/**
 * Create a new reservation
 */
export function createReservation(
  reservationData: CreateReservationBody
): Promise<ConvertedReservation> {
  return apiClient
    .post<ApiResponse<ReservationResponse>>("/reservations", reservationData)
    .then((response) => convertReservationDates(response.data.data!))
    .catch(handleApiError);
}

/**
 * Get reservations for a user
 */
export function getUserReservations(
  userId: number
): Promise<ConvertedReservation[]> {
  return apiClient
    .get<ApiResponse<ReservationResponse[]>>(`/users/${userId}/reservations`)
    .then((response) => (response.data.data || []).map(convertReservationDates))
    .catch(handleApiError);
}

/**
 * Delete a reservation
 */
export function deleteReservation(reservationId: number): Promise<void> {
  return apiClient
    .delete<ApiResponse<null>>(`/reservations/${reservationId}`)
    .then(() => undefined)
    .catch(handleApiError);
}

/* Admin API Functions */

/**
 * Get dashboard statistics
 */
export function getDashboardStats(): Promise<DashboardStatsResponse> {
  return apiClient
    .get<ApiResponse<DashboardStatsResponse>>("/admin/dashboard")
    .then((response) => response.data.data!)
    .catch(handleApiError);
}

/**
 * Create a new flight
 */
export function createFlight(flightData: {
  OriginAirportID: number;
  DestinationAirportID: number;
  AircraftID: number;
  DepartureTime: Date;
  ArrivalTime: Date;
}): Promise<
  Omit<FlightResponse, "DepartureTime" | "ArrivalTime"> & {
    DepartureTime: Date;
    ArrivalTime: Date;
  }
> {
  return apiClient
    .post<ApiResponse<FlightResponse>>("/admin/flights", {
      flightData,
    })
    .then((response) => convertFlightDates(response.data.data!))
    .catch(handleApiError);
}

/**
 * Update an existing flight
 */
export function updateFlight(
  flightId: number,
  flightData: {
    OriginAirportID: number;
    DestinationAirportID: number;
    AircraftID: number;
    DepartureTime: Date;
    ArrivalTime: Date;
  }
): Promise<
  Omit<FlightResponse, "DepartureTime" | "ArrivalTime"> & {
    DepartureTime: Date;
    ArrivalTime: Date;
  }
> {
  return apiClient
    .put<ApiResponse<FlightResponse>>(`/admin/flights/${flightId}`, {
      flightData,
    })
    .then((response) => convertFlightDates(response.data.data!))
    .catch(handleApiError);
}

/**
 * Delete a flight
 */
export function deleteFlight(flightId: number): Promise<void> {
  return apiClient
    .delete<ApiResponse<null>>(`/admin/flights/${flightId}`)
    .then(() => undefined)
    .catch(handleApiError);
}

/**
 * Get all flights (admin)
 */
export function getAllFlights(): Promise<
  (Omit<FlightResponse, "DepartureTime" | "ArrivalTime"> & {
    DepartureTime: Date;
    ArrivalTime: Date;
  })[]
> {
  return apiClient
    .get<ApiResponse<FlightResponse[]>>("/admin/flights")
    .then((response) => (response.data.data || []).map(convertFlightDates))
    .catch(handleApiError);
}

/**
 * Get all aircraft
 */
export function getAllAircraft(): Promise<AircraftResponse[]> {
  return apiClient
    .get<ApiResponse<AircraftResponse[]>>("/admin/aircraft")
    .then((response) => response.data.data || [])
    .catch(handleApiError);
}
