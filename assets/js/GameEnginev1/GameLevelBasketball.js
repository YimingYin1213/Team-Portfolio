// Basketball Evasion Game Level
// How to use this file:
// 1) Save as assets/js/GameEnginev1/levels/GameLevelBasketball.js in your repo.
// 2) Reference it in your runner. Example:
//    import GameLevelBasketball from '/assets/js/GameEnginev1/levels/GameLevelBasketball.js';
//    export const gameLevelClasses = [GameLevelBasketball];
// 3) Ensure images exist and paths resolve via 'path' provided by the engine.

import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Npc from './essentials/Npc.js';
import Barrier from './essentials/Barrier.js';

class GameLevelBasketball {
  constructor(gameEnv) {
    this.gameEnv = gameEnv;
    this.classes = [];

    this._started = false;
    this._raf = null;
    this._lastTime = 0;
    this._startTime = 0;
    this._bestTime = 0;
    this._gameOver = false;
    this._hudCanvas = null;
    this._hudCtx = null;
    this._cleanupFns = [];

    const path = gameEnv.path;
    const width = gameEnv.innerWidth || 800;
    const height = gameEnv.innerHeight || 580;

    const bgData = {
      name: 'basketball_court',
      src: path + '/images/gamebuilder/bg/BballCourt.png',
      pixels: { height: 580, width: 900 }
    };

    const playerData = {
      id: 'BasketballPlayer',
      src: path + '/images/gamebuilder/sprites/BasketballPlayer.png',
      SCALE_FACTOR: 4,
      STEP_FACTOR: 1100,
      ANIMATION_RATE: 120,
      INIT_POSITION: { x: Math.round(width * 0.08), y: Math.round(height * 0.5) },
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

      hitbox: { widthPercentage: 0.45, heightPercentage: 0.60 },
      keypress: { up: 87, left: 65, down: 83, right: 68 }
    };

    const bronData = {
  id: 'LeBron',
  greeting: 'LeBron stole the ball!',
  src: path + '/images/gamebuilder/sprites/bron.png',
  SCALE_FACTOR: 3.5,
  ANIMATION_RATE: 200,
  INIT_POSITION: { x: Math.round(width * 0.90), y: Math.round(height * 0.5) },
  pixels: { height: 1350, width: 1080 },  // ← actual image size
  orientation: { rows: 1, columns: 1 },   // ← single image, 1 frame

  down:      { row: 0, start: 0, columns: 1 },
  right:     { row: 0, start: 0, columns: 1 },
  left:      { row: 0, start: 0, columns: 1 },
  up:        { row: 0, start: 0, columns: 1 },
  upRight:   { row: 0, start: 0, columns: 1 },
  downRight: { row: 0, start: 0, columns: 1 },
  upLeft:    { row: 0, start: 0, columns: 1 },
  downLeft:  { row: 0, start: 0, columns: 1 },
  // rest stays the same...

      hitbox: { widthPercentage: 0.65, heightPercentage: 0.75 },

      dialogues: ['LeBron stole the ball! Press Reset to try again.'],
      reaction: function () {
        if (this.dialogueSystem) {
          this.showReactionDialogue();
        } else {
          console.log(this.greeting);
        }
      },
      interact: function () {
        if (this.dialogueSystem) {
          this.showReactionDialogue();
        }
      }
    };

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
      y: Math.round(height * 0.60),
      width: Math.round(width * 0.10),
      height: Math.round(height * 0.08),
      visible: false,
      hitbox: { widthPercentage: 1.0, heightPercentage: 1.0 },
      fromOverlay: false
    };

    const barrier_4 = {
      id: 'barrier_4',
      x: Math.round(width * 0.60),
      y: Math.round(height * 0.20),
      width: Math.round(width * 0.10),
      height: Math.round(height * 0.08),
      visible: false,
      hitbox: { widthPercentage: 1.0, heightPercentage: 1.0 },
      fromOverlay: false
    };

    const wall_top = {
      id: 'wall_top',
      x: 0,
      y: 0,
      width: width,
      height: 8,
      visible: false,
      hitbox: { widthPercentage: 1.0, heightPercentage: 1.0 },
      fromOverlay: false
    };

    const wall_bottom = {
      id: 'wall_bottom',
      x: 0,
      y: height - 8,
      width: width,
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
      height: height,
      visible: false,
      hitbox: { widthPercentage: 1.0, heightPercentage: 1.0 },
      fromOverlay: false
    };

