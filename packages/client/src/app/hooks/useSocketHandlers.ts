import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { IGameState } from '../../types/index';
import { ITask, ISocketEvents, IInventory } from '@spacer/shared';

/**
 * Custom hook for managing socket event handlers.
 * Handles all socket communication and updates game state accordingly.
 */
export function useSocketHandlers(
  socket: Socket<ISocketEvents> | null,
  username: string | undefined,
  setGameState: React.Dispatch<React.SetStateAction<IGameState>>,
  addLog: (
    level: 'info' | 'warn' | 'error' | 'debug',
    message: string,
    data?: unknown
  ) => void,
  progressHelpers: {
    initializeTaskProgress: (task: ITask, taskConfigId?: string) => void;
    updateLoopProgress: (loopCount: number, remainingTime: number) => void;
    completeTaskProgress: (loopCount: number) => void;
  }
) {
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
        progressHelpers.initializeTaskProgress(data.currentTask);
      }

      setGameState((prev: IGameState) => ({
        ...prev,
        playerId: data.playerId,
        inventory: data.inventory,
        currentTask: data.currentTask,
        taskProgress: 0, // Reset progress, will be calculated by useEffect
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

      progressHelpers.initializeTaskProgress(data.task);
    };

    // Server completes a task loop (but task continues).
    const handleTaskLoopCompleted = (data: {
      task: ITask;
      loopCount: number;
      remainingTime: number;
    }) => {
      console.log('Task loop completed:', data);
      addLog('info', `Task loop ${data.loopCount} completed`, data);

      progressHelpers.updateLoopProgress(data.loopCount, data.remainingTime);

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

      progressHelpers.completeTaskProgress(data.loopCount || 0);

      alert(
        `Task "${data.task.name}" completed! (${data.loopCount || 0} loops)`
      );
    };

    // Handle server-side validation errors (e.g., multiple active tasks).
    const handleError = (data: {
      message: string;
      code?: string;
      details?: unknown;
    }) => {
      console.error('Server error:', data.message, data);
      addLog(
        'error',
        `Server error [${data.code || 'UNKNOWN'}]: ${data.message}`,
        data
      );

      // Show user-friendly error message
      const userMessage =
        data.code === 'TASK_ERROR' && data.message.includes('active task')
          ? 'You already have a task running. Please wait for it to complete.'
          : data.message;

      alert(`Error: ${userMessage}`);
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
  }, [socket, username, setGameState, addLog, progressHelpers]);
}
