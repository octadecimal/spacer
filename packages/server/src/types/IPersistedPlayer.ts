/**
 * Persisted player data structure.
 * Represents player data as stored in persistence layer.
 */
export interface IPersistedPlayer {
  /**
   * Unique player identifier.
   * @description Generated using timestamp-based format.
   */
  id: string;

  /**
   * Socket.IO connection ID.
   * @description Only present for active sessions, undefined for offline players.
   */
  socketId?: string;

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
