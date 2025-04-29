import { Request, Response } from "express";
import User from "../models/usersModel.js";
import Reservation from "../models/reservationModel.js";

/**
 * Register a new user
 */
export function register(req: Request, res: Response) {
  const { username, password, email } = req.body;

  // Check if username already exists
  User.findOne({
    where: { Username: username },
  })
    .then((existingUser) => {
      if (existingUser) {
        res.status(400).json({ message: "Username is already taken" });
        return Promise.reject(new Error("Username already taken")); // Break the chain
      }

      // Create new user
      return User.create({
        Username: username,
        PasswordHash: password, // Will be hashed by model hooks
        Email: email,
        Admin: false,
      });
    })
    .then((newUser) => {
      // Don't send password hash back to client
      const userData = {
        UserID: newUser.UserID,
        Username: newUser.Username,
        Email: newUser.Email,
      };

      res.status(201).json({
        message: "User registered successfully",
        user: userData,
      });
    })
    .catch((error) => {
      // Only send error response if one hasn't been sent already
      if (!res.headersSent) {
        console.error("Registration error:", error);
        res.status(500).json({
          message: "Error registering user",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
}

/**
 * Login a user
 */
export function login(req: Request, res: Response) {
  const { username, password } = req.body;
  let userRecord: User;

  // Find user by username
  User.findOne({
    where: { Username: username },
  })
    .then((user) => {
      if (!user) {
        res.status(401).json({ message: "Invalid credentials" });
        return Promise.reject(new Error("User not found")); // Break the chain
      }

      userRecord = user;
      // Verify password
      return user.comparePassword(password);
    })
    .then((isPasswordValid) => {
      if (!isPasswordValid) {
        res.status(401).json({ message: "Invalid credentials" });
        return Promise.reject(new Error("Invalid password")); // Break the chain
      }

      // Create a user object without sensitive data
      const userData = {
        UserID: userRecord.UserID,
        Username: userRecord.Username,
        Email: userRecord.Email,
        isAdmin: userRecord.Admin,
      };

      // In a real application, you would generate and return a JWT token here
      res.json({
        message: "Login successful",
        user: userData,
        // token: generatedToken
      });
    })
    .catch((error) => {
      // Only send error response if one hasn't been sent already
      if (!res.headersSent) {
        console.error("Login error:", error);
        res.status(500).json({
          message: "Error during login",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
}

/**
 * Get user reservations
 */
export function getReservations(req: Request, res: Response): void {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    res.status(400).json({ message: "Invalid user ID" });
    return;
  }

  // Check if user exists first
  User.findByPk(userId)
    .then((user) => {
      if (!user) {
        res.status(404).json({ message: "User not found" });
        Promise.reject(new Error("User not found")); // Break the chain
      }

      // Find reservations for the user
      Reservation.findAll({
        where: { UserID: userId },
        include: [
          {
            association: "flight",
            include: [
              { association: "originAirport" },
              { association: "destinationAirport" },
            ],
          },
          { association: "seat" },
        ],
      });
    })
    .then((reservations) => {
      res.json(reservations);
    })
    .catch((error) => {
      // Only send error response if one hasn't been sent already
      if (!res.headersSent) {
        console.error("Error fetching user reservations:", error);
        res.status(500).json({
          message: "Error fetching reservations",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    });
}
