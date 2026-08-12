import { format } from "date-fns";
import { sv } from "date-fns/locale";
import { MapPin, Calendar, Clock, Car, Sparkles, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { type Facility } from "@/lib/facilityApi";
import {
  BookingFormData,
  SERVICES,
  ADDONS,
  EXTRAS,
  VEHICLE_SIZES,
} from "./types";

interface BookingSummaryProps {
  formData: BookingFormData;
  facility: Facility | undefined;
  totalPrice: number;
  className?: string;
}

export function BookingSummary({ formData, facility, totalPrice, className }: BookingSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const service = SERVICES.find(s => s.id === formData.serviceType);
  const vehicleSizeOption = VEHICLE_SIZES.find(s => s.id === formData.vehicleSize);

  const selectedAddonsList = formData.selectedAddons
    .map(id => ADDONS.find(a => a.id === id))
    .filter(Boolean);

  const selectedExtrasList = formData.selectedExtras
    .map(id => EXTRAS.find(e => e.id === id))
    .filter(Boolean);

  const hasOnRequest = selectedExtrasList.some(e => e?.price === "on-request");

  // Check if we have any data to show
  const hasData = facility || formData.date || formData.time || service;

  if (!hasData) {
    return null;
  }

  return (
    <>
      {/* Desktop - always visible sticky panel */}
      <div className={cn("hidden lg:block", className)}>
        <div className="sticky top-4 bg-card border rounded-lg p-5 shadow-sm">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Din bokning
          </h3>

          <div className="space-y-4 text-sm">
            {facility && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{facility.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {facility.streetAddress}, {facility.city}
                  </p>
                </div>
              </div>
            )}

            {formData.date && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{format(formData.date, "EEEE d MMMM", { locale: sv })}</span>
              </div>
            )}

            {formData.time && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Kl. {formData.time}</span>
              </div>
            )}

            {service && (
              <div className="pt-3 border-t">
                <p className="font-medium">{service.name}</p>
                <p className="text-muted-foreground text-xs">{service.duration} min • {service.price} kr</p>
              </div>
            )}

            {vehicleSizeOption && (
              <div className="flex items-center gap-3">
                <Car className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{vehicleSizeOption.name}</span>
                {vehicleSizeOption.percentage > 0 && (
                  <span className="text-xs text-muted-foreground">(+{vehicleSizeOption.percentage}%)</span>
                )}
              </div>
            )}

            {selectedAddonsList.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Tillval:</p>
                <ul className="space-y-1">
                  {selectedAddonsList.map(addon => (
                    <li key={addon!.id} className="flex justify-between text-xs">
                      <span>{addon!.name}</span>
                      <span className="text-muted-foreground">+{addon!.price} kr</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedExtrasList.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-2">Extras:</p>
                <ul className="space-y-1">
                  {selectedExtrasList.map(extra => (
                    <li key={extra!.id} className="flex justify-between text-xs">
                      <span>{extra!.name}</span>
                      <span className="text-muted-foreground">
                        {extra!.price === "on-request"
                          ? "På begäran"
                          : extra!.percentage
                            ? `+${extra!.percentage}%`
                            : `+${extra!.price} kr`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {service && (
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Totalt</span>
                  <span className="text-xl font-bold text-primary">{totalPrice} kr</span>
                </div>
                {hasOnRequest && (
                  <p className="text-xs text-muted-foreground mt-1">
                    * Slutligt pris kan variera
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile - collapsible bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg z-50">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-medium">Din bokning</span>
          </div>
          <div className="flex items-center gap-3">
            {service && (
              <span className="text-lg font-bold text-primary">{totalPrice} kr</span>
            )}
            <ChevronDown className={cn(
              "w-5 h-5 transition-transform",
              isExpanded && "rotate-180"
            )} />
          </div>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t space-y-3 text-sm max-h-[50vh] overflow-y-auto">
            {facility && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">{facility.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {facility.streetAddress}, {facility.city}
                  </p>
                </div>
              </div>
            )}

            {formData.date && (
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{format(formData.date, "EEEE d MMMM", { locale: sv })}</span>
              </div>
            )}

            {formData.time && (
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>Kl. {formData.time}</span>
              </div>
            )}

            {service && (
              <div className="flex items-center justify-between pt-2 border-t">
                <span>{service.name}</span>
                <span>{service.price} kr</span>
              </div>
            )}

            {vehicleSizeOption && (
              <div className="flex items-center gap-3">
                <Car className="w-4 h-4 text-muted-foreground shrink-0" />
                <span>{vehicleSizeOption.name}</span>
              </div>
            )}

            {selectedAddonsList.length > 0 && selectedAddonsList.map(addon => (
              <div key={addon!.id} className="flex justify-between text-xs text-muted-foreground">
                <span>+ {addon!.name}</span>
                <span>{addon!.price} kr</span>
              </div>
            ))}

            {selectedExtrasList.length > 0 && selectedExtrasList.map(extra => (
              <div key={extra!.id} className="flex justify-between text-xs text-muted-foreground">
                <span>+ {extra!.name}</span>
                <span>
                  {extra!.price === "on-request"
                    ? "På begäran"
                    : extra!.percentage
                      ? `+${extra!.percentage}%`
                      : `${extra!.price} kr`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
