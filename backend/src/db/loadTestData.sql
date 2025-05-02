-- Load Test Data Only
-- This script assumes tables already exist and are empty

-- Sample Users (PasswordHash is 'password' for all users, properly hashed with Argon2)
INSERT INTO "Users" ("Username", "PasswordHash", "Email", "FirstName", "LastName", "Admin", "createdAt", "updatedAt") VALUES
('admin', '$argon2id$v=19$m=19456,t=2,p=1$dQ4LdsBJ8BfVtYDXeFlusQ$U47hkgO0OAOzRdZBAq9+TqIFSchcvyXJoplapcYSGD4', 'admin@flyair.com', 'System', 'Admin', TRUE, NOW(), NOW()),
('john_doe', '$argon2id$v=19$m=19456,t=2,p=1$84B2+REaP5PeK7P4wxjNOA$/e+YIlrMXU7k6zISs95i8BywA3uYq1E5DfAE5Xkmba0', 'john.doe@example.com', 'John', 'Doe', FALSE, NOW(), NOW()),
('jane_smith', '$argon2id$v=19$m=19456,t=2,p=1$AgdPAnCU+EYh2f/XGl8BCA$jqcvkHtfee8MvBsC1muLIPos/KYB665MXvSv3dRCjeQ', 'jane.smith@example.com', 'Jane', 'Smith', FALSE, NOW(), NOW()),
('robert_johnson', '$argon2id$v=19$m=19456,t=2,p=1$Bx+CfvF6HRkI87kPp6DNdA$SVOIFLVe76C41Qy96rrGArAX09kMDi53uZNkzfm2IDM', 'robert.johnson@example.com', 'Robert', 'Johnson', FALSE, NOW(), NOW()),
('susan_williams', '$argon2id$v=19$m=19456,t=2,p=1$mRYYMsI5qFF5dTluPOt+IA$2S62tQoP+rkFKddeAgA69C+SyCTHe0gOyI+uO9CIYv4', 'susan.williams@example.com', 'Susan', 'Williams', FALSE, NOW(), NOW()),
('michael_brown', '$argon2id$v=19$m=19456,t=2,p=1$KEDxwzIFlz7F4ttz+33ylA$7540qwD2joTap0S4HLzQmK1Svzc+hGR32RU3+Ibmigc', 'michael.brown@example.com', 'Michael', 'Brown', FALSE, NOW(), NOW()),
('emily_davis', '$argon2id$v=19$m=19456,t=2,p=1$Mmr5e8NdskLa+juJZiawLg$wEE7QfauV3XUIyZiJhu0AZVoxMu/q0gMBOGt1eeOWEQ', 'emily.davis@example.com', 'Emily', 'Davis', FALSE, NOW(), NOW()),
('david_miller', '$argon2id$v=19$m=19456,t=2,p=1$mhDaW6e0qszqALBrQvNdRw$Mcbwp5hP3s7YHO1m/bO4XRxKkJp7M/baH58Z7Se4Q8Y', 'david.miller@example.com', 'David', 'Miller', FALSE, NOW(), NOW()),
('lisa_wilson', '$argon2id$v=19$m=19456,t=2,p=1$eZp4PEiI6ATNjMS1pBGlQA$eyFdnN8tUaFJER9oRq8QEc4e/W6n0pkIhYAt00x7ABw', 'lisa.wilson@example.com', 'Lisa', 'Wilson', FALSE, NOW(), NOW()),
('james_taylor', '$argon2id$v=19$m=19456,t=2,p=1$1gp/FhiRWzHApvUWrFsSEA$dThB+UYcjIzl640XYrj398tT63eiVTwDpZ3HIrXE10o', 'james.taylor@example.com', 'James', 'Taylor', FALSE, NOW(), NOW());

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

-- Initialize aircraft positions (each aircraft starts at a random airport)
CREATE TEMPORARY TABLE AircraftPositions (
    AircraftID INTEGER PRIMARY KEY,
    CurrentAirportID INTEGER,
    AvailableFrom TIMESTAMP
);

INSERT INTO AircraftPositions (AircraftID, CurrentAirportID, AvailableFrom)
SELECT 
    a."AircraftID", 
    airports."AirportID",
    '2025-05-01 06:00:00'::TIMESTAMP -- All aircraft start available from May 1, 2025 at 6 AM
FROM "Aircraft" a
CROSS JOIN (
    SELECT "AirportID" FROM "Airports" ORDER BY RANDOM() LIMIT 1
) airports;

