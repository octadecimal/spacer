import { useState, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import { useGame } from './hooks/useGame';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { DevelopmentLog } from '@/components/DevelopmentLog';
import { Inventory } from '@/components/Inventory';
import { Login } from '@/components/Login';
import { Storage } from '@/lib/storage';
import { layout, typography, status, spacing, getStatusColor } from './styles';

export function Game() {
  // Login state management
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize login state from storage
  useEffect(() => {
    const initializeLoginState = async () => {
      const savedUsername = await Storage.getItem('spacer_username');
      if (savedUsername) {
        setUsername(savedUsername);
        setIsLoggedIn(true);
      }
      setIsInitialized(true);
    };
    initializeLoginState();
  }, []);

  const { socket, isConnected } = useSocket();
  const {
    gameState,
    logs,
    loopCount,
    remainingTime,
    overallProgress,
    startTask,
  } = useGame(socket, isLoggedIn ? username : undefined);

  /**
   * Handles successful login.
   * @param loggedInUsername The username that was logged in.
   */
  const handleLogin = (loggedInUsername: string) => {
    setUsername(loggedInUsername);
    setIsLoggedIn(true);
  };

  /**
   * Handles logout.
   */
  const handleLogout = () => {
    setUsername('');
    setIsLoggedIn(false);
  };

  const handleStartMining = () => {
    startTask('Mine Asteroid');
  };

  const isButtonDisabled = !isConnected || !!gameState.currentTask;

  // Show login screen if not logged in
  if (!isInitialized) {
    return (
      <div className="h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Login
          onLogin={handleLogin}
          onLogout={handleLogout}
          isLoggedIn={isLoggedIn}
          currentUsername={username}
        />
      </div>
    );
  }

  return (
    <div className="h-screen bg-background text-foreground p-4 overflow-hidden pt-safe-top">
      <div className="max-w-7xl mx-auto h-full">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
          {/* Inventory Sidebar */}
          <div className="lg:col-span-1 flex flex-col min-h-0 space-y-4">
            {/* User Info Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Logged in as:
                    </p>
                    <p className="font-semibold">{username}</p>
                  </div>
                  <Button onClick={handleLogout} variant="outline" size="sm">
                    Logout
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Inventory
              inventory={gameState.inventory}
              className="flex-1 min-h-0"
            />
          </div>

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
                        {/* Overall cycle progress bar */}
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Overall Progress</span>
                            <span>{Math.round(overallProgress)}%</span>
                          </div>
                          <Progress
                            value={overallProgress}
                            className="w-full h-1"
                          />
                        </div>
                        {/* Debug info */}
                        <div className="text-xs text-red-500 text-center">
                          Debug: {gameState.taskProgress.toFixed(2)}% | Loop:{' '}
                          {loopCount} | Remaining:{' '}
                          {Math.round(remainingTime / 1000)}s
                        </div>
                        <div className="text-xs text-muted-foreground text-center space-y-1">
                          <p>Loop {loopCount} completed</p>
                          <p>{Math.round(remainingTime / 1000)}s remaining</p>
                        </div>
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
