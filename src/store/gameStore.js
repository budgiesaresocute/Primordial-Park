import { create } from "zustand";

export const useGameStore = create(() => ({
  coins: 10000,
  dna: 400,
  cash: 50,
  food: 5000,
  level: 1
}));