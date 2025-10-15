import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

/**
 * Cross-platform storage utility that works on both web and mobile.
 * Uses localStorage on web and Capacitor Preferences on mobile.
 * Optimized with platform detection caching.
 */
export class Storage {
  // Cache platform detection to avoid repeated checks.
  private static isNativePlatform: boolean | null = null;

  /**
   * Gets whether the current platform is native (mobile).
   * Caches the result for performance.
   * @returns True if running on native platform.
   */
  private static getIsNativePlatform(): boolean {
    if (this.isNativePlatform === null) {
      this.isNativePlatform = Capacitor.isNativePlatform();
    }
    return this.isNativePlatform;
  }
  /**
   * Set a value in storage.
   * @param key The storage key.
   * @param value The value to store.
   */
  public static async setItem(key: string, value: string): Promise<void> {
    if (this.getIsNativePlatform()) {
      // Use Capacitor Preferences on mobile.
      await Preferences.set({ key, value });
    } else {
      // Use localStorage on web.
      localStorage.setItem(key, value);
    }
  }

  /**
   * Get a value from storage.
   * @param key The storage key.
   * @returns The stored value or null if not found.
   */
  public static async getItem(key: string): Promise<string | null> {
    if (this.getIsNativePlatform()) {
      // Use Capacitor Preferences on mobile.
      const result = await Preferences.get({ key });
      return result.value;
    } else {
      // Use localStorage on web.
      return localStorage.getItem(key);
    }
  }

  /**
   * Remove a value from storage.
   * @param key The storage key.
   */
  public static async removeItem(key: string): Promise<void> {
    if (this.getIsNativePlatform()) {
      // Use Capacitor Preferences on mobile.
      await Preferences.remove({ key });
    } else {
      // Use localStorage on web.
      localStorage.removeItem(key);
    }
  }

  /**
   * Clear all storage.
   */
  public static async clear(): Promise<void> {
    if (this.getIsNativePlatform()) {
      // Use Capacitor Preferences on mobile.
      await Preferences.clear();
    } else {
      // Use localStorage on web.
      localStorage.clear();
    }
  }
}
