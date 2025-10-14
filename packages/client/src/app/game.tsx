import { useSocket } from './hooks/useSocket';
import { useGame } from './hooks/useGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DevelopmentLog } from '@/components/DevelopmentLog';
import { layout, typography, status, spacing, getStatusColor } from './styles';

export function Game() {
  const { socket, isConnected } = useSocket();
  const { gameState, logs, startTask, getRemainingTime } = useGame(socket);

  const handleStartMining = () => {
    startTask('Mine Asteroid');
  };

  const isButtonDisabled = !isConnected || !!gameState.currentTask;

  return (
    <div className="h-screen bg-background text-foreground p-4 overflow-hidden">
      <div className="max-w-7xl mx-auto h-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Main Game Area */}
          <div className="lg:col-span-2 flex flex-col min-h-0">
            <div
              className={`${layout.page} ${layout.section} flex-1 overflow-y-auto`}
            >
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
                        <Progress
                          value={gameState.taskProgress}
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground text-center">
                          {getRemainingTime()}s remaining
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Development Log Sidebar */}
          <div className="lg:col-span-1 flex flex-col min-h-0">
            <DevelopmentLog logs={logs} className="flex-1 min-h-0" />
          </div>
        </div>
      </div>
    </div>
  );
}
