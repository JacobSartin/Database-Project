import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  CircularProgress,
  Tab,
  Tabs,
  Alert,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  mode: "login" | "register";
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onClose,
  mode: initialMode,
  onSuccess,
}) => {
  // State for form values
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get auth context
  const { login, register, loading } = useAuth();

  // Reset form when modal opens or mode changes
  React.useEffect(() => {
    setMode(initialMode);
    // Clear form and error on open
    if (open) {
      setUsername("");
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setErrorMessage(null);
    }
  }, [open, initialMode]);

  // Handle tab change between login and register
  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: "login" | "register"
  ) => {
    setMode(newValue);
    setErrorMessage(null);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await register(username, email, password, firstName, lastName);
      }

      // Close modal and call success callback if provided
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const defaultMessage = `Failed to ${mode === "login" ? "log in" : "register"}`;
      if (err instanceof Error) {
        setErrorMessage(err.message || defaultMessage);
      } else {
        setErrorMessage(defaultMessage);
      }
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Tabs
          value={mode}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Login" value="login" />
          <Tab label="Register" value="register" />
        </Tabs>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {mode === "login" ? (
            <TextField
              autoFocus
              margin="dense"
              label="Username"
              type="text"
              fullWidth
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
            />
          ) : (
            <>
              <TextField
                autoFocus
                margin="dense"
                label="Username"
                type="text"
                fullWidth
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Email Address"
                type="email"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />
            </>
          )}

          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          {mode === "register" && (
            <Box sx={{ display: "flex", gap: 2 }}>
              <TextField
                margin="dense"
                label="First Name"
                fullWidth
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                margin="dense"
                label="Last Name"
                fullWidth
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                sx={{ mb: 2 }}
              />
            </Box>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            {mode === "login"
              ? "Log in to complete your booking and access your reservations."
              : "Create an account to manage your bookings and access exclusive offers."}
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : mode === "login" ? (
              "Login"
            ) : (
              "Register"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AuthModal;
