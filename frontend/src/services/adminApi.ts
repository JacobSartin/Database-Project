import axios, { AxiosError } from "axios";
import {
  ApiResponse,
  UserResponse,
  FlightResponse,
  AircraftResponse,
  ReservationResponse,
  DashboardStatsResponse,
  AirportResponse,
} from "../../../backend/src/types/requestTypes";
import { ConvertedFlight, ConvertedReservation } from "./api";

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

/**
 * Convert flight date strings to Date objects
 */
function convertFlightDates(flight: FlightResponse): ConvertedFlight {
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
 * Get paginated flights for admin
 */
export function getAdminFlights(params: {
  page: number;
  pageSize: number;
}): Promise<{
  flights: ConvertedFlight[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  return apiClient
    .get<
      ApiResponse<{
        flights: FlightResponse[];
        totalCount: number;
        totalPages: number;
        currentPage: number;
      }>
    >("/admin/flights", { params })
    .then((response) => {
      const data = response.data.data;
      if (!data) {
        return {
          flights: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: params.page,
        };
      }

      // Convert date strings to Date objects
      const flightsWithDates = data.flights.map(convertFlightDates);

      return {
        flights: flightsWithDates,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      };
    })
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
}): Promise<ConvertedFlight> {
  return apiClient
    .post<ApiResponse<FlightResponse>>("/admin/flights", flightData)
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
): Promise<ConvertedFlight> {
  return apiClient
    .put<ApiResponse<FlightResponse>>(`/admin/flights/${flightId}`, flightData)
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
 * Get paginated aircraft
 */
export function getAdminAircraft(params: {
  page: number;
  pageSize: number;
}): Promise<{
  aircraft: AircraftResponse[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  return apiClient
    .get<
      ApiResponse<{
        aircraft: AircraftResponse[];
        totalCount: number;
        totalPages: number;
        currentPage: number;
      }>
    >("/admin/aircraft", { params })
    .then(
      (response) =>
        response.data.data || {
          aircraft: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: params.page,
        }
    )
    .catch(handleApiError);
}

/**
 * Get aircraft by ID
 */
export function getAircraftById(
  aircraftId: number
): Promise<AircraftResponse | null> {
  return apiClient
    .get<ApiResponse<AircraftResponse>>(`/admin/aircraft/${aircraftId}`)
    .then((response) => response.data.data || null)
    .catch(handleApiError);
}

/**
 * Create a new aircraft
 */
export function createAircraft(aircraftData: {
  Model: string;
  TotalSeats: number;
}): Promise<AircraftResponse> {
  return apiClient
    .post<ApiResponse<AircraftResponse>>("/admin/aircraft", aircraftData)
    .then((response) => response.data.data!)
    .catch(handleApiError);
}

/**
 * Update an existing aircraft
 */
export function updateAircraft(
  aircraftId: number,
  aircraftData: {
    Model: string;
    TotalSeats: number;
  }
): Promise<AircraftResponse> {
  return apiClient
    .put<ApiResponse<AircraftResponse>>(
      `/admin/aircraft/${aircraftId}`,
      aircraftData
    )
    .then((response) => response.data.data!)
    .catch(handleApiError);
}

/**
 * Delete an aircraft
 */
export function deleteAircraft(aircraftId: number): Promise<void> {
  return apiClient
    .delete<ApiResponse<null>>(`/admin/aircraft/${aircraftId}`)
    .then(() => undefined)
    .catch(handleApiError);
}

/**
 * Get paginated users
 */
export function getAdminUsers(params: {
  page: number;
  pageSize: number;
}): Promise<{
  users: UserResponse[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  return apiClient
    .get<
      ApiResponse<{
        users: UserResponse[];
        totalCount: number;
        totalPages: number;
        currentPage: number;
      }>
    >("/admin/users", { params })
    .then(
      (response) =>
        response.data.data || {
          users: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: params.page,
        }
    )
    .catch(handleApiError);
}

/**
 * Get user by ID
 */
export function getUserById(userId: number): Promise<UserResponse | null> {
  return apiClient
    .get<ApiResponse<UserResponse>>(`/admin/users/${userId}`)
    .then((response) => response.data.data || null)
    .catch(handleApiError);
}

/**
 * Create a new user (admin only)
 */
export function createUser(userData: {
  Username: string;
  Password: string;
  FirstName: string;
  LastName: string;
  Email: string;
  IsAdmin: boolean;
}): Promise<UserResponse> {
  return apiClient
    .post<ApiResponse<UserResponse>>("/admin/users", userData)
    .then((response) => response.data.data!)
    .catch(handleApiError);
}

/**
 * Update an existing user
 */
export function updateUser(
  userId: number,
  userData: {
    FirstName?: string;
    LastName?: string;
    Email?: string;
    IsAdmin?: boolean;
  }
): Promise<UserResponse> {
  return apiClient
    .put<ApiResponse<UserResponse>>(`/admin/users/${userId}`, userData)
    .then((response) => response.data.data!)
    .catch(handleApiError);
}

/**
 * Delete a user
 */
export function deleteUser(userId: number): Promise<void> {
  return apiClient
    .delete<ApiResponse<null>>(`/admin/users/${userId}`)
    .then(() => undefined)
    .catch(handleApiError);
}

/**
 * Reset a user's password
 */
export function resetUserPassword(
  userId: number,
  newPassword: string
): Promise<void> {
  return apiClient
    .post<ApiResponse<null>>(`/admin/users/${userId}/reset-password`, {
      newPassword,
    })
    .then(() => undefined)
    .catch(handleApiError);
}

/**
 * Get paginated reservations
 */
export function getAdminReservations(params: {
  page: number;
  pageSize: number;
}): Promise<{
  reservations: ConvertedReservation[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  return apiClient
    .get<
      ApiResponse<{
        reservations: ReservationResponse[];
        totalCount: number;
        totalPages: number;
        currentPage: number;
      }>
    >("/admin/reservations", { params })
    .then((response) => {
      const data = response.data.data;
      if (!data) {
        return {
          reservations: [],
          totalCount: 0,
          totalPages: 0,
          currentPage: params.page,
        };
      }

      // Convert date strings to Date objects
      const reservationsWithDates = data.reservations.map(
        convertReservationDates
      );

      return {
        reservations: reservationsWithDates,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
      };
    })
    .catch(handleApiError);
}

/**
 * Get reservation by ID
 */
export function getAdminReservationById(
  reservationId: number
): Promise<ConvertedReservation | null> {
  return apiClient
    .get<ApiResponse<ReservationResponse>>(
      `/admin/reservations/${reservationId}`
    )
    .then((response) =>
      response.data.data ? convertReservationDates(response.data.data) : null
    )
    .catch(handleApiError);
}

/**
 * Delete a reservation (admin)
 */
export function deleteAdminReservation(reservationId: number): Promise<void> {
  return apiClient
    .delete<ApiResponse<null>>(`/admin/reservations/${reservationId}`)
    .then(() => undefined)
    .catch(handleApiError);
}

/**
 * Get all airports
 */
export function getAirports(): Promise<AirportResponse[]> {
  return apiClient
    .get<ApiResponse<AirportResponse[]>>("/airports")
    .then((response) => response.data.data || [])
    .catch(handleApiError);
}

/**
 * Get airport by ID
 */
export function getAirportById(
  airportId: number
): Promise<AirportResponse | null> {
  return apiClient
    .get<ApiResponse<AirportResponse>>(`/airports/${airportId}`)
    .then((response) => response.data.data || null)
    .catch(handleApiError);
}

/**
 * Create a new airport (admin only)
 */
export function createAirport(airportData: {
  Code: string;
  Name: string;
  City: string;
  Country: string;
}): Promise<AirportResponse> {
  return apiClient
    .post<ApiResponse<AirportResponse>>("/airports", airportData)
    .then((response) => response.data.data!)
    .catch(handleApiError);
}

/**
 * Update an existing airport (admin only)
 */
export function updateAirport(
  airportId: number,
  airportData: {
    Code: string;
    Name: string;
    City: string;
    Country: string;
  }
): Promise<AirportResponse> {
  return apiClient
    .put<ApiResponse<AirportResponse>>(`/airports/${airportId}`, airportData)
    .then((response) => response.data.data!)
    .catch(handleApiError);
}

/**
 * Delete an airport (admin only)
 */
export function deleteAirport(airportId: number): Promise<void> {
  return apiClient
    .delete<ApiResponse<null>>(`/airports/${airportId}`)
    .then(() => undefined)
    .catch(handleApiError);
}
