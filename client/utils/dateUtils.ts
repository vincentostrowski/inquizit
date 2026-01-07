/**
 * Date utility functions for handling date-only fields from the database
 * These functions ensure dates are never affected by timezone conversions
 */

/**
 * Parse a date string from Supabase (YYYY-MM-DD format)
 * Returns a Date object at local midnight (no timezone shift)
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object representing the date at local midnight
 */
export function parseDateString(
  dateString: string | null | undefined
): Date | null {
  if (!dateString) return null;

  // If it's already in YYYY-MM-DD format (from DATE column)
  const dateMatch = dateString.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    // Create date at local midnight (no timezone conversion)
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // Fallback: Try parsing as ISO string and extract date
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  // Use UTC methods to avoid timezone shift
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * Format a Date object to YYYY-MM-DD string (for database storage)
 * @param date - Date object
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateString(date: Date | null): string | null {
  if (!date) return null;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Get date key (YYYY-MM-DD) from a date string or Date object
 * Always returns the date as stored in the database, regardless of timezone
 * @param dateInput - Date string (YYYY-MM-DD) or Date object
 * @returns Date key in YYYY-MM-DD format
 */
export function getDateKey(
  dateInput: string | Date | null | undefined
): string | null {
  if (!dateInput) return null;

  // If it's already a string in YYYY-MM-DD format
  if (typeof dateInput === "string") {
    const match = dateInput.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) return match[0]; // Return the matched YYYY-MM-DD
  }

  // If it's a Date object, format it
  const date =
    typeof dateInput === "string" ? parseDateString(dateInput) : dateInput;
  if (!date) return null;

  return formatDateString(date);
}

