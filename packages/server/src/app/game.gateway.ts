import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { GamePersistenceService } from './persistence/persistence.service';
import { IPersistedTask } from '../types/IPersistedTask';
import { IServerPlayer } from '../types/IServerPlayer';
import { ITask } from '@spacer/shared';

/**
 * WebSocket Gateway - Server-side game logic hub.
 * Handles all real-time communication between clients and server.
 *
 * Architecture:
 * - Server-authoritative: All game state changes happen here.
 * - Event-driven: Uses Socket.IO events for client-server communication.
 * - Hybrid persistence: Memory for real-time + persistence for durability.
 */
@Injectable()
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200', // Allow client connections
    methods: ['GET', 'POST'],
  },
})
export class GameGateway {
  /**
   * Socket.IO server instance for handling WebSocket connections.
   */
  @WebSocketServer()
  public server!: Server;

  // In-memory player storage for real-time operations (Map for O(1) lookups).
  // This provides fast access for active gameplay while persistence handles durability.
  private activePlayers: Map<string, IServerPlayer & { tasks: ITask[] }> =
    new Map();

  /**
   * Constructor.
   * @param persistenceService The persistence service.
   */
  public constructor(
    private readonly persistenceService: GamePersistenceService
  ) {}

  /**
   * Convert persisted task to active game task.
   * Maps between persistence layer and real-time game state.
   * @param persistedTask The persisted task.
   * @returns The active game task.
   */
  private convertPersistedTaskToTask(persistedTask: IPersistedTask): ITask {
    return {
      id: persistedTask.id,
      name: persistedTask.name,
      duration: persistedTask.duration,
      startTime: persistedTask.startTime,
      completed: persistedTask.completed,
    };
  }

