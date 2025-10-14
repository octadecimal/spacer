import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { IGameState } from '../../types/index';
import { ITask, ISocketEvents } from '@spacer/shared';
import { ILogEntry } from '../../components/DevelopmentLog';

/**
 * Custom hook managing game state and Socket.IO communication.
 * Handles task lifecycle, progress tracking, and server synchronization.
 */
export function useGame(socket: Socket<ISocketEvents> | null) {
  // Centralized game state - single source of truth.
  const [gameState, setGameState] = useState<IGameState>({
    playerId: null,
    currentTask: null,
    taskProgress: 0,
    isConnected: false,
  });

  // Development log entries for debugging and monitoring.
  const [logs, setLogs] = useState<ILogEntry[]>([]);

  /**
   * Adds a new log entry to the development log.
   * @param level - Log level (info, warn, error, debug).
   * @param message - Log message content.
   * @param data - Optional additional data to log.
   */
  const addLog = (
    level: ILogEntry['level'],
    message: string,
    data?: unknown
  ) => {
    const logEntry: ILogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      message,
      data,
    };

    setLogs((prevLogs) => [...prevLogs, logEntry].slice(-100)); // Keep last 100 entries.
  };

  // Socket event handlers and connection management.
  useEffect(() => {
    if (!socket) return;

    // Server confirms player joined with unique ID.
    const handleJoined = (data: { playerId: string }) => {
      console.log('Joined game with player ID:', data.playerId);
      addLog('info', `Joined game with player ID: ${data.playerId}`, data);
      setGameState((prev: IGameState) => ({
        ...prev,
        playerId: data.playerId,
      }));
    };

    // Server starts a task - reset progress and store task data.
    const handleTaskStarted = (data: { task: ITask }) => {
      console.log('Task started:', data.task);
      addLog('info', `Task started: ${data.task.name}`, data.task);
      setGameState((prev: IGameState) => ({
        ...prev,
        currentTask: data.task,
        taskProgress: 0,
      }));
    };

    // Server completes task - clear current task and show completion.
    const handleTaskCompleted = (data: { task: ITask }) => {
      console.log('Task completed:', data.task);
      addLog('info', `Task completed: ${data.task.name}`, data.task);
      setGameState((prev: IGameState) => ({
        ...prev,
        currentTask: null,
        taskProgress: 0,
      }));
      alert(`Task "${data.task.name}" completed!`);
    };

    // Handle server-side validation errors (e.g., multiple active tasks).
    const handleError = (data: { message: string }) => {
      console.error('Server error:', data.message);
      addLog('error', `Server error: ${data.message}`, data);
      alert(`Error: ${data.message}`);
    };

    // Register event listeners.
    socket.on('joined', handleJoined);
    socket.on('taskStarted', handleTaskStarted);
    socket.on('taskCompleted', handleTaskCompleted);
    socket.on('error', handleError);

    // Auto-join game on socket connection.
    addLog('info', 'Socket connected, joining game...');
    socket.emit('join');

    // Cleanup: remove listeners to prevent memory leaks.
    return () => {
      addLog('warn', 'Socket disconnected, cleaning up listeners');
      socket.off('joined', handleJoined);
      socket.off('taskStarted', handleTaskStarted);
      socket.off('taskCompleted', handleTaskCompleted);
      socket.off('error', handleError);
    };
  }, [socket]);

  // Real-time progress tracking for active tasks.
  useEffect(() => {
    if (!gameState.currentTask?.startTime) return;

    // Update progress every 100ms for smooth UI updates.
    const interval = setInterval(() => {
      const currentTask = gameState.currentTask;
      if (!currentTask?.startTime) return;

      const elapsed = Date.now() - currentTask.startTime;
      const progress = Math.min((elapsed / currentTask.duration) * 100, 100);
      setGameState((prev: IGameState) => ({ ...prev, taskProgress: progress }));
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.currentTask]);

  // Request server to start a new task (server-authoritative).
  const startTask = (taskName: string) => {
    if (socket && !gameState.currentTask) {
      addLog('debug', `Requesting to start task: ${taskName}`);
      socket.emit('startTask', { taskName });
    } else if (gameState.currentTask) {
      addLog('warn', 'Cannot start task: another task is already active');
    } else {
      addLog('error', 'Cannot start task: socket not connected');
    }
  };

  // Calculate remaining time for current task (client-side display only).
  const getRemainingTime = (): number => {
    const currentTask = gameState.currentTask;
    if (!currentTask?.startTime) return 0;

    return Math.max(
      0,
      Math.round(
        (currentTask.duration - (Date.now() - currentTask.startTime)) / 1000
      )
    );
  };

  return {
    gameState,
    logs,
    startTask,
    getRemainingTime,
  };
}
