export interface TourBooking {
  userId: string;       // User identifier (mapped from "userId")
  adults: number;       // Number of adults (mapped from "adults")
  children: number;     // Number of children (mapped from "children")
  rooms: number;        // Number of rooms (mapped from "rooms")
  arrivalDate: string;  // Arrival date (mapped from "arrivalDate")
  departureDate: string; // Departure date (mapped from "departureDate")
  freePickup: string;   // Free pickup availability (mapped from "freePickup")
  paymentStatus: boolean; // Payment status (mapped from "paymentStatus")
  paymentId: string;    // Payment ID (mapped from "paymentId")
  specialRequest?: string; // Special request (mapped from "specialRequest")
  tourId: string;       // Tour ID (mapped from "tourId")
  amount: string;   // Total price (mapped from "totalPrice")
  createdAt: Date;               // Timestamp when booking was created
  updatedAt: Date;               // Timestamp when booking was last updated
}
