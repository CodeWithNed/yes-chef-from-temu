import { create } from 'zustand';

interface PredictionState {
  prediction: string[];
  setPrediction: (prediction: string[]) => void;
}

export const usePredictionStore = create<PredictionState>((set) => ({
  prediction: [],
  setPrediction: (prediction) => set({ prediction }),
}));
