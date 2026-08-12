import { useState, useMemo, useCallback } from "react";
import { format, addDays, isSameDay } from "date-fns";
import { sv } from "date-fns/locale";
import { 
  CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Ban, 
  Car, 
  Check,
  Loader2,
  Trash2,
  AlertTriangle,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { createBooking, deleteBooking } from "@/lib/bookingApi";
import { toast } from "sonner";

interface Booking {
  id: string;
  serviceName: string;
  date: string;
  time: string;
  customerName: string;
  vehicleRegistration: string;
  status: string;
}

interface CapacityScheduleViewProps {
  bookings: Booking[];
  facilityLocation: string;
  facilityCapacity: number;
  onDataChange: () => void;
}

const TIME_SLOTS = [
  "09:00", "09:30",
  "10:00", "10:30",
  "11:00", "11:30",
  "12:00", "12:30",
  "13:00", "13:30",
  "14:00", "14:30",
  "15:00", "15:30",
  "16:00", "16:30",
  "17:00", "17:30",
  "18:00",
];

interface SlotData {
  time: string;
  halls: HallSlot[];
  customerCount: number;
  blockedCount: number;
  freeCount: number;
}

interface HallSlot {
  hallIndex: number;
  status: "free" | "customer" | "blocked";
  booking?: Booking;
}

interface SlotSelection {
  time: string;
  hallIndex: number;
}

export const CapacityScheduleView = ({
  bookings,
  facilityLocation,
  facilityCapacity,
  onDataChange,
}: CapacityScheduleViewProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCreating, setIsCreating] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Booking | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Multi-select state
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<SlotSelection | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<SlotSelection[]>([]);
  const [isBlockingMultiple, setIsBlockingMultiple] = useState(false);
  
  // Multi-select for unblocking
  const [isSelectingBlocked, setIsSelectingBlocked] = useState(false);
  const [blockedSelectionStart, setBlockedSelectionStart] = useState<SlotSelection | null>(null);
  const [selectedBlockedSlots, setSelectedBlockedSlots] = useState<{slot: SlotSelection, booking: Booking}[]>([]);
  const [isUnblockingMultiple, setIsUnblockingMultiple] = useState(false);

  const dateStr = format(selectedDate, "yyyy-MM-dd");

  // Group bookings by time slot for selected date
  const scheduleData = useMemo(() => {
    const dayBookings = bookings.filter(
      (b) => b.date.split("T")[0] === dateStr
    );

    const slots: SlotData[] = TIME_SLOTS.map((time) => {
      const timeBookings = dayBookings.filter((b) => b.time === time);
      
      // Separate customer bookings from blocked bookings
      const customerBookings = timeBookings.filter(
        (b) => b.vehicleRegistration !== "BLOCKED"
      );
      const blockedBookings = timeBookings.filter(
        (b) => b.vehicleRegistration === "BLOCKED"
      );

      // Build hall slots
      const halls: HallSlot[] = [];
      
      for (let i = 0; i < facilityCapacity; i++) {
        if (i < customerBookings.length) {
          halls.push({
            hallIndex: i,
            status: "customer",
            booking: customerBookings[i],
          });
        } else if (i < customerBookings.length + blockedBookings.length) {
          const blockedIndex = i - customerBookings.length;
          halls.push({
            hallIndex: i,
            status: "blocked",
            booking: blockedBookings[blockedIndex],
          });
        } else {
          halls.push({
            hallIndex: i,
            status: "free",
          });
        }
      }

      return {
        time,
        halls,
        customerCount: customerBookings.length,
        blockedCount: blockedBookings.length,
        freeCount: facilityCapacity - customerBookings.length - blockedBookings.length,
      };
    });

    return slots;
  }, [bookings, dateStr, facilityCapacity]);

  // Calculate selection range between start and current hover
  const calculateSelectionRange = useCallback((start: SlotSelection, end: SlotSelection, targetStatus: "free" | "blocked"): SlotSelection[] => {
    const startTimeIndex = TIME_SLOTS.indexOf(start.time);
    const endTimeIndex = TIME_SLOTS.indexOf(end.time);
    const startHall = start.hallIndex;
    const endHall = end.hallIndex;
    
    const minTimeIndex = Math.min(startTimeIndex, endTimeIndex);
    const maxTimeIndex = Math.max(startTimeIndex, endTimeIndex);
    const minHall = Math.min(startHall, endHall);
    const maxHall = Math.max(startHall, endHall);
    
    const selection: SlotSelection[] = [];
    
    for (let t = minTimeIndex; t <= maxTimeIndex; t++) {
      for (let h = minHall; h <= maxHall; h++) {
        const time = TIME_SLOTS[t];
        const slotData = scheduleData.find(s => s.time === time);
        const hall = slotData?.halls.find(hall => hall.hallIndex === h);
        
        // Only include slots matching target status
        if (hall?.status === targetStatus) {
          selection.push({ time, hallIndex: h });
        }
      }
    }
    
    return selection;
  }, [scheduleData]);

  // Calculate blocked selection with booking data
  const calculateBlockedSelectionRange = useCallback((start: SlotSelection, end: SlotSelection): {slot: SlotSelection, booking: Booking}[] => {
    const startTimeIndex = TIME_SLOTS.indexOf(start.time);
    const endTimeIndex = TIME_SLOTS.indexOf(end.time);
    const startHall = start.hallIndex;
    const endHall = end.hallIndex;
    
    const minTimeIndex = Math.min(startTimeIndex, endTimeIndex);
    const maxTimeIndex = Math.max(startTimeIndex, endTimeIndex);
    const minHall = Math.min(startHall, endHall);
    const maxHall = Math.max(startHall, endHall);
    
    const selection: {slot: SlotSelection, booking: Booking}[] = [];
    
    for (let t = minTimeIndex; t <= maxTimeIndex; t++) {
      for (let h = minHall; h <= maxHall; h++) {
        const time = TIME_SLOTS[t];
        const slotData = scheduleData.find(s => s.time === time);
        const hall = slotData?.halls.find(hall => hall.hallIndex === h);
        
        if (hall?.status === "blocked" && hall.booking) {
          selection.push({ slot: { time, hallIndex: h }, booking: hall.booking });
        }
      }
    }
    
    return selection;
  }, [scheduleData]);

  const handleMouseDown = (time: string, hallIndex: number, status: string, booking?: Booking) => {
    if (status === "customer") return;
    
    if (status === "free") {
      setIsSelecting(true);
      setSelectionStart({ time, hallIndex });
      setSelectedSlots([{ time, hallIndex }]);
    } else if (status === "blocked" && booking) {
      setIsSelectingBlocked(true);
      setBlockedSelectionStart({ time, hallIndex });
      setSelectedBlockedSlots([{ slot: { time, hallIndex }, booking }]);
    }
  };

  const handleMouseEnter = (time: string, hallIndex: number, status: string, booking?: Booking) => {
    if (isSelecting && selectionStart) {
      const newSelection = calculateSelectionRange(selectionStart, { time, hallIndex }, "free");
      setSelectedSlots(newSelection);
    }
    
    if (isSelectingBlocked && blockedSelectionStart) {
      const newSelection = calculateBlockedSelectionRange(blockedSelectionStart, { time, hallIndex });
      setSelectedBlockedSlots(newSelection);
    }
  };

  const handleMouseUp = async () => {
    if (isSelecting) {
      setIsSelecting(false);
      setSelectionStart(null);
      
      // If only one slot selected, block immediately
      if (selectedSlots.length === 1) {
        const slot = selectedSlots[0];
        setSelectedSlots([]);
        await handleBlockSlot(slot.time, slot.hallIndex);
      }
      // Multiple slots - keep selection visible for confirmation
    }
    
    if (isSelectingBlocked) {
      setIsSelectingBlocked(false);
      setBlockedSelectionStart(null);
      // Keep selection for confirmation (even for single slot to show action bar)
    }
  };

  const handleBlockSlot = async (time: string, hallIndex: number) => {
    setIsCreating(`${time}-${hallIndex}`);
    
    try {
      await createBooking({
        customerName: "HALL STÄNGD",
        email: "blocked@system.internal",
        phone: "-",
        vehicleBrand: "-",
        vehicleModel: "-",
        vehicleRegistration: "BLOCKED",
        serviceId: "block",
        serviceName: "Hall stängd",
        servicePrice: 0,
        totalPrice: 0,
        date: dateStr,
        time,
        location: facilityLocation,
        status: "paid",
      });
      
      toast.success(`Hall ${hallIndex + 1} stängd kl ${time}`);
      onDataChange();
    } catch (error) {
      console.error("Error blocking slot:", error);
      toast.error("Kunde inte stänga hallen");
    } finally {
      setIsCreating(null);
    }
  };

  const handleBlockMultipleSlots = async () => {
    if (selectedSlots.length === 0) return;
    
    setIsBlockingMultiple(true);
    
    try {
      // Block all selected slots
      await Promise.all(
        selectedSlots.map(slot =>
          createBooking({
            customerName: "HALL STÄNGD",
            email: "blocked@system.internal",
            phone: "-",
            vehicleBrand: "-",
            vehicleModel: "-",
            vehicleRegistration: "BLOCKED",
            serviceId: "block",
            serviceName: "Hall stängd",
            servicePrice: 0,
            totalPrice: 0,
            date: dateStr,
            time: slot.time,
            location: facilityLocation,
            status: "paid",
          })
        )
      );
      
      toast.success(`${selectedSlots.length} tidsluckor stängda`);
      onDataChange();
    } catch (error) {
      console.error("Error blocking slots:", error);
      toast.error("Kunde inte stänga alla tidsluckor");
    } finally {
      setIsBlockingMultiple(false);
      setSelectedSlots([]);
    }
  };

  const clearSelection = () => {
    setSelectedSlots([]);
    setIsSelecting(false);
    setSelectionStart(null);
  };

  const clearBlockedSelection = () => {
    setSelectedBlockedSlots([]);
    setIsSelectingBlocked(false);
    setBlockedSelectionStart(null);
  };

  const handleUnblockSlot = async () => {
    if (!deleteConfirm) return;
    
    setIsDeleting(true);
    
    try {
      await deleteBooking(deleteConfirm.id);
      toast.success("Spärr borttagen");
      onDataChange();
    } catch (error) {
      console.error("Error unblocking slot:", error);
      toast.error("Kunde inte ta bort spärren");
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  const handleUnblockMultipleSlots = async () => {
    if (selectedBlockedSlots.length === 0) return;
    
    setIsUnblockingMultiple(true);
    
    try {
      await Promise.all(
        selectedBlockedSlots.map(item => deleteBooking(item.booking.id))
      );
      
      toast.success(`${selectedBlockedSlots.length} spärrar borttagna`);
      onDataChange();
    } catch (error) {
      console.error("Error unblocking slots:", error);
      toast.error("Kunde inte ta bort alla spärrar");
    } finally {
      setIsUnblockingMultiple(false);
      setSelectedBlockedSlots([]);
    }
  };

  const goToDate = (days: number) => {
    setSelectedDate((prev) => addDays(prev, days));
    clearSelection();
    clearBlockedSelection();
  };

  const isSlotSelected = (time: string, hallIndex: number) => {
    return selectedSlots.some(s => s.time === time && s.hallIndex === hallIndex);
  };

  const isBlockedSlotSelected = (time: string, hallIndex: number) => {
    return selectedBlockedSlots.some(s => s.slot.time === time && s.slot.hallIndex === hallIndex);
  };

  const isToday = isSameDay(selectedDate, new Date());
  const isPast = selectedDate < new Date(new Date().setHours(0, 0, 0, 0));

  return (
    <div 
      className="bg-card rounded-lg border"
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (isSelecting) {
          setIsSelecting(false);
          setSelectionStart(null);
        }
        if (isSelectingBlocked) {
          setIsSelectingBlocked(false);
          setBlockedSelectionStart(null);
        }
      }}
    >
      {/* Header with date navigation */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToDate(-1)}
            disabled={isPast}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="min-w-[200px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "EEEE d MMMM", { locale: sv })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => {
                  if (d) {
                    setSelectedDate(d);
                    clearSelection();
                    clearBlockedSelection();
                  }
                }}
                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToDate(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          {!isToday && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedDate(new Date());
                clearSelection();
                clearBlockedSelection();
              }}
            >
              Idag
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500" />
            <span>Ledig</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-primary/20 border border-primary" />
            <span>Bokad</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-destructive/20 border border-destructive" />
            <span>Stängd</span>
          </div>
        </div>
      </div>

      {/* Multi-select action bar for blocking */}
      {selectedSlots.length > 1 && (
        <div className="flex items-center justify-between p-3 bg-primary/5 border-b">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{selectedSlots.length} tidsluckor markerade</span>
            <span className="text-muted-foreground">
              (dra för att markera fler)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              disabled={isBlockingMultiple}
            >
              <X className="h-4 w-4 mr-1" />
              Avbryt
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBlockMultipleSlots}
              disabled={isBlockingMultiple}
            >
              {isBlockingMultiple ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Stänger...
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 mr-1" />
                  Stäng {selectedSlots.length} tidsluckor
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Multi-select action bar for unblocking */}
      {selectedBlockedSlots.length >= 1 && (
        <div className="flex items-center justify-between p-3 bg-destructive/5 border-b">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{selectedBlockedSlots.length} spärr{selectedBlockedSlots.length > 1 ? 'ar' : ''} markerade</span>
            <span className="text-muted-foreground">
              (dra för att markera fler)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearBlockedSelection}
              disabled={isUnblockingMultiple}
            >
              <X className="h-4 w-4 mr-1" />
              Avbryt
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnblockMultipleSlots}
              disabled={isUnblockingMultiple}
              className="border-destructive text-destructive hover:bg-destructive/10"
            >
              {isUnblockingMultiple ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Tar bort...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-1" />
                  Ta bort {selectedBlockedSlots.length} spärr{selectedBlockedSlots.length > 1 ? 'ar' : ''}
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Schedule grid */}
      <div className="p-4 select-none">
        <TooltipProvider delayDuration={200}>
          {/* Header row */}
          <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: `80px repeat(${facilityCapacity}, 1fr)` }}>
            <div className="text-sm font-medium text-muted-foreground">Tid</div>
            {Array.from({ length: facilityCapacity }, (_, i) => (
              <div key={i} className="text-sm font-medium text-center">
                Hall {i + 1}
              </div>
            ))}
          </div>

          {/* Time slots */}
          {scheduleData.map((slot) => (
            <div 
              key={slot.time} 
              className="grid gap-2 mb-2" 
              style={{ gridTemplateColumns: `80px repeat(${facilityCapacity}, 1fr)` }}
            >
              <div className="flex items-center text-sm font-medium">
                {slot.time}
              </div>
              
              {slot.halls.map((hall) => {
                const isCreatingThis = isCreating === `${slot.time}-${hall.hallIndex}`;
                const isSelected = isSlotSelected(slot.time, hall.hallIndex);
                
                if (hall.status === "customer") {
                  return (
                    <Tooltip key={hall.hallIndex}>
                      <TooltipTrigger asChild>
                        <div className="h-12 rounded-lg bg-primary/10 border-2 border-primary flex items-center justify-center gap-2 px-2 cursor-default">
                          <Car className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-xs font-medium truncate">
                            {hall.booking?.vehicleRegistration}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px]">
                        <p className="font-medium">{hall.booking?.customerName}</p>
                        <p className="text-xs text-muted-foreground">{hall.booking?.serviceName}</p>
                        <p className="text-xs">{hall.booking?.vehicleRegistration}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                
                if (hall.status === "blocked") {
                  const isBlockedSelected = isBlockedSlotSelected(slot.time, hall.hallIndex);
                  return (
                    <Tooltip key={hall.hallIndex}>
                      <TooltipTrigger asChild>
                        <button
                          onMouseDown={() => handleMouseDown(slot.time, hall.hallIndex, hall.status, hall.booking)}
                          onMouseEnter={() => handleMouseEnter(slot.time, hall.hallIndex, hall.status, hall.booking)}
                          className={cn(
                            "h-12 rounded-lg border-2 flex items-center justify-center gap-2 px-2 transition-colors group",
                            isBlockedSelected
                              ? "bg-amber-500/20 border-amber-500"
                              : "bg-destructive/10 border-destructive hover:bg-destructive/20"
                          )}
                        >
                          {isBlockedSelected ? (
                            <>
                              <Trash2 className="h-4 w-4 text-amber-600 shrink-0" />
                              <span className="text-xs font-medium text-amber-600 truncate">
                                Markerad
                              </span>
                            </>
                          ) : (
                            <>
                              <Ban className="h-4 w-4 text-destructive shrink-0" />
                              <span className="text-xs font-medium text-destructive truncate">
                                {hall.booking?.serviceName}
                              </span>
                              <Trash2 className="h-3 w-3 text-destructive opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                            </>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p className="font-medium">Hall stängd</p>
                        <p className="text-xs text-muted-foreground">{hall.booking?.serviceName}</p>
                        <p className="text-xs">{isSelectingBlocked ? "Släpp för att bekräfta" : "Klicka eller dra för att ta bort"}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                }
                
                // Free slot
                return (
                  <Tooltip key={hall.hallIndex}>
                    <TooltipTrigger asChild>
                      <button
                        onMouseDown={() => handleMouseDown(slot.time, hall.hallIndex, hall.status)}
                        onMouseEnter={() => handleMouseEnter(slot.time, hall.hallIndex, hall.status)}
                        disabled={isCreatingThis || isPast}
                        className={cn(
                          "h-12 rounded-lg border-2 flex items-center justify-center transition-all",
                          isPast 
                            ? "border-muted bg-muted/50 cursor-not-allowed border-dashed"
                            : isSelected
                              ? "border-amber-500 bg-amber-500/20 border-solid"
                              : "border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500 border-dashed"
                        )}
                      >
                        {isCreatingThis ? (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        ) : isSelected ? (
                          <Ban className="h-4 w-4 text-amber-600" />
                        ) : (
                          <Check className="h-4 w-4 text-emerald-600" />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {isPast ? (
                        <p>Kan inte ändra tidigare datum</p>
                      ) : isSelecting ? (
                        <p>Släpp för att bekräfta</p>
                      ) : (
                        <p>Klicka eller dra för att stänga</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          ))}
        </TooltipProvider>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Ta bort spärr
            </AlertDialogTitle>
            <AlertDialogDescription>
              Vill du ta bort spärren för kl {deleteConfirm?.time}? 
              Tidssloten blir tillgänglig för bokning igen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Avbryt</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleUnblockSlot}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ta bort spärr
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
