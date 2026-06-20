import Phaser from "phaser";
import ParkScene from "./ParkScene";

let game = null;

export function startGame(parentElement) {
  if (game) return game;

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: parentElement,
    width: 1600,
    height: 900,
    backgroundColor: "#173120",
    scene: [ParkScene],
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      antialias: true,
      pixelArt: false,
    },
  });

  return game;
}

export function stopGame() {
  if (game) {
    game.destroy(true);
    game = null;
  }
}