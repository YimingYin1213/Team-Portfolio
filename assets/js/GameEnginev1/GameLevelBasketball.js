// Adventure Game Custom Level
// Exported from GameBuilder on 2026-03-06T07:25:20.568Z
// How to use this file:
// 1) Save as assets/js/GameEnginev1/GameLevelBasketball.js in your repo.
// 2) Reference it in your runner or level selector. Examples:
//    import GameLevelPlanets from '/portfolio/assets/js/GameEnginev1/GameLevelPlanets.js';
//    import GameLevelBasketball from '/portfolio/assets/js/GameEnginev1/GameLevelBasketball.js';
//    export const gameLevelClasses = [GameLevelPlanets, GameLevelBasketball];
// 3) Ensure images exist and paths resolve via 'path' provided by the engine.
// 4) You can add more objects to this.classes inside the constructor.

import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Npc from './essentials/Npc.js';
import Barrier from './essentials/Barrier.js';

class GameLevelBasketball {
    constructor(gameEnv) {
        const path = gameEnv.path;
        const width = gameEnv.innerWidth;
        const height = gameEnv.innerHeight;

        const bgData = {
            name: "custom_bg",
            src: path + "/images/gamebuilder/bg/Court.png",
            pixels: { height: 768, width: 1377 }
        };

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
            downRight: { row: 1, start: 0, columns: 3, rotate: Math.PI/16 },
            downLeft:  { row: 0, start: 0, columns: 3, rotate: -Math.PI/16 },
            left:      { row: 2, start: 0, columns: 3 },
            right:     { row: 1, start: 0, columns: 3 },
            up:        { row: 3, start: 0, columns: 3 },
            upLeft:    { row: 2, start: 0, columns: 3, rotate: Math.PI/16 },
            upRight:   { row: 3, start: 0, columns: 3, rotate: -Math.PI/16 },
            hitbox: { widthPercentage: 0, heightPercentage: 0 },
            keypress: { up: 87, left: 65, down: 83, right: 68 }
        };

        const npcData1 = {
            id: 'NPC',
            greeting: 'Yo let\'s 1v1',
            src: path + "/images/gamebuilder/sprites/LeBron.png",
            SCALE_FACTOR: 3,
            ANIMATION_RATE: 50,
            INIT_POSITION: { x: 1250, y: 300 },
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
            hitbox: { widthPercentage: 0.01, heightPercentage: 0.01 },
            dialogues: ['Yo let\'s 1v1!'],
            reaction: function() { if (this.dialogueSystem) { this.showReactionDialogue(); } else { console.log(this.greeting); } },
            interact: function() { if (this.dialogueSystem) { this.showRandomDialogue(); } }
        };

