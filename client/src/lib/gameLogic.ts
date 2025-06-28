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

interface CollisionResult {
  obstacle: Obstacle | null;
  collectible: Collectible | null;
}

export function checkCollisions(
  playerState: PlayerState,
  obstacles: Obstacle[],
  collectibles: Collectible[]
): CollisionResult {
  const result: CollisionResult = {
    obstacle: null,
    collectible: null
  };

  // Player bounding box
  const playerBox = {
    minX: playerState.position.x - 0.4,
    maxX: playerState.position.x + 0.4,
    minY: playerState.position.y,
    maxY: playerState.position.y + (playerState.isSliding ? 0.8 : 1.6),
    minZ: playerState.position.z - 0.4,
    maxZ: playerState.position.z + 0.4
  };

  // Check obstacle collisions
  for (const obstacle of obstacles) {
    const obstacleBox = {
      minX: obstacle.position.x - obstacle.size.width / 2,
      maxX: obstacle.position.x + obstacle.size.width / 2,
      minY: obstacle.position.y - obstacle.size.height / 2,
      maxY: obstacle.position.y + obstacle.size.height / 2,
      minZ: obstacle.position.z - obstacle.size.depth / 2,
      maxZ: obstacle.position.z + obstacle.size.depth / 2
    };

    if (
      playerBox.maxX >= obstacleBox.minX &&
      playerBox.minX <= obstacleBox.maxX &&
      playerBox.maxY >= obstacleBox.minY &&
      playerBox.minY <= obstacleBox.maxY &&
      playerBox.maxZ >= obstacleBox.minZ &&
      playerBox.minZ <= obstacleBox.maxZ
    ) {
      // Special case for sliding under barriers
      if (obstacle.type === 'barrier' && playerState.isSliding) {
        continue; // Can slide under barriers
      }
      
      result.obstacle = obstacle;
      return result; // Prioritize obstacle collision
    }
  }

  // Check collectible collisions (only if no obstacle collision)
  for (const collectible of collectibles) {
    if (collectible.collected) continue;

    const collectibleBox = {
      minX: collectible.position.x - 0.5,
      maxX: collectible.position.x + 0.5,
      minY: collectible.position.y - 0.5,
      maxY: collectible.position.y + 0.5,
      minZ: collectible.position.z - 0.5,
      maxZ: collectible.position.z + 0.5
    };

    if (
      playerBox.maxX >= collectibleBox.minX &&
      playerBox.minX <= collectibleBox.maxX &&
      playerBox.maxY >= collectibleBox.minY &&
      playerBox.minY <= collectibleBox.maxY &&
      playerBox.maxZ >= collectibleBox.minZ &&
      playerBox.minZ <= collectibleBox.maxZ
    ) {
      result.collectible = collectible;
      break;
    }
  }

  return result;
}
