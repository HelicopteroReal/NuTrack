import { endOfDay, format, startOfDay, subDays } from "date-fns";

export function getDateRange(dateInput?: string) {
  const date = dateInput ? new Date(dateInput) : new Date();
  return {
    date,
    start: startOfDay(date),
    end: endOfDay(date),
  };
}

export function toDayLabel(date: Date) {
  return format(date, "MMM d");
}

export function getPastDays(count: number) {
  return Array.from({ length: count }).map((_, index) => subDays(new Date(), count - 1 - index));
}
