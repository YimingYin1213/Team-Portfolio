import Character from './essentials/Character.js';

class Coin extends Character {
  constructor(data = null, gameEnv = null) {
    const coinData = {
      id: data?.id || 'coin',
      greeting: false,
      INIT_POSITION: data?.INIT_POSITION || { x: 0.5, y: 0.5 },
      SCALE_FACTOR: data?.SCALE_FACTOR || 18,
      ANIMATION_RATE: data?.ANIMATION_RATE || 1,
      pixels: { width: 64, height: 64 },
      orientation: { rows: 1, columns: 1 },
      down: { row: 0, start: 0, columns: 1 },
      hitbox: data?.hitbox || { widthPercentage: 0.15, heightPercentage: 0.15 },
      ...data
    };

    super(coinData, gameEnv);

    this.value = Number(data?.value ?? 1);
    this.color = data?.color || '#f7c948';
    this.borderColor = data?.borderColor || '#9d6b00';
  }

  update() {
    this.draw();
    this.checkPlayerCollision();
  }

  draw() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;
    const radius = Math.max(6, Math.min(this.canvas.width, this.canvas.height) / 3);

    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = this.borderColor;
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius * 0.45, 0, Math.PI * 2);
    this.ctx.strokeStyle = '#fff2a8';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();

    this.setupCanvas();
  }

  checkPlayerCollision() {
    const player = this.gameEnv?.gameObjects?.find((obj) => obj?.spriteData?.id === 'BasketballPlayer');
    if (!player) return;
    if (!this.overlaps(player)) return;
    this.collect();
  }

  overlaps(other) {
    const leftA = this.position.x;
    const rightA = this.position.x + this.width;
    const topA = this.position.y;
    const bottomA = this.position.y + this.height;

    const leftB = other.position.x;
    const rightB = other.position.x + other.width;
    const topB = other.position.y;
    const bottomB = other.position.y + other.height;

    return leftA < rightB && rightA > leftB && topA < bottomB && bottomA > topB;
  }

  collect() {
    if (!this.gameEnv.stats) {
      this.gameEnv.stats = { coinsCollected: 0 };
    }
    this.gameEnv.stats.coinsCollected = (this.gameEnv.stats.coinsCollected || 0) + this.value;
    this.randomizePosition();
  }

  randomizePosition() {
    const xMin = this.gameEnv.innerWidth * 0.08;
    const xMax = this.gameEnv.innerWidth * 0.88;
    const yMin = this.gameEnv.innerHeight * 0.12;
    const yMax = this.gameEnv.innerHeight * 0.88;

    this.position.x = xMin + Math.random() * Math.max(1, xMax - xMin);
    this.position.y = yMin + Math.random() * Math.max(1, yMax - yMin);
  }
}

export default Coin;
