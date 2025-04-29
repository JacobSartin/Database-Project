import React, { useState } from "react";
import { Container, Box } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import FlightSearchForm from "./FlightSearchForm";
import FlightList from "./FlightList";
import SeatMap from "./SeatMap";
import BookingConfirmation from "./BookingConfirmation";
import { AirportOption, Flight, Seat } from "../types/flightTypes";

const FlightBookingForm: React.FC = () => {
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
  const [tripType, setTripType] = useState<"oneWay" | "roundTrip">("oneWay");

  const [availableFlights, setAvailableFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [availableSeats, setAvailableSeats] = useState<Seat[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [seatMapLoading, setSeatMapLoading] = useState(false);

  // Handle searching for flights
  const handleSearch = (
    source: AirportOption,
    destination: AirportOption,
    depDate: Date | null,
    retDate: Date | null,
    passengers: number,
    type: string
  ) => {
    setSourceAirport(source);
    setDestinationAirport(destination);
    setDepartureDate(depDate);
    setReturnDate(retDate);
    setPassengerCount(passengers);
    setTripType(type as "oneWay" | "roundTrip");

    // In a real app, this would be an API call with these parameters
    searchFlights(source, destination, depDate);
  };

  // Search flights API call (mocked)
  const searchFlights = async (
    source: AirportOption,
    destination: AirportOption,
    depDate: Date | null
  ) => {
    try {
      // This would be an actual API call in a real application
      // Mock flight data based on search parameters

      if (!depDate) return;

      const formattedDate = depDate.toISOString().split("T")[0];

      const mockFlights: Flight[] = [
        {
          flightId: 1,
          aircraftId: 1,
          originAirportId: source.airportId,
          destinationAirportId: destination.airportId,
          departureTime: `${formattedDate}T08:00:00`,
          arrivalTime: `${formattedDate}T11:30:00`,
          originCode: source.value,
          destinationCode: destination.value,
          originName: source.label,
          destinationName: destination.label,
          aircraftModel: "Boeing 747",
        },
        {
          flightId: 2,
          aircraftId: 3,
          originAirportId: source.airportId,
          destinationAirportId: destination.airportId,
          departureTime: `${formattedDate}T10:00:00`,
          arrivalTime: `${formattedDate}T13:30:00`,
          originCode: source.value,
          destinationCode: destination.value,
          originName: source.label,
          destinationName: destination.label,
          aircraftModel: "Boeing 787 Dreamliner",
        },
        {
          flightId: 3,
          aircraftId: 5,
          originAirportId: source.airportId,
          destinationAirportId: destination.airportId,
          departureTime: `${formattedDate}T14:00:00`,
          arrivalTime: `${formattedDate}T17:30:00`,
          originCode: source.value,
          destinationCode: destination.value,
          originName: source.label,
          destinationName: destination.label,
          aircraftModel: "Airbus A330",
        },
      ];

      setAvailableFlights(mockFlights);
      setStep("flights");
    } catch (error) {
      console.error("Error searching for flights:", error);
      alert("Failed to search for flights. Please try again.");
    }
  };

  // Handle flight selection
  const handleFlightSelect = (flight: Flight) => {
    setSelectedFlight(flight);
    setSeatMapLoading(true);
    fetchAvailableSeats(flight.flightId);
    setStep("seats");
  };

  // Fetch available seats for a selected flight (mocked)
  const fetchAvailableSeats = async (flightId: number) => {
    try {
      // Simulate API call delay
      setTimeout(() => {
        // This would be a real API call to fetch seat data
        // Mock data based on your database structure
        const seats: Seat[] = [];
        const letters = ["A", "B", "C", "D", "E", "F"];

        // Generate 30 rows of 6 seats each (180 seats total for a typical aircraft)
        for (let row = 1; row <= 30; row++) {
          for (let i = 0; i < letters.length; i++) {
            const seatNumber = `${row}${letters[i]}`;
            const isBooked = Math.random() > 0.7; // 30% of seats are booked

            seats.push({
              seatId: row * 10 + i,
              flightId,
              seatNumber,
              isBooked,
            });
          }
        }

        setAvailableSeats(seats);
        setSeatMapLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching seats:", error);
      alert("Failed to load seat map. Please try again.");
      setSeatMapLoading(false);
    }
  };

  // Handle seat selection
  const handleSeatSelect = (seat: Seat) => {
    if (!seat.isBooked) {
      setSelectedSeat(seat);
    }
  };

  // Handle booking confirmation
  const handleBookingConfirm = async () => {
    if (!selectedFlight || !selectedSeat) {
      alert("Please select a flight and seat to proceed.");
      return;
    }

    try {
      // In a real app, this would be an API call to create a reservation
      // For example: await createReservation(selectedFlight.id, selectedSeat.id);

      // Move to confirmation step
      setStep("confirmation");
    } catch (error) {
      console.error("Error confirming booking:", error);
      alert("Failed to confirm booking. Please try again.");
    }
  };

  // Handle book another flight option
  const handleBookAnother = () => {
    setStep("search");
    setSelectedFlight(null);
    setSelectedSeat(null);
    setAvailableFlights([]);
    setAvailableSeats([]);
    setSourceAirport(null);
    setDestinationAirport(null);
    setDepartureDate(null);
    setReturnDate(null);
  };

  // Render the appropriate component based on the current step
  const renderStepContent = () => {
    switch (step) {
      case "search":
        return <FlightSearchForm onSearch={handleSearch} />;

      case "flights":
        return (
          <FlightList
            flights={availableFlights}
            sourceAirport={sourceAirport?.value || ""}
            destinationAirport={destinationAirport?.value || ""}
            departureDate={departureDate ? departureDate.toISOString() : ""}
            onSelectFlight={handleFlightSelect}
            onModifySearch={() => setStep("search")}
          />
        );

      case "seats":
        if (!selectedFlight) return null;

        return (
          <SeatMap
            flight={selectedFlight}
            seats={availableSeats}
            selectedSeat={selectedSeat}
            onSeatSelect={handleSeatSelect}
            onBack={() => setStep("flights")}
            onConfirm={handleBookingConfirm}
            loading={seatMapLoading}
          />
        );

      case "confirmation":
        if (!selectedFlight || !selectedSeat) return null;

        return (
          <BookingConfirmation
            flight={selectedFlight}
            seat={selectedSeat}
            onBookAnother={handleBookAnother}
          />
        );

      default:
        return <FlightSearchForm onSearch={handleSearch} />;
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>{renderStepContent()}</Box>
      </Container>
    </LocalizationProvider>
  );
};

export default FlightBookingForm;
