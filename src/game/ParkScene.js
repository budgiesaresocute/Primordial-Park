import Phaser from "phaser";

const TILE_W = 96;
const TILE_H = 48;
const GRID_W = 22;
const GRID_H = 22;
const ORIGIN_X = 880;
const ORIGIN_Y = 140;

function iso(x, y) {
  return {
    x: ORIGIN_X + (x - y) * (TILE_W / 2),
    y: ORIGIN_Y + (x + y) * (TILE_H / 2),
  };
}

function makeDiamondTexture(scene, key, w, h, fill, border, kind = "grass") {
  if (scene.textures.exists(key)) scene.textures.remove(key);

  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(fill, 1);
  g.lineStyle(2, border, 1);

  g.beginPath();
  g.moveTo(w / 2, 0);
  g.lineTo(w, h / 2);
  g.lineTo(w / 2, h);
  g.lineTo(0, h / 2);
  g.closePath();
  g.fillPath();
  g.strokePath();

  if (kind === "road") {
    g.fillStyle(0xf0e6c2, 0.9);
    g.fillRect(w / 2 - 24, h / 2 - 3, 48, 6);
    g.fillStyle(0xffffff, 0.35);
    g.fillRect(w / 2 - 6, h / 2 - 12, 12, 24);
  }

  if (kind === "water") {
    g.fillStyle(0xffffff, 0.18);
    g.fillEllipse(w * 0.35, h * 0.38, w * 0.18, h * 0.12);
    g.fillEllipse(w * 0.62, h * 0.58, w * 0.22, h * 0.13);
  }

  if (kind === "grass") {
    g.fillStyle(0xffffff, 0.08);
    g.fillEllipse(w * 0.32, h * 0.34, w * 0.16, h * 0.1);
    g.fillEllipse(w * 0.66, h * 0.6, w * 0.12, h * 0.08);
    g.fillStyle(0x000000, 0.05);
    g.fillEllipse(w * 0.55, h * 0.45, w * 0.28, h * 0.14);
  }

  g.generateTexture(key, w, h);
  g.destroy();
}

function makeBuildingTexture(scene, key, base, roof, accent) {
  if (scene.textures.exists(key)) scene.textures.remove(key);

  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  g.fillStyle(base, 1);
  g.fillRoundedRect(10, 26, 100, 56, 8);

  g.fillStyle(roof, 1);
  g.fillTriangle(10, 30, 60, 6, 110, 30);

  g.fillStyle(accent, 1);
  g.fillRoundedRect(18, 40, 18, 18, 3);
  g.fillRoundedRect(42, 40, 18, 18, 3);
  g.fillRoundedRect(66, 40, 18, 18, 3);
  g.fillRoundedRect(90, 40, 12, 18, 3);

  g.fillStyle(0xffffff, 0.2);
  g.fillRect(14, 25, 96, 7);

  g.lineStyle(3, 0x000000, 0.25);
  g.strokeRoundedRect(10, 26, 100, 56, 8);

  g.generateTexture(key, 120, 96);
  g.destroy();
}

function makeDinoTexture(scene, key, body, accent, sail = false) {
  if (scene.textures.exists(key)) scene.textures.remove(key);

  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  g.fillStyle(body, 1);
  g.fillEllipse(56, 46, 54, 30);

  g.fillStyle(accent, 1);
  g.fillEllipse(77, 38, 18, 16);

  g.fillStyle(body, 1);
  g.fillTriangle(28, 47, 8, 38, 28, 58);

  g.fillRect(40, 58, 8, 18);
  g.fillRect(58, 58, 8, 18);

  g.fillStyle(0x1f1f1f, 0.65);
  g.fillCircle(80, 36, 2);

  if (sail) {
    g.fillStyle(0xffffff, 0.16);
    g.fillTriangle(46, 18, 58, 2, 74, 22);
    g.fillStyle(accent, 1);
    g.fillTriangle(50, 20, 58, 6, 70, 22);
  }

  g.lineStyle(2, 0x000000, 0.28);
  g.strokeEllipse(56, 46, 54, 30);

  g.generateTexture(key, 96, 72);
  g.destroy();
}

