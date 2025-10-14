export interface Task {
  id: string;
  name: string;
  duration: number;
  startTime?: number;
  completed: boolean;
}

export interface PlayerState {
  playerId: string;
  tasks: Task[];
}

export interface SocketEvents {
  // Client to server events
  join: () => void;
  startTask: (data: { taskName: string }) => void;
  getPlayerState: () => void;

  // Server to client events
  joined: (data: { playerId: string }) => void;
  taskStarted: (data: { task: Task }) => void;
  taskCompleted: (data: { task: Task }) => void;
  playerState: (data: PlayerState) => void;
  error: (data: { message: string }) => void;
}

export interface GameState {
  playerId: string | null;
  currentTask: Task | null;
  taskProgress: number;
  isConnected: boolean;
}
