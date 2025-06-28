import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";
import { Obstacle } from "./Obstacle";
import { Collectible } from "./Collectible";

export function Track() {
  const groundRef = useRef<THREE.Mesh>(null);
  const { gameState, gameSpeed, obstacles, collectibles, generateNewSegment } = useGameState();
  
  // Load textures
  const asphaltTexture = useTexture("/textures/asphalt.png");
  const grassTexture = useTexture("/textures/grass.png");

  // Configure textures
  useMemo(() => {
    [asphaltTexture, grassTexture].forEach(texture => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 20);
    });
  }, [asphaltTexture, grassTexture]);

  useFrame((state, delta) => {
    if (gameState !== 'playing') return;
    
    // Move ground texture
    if (asphaltTexture && grassTexture) {
      asphaltTexture.offset.z -= gameSpeed * delta * 0.1;
      grassTexture.offset.z -= gameSpeed * delta * 0.1;
    }

    // Generate new segments as needed
    const playerZ = useGameState.getState().playerState.position.z;
    if (Math.abs(playerZ) % 50 < 1) {
      generateNewSegment();
    }
  });

  return (
    <group>
      {/* Main track (asphalt) */}
      <mesh ref={groundRef} receiveShadow position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 200]} />
        <meshStandardMaterial map={asphaltTexture} />
      </mesh>

      {/* Side grass areas */}
      <mesh receiveShadow position={[-8, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 200]} />
        <meshStandardMaterial map={grassTexture} />
      </mesh>
      
      <mesh receiveShadow position={[8, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4, 200]} />
        <meshStandardMaterial map={grassTexture} />
      </mesh>

      {/* Lane markers */}
      <mesh position={[-2, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 200]} />
        <meshStandardMaterial color="yellow" />
      </mesh>
      
      <mesh position={[2, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.2, 200]} />
        <meshStandardMaterial color="yellow" />
      </mesh>

      {/* Render obstacles */}
      {obstacles.map(obstacle => (
        <Obstacle key={obstacle.id} obstacle={obstacle} />
      ))}

      {/* Render collectibles */}
      {collectibles.map(collectible => (
        <Collectible key={collectible.id} collectible={collectible} />
      ))}
    </group>
  );
}
