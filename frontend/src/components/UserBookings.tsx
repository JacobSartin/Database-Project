import React, { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Paper,
  Container,
  CircularProgress,
  Divider,
  Chip,
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import AuthModal from "./AuthModal";
import { useAuth } from "../context/AuthContext";
import { getUserReservations, formatDateTime } from "../services/api";
import { ReservationStatus } from "../types/shared";
import { ReservationAttributes } from "../../../backend/src/types/modelDTOs";
import Pagination from "@mui/material/Pagination";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

const BOOKINGS_PER_PAGE = 10;

const UserBookings: React.FC = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [reservations, setReservations] = useState<ReservationAttributes[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [page, setPage] = useState(1);
  const [selectedReservation, setSelectedReservation] =
    useState<ReservationAttributes | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const totalPages = Math.ceil(reservations.length / BOOKINGS_PER_PAGE);
  const paginatedReservations = reservations.slice(
    (page - 1) * BOOKINGS_PER_PAGE,
    page * BOOKINGS_PER_PAGE
  );

  useEffect(() => {
    // If authentication is still loading, wait for it to complete
    if (authLoading) return;

    // If not authenticated, show auth modal
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      setLoading(false);
      return;
    }

    // Fetch user reservations when authenticated
    const fetchReservations = async () => {
      setLoading(true);
      setError(null);
      try {
        if (user) {
          // Map the reservations to match ReservationAttributes type
          const userReservations = await getUserReservations(user.UserID);
          setReservations(userReservations as ReservationAttributes[]);
        }
      } catch (err) {
        console.error("Error fetching reservations:", err);
        setError("Failed to load your bookings. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isAuthenticated, authLoading, user]);

  // Handle successful authentication
  const handleAuthSuccess = () => {
    setAuthModalOpen(false);
    // The useEffect will trigger again and fetch reservations
  };

  // Get the status color based on reservation status
  const getStatusColor = (status: ReservationStatus) => {
    switch (status) {
      case ReservationStatus.CONFIRMED:
        return "success";
      case ReservationStatus.PENDING:
        return "warning";
      case ReservationStatus.CANCELLED:
        return "error";
      default:
        return "default";
    }
  };

  // Format reservation date for display
  const formatBookingDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // If auth is still loading
  if (authLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Checking authentication...
        </Typography>
      </Container>
    );
  }

  // If not authenticated and modal is closed, show login prompt
  if (!isAuthenticated && !authModalOpen) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1">
            You need to be logged in to view your bookings.
          </Typography>
        </Alert>
        <Button
          variant="contained"
          onClick={() => setAuthModalOpen(true)}
          startIcon={<ConfirmationNumberIcon />}
        >
          Sign In to View Bookings
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ fontWeight: "bold", mb: 4 }}
      >
        My Bookings
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : reservations.length === 0 ? (
        <Paper elevation={1} sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You don't have any bookings yet.
          </Typography>
          <Button
            variant="contained"
            href="/"
            sx={{ mt: 2 }}
            startIcon={<FlightTakeoffIcon />}
          >
            Book a Flight
          </Button>
        </Paper>
      ) : (
        <>
          <Stack spacing={3}>
            {paginatedReservations.map((reservation) => (
              <Card
                key={reservation.ReservationID}
                elevation={2}
                sx={{
                  borderRadius: 2,
                  overflow: "hidden",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                  cursor: "pointer",
                }}
                onClick={() => {
                  setSelectedReservation(reservation);
                  setDeleteModalOpen(true);
                }}
              >
                <Box
                  sx={{
                    bgcolor: "primary.main",
                    py: 1,
                    px: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ color: "white", fontWeight: "medium" }}
                  >
                    Booking Reference: FLY-{reservation.ReservationID}
                  </Typography>
                  <Chip
                    label={ReservationStatus.CONFIRMED}
                    color={getStatusColor(ReservationStatus.CONFIRMED)}
                    size="small"
                    sx={{ fontWeight: "bold", textTransform: "uppercase" }}
                  />
                </Box>

                <CardContent sx={{ p: 3 }}>
                  {reservation.flight && (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
                        gap: 24,
                      }}
                    >
                      {/* Flight details */}
                      <Box>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mb: 2 }}
                        >
                          <FlightTakeoffIcon
                            sx={{ mr: 1, color: "primary.main" }}
                          />
                          <Typography variant="h6">Flight Details</Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 4, mb: 2 }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Flight
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: "medium" }}
                            >
                              FL-{reservation.flight.FlightID}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Aircraft
                            </Typography>
                            <Typography variant="body1">
                              {reservation.flight?.aircraft?.Model || "-"}
                            </Typography>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 3,
                            gap: 2,
                          }}
                        >
                          <Box sx={{ textAlign: "center" }}>
                            <Typography
                              variant="h5"
                              sx={{ fontWeight: "bold" }}
                            >
                              {reservation.flight?.originAirport?.Code ?? ""}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {reservation.flight?.originAirport?.Name ?? ""}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              flex: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Box
                              sx={{
                                width: "100%",
                                height: 2,
                                bgcolor: "grey.400",
                                position: "relative",
                              }}
                            >
                              <FlightTakeoffIcon
                                sx={{
                                  position: "absolute",
                                  left: 0,
                                  top: -10,
                                  color: "primary.main",
                                  fontSize: 20,
                                }}
                              />
                              <Box
                                sx={{
                                  position: "absolute",
                                  left: "50%",
                                  top: -16,
                                  transform: "translateX(-50%)",
                                  color: "primary.main",
                                }}
                              >
                                <span style={{ fontSize: 24 }}>✈️</span>
                              </Box>
                              <FlightLandIcon
                                sx={{
                                  position: "absolute",
                                  right: 0,
                                  top: -10,
                                  color: "primary.main",
                                  fontSize: 20,
                                }}
                              />
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: "center" }}>
                            <Typography
                              variant="h5"
                              sx={{ fontWeight: "bold" }}
                            >
                              {reservation.flight?.destinationAirport?.Code ??
                                ""}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {reservation.flight?.destinationAirport?.Name ??
                                ""}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Departure
                            </Typography>
                            <Typography variant="body1">
                              {reservation.flight?.DepartureTime
                                ? formatDateTime(
                                    reservation.flight.DepartureTime.toISOString()
                                  )
                                : "-"}
                            </Typography>
                          </Box>
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Arrival
                            </Typography>
                            <Typography variant="body1">
                              {reservation.flight?.ArrivalTime
                                ? formatDateTime(
                                    reservation.flight.ArrivalTime.toISOString()
                                  )
                                : "-"}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      {/* Seat and Booking Information */}
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: "grey.900", // Use a dark background
                          color: "#fff", // White text for contrast
                          height: "100%",
                        }}
                      >
                        {reservation.seat && (
                          <Box sx={{ mb: 3 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <AirlineSeatReclineNormalIcon
                                sx={{ mr: 1, color: "primary.main" }}
                              />
                              <Typography
                                variant="subtitle1"
                                color="text.primary"
                              >
                                Seat Information
                              </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Typography
                              variant="h5"
                              sx={{ fontWeight: "bold", mb: 1 }}
                            >
                              {reservation.seat.SeatNumber}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Economy Class
                            </Typography>
                          </Box>
                        )}
                        <Box>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 1,
                            }}
                          >
                            <CalendarMonthIcon
                              sx={{ mr: 1, color: "primary.main" }}
                            />
                            <Typography
                              variant="subtitle1"
                              color="text.primary"
                            >
                              Booking Information
                            </Typography>
                          </Box>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            Booking Date
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            {reservation.BookingTime
                              ? formatBookingDate(
                                  reservation.BookingTime.toISOString()
                                )
                              : "-"}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Stack>
          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                shape="rounded"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* Authentication Modal */}
      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        mode="login"
        onSuccess={handleAuthSuccess}
      />

      {/* Delete Reservation Modal */}
      <Dialog open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <DialogTitle>Delete Reservation</DialogTitle>
        <DialogContent>
          {selectedReservation && (
            <Box>
              <Typography gutterBottom>
                Are you sure you want to delete this reservation?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Booking Reference: FLY-{selectedReservation.ReservationID}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Flight: FL-{selectedReservation.flight?.FlightID}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Seat: {selectedReservation.seat?.SeatNumber}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Departure:{" "}
                {selectedReservation.flight?.DepartureTime
                  ? formatDateTime(
                      selectedReservation.flight.DepartureTime.toISOString()
                    )
                  : "-"}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModalOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleting}
            onClick={async () => {
              if (!selectedReservation) return;
              setDeleting(true);
              try {
                await import("../services/api").then((api) =>
                  api.deleteReservation(selectedReservation.ReservationID!)
                );
                setDeleteModalOpen(false);
                setSelectedReservation(null);
                // Refresh reservations
                if (user) {
                  const userReservations = await import("../services/api").then(
                    (api) => api.getUserReservations(user.UserID)
                  );
                  setReservations(userReservations as ReservationAttributes[]);
                }
              } catch {
                alert("Failed to delete reservation.");
              } finally {
                setDeleting(false);
              }
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserBookings;
