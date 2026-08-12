import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createBooking } from "@/lib/bookingApi";
import { fetchFacilities, type Facility } from "@/lib/facilityApi";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Layout } from "@/components/Layout";

type ServiceType = "in-out-bas" | "out-bas" | "in-bas" | "in-out-rekond";

type Addon = {
  id: string;
  name: string;
  price: number;
  availableFor: ServiceType[];
};

type Extra = {
  id: string;
  name: string;
  price: number | "on-request";
  percentage?: number;
  availableFor: ServiceType[];
};

const SERVICES = [
  { id: "in-out-bas", name: "In- och utvändig tvätt – Bas", price: 690, duration: 60 },
  { id: "out-bas", name: "Utvändigt – Bas", price: 370, duration: 30 },
  { id: "in-bas", name: "Invändigt – Bas", price: 370, duration: 35 },
  { id: "in-out-rekond", name: "In- och utvändig tvätt – Rekond", price: 2500, duration: 180 },
];

const ADDONS: Addon[] = [
  { id: "asfalt", name: "Asfaltsborttagning", price: 80, availableFor: ["out-bas", "in-out-bas"] },
  { id: "dorr", name: "Ångtvätt av dörrgångar", price: 50, availableFor: ["out-bas", "in-out-bas"] },
  { id: "sprayvax", name: "Sprayvax", price: 150, availableFor: ["out-bas", "in-out-bas"] },
  { id: "sate-fram", name: "Sätestvätt framstol", price: 250, availableFor: ["in-bas", "in-out-bas"] },
  { id: "sate-bak", name: "Sätestvätt baksäte", price: 450, availableFor: ["in-bas", "in-out-bas"] },
];

const EXTRAS: Extra[] = [
  { id: "motor", name: "Motortvätt", price: 395, availableFor: ["out-bas", "in-out-bas"] },
  { id: "storbil", name: "Storbilstillägg", price: 0, percentage: 25, availableFor: ["out-bas", "in-out-bas", "in-bas"] },
  { id: "extra-smutsig", name: "Extra smutsig bil", price: 0, percentage: 25, availableFor: ["out-bas", "in-out-bas", "in-bas"] },
  { id: "sanering", name: "Sanering av hund-/katthår", price: "on-request", availableFor: ["in-bas", "in-out-bas"] },
];

