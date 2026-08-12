import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createBooking, fetchAvailableTimes } from "@/lib/bookingApi";
import { fetchFacilities, type Facility } from "@/lib/facilityApi";
import { getFacilityClosure, isFacilityClosedOnDate } from "@/lib/bookingClosures";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";
import PublicFooter from "@/components/PublicFooter";
import { format, isToday, addHours, addDays, isBefore, parse } from "date-fns";
import { sv } from "date-fns/locale";
import { toast } from "sonner";
import { MaintenanceBanner } from "@/components/MaintenanceBanner";
import { StepIndicator } from "@/components/booking/StepIndicator";
import { StepOne } from "@/components/booking/StepOne";
import { StepTwo } from "@/components/booking/StepTwo";
import { StepThree } from "@/components/booking/StepThree";
import { BookingSummary } from "@/components/booking/BookingSummary";
import { validateCustomerInfo } from "@/lib/bookingValidation";
import SEOHead from "@/components/SEOHead";
import {
  TimeSlot,
  ServiceType,
  VehicleSize,
  SERVICES,
  ADDONS,
  VEHICLE_SIZES,
  EXTRAS,
} from "@/components/booking/types";

const PublicBooking = () => {
  const [searchParams] = useSearchParams();
  const preselectedService = searchParams.get("service") as ServiceType | null;

  const [currentStep, setCurrentStep] = useState(1);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType | "">(
    preselectedService && SERVICES.some(s => s.id === preselectedService) ? preselectedService : ""
  );
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleRegistration, setVehicleRegistration] = useState("");
  const [vehicleSize, setVehicleSize] = useState<VehicleSize | "">("");
  const [loading, setLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [capacity, setCapacity] = useState<number>(1);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [searchingNextAvailable, setSearchingNextAvailable] = useState(false);

  const MINIMUM_LEAD_TIME_HOURS = 1;

  // Get the selected service duration
  const selectedService = SERVICES.find(s => s.id === serviceType);
  const serviceDuration = selectedService?.duration || 60;

  // Get facility closing hour based on selected date
  const getFacilityCloseHour = (): number => {
    const facility = facilities.find(f => f.id === selectedFacility);
    if (!facility || !date) return 18;

    const dayOfWeek = date.getDay();
    let hoursString = facility.openingHoursWeekdays;

    if (dayOfWeek === 0 && facility.openingHoursSunday) {
      hoursString = facility.openingHoursSunday;
    } else if (dayOfWeek === 6) {
      hoursString = facility.openingHoursSaturday;
    }

    const match = hoursString?.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
    if (match) {
      return parseInt(match[3], 10);
    }
    return 18;
  };

  const facilityCloseHour = getFacilityCloseHour();

  const generateTimeSlots = (facility?: Facility): string[] => {
    const slots: string[] = [];
    let openHour = 9;
    let closeHour = 17;

    if (facility && date) {
      const dayOfWeek = date.getDay();
      let hoursString = facility.openingHoursWeekdays;

      if (dayOfWeek === 0 && facility.openingHoursSunday) {
        hoursString = facility.openingHoursSunday;
      } else if (dayOfWeek === 6) {
        hoursString = facility.openingHoursSaturday;
      }

      const match = hoursString?.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
      if (match) {
        openHour = parseInt(match[1], 10);
        closeHour = parseInt(match[3], 10);
      }
    }

    for (let hour = openHour; hour <= closeHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < closeHour) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  };

  const isTimeSlotInPast = (timeStr: string): boolean => {
    if (!date || !isToday(date)) return false;
    const now = new Date();
    const minimumTime = addHours(now, MINIMUM_LEAD_TIME_HOURS);
    const slotTime = parse(timeStr, 'HH:mm', date);
    return isBefore(slotTime, minimumTime);
  };

  const selectedFacilityData = facilities.find(f => f.id === selectedFacility);
  const ALL_TIMES = generateTimeSlots(selectedFacilityData);

  useEffect(() => {
    loadFacilities();
  }, []);

  useEffect(() => {
    if (date && selectedFacility) {
      loadAvailableTimes();
    }
  }, [date, selectedFacility]);

  // Clear time selection when service changes (as available times might differ)
  useEffect(() => {
    if (time) {
      // Check if the selected time would cause overtime with new service
      const [hours, minutes] = time.split(':').map(Number);
      const slotMinutes = hours * 60 + minutes;
      const closeMinutes = facilityCloseHour * 60;
      const endMinutes = slotMinutes + serviceDuration;

      if (endMinutes > closeMinutes) {
        setTime("");
        toast.info("Vald tid återställdes", {
          description: "Den tidigare valda tiden passar inte för denna tjänst"
        });
      }
    }
  }, [serviceType]);

  const loadFacilities = async () => {
    try {
      const data = await fetchFacilities(true);
      setFacilities(data || []);
      if (data && data.length > 0) {
        setSelectedFacility(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching facilities:", error);
      toast.error("Kunde inte ladda anläggningar");
    }
  };

  const loadAvailableTimes = async () => {
    if (!date || !selectedFacility) return;

    setLoadingTimes(true);
    try {
      const facility = facilities.find(f => f.id === selectedFacility);
      if (!facility) return;

      const location = `${facility.streetAddress}, ${facility.postalCode} ${facility.city}`;
      const formattedDate = format(date, 'yyyy-MM-dd');

      const availabilityData = await fetchAvailableTimes(formattedDate, location);
      setCapacity(availabilityData.capacity);
      setTimeSlots(availabilityData.timeSlots);

      if (time) {
        const selectedSlot = availabilityData.timeSlots.find(slot => slot.time === time);
        if (!selectedSlot || selectedSlot.available === 0) {
          setTime("");
        }
      }
    } catch (error) {
      console.error("Error fetching available times:", error);
      toast.error("Kunde inte ladda lediga tider");
      setCapacity(1);
      setTimeSlots([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  const hasNoAvailableTimes = (): boolean => {
    if (timeSlots.length === 0) return true;
    return timeSlots.every(slot => {
      const isFull = slot.available === 0;
      const isPast = isTimeSlotInPast(slot.time);
      return isFull || isPast;
    });
  };

  const findNextAvailableDate = async () => {
    if (!selectedFacility) return;

    setSearchingNextAvailable(true);
    const facility = facilities.find(f => f.id === selectedFacility);
    if (!facility) {
      setSearchingNextAvailable(false);
      return;
    }

    const location = `${facility.streetAddress}, ${facility.postalCode} ${facility.city}`;
    const startDate = date || new Date();

    for (let i = 1; i <= 30; i++) {
      const checkDate = addDays(startDate, i);
      const formattedDate = format(checkDate, 'yyyy-MM-dd');

      try {
        const availabilityData = await fetchAvailableTimes(formattedDate, location);

        // Check if any slot has availability AND fits the service duration
        const dayOfWeek = checkDate.getDay();
        let hoursString = facility.openingHoursWeekdays;
        if (dayOfWeek === 0 && facility.openingHoursSunday) {
          hoursString = facility.openingHoursSunday;
        } else if (dayOfWeek === 6) {
          hoursString = facility.openingHoursSaturday;
        }

        let closeHour = 18;
        const match = hoursString?.match(/(\d{2}):(\d{2})\s*-\s*(\d{2}):(\d{2})/);
        if (match) {
          closeHour = parseInt(match[3], 10);
        }

        const hasAvailable = availabilityData.timeSlots.some(slot => {
          if (slot.available === 0) return false;

          // Check if time hasn't passed (for today)
          if (isToday(checkDate)) {
            const now = new Date();
            const minimumTime = addHours(now, MINIMUM_LEAD_TIME_HOURS);
            const slotTime = parse(slot.time, 'HH:mm', checkDate);
            if (isBefore(slotTime, minimumTime)) return false;
          }

          // Check if service fits before closing
          const [hours, minutes] = slot.time.split(':').map(Number);
          const slotMinutes = hours * 60 + minutes;
          const closeMinutes = closeHour * 60;
          const endMinutes = slotMinutes + serviceDuration;

          return endMinutes <= closeMinutes;
        });

        if (hasAvailable) {
          setDate(checkDate);
          setCapacity(availabilityData.capacity);
          setTimeSlots(availabilityData.timeSlots);
          toast.success(`Lediga tider hittade`, {
            description: format(checkDate, "d MMMM yyyy", { locale: sv })
          });
          setSearchingNextAvailable(false);
          return;
        }
      } catch (error) {
        console.error(`Error checking date ${formattedDate}:`, error);
      }
    }

    toast.error("Inga lediga tider hittades", {
      description: "Prova att välja en annan anläggning"
    });
    setSearchingNextAvailable(false);
  };

  const getTimeSlotStatus = (slot: TimeSlot): 'available' | 'partial' | 'full' => {
    if (slot.available === capacity) return 'available';
    if (slot.available > 0) return 'partial';
    return 'full';
  };

  const getAffectedSlots = (startTime: string, serviceId: string): string[] => {
    if (!serviceId) return [startTime];

    const service = SERVICES.find(s => s.id === serviceId);
    if (!service) return [startTime];

    const duration = service.duration;
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;

    const affected: string[] = [];
    for (let m = startMinutes; m < endMinutes; m += 30) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      const timeStr = `${h.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      if (ALL_TIMES.includes(timeStr)) {
        affected.push(timeStr);
      }
    }

    return affected;
  };

  const toggleAddon = (addonId: string) => {
    setSelectedAddons(prev =>
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  const toggleExtra = (extraId: string) => {
    setSelectedExtras(prev =>
      prev.includes(extraId) ? prev.filter(id => id !== extraId) : [...prev, extraId]
    );
  };

  const calculateTotalPrice = () => {
    if (!serviceType) return 0;

    const service = SERVICES.find(s => s.id === serviceType);
    let total = service?.price || 0;

    selectedAddons.forEach(addonId => {
      const addon = ADDONS.find(a => a.id === addonId);
      if (addon) total += addon.price;
    });

    let baseForPercentage = total;

    if (vehicleSize) {
      const sizeOption = VEHICLE_SIZES.find(s => s.id === vehicleSize);
      if (sizeOption && sizeOption.percentage > 0) {
        total += baseForPercentage * (sizeOption.percentage / 100);
      }
    }

    selectedExtras.forEach(extraId => {
      const extra = EXTRAS.find(e => e.id === extraId);
      if (extra && extra.price !== "on-request") {
        if (extra.percentage) {
          total += baseForPercentage * (extra.percentage / 100);
        } else {
          total += extra.price;
        }
      }
    });

    return Math.round(total);
  };

  // Validation - Updated order
  const canProceedStep1 = !!serviceType && !!vehicleSize;
  const canProceedStep2 = !!date && !!time && !isTimeSlotInPast(time);
  
  const customerData = {
    customerName,
    customerEmail,
    customerPhone,
    vehicleBrand,
    vehicleModel,
    vehicleRegistration,
  };
  const { isValid: isCustomerInfoValid } = validateCustomerInfo(customerData);
  const canSubmit = isCustomerInfoValid;

  const canNavigateToStep = (step: number): boolean => {
    if (step === 1) return true;
    if (step === 2) return canProceedStep1;
    if (step === 3) return canProceedStep1 && canProceedStep2;
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !time || !serviceType || !vehicleSize) {
      toast.error("Vänligen fyll i alla obligatoriska fält");
      return;
    }

    // Validate customer info
    const { isValid, errors } = validateCustomerInfo(customerData);
    if (!isValid) {
      const firstError = Object.values(errors)[0];
      toast.error("Kontrollera uppgifterna", {
        description: firstError || "Ett eller flera fält har ogiltiga värden"
      });
      return;
    }

    if (isTimeSlotInPast(time)) {
      toast.error("Den valda tiden har passerat", {
        description: `Du måste boka minst ${MINIMUM_LEAD_TIME_HOURS} timme i förväg`
      });
      setTime("");
      setCurrentStep(2);
      return;
    }

    setLoading(true);

    try {
      const facility = facilities.find(f => f.id === selectedFacility);
      if (!facility) {
        throw new Error("Ingen anläggning vald");
      }
      if (isFacilityClosedOnDate(facility, date)) {
        throw new Error(getFacilityClosure(facility)?.message || "Bokning är stängd för detta datum");
      }

      const location = `${facility.streetAddress}, ${facility.postalCode} ${facility.city}`;
      const selectedServiceData = SERVICES.find(s => s.id === serviceType);

      const selectedAddonsList = selectedAddons.map(id => {
        const addon = ADDONS.find(a => a.id === id);
        return addon ? { id: addon.id, name: addon.name, price: addon.price } : null;
      }).filter(Boolean);

      const vehicleSizeExtra = vehicleSize === "suv" ? [{
        id: "large-vehicle",
        name: "SUV (+25%)",
        percentage: "25%"
      }] : [];

      const selectedExtrasList = selectedExtras.map(id => {
        const extra = EXTRAS.find(e => e.id === id);
        if (!extra) return null;

        if (typeof extra.percentage === 'number') {
          return {
            id: extra.id,
            name: extra.name,
            percentage: `${extra.percentage}%`,
          };
        }

        return {
          id: extra.id,
          name: extra.name,
          price: extra.price === "on-request" ? undefined : extra.price
        };
      }).filter(Boolean);

      const totalPrice = calculateTotalPrice();

      const booking = {
        id: Date.now().toString(),
        serviceId: selectedServiceData?.id || "",
        serviceName: selectedServiceData?.name || "",
        servicePrice: selectedServiceData?.price || 0,
        addons: selectedAddonsList,
        extras: [...vehicleSizeExtra, ...selectedExtrasList],
        totalPrice,
        date: format(date, 'yyyy-MM-dd'),
        time: time,
        location: location,
        customerName: customerName,
        email: customerEmail.trim().toLowerCase(),
        phone: customerPhone.replace(/\s/g, ''),
        vehicleBrand: `${vehicleBrand} ${vehicleModel}`,
        vehicleModel: vehicleModel,
        vehicleRegistration: vehicleRegistration,
        status: 'pending' as const,
        paymentStatus: 'pending' as const,
        createdAt: new Date().toISOString(),
      };

      await createBooking(booking as any);

      setBookingSuccess(true);
      toast.success("Bokning skapad!", {
        description: "Du kommer få en bekräftelse via e-post",
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Kunde inte skapa bokning", {
        description: "Försök igen senare",
      });
    } finally {
      setLoading(false);
    }
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5">
        <PublicHeader />
        
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
          <Card className="max-w-md w-full">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Bokning bekräftad!</h2>
              <p className="text-muted-foreground mb-4">
                Din bokning har registrerats. Du kommer få en bekräftelse via e-post på {customerEmail}.
              </p>
              <div className="space-y-2">
                <Button onClick={() => window.location.reload()} className="w-full">
                  Boka en till tid
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/">Tillbaka till startsidan</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const formData = {
    selectedFacility,
    date,
    time,
    serviceType,
    selectedAddons,
    selectedExtras,
    vehicleSize,
    customerName,
    customerEmail,
    customerPhone,
    vehicleBrand,
    vehicleModel,
    vehicleRegistration,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/10 via-background to-accent/5">
      <SEOHead
        title="Boka Biltvätt Online – Car Washap Borlänge"
        description="Boka din biltvätt enkelt online hos Car Washap vid Kupolen i Borlänge. Välj tjänst, datum och tid. Bekräftelse direkt via e-post."
        canonicalPath="/boka"
        keywords="boka biltvätt borlänge, biltvätt online, boka handtvätt, kupolen biltvätt bokning"
      />
      <PublicHeader />

      <MaintenanceBanner />
      <div className="flex-1 p-2 sm:p-8 pb-24 lg:pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold">Boka biltvätt</h1>
            <p className="text-muted-foreground mt-2">
              Välj tjänst och tid för din biltvätt. Du får bekräftelse via e-post.
            </p>
          </div>

          <StepIndicator
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            canNavigateToStep={canNavigateToStep}
          />

          <div className="flex gap-8">
            <Card className="flex-1">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit}>
                  {currentStep === 1 && (
                    <StepOne
                      serviceType={serviceType}
                      setServiceType={setServiceType}
                      vehicleSize={vehicleSize}
                      setVehicleSize={setVehicleSize}
                      selectedAddons={selectedAddons}
                      toggleAddon={toggleAddon}
                      selectedExtras={selectedExtras}
                      toggleExtra={toggleExtra}
                      totalPrice={calculateTotalPrice()}
                      onNext={() => setCurrentStep(2)}
                      canProceed={canProceedStep1}
                    />
                  )}

                  {currentStep === 2 && (
                    <StepTwo
                      facilities={facilities}
                      selectedFacility={selectedFacility}
                      setSelectedFacility={setSelectedFacility}
                      date={date}
                      setDate={setDate}
                      time={time}
                      setTime={setTime}
                      timeSlots={timeSlots}
                      loadingTimes={loadingTimes}
                      capacity={capacity}
                      isTimeSlotInPast={isTimeSlotInPast}
                      hasNoAvailableTimes={hasNoAvailableTimes}
                      findNextAvailableDate={findNextAvailableDate}
                      searchingNextAvailable={searchingNextAvailable}
                      getTimeSlotStatus={getTimeSlotStatus}
                      getAffectedSlots={getAffectedSlots}
                      serviceType={serviceType}
                      serviceDuration={serviceDuration}
                      facilityCloseHour={facilityCloseHour}
                      onNext={() => setCurrentStep(3)}
                      onBack={() => setCurrentStep(1)}
                      canProceed={canProceedStep2}
                    />
                  )}

                  {currentStep === 3 && (
                    <StepThree
                      customerName={customerName}
                      setCustomerName={setCustomerName}
                      customerEmail={customerEmail}
                      setCustomerEmail={setCustomerEmail}
                      customerPhone={customerPhone}
                      setCustomerPhone={setCustomerPhone}
                      vehicleBrand={vehicleBrand}
                      setVehicleBrand={setVehicleBrand}
                      vehicleModel={vehicleModel}
                      setVehicleModel={setVehicleModel}
                      vehicleRegistration={vehicleRegistration}
                      setVehicleRegistration={setVehicleRegistration}
                      onBack={() => setCurrentStep(2)}
                      onSubmit={handleSubmit}
                      loading={loading}
                      canSubmit={canSubmit}
                    />
                  )}
                </form>
              </CardContent>
            </Card>

            <BookingSummary
              formData={formData}
              facility={selectedFacilityData}
              totalPrice={calculateTotalPrice()}
              className="w-80"
            />
          </div>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
};

export default PublicBooking;
