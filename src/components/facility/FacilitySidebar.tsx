import { Clock, Users, TrendingUp, Banknote } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Facility } from "@/lib/facilityApi";

interface FacilitySidebarProps {
  facility: Facility;
  stats: {
    todayCount: number;
    weekCount: number;
    monthCount: number;
    totalCount: number;
    todayRevenue: number;
    weekRevenue: number;
    monthRevenue: number;
    totalRevenue: number;
    pendingRevenue: number;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const FacilitySidebar = ({ facility, stats }: FacilitySidebarProps) => {
  return (
    <div className="space-y-4">
      {/* Revenue Stats */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Banknote className="h-4 w-4 text-primary" />
            Intäkter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Idag</span>
            <span className="font-bold text-lg text-primary">
              {formatCurrency(stats.todayRevenue)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Denna vecka</span>
            <span className="font-bold text-lg">
              {formatCurrency(stats.weekRevenue)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Denna månad</span>
            <span className="font-bold text-lg">
              {formatCurrency(stats.monthRevenue)}
            </span>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Totalt (betalt)</span>
              <span className="font-bold text-lg text-green-600 dark:text-green-400">
                {formatCurrency(stats.totalRevenue)}
              </span>
            </div>
          </div>
          {stats.pendingRevenue > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Väntande betalning</span>
              <span className="font-medium text-amber-600 dark:text-amber-400">
                {formatCurrency(stats.pendingRevenue)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Bokningar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Idag</span>
            <span className="font-bold text-lg">{stats.todayCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Denna vecka</span>
            <span className="font-bold text-lg">{stats.weekCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Denna månad</span>
            <span className="font-bold text-lg">{stats.monthCount}</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-muted-foreground">Totalt</span>
            <span className="font-bold text-lg">{stats.totalCount}</span>
          </div>
        </CardContent>
      </Card>

      {/* Opening Hours */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Öppettider
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Vardagar</span>
            <span className="font-medium">{facility.openingHoursWeekdays}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Lördag</span>
            <span className="font-medium">{facility.openingHoursSaturday}</span>
          </div>
          {facility.openingHoursSunday && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Söndag</span>
              <span className="font-medium">{facility.openingHoursSunday}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Capacity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Kapacitet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Max per timme</span>
            <span className="font-bold text-lg">{facility.capacity}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
