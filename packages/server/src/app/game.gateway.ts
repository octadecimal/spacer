import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

/**
 * Core game data structures
 * These interfaces define the shape of our game state
 */
interface Task {
  id: string; // Unique task identifier
  name: string; // Human-readable task name (e.g., "Mine Asteroid")
  duration: number; // Task duration in milliseconds
  startTime?: number; // Unix timestamp when task started
  completed: boolean; // Task completion status
}

interface Player {
  id: string; // Unique player identifier
  socketId: string; // Socket.IO connection ID (maps to client)
  tasks: Task[]; // Array of all tasks (completed + active)
}

/**
 * WebSocket Gateway - Server-side game logic hub
 * Handles all real-time communication between clients and server
 *
 * Architecture:
 * - Server-authoritative: All game state changes happen here
 * - Event-driven: Uses Socket.IO events for client-server communication
 * - Stateful: Maintains player state in memory (Map-based storage)
 */
@Injectable()
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200', // Allow client connections
    methods: ['GET', 'POST'],
  },
})
export class GameGateway {
  @WebSocketServer()
  server!: Server; // Socket.IO server instance

  // In-memory player storage (Map for O(1) lookups by player ID)
  // In production, consider Redis or database for persistence
  private players: Map<string, Player> = new Map();

  /**
   * Player Connection Handler
   * Triggered when client emits 'join' event
   *
   * Flow:
   * 1. Generate unique player ID (timestamp-based)
   * 2. Create player object with empty task list
   * 3. Store player in memory (Map)
   * 4. Send confirmation back to client
   */
  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket) {
    // Generate unique player ID using timestamp
    const playerId = `player_${Date.now()}`;

    // Create new player instance
    const player: Player = {
      id: playerId,
      socketId: client.id, // Maps to Socket.IO connection
      tasks: [], // Start with empty task list
    };

    // Store player in memory for future lookups
    this.players.set(playerId, player);

    // Confirm connection to client
    client.emit('joined', { playerId });

    console.log(`Player ${playerId} joined with socket ${client.id}`);
  }

  /**
   * Task Start Handler - Core game logic
   * Triggered when client emits 'startTask' event
   *
   * Server-authoritative validation:
   * - Prevents multiple active tasks per player
   * - Validates player exists
   * - Manages task lifecycle with setTimeout
   *
   * Flow:
   * 1. Find player by socket ID
   * 2. Validate player exists
   * 3. Check for existing active tasks (prevent spam)
   * 4. Create new task with server timestamp
   * 5. Schedule task completion with setTimeout
   * 6. Notify client of task start
   */
  @SubscribeMessage('startTask')
  handleStartTask(
    @MessageBody() data: { taskName: string },
    @ConnectedSocket() client: Socket
  ) {
    // Find player by socket ID (O(n) lookup - could be optimized with reverse mapping)
    const player = Array.from(this.players.values()).find(
      (p) => p.socketId === client.id
    );

    // Validate player exists
    if (!player) {
      client.emit('error', { message: 'Player not found' });
      return;
    }

    // Server-authoritative: Prevent multiple active tasks
    const activeTask = player.tasks.find(
      (task) => !task.completed && task.startTime
    );
    if (activeTask) {
      client.emit('error', { message: 'You already have an active task' });
      return;
    }

    // Create new task with server-controlled timing
    const task: Task = {
      id: `task_${Date.now()}`, // Unique task ID
      name: data.taskName, // Task name from client
      duration: 10000, // Fixed duration (10 seconds)
      startTime: Date.now(), // Server timestamp (prevents cheating)
      completed: false, // Initial state
    };

    // Add task to player's task list
    player.tasks.push(task);

    // Immediately notify client that task started
    client.emit('taskStarted', { task });

    // Schedule task completion (server-authoritative timing)
    setTimeout(() => {
      task.completed = true;
      client.emit('taskCompleted', { task });
      console.log(`Task ${task.name} completed for player ${player.id}`);
    }, task.duration);

    console.log(`Task ${task.name} started for player ${player.id}`);
  }

  /**
   * Player State Query Handler
   * Triggered when client emits 'getPlayerState' event
   *
   * Purpose:
   * - Allows clients to sync their state with server
   * - Useful for reconnection scenarios
   * - Provides complete player data (all tasks)
   *
   * Flow:
   * 1. Find player by socket ID
   * 2. Validate player exists
   * 3. Send complete player state to client
   */
  @SubscribeMessage('getPlayerState')
  handleGetPlayerState(@ConnectedSocket() client: Socket) {
    // Find player by socket ID
    const player = Array.from(this.players.values()).find(
      (p) => p.socketId === client.id
    );

    // Validate player exists
    if (!player) {
      client.emit('error', { message: 'Player not found' });
      return;
    }

    // Send complete player state to client
    client.emit('playerState', {
      playerId: player.id,
      tasks: player.tasks, // All tasks (completed + active)
    });
  }
}