-- Generate realistic flight schedule for 14 days (May 1-14, 2025)
DO $$
DECLARE
    start_date DATE := '2025-05-01';
    end_date DATE := '2025-05-14';
    current_date DATE;
    origin_airport RECORD;
    destination_airport RECORD;
    aircraft RECORD;
    flight_duration INTERVAL;
    departure_time TIMESTAMP;
    arrival_time TIMESTAMP;
    turnaround_time INTERVAL := '1 hour'::INTERVAL; -- Time needed between flights for the same aircraft
    min_daily_flights INTEGER := 3; -- Minimum number of city pairs per day
    max_daily_flights INTEGER := 6; -- Maximum number of city pairs per day
    daily_flights INTEGER;
    flight_id INTEGER;
BEGIN
    -- Loop through each day in the schedule period
    current_date := start_date;
    WHILE current_date <= end_date LOOP
        -- Loop through each aircraft to schedule its flights for the day
        FOR aircraft IN SELECT ap.AircraftID, ap.CurrentAirportID, ap.AvailableFrom, a."Model"
                      FROM AircraftPositions ap
                      JOIN "Aircraft" a ON ap.AircraftID = a."AircraftID"
        LOOP
            -- Keep scheduling flights until the aircraft runs out of time in the day
            WHILE (aircraft.AvailableFrom AT TIME ZONE 'UTC')::DATE = current_date 
                  AND (aircraft.AvailableFrom + INTERVAL '2 hours') < (current_date + INTERVAL '1 day')
            LOOP
                -- Find a random destination airport (different from current location)
                SELECT * INTO destination_airport 
                FROM "Airports"
                WHERE "AirportID" != aircraft.CurrentAirportID
                ORDER BY RANDOM()
                LIMIT 1;
                
                IF NOT FOUND THEN
                    EXIT; -- No valid destination found
                END IF;
                
                -- Get origin airport details
                SELECT * INTO origin_airport
                FROM "Airports"
                WHERE "AirportID" = aircraft.CurrentAirportID;
                
                -- Calculate a realistic flight duration based on airports
                -- In a real system, this would be more sophisticated based on distance
                -- Here we're using a simplified approach with random duration between 1 and 10 hours
                flight_duration := (RANDOM() * 9 + 1) * INTERVAL '1 hour';
                
                -- Set departure time (from when aircraft is available plus minimum ground time)
                departure_time := aircraft.AvailableFrom + (RANDOM() * 30 * INTERVAL '1 minute');
                arrival_time := departure_time + flight_duration;
                
                -- Create the flight
                INSERT INTO "Flights" (
                    "AircraftID", "OriginAirportID", "DestinationAirportID", 
                    "DepartureTime", "ArrivalTime", "createdAt", "updatedAt"
                )
                VALUES (
                    aircraft.AircraftID, aircraft.CurrentAirportID, destination_airport."AirportID",
                    departure_time, arrival_time, NOW(), NOW()
                )
                RETURNING "FlightID" INTO flight_id;
                
                -- Update aircraft position to the new airport and availability time
                UPDATE AircraftPositions 
                SET 
                    CurrentAirportID = destination_airport."AirportID",
                    AvailableFrom = arrival_time + turnaround_time
                WHERE AircraftID = aircraft.AircraftID;
                
                -- Re-fetch aircraft record with updated availability
                SELECT ap.AircraftID, ap.CurrentAirportID, ap.AvailableFrom, a."Model"
                INTO aircraft
                FROM AircraftPositions ap
                JOIN "Aircraft" a ON ap.AircraftID = a."AircraftID"
                WHERE ap.AircraftID = aircraft.AircraftID;
            END LOOP;
            
            -- If aircraft is done for the day, make it available early next morning
            IF (aircraft.AvailableFrom AT TIME ZONE 'UTC')::DATE > current_date THEN
                -- Aircraft is already scheduled into the next day, leave it as is
                NULL;
            ELSE
                -- Aircraft has finished for the day, make it available next morning at 6 AM
                UPDATE AircraftPositions 
                SET AvailableFrom = (current_date + INTERVAL '1 day' + INTERVAL '6 hours')
                WHERE AircraftID = aircraft.AircraftID;
            END IF;
        END LOOP;
        
        -- Move to next day
        current_date := current_date + INTERVAL '1 day';
    END LOOP;
END $$;

-- Generate seats for each flight
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