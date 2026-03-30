import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Npc from './essentials/Npc.js';
import Barrier from './essentials/Barrier.js';

class GameLevelBasketball {
  constructor(gameEnv) {
    this.gameEnv = gameEnv;

    const width = gameEnv.innerWidth || 800;
    const height = gameEnv.innerHeight || 580;
    const path = gameEnv.path;

    // Core game state
    this.levelDurationSeconds = 45;
    this.remainingSeconds = this.levelDurationSeconds;
    this.bestTimeSeconds = 0;
    this.levelWon = false;
    this.levelLost = false;
    this.lastTimestamp = 0;
    this.startTimestamp = 0;
    this.frameDelta = 0;

    // Dribbling state
    this.dribblePhase = 0;
    this.dribbleFrequency = 10;

    // DOM/UI refs
    this.hudCanvas = null;
    this.hudCtx = null;

    // Keep these for fast lookup and restart
    this.playerStart = {
      x: Math.round(width * 0.08),
      y: Math.round(height * 0.5)
    };
    this.lebronStart = {
      x: Math.round(width * 0.9),
      y: Math.round(height * 0.5)
    };

    // Background setup (Aquatic-style data pattern)
    const image_src_court = path + '/images/gamebuilder/bg/BballCourt.png';
    const image_data_court = {
      id: 'Basketball-Court',
      src: image_src_court,
      pixels: { height: 580, width: 900 }
    };

    // Player setup
    const sprite_src_player = path + '/images/gamebuilder/sprites/BasketballPlayer.png';
    const sprite_data_player = {
      id: 'BasketballPlayer',
      greeting: 'Keep dribbling and protect the ball!',
      src: sprite_src_player,
      SCALE_FACTOR: 4,
      STEP_FACTOR: 1100,
      ANIMATION_RATE: 120,
      INIT_POSITION: { ...this.playerStart },
      pixels: { height: 512, width: 384 },
      orientation: { rows: 4, columns: 3 },
      down: { row: 0, start: 0, columns: 3 },
      left: { row: 1, start: 0, columns: 3 },
      right: { row: 2, start: 0, columns: 3 },
      up: { row: 3, start: 0, columns: 3 },
      downRight: { row: 2, start: 0, columns: 3 },
      downLeft: { row: 1, start: 0, columns: 3 },
      upRight: { row: 2, start: 0, columns: 3 },
      upLeft: { row: 1, start: 0, columns: 3 },
      hitbox: { widthPercentage: 0.45, heightPercentage: 0.6 },
      keypress: { up: 87, left: 65, down: 83, right: 68 }
    };

    // LeBron setup
    const sprite_src_lebron = path + '/images/gamebuilder/sprites/bron.png';
    const sprite_data_lebron = {
      id: 'LeBron',
      greeting: 'LeBron stole the ball!',
      src: sprite_src_lebron,
      SCALE_FACTOR: 3.5,
      ANIMATION_RATE: 200,
      INIT_POSITION: { ...this.lebronStart },
      pixels: { height: 1350, width: 1080 },
      orientation: { rows: 1, columns: 1 },
      down: { row: 0, start: 0, columns: 1 },
      left: { row: 0, start: 0, columns: 1 },
      right: { row: 0, start: 0, columns: 1 },
      up: { row: 0, start: 0, columns: 1 },
      downRight: { row: 0, start: 0, columns: 1 },
      downLeft: { row: 0, start: 0, columns: 1 },
      upRight: { row: 0, start: 0, columns: 1 },
      upLeft: { row: 0, start: 0, columns: 1 },
      hitbox: { widthPercentage: 0.65, heightPercentage: 0.75 },
      dialogues: ['LeBron stole the ball! Press R to restart.'],
      reaction: function () {
        if (this.dialogueSystem) {
          this.showReactionDialogue();
        }
      },
      interact: function () {
        if (this.dialogueSystem) {
          this.showReactionDialogue();
        }
      }
    };

    // Court barriers/walls
    const barrier_1 = {
      id: 'barrier_1',
      x: Math.round(width * 0.25),
      y: Math.round(height * 0.25),
      width: Math.round(width * 0.12),
      height: Math.round(height * 0.08),
      visible: false,
      hitbox: { widthPercentage: 1.0, heightPercentage: 1.0 },
      fromOverlay: false
    };

    const barrier_2 = {
      id: 'barrier_2',
      x: Math.round(width * 0.55),
      y: Math.round(height * 0.55),
      width: Math.round(width * 0.12),
      height: Math.round(height * 0.08),
      visible: false,
      hitbox: { widthPercentage: 1.0, heightPercentage: 1.0 },
      fromOverlay: false
    };

    const barrier_3 = {
      id: 'barrier_3',
      x: Math.round(width * 0.35),
      y: Math.round(height * 0.6),
      width: Math.round(width * 0.1),
      height: Math.round(height * 0.08),
      visible: false,
      hitbox: { widthPercentage: 1.0, heightPercentage: 1.0 },
      fromOverlay: false
    };

    const barrier_4 = {
      id: 'barrier_4',
      x: Math.round(width * 0.6),
      y: Math.round(height * 0.2),
      width: Math.round(width * 0.1),
      height: Math.round(height * 0.08),
      visible: false,
      hitbox: { widthPercentage: 1.0, heightPercentage: 1.0 },
      fromOverlay: false
    };

    const wall_top = {
      id: 'wall_top',
      x: 0,
      y: 0,
      width,
      height: 8,
      visible: false,
      hitbox: { widthPercentage: 1.0, heightPercentage: 1.0 },
      fromOverlay: false
    };

    const wall_bottom = {
      id: 'wall_bottom',
      x: 0,
      y: height - 8,
      width,
      height: 8,
      visible: false,
      hitbox: { widthPercentage: 1.0, heightPercentage: 1.0 },
      fromOverlay: false
    };

    const wall_left = {
      id: 'wall_left',
      x: 0,
      y: 0,
      width: 8,
      height,
      visible: false,
      hitbox: { widthPercentage: 1.0, heightPercentage: 1.0 },
      fromOverlay: false
    };

    const wall_right = {
      id: 'wall_right',
      x: width - 8,
      y: 0,
      width: 8,
      height,
      visible: false,
      hitbox: { widthPercentage: 1.0, heightPercentage: 1.0 },
      fromOverlay: false
    };

    this.classes = [
      { class: GameEnvBackground, data: image_data_court },
      { class: Player, data: sprite_data_player },
      { class: Npc, data: sprite_data_lebron },
      { class: Barrier, data: barrier_1 },
      { class: Barrier, data: barrier_2 },
      { class: Barrier, data: barrier_3 },
      { class: Barrier, data: barrier_4 },
      { class: Barrier, data: wall_top },
      { class: Barrier, data: wall_bottom },
      { class: Barrier, data: wall_left },
      { class: Barrier, data: wall_right }
    ];

    this.handleRestartKey = this.handleRestartKey.bind(this);
  }

