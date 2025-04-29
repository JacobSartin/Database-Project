import { DataTypes, Model } from "sequelize";
import sequelize from "../db/connection";

// Define Aircraft model interface
interface AircraftAttributes {
  AircraftID?: number; // Optional for creation
  Model: string;
  TotalSeats: number;
}

// Define Aircraft model class
class Aircraft extends Model<AircraftAttributes> implements AircraftAttributes {
  public AircraftID!: number;
  public Model!: string;
  public TotalSeats!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
