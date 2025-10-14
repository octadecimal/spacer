import React from 'react';
import { cn, typography } from '@/app/styles';

/**
 * Log entry interface for development logging.
 */
export interface ILogEntry {
  /**
   * Unique identifier for the log entry.
   */
  id: string;

  /**
   * Timestamp when the log entry was created.
   */
  timestamp: Date;

  /**
   * Log level (info, warn, error, debug).
   */
  level: 'info' | 'warn' | 'error' | 'debug';

  /**
   * Log message content.
   */
  message: string;

  /**
   * Optional additional data to display.
   */
  data?: unknown;
}

/**
 * Props for the DevelopmentLog component.
 */
export interface IDevelopmentLogProps {
  /**
   * Array of log entries to display.
   */
  logs: ILogEntry[];

  /**
   * Optional CSS class name for styling.
   */
  className?: string;
}

/**
 * Development log component for displaying real-time game events.
 * Shows a scrollable list of log entries with timestamps and levels.
 */
export const DevelopmentLog: React.FC<IDevelopmentLogProps> = ({
  logs,
  className,
}) => {
  /**
   * Gets the appropriate CSS classes for a log level.
   * @param level - The log level.
   * @returns CSS classes for the log level.
   */
  const getLevelClasses = (level: ILogEntry['level']): string => {
    switch (level) {
      case 'error':
        return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'warn':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'debug':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      default:
        return 'text-foreground bg-muted border-border';
    }
  };

  /**
   * Formats a timestamp for display.
   * @param timestamp - The timestamp to format.
   * @returns Formatted time string.
   */
  const formatTime = (timestamp: Date): string => {
    return (
      timestamp.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + `.${timestamp.getMilliseconds().toString().padStart(3, '0')}`
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col bg-card text-card-foreground rounded-lg border min-h-0',
        className
      )}
    >
      {/* Header */}
      <div className="px-4 py-2 border-b bg-muted/50 rounded-t-lg">
        <h3 className={cn(typography.status, 'text-sm')}>Development Log</h3>
        <p className={typography.caption}>{logs.length} entries</p>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
        {logs.length === 0 ? (
          <div className={cn(typography.caption, 'text-center py-8')}>
            No log entries yet
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={cn(
                'p-2 rounded border text-xs font-mono',
                getLevelClasses(log.level)
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold uppercase">{log.level}</span>
                <span className={typography.muted}>
                  {formatTime(log.timestamp)}
                </span>
              </div>
              <div className="text-foreground">{log.message}</div>
              {log.data !== undefined && (
                <pre className="mt-1 text-xs text-muted-foreground overflow-x-auto">
                  {JSON.stringify(log.data as Record<string, unknown>, null, 2)}
                </pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
