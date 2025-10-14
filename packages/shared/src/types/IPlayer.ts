/**
 * Base player interface.
 * Contains common player fields shared between client and server.
 * Shared between client and server for consistent player identification.
 */
export interface IPlayer {
  /**
   * Unique player identifier.
   * @description Generated using timestamp-based format.
   */
  id: string;

  /**
   * Socket.IO connection ID.
   * @description Maps to the client's WebSocket connection. Optional for offline players.
   */
  socketId?: string;
}
