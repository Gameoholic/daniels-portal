/**
 * Displays a date in the following format: DAYOFWEEK • DD/MM/YYYY, HH:MM:SS
 *
 * Examples:
 * Friday • 26/12/2025, 11:54:17
 */
export function displayDateInFullFormat(date: Date) {
  return (
    convertDayOfWeekToString(date.getDay()) +
    " • " +
    new Date(date).toLocaleString("en-il")
  );
}

/**
 * Displays a date in the following format: Today, Yesterday OR DD MONTH YYYY
 *
 * Examples:
 * - Today
 * - Yesterday
 * - 26 December 2026
 */
export function displayDateInEnglishFormat(date: Date) {
  const now = new Date();
  const yesterday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1
  );

  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  ) {
    return "Today";
  }

  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-IL", { dateStyle: "long" }).format(date);
}

function convertDayOfWeekToString(day: number) {
  return (
    [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ][day] ?? "Unknown"
  );
}

/**
 * @return In the case that this date is displayed in the English format, will it be displayed as any of the following? "Today", "Yesterday"
 */
export function ifDisplayDateIsInEnglishWillItBeRelative(date: Date) {
  return ["Today", "Yesterday"].includes(displayDateInEnglishFormat(date));
}
