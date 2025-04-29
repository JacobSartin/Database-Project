import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/connection.js";
import argon2 from "@node-rs/argon2";
import Reservation from "./reservationModel.js";

// Define User attributes interface
interface UserAttributes {
  UserID: number;
  Username: string;
  PasswordHash: string;
  Email: string | null;
  Admin: boolean;
  reservations?: Reservation[]; // Add relationship with reservations
}

// Define optional attributes for creation
interface UserCreationAttributes extends Optional<UserAttributes, "UserID"> {}

// Define User model class
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public UserID!: number;
  public Username!: string;
  public PasswordHash!: string;
  public Email!: string | null;
  public Admin!: boolean;
  public reservations?: Reservation[]; // Add relationship with reservations

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Instance method to compare passwords
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return argon2.verify(this.PasswordHash, candidatePassword);
  }
}

// Initialize User model
User.init(
  {
    UserID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Username cannot be empty" },
        len: {
          args: [3, 50],
          msg: "Username must be between 3 and 50 characters",
        },
      },
    },
    PasswordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Password cannot be empty" },
      },
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: { msg: "Please enter a valid email address" },
      },
    },
    Admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "Users",
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.PasswordHash) {
          user.PasswordHash = await argon2.hash(user.PasswordHash);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed("PasswordHash")) {
          user.PasswordHash = await argon2.hash(user.PasswordHash);
        }
      },
    },
  }
);

export default User;
