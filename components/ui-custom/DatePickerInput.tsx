"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import "react-day-picker/style.css";

interface DatePickerInputProps {
  value: string;
  onChange: (value: string) => void;
  /** Disable dates before this date (YYYY-MM-DD) */
  min?: string;
  /** Disable dates after this date (YYYY-MM-DD) */
  max?: string;
  placeholder?: string;
  disabled?: boolean;
  /** Show year+month dropdowns for easy navigation (e.g. for birth dates) */
  showDropdownNav?: boolean;
  /** Earliest selectable year when showDropdownNav is true */
  fromYear?: number;
  /** Latest selectable year when showDropdownNav is true */
  toYear?: number;
}

export function DatePickerInput({
  value,
  onChange,
  min,
  max,
  placeholder = "Seleccionar fecha",
  disabled = false,
  showDropdownNav = false,
  fromYear,
  toYear,
}: DatePickerInputProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selected = value ? parseISO(value) : undefined;

  const displayValue = selected
    ? format(selected, "d 'de' MMMM yyyy", { locale: es })
    : null;

  const disabledDays = [
    ...(min ? [{ before: new Date(min + "T00:00:00") }] : []),
    ...(max ? [{ after: new Date(max + "T00:00:00") }] : []),
  ];

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(format(date, "yyyy-MM-dd"));
      setIsOpen(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const startMonth = showDropdownNav
    ? new Date(fromYear ?? currentYear - 20, 0)
    : undefined;
  const endMonth = showDropdownNav
    ? new Date(toYear ?? currentYear, 11)
    : undefined;

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        disabled={disabled}
        className={[
          "w-full flex items-center justify-between gap-2 px-3 py-2.5 border rounded-lg text-left transition text-sm",
          disabled
            ? "bg-muted text-muted-foreground cursor-not-allowed border-border"
            : "bg-background border-border hover:border-primary/40",
          isOpen ? "ring-2 ring-ring border-transparent" : "",
          !displayValue ? "text-muted-foreground" : "text-foreground",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span>{displayValue ?? placeholder}</span>
        <CalendarIcon size={16} className="text-muted-foreground shrink-0" />
      </button>

      {isOpen && (
        <div className="mt-1.5 border border-border rounded-lg shadow-md bg-popover overflow-hidden">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={
              selected ??
              (max ? new Date(max) : min ? new Date(min) : undefined)
            }
            disabled={disabledDays.length > 0 ? disabledDays : undefined}
            locale={es}
            captionLayout={showDropdownNav ? "dropdown" : "label"}
            startMonth={startMonth}
            endMonth={endMonth}
            reverseYears
            classNames={{
              root: "p-3 w-full box-border",
              months: "w-full",
              month: "w-full",
              month_caption: "flex items-center justify-between px-1 mb-3",
              caption_label: showDropdownNav
                ? "hidden"
                : "font-semibold text-foreground text-sm capitalize",
              dropdowns: "flex items-center gap-1",
              dropdown:
                "border border-border rounded-lg px-2 py-1 text-sm font-semibold text-foreground bg-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring capitalize",
              nav: "flex items-center gap-1",
              button_previous:
                "p-1.5 rounded-lg hover:bg-muted transition text-muted-foreground",
              button_next:
                "p-1.5 rounded-lg hover:bg-muted transition text-muted-foreground",
              month_grid: "w-full table-fixed border-collapse",
              weekdays: "",
              weekday:
                "text-center text-xs font-medium text-muted-foreground capitalize pb-1",
              weeks: "",
              week: "",
              day: "text-center p-0.5",
              day_button:
                "w-full h-9 flex items-center justify-center rounded-lg text-sm transition hover:bg-primary/10 hover:text-primary",
              today: "font-bold text-primary",
              selected:
                "bg-primary text-primary-foreground rounded-lg hover:bg-primary/80 hover:text-primary-foreground",
              outside: "text-muted-foreground opacity-40",
              disabled:
                "text-muted-foreground opacity-40 cursor-not-allowed hover:bg-transparent",
              chevron: "fill-muted-foreground",
            }}
          />
        </div>
      )}
    </div>
  );
}
