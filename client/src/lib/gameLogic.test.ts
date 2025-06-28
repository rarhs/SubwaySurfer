import { describe, it, expect } from 'vitest';
import { checkCollisions } from './gameLogic';

// Mock data types (simplified from actual types for testing)
interface PlayerState {
  position: { x: number; y: number; z: number };
  targetLane: number;
  verticalVelocity: number;
  isGrounded: boolean;
  isSliding: boolean;
}

interface Obstacle {
  id: string;
  position: { x: number; y: number; z: number };
  type: 'train' | 'barrier' | 'pole';
  size: { width: number; height: number; depth: number };
}

interface Collectible {
  id: string;
  position: { x: number; y: number; z: number };
  type: 'coin' | 'powerup';
  collected: boolean;
}

const defaultPlayerState: PlayerState = {
  position: { x: 0, y: 0, z: 0 },
  targetLane: 0,
  verticalVelocity: 0,
  isGrounded: true,
  isSliding: false,
};

describe('checkCollisions', () => {
  it('should return no collision when no obstacles or collectibles are present', () => {
    const playerState = { ...defaultPlayerState };
    const obstacles: Obstacle[] = [];
    const collectibles: Collectible[] = [];
    const result = checkCollisions(playerState, obstacles, collectibles);
    expect(result.obstacle).toBeNull();
    expect(result.collectible).toBeNull();
  });

  // --- Obstacle Collision Tests ---
  it('should detect collision with an obstacle directly in front', () => {
    const playerState = { ...defaultPlayerState };
    const obstacles: Obstacle[] = [
      { id: 'obs1', type: 'train', position: { x: 0, y: 0, z: 0 }, size: { width: 1, height: 2, depth: 1 } },
    ];
    const collectibles: Collectible[] = [];
    const result = checkCollisions(playerState, obstacles, collectibles);
    expect(result.obstacle).not.toBeNull();
    expect(result.obstacle?.id).toBe('obs1');
  });

  it('should not detect collision with an obstacle far away', () => {
    const playerState = { ...defaultPlayerState };
    const obstacles: Obstacle[] = [
      { id: 'obs1', type: 'train', position: { x: 0, y: 0, z: 10 }, size: { width: 1, height: 2, depth: 1 } },
    ];
    const collectibles: Collectible[] = [];
    const result = checkCollisions(playerState, obstacles, collectibles);
    expect(result.obstacle).toBeNull();
  });

  it('should detect collision when player is jumping and hits a tall obstacle', () => {
    const playerState: PlayerState = {
      ...defaultPlayerState,
      position: { x: 0, y: 1, z: 0 }, // Player is in the air
      isGrounded: false,
    };
    const obstacles: Obstacle[] = [
      { id: 'obs1', type: 'train', position: { x: 0, y: 1, z: 0 }, size: { width: 1, height: 3, depth: 1 } }, // Tall obstacle
    ];
    const result = checkCollisions(playerState, obstacles, []);
    expect(result.obstacle).not.toBeNull();
    expect(result.obstacle?.id).toBe('obs1');
  });

  it('should not detect collision when player is jumping over a short obstacle', () => {
    const playerState: PlayerState = {
      ...defaultPlayerState,
      position: { x: 0, y: 2.0, z: 0 }, // Player is high enough (player maxY is 2.0 + 1.6 = 3.6)
      isGrounded: false,
    };
    const obstacles: Obstacle[] = [
       // Obstacle is at y=0, height 1. maxY for obstacle is 0 + 1/2 = 0.5
      { id: 'obs1', type: 'barrier', position: { x: 0, y: 0, z: 0 }, size: { width: 1, height: 1, depth: 1 } },
    ];
    const result = checkCollisions(playerState, obstacles, []);
    expect(result.obstacle).toBeNull();
  });

  // --- Sliding Tests ---
  it('should detect collision with a pole when sliding (poles are too tall to slide under)', () => {
    const playerState: PlayerState = {
      ...defaultPlayerState,
      isSliding: true
    };
    const obstacles: Obstacle[] = [
      // Pole is y=0, height=3. Player sliding height is 0.8. Player maxY is 0.8. Obstacle minY is 0 - 1.5 = -1.5, maxY is 1.5
      { id: 'pole1', type: 'pole', position: { x: 0, y: 0, z: 0 }, size: { width: 0.5, height: 3, depth: 0.5 } },
    ];
    const result = checkCollisions(playerState, obstacles, []);
    expect(result.obstacle).not.toBeNull();
    expect(result.obstacle?.id).toBe('pole1');
  });

  it('should not detect collision with a barrier when sliding (can slide under barriers)', () => {
    const playerState: PlayerState = {
      ...defaultPlayerState,
      isSliding: true
    };
     // Player is at y=0. Player sliding height is 0.8. Player maxY is 0.8.
    const obstacles: Obstacle[] = [
      // Barrier is at y=0, height 1. Obstacle minY is 0 - 0.5 = -0.5, maxY is 0.5
      // This specific barrier is low enough that even a non-sliding player would pass over it if player y > 0.5
      // For this test to be meaningful for sliding, the barrier needs to be high enough to hit a non-sliding player
      // but low enough for a sliding player.
      // Let's adjust barrier position: y=1, height 1. minY=0.5, maxY=1.5.
      // Player (sliding) maxY = 0.8. Player (normal) maxY = 1.6.
      { id: 'barrier1', type: 'barrier', position: { x: 0, y: 1, z: 0 }, size: { width: 2, height: 1, depth: 1 } },
    ];
    // With barrier at y=1, height 1: obstacleBox.minY = 0.5, obstacleBox.maxY = 1.5
    // Player (sliding) position y=0: playerBox.minY = 0, playerBox.maxY = 0.8.
    // No collision because playerBox.maxY (0.8) < obstacleBox.minY (should be playerBox.maxY >= obstacleBox.minY for collision)
    // Let's re-evaluate the barrier test.
    // The code has: if (obstacle.type === 'barrier' && playerState.isSliding) { continue; }
    // This means if it *would* be a collision, but it's a barrier and player is sliding, it's skipped.
    // So we need a scenario that *would* collide if not for the sliding exception.
    const collidingBarrier: Obstacle = {
        id: 'barrier1', type: 'barrier', position: { x: 0, y: 0.5, z: 0 }, size: { width: 2, height: 1, depth: 1 }
        // Obstacle Box: x (-1, 1), y (0, 1), z (-0.5, 0.5)
        // Player Sliding Box (y=0): x (-0.4, 0.4), y (0, 0.8), z (-0.4, 0.4)
        // This will collide based on AABB, then the special rule applies.
    };
    const result = checkCollisions(playerState, [collidingBarrier], []);
    expect(result.obstacle).toBeNull(); // Should be null due to sliding under barrier
  });

  it('should detect collision with a barrier if NOT sliding', () => {
    const playerState = { ...defaultPlayerState, isSliding: false };
    const obstacles: Obstacle[] = [
       { id: 'barrier1', type: 'barrier', position: { x: 0, y: 0.5, z: 0 }, size: { width: 2, height: 1, depth: 1 } }
       // Obstacle Box: x (-1, 1), y (0, 1), z (-0.5, 0.5)
       // Player Normal Box (y=0): x (-0.4, 0.4), y (0, 1.6), z (-0.4, 0.4)
       // This will collide.
    ];
    const result = checkCollisions(playerState, obstacles, []);
    expect(result.obstacle).not.toBeNull();
    expect(result.obstacle?.id).toBe('barrier1');
  });

  // --- Collectible Collision Tests ---
  it('should detect collision with a collectible', () => {
    const playerState = { ...defaultPlayerState };
    const obstacles: Obstacle[] = [];
    const collectibles: Collectible[] = [
      { id: 'coin1', type: 'coin', position: { x: 0, y: 0, z: 0 }, collected: false },
    ];
    const result = checkCollisions(playerState, obstacles, collectibles);
    expect(result.collectible).not.toBeNull();
    expect(result.collectible?.id).toBe('coin1');
  });

  it('should not detect collision with an already collected collectible', () => {
    const playerState = { ...defaultPlayerState };
    const obstacles: Obstacle[] = [];
    const collectibles: Collectible[] = [
      { id: 'coin1', type: 'coin', position: { x: 0, y: 0, z: 0 }, collected: true },
    ];
    const result = checkCollisions(playerState, obstacles, collectibles);
    expect(result.collectible).toBeNull();
  });

  it('should prioritize obstacle collision over collectible if both occur at same time', () => {
    const playerState = { ...defaultPlayerState };
    const obstacles: Obstacle[] = [
      { id: 'obs1', type: 'train', position: { x: 0, y: 0, z: 0 }, size: { width: 1, height: 2, depth: 1 } },
    ];
    const collectibles: Collectible[] = [
      { id: 'coin1', type: 'coin', position: { x: 0, y: 0, z: 0 }, collected: false },
    ];
    // The loop for obstacles is first, so if an obstacle collision is found, it breaks and returns.
    const result = checkCollisions(playerState, obstacles, collectibles);
    expect(result.obstacle).not.toBeNull();
    expect(result.obstacle?.id).toBe('obs1');
    expect(result.collectible).toBeNull(); // Collectible check is skipped if obstacle is found
  });

  // Test player bounding boxes more explicitly
  it('player bounding box should change when sliding', () => {
    const playerSliding: PlayerState = { ...defaultPlayerState, position: {x:0, y:0, z:0}, isSliding: true };
    const playerNotSliding: PlayerState = { ...defaultPlayerState, position: {x:0, y:0, z:0}, isSliding: false };

    // Obstacle that only a non-sliding player would hit from above.
    // Barrier at y=1, height 0.2. Obstacle box y: [0.9, 1.1]
    const lowObstacle: Obstacle = { id: 'lowObs', type: 'barrier', position: { x: 0, y: 1, z: 0 }, size: { width: 1, height: 0.2, depth: 1 }};

    // Player sliding: y position 0, player box y: [0, 0.8]. Misses.
    let result = checkCollisions(playerSliding, [lowObstacle], []);
    expect(result.obstacle).toBeNull(); // Sliding player (maxY 0.8) passes under obstacle (minY 0.9)

    // Player not sliding: y position 0, player box y: [0, 1.6]. Hits.
    result = checkCollisions(playerNotSliding, [lowObstacle], []);
    expect(result.obstacle).not.toBeNull();
    expect(result.obstacle?.id).toBe('lowObs');
  });

});
