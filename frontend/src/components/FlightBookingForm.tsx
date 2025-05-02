import React, { useState } from "react";
import { Container, Box, Alert, Snackbar } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import FlightSearchForm from "./FlightSearchForm";
import FlightList from "./FlightList";
import SeatMap from "./SeatMap";
import BookingConfirmation from "./BookingConfirmation";
import AuthModal from "./AuthModal";
import { AirportOption, Flight, Seat } from "../types/flightTypes";
import { useAuth } from "../context/AuthContext";
import {
  searchFlights as apiSearchFlights,
  fetchAvailableSeats as apiFetchSeats,
  createReservation as apiCreateReservation,
} from "../services/api";

const FlightBookingForm: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState<
    "search" | "flights" | "seats" | "confirmation"
  >("search");
  const [sourceAirport, setSourceAirport] = useState<AirportOption | null>(
    null
  );
  const [destinationAirport, setDestinationAirport] =
    useState<AirportOption | null>(null);
  const [departureDate, setDepartureDate] = useState<Date | null>(null);
  const [returnDate, setReturnDate] = useState<Date | null>(null);
  const [passengerCount, setPassengerCount] = useState<number>(1);

  const [availableFlights, setAvailableFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [seatMapLoading, setSeatMapLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingReference, setBookingReference] = useState<string>("");

  // Authentication modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  // Handle searching for flights
  const handleSearch = (
    source: AirportOption,
    destination: AirportOption,
    depDate: Date | null,
    retDate: Date | null,
    passengers: number
  ) => {
    // Reset all state related to previous searches
    setSelectedFlight(null);
    setSelectedSeats([]);
    setAvailableFlights([]);
    setAvailableSeats([]);
    setBookingReference("");

    // Set new search parameters
    setSourceAirport(source);
    setDestinationAirport(destination);
    setDepartureDate(depDate);
    setReturnDate(retDate);
    setPassengerCount(passengers);

    // Now use the actual API call with the new search parameters
    searchFlights(source, destination, depDate);
  };

  // Search flights API call using the API service
  const searchFlights = async (
    source: AirportOption,
    destination: AirportOption,
    depDate: Date | null
  ) => {
    try {
      setLoading(true);
      setError(null);

      if (!depDate) {
        setError("Departure date is required");
        setLoading(false);
        return;
      }

      // Create a date that preserves the original date without timezone issues
      const searchDate = new Date(depDate);

      // Ensure we're working with the correct date by setting hours to noon
      // This avoids any timezone-related date shifting
      searchDate.setHours(12, 0, 0, 0);

      // Use a method that preserves the date regardless of timezone
      // Format: YYYY-MM-DD
      const formattedDate = searchDate.toISOString().split("T")[0];

      console.log("Original departure date:", depDate);
      console.log("Formatted date for search:", formattedDate);

      // Format return date if it exists
      let formattedReturnDate: string | undefined;
      if (returnDate) {
        const returnSearchDate = new Date(returnDate);
        // Apply the same standardization to return date
        returnSearchDate.setHours(12, 0, 0, 0);
        formattedReturnDate = returnSearchDate.toISOString().split("T")[0];
        console.log("Return date for search:", formattedReturnDate);
      }

      // Use the actual API call with properly formatted dates
      const flights = await apiSearchFlights({
        origin: source.value,
        destination: destination.value,
        departureDate: formattedDate,
        returnDate: formattedReturnDate,
      });

      if (flights.length === 0) {
        setError("No flights found for this route and date.");
        setLoading(false);
        return;
      }

      console.log("Found flights:", flights);
      setAvailableFlights(flights);
      setStep("flights");
    } catch (error) {
      console.error("Error searching for flights:", error);
      setError("Failed to search for flights. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle flight selection
  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    setSeatMapLoading(true);
    fetchAvailableSeats(flight.flightId);
    setStep("seats");
  };

  // Fetch available seats for a selected flight using the API service
  const fetchAvailableSeats = async (flightId: number) => {
    try {
      setSeatMapLoading(true);
      setError(null);

      // Use the actual API call
      const seats = await apiFetchSeats(flightId);

      setAvailableSeats(seats);
    } catch (error) {
      console.error("Error fetching seats:", error);
      setError("Failed to load seat map. Please try again.");
    } finally {
      setSeatMapLoading(false);
    }
  };

  // Updated to handle multiple seat selections
  const handleSeatSelect = (seat: Seat) => {
    if (seat.isBooked) return;

    setSelectedSeats((prevSelectedSeats) => {
      // Check if this seat is already selected
      const alreadySelected = prevSelectedSeats.some(
        (s) => s.seatId === seat.seatId
      );

      if (alreadySelected) {
        // Remove the seat if already selected
        return prevSelectedSeats.filter((s) => s.seatId !== seat.seatId);
      } else {
        // Add the seat if we haven't reached the passenger count limit
        if (prevSelectedSeats.length < passengerCount) {
          return [...prevSelectedSeats, seat];
        }
        // If we've reached the limit, replace the first selected seat
        else if (passengerCount === 1) {
          return [seat];
        }
        // Otherwise, don't select more than passenger count
        else {
          return [...prevSelectedSeats.slice(1), seat];
        }
      }
    });
  };

  // Updated to check for authentication before booking
  const handleBookingConfirm = async () => {
    if (!selectedFlight || selectedSeats.length === 0) {
      setError(
        `Please select a flight and ${passengerCount} seat(s) to proceed.`
      );
      return;
    }

    if (selectedSeats.length < passengerCount) {
      setError(`Please select ${passengerCount} seat(s) to proceed.`);
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Show login modal if not authenticated
      setAuthMode("login");
      setAuthModalOpen(true);
      return;
    }

    // Proceed with booking if authenticated
    try {
      setLoading(true);
      setError(null);

      const bookingPromises = selectedSeats.map((seat) =>
        apiCreateReservation({
          flightId: selectedFlight.flightId,
          seatId: seat.seatId,
          // User ID is now obtained from the JWT token on the server side
        })
      );

      // Store the reservation responses which contain the reservation IDs
      const bookingResponses = await Promise.all(bookingPromises);

      // Extract reservation IDs to a single string, joined by commas if multiple
      const reservationIds = bookingResponses
        .map((response) => response.data?.reservationId)
        .filter((id) => id !== undefined)
        .join(",");

      // Set a real booking reference
      setBookingReference(reservationIds);

      // Move to confirmation step
      setStep("confirmation");
    } catch (error) {
      console.error("Error confirming booking:", error);
      setError("Failed to confirm booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle successful authentication
  const handleAuthSuccess = () => {
    // Proceed with booking after successful authentication
    if (selectedFlight && selectedSeats.length > 0) {
      handleBookingConfirm();
    }
  };

  // Handle book another flight option
  const handleBookAnother = () => {
    setStep("search");
    setSelectedFlight(null);
    setSelectedSeats([]);
    setAvailableFlights([]);
    setAvailableSeats([]);
    setSourceAirport(null);
    setDestinationAirport(null);
    setDepartureDate(null);
    setReturnDate(null);
    setError(null);
  };

  // Render the appropriate component based on the current step
  const renderStepContent = () => {
    switch (step) {
      case "search":
        return (
          <FlightSearchForm
            onSearch={handleSearch}
            initialValues={
              sourceAirport
                ? {
                    sourceAirport,
                    destinationAirport,
                    departureDate,
                    returnDate,
                    passengerCount,
                    tripType: returnDate ? "roundTrip" : "oneWay",
                  }
                : undefined
            }
          />
        );

      case "flights":
        return (
          <FlightList
            flights={availableFlights}
            sourceAirport={sourceAirport?.value || ""}
            destinationAirport={destinationAirport?.value || ""}
            departureDate={departureDate ? departureDate.toISOString() : ""}
            onSelectFlight={handleFlightSelect}
            onModifySearch={() => setStep("search")}
            loading={loading}
          />
        );

      case "seats":
        if (!selectedFlight) return null;

        return (
          <SeatMap
            flight={selectedFlight}
            seats={availableSeats}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
            onBack={() => setStep("flights")}
            onConfirm={handleBookingConfirm}
            loading={seatMapLoading}
            passengerCount={passengerCount}
          />
        );

      case "confirmation":
        if (!selectedFlight || selectedSeats.length === 0) return null;

        return (
          <BookingConfirmation
            flight={selectedFlight}
            seats={selectedSeats}
            bookingId={bookingReference}
            onBookAnother={handleBookAnother}
          />
        );

      default:
        return <FlightSearchForm onSearch={handleSearch} />;
    }
  };

  // Handle error dismissal
  const handleCloseError = () => {
    setError(null);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            width: "100%",
            maxWidth: "1200px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Box sx={{ py: 4, width: "100%" }}>{renderStepContent()}</Box>
          {error && (
            <Snackbar
              open={!!error}
              autoHideDuration={6000}
              onClose={handleCloseError}
            >
              <Alert
                onClose={handleCloseError}
                severity="error"
                sx={{ width: "100%" }}
              >
                {error}
              </Alert>
            </Snackbar>
          )}

          {/* Authentication Modal */}
          <AuthModal
            open={authModalOpen}
            onClose={() => setAuthModalOpen(false)}
            mode={authMode}
            onSuccess={handleAuthSuccess}
          />
        </Container>
      </Box>
    </LocalizationProvider>
  );
};

export default FlightBookingForm;
