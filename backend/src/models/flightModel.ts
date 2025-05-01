import { DataTypes, Model } from "sequelize";
import sequelize from "../db/connection.js";
import Aircraft from "./aircraftModel.js";
import Airport from "./airportsModel.js";
import Seat from "./seatModel.js";
import Reservation from "./reservationModel.js";

// Define Flight model interface
interface FlightAttributes {
  FlightID?: number; // Optional for creation
  AircraftID: number;
  OriginAirportID: number;
  DestinationAirportID: number;
  DepartureTime: Date;
  ArrivalTime: Date;
  aircraft?: Aircraft; // Aircraft relationship
  originAirport?: Airport; // Origin airport relationship
  destinationAirport?: Airport; // Destination airport relationship
  seats?: Seat[]; // Seats on this flight
  reservations?: Reservation[]; // Reservations for this flight
}

// Define Flight model class
class Flight extends Model<FlightAttributes> implements FlightAttributes {
  declare FlightID: number;
  declare AircraftID: number;
  declare OriginAirportID: number;
  declare DestinationAirportID: number;
  declare DepartureTime: Date;
  declare ArrivalTime: Date;
  declare aircraft?: Aircraft;
  declare originAirport?: Airport;
  declare destinationAirport?: Airport;
  declare seats?: Seat[];
  declare reservations?: Reservation[];

  // Timestamps
  declare createdAt: Date;
  declare updatedAt: Date;
}

// Initialize Flight model
Flight.init(
  {
    FlightID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    AircraftID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Aircraft,
        key: "AircraftID",
      },
    },
    OriginAirportID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Airport,
        key: "AirportID",
      },
      validate: {
        differentThanDestination(value: number) {
          if (value === this.DestinationAirportID) {
            throw new Error(
              "Origin airport cannot be the same as destination airport"
            );
          }
        },
      },
    },
    DestinationAirportID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Airport,
        key: "AirportID",
      },
      validate: {
        differentThanOrigin(value: number) {
          if (value === this.OriginAirportID) {
            throw new Error(
              "Destination airport cannot be the same as origin airport"
            );
          }
        },
      },
    },
    DepartureTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    ArrivalTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
  },
  {
    sequelize,
    modelName: "Flight",
    tableName: "Flights",
    timestamps: true,
    indexes: [
      {
        name: "idx_flight_origin",
        fields: ["OriginAirportID"],
      },
      {
        name: "idx_flight_destination",
        fields: ["DestinationAirportID"],
      },
      {
        name: "idx_flight_departure",
        fields: ["DepartureTime"],
      },
    ],

    validate: {
      isValidDepartureAndArrival(this: Flight) {
        if (this.DepartureTime >= this.ArrivalTime) {
          throw new Error("Departure time must be before arrival time");
        }
      },
    },
  }
);

export default Flight;
