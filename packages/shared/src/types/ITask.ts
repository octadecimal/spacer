/**
 * Core game task interface.
 * Represents a task in the active game state.
 * Shared between client and server for consistent data structures.
 */
export interface ITask {
  /**
   * Unique task identifier.
   * @description Generated using timestamp-based format.
   */
  id: string;

  /**
   * Human-readable task name.
   * @description Display name like "Mine Asteroid".
   */
  name: string;

  /**
   * Task duration.
   * @description Time in milliseconds required to complete.
   */
  duration: number;

  /**
   * Unix timestamp when task started.
   * @description undefined if task hasn't been started yet.
   */
  startTime?: number;

  /**
   * Task completion status.
   * @description true if completed, false if in progress or not started.
   */
  completed: boolean;
}
