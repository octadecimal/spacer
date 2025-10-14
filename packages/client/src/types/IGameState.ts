import { ITask } from '@spacer/shared';

/**
 * Game state interface.
 * Represents the current state of the game.
 */
export interface IGameState {
  /**
   * Unique identifier of the current player.
   * @description null if no player is connected.
   */
  playerId: string | null;

  /**
   * Currently active task, if any.
   * @description null if no task is currently running.
   */
  currentTask: ITask | null;

  /**
   * Progress percentage of the current task.
   * @description Range: 0-100.
   */
  taskProgress: number;

  /**
   * Whether the client is connected to the server.
   * @description true if WebSocket connection is active.
   */
  isConnected: boolean;
}
