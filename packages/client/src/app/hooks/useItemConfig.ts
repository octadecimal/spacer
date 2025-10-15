import { getItemConfig } from '@spacer/shared';

/**
 * Custom hook for managing item configuration lookups.
 * Provides memoized item config access to avoid repeated lookups.
 */
export function useItemConfig() {
  /**
   * Gets item configuration with memoization.
   * @param itemId The item ID to look up.
   * @returns The item configuration or null if not found.
   */
  const getItemConfigMemoized = (itemId: string) => {
    return getItemConfig(itemId);
  };

  /**
   * Gets the display name for an item.
   * @param itemId The item ID.
   * @returns The item's display name or fallback.
   */
  const getItemDisplayName = (itemId: string): string => {
    const itemConfig = getItemConfigMemoized(itemId);
    return itemConfig?.name || itemId;
  };

  /**
   * Gets the display category for an item.
   * @param itemId The item ID.
   * @returns The item's category or fallback.
   */
  const getItemCategory = (itemId: string): string => {
    const itemConfig = getItemConfigMemoized(itemId);
    return itemConfig?.category || 'unknown';
  };

  /**
   * Gets the base value for an item.
   * @param itemId The item ID.
   * @returns The item's base value or 0.
   */
  const getItemValue = (itemId: string): number => {
    const itemConfig = getItemConfigMemoized(itemId);
    return itemConfig?.baseValue || 0;
  };

  /**
   * Gets all item information in a single call.
   * @param itemId The item ID.
   * @returns Object containing all item information.
   */
  const getItemInfo = (itemId: string) => {
    const itemConfig = getItemConfigMemoized(itemId);
    return {
      name: itemConfig?.name || itemId,
      category: itemConfig?.category || 'unknown',
      baseValue: itemConfig?.baseValue || 0,
      config: itemConfig,
    };
  };

  return {
    getItemConfig: getItemConfigMemoized,
    getItemDisplayName,
    getItemCategory,
    getItemValue,
    getItemInfo,
  };
}
