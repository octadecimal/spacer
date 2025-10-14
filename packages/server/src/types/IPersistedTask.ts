import { ITask } from '@spacer/shared';

/**
 * Persisted task data structure.
 * Represents task data as stored in persistence layer.
 * Extends the core ITask interface with persistence-specific fields.
 */
export interface IPersistedTask extends ITask {
  /**
   * ID of the player who owns this task.
   * @description Foreign key reference to player.
   */
  playerId: string;

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
