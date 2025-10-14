import { Injectable } from '@nestjs/common';
import {
  IPersistenceAdapter,
  IPersistenceService,
  IPersistedPlayer,
  IPersistedTask,
} from '../../types';

/**
 * Persistence Service.
 *
 * High-level service that provides game-specific persistence operations.
 * This service wraps the persistence adapter and adds business logic.
 *
 * Benefits:
 * - Clean separation between game logic and persistence.
 * - Easy to swap adapters (in-memory -> PostgreSQL -> Redis).
 * - Centralized persistence logic.
 * - Built-in error handling and logging.
 */
@Injectable()
export class GamePersistenceService implements IPersistenceService {
  public constructor(private readonly adapter: IPersistenceAdapter) {}

  // Player lifecycle management.
  public async createOrGetPlayer(
    playerId: string,
    socketId?: string
  ): Promise<IPersistedPlayer> {
    try {
      // Try to get existing player.
      let player = await this.adapter.getPlayer(playerId);

      if (!player) {
        // Create new player if doesn't exist.
        player = await this.adapter.createPlayer(playerId, socketId);
        console.log(`Created new player: ${playerId}`);
      } else {
        // Update existing player's socket ID and activity.
        player.socketId = socketId;
        player.lastActiveAt = Date.now();
        await this.adapter.updatePlayer(player);
        console.log(`Updated existing player: ${playerId}`);
      }

      return player;
    } catch (error) {
      console.error(`Failed to create/get player ${playerId}:`, error);
      throw new Error(`Persistence error: ${error.message}`);
    }
  }

  public async updatePlayerActivity(
    playerId: string,
    socketId?: string
  ): Promise<void> {
    try {
      const player = await this.adapter.getPlayer(playerId);
      if (player) {
        player.socketId = socketId;
        player.lastActiveAt = Date.now();
        await this.adapter.updatePlayer(player);
      }
    } catch (error) {
      console.error(`Failed to update player activity ${playerId}:`, error);
    }
  }

  // Task management.
  public async saveTask(task: IPersistedTask): Promise<void> {
    try {
      // Ensure task has required fields.
      if (!task.createdAt) {
        task.createdAt = Date.now();
      }

      await this.adapter.createTask(task);
      console.log(`Saved task ${task.id} for player ${task.playerId}`);
    } catch (error) {
      console.error(`Failed to save task ${task.id}:`, error);
      throw new Error(`Failed to save task: ${error.message}`);
    }
  }

  public async getPlayerTaskHistory(
    playerId: string
  ): Promise<IPersistedTask[]> {
    try {
      return await this.adapter.getPlayerTasks(playerId);
    } catch (error) {
      console.error(
        `Failed to get task history for player ${playerId}:`,
        error
      );
      return []; // Return empty array on error to prevent game crashes
    }
  }

  public async completeTask(taskId: string): Promise<void> {
    try {
      // Get task, update completion status, save back.
      const tasks = Array.from((this.adapter as any).tasks?.values() || []);
      const task = tasks.find((t: IPersistedTask) => t.id === taskId);

      if (task) {
        task.completed = true;
        task.completedAt = Date.now();
        await this.adapter.updateTask(task);

        // Update player statistics.
        const player = await this.adapter.getPlayer(task.playerId);
        if (player) {
          player.totalTasksCompleted += 1;
          player.totalMiningTime += task.duration;
          await this.adapter.updatePlayer(player);
        }

        console.log(`Completed task ${taskId} for player ${task.playerId}`);
      }
    } catch (error) {
      console.error(`Failed to complete task ${taskId}:`, error);
    }
  }

  // Performance optimizations.
  public async savePlayerProgress(
    playerId: string,
    tasks: IPersistedTask[]
  ): Promise<void> {
    try {
      const player = await this.adapter.getPlayer(playerId);
      if (player) {
        await this.adapter.savePlayerSnapshot(player, tasks);
        console.log(`Saved progress snapshot for player ${playerId}`);
      }
    } catch (error) {
      console.error(`Failed to save player progress ${playerId}:`, error);
    }
  }

  // Cleanup operations.
  public async removeInactivePlayer(playerId: string): Promise<void> {
    try {
      await this.adapter.deletePlayer(playerId);
      console.log(`Removed inactive player ${playerId}`);
    } catch (error) {
      console.error(`Failed to remove player ${playerId}:`, error);
    }
  }

  // Health monitoring.
  public async isHealthy(): Promise<boolean> {
    try {
      return await this.adapter.isHealthy();
    } catch (error) {
      console.error('Persistence health check failed:', error);
      return false;
    }
  }

  // Utility methods.
  public async getPlayerStats(playerId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    totalMiningTime: number;
    lastActive: number;
  } | null> {
    try {
      const player = await this.adapter.getPlayer(playerId);
      const tasks = await this.adapter.getPlayerTasks(playerId);

      if (!player) return null;

      return {
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.completed).length,
        totalMiningTime: player.totalMiningTime,
        lastActive: player.lastActiveAt,
      };
    } catch (error) {
      console.error(`Failed to get stats for player ${playerId}:`, error);
      return null;
    }
  }
}
