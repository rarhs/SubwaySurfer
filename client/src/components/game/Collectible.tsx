import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";

interface CollectibleProps {
  collectible: {
    id: string;
    position: { x: number; y: number; z: number };
    type: 'coin' | 'powerup';
    collected: boolean;
  };
}

export function Collectible({ collectible }: CollectibleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gameSpeed, gameState } = useGameState();

  useFrame((state, delta) => {
    if (!meshRef.current || gameState !== 'playing' || collectible.collected) return;
    
    // Move collectible towards player
    meshRef.current.position.z += gameSpeed * delta;
    
    // Rotate for visual effect
    meshRef.current.rotation.y += delta * 2;
    meshRef.current.rotation.x += delta;
    
    // Bob up and down
    meshRef.current.position.y = collectible.position.y + Math.sin(state.clock.elapsedTime * 3) * 0.3;
    
    // Remove collectible if it's far behind the player
    if (meshRef.current.position.z > 20) {
      useGameState.getState().removeCollectible(collectible.id);
    }
  });

  if (collectible.collected) return null;

  const getCollectibleColor = () => {
    switch (collectible.type) {
      case 'coin': return '#FFD700'; // Gold
      case 'powerup': return '#00FF00'; // Green
      default: return '#FFD700';
    }
  };

  const getGeometry = () => {
    if (collectible.type === 'coin') {
      return <cylinderGeometry args={[0.5, 0.5, 0.1, 8]} />;
    } else {
      return <boxGeometry args={[0.8, 0.8, 0.8]} />;
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={[collectible.position.x, collectible.position.y, collectible.position.z]}
      castShadow
    >
      {getGeometry()}
      <meshStandardMaterial color={getCollectibleColor()} />
    </mesh>
  );
}
