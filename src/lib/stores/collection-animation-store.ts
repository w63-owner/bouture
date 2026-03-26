import { create } from "zustand";

interface CollectionAnimationState {
  isBouncing: boolean;
  triggerBounce: () => void;
}

export const useCollectionAnimationStore = create<CollectionAnimationState>(
  (set) => ({
    isBouncing: false,
    triggerBounce: () => {
      set({ isBouncing: true });
      setTimeout(() => set({ isBouncing: false }), 1000);
    },
  }),
);