function makeTreeTexture(scene, key, trunk, leaves) {
  if (scene.textures.exists(key)) scene.textures.remove(key);

  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  g.fillStyle(trunk, 1);
  g.fillRoundedRect(31, 40, 10, 24, 2);

  g.fillStyle(leaves, 1);
  g.fillCircle(36, 28, 18);
  g.fillCircle(22, 34, 12);
  g.fillCircle(50, 34, 12);
  g.fillCircle(36, 18, 12);

  g.fillStyle(0xffffff, 0.1);
  g.fillCircle(29, 24, 6);

  g.generateTexture(key, 72, 72);
  g.destroy();
}

function makePopup(scene, x, y, text, color = "#ffe27a") {
  const popup = scene.add
    .text(x, y, text, {
      fontFamily: "Arial",
      fontSize: "18px",
      color,
      stroke: "#000000",
      strokeThickness: 4,
      fontStyle: "bold",
    })
    .setOrigin(0.5)
    .setDepth(5000);

  scene.tweens.add({
    targets: popup,
    y: y - 50,
    alpha: 0,
    duration: 900,
    ease: "Sine.easeOut",
    onComplete: () => popup.destroy(),
  });
}

export default class ParkScene extends Phaser.Scene {
  constructor() {
    super("ParkScene");
  }

  create() {
    this.state = {
      coins: 10000,
      dna: 400,
      cash: 50,
      food: 5000,
      level: 1,
    };

    this.selectedTool = "Park";

    this.makeTextures();
    this.drawWorld();
    this.createHud();
    this.createBottomMenu();
    this.setupCamera();
    this.createDinos();

    this.input.on("wheel", (_pointer, _gameObjects, _deltaX, deltaY) => {
      const cam = this.cameras.main;
      cam.zoom = Phaser.Math.Clamp(cam.zoom - deltaY * 0.001, 0.75, 1.35);
    });

    this.dragging = false;
    this.dragStart = { x: 0, y: 0, scrollX: 0, scrollY: 0 };

    this.input.on("pointerdown", (pointer) => {
      if (pointer.y < 76 || pointer.y > 820) return;
      this.dragging = true;
      this.dragStart = {
        x: pointer.x,
        y: pointer.y,
        scrollX: this.cameras.main.scrollX,
        scrollY: this.cameras.main.scrollY,
      };
    });

    this.input.on("pointermove", (pointer) => {
      if (!this.dragging || !pointer.isDown) return;

      const cam = this.cameras.main;
      cam.scrollX = this.dragStart.scrollX - (pointer.x - this.dragStart.x) / cam.zoom;
      cam.scrollY = this.dragStart.scrollY - (pointer.y - this.dragStart.y) / cam.zoom;
    });

    this.input.on("pointerup", () => {
      this.dragging = false;
    });
  }

  makeTextures() {
    makeDiamondTexture(this, "grassTile", TILE_W, TILE_H, 0x5d9d4f, 0x3f6e36, "grass");
    makeDiamondTexture(this, "roadTile", TILE_W, TILE_H, 0x7e6f61, 0x51473f, "road");
    makeDiamondTexture(this, "waterTile", TILE_W, TILE_H, 0x2c79b9, 0x1d4f7b, "water");
    makeDiamondTexture(this, "habitatTile", 192, 96, 0x6da34f, 0x26451c, "grass");

    makeBuildingTexture(this, "promenade", 0xb57a4d, 0x7a4b2c, 0xf4deab);
    makeBuildingTexture(this, "grill", 0x8d5735, 0x3f2417, 0xf0d1b3);
    makeBuildingTexture(this, "amber", 0xb78a2b, 0x6d520f, 0xfceca8);
    makeBuildingTexture(this, "theater", 0x6a6fa8, 0x40476f, 0xcdd5ff);
    makeBuildingTexture(this, "amphitheater", 0x8a5b3b, 0x4b2d1a, 0xf0ccb0);
    makeBuildingTexture(this, "skydeck", 0x5a7d8c, 0x2d4450, 0xd5f5ff);

    makeDinoTexture(this, "trexDino", 0x3c5f2f, 0x4b7b3a, false);
    makeDinoTexture(this, "spinoDino", 0x2f6d75, 0x4fa7b5, true);
    makeDinoTexture(this, "raptorDino", 0x7b5a2f, 0xb3864a, false);

    makeTreeTexture(this, "tree", 0x6d4420, 0x2f7d32);
  }

