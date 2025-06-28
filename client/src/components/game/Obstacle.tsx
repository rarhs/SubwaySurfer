import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";

interface ObstacleProps {
  obstacle: {
    id: string;
    position: { x: number; y: number; z: number };
    type: 'train' | 'barrier' | 'pole';
    size: { width: number; height: number; depth: number };
  };
}

export function Obstacle({ obstacle }: ObstacleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { gameSpeed, gameState } = useGameState();

  useFrame((state, delta) => {
    if (!meshRef.current || gameState !== 'playing') return;
    
    // Move obstacle towards player
    meshRef.current.position.z += gameSpeed * delta;
    
    // Remove obstacle if it's far behind the player
    if (meshRef.current.position.z > 20) {
      useGameState.getState().removeObstacle(obstacle.id);
    }
  });

  const getObstacleColor = () => {
    switch (obstacle.type) {
      case 'train': return '#8B0000'; // Dark red
      case 'barrier': return '#FF4500'; // Orange red
      case 'pole': return '#696969'; // Gray
      default: return '#FF0000';
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={[obstacle.position.x, obstacle.position.y, obstacle.position.z]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[obstacle.size.width, obstacle.size.height, obstacle.size.depth]} />
      <meshStandardMaterial color={getObstacleColor()} />
    </mesh>
  );
}
