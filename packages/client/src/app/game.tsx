import { useSocket } from './hooks/useSocket';
import { useGame } from './hooks/useGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { layout, typography, status, spacing, getStatusColor } from './styles';

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

        <Card className={layout.cardSpaced}>
          <CardHeader>
            <div className={status.statusContainer}>
              <p className={status.statusLabel}>Connection Status:</p>
              <p
                className={`${status.statusValue} ${getStatusColor(
                  isConnected
                )}`}
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
              {gameState.playerId && (
                <p className={status.playerInfo}>
                  Player ID: {gameState.playerId}
                </p>
              )}
            </div>
          </CardHeader>

          <CardContent className={spacing.section}>
            <Button
              onClick={handleStartMining}
              disabled={isButtonDisabled}
              className="w-full"
            >
              {gameState.currentTask
                ? 'Mining in Progress...'
                : 'Mine Asteroid'}
            </Button>

            {gameState.currentTask && (
              <div className={spacing.progress}>
                <div className="flex justify-between text-sm">
                  <span>Mining Progress</span>
                  <span>{Math.round(gameState.taskProgress)}%</span>
                </div>
                <Progress value={gameState.taskProgress} className="w-full" />
                <p className="text-xs text-muted-foreground text-center">
                  {getRemainingTime()}s remaining
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