  drawWorld() {
    this.add.rectangle(0, 0, 1600, 900, 0x14301f).setOrigin(0);
    this.add.rectangle(0, 0, 1600, 92, 0x0f2418).setOrigin(0).setDepth(4000);
    this.add.rectangle(0, 812, 1600, 88, 0x101010).setOrigin(0).setDepth(4000);

    for (let y = 0; y < GRID_H; y++) {
      for (let x = 0; x < GRID_W; x++) {
        const { x: sx, y: sy } = iso(x, y);

        let key = "grassTile";
        if (x === 10 || x === 11 || y === 10 || y === 11) key = "roadTile";
        if ((x >= 1 && x <= 4 && y >= 14 && y <= 18) || (x >= 15 && x <= 18 && y >= 2 && y <= 5)) {
          key = "waterTile";
        }

        this.add.image(sx, sy, key).setDepth(sy);
      }
    }

    const trees = [
      [0, 7],
      [1, 6],
      [2, 5],
      [3, 16],
      [4, 17],
      [18, 15],
      [19, 16],
      [20, 17],
      [17, 3],
      [16, 4],
      [6, 1],
      [7, 2],
      [14, 18],
      [5, 19],
    ];

    trees.forEach(([x, y]) => {
      const p = iso(x, y);
      this.add.image(p.x, p.y - 12, "tree").setScale(0.8).setDepth(p.y + 10);
    });

    this.addHabitat({
      name: "Spinosaurus Lagoon",
      x: 4,
      y: 6,
      w: 4,
      h: 3,
      reward: 17000,
      labelColor: "#7ee4ff",
      dino: {
        texture: "spinoDino",
        label: "Spinosaurus",
        offsetX: 0,
        offsetY: 18,
        scale: 1.3,
      },
    });

    this.addHabitat({
      name: "T. rex Valley",
      x: 14,
      y: 5,
      w: 4,
      h: 3,
      reward: 30200,
      labelColor: "#ffd86b",
      dino: {
        texture: "trexDino",
        label: "T. rex",
        offsetX: 2,
        offsetY: 18,
        scale: 1.28,
      },
    });

    this.addHabitat({
      name: "Raptor Grove",
      x: 9,
      y: 14,
      w: 3,
      h: 3,
      reward: 5105,
      labelColor: "#d6a7ff",
      dino: {
        texture: "raptorDino",
        label: "Velociraptor Pack",
        offsetX: 0,
        offsetY: 14,
        scale: 1.05,
      },
    });

    this.addBuilding(3, 12, "promenade", "Prehistoric Promenade", "17,000 / 1 hr");
    this.addBuilding(8, 4, "grill", "Fossil Fuel Grill", "30,200 / 2 hr");
    this.addBuilding(13, 12, "amber", "Amber Exchange", "56,000 / 2 hr");
    this.addBuilding(16, 16, "theater", "Mesozoic Mega-Theater", "10,100 / 30 min");
    this.addBuilding(18, 8, "skydeck", "Pangaea Sky-Deck", "39,000 / 1 hr");
    this.addBuilding(10, 2, "amphitheater", "Palaeo-Amphitheater", "2,900 / 5 min");

    this.add.graphics()
      .lineStyle(4, 0xdfe7d7, 0.7)
      .strokeRoundedRect(220, 150, 1080, 540, 26)
      .setDepth(3500);

    this.add.text(120, 96, "HELICOPTER PARK VIEW", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#dff7dc",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4,
    }).setDepth(4200);

