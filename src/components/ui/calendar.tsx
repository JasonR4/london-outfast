import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface CalendarProps {
  className?: string;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  mode?: "single" | "multiple" | "range";
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
}

function Calendar({
  className,
  selected,
  onSelect,
  mode = "single",
  disabled,
  initialFocus = false,
  ...props
}: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const handleDateClick = (day: number) => {
    const date = new Date(year, month, day);
    if (disabled && disabled(date)) return;
    onSelect?.(date);
  };
  
  const isSelected = (day: number) => {
    if (!selected) return false;
    const date = new Date(year, month, day);
    return (
      selected.getDate() === day &&
      selected.getMonth() === month &&
      selected.getFullYear() === year
    );
  };
  
  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };
  
  const isDisabled = (day: number) => {
    if (!disabled) return false;
    const date = new Date(year, month, day);
    return disabled(date);
  };

  return (
    <div className={cn("p-3 pointer-events-auto", className)} {...props}>
      <div className="flex justify-center pt-1 relative items-center mb-4">
        <Button
          variant="outline"
          size="sm"
          className="absolute left-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          onClick={goToPreviousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-sm font-medium">
          {monthNames[month]} {year}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="absolute right-1 h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          onClick={goToNextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="w-full border-collapse space-y-1">
        <div className="flex">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] h-9 flex items-center justify-center"
            >
              {day}
            </div>
          ))}
        </div>
        
        {Array.from({ length: Math.ceil((daysInMonth + firstDayOfWeek) / 7) }).map((_, weekIndex) => (
          <div key={weekIndex} className="flex w-full mt-2">
            {Array.from({ length: 7 }).map((_, dayIndex) => {
              const dayNumber = weekIndex * 7 + dayIndex - firstDayOfWeek + 1;
              const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
              
              if (!isValidDay) {
                return <div key={dayIndex} className="h-9 w-9" />;
              }
              
              return (
                <button
                  key={dayIndex}
                  className={cn(
                    "h-9 w-9 p-0 font-normal text-center text-sm relative rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                    isSelected(dayNumber) && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                    isToday(dayNumber) && !isSelected(dayNumber) && "bg-accent text-accent-foreground",
                    isDisabled(dayNumber) && "text-muted-foreground opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => handleDateClick(dayNumber)}
                  disabled={isDisabled(dayNumber)}
                >
                  {dayNumber}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };