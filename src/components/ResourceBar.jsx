import { useGameStore } from "../store/gameStore";

export default function ResourceBar() {
  const { coins, dna, cash, food, level } = useGameStore();

  return (
    <div className="topbar">
      <div>🪙 {coins}</div>
      <div>🧬 {dna}</div>
      <div>💵 {cash}</div>
      <div>🌽 {food}</div>
      <div>⭐ {level}</div>
    </div>
  );
}