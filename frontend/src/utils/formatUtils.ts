// Implementation of utility functions for the frontend
import { AirportAttributes } from "../../../backend/src/models/airportsModel";
import { AirportOption } from "../types/shared";

// Implementation of the formatDateTime function
export const formatDateTime = (date: Date | string): string => {
  // Convert to Date object if it's a string
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Implementation of the formatDuration function
export const formatDuration = (
  departureTime: Date | string,
  arrivalTime: Date | string
): string => {
  // Convert to Date objects if they're strings
  const departure =
    typeof departureTime === "string" ? new Date(departureTime) : departureTime;
  const arrival =
    typeof arrivalTime === "string" ? new Date(arrivalTime) : arrivalTime;

  const durationMs = arrival.getTime() - departure.getTime();
  const hours = Math.floor(durationMs / (1000 * 60 * 60));
  const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours.toString()}h ${minutes.toString()}m`;
};

// Implementation of the convertToAirportOption function
export const convertToAirportOption = (
  airport: AirportAttributes
): AirportOption => {
  return {
    value: airport.Code,
    label: `${airport.City} - ${airport.Code} (${airport.Name})`,
    airportId: airport.AirportID!,
  };
};
