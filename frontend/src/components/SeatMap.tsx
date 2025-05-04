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
import { formatDateTime } from "../types/flightTypes";
import {
  FlightResponse,
  SeatResponse,
} from "../../../backend/src/types/requestTypes";

type SeatMapProps = {
  flight: Omit<FlightResponse, "DepartureTime" | "ArrivalTime"> & {
    DepartureTime: Date;
    ArrivalTime: Date;
  };
  seats: SeatResponse[];
  selectedSeats: SeatResponse[];
  onSeatSelect: (seat: SeatResponse) => void;
  onBack: () => void;
  onConfirm: () => void;
  loading?: boolean;
  passengerCount?: number;
};

const SeatMap: React.FC<SeatMapProps> = ({
  flight,
  seats,
  selectedSeats,
  onSeatSelect,
  onBack,
  onConfirm,
  loading = false,
  passengerCount = 1,
}) => {
  // Organize seats into a grid structure for display
  // This helps visualize a proper airplane layout
  const organizeSeatsIntoGrid = () => {
    const seatGrid: {
      [row: string]: { [col: string]: SeatResponse | null };
    } = {};
    const columns = ["A", "B", "C", "D", "E", "F"];

    // Extract all unique row numbers from the seats array
    const uniqueRows = Array.from(
      new Set(
        seats.map((seat) => {
          const row = seat.SeatNumber.match(/^\d+/)?.[0] || "";
          return parseInt(row, 10);
        })
      )
    ).sort((a, b) => a - b);

    // Get the maximum row number
    const maxRows = uniqueRows.length > 0 ? Math.max(...uniqueRows) : 0;

    // Initialize the grid with null values (no seats)
    for (let r = 1; r <= maxRows; r++) {
      const rowString = String(r);
      seatGrid[rowString] = {};
      columns.forEach((col) => {
        seatGrid[rowString][col] = null;
      });
    }

    // Fill in the available seats
    seats.forEach((seat) => {
      const seatNumber = seat.SeatNumber; // Format should be like "1A", "2B", etc.
      const row = seatNumber.match(/^\d+/)?.[0] || "";
      const col = seatNumber.replace(row, "");

      if (row && col && seatGrid[row]) {
        seatGrid[row][col] = seat;
      }
    });

    return {
      seatGrid,
      rows: Object.keys(seatGrid).sort((a, b) => parseInt(a) - parseInt(b)),
      columns,
    };
  };

  const { seatGrid, rows, columns } = organizeSeatsIntoGrid();

  const handleSeatClick = (seat: SeatResponse | null) => {
    if (seat && !seat.IsBooked) {
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

  // Count the number of selected seats
  const selectedSeatCount = selectedSeats.length;

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
          {flight.originAirport?.Code ?? ""} to{" "}
          {flight.destinationAirport?.Code ?? ""} •{" "}
          {formatDateTime(flight.DepartureTime)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Aircraft: {flight.aircraft?.Model || "-"}
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
        {/* Plane Front - Moved to the top before the seat grid */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
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
        </Box>

        <Grid container spacing={2}>
          {/* Legend */}
          <Grid sx={{ gridColumn: "1 / -1" }}>
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

          {/* Seat Map - Use the grid system */}
          <Grid sx={{ gridColumn: "1 / -1" }}>
            <Box
              sx={{ display: "flex", justifyContent: "center", width: "100%" }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  maxWidth: "800px",
                  width: "100%",
                }}
              >
                {/* Column headers */}
                <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
                  <Box sx={{ width: "30px" }} />
                  <Box
                    sx={{
                      display: "flex",
                      flex: 1,
                    }}
                  >
                    {/* First 3 columns (A-B-C) */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-around",
                        flex: 1,
                      }}
                    >
                      {columns.slice(0, 3).map((col) => (
                        <Box
                          key={col}
                          sx={{
                            width: "40px",
                            textAlign: "center",
                            fontWeight: "bold",
                          }}
                        >
                          {col}
                        </Box>
                      ))}
                    </Box>

                    {/* Aisle */}
                    <Box sx={{ width: "30px" }} />

                    {/* Last 3 columns (D-E-F) */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-around",
                        flex: 1,
                      }}
                    >
                      {columns.slice(3).map((col) => (
                        <Box
                          key={col}
                          sx={{
                            width: "40px",
                            textAlign: "center",
                            fontWeight: "bold",
                          }}
                        >
                          {col}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>

                {/* Seat rows */}
                {rows.map((row) => (
                  <Box key={row} sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: "30px",
                        textAlign: "center",
                        fontWeight: "bold",
                      }}
                    >
                      {row}
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flex: 1,
                      }}
                    >
                      {/* First 3 columns (A-B-C) */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-around",
                          flex: 1,
                          gap: 1,
                        }}
                      >
                        {columns.slice(0, 3).map((col) => {
                          const seat = seatGrid[row][col];
                          const seatExists = seat !== null;
                          const isBooked = seat?.IsBooked || false;
                          const isSelected =
                            seatExists &&
                            selectedSeats.some((s) => s.SeatID === seat.SeatID);

                          return (
                            <Tooltip
                              key={`${row}${col}`}
                              title={
                                !seatExists
                                  ? "No seat"
                                  : isBooked
                                    ? "Booked"
                                    : `Seat ${row}${col}`
                              }
                            >
                              <Box
                                onClick={() =>
                                  seatExists && handleSeatClick(seat)
                                }
                                sx={{
                                  width: 40,
                                  height: 40,
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  borderRadius: 1,
                                  cursor:
                                    !seatExists || isBooked
                                      ? "not-allowed"
                                      : "pointer",
                                  bgcolor: !seatExists
                                    ? "transparent"
                                    : isBooked
                                      ? "grey.300"
                                      : isSelected
                                        ? "primary.main"
                                        : "success.light",
                                  color: isSelected ? "white" : "text.primary",
                                  transition: "all 0.2s",
                                  border: !seatExists
                                    ? "1px dashed grey.300"
                                    : "none",
                                  visibility: !seatExists
                                    ? "hidden"
                                    : "visible",
                                  "&:hover": {
                                    boxShadow:
                                      !seatExists || isBooked ? "none" : 2,
                                    transform:
                                      !seatExists || isBooked
                                        ? "none"
                                        : "scale(1.05)",
                                  },
                                }}
                              >
                                {seatExists &&
                                  (isSelected ? (
                                    <CheckCircleOutlineIcon fontSize="small" />
                                  ) : (
                                    <AirlineSeatReclineNormalIcon fontSize="small" />
                                  ))}
                              </Box>
                            </Tooltip>
                          );
                        })}
                      </Box>

                      {/* Aisle */}
                      <Box
                        sx={{
                          width: "30px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          color: "text.secondary",
                          fontSize: "8px",
                        }}
                      >
                        |
                      </Box>

                      {/* Last 3 columns (D-E-F) */}
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-around",
                          flex: 1,
                          gap: 1,
                        }}
                      >
                        {columns.slice(3).map((col) => {
                          const seat = seatGrid[row][col];
                          const seatExists = seat !== null;
                          const isBooked = seat?.IsBooked || false;
                          const isSelected =
                            seatExists &&
                            selectedSeats.some((s) => s.SeatID === seat.SeatID);

                          return (
                            <Tooltip
                              key={`${row}${col}`}
                              title={
                                !seatExists
                                  ? "No seat"
                                  : isBooked
                                    ? "Booked"
                                    : `Seat ${row}${col}`
                              }
                            >
                              <Box
                                onClick={() =>
                                  seatExists && handleSeatClick(seat)
                                }
                                sx={{
                                  width: 40,
                                  height: 40,
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  borderRadius: 1,
                                  cursor:
                                    !seatExists || isBooked
                                      ? "not-allowed"
                                      : "pointer",
                                  bgcolor: !seatExists
                                    ? "transparent"
                                    : isBooked
                                      ? "grey.300"
                                      : isSelected
                                        ? "primary.main"
                                        : "success.light",
                                  color: isSelected ? "white" : "text.primary",
                                  transition: "all 0.2s",
                                  border: !seatExists
                                    ? "1px dashed grey.300"
                                    : "none",
                                  visibility: !seatExists
                                    ? "hidden"
                                    : "visible",
                                  "&:hover": {
                                    boxShadow:
                                      !seatExists || isBooked ? "none" : 2,
                                    transform:
                                      !seatExists || isBooked
                                        ? "none"
                                        : "scale(1.05)",
                                  },
                                }}
                              >
                                {seatExists &&
                                  (isSelected ? (
                                    <CheckCircleOutlineIcon fontSize="small" />
                                  ) : (
                                    <AirlineSeatReclineNormalIcon fontSize="small" />
                                  ))}
                              </Box>
                            </Tooltip>
                          );
                        })}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Fixed position booking info box */}
      <Paper
        elevation={3}
        sx={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          maxWidth: "350px",
          width: { xs: "calc(100% - 40px)", sm: "350px" },
          p: 2,
          borderRadius: 2,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)",
          bgcolor: "background.paper",
          transition: "all 0.3s ease",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" component="div" sx={{ fontWeight: "bold" }}>
            Selected Seats
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              bgcolor: "primary.light",
              color: "primary.contrastText",
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: "0.875rem",
              fontWeight: "medium",
            }}
          >
            {selectedSeatCount} / {passengerCount}
          </Box>
        </Box>

        {selectedSeats.length > 0 ? (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selectedSeats.map((seat) => (
              <Box
                key={seat.SeatID}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  color: "white",
                  borderRadius: 1,
                  py: 0.5,
                  px: 1,
                  fontWeight: "medium",
                  fontSize: "0.875rem",
                }}
              >
                {seat.SeatNumber}
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Please select {passengerCount} seat(s) to continue
          </Typography>
        )}

        {selectedSeatCount < passengerCount && (
          <Typography color="warning.main" variant="body2">
            {passengerCount - selectedSeatCount} more seat(s) needed
          </Typography>
        )}

        <Button
          variant="contained"
          onClick={onConfirm}
          disableElevation
          disabled={selectedSeatCount < passengerCount}
          sx={{
            fontWeight: "bold",
            py: 1,
          }}
          fullWidth
        >
          Confirm Booking
        </Button>
      </Paper>
    </Paper>
  );
};

export default SeatMap;
