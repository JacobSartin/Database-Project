import User from "./usersModel";
import Airport from "./airportsModel";
import Aircraft from "./aircraftModel";
import Flight from "./flightModel";
import Seat from "./seatModel";
import Reservation from "./reservationModel";

// Define relationships between models

// Aircraft to Flight relationship (One-to-Many)
Aircraft.hasMany(Flight, {
  sourceKey: "AircraftID",
  foreignKey: "AircraftID",
  as: "flights",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
Flight.belongsTo(Aircraft, {
  foreignKey: "AircraftID",
  as: "aircraft",
});

// Airport to Flight relationships (One-to-Many for both origin and destination)
Airport.hasMany(Flight, {
  sourceKey: "AirportID",
  foreignKey: "OriginAirportID",
  as: "departingFlights",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
Flight.belongsTo(Airport, {
  foreignKey: "OriginAirportID",
  as: "originAirport",
});

Airport.hasMany(Flight, {
  sourceKey: "AirportID",
  foreignKey: "DestinationAirportID",
  as: "arrivingFlights",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
Flight.belongsTo(Airport, {
  foreignKey: "DestinationAirportID",
  as: "destinationAirport",
});

// Flight to Seat relationship (One-to-Many)
Flight.hasMany(Seat, {
  sourceKey: "FlightID",
  foreignKey: "FlightID",
  as: "seats",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Seat.belongsTo(Flight, {
  foreignKey: "FlightID",
  as: "flight",
});

// User to Reservation relationship (One-to-Many)
User.hasMany(Reservation, {
  sourceKey: "UserID",
  foreignKey: "UserID",
  as: "reservations",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Reservation.belongsTo(User, {
  foreignKey: "UserID",
  as: "user",
});

// Flight to Reservation relationship (One-to-Many)
Flight.hasMany(Reservation, {
  sourceKey: "FlightID",
  foreignKey: "FlightID",
  as: "reservations",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Reservation.belongsTo(Flight, {
  foreignKey: "FlightID",
  as: "flight",
});

// Seat to Reservation relationship (One-to-One)
Seat.hasOne(Reservation, {
  sourceKey: "SeatID",
  foreignKey: "SeatID",
  as: "reservation",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Reservation.belongsTo(Seat, {
  foreignKey: "SeatID",
  as: "seat",
});

export { User, Airport, Aircraft, Flight, Seat, Reservation };
