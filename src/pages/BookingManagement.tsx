import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { fetchBookings, updateBooking, deleteBooking, resendConfirmationEmail } from "@/lib/bookingApi";
import { fetchFacilities, type Facility } from "@/lib/facilityApi";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, CalendarIcon, X, Clock, MapPin, User, Car, RefreshCw, Trash2, Pencil, Mail } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { Layout } from "@/components/Layout";
import { cn } from "@/lib/utils";
import { EditBookingDialog } from "@/components/EditBookingDialog";
import { StaffReminderAlert } from "@/components/StaffReminderAlert";

interface Booking {
  id: string;
  date: string;
  time: string;
  customerName: string;
  email: string;
  phone: string;
  serviceName: string;
  status: 'pending' | 'completed' | 'cancelled' | 'paid';
  location: string;
  vehicleBrand: string;
  vehicleModel: string;
  vehicleRegistration: string;
}

const REFRESH_INTERVAL = 30000; // 30 seconds

const BookingManagement = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [facilityFilter, setFacilityFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [displayedCount, setDisplayedCount] = useState(25);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedBookings, setSelectedBookings] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const itemsPerPage = 25;

  const fetchBookingsData = useCallback(async (isBackground = false) => {
    if (!isBackground) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    try {
      const data = await fetchBookings();
      setBookings(data || []);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching bookings:", error);
      if (!isBackground) {
        toast.error("Kunde inte hämta bokningar");
      }
    }
    setLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    fetchBookingsData();
    fetchFacilitiesData();

    // Set up polling interval for real-time updates
    const intervalId = setInterval(() => {
      fetchBookingsData(true);
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [fetchBookingsData]);

  useEffect(() => {
    filterBookings();
    setDisplayedCount(itemsPerPage); // Reset pagination when filters change
  }, [searchTerm, statusFilter, facilityFilter, dateFilter, bookings]);

  const handleManualRefresh = () => {
    fetchBookingsData(true);
    toast.success("Bokningar uppdaterade");
  };

  const fetchFacilitiesData = async () => {
    try {
      const data = await fetchFacilities();
      setFacilities(data || []);
    } catch (error) {
      console.error("Error fetching facilities:", error);
    }
  };

  const filterBookings = () => {
    // First filter out blind bookings (hall closures)
    let filtered = bookings.filter(
      (booking) => 
        booking.customerName !== "HALL STÄNGD" && 
        booking.customerName !== "Blockerad" && 
        booking.vehicleRegistration !== "BLOCKED"
    );

    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.status === statusFilter);
    }

    if (facilityFilter !== "all") {
      filtered = filtered.filter((booking) => booking.location.includes(facilityFilter));
    }

    if (dateFilter) {
      const filterDateStr = format(dateFilter, "yyyy-MM-dd");
      filtered = filtered.filter((booking) => {
        const bookingDate = new Date(booking.date);
        const bookingDateStr = format(bookingDate, "yyyy-MM-dd");
        return bookingDateStr === filterDateStr;
      });
    }

    // Sort by date and time, most recent first
    filtered.sort((a, b) => {
      // Handle date formats that might include time already
      const dateA = a.date.split('T')[0];
      const dateB = b.date.split('T')[0];
      const dateTimeA = new Date(`${dateA}T${a.time}`);
      const dateTimeB = new Date(`${dateB}T${b.time}`);
      return dateTimeB.getTime() - dateTimeA.getTime();
    });

    setFilteredBookings(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setFacilityFilter("all");
    setDateFilter(undefined);
    setDisplayedCount(itemsPerPage);
  };

  const loadMore = () => {
    setDisplayedCount(prev => prev + itemsPerPage);
  };

  const hasActiveFilters = searchTerm || statusFilter !== "all" || facilityFilter !== "all" || dateFilter !== undefined;

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await updateBooking(bookingId, { status: newStatus as any });
      toast.success("Status uppdaterad");
      fetchBookingsData();
    } catch (error: any) {
      console.error("Error updating booking:", error);
      
      if (error?.name === 'AuthenticationError' || error?.message === 'SESSION_EXPIRED') {
        toast.error("Din session har gått ut", {
          description: "Du behöver logga in igen för att fortsätta.",
          action: {
            label: "Logga in",
            onClick: () => {
              supabase.auth.signOut().then(() => {
                navigate('/login');
              });
            }
          },
          duration: 10000,
        });
        return;
      }
      
      toast.error("Kunde inte uppdatera bokning");
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setIsEditDialogOpen(true);
  };

  const handleSaveBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      await updateBooking(id, updates);
      toast.success("Bokning uppdaterad");
      fetchBookingsData();
    } catch (error: any) {
      console.error("Error updating booking:", error);
      
      if (error?.name === 'AuthenticationError' || error?.message === 'SESSION_EXPIRED') {
        toast.error("Din session har gått ut", {
          description: "Du behöver logga in igen för att fortsätta.",
          action: {
            label: "Logga in",
            onClick: () => {
              supabase.auth.signOut().then(() => {
                navigate('/login');
              });
            }
          },
          duration: 10000,
        });
        throw error;
      }
      
      toast.error("Kunde inte uppdatera bokning");
      throw error;
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    try {
      setIsDeleting(true);
      await deleteBooking(bookingId);
      toast.success("Bokning borttagen");
      setSelectedBookings(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
      fetchBookingsData();
    } catch (error: any) {
      console.error("Error deleting booking:", error);
      
      if (error?.name === 'AuthenticationError' || error?.message === 'SESSION_EXPIRED') {
        toast.error("Din session har gått ut", {
          description: "Du behöver logga in igen för att fortsätta.",
          action: {
            label: "Logga in",
            onClick: () => {
              supabase.auth.signOut().then(() => {
                navigate('/login');
              });
            }
          },
          duration: 10000,
        });
        return;
      }
      
      toast.error("Kunde inte ta bort bokning");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBookings.size === 0) return;
    
    setIsDeleting(true);
    const bookingIds = Array.from(selectedBookings);
    let successCount = 0;
    let errorCount = 0;

    for (const id of bookingIds) {
      try {
        await deleteBooking(id);
        successCount++;
      } catch (error: any) {
        console.error(`Error deleting booking ${id}:`, error);
        errorCount++;
        
        if (error?.name === 'AuthenticationError' || error?.message === 'SESSION_EXPIRED') {
          toast.error("Din session har gått ut", {
            description: "Du behöver logga in igen för att fortsätta.",
            action: {
              label: "Logga in",
              onClick: () => {
                supabase.auth.signOut().then(() => {
                  navigate('/login');
                });
              }
            },
            duration: 10000,
          });
          break;
        }
      }
    }

    setSelectedBookings(new Set());
    setIsDeleting(false);
    
    if (successCount > 0) {
      toast.success(`${successCount} bokning${successCount !== 1 ? 'ar' : ''} borttagna`);
    }
    if (errorCount > 0) {
      toast.error(`Kunde inte ta bort ${errorCount} bokning${errorCount !== 1 ? 'ar' : ''}`);
    }
    
    fetchBookingsData();
  };

  const handleResendEmail = async (booking: Booking) => {
    try {
      await resendConfirmationEmail(booking.id);
      toast.success(`Bekräftelsemejl skickat till ${booking.email}`);
    } catch (error) {
      console.error('Error resending email:', error);
      toast.error('Kunde inte skicka mejl');
    }
  };

  const toggleSelectBooking = (bookingId: string) => {
    setSelectedBookings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    const visibleBookings = filteredBookings.slice(0, displayedCount);
    const allSelected = visibleBookings.every(b => selectedBookings.has(b.id));
    
    if (allSelected) {
      setSelectedBookings(new Set());
    } else {
      setSelectedBookings(new Set(visibleBookings.map(b => b.id)));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      paid: "default",
      completed: "outline",
      cancelled: "destructive",
    };

    const labels: Record<string, string> = {
      pending: "Bokad",
      paid: "Betald",
      completed: "Slutförd",
      cancelled: "Avbokad",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {labels[status] || status}
      </Badge>
    );
  };

  const visibleBookings = filteredBookings.slice(0, displayedCount);
  const allVisibleSelected = visibleBookings.length > 0 && visibleBookings.every(b => selectedBookings.has(b.id));
  const someVisibleSelected = visibleBookings.some(b => selectedBookings.has(b.id));

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 p-2 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Staff Reminder Alert */}
          <StaffReminderAlert bookings={bookings} />
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-2xl md:text-3xl">Bokningshantering</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleManualRefresh}
                    disabled={isRefreshing}
                    className="h-8 w-8"
                    title="Uppdatera bokningar"
                  >
                    <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {selectedBookings.size > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={isDeleting}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Ta bort ({selectedBookings.size})
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Ta bort bokningar</AlertDialogTitle>
                          <AlertDialogDescription>
                            Är du säker på att du vill ta bort {selectedBookings.size} bokning{selectedBookings.size !== 1 ? 'ar' : ''}? 
                            Denna åtgärd kan inte ångras.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Avbryt</AlertDialogCancel>
                          <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Ta bort
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  {hasActiveFilters && (
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      <X className="h-4 w-4 md:mr-2" />
                      <span className="hidden md:inline">Rensa filter</span>
                    </Button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span>
                  Realtidsuppdatering aktiv
                  {lastUpdated && ` • Senast: ${format(lastUpdated, "HH:mm:ss", { locale: sv })}`}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {dateFilter ? `Visar bokningar för ${format(dateFilter, "d MMMM yyyy", { locale: sv })}` : "Visar alla bokningar"}
              </p>
              <div className="flex flex-col gap-3 mt-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Sök kund..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alla</SelectItem>
                      <SelectItem value="pending">Bokad</SelectItem>
                      <SelectItem value="paid">Betald</SelectItem>
                      <SelectItem value="completed">Slutförd</SelectItem>
                      <SelectItem value="cancelled">Avbokad</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={facilityFilter} onValueChange={setFacilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Anläggning" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Alla</SelectItem>
                      {facilities.map((facility) => (
                        <SelectItem key={facility.id} value={facility.city}>
                          {facility.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "col-span-2 md:col-span-2 justify-start text-left font-normal",
                          !dateFilter && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateFilter ? format(dateFilter, "d MMM yyyy", { locale: sv }) : "Välj datum"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dateFilter}
                        onSelect={(date) => {
                          if (!date) return;
                          setDateFilter(date);
                          setDisplayedCount(itemsPerPage);
                          setIsCalendarOpen(false);
                        }}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Laddar bokningar...</div>
              ) : filteredBookings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Inga bokningar hittades för valt datum
                </div>
              ) : (
                <>
                  {/* Stats bar */}
                  <div className="mb-4 p-3 bg-muted/50 rounded-lg flex items-center justify-between text-sm">
                    <span>
                      Visar <strong>{Math.min(displayedCount, filteredBookings.length)}</strong> av <strong>{filteredBookings.length}</strong> bokningar
                      {selectedBookings.size > 0 && (
                        <span className="ml-2 text-primary">({selectedBookings.size} markerade)</span>
                      )}
                    </span>
                    {displayedCount < filteredBookings.length && (
                      <Button variant="ghost" size="sm" onClick={loadMore}>
                        Ladda fler
                      </Button>
                    )}
                  </div>

                  {/* Mobile view - Card layout */}
                  <div className="md:hidden space-y-3">
                    {visibleBookings.map((booking) => (
                      <Card key={booking.id} className={cn(
                        "border-l-4",
                        selectedBookings.has(booking.id) ? "border-l-primary bg-primary/5" : "border-l-muted"
                      )}>
                        <CardContent className="p-4 space-y-3">
                          {/* Checkbox & Date/Time */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={selectedBookings.has(booking.id)}
                                onCheckedChange={() => toggleSelectBooking(booking.id)}
                              />
                              <div className="flex items-center gap-2 text-sm font-semibold">
                                <CalendarIcon className="h-4 w-4 text-primary" />
                                {format(new Date(booking.date), "d MMM", { locale: sv })}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-semibold">
                              <Clock className="h-4 w-4 text-primary" />
                              {booking.time}
                            </div>
                          </div>

                          {/* Customer */}
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{booking.customerName}</div>
                              <div className="text-xs text-muted-foreground truncate">{booking.phone}</div>
                            </div>
                          </div>

                          {/* Service & Location */}
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{booking.location}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm capitalize">
                            <Car className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate">{booking.serviceName}</span>
                          </div>

                          {/* Status & Actions */}
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <div className="flex-shrink-0">
                              {getStatusBadge(booking.status)}
                            </div>
                            <Select
                              value={booking.status}
                              onValueChange={(value) => updateBookingStatus(booking.id, value)}
                            >
                              <SelectTrigger className="flex-1 h-9">
                                <SelectValue placeholder="Ändra status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Bokad</SelectItem>
                                <SelectItem value="paid">Betald</SelectItem>
                                <SelectItem value="completed">Slutför</SelectItem>
                                <SelectItem value="cancelled">Avboka</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9"
                              onClick={() => handleResendEmail(booking)}
                              title="Skicka bekräftelsemejl"
                            >
                              <Mail className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9"
                              onClick={() => handleEditBooking(booking)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Ta bort bokning</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Är du säker på att du vill ta bort denna bokning för {booking.customerName}? 
                                    Denna åtgärd kan inte ångras.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleDeleteBooking(booking.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Ta bort
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Load more button for mobile */}
                  {displayedCount < filteredBookings.length && (
                    <div className="md:hidden mt-4 text-center">
                      <Button onClick={loadMore} variant="outline" className="w-full">
                        Ladda fler ({filteredBookings.length - displayedCount} kvar)
                      </Button>
                    </div>
                  )}

                  {/* Desktop view - Table layout */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <Checkbox
                              checked={allVisibleSelected}
                              onCheckedChange={toggleSelectAll}
                              aria-label="Markera alla"
                            />
                          </TableHead>
                          <TableHead>Datum</TableHead>
                          <TableHead>Tid</TableHead>
                          <TableHead>Kund</TableHead>
                          <TableHead>Anläggning</TableHead>
                          <TableHead>Tjänst</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Åtgärd</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {visibleBookings.map((booking) => (
                          <TableRow key={booking.id} className={selectedBookings.has(booking.id) ? "bg-primary/5" : undefined}>
                            <TableCell>
                              <Checkbox
                                checked={selectedBookings.has(booking.id)}
                                onCheckedChange={() => toggleSelectBooking(booking.id)}
                              />
                            </TableCell>
                            <TableCell>
                              {format(new Date(booking.date), "d MMM yyyy", { locale: sv })}
                            </TableCell>
                            <TableCell>{booking.time}</TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{booking.customerName}</div>
                                <div className="text-sm text-muted-foreground">{booking.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{booking.location}</TableCell>
                            <TableCell className="capitalize">{booking.serviceName}</TableCell>
                            <TableCell>{getStatusBadge(booking.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={booking.status}
                                  onValueChange={(value) => updateBookingStatus(booking.id, value)}
                                >
                                  <SelectTrigger className="w-[140px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Bokad</SelectItem>
                                    <SelectItem value="paid">Betald</SelectItem>
                                    <SelectItem value="completed">Slutför</SelectItem>
                                    <SelectItem value="cancelled">Avboka</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleResendEmail(booking)}
                                  title="Skicka bekräftelsemejl"
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleEditBooking(booking)}
                                  title="Redigera bokning"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Ta bort bokning</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Är du säker på att du vill ta bort denna bokning för {booking.customerName}? 
                                        Denna åtgärd kan inte ångras.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Avbryt</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => handleDeleteBooking(booking.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Ta bort
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Load more button for desktop */}
                  {displayedCount < filteredBookings.length && (
                    <div className="hidden md:block mt-4 text-center">
                      <Button onClick={loadMore} variant="outline">
                        Ladda fler bokningar ({filteredBookings.length - displayedCount} kvar)
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <EditBookingDialog
        booking={editingBooking}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveBooking}
      />
    </Layout>
  );
};

export default BookingManagement;
