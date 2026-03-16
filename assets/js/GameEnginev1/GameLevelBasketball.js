// Adventure Game Custom Level - Basketball Evasion
// Save as assets/js/GameEnginev1/GameLevelBasketball.js
// Import in your level selector:
//   import GameLevelBasketball from '/portfolio/assets/js/GameEnginev1/GameLevelBasketball.js';
//   export const gameLevelClasses = [GameLevelBasketball];

import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Npc from './essentials/Npc.js';
import Barrier from './essentials/Barrier.js';

class GameLevelBasketball {
    constructor(gameEnv) {
        const path = gameEnv.path;
        const width = gameEnv.innerWidth;
        const height = gameEnv.innerHeight;

        // ── BACKGROUND ───────────────────────────────────────────────────────
        const bgData = {
            name: "custom_bg",
            src: path + "/images/gamebuilder/bg/Court.png",
            pixels: { height: 768, width: 1377 }
        };

        // ── PLAYER (identical to your original) ──────────────────────────────
        const playerData = {
            id: 'playerData',
            src: path + "/images/gamebuilder/sprites/BasketballPlayer.png",
            SCALE_FACTOR: 5,
            STEP_FACTOR: 400,
            ANIMATION_RATE: 50,
            INIT_POSITION: { x: 100, y: 300 },
            pixels: { height: 1350, width: 1080 },
            orientation: { rows: 4, columns: 3 },
            down:      { row: 0, start: 0, columns: 3 },
            downRight: { row: 1, start: 0, columns: 3, rotate: Math.PI / 16 },
            downLeft:  { row: 0, start: 0, columns: 3, rotate: -Math.PI / 16 },
            left:      { row: 2, start: 0, columns: 3 },
            right:     { row: 1, start: 0, columns: 3 },
            up:        { row: 3, start: 0, columns: 3 },
            upLeft:    { row: 2, start: 0, columns: 3, rotate: Math.PI / 16 },
            upRight:   { row: 3, start: 0, columns: 3, rotate: -Math.PI / 16 },
            hitbox: { widthPercentage: 0.1, heightPercentage: 0.1 },
            keypress: { up: 87, left: 65, down: 83, right: 68 }
        };

        // ── LEBRON NPC (identical to your original) ───────────────────────────
        const npcData1 = {
            id: 'NPC',
            greeting: "Yo let's 1v1",
            src: path + "/images/gamebuilder/sprites/LeBron.png",
            SCALE_FACTOR: 3,
            ANIMATION_RATE: 50,
            INIT_POSITION: { x: width - 150, y: 300 },
            pixels: { height: 1350, width: 1080 },
            orientation: { rows: 4, columns: 3 },
            down:      { row: 0, start: 0, columns: 1 },
            right:     { row: 0, start: 0, columns: 1 },
            left:      { row: 0, start: 0, columns: 1 },
            up:        { row: 0, start: 0, columns: 1 },
            upRight:   { row: 0, start: 0, columns: 1 },
            downRight: { row: 0, start: 0, columns: 1 },
            upLeft:    { row: 0, start: 0, columns: 1 },
            downLeft:  { row: 0, start: 0, columns: 1 },
            speed: 0,
            hitbox: { widthPercentage: 0.1, heightPercentage: 0.1 },
            dialogues: ["Yo let's 1v1!", "You can't escape me!", "Ball is life!"],
            reaction: function () {
                if (this.dialogueSystem) this.showReactionDialogue();
                else console.log(this.greeting);
            },
            interact: function () {
                if (this.dialogueSystem) this.showRandomDialogue();
            }
        };

        // ── BARRIERS (identical positions to your original) ───────────────────
        const dbarrier_1 = {
            id: 'dbarrier_1',
            x: width * 0.175,
            y: height * 0.60,
            width: width * 0.005,
            height: height * 0.22,
            visible: true,
            hitbox: { widthPercentage: 0.95, heightPercentage: 0.95 },
            fromOverlay: true
        };
        const dbarrier_2 = {
            id: 'dbarrier_2',
            x: width * 0.295,
            y: height * 0.60,
            width: width * 0.005,
            height: height * 0.22,
            visible: true,
            hitbox: { widthPercentage: 0.95, heightPercentage: 0.95 },
            fromOverlay: true
        };
        const dbarrier_3 = {
            id: 'dbarrier_3',
            x: width * 0.615,
            y: height * 0.55,
            width: width * 0.075,
            height: height * 0.30,
            visible: true,
            hitbox: { widthPercentage: 0.95, heightPercentage: 0.95 },
            fromOverlay: true
        };

        this.classes = [
            { class: GameEnvBackground, data: bgData },
            { class: Player,  data: playerData },
            { class: Npc,     data: npcData1 },
            { class: Barrier, data: dbarrier_1 },
            { class: Barrier, data: dbarrier_2 },
            { class: Barrier, data: dbarrier_3 },
        ];

        // ── EVASION GAME ──────────────────────────────────────────────────────
        // Waits a tick for the engine to attach its canvas, then starts the
        // transparent overlay loop that handles chase AI, HUD, and caught screen.
        window._gameEnvRef = gameEnv;
        setTimeout(() => this._startEvasion(gameEnv, path), 400);
    }

