import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import { Flight, Seat, formatDateTime } from "../types/flightTypes";

type BookingConfirmationProps = {
  flight: Flight;
  seats: Seat[]; // Changed from single seat to array
  bookingId?: string;
  onBookAnother: () => void;
};

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  flight,
  seats, // Changed from seat
  bookingId = "TBD",
  onBookAnother,
}) => {
  // Format the booking reference for display
  const formattedBookingReference = React.useMemo(() => {
    // If no booking ID is provided, use a fallback format (should not happen with the fix)
    if (!bookingId || bookingId === "TBD") {
      return `ARL${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`;
    }

    // Format a single reservation ID
    if (!bookingId.includes(",")) {
      return `FLY-${bookingId}`;
    }

    // For multiple reservations, format as a group booking
    return `FLY-GROUP-${bookingId.split(",")[0]}`;
  }, [bookingId]);

  return (
    <Paper
      elevation={1}
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 3,
        mb: 3,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mb: 3,
          width: "100%",
        }}
      >
        <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 1 }} />
        <Typography variant="h4" component="h2" align="center" gutterBottom>
          Booking Confirmed!
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary">
          Your {seats.length > 1 ? "seats have" : "seat has"} been successfully
          booked.
        </Typography>
      </Box>

      <Alert severity="success" sx={{ mb: 3, width: "100%" }}>
        <Typography
          variant="body1"
          sx={{ fontWeight: "medium", color: "#000000" }}
        >
          Your booking reference:{" "}
          <strong
            style={{
              backgroundColor: "#f0f0f0",
              padding: "2px 6px",
              borderRadius: "4px",
            }}
          >
            {formattedBookingReference}
          </strong>
        </Typography>
      </Alert>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          border: "1px solid #e0e0e0",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <FlightTakeoffIcon sx={{ mr: 1 }} /> Flight Details
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Grid container spacing={2}>
          <Grid sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
            <Typography variant="body2" color="text.secondary">
              Flight
            </Typography>
            <Typography variant="body1" gutterBottom>
              {flight.originCode} to {flight.destinationCode}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Date
            </Typography>
            <Typography variant="body1" gutterBottom>
              {new Date(flight.departureTime).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Departure
            </Typography>
            <Typography variant="body1" gutterBottom>
              {formatDateTime(flight.departureTime)}
            </Typography>
          </Grid>

          <Grid sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
            <Typography variant="body2" color="text.secondary">
              Flight Number
            </Typography>
            <Typography variant="body1" gutterBottom>
              FL-{flight.flightId}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Aircraft
            </Typography>
            <Typography variant="body1" gutterBottom>
              {flight.aircraftModel}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Arrival
            </Typography>
            <Typography variant="body1" gutterBottom>
              {formatDateTime(flight.arrivalTime)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 4,
          border: "1px solid #e0e0e0",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{ display: "flex", alignItems: "center" }}
        >
          <AirlineSeatReclineNormalIcon sx={{ mr: 1 }} /> Seat Information
        </Typography>
        <Divider sx={{ mb: 2 }} />

        {seats.length === 1 ? (
          // Single seat display
          <Grid container spacing={2}>
            <Grid sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
              <Typography variant="body2" color="text.secondary">
                Seat Number
              </Typography>
              <Typography
                variant="body1"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                {seats[0].seatNumber}
              </Typography>
            </Grid>

            <Grid sx={{ gridColumn: { xs: "1 / -1", md: "span 6" } }}>
              <Typography variant="body2" color="text.secondary">
                Class
              </Typography>
              <Typography variant="body1" gutterBottom>
                Economy
              </Typography>
            </Grid>
          </Grid>
        ) : (
          // Multiple seats display
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              You have booked {seats.length} seats
            </Typography>

            <List>
              {seats.map((seat) => (
                <ListItem key={seat.seatId}>
                  <ListItemIcon>
                    <AirlineSeatReclineNormalIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={`Seat ${seat.seatNumber}`}
                    secondary="Economy Class"
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Paper>

      <Box sx={{ textAlign: "center", width: "100%" }}>
        <Button
          variant="contained"
          size="large"
          onClick={onBookAnother}
          startIcon={<ConfirmationNumberIcon />}
          disableElevation
          sx={{ maxWidth: "300px", width: "100%" }}
        >
          Book Another Flight
        </Button>
      </Box>
    </Paper>
  );
};

export default BookingConfirmation;
