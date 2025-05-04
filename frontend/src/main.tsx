import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider, createTheme, CssBaseline, Box } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FlightBookingForm from "./components/FlightBookingForm";
import UserBookings from "./components/UserBookings";
import TopBar from "./components/TopBar";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminFlights from "./components/admin/AdminFlights";
import FlightForm from "./components/admin/FlightForm";

// Create a custom theme with fixed width issues
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#e51937", // Delta red color
    },
    background: {
      default: "#0a0c12", // Darker version of #14161d
      paper: "#14161d",
    },
    text: {
      primary: "#ffffff",
      secondary: "rgba(255,255,255,0.7)",
    },
  },
  typography: {
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
    allVariants: {
      color: "#ffffff",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
        contained: {
          backgroundColor: "#e51937", // Delta red
          "&:hover": {
            backgroundColor: "#c0142e", // Darker red on hover
          },
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: "1200px !important", // Override maxWidth limitations
          paddingLeft: "24px",
          paddingRight: "24px",
          width: "100%",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#14161d",
          color: "#ffffff",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#14161d",
          boxShadow: "none",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: "#ffffff",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& fieldset": {
            borderColor: "rgba(255, 255, 255, 0.2)",
          },
          "&:hover fieldset": {
            borderColor: "rgba(255, 255, 255, 0.4)",
          },
        },
      },
    },
  },
});

// Render the application
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Box
            sx={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
              bgcolor: "background.default",
              width: "100vw",
              maxWidth: "100%",
              overflowX: "hidden",
            }}
          >
            <TopBar />
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                flexGrow: 1,
                width: "100%",
                minHeight: "calc(100vh - 64px)", // Accounting for TopBar height
              }}
            >
              <Routes>
                <Route path="/" element={<FlightBookingForm />} />
                <Route path="/bookings" element={<UserBookings />} />

                {/* Admin routes */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/flights" element={<AdminFlights />} />
                <Route path="/admin/flights/add" element={<FlightForm />} />
                <Route
                  path="/admin/flights/edit/:flightId"
                  element={<FlightForm />}
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
