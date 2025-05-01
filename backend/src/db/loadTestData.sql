-- Load Test Data Only
-- This script assumes tables already exist and are empty

-- Sample Users (PasswordHash is 'password' for all users, properly hashed with Argon2)
INSERT INTO "Users" ("Username", "PasswordHash", "Email", "Admin", "createdAt", "updatedAt") VALUES
('admin', '$argon2id$v=19$m=19456,t=2,p=1$dQ4LdsBJ8BfVtYDXeFlusQ$U47hkgO0OAOzRdZBAq9+TqIFSchcvyXJoplapcYSGD4', 'admin@flyair.com', TRUE, NOW(), NOW()),
('john_doe', '$argon2id$v=19$m=19456,t=2,p=1$84B2+REaP5PeK7P4wxjNOA$/e+YIlrMXU7k6zISs95i8BywA3uYq1E5DfAE5Xkmba0', 'john.doe@example.com', FALSE, NOW(), NOW()),
('jane_smith', '$argon2id$v=19$m=19456,t=2,p=1$AgdPAnCU+EYh2f/XGl8BCA$jqcvkHtfee8MvBsC1muLIPos/KYB665MXvSv3dRCjeQ', 'jane.smith@example.com', FALSE, NOW(), NOW()),
('robert_johnson', '$argon2id$v=19$m=19456,t=2,p=1$Bx+CfvF6HRkI87kPp6DNdA$SVOIFLVe76C41Qy96rrGArAX09kMDi53uZNkzfm2IDM', 'robert.johnson@example.com', FALSE, NOW(), NOW()),
('susan_williams', '$argon2id$v=19$m=19456,t=2,p=1$mRYYMsI5qFF5dTluPOt+IA$2S62tQoP+rkFKddeAgA69C+SyCTHe0gOyI+uO9CIYv4', 'susan.williams@example.com', FALSE, NOW(), NOW()),
('michael_brown', '$argon2id$v=19$m=19456,t=2,p=1$KEDxwzIFlz7F4ttz+33ylA$7540qwD2joTap0S4HLzQmK1Svzc+hGR32RU3+Ibmigc', 'michael.brown@example.com', FALSE, NOW(), NOW()),
('emily_davis', '$argon2id$v=19$m=19456,t=2,p=1$Mmr5e8NdskLa+juJZiawLg$wEE7QfauV3XUIyZiJhu0AZVoxMu/q0gMBOGt1eeOWEQ', 'emily.davis@example.com', FALSE, NOW(), NOW()),
('david_miller', '$argon2id$v=19$m=19456,t=2,p=1$mhDaW6e0qszqALBrQvNdRw$Mcbwp5hP3s7YHO1m/bO4XRxKkJp7M/baH58Z7Se4Q8Y', 'david.miller@example.com', FALSE, NOW(), NOW()),
('lisa_wilson', '$argon2id$v=19$m=19456,t=2,p=1$eZp4PEiI6ATNjMS1pBGlQA$eyFdnN8tUaFJER9oRq8QEc4e/W6n0pkIhYAt00x7ABw', 'lisa.wilson@example.com', FALSE, NOW(), NOW()),
('james_taylor', '$argon2id$v=19$m=19456,t=2,p=1$1gp/FhiRWzHApvUWrFsSEA$dThB+UYcjIzl640XYrj398tT63eiVTwDpZ3HIrXE10o', 'james.taylor@example.com', FALSE, NOW(), NOW());

