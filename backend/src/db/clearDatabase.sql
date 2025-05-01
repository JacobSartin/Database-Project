-- Clear Database Script - Only removes tables, doesn't recreate them
-- Drop tables in reverse order of creation to handle dependencies
DROP TABLE IF EXISTS "Reservations" CASCADE;
DROP TABLE IF EXISTS "Seats" CASCADE;
DROP TABLE IF EXISTS "Flights" CASCADE;
DROP TABLE IF EXISTS "Aircraft" CASCADE;
DROP TABLE IF EXISTS "Airports" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;

-- Drop indexes if they exist
DROP INDEX IF EXISTS idx_flight_origin;
DROP INDEX IF EXISTS idx_flight_destination;
DROP INDEX IF EXISTS idx_flight_departure;
DROP INDEX IF EXISTS idx_reservation_user;
DROP INDEX IF EXISTS idx_reservation_flight;