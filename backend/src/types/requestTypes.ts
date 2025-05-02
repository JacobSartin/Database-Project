// Request parameter interfaces
export interface UserIdParams {
  id: string;
}

export interface FlightIdParams {
  id: string;
}

// Request body interfaces
export interface RegisterRequestBody {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequestBody {
  username: string;
  password: string;
}

export interface CreateReservationBody {
  FlightID: number;
  SeatID: number;
}

// Request query interfaces
export interface SearchFlightQuery {
  origin?: string;
  destination?: string;
  departureDate?: string;
  returnDate?: string;
}

// Response interfaces
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
