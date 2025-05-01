import { DataTypes, Model } from "sequelize";
import sequelize from "../db/connection.js";
import Flight from "./flightModel.js";
import Reservation from "./reservationModel.js";

// Define Seat model interface
interface SeatAttributes {
  SeatID?: number; // Optional for creation
  FlightID: number;
  SeatNumber: string;
  IsBooked: boolean;
  reservation?: Reservation; // Add the reservation association
}

// Define Seat model class
class Seat extends Model<SeatAttributes> implements SeatAttributes {
  declare SeatID: number;
  declare FlightID: number;
  declare SeatNumber: string;
  declare IsBooked: boolean;
  declare reservation?: Reservation; // Add the reservation association

  // Timestamps
  declare createdAt: Date;
  declare updatedAt: Date;
}

// Initialize Seat model
Seat.init(
  {
    SeatID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    FlightID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Flight,
        key: "FlightID",
      },
    },
    SeatNumber: {
      type: DataTypes.STRING(5),
      allowNull: false,
      validate: {
        // Regular expression to validate seat format (e.g., '12A', '3F')
        is: /^[0-9]{1,3}[A-Z]{1}$/,
      },
    },
    IsBooked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "Seat",
    tableName: "Seats",
    timestamps: true,
    indexes: [
      {
        name: "idx_seat_flight",
        fields: ["FlightID"],
      },
      {
        // Ensure unique seat numbers per flight
        name: "idx_seat_number_per_flight",
        unique: true,
        fields: ["FlightID", "SeatNumber"],
      },
    ],
  }
);

export default Seat;
