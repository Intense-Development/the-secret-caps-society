"use client";

/**
 * Calendar Component - Placeholder
 *
 * NOTE: react-day-picker does not yet support React 19.
 * This component is a placeholder until a React 19-compatible date picker is available.
 *
 * Alternatives to consider when implementing:
 * 1. Wait for react-day-picker v9 (React 19 support)
 * 2. Use @internationalized/date with React Aria
 * 3. Use native HTML date input with custom styling
 * 4. Build custom calendar with date-fns utilities
 *
 * For now, use HTML5 date input:
 * <input type="date" className="..." />
 */

import * as React from "react";
import { cn } from "@/lib/utils";

export type CalendarProps = {
  className?: string;
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: boolean;
};

/**
 * Temporary Calendar component using HTML5 date input
 * This will be replaced with a proper calendar component when
 * react-day-picker or another library supports React 19
 */
function Calendar({
  className,
  selected,
  onSelect,
  disabled,
  ...props
}: CalendarProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : undefined;
    onSelect?.(date);
  };

  const dateValue = selected ? selected.toISOString().split("T")[0] : "";

  return (
    <div className={cn("p-3", className)} {...props}>
      <input
        type="date"
        value={dateValue}
        onChange={handleChange}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <p className="text-xs text-muted-foreground mt-2">
        Note: Using native date input. Full calendar component pending React
        19-compatible library.
      </p>
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
