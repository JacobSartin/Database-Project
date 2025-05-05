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
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  getAdminReservations,
  deleteAdminReservation,
} from "../../services/adminApi";
import { ConvertedReservation } from "../../services/api";

const AdminReservations: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<ConvertedReservation[]>([]);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalReservations, setTotalReservations] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);

  // Dialog states
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<ConvertedReservation | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin) {
      navigate("/");
      return;
    }

    fetchReservations();
  }, [isAdmin, navigate, page, pageSize, searchTerm, fromDate, toDate]);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await getAdminReservations({
        page,
        pageSize,
      });

      setReservations(response.reservations);
      setTotalReservations(response.totalCount);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error("Error fetching reservation data:", err);
      setReservations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(1); // Reset to first page on search
  };

  const handleFromDateChange = (date: Date | null) => {
    setFromDate(date);
    setPage(1); // Reset to first page on date change
  };

  const handleToDateChange = (date: Date | null) => {
    setToDate(date);
    setPage(1); // Reset to first page on date change
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
    setPage(1); // Reset to first page on page size change
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setFromDate(null);
    setToDate(null);
    setPage(1);
  };

  const handleDeleteClick = (reservation: ConvertedReservation) => {
    setSelectedReservation(reservation);
    setDeleteDialogOpen(true);
  };

  const handleDetailsClick = (reservation: ConvertedReservation) => {
    setSelectedReservation(reservation);
    setDetailsDialogOpen(true);
  };

  const confirmDeleteReservation = async () => {
    if (!selectedReservation) return;

    try {
      await deleteAdminReservation(selectedReservation.ReservationID);

      // Refresh the reservations list
      fetchReservations();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setDeleteDialogOpen(false);
      setSelectedReservation(null);
    }
  };

  if (loading && page === 1) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading reservation data...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          Reservation Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          View and manage all customer reservations
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            alignItems: "center",
          }}
        >
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1, minWidth: "200px" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            placeholder="Search by passenger name, email, flight code..."
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="From Date"
              value={fromDate}
              onChange={handleFromDateChange}
              slotProps={{ textField: { size: "small" } }}
            />

            <DatePicker
              label="To Date"
              value={toDate}
              onChange={handleToDateChange}
              slotProps={{ textField: { size: "small" } }}
            />
          </LocalizationProvider>

          <Button variant="outlined" onClick={handleClearFilters} size="small">
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Reservations Table */}
      {reservations.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            No reservations found matching your criteria
          </Typography>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Passenger</TableCell>
                  <TableCell>Flight</TableCell>
                  <TableCell>Route</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Seat</TableCell>
                  <TableCell>Booking Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <CircularProgress size={24} sx={{ my: 2 }} />
                    </TableCell>
                  </TableRow>
                ) : (
                  reservations.map((reservation) => (
                    <TableRow key={reservation.ReservationID}>
                      <TableCell>{reservation.ReservationID}</TableCell>
                      <TableCell>
                        {`${reservation.user?.FirstName} ${reservation.user?.LastName}`}
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          {reservation.user?.Email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {reservation.flight?.FlightID}
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          {reservation.flight?.aircraft?.Model}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {`${reservation.flight?.originAirport?.Code} → ${reservation.flight?.destinationAirport?.Code}`}
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          {`${reservation.flight?.originAirport?.City} to ${reservation.flight?.destinationAirport?.City}`}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {reservation.flight?.DepartureTime.toLocaleDateString()}
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          {reservation.flight?.DepartureTime.toLocaleTimeString(
                            [],
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${reservation.seat?.SeatNumber}`}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {reservation.BookingTime.toLocaleDateString()}
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                        >
                          {reservation.BookingTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => handleDetailsClick(reservation)}
                            title="View Details"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick(reservation)}
                            title="Cancel Reservation"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination controls */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {reservations.length > 0 ? (page - 1) * pageSize + 1 : 0}-
              {Math.min(page * pageSize, totalReservations)} of{" "}
              {totalReservations} reservations
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

      {/* Reservation Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Reservation Details</DialogTitle>
        <DialogContent>
          {selectedReservation && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Passenger Information
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Name
                  </Typography>
                  <Typography>{`${selectedReservation?.user?.FirstName} ${selectedReservation?.user?.LastName}`}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography>{selectedReservation?.user?.Email}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    User ID
                  </Typography>
                  <Typography>{selectedReservation?.user?.UserID}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Username
                  </Typography>
                  <Typography>{selectedReservation?.user?.Username}</Typography>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>
                Flight Information
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 2,
                  mb: 3,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Flight Number
                  </Typography>
                  <Typography>
                    {selectedReservation.flight?.AircraftID}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Aircraft
                  </Typography>
                  <Typography>{`${selectedReservation.flight?.aircraft?.Model}`}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    From
                  </Typography>
                  <Typography>{`${selectedReservation.flight?.originAirport?.City} (${selectedReservation.flight?.originAirport?.Code})`}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedReservation.flight?.originAirport?.Country}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    To
                  </Typography>
                  <Typography>{`${selectedReservation.flight?.destinationAirport?.City} (${selectedReservation.flight?.destinationAirport?.Code})`}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedReservation.flight?.destinationAirport?.Country}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Departure
                  </Typography>
                  <Typography>
                    {selectedReservation.flight?.DepartureTime.toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Arrival
                  </Typography>
                  <Typography>
                    {selectedReservation.flight?.ArrivalTime.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h6" gutterBottom>
                Seat and Booking Information
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Seat Number
                  </Typography>
                  <Typography>
                    {selectedReservation.seat?.SeatNumber}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Booking Time
                  </Typography>
                  <Typography>
                    {selectedReservation.BookingTime.toLocaleString()}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Reservation ID
                  </Typography>
                  <Typography>{selectedReservation.ReservationID}</Typography>
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)} color="primary">
            Close
          </Button>
          <Button
            startIcon={<DeleteIcon />}
            onClick={() => {
              setDetailsDialogOpen(false);
              setDeleteDialogOpen(true);
            }}
            color="error"
          >
            Cancel Reservation
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Cancel Reservation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this reservation? This action cannot
            be undone.
            {selectedReservation && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2">
                  <strong>Passenger:</strong>{" "}
                  {`${selectedReservation.user?.FirstName} ${selectedReservation.user?.LastName}`}
                </Typography>
                <Typography variant="body2">
                  <strong>Flight:</strong>{" "}
                  {`${selectedReservation.flight?.AircraftID} (${selectedReservation.flight?.originAirport?.Code} to ${selectedReservation.flight?.destinationAirport?.Code})`}
                </Typography>
                <Typography variant="body2">
                  <strong>Date:</strong>{" "}
                  {selectedReservation.flight?.DepartureTime.toLocaleDateString()}
                </Typography>
                <Typography variant="body2">
                  <strong>Seat:</strong>{" "}
                  {`${selectedReservation.seat?.SeatNumber}`}
                </Typography>
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteReservation} color="error">
            Confirm Cancellation
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminReservations;