-- Sample Airports
INSERT INTO "Airports" ("Code", "Name", "City", "Country", "createdAt", "updatedAt") VALUES
('JFK', 'John F. Kennedy International Airport', 'New York', 'United States', NOW(), NOW()),
('LAX', 'Los Angeles International Airport', 'Los Angeles', 'United States', NOW(), NOW()),
('LHR', 'London Heathrow Airport', 'London', 'United Kingdom', NOW(), NOW()),
('CDG', 'Paris Charles de Gaulle Airport', 'Paris', 'France', NOW(), NOW()),
('HND', 'Tokyo Haneda Airport', 'Tokyo', 'Japan', NOW(), NOW()),
('SYD', 'Sydney Airport', 'Sydney', 'Australia', NOW(), NOW()),
('DXB', 'Dubai International Airport', 'Dubai', 'United Arab Emirates', NOW(), NOW()),
('SIN', 'Singapore Changi Airport', 'Singapore', 'Singapore', NOW(), NOW()),
('AMS', 'Amsterdam Airport Schiphol', 'Amsterdam', 'Netherlands', NOW(), NOW()),
('FRA', 'Frankfurt Airport', 'Frankfurt', 'Germany', NOW(), NOW()),
('MAD', 'Adolfo Suárez Madrid–Barajas Airport', 'Madrid', 'Spain', NOW(), NOW()),
('FCO', 'Leonardo da Vinci–Fiumicino Airport', 'Rome', 'Italy', NOW(), NOW()),
('YYZ', 'Toronto Pearson International Airport', 'Toronto', 'Canada', NOW(), NOW()),
('PEK', 'Beijing Capital International Airport', 'Beijing', 'China', NOW(), NOW()),
('ICN', 'Incheon International Airport', 'Seoul', 'South Korea', NOW(), NOW());

-- Sample Aircraft
INSERT INTO "Aircraft" ("Model", "TotalSeats", "createdAt", "updatedAt") VALUES
('Boeing 747', 366, NOW(), NOW()),
('Boeing 777', 312, NOW(), NOW()),
('Boeing 787 Dreamliner', 296, NOW(), NOW()),
('Airbus A320', 180, NOW(), NOW()),
('Airbus A330', 277, NOW(), NOW()),
('Airbus A350', 325, NOW(), NOW()),
('Airbus A380', 525, NOW(), NOW()),
('Bombardier CRJ', 90, NOW(), NOW()),
('Embraer E190', 114, NOW(), NOW()),
('Boeing 737', 189, NOW(), NOW());

-- Sample Flights (dates are in the future from April 28, 2025)
INSERT INTO "Flights" ("AircraftID", "OriginAirportID", "DestinationAirportID", "DepartureTime", "ArrivalTime", "createdAt", "updatedAt") VALUES
-- JFK to LAX (New York to Los Angeles)
(1, 1, 2, '2025-05-01 08:00:00', '2025-05-01 11:30:00', NOW(), NOW()),
(3, 1, 2, '2025-05-02 10:00:00', '2025-05-02 13:30:00', NOW(), NOW()),
(5, 1, 2, '2025-05-03 14:00:00', '2025-05-03 17:30:00', NOW(), NOW()),
-- LAX to JFK (Los Angeles to New York)
(1, 2, 1, '2025-05-01 13:00:00', '2025-05-01 21:30:00', NOW(), NOW()),
(2, 2, 1, '2025-05-02 15:00:00', '2025-05-02 23:30:00', NOW(), NOW()),
-- JFK to LHR (New York to London)
(6, 1, 3, '2025-05-05 20:00:00', '2025-05-06 08:00:00', NOW(), NOW()),
(7, 1, 3, '2025-05-06 22:00:00', '2025-05-07 10:00:00', NOW(), NOW()),
-- LHR to JFK (London to New York)
(6, 3, 1, '2025-05-07 10:30:00', '2025-05-07 13:30:00', NOW(), NOW()),
(7, 3, 1, '2025-05-08 12:30:00', '2025-05-08 15:30:00', NOW(), NOW()),
-- CDG to LHR (Paris to London)
(4, 4, 3, '2025-05-10 09:00:00', '2025-05-10 09:45:00', NOW(), NOW()),
(8, 4, 3, '2025-05-11 11:00:00', '2025-05-11 11:45:00', NOW(), NOW()),
-- LHR to CDG (London to Paris)
(4, 3, 4, '2025-05-10 11:00:00', '2025-05-10 11:45:00', NOW(), NOW()),
(8, 3, 4, '2025-05-11 13:00:00', '2025-05-11 13:45:00', NOW(), NOW()),
-- HND to PEK (Tokyo to Beijing)
(2, 5, 14, '2025-05-15 10:00:00', '2025-05-15 13:00:00', NOW(), NOW()),
-- PEK to HND (Beijing to Tokyo)
(2, 14, 5, '2025-05-16 14:00:00', '2025-05-16 17:00:00', NOW(), NOW()),
-- SYD to SIN (Sydney to Singapore)
(3, 6, 8, '2025-05-20 23:00:00', '2025-05-21 05:00:00', NOW(), NOW()),
-- SIN to SYD (Singapore to Sydney)
(3, 8, 6, '2025-05-22 01:00:00', '2025-05-22 07:00:00', NOW(), NOW()),
-- DXB to AMS (Dubai to Amsterdam)
(5, 7, 9, '2025-05-25 02:00:00', '2025-05-25 07:00:00', NOW(), NOW()),
-- AMS to DXB (Amsterdam to Dubai)
(5, 9, 7, '2025-05-26 09:00:00', '2025-05-26 14:00:00', NOW(), NOW()),
-- FRA to MAD (Frankfurt to Madrid)
(4, 10, 11, '2025-06-01 14:00:00', '2025-06-01 16:30:00', NOW(), NOW()),
-- MAD to FRA (Madrid to Frankfurt)
(4, 11, 10, '2025-06-02 17:30:00', '2025-06-02 20:00:00', NOW(), NOW());

