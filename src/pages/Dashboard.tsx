import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { fetchBookings, updateBooking } from "@/lib/bookingApi";
import { fetchFacilities, type Facility as ApiFacility } from "@/lib/facilityApi";
import { fetchOffers } from "@/lib/offerApi";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, TrendingUp, Users, DollarSign, Gift, ChevronDown, ChevronUp, Bell } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { BookingCard } from "@/components/BookingCard";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Notification sound URL (simple beep)
const NOTIFICATION_SOUND_URL = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";

interface Facility {
  id: string;
  name: string;
  location: string;
  capacity: number;
}

interface Booking {
  id: string;
  facility_id: string;
  booking_date: string;
  status: string;
  totalPrice: number;
}

interface TodayBooking {
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
  status: 'pending' | 'paid' | 'cancelled' | 'completed';
  paymentStatus?: 'pending' | 'paid' | 'failed';
}

interface FacilityStats {
  facility: Facility;
  todayBookings: number;
  weekBookings: number;
  utilizationRate: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<FacilityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalBookings, setTotalBookings] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [activeOffers, setActiveOffers] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [todayBookings, setTodayBookings] = useState<TodayBooking[]>([]);
  const [showPassedBookings, setShowPassedBookings] = useState(false);
  const [newBookingAlert, setNewBookingAlert] = useState(false);
  const previousBookingIdsRef = useRef<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialLoadRef = useRef(true);

  // Play notification sound
  const playNotificationSound = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(NOTIFICATION_SOUND_URL);
      audioRef.current.volume = 0.5;
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(err => console.log("Could not play sound:", err));
  }, []);

  // Check for new bookings
  const checkForNewBookings = useCallback((currentBookings: TodayBooking[]) => {
    const currentIds = new Set(currentBookings.map(b => b.id));
    const previousIds = previousBookingIdsRef.current;
    
    // Skip notification on initial load
    if (isInitialLoadRef.current) {
      previousBookingIdsRef.current = currentIds;
      isInitialLoadRef.current = false;
      return;
    }
    
    // Find new bookings
    const newBookings = currentBookings.filter(b => !previousIds.has(b.id));
    
    if (newBookings.length > 0) {
      // Play sound
      playNotificationSound();
      
      // Show visual notification
      setNewBookingAlert(true);
      setTimeout(() => setNewBookingAlert(false), 5000);
      
      // Show toast for each new booking
      newBookings.forEach(booking => {
        toast.success("Ny bokning!", {
          description: `${booking.customerName} - ${booking.serviceName} kl ${booking.time}`,
          icon: <Bell className="h-4 w-4" />,
          duration: 8000,
        });
      });
    }
    
    previousBookingIdsRef.current = currentIds;
  }, [playNotificationSound]);

  // Split bookings into passed and upcoming
  const { passedBookings, upcomingBookings } = useMemo(() => {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const passed: TodayBooking[] = [];
    const upcoming: TodayBooking[] = [];
    
    todayBookings.forEach(booking => {
      if (booking.time < currentTime) {
        passed.push(booking);
      } else {
        upcoming.push(booking);
      }
    });
    
    return { passedBookings: passed, upcomingBookings: upcoming };
  }, [todayBookings]);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh var 15:e sekund
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch facilities from external API
      const apiFacilities = await fetchFacilities(true);
      
      // Transform API facilities to match our internal format
      const facilities = apiFacilities.map(f => ({
        id: f.id,
        name: f.name,
        location: `${f.streetAddress}, ${f.city}`,
        capacity: 10,
      }));

      // Fetch all bookings from external API and filter out blind bookings
      const bookingsData = await fetchBookings();
      const customerBookingsOnly = bookingsData.filter(
        b => b.customerName !== "HALL STÄNGD" && 
             b.customerName !== "Blockerad" && 
             b.vehicleRegistration !== "BLOCKED"
      );
      const bookings = customerBookingsOnly.map(b => ({
        id: b.id,
        facility_id: facilities?.[0]?.id || "",
        booking_date: b.date.split("T")[0], // Extrahera endast datumdelen (YYYY-MM-DD)
        status: b.status,
        totalPrice: b.totalPrice || 0, // Lägg till totalPrice
      }));

      // Fetch active offers
      try {
        const offersData = await fetchOffers();
        setActiveOffers(offersData.length);
      } catch (error) {
        setActiveOffers(0);
      }

      const today = new Date().toISOString().split("T")[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];

      // Calculate today's revenue from actual booking prices
      const todayBookingsData = bookings.filter(
        (b: Booking) => b.booking_date === today
      );
      const todayRevenueSum = todayBookingsData.reduce((sum, b) => sum + b.totalPrice, 0);
      setTodayRevenue(todayRevenueSum);

      // Get full details for today's bookings (excluding blind bookings)
      const todayBookingsDetailed = await fetchBookings();
      const todayBookingsFiltered = todayBookingsDetailed
        .filter(b => b.date.split("T")[0] === today)
        .filter(b => 
          b.customerName !== "HALL STÄNGD" && 
          b.customerName !== "Blockerad" && 
          b.vehicleRegistration !== "BLOCKED"
        )
        .sort((a, b) => a.time.localeCompare(b.time));
      
      // Check for new bookings before updating state
      checkForNewBookings(todayBookingsFiltered);
      setTodayBookings(todayBookingsFiltered);

      // Calculate stats for each facility
      const facilityStats: FacilityStats[] = (facilities || []).map((facility) => {
        const facilityBookings = (bookings || []).filter(
          (b: Booking) => b.facility_id === facility.id
        );

        const todayBookings = facilityBookings.filter(
          (b: Booking) => b.booking_date === today
        ).length;

        const weekBookings = facilityBookings.filter(
          (b: Booking) => b.booking_date >= weekAgo
        ).length;

        const utilizationRate = (todayBookings / facility.capacity) * 100;

        return {
          facility,
          todayBookings,
          weekBookings,
          utilizationRate,
        };
      });

      setStats(facilityStats);
      setTotalBookings((bookings || []).length);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return "text-destructive";
    if (rate >= 50) return "text-amber-500";
    return "text-primary";
  };

  const getUtilizationBgColor = (rate: number) => {
    if (rate >= 80) return "bg-destructive";
    if (rate >= 50) return "bg-amber-500";
    return "bg-primary";
  };

  const getStatusIcon = (rate: number) => {
    if (rate >= 80) return "🔴";
    if (rate >= 50) return "🟡";
    return "🟢";
  };

  const getTimeSinceUpdate = () => {
    const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s sedan`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m sedan`;
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await updateBooking(bookingId, { status: newStatus as any });
      toast.success("Status uppdaterad", {
        description: "Bokningens status har uppdaterats.",
      });
      fetchDashboardData(); // Refresh data
    } catch (error: any) {
      // Handle authentication errors specifically
      if (error?.name === 'AuthenticationError' || error?.message === 'SESSION_EXPIRED') {
        toast.error("Din session har gått ut", {
          description: "Du behöver logga in igen för att fortsätta.",
          action: {
            label: "Logga in",
            onClick: async () => {
              await supabase.auth.signOut();
              navigate('/login');
            }
          },
          duration: 10000,
        });
        return;
      }
      
      toast.error("Kunde inte uppdatera status");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <Skeleton className="h-20 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5">
        {/* Header */}
        <header className="bg-card/50 backdrop-blur-sm border-b border-border py-6 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted-foreground">Välkommen tillbaka! Här är översikten</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Uppdaterad</p>
                <p className="text-sm font-medium">{getTimeSinceUpdate()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-2 sm:p-8">
          {/* Enhanced Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-emerald/10 to-emerald/5 border-emerald/20 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Totalt Bokningar</CardTitle>
                <Calendar className="h-4 w-4 text-emerald" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalBookings}</div>
                <p className="text-xs text-muted-foreground">Alla bokningar</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald/10 to-primary/5 border-emerald/20 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dagens Bokningar</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.reduce((sum, s) => sum + s.todayBookings, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Idag</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald/10 to-emerald/5 border-emerald/20 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dagens Intäkter</CardTitle>
                <DollarSign className="h-4 w-4 text-emerald" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{todayRevenue} kr</div>
                <p className="text-xs text-muted-foreground">Uppskattad</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald/10 to-primary/10 border-emerald/20 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Anläggningar</CardTitle>
                <MapPin className="h-4 w-4 text-emerald" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.length}</div>
                <p className="text-xs text-muted-foreground">Aktiva platser</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-accent/10 to-emerald/5 border-accent/20 hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Aktiva Erbjudanden</CardTitle>
                <Gift className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{activeOffers}</div>
                <p className="text-xs text-muted-foreground">Kampanjer</p>
              </CardContent>
            </Card>
          </div>

          {/* Facilities Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Anläggningar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.map(({ facility, todayBookings: facilityTodayBookings, weekBookings, utilizationRate }) => (
                <Card
                  key={facility.id}
                  className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50 cursor-pointer group"
                  onClick={() => navigate(`/facility/${facility.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xl">{getStatusIcon(utilizationRate)}</span>
                          <CardTitle className="text-lg">{facility.name}</CardTitle>
                        </div>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {facility.location}
                        </p>
                      </div>
                      <div
                        className={`text-2xl font-bold ${getUtilizationColor(utilizationRate)}`}
                      >
                        {utilizationRate.toFixed(0)}%
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Idag</span>
                      </div>
                      <span className="font-semibold">
                        {facilityTodayBookings} / {facility.capacity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Senaste veckan</span>
                      </div>
                      <span className="font-semibold">{weekBookings}</span>
                    </div>

                    {/* Utilization Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Kapacitetsutnyttjande</span>
                        <span>{utilizationRate.toFixed(0)}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${getUtilizationBgColor(utilizationRate)}`}
                          style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Actions on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground text-center">
                        Klicka för att se detaljer
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Today's Bookings Widget */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold">Dagens Bokningar</h2>
              {newBookingAlert && (
                <Badge variant="destructive" className="animate-pulse flex items-center gap-1">
                  <Bell className="h-3 w-3" />
                  Ny bokning!
                </Badge>
              )}
            </div>
            <Card className={`bg-card/50 backdrop-blur-sm transition-all duration-300 ${newBookingAlert ? 'ring-2 ring-primary shadow-lg shadow-primary/20' : ''}`}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Bokningar idag</span>
                  <Badge variant="secondary" className="text-lg">
                    {todayBookings.length} st
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {todayBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Inga bokningar idag</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Passed Bookings - Collapsible */}
                    {passedBookings.length > 0 && (
                      <Collapsible open={showPassedBookings} onOpenChange={setShowPassedBookings}>
                        <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                              Passerade bokningar
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {passedBookings.length} st
                            </Badge>
                          </div>
                          {showPassedBookings ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="pt-3">
                          <div className="space-y-3 opacity-60">
                            {passedBookings.map((booking) => (
                              <BookingCard
                                key={booking.id}
                                booking={booking}
                                onStatusUpdate={handleStatusUpdate}
                                showDate={false}
                              />
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    )}

                    {/* Upcoming Bookings */}
                    {upcomingBookings.length > 0 ? (
                      <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-4">
                          {upcomingBookings.map((booking) => (
                            <BookingCard
                              key={booking.id}
                              booking={booking}
                              onStatusUpdate={handleStatusUpdate}
                              showDate={false}
                            />
                          ))}
                        </div>
                      </ScrollArea>
                    ) : passedBookings.length > 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <p>Inga fler bokningar kvar idag</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default Dashboard;
