import React from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Divider,
  Stack,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import { Flight, formatDateTime } from "../types/flightTypes";

type FlightListProps = {
  flights: Flight[];
  sourceAirport: string;
  destinationAirport: string;
  departureDate: string;
  onSelectFlight: (flight: Flight) => void;
  onModifySearch: () => void;
};

const FlightList: React.FC<FlightListProps> = ({
  flights,
  sourceAirport,
  destinationAirport,
  departureDate,
  onSelectFlight,
  onModifySearch,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Calculate flight duration in hours and minutes
  const calculateDuration = (departureTime: string, arrivalTime: string) => {
    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);
    const durationMs = arrival.getTime() - departure.getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <Paper
      elevation={1}
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: { xs: 2, sm: 3 },
        mb: 3,
        width: "100%",
        boxSizing: "border-box",
        maxHeight: "70vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          width: "100%",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="h5" component="h2">
          Available Flights
        </Typography>
        <Button variant="outlined" size="small" onClick={onModifySearch}>
          Modify Search
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          {sourceAirport} to {destinationAirport} •{" "}
          {new Date(departureDate).toLocaleDateString()}
        </Typography>
      </Box>

      {flights.length === 0 ? (
        <Paper
          elevation={0}
          sx={{ p: 3, textAlign: "center", border: "1px dashed #ccc" }}
        >
          <Typography>
            No flights available for the selected route and date.
          </Typography>
        </Paper>
      ) : (
        <Stack
          spacing={2}
          sx={{
            width: "100%",
            overflowY: "auto",
            pr: { xs: 0, sm: 1 },
            pb: 1,
          }}
        >
          {flights.map((flight) => (
            <Paper
              key={flight.flightId}
              elevation={1}
              sx={{
                p: { xs: 1.5, sm: 2 },
                width: "100%",
                "&:hover": {
                  boxShadow: 3,
                  cursor: "pointer",
                  transition: "box-shadow 0.3s ease-in-out",
                },
              }}
              onClick={() => onSelectFlight(flight)}
            >
              <Grid container spacing={1} alignItems="center">
                <Grid>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 1,
                      flexWrap: "wrap",
                      gap: 0.5,
                    }}
                  >
                    <Chip
                      label={flight.aircraftModel}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Flight #{flight.flightId}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: { xs: 1, sm: 2 },
                      flexWrap: isMobile ? "wrap" : "nowrap",
                    }}
                  >
                    <Box
                      sx={{
                        textAlign: "center",
                        minWidth: isMobile ? "60px" : "80px",
                      }}
                    >
                      <Typography variant={isMobile ? "body1" : "h6"}>
                        {flight.originCode}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(flight.departureTime).split(",")[1]}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        flex: 1,
                        px: { xs: 1, sm: 2 },
                        textAlign: "center",
                        my: isMobile ? 1 : 0,
                        width: isMobile ? "100%" : "auto",
                      }}
                    >
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 0.5 }}
                      >
                        {calculateDuration(
                          flight.departureTime,
                          flight.arrivalTime
                        )}
                      </Typography>
                      <Box sx={{ position: "relative", mx: 2 }}>
                        <Divider />
                        <FlightTakeoffIcon
                          fontSize="small"
                          color="primary"
                          sx={{
                            position: "absolute",
                            left: -5,
                            top: -10,
                            transform: "rotate(-45deg)",
                          }}
                        />
                        <FlightLandIcon
                          fontSize="small"
                          color="primary"
                          sx={{
                            position: "absolute",
                            right: -5,
                            top: -10,
                            transform: "rotate(45deg)",
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Direct Flight
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        textAlign: "center",
                        minWidth: isMobile ? "60px" : "80px",
                      }}
                    >
                      <Typography variant={isMobile ? "body1" : "h6"}>
                        {flight.destinationCode}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(flight.arrivalTime).split(",")[1]}
                      </Typography>
                    </Box>
                  </Box>

                  {!isMobile && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Departure: {formatDateTime(flight.departureTime)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Arrival: {formatDateTime(flight.arrivalTime)}
                      </Typography>
                    </>
                  )}
                </Grid>

                <Grid
                  textAlign={isMobile ? "center" : "right"}
                  sx={{ mt: isMobile ? 1 : 0 }}
                >
                  <Button
                    variant="contained"
                    endIcon={<AirplaneTicketIcon />}
                    disableElevation
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectFlight(flight);
                    }}
                    fullWidth={isMobile || isTablet}
                    size={isMobile ? "medium" : "large"}
                  >
                    Select Flight
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default FlightList;
