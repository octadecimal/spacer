/**
 * Item configuration interface.
 * Defines the structure for item configuration objects.
 */
export interface IItemConfig {
  /**
   * Unique identifier for the item type.
   * @description Used to identify the item in the system.
   */
  id: string;

  /**
   * Human-readable item name.
   * @description Display name shown to users.
   */
  name: string;

  /**
   * Item description.
   * @description Optional description for UI or documentation.
   */
  description?: string;

  /**
   * Item category.
   * @description Groups items by type (ore, material, tool, etc.).
   */
  category: string;

  /**
   * Base value of the item.
   * @description Used for trading, crafting costs, etc.
   */
  baseValue: number;

  /**
   * Whether this item is stackable.
   * @description If true, multiple items of this type can be stacked.
   */
  stackable: boolean;

  /**
   * Maximum stack size.
   * @description Maximum number of items that can be stacked together.
   */
  maxStackSize?: number;

  /**
   * Whether this item is currently enabled.
   * @description Allows disabling items without removing them.
   */
  enabled?: boolean;
}

/**
 * Item configuration registry.
 * Contains all available item configurations.
 */
export const ITEM_CONFIGS: Record<string, IItemConfig> = {
  IRON: {
    id: 'iron',
    name: 'Iron Ore',
    description: 'Raw iron ore extracted from asteroids',
    category: 'ore',
    baseValue: 10,
    stackable: true,
    maxStackSize: 1000,
    enabled: true,
  },
  // Future items can be added here:
  // STEEL: {
  //   id: 'steel',
  //   name: 'Steel Bar',
  //   description: 'Refined steel created from iron ore',
  //   category: 'material',
  //   baseValue: 50,
  //   stackable: true,
  //   maxStackSize: 500,
  //   enabled: true,
  // },
};

/**
 * Gets an item configuration by its ID.
 * @param itemId - The item ID to look up.
 * @returns The item configuration or undefined if not found.
 */
export function getItemConfig(itemId: string): IItemConfig | undefined {
  return Object.values(ITEM_CONFIGS).find((config) => config.id === itemId);
}

/**
 * Gets all enabled item configurations.
 * @returns Array of enabled item configurations.
 */
export function getEnabledItemConfigs(): IItemConfig[] {
  return Object.values(ITEM_CONFIGS).filter(
    (config) => config.enabled !== false
  );
}

/**
 * Gets all item configurations.
 * @returns Array of all item configurations.
 */
export function getAllItemConfigs(): IItemConfig[] {
  return Object.values(ITEM_CONFIGS);
}

/**
 * Gets item configurations by category.
 * @param category - The category to filter by.
 * @returns Array of item configurations in the specified category.
 */
export function getItemConfigsByCategory(category: string): IItemConfig[] {
  return Object.values(ITEM_CONFIGS).filter(
    (config) => config.category === category
  );
}
