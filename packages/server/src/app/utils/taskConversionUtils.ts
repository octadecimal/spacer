import { ITask } from '@spacer/shared';
import { IPersistedTask } from '../../types/IPersistedTask';

/**
 * Utility functions for task conversion between persistence and active game state.
 * Centralizes task transformation logic to avoid duplication.
 */
export class TaskConversionUtils {
  /**
   * Converts persisted task to active game task.
   * Maps between persistence layer and real-time game state.
   * @param persistedTask The persisted task.
   * @returns The active game task.
   */
  static convertPersistedTaskToTask(persistedTask: IPersistedTask): ITask {
    return {
      id: persistedTask.id,
      name: persistedTask.name,
      duration: persistedTask.duration,
      startTime: persistedTask.startTime,
      completed: persistedTask.completed,
    };
  }

  /**
   * Converts active game task to persisted task.
   * Maps between real-time game state and persistence layer.
   * @param task The active game task.
   * @param playerId The player ID.
   * @returns The persisted task.
   */
  static convertTaskToPersistedTask(
    task: ITask,
    playerId: string
  ): IPersistedTask {
    return {
      id: task.id,
      playerId,
      name: task.name,
      duration: task.duration,
      startTime: task.startTime,
      completed: task.completed,
      completedAt: task.completed ? Date.now() : undefined,
      createdAt: Date.now(),
    };
  }

  /**
   * Converts multiple persisted tasks to active game tasks.
   * @param persistedTasks Array of persisted tasks.
   * @returns Array of active game tasks.
   */
  static convertPersistedTasksToTasks(
    persistedTasks: IPersistedTask[]
  ): ITask[] {
    return persistedTasks.map(this.convertPersistedTaskToTask);
  }

  /**
   * Finds the most recent active task from a list of tasks.
   * @param tasks Array of tasks to search.
   * @returns The most recent active task or null if none found.
   */
  static findMostRecentActiveTask(tasks: ITask[]): ITask | null {
    const activeTasks = tasks.filter(
      (task) => !task.completed && task.startTime
    );
    if (activeTasks.length === 0) return null;

    // Sort by startTime descending and return the most recent
    return activeTasks.sort(
      (a, b) => (b.startTime || 0) - (a.startTime || 0)
    )[0];
  }

  /**
   * Validates if a task is considered active.
   * @param task The task to validate.
   * @returns True if the task is active (not completed and has startTime).
   */
  static isTaskActive(task: ITask): boolean {
    return !task.completed && !!task.startTime;
  }

  /**
   * Calculates task progress based on elapsed time.
   * @param task The task to calculate progress for.
   * @returns Progress percentage (0-100).
   */
  static calculateTaskProgress(task: ITask): number {
    if (!task.startTime) return 0;

    const elapsed = Date.now() - task.startTime;
    return Math.min((elapsed / task.duration) * 100, 100);
  }
}
