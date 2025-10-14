import { ITask, IPlayer } from '@spacer/shared';

/**
 * Client player interface.
 * Represents a player in the active game state on the client.
 * Extends the base player with client-specific fields.
 */
export interface IClientPlayer extends IPlayer {
  /**
   * Socket.IO connection ID.
   * @description Required for active game players on client.
   */
  socketId: string;

  /**
   * Array of all tasks.
   * @description Includes both completed and active tasks.
   */
  tasks: ITask[];
}
