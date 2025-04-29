// Shared types for flight booking components

export type AirportOption = {
  value: string;
  label: string;
  airportId: number;
};

export type Flight = {
  flightId: number;
  aircraftId: number;
  originAirportId: number;
  destinationAirportId: number;
  departureTime: string;
  arrivalTime: string;
  originCode: string;
  destinationCode: string;
  originName: string;
  destinationName: string;
  aircraftModel: string;
};

export type Seat = {
  seatId: number;
  flightId: number;
  seatNumber: string;
  isBooked: boolean;
};

// Helper function to format date and time from ISO string
export const formatDateTime = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
