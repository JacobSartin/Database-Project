import { Request, Response } from "express";
import User from "../models/usersModel.js";
import Reservation from "../models/reservationModel.js";
import Seat from "../models/seatModel.js";
import { generateToken, AuthRequest } from "../middleware/auth.js";
import {
  RegisterRequestBody,
  LoginRequestBody,
  CreateReservationBody,
  ApiResponse,
} from "../types/requestTypes.js";

// Cookie configuration
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
} as const;

/**
 * Register a new user
 */
export function register(req: Request, res: Response): void {
  const { username, password, email, firstName, lastName } =
    req.body as RegisterRequestBody;

  // Check if username already exists
  User.findOne({
    where: { Username: username },
  })
    .then((existingUser) => {
      if (existingUser) {
        const response: ApiResponse<null> = {
          message: "Registration failed",
          error: "Username is already taken",
        };
        res.status(400).json(response);
        return Promise.reject(new Error("Username already taken")); // Break the chain
      }

      // Create new user
      return User.create({
        Username: username,
        PasswordHash: password, // Will be hashed by model hooks
        Email: email,
        FirstName: firstName,
        LastName: lastName,
        Admin: false,
      });
    })
    .then((newUser) => {
      // Generate JWT token for the new user
      const token = generateToken({
        id: newUser.UserID,
        username: newUser.Username,
        isAdmin: !!newUser.Admin,
      });

      // Set token in HTTP-only cookie
      res.cookie("token", token, COOKIE_OPTIONS);

      // Don't send password hash back to client
      const userData = {
        UserID: newUser.UserID,
        Username: newUser.Username,
        Email: newUser.Email,
        FirstName: newUser.FirstName,
        LastName: newUser.LastName,
        isAdmin: !!newUser.Admin,
      };

      const response: ApiResponse<typeof userData> = {
        message: "User registered successfully",
        data: userData,
      };

      res.status(201).json(response);
    })
    .catch((error: unknown) => {
      // Only send error response if one hasn't been sent already
      if (!res.headersSent) {
        console.error("Registration error:", error);
        const response: ApiResponse<null> = {
          message: "Error registering user",
          error: error instanceof Error ? error.message : "Unknown error",
        };
        res.status(500).json(response);
      }
    });
}

/**
 * Login a user
 */
export function login(req: Request, res: Response): void {
  const { username, password } = req.body as LoginRequestBody;
  let userRecord: User;

  // Find user by username
  User.findOne({
    where: { Username: username },
  })
    .then((user) => {
      if (!user) {
        const response: ApiResponse<null> = {
          message: "Login failed",
          error: "Invalid credentials",
        };
        res.status(401).json(response);
        return Promise.reject(new Error("User not found")); // Break the chain
      }

      userRecord = user;

      // Ensure password is a string
      if (typeof password !== "string") {
        const response: ApiResponse<null> = {
          message: "Login failed",
          error: "Invalid password format",
        };
        res.status(400).json(response);
        return Promise.reject(new Error("Invalid password format"));
      }

      // Verify password
      return user.comparePassword(password);
    })
    .then((isPasswordValid) => {
      if (!isPasswordValid) {
        const response: ApiResponse<null> = {
          message: "Login failed",
          error: "Invalid credentials",
        };
        res.status(401).json(response);
        return Promise.reject(new Error("Invalid password")); // Break the chain
      }

      // Generate JWT token
      const token = generateToken({
        id: userRecord.UserID,
        username: userRecord.Username,
        isAdmin: !!userRecord.Admin,
      });

      // Set token in HTTP-only cookie
      res.cookie("token", token, COOKIE_OPTIONS);

      // Create a user object without sensitive data
      const userData = {
        UserID: userRecord.UserID,
        Username: userRecord.Username,
        Email: userRecord.Email,
        FirstName: userRecord.FirstName,
        LastName: userRecord.LastName,
        isAdmin: !!userRecord.Admin,
      };

      const response: ApiResponse<typeof userData> = {
        message: "Login successful",
        data: userData,
      };

      res.json(response);
    })
    .catch((error: unknown) => {
      // Only send error response if one hasn't been sent already
      if (!res.headersSent) {
        console.error("Login error:", error);
        const response: ApiResponse<null> = {
          message: "Error during login",
          error: error instanceof Error ? error.message : "Unknown error",
        };
        res.status(500).json(response);
      }
    });
}

/**
 * Logout a user
 */
export function logout(_req: Request, res: Response): void {
  // Clear the auth cookie
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  const response: ApiResponse<null> = {
    message: "Logout successful",
  };

  res.json(response);
}

/**
 * Get user profile
 */
