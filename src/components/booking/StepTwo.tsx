import { type Facility } from "@/lib/facilityApi";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarIcon, Clock, Lock, ArrowLeft, AlertTriangle } from "lucide-react";
import { format, startOfToday } from "date-fns";
import { sv } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TimeSlot, SERVICES } from "./types";
import { getFacilityClosure, isFacilityClosedOnDate } from "@/lib/bookingClosures";

interface StepTwoProps {
  facilities: Facility[];
  selectedFacility: string;
  setSelectedFacility: (value: string) => void;
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  time: string;
  setTime: (time: string) => void;
  timeSlots: TimeSlot[];
  loadingTimes: boolean;
  capacity: number;
  isTimeSlotInPast: (time: string) => boolean;
  hasNoAvailableTimes: () => boolean;
  findNextAvailableDate: () => Promise<void>;
  searchingNextAvailable: boolean;
  getTimeSlotStatus: (slot: TimeSlot) => 'available' | 'partial' | 'full';
  getAffectedSlots: (startTime: string, serviceId: string) => string[];
  serviceType: string;
  serviceDuration: number;
  facilityCloseHour: number;
  onNext: () => void;
  onBack: () => void;
  canProceed: boolean;
}

export function StepTwo({
  facilities,
  selectedFacility,
  setSelectedFacility,
  date,
  setDate,
  time,
  setTime,
  timeSlots,
  loadingTimes,
  capacity,
  isTimeSlotInPast,
  hasNoAvailableTimes,
  findNextAvailableDate,
  searchingNextAvailable,
  getTimeSlotStatus,
  getAffectedSlots,
  serviceType,
  serviceDuration,
  facilityCloseHour,
  onNext,
  onBack,
  canProceed,
}: StepTwoProps) {
  const MINIMUM_LEAD_TIME_HOURS = 1;

  const facilityData = facilities.find((f) => f.id === selectedFacility);
  const closure = getFacilityClosure(facilityData);
  const isClosedDate = isFacilityClosedOnDate(facilityData, date);

  // Check if a time slot would cause overtime
  const wouldCauseOvertime = (slotTime: string): boolean => {
    if (!serviceDuration || !facilityCloseHour) return false;
    
    const [hours, minutes] = slotTime.split(':').map(Number);
    const slotMinutes = hours * 60 + minutes;
    const closeMinutes = facilityCloseHour * 60;
    const endMinutes = slotMinutes + serviceDuration;
    
    return endMinutes > closeMinutes;
  };

  // Filter time slots that would cause overtime
  const getFilteredTimeSlots = () => {
    if (isClosedDate) return [];
    return timeSlots.filter(slot => !wouldCauseOvertime(slot.time));
  };

  const filteredTimeSlots = getFilteredTimeSlots();
  const hasFilteredSlots = !isClosedDate && timeSlots.length > filteredTimeSlots.length;


  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Var & När</h2>
        <p className="text-muted-foreground">Välj anläggning och tid för din bokning</p>
      </div>

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

      {closure && (
        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 px-3 py-2.5 rounded-md">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{closure.message}</span>
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
              disabled={(d) =>
                d < startOfToday() || isFacilityClosedOnDate(facilityData, d)
              }
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>


      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Välj tid</Label>
          {serviceType && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-md">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {SERVICES.find(s => s.id === serviceType)?.duration} min tjänst
              </span>
            </div>
          )}
        </div>

        {hasFilteredSlots && date && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-md">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Vissa tider är dolda eftersom tjänsten ({serviceDuration} min) inte hinner bli klar innan stängning kl {facilityCloseHour}:00
            </span>
          </div>
        )}

        {loadingTimes ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Laddar lediga tider...</div>
          </div>
        ) : !date ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            Välj ett datum först
          </div>
        ) : isClosedDate ? (
          <div className="flex items-center justify-center py-8 text-center text-muted-foreground">
            {closure?.message ?? "Bokning är stängd för detta datum"}
          </div>
        ) : hasNoAvailableTimes() || filteredTimeSlots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="text-center">
              <p className="text-muted-foreground font-medium">
                {filteredTimeSlots.length === 0 && timeSlots.length > 0
                  ? "Inga tider passar för den valda tjänsten"
                  : timeSlots.length === 0
                    ? "Inga tider tillgängliga denna dag"
                    : "Alla tider är fullbokade eller har passerat"
                }
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {format(date!, "EEEE d MMMM", { locale: sv })}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={findNextAvailableDate}
              disabled={searchingNextAvailable}
              className="gap-2"
            >
              {searchingNextAvailable ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  Söker lediga tider...
                </>
              ) : (
                <>
                  <CalendarIcon className="w-4 h-4" />
                  Hitta närmaste lediga dag
                </>
              )}
            </Button>
          </div>

        ) : (
          <TooltipProvider>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {filteredTimeSlots.map((slot) => {
                const status = getTimeSlotStatus(slot);
                const isSelected = time === slot.time;
                const isFull = status === 'full';
                const isPast = isTimeSlotInPast(slot.time);
                const isDisabled = isFull || isPast;
                const affectedSlots = time && serviceType ? getAffectedSlots(time, serviceType) : [];
                const isAffectedBySelection = affectedSlots.includes(slot.time) && !isSelected;

                return (
                  <Tooltip key={slot.time}>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => !isDisabled && setTime(slot.time)}
                        disabled={isDisabled}
                        className={cn(
                          "h-14 transition-all relative",
                          isSelected && "ring-2 ring-primary ring-offset-2",
                          isAffectedBySelection && "bg-primary/10 border-primary/40",
                          isPast && "opacity-40 cursor-not-allowed bg-muted line-through",
                          !isPast && !isAffectedBySelection && status === 'available' && !isSelected && "border-timeAvailable text-timeAvailable hover:bg-timeAvailable/10",
                          !isPast && !isAffectedBySelection && status === 'partial' && !isSelected && "border-timePartial text-timePartial hover:bg-timePartial/10",
                          !isPast && isFull && "opacity-50 cursor-not-allowed border-timeFull text-timeFull"
                        )}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="font-medium">{slot.time}</span>
                          {isFull && (
                            <Lock className="w-3 h-3 absolute top-1 right-1" />
                          )}
                        </div>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isPast ? (
                        <p>Tiden har passerat (minst {MINIMUM_LEAD_TIME_HOURS}h förbokning)</p>
                      ) : isAffectedBySelection ? (
                        <div className="text-center">
                          <p className="font-medium">Blockeras av din bokning</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Ingår i din {SERVICES.find(s => s.id === serviceType)?.duration} min tjänst
                          </p>
                        </div>
                      ) : status === 'available' ? (
                        <p>Tillgänglig</p>
                      ) : status === 'partial' ? (
                        <p>Begränsad tillgänglighet</p>
                      ) : isFull ? (
                        <p>Denna tid är fullbokad</p>
                      ) : null}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          </TooltipProvider>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Tillbaka
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={!canProceed || isClosedDate}
          className="min-w-32"
        >
          Nästa
        </Button>
      </div>
    </div>
  );
}
