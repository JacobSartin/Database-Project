// Re-export types from our local shared types file
import { AirportOption, Flight, Seat } from "./shared";
import { formatDateTime, formatDuration } from "../utils/formatUtils";

// Re-export the types and utility functions
export type { AirportOption, Flight, Seat };
export { formatDateTime, formatDuration };
