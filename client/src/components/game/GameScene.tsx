import { useEffect } from "react";
import * as THREE from "three";
import { Player } from "./Player";
import { Track } from "./Track";
import { Camera } from "./Camera";
import { useGameState } from "../../lib/stores/useGameState";
import { useAudio } from "../../lib/stores/useAudio";

export function GameScene() {
  const { gameState } = useGameState();

  useEffect(() => {
    // Initialize audio
    const backgroundMusic = new Audio("/sounds/background.mp3");
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.3;
    
    const hitSound = new Audio("/sounds/hit.mp3");
    const successSound = new Audio("/sounds/success.mp3");
    
    useAudio.getState().setBackgroundMusic(backgroundMusic);
    useAudio.getState().setHitSound(hitSound);
    useAudio.getState().setSuccessSound(successSound);
  }, []);

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 20, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <fog attach="fog" args={["#87CEEB", 50, 200]} />

      {/* Game Components */}
      <Camera />
      <Player />
      <Track />
    </>
  );
}