  initialize() {
    this.startTimestamp = performance.now();
    this.lastTimestamp = this.startTimestamp;
    this.createHudCanvas();
    document.addEventListener('keydown', this.handleRestartKey);
  }

  update() {
    if (!this.lastTimestamp) {
      this.lastTimestamp = performance.now();
    }

    const now = performance.now();
    this.frameDelta = Math.min((now - this.lastTimestamp) / 1000, 0.05);
    this.lastTimestamp = now;

    const player = this.findObjectById('BasketballPlayer');
    const lebron = this.findObjectById('LeBron');

    if (!player || !lebron) {
      this.drawHud();
      return;
    }

    if (!this.levelWon && !this.levelLost) {
      this.updateCountdown(now);
      this.updateLeBronChase(lebron, player);
      this.updateDribble(player);

      if (this.isTouching(lebron, player)) {
        this.levelLost = true;
        this.bestTimeSeconds = Math.max(this.bestTimeSeconds, this.getSurvivalTimeSeconds());
        if (typeof lebron.showReactionDialogue === 'function') {
          lebron.showReactionDialogue();
        }
      }

      if (this.remainingSeconds <= 0) {
        this.levelWon = true;
        this.bestTimeSeconds = Math.max(this.bestTimeSeconds, this.levelDurationSeconds);
      }
    }

    this.drawHud(player);
  }

  updateCountdown(now) {
    const elapsed = (now - this.startTimestamp) / 1000;
    this.remainingSeconds = Math.max(0, this.levelDurationSeconds - elapsed);
  }

