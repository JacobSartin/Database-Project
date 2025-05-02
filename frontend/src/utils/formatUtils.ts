// Implementation of utility functions for the frontend
import { Airport, AirportOption } from "../types/shared";

// Implementation of the formatDateTime function
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

// Implementation of the formatDuration function
export const formatDuration = (
  departureTime: string,
  arrivalTime: string
): string => {
  const departure = new Date(departureTime);
  const arrival = new Date(arrivalTime);
  const durationMs = arrival.getTime() - departure.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours.toString()}h ${minutes.toString()}m`;
};

// Implementation of the convertToAirportOption function
export const convertToAirportOption = (airport: Airport): AirportOption => {
  return {
    value: airport.Code,
    label: `${airport.City} - ${airport.Code} (${airport.Name})`,
    airportId: airport.AirportID,
  };
};
