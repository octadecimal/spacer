<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->

# Coding Standards

## Interface Naming and Organization

- **Interface Naming**: All interfaces must start with "I" prefix (e.g., `IPersistenceAdapter`, `IGameService`)
- **One Interface Per File**: Each interface should be in its own file for better maintainability
- **Interface Location**: Place interfaces in `{project-name}/types` directory (e.g., `packages/server/types/`, `packages/client/types/`)
- **File Naming**: Interface files should be named exactly after the interface name (e.g., `IPersistenceAdapter` → `packages/server/types/IPersistenceAdapter.ts`)
- **JSDoc Comments**: All interface fields must have multiline JSDoc comments explaining their purpose and type. All sentences in comments must end with a period.
- **Access Modifiers**: All functions and methods must have explicit access modifiers (public, private, protected, etc.).
- **Line Comments**: All sentences in line comments must end with a period (e.g., `// This is a comment.`).
- **Public Member Documentation**: All public members (properties, methods, fields, constants) must have JSDoc comments explaining their purpose and type.

## Examples

### ✅ Correct:

```typescript
// packages/server/types/IPersistenceAdapter.ts
export interface IPersistenceAdapter {
  /**
   * Creates a new player in the persistence layer.
   * @param playerId - Unique identifier for the player.
   * @param socketId - Optional socket connection ID.
   * @returns Promise resolving to the created player.
   */
  createPlayer(playerId: string, socketId?: string): Promise<IPersistedPlayer>;

  /**
   * Retrieves a player by their unique identifier.
   * @param playerId - The player's unique identifier.
   * @returns Promise resolving to the player or null if not found.
   */
  getPlayer(playerId: string): Promise<IPersistedPlayer | null>;
}

// packages/server/src/app/game.gateway.ts
export class GameGateway {
  /**
   * Socket.IO server instance for handling WebSocket connections.
   */
  @WebSocketServer()
  public server!: Server;

  /**
   * In-memory storage for active players during gameplay.
   */
  private activePlayers: Map<string, Player> = new Map();

  /**
   * Creates a new player or retrieves existing player by ID.
   * @param playerId - Unique identifier for the player.
   * @returns Promise resolving to the player (new or existing).
   */
  public async createPlayer(playerId: string): Promise<IPersistedPlayer> {
    // Generate unique player ID using timestamp.
    const id = `player_${Date.now()}`;
    return this.persistenceService.createOrGetPlayer(id);
  }

  /**
   * Converts persisted task to active game task.
   * @param persistedTask - The persisted task.
   * @returns The active game task.
   */
  private convertPersistedTaskToTask(persistedTask: IPersistedTask): Task {
    // Map between persistence layer and real-time game state.
    return {
      id: persistedTask.id,
      name: persistedTask.name,
      duration: persistedTask.duration,
      startTime: persistedTask.startTime,
      completed: persistedTask.completed,
    };
  }
}
```

### ❌ Incorrect:

```typescript
// Multiple interfaces in one file
export interface Task {}
export interface Player {}

// Interface without "I" prefix
export interface PersistenceAdapter {}

// Interface in wrong location
// src/app/interfaces.ts (should be in types/)

// Missing access modifiers
async createPlayer(playerId: string) { }  // Should be: public async createPlayer
convertTask(task: Task) { }  // Should be: private convertTask

// Line comments without periods
// Generate unique player ID  // Should be: // Generate unique player ID.
// Map between layers  // Should be: // Map between layers.

// Missing JSDoc for public members
public server!: Server;  // Should have JSDoc comment
public activePlayers: Map<string, Player> = new Map();  // Should have JSDoc comment
```
