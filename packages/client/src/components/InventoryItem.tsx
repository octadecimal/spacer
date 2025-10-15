import { IInventoryItem } from '@spacer/shared';
import { useItemConfig } from '@/app/hooks/useItemConfig';
import { FormatUtils } from '@/lib/formatUtils';

/**
 * Props for the InventoryItem component.
 */
interface IInventoryItemProps {
  /**
   * The inventory item to display.
   */
  item: IInventoryItem;

  /**
   * Additional CSS classes.
   */
  className?: string;
}

/**
 * Individual inventory item component.
 * Displays a single inventory item with its details.
 */
export function InventoryItem({ item, className }: IInventoryItemProps) {
  const { getItemDisplayName, getItemCategory, getItemValue } = useItemConfig();

  const displayName = getItemDisplayName(item.itemId);
  const category = getItemCategory(item.itemId);
  const value = getItemValue(item.itemId);
  const totalValue = value * item.quantity;

  return (
    <div
      className={`bg-card border rounded-lg p-3 hover:bg-accent/50 transition-colors ${
        className || ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-medium text-sm">{displayName}</h3>
          <p className="text-xs text-muted-foreground capitalize">{category}</p>
        </div>
        <div className="text-right">
          <div className="font-semibold text-sm">
            {FormatUtils.formatNumber(item.quantity)}
          </div>
          {value > 0 && (
            <div className="text-xs text-muted-foreground">
              {FormatUtils.formatNumber(totalValue)} value
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-muted-foreground">
        Acquired: {FormatUtils.formatDate(item.acquiredAt)}
      </div>
    </div>
  );
}
