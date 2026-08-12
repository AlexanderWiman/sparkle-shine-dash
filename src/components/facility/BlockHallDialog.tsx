import { useState } from "react";
import { format, addDays } from "date-fns";
import { sv } from "date-fns/locale";
import { CalendarIcon, Ban, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { createBooking } from "@/lib/bookingApi";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BlockHallDialogProps {
  facilityLocation: string;
  facilityCapacity?: number;
  onBlockCreated?: () => void;
}

const TIME_SLOTS = [
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

export const BlockHallDialog = ({
  facilityLocation,
  facilityCapacity = 2,
  onBlockCreated,
}: BlockHallDialogProps) => {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [reason, setReason] = useState("Personalbrist");
  const [hallsToClose, setHallsToClose] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const handleBlock = async () => {
    if (!date) {
      toast.error("Välj ett datum");
      return;
    }

    const startIndex = TIME_SLOTS.indexOf(startTime);
    const endIndex = TIME_SLOTS.indexOf(endTime);

    if (startIndex > endIndex) {
      toast.error("Starttiden måste vara före sluttiden");
      return;
    }

    setIsLoading(true);

    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const timesToBlock = TIME_SLOTS.slice(startIndex, endIndex + 1);

      // Create blind bookings sequentially to avoid backend race conditions
      // Create hallsToClose bookings per time slot
      let successCount = 0;
      const totalBookings = timesToBlock.length * hallsToClose;
      
      for (const time of timesToBlock) {
        for (let i = 0; i < hallsToClose; i++) {
          try {
            await createBooking({
              customerName: "HALL STÄNGD",
              email: "blocked@system.internal",
              phone: "-",
              vehicleBrand: "-",
              vehicleModel: "-",
              vehicleRegistration: "BLOCKED",
              serviceId: "block",
              serviceName: reason || "Hall stängd",
              servicePrice: 0,
              totalPrice: 0,
              date: dateStr,
              time,
              location: facilityLocation,
              status: "paid",
            });
            successCount++;
            // Small delay between requests to avoid overwhelming the backend
            await new Promise((resolve) => setTimeout(resolve, 300));
          } catch (err) {
            console.error(`Failed to block time ${time}:`, err);
          }
        }
      }

      if (successCount > 0) {
        toast.success(
          `${hallsToClose} hall${hallsToClose > 1 ? "ar" : ""} stängd${hallsToClose > 1 ? "a" : ""} ${format(date, "d MMMM", { locale: sv })} kl ${startTime}-${endTime} (${successCount}/${totalBookings} bokningar)`
        );
        setOpen(false);
        onBlockCreated?.();
      } else {
        toast.error("Kunde inte stänga hallen");
      }
    } catch (error) {
      console.error("Error blocking hall:", error);
      toast.error("Kunde inte stänga hallen");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickBlock = async (type: "rest-of-day" | "full-day") => {
    const now = new Date();
    const currentHour = now.getHours();
    
    if (type === "full-day") {
      setStartTime("09:00");
      setEndTime("17:00");
    } else {
      // Find next available time slot
      const nextSlotIndex = TIME_SLOTS.findIndex((slot) => {
        const [hours] = slot.split(":").map(Number);
        return hours > currentHour;
      });
      
      if (nextSlotIndex === -1) {
        toast.error("Inga fler tider att spärra idag");
        return;
      }
      
      setStartTime(TIME_SLOTS[nextSlotIndex]);
      setEndTime("17:00");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Ban className="h-4 w-4" />
          <span className="hidden sm:inline">Stäng hall</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ban className="h-5 w-5 text-destructive" />
            Stäng hall tillfälligt
          </DialogTitle>
          <DialogDescription>
            Skapa en tillfällig spärr för att minska kapaciteten. Kunder kommer
            se färre tillgängliga tider.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Quick actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleQuickBlock("rest-of-day")}
            >
              Resten av dagen
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleQuickBlock("full-day")}
            >
              Hela dagen
            </Button>
          </div>

          {/* Date picker */}
          <div className="grid gap-2">
            <Label>Datum</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? (
                    format(date, "d MMMM yyyy", { locale: sv })
                  ) : (
                    "Välj datum"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Från</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Till</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Number of halls to close */}
          {facilityCapacity > 1 && (
            <div className="grid gap-2">
              <Label>Antal hallar att stänga</Label>
              <Select 
                value={String(hallsToClose)} 
                onValueChange={(v) => setHallsToClose(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: facilityCapacity }, (_, i) => i + 1).map((num) => (
                    <SelectItem key={num} value={String(num)}>
                      {num} hall{num > 1 ? "ar" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Anläggningen har {facilityCapacity} hallar totalt
              </p>
            </div>
          )}

          {/* Reason */}
          <div className="grid gap-2">
            <Label>Anledning (visas i admin)</Label>
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="T.ex. Personalbrist, Underhåll"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Avbryt
          </Button>
          <Button
            variant="destructive"
            onClick={handleBlock}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Stäng hall
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
