import { ChevronLeft, ChevronRight } from "lucide-react";
import type * as React from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-1", className)}
      classNames={{
        root: "rdp text-foreground",
        months: "flex flex-col gap-4",
        month: "space-y-4",
        month_caption: "flex h-10 items-center justify-center",
        caption_label: "text-sm font-bold",
        nav: "absolute left-3 right-3 top-3 flex items-center justify-between",
        button_previous:
          "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        button_next:
          "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
        month_grid: "w-full border-collapse",
        weekdays: "grid grid-cols-7",
        weekday: "h-8 text-center text-xs font-semibold text-muted-foreground",
        week: "grid grid-cols-7",
        day: "h-10 w-10 text-center text-sm",
        day_button:
          "h-10 w-10 rounded-md text-sm font-semibold transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected: "[&_.rdp-day_button]:bg-primary [&_.rdp-day_button]:text-primary-foreground",
        today: "[&_.rdp-day_button]:border [&_.rdp-day_button]:border-primary",
        outside: "text-muted-foreground opacity-45",
        disabled: "text-muted-foreground opacity-35",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
