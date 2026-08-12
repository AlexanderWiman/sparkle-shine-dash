import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { fetchFacility, type Facility } from "@/lib/facilityApi";
import { fetchBookings, deleteBooking } from "@/lib/bookingApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Layout } from "@/components/Layout";
import { FacilityHeader } from "@/components/facility/FacilityHeader";
import { FacilitySidebar } from "@/components/facility/FacilitySidebar";
import { WeekOverviewBar } from "@/components/facility/WeekOverviewBar";
import { BookingTabs } from "@/components/facility/BookingTabs";
import { CapacityScheduleView } from "@/components/facility/CapacityScheduleView";
import { StaffReminderAlert } from "@/components/StaffReminderAlert";

interface Booking {
  id: string;
  bookingNumber?: string;
  serviceName: string;
  servicePrice: number;
  addons?: Array<{ id: string; name: string; price: number }>;
  totalPrice: number;
  date: string;
  time: string;
  location: string;
  customerName: string;
  email: string;
  phone: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleRegistration: string;
  status: "pending" | "paid" | "cancelled" | "completed";
  createdAt: string;
}

const FacilityView = () => {
  const { facilityId } = useParams<{ facilityId: string }>();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [displayBookings, setDisplayBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (facilityId) {
      fetchData();
    }
  }, [facilityId]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const facilityData = await fetchFacility(facilityId!);
      setFacility(facilityData);

      const allBookings = await fetchBookings();

      // Filter bookings for this facility
      const facilityBookings = allBookings.filter(
        (booking) =>
          booking.location.includes(facilityData.streetAddress) &&
          booking.location.includes(facilityData.city)
      );

      // Sort by date and time
      facilityBookings.sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.time.localeCompare(b.time);
      });

      setBookings(facilityBookings);
      
      // Filter out blind bookings (hall closures) for display in Bokningar tab
      const customerBookings = facilityBookings.filter(
        (booking) => 
          booking.customerName !== "HALL STÄNGD" && 
          booking.customerName !== "Blockerad" && 
          booking.vehicleRegistration !== "BLOCKED"
      );
      setDisplayBookings(customerBookings);
    } catch (error) {
      console.error("Error fetching facility data:", error);
      toast.error("Kunde inte ladda anläggningsdata");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      toast.success("Status uppdaterad!");
      await fetchData();
    } catch (error) {
      toast.error("Kunde inte uppdatera status");
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      await deleteBooking(bookingId);
      toast.success("Spärr borttagen");
      await fetchData();
    } catch (error) {
      console.error("Error deleting booking:", error);
      toast.error("Kunde inte ta bort spärren");
    }
  };

  // Calculate stats (excluding blind bookings)
  const stats = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const weekEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Get first day of current month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      .toISOString()
      .split("T")[0];

    // Filter out blind bookings first
    const customerBookingsOnly = bookings.filter(
      (b) => 
        b.customerName !== "HALL STÄNGD" && 
        b.customerName !== "Blockerad" && 
        b.vehicleRegistration !== "BLOCKED"
    );

    // Count bookings
    const todayBookings = customerBookingsOnly.filter(
      (b) => b.date.split("T")[0] === today
    );
    const weekBookings = customerBookingsOnly.filter((b) => {
      const date = b.date.split("T")[0];
      return date >= today && date < weekEnd;
    });
    const monthBookings = customerBookingsOnly.filter((b) => {
      const date = b.date.split("T")[0];
      return date >= monthStart && date <= monthEnd;
    });

    // Calculate revenue (only count paid and completed)
    const paidStatuses = ["paid", "completed"];
    
    const todayRevenue = todayBookings
      .filter((b) => paidStatuses.includes(b.status))
      .reduce((sum, b) => sum + b.totalPrice, 0);
    
    const weekRevenue = weekBookings
      .filter((b) => paidStatuses.includes(b.status))
      .reduce((sum, b) => sum + b.totalPrice, 0);
    
    const monthRevenue = monthBookings
      .filter((b) => paidStatuses.includes(b.status))
      .reduce((sum, b) => sum + b.totalPrice, 0);
    
    const totalRevenue = customerBookingsOnly
      .filter((b) => paidStatuses.includes(b.status))
      .reduce((sum, b) => sum + b.totalPrice, 0);

    // Pending revenue (bookings not yet paid/completed)
    const pendingRevenue = customerBookingsOnly
      .filter((b) => b.status === "pending")
      .reduce((sum, b) => sum + b.totalPrice, 0);

    return {
      todayCount: todayBookings.length,
      weekCount: weekBookings.length,
      monthCount: monthBookings.length,
      totalCount: customerBookingsOnly.length,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      totalRevenue,
      pendingRevenue,
    };
  }, [bookings]);

  // Calculate next booking countdown (excluding blind bookings)
  const nextBookingCountdown = useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Filter out blind bookings first
    const customerBookingsOnly = bookings.filter(
      (b) => 
        b.customerName !== "HALL STÄNGD" && 
        b.customerName !== "Blockerad" && 
        b.vehicleRegistration !== "BLOCKED"
    );

    const upcomingToday = customerBookingsOnly
      .filter((b) => {
        if (b.date.split("T")[0] !== today) return false;
        const [hours, minutes] = b.time.split(":").map(Number);
        const bookingTime = new Date(now);
        bookingTime.setHours(hours, minutes, 0, 0);
        return bookingTime > now;
      })
      .sort((a, b) => a.time.localeCompare(b.time));

    if (upcomingToday.length === 0) return null;

    const nextBooking = upcomingToday[0];
    const [hours, minutes] = nextBooking.time.split(":").map(Number);
    const bookingTime = new Date(now);
    bookingTime.setHours(hours, minutes, 0, 0);

    const diffMs = bookingTime.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);

    if (diffMins < 60) {
      return `${diffMins} min`;
    }
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;
    return remainingMins > 0
      ? `${diffHours}h ${remainingMins}min`
      : `${diffHours}h`;
  }, [bookings]);

  // Week overview data
  const weekDays = useMemo(() => {
    const days: {
      date: string;
      dayName: string;
      dayNumber: number;
      count: number;
      isToday: boolean;
    }[] = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      const dayBookings = bookings.filter(
        (b) =>
          b.date.split("T")[0] === dateStr &&
          b.customerName !== "HALL STÄNGD" &&
          b.customerName !== "Blockerad" &&
          b.vehicleRegistration !== "BLOCKED"
      );

      days.push({
        date: dateStr,
        dayName: date
          .toLocaleDateString("sv-SE", { weekday: "short" })
          .toUpperCase(),
        dayNumber: date.getDate(),
        count: dayBookings.length,
        isToday: i === 0,
      });
    }

    return days;
  }, [bookings]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background">
          <div className="bg-card border-b p-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="max-w-6xl mx-auto p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!facility) {
    return (
      <Layout>
        <div className="min-h-screen bg-background p-4 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Anläggning hittades inte
            </h2>
          </div>
        </div>
      </Layout>
    );
  }

  // Build location string for block dialog
  const facilityLocation = `${facility.streetAddress}, ${facility.postalCode} ${facility.city}`;

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <FacilityHeader
          facility={facility}
          nextBookingCountdown={nextBookingCountdown}
        />

        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 space-y-4">
              {/* Staff Reminder Alert */}
              <StaffReminderAlert bookings={bookings} />

              {/* Week Overview Bar */}
              <div className="bg-card rounded-lg p-4 border">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">
                  Veckoöversikt
                </h3>
                <WeekOverviewBar weekDays={weekDays} />
              </div>

              {/* Main tabs for Bookings and Capacity Schedule */}
              <Tabs defaultValue="bookings" className="w-full">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="bookings">Bokningar</TabsTrigger>
                  <TabsTrigger value="schedule">Hallschema</TabsTrigger>
                </TabsList>
                
                <TabsContent value="bookings" className="mt-4">
                  <BookingTabs
                    bookings={displayBookings}
                    onStatusUpdate={handleStatusUpdate}
                    onDeleteBooking={handleDeleteBooking}
                  />
                </TabsContent>
                
                <TabsContent value="schedule" className="mt-4">
                  <CapacityScheduleView
                    bookings={bookings}
                    facilityLocation={facilityLocation}
                    facilityCapacity={facility.capacity || 2}
                    onDataChange={fetchData}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <FacilitySidebar facility={facility} stats={stats} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FacilityView;
