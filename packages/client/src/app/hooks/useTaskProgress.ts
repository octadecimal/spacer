import { useState, useEffect } from 'react';
import { ITask, getTaskConfig } from '@spacer/shared';

/**
 * Custom hook for managing task progress tracking.
 * Handles both individual loop progress and overall task progress.
 */
export function useTaskProgress() {
  const [loopCount, setLoopCount] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(0);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [taskStartTime, setTaskStartTime] = useState<number>(0);

  /**
   * Resets all progress tracking state.
   */
  const resetProgress = () => {
    setLoopCount(0);
    setRemainingTime(0);
    setOverallProgress(0);
    setTaskStartTime(0);
  };

  /**
   * Initializes progress tracking for a new task.
   * @param task - The task to track.
   * @param taskConfigId - The task configuration ID (defaults to 'MINE_ASTEROID').
   */
  const initializeTaskProgress = (
    task: ITask,
    taskConfigId: string = 'MINE_ASTEROID'
  ) => {
    setLoopCount(0);
    setRemainingTime(getTaskConfig(taskConfigId)?.totalDuration || 10000);
    setOverallProgress(0);
    setTaskStartTime(task.startTime || Date.now());
  };

  /**
   * Updates progress when a task loop completes.
   * @param loopCount - Current loop count.
   * @param remainingTime - Remaining time in the task.
   */
  const updateLoopProgress = (loopCount: number, remainingTime: number) => {
    setLoopCount(loopCount);
    setRemainingTime(remainingTime);
  };

  /**
   * Completes the task progress tracking.
   * @param loopCount - Final loop count.
   */
  const completeTaskProgress = (loopCount: number) => {
    setLoopCount(loopCount);
    setRemainingTime(0);
    setOverallProgress(100);
    setTaskStartTime(0);
  };

  /**
   * Calculates current task progress based on elapsed time.
   * @param currentTask - The current active task.
   * @returns Progress percentage (0-100).
   */
  const calculateTaskProgress = (currentTask: ITask | null): number => {
    if (!currentTask?.startTime) return 0;

    const elapsed = Date.now() - currentTask.startTime;
    return Math.min((elapsed / currentTask.duration) * 100, 100);
  };

  /**
   * Calculates overall progress based on task start time.
   * @param taskConfigId - The task configuration ID.
   * @returns Progress percentage (0-100).
   */
  const calculateOverallProgress = (
    taskConfigId: string = 'MINE_ASTEROID'
  ): number => {
    if (!taskStartTime) return 0;

    const taskConfig = getTaskConfig(taskConfigId);
    if (!taskConfig) return 0;

    const elapsed = Date.now() - taskStartTime;
    return Math.min((elapsed / taskConfig.totalDuration) * 100, 100);
  };

  return {
    loopCount,
    remainingTime,
    overallProgress,
    taskStartTime,
    resetProgress,
    initializeTaskProgress,
    updateLoopProgress,
    completeTaskProgress,
    calculateTaskProgress,
    calculateOverallProgress,
  };
}
