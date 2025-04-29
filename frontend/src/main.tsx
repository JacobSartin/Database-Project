import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Typography,
  Box,
} from "@mui/material";
import FlightBookingForm from "./components/FlightBookingForm";
import TopBar from "./components/TopBar";

// Create a custom theme with fixed width issues
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    h1: {
      fontSize: "2.5rem",
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          maxWidth: "100% !important", // Override maxWidth limitations
          paddingLeft: "24px",
          paddingRight: "24px",
          width: "100%",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          width: "100%", // Ensure all Paper components take full width
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
      <Box sx={{ width: "100vw", overflowX: "hidden" }}>
        {" "}
        <TopBar />
        <Box component="main" sx={{ width: "100%" }}>
          <Box sx={{ mt: 4, mb: 2, px: 2 }}>
            <Typography variant="h4" component="h1" align="center" gutterBottom>
              Book Your Flight
            </Typography>
            <Typography
              variant="subtitle1"
              align="center"
              color="text.secondary"
              gutterBottom
            >
              Search, select and book flights to destinations worldwide
            </Typography>
          </Box>

          <Box sx={{ px: 2, maxWidth: "800px", mx: "auto", width: "100%" }}>
            <FlightBookingForm />
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  </StrictMode>
);
