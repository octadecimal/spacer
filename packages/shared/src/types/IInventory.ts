/**
 * Inventory item interface.
 * Represents an item instance in a player's inventory.
 */
export interface IInventoryItem {
  /**
   * Item configuration ID.
   * @description References the item configuration.
   */
  itemId: string;

  /**
   * Quantity of this item.
   * @description Number of items in this stack.
   */
  quantity: number;

  /**
   * Timestamp when this item was acquired.
   * @description Unix timestamp in milliseconds.
   */
  acquiredAt: number;
}

/**
 * Player inventory interface.
 * Represents a player's inventory state.
 */
export interface IInventory {
  /**
   * Map of item ID to inventory item.
   * @description Key is itemId, value is the inventory item data.
   */
  items: Record<string, IInventoryItem>;

  /**
   * Maximum number of different item types that can be stored.
   * @description Inventory slot limit.
   */
  maxSlots: number;

  /**
   * Total number of items currently in inventory.
   * @description Sum of all item quantities.
   */
  totalItems: number;
}

/**
 * Inventory operation result interface.
 * Represents the result of an inventory operation.
 */
export interface IInventoryOperationResult {
  /**
   * Whether the operation was successful.
   */
  success: boolean;

  /**
   * Error message if operation failed.
   */
  error?: string;

  /**
   * Updated inventory after operation.
   */
  inventory?: IInventory;

  /**
   * Items that were added/removed.
   */
  affectedItems?: IInventoryItem[];
}
