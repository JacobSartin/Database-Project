// Re-export everything from the shared types file
export * from "./shared";
// For model types (Airport, Flight, Seat, Reservation, User, Aircraft, etc.), import directly from the backend models if needed.
import { formatDateTime, formatDuration } from "../utils/formatUtils";
export { formatDateTime, formatDuration };

import { ReservationAttributes } from "../../../backend/src/types/modelDTOs";

export interface BookingResponse {
  message: string;
  data: ReservationAttributes;
  error?: string;
}
