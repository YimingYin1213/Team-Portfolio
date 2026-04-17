// GameLevelHollowKnight.js
// Hollow Knight Boss Fight — Palace of Shadows
// Player: Chill Guy spritesheet (4 rows x 3 cols)
// Boss:   HollowKnight spritesheet (4 rows x 3 cols)
//   Row 0 = idle, Row 1 = move right, Row 2 = attack, Row 3 = special

import GameEnvBackground from './GameEnginev1/essentials/GameEnvBackground.js';
import Player            from './GameEnginev1/essentials/Player.js';
import Barrier           from './GameEnginev1/essentials/Barrier.js';

// ─────────────────────────────────────────────
//  PalaceMap  — draws the entire environment
// ─────────────────────────────────────────────
class PalaceMap {
    constructor(data, gameEnv) {
        this.gameEnv = gameEnv;
        this.data    = data;
        this.canvas  = document.createElement('canvas');
        this.canvas.id = 'palace-map';
        this.ctx     = this.canvas.getContext('2d');
        gameEnv.container.appendChild(this.canvas);
        this.canvas.style.position = 'absolute';
        this.canvas.style.left     = '0px';
        this.canvas.style.top      = '0px';
        this.canvas.style.zIndex   = '1';

        this.t = 0;   // animation tick
        this.flamePulse = 0;

        this.resize();
        this.update();
    }

    resize() {
        const W = this.gameEnv.innerWidth;
        const H = this.gameEnv.innerHeight;
        this.canvas.width  = W;
        this.canvas.height = H;
        this.canvas.style.width  = W + 'px';
        this.canvas.style.height = H + 'px';
        this.W = W;
        this.H = H;
    }

    update() { this.draw(); }