        // Left bench (skinny vertical barrier)
        const dbarrier_1 = {
            id: 'dbarrier_1',
            x: width * 0.175,
            y: height * 0.60,
            width: width * 0.005,
            height: height * 0.22,
            visible: true,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        // Right bench (skinny vertical barrier)
        const dbarrier_2 = {
            id: 'dbarrier_2',
            x: width * 0.295,
            y: height * 0.60,
            width: width * 0.005,
            height: height * 0.22,
            visible: true,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        // Gatorade jug (small square)
        const dbarrier_3 = {
            id: 'dbarrier_3',
            x: width * 0.615,
            y: height * 0.55,
            width: width * 0.075,
            height: height * 0.30,
            visible: true,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        this.classes = [
            { class: GameEnvBackground, data: bgData },
            { class: Player, data: playerData },
            { class: Npc, data: npcData1 },
            { class: Barrier, data: dbarrier_1 },
            { class: Barrier, data: dbarrier_2 },
            { class: Barrier, data: dbarrier_3 }
        ];

        // ── EVASION GAME ──────────────────────────────────────────────────────
        // Injects a canvas-based mini-game using the real sprite sheets.
        // LeBron chases the player; survive as long as possible.
        // Controls: WASD or Arrow Keys. Press R to restart after caught.
        this._runEvasionGame(gameEnv, path, width, height);
    }

    _runEvasionGame(gameEnv, path, width, height) {
        // ── Canvas setup ──────────────────────────────────────────────────
        const W = width  || 1200;
        const H = height || 680;

        const canvas = document.createElement('canvas');
        canvas.id = 'bball-evasion';
        canvas.width  = W;
        canvas.height = H;
        canvas.setAttribute('tabindex', '0');
        canvas.style.cssText = `
            display: block;
            position: absolute;
            top: 0; left: 0;
            width: 100%; height: 100%;
            z-index: 10;
            outline: none;
        `;

        // Insert over whatever container the engine uses
        const container = document.querySelector('#gameContainer, #game, main, body');
        if (container) {
            container.style.position = 'relative';
            container.appendChild(canvas);
        } else {
            document.body.appendChild(canvas);
        }

        const ctx = canvas.getContext('2d');
        canvas.focus();

        // ── Sprite sheet math (mirrors playerData / npcData1 exactly) ────
        // Player: 1080w × 1350h, 3 cols × 4 rows, scale 5
        const P_FRAME_W  = 1080 / 3;           // 360
        const P_FRAME_H  = 1350 / 4;           // 337.5
        const P_RENDER_W = P_FRAME_W / 5;      // 72
        const P_RENDER_H = P_FRAME_H / 5;      // 67.5
        // row per direction (from playerData orientation)
        const P_ROW = { down: 0, right: 1, left: 2, up: 3 };

        // LeBron: same sheet size, scale 3
        const L_FRAME_W  = 1080 / 3;           // 360
        const L_FRAME_H  = 1350 / 4;           // 337.5
        const L_RENDER_W = L_FRAME_W / 3;      // 120
        const L_RENDER_H = L_FRAME_H / 3;      // 112.5
        // LeBron uses row 0 for every direction (from npcData1)
        const L_ROW = { down: 0, right: 0, left: 0, up: 0 };

        // ── Load sprites ──────────────────────────────────────────────────
        const playerImg = new Image();
        const lebronImg = new Image();
        let loadedCount = 0;
        playerImg.onload = () => loadedCount++;
        lebronImg.onload = () => loadedCount++;
        playerImg.src = path + "/images/gamebuilder/sprites/BasketballPlayer.png";
        lebronImg.src = path + "/images/gamebuilder/sprites/LeBron.png";

        // Also load the court background so the evasion canvas looks right
        const bgImg = new Image();
        bgImg.onload = () => loadedCount++;
        bgImg.src = path + "/images/gamebuilder/bg/Court.png";

        // ── Obstacles — same proportional positions as the barriers above ─
        const OBS = [
            { x: W*0.175, y: H*0.60, w: Math.max(W*0.005, 8), h: H*0.22 },
            { x: W*0.295, y: H*0.60, w: Math.max(W*0.005, 8), h: H*0.22 },
            { x: W*0.615, y: H*0.55, w: W*0.075,               h: H*0.30 },
            // court boundary
            { x: 0,   y: 0,   w: 1, h: H },
            { x: W-1, y: 0,   w: 1, h: H },
            { x: 0,   y: 0,   w: W, h: 1 },
            { x: 0,   y: H-1, w: W, h: 1 },
        ];

        // ── Game constants ────────────────────────────────────────────────
        const PLAYER_SPEED   = 3.5;
        const LEBRON_SPEED_0 = 1.8;   // starting chase speed
        const LEBRON_SPEED_MAX = 4.5; // cap
        const CATCH_RADIUS   = (P_RENDER_W + L_RENDER_W) * 0.30;

        // ── Game state ────────────────────────────────────────────────────
        let player, lebron, keys, gameOver, caught, startTime, elapsed, bestTime, tickN;

        function initState() {
            player    = { x: 120,     y: H / 2, dir: 'down', frame: 0 };
            lebron    = { x: W - 160, y: H / 2, dir: 'left', frame: 0 };
            keys      = {};
            gameOver  = false;
            caught    = false;
            startTime = Date.now();
            elapsed   = 0;
            tickN     = 0;
        }
        bestTime = 0;
        initState();

        // ── Input ─────────────────────────────────────────────────────────
        window.addEventListener('keydown', e => {
            keys[e.key.toLowerCase()] = true;
            if (['arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))
                e.preventDefault();
        });
        window.addEventListener('keyup', e => {
            keys[e.key.toLowerCase()] = false;
            if (e.key.toLowerCase() === 'r' && gameOver) initState();
        });

        // ── Collision ─────────────────────────────────────────────────────
        function hits(cx, cy, hw, hh) {
            for (const o of OBS) {
                if (cx - hw < o.x + o.w && cx + hw > o.x &&
                    cy - hh < o.y + o.h && cy + hh > o.y) return true;
            }
            return false;
        }

        // ── Draw one sprite frame centered on (cx, cy) ────────────────────
        function drawSprite(img, frameW, frameH, renderW, renderH, rowMap, cx, cy, dir, frame) {
            if (!img.complete || img.naturalWidth === 0) return;
            const row = rowMap[dir] ?? 0;
            const col = frame % 3;
            ctx.drawImage(
                img,
                col * frameW, row * frameH, frameW, frameH,
                cx - renderW / 2, cy - renderH / 2, renderW, renderH
            );
        }

        // ── Update ────────────────────────────────────────────────────────
        function update() {
            if (gameOver) return;
            elapsed = (Date.now() - startTime) / 1000;
            tickN++;

            // — Player —
            let dx = 0, dy = 0;
            if (keys['w'] || keys['arrowup'])    { dy = -PLAYER_SPEED; player.dir = 'up';    }
            if (keys['s'] || keys['arrowdown'])  { dy =  PLAYER_SPEED; player.dir = 'down';  }
            if (keys['a'] || keys['arrowleft'])  { dx = -PLAYER_SPEED; player.dir = 'left';  }
            if (keys['d'] || keys['arrowright']) { dx =  PLAYER_SPEED; player.dir = 'right'; }

            const phw = P_RENDER_W * 0.35;
            const phh = P_RENDER_H * 0.35;
            if (!hits(player.x + dx, player.y, phw, phh)) player.x += dx;
            if (!hits(player.x, player.y + dy, phw, phh)) player.y += dy;
            if ((dx !== 0 || dy !== 0) && tickN % 6 === 0) player.frame++;

            // — LeBron chase —
            const lspeed = Math.min(LEBRON_SPEED_0 + elapsed * 0.04, LEBRON_SPEED_MAX);
            const ddx = player.x - lebron.x;
            const ddy = player.y - lebron.y;
            const dist = Math.sqrt(ddx * ddx + ddy * ddy);

            if (dist > 2) {
                const nx = (ddx / dist) * lspeed;
                const ny = (ddy / dist) * lspeed;

                if (Math.abs(ddx) > Math.abs(ddy))
                    lebron.dir = ddx > 0 ? 'right' : 'left';
                else
                    lebron.dir = ddy > 0 ? 'down' : 'up';

                const lhw = L_RENDER_W * 0.35;
                const lhh = L_RENDER_H * 0.35;

                if      (!hits(lebron.x + nx, lebron.y,      lhw, lhh)) lebron.x += nx;
                else if (!hits(lebron.x,      lebron.y + ny, lhw, lhh)) lebron.y += ny;
                else {
                    // slide along corner
                    for (const s of [{ x: -ny, y: nx }, { x: ny, y: -nx }]) {
                        if (!hits(lebron.x + s.x * 0.9, lebron.y + s.y * 0.9, lhw, lhh)) {
                            lebron.x += s.x * 0.9;
                            lebron.y += s.y * 0.9;
                            break;
                        }
                    }
                }
                if (tickN % 6 === 0) lebron.frame++;
            }

            // — Catch check —
            if (dist < CATCH_RADIUS) {
                caught   = true;
                gameOver = true;
                if (elapsed > bestTime) bestTime = elapsed;
            }
        }

        // ── Render ────────────────────────────────────────────────────────
        function render() {
            ctx.clearRect(0, 0, W, H);

            // Background
            if (bgImg.complete && bgImg.naturalWidth > 0) {
                ctx.drawImage(bgImg, 0, 0, W, H);
            } else {
                // Fallback solid court color while bg loads
                ctx.fillStyle = '#c8833a';
                ctx.fillRect(0, 0, W, H);
            }

            // Sprites (or loading message)
            if (loadedCount < 3) {
                ctx.fillStyle = 'rgba(0,0,0,0.55)';
                ctx.beginPath();
                ctx.roundRect(W/2 - 90, H/2 - 18, 180, 36, 8);
                ctx.fill();
                ctx.fillStyle = '#fff';
                ctx.font = '14px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('Loading sprites…', W/2, H/2);
            } else {
                drawSprite(playerImg, P_FRAME_W, P_FRAME_H, P_RENDER_W, P_RENDER_H,
                           P_ROW, player.x, player.y, player.dir, player.frame);
                drawSprite(lebronImg, L_FRAME_W, L_FRAME_H, L_RENDER_W, L_RENDER_H,
                           L_ROW, lebron.x, lebron.y, lebron.dir, lebron.frame);
            }

            // HUD — timer bar
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            ctx.beginPath();
            ctx.roundRect(W/2 - 150, 10, 300, 36, 8);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`⏱  ${elapsed.toFixed(1)}s     Best: ${bestTime.toFixed(1)}s`, W/2, 28);
            ctx.restore();

            // Controls hint
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.45)';
            ctx.beginPath();
            ctx.roundRect(8, H - 28, 232, 20, 4);
            ctx.fill();
            ctx.fillStyle = '#cccccc';
            ctx.font = '11px monospace';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText('Move: WASD / Arrow Keys', 14, H - 18);
            ctx.restore();

            // Caught screen
            if (caught) {
                ctx.save();
                ctx.fillStyle = 'rgba(0,0,0,0.72)';
                ctx.fillRect(0, 0, W, H);

                const cw = 420, ch = 230;
                const cx = (W - cw) / 2;
                const cy = (H - ch) / 2;
                ctx.fillStyle = '#1a1a2e';
                ctx.strokeStyle = '#ffd700';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.roundRect(cx, cy, cw, ch, 14);
                ctx.fill();
                ctx.stroke();

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                ctx.fillStyle = '#ffd700';
                ctx.font = 'bold 24px monospace';
                ctx.fillText('🏀  LeBron stole the ball!', W/2, cy + 55);

                ctx.fillStyle = '#ff6600';
                ctx.font = 'bold 19px monospace';
                ctx.fillText(`You survived  ${elapsed.toFixed(1)}s`, W/2, cy + 100);

                ctx.fillStyle = '#aaaaaa';
                ctx.font = '14px monospace';
                ctx.fillText(`Best: ${bestTime.toFixed(1)}s`, W/2, cy + 142);

                ctx.fillStyle = '#ffffff';
                ctx.font = '13px monospace';
                ctx.fillText('Press  R  to play again', W/2, cy + 178);
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