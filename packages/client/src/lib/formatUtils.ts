/**
 * Utility functions for formatting and display.
 * Centralized formatting logic to avoid duplication.
 */
export class FormatUtils {
  /**
   * Formats a timestamp to a readable date string.
   * @param timestamp Unix timestamp in milliseconds.
   * @returns Formatted date string.
   */
  static formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString();
  }

  /**
   * Formats a timestamp for display with milliseconds.
   * @param timestamp The timestamp to format.
   * @returns Formatted time string with milliseconds.
   */
  static formatTimeWithMs(timestamp: Date): string {
    return (
      timestamp.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + `.${timestamp.getMilliseconds().toString().padStart(3, '0')}`
    );
  }

  /**
   * Formats a number with locale-specific formatting.
   * @param value The number to format.
   * @returns Formatted number string.
   */
  static formatNumber(value: number): string {
    return value.toLocaleString();
  }

  /**
   * Formats a percentage value.
   * @param value The percentage value (0-100).
   * @param decimals Number of decimal places (default: 0).
   * @returns Formatted percentage string.
   */
  static formatPercentage(value: number, decimals: number = 0): string {
    return `${value.toFixed(decimals)}%`;
  }

  /**
   * Formats a duration in milliseconds to a human-readable string.
   * @param milliseconds Duration in milliseconds.
   * @returns Formatted duration string.
   */
  static formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  /**
   * Formats remaining time for display.
   * @param remainingTimeMs Remaining time in milliseconds.
   * @returns Formatted remaining time string.
   */
  static formatRemainingTime(remainingTimeMs: number): string {
    const seconds = Math.round(remainingTimeMs / 1000);
    return `${seconds}s remaining`;
  }
}
