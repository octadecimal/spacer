import { ITask } from './ITask';
import { IPlayerState } from './IPlayerState';

/**
 * Socket.IO events interface.
 * Defines the contract for client-server communication.
 * Shared between client and server to ensure type safety.
 */
export interface ISocketEvents {
  // Client to server events
  /**
   * Client requests to join the game.
   * @description Emitted when client wants to connect to the game.
   */
  join: () => void;

  /**
   * Client requests to start a new task.
   * @description Emitted with task name when client wants to begin a task.
   */
  startTask: (data: { taskName: string }) => void;

  /**
   * Client requests current player state.
   * @description Emitted when client wants to sync with server state.
   */
  getPlayerState: () => void;

  // Server to client events
  /**
   * Server confirms player has joined with player ID.
   * @description Emitted after successful player registration.
   */
  joined: (data: { playerId: string }) => void;

  /**
   * Server notifies that a task has started.
   * @description Emitted when task begins execution.
   */
  taskStarted: (data: { task: ITask }) => void;

  /**
   * Server notifies that a task has completed.
   * @description Emitted when task finishes successfully.
   */
  taskCompleted: (data: { task: ITask }) => void;

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
}
