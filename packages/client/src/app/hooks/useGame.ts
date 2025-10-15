import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { IGameState } from '../../types/index';
import { ISocketEvents } from '@spacer/shared';
import { useLogger } from './useLogger';
import { useTaskProgress } from './useTaskProgress';
import { useSocketHandlers } from './useSocketHandlers';

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

  // Custom hooks for separated concerns.
  const { logs, addLog } = useLogger();
  const {
    loopCount,
    remainingTime,
    overallProgress,
    initializeTaskProgress,
    updateLoopProgress,
    completeTaskProgress,
    calculateTaskProgress,
    calculateOverallProgress,
  } = useTaskProgress();

  // Set up socket event handlers.
  useSocketHandlers(socket, username, setGameState, addLog, {
    initializeTaskProgress,
    updateLoopProgress,
    completeTaskProgress,
  });

  // Real-time progress tracking for active tasks.
  useEffect(() => {
    if (!gameState.currentTask?.startTime) return;

    // Update progress every 1 second for smoother UI updates.
    const interval = setInterval(() => {
      const progress = calculateTaskProgress(gameState.currentTask);
      setGameState((prev: IGameState) => ({ ...prev, taskProgress: progress }));
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.currentTask, calculateTaskProgress]);

  // Real-time overall progress tracking for the full cycle.
  useEffect(() => {
    const interval = setInterval(() => {
      const progress = calculateOverallProgress();
      setGameState((prev: IGameState) => ({
        ...prev,
        overallProgress: progress,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateOverallProgress]);

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
    gameState: {
      ...gameState,
      overallProgress,
    },
    logs,
    loopCount,
    remainingTime,
    startTask,
    getRemainingTime,
  };
}