-- Generate seats for each flight
-- This procedure will auto-generate seats for all flights

-- First, declare a function to generate seat letters (A-F for economy class planes)
DO $$
DECLARE
    flight_rec RECORD;
    aircraft_seats INTEGER;
    seat_letter CHAR(1);
    seat_row INTEGER;
    letters CHAR(6) := 'ABCDEF';
    current_timestamp TIMESTAMP := NOW();
BEGIN
    -- Loop through all flights
    FOR flight_rec IN SELECT f."FlightID", a."TotalSeats" 
                      FROM "Flights" f
                      JOIN "Aircraft" a ON f."AircraftID" = a."AircraftID"
    LOOP
        aircraft_seats := flight_rec."TotalSeats";
        
        -- Calculate how many rows based on 6 seats per row (A-F)
        FOR seat_row IN 1..CEIL(aircraft_seats / 6)
        LOOP
            -- For each row, create seats A through F (or less if at the last row)
            FOR i IN 1..LEAST(6, aircraft_seats - ((seat_row-1) * 6))
            LOOP
                seat_letter := SUBSTRING(letters FROM i FOR 1);
                
                -- Insert the seat
                INSERT INTO "Seats" ("FlightID", "SeatNumber", "IsBooked", "createdAt", "updatedAt")
                VALUES (flight_rec."FlightID", seat_row || seat_letter, FALSE, current_timestamp, current_timestamp);
            END LOOP;
        END LOOP;
    END LOOP;
END $$;

-- Create some sample reservations (booking about 20% of available seats)
DO $$
DECLARE
    user_count INTEGER;
    total_seats INTEGER;
    random_user INTEGER;
    random_seat RECORD;
    booking_time TIMESTAMP;
    current_timestamp TIMESTAMP := NOW();
BEGIN
    -- Get the count of users and seats
    SELECT COUNT(*) INTO user_count FROM "Users";
    SELECT COUNT(*) INTO total_seats FROM "Seats";
    
    -- Reserve approximately 20% of seats
    FOR i IN 1..CEIL(total_seats * 0.2)
    LOOP
        -- Select a random user
        random_user := FLOOR(RANDOM() * user_count) + 1;
        
        -- Find a random seat that is not booked
        SELECT "SeatID", "FlightID" 
        INTO random_seat 
        FROM "Seats" 
        WHERE NOT "IsBooked" 
        ORDER BY RANDOM() 
        LIMIT 1;
        
        -- If we found an available seat, book it
        IF FOUND THEN
            -- Generate a random booking time in the last 30 days
            booking_time := current_timestamp - (RANDOM() * INTERVAL '30 days');
            
            -- Mark the seat as booked
            UPDATE "Seats" SET "IsBooked" = TRUE, "updatedAt" = current_timestamp WHERE "SeatID" = random_seat."SeatID";
            
            -- Create the reservation
            INSERT INTO "Reservations" ("UserID", "FlightID", "SeatID", "BookingTime", "createdAt", "updatedAt")
            VALUES (
                random_user,
                random_seat."FlightID",
                random_seat."SeatID",
                booking_time,
                current_timestamp,
                current_timestamp
            );
        END IF;
    END LOOP;
END $$;