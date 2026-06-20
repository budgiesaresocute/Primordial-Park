import { useEffect, useRef } from "react";
import { startGame, stopGame } from "../game/createGame";

export default function PhaserGame() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    startGame(containerRef.current);

    return () => {
      stopGame();
    };
  }, []);

  return <div ref={containerRef} className="phaser-root" />;
}