import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Car } from "lucide-react";
import { SuvIcon } from "@/components/icons/SuvIcon";
import { cn } from "@/lib/utils";
import {
  ServiceType,
  VehicleSize,
  SERVICES,
  ADDONS,
  VEHICLE_SIZES,
  EXTRAS,
} from "./types";

interface StepOneProps {
  serviceType: ServiceType | "";
  setServiceType: (value: ServiceType | "") => void;
  vehicleSize: VehicleSize | "";
  setVehicleSize: (value: VehicleSize) => void;
  selectedAddons: string[];
  toggleAddon: (id: string) => void;
  selectedExtras: string[];
  toggleExtra: (id: string) => void;
  totalPrice: number;
  onNext: () => void;
  canProceed: boolean;
}

export function StepOne({
  serviceType,
  setServiceType,
  vehicleSize,
  setVehicleSize,
  selectedAddons,
  toggleAddon,
  selectedExtras,
  toggleExtra,
  totalPrice,
  onNext,
  canProceed,
}: StepOneProps) {
  const getAvailableAddons = () => {
    if (!serviceType) return [];
    return ADDONS.filter(addon => addon.availableFor.includes(serviceType as ServiceType));
  };

  const getAvailableExtras = () => {
    if (!serviceType) return [];
    return EXTRAS.filter(extra => extra.availableFor.includes(serviceType as ServiceType));
  };

  const hasOnRequest = selectedExtras.some(id => EXTRAS.find(e => e.id === id)?.price === "on-request");
  const selectedService = SERVICES.find(s => s.id === serviceType);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Välj tjänst</h2>
        <p className="text-muted-foreground">Anpassa din biltvätt</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="service">Tjänst *</Label>
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
        {selectedService?.description && (
          <div className="bg-muted/50 rounded-lg p-3 border">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Ingår: </span>
              {selectedService.description}
            </p>
          </div>
        )}
      </div>

      {serviceType && (
        <div className="space-y-3">
          <Label>Bilstorlek *</Label>
          <div className="grid grid-cols-2 gap-3">
            {VEHICLE_SIZES.map(size => {
              const isSelected = vehicleSize === size.id;
              return (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setVehicleSize(size.id as VehicleSize)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all",
                    isSelected
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:border-primary/50"
                  )}
                >
                  {size.id === "small" ? (
                    <Car className={cn("w-10 h-10", isSelected ? "text-primary" : "text-muted-foreground")} />
                  ) : (
                    <SuvIcon className={isSelected ? "text-primary" : "text-muted-foreground"} />
                  )}
                  <span className={cn("text-sm font-medium", isSelected ? "text-primary" : "text-foreground")}>
                    {size.name}
                  </span>
                  {size.percentage > 0 && (
                    <span className="text-xs text-muted-foreground">(+{size.percentage}%)</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
            <div>
              <span className="text-lg font-semibold">Totalt pris:</span>
              {selectedService && (
                <p className="text-sm text-muted-foreground">
                  Tjänsten tar ca {selectedService.duration} min
                </p>
              )}
            </div>
            <span className="text-2xl font-bold text-primary">
              {totalPrice} kr
            </span>
          </div>
          {hasOnRequest && (
            <p className="text-sm text-muted-foreground mt-2">
              * Innehåller tjänster med pris på begäran - vi kontaktar dig för slutligt pris
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="min-w-32"
        >
          Nästa
        </Button>
      </div>
    </div>
  );
}
