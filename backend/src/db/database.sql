-- Users Table
CREATE TABLE Users (
    UserID SERIAL PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Username VARCHAR(50) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Email VARCHAR(100),
    Admin BOOLEAN DEFAULT false
);

-- Airports Table
CREATE TABLE Airports (
    AirportID SERIAL PRIMARY KEY,
    Code CHAR(3) NOT NULL UNIQUE,
    Name VARCHAR(100) NOT NULL,
    City VARCHAR(100) NOT NULL,
    Country VARCHAR(100) NOT NULL
);

-- Aircraft Table
CREATE TABLE Aircraft (
    AircraftID SERIAL PRIMARY KEY,
    Model VARCHAR(100) NOT NULL,
    TotalSeats INT NOT NULL
);

-- Flights Table
CREATE TABLE Flights (
    FlightID SERIAL PRIMARY KEY,
    AircraftID INT NOT NULL,
    OriginAirportID INT NOT NULL,
    DestinationAirportID INT NOT NULL,
    DepartureTime TIMESTAMP NOT NULL,
    ArrivalTime TIMESTAMP NOT NULL,
    FOREIGN KEY (AircraftID) REFERENCES Aircraft(AircraftID),
    FOREIGN KEY (OriginAirportID) REFERENCES Airports(AirportID),
    FOREIGN KEY (DestinationAirportID) REFERENCES Airports(AirportID)
);

-- Seats Table
CREATE TABLE Seats (
    SeatID SERIAL PRIMARY KEY,
    FlightID INT NOT NULL,
    SeatNumber VARCHAR(5) NOT NULL, -- e.g., '12A', '3F'
    IsBooked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (FlightID) REFERENCES Flights(FlightID) ON DELETE CASCADE -- Cascade delete if flight is removed
);

-- Reservations Table
CREATE TABLE Reservations (
    ReservationID SERIAL PRIMARY KEY,
    UserID INT NOT NULL,
    FlightID INT NOT NULL,
    SeatID INT NOT NULL, -- Linking directly to the specific seat booked
    BookingTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (FlightID) REFERENCES Flights(FlightID),
    FOREIGN KEY (SeatID) REFERENCES Seats(SeatID)
);

CREATE INDEX idx_flight_origin ON Flights(OriginAirportID);
CREATE INDEX idx_flight_destination ON Flights(DestinationAirportID);
CREATE INDEX idx_flight_departure ON Flights(DepartureTime);
CREATE INDEX idx_reservation_user ON Reservations(UserID);
CREATE INDEX idx_reservation_flight ON Reservations(FlightID);
