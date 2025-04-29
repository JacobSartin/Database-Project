import sequelize from "./connection.js";
import "../models/relations.js";
import {
  User,
  Airport,
  Aircraft,
  Flight,
  Seat,
  Reservation,
} from "../models/relations.js";

// This function will sync all models with the database
export const initializeDatabase = async (
  force: boolean = false
): Promise<void> => {
  try {
    // Sync all models with the database
    await sequelize.sync({ force });
    console.log("Database models synchronized successfully");
  } catch (error) {
    console.error("Failed to sync database models:", error);
    throw error;
  }
};

export default {
  sequelize,
  User,
  Airport,
  Aircraft,
  Flight,
  Seat,
  Reservation,
  initializeDatabase,
};
