"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type CalendarProps = {
  mode?: "single";
  selected?: Date;
  defaultMonth?: Date;
  captionLayout?: "label" | "dropdown";
  onSelect?: (date: Date | undefined) => void;
  className?: string;
};

const earliestYear = 1990;
const latestYear = new Date().getFullYear() + 25;

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const monthNameFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
  value: String(index),
  label: monthNameFormatter.format(new Date(2026, index, 1)),
}));

const yearOptions = Array.from(
  { length: latestYear - earliestYear + 1 },
  (_, index) => String(earliestYear + index),
);

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(first?: Date, second?: Date) {
  if (!first || !second) return false;
  return startOfDay(first).getTime() === startOfDay(second).getTime();
}

function buildCalendarDays(month: Date) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart);
    date.setDate(calendarStart.getDate() + index);
    return date;
  });
}

export function Calendar({
  selected,
  defaultMonth,
  captionLayout = "label",
  onSelect,
  className,
}: CalendarProps) {
  const [month, setMonth] = React.useState(() => startOfDay(defaultMonth || selected || new Date()));
  const days = buildCalendarDays(month);
  const weekdays = days.slice(0, 7);

  function moveMonth(offset: number) {
    setMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  }

  function setVisibleMonth(monthIndex: number) {
    setMonth((currentMonth) => new Date(currentMonth.getFullYear(), monthIndex, 1));
  }

  function setVisibleYear(year: number) {
    setMonth((currentMonth) => new Date(year, currentMonth.getMonth(), 1));
  }

  return (
    <div className={cn("w-[280px] p-3", className)}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Button type="button" variant="secondary" size="icon" onClick={() => moveMonth(-1)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {captionLayout === "dropdown" ? (
          <div className="grid flex-1 grid-cols-2 gap-2">
            <Select value={String(month.getMonth())} onValueChange={(value) => setVisibleMonth(Number(value))}>
              <SelectTrigger className="h-8 px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {monthOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={String(month.getFullYear())} onValueChange={(value) => setVisibleYear(Number(value))}>
              <SelectTrigger className="h-8 px-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="text-sm font-medium">{monthFormatter.format(month)}</div>
        )}
        <Button type="button" variant="secondary" size="icon" onClick={() => moveMonth(1)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
        {weekdays.map((day) => (
          <div key={dayFormatter.format(day)} className="py-1">
            {dayFormatter.format(day).slice(0, 2)}
          </div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isSelected = sameDay(day, selected);
          const isToday = sameDay(day, new Date());
          const isCurrentMonth = day.getMonth() === month.getMonth();

          return (
            <Button
              key={day.toISOString()}
              type="button"
              variant={isSelected ? "default" : "ghost"}
              className={cn(
                "h-8 w-8 p-0 text-sm font-normal",
                isToday && !isSelected && "border border-[var(--primary)] text-[var(--primary)]",
                !isCurrentMonth && "text-slate-400",
              )}
              onClick={() => onSelect?.(startOfDay(day))}
            >
              {day.getDate()}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
