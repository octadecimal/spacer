import { Progress } from '@/components/ui/progress';
import { FormatUtils } from '@/lib/formatUtils';
import { spacing } from '@/app/styles';

/**
 * Props for the TaskProgress component.
 */
interface ITaskProgressProps {
  /**
   * Current task progress percentage (0-100).
   */
  taskProgress: number;

  /**
   * Overall progress percentage (0-100).
   */
  overallProgress: number;

  /**
   * Current loop count.
   */
  loopCount: number;

  /**
   * Remaining time in milliseconds.
   */
  remainingTime: number;

  /**
   * Whether to show debug information.
   */
  showDebug?: boolean;

  /**
   * Additional CSS classes.
   */
  className?: string;
}

/**
 * Task progress component.
 * Displays both individual loop progress and overall task progress.
 */
export function TaskProgress({
  taskProgress,
  overallProgress,
  loopCount,
  remainingTime,
  showDebug = false,
  className,
}: ITaskProgressProps) {
  return (
    <div className={spacing.progress}>
      {/* Individual loop progress */}
      <div className="flex justify-between text-sm">
        <span>Mining Progress</span>
        <span>{FormatUtils.formatPercentage(taskProgress)}</span>
      </div>
      <Progress value={taskProgress} className="w-full" />

      {/* Overall cycle progress */}
      <div className="mt-2">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>Overall Progress</span>
          <span>{FormatUtils.formatPercentage(overallProgress)}</span>
        </div>
        <Progress value={overallProgress} className="w-full h-1" />
      </div>

      {/* Debug information */}
      {showDebug && (
        <div className="text-xs text-red-500 text-center">
          Debug: {FormatUtils.formatPercentage(taskProgress, 2)} | Loop:{' '}
          {loopCount} | Remaining:{' '}
          {FormatUtils.formatRemainingTime(remainingTime)}
        </div>
      )}

      {/* User-friendly progress info */}
      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>Loop {loopCount} completed</p>
        <p>{FormatUtils.formatRemainingTime(remainingTime)}</p>
      </div>
    </div>
  );
}
