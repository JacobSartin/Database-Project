#!/usr/bin/env node

// Reset database script - run with "npm run reset-db" or "node resetDb.js"
import { resetDatabaseWithTestData } from "./db/initModels.js";

console.log("Starting database reset process...");

resetDatabaseWithTestData()
  .then(() => {
    console.log("Database has been reset successfully with test data!");
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error("Failed to reset database:", error);
    process.exit(1);
  });
