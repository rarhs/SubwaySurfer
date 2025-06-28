import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { KeyboardControls } from "@react-three/drei";
import { useAudio } from "./lib/stores/useAudio";
import { useGameState } from "./lib/stores/useGameState";
import { GameScene } from "./components/game/GameScene";
import { GameUI } from "./components/game/GameUI";
import "@fontsource/inter";
import "./index.css";

// Define control keys for the game
enum Controls {
  left = 'left',
  right = 'right',
  jump = 'jump',
  slide = 'slide',
  restart = 'restart'
}

const keyMap = [
  { name: Controls.left, keys: ['KeyA', 'ArrowLeft'] },
  { name: Controls.right, keys: ['KeyD', 'ArrowRight'] },
  { name: Controls.jump, keys: ['KeyW', 'ArrowUp', 'Space'] },
  { name: Controls.slide, keys: ['KeyS', 'ArrowDown'] },
  { name: Controls.restart, keys: ['KeyR'] }
];

function App() {
  const { gameState } = useGameState();

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <KeyboardControls map={keyMap}>
        <Canvas
          shadows
          camera={{
            position: [0, 8, 12],
            fov: 50,
            near: 0.1,
            far: 1000
          }}
          gl={{
            antialias: true,
            powerPreference: "high-performance"
          }}
        >
          <color attach="background" args={["#87CEEB"]} />
          
          <Suspense fallback={null}>
            <GameScene />
          </Suspense>
        </Canvas>
        
        <GameUI />
      </KeyboardControls>
    </div>
  );
}

export default App;
