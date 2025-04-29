import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Divider,
  Grid,
  Alert,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import { Flight, Seat, formatDateTime } from "../types/flightTypes";

type BookingConfirmationProps = {
  flight: Flight;
  seat: Seat;
  bookingId?: string;
  onBookAnother: () => void;
};

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({
  flight,
  seat,
  bookingId = "TBD",
  onBookAnother,
}) => {
  // Generate a booking reference if not provided
  const bookingReference =
    bookingId ||
    `ARL${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`;

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
          Your flight has been successfully booked.
        </Typography>
      </Box>

      <Alert severity="success" sx={{ mb: 3, width: "100%" }}>
        <Typography variant="body1">
          Your booking reference: <strong>{bookingReference}</strong>
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
          <Grid>
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

          <Grid>
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

        <Grid container spacing={2}>
          <Grid>
            <Typography variant="body2" color="text.secondary">
              Seat Number
            </Typography>
            <Typography
              variant="body1"
              gutterBottom
              sx={{ fontWeight: "bold" }}
            >
              {seat.seatNumber}
            </Typography>
          </Grid>

          <Grid>
            <Typography variant="body2" color="text.secondary">
              Class
            </Typography>
            <Typography variant="body1" gutterBottom>
              Economy
            </Typography>
          </Grid>
        </Grid>
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
