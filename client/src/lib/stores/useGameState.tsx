import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type GameState = "menu" | "playing" | "gameOver";

interface PlayerState {
  position: { x: number; y: number; z: number };
  targetLane: number; // -1, 0, 1 for left, center, right lanes
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

interface GameStoreState {
  gameState: GameState;
  score: number;
  distance: number;
  gameSpeed: number;
  playerState: PlayerState;
  obstacles: Obstacle[];
  collectibles: Collectible[];

  // Actions
  start: () => void;
  restart: () => void;
  gameOver: () => void;
  updatePlayerState: (updates: Partial<PlayerState>) => void;
  generateNewSegment: () => void;
  removeObstacle: (id: string) => void;
  removeCollectible: (id: string) => void;
  collectCoin: (id: string) => void;
}

const initialPlayerState: PlayerState = {
  position: { x: 0, y: 0, z: 0 },
  targetLane: 0,
  verticalVelocity: 0,
  isGrounded: true,
  isSliding: false
};

export const useGameState = create<GameStoreState>()(
  subscribeWithSelector((set, get) => ({
    gameState: "menu",
    score: 0,
    distance: 0,
    gameSpeed: 25,
    playerState: initialPlayerState,
    obstacles: [],
    collectibles: [],

    start: () => {
      console.log("Starting game");
      set({
        gameState: "playing",
        score: 0,
        distance: 0,
        gameSpeed: 25,
        playerState: initialPlayerState,
        obstacles: [],
        collectibles: []
      });
      
      // Generate initial segments
      const state = get();
      state.generateNewSegment();
      state.generateNewSegment();
    },

    restart: () => {
      console.log("Restarting game");
      const state = get();
      state.start();
    },

    gameOver: () => {
      console.log("Game over");
      set({ gameState: "gameOver" });
    },

    updatePlayerState: (updates) => {
      set((state) => ({
        playerState: { ...state.playerState, ...updates }
      }));
      
      // Update distance and score based on movement
      if (updates.position) {
        set((state) => ({
          distance: Math.abs(state.playerState.position.z),
          score: state.score + 1 // Points for staying alive
        }));
      }
    },

    generateNewSegment: () => {
      const state = get();
      const segmentLength = 50;
      const currentZ = -state.distance - segmentLength;
      
      const newObstacles: Obstacle[] = [];
      const newCollectibles: Collectible[] = [];
      
      // Generate obstacles
      for (let i = 0; i < 8; i++) {
        const z = currentZ - Math.random() * segmentLength;
        const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        const x = lane * 4;
        
        if (Math.random() < 0.3) { // 30% chance for obstacle
          const obstacleTypes: ('train' | 'barrier' | 'pole')[] = ['train', 'barrier', 'pole'];
          const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
          
          let size = { width: 1.5, height: 2, depth: 1.5 };
          if (type === 'train') {
            size = { width: 2, height: 3, depth: 8 };
          } else if (type === 'pole') {
            size = { width: 0.5, height: 4, depth: 0.5 };
          }
          
          newObstacles.push({
            id: `obstacle-${Date.now()}-${Math.random()}`,
            position: { x, y: size.height / 2, z },
            type,
            size
          });
        }
        
        // Generate collectibles
        if (Math.random() < 0.2) { // 20% chance for collectible
          const type = Math.random() < 0.8 ? 'coin' : 'powerup';
          newCollectibles.push({
            id: `collectible-${Date.now()}-${Math.random()}`,
            position: { x, y: 1.5, z: z + 2 }, // Slightly offset from obstacles
            type,
            collected: false
          });
        }
      }
      
      set((state) => ({
        obstacles: [...state.obstacles, ...newObstacles],
        collectibles: [...state.collectibles, ...newCollectibles]
      }));
    },

    removeObstacle: (id) => {
      set((state) => ({
        obstacles: state.obstacles.filter(o => o.id !== id)
      }));
    },

    removeCollectible: (id) => {
      set((state) => ({
        collectibles: state.collectibles.filter(c => c.id !== id)
      }));
    },

    collectCoin: (id) => {
      set((state) => ({
        collectibles: state.collectibles.map(c => 
          c.id === id ? { ...c, collected: true } : c
        ),
        score: state.score + (state.collectibles.find(c => c.id === id)?.type === 'coin' ? 100 : 500)
      }));
    }
  }))
);

// Subscribe to game state changes for progressive difficulty
useGameState.subscribe(
  (state) => state.distance,
  (distance) => {
    const newSpeed = 25 + Math.floor(distance / 100) * 5; // Increase speed every 100m
    useGameState.setState({ gameSpeed: Math.min(newSpeed, 60) }); // Cap at 60
  }
);
