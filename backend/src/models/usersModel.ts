import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../db/connection.js";
import argon2 from "@node-rs/argon2";
import Reservation from "./reservationModel.js";

// Define User attributes interface
export interface UserAttributes {
  UserID: number;
  FirstName: string;
  LastName: string;
  Username: string;
  PasswordHash: string;
  Email: string | null;
  Admin: boolean;
  reservations?: Reservation[]; // Add relationship with reservations
}

// Define optional attributes for creation
type UserCreationAttributes = Optional<UserAttributes, "UserID">;

// Define User model class
class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  // Using declare instead of public to avoid shadowing Sequelize's getters/setters
  declare UserID: number;
  declare FirstName: string;
  declare LastName: string;
  declare Username: string;
  declare PasswordHash: string;
  declare Email: string | null;
  declare Admin: boolean;
  declare reservations?: Reservation[]; // Add relationship with reservations

  // Timestamps
  declare createdAt: Date;
  declare updatedAt: Date;

  // Instance method to compare passwords - ensure proper type handling
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    try {
      // Ensure the password hash is a string before verification
      if (typeof this.PasswordHash !== "string") {
        throw new Error("Invalid password hash format");
      }
      return await argon2.verify(this.PasswordHash, candidatePassword);
    } catch (error) {
      console.error("Password verification error:", error);
      return false;
    }
  }

  // Get the full name as a computed property
  get fullName(): string {
    return `${this.FirstName} ${this.LastName}`;
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
    FirstName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "First name cannot be empty" },
      },
    },
    LastName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: { msg: "Last name cannot be empty" },
      },
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
