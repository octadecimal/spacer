import { status, getStatusColor } from '@/app/styles';

/**
 * Props for the ConnectionStatus component.
 */
interface IConnectionStatusProps {
  /**
   * Whether the client is connected to the server.
   */
  isConnected: boolean;

  /**
   * Optional player ID to display.
   */
  playerId?: string | null;

  /**
   * Additional CSS classes.
   */
  className?: string;
}

/**
 * Connection status component.
 * Displays the current connection status and player ID.
 */
export function ConnectionStatus({
  isConnected,
  playerId,
  className,
}: IConnectionStatusProps) {
  return (
    <div className={className}>
      <div className={status.statusContainer}>
        <p className={status.statusLabel}>Connection Status:</p>
        <p className={`${status.statusValue} ${getStatusColor(isConnected)}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </p>
        {playerId && <p className={status.playerInfo}>Player ID: {playerId}</p>}
      </div>
    </div>
  );
}
