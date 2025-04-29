import { DataTypes, Model } from "sequelize";
import sequelize from "../db/connection";
import Flight from "./flightModel";

// Define Seat model interface
interface SeatAttributes {
  SeatID?: number; // Optional for creation
  FlightID: number;
  SeatNumber: string;
  IsBooked: boolean;
}

// Define Seat model class
class Seat extends Model<SeatAttributes> implements SeatAttributes {
  public SeatID!: number;
  public FlightID!: number;
  public SeatNumber!: string;
  public IsBooked!: boolean;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
