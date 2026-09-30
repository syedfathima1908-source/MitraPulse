import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

/**
 * Returns today's date formatted as YYYY-MM-DD.
 */
export const getTodayDateString = (): string => {
  const today = new Date();
  return format(today, 'yyyy-MM-dd');
};

/**
 * Formats a YYYY-MM-DD date string into a readable format like "23 September 2026".
 */
export const formatReadableDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    return format(date, 'dd MMMM yyyy');
  } catch {
    return dateStr;
  }
};

/**
 * Formats a YYYY-MM-DD date string into short format like "23 Sep 2026".
 */
export const formatShortDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    return format(date, 'dd MMM yyyy');
  } catch {
    return dateStr;
  }
};

/**
 * Returns abbreviated day of week, e.g., "Mon", "Tue".
 */
export const getDayOfWeek = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = parseISO(dateStr);
    return format(date, 'EEE');
  } catch {
    return '';
  }
};

/**
 * Gets all days in the week containing the specified date (Monday to Sunday).
 */
export const getDaysInWeek = (dateStr: string): { dateStr: string; dayName: string }[] => {
  try {
    const date = parseISO(dateStr);
    const start = startOfWeek(date, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(date, { weekStartsOn: 1 }); // Sunday
    const interval = eachDayOfInterval({ start, end });

    return interval.map((d) => ({
      dateStr: format(d, 'yyyy-MM-dd'),
      dayName: format(d, 'EEE'),
    }));
  } catch {
    return [];
  }
};

/**
 * Formats week range string, e.g. "15 Sep - 21 Sep 2026".
 */
export const formatWeekRange = (dateStr: string): string => {
  try {
    const date = parseISO(dateStr);
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return `${format(start, 'dd MMM')} - ${format(end, 'dd MMM yyyy')}`;
  } catch {
    return dateStr;
  }
};

/**
 * Gets YYYY-MM string for a given date.
 */
export const getYearMonthString = (dateStr: string): string => {
  if (!dateStr) return format(new Date(), 'yyyy-MM');
  return dateStr.substring(0, 7);
};

/**
 * Formats YYYY-MM to "September 2026".
 */
export const formatMonthYear = (yearMonthStr: string): string => {
  if (!yearMonthStr) return '';
  try {
    const date = parseISO(`${yearMonthStr}-01`);
    return format(date, 'MMMM yyyy');
  } catch {
    return yearMonthStr;
  }
};
