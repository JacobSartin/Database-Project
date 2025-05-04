// Request parameter interfaces
export interface UserIdParams {
  id: string;
}

export interface FlightIdParams {
  id: string;
}

export interface ReservationIdParams {
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

export interface CreateFlightBody {
  OriginAirportID: number;
  DestinationAirportID: number;
  AircraftID: number;
  DepartureTime: Date;
  ArrivalTime: Date;
}

export interface UpstringFlightBody {
  OriginAirportID: number;
  DestinationAirportID: number;
  AircraftID: number;
  DepartureTime: string;
  ArrivalTime: string;
}

export interface CreateAircraftBody {
  Model: string;
  Manufacturer: string;
  TotalSeats: number;
}

export interface CreateAirportBody {
  Code: string;
  Name: string;
  City: string;
  Country: string;
}

// Request query interfaces
export interface SearchFlightQuery {
  origin?: string;
  destination?: string;
  departureDate?: Date;
  returnDate?: Date;
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

export interface AirportResponse {
  AirportID: number;
  Code: string;
  Name: string;
  City: string;
  Country: string;
}

export interface AircraftResponse {
  AircraftID: number;
  Model: string;
  Manufacturer: string;
  TotalSeats: number;
}

export interface SeatResponse {
  SeatID: number;
  FlightID: number;
  SeatNumber: string;
  IsBooked: boolean;
  reservation?: ReservationResponse;
}

export interface FlightResponse {
  FlightID: number;
  AircraftID: number;
  OriginAirportID: number;
  DestinationAirportID: number;
  DepartureTime: string;
  ArrivalTime: string;
  aircraft?: AircraftResponse;
  originAirport?: AirportResponse;
  destinationAirport?: AirportResponse;
  seats?: SeatResponse[];
}

export interface ReservationResponse {
  ReservationID: number;
  UserID: number;
  FlightID: number;
  SeatID: number;
  BookingTime: string;
  flight?: FlightResponse;
  seat?: SeatResponse;
}

export interface SearchFlightResponse {
  outbound: FlightResponse[];
  return?: FlightResponse[];
}

export interface DashboardStatsResponse {
  totalFlights: number;
  totalUsers: number;
  totalAircraft: number;
  totalReservations: number;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}

export interface UpdateFlightBody {
  OriginAirportID: number;
  DestinationAirportID: number;
  AircraftID: number;
  DepartureTime: Date;
  ArrivalTime: Date;
}