    const wall_right = {
      id: 'wall_right',
      x: width - 8,
      y: 0,
      width: 8,
      height: height,
      visible: false,
      hitbox: { widthPercentage: 1.0, heightPercentage: 1.0 },
      fromOverlay: false
    };

    this.classes = [
      { class: GameEnvBackground, data: bgData },
      { class: Player, data: playerData },
      { class: Npc, data: bronData },
      { class: Barrier, data: barrier_1 },
      { class: Barrier, data: barrier_2 },
      { class: Barrier, data: barrier_3 },
      { class: Barrier, data: barrier_4 },
      { class: Barrier, data: wall_top },
      { class: Barrier, data: wall_bottom },
      { class: Barrier, data: wall_left },
      { class: Barrier, data: wall_right }
    ];

    setTimeout(() => this._startCustomLogic(), 250);
  }

  _startCustomLogic() {
    if (this._started) return;
    this._started = true;

    const env = this.gameEnv;
    const container = env?.gameContainer;
    if (!container) return;

    this._createHudCanvas(container);

    this._startTime = performance.now();
    this._lastTime = performance.now();

    const loop = (now) => {
      this._raf = requestAnimationFrame(loop);

      const dt = Math.min((now - this._lastTime) / 1000, 0.05);
      this._lastTime = now;

      const player = this._findObjectById('BasketballPlayer');
      const bron = this._findObjectById('LeBron');

      if (!player || !bron) {
        this._drawHud(0, this._bestTime, false, false);
        return;
      }

      const elapsed = this._gameOver ? (this._freezeElapsed || 0) : (now - this._startTime) / 1000;

      if (!this._gameOver) {
        this._updateBronChase(bron, player, dt);

        if (this._isTouching(bron, player)) {
          this._gameOver = true;
          this._freezeElapsed = elapsed;
          this._bestTime = Math.max(this._bestTime, elapsed);

          if (typeof bron.showReactionDialogue === 'function') {
            bron.showReactionDialogue();
          } else if (typeof bron.interact === 'function') {
            bron.interact();
          }
        }
      }

      const speed = Math.min(140 + elapsed * 18, 320);
      this._drawHud(elapsed, this._bestTime, speed > 230, this._gameOver);
    };

    this._raf = requestAnimationFrame(loop);
    this._attachResetKey();
  }

  _findObjectById(id) {
    const candidates = [];

    if (Array.isArray(this.gameEnv?.gameObjects)) candidates.push(...this.gameEnv.gameObjects);
    if (Array.isArray(this.gameEnv?.objects)) candidates.push(...this.gameEnv.objects);
    if (Array.isArray(this.gameEnv?.gameObjectList)) candidates.push(...this.gameEnv.gameObjectList);
    if (Array.isArray(this.gameEnv?.currentObjects)) candidates.push(...this.gameEnv.currentObjects);
    if (Array.isArray(this.gameEnv?.sprites)) candidates.push(...this.gameEnv.sprites);

    for (const obj of candidates) {
      if (!obj) continue;
      if (obj.id === id) return obj;
      if (obj?.data?.id === id) return obj;
    }

    return null;
  }

  _getPos(obj) {
    return {
      x: obj?.x ?? obj?.position?.x ?? obj?.sprite?.x ?? obj?.data?.INIT_POSITION?.x ?? 0,
      y: obj?.y ?? obj?.position?.y ?? obj?.sprite?.y ?? obj?.data?.INIT_POSITION?.y ?? 0
    };
  }

  _setPos(obj, x, y) {
    if ('x' in obj) obj.x = x;
    if ('y' in obj) obj.y = y;
    if (obj.position) {
      obj.position.x = x;
      obj.position.y = y;
    }
    if (obj.sprite) {
      obj.sprite.x = x;
      obj.sprite.y = y;
    }
    if (obj.data?.INIT_POSITION) {
      obj.data.INIT_POSITION.x = x;
      obj.data.INIT_POSITION.y = y;
    }
  }

  _updateBronChase(bron, player, dt) {
    const p = this._getPos(player);
    const b = this._getPos(bron);

    const dx = p.x - b.x;
    const dy = p.y - b.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 1) return;

    const elapsed = (performance.now() - this._startTime) / 1000;
    const speed = Math.min(140 + elapsed * 18, 320);

    let mx = (dx / dist) * speed * dt;
    let my = (dy / dist) * speed * dt;

    const nextX = b.x + mx;
    const nextY = b.y + my;

    const tryMove = this._resolveBarrierCollision(bron, nextX, nextY);
    this._setPos(bron, tryMove.x, tryMove.y);

    if (dx >= 0) {
      if (bron.direction) bron.direction = 'right';
      if (bron.facing) bron.facing = 'right';
    } else {
      if (bron.direction) bron.direction = 'left';
      if (bron.facing) bron.facing = 'left';
    }
  }

  _resolveBarrierCollision(obj, x, y) {
    const barriers = this.classes
      .filter(entry => entry.class === Barrier)
      .map(entry => entry.data);

    const hitboxW = 28;
    const hitboxH = 28;

    const rect = {
      left: x - hitboxW / 2,
      right: x + hitboxW / 2,
      top: y - hitboxH / 2,
      bottom: y + hitboxH / 2
    };

    for (const b of barriers) {
      const overlaps =
        rect.right > b.x &&
        rect.left < b.x + b.width &&
        rect.bottom > b.y &&
        rect.top < b.y + b.height;

      if (overlaps) {
        return this._getPos(obj);
      }
    }

    return { x, y };
  }

  _isTouching(a, b) {
    const pa = this._getPos(a);
    const pb = this._getPos(b);
    return Math.hypot(pa.x - pb.x, pa.y - pb.y) < 42;
  }

  _createHudCanvas(container) {
    const old = container.querySelector('.basketball-hud-canvas');
    if (old) old.remove();

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

    this._hudCanvas = hud;
    this._hudCtx = hud.getContext('2d');
  }

  _drawHud(elapsed, best, heatingUp, gameOver) {
    if (!this._hudCtx || !this._hudCanvas) return;

    const ctx = this._hudCtx;
    const W = this._hudCanvas.width;
    const H = this._hudCanvas.height;

    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(W / 2 - 150, 8, 300, 38);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(14, Math.round(W * 0.018))}px monospace`;
    ctx.fillText(`Time: ${elapsed.toFixed(1)}s`, W / 2, 27);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#fdb927';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`Best: ${best.toFixed(1)}s`, W / 2 + 140, 27);

    if (heatingUp && !gameOver) {
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(230,50,50,0.9)';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('LeBron is heating up!', W / 2, 58);
    }

    if (gameOver) {
      const bw = Math.min(420, W * 0.72);
      const bh = 200;
      const bx = (W - bw) / 2;
      const by = (H - bh) / 2;

      ctx.fillStyle = 'rgba(0,0,0,0.72)';
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
      ctx.font = `bold ${Math.round(bw * 0.065)}px monospace`;
      ctx.fillText('LeBron stole the ball!', W / 2, by + 55);

      ctx.fillStyle = '#ff6f00';
      ctx.font = `bold ${Math.round(bw * 0.05)}px monospace`;
      ctx.fillText(`Survived ${elapsed.toFixed(1)}s`, W / 2, by + 105);

      ctx.fillStyle = '#999';
      ctx.font = `${Math.round(bw * 0.035)}px monospace`;
      ctx.fillText(`Best: ${best.toFixed(1)}s`, W / 2, by + 145);

      ctx.fillStyle = '#ddd';
      ctx.fillText('Press R to restart', W / 2, by + 176);
    }
  }

  _attachResetKey() {
    const handler = (e) => {
      if (e.key.toLowerCase() !== 'r' || !this._gameOver) return;

      const player = this._findObjectById('BasketballPlayer');
      const bron = this._findObjectById('LeBron');

      if (player) {
        const px = Math.round((this.gameEnv.innerWidth || 800) * 0.08);
        const py = Math.round((this.gameEnv.innerHeight || 580) * 0.5);
        this._setPos(player, px, py);
      }

      if (bron) {
        const bx = Math.round((this.gameEnv.innerWidth || 800) * 0.90);
        const by = Math.round((this.gameEnv.innerHeight || 580) * 0.5);
        this._setPos(bron, bx, by);
      }

      this._gameOver = false;
      this._freezeElapsed = 0;
      this._startTime = performance.now();
    };

    document.addEventListener('keydown', handler);
    this._cleanupFns.push(() => document.removeEventListener('keydown', handler));
  }

  destroy() {
    if (this._raf) {
      cancelAnimationFrame(this._raf);
      this._raf = null;
    }

    this._cleanupFns.forEach(fn => fn());
    this._cleanupFns = [];

    if (this._hudCanvas) {
      this._hudCanvas.remove();
      this._hudCanvas = null;
      this._hudCtx = null;
    }
  }
}

export default GameLevelBasketball;
export const gameLevelClasses = [GameLevelBasketball];