import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../types/requestTypes.js";

const JWT_SECRET = process.env.JWT_SECRET ?? "your-secret-key";
const TOKEN_EXPIRY = "24h"; // Token expiry time

export interface JwtPayload {
  id: number;
  username: string;
  isAdmin: boolean;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Generate JWT token
export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};

// Middleware to verify JWT token
export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // Get token from Authorization header or cookies
  const authHeader = req.headers.authorization;

  // Extract token with proper typing
  const tokenFromHeader = authHeader ? authHeader.split(" ")[1] : undefined;
  // Cast cookies.token directly since Express types are causing issues
  const tokenFromCookie = req.cookies.token as string | undefined;

  const token: string | undefined = tokenFromHeader ?? tokenFromCookie;

  if (!token) {
    const response: ApiResponse<null> = {
      message: "Authentication failed",
      error: "Access token is required",
    };
    res.status(401).json(response);
    return;
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    const response: ApiResponse<null> = {
      message: "Authentication failed",
      error: "Invalid or expired token",
    };
    res.status(403).json(response);
  }
};

// Middleware to check admin status
export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    const response: ApiResponse<null> = {
      message: "Authentication failed",
      error: "User is not authenticated",
    };
    res.status(401).json(response);
    return;
  }

  if (!req.user.isAdmin) {
    const response: ApiResponse<null> = {
      message: "Authorization failed",
      error: "Admin privileges required",
    };
    res.status(403).json(response);
    return;
  }

  next();
};
