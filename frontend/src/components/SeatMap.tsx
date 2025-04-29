import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Flight, Seat, formatDateTime } from "../types/flightTypes";

type SeatMapProps = {
  flight: Flight;
  seats: Seat[];
  selectedSeat: Seat | null;
  onSeatSelect: (seat: Seat) => void;
  onBack: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

const SeatMap: React.FC<SeatMapProps> = ({
  flight,
  seats,
  selectedSeat,
  onSeatSelect,
  onBack,
  onConfirm,
  loading = false,
}) => {
  // Group seats by row
  const seatsByRow: { [row: string]: Seat[] } = {};

  seats.forEach((seat) => {
    const row = seat.seatNumber.match(/^\d+/)?.[0] || "";
    if (!seatsByRow[row]) seatsByRow[row] = [];
    seatsByRow[row].push(seat);
  });

  const handleSeatClick = (seat: Seat) => {
    if (!seat.isBooked) {
      onSeatSelect(seat);
    }
  };

  if (loading) {
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
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Paper>
    );
  }

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
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          width: "100%",
        }}
      >
        <Typography variant="h5" component="h2">
          Select Your Seat
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          size="small"
          onClick={onBack}
        >
          Back to Flights
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          {flight.originCode} to {flight.destinationCode} •{" "}
          {formatDateTime(flight.departureTime)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aircraft: {flight.aircraftModel}
        </Typography>
      </Box>

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
        <Grid container spacing={2}>
          {/* Legend */}
          <Grid>
            <Box sx={{ display: "flex", gap: 3, mb: 2, flexWrap: "wrap" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: "success.light",
                    borderRadius: 1,
                    mr: 1,
                  }}
                />
                <Typography variant="body2">Available</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: "grey.300",
                    borderRadius: 1,
                    mr: 1,
                  }}
                />
                <Typography variant="body2">Booked</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 24,
                    height: 24,
                    bgcolor: "primary.main",
                    borderRadius: 1,
                    mr: 1,
                  }}
                />
                <Typography variant="body2">Selected</Typography>
              </Box>
            </Box>
          </Grid>

          {/* Plane Front */}
          <Grid sx={{ textAlign: "center", mb: 2 }}>
            <Paper
              elevation={0}
              sx={{
                display: "inline-block",
                border: "2px solid",
                borderColor: "grey.400",
                borderRadius: 2,
                px: 4,
                py: 1,
                color: "text.secondary",
              }}
            >
              FRONT OF PLANE
            </Paper>
          </Grid>

          {/* Seat Map */}
          <Grid
            sx={{ display: "flex", justifyContent: "center", width: "100%" }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                maxHeight: "400px",
                overflowY: "auto",
                width: "100%",
                maxWidth: "600px", // Set a max width for better visual appearance
                px: 2,
                py: 1,
              }}
            >
              {Object.keys(seatsByRow)
                .sort((a, b) => parseInt(a) - parseInt(b))
                .map((row) => (
                  <Box
                    key={row}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mb: 0.5,
                      width: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        width: 30,
                        textAlign: "center",
                        mt: 1,
                        fontWeight: "bold",
                      }}
                    >
                      {row}
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        justifyContent: "center",
                        flex: 1,
                      }}
                    >
                      {seatsByRow[row].map((seat) => (
                        <Tooltip
                          key={seat.seatId}
                          title={
                            seat.isBooked
                              ? "Seat not available"
                              : `Seat ${seat.seatNumber}`
                          }
                        >
                          <Box
                            onClick={() => handleSeatClick(seat)}
                            sx={{
                              width: 40,
                              height: 40,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              borderRadius: 1,
                              cursor: seat.isBooked ? "not-allowed" : "pointer",
                              bgcolor: seat.isBooked
                                ? "grey.300"
                                : selectedSeat?.seatId === seat.seatId
                                  ? "primary.main"
                                  : "success.light",
                              color:
                                selectedSeat?.seatId === seat.seatId
                                  ? "white"
                                  : "text.primary",
                              transition: "all 0.2s",
                              "&:hover": {
                                boxShadow: seat.isBooked ? "none" : 2,
                                transform: seat.isBooked
                                  ? "none"
                                  : "scale(1.05)",
                              },
                            }}
                          >
                            {selectedSeat?.seatId === seat.seatId ? (
                              <CheckCircleOutlineIcon fontSize="small" />
                            ) : (
                              <AirlineSeatReclineNormalIcon fontSize="small" />
                            )}
                          </Box>
                        </Tooltip>
                      ))}
                    </Box>
                  </Box>
                ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {selectedSeat && (
        <Box sx={{ textAlign: "center", width: "100%" }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6">
              Selected Seat: <strong>{selectedSeat.seatNumber}</strong>
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={onConfirm}
            disableElevation
            sx={{ maxWidth: "300px", width: "100%" }}
          >
            Confirm Booking
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default SeatMap;
