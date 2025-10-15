import { useSocket } from './hooks/useSocket';
import { useGame } from './hooks/useGame';
import { useAuth } from './hooks/useAuth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DevelopmentLog } from '@/components/DevelopmentLog';
import { Inventory } from '@/components/Inventory';
import { Login } from '@/components/Login';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { UserInfoCard } from '@/components/UserInfoCard';
import { ConnectionStatus } from '@/components/ConnectionStatus';
import { TaskProgress } from '@/components/TaskProgress';
import { MiningButton } from '@/components/MiningButton';
import { layout, typography } from './styles';

export function Game() {
  // Authentication state management
  const { isLoggedIn, username, isInitialized, login, logout } = useAuth();

  const { socket, isConnected } = useSocket();
  const { gameState, logs, loopCount, remainingTime, startTask } = useGame(
    socket,
    isLoggedIn ? username : undefined
  );

  /**
   * Handles successful login.
   * @param loggedInUsername The username that was logged in.
   */
  const handleLogin = async (loggedInUsername: string) => {
    try {
      await login(loggedInUsername);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  /**
   * Handles logout.
   */
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleStartMining = () => {
    startTask('Mine Asteroid');
  };

  const isButtonDisabled = !isConnected || !!gameState.currentTask;

  // Show loading screen if not initialized
  if (!isInitialized) {
    return (
      <div className="h-screen bg-background text-foreground">
        <LoadingSpinner message="Loading..." className="h-full" />
      </div>
    );
  }

  // Show login screen if not logged in
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
            <UserInfoCard username={username} onLogout={handleLogout} />

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
                    <ConnectionStatus
                      isConnected={isConnected}
                      playerId={gameState.playerId}
                    />
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <MiningButton
                      isTaskActive={!!gameState.currentTask}
                      disabled={isButtonDisabled}
                      onClick={handleStartMining}
                      className="w-full"
                    />

                    {gameState.currentTask && (
                      <TaskProgress
                        taskProgress={gameState.taskProgress}
                        overallProgress={gameState.overallProgress}
                        loopCount={loopCount}
                        remainingTime={remainingTime}
                        showDebug={true}
                      />
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
