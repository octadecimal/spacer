import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameGateway } from './game.gateway';
import { GamePersistenceService } from './persistence/persistence.service';
import { PersistenceAdapterFactory } from './persistence/persistence.factory';
import { IPersistenceAdapter } from '../types/IPersistenceAdapter';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    AppService,
    GameGateway,
    {
      // Provide the persistence adapter
      provide: 'PERSISTENCE_ADAPTER',
      useFactory: () => PersistenceAdapterFactory.createFromEnvironment(),
    },
    {
      // Provide the persistence service
      provide: GamePersistenceService,
      useFactory: (adapter: IPersistenceAdapter) =>
        new GamePersistenceService(adapter),
      inject: ['PERSISTENCE_ADAPTER'],
    },
  ],
})
export class AppModule {}
