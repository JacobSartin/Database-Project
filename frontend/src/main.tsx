import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { ThemeProvider, CssBaseline, Box } from "@mui/material";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FlightBookingForm from "./components/FlightBookingForm";
import UserBookings from "./components/UserBookings";
import TopBar from "./components/TopBar";
import { AuthProvider } from "./context/AuthContext";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminFlights from "./components/admin/AdminFlights";
import FlightForm from "./components/admin/FlightForm";
import { theme } from "./theme";
import AdminReservations from "./components/admin/AdminReservations";
import AdminAircraft from "./components/admin/AdminAircraft";
import AdminUsers from "./components/admin/AdminUsers";
import AdminAirports from "./components/admin/AdminAirports";

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
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route
                  path="/admin/reservations"
                  element={<AdminReservations />}
                />
                <Route path="/admin/aircraft" element={<AdminAircraft />} />
                <Route path="admin/airports" element={<AdminAirports />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
          </Box>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