  /**
   * Convert active game task to persisted task.
   * Maps between real-time game state and persistence layer.
   * @param task The active game task.
   * @param playerId The player ID.
   * @returns The persisted task.
   */
  private convertTaskToPersistedTask(
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
   * Player Connection Handler.
   * Triggered when client emits 'join' event.
   *
   * Hybrid Persistence Flow:
   * 1. Generate unique player ID (timestamp-based).
   * 2. Create/get player from persistence layer.
   * 3. Load player's task history from persistence.
   * 4. Store active player in memory for real-time operations.
   * 5. Send confirmation back to client.
   * @param client The client.
   * @returns The player ID.
   */
  @SubscribeMessage('join')
  public async handleJoin(@ConnectedSocket() client: Socket) {
    try {
      // Generate unique player ID using timestamp.
      const playerId = `player_${Date.now()}`;

      // Create or get player from persistence layer.
      await this.persistenceService.createOrGetPlayer(playerId, client.id);

      // Load player's task history from persistence.
      const persistedTasks = await this.persistenceService.getPlayerTaskHistory(
        playerId
      );

      // Convert persisted tasks to active game tasks.
      const activeTasks: ITask[] = persistedTasks.map(
        this.convertPersistedTaskToTask
      );

      // Create active player instance for real-time operations.
      const activePlayer: IServerPlayer & { tasks: ITask[] } = {
        id: playerId,
        socketId: client.id,
        totalTasksCompleted: 0,
        totalMiningTime: 0,
        createdAt: Date.now(),
        lastActiveAt: Date.now(),
        tasks: activeTasks,
      };

      // Store active player in memory for fast real-time access.
      this.activePlayers.set(playerId, activePlayer);

      // Confirm connection to client.
      client.emit('joined', { playerId });

      console.log(
        `Player ${playerId} joined with socket ${client.id} (${activeTasks.length} tasks loaded)`
      );
    } catch (error) {
      console.error('Failed to handle player join:', error);
      client.emit('error', { message: 'Failed to join game' });
    }
  }

  /**
   * Task Start Handler - Core game logic.
   * Triggered when client emits 'startTask' event.
   *
   * Server-authoritative validation:
   * - Prevents multiple active tasks per player.
   * - Validates player exists.
   * - Manages task lifecycle with continuous loops.
   *
   * Flow:
   * 1. Find player by socket ID.
   * 2. Validate player exists.
   * 3. Check for existing active tasks (prevent spam).
   * 4. Create new task with server timestamp.
   * 5. Schedule continuous task loops for specified duration.
   * 6. Notify client of task start.
   * @param data The data.
   * @param client The client.
   */
  @SubscribeMessage('startTask')
  public handleStartTask(
    @MessageBody() data: { taskName: string; duration?: number },
    @ConnectedSocket() client: Socket
  ) {
    // Find player by socket ID. (O(n) lookup - could be optimized with reverse mapping).
    const player = Array.from(this.activePlayers.values()).find(
      (p) => p.socketId === client.id
    );

    // Validate player exists.
    if (!player) {
      client.emit('error', { message: 'Player not found' });
      return;
    }

    // Server-authoritative: Prevent multiple active tasks.
    const activeTask = player.tasks.find(
      (task) => !task.completed && task.startTime
    );
    if (activeTask) {
      client.emit('error', { message: 'You already have an active task' });
      return;
    }

    // Create new task with server-controlled timing.
    const taskDuration = data.duration || 2000; // Default 2 seconds per loop
    const loopDuration = 10000; // 10 seconds total loop duration
    const task: ITask = {
      id: `task_${Date.now()}`, // Unique task ID
      name: data.taskName, // Task name from client
      duration: taskDuration, // Duration per individual task loop
      startTime: Date.now(), // Server timestamp (prevents cheating)
      completed: false, // Initial state
    };

    // Add task to player's task list (real-time).
    player.tasks.push(task);

    // Persist task to database (durability).
    const persistedTask = this.convertTaskToPersistedTask(task, player.id);
    this.persistenceService.saveTask(persistedTask).catch((error) => {
      console.error(`Failed to persist task ${task.id}:`, error);
    });

    // Immediately notify client that task started.
    client.emit('taskStarted', { task });

    // Schedule continuous task loops for the specified duration.
    this.scheduleTaskLoops(client, player, task, loopDuration);

    console.log(
      `Task ${task.name} started for player ${player.id} (${loopDuration}ms duration)`
    );
  }

  /**
   * Schedules continuous task loops for a specified duration.
   * Creates multiple task completion cycles within the total duration.
   * @param client The client socket.
   * @param player The player object.
   * @param task The task to loop.
   * @param totalDuration Total duration for the looping in milliseconds.
   */
  private scheduleTaskLoops(
    client: Socket,
    player: IServerPlayer & { tasks: ITask[] },
    task: ITask,
    totalDuration: number
  ): void {
    const startTime = Date.now();
    let loopCount = 0;

    const runLoop = () => {
      const elapsed = Date.now() - startTime;

      // Check if we've exceeded the total duration.
      if (elapsed >= totalDuration) {
        // Final completion - mark task as completed.
        task.completed = true;

        // Persist final task completion.
        this.persistenceService.completeTask(task.id).catch((error) => {
          console.error(`Failed to complete final task ${task.id}:`, error);
        });

        // Notify client of final completion.
        client.emit('taskCompleted', {
          task: { ...task, completed: true },
          loopCount,
          totalDuration,
        });

        console.log(
          `Task ${task.name} completed ${loopCount} loops for player ${player.id} (${totalDuration}ms total)`
        );
        return;
      }

      // Complete current loop.
      loopCount++;

      // Calculate remaining time.
      const remainingTime = totalDuration - elapsed;

      // Debug logging
      console.log(`Loop ${loopCount} completed:`, {
        elapsed,
        totalDuration,
        remainingTime,
        taskName: task.name,
        playerId: player.id,
      });

      // Update task start time for next loop BEFORE notifying client.
      task.startTime = Date.now();

      // Notify client of loop completion.
      client.emit('taskLoopCompleted', {
        task: { ...task },
        loopCount,
        remainingTime,
      });

      // Schedule next loop.
      setTimeout(runLoop, task.duration);
    };

    // Start the first loop.
    setTimeout(runLoop, task.duration);
  }

  /**
   * Player State Query Handler.
   * Triggered when client emits 'getPlayerState' event.
   *
   * Purpose:
   * - Allows clients to sync their state with server.
   * - Useful for reconnection scenarios.
   * - Provides complete player data (all tasks).
   *
   * Flow:
   * 1. Find player by socket ID.
   * 2. Validate player exists.
   * 3. Send complete player state to client.
   * @param client The client.
   * @returns The player state.
   */
  @SubscribeMessage('getPlayerState')
  public handleGetPlayerState(@ConnectedSocket() client: Socket) {
    // Find player by socket ID.
    const player = Array.from(this.activePlayers.values()).find(
      (p) => p.socketId === client.id
    );

    // Validate player exists.
    if (!player) {
      client.emit('error', { message: 'Player not found' });
      return;
    }

    // Send complete player state to client.
    client.emit('playerState', {
      playerId: player.id,
      tasks: player.tasks, // All tasks (completed + active)
    });
  }
}
