import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combines and merges CSS class names using clsx and tailwind-merge.
 * @param inputs - Variable number of class values to combine.
 * @returns Merged CSS class string with Tailwind conflicts resolved.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
