import sequelize, { testConnection } from "./connection.js";
import "../models/relations.js";
import {
  User,
  Airport,
  Aircraft,
  Flight,
  Seat,
  Reservation,
} from "../models/relations.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// This function will sync all models with the database
export const initializeDatabase = async (force = false): Promise<void> => {
  try {
    // Sync all models with the database
    await sequelize.sync({ force });
    console.log("Database models synchronized successfully");
  } catch (error) {
    console.error("Failed to sync database models:", error);
    throw error;
  }
};

// Function to execute SQL from a file
export const executeSqlFile = async (filePath: string): Promise<void> => {
  try {
    const fullPath = path.resolve(__dirname, filePath);
    const sql = fs.readFileSync(fullPath, "utf8");

    // Execute the entire SQL file as a single query to preserve PL/pgSQL blocks
    try {
      await sequelize.query(sql, {
        logging: false,
      });

      console.log(`Successfully executed SQL file: ${filePath}`);
    } catch (error) {
      console.error(`Error executing SQL file: ${filePath}`, error);
      throw error;
    }
  } catch (error) {
    console.error(`Error reading or processing SQL file: ${filePath}`, error);
    throw error;
  }
};

// Function to clear the database (removes all tables)
export const clearDatabase = async (): Promise<void> => {
  try {
    await testConnection();
    console.log("Clearing database...");

    // Execute the clearDatabase.sql script that only drops tables and indexes
    await executeSqlFile("clearDatabase.sql");

    console.log("Database cleared successfully");
  } catch (error) {
    console.error("Failed to clear database:", error);
    throw error;
  }
};

// Function to create tables using Sequelize sync
export const createTables = async (): Promise<void> => {
  try {
    console.log("Creating tables using Sequelize sync...");

    // Use Sequelize to create tables based on models
    await sequelize.sync({ force: false });

    console.log("Tables created successfully");
  } catch (error) {
    console.error("Failed to create tables:", error);
    throw error;
  }
};

// Function to load test data into the database
export const loadTestData = async (): Promise<void> => {
  try {
    await testConnection();
    console.log("Loading test data...");

    // Execute the loadTestData.sql script that contains sample data
    await executeSqlFile("loadTestData.sql");

    console.log("Test data loaded successfully");
  } catch (error) {
    console.error("Failed to load test data:", error);
    throw error;
  }
};

// Function to reset the database with test data
export const resetDatabaseWithTestData = async (): Promise<void> => {
  try {
    // First clear the database (drop tables)
    await clearDatabase();

    // Then create tables using Sequelize
    await createTables();

    // Finally load test data
    await loadTestData();

    console.log("Database reset with test data completed successfully");
  } catch (error) {
    console.error("Failed to reset database with test data:", error);
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
  clearDatabase,
  createTables,
  loadTestData,
  resetDatabaseWithTestData,
};
