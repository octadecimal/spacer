import { useState } from 'react';
import { ILogEntry } from '../../components/DevelopmentLog';

/**
 * Custom hook for managing development logs.
 * Provides centralized logging functionality with automatic cleanup.
 */
export function useLogger() {
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

  /**
   * Clears all logs.
   */
  const clearLogs = () => {
    setLogs([]);
  };

  return {
    logs,
    addLog,
    clearLogs,
  };
}
