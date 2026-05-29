import { format, formatDistanceToNow, startOfMonth, endOfMonth, isToday, isYesterday } from "date-fns";

export const formatDate = (date, pattern = "dd MMM yyyy") => format(new Date(date), pattern);

export const formatRelative = (date) => {
  const d = new Date(date);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return formatDistanceToNow(d, { addSuffix: true });
};

export const getMonthRange = (month, year) => ({
  start: startOfMonth(new Date(year, month - 1)).toISOString(),
  end: endOfMonth(new Date(year, month - 1)).toISOString(),
});

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const formatMonthYear = (month, year) => `${MONTHS[month - 1]} ${year}`;
