import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Npc from './essentials/Npc.js';

class GameLevelBasketball {
  constructor(gameEnv) {
    this.gameEnv = gameEnv;
    const width = gameEnv.innerWidth;
    const height = gameEnv.innerHeight;
    const path = gameEnv.path;
    this.playerStart = { x: Math.round(width * 0.12), y: Math.round(height * 0.68) };
    this.chaserStart = { x: Math.round(width * 0.72), y: Math.round(height * 0.55) };

    this.caught = false;
    this.startTime = 0;
    this.currentTime = 0;
    this.bestTime = 0;
    this.timeHud = null;
    this.messageHud = null;
    this.handleRestartKey = this.handleRestartKey.bind(this);

    const image_src_court = path + '/images/gamebuilder/bg/BballCourt.png';
    const image_data_court = {
      id: 'BasketballCourt',
      src: image_src_court,
      pixels: { height: 580, width: 900 }
    };

    // Player data (Astronaut sheet from index.json: 4 rows x 4 cols)
    const sprite_src_player = path + '/images/gamebuilder/sprites/astro.png';
    const sprite_data_player = {
      id: 'BasketballPlayer',
      greeting: 'Ball handler ready.',
      src: sprite_src_player,
      // Higher scale factor => smaller on-screen size
      SCALE_FACTOR: 11,
      STEP_FACTOR: 1000,
      ANIMATION_RATE: 110,
      INIT_POSITION: { ...this.playerStart },
      pixels: { height: 770, width: 513 },
      orientation: { rows: 4, columns: 4 },
      down:      { row: 0, start: 0, columns: 4 },
      left:      { row: 1, start: 0, columns: 4 },
      right:     { row: 2, start: 0, columns: 4 },
      up:        { row: 3, start: 0, columns: 4 },
      downRight: { row: 2, start: 0, columns: 4 },
      downLeft:  { row: 1, start: 0, columns: 4 },
      upRight:   { row: 2, start: 0, columns: 4 },
      upLeft:    { row: 1, start: 0, columns: 4 },
      hitbox: { widthPercentage: 0.45, heightPercentage: 0.5 },
      keypress: { up: 87, left: 65, down: 83, right: 68 }
    };

    // Chaser data: kirby.png from index.json (rows:1, cols:13)
    const sprite_src_chaser = path + '/images/gamebuilder/sprites/kirby.png';
    const sprite_data_chaser = {
      id: 'LeBron',
      greeting: 'You reached LeBron.',
      src: sprite_src_chaser,
      SCALE_FACTOR: 7,
      ANIMATION_RATE: 8,
      INIT_POSITION: { ...this.chaserStart },
      pixels: { height: 36, width: 569 },
      orientation: { rows: 1, columns: 13 },
      down:      { row: 0, start: 0, columns: 13 },
      left:      { row: 0, start: 0, columns: 13 },
      right:     { row: 0, start: 0, columns: 13 },
      up:        { row: 0, start: 0, columns: 13 },
      downRight: { row: 0, start: 0, columns: 13 },
      downLeft:  { row: 0, start: 0, columns: 13 },
      upRight:   { row: 0, start: 0, columns: 13 },
      upLeft:    { row: 0, start: 0, columns: 13 },
      hitbox: { widthPercentage: 0.2, heightPercentage: 0.2 },
      dialogues: ['LeBron is in the gym.'],
      reaction: function () {
        if (this.dialogueSystem) this.showReactionDialogue();
      },
      interact: function () {
        if (this.dialogueSystem) this.showRandomDialogue();
      }
    };

    this.classes = [
      { class: GameEnvBackground, data: image_data_court },
      { class: Player, data: sprite_data_player },
      { class: Npc, data: sprite_data_chaser }
    ];
  }

  initialize() {
    this.startTime = performance.now();
    this.currentTime = 0;
    this.createHud();
    this.updateHud();
    document.addEventListener('keydown', this.handleRestartKey);
  }

