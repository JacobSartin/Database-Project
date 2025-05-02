import { DataTypes, Model } from "sequelize";
import sequelize from "../db/connection.js";
import Flight from "./flightModel.js";

// Define Airport model interface
export interface AirportAttributes {
  AirportID?: number; // Optional for creation
  Code: string;
  Name: string;
  City: string;
  Country: string;
  departingFlights?: Flight[]; // Add relationship for flights departing from this airport
  arrivingFlights?: Flight[]; // Add relationship for flights arriving at this airport
}

// Define Airport model class
class Airport extends Model<AirportAttributes> implements AirportAttributes {
  declare AirportID: number;
  declare Code: string;
  declare Name: string;
  declare City: string;
  declare Country: string;
  declare departingFlights?: Flight[]; // Add relationship for flights departing from this airport
  declare arrivingFlights?: Flight[]; // Add relationship for flights arriving at this airport

  // Timestamps
  declare createdAt: Date;
  declare updatedAt: Date;
}

// Initialize Airport model
Airport.init(
  {
    AirportID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Code: {
      type: DataTypes.CHAR(3),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 3], // Exactly 3 characters for airport code
        isUppercase: true, // Airport codes are typically uppercase
      },
    },
    Name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    City: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    Country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Airport",
    tableName: "Airports",
    timestamps: true, // Enable createdAt and updatedAt
  }
);

export default Airport;
