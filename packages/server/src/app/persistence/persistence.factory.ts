import { Injectable } from '@nestjs/common';
import { IPersistenceAdapter } from '../../types';
import { InMemoryPersistenceAdapter } from './adapters/in-memory.adapter';

/**
 * Persistence Adapter Factory.
 *
 * Centralized factory for creating persistence adapters.
 * Makes it easy to swap implementations based on environment or configuration.
 *
 * Usage:
 * - Development: InMemoryPersistenceAdapter.
 * - Production: PostgreSQLPersistenceAdapter.
 * - Testing: MockPersistenceAdapter.
 */
@Injectable()
export class PersistenceAdapterFactory {
  /**
   * Create persistence adapter based on environment or configuration.
   *
   * @param adapterType - Type of adapter to create.
   * @returns Configured persistence adapter.
   */
  static createAdapter(
    adapterType: 'memory' | 'postgres' | 'redis' = 'memory'
  ): IPersistenceAdapter {
    switch (adapterType) {
      case 'memory':
        return new InMemoryPersistenceAdapter();

      case 'postgres':
        // TODO: Implement PostgreSQL adapter
        throw new Error('PostgreSQL adapter not implemented yet');

      case 'redis':
        // TODO: Implement Redis adapter
        throw new Error('Redis adapter not implemented yet');

      default:
        throw new Error(`Unknown adapter type: ${adapterType}`);
    }
  }

  /**
   * Create adapter based on environment variables.
   *
   * @returns Configured persistence adapter.
   */
  static createFromEnvironment(): IPersistenceAdapter {
    const adapterType = process.env.PERSISTENCE_ADAPTER || 'memory';
    return this.createAdapter(adapterType as any);
  }
}

/**
 * Persistence Module Configuration.
 *
 * Centralized configuration for persistence layer.
 */
export interface PersistenceConfig {
  adapter: 'memory' | 'postgres' | 'redis';
  postgres?: {
    host: string;
    port: number;
    database: string;
    username: string;
    password: string;
  };
  redis?: {
    host: string;
    port: number;
    password?: string;
  };
  memory?: {
    maxPlayers?: number;
    cleanupInterval?: number;
  };
}

/**
 * Default persistence configuration.
 */
export const DEFAULT_PERSISTENCE_CONFIG: PersistenceConfig = {
  adapter: 'memory',
  memory: {
    maxPlayers: 10000,
    cleanupInterval: 300000, // 5 minutes
  },
};
