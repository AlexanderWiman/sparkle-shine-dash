import { useState, useMemo } from "react";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookingCard } from "@/components/BookingCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

interface BookingTabsProps {
  bookings: Booking[];
  onStatusUpdate: (bookingId: string, newStatus: string) => void;
  onDeleteBooking?: (bookingId: string) => void;
}

const ITEMS_PER_PAGE = 8;

export const BookingTabs = ({ bookings, onStatusUpdate, onDeleteBooking }: BookingTabsProps) => {
  const [todayPage, setTodayPage] = useState(1);
  const [tomorrowPage, setTomorrowPage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { todayBookings, tomorrowBookings, upcomingBookings, historicalBookings } =
    useMemo(() => {
      const todayB = bookings.filter((b) => b.date.split("T")[0] === today);
      const tomorrowB = bookings.filter((b) => b.date.split("T")[0] === tomorrow);
      const upcomingB = bookings
        .filter((b) => b.date.split("T")[0] > tomorrow)
        .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
      const historicalB = bookings
        .filter((b) => b.date.split("T")[0] < today)
        .sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time));

      return {
        todayBookings: todayB,
        tomorrowBookings: tomorrowB,
        upcomingBookings: upcomingB,
        historicalBookings: historicalB,
      };
    }, [bookings, today, tomorrow]);

  const paginate = <T,>(items: T[], page: number): T[] => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return items.slice(start, start + ITEMS_PER_PAGE);
  };

  const getTotalPages = (total: number) => Math.ceil(total / ITEMS_PER_PAGE);

  const renderPagination = (
    currentPage: number,
    totalPages: number,
    setPage: (page: number) => void
  ) => {
    if (totalPages <= 1) return null;

    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage(Math.max(1, currentPage - 1))}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            let page: number;
            if (totalPages <= 5) {
              page = i + 1;
            } else if (currentPage <= 3) {
              page = i + 1;
            } else if (currentPage >= totalPages - 2) {
              page = totalPages - 4 + i;
            } else {
              page = currentPage - 2 + i;
            }
            return (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setPage(page)}
                  isActive={page === currentPage}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          <PaginationItem>
            <PaginationNext
              onClick={() => setPage(Math.min(totalPages, currentPage + 1))}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  const renderEmptyState = (message: string) => (
    <div className="py-12 text-center text-muted-foreground">
      <Calendar className="h-12 w-12 mx-auto mb-3 opacity-30" />
      <p>{message}</p>
    </div>
  );

  const renderBookingList = (
    items: Booking[],
    page: number,
    setPage: (p: number) => void,
    emptyMessage: string,
    options: { showDate?: boolean; isHistory?: boolean } = {}
  ) => {
    if (items.length === 0) return renderEmptyState(emptyMessage);

    const paginatedItems = paginate(items, page);
    const totalPages = getTotalPages(items.length);

    return (
      <>
        <div className="space-y-3">
          {paginatedItems.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onStatusUpdate={onStatusUpdate}
              onDelete={onDeleteBooking}
              showDate={options.showDate}
              hidePaymentMethod={options.isHistory}
            />
          ))}
        </div>
        {renderPagination(page, totalPages, setPage)}
      </>
    );
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-4 h-auto gap-1">
            <TabsTrigger
              value="today"
              className="relative flex-col sm:flex-row gap-0.5 sm:gap-1.5 px-1 sm:px-3 py-1.5 text-xs sm:text-sm"
            >
              <span>Idag</span>
              {todayBookings.length > 0 && (
                <Badge variant="secondary" className="h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs">
                  {todayBookings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="tomorrow"
              className="flex-col sm:flex-row gap-0.5 sm:gap-1.5 px-1 sm:px-3 py-1.5 text-xs sm:text-sm"
            >
              <span>Imorgon</span>
              {tomorrowBookings.length > 0 && (
                <Badge variant="secondary" className="h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs">
                  {tomorrowBookings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="flex-col sm:flex-row gap-0.5 sm:gap-1.5 px-1 sm:px-3 py-1.5 text-xs sm:text-sm"
            >
              <span>Kommande</span>
              {upcomingBookings.length > 0 && (
                <Badge variant="secondary" className="h-4 sm:h-5 px-1 sm:px-1.5 text-[10px] sm:text-xs">
                  {upcomingBookings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="px-1 sm:px-3 py-1.5 text-xs sm:text-sm"
            >
              Historik
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-4">
            {renderBookingList(
              todayBookings,
              todayPage,
              setTodayPage,
              "Inga bokningar idag"
            )}
          </TabsContent>

          <TabsContent value="tomorrow" className="mt-4">
            {renderBookingList(
              tomorrowBookings,
              tomorrowPage,
              setTomorrowPage,
              "Inga bokningar imorgon"
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-4">
            {renderBookingList(
              upcomingBookings,
              upcomingPage,
              setUpcomingPage,
              "Inga kommande bokningar",
              { showDate: true }
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {renderBookingList(
              historicalBookings,
              historyPage,
              setHistoryPage,
              "Ingen historik ännu",
              { showDate: true, isHistory: true }
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
