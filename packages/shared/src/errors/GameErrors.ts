/**
 * Base error class for all game-related errors.
 * Provides consistent error structure and handling.
 */
export abstract class GameError extends Error {
  /**
   * Error code for programmatic error handling.
   */
  public readonly code: string;

  /**
   * Additional error details.
   */
  public readonly details?: unknown;

  /**
   * Timestamp when the error occurred.
   */
  public readonly timestamp: Date;

  constructor(message: string, code: string, details?: unknown, cause?: Error) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }

  /**
   * Converts the error to a plain object for serialization.
   * @returns Plain object representation of the error.
   */
  public toObject(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * Authentication-related errors.
 */
export class AuthenticationError extends GameError {
  constructor(message: string, details?: unknown, cause?: Error) {
    super(message, 'AUTH_ERROR', details, cause);
  }
}

/**
 * Task-related errors.
 */
export class TaskError extends GameError {
  constructor(message: string, details?: unknown, cause?: Error) {
    super(message, 'TASK_ERROR', details, cause);
  }
}

/**
 * Persistence-related errors.
 */
export class PersistenceError extends GameError {
  constructor(message: string, details?: unknown, cause?: Error) {
    super(message, 'PERSISTENCE_ERROR', details, cause);
  }
}

/**
 * Socket/Network-related errors.
 */
export class NetworkError extends GameError {
  constructor(message: string, details?: unknown, cause?: Error) {
    super(message, 'NETWORK_ERROR', details, cause);
  }
}

/**
 * Validation-related errors.
 */
export class ValidationError extends GameError {
  constructor(message: string, details?: unknown, cause?: Error) {
    super(message, 'VALIDATION_ERROR', details, cause);
  }
}

/**
 * Error factory for creating typed errors.
 */
export class ErrorFactory {
  /**
   * Creates an authentication error.
   * @param message Error message.
   * @param details Additional details.
   * @param cause Original error that caused this.
   * @returns AuthenticationError instance.
   */
  static authentication(
    message: string,
    details?: unknown,
    cause?: Error
  ): AuthenticationError {
    return new AuthenticationError(message, details, cause);
  }

  /**
   * Creates a task error.
   * @param message Error message.
   * @param details Additional details.
   * @param cause Original error that caused this.
   * @returns TaskError instance.
   */
  static task(message: string, details?: unknown, cause?: Error): TaskError {
    return new TaskError(message, details, cause);
  }

  /**
   * Creates a persistence error.
   * @param message Error message.
   * @param details Additional details.
   * @param cause Original error that caused this.
   * @returns PersistenceError instance.
   */
  static persistence(
    message: string,
    details?: unknown,
    cause?: Error
  ): PersistenceError {
    return new PersistenceError(message, details, cause);
  }

  /**
   * Creates a network error.
   * @param message Error message.
   * @param details Additional details.
   * @param cause Original error that caused this.
   * @returns NetworkError instance.
   */
  static network(
    message: string,
    details?: unknown,
    cause?: Error
  ): NetworkError {
    return new NetworkError(message, details, cause);
  }

  /**
   * Creates a validation error.
   * @param message Error message.
   * @param details Additional details.
   * @param cause Original error that caused this.
   * @returns ValidationError instance.
   */
  static validation(
    message: string,
    details?: unknown,
    cause?: Error
  ): ValidationError {
    return new ValidationError(message, details, cause);
  }
}
