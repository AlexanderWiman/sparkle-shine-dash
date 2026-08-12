import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";

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

interface EditBookingDialogProps {
  booking: Booking | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: Partial<Booking>) => Promise<void>;
}

const ALL_TIMES = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export function EditBookingDialog({ booking, open, onOpenChange, onSave }: EditBookingDialogProps) {
  const [formData, setFormData] = useState<{
    customerName: string;
    email: string;
    phone: string;
    vehicleBrand: string;
    vehicleModel: string;
    vehicleRegistration: string;
    date: string;
    time: string;
    status: 'pending' | 'completed' | 'cancelled' | 'paid';
  }>({
    customerName: "",
    email: "",
    phone: "",
    vehicleBrand: "",
    vehicleModel: "",
    vehicleRegistration: "",
    date: "",
    time: "",
    status: "pending",
  });
  const [saving, setSaving] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  useEffect(() => {
    if (booking) {
      setFormData({
        customerName: booking.customerName,
        email: booking.email,
        phone: booking.phone || "",
        vehicleBrand: booking.vehicleBrand || "",
        vehicleModel: booking.vehicleModel || "",
        vehicleRegistration: booking.vehicleRegistration || "",
        date: booking.date,
        time: booking.time,
        status: booking.status,
      });
    }
  }, [booking]);

  const handleSave = async () => {
    if (!booking) return;
    setSaving(true);
    try {
      await onSave(booking.id, formData);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const selectedDate = formData.date ? new Date(formData.date) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Redigera bokning</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Customer info */}
          <div className="space-y-2">
            <Label htmlFor="customerName">Kundnamn</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-post</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          {/* Vehicle info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleBrand">Bilmärke</Label>
              <Input
                id="vehicleBrand"
                value={formData.vehicleBrand}
                onChange={(e) => setFormData({ ...formData, vehicleBrand: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicleModel">Modell</Label>
              <Input
                id="vehicleModel"
                value={formData.vehicleModel}
                onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vehicleRegistration">Registreringsnummer</Label>
            <Input
              id="vehicleRegistration"
              value={formData.vehicleRegistration}
              onChange={(e) => setFormData({ ...formData, vehicleRegistration: e.target.value.toUpperCase() })}
            />
          </div>

          {/* Date and time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Datum</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate
                      ? format(selectedDate, "d MMM yyyy", { locale: sv })
                      : "Välj datum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, date: format(date, "yyyy-MM-dd") });
                        setDatePickerOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Tid</Label>
              <Select
                value={formData.time}
                onValueChange={(value) => setFormData({ ...formData, time: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Välj tid" />
                </SelectTrigger>
                <SelectContent>
                  {/* Include the booked time if it's not in ALL_TIMES */}
                  {formData.time && !ALL_TIMES.includes(formData.time) && (
                    <SelectItem key={formData.time} value={formData.time}>
                      {formData.time}
                    </SelectItem>
                  )}
                  {ALL_TIMES.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'pending' | 'completed' | 'cancelled' | 'paid') => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Bokad</SelectItem>
                <SelectItem value="paid">Betald</SelectItem>
                <SelectItem value="completed">Slutförd</SelectItem>
                <SelectItem value="cancelled">Avbokad</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Sparar..." : "Spara ändringar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
