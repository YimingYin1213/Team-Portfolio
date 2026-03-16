// Adventure Game Custom Level - Basketball Evasion
// Exported for GameEnginev1
// How to use this file:
// 1) Save as assets/js/GameEnginev1/GameLevelBasketball.js in your repo.
// 2) Reference it in your runner or level selector. Examples:
//    import GameLevelBasketball from '/portfolio/assets/js/GameEnginev1/GameLevelBasketball.js';
//    export const gameLevelClasses = [GameLevelBasketball];
// 3) Ensure images exist and paths resolve via 'path' provided by the engine.

import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Npc from './essentials/Npc.js';
import Barrier from './essentials/Barrier.js';

class GameLevelBasketball {
    constructor(gameEnv) {
        const path = gameEnv.path;
        const width = gameEnv.innerWidth;
        const height = gameEnv.innerHeight;

        // ── CANVAS OVERLAY FOR EVASION GAME ──────────────────────────────────
        // This injects a full canvas-based mini-game on top of the level.
        // It runs independently of the GameEngine sprite loop.
        this._startEvasionGame(width, height, path);

        // ── BACKGROUND ───────────────────────────────────────────────────────
        const bgData = {
            name: "custom_bg",
            src: path + "/images/gamebuilder/bg/Court.png",
            pixels: { height: 768, width: 1377 }
        };

        // ── PLAYER ───────────────────────────────────────────────────────────
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

        // ── LEBRON NPC (chaser) ───────────────────────────────────────────────
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
            speed: 2,                          // LeBron chases the player
            hitbox: { widthPercentage: 0.1, heightPercentage: 0.1 },
            dialogues: ["Yo let's 1v1!", "You can't escape me!", "Ball is life!"],
            reaction: function () {
                if (this.dialogueSystem) { this.showReactionDialogue(); }
                else { console.log(this.greeting); }
            },
            interact: function () {
                if (this.dialogueSystem) { this.showRandomDialogue(); }
            }
        };

        // ── BARRIERS (obstacles to dodge around) ─────────────────────────────
        // Bench left side
        const dbarrier_1 = {
            id: 'dbarrier_1',
            x: width * 0.22,
            y: height * 0.42,
            width: width * 0.005,
            height: height * 0.22,
            visible: true,
            hitbox: { widthPercentage: 0.95, heightPercentage: 0.95 },
            fromOverlay: true
        };

        // Bench right side
        const dbarrier_2 = {
            id: 'dbarrier_2',
            x: width * 0.34,
            y: height * 0.42,
            width: width * 0.005,
            height: height * 0.22,
            visible: true,
            hitbox: { widthPercentage: 0.95, heightPercentage: 0.95 },
            fromOverlay: true
        };

        // Gatorade jug obstacle center-right
        const dbarrier_3 = {
            id: 'dbarrier_3',
            x: width * 0.58,
            y: height * 0.48,
            width: width * 0.06,
            height: height * 0.22,
            visible: true,
            hitbox: { widthPercentage: 0.95, heightPercentage: 0.95 },
            fromOverlay: true
        };

        // Extra obstacle top-center
        const dbarrier_4 = {
            id: 'dbarrier_4',
            x: width * 0.45,
            y: height * 0.20,
            width: width * 0.10,
            height: height * 0.015,
            visible: true,
            hitbox: { widthPercentage: 0.95, heightPercentage: 0.95 },
            fromOverlay: true
        };

        // Extra obstacle bottom-center
        const dbarrier_5 = {
            id: 'dbarrier_5',
            x: width * 0.45,
            y: height * 0.75,
            width: width * 0.10,
            height: height * 0.015,
            visible: true,
            hitbox: { widthPercentage: 0.95, heightPercentage: 0.95 },
            fromOverlay: true
        };

        // ── CLASSES LIST ──────────────────────────────────────────────────────
        this.classes = [
            { class: GameEnvBackground, data: bgData },
            { class: Player,  data: playerData },
            { class: Npc,     data: npcData1 },
            { class: Barrier, data: dbarrier_1 },
            { class: Barrier, data: dbarrier_2 },
            { class: Barrier, data: dbarrier_3 },
            { class: Barrier, data: dbarrier_4 },
            { class: Barrier, data: dbarrier_5 },
        ];

