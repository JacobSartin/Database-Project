import { DataTypes, Model } from "sequelize";
import sequelize from "../db/connection";
import Aircraft from "./aircraftModel";
import Airport from "./airportsModel";

// Define Flight model interface
interface FlightAttributes {
  FlightID?: number; // Optional for creation
  AircraftID: number;
  OriginAirportID: number;
  DestinationAirportID: number;
  DepartureTime: Date;
  ArrivalTime: Date;
}

// Define Flight model class
class Flight extends Model<FlightAttributes> implements FlightAttributes {
  public FlightID!: number;
  public AircraftID!: number;
  public OriginAirportID!: number;
  public DestinationAirportID!: number;
  public DepartureTime!: Date;
  public ArrivalTime!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
