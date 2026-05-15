import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        caption: "flex items-start gap-4 px-2 pb-2 text-sm font-semibold",
        caption_label: "text-sm font-semibold",
        // caption_dropdowns: "flex flex-row items-center gap-3 flex-wrap",
        caption_dropdowns:
          "flex flex-row items-center gap-3 text-sm font-semibold",
        dropdown_month: "relative min-w-[120px] flex-1 max-w-[150px]",
        dropdown_year: "relative min-w-[120px] flex-1 max-w-[130px]",
        dropdown: "absolute inset-0 opacity-0 w-full h-full",
        dropdown_icon: "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground",
        vhidden: "sr-only",
        nav: "flex items-center gap-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100"
        ),
        nav_button_previous: "",
        nav_button_next: "",
        table: "w-full border-separate border-spacing-1",
        head_row: "grid grid-cols-7 gap-1",
        head_cell: "text-muted-foreground rounded-xl py-1 text-center text-[0.72rem] font-medium uppercase",
        row: "grid grid-cols-7 gap-1 mt-1",
        cell: "aspect-square rounded-xl overflow-hidden",
        day: cn(buttonVariants({ variant: "ghost" }), "h-full w-full p-0 rounded-xl text-sm font-normal"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "border border-muted-foreground text-muted-foreground",
        day_outside: "text-muted-foreground opacity-50",
        day_disabled: "text-muted-foreground opacity-40",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
