import { IServerPlayer } from './IServerPlayer';
import type { IPersistedTask } from './IPersistedTask';

/**
 * Persistence adapter interface.
 * Defines the contract for all persistence implementations.
 */
export interface IPersistenceAdapter {
  // Player operations
  /**
   * Creates a new player in the persistence layer.
   * @param playerId - Unique identifier for the player.
   * @param socketId - Optional socket connection ID for active sessions.
   * @returns Promise resolving to the created player.
   */
  createPlayer(playerId: string, socketId?: string): Promise<IServerPlayer>;

  /**
   * Retrieves a player by their unique identifier.
   * @param playerId - The player's unique identifier.
   * @returns Promise resolving to the player or null if not found.
   */
  getPlayer(playerId: string): Promise<IServerPlayer | null>;

  /**
   * Updates an existing player's data.
   * @param player - The player object with updated data.
   * @returns Promise that resolves when update is complete.
   */
  updatePlayer(player: IServerPlayer): Promise<void>;

  /**
   * Removes a player and all associated data.
   * @param playerId - The player's unique identifier.
   * @returns Promise that resolves when deletion is complete.
   */
  deletePlayer(playerId: string): Promise<void>;

  // Task operations
  /**
   * Creates a new task in the persistence layer.
   * @param task - The task object to persist.
   * @returns Promise that resolves when task is saved.
   */
  createTask(task: IPersistedTask): Promise<void>;

  /**
   * Retrieves all tasks for a specific player.
   * @param playerId - The player's unique identifier.
   * @returns Promise resolving to array of tasks.
   */
  getPlayerTasks(playerId: string): Promise<IPersistedTask[]>;

  /**
   * Updates an existing task's data.
   * @param task - The task object with updated data.
   * @returns Promise that resolves when update is complete.
   */
  updateTask(task: IPersistedTask): Promise<void>;

  /**
   * Removes a task from the persistence layer.
   * @param taskId - The task's unique identifier.
   * @returns Promise that resolves when deletion is complete.
   */
  deleteTask(taskId: string): Promise<void>;

  /**
   * Retrieves all tasks from the persistence layer.
   * @returns Promise resolving to array of all tasks.
   */
  getAllTasks(): Promise<IPersistedTask[]>;

  // Batch operations for performance
  /**
   * Saves a complete player snapshot with all tasks atomically.
   * @param player - The player object to save.
   * @param tasks - Array of tasks belonging to the player.
   * @returns Promise that resolves when snapshot is saved.
   */
  savePlayerSnapshot(
    player: IServerPlayer,
    tasks: IPersistedTask[]
  ): Promise<void>;

  // Health check
  /**
   * Checks if the persistence layer is healthy and accessible.
   * @returns Promise resolving to true if healthy, false otherwise.
   */
  isHealthy(): Promise<boolean>;
}