  updateLeBronChase(lebron, player) {
    const p = this.getPos(player);
    const b = this.getPos(lebron);

    const dx = p.x - b.x;
    const dy = p.y - b.y;
    const distance = Math.hypot(dx, dy);

    if (distance < 1) return;

    const elapsed = this.levelDurationSeconds - this.remainingSeconds;
    const chaseSpeed = Math.min(2.2 + elapsed * 0.06, 5.8);

    const nextX = b.x + (dx / distance) * chaseSpeed;
    const nextY = b.y + (dy / distance) * chaseSpeed;

    const moved = this.resolveBarrierCollision(nextX, nextY, lebron.width || 40, lebron.height || 40);

    lebron.position.x = moved.x;
    lebron.position.y = moved.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      lebron.direction = dx >= 0 ? 'right' : 'left';
    } else {
      lebron.direction = dy >= 0 ? 'down' : 'up';
    }
  }

  updateDribble(player) {
    this.dribblePhase += this.frameDelta * this.dribbleFrequency;

    const isMoving = Math.abs(player.velocity?.x || 0) > 0 || Math.abs(player.velocity?.y || 0) > 0;
    if (isMoving) {
      this.dribblePhase += this.frameDelta * this.dribbleFrequency * 0.5;
    }
  }

  resolveBarrierCollision(nextX, nextY, actorWidth, actorHeight) {
    const barriers = this.gameEnv.gameObjects.filter((obj) => obj instanceof Barrier);

    const actorRect = {
      left: nextX,
      right: nextX + actorWidth,
      top: nextY,
      bottom: nextY + actorHeight
    };

    for (const barrier of barriers) {
      const barrierRect = {
        left: barrier.x,
        right: barrier.x + barrier.width,
        top: barrier.y,
        bottom: barrier.y + barrier.height
      };

      const overlaps =
        actorRect.right > barrierRect.left &&
        actorRect.left < barrierRect.right &&
        actorRect.bottom > barrierRect.top &&
        actorRect.top < barrierRect.bottom;

      if (overlaps) {
        return this.getPos(this.findObjectById('LeBron'));
      }
    }

    // Keep LeBron inside court bounds
    const maxX = (this.gameEnv.innerWidth || 800) - actorWidth;
    const maxY = (this.gameEnv.innerHeight || 580) - actorHeight;

    return {
      x: Math.max(0, Math.min(nextX, maxX)),
      y: Math.max(0, Math.min(nextY, maxY))
    };
  }

  drawHud(player = null) {
    if (!this.hudCtx || !this.hudCanvas) return;

    const ctx = this.hudCtx;
    const W = this.hudCanvas.width;
    const H = this.hudCanvas.height;

    ctx.clearRect(0, 0, W, H);

    // Top timer box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(W / 2 - 165, 8, 330, 42);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(14, Math.round(W * 0.018))}px monospace`;
    ctx.fillText(`Clock: ${this.remainingSeconds.toFixed(1)}s`, W / 2, 29);

    const speedWarning = this.remainingSeconds < 15 && !this.levelLost && !this.levelWon;
    if (speedWarning) {
      ctx.fillStyle = 'rgba(255, 70, 70, 0.95)';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('LeBron is turning it up!', W / 2, 58);
    }

    // Dribbling ball visual (tracks player)
    if (player && !this.levelLost) {
      const p = this.getPos(player);
      const movingRight = ['right', 'upRight', 'downRight'].includes(player.direction);
      const sideOffset = movingRight ? Math.max(18, player.width * 0.28) : -Math.max(18, player.width * 0.18);
      const bounce = Math.abs(Math.sin(this.dribblePhase)) * Math.max(18, (player.height || 60) * 0.45);
      const ballX = p.x + sideOffset;
      const ballY = p.y + (player.height || 60) - 8 - bounce;

      ctx.beginPath();
      ctx.arc(ballX, ballY, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#d97a1f';
      ctx.fill();
      ctx.strokeStyle = '#5b2b0b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Simple seam lines for a ball look
      ctx.beginPath();
      ctx.moveTo(ballX - 8, ballY);
      ctx.lineTo(ballX + 8, ballY);
      ctx.moveTo(ballX, ballY - 8);
      ctx.lineTo(ballX, ballY + 8);
      ctx.strokeStyle = '#7a3d10';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    if (this.levelLost || this.levelWon) {
      const bw = Math.min(460, W * 0.74);
      const bh = 210;
      const bx = (W - bw) / 2;
      const by = (H - bh) / 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = '#0d0d1a';
      ctx.strokeStyle = '#fdb927';
      ctx.lineWidth = 3;
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeRect(bx, by, bw, bh);

      ctx.fillStyle = '#fdb927';
      ctx.fillRect(bx, by, bw, 8);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      ctx.fillStyle = '#fdb927';
      ctx.font = `bold ${Math.round(bw * 0.06)}px monospace`;
      const headline = this.levelWon ? 'Buzzer Beater! You Protected the Ball!' : 'LeBron Stole the Ball!';
      ctx.fillText(headline, W / 2, by + 56);

      ctx.fillStyle = '#ff6f00';
      ctx.font = `bold ${Math.round(bw * 0.045)}px monospace`;
      ctx.fillText(`Survived ${this.getSurvivalTimeSeconds().toFixed(1)}s`, W / 2, by + 106);

      ctx.fillStyle = '#cccccc';
      ctx.font = `${Math.round(bw * 0.034)}px monospace`;
      ctx.fillText(`Best: ${this.bestTimeSeconds.toFixed(1)}s`, W / 2, by + 144);
      ctx.fillText('Press R to restart', W / 2, by + 176);
    }
  }

  createHudCanvas() {
    const container = this.gameEnv?.gameContainer;
    if (!container) return;

    const existingHud = container.querySelector('.basketball-hud-canvas');
    if (existingHud) {
      existingHud.remove();
    }

    const hud = document.createElement('canvas');
    hud.className = 'basketball-hud-canvas';
    hud.width = this.gameEnv.innerWidth || 800;
    hud.height = this.gameEnv.innerHeight || 580;
    hud.style.position = 'absolute';
    hud.style.left = '0';
    hud.style.top = '0';
    hud.style.width = '100%';
    hud.style.height = '100%';
    hud.style.pointerEvents = 'none';
    hud.style.zIndex = '20';

    container.style.position = 'relative';
    container.appendChild(hud);

    this.hudCanvas = hud;
    this.hudCtx = hud.getContext('2d');
  }

  handleRestartKey(event) {
    if (event.key.toLowerCase() !== 'r') return;
    if (!this.levelLost && !this.levelWon) return;

    const player = this.findObjectById('BasketballPlayer');
    const lebron = this.findObjectById('LeBron');

    if (player) {
      player.position.x = this.playerStart.x;
      player.position.y = this.playerStart.y;
      player.velocity.x = 0;
      player.velocity.y = 0;
    }

    if (lebron) {
      lebron.position.x = this.lebronStart.x;
      lebron.position.y = this.lebronStart.y;
      lebron.velocity.x = 0;
      lebron.velocity.y = 0;
      lebron.direction = 'left';
    }

    this.levelWon = false;
    this.levelLost = false;
    this.remainingSeconds = this.levelDurationSeconds;
    this.startTimestamp = performance.now();
    this.lastTimestamp = this.startTimestamp;
    this.dribblePhase = 0;
  }

  getSurvivalTimeSeconds() {
    return this.levelDurationSeconds - this.remainingSeconds;
  }

  isTouching(a, b) {
    const ar = this.getRect(a);
    const br = this.getRect(b);

    return (
      ar.left < br.right &&
      ar.right > br.left &&
      ar.top < br.bottom &&
      ar.bottom > br.top
    );
  }

  getRect(obj) {
    const pos = this.getPos(obj);
    const width = obj.width || 40;
    const height = obj.height || 40;

    return {
      left: pos.x,
      right: pos.x + width,
      top: pos.y,
      bottom: pos.y + height
    };
  }

  getPos(obj) {
    return {
      x: obj?.position?.x ?? obj?.x ?? 0,
      y: obj?.position?.y ?? obj?.y ?? 0
    };
  }

  findObjectById(id) {
    if (!this.gameEnv?.gameObjects) return null;

    return (
      this.gameEnv.gameObjects.find((obj) => obj?.spriteData?.id === id) ||
      this.gameEnv.gameObjects.find((obj) => obj?.data?.id === id) ||
      null
    );
  }

  destroy() {
    document.removeEventListener('keydown', this.handleRestartKey);

    if (this.hudCanvas) {
      this.hudCanvas.remove();
      this.hudCanvas = null;
      this.hudCtx = null;
    }
  }
}

export default GameLevelBasketball;
export const gameLevelClasses = [GameLevelBasketball];
