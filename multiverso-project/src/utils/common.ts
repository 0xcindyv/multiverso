/**
 * Utility functions shared across the application
 */

/**
 * Parses a bitmap string into an array of numbers
 * @param str The bitmap string to parse (comma-separated values)
 * @returns Array of numbers representing the bitmap data
 */
export function parseBitmapString(str: string): number[] {
  return str.split(',')
    .map(num => parseInt(num.trim()))
    .filter(num => !isNaN(num));
}

/**
 * Formats a number for display
 * @param num Number to format
 * @returns Formatted number as string
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Calculates the percentage of a value relative to a total
 * @param value The value
 * @param total The total
 * @returns Formatted percentage string
 */
export function calculatePercentage(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${((value / total) * 100).toFixed(1)}%`;
}

/**
 * Generates a unique ID based on timestamp and random number
 * @returns Unique ID string
 */
export function generateUniqueId(): string {
  return `id_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
} 