import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

/**
 * Cross-platform storage utility that works on both web and mobile.
 * Uses localStorage on web and Capacitor Preferences on mobile.
 */
export class Storage {
  /**
   * Set a value in storage.
   * @param key The storage key.
   * @param value The value to store.
   */
  public static async setItem(key: string, value: string): Promise<void> {
    if (Capacitor.isNativePlatform()) {
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
    if (Capacitor.isNativePlatform()) {
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
    if (Capacitor.isNativePlatform()) {
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
    if (Capacitor.isNativePlatform()) {
      // Use Capacitor Preferences on mobile.
      await Preferences.clear();
    } else {
      // Use localStorage on web.
      localStorage.clear();
    }
  }
}
