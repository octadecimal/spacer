import { ITask } from './ITask';

/**
 * Player state interface.
 * Represents player data sent from server to client.
 * Shared between client and server for consistent communication.
 */
export interface IPlayerState {
  /**
   * Unique identifier of the player.
   * @description The player's unique ID.
   */
  playerId: string;

  /**
   * Array of all tasks belonging to this player.
   * @description Complete task history including completed and active tasks.
   */
  tasks: ITask[];
}