export function getProfile(req: AuthRequest, res: Response): void {
  if (!req.user) {
    const response: ApiResponse<null> = {
      message: "Authentication required",
      error: "You must be logged in to access this resource",
    };
    res.status(401).json(response);
    return;
  }

  User.findByPk(req.user.id)
    .then((user) => {
      if (!user) {
        const response: ApiResponse<null> = {
          message: "User not found",
          error: "The requested user does not exist",
        };
        res.status(404).json(response);
        return;
      }

      const userData = {
        UserID: user.UserID,
        Username: user.Username,
        Email: user.Email,
        FirstName: user.FirstName,
        LastName: user.LastName,
        isAdmin: !!user.Admin,
      };

      const response: ApiResponse<typeof userData> = {
        message: "Profile retrieved successfully",
        data: userData,
      };

      res.json(response);
    })
    .catch((error: unknown) => {
      console.error("Error fetching user profile:", error);
      const response: ApiResponse<null> = {
        message: "Error fetching user profile",
        error: error instanceof Error ? error.message : "Unknown error",
      };
      res.status(500).json(response);
    });
}

/**
 * Get user reservations
 */
export function getReservations(req: AuthRequest, res: Response): void {
  // Rest of the function remains the same
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    const response: ApiResponse<null> = {
      message: "Invalid request",
      error: "Invalid user ID",
    };
    res.status(400).json(response);
    return;
  }

  // Check if user exists first
  User.findByPk(userId)
    .then((user) => {
      if (!user) {
        const response: ApiResponse<null> = {
          message: "User not found",
          error: "The requested user does not exist",
        };
        res.status(404).json(response);
        return Promise.reject(new Error("User not found")); // Break the chain
      }

      // Find reservations for the user
      return Reservation.findAll({
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
      const response: ApiResponse<typeof reservations> = {
        message: "Reservations retrieved successfully",
        data: reservations,
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      // Only send error response if one hasn't been sent already
      if (!res.headersSent) {
        console.error("Error fetching user reservations:", error);
        const response: ApiResponse<null> = {
          message: "Error fetching reservations",
          error: error instanceof Error ? error.message : "Unknown error",
        };
        res.status(500).json(response);
      }
    });
}

/**
 * Create a new reservation
 * @param req Request with reservation data
 * @param res Response object
 */
export function createReservation(req: AuthRequest, res: Response): void {
  console.log("Reservation request received:", req.body);
  const { flightId, seatId } = req.body as CreateReservationBody;

  // Get userId from the authenticated token instead of request body
  if (!req.user) {
    const response: ApiResponse<null> = {
      message: "Authentication required",
      error: "You must be logged in to create a reservation",
    };
    res.status(401).json(response);
    return;
  }

  const userId = req.user.id;

  if (!flightId || !seatId) {
    const response: ApiResponse<null> = {
      message: "Missing required fields",
      error: "Flight ID and Seat ID are required",
    };
    console.log("Sending error response:", response);
    res.status(400).json(response);
    return;
  }

  // Check if the seat exists and is available
  Seat.findOne({
    where: {
      SeatID: seatId,
      FlightID: flightId,
    },
    include: {
      model: Reservation,
      as: "reservation",
      required: false,
    },
  })
    .then((seat) => {
      if (!seat) {
        const response: ApiResponse<null> = {
          message: "Seat not found",
          error: "The requested seat does not exist",
        };
        console.log("Seat not found:", seatId);
        res.status(404).json(response);
        return Promise.reject(new Error("Seat not found"));
      }

      console.log("Seat found:", seat.toJSON());

      // Check if seat is already booked
      if (seat.get("reservation")) {
        const response: ApiResponse<null> = {
          message: "Seat already booked",
          error: "The selected seat is already booked",
        };
        console.log("Seat already booked:", seatId);
        res.status(400).json(response);
        return Promise.reject(new Error("Seat already booked"));
      }

      // Create reservation
      console.log("Creating reservation for seat:", seatId);
      return Reservation.create({
        FlightID: flightId,
        SeatID: seatId,
        BookingTime: new Date(),
        UserID: userId,
      });
    })
    .then((reservation) => {
      console.log("Reservation created successfully:", reservation.toJSON());
      const response: ApiResponse<typeof reservation> = {
        message: "Reservation created successfully",
        data: reservation,
      };
      res.json(response);
    })
    .catch((error: unknown) => {
      // Only send error response if one hasn't been sent already
      if (!res.headersSent) {
        console.error("Error creating reservation:", error);
        const response: ApiResponse<null> = {
          message: "Error creating reservation",
          error: error instanceof Error ? error.message : "Unknown error",
        };
        res.status(500).json(response);
      }
    });
}