        // ── ATTACH CHASE AI TO LEBRON AFTER ENGINE READY ─────────────────────
        // The engine calls update() each frame. We hook in after the first tick.
        this._initChaseAI(gameEnv);
    }

    // ── CHASE AI ──────────────────────────────────────────────────────────────
    // Runs each game tick. Finds the Player and Npc instances in the environment
    // and steers LeBron toward the player. On collision shows "LeBron stole the ball".
    _initChaseAI(gameEnv) {
        this._chaseStartTime = Date.now();
        this._caughtFlag = false;
        this._bestTime = 0;

        // We inject into the gameEnv update loop by monkey-patching or by
        // scheduling via requestAnimationFrame. Using rAF is engine-agnostic.
        const tick = () => {
            if (!gameEnv || !gameEnv.gameObjects) {
                requestAnimationFrame(tick);
                return;
            }

            const playerObj = gameEnv.gameObjects.find(o => o.id === 'playerData');
            const lebronObj = gameEnv.gameObjects.find(o => o.id === 'NPC');

            if (!playerObj || !lebronObj || this._caughtFlag) {
                if (!this._caughtFlag) requestAnimationFrame(tick);
                return;
            }

            // ── Update HUD timer ──
            const elapsed = (Date.now() - this._chaseStartTime) / 1000;
            this._updateHUD(elapsed);

            // ── Steer LeBron toward player ──
            const px = playerObj.x ?? playerObj.position?.x ?? 0;
            const py = playerObj.y ?? playerObj.position?.y ?? 0;
            const lx = lebronObj.x ?? lebronObj.position?.x ?? 0;
            const ly = lebronObj.y ?? lebronObj.position?.y ?? 0;

            const dx = px - lx;
            const dy = py - ly;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Speed ramps up over time (gets harder)
            const chaseSpeed = Math.min(1.8 + elapsed * 0.03, 3.5);

            if (dist > 4) {
                const nx = (dx / dist) * chaseSpeed;
                const ny = (dy / dist) * chaseSpeed;

                // Try to move; fall back to perpendicular slide if blocked
                if (lebronObj.position) {
                    lebronObj.position.x += nx;
                    lebronObj.position.y += ny;
                } else {
                    lebronObj.x += nx;
                    lebronObj.y += ny;
                }
            }

            // ── Collision check ──
            const catchRadius = 40;
            if (dist < catchRadius) {
                this._caughtFlag = true;
                if (elapsed > this._bestTime) this._bestTime = elapsed;
                this._showCaughtMessage(elapsed, this._bestTime);
                return; // stop chasing
            }

            requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }

    // ── HUD ───────────────────────────────────────────────────────────────────
    _updateHUD(elapsed) {
        let hud = document.getElementById('bball-hud');
        if (!hud) {
            hud = document.createElement('div');
            hud.id = 'bball-hud';
            hud.style.cssText = `
                position: fixed;
                top: 16px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.72);
                color: #fff;
                font-family: monospace;
                font-size: 20px;
                font-weight: bold;
                padding: 8px 28px;
                border-radius: 10px;
                z-index: 9999;
                letter-spacing: 1px;
                pointer-events: none;
            `;
            document.body.appendChild(hud);
        }
        hud.textContent = `⏱ ${elapsed.toFixed(1)}s  —  Dodge LeBron!`;
    }

    // ── CAUGHT MESSAGE ────────────────────────────────────────────────────────
    _showCaughtMessage(elapsed, best) {
        // Remove timer HUD
        const hud = document.getElementById('bball-hud');
        if (hud) hud.remove();

        // Overlay
        let overlay = document.getElementById('bball-overlay');
        if (overlay) overlay.remove();

        overlay = document.createElement('div');
        overlay.id = 'bball-overlay';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.75);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            font-family: monospace;
        `;

        overlay.innerHTML = `
            <div style="
                background: #1a1a2e;
                border: 3px solid #552288;
                border-radius: 16px;
                padding: 40px 60px;
                text-align: center;
                color: #fff;
                max-width: 420px;
            ">
                <div style="font-size:52px; margin-bottom:12px;">🏀</div>
                <div style="font-size:26px; font-weight:bold; color:#ffd700; margin-bottom:8px;">
                    LeBron stole the ball!
                </div>
                <div style="font-size:17px; color:#ccc; margin-bottom:6px;">
                    You survived <span style="color:#ff6600; font-weight:bold;">${elapsed.toFixed(1)}s</span>
                </div>
                <div style="font-size:14px; color:#aaa; margin-bottom:28px;">
                    Best: <span style="color:#ffd700;">${best.toFixed(1)}s</span>
                </div>
                <button id="bball-restart" style="
                    background: #552288;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 36px;
                    font-size: 16px;
                    font-weight: bold;
                    cursor: pointer;
                    letter-spacing: 1px;
                ">
                    Play Again
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        document.getElementById('bball-restart').addEventListener('click', () => {
            overlay.remove();
            this._caughtFlag = false;
            this._chaseStartTime = Date.now();
            this._updateHUD(0);

            // Re-spawn player and LeBron to starting positions
            if (window._gameEnvRef && window._gameEnvRef.gameObjects) {
                const p = window._gameEnvRef.gameObjects.find(o => o.id === 'playerData');
                const l = window._gameEnvRef.gameObjects.find(o => o.id === 'NPC');
                if (p) { if (p.position) { p.position.x = 100; p.position.y = 300; } else { p.x = 100; p.y = 300; } }
                if (l) {
                    const rx = (window._gameEnvRef.innerWidth || 1200) - 150;
                    if (l.position) { l.position.x = rx; l.position.y = 300; } else { l.x = rx; l.y = 300; }
                }
            }

            this._initChaseAI(window._gameEnvRef);
        });
    }

    // ── CANVAS EVASION GAME (standalone fallback / visual layer) ─────────────
    // If you want to run this without the full GameEngine, this method renders
    // a self-contained canvas game using colored sprite stand-ins.
    // Remove or comment out this method if running inside the full GameEngine.
    _startEvasionGame(width, height, path) {
        // Only start standalone mode if there's no gameEngine canvas already
        if (document.getElementById('bball-canvas')) return;

        const canvas = document.createElement('canvas');
        canvas.id = 'bball-canvas';
        canvas.width  = Math.min(width,  900);
        canvas.height = Math.min(height, 520);
        canvas.style.cssText = `
            display: block;
            margin: 0 auto;
            border: 2px solid #552288;
            border-radius: 8px;
        `;
        document.body.insertBefore(canvas, document.body.firstChild);

        const ctx = canvas.getContext('2d');
        const W = canvas.width, H = canvas.height;

        const PSIZE = 26, LSIZE = 30, PSPEED = 3.0;
        let lspeedBase = 1.7;

        const OBSTACLES = [
            { x: W*0.22, y: H*0.35, w: 8,      h: H*0.22 },
            { x: W*0.34, y: H*0.35, w: 8,      h: H*0.22 },
            { x: W*0.55, y: H*0.42, w: W*0.06, h: H*0.22 },
            { x: W*0.42, y: H*0.18, w: W*0.10, h: 8 },
            { x: W*0.42, y: H*0.72, w: W*0.10, h: 8 },
            { x: W*0.68, y: H*0.25, w: 8,      h: H*0.18 },
            { x: W*0.15, y: H*0.65, w: W*0.08, h: 8 },
        ];

        const keys = {};
        let player  = { x: 80,   y: H/2 };
        let lebron  = { x: W-80, y: H/2 };
        let gameOver = false, caught = false;
        let startTime = Date.now(), elapsed = 0, bestTime = 0;
        let animId;

        canvas.setAttribute('tabindex', '0');
        canvas.focus();

        window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true;  e.preventDefault(); });
        window.addEventListener('keyup',   e => { keys[e.key.toLowerCase()] = false; });

        function collides(x, y, size) {
            const h = size * 0.45;
            for (const o of OBSTACLES) {
                if (x-h < o.x+o.w && x+h > o.x && y-h < o.y+o.h && y+h > o.y) return true;
            }
            return x-h < 10 || x+h > W-10 || y-h < 10 || y+h > H-10;
        }

        function drawCourt() {
            ctx.fillStyle = '#c8833a';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = 'rgba(0,0,0,0.07)';
            for (let x = 0; x < W; x += 36) ctx.fillRect(x, 0, 18, H);
            ctx.strokeStyle = 'rgba(255,255,255,0.9)';
            ctx.lineWidth = 2;
            ctx.strokeRect(20, 20, W-40, H-40);
            ctx.beginPath(); ctx.moveTo(W/2, 20); ctx.lineTo(W/2, H-20); ctx.stroke();
            ctx.beginPath(); ctx.arc(W/2, H/2, Math.min(W,H)*0.13, 0, Math.PI*2); ctx.stroke();
            ctx.strokeRect(20, H/2-50, 60, 100);
            ctx.strokeRect(W-80, H/2-50, 60, 100);
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = `bold ${Math.floor(W*0.045)}px monospace`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('HOOPS', W/2, H/2);
        }

        function drawObstacles() {
            OBSTACLES.forEach(o => {
                ctx.fillStyle = '#5c3d1a';
                ctx.fillRect(o.x, o.y, o.w, o.h);
                ctx.fillStyle = '#7a5230';
                ctx.fillRect(o.x+2, o.y+2, Math.min(o.w-4, 8), 4);
            });
        }

        function drawSprite(x, y, size, color, label, hat) {
            ctx.save();
            ctx.translate(x, y);
            // body
            ctx.fillStyle = color;
            ctx.fillRect(-size*0.32, -size*0.12, size*0.64, size*0.52);
            // head
            ctx.fillStyle = '#c47c3a';
            ctx.beginPath(); ctx.arc(0, -size*0.52, size*0.25, 0, Math.PI*2); ctx.fill();
            // hat
            ctx.fillStyle = hat;
            ctx.fillRect(-size*0.3, -size*0.78, size*0.6, size*0.28);
            // legs
            ctx.fillStyle = color;
            ctx.fillRect(-size*0.32, size*0.38, size*0.26, size*0.28);
            ctx.fillRect(size*0.06,  size*0.38, size*0.26, size*0.28);
            // label
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${Math.floor(size*0.22)}px monospace`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(label, 0, size*0.15);
            ctx.restore();
        }

        function drawBall(x, y) {
            const bounce = Math.sin(Date.now()*0.008) * 3;
            ctx.fillStyle = '#ff6600';
            ctx.beginPath(); ctx.arc(x+LSIZE*0.55, y+bounce, LSIZE*0.18, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#000'; ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(x+LSIZE*0.38, y-LSIZE*0.05+bounce);
            ctx.lineTo(x+LSIZE*0.72, y+LSIZE*0.05+bounce);
            ctx.stroke();
        }

        function drawHUD() {
            ctx.fillStyle = 'rgba(0,0,0,0.65)';
            ctx.beginPath();
            ctx.roundRect(W/2-100, 6, 200, 32, 8);
            ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 15px monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(`⏱ ${elapsed.toFixed(1)}s   Best: ${bestTime.toFixed(1)}s`, W/2, 22);
        }

        function drawCaught() {
            ctx.fillStyle = 'rgba(0,0,0,0.72)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = '#ffd700';
            ctx.font = `bold ${Math.floor(W*0.052)}px monospace`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('🏀 LeBron stole the ball!', W/2, H/2 - 40);
            ctx.fillStyle = '#ff6600';
            ctx.font = `bold ${Math.floor(W*0.038)}px monospace`;
            ctx.fillText(`You survived ${elapsed.toFixed(1)}s`, W/2, H/2 + 10);
            ctx.fillStyle = '#aaa';
            ctx.font = `${Math.floor(W*0.028)}px monospace`;
            ctx.fillText(`Best: ${bestTime.toFixed(1)}s`, W/2, H/2 + 45);
            ctx.fillStyle = '#fff';
            ctx.font = `${Math.floor(W*0.026)}px monospace`;
            ctx.fillText('Press R to play again', W/2, H/2 + 80);
        }

        function update() {
            elapsed = (Date.now() - startTime) / 1000;

            let dx = 0, dy = 0;
            if (keys['w'] || keys['arrowup'])    dy = -PSPEED;
            if (keys['s'] || keys['arrowdown'])  dy =  PSPEED;
            if (keys['a'] || keys['arrowleft'])  dx = -PSPEED;
            if (keys['d'] || keys['arrowright']) dx =  PSPEED;

            if (!collides(player.x + dx, player.y, PSIZE)) player.x += dx;
            if (!collides(player.x, player.y + dy, PSIZE)) player.y += dy;

            const lspeed = Math.min(lspeedBase + elapsed * 0.035, 3.8);
            const ldx = player.x - lebron.x;
            const ldy = player.y - lebron.y;
            const dist = Math.sqrt(ldx*ldx + ldy*ldy);

            if (dist > 2) {
                const mx = (ldx/dist)*lspeed;
                const my = (ldy/dist)*lspeed;
                if (!collides(lebron.x+mx, lebron.y, LSIZE))      lebron.x += mx;
                else if (!collides(lebron.x, lebron.y+my, LSIZE)) lebron.y += my;
                else {
                    // perpendicular slide to avoid getting stuck on corners
                    const slides = [{x:-my, y:mx}, {x:my, y:-mx}];
                    for (const s of slides) {
                        if (!collides(lebron.x+s.x*0.9, lebron.y+s.y*0.9, LSIZE)) {
                            lebron.x += s.x*0.9; lebron.y += s.y*0.9; break;
                        }
                    }
                }
            }

            if (dist < (PSIZE + LSIZE) * 0.44) {
                caught = true; gameOver = true;
                if (elapsed > bestTime) bestTime = elapsed;
            }

            if (keys['r'] && gameOver) {
                player   = { x: 80,   y: H/2 };
                lebron   = { x: W-80, y: H/2 };
                gameOver = false; caught = false;
                startTime = Date.now(); elapsed = 0;
            }
        }

        function render() {
            ctx.clearRect(0, 0, W, H);
            drawCourt();
            drawObstacles();
            drawSprite(player.x,  player.y,  PSIZE, '#e83030', 'YOU', '#e83030');
            drawBall(lebron.x, lebron.y);
            drawSprite(lebron.x,  lebron.y,  LSIZE, '#552288', '23',  '#552288');
            drawHUD();
            if (caught) drawCaught();
        }

        function loop() {
            update();
            render();
            animId = requestAnimationFrame(loop);
        }

        loop();
    }
}

export default GameLevelBasketball;