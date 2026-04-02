// Adventure Game Custom Level
// Exported from GameBuilder on 2026-03-12T16:02:58.493Z
// How to use this file:
// 1) Save as assets/js/GameEnginev1/GameLevelSeek.js in your repo.
// 2) Reference it in your runner or level selector. Examples:
//    import GameLevelPlanets from '/Team-Portfolio/assets/js/GameEnginev1/GameLevelPlanets.js';
//    import GameLevelSeek from '/Team-Portfolio/assets/js/GameEnginev1/GameLevelSeek.js';
//    export const gameLevelClasses = [GameLevelPlanets, GameLevelSeek];
//    // or pass it directly to your GameControl as the only level.
// 3) Ensure images exist and paths resolve via 'path' provided by the engine.
// 4) You can add more objects to this.classes inside the constructor.

import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Npc from './essentials/Npc.js';
import Barrier from './essentials/Barrier.js';
import Collectible from './essentials/Collectible.js';

console.log('GameLevelSeek.js loaded:', new Date().toISOString());

class GameLevelSeek {
    constructor(gameEnv) {
        const path = gameEnv.path;
        const width = gameEnv.innerWidth;
        const height = gameEnv.innerHeight;

        const bgData = {
            name: "custom_bg",
            src: path + "/images/gamebuilder/bg/tagplayground.png",
            pixels: { height: 400, width: 560 }
        };

        const playerData = {
            id: 'playerData',
            src: path + "/images/gamebuilder/sprites/boysprite.png",
            SCALE_FACTOR: 5,
            STEP_FACTOR: 1000,
            ANIMATION_RATE: 50,
            INIT_POSITION: { x: 32, y: 300 },
            pixels: { height: 612, width: 408 },
            orientation: { rows: 4, columns: 3 },
            down: { row: 0, start: 0, columns: 3 },
            downRight: { row: 1, start: 0, columns: 3, rotate: Math.PI/16 },
            downLeft: { row: 0, start: 0, columns: 3, rotate: -Math.PI/16 },
            left: { row: 2, start: 0, columns: 3 },
            right: { row: 1, start: 0, columns: 3 },
            up: { row: 3, start: 0, columns: 3 },
            upLeft: { row: 2, start: 0, columns: 3, rotate: Math.PI/16 },
            upRight: { row: 3, start: 0, columns: 3, rotate: -Math.PI/16 },
            hitbox: { widthPercentage: 0, heightPercentage: 0 },
            keypress: { up: 87, left: 65, down: 83, right: 68 }
        };

        // --- Coin Quest State ---
        const coinState = {
            total: 6,
            collected: 0,
            kirbySpawned: false
        };

        // --- Pixel Coin Sprite Generator ---
        const createPixelCoin = () => {
            const size = 12;
            const scale = 3;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;

            const p = (x, y, color) => {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, 1, 1);
            };

            const coinPixels = [
                [4,0],[5,0],[6,0],[7,0],
                [2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],
                [1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],[10,2],
                [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3],
                [0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],
                [0,5],[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],[11,5],
                [0,6],[1,6],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6],[8,6],[9,6],[10,6],[11,6],
                [0,7],[1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7],[8,7],[9,7],[10,7],[11,7],
                [1,8],[2,8],[3,8],[4,8],[5,8],[6,8],[7,8],[8,8],[9,8],[10,8],
                [1,9],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],[8,9],[9,9],[10,9],
                [2,10],[3,10],[4,10],[5,10],[6,10],[7,10],[8,10],[9,10],
                [4,11],[5,11],[6,11],[7,11]
            ];

            coinPixels.forEach(([x, y]) => p(x, y, '#FFD700'));
            [[3,1],[4,1],[2,2],[3,2],[2,3],[3,3],[1,4],[2,4]].forEach(([x,y]) => p(x, y, '#FFF176'));
            [[10,3],[10,4],[10,5],[10,6],[9,7],[9,8],[8,9],[7,10]].forEach(([x,y]) => p(x, y, '#B8860B'));
            p(6,3,'#B8860B'); p(5,4,'#B8860B'); p(6,4,'#B8860B'); p(7,4,'#B8860B');
            p(5,5,'#B8860B'); p(7,6,'#B8860B'); p(5,7,'#B8860B'); p(6,7,'#B8860B');
            p(7,7,'#B8860B'); p(6,8,'#B8860B');

            const scaled = document.createElement('canvas');
            scaled.width = size * scale;
            scaled.height = size * scale;
            const sctx = scaled.getContext('2d');
            sctx.imageSmoothingEnabled = false;
            sctx.drawImage(canvas, 0, 0, scaled.width, scaled.height);
            return scaled.toDataURL();
        };

        const coinSprite = createPixelCoin();

        // --- Spawn Coins ---
        const spawnCoins = () => {
            const padding = 80;
            const minDist = 100;
            const positions = [];
            let attempts = 0;

            const maxX = Math.max(padding + 1, width - padding);
            const maxY = Math.max(padding + 1, height - padding);

            while (positions.length < coinState.total && attempts < 500) {
                attempts++;
                const x = Math.floor(Math.random() * (maxX - padding) + padding);
                const y = Math.floor(Math.random() * (maxY - padding) + padding);
                const tooClose = positions.some(pos => Math.hypot(pos.x - x, pos.y - y) < minDist);
                if (!tooClose) positions.push({ x, y });
            }

            positions.forEach((pos, i) => {
                const coinData = {
                    id: `coin_${i}`,
                    src: coinSprite,
                    SCALE_FACTOR: 15,
                    STEP_FACTOR: 0,
                    ANIMATION_RATE: 1,
                    INIT_POSITION: { x: pos.x, y: pos.y },
                    pixels: { height: 36, width: 36 },
                    orientation: { rows: 1, columns: 1 },
                    hitbox: { widthPercentage: 0.3, heightPercentage: 0.3 },
                    greeting: 'Coin collected!',
                    dialogues: ['Coin collected!'],
                    reaction: function() {},
                    showReactionDialogue: function() {},
                    interact: function() {
                        coinState.collected += 1;
                        this.destroy();
                        showCoinHUD();
                        if (coinState.collected >= coinState.total && !coinState.kirbySpawned) {
                            coinState.kirbySpawned = true;
                            spawnKirby();
                        }
                    }
                };

                const coin = new Collectible(coinData, gameEnv);
                coin.showReactionDialogue = function() {};
                gameEnv.gameObjects.push(coin);
            });

            showCoinHUD();
        };

        // --- Coin HUD Display ---
        const showCoinHUD = () => {
            let hud = document.getElementById('coin-hud');
            if (!hud) {
                hud = document.createElement('div');
                hud.id = 'coin-hud';
                Object.assign(hud.style, {
                    position: 'fixed',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(20, 15, 5, 0.82)',
                    border: '2px solid #FFD700',
                    borderRadius: '10px',
                    padding: '8px 16px',
                    color: '#FFD700',
                    fontFamily: "'Press Start 2P', cursive, monospace",
                    fontSize: '13px',
                    zIndex: '8888',
                    boxShadow: '0 0 14px rgba(255, 215, 0, 0.4)',
                    letterSpacing: '1px'
                });
                document.body.appendChild(hud);
            }
            hud.textContent = `🪙 ${coinState.collected} / ${coinState.total}`;
        };

        // --- Spawn Kirby after all coins collected ---
        const spawnKirby = () => {
            const kirbyX = Math.floor(width / 2) - 30;
            const kirbyY = Math.floor(height / 2) - 30;

            const kirbyData = {
                id: 'KirbyReward',
                greeting: '🎉 Congratulations! You found all the coins!',
                src: path + "/images/gamebuilder/sprites/kirby.png",
                SCALE_FACTOR: 6,
                ANIMATION_RATE: 50,
                INIT_POSITION: { x: kirbyX, y: kirbyY },
                pixels: { height: 36, width: 569 },
                orientation: { rows: 1, columns: 13 },
                down:      { row: 0, start: 0, columns: 3 },
                right:     { row: 0, start: 0, columns: 3 },
                left:      { row: 0, start: 0, columns: 3 },
                up:        { row: 0, start: 0, columns: 3 },
                upRight:   { row: 0, start: 0, columns: 3 },
                downRight: { row: 0, start: 0, columns: 3 },
                upLeft:    { row: 0, start: 0, columns: 3 },
                downLeft:  { row: 0, start: 0, columns: 3 },
                hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },
                dialogues: ['🎉 Congratulations! You found all the coins!'],
                reaction: function() {
                    if (this.dialogueSystem) { this.showReactionDialogue(); }
                    else { console.log(this.greeting); }
                },
                interact: function() {
                    if (this.dialogueSystem) { this.showReactionDialogue(); }
                },
                onDialogueClose: function() {
                    const gameControl = this.gameEnv?.gameControl;
                    if (gameControl?.currentLevel) {
                        gameControl.currentLevel.continue = false;
                    }
                }
            };

            const hud = document.getElementById('coin-hud');
            if (hud) hud.remove();

            showCongratulationsOverlay();

            const kirby = new Npc(kirbyData, gameEnv);
            gameEnv.gameObjects.push(kirby);
        };

        // --- Congratulations Overlay ---
        const showCongratulationsOverlay = () => {
            const existing = document.getElementById('congrats-overlay');
            if (existing) existing.remove();

            const overlay = document.createElement('div');
            overlay.id = 'congrats-overlay';
            Object.assign(overlay.style, {
                position: 'fixed',
                inset: '0',
                background: 'rgba(10, 5, 0, 0.70)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '9999',
                animation: 'fadeIn 0.4s ease'
            });

            if (!document.getElementById('congrats-styles')) {
                const style = document.createElement('style');
                style.id = 'congrats-styles';
                style.textContent = `
                    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                    @keyframes popIn { from { transform: scale(0.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                    @keyframes shimmer {
                        0%   { box-shadow: 0 0 20px rgba(255,215,0,0.4); }
                        50%  { box-shadow: 0 0 45px rgba(255,215,0,0.9), 0 0 80px rgba(255,215,0,0.3); }
                        100% { box-shadow: 0 0 20px rgba(255,215,0,0.4); }
                    }
                    #congrats-panel { animation: popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards, shimmer 2s ease-in-out 0.5s infinite; }
                `;
                document.head.appendChild(style);
            }

            const panel = document.createElement('div');
            panel.id = 'congrats-panel';
            Object.assign(panel.style, {
                width: 'min(480px, 88vw)',
                background: 'linear-gradient(160deg, rgba(40,30,5,0.97), rgba(20,15,2,0.97))',
                border: '3px solid #FFD700',
                borderRadius: '18px',
                padding: '30px 28px',
                color: '#FFF8DC',
                fontFamily: "'Press Start 2P', cursive, monospace",
                textAlign: 'center'
            });

            const stars = document.createElement('div');
            stars.textContent = '⭐ ⭐ ⭐';
            Object.assign(stars.style, { fontSize: '28px', marginBottom: '14px', letterSpacing: '6px' });

            const title = document.createElement('div');
            title.textContent = 'CONGRATULATIONS!';
            Object.assign(title.style, {
                fontSize: '15px',
                color: '#FFD700',
                textShadow: '0 0 16px rgba(255,215,0,0.9)',
                marginBottom: '14px',
                letterSpacing: '1px'
            });

            const msg = document.createElement('div');
            msg.textContent = 'You collected all the coins!';
            Object.assign(msg.style, {
                fontSize: '11px',
                lineHeight: '1.8',
                color: '#FFF8DC',
                marginBottom: '10px'
            });

            const sub = document.createElement('div');
            sub.textContent = 'Find Kirby to claim your reward!';
            Object.assign(sub.style, {
                fontSize: '10px',
                color: '#FFD700',
                marginBottom: '22px',
                opacity: '0.85'
            });

            const btn = document.createElement('button');
            btn.textContent = 'Awesome!';
            Object.assign(btn.style, {
                padding: '12px 24px',
                borderRadius: '10px',
                border: '2px solid #FFD700',
                fontFamily: "'Press Start 2P', cursive, monospace",
                fontSize: '11px',
                background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                color: '#1a0f00',
                cursor: 'pointer',
                letterSpacing: '1px'
            });
            btn.onclick = () => overlay.remove();

            panel.appendChild(stars);
            panel.appendChild(title);
            panel.appendChild(msg);
            panel.appendChild(sub);
            panel.appendChild(btn);
            overlay.appendChild(panel);
            document.body.appendChild(overlay);
        };

        // --- Opening Message ---
        const showOpeningMessage = () => {
            const overlay = document.createElement('div');
            overlay.id = 'opening-message-overlay';
            Object.assign(overlay.style, {
                position: 'fixed',
                inset: '0',
                background: 'rgba(10, 5, 0, 0.72)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '9999'
            });

            const panel = document.createElement('div');
            Object.assign(panel.style, {
                width: 'min(420px, 86vw)',
                background: 'linear-gradient(160deg, rgba(40,30,5,0.97), rgba(20,15,2,0.97))',
                border: '3px solid #FFD700',
                borderRadius: '18px',
                padding: '28px 24px',
                color: '#FFF8DC',
                fontFamily: "'Press Start 2P', cursive, monospace",
                textAlign: 'center'
            });

            const coinIcon = document.createElement('div');
            coinIcon.textContent = '🪙';
            Object.assign(coinIcon.style, { fontSize: '36px', marginBottom: '14px' });

            const title = document.createElement('div');
            title.textContent = 'COIN QUEST';
            Object.assign(title.style, {
                fontSize: '14px',
                color: '#FFD700',
                textShadow: '0 0 12px rgba(255,215,0,0.8)',
                marginBottom: '14px',
                letterSpacing: '2px'
            });

            const msg = document.createElement('div');
            msg.textContent = 'Collect all the coins to make Kirby appear!';
            Object.assign(msg.style, {
                fontSize: '10px',
                lineHeight: '1.9',
                color: '#FFF8DC',
                marginBottom: '22px'
            });

            const btn = document.createElement('button');
            btn.textContent = "Let's Go!";
            Object.assign(btn.style, {
                padding: '12px 22px',
                borderRadius: '10px',
                border: '2px solid #FFD700',
                fontFamily: "'Press Start 2P', cursive, monospace",
                fontSize: '10px',
                background: 'linear-gradient(90deg, #FFD700, #FFA500)',
                color: '#1a0f00',
                cursor: 'pointer',
                letterSpacing: '1px'
            });
            btn.onclick = () => overlay.remove();

            panel.appendChild(coinIcon);
            panel.appendChild(title);
            panel.appendChild(msg);
            panel.appendChild(btn);
            overlay.appendChild(panel);
            document.body.appendChild(overlay);
        };

        const dbarrier_1 = {
            id: 'dbarrier_1', x: 232, y: 218, width: 83, height: 78, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        const dbarrier_2 = {
            id: 'dbarrier_2', x: 72, y: 96, width: 62, height: 43, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        const dbarrier_3 = {
            id: 'dbarrier_3', x: 261, y: 62, width: 143, height: 22, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        const dbarrier_4 = {
            id: 'dbarrier_4', x: 411, y: 44, width: 112, height: 47, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        const dbarrier_5 = {
            id: 'dbarrier_5', x: 535, y: 67, width: 10, height: 16, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        const dbarrier_6 = {
            id: 'dbarrier_6', x: 331, y: 355, width: 22, height: 10, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        const dbarrier_7 = {
            id: 'dbarrier_7', x: 388, y: 310, width: 16, height: 16, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        const dbarrier_8 = {
            id: 'dbarrier_8', x: 397, y: 353, width: 16, height: 6, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        this.classes = [
            { class: GameEnvBackground, data: bgData },
            { class: Player, data: playerData },
            { class: Barrier, data: dbarrier_1 },
            { class: Barrier, data: dbarrier_2 },
            { class: Barrier, data: dbarrier_3 },
            { class: Barrier, data: dbarrier_4 },
            { class: Barrier, data: dbarrier_5 },
            { class: Barrier, data: dbarrier_6 },
            { class: Barrier, data: dbarrier_7 },
            { class: Barrier, data: dbarrier_8 }
        ];

        // Show opening message immediately
        showOpeningMessage();

        // Spawn coins once the level loads
        setTimeout(() => spawnCoins(), 100);
    }
}

export default GameLevelSeek;