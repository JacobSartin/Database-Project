import { DataTypes, Model } from "sequelize";
import sequelize from "../db/connection";

// Define Airport model interface
interface AirportAttributes {
  AirportID?: number; // Optional for creation
  Code: string;
  Name: string;
  City: string;
  Country: string;
}

// Define Airport model class
class Airport extends Model<AirportAttributes> implements AirportAttributes {
  public AirportID!: number;
  public Code!: string;
  public Name!: string;
  public City!: string;
  public Country!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
