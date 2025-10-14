import { IPlayer, IInventory } from '@spacer/shared';

/**
 * Server player interface.
 * Represents player data as stored in persistence layer on the server.
 * Extends the base player with server-specific persistence fields.
 */
export interface IServerPlayer extends IPlayer {
  /**
   * Total number of tasks completed by this player.
   * @description Incremented each time a task is completed.
   */
  totalTasksCompleted: number;

  /**
   * Total time spent mining.
   * @description Cumulative duration in milliseconds across all completed tasks.
   */
  totalMiningTime: number;

  /**
   * Player's inventory.
   * @description Contains all items the player has collected.
   */
  inventory: IInventory;

  /**
   * Timestamp of last activity.
   * @description Unix timestamp in milliseconds.
   */
  lastActiveAt: number;

  /**
   * Timestamp when player was created.
   * @description Unix timestamp in milliseconds.
   */
  createdAt: number;
}
