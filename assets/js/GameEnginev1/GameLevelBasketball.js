// Basketball Evasion Game Level
// Save as assets/js/GameEnginev1/GameLevelBasketball.js
//
// Usage:
//   import GameLevelBasketball from '/assets/js/GameEnginev1/GameLevelBasketball.js';
//   export const gameLevelClasses = [GameLevelBasketball];

import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';

class GameLevelBasketball {
    constructor(gameEnv) {
        const path   = gameEnv.path;
        const width  = gameEnv.innerWidth;
        const height = gameEnv.innerHeight;

        // ── Background — same format as Kirby ──────────────────────────
        const bgData = {
            name: 'basketball_court',
            src: path + '/images/gamebuilder/bg/basketballcourt.jpg',
            pixels: { height: 580, width: 1060 }
        };

        // ── Player — same format as Kirby ──────────────────────────────
        // BasketballPlayer.png: 1080x1350px, 4 rows x 3 columns
        const playerData = {
            id: 'basketballPlayer',
            src: path + '/images/gamebuilder/sprites/BasketballPlayer.png',
            SCALE_FACTOR: 5,
            STEP_FACTOR: 1000,
            ANIMATION_RATE: 50,
            INIT_POSITION: { x: 50, y: height * 0.5 },
            pixels: { height: 1350, width: 1080 },
            orientation: { rows: 4, columns: 3 },
            down:      { row: 0, start: 0, columns: 3 },
            downRight: { row: 1, start: 0, columns: 3, rotate: Math.PI/16 },
            downLeft:  { row: 0, start: 0, columns: 3, rotate: -Math.PI/16 },
            left:      { row: 2, start: 0, columns: 3 },
            right:     { row: 1, start: 0, columns: 3 },
            up:        { row: 3, start: 0, columns: 3 },
            upLeft:    { row: 2, start: 0, columns: 3, rotate: Math.PI/16 },
            upRight:   { row: 3, start: 0, columns: 3, rotate: -Math.PI/16 },
            hitbox: { widthPercentage: 0.3, heightPercentage: 0.2 },
            keypress: { up: 87, left: 65, down: 83, right: 68 }
        };

        // GameEngine handles background + player exactly like Kirby
        this.classes = [
            { class: GameEnvBackground, data: bgData     },
            { class: Player,            data: playerData },
        ];

        this._overlayKeyHandler = null;
        this._overlayCanvasId = 'bball-overlay';

        // Boot the custom overlay after GameEngine sets up
        // Overlay handles: benches, LeBron AI, dribbling ball, HUD
        setTimeout(() => this._bootOverlay(width, height, path, gameEnv), 500);
    }

