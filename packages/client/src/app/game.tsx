import { useSocket } from './hooks/useSocket';
import { useGame } from './hooks/useGame';
import {
  layout,
  typography,
  progress,
  status,
  spacing,
  getStatusColor,
  getButtonClasses,
} from './styles';

export function Game() {
  const { socket, isConnected } = useSocket();
  const { gameState, startTask, getRemainingTime } = useGame(socket);

  const handleStartMining = () => {
    startTask('Mine Asteroid');
  };

  const isButtonDisabled = !isConnected || !!gameState.currentTask;

  return (
    <div className={`${layout.page} ${layout.section}`}>
      <div className={layout.container}>
        <h1 className={typography.h1}>Space Mining Game</h1>

        <div className={`${layout.card} ${layout.cardSpaced}`}>
          <div className={status.statusContainer}>
            <p className={status.statusLabel}>Connection Status:</p>
            <p
              className={`${status.statusValue} ${getStatusColor(isConnected)}`}
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
            {gameState.playerId && (
              <p className={status.playerInfo}>
                Player ID: {gameState.playerId}
              </p>
            )}
          </div>

          <div className={spacing.section}>
            <button
              onClick={handleStartMining}
              disabled={isButtonDisabled}
              className={getButtonClasses(isButtonDisabled)}
            >
              {gameState.currentTask
                ? 'Mining in Progress...'
                : 'Mine Asteroid'}
            </button>

            {gameState.currentTask && (
              <div className={spacing.progress}>
                <div className={progress.info}>
                  <span>Mining Progress</span>
                  <span>{Math.round(gameState.taskProgress)}%</span>
                </div>
                <div className={progress.container}>
                  <div
                    className={progress.fill}
                    style={{ width: `${gameState.taskProgress}%` }}
                  ></div>
                </div>
                <p className={progress.remaining}>
                  {getRemainingTime()}s remaining
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
