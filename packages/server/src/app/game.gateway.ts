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
import {
  ITask,
  ITaskConfig,
  getTaskConfig,
  getItemConfig,
  IInventoryItem,
} from '@spacer/shared';

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

  // Active task schedulers - continues running even when client disconnects.
  private activeTaskSchedulers: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Constructor.
   * @param persistenceService The persistence service.
   */
  public constructor(
    private readonly persistenceService: GamePersistenceService
  ) {
    // Set up disconnect handler when server is ready.
    setTimeout(() => {
      if (this.server) {
        this.server.on('disconnect', (client: Socket) => {
          this.handleDisconnect(client);
        });
      }
    }, 1000);
  }

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
   * Adds items to a player's inventory.
   * @param player The player to add items to.
   * @param itemId The item ID to add.
   * @param quantity The quantity to add.
   * @param client Optional socket client to notify of inventory update.
   * @returns Whether the operation was successful.
   */
  private addItemToInventory(
    player: IServerPlayer,
    itemId: string,
    quantity: number,
    client?: Socket
  ): boolean {
    const itemConfig = getItemConfig(itemId);
    if (!itemConfig) {
      console.error(`Item config not found for item: ${itemId}`);
      return false;
    }

    const existingItem = player.inventory.items[itemId];
    const now = Date.now();

    if (existingItem) {
      // Item already exists, add to quantity
      existingItem.quantity += quantity;
    } else {
      // New item, create inventory entry
      const newItem: IInventoryItem = {
        itemId,
        quantity,
        acquiredAt: now,
      };
      player.inventory.items[itemId] = newItem;
    }

    // Update total items count
    player.inventory.totalItems += quantity;

    console.log(
      `Added ${quantity} ${itemConfig.name} to player ${player.id}'s inventory`
    );

    // Persist inventory changes to storage
    this.persistenceService.updatePlayer(player).catch((error) => {
      console.error(
        `Failed to persist inventory update for player ${player.id}:`,
        error
      );
    });

    // Notify client of inventory update if socket is provided
    if (client) {
      client.emit('inventoryUpdated', { inventory: player.inventory });
    }

    return true;
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
  public async handleJoin(
    @MessageBody() data: { username: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      // Use username as player ID for persistence.
      const playerId = data.username;

      // Create or get player from persistence layer.
      const persistedPlayer = await this.persistenceService.createOrGetPlayer(
        playerId,
        client.id
      );

      // Load player's task history from persistence.
      const persistedTasks = await this.persistenceService.getPlayerTaskHistory(
        playerId
      );

      // Convert persisted tasks to active game tasks.
      const activeTasks: ITask[] = persistedTasks.map(
        this.convertPersistedTaskToTask
      );

      // Create active player instance using persisted data.
      const activePlayer: IServerPlayer & { tasks: ITask[] } = {
        ...persistedPlayer,
        socketId: client.id,
        tasks: activeTasks,
      };

      // Store active player in memory for fast real-time access.
      this.activePlayers.set(playerId, activePlayer);

      // Resume any active tasks for this player.
      await this.resumeActiveTasks(activePlayer);

      // Find the current active task (if any) to send to client.
      // Check after resumeActiveTasks in case it modified the task state.
      const currentActiveTask = activePlayer.tasks.find(
        (task) => !task.completed && task.startTime
      );

      // Confirm connection to client with inventory data and current task state.
      client.emit('joined', {
        playerId,
        inventory: activePlayer.inventory,
        currentTask: currentActiveTask || null,
      });

      console.log(
        `Player ${playerId} joined with socket ${client.id} (${activeTasks.length} tasks loaded)`
      );
    } catch (error) {
      console.error('Failed to handle player join:', error);
      client.emit('error', { message: 'Failed to join game' });
    }
  }

  /**
   * Handle client disconnection.
   * Cleans up active task schedulers but keeps tasks running server-side.
   * @param client The disconnected client.
   */
  public handleDisconnect(client: Socket): void {
    // Find the player associated with this socket.
    for (const [playerId, player] of this.activePlayers.entries()) {
      if (player.socketId === client.id) {
        console.log(`Player ${playerId} disconnected (socket ${client.id})`);

        // Remove from active players but keep tasks running server-side.
        this.activePlayers.delete(playerId);

        // Note: We don't clear the task scheduler here because tasks should continue
        // running even when the client disconnects. The scheduler will be cleared
        // when the task completes or when the player reconnects.
        break;
      }
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

    // Get task configuration from shared config.
    const taskConfig = getTaskConfig('MINE_ASTEROID'); // For now, hardcode to mine asteroid
    if (!taskConfig) {
      client.emit('error', { message: 'Task configuration not found' });
      return;
    }

    // Create new task with server-controlled timing from config.
    const task: ITask = {
      id: `task_${Date.now()}`, // Unique task ID
      name: taskConfig.name, // Task name from config
      duration: taskConfig.loopDuration, // Duration per individual task loop from config
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
    this.scheduleTaskLoops(player, task, taskConfig);

    console.log(
      `Task ${task.name} started for player ${player.id} (${taskConfig.totalDuration}ms duration)`
    );
  }

  /**
   * Schedules continuous task loops for a specified duration.
   * Creates multiple task completion cycles within the total duration.
   * Works server-side even when client disconnects.
   * @param player The player object.
   * @param task The task to loop.
   * @param taskConfig The task configuration containing duration and rewards.
   */
  private scheduleTaskLoops(
    player: IServerPlayer & { tasks: ITask[] },
    task: ITask,
    taskConfig: ITaskConfig
  ): void {
    const startTime = Date.now();
    let loopCount = 0;

    const runLoop = () => {
      const elapsed = Date.now() - startTime;

      // Check if we've exceeded the total duration.
      if (elapsed >= taskConfig.totalDuration) {
        // Final completion - mark task as completed.
        task.completed = true;

        // Persist final task completion.
        this.persistenceService.completeTask(task.id).catch((error) => {
          console.error(`Failed to complete final task ${task.id}:`, error);
        });

        // Notify connected client if available.
        const activePlayer = this.activePlayers.get(player.id);
        if (activePlayer?.socketId) {
          const client = this.server.sockets.sockets.get(activePlayer.socketId);
          if (client) {
            client.emit('taskCompleted', {
              task: { ...task, completed: true },
              loopCount,
              totalDuration: taskConfig.totalDuration,
            });
          }
        }

        // Clear the scheduler.
        this.activeTaskSchedulers.delete(player.id);

        console.log(
          `Task ${task.name} completed ${loopCount} loops for player ${player.id} (${taskConfig.totalDuration}ms total)`
        );
        return;
      }

      // Complete current loop.
      loopCount++;

      // Give rewards for this completed loop.
      if (taskConfig.rewardsPerLoop) {
        for (const [itemId, quantityPerLoop] of Object.entries(
          taskConfig.rewardsPerLoop
        )) {
          this.addItemToInventory(player, itemId, quantityPerLoop);
        }
      }

      // Calculate remaining time.
      const remainingTime = taskConfig.totalDuration - elapsed;

      // Debug logging
      console.log(`Loop ${loopCount} completed:`, {
        elapsed,
        totalDuration: taskConfig.totalDuration,
        remainingTime,
        taskName: task.name,
        playerId: player.id,
      });

      // Update task start time for next loop BEFORE notifying client.
      task.startTime = Date.now();

      // Notify connected client if available.
      const activePlayer = this.activePlayers.get(player.id);
      if (activePlayer?.socketId) {
        const client = this.server.sockets.sockets.get(activePlayer.socketId);
        if (client) {
          client.emit('taskLoopCompleted', {
            task: { ...task },
            loopCount,
            remainingTime,
          });
        }
      }

      // Schedule next loop.
      setTimeout(runLoop, task.duration);
    };

    // Store the scheduler for this player.
    const scheduler = setTimeout(runLoop, task.duration);
    this.activeTaskSchedulers.set(player.id, scheduler);
  }

  /**
   * Resumes active tasks for a player when they reconnect.
   * Checks for any running tasks and resumes their execution.
   * @param player The player object.
   */
  private async resumeActiveTasks(
    player: IServerPlayer & { tasks: ITask[] }
  ): Promise<void> {
    // Check if player already has an active scheduler.
    if (this.activeTaskSchedulers.has(player.id)) {
      console.log(
        `Player ${player.id} already has active tasks running - updating active player reference`
      );
      // Update the active player reference so the scheduler can notify the new client
      this.activePlayers.set(player.id, player);
      return;
    }

    // Look for any active (non-completed and started) tasks.
    const activeTasks = player.tasks.filter(
      (task) => !task.completed && task.startTime
    );

    if (activeTasks.length === 0) {
      console.log(`No active tasks to resume for player ${player.id}`);
      return;
    }

    // Resume the most recent active task.
    const activeTask = activeTasks[activeTasks.length - 1];
    const taskConfig = getTaskConfig(activeTask.name);

    if (!taskConfig) {
      console.error(`No task config found for active task: ${activeTask.name}`);
      return;
    }

    console.log(
      `Resuming active task ${activeTask.name} for player ${player.id}`
    );

    // Resume the task loops.
    this.scheduleTaskLoops(player, activeTask, taskConfig);
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