    this.add.text(120, 120, "Drag to pan • Scroll to zoom • Click habitats to collect coins", {
      fontFamily: "Arial",
      fontSize: "13px",
      color: "#b9d8b4",
      stroke: "#000000",
      strokeThickness: 3,
    }).setDepth(4200);
  }

  addHabitat({ name, x, y, w, h, reward, labelColor, dino }) {
    const topLeft = iso(x, y);
    const topRight = iso(x + w, y);
    const bottomRight = iso(x + w, y + h);
    const bottomLeft = iso(x, y + h);
    const center = iso(x + w / 2, y + h / 2);

    const g = this.add.graphics().setDepth(center.y + 2);
    g.fillStyle(0x233c1d, 0.35);
    g.fillPoints(
      [
        new Phaser.Geom.Point(topLeft.x, topLeft.y),
        new Phaser.Geom.Point(topRight.x, topRight.y),
        new Phaser.Geom.Point(bottomRight.x, bottomRight.y),
        new Phaser.Geom.Point(bottomLeft.x, bottomLeft.y),
      ],
      true
    );

    g.lineStyle(5, 0xd7d7d7, 0.9);
    g.strokePoints(
      [
        new Phaser.Geom.Point(topLeft.x, topLeft.y),
        new Phaser.Geom.Point(topRight.x, topRight.y),
        new Phaser.Geom.Point(bottomRight.x, bottomRight.y),
        new Phaser.Geom.Point(bottomLeft.x, bottomLeft.y),
      ],
      true
    );

    const floor = this.add.image(center.x, center.y, "habitatTile").setDepth(center.y + 1);
    floor.setScale(1.2, 1.2);

    const dinoSprite = this.add
      .image(center.x + dino.offsetX, center.y + dino.offsetY, dino.texture)
      .setScale(dino.scale)
      .setDepth(center.y + 20);

    const label = this.add.text(center.x, topLeft.y - 34, name, {
      fontFamily: "Arial",
      fontSize: "14px",
      color: labelColor,
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4,
      align: "center",
    }).setOrigin(0.5).setDepth(center.y + 100);

    const rewardText = this.add.text(center.x, topLeft.y - 14, `Tap to collect +${reward.toLocaleString()} coins`, {
      fontFamily: "Arial",
      fontSize: "11px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 3,
      align: "center",
    }).setOrigin(0.5).setDepth(center.y + 100);

    const hitArea = this.add.rectangle(center.x, center.y, 180, 110, 0x000000, 0.001)
      .setInteractive({ useHandCursor: true })
      .setDepth(center.y + 200);

    hitArea.on("pointerdown", () => {
      this.state.coins += reward;
      this.refreshHud();
      makePopup(this, center.x, center.y - 10, `+${reward.toLocaleString()}`, "#ffe78e");
    });

    this.dinoAgents.push({
      sprite: dinoSprite,
      homeX: center.x,
      homeY: center.y + 10,
      targetX: center.x,
      targetY: center.y + 10,
      roam: 45,
      speed: dino.texture === "spinoDino" ? 26 : dino.texture === "trexDino" ? 20 : 34,
    });

    this.add.text(center.x, bottomRight.y + 8, "Habitat", {
      fontFamily: "Arial",
      fontSize: "11px",
      color: "#d9ead3",
      stroke: "#000000",
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(center.y + 100);

    this.habitatObjects.push({ g, floor, dinoSprite, label, rewardText, hitArea });
  }

  addBuilding(x, y, texture, title, income) {
    const p = iso(x, y);
    const building = this.add.image(p.x, p.y + 6, texture).setDepth(p.y + 20).setScale(1.0);

    const shadow = this.add.ellipse(p.x + 4, p.y + 56, 92, 24, 0x000000, 0.18).setDepth(p.y + 10);

    this.add.text(p.x, p.y - 32, title, {
      fontFamily: "Arial",
      fontSize: "13px",
      color: "#ffffff",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4,
      align: "center",
    }).setOrigin(0.5).setDepth(p.y + 100);

    this.add.text(p.x, p.y - 14, income, {
      fontFamily: "Arial",
      fontSize: "11px",
      color: "#d9ffe0",
      stroke: "#000000",
      strokeThickness: 3,
      align: "center",
    }).setOrigin(0.5).setDepth(p.y + 100);

    this.buildingObjects.push({ building, shadow });
  }

  createDinos() {
    this.dinoAgents = [];
    this.habitatObjects = [];
    this.buildingObjects = [];
  }

  createHud() {
    const bar = this.add.rectangle(0, 0, 1600, 72, 0x09140e, 0.92).setOrigin(0).setDepth(6000);
    this.hudCoins = this.add.text(28, 18, "", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#fff5ab",
      fontStyle: "bold",
    }).setDepth(6001);

    this.hudDNA = this.add.text(320, 18, "", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#8be5ff",
      fontStyle: "bold",
    }).setDepth(6001);

    this.hudCash = this.add.text(520, 18, "", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#ffcd7c",
      fontStyle: "bold",
    }).setDepth(6001);

    this.hudFood = this.add.text(690, 18, "", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#b8f7a3",
      fontStyle: "bold",
    }).setDepth(6001);

    this.hudLevel = this.add.text(880, 18, "", {
      fontFamily: "Arial",
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "bold",
    }).setDepth(6001);

    this.toolText = this.add.text(1150, 18, "Selected: Park", {
      fontFamily: "Arial",
      fontSize: "18px",
      color: "#eaf5e7",
      fontStyle: "bold",
    }).setDepth(6001);

    this.refreshHud();
    bar.setScrollFactor(0);
    this.hudCoins.setScrollFactor(0);
    this.hudDNA.setScrollFactor(0);
    this.hudCash.setScrollFactor(0);
    this.hudFood.setScrollFactor(0);
    this.hudLevel.setScrollFactor(0);
    this.toolText.setScrollFactor(0);
  }

  refreshHud() {
    this.hudCoins.setText(`Coins: ${this.state.coins.toLocaleString()}`);
    this.hudDNA.setText(`DNA: ${this.state.dna.toLocaleString()}`);
    this.hudCash.setText(`Cash: ${this.state.cash.toLocaleString()}`);
    this.hudFood.setText(`Food: ${this.state.food.toLocaleString()}`);
    this.hudLevel.setText(`Level: ${this.state.level}`);
  }

  createBottomMenu() {
    const bg = this.add.rectangle(0, 812, 1600, 88, 0x121212, 0.96).setOrigin(0).setDepth(6000);

    const buttons = [
      { label: "Dinosaurs", x: 220 },
      { label: "Buildings", x: 470 },
      { label: "Decorations", x: 720 },
      { label: "Battle", x: 970 },
      { label: "Market", x: 1220 },
    ];

    buttons.forEach((btn) => {
      const fill = btn.label === "Buildings" ? 0x2d7d39 : 0x21443a;
      const box = this.add.rectangle(btn.x, 856, 190, 46, fill, 0.98)
        .setStrokeStyle(2, 0xb8f7a3, 0.45)
        .setInteractive({ useHandCursor: true })
        .setDepth(6001);

      const text = this.add.text(btn.x, 856, btn.label, {
        fontFamily: "Arial",
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold",
      }).setOrigin(0.5).setDepth(6002);

      box.on("pointerover", () => box.setFillStyle(0x3d8f4a, 1));
      box.on("pointerout", () => box.setFillStyle(fill, 1));
      box.on("pointerdown", () => {
        this.selectedTool = btn.label;
        this.toolText.setText(`Selected: ${btn.label}`);
        makePopup(this, btn.x, 790, btn.label, "#dff7dc");
      });
    });

    bg.setScrollFactor(0);
  }

  setupCamera() {
    const cam = this.cameras.main;
    cam.setBounds(-200, -100, 2400, 1600);
    cam.centerOn(ORIGIN_X + 120, ORIGIN_Y + 300);
    cam.setZoom(1.12);
  }

  update(_time, delta) {
    const cam = this.cameras.main;
    const speed = 520 * (delta / 1000);

    if (this.input.keyboard?.addKeys) {
      const keys = this.input.keyboard.addKeys("W,A,S,D,UP,LEFT,DOWN,RIGHT");
      if (keys.A.isDown || keys.LEFT.isDown) cam.scrollX -= speed / cam.zoom;
      if (keys.D.isDown || keys.RIGHT.isDown) cam.scrollX += speed / cam.zoom;
      if (keys.W.isDown || keys.UP.isDown) cam.scrollY -= speed / cam.zoom;
      if (keys.S.isDown || keys.DOWN.isDown) cam.scrollY += speed / cam.zoom;
    }

    this.dinoAgents.forEach((agent) => {
      if (!agent.sprite) return;

      if (
        Phaser.Math.Distance.Between(agent.sprite.x, agent.sprite.y, agent.targetX, agent.targetY) < 8
      ) {
        agent.targetX = agent.homeX + Phaser.Math.Between(-agent.roam, agent.roam);
        agent.targetY = agent.homeY + Phaser.Math.Between(-agent.roam, agent.roam);
      }

      const dx = agent.targetX - agent.sprite.x;
      const dy = agent.targetY - agent.sprite.y;
      const len = Math.max(1, Math.sqrt(dx * dx + dy * dy));

      agent.sprite.x += (dx / len) * agent.speed * (delta / 1000);
      agent.sprite.y += (dy / len) * agent.speed * (delta / 1000);

      agent.sprite.setFlipX(dx < 0);
      agent.sprite.setDepth(agent.sprite.y + 20);
    });
  }
}