    // ──────────────────────────────────────────────────────────────────────────
    // _startEvasion
    // Creates a transparent canvas overlay on top of the engine canvas.
    // Loads the REAL sprite sheets and draws them using the exact pixel /
    // orientation values from the original code above.
    // Chase AI moves LeBron toward the player each frame.
    // ──────────────────────────────────────────────────────────────────────────
    _startEvasion(gameEnv, path) {
        // ── Locate engine canvas ──────────────────────────────────────────
        const engineCanvas =
            document.querySelector('canvas#gameCanvas') ||
            document.querySelector('canvas');

        const W = engineCanvas ? engineCanvas.width  : (gameEnv.innerWidth  || 900);
        const H = engineCanvas ? engineCanvas.height : (gameEnv.innerHeight || 520);

        // ── Transparent overlay ───────────────────────────────────────────
        const oc = document.createElement('canvas');
        oc.id = 'evasion-overlay';
        oc.width  = W;
        oc.height = H;
        oc.style.cssText = `
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            pointer-events: none;
            z-index: 50;
        `;
        const parent = engineCanvas ? engineCanvas.parentElement : document.body;
        if (engineCanvas) parent.style.position = 'relative';
        parent.appendChild(oc);
        const ctx = oc.getContext('2d');

        // ── Sprite sheet definitions ──────────────────────────────────────
        // frameW / frameH = size of one cell in the sprite sheet
        // SCALE_FACTOR    = same value as in playerData / npcData1 above
        // renderW/H       = how large we draw each frame on the canvas
        const P_FRAME_W = 1080 / 3;          // 360px  (3 columns)
        const P_FRAME_H = 1350 / 4;          // 337.5px (4 rows)
        const P_SCALE   = 5;
        const P_RENDER_W = P_FRAME_W / P_SCALE;   // ~72px
        const P_RENDER_H = P_FRAME_H / P_SCALE;   // ~67px

        const L_FRAME_W = 1080 / 3;
        const L_FRAME_H = 1350 / 4;
        const L_SCALE   = 3;
        const L_RENDER_W = L_FRAME_W / L_SCALE;   // ~120px
        const L_RENDER_H = L_FRAME_H / L_SCALE;   // ~112px

        // Direction → sprite sheet row (from original orientation data)
        const P_ROWS = { down: 0, right: 1, left: 2, up: 3 };
        const L_ROWS = { down: 0, right: 0, left: 0, up: 0 };  // LeBron uses row 0 for all

        // ── Load real sprite images ───────────────────────────────────────
        const playerImg = new Image();
        const lebronImg = new Image();
        let loaded = 0;
        playerImg.onload = () => loaded++;
        lebronImg.onload = () => loaded++;
        playerImg.src = path + "/images/gamebuilder/sprites/BasketballPlayer.png";
        lebronImg.src = path + "/images/gamebuilder/sprites/LeBron.png";

        // ── Obstacle rects (match barrier positions from constructor) ─────
        const OBS = [
            { x: W*0.175, y: H*0.60, w: W*0.005, h: H*0.22 },
            { x: W*0.295, y: H*0.60, w: W*0.005, h: H*0.22 },
            { x: W*0.615, y: H*0.55, w: W*0.075, h: H*0.30 },
            // court boundary walls
            { x: 0,   y: 0,   w: 6,  h: H },
            { x: W-6, y: 0,   w: 6,  h: H },
            { x: 0,   y: 0,   w: W,  h: 6 },
            { x: 0,   y: H-6, w: W,  h: 6 },
        ];

        // ── Constants ─────────────────────────────────────────────────────
        const PSPEED       = 3.2;
        const LSPEED_START = 1.8;
        // Catch fires when sprite centers are closer than this
        const CATCH_DIST   = (P_RENDER_W + L_RENDER_W) * 0.32;

        // ── State ─────────────────────────────────────────────────────────
        let player    = { x: 100, y: H / 2, dir: 'down', frame: 0 };
        let lebron    = { x: W - 150, y: H / 2, dir: 'left', frame: 0 };
        let keys      = {};
        let gameOver  = false;
        let caught    = false;
        let startTime = Date.now();
        let elapsed   = 0;
        let bestTime  = 0;
        let tick      = 0;

        // ── Input ─────────────────────────────────────────────────────────
        const onDown = e => {
            keys[e.key.toLowerCase()] = true;
            // Block arrow keys from scrolling the page
            if (['arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        };
        const onUp = e => {
            keys[e.key.toLowerCase()] = false;
            if (e.key.toLowerCase() === 'r' && gameOver) resetGame();
        };
        window.addEventListener('keydown', onDown);
        window.addEventListener('keyup',   onUp);

        // ── Helpers ───────────────────────────────────────────────────────
        function boxCollides(cx, cy, hw, hh) {
            for (const o of OBS) {
                if (cx - hw < o.x + o.w && cx + hw > o.x &&
                    cy - hh < o.y + o.h && cy + hh > o.y) return true;
            }
            return false;
        }

        // Draw one animation frame from a sprite sheet, centered on (cx, cy)
        function drawFrame(img, frameW, frameH, renderW, renderH, rowMap, cx, cy, dir, frame) {
            if (!img.complete || img.naturalWidth === 0) return;
            const row = rowMap[dir] ?? 0;
            const col = frame % 3;
            ctx.drawImage(
                img,
                col * frameW, row * frameH, frameW, frameH,          // source
                cx - renderW / 2, cy - renderH / 2, renderW, renderH // dest
            );
        }

        function resetGame() {
            player    = { x: 100, y: H / 2, dir: 'down', frame: 0 };
            lebron    = { x: W - 150, y: H / 2, dir: 'left', frame: 0 };
            keys      = {};
            gameOver  = false;
            caught    = false;
            startTime = Date.now();
            elapsed   = 0;
            tick      = 0;
        }

        // ── Update ────────────────────────────────────────────────────────
        function update() {
            if (gameOver) return;
            elapsed = (Date.now() - startTime) / 1000;
            tick++;

            // Player movement
            let dx = 0, dy = 0;
            if (keys['w'] || keys['arrowup'])    { dy = -PSPEED; player.dir = 'up';    }
            if (keys['s'] || keys['arrowdown'])  { dy =  PSPEED; player.dir = 'down';  }
            if (keys['a'] || keys['arrowleft'])  { dx = -PSPEED; player.dir = 'left';  }
            if (keys['d'] || keys['arrowright']) { dx =  PSPEED; player.dir = 'right'; }

            const phw = P_RENDER_W * 0.36;
            const phh = P_RENDER_H * 0.36;
            if (!boxCollides(player.x + dx, player.y, phw, phh)) player.x += dx;
            if (!boxCollides(player.x, player.y + dy, phw, phh)) player.y += dy;
            if ((dx !== 0 || dy !== 0) && tick % 6 === 0) player.frame++;

            // LeBron chase AI — speed ramps up over time
            const lspeed = Math.min(LSPEED_START + elapsed * 0.035, 4.2);
            const ddx = player.x - lebron.x;
            const ddy = player.y - lebron.y;
            const dist = Math.sqrt(ddx * ddx + ddy * ddy);

            if (dist > 2) {
                const nx = (ddx / dist) * lspeed;
                const ny = (ddy / dist) * lspeed;

                // Face the direction LeBron is moving
                if (Math.abs(ddx) > Math.abs(ddy)) lebron.dir = ddx > 0 ? 'right' : 'left';
                else                               lebron.dir = ddy > 0 ? 'down'  : 'up';

                const lhw = L_RENDER_W * 0.36;
                const lhh = L_RENDER_H * 0.36;

                if (!boxCollides(lebron.x + nx, lebron.y, lhw, lhh))       lebron.x += nx;
                else if (!boxCollides(lebron.x, lebron.y + ny, lhw, lhh))  lebron.y += ny;
                else {
                    // Perpendicular slide so LeBron doesn't freeze on barriers
                    for (const s of [{ x: -ny, y: nx }, { x: ny, y: -nx }]) {
                        if (!boxCollides(lebron.x + s.x * 0.9, lebron.y + s.y * 0.9, lhw, lhh)) {
                            lebron.x += s.x * 0.9;
                            lebron.y += s.y * 0.9;
                            break;
                        }
                    }
                }
                if (tick % 6 === 0) lebron.frame++;
            }

            // Catch check
            if (dist < CATCH_DIST) {
                caught   = true;
                gameOver = true;
                if (elapsed > bestTime) bestTime = elapsed;
            }
        }

        // ── Render ────────────────────────────────────────────────────────
        function render() {
            ctx.clearRect(0, 0, W, H);

            if (loaded < 2) {
                // Waiting for sprite images to load
                ctx.fillStyle = 'rgba(0,0,0,0.55)';
                ctx.beginPath(); ctx.roundRect(W/2 - 90, H/2 - 18, 180, 36, 8); ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = '14px monospace';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('Loading sprites…', W / 2, H / 2);
                return;
            }

            // Player sprite
            drawFrame(
                playerImg,
                P_FRAME_W, P_FRAME_H, P_RENDER_W, P_RENDER_H,
                P_ROWS, player.x, player.y, player.dir, player.frame
            );

            // LeBron sprite
            drawFrame(
                lebronImg,
                L_FRAME_W, L_FRAME_H, L_RENDER_W, L_RENDER_H,
                L_ROWS, lebron.x, lebron.y, lebron.dir, lebron.frame
            );

            // ── HUD ───────────────────────────────────────────────────────
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.62)';
            ctx.beginPath();
            ctx.roundRect(W / 2 - 148, 8, 296, 34, 8);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 15px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`⏱  ${elapsed.toFixed(1)}s     Best: ${bestTime.toFixed(1)}s`, W / 2, 25);
            ctx.restore();

            // ── Controls hint ─────────────────────────────────────────────
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.42)';
            ctx.beginPath(); ctx.roundRect(8, H - 28, 228, 20, 4); ctx.fill();
            ctx.fillStyle = '#cccccc';
            ctx.font = '11px monospace';
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText('Move: WASD / Arrow Keys', 14, H - 18);
            ctx.restore();

            // ── Caught screen ─────────────────────────────────────────────
            if (caught) {
                ctx.save();
                ctx.fillStyle = 'rgba(0,0,0,0.70)';
                ctx.fillRect(0, 0, W, H);

                const cw = 420, ch = 230;
                const cx = (W - cw) / 2, cy = (H - ch) / 2;
                ctx.fillStyle = '#1a1a2e';
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.roundRect(cx, cy, cw, ch, 14); ctx.fill(); ctx.stroke();

                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

                ctx.fillStyle = '#ffd700';
                ctx.font = 'bold 24px monospace';
                ctx.fillText('🏀  LeBron stole the ball!', W / 2, cy + 55);

                ctx.fillStyle = '#ff6600';
                ctx.font = 'bold 19px monospace';
                ctx.fillText(`You survived  ${elapsed.toFixed(1)}s`, W / 2, cy + 100);

                ctx.fillStyle = '#aaaaaa';
                ctx.font = '14px monospace';
                ctx.fillText(`Best: ${bestTime.toFixed(1)}s`, W / 2, cy + 142);

                ctx.fillStyle = '#ffffff';
                ctx.font = '13px monospace';
                ctx.fillText('Press  R  to play again', W / 2, cy + 178);
                ctx.restore();
            }
        }

        // ── Loop ──────────────────────────────────────────────────────────
        (function loop() {
            update();
            render();
            requestAnimationFrame(loop);
        })();
    }
}

export default GameLevelBasketball;