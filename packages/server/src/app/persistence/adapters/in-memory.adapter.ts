import { Injectable } from '@nestjs/common';
import {
  IPersistenceAdapter,
  IPersistedPlayer,
  IPersistedTask,
} from '../../../types';

/**
 * In-Memory Persistence Adapter.
 *
 * This adapter stores all data in memory using Maps for O(1) performance.
 * Perfect for development, testing, and single-server deployments.
 *
 * Characteristics:
 * - Fast: All operations are O(1) or O(n) where n is small.
 * - Volatile: Data lost on server restart.
 * - Simple: No external dependencies.
 * - Scalable: Works well for single server with <10k concurrent players.
 */
@Injectable()
export class InMemoryPersistenceAdapter implements IPersistenceAdapter {
  // In-memory storage using Maps for O(1) lookups.
  private players: Map<string, IPersistedPlayer> = new Map();
  private tasks: Map<string, IPersistedTask> = new Map();
  private playerTasks: Map<string, Set<string>> = new Map(); // playerId -> Set<taskId>

  // Player operations
  async createPlayer(
    playerId: string,
    socketId?: string
  ): Promise<IPersistedPlayer> {
    const now = Date.now();
    const player: IPersistedPlayer = {
      id: playerId,
      socketId,
      totalTasksCompleted: 0,
      totalMiningTime: 0,
      lastActiveAt: now,
      createdAt: now,
    };

    this.players.set(playerId, player);
    this.playerTasks.set(playerId, new Set());

    console.log(`Created player ${playerId} in memory`);
    return player;
  }

  async getPlayer(playerId: string): Promise<IPersistedPlayer | null> {
    return this.players.get(playerId) || null;
  }

  async updatePlayer(player: IPersistedPlayer): Promise<void> {
    player.lastActiveAt = Date.now();
    this.players.set(player.id, player);
  }

  async deletePlayer(playerId: string): Promise<void> {
    // Remove player
    this.players.delete(playerId);

    // Remove all associated tasks
    const taskIds = this.playerTasks.get(playerId);
    if (taskIds) {
      for (const taskId of taskIds) {
        this.tasks.delete(taskId);
      }
      this.playerTasks.delete(playerId);
    }

    console.log(`Deleted player ${playerId} and all associated tasks`);
  }

  // Task operations
  async createTask(task: IPersistedTask): Promise<void> {
    this.tasks.set(task.id, task);

    // Add to player's task set
    const playerTaskSet = this.playerTasks.get(task.playerId);
    if (playerTaskSet) {
      playerTaskSet.add(task.id);
    } else {
      this.playerTasks.set(task.playerId, new Set([task.id]));
    }
  }

  async getPlayerTasks(playerId: string): Promise<IPersistedTask[]> {
    const taskIds = this.playerTasks.get(playerId);
    if (!taskIds) return [];

    const tasks: IPersistedTask[] = [];
    for (const taskId of taskIds) {
      const task = this.tasks.get(taskId);
      if (task) tasks.push(task);
    }

    // Sort by creation time (newest first)
    return tasks.sort((a, b) => b.createdAt - a.createdAt);
  }

  async updateTask(task: IPersistedTask): Promise<void> {
    this.tasks.set(task.id, task);
  }

  async deleteTask(taskId: string): Promise<void> {
    const task = this.tasks.get(taskId);
    if (task) {
      // Remove from player's task set
      const playerTaskSet = this.playerTasks.get(task.playerId);
      if (playerTaskSet) {
        playerTaskSet.delete(taskId);
      }

      // Remove task
      this.tasks.delete(taskId);
    }
  }

  // Batch operations for performance
  async savePlayerSnapshot(
    player: IPersistedPlayer,
    tasks: IPersistedTask[]
  ): Promise<void> {
    // Update player
    await this.updatePlayer(player);

    // Update tasks
    for (const task of tasks) {
      await this.updateTask(task);
    }
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    // Simple health check - verify maps are accessible
    try {
      this.players.size;
      this.tasks.size;
      this.playerTasks.size;
      return true;
    } catch {
      return false;
    }
  }

  // Utility methods for debugging and monitoring
  getStats(): { players: number; tasks: number; memoryUsage: string } {
    return {
      players: this.players.size,
      tasks: this.tasks.size,
      memoryUsage: `${Math.round(
        process.memoryUsage().heapUsed / 1024 / 1024
      )}MB`,
    };
  }

  // Clear all data (useful for testing)
  clear(): void {
    this.players.clear();
    this.tasks.clear();
    this.playerTasks.clear();
    console.log('Cleared all in-memory persistence data');
  }
}
