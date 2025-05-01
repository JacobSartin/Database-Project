import { DataTypes, Model } from "sequelize";
import sequelize from "../db/connection.js";
import Flight from "./flightModel.js";

// Define Aircraft model interface
interface AircraftAttributes {
  AircraftID?: number; // Optional for creation
  Model: string;
  TotalSeats: number;
  flights?: Flight[]; // Add relationship with Flight
}

// Define Aircraft model class
class Aircraft extends Model<AircraftAttributes> implements AircraftAttributes {
  declare AircraftID: number;
  declare Model: string;
  declare TotalSeats: number;
  declare flights?: Flight[]; // Add relationship with Flight

  // Timestamps
  declare createdAt: Date;
  declare updatedAt: Date;
}

// Initialize Aircraft model
Aircraft.init(
  {
    AircraftID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Model: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    TotalSeats: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1, // Aircraft must have at least one seat
      },
    },
  },
  {
    sequelize,
    modelName: "Aircraft",
    tableName: "Aircraft",
    timestamps: true,
  }
);

export default Aircraft;
