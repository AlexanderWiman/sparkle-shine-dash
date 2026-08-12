import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Booking {
  id: string;
  date: string;
  status: string;
  customerName: string;
  vehicleRegistration: string;
}

interface StaffReminderAlertProps {
  bookings: Booking[];
}

// Helper to filter out blind bookings
const isCustomerBooking = (booking: Booking) => {
  return (
    booking.customerName !== "HALL STÄNGD" &&
    booking.customerName !== "Blockerad" &&
    booking.vehicleRegistration !== "BLOCKED"
  );
};

export const StaffReminderAlert = ({ bookings }: StaffReminderAlertProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  // Filter to customer bookings only
  const customerBookings = bookings.filter(isCustomerBooking);

  // Count paid bookings that need to be marked as completed
  const paidNotCompletedCount = customerBookings.filter(
    (b) => b.status === "paid"
  ).length;

  // Count past bookings that are still pending or paid (should be completed or cancelled)
  const pastUnresolvedCount = customerBookings.filter((b) => {
    const bookingDate = b.date.split("T")[0];
    const isPast = bookingDate < today;
    const needsAction = b.status === "pending" || b.status === "paid";
    return isPast && needsAction;
  }).length;

  // Total issues
  const totalIssues = paidNotCompletedCount + pastUnresolvedCount;

  if (totalIssues === 0 || isDismissed) return null;

  // Build message parts
  const messages: string[] = [];
  
  if (paidNotCompletedCount > 0) {
    messages.push(
      `${paidNotCompletedCount} ${paidNotCompletedCount === 1 ? 'betald bokning' : 'betalda bokningar'} som behöver markeras som slutförd`
    );
  }
  
  if (pastUnresolvedCount > 0) {
    messages.push(
      `${pastUnresolvedCount} ${pastUnresolvedCount === 1 ? 'passerad bokning' : 'passerade bokningar'} som behöver markeras som slutförd eller avbokad`
    );
  }

  return (
    <Alert variant="default" className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20 relative">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 dark:text-amber-400 pr-8">Påminnelse</AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        <ul className="list-disc list-inside space-y-1">
          {messages.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/30"
        onClick={() => setIsDismissed(true)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Stäng påminnelse</span>
      </Button>
    </Alert>
  );
};
