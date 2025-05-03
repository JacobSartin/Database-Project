// API service for backend communication
import {
  formatDateTime,
  formatDuration,
  convertToAirportOption,
} from "../utils/formatUtils";

import {
  FlightAttributes,
  SeatAttributes,
  ReservationAttributes,
  UserAttributes,
  AirportAttributes,
} from "../../../backend/src/types/modelDTOs";

// Base API URL - should match the backend server address
const API_BASE_URL = "http://localhost:5000/api";

// Error handling helper
const handleApiError = (error: unknown) => {
  throw new Error(error instanceof Error ? error.message : "Unknown API error");
};

const fetchJson = async (url: string, options?: RequestInit) => {
  const response = await fetch(url, options);
  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      /* empty */
    }
    throw new Error(
      (errorData as { error?: string })?.error ||
        `HTTP error! Status: ${response.status}`
    );
  }
  return response.json() as Promise<unknown>;
};

// Local API response type for type safety
interface ApiResponse<T> {
  data: T;
  [key: string]: unknown;
}

// Use imported DTOs for all API response typing and mapping
interface ApiResponse<T> {
  message: string;
  data: T;
  error?: string;
}

export const register = (userData: UserAttributes) =>
  fetchJson(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
    credentials: "include",
  }).catch(handleApiError);

export const login = (credentials: { Username: string; Password: string }) =>
  fetchJson(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
    credentials: "include",
  }).catch(handleApiError);

export const logout = () =>
  fetchJson(`${API_BASE_URL}/users/logout`, {
    method: "POST",
    credentials: "include",
  }).catch(handleApiError);

export const getCurrentUser = () =>
  fetchJson(`${API_BASE_URL}/users/profile`, {
    credentials: "include",
  }).catch(handleApiError);

export const fetchAirports = async () => {
  const res = (await fetchJson(`${API_BASE_URL}/airports`)) as ApiResponse<
    AirportAttributes[]
  >;
  return res.data ? res.data.map(convertToAirportOption) : [];
};

export const searchFlights = async (params: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
}) => {
  const { origin, destination, departureDate, returnDate } = params;
  let url = `${API_BASE_URL}/flights/search?origin=${origin}&destination=${destination}&departureDate=${departureDate}`;
  if (returnDate) url += `&returnDate=${returnDate}`;
  const res = (await fetchJson(url)) as ApiResponse<{
    outbound: FlightAttributes[];
    return?: FlightAttributes[];
  }>;
  return res.data && res.data.outbound
    ? res.data.outbound.map((f) => ({
        ...f,
        DepartureTime: new Date(f.DepartureTime),
        ArrivalTime: new Date(f.ArrivalTime),
      }))
    : [];
};

export const getFlightById = async (FlightID: number) => {
  const res = (await fetchJson(
    `${API_BASE_URL}/flights/${FlightID}`
  )) as ApiResponse<FlightAttributes>;
  const f = res.data;
  return f
    ? {
        ...f,
        DepartureTime: new Date(f.DepartureTime),
        ArrivalTime: new Date(f.ArrivalTime),
      }
    : null;
};

export const fetchAvailableSeats = async (FlightID: number) => {
  const res = (await fetchJson(
    `${API_BASE_URL}/flights/${FlightID}/seats`
  )) as ApiResponse<SeatAttributes[]>;
  return res.data ? res.data.map((s) => ({ ...s })) : [];
};

export const createReservation = (
  reservationData: Omit<
    ReservationAttributes,
    "ReservationID" | "BookingTime" | "createdAt" | "updatedAt" | "UserID"
  >
) =>
  fetchJson(`${API_BASE_URL}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reservationData),
    credentials: "include",
  }).catch(handleApiError);

export const getUserReservations = async (UserID: number) => {
  const res = (await fetchJson(`${API_BASE_URL}/users/${UserID}/reservations`, {
    credentials: "include",
  })) as ApiResponse<ReservationAttributes[]>;
  return res.data
    ? res.data.map((r) => ({
        ...r,
        BookingTime: r.BookingTime ? new Date(r.BookingTime) : undefined,
        flight: r.flight
          ? {
              ...r.flight,
              DepartureTime: r.flight.DepartureTime
                ? new Date(r.flight.DepartureTime)
                : undefined,
              ArrivalTime: r.flight.ArrivalTime
                ? new Date(r.flight.ArrivalTime)
                : undefined,
            }
          : undefined,
        createdAt: r.createdAt ? new Date(r.createdAt) : undefined,
        updatedAt: r.updatedAt ? new Date(r.updatedAt) : undefined,
      }))
    : [];
};

export const deleteReservation = async (reservationId: number) => {
  return fetchJson(`${API_BASE_URL}/reservations/${reservationId}`, {
    method: "DELETE",
    credentials: "include",
  });
};

export { formatDateTime, formatDuration };

export default {
  register,
  login,
  logout,
  getCurrentUser,
  fetchAirports,
  searchFlights,
  getFlightById,
  fetchAvailableSeats,
  createReservation,
  getUserReservations,
  deleteReservation,
};