    // ── helpers ──────────────────────────────
    _hex(hex, alpha = 1) {
        const r = parseInt(hex.slice(1,3),16);
        const g = parseInt(hex.slice(3,5),16);
        const b = parseInt(hex.slice(5,7),16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    // Animated purple / violet flame at (cx, cy, w, h)
    _drawFlame(cx, bottomY, w, h, color1 = '#9b30ff', color2 = '#ff00ff') {
        const ctx = this.ctx;
        const t   = this.t;
        const sway = Math.sin(t * 0.05 + cx) * 3;
        const flicker = 0.85 + Math.sin(t * 0.2 + cx * 0.1) * 0.15;

        // outer glow
        const glow = ctx.createRadialGradient(cx + sway, bottomY - h * 0.5, 2,
                                               cx + sway, bottomY - h * 0.6, h * 0.8);
        glow.addColorStop(0, `rgba(180,0,255,${0.35 * flicker})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.ellipse(cx + sway, bottomY - h * 0.5, h * 0.9, h * 0.9, 0, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // core flame
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.5, bottomY);
        ctx.bezierCurveTo(
            cx - w * 0.4 + sway, bottomY - h * 0.4,
            cx + w * 0.1 + sway, bottomY - h * 0.7,
            cx + sway,           bottomY - h * flicker
        );
        ctx.bezierCurveTo(
            cx - w * 0.1 + sway, bottomY - h * 0.7,
            cx + w * 0.4 + sway, bottomY - h * 0.4,
            cx + w * 0.5,        bottomY
        );
        ctx.closePath();
        const fg = ctx.createLinearGradient(cx, bottomY, cx + sway, bottomY - h * flicker);
        fg.addColorStop(0,   color2);
        fg.addColorStop(0.5, color1);
        fg.addColorStop(1,   'rgba(255,255,255,0.9)');
        ctx.fillStyle = fg;
        ctx.globalAlpha = 0.92;
        ctx.fill();
        ctx.restore();
    }

    // Stone brick column (x, y, w, h)
    _drawColumn(x, y, w, h) {
        const ctx = this.ctx;
        // base stone
        const cg = ctx.createLinearGradient(x, y, x + w, y);
        cg.addColorStop(0,   '#1a0a2e');
        cg.addColorStop(0.3, '#2d1254');
        cg.addColorStop(0.7, '#1a0a2e');
        cg.addColorStop(1,   '#0d0520');
        ctx.fillStyle = cg;
        ctx.fillRect(x, y, w, h);

        // purple neon edge glow
        ctx.shadowColor = '#9b30ff';
        ctx.shadowBlur  = 14;
        ctx.strokeStyle = '#7b00ff';
        ctx.lineWidth   = 2;
        ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
        ctx.shadowBlur = 0;

        // horizontal stone lines
        ctx.strokeStyle = 'rgba(80,0,140,0.5)';
        ctx.lineWidth   = 1;
        for (let yy = y + 20; yy < y + h; yy += 20) {
            ctx.beginPath();
            ctx.moveTo(x, yy);
            ctx.lineTo(x + w, yy);
            ctx.stroke();
        }
    }

    // Torch sconce  (cx, y)
    _drawTorch(cx, y) {
        const ctx = this.ctx;
        const bw = 22, bh = 36;

        // wall bracket
        ctx.fillStyle = '#3a1a6e';
        ctx.beginPath();
        ctx.roundRect(cx - bw * 0.5, y, bw, bh, 4);
        ctx.fill();
        ctx.strokeStyle = '#9b30ff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // torch handle
        ctx.fillStyle = '#5a2a00';
        ctx.fillRect(cx - 4, y + 10, 8, 28);

        // flame
        this._drawFlame(cx, y + 10, 18, 32);
    }

    // Throne — ornate seat for the Hollow Knight
    _drawThrone(cx, floorY) {
        const ctx = this.ctx;
        const W   = 110, H = 160;
        const x   = cx - W * 0.5;
        const y   = floorY - H;

        // back pillar
        ctx.fillStyle = '#1a0a2e';
        const tg = ctx.createLinearGradient(x, y, x + W, y);
        tg.addColorStop(0,   '#2d0060');
        tg.addColorStop(0.5, '#1a0a3e');
        tg.addColorStop(1,   '#2d0060');
        ctx.fillStyle = tg;
        ctx.fillRect(x, y, W, H);

        // purple neon outline
        ctx.shadowColor = '#cc00ff';
        ctx.shadowBlur  = 20;
        ctx.strokeStyle = '#cc00ff';
        ctx.lineWidth   = 3;
        ctx.strokeRect(x, y, W, H);
        ctx.shadowBlur  = 0;

        // armrests
        [[x - 16, floorY - 55, 20, 12], [x + W - 4, floorY - 55, 20, 12]].forEach(([rx, ry, rw, rh]) => {
            ctx.fillStyle = '#3d0080';
            ctx.fillRect(rx, ry, rw, rh);
            ctx.strokeStyle = '#9b30ff';
            ctx.lineWidth = 2;
            ctx.strokeRect(rx, ry, rw, rh);
        });

        // seat cushion
        const cg2 = ctx.createLinearGradient(x + 5, floorY - 45, x + 5, floorY - 15);
        cg2.addColorStop(0, '#4d0099');
        cg2.addColorStop(1, '#1a004d');
        ctx.fillStyle = cg2;
        ctx.fillRect(x + 5, floorY - 45, W - 10, 30);

        // carved symbol
        ctx.fillStyle = 'rgba(200,0,255,0.6)';
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur  = 10;
        const sx = cx, sy = y + 40;
        ctx.beginPath();
        ctx.arc(sx, sy, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0d0520';
        ctx.beginPath();
        ctx.arc(sx, sy, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // Stone statue silhouette
    _drawStatue(x, floorY, facing = 1) {
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, floorY);
        if (facing < 0) ctx.scale(-1, 1);

        // base plinth
        ctx.fillStyle = '#1e0a40';
        ctx.fillRect(-25, -20, 50, 20);
        ctx.strokeStyle = '#6600aa';
        ctx.lineWidth = 1;
        ctx.strokeRect(-25, -20, 50, 20);

        // body silhouette
        ctx.fillStyle = '#29104a';
        ctx.shadowColor = '#9b30ff';
        ctx.shadowBlur  = 8;

        // legs
        ctx.fillRect(-18, -90, 14, 70);
        ctx.fillRect(4,   -90, 14, 70);
        // torso
        ctx.fillRect(-20, -150, 40, 60);
        // head + horns
        ctx.beginPath();
        ctx.arc(0, -170, 22, 0, Math.PI * 2);
        ctx.fill();
        // left horn
        ctx.beginPath();
        ctx.moveTo(-14, -185);
        ctx.lineTo(-20, -215);
        ctx.lineTo(-5,  -188);
        ctx.fill();
        // right horn
        ctx.beginPath();
        ctx.moveTo(14,  -185);
        ctx.lineTo(20,  -215);
        ctx.lineTo(5,   -188);
        ctx.fill();
        // sword
        ctx.fillRect(-4, -145, 8, 90);
        ctx.fillRect(-16, -115, 32, 8);

        // neon purple eyes
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur  = 14;
        ctx.fillStyle   = '#ff00ff';
        ctx.beginPath();
        ctx.ellipse(-8, -170, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(8, -170, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
    }

    // Wide arch
    _drawArch(cx, y, w, h) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.5, y + h);
        ctx.lineTo(cx - w * 0.5, y + h * 0.45);
        ctx.arc(cx, y + h * 0.45, w * 0.5, Math.PI, 0);
        ctx.lineTo(cx + w * 0.5, y + h);
        ctx.closePath();
        const ag = ctx.createLinearGradient(cx, y, cx, y + h);
        ag.addColorStop(0, '#0a001a');
        ag.addColorStop(1, '#1a0840');
        ctx.fillStyle = ag;
        ctx.fill();
        ctx.shadowColor = '#9b30ff';
        ctx.shadowBlur  = 12;
        ctx.strokeStyle = '#6600aa';
        ctx.lineWidth   = 3;
        ctx.stroke();
        ctx.shadowBlur  = 0;
    }

    // Runic chain banner  
    _drawBanner(x, y, w, h, label) {
        const ctx = this.ctx;
        ctx.fillStyle = '#2d0060';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = '#9b30ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y, w, h);
        // rune text
        ctx.fillStyle   = '#cc66ff';
        ctx.font        = `bold ${Math.max(10, w * 0.14)}px serif`;
        ctx.textAlign   = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = '#cc00ff';
        ctx.shadowBlur  = 6;
        ctx.fillText(label, x + w * 0.5, y + h * 0.5);
        ctx.shadowBlur  = 0;
    }

    // Particle dust pool (managed externally via _particles array)
    _initParticles() {
        this._particles = [];
        const W = this.W, H = this.H;
        for (let i = 0; i < 55; i++) {
            this._particles.push({
                x: Math.random() * W,
                y: Math.random() * H,
                r: 0.5 + Math.random() * 2.5,
                vx: (Math.random() - 0.5) * 0.3,
                vy: -0.2 - Math.random() * 0.5,
                alpha: 0.2 + Math.random() * 0.5,
                hue: 260 + Math.random() * 60
            });
        }
    }

    _drawParticles() {
        const ctx = this.ctx;
        const W   = this.W, H = this.H;
        if (!this._particles) this._initParticles();
        for (const p of this._particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.y < -5)  p.y = H + 5;
            if (p.x < -5)  p.x = W + 5;
            if (p.x > W+5) p.x = -5;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.alpha})`;
            ctx.fill();
        }
    }

    draw() {
        const ctx = this.ctx;
        const W   = this.W;
        const H   = this.H;
        this.t++;

        // ── sky / background gradient ──────────────────
        const bg = ctx.createLinearGradient(0, 0, 0, H);
        bg.addColorStop(0,   '#07001a');
        bg.addColorStop(0.5, '#0d0033');
        bg.addColorStop(1,   '#1a0840');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        const floorY = H * 0.78;

        // ── distant rune glow on wall ──────────────────
        const wallGlow = ctx.createRadialGradient(W*0.5, H*0.3, 20, W*0.5, H*0.3, W*0.45);
        wallGlow.addColorStop(0, 'rgba(120,0,200,0.18)');
        wallGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = wallGlow;
        ctx.fillRect(0, 0, W, H);

        // ── floor platform ─────────────────────────────
        const floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
        floorGrad.addColorStop(0, '#1a0840');
        floorGrad.addColorStop(0.3, '#120633');
        floorGrad.addColorStop(1, '#07001a');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, floorY, W, H - floorY);

        // floor neon edge
        ctx.shadowColor = '#9b30ff';
        ctx.shadowBlur  = 18;
        ctx.strokeStyle = '#7b00ff';
        ctx.lineWidth   = 3;
        ctx.beginPath();
        ctx.moveTo(0, floorY);
        ctx.lineTo(W, floorY);
        ctx.stroke();
        ctx.shadowBlur  = 0;

        // floor tile lines
        ctx.strokeStyle = 'rgba(80,0,160,0.3)';
        ctx.lineWidth   = 1;
        const tileW = W / 12;
        for (let i = 0; i <= 12; i++) {
            ctx.beginPath();
            ctx.moveTo(i * tileW, floorY);
            ctx.lineTo(i * tileW, H);
            ctx.stroke();
        }
        for (let yy = floorY; yy < H; yy += 36) {
            ctx.beginPath();
            ctx.moveTo(0, yy);
            ctx.lineTo(W, yy);
            ctx.stroke();
        }

        // ── columns ───────────────────────────────────
        const colW = 42, colH = floorY * 0.9;
        const colY  = floorY - colH;
        const cols  = [W*0.10, W*0.25, W*0.75, W*0.90];
        cols.forEach(cx => this._drawColumn(cx - colW*0.5, colY, colW, colH));

        // ── arches behind columns ─────────────────────
        this._drawArch(W*0.175, 0, W*0.22, floorY * 0.7);
        this._drawArch(W*0.825, 0, W*0.22, floorY * 0.7);
        this._drawArch(W*0.5,   0, W*0.28, floorY * 0.75);

        // ── banners / runic tapestries ─────────────────
        const banW = 34, banH = 120;
        [
            [W*0.10 - banW*0.5, colY + 20, '𝕳'],
            [W*0.25 - banW*0.5, colY + 20, '𝕶'],
            [W*0.75 - banW*0.5, colY + 20, '𝕴'],
            [W*0.90 - banW*0.5, colY + 20, '𝕹'],
        ].forEach(([bx, by, label]) => this._drawBanner(bx, by, banW, banH, label));

        // ── throne (center back) ───────────────────────
        this._drawThrone(W * 0.5, floorY - 10);

        // ── statues (flanking throne) ──────────────────
        this._drawStatue(W * 0.33, floorY, 1);
        this._drawStatue(W * 0.67, floorY, -1);

        // ── torches ──────────────────────────────────
        const torchPositions = [
            W*0.08, W*0.22, W*0.38, W*0.62, W*0.78, W*0.92
        ];
        torchPositions.forEach(tx => this._drawTorch(tx, floorY - colH * 0.72));

        // ── floating purple orb pedestals (later used for pickups) ──
        const orbPedX = [W*0.15, W*0.5, W*0.85];
        orbPedX.forEach(ox => {
            // pedestal stone
            ctx.fillStyle = '#2a0055';
            ctx.shadowColor = '#9900cc';
            ctx.shadowBlur  = 10;
            ctx.fillRect(ox - 14, floorY - 30, 28, 30);
            ctx.shadowBlur = 0;
            // glowing orb  
            const pulse = 0.6 + 0.4 * Math.sin(this.t * 0.06 + ox);
            ctx.shadowColor = '#cc00ff';
            ctx.shadowBlur  = 20 * pulse;
            ctx.beginPath();
            ctx.arc(ox, floorY - 44, 14 * pulse, 0, Math.PI * 2);
            const og = ctx.createRadialGradient(ox - 4, floorY - 48, 2, ox, floorY - 44, 14 * pulse);
            og.addColorStop(0, '#ffffff');
            og.addColorStop(0.3, '#dd88ff');
            og.addColorStop(1, 'rgba(110,0,200,0)');
            ctx.fillStyle = og;
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        // ── ceiling chains ─────────────────────────────
        ctx.strokeStyle = 'rgba(80,0,160,0.5)';
        ctx.lineWidth   = 2;
        [W*0.2, W*0.4, W*0.6, W*0.8].forEach(cx => {
            for (let y = 0; y < floorY * 0.4; y += 18) {
                ctx.beginPath();
                ctx.arc(cx, y + 9, 5, 0, Math.PI * 2);
                ctx.stroke();
            }
        });

        // ── floating dust particles ────────────────────
        this._drawParticles();

        // ── vignette ──────────────────────────────────
        const vig = ctx.createRadialGradient(W*0.5, H*0.5, H*0.2, W*0.5, H*0.5, H);
        vig.addColorStop(0, 'rgba(0,0,0,0)');
        vig.addColorStop(1, 'rgba(0,0,0,0.75)');
        ctx.fillStyle = vig;
        ctx.fillRect(0, 0, W, H);
    }

    destroy() {
        if (this.canvas?.parentNode) this.canvas.parentNode.removeChild(this.canvas);
    }
}

// ─────────────────────────────────────────────
//  GameLevelHollowKnight
// ─────────────────────────────────────────────
class GameLevelHollowKnight {
    constructor(gameEnv) {
        this.gameEnv = gameEnv;
        const path   = gameEnv.path;
        const W      = gameEnv.innerWidth;
        const H      = gameEnv.innerHeight;
        const floorY = H * 0.78;

        // ── Player (Chill Guy) ────────────────────────
        const playerData = {
            id: 'player',
            src: path + '/images/gamify/chillguy.png',
            SCALE_FACTOR: 6,
            STEP_FACTOR: 800,
            ANIMATION_RATE: 8,
            INIT_POSITION: { x: W * 0.12, y: floorY - H / 6 - 10 },
            pixels: { height: 512, width: 384 },
            orientation: { rows: 4, columns: 3 },
            down:      { row: 0, start: 0, columns: 3 },
            right:     { row: 1, start: 0, columns: 3 },
            left:      { row: 2, start: 0, columns: 3 },
            up:        { row: 3, start: 0, columns: 3 },
            downRight: { row: 1, start: 0, columns: 3 },
            downLeft:  { row: 2, start: 0, columns: 3 },
            upRight:   { row: 1, start: 0, columns: 3 },
            upLeft:    { row: 2, start: 0, columns: 3 },
            hitbox:    { widthPercentage: 0.25, heightPercentage: 0.15 },
            keypress:  { up: 87, left: 65, down: 83, right: 68 },
            zIndex: 20
        };

        // ── Floor barrier ─────────────────────────────
        const floorBarrier = {
            id: 'floor',
            x: 0,
            y: floorY,
            width: W,
            height: H - floorY,
            color: 'rgba(0,0,0,0)',
            visible: false,
            hitbox: { widthPercentage: 0, heightPercentage: 0 }
        };

        // ── Left wall ────────────────────────────────
        const leftWall = {
            id: 'wall-left',
            x: 0, y: 0, width: 10, height: H,
            color: 'rgba(0,0,0,0)', visible: false,
            hitbox: { widthPercentage: 0, heightPercentage: 0 }
        };

        // ── Right wall ───────────────────────────────
        const rightWall = {
            id: 'wall-right',
            x: W - 10, y: 0, width: 10, height: H,
            color: 'rgba(0,0,0,0)', visible: false,
            hitbox: { widthPercentage: 0, heightPercentage: 0 }
        };

        // ── Column collision barriers ─────────────────
        const colW = 42;
        const colH = floorY * 0.9;
        const colY = floorY - colH;
        const columnBarriers = [W*0.10, W*0.25, W*0.75, W*0.90].map((cx, i) => ({
            id: `column-${i}`,
            x: cx - colW * 0.5,
            y: colY,
            width: colW,
            height: colH,
            color: 'rgba(100,0,200,0.08)',
            visible: false,
            hitbox: { widthPercentage: 0, heightPercentage: 0 }
        }));

        // ── Statue collision barriers ─────────────────
        const statueBarriers = [W*0.33, W*0.67].map((sx, i) => ({
            id: `statue-${i}`,
            x: sx - 26,
            y: floorY - 230,
            width: 52,
            height: 230,
            color: 'rgba(80,0,150,0.08)',
            visible: false,
            hitbox: { widthPercentage: 0, heightPercentage: 0 }
        }));

        // ── Throne collision barrier ───────────────────
        const throneBarrier = {
            id: 'throne',
            x: W * 0.5 - 70,
            y: floorY - 160,
            width: 140,
            height: 170,
            color: 'rgba(150,0,255,0.08)',
            visible: false,
            hitbox: { widthPercentage: 0, heightPercentage: 0 }
        };

        // ── Build class list ──────────────────────────
        this.classes = [
            { class: PalaceMap,  data: {} },
            { class: Barrier,    data: floorBarrier },
            { class: Barrier,    data: leftWall },
            { class: Barrier,    data: rightWall },
            ...columnBarriers.map(d  => ({ class: Barrier, data: d })),
            ...statueBarriers.map(d  => ({ class: Barrier, data: d })),
            { class: Barrier,    data: throneBarrier },
            { class: Player,     data: playerData },
        ];
    }
}

export default GameLevelHollowKnight;
