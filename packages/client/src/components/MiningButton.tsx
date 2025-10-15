import { Button } from '@/components/ui/button';

/**
 * Props for the MiningButton component.
 */
interface IMiningButtonProps {
  /**
   * Whether a task is currently active.
   */
  isTaskActive: boolean;

  /**
   * Whether the button should be disabled.
   */
  disabled?: boolean;

  /**
   * Callback when the button is clicked.
   */
  onClick: () => void;

  /**
   * Additional CSS classes.
   */
  className?: string;
}

/**
 * Mining button component.
 * Handles the start/stop mining functionality with proper state display.
 */
export function MiningButton({
  isTaskActive,
  disabled = false,
  onClick,
  className,
}: IMiningButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled} className={className}>
      {isTaskActive ? 'Mining in Progress...' : 'Mine Asteroid'}
    </Button>
  );
}
