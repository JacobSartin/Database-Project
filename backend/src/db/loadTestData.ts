import {
  User,
  Airport,
  Aircraft,
  Flight,
  Seat,
  Reservation,
} from "../models/relations.js";
import sequelize from "./connection.js";
import argon2 from "@node-rs/argon2";

// Define types to ensure type safety
interface AircraftPosition {
  AircraftID: number;
  CurrentAirportID: number;
  AvailableFrom: Date;
  Model: string;
  TotalSeats: number;
}

// Type for airport routes to ensure multiple flights between airports
interface AirportRoute {
  OriginID: number;
  DestinationID: number;
}

export const loadTestDataSequelize = async (): Promise<void> => {
  console.log("Loading test data using Sequelize...");

  try {
    // Use a transaction to ensure all data is loaded or none is
    await sequelize.transaction(async (t) => {
      const transactionOptions = { transaction: t };

      // Create users
      console.log("Creating users...");
      await User.bulkCreate(
        [
          {
            FirstName: "System",
            LastName: "Admin",
            Username: "admin",
            PasswordHash: await argon2.hash("password"),
            Email: "admin@flyair.com",
            Admin: true,
          },
          {
            FirstName: "John",
            LastName: "Doe",
            Username: "john_doe",
            PasswordHash: await argon2.hash("password"),
            Email: "john.doe@example.com",
            Admin: false,
          },
          {
            FirstName: "Jane",
            LastName: "Smith",
            Username: "jane_smith",
            PasswordHash: await argon2.hash("password"),
            Email: "jane.smith@example.com",
            Admin: false,
          },
          {
            FirstName: "Robert",
            LastName: "Johnson",
            Username: "robert_johnson",
            PasswordHash: await argon2.hash("password"),
            Email: "robert.johnson@example.com",
            Admin: false,
          },
          {
            FirstName: "Susan",
            LastName: "Williams",
            Username: "susan_williams",
            PasswordHash: await argon2.hash("password"),
            Email: "susan.williams@example.com",
            Admin: false,
          },
          {
            FirstName: "Michael",
            LastName: "Brown",
            Username: "michael_brown",
            PasswordHash: await argon2.hash("password"),
            Email: "michael.brown@example.com",
            Admin: false,
          },
          {
            FirstName: "Emily",
            LastName: "Davis",
            Username: "emily_davis",
            PasswordHash: await argon2.hash("password"),
            Email: "emily.davis@example.com",
            Admin: false,
          },
          {
            FirstName: "David",
            LastName: "Miller",
            Username: "david_miller",
            PasswordHash: await argon2.hash("password"),
            Email: "david.miller@example.com",
            Admin: false,
          },
          {
            FirstName: "Lisa",
            LastName: "Wilson",
            Username: "lisa_wilson",
            PasswordHash: await argon2.hash("password"),
            Email: "lisa.wilson@example.com",
            Admin: false,
          },
          {
            FirstName: "James",
            LastName: "Taylor",
            Username: "james_taylor",
            PasswordHash: await argon2.hash("password"),
            Email: "james.taylor@example.com",
            Admin: false,
          },
        ],
        transactionOptions
      );

      // Create airports
      console.log("Creating airports...");
      const airports = await Airport.bulkCreate(
        [
          {
            Code: "JFK",
            Name: "John F. Kennedy International Airport",
            City: "New York",
            Country: "United States",
          },
          {
            Code: "LAX",
            Name: "Los Angeles International Airport",
            City: "Los Angeles",
            Country: "United States",
          },
          {
            Code: "LHR",
            Name: "London Heathrow Airport",
            City: "London",
            Country: "United Kingdom",
          },
          {
            Code: "CDG",
            Name: "Paris Charles de Gaulle Airport",
            City: "Paris",
            Country: "France",
          },
          {
            Code: "HND",
            Name: "Tokyo Haneda Airport",
            City: "Tokyo",
            Country: "Japan",
          },
          {
            Code: "SYD",
            Name: "Sydney Airport",
            City: "Sydney",
            Country: "Australia",
          },
          {
            Code: "DXB",
            Name: "Dubai International Airport",
            City: "Dubai",
            Country: "United Arab Emirates",
          },
          {
            Code: "SIN",
            Name: "Singapore Changi Airport",
            City: "Singapore",
            Country: "Singapore",
          },
          {
            Code: "AMS",
            Name: "Amsterdam Airport Schiphol",
            City: "Amsterdam",
            Country: "Netherlands",
          },
          {
            Code: "FRA",
            Name: "Frankfurt Airport",
            City: "Frankfurt",
            Country: "Germany",
          },
          {
            Code: "MAD",
            Name: "Adolfo Suárez Madrid–Barajas Airport",
            City: "Madrid",
            Country: "Spain",
          },
          {
            Code: "FCO",
            Name: "Leonardo da Vinci–Fiumicino Airport",
            City: "Rome",
            Country: "Italy",
          },
          {
            Code: "YYZ",
            Name: "Toronto Pearson International Airport",
            City: "Toronto",
            Country: "Canada",
          },
          {
            Code: "PEK",
            Name: "Beijing Capital International Airport",
            City: "Beijing",
            Country: "China",
          },
          {
            Code: "ICN",
            Name: "Incheon International Airport",
            City: "Seoul",
            Country: "South Korea",
          },
        ],
        transactionOptions
      );

      // Create aircraft
      console.log("Creating aircraft...");
      const aircraftList = await Aircraft.bulkCreate(
        [
          {
            Model: "Boeing 747",
            TotalSeats: 366,
          },
          {
            Model: "Boeing 777",
            TotalSeats: 312,
          },
          {
            Model: "Boeing 787 Dreamliner",
            TotalSeats: 296,
          },
          {
            Model: "Airbus A320",
            TotalSeats: 180,
          },
          {
            Model: "Airbus A330",
            TotalSeats: 277,
          },
          {
            Model: "Airbus A350",
            TotalSeats: 325,
          },
          {
            Model: "Airbus A380",
            TotalSeats: 525,
          },
          {
            Model: "Bombardier CRJ",
            TotalSeats: 90,
          },
          {
            Model: "Embraer E190",
            TotalSeats: 114,
          },
          {
            Model: "Boeing 737",
            TotalSeats: 189,
          },
        ],
        transactionOptions
      );

      // Triple the number of aircraft to enable more concurrent flights
      console.log("Creating additional aircraft instances...");

      const additionalAircraft: { Model: string; TotalSeats: number }[] = [];

      // For each aircraft model, create 3 more instances
      aircraftList.forEach((aircraft) => {
        for (let i = 0; i < 3; i++) {
          additionalAircraft.push({
            Model: aircraft.Model,
            TotalSeats: aircraft.TotalSeats,
          });
        }
      });

      const extraAircraftList = await Aircraft.bulkCreate(
        additionalAircraft,
        transactionOptions
      );

      // Combine original and additional aircraft
      const allAircraft = [...aircraftList, ...extraAircraftList];
      console.log(`Total aircraft fleet: ${allAircraft.length.toString()}`);

      // Map airport codes to their IDs
      const airportIdMap = new Map<string, number>();
      for (const airport of airports) {
        airportIdMap.set(airport.Code, airport.AirportID);
      }

      // Initialize aircraft positions (distribute aircraft across airports)
      const aircraftPositions: AircraftPosition[] = [];

      // Distribute aircraft more evenly across airports for more routes
      for (let i = 0; i < allAircraft.length; i++) {
        const aircraft = allAircraft[i];
        const airportIndex = i % airports.length; // Distribute evenly
        const airport = airports[airportIndex];

        aircraftPositions.push({
          AircraftID: aircraft.AircraftID,
          CurrentAirportID: airport.AirportID,
          AvailableFrom: new Date("2025-05-01T06:00:00Z"), // All aircraft start available from May 1, 2025 at 6 AM
          Model: aircraft.Model,
          TotalSeats: aircraft.TotalSeats,
        });
      }

      // Generate common routes between major airports to ensure multiple flights
      console.log("Creating predefined routes between major airports...");
      const commonRoutes: AirportRoute[] = [];

      // Create a dense route network between airports
      // Each airport will connect to at least 5 other airports
      for (let i = 0; i < airports.length; i++) {
        const origin = airports[i];

        // Connect to multiple destinations
        for (let j = 1; j <= 5; j++) {
          const destIndex = (i + j) % airports.length;
          const destination = airports[destIndex];

          if (origin.AirportID !== destination.AirportID) {
            commonRoutes.push({
              OriginID: origin.AirportID,
              DestinationID: destination.AirportID,
            });

            // Also add the return route
            commonRoutes.push({
              OriginID: destination.AirportID,
              DestinationID: origin.AirportID,
            });
          }
        }
      }

      // Generate realistic flight schedule for 14 days (May 1-14, 2025)
      console.log("Creating flights with realistic schedule...");
      const startDate = new Date("2025-05-01");
      const endDate = new Date("2025-05-14");
      const turnaroundTime = 60 * 60 * 1000; // 1 hour in milliseconds

      const createdFlights: Flight[] = [];

      // Helper function to get a departure time in a specific timeframe
      const getDepartureTimeInRange = (
        date: Date,
        startHour: number,
        endHour: number
      ): Date => {
        const result = new Date(date);
        const hour =
          startHour + Math.floor(Math.random() * (endHour - startHour));
        const minute = Math.floor(Math.random() * 60);
        result.setHours(hour, minute, 0, 0);
        return result;
      };

      // Create flights for predefined routes first (multiple flights per day for busy routes)
      for (
        let currentDate = new Date(startDate);
        currentDate <= endDate;
        currentDate.setDate(currentDate.getDate() + 1)
      ) {
        const currentDateStr = currentDate.toISOString().split("T")[0];
        console.log(`Generating flights for date: ${currentDateStr}`);

        // For each common route, create multiple flights per day
        for (const route of commonRoutes) {
          // Define typical departure slots: morning, noon, afternoon, evening
          const departureSlots = [
            { start: 6, end: 9 }, // Morning: 6AM-9AM
            { start: 11, end: 13 }, // Noon: 11AM-1PM
            { start: 15, end: 17 }, // Afternoon: 3PM-5PM
            { start: 19, end: 22 }, // Evening: 7PM-10PM
          ];

          // Create a flight for each departure slot to ensure multiple flights per day
          for (const slot of departureSlots) {
            // Find an available aircraft at the origin airport
            const availableAircraft = aircraftPositions.find(
              (aircraft) =>
                aircraft.CurrentAirportID === route.OriginID &&
                aircraft.AvailableFrom.getDate() === currentDate.getDate()
            );

            if (availableAircraft) {
              // Calculate departure time based on the slot
              const departureTime = getDepartureTimeInRange(
                currentDate,
                slot.start,
                slot.end
              );

              // Ensure the departure time is after the aircraft is available
              if (
                departureTime.getTime() <
                availableAircraft.AvailableFrom.getTime()
              ) {
                departureTime.setTime(
                  availableAircraft.AvailableFrom.getTime() +
                    Math.random() * 30 * 60 * 1000
                );
              }

              // Calculate a realistic flight duration based on airports
              // In a real system, this would be calculated based on distance
              const flightDurationHours = 1 + Math.random() * 4; // Flights between 1-5 hours
              const flightDurationMs = flightDurationHours * 60 * 60 * 1000;

              const arrivalTime = new Date(
                departureTime.getTime() + flightDurationMs
              );

              // Create the flight
              const flight = await Flight.create(
                {
                  AircraftID: availableAircraft.AircraftID,
                  OriginAirportID: route.OriginID,
                  DestinationAirportID: route.DestinationID,
                  DepartureTime: departureTime,
                  ArrivalTime: arrivalTime,
                },
                transactionOptions
              );

              createdFlights.push(flight);

              // Update aircraft position
              const aircraftIndex = aircraftPositions.findIndex(
                (a) => a.AircraftID === availableAircraft.AircraftID
              );
              if (aircraftIndex !== -1) {
                aircraftPositions[aircraftIndex].CurrentAirportID =
                  route.DestinationID;
                aircraftPositions[aircraftIndex].AvailableFrom = new Date(
                  arrivalTime.getTime() + turnaroundTime
                );
              }
            }
          }
        }

        // Now use the remaining aircraft capacity for additional random flights
        for (let i = 0; i < aircraftPositions.length; i++) {
          const aircraft = aircraftPositions[i];

          // If aircraft hasn't been used for predefined routes and is available today
          if (aircraft.AvailableFrom.getDate() === currentDate.getDate()) {
            // Try to schedule up to 3 more flights per aircraft per day
            for (let flightAttempt = 0; flightAttempt < 3; flightAttempt++) {
              // Check if we still have time in the day
              if (
                aircraft.AvailableFrom.getTime() + 3 * 60 * 60 * 1000 <
                new Date(currentDate).setHours(23, 0, 0, 0)
              ) {
                // Find a random destination airport (different from current location)
                const possibleDestinations = airports.filter(
                  (a) => a.AirportID !== aircraft.CurrentAirportID
                );
                if (possibleDestinations.length === 0) break;

                const randomDestIndex = Math.floor(
                  Math.random() * possibleDestinations.length
                );
                const destinationAirport =
                  possibleDestinations[randomDestIndex];

                // Calculate a realistic flight duration
                const flightDurationHours = 1 + Math.random() * 3; // 1-4 hours
                const flightDurationMs = flightDurationHours * 60 * 60 * 1000;

                // Set departure time
                const randomGroundTimeMs = Math.random() * 30 * 60 * 1000; // Random up to 30 minutes
                const departureTime = new Date(
                  aircraft.AvailableFrom.getTime() + randomGroundTimeMs
                );
                const arrivalTime = new Date(
                  departureTime.getTime() + flightDurationMs
                );

                // Create the flight
                const flight = await Flight.create(
                  {
                    AircraftID: aircraft.AircraftID,
                    OriginAirportID: aircraft.CurrentAirportID,
                    DestinationAirportID: destinationAirport.AirportID,
                    DepartureTime: departureTime,
                    ArrivalTime: arrivalTime,
                  },
                  transactionOptions
                );

                createdFlights.push(flight);

                // Update aircraft position
                aircraft.CurrentAirportID = destinationAirport.AirportID;
                aircraft.AvailableFrom = new Date(
                  arrivalTime.getTime() + turnaroundTime
                );
              }
            }
          }

          // If aircraft is done for the day, make it available early next morning
          if (aircraft.AvailableFrom.getDate() > currentDate.getDate()) {
            // Aircraft is already scheduled into the next day, leave it as is
          } else {
            // Aircraft has finished for the day, make it available next morning at 6 AM
            const nextDay = new Date(currentDate);
            nextDay.setDate(nextDay.getDate() + 1);
            nextDay.setHours(6, 0, 0, 0);
            aircraft.AvailableFrom = nextDay;
          }

          // Update the aircraft position in the array
          aircraftPositions[i] = aircraft;
        }
      }

      console.log(`Created ${createdFlights.length.toString()} flights`);

      // Create seats for each flight
      console.log("Creating seats...");

      // Helper function to generate seat numbers
      const generateSeats = (
        flightId: number,
        totalSeats: number
      ): { FlightID: number; SeatNumber: string; IsBooked: boolean }[] => {
        const seats: {
          FlightID: number;
          SeatNumber: string;
          IsBooked: boolean;
        }[] = [];
        const rows = Math.ceil(totalSeats / 6); // Assuming 6 seats per row (A-F)
        const letters = "ABCDEF";

        for (let row = 1; row <= rows; row++) {
          for (let i = 0; i < Math.min(6, totalSeats - (row - 1) * 6); i++) {
            const seatLetter = letters.charAt(i);
            const seatNumber = `${row.toString()}${seatLetter}`;

            seats.push({
              FlightID: flightId,
              SeatNumber: seatNumber,
              IsBooked: false,
            });
          }
        }

        return seats;
      };

      // Generate seats for each flight based on the aircraft capacity
      const allSeats: {
        FlightID: number;
        SeatNumber: string;
        IsBooked: boolean;
      }[] = [];

      for (const flight of createdFlights) {
        const aircraftData = allAircraft.find(
          (a) => a.AircraftID === flight.AircraftID
        );
        if (aircraftData) {
          const flightSeats = generateSeats(
            flight.FlightID,
            aircraftData.TotalSeats
          );
          allSeats.push(...flightSeats);
        }
      }

      // Bulk create the seats in batches to avoid memory issues
      console.log(
        `Creating ${allSeats.length.toString()} seats (in batches)...`
      );
      const BATCH_SIZE = 10000;
      const seatBatches = [];

      for (let i = 0; i < allSeats.length; i += BATCH_SIZE) {
        const batch = allSeats.slice(i, i + BATCH_SIZE);
        seatBatches.push(batch);
      }

      let createdSeats: Seat[] = [];
      for (let i = 0; i < seatBatches.length; i++) {
        console.log(
          `Creating seat batch ${(i + 1).toString()} of ${seatBatches.length.toString()}...`
        );
        const batchSeats = await Seat.bulkCreate(
          seatBatches[i],
          transactionOptions
        );
        createdSeats = [...createdSeats, ...batchSeats];
      }

      // Create random reservations (booking about 30% of available seats)
      console.log("Creating reservations...");

      const users = await User.findAll({ transaction: t });
      const totalSeats = createdSeats.length;
      const reservationsToCreate = Math.ceil(totalSeats * 0.3); // 30% of seats

      // Create a set to track which seats have already been booked
      const bookedSeatIds = new Set<number>();
      const reservationsData: {
        UserID: number;
        FlightID: number;
        SeatID: number;
        BookingTime: Date;
      }[] = [];

      console.log(
        `Attempting to create ${reservationsToCreate.toString()} reservations...`
      );

      // Function to create reservations in batches
      const createReservationBatch = async (limit: number, offset: number) => {
        const batchReservations: {
          UserID: number;
          FlightID: number;
          SeatID: number;
          BookingTime: Date;
        }[] = [];

        // Get a batch of seats
        const seatBatch = createdSeats.slice(offset, offset + limit);

        for (const seat of seatBatch) {
          // Random chance for each seat to be booked (about 30% chance)
          if (
            Math.random() < 0.3 &&
            seat.SeatID &&
            !bookedSeatIds.has(seat.SeatID)
          ) {
            bookedSeatIds.add(seat.SeatID);

            // Select a random user
            const randomUserIndex = Math.floor(Math.random() * users.length);
            const randomUser = users[randomUserIndex];

            // Generate a random booking time in the last 30 days
            const now = new Date();
            const randomDaysAgo = Math.random() * 30;
            const bookingTime = new Date(
              now.getTime() - randomDaysAgo * 24 * 60 * 60 * 1000
            );

            batchReservations.push({
              UserID: randomUser.UserID,
              FlightID: seat.FlightID,
              SeatID: seat.SeatID,
              BookingTime: bookingTime,
            });

            // Mark the seat as booked
            await seat.update({ IsBooked: true }, transactionOptions);
          }
        }

        return batchReservations;
      };

      // Process reservations in batches to prevent memory issues
      const RESERVATION_BATCH_SIZE = 5000;
      for (
        let offset = 0;
        offset < createdSeats.length;
        offset += RESERVATION_BATCH_SIZE
      ) {
        console.log(
          `Processing reservation batch starting at offset ${offset.toString()}...`
        );
        const batchReservations = await createReservationBatch(
          RESERVATION_BATCH_SIZE,
          offset
        );
        reservationsData.push(...batchReservations);

        // If we've reached our target reservation count, stop processing
        if (reservationsData.length >= reservationsToCreate) {
          break;
        }
      }

      // Create the reservations in batches
      console.log(
        `Creating ${reservationsData.length.toString()} reservations in batches...`
      );
      const RESERVATION_CREATE_BATCH_SIZE = 5000;
      for (
        let i = 0;
        i < reservationsData.length;
        i += RESERVATION_CREATE_BATCH_SIZE
      ) {
        const batch = reservationsData.slice(
          i,
          i + RESERVATION_CREATE_BATCH_SIZE
        );
        console.log(
          `Creating reservation batch ${(Math.floor(i / RESERVATION_CREATE_BATCH_SIZE) + 1).toString()} of ${Math.ceil(reservationsData.length / RESERVATION_CREATE_BATCH_SIZE).toString()}...`
        );
        await Reservation.bulkCreate(batch, transactionOptions);
      }

      console.log(`Created ${reservationsData.length.toString()} reservations`);
      console.log("Test data loaded successfully!");
    });
  } catch (error) {
    console.error("Failed to load test data:", error);
    throw error;
  }
};
