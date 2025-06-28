import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";

export function Camera() {
  const { camera } = useThree();
  const { playerState, gameState } = useGameState();

  useFrame((state, delta) => {
    if (gameState !== 'playing') return;

    // Follow player with smooth camera movement
    const targetPosition = new THREE.Vector3(
      playerState.position.x * 0.3, // Follow horizontally but not completely
      8, // Fixed height
      playerState.position.z + 12 // Behind player
    );

    camera.position.lerp(targetPosition, 2 * delta);
    
    // Look at player
    const lookAtTarget = new THREE.Vector3(
      playerState.position.x,
      playerState.position.y + 1,
      playerState.position.z - 5 // Look slightly ahead
    );
    
    camera.lookAt(lookAtTarget);
  });

  return null;
}
