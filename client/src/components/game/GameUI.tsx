import { useGameState } from "../../lib/stores/useGameState";
import { useAudio } from "../../lib/stores/useAudio";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export function GameUI() {
  const { gameState, score, distance, start, restart } = useGameState();
  const { isMuted, toggleMute } = useAudio();

  if (gameState === 'menu') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
        <Card className="w-96 bg-white text-black">
          <CardContent className="p-8 text-center">
            <h1 className="text-4xl font-bold mb-4 text-blue-600">Subway Runner 3D</h1>
            <p className="text-lg mb-6 text-gray-700">
              Use WASD or Arrow Keys to move, jump, and slide!
            </p>
            <div className="space-y-4">
              <Button 
                onClick={start} 
                size="lg" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Start Game
              </Button>
              <Button 
                onClick={toggleMute} 
                variant="outline" 
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Sound: {isMuted ? 'OFF' : 'ON'}
              </Button>
            </div>
            <div className="mt-6 text-sm text-gray-600">
              <p>Controls:</p>
              <p>A/D or ←/→ - Move left/right</p>
              <p>W/↑/Space - Jump</p>
              <p>S/↓ - Slide</p>
              <p>R - Restart (when game over)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === 'gameOver') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
        <Card className="w-96 bg-white text-black">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold mb-4 text-red-600">Game Over!</h2>
            <div className="space-y-2 mb-6">
              <p className="text-xl text-gray-700">Final Score: <span className="font-bold text-blue-600">{score}</span></p>
              <p className="text-lg text-gray-600">Distance: {Math.floor(distance)}m</p>
            </div>
            <div className="space-y-4">
              <Button 
                onClick={restart} 
                size="lg" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Play Again (R)
              </Button>
              <Button 
                onClick={toggleMute} 
                variant="outline" 
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Sound: {isMuted ? 'OFF' : 'ON'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Playing state UI
  return (
    <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
      <div className="flex justify-between items-start">
        <Card className="bg-black bg-opacity-70 text-white border-none">
          <CardContent className="p-4">
            <div className="space-y-1">
              <p className="text-lg font-bold">Score: {score}</p>
              <p className="text-sm">Distance: {Math.floor(distance)}m</p>
            </div>
          </CardContent>
        </Card>
        
        <Button 
          onClick={toggleMute} 
          variant="outline" 
          size="sm"
          className="pointer-events-auto bg-black bg-opacity-70 text-white border-white hover:bg-white hover:text-black"
        >
          🔊 {isMuted ? 'OFF' : 'ON'}
        </Button>
      </div>
    </div>
  );
}
