import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useKeyboardControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameState } from "../../lib/stores/useGameState";
import { useAudio } from "../../lib/stores/useAudio";
import { checkCollisions } from "../../lib/gameLogic";

enum Controls {
  left = 'left',
  right = 'right', 
  jump = 'jump',
  slide = 'slide',
  restart = 'restart'
}

export function Player() {
  const playerRef = useRef<THREE.Mesh>(null);
  const { gameState, playerState, updatePlayerState, gameOver, restart } = useGameState();
  const { playHit, playSuccess } = useAudio();
  const [subscribe, getControls] = useKeyboardControls<Controls>();

  // Subscribe to keyboard controls
  useEffect(() => {
    const unsubscribeLeft = subscribe(
      (state) => state.left,
      (pressed) => {
        if (pressed && gameState === 'playing') {
          console.log("Left key pressed");
          updatePlayerState({ targetLane: Math.max(-1, playerState.targetLane - 1) });
        }
      }
    );

    const unsubscribeRight = subscribe(
      (state) => state.right,
      (pressed) => {
        if (pressed && gameState === 'playing') {
          console.log("Right key pressed");
          updatePlayerState({ targetLane: Math.min(1, playerState.targetLane + 1) });
        }
      }
    );

    const unsubscribeJump = subscribe(
      (state) => state.jump,
      (pressed) => {
        if (pressed && gameState === 'playing' && playerState.isGrounded) {
          console.log("Jump key pressed");
          updatePlayerState({ 
            verticalVelocity: 15,
            isGrounded: false,
            isSliding: false
          });
        }
      }
    );

    const unsubscribeSlide = subscribe(
      (state) => state.slide,
      (pressed) => {
        if (gameState === 'playing' && playerState.isGrounded) {
          console.log("Slide key:", pressed);
          updatePlayerState({ isSliding: pressed });
        }
      }
    );

    const unsubscribeRestart = subscribe(
      (state) => state.restart,
      (pressed) => {
        if (pressed && gameState === 'gameOver') {
          console.log("Restart key pressed");
          restart();
        }
      }
    );

    return () => {
      unsubscribeLeft();
      unsubscribeRight();
      unsubscribeJump();
      unsubscribeSlide();
      unsubscribeRestart();
    };
  }, [gameState, playerState.targetLane, playerState.isGrounded, subscribe, updatePlayerState, restart]);

  useFrame((state, delta) => {
    if (!playerRef.current || gameState !== 'playing') return;

    // Update physics
    let newVerticalVelocity = playerState.verticalVelocity;
    let newY = playerState.position.y;
    let newIsGrounded = playerState.isGrounded;

    // Apply gravity
    if (!playerState.isGrounded) {
      newVerticalVelocity -= 50 * delta; // Gravity
      newY = Math.max(0, newY + newVerticalVelocity * delta);
      
      if (newY <= 0) {
        newY = 0;
        newVerticalVelocity = 0;
        newIsGrounded = true;
      }
    }

    // Smooth lane movement
    const targetX = playerState.targetLane * 4; // 4 units between lanes
    const newX = THREE.MathUtils.lerp(playerState.position.x, targetX, 8 * delta);

    // Update position
    const newPosition = { x: newX, y: newY, z: playerState.position.z };
    
    // Update player state
    updatePlayerState({
      position: newPosition,
      verticalVelocity: newVerticalVelocity,
      isGrounded: newIsGrounded
    });

    // Update mesh position
    playerRef.current.position.set(newPosition.x, newPosition.y + (playerState.isSliding ? 0.5 : 1), newPosition.z);
    
    // Update mesh scale for sliding
    if (playerState.isSliding) {
      playerRef.current.scale.set(1, 0.5, 1);
    } else {
      playerRef.current.scale.set(1, 1, 1);
    }

    // Check collisions
    const collision = checkCollisions(playerState, useGameState.getState().obstacles, useGameState.getState().collectibles);
    
    if (collision.obstacle) {
      playHit();
      gameOver();
    }
    
    if (collision.collectible) {
      playSuccess();
      useGameState.getState().collectCoin(collision.collectible.id);
    }
  });

  return (
    <mesh ref={playerRef} castShadow receiveShadow position={[0, 1, 0]}>
      <boxGeometry args={[0.8, 1.6, 0.8]} />
      <meshStandardMaterial color="#4169E1" />
    </mesh>
  );
}