    _bootOverlay(W, H, path, gameEnv) {
        const old = document.getElementById(this._overlayCanvasId);
        if (old) old.remove();

        const container = gameEnv?.gameContainer || document.getElementById('gameContainer') || document.body;

        // Transparent overlay canvas on top of everything
        const canvas = document.createElement('canvas');
        canvas.id = this._overlayCanvasId;
        canvas.width = W; canvas.height = H;
        canvas.style.cssText = `
            display:block; position:absolute; top:0; left:0;
            width:100%; height:100%;
            z-index:5; outline:none; pointer-events:none;
        `;
        if (container && getComputedStyle(container).position === 'static') {
            container.style.position = 'relative';
        }
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        // LeBron sprite — bron.png: 1080x1350px, 4 rows x 1 column
        const bronImg = new Image();
        bronImg.src = path + '/images/gamebuilder/sprites/bron.png';
        const L_FW = 1080;
        const L_FH = Math.round(1350 / 4);
        const SS   = Math.round(H * 0.13);

        // Obstacles + boundary walls (benches)
        const OBS = [
            { x: W*.25, y: H*.25, w: W*.12, h: H*.08 },
            { x: W*.55, y: H*.55, w: W*.12, h: H*.08 },
            { x: W*.35, y: H*.60, w: W*.10, h: H*.08 },
            { x: W*.60, y: H*.20, w: W*.10, h: H*.08 },
            { x: 0,   y: 0,   w: 4,  h: H },
            { x: W-4, y: 0,   w: 4,  h: H },
            { x: 0,   y: 0,   w: W,  h: 4 },
            { x: 0,   y: H-4, w: W,  h: 4 },
        ];

        const LR = SS * 0.30;
        const lAnim = { col: 0, timer: 0, rate: 8 };
        let l, over, t0, elapsed, best, tick;
        best = 0;

        const reset = () => {
            l = { x: W*.90, y: H*.5, dir: 'left' };
            over = false; t0 = Date.now(); elapsed = 0; tick = 0;
        };
        reset();

        this._overlayKeyHandler = (e) => {
            if (e.key.toLowerCase() === 'r' && over) reset();
        };
        window.addEventListener('keyup', this._overlayKeyHandler);

        // Circle vs rect collision
        const blocked = (cx, cy, r) => OBS.some(o => {
            const nx = Math.max(o.x, Math.min(cx, o.x+o.w));
            const ny = Math.max(o.y, Math.min(cy, o.y+o.h));
            return (cx-nx)**2 + (cy-ny)**2 < r*r;
        });

        // Draw bench obstacles
        const drawObs = () => OBS.slice(0,4).forEach(o => {
            ctx.fillStyle = '#7a5230'; ctx.fillRect(o.x, o.y, o.w, o.h*.4);
            ctx.fillStyle = '#4a2f10';
            [.1,.5,.82].forEach(fx =>
                ctx.fillRect(o.x+o.w*fx, o.y+o.h*.4, o.w*.1, o.h*.55)
            );
        });

        // Draw LeBron sprite
        const drawLebron = () => {
            if (!bronImg.complete || bronImg.naturalWidth === 0) return;
            ctx.save();
            ctx.translate(Math.round(l.x), Math.round(l.y - SS * 0.3));
            if (l.dir === 'left') ctx.scale(-1, 1);
            ctx.drawImage(bronImg, 0, 0, L_FW, L_FH, -SS/2, -SS/2, SS, SS);
            ctx.restore();
        };

        // Draw bouncing basketball beside player
        const drawBall = (px, py, pdir) => {
            const b = Math.sin(tick * .22) * 5;
            const offX = pdir === 'left' ? -SS*.45 : SS*.45;
            ctx.save(); ctx.translate(Math.round(px + offX), Math.round(py + b));
            ctx.fillStyle = 'rgba(0,0,0,.2)';
            ctx.beginPath(); ctx.ellipse(0, 14-b*.4, 8, 2.5, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#e65100';
            ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#111'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(-9,0); ctx.lineTo(9,0); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI); ctx.stroke();
            ctx.restore();
        };

        // Get player position from GameEngine's player object
        const getPlayer = () => {
            // GameEngine stores game objects on gameEnv
            try {
                const objs = gameEnv?.gameObjects || [];
                for (const obj of objs) {
                    if (obj?.spriteData?.id === 'basketballPlayer' || obj?.id === 'basketballPlayer') {
                        return {
                            x: obj.x + (obj.width  || SS) / 2,
                            y: obj.y + (obj.height || SS) / 2,
                            dir: obj.direction || 'right'
                        };
                    }
                }
            } catch(e) {}
            return { x: W * 0.08, y: H * 0.5, dir: 'right' };
        };

        const update = () => {
            if (over) return;
            elapsed = (Date.now() - t0) / 1000;
            tick++;

            const pPos = getPlayer();
            const PR   = SS * 0.28;

            // LeBron chase AI — vector normalization
            const spd = Math.min(1.5 + elapsed * .04, 4);
            const ddx = pPos.x - l.x, ddy = pPos.y - l.y;
            const dist = Math.sqrt(ddx*ddx + ddy*ddy);

            if (dist > 1) {
                const mx = (ddx/dist)*spd, my = (ddy/dist)*spd;
                if (!blocked(l.x+mx, l.y+my, LR)) { l.x += mx; l.y += my; }
                else {
                    if (!blocked(l.x+mx, l.y, LR)) l.x += mx;
                    if (!blocked(l.x, l.y+my, LR)) l.y += my;
                }
                l.dir = ddx >= 0 ? 'right' : 'left';
                if (++lAnim.timer >= lAnim.rate) { lAnim.timer = 0; }
            }

            if (dist < PR + LR + 2) {
                over = true;
                if (elapsed > best) best = elapsed;
            }
        };

        const render = () => {
            ctx.clearRect(0, 0, W, H);
            drawObs();

            const pPos = getPlayer();
            drawBall(pPos.x, pPos.y, pPos.dir);
            drawLebron();

            // HUD
            ctx.fillStyle = 'rgba(0,0,0,.75)';
            ctx.beginPath(); ctx.roundRect(W/2-150, 6, 300, 36, 8); ctx.fill();
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(W*.018)}px monospace`;
            ctx.fillText(`⏱ ${elapsed.toFixed(1)}s`, W/2, 24);
            ctx.fillStyle = '#fdb927'; ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`Best: ${best.toFixed(1)}s`, W/2+145, 24);

            const spd = Math.min(1.5 + elapsed*.04, 4);
            if (spd > 2.8) {
                ctx.fillStyle = `rgba(230,50,50,${Math.min((spd-2.8)*.5,.9)})`;
                ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
                ctx.fillText('⚡ LeBron is heating up!', W/2, 60);
            }

            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,.50)';
            ctx.beginPath(); ctx.roundRect(8, H-26, 290, 18, 4); ctx.fill();
            ctx.fillStyle = '#bbb'; ctx.font = '11px monospace';
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText('Move: WASD / Arrow Keys   |   R = restart', 14, H-17);
            ctx.restore();

            // Game over card
            if (over) {
                ctx.fillStyle = 'rgba(0,0,0,.78)'; ctx.fillRect(0,0,W,H);
                const bw = Math.min(420,W*.7), bh = 200, bx = (W-bw)/2, by = (H-bh)/2;
                ctx.fillStyle = '#0d0d1a'; ctx.strokeStyle = '#fdb927'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,16); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#fdb927';
                ctx.beginPath(); ctx.roundRect(bx,by,bw,8,[16,16,0,0]); ctx.fill();
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fdb927'; ctx.font = `bold ${Math.round(bw*.065)}px monospace`;
                ctx.fillText('🏀 LeBron stole the ball!', W/2, by+55);
                ctx.fillStyle = '#ff6f00'; ctx.font = `bold ${Math.round(bw*.05)}px monospace`;
                ctx.fillText(`Survived  ${elapsed.toFixed(1)}s`, W/2, by+105);
                ctx.fillStyle = '#888'; ctx.font = `${Math.round(bw*.035)}px monospace`;
                ctx.fillText(`Best: ${best.toFixed(1)}s`, W/2, by+145);
                ctx.fillStyle = '#ddd';
                ctx.fillText('Press R to play again', W/2, by+178);
            }
        };

        (function loop() { update(); render(); requestAnimationFrame(loop); })();
    }

    destroy() {
        const overlay = document.getElementById(this._overlayCanvasId);
        if (overlay) overlay.remove();
        if (this._overlayKeyHandler) {
            window.removeEventListener('keyup', this._overlayKeyHandler);
            this._overlayKeyHandler = null;
        }
    }
}

export default GameLevelBasketball;
