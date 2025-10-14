/**
 * Persisted task data structure.
 * Represents task data as stored in persistence layer.
 */
export interface IPersistedTask {
  /**
   * Unique task identifier.
   * @description Generated using timestamp-based format.
   */
  id: string;

  /**
   * ID of the player who owns this task.
   * @description Foreign key reference to player.
   */
  playerId: string;

  /**
   * Human-readable name of the task.
   * @description Display name like "Mine Asteroid".
   */
  name: string;

  /**
   * Duration of the task.
   * @description Time in milliseconds required to complete.
   */
  duration: number;

  /**
   * Timestamp when task was started.
   * @description Unix timestamp in milliseconds, undefined if not started.
   */
  startTime?: number;

  /**
   * Whether the task has been completed.
   * @description true if task finished, false if in progress or not started.
   */
  completed: boolean;

  /**
   * Timestamp when task was completed.
   * @description Unix timestamp in milliseconds, undefined if not completed.
   */
  completedAt?: number;

  /**
   * Timestamp when task was created.
   * @description Unix timestamp in milliseconds.
   */
  createdAt: number;
}
