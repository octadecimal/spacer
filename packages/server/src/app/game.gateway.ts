import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

interface Task {
  id: string;
  name: string;
  duration: number;
  startTime?: number;
  completed: boolean;
}

interface Player {
  id: string;
  socketId: string;
  tasks: Task[];
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
  },
})
export class GameGateway {
  @WebSocketServer()
  server!: Server;

  private players: Map<string, Player> = new Map();

  @SubscribeMessage('join')
  handleJoin(@ConnectedSocket() client: Socket) {
    const playerId = `player_${Date.now()}`;
    const player: Player = {
      id: playerId,
      socketId: client.id,
      tasks: [],
    };

    this.players.set(playerId, player);
    client.emit('joined', { playerId });

    console.log(`Player ${playerId} joined with socket ${client.id}`);
  }

  @SubscribeMessage('startTask')
  handleStartTask(
    @MessageBody() data: { taskName: string },
    @ConnectedSocket() client: Socket
  ) {
    const player = Array.from(this.players.values()).find(
      (p) => p.socketId === client.id
    );

    if (!player) {
      client.emit('error', { message: 'Player not found' });
      return;
    }

    // Check if player already has an active task
    const activeTask = player.tasks.find(
      (task) => !task.completed && task.startTime
    );
    if (activeTask) {
      client.emit('error', { message: 'You already have an active task' });
      return;
    }

    // Create new task
    const task: Task = {
      id: `task_${Date.now()}`,
      name: data.taskName,
      duration: 10000, // 10 seconds for Mine Asteroid
      startTime: Date.now(),
      completed: false,
    };

    player.tasks.push(task);

    // Notify client that task started
    client.emit('taskStarted', { task });

    // Set timeout to complete the task
    setTimeout(() => {
      task.completed = true;
      client.emit('taskCompleted', { task });
      console.log(`Task ${task.name} completed for player ${player.id}`);
    }, task.duration);

    console.log(`Task ${task.name} started for player ${player.id}`);
  }

  @SubscribeMessage('getPlayerState')
  handleGetPlayerState(@ConnectedSocket() client: Socket) {
    const player = Array.from(this.players.values()).find(
      (p) => p.socketId === client.id
    );

    if (!player) {
      client.emit('error', { message: 'Player not found' });
      return;
    }

    client.emit('playerState', {
      playerId: player.id,
      tasks: player.tasks,
    });
  }
}
