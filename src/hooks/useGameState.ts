import { create } from 'zustand';

export interface GameState {
  gameStarted: boolean;
  hasFlower: boolean;
  nearFlower: boolean;
  nearPrincess: boolean;
  interactionLocked: boolean;
  endingTriggered: boolean;

  startGame: () => void;
  setNearFlower: (v: boolean) => void;
  setNearPrincess: (v: boolean) => void;
  pickupFlower: () => void;
  lockInteraction: (v: boolean) => void;
  triggerEnding: () => void;
  restart: () => void;
}

export const useGameState = create<GameState>((set) => ({
  gameStarted: false,
  hasFlower: false,
  nearFlower: false,
  nearPrincess: false,
  interactionLocked: false,
  endingTriggered: false,

  startGame: () => set({ gameStarted: true }),
  setNearFlower: (v) => set({ nearFlower: v }),
  setNearPrincess: (v) => set({ nearPrincess: v }),
  pickupFlower: () => set({ hasFlower: true, nearFlower: false }),
  lockInteraction: (v) => set({ interactionLocked: v }),
  triggerEnding: () => set({ endingTriggered: true, interactionLocked: true }),
  restart: () =>
    set({
      gameStarted: true,
      hasFlower: false,
      nearFlower: false,
      nearPrincess: false,
      interactionLocked: false,
      endingTriggered: false,
    }),
}));
