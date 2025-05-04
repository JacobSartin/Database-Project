import React, { useState, useEffect } from "react";
import {
  Typography,
  Container,
  Box,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Pagination,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getPaginatedFlights,
  deleteFlight,
  ConvertedFlight,
} from "../../services/api";

const AdminFlights: React.FC = () => {
  // State for flights and pagination
  const [flights, setFlights] = useState<ConvertedFlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalFlights, setTotalFlights] = useState(0);

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin) {
      navigate("/");
      return;
    }

    // Fetch flights data with pagination
    const fetchFlights = async () => {
      setLoading(true);
      try {
        const data = await getPaginatedFlights({ page, pageSize });

        setFlights(data.flights);
        setTotalFlights(data.totalCount);
        setTotalPages(data.totalPages);
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
        console.error("Error fetching flights:", err);

        // Set empty flights array if API fails
        setFlights([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFlights();
  }, [isAdmin, navigate, page, pageSize]);

  const handleEditFlight = (flightId: number) => {
    navigate(`/admin/flights/edit/${flightId}`);
  };

  const handleDeleteFlight = async (flightId: number) => {
    if (!window.confirm("Are you sure you want to delete this flight?")) {
      return;
    }

    try {
      await deleteFlight(flightId);

      // Update flights state after successful deletion
      setFlights((prevFlights) =>
        prevFlights.filter((flight) => flight.FlightID !== flightId)
      );

      // Recalculate total counts
      setTotalFlights((prev) => prev - 1);
      setTotalPages(Math.ceil((totalFlights - 1) / pageSize));

      // If we deleted the last item on the page, go back one page
      if (flights.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error("Error deleting flight:", err);
    }
  };

  const handleAddFlight = () => {
    navigate("/admin/flights/add");
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    const newSize = Number(event.target.value);
    setPageSize(newSize);
    setPage(1); // Reset to first page when changing page size
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading flights...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          Flight Management
        </Typography>
        <Button variant="contained" color="primary" onClick={handleAddFlight}>
          Add New Flight
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {flights.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No flights found in the system.
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mt: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Flight ID</TableCell>
                  <TableCell>Origin</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Departure</TableCell>
                  <TableCell>Arrival</TableCell>
                  <TableCell>Aircraft</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {flights.map((flight) => (
                  <TableRow key={flight.FlightID}>
                    <TableCell>FL-{flight.FlightID}</TableCell>
                    <TableCell>
                      {flight.originAirport?.Code} ({flight.originAirport?.City}
                      )
                    </TableCell>
                    <TableCell>
                      {flight.destinationAirport?.Code} (
                      {flight.destinationAirport?.City})
                    </TableCell>
                    <TableCell>
                      {flight.DepartureTime.toLocaleString()}
                    </TableCell>
                    <TableCell>{flight.ArrivalTime.toLocaleString()}</TableCell>
                    <TableCell>{flight.aircraft?.Model}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleEditFlight(flight.FlightID!)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleDeleteFlight(flight.FlightID!)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination controls */}
          <Box
            sx={{
              mt: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {flights.length} of {totalFlights} flights
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <FormControl variant="standard" sx={{ minWidth: 120 }}>
                <InputLabel id="page-size-select-label">
                  Rows per page
                </InputLabel>
                <Select
                  labelId="page-size-select-label"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  label="Rows per page"
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                </Select>
              </FormControl>

              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Stack>
          </Box>
        </>
      )}
    </Container>
  );
};

export default AdminFlights;
