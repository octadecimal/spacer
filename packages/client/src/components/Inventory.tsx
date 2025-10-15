import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IInventory } from '@spacer/shared';
import { InventoryItem } from './InventoryItem';

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
            {inventoryItems.map((item) => (
              <InventoryItem key={item.itemId} item={item} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
