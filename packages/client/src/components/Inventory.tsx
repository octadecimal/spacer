import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IInventory, IInventoryItem } from '@spacer/shared';
import { getItemConfig } from '@spacer/shared';

/**
 * Props for the Inventory component.
 */
interface IInventoryProps {
  /**
   * Player's inventory data.
   */
  inventory: IInventory;

  /**
   * Additional CSS classes.
   */
  className?: string;
}

/**
 * Inventory component displays the player's current inventory.
 * Shows items with quantities and provides a clean, organized view.
 */
export function Inventory({ inventory, className }: IInventoryProps) {
  /**
   * Formats a timestamp to a readable date string.
   * @param timestamp Unix timestamp in milliseconds.
   * @returns Formatted date string.
   */
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  /**
   * Gets the display name for an item.
   * @param itemId The item ID.
   * @returns The item's display name or fallback.
   */
  const getItemDisplayName = (itemId: string): string => {
    const itemConfig = getItemConfig(itemId);
    return itemConfig?.name || itemId;
  };

  /**
   * Gets the display category for an item.
   * @param itemId The item ID.
   * @returns The item's category or fallback.
   */
  const getItemCategory = (itemId: string): string => {
    const itemConfig = getItemConfig(itemId);
    return itemConfig?.category || 'unknown';
  };

  /**
   * Gets the base value for an item.
   * @param itemId The item ID.
   * @returns The item's base value or 0.
   */
  const getItemValue = (itemId: string): number => {
    const itemConfig = getItemConfig(itemId);
    return itemConfig?.baseValue || 0;
  };

  // Convert inventory items to array for rendering.
  const inventoryItems = Object.values(inventory.items);

  return (
    <Card className={`h-full flex flex-col ${className || ''}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Inventory</CardTitle>
        <div className="text-sm text-muted-foreground">
          {inventory.totalItems} items • {inventoryItems.length}/
          {inventory.maxSlots} slots used
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto">
        {inventoryItems.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <span role="img" aria-label="Empty box">
              📦
            </span>
            <p>Your inventory is empty</p>
            <p className="text-sm">Complete tasks to collect items!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inventoryItems.map((item: IInventoryItem) => {
              const displayName = getItemDisplayName(item.itemId);
              const category = getItemCategory(item.itemId);
              const value = getItemValue(item.itemId);
              const totalValue = value * item.quantity;

              return (
                <div
                  key={item.itemId}
                  className="bg-card border rounded-lg p-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{displayName}</h3>
                      <p className="text-xs text-muted-foreground capitalize">
                        {category}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-sm">
                        {item.quantity.toLocaleString()}
                      </div>
                      {value > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {totalValue.toLocaleString()} value
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Acquired: {formatDate(item.acquiredAt)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
