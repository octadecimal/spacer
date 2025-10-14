import { IServerPlayer } from './IServerPlayer';
import { IPersistedTask } from './IPersistedTask';

/**
 * Persistence service interface.
 * High-level operations that the game logic uses.
 */
export interface IPersistenceService {
  // Player lifecycle
  /**
   * Creates a new player or retrieves existing player by ID.
   * @param playerId - Unique identifier for the player.
   * @param socketId - Optional socket connection ID for active sessions.
   * @returns Promise resolving to the player (new or existing).
   */
  createOrGetPlayer(
    playerId: string,
    socketId?: string
  ): Promise<IServerPlayer>;

  /**
   * Updates a player's activity timestamp and socket connection.
   * @param playerId - The player's unique identifier.
   * @param socketId - Optional socket connection ID.
   * @returns Promise that resolves when update is complete.
   */
  updatePlayerActivity(playerId: string, socketId?: string): Promise<void>;

  /**
   * Updates a player's data (inventory, stats, etc.).
   * @param player - The updated player object.
   * @returns Promise that resolves when update is complete.
   */
  updatePlayer(player: IServerPlayer): Promise<void>;

  // Task management
  /**
   * Saves a task to the persistence layer.
   * @param task - The task object to persist.
   * @returns Promise that resolves when task is saved.
   */
  saveTask(task: IPersistedTask): Promise<void>;

  /**
   * Retrieves the complete task history for a player.
   * @param playerId - The player's unique identifier.
   * @returns Promise resolving to array of all player tasks.
   */
  getPlayerTaskHistory(playerId: string): Promise<IPersistedTask[]>;

  /**
   * Marks a task as completed and updates player statistics.
   * @param taskId - The task's unique identifier.
   * @returns Promise that resolves when completion is processed.
   */
  completeTask(taskId: string): Promise<void>;

  // Performance optimizations
  /**
   * Saves player progress and all associated tasks in a single operation.
   * @param playerId - The player's unique identifier.
   * @param tasks - Array of tasks to save with the player.
   * @returns Promise that resolves when progress is saved.
   */
  savePlayerProgress(playerId: string, tasks: IPersistedTask[]): Promise<void>;

  // Cleanup
  /**
   * Removes an inactive player and all associated data.
   * @param playerId - The player's unique identifier.
   * @returns Promise that resolves when cleanup is complete.
   */
  removeInactivePlayer(playerId: string): Promise<void>;
}
