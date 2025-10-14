import { ITask } from './ITask';
import { IPlayerState } from './IPlayerState';
import { IInventory } from './IInventory';

/**
 * Socket.IO events interface.
 * Defines the contract for client-server communication.
 * Shared between client and server to ensure type safety.
 */
export interface ISocketEvents {
  // Client to server events
  /**
   * Client requests to join the game with username.
   * @description Emitted when client wants to connect to the game with a username.
   */
  join: (data: { username: string }) => void;

  /**
   * Client requests to start a new task.
   * @description Emitted with task name and optional duration when client wants to begin a task.
   */
  startTask: (data: { taskName: string; duration?: number }) => void;

  /**
   * Client requests current player state.
   * @description Emitted when client wants to sync with server state.
   */
  getPlayerState: () => void;

  // Server to client events
  /**
   * Server confirms player has joined with player ID and inventory.
   * @description Emitted after successful player registration.
   */
  joined: (data: { playerId: string; inventory: IInventory }) => void;

  /**
   * Server notifies that a task has started.
   * @description Emitted when task begins execution.
   */
  taskStarted: (data: { task: ITask }) => void;

  /**
   * Server notifies that a task loop has completed (but task continues).
   * @description Emitted when a single loop within a task completes.
   */
  taskLoopCompleted: (data: {
    task: ITask;
    loopCount: number;
    remainingTime: number;
  }) => void;

  /**
   * Server notifies that a task has completed (final completion after all loops).
   * @description Emitted when task finishes successfully after all loops.
   */
  taskCompleted: (data: {
    task: ITask;
    loopCount?: number;
    totalDuration?: number;
  }) => void;

  /**
   * Server sends complete player state.
   * @description Emitted in response to getPlayerState request.
   */
  playerState: (data: IPlayerState) => void;

  /**
   * Server sends an error message.
   * @description Emitted when an error occurs during processing.
   */
  error: (data: { message: string }) => void;

  /**
   * Server notifies that player inventory has been updated.
   * @description Emitted when items are added/removed from inventory.
   */
  inventoryUpdated: (data: { inventory: IInventory }) => void;
}
