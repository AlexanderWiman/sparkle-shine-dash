import { MapPin, Phone, Mail, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import type { Facility } from "@/lib/facilityApi";
import type { ReactNode } from "react";

interface FacilityHeaderProps {
  facility: Facility;
  nextBookingCountdown?: string | null;
  actions?: ReactNode;
}

export const FacilityHeader = ({ facility, nextBookingCountdown, actions }: FacilityHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-card border-b">
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl md:text-3xl font-bold">{facility.name}</h1>
              <Badge variant={facility.isActive ? "default" : "secondary"}>
                {facility.isActive ? "Aktiv" : "Inaktiv"}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {facility.streetAddress}, {facility.postalCode} {facility.city}
              </span>
              {facility.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-4 w-4" />
                  {facility.phone}
                </span>
              )}
              {facility.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {facility.email}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {nextBookingCountdown && (
              <Badge variant="outline" className="text-sm py-1.5 px-3">
                Nästa bokning om {nextBookingCountdown}
              </Badge>
            )}
            {actions}
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/facility/${facility.id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Redigera
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
