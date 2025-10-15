import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { IGameState } from '../../types/index';
import {
  ITask,
  ISocketEvents,
  getTaskConfig,
  IInventory,
} from '@spacer/shared';
import { ILogEntry } from '../../components/DevelopmentLog';

/**
 * Custom hook managing game state and Socket.IO communication.
 * Handles task lifecycle, progress tracking, and server synchronization.
 * @param socket The socket connection.
 * @param username The username for authentication.
 */
export function useGame(
  socket: Socket<ISocketEvents> | null,
  username?: string
) {
  // Centralized game state - single source of truth.
  const [gameState, setGameState] = useState<IGameState>({
    playerId: null,
    currentTask: null,
    taskProgress: 0,
    isConnected: false,
    inventory: {
      items: {},
      maxSlots: 50,
      totalItems: 0,
    },
  });

  // Development log entries for debugging and monitoring.
  const [logs, setLogs] = useState<ILogEntry[]>([]);

  // Task looping state for continuous tasks.
  const [loopCount, setLoopCount] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [taskStartTime, setTaskStartTime] = useState<number>(0);

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

    // Server confirms player joined with unique ID, inventory, and current task state.
    const handleJoined = (data: {
      playerId: string;
      inventory: IInventory;
      currentTask: ITask | null;
    }) => {
      console.log('Joined game with player ID:', data.playerId);
      addLog('info', `Joined game with player ID: ${data.playerId}`, data);

      // If there's an active task, set up the client state to track it.
      if (data.currentTask) {
        addLog(
          'info',
          `Resuming active task: ${data.currentTask.name}`,
          data.currentTask
        );
        setTaskStartTime(data.currentTask.startTime || Date.now());
        setLoopCount(0); // Will be updated by server when next loop completes
        setOverallProgress(0); // Will be calculated based on task start time
      }

      setGameState((prev: IGameState) => ({
        ...prev,
        playerId: data.playerId,
        inventory: data.inventory,
        currentTask: data.currentTask,
        taskProgress: data.currentTask ? 0 : 0, // Reset progress, will be calculated by useEffect
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
      setLoopCount(0);
      setRemainingTime(getTaskConfig('MINE_ASTEROID')?.totalDuration || 10000); // Use config or fallback
      setOverallProgress(0); // Reset overall progress
      setTaskStartTime(data.task.startTime || Date.now()); // Store the original task start time
    };

    // Server completes a task loop (but task continues).
    const handleTaskLoopCompleted = (data: {
      task: ITask;
      loopCount: number;
      remainingTime: number;
    }) => {
      console.log('Task loop completed:', data);
      addLog('info', `Task loop ${data.loopCount} completed`, data);
      setLoopCount(data.loopCount);
      setRemainingTime(data.remainingTime);

      // Update the task with the new start time for the next loop.
      setGameState((prev: IGameState) => ({
        ...prev,
        currentTask: data.task, // This includes the updated startTime
        taskProgress: 0, // Reset progress for the new loop
      }));
    };

    // Server completes task - clear current task and show completion.
    const handleTaskCompleted = (data: {
      task: ITask;
      loopCount?: number;
      totalDuration?: number;
    }) => {
      console.log('Task completed:', data.task);
      addLog(
        'info',
        `Task completed: ${data.task.name} (${data.loopCount || 0} loops)`,
        data.task
      );
      setGameState((prev: IGameState) => ({
        ...prev,
        currentTask: null,
        taskProgress: 100,
      }));
      setLoopCount(0);
      setRemainingTime(0);
      setOverallProgress(100); // Set to 100% when task completes
      setTaskStartTime(0); // Reset task start time
      alert(
        `Task "${data.task.name}" completed! (${data.loopCount || 0} loops)`
      );
    };

    // Handle server-side validation errors (e.g., multiple active tasks).
    const handleError = (data: { message: string }) => {
      console.error('Server error:', data.message);
      addLog('error', `Server error: ${data.message}`, data);
      alert(`Error: ${data.message}`);
    };

    // Handle inventory updates from server.
    const handleInventoryUpdated = (data: { inventory: IInventory }) => {
      console.log('Inventory updated:', data.inventory);
      addLog('info', 'Inventory updated', data.inventory);
      setGameState((prev: IGameState) => ({
        ...prev,
        inventory: data.inventory,
      }));
    };

    // Register event listeners.
    socket.on('joined', handleJoined);
    socket.on('taskStarted', handleTaskStarted);
    socket.on('taskLoopCompleted', handleTaskLoopCompleted);
    socket.on('taskCompleted', handleTaskCompleted);
    socket.on('error', handleError);
    socket.on('inventoryUpdated', handleInventoryUpdated);

    // Auto-join game on socket connection.
    addLog('info', 'Socket connected, joining game...');
    if (username) {
      socket.emit('join', { username });
    }

    // Cleanup: remove listeners to prevent memory leaks.
    return () => {
      addLog('warn', 'Socket disconnected, cleaning up listeners');
      socket.off('joined', handleJoined);
      socket.off('taskStarted', handleTaskStarted);
      socket.off('taskLoopCompleted', handleTaskLoopCompleted);
      socket.off('taskCompleted', handleTaskCompleted);
      socket.off('error', handleError);
      socket.off('inventoryUpdated', handleInventoryUpdated);
    };
  }, [socket, username]);

  // Real-time progress tracking for active tasks.
  useEffect(() => {
    if (!gameState.currentTask?.startTime) return;

    // Update progress every 1 second for smoother UI updates.
    const interval = setInterval(() => {
      const currentTask = gameState.currentTask;
      if (!currentTask?.startTime) return;

      const elapsed = Date.now() - currentTask.startTime;
      const progress = Math.min((elapsed / currentTask.duration) * 100, 100);
      setGameState((prev: IGameState) => ({ ...prev, taskProgress: progress }));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.currentTask]);

  // Real-time overall progress tracking for the full cycle.
  useEffect(() => {
    if (!taskStartTime) return;

    const taskConfig = getTaskConfig('MINE_ASTEROID'); // For now, hardcode to mine asteroid
    if (!taskConfig) return;

    const totalDuration = taskConfig.totalDuration;

    const interval = setInterval(() => {
      const elapsed = Date.now() - taskStartTime;
      const progress = Math.min((elapsed / totalDuration) * 100, 100);
      setOverallProgress(progress);
    }, 1000);

    return () => clearInterval(interval);
  }, [taskStartTime]);

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
    loopCount,
    remainingTime,
    overallProgress,
    startTask,
    getRemainingTime,
  };
}
