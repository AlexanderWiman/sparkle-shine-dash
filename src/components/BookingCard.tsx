import { Car, Clock, User, Phone, Ban, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Booking {
  id: string;
  bookingNumber?: string;
  serviceName: string;
  servicePrice: number;
  addons?: Array<{ id: string; name: string; price: number }>;
  totalPrice: number;
  date: string;
  time: string;
  customerName: string;
  phone: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleRegistration: string;
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled' | 'completed';
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

interface BookingCardProps {
  booking: Booking;
  onStatusUpdate: (bookingId: string, newStatus: string) => void;
  onDelete?: (bookingId: string) => void;
  showDate?: boolean;
  hidePaymentMethod?: boolean;
}

// Helper to detect blocked/blind bookings
const isBlockedBooking = (booking: Booking) => {
  return (
    booking.vehicleRegistration === "BLOCKED" ||
    booking.customerName === "HALL STÄNGD"
  );
};

export const BookingCard = ({ booking, onStatusUpdate, onDelete, showDate = false, hidePaymentMethod = false }: BookingCardProps) => {
  const isBlocked = isBlockedBooking(booking);
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'paid':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'pending':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Slutförd';
      case 'paid':
        return 'Betald';
      case 'pending':
        return 'Bokad';
      case 'cancelled':
        return 'Avbokad';
      default:
        return status;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'paid';
      case 'paid':
        return 'completed';
      default:
        return currentStatus;
    }
  };

  const getNextStatusText = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return 'Markera som betald';
      case 'paid':
        return 'Slutför';
      default:
        return '';
    }
  };

  const canProgress = !['completed', 'cancelled'].includes(booking.status) && !isBlocked;

  // Blocked booking card - special styling
  if (isBlocked) {
    return (
      <Card className="overflow-hidden border-l-4 border-l-destructive bg-destructive/5">
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <Ban className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-destructive" />
                  <span className="text-xl font-bold">{booking.time}</span>
                  {showDate && (
                    <span className="text-sm text-muted-foreground ml-2">
                      {new Date(booking.date).toLocaleDateString('sv-SE', { 
                        day: 'numeric', 
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  )}
                </div>
                <p className="text-sm text-destructive font-medium">
                  {booking.serviceName || "Hall stängd"}
                </p>
              </div>
            </div>
            {onDelete && (
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => onDelete(booking.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Ta bort</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-l-4" style={{ borderLeftColor: `hsl(var(--primary))` }}>
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2 sm:space-y-3">
          {/* Time and Status Row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
              <span className="text-xl sm:text-2xl font-bold">{booking.time}</span>
              {showDate && (
                <span className="text-sm text-muted-foreground ml-2">
                  {new Date(booking.date).toLocaleDateString('sv-SE', { 
                    day: 'numeric', 
                    month: 'short',
                    year: 'numeric'
                  })}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 items-end">
              <Badge variant="outline" className={getStatusColor(booking.status)}>
                {getStatusText(booking.status)}
              </Badge>
              {/* Payment Status Badge - hidden in history view */}
              {!hidePaymentMethod && (
                booking.paymentStatus === 'paid' ? (
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-xs">
                    Förbetald
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs">
                    Betala på station
                  </Badge>
                )
              )}
            </div>
          </div>

          {/* Customer Info - Hidden on mobile */}
          <div className="space-y-1 hidden sm:block">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{booking.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{booking.phone}</span>
            </div>
          </div>

          {/* Vehicle Info - Compact on mobile */}
          <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-md">
            <Car className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <div className="text-sm sm:text-base">
              <span className="font-medium">
                {(() => {
                  const brand = (booking.vehicleBrand || "").trim();
                  const model = (booking.vehicleModel || "").trim();
                  if (!model) return brand;
                  if (!brand) return model;
                  // Avoid duplication when brand already contains the model (e.g. "VW Id7" + "Id7")
                  const brandLower = brand.toLowerCase();
                  const modelLower = model.toLowerCase();
                  if (brandLower === modelLower) return brand;
                  if (brandLower.endsWith(" " + modelLower) || brandLower === modelLower) return brand;
                  if (brandLower.includes(modelLower)) return brand;
                  return `${brand} ${model}`;
                })()}
              </span>
              <span className="text-xs sm:text-sm text-muted-foreground ml-1 sm:ml-2">
                ({booking.vehicleRegistration})
              </span>
            </div>
          </div>

          {/* Service Info - Simplified on mobile */}
          <div className="space-y-1 text-sm">
            <p className="font-medium">{booking.serviceName}</p>
            {booking.addons && booking.addons.length > 0 && (
              <p className="text-muted-foreground hidden sm:block">
                + {booking.addons.map(a => a.name).join(', ')}
              </p>
            )}
            <p className="font-semibold text-primary hidden sm:block">{booking.totalPrice} kr</p>
          </div>

          {/* Action Buttons - Hidden on mobile */}
          {canProgress && (
            <div className="flex gap-2 pt-2 hidden sm:flex">
              <Button
                size="sm"
                className="flex-1"
                onClick={() => onStatusUpdate(booking.id, getNextStatus(booking.status))}
              >
                {getNextStatusText(booking.status)}
              </Button>
              {booking.status === 'pending' && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onStatusUpdate(booking.id, 'cancelled')}
                >
                  Avboka
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
