import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn, formatDate, parseIsoDate, toIsoDate } from "@/lib/utils";

type DatePickerProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function DatePicker({ id, value, onChange, placeholder = "Selecionar data", className }: DatePickerProps) {
  const selected = value ? parseIsoDate(value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          className={cn("w-full justify-start border-input bg-muted px-3 text-left font-semibold", !selected && "text-muted-foreground", className)}
        >
          <CalendarIcon className="h-5 w-5" />
          {selected ? formatDate(value) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(date) => {
            if (date) onChange(toIsoDate(date));
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
