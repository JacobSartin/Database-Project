// API service for backend communication
import {
  Flight,
  Seat,
  AirportOption,
  ApiResponse,
  UserResponse,
  LoginRequestBody,
  RegisterRequestBody,
  CreateReservationBody,
  SearchFlightQuery as SearchFlightParams,
  Reservation,
  Airport,
} from "../types/shared";
import {
  formatDateTime,
  formatDuration,
  convertToAirportOption,
} from "../utils/formatUtils";

// Base API URL - should match the backend server address
const API_BASE_URL = "http://localhost:5000/api";

// Error handling helper
const handleApiError = (error: unknown): never => {
  console.error("API Error:", error);
  throw new Error(error instanceof Error ? error.message : "Unknown API error");
};

// Auth APIs
export const register = async (
  userData: RegisterRequestBody
): Promise<ApiResponse<UserResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
      credentials: "include", // Include cookies for auth
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! Status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

export const login = async (
  credentials: LoginRequestBody
): Promise<ApiResponse<UserResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include", // Include cookies for auth
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! Status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

export const logout = async (): Promise<ApiResponse<null>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/logout`, {
      method: "POST",
      credentials: "include", // Include cookies for auth
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! Status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

export const getCurrentUser = async (): Promise<ApiResponse<UserResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      credentials: "include", // Include cookies for auth
    });

    if (!response.ok) {
      // If 401 or 403, token is invalid or expired
      if (response.status === 401 || response.status === 403) {
        throw new Error("Authentication token is invalid or expired");
      }

      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! Status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Airports API
export const fetchAirports = async (): Promise<AirportOption[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/airports`);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const apiResponse: ApiResponse<Airport[]> = await response.json();

    if (!apiResponse.data) {
      return [];
    }

    return apiResponse.data.map(convertToAirportOption);
  } catch (error) {
    return handleApiError(error);
  }
};

// Define interface for the structure returned by search flights API
interface FlightSearchResponse {
  outbound: FlightData[];
  return?: FlightData[];
}

// Raw flight data structure returned from API
interface FlightData {
  FlightID: number;
  AircraftID: number;
  OriginAirportID: number;
  DestinationAirportID: number;
  DepartureTime: string;
  ArrivalTime: string;
  originAirport?: {
    Code: string;
    Name: string;
  };
  destinationAirport?: {
    Code: string;
    Name: string;
  };
  aircraft?: {
    Model: string;
  };
}

// Flights API
export const searchFlights = async (
  searchParams: SearchFlightParams
): Promise<Flight[]> => {
  try {
    const { origin, destination, departureDate, returnDate } = searchParams;
    let url = `${API_BASE_URL}/flights/search?origin=${origin}&destination=${destination}&departureDate=${departureDate}`;

    if (returnDate) {
      url += `&returnDate=${returnDate}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const apiResponse: ApiResponse<FlightSearchResponse> =
      await response.json();

    if (!apiResponse.data || !apiResponse.data.outbound) {
      return [];
    }

    // Map the API response to our Flight type
    return apiResponse.data.outbound.map((flight: FlightData) => ({
      flightId: flight.FlightID,
      aircraftId: flight.AircraftID,
      originAirportId: flight.OriginAirportID,
      destinationAirportId: flight.DestinationAirportID,
      departureTime: flight.DepartureTime,
      arrivalTime: flight.ArrivalTime,
      originCode: flight.originAirport?.Code ?? "",
      destinationCode: flight.destinationAirport?.Code ?? "",
      originName: flight.originAirport?.Name ?? "",
      destinationName: flight.destinationAirport?.Name ?? "",
      aircraftModel: flight.aircraft?.Model ?? "",
    }));
  } catch (error) {
    return handleApiError(error);
  }
};

// Get flight by ID
export const getFlightById = async (
  flightId: number
): Promise<Flight | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/flights/${flightId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const apiResponse: ApiResponse<FlightData> = await response.json();

    if (!apiResponse.data) {
      return null;
    }

    const flight = apiResponse.data;

    return {
      flightId: flight.FlightID,
      aircraftId: flight.AircraftID,
      originAirportId: flight.OriginAirportID,
      destinationAirportId: flight.DestinationAirportID,
      departureTime: flight.DepartureTime,
      arrivalTime: flight.ArrivalTime,
      originCode: flight.originAirport?.Code ?? "",
      destinationCode: flight.destinationAirport?.Code ?? "",
      originName: flight.originAirport?.Name ?? "",
      destinationName: flight.destinationAirport?.Name ?? "",
      aircraftModel: flight.aircraft?.Model ?? "",
    };
  } catch (error) {
    return handleApiError(error);
  }
};

// Raw seat data structure from API
interface SeatData {
  SeatID: number;
  FlightID: number;
  SeatNumber: string;
  IsBooked: boolean | number;
  reservation?: unknown;
}

// Seats API
export const fetchAvailableSeats = async (
  flightId: number
): Promise<Seat[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/flights/${flightId}/seats`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const apiResponse: ApiResponse<SeatData[]> = await response.json();

    if (!apiResponse.data) {
      return [];
    }

    return apiResponse.data.map((seat: SeatData) => ({
      seatId: seat.SeatID,
      flightId: seat.FlightID,
      seatNumber: seat.SeatNumber,
      isBooked: seat.IsBooked === 1 || seat.IsBooked === true,
    }));
  } catch (error) {
    return handleApiError(error);
  }
};

// Reservations API
export const createReservation = async (
  reservationData: Omit<CreateReservationBody, "userId">
): Promise<ApiResponse<Reservation>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/reservations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationData),
      credentials: "include", // Include cookies for auth
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! Status: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Get user reservations
export const getUserReservations = async (
  userId: number
): Promise<Reservation[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/users/${userId}/reservations`,
      {
        credentials: "include", // Include cookies for auth
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const apiResponse: ApiResponse<Reservation[]> = await response.json();

    if (!apiResponse.data) {
      return [];
    }

    return apiResponse.data;
  } catch (error) {
    return handleApiError(error);
  }
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
};
