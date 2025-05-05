import { Response } from "express";
import User from "../models/usersModel.js";
import Reservation from "../models/reservationModel.js";
import Flight from "../models/flightModel.js";
import Aircraft from "../models/aircraftModel.js";
import { AuthRequest } from "../middleware/auth.js";
import {
  ApiResponse,
  CreateUserBody,
  DashboardStatsResponse,
  ResetPasswordBody,
  UpdateUserBody,
} from "../types/requestTypes.js";

/**
 * Get all users with pagination
 */
export async function getUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    // Parse pagination parameters only
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    // Use Promise.all to perform both queries concurrently
    const [users, totalCount] = await Promise.all([
      User.findAll({
        order: [["UserID", "ASC"]],
        limit: pageSize,
        offset,
        attributes: { exclude: ["PasswordHash"] },
      }),
      User.count(), // Get total count for pagination metadata
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    // Get reservation counts for each user
    const userIds = users.map((user) => user.UserID);

    // Use Promise.all to get reservation counts for each user individually
    // This is more type-safe than using raw queries with group by
    const reservationCountPromises = userIds.map((id) =>
      Reservation.count({
        where: { UserID: id },
      }).then((count) => ({ id, count }))
    );

    const reservationCounts = await Promise.all(reservationCountPromises);

    // Create a map of user ID to reservation count using properly typed results
    const reservationCountMap = new Map<number, number>();
    reservationCounts.forEach(({ id, count }) => {
      reservationCountMap.set(id, count);
    });

    // Add reservation counts to user data
    const usersWithCounts = users.map((user) => {
      const userData = user.toJSON();
      return {
        ...userData,
        ReservationCount: reservationCountMap.get(user.UserID) ?? 0,
        IsAdmin: !!user.Admin,
      };
    });

    const response: ApiResponse<{
      users: typeof usersWithCounts;
      totalCount: number;
      totalPages: number;
      currentPage: number;
    }> = {
      message: "Users retrieved successfully",
      data: {
        users: usersWithCounts,
        totalCount,
        totalPages,
        currentPage: page,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching users:", error);
    const response: ApiResponse<null> = {
      message: "Error retrieving users",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
}

/**
 * Get a specific user by ID
 */
export async function getUserById(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      const response: ApiResponse<null> = {
        message: "Invalid user ID",
        error: "User ID must be a number",
      };
      res.status(400).json(response);
      return;
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ["PasswordHash"] },
    });

    if (!user) {
      const response: ApiResponse<null> = {
        message: "User not found",
        error: "The requested user does not exist",
      };
      res.status(404).json(response);
      return;
    }

    // Get reservation count
    const reservationCount = await Reservation.count({
      where: { UserID: userId },
    });

    const userData = {
      ...user.toJSON(),
      ReservationCount: reservationCount,
      IsAdmin: !!user.Admin,
    };

    const response: ApiResponse<typeof userData> = {
      message: "User retrieved successfully",
      data: userData,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching user:", error);
    const response: ApiResponse<null> = {
      message: "Error retrieving user",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
}

/**
 * Update a user
 */
export async function updateUser(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      const response: ApiResponse<null> = {
        message: "Invalid user ID",
        error: "User ID must be a number",
      };
      res.status(400).json(response);
      return;
    }

    const { FirstName, LastName, Email, IsAdmin } = req.body as UpdateUserBody;

    const user = await User.findByPk(userId);
    if (!user) {
      const response: ApiResponse<null> = {
        message: "User not found",
        error: "The requested user does not exist",
      };
      res.status(404).json(response);
      return;
    }

    // Update user fields
    await user.update({
      FirstName,
      LastName,
      Email,
      Admin: IsAdmin,
    });

    const response: ApiResponse<{ message: string }> = {
      message: "User updated successfully",
      data: {
        message: `User ${user.Username} with id #${userId.toString()} has been updated`,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error updating user:", error);
    const response: ApiResponse<null> = {
      message: "Error updating user",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
}

/**
 * Delete a user
 */
export async function deleteUser(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      const response: ApiResponse<null> = {
        message: "Invalid user ID",
        error: "User ID must be a number",
      };
      res.status(400).json(response);
      return;
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      const response: ApiResponse<null> = {
        message: "User not found",
        error: "The requested user does not exist",
      };
      res.status(404).json(response);
      return;
    }

    // Delete user's reservations first
    await Reservation.destroy({
      where: { UserID: userId },
    });

    // Delete the user
    await user.destroy();

    const response: ApiResponse<{ message: string }> = {
      message: "User deleted successfully",
      data: {
        message: `User #${user.Username} with ID #${userId.toString()} and associated data have been deleted`,
      },
    };

    res.json(response);
  } catch (error) {
    console.error("Error deleting user:", error);
    const response: ApiResponse<null> = {
      message: "Error deleting user",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
}

/**
 * Create a new user (admin only)
 */
export async function createUser(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { Username, FirstName, LastName, Email, Password, IsAdmin } =
      req.body as CreateUserBody;

    // Check if username already exists
    const existingUser = await User.findOne({
      where: { Username },
    });

    if (existingUser) {
      const response: ApiResponse<null> = {
        message: "Username already taken",
        error: "The username is already in use",
      };
      res.status(400).json(response);
      return;
    }

    // Create the new user
    const newUser = await User.create({
      Username,
      FirstName,
      LastName,
      Email,
      PasswordHash: Password, // Will be hashed by model hooks
      Admin: IsAdmin,
    });

    const userData = {
      UserID: newUser.UserID,
      Username: newUser.Username,
      FirstName: newUser.FirstName,
      LastName: newUser.LastName,
      Email: newUser.Email,
      IsAdmin: !!newUser.Admin,
      ReservationCount: 0,
    };

    const response: ApiResponse<typeof userData> = {
      message: "User created successfully",
      data: userData,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Error creating user:", error);
    const response: ApiResponse<null> = {
      message: "Error creating user",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
}

/**
 * Reset a user's password
 */
export async function resetUserPassword(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      const response: ApiResponse<null> = {
        message: "Invalid user ID",
        error: "User ID must be a number",
      };
      res.status(400).json(response);
      return;
    }

    // Check if user exists
    const user = await User.findByPk(userId);
    if (!user) {
      const response: ApiResponse<null> = {
        message: "User not found",
        error: "The requested user does not exist",
      };
      res.status(404).json(response);
      return;
    }

    const { newPassword } = req.body as ResetPasswordBody;

    // Update the password
    await user.update({
      PasswordHash: newPassword, // Will be hashed by model hooks
    });

    const response: ApiResponse<{ message: string }> = {
      message: "Password reset successfully",
      data: { message: `Password has been reset for user #${user.Username}` },
    };

    res.json(response);
  } catch (error) {
    console.error("Error resetting password:", error);
    const response: ApiResponse<null> = {
      message: "Error resetting password",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
}

/**
 * Get dashboard statistics for admin
 */
export async function getDashboardStats(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    // Get count of total flights
    const totalFlights = await Flight.count();

    // Get count of total users
    const totalUsers = await User.count();

    // Get count of total aircraft
    const totalAircraft = await Aircraft.count();

    // Get count of total reservations
    const totalReservations = await Reservation.count();

    const dashboardStats: DashboardStatsResponse = {
      totalFlights,
      totalUsers,
      totalAircraft,
      totalReservations,
    };

    const response: ApiResponse<DashboardStatsResponse> = {
      message: "Dashboard statistics retrieved successfully",
      data: dashboardStats,
    };

    res.json(response);
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    const response: ApiResponse<null> = {
      message: "Error retrieving dashboard statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    };
    res.status(500).json(response);
  }
}
