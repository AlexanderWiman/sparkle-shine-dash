import { Badge } from "@/components/ui/badge";

interface DayData {
  date: string;
  dayName: string;
  dayNumber: number;
  count: number;
  isToday: boolean;
}

interface WeekOverviewBarProps {
  weekDays: DayData[];
}

export const WeekOverviewBar = ({ weekDays }: WeekOverviewBarProps) => {
  return (
    <div className="flex items-center gap-1 md:gap-2 overflow-x-auto pb-2">
      {weekDays.map(({ date, dayName, dayNumber, count, isToday }) => (
        <div
          key={date}
          className={`flex flex-col items-center min-w-[48px] md:min-w-[56px] p-2 rounded-lg transition-all ${
            isToday
              ? "bg-primary text-primary-foreground"
              : count > 0
              ? "bg-muted"
              : "bg-muted/30 opacity-60"
          }`}
        >
          <span className="text-[10px] font-medium uppercase">{dayName}</span>
          <span className="text-xs">{dayNumber}</span>
          <Badge
            variant={isToday ? "secondary" : count > 0 ? "default" : "outline"}
            className={`mt-1 h-5 min-w-[20px] justify-center text-xs ${
              isToday ? "bg-primary-foreground text-primary" : ""
            }`}
          >
            {count}
          </Badge>
        </div>
      ))}
    </div>
  );
};
