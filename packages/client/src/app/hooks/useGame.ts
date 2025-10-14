import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { Task, GameState, SocketEvents } from '../types';

/**
 * Custom hook managing game state and Socket.IO communication
 * Handles task lifecycle, progress tracking, and server synchronization
 */
export function useGame(socket: Socket<SocketEvents> | null) {
  // Centralized game state - single source of truth
  const [gameState, setGameState] = useState<GameState>({
    playerId: null,
    currentTask: null,
    taskProgress: 0,
    isConnected: false,
  });

  // Socket event handlers and connection management
  useEffect(() => {
    if (!socket) return;

    // Server confirms player joined with unique ID
    const handleJoined = (data: { playerId: string }) => {
      console.log('Joined game with player ID:', data.playerId);
      setGameState((prev) => ({ ...prev, playerId: data.playerId }));
    };

    // Server starts a task - reset progress and store task data
    const handleTaskStarted = (data: { task: Task }) => {
      console.log('Task started:', data.task);
      setGameState((prev) => ({
        ...prev,
        currentTask: data.task,
        taskProgress: 0,
      }));
    };

    // Server completes task - clear current task and show completion
    const handleTaskCompleted = (data: { task: Task }) => {
      console.log('Task completed:', data.task);
      setGameState((prev) => ({
        ...prev,
        currentTask: null,
        taskProgress: 0,
      }));
      alert(`Task "${data.task.name}" completed!`);
    };

    // Handle server-side validation errors (e.g., multiple active tasks)
    const handleError = (data: { message: string }) => {
      console.error('Server error:', data.message);
      alert(`Error: ${data.message}`);
    };

    // Register event listeners
    socket.on('joined', handleJoined);
    socket.on('taskStarted', handleTaskStarted);
    socket.on('taskCompleted', handleTaskCompleted);
    socket.on('error', handleError);

    // Auto-join game on socket connection
    socket.emit('join');

    // Cleanup: remove listeners to prevent memory leaks
    return () => {
      socket.off('joined', handleJoined);
      socket.off('taskStarted', handleTaskStarted);
      socket.off('taskCompleted', handleTaskCompleted);
      socket.off('error', handleError);
    };
  }, [socket]);

  // Real-time progress tracking for active tasks
  useEffect(() => {
    if (!gameState.currentTask?.startTime) return;

    // Update progress every 100ms for smooth UI updates
    const interval = setInterval(() => {
      const currentTask = gameState.currentTask;
      if (!currentTask?.startTime) return;

      const elapsed = Date.now() - currentTask.startTime;
      const progress = Math.min((elapsed / currentTask.duration) * 100, 100);
      setGameState((prev) => ({ ...prev, taskProgress: progress }));
    }, 100);

    return () => clearInterval(interval);
  }, [gameState.currentTask]);

  // Request server to start a new task (server-authoritative)
  const startTask = (taskName: string) => {
    if (socket && !gameState.currentTask) {
      socket.emit('startTask', { taskName });
    }
  };

  // Calculate remaining time for current task (client-side display only)
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
    startTask,
    getRemainingTime,
  };
}
