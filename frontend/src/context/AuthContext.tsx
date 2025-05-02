import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
} from "react";
import { User } from "../types/shared";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getCurrentUser,
} from "../services/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading to check for session

  // Check for existing session token on component mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await getCurrentUser();
        if (response.data) {
          // Transform the user data to ensure correct property casing
          const userData: User = {
            UserID: response.data.UserID,
            Username: response.data.Username,
            Email: response.data.Email,
            FirstName: response.data.FirstName,
            LastName: response.data.LastName,
            isAdmin: response.data.isAdmin,
          };
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth check failed", error);
        // Clear user state if session invalid
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function - updated to use username
  const login = async (username: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await apiLogin({ username, password });
      // Transform the user data to ensure correct property casing
      const userData: User = {
        UserID: response.data!.UserID,
        Username: response.data!.Username,
        Email: response.data!.Email,
        FirstName: response.data!.FirstName,
        LastName: response.data!.LastName,
        isAdmin: response.data!.isAdmin,
      };
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Login error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function - updated to include username
  const register = async (
    username: string,
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<User> => {
    setLoading(true);
    try {
      const response = await apiRegister({
        username,
        email,
        password,
        firstName,
        lastName,
      });
      // Transform the user data to ensure correct property casing
      const userData: User = {
        UserID: response.data!.UserID,
        Username: response.data!.Username,
        Email: response.data!.Email,
        FirstName: response.data!.FirstName,
        LastName: response.data!.LastName,
        isAdmin: response.data!.isAdmin,
      };
      setUser(userData);
      return userData;
    } catch (error) {
      console.error("Registration error", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    setLoading(true);
    try {
      await apiLogout();
      setUser(null);
    } catch (error) {
      console.error("Logout error", error);
      // Still clear user state on client side even if server logout fails
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
