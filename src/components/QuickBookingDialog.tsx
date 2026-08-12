import { useState, useEffect } from "react";
import { createBooking } from "@/lib/bookingApi";
import { fetchFacilities, type Facility } from "@/lib/facilityApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface QuickBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SERVICES = [
  { id: "complete-basic", name: "In- och utvändig tvätt – Bas", price: 690 },
  { id: "exterior-basic", name: "Utvändigt – Bas", price: 370 },
  { id: "interior-basic", name: "Invändigt – Bas", price: 370 },
  { id: "complete-recond", name: "Invändig rekond med utvändig tvätt", price: 2500 },
];

export function QuickBookingDialog({ open, onOpenChange }: QuickBookingDialogProps) {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [vehicleRegistration, setVehicleRegistration] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadFacilities();
    }
  }, [open]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName || !customerPhone || !vehicleRegistration || !serviceType || !selectedFacility) {
      toast.error("Vänligen fyll i alla obligatoriska fält");
      return;
    }

    setLoading(true);

    try {
      const selectedService = SERVICES.find(s => s.id === serviceType);
      const facility = facilities.find(f => f.id === selectedFacility);
      
      if (!selectedService || !facility) {
        throw new Error("Ogiltig tjänst eller anläggning");
      }

      const now = new Date();
      const bookingData = {
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        addons: [],
        extras: [],
        totalPrice: selectedService.price,
        date: now.toISOString().split("T")[0],
        time: now.toTimeString().split(" ")[0].substring(0, 5),
        location: facility.name,
        customerName,
        email: `dropin-${Date.now()}@washap.se`, // Generera en dummy e-post för drop-in
        phone: customerPhone,
        vehicleBrand: "Okänt",
        vehicleModel: "Okänt",
        vehicleRegistration: vehicleRegistration.toUpperCase(),
        status: "paid" as const,
      };

      await createBooking(bookingData);
      toast.success("Drop-in bokning registrerad!");
      
      // Reset form
      setCustomerName("");
      setCustomerPhone("");
      setVehicleRegistration("");
      setServiceType("");
      
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating quick booking:", error);
      toast.error("Kunde inte skapa bokning");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Snabbregistrering Drop-in</DialogTitle>
          <DialogDescription>
            Registrera en drop-in kund snabbt med minimala uppgifter
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-name">Kundnamn *</Label>
            <Input
              id="quick-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="För- och efternamn"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-phone">Telefon *</Label>
            <Input
              id="quick-phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="070-123 45 67"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-reg">Registreringsnummer *</Label>
            <Input
              id="quick-reg"
              value={vehicleRegistration}
              onChange={(e) => setVehicleRegistration(e.target.value)}
              placeholder="ABC123"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-service">Tjänst *</Label>
            <Select value={serviceType} onValueChange={setServiceType} required>
              <SelectTrigger id="quick-service">
                <SelectValue placeholder="Välj tjänst" />
              </SelectTrigger>
              <SelectContent>
                {SERVICES.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - {service.price} kr
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-facility">Anläggning *</Label>
            <Select value={selectedFacility} onValueChange={setSelectedFacility} required>
              <SelectTrigger id="quick-facility">
                <SelectValue placeholder="Välj anläggning" />
              </SelectTrigger>
              <SelectContent>
                {facilities.map((facility) => (
                  <SelectItem key={facility.id} value={facility.id}>
                    {facility.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Avbryt
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Registrerar..." : "Registrera bokning"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
