import { ITask } from './ITask';

/**
 * Active game player interface.
 * Represents a player in the real-time game state on the server.
 */
export interface IPlayer {
  /**
   * Unique player identifier.
   * @description Generated using timestamp-based format.
   */
  id: string;

  /**
   * Socket.IO connection ID.
   * @description Maps to the client's WebSocket connection.
   */
  socketId: string;

  /**
   * Array of all tasks.
   * @description Includes both completed and active tasks.
   */
  tasks: ITask[];
}
