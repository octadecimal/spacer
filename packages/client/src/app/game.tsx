import { useSocket } from './hooks/useSocket';
import { useGame } from './hooks/useGame';

export function Game() {
  const { socket, isConnected } = useSocket();
  const { gameState, startTask, getRemainingTime } = useGame(socket);

  const handleStartMining = () => {
    startTask('Mine Asteroid');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Space Mining Game
        </h1>

        <div className="bg-gray-800 rounded-lg p-6 space-y-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">Connection Status:</p>
            <p
              className={`font-semibold ${
                isConnected ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {isConnected ? 'Connected' : 'Disconnected'}
            </p>
            {gameState.playerId && (
              <p className="text-xs text-gray-500 mt-1">
                Player ID: {gameState.playerId}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={handleStartMining}
              disabled={!isConnected || !!gameState.currentTask}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                !isConnected || gameState.currentTask
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {gameState.currentTask
                ? 'Mining in Progress...'
                : 'Mine Asteroid'}
            </button>

            {gameState.currentTask && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Mining Progress</span>
                  <span>{Math.round(gameState.taskProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                    style={{ width: `${gameState.taskProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 text-center">
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
