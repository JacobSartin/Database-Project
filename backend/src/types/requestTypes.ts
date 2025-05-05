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

export interface AirportIdParams {
  id: string;
}

export interface AircraftIdParams {
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
  UserID: number;
}

export interface CreateFlightBody {
  OriginAirportID: number;
  DestinationAirportID: number;
  AircraftID: number;
  DepartureTime: Date;
  ArrivalTime: Date;
}

export interface UpdateFlightBody {
  OriginAirportID: number;
  DestinationAirportID: number;
  AircraftID: number;
  DepartureTime: Date;
  ArrivalTime: Date;
}

export interface CreateAircraftBody {
  Model: string;
  TotalSeats: number;
}

export interface UpdateAircraftBody {
  Model: string;
  TotalSeats: number;
}

export interface CreateAirportBody {
  Code: string;
  Name: string;
  City: string;
  Country: string;
}

export interface UpdateAirportBody {
  Code: string;
  Name: string;
  City: string;
  Country: string;
}

export interface UpdateUserBody {
  FirstName: string;
  LastName: string;
  Email: string;
  IsAdmin: boolean;
  IsActive: boolean;
}

export interface CreateUserBody {
  Username: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;
  IsAdmin: boolean;
}

export interface ResetPasswordBody {
  newPassword: string;
}

export interface UpdateReservationBody {
  UserID?: number;
  FlightID?: number;
  SeatID?: number;
}

// Request query interfaces
export interface SearchFlightQuery {
  origin: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
}

export interface UserQueryParams {
  page?: string;
  pageSize?: string;
  search?: string;
  role?: string;
}

export interface FlightQueryParams {
  page?: string;
  pageSize?: string;
}

export interface AircraftQueryParams {
  page?: string;
  pageSize?: string;
  search?: string;
}

export interface ReservationQueryParams {
  page?: string;
  pageSize?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

// Response interfaces
export interface UserResponse {
  UserID: number;
  Username: string;
  Email: string;
  FirstName: string;
  LastName: string;
  isAdmin?: boolean;
  Password?: string;
  ReservationCount?: number;
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
  user?: UserResponse;
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