const BookingForm = () => {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState("");
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("");
  const [serviceType, setServiceType] = useState<ServiceType | "">("");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleRegistration, setVehicleRegistration] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadFacilities();
  }, []);

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
    
    // Add addons
    selectedAddons.forEach(addonId => {
      const addon = ADDONS.find(a => a.id === addonId);
      if (addon) total += addon.price;
    });
    
    // Add extras
    let baseForPercentage = total;
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
    
    return total;
  };

  const getAvailableAddons = () => {
    if (!serviceType) return [];
    return ADDONS.filter(addon => addon.availableFor.includes(serviceType as ServiceType));
  };

  const getAvailableExtras = () => {
    if (!serviceType) return [];
    return EXTRAS.filter(extra => extra.availableFor.includes(serviceType as ServiceType));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast.error("Välj ett datum");
      return;
    }

    if (!time) {
      toast.error("Välj en tid");
      return;
    }

    if (!serviceType) {
      toast.error("Välj en tjänst");
      return;
    }

    setLoading(true);

    try {
      // Validate with zod schema
      const { bookingSchema, formatZodErrors } = await import('@/lib/validationSchemas');
      
      const bookingData = {
        customerName,
        customerEmail,
        customerPhone: customerPhone || '',
        vehicleBrand: vehicleBrand || 'Okänt',
        vehicleModel: vehicleModel || 'Okänt',
        vehicleRegistration: vehicleRegistration || 'XXX000',
        serviceType: serviceType,
        bookingDate: format(date, 'yyyy-MM-dd'),
        bookingTime: time,
        facility_id: selectedFacility,
        status: 'pending' as const,
      };

      try {
        bookingSchema.parse(bookingData);
      } catch (error) {
        if (error instanceof Error && 'errors' in error) {
          toast.error('Valideringsfel', {
            description: formatZodErrors(error as any)
          });
          setLoading(false);
          return;
        }
        throw error;
      }

      const facility = facilities.find(f => f.id === selectedFacility);
      if (!facility) {
        throw new Error("Ingen anläggning vald");
      }
      
      const location = `${facility.streetAddress}, ${facility.city}, ${facility.postalCode}`;
      const service = SERVICES.find(s => s.id === serviceType);
      
      await createBooking({
        serviceId: serviceType,
        serviceName: service?.name || "",
        servicePrice: service?.price || 0,
        totalPrice: calculateTotalPrice(),
        date: format(date, 'yyyy-MM-dd'),
        time: time,
        location: location,
        customerName: customerName,
        email: customerEmail,
        phone: customerPhone,
        vehicleBrand: vehicleBrand || "Okänt",
        vehicleModel: vehicleModel || "Okänt",
        vehicleRegistration: vehicleRegistration || "Saknas",
        status: "pending",
      } as any);

      toast.success("Bokning skapad!", {
        description: "Din bokning har registrerats",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating booking:", error);
      toast.error("Kunde inte skapa bokning", {
        description: "Försök igen senare",
      });
    } finally {
      setLoading(false);
    }
  };

  const getServiceName = (type: string) => {
    switch (type) {
      case "standard": return "Handtvätt Standard";
      case "premium": return "Handtvätt Premium";
      case "interior": return "Invändig Rengöring";
      case "complete": return "Komplett Paket";
      default: return "Standard";
    }
  };

  const getServicePrice = (type: string) => {
    switch (type) {
      case "standard": return 299;
      case "premium": return 499;
      case "interior": return 399;
      case "complete": return 799;
      default: return 299;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/5 p-2 sm:p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Skapa bokning (Personal)</CardTitle>
              <CardDescription>
                Använd detta formulär för att registrera drop-in kunder eller manuellt skapa bokningar. 
                Kunden får bekräftelse via e-post.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {facilities.length > 1 ? (
                  <div className="space-y-2">
                    <Label htmlFor="facility">Välj anläggning</Label>
                    <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                      <SelectTrigger>
                        <SelectValue placeholder="Välj anläggning" />
                      </SelectTrigger>
                      <SelectContent>
                        {facilities.map((facility) => (
                          <SelectItem key={facility.id} value={facility.id}>
                            {facility.name} - {facility.streetAddress}, {facility.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : facilities.length === 1 && (
                  <div className="space-y-2">
                    <Label>Anläggning</Label>
                    <div className="w-full px-3 py-2 text-sm border rounded-md bg-muted/30">
                      {facilities[0].name} - {facilities[0].streetAddress}, {facilities[0].city}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Välj datum</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: sv }) : "Välj datum"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        locale={sv}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Välj tid</Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj tid" />
                    </SelectTrigger>
                    <SelectContent>
                      {["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="service">Välj tjänst</Label>
                  <Select value={serviceType} onValueChange={(value) => setServiceType(value as ServiceType)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Välj tjänst" />
                    </SelectTrigger>
                    <SelectContent>
                      {SERVICES.map(service => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - {service.price} kr ({service.duration} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {serviceType && getAvailableAddons().length > 0 && (
                  <div className="space-y-3">
                    <Label>Tillval</Label>
                    <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
                      {getAvailableAddons().map(addon => (
                        <div key={addon.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={addon.id}
                            checked={selectedAddons.includes(addon.id)}
                            onCheckedChange={() => toggleAddon(addon.id)}
                          />
                          <label
                            htmlFor={addon.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                          >
                            {addon.name} (+{addon.price} kr)
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {serviceType && getAvailableExtras().length > 0 && (
                  <div className="space-y-3">
                    <Label>Extras</Label>
                    <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
                      {getAvailableExtras().map(extra => (
                        <div key={extra.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={extra.id}
                            checked={selectedExtras.includes(extra.id)}
                            onCheckedChange={() => toggleExtra(extra.id)}
                          />
                          <label
                            htmlFor={extra.id}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                          >
                            {extra.name} 
                            {extra.price === "on-request" 
                              ? " (pris på begäran)"
                              : extra.percentage 
                                ? ` (+${extra.percentage}%)`
                                : ` (+${extra.price} kr)`
                            }
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {serviceType && (
                  <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary/20">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Totalt pris:</span>
                      <span className="text-2xl font-bold text-primary">
                        {calculateTotalPrice()} kr
                      </span>
                    </div>
                    {selectedExtras.includes('sanering') && (
                      <p className="text-sm text-muted-foreground mt-2">
                        * Innehåller tjänster med pris på begäran - vi kontaktar dig för slutligt pris
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Namn</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ditt namn"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">E-post</Label>
                  <Input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="din@email.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="070-123 45 67"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleBrand">Bilmärke</Label>
                  <Input
                    id="vehicleBrand"
                    value={vehicleBrand}
                    onChange={(e) => setVehicleBrand(e.target.value)}
                    placeholder="t.ex. Volvo"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleModel">Modell</Label>
                  <Input
                    id="vehicleModel"
                    value={vehicleModel}
                    onChange={(e) => setVehicleModel(e.target.value)}
                    placeholder="t.ex. V70"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleRegistration">Registreringsnummer</Label>
                  <Input
                    id="vehicleRegistration"
                    value={vehicleRegistration}
                    onChange={(e) => setVehicleRegistration(e.target.value.toUpperCase())}
                    placeholder="ABC123"
                    required
                    maxLength={6}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => navigate("/dashboard")}
                  >
                    Avbryt
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Bokar..." : "Bekräfta bokning"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default BookingForm;