  update() {
    const player = this.findById('BasketballPlayer');
    const lebron = this.findById('LeBron');
    if (!player || !lebron) return;

    if (!this.caught) {
      this.currentTime = (performance.now() - this.startTime) / 1000;
      this.updateHud();
    }

    if (this.caught) return;

    const dx = player.position.x - lebron.position.x;
    const dy = player.position.y - lebron.position.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return;

    const speed = 1.7;
    lebron.position.x += (dx / dist) * speed;
    lebron.position.y += (dy / dist) * speed;

    // Keep chaser inside the playable area
    lebron.position.x = Math.max(0, Math.min(lebron.position.x, this.gameEnv.innerWidth - (lebron.width || 0)));
    lebron.position.y = Math.max(0, Math.min(lebron.position.y, this.gameEnv.innerHeight - (lebron.height || 0)));

    if (Math.abs(dx) > Math.abs(dy)) {
      lebron.direction = dx >= 0 ? 'right' : 'left';
    } else {
      lebron.direction = dy >= 0 ? 'down' : 'up';
    }

    if (this.isHitboxCollision(player, lebron)) {
      this.caught = true;
      this.bestTime = Math.max(this.bestTime, this.currentTime);
      this.showCaughtMessage();
      this.updateHud();
    }
  }

  findById(id) {
    return this.gameEnv.gameObjects.find((obj) => obj?.spriteData?.id === id) || null;
  }

  getHitboxRect(obj) {
    const width = obj.width || 0;
    const height = obj.height || 0;
    const pos = obj.position || { x: 0, y: 0 };
    // Stable collision area independent of sprite metadata
    const widthReduction = width * 0.2;
    const heightReduction = height * 0.2;

    return {
      left: pos.x + widthReduction,
      right: pos.x + width - widthReduction,
      top: pos.y + heightReduction,
      bottom: pos.y + height
    };
  }

  isHitboxCollision(a, b) {
    const ar = this.getHitboxRect(a);
    const br = this.getHitboxRect(b);
    return (
      ar.left < br.right &&
      ar.right > br.left &&
      ar.top < br.bottom &&
      ar.bottom > br.top
    );
  }

  createHud() {
    const container = this.gameEnv.container || this.gameEnv.gameContainer;
    if (!container) return;

    const oldTimer = container.querySelector('#basketball-time-hud');
    if (oldTimer) oldTimer.remove();
    const oldMessage = container.querySelector('#basketball-message-hud');
    if (oldMessage) oldMessage.remove();

    this.timeHud = document.createElement('div');
    this.timeHud.id = 'basketball-time-hud';
    Object.assign(this.timeHud.style, {
      position: 'absolute',
      top: '12px',
      left: '12px',
      zIndex: '1000',
      padding: '8px 12px',
      color: '#fff',
      background: 'rgba(0,0,0,0.65)',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '14px',
      fontWeight: '700'
    });
    container.appendChild(this.timeHud);

    this.messageHud = document.createElement('div');
    this.messageHud.id = 'basketball-message-hud';
    Object.assign(this.messageHud.style, {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: '1001',
      padding: '14px 18px',
      color: '#fdb927',
      background: 'rgba(0,0,0,0.75)',
      border: '2px solid #fdb927',
      borderRadius: '10px',
      fontFamily: 'monospace',
      fontSize: '18px',
      fontWeight: '700',
      display: 'none',
      textAlign: 'center'
    });
    container.appendChild(this.messageHud);
  }

  updateHud() {
    if (!this.timeHud) return;
    this.timeHud.textContent = `Time: ${this.currentTime.toFixed(1)}s | Best: ${this.bestTime.toFixed(1)}s`;
  }

  showCaughtMessage() {
    if (!this.messageHud) return;
    this.messageHud.innerHTML = 'LeBron stole the ball!<br>Press R to restart';
    this.messageHud.style.display = 'block';
  }

  handleRestartKey(event) {
    if (event.key.toLowerCase() !== 'r' || !this.caught) return;

    const player = this.findById('BasketballPlayer');
    const lebron = this.findById('LeBron');

    if (player) {
      player.position.x = this.playerStart.x;
      player.position.y = this.playerStart.y;
      player.velocity.x = 0;
      player.velocity.y = 0;
      player.direction = 'down';
    }

    if (lebron) {
      lebron.position.x = this.chaserStart.x;
      lebron.position.y = this.chaserStart.y;
      lebron.velocity.x = 0;
      lebron.velocity.y = 0;
      lebron.direction = 'left';
    }

    this.caught = false;
    this.startTime = performance.now();
    this.currentTime = 0;
    if (this.messageHud) this.messageHud.style.display = 'none';
    this.updateHud();
  }

  destroy() {
    document.removeEventListener('keydown', this.handleRestartKey);
    if (this.timeHud) this.timeHud.remove();
    if (this.messageHud) this.messageHud.remove();
    this.timeHud = null;
    this.messageHud = null;
  }
}

export default GameLevelBasketball;
export const gameLevelClasses = [GameLevelBasketball];
