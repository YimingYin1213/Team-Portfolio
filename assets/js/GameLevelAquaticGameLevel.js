// Adventure Game Custom Level
// Exported from GameBuilder on 2026-03-07T07:02:58.561Z
// How to use this file:
// 1) Save as assets/js/GameEnginev1/GameLevelAquaticGameLevel.js in your repo.
// 2) Reference it in your runner or level selector. Examples:
//    import GameLevelPlanets from '/Team-Portfolio/assets/js/GameEnginev1/GameLevelPlanets.js';
//    import GameLevelAquaticGameLevel from '/Team-Portfolio/assets/js/GameEnginev1/GameLevelAquaticGameLevel.js';
//    export const gameLevelClasses = [GameLevelPlanets, GameLevelAquaticGameLevel];
//    // or pass it directly to your GameControl as the only level.
// 3) Ensure images exist and paths resolve via 'path' provided by the engine.
// 4) You can add more objects to this.classes inside the constructor.

import GameEnvBackground from './GameEnginev1/essentials/GameEnvBackground.js';
import Player from './GameEnginev1/essentials/Player.js';
import Npc from './GameEnginev1/essentials/Npc.js';
import Barrier from './GameEnginev1/essentials/Barrier.js';
import Collectible from './GameEnginev1/essentials/Collectible.js';

class GameLevelAquaticGameLevel {
    constructor(gameEnv) {
        this.gameEnv = gameEnv;
        this._leaderboardPanel = null;
        this._leaderboardList = null;
        this._refreshLeaderboard = null;
        this._cleanupFns = [];
        const path = gameEnv.path;
        const width = gameEnv.innerWidth;
        const height = gameEnv.innerHeight;

        const bgData = {
            name: "custom_bg",
            src: path + "/images/gamebuilder/bg/Aquatic.png",
            pixels: { height: 1960, width: 2940 }
        };

        const playerData = {
            id: 'playerData',
            src: path + "/images/gamebuilder/sprites/scubadiver.png",
            SCALE_FACTOR: 5,
            STEP_FACTOR: 1000,
            ANIMATION_RATE: 50,
            // Start near the mermaid with no walls between
            INIT_POSITION: { x: 180, y: 300 },
            pixels: { height: 948, width: 632 },
            orientation: { rows: 4, columns: 3 },
            down: { row: 0, start: 0, columns: 3 },
            downRight: { row: 1, start: 0, columns: 3, rotate: Math.PI / 16 },
            downLeft: { row: 0, start: 0, columns: 3, rotate: -Math.PI / 16 },
            left: { row: 2, start: 0, columns: 3 },
            right: { row: 1, start: 0, columns: 3 },
            up: { row: 3, start: 0, columns: 3 },
            upLeft: { row: 2, start: 0, columns: 3, rotate: Math.PI / 16 },
            upRight: { row: 3, start: 0, columns: 3, rotate: -Math.PI / 16 },
            hitbox: { widthPercentage: 0, heightPercentage: 0 },
            keypress: { up: 87, left: 65, down: 83, right: 68 }
        };

        const slimeNpc = {
            id: 'Random Slime',
            greeting: '^$%#^@&!^# (Slime Language) Did I see a human?',
            src: path + "/images/gamebuilder/sprites/slime.png",
            SCALE_FACTOR: 8,
            ANIMATION_RATE: 50,
            INIT_POSITION: { x: 800, y: 128 },
            pixels: { height: 225, width: 225 },
            orientation: { rows: 4, columns: 4 },
            down: { row: 0, start: 0, columns: 3 },
            right: { row: Math.min(1, 4 - 1), start: 0, columns: 3 },
            left: { row: Math.min(2, 4 - 1), start: 0, columns: 3 },
            up: { row: Math.min(3, 4 - 1), start: 0, columns: 3 },
            upRight: { row: Math.min(3, 4 - 1), start: 0, columns: 3 },
            downRight: { row: Math.min(1, 4 - 1), start: 0, columns: 3 },
            upLeft: { row: Math.min(2, 4 - 1), start: 0, columns: 3 },
            downLeft: { row: 0, start: 0, columns: 3 },
            hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },
            dialogues: ['^$%#^@&!^# (Slime Language) Did I see a human?'],
            reaction: function() { if (this.dialogueSystem) { this.showReactionDialogue(); } else { console.log(this.greeting); } },
            interact: function() {
                if (this.dialogueSystem) {
                    this.showReactionDialogue();
                }
            }
        };

        const questState = {
            accepted: false,
            started: false,
            starfishTotal: 8,
            collected: 0
        };

        const createPixelStarfish = (primary, shadow) => {
            const size = 11;
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

            // Simple pixel starfish pattern
            const pattern = [
                [5,0],
                [4,1],[5,1],[6,1],
                [4,2],[5,2],[6,2],
                [3,3],[4,3],[5,3],[6,3],[7,3],
                [2,4],[3,4],[4,4],[6,4],[7,4],[8,4],
                [1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],
                [2,6],[3,6],[4,6],[6,6],[7,6],[8,6],
                [3,7],[4,7],[5,7],[6,7],[7,7],
                [4,8],[5,8],[6,8],
                [5,9],
                [5,10]
            ];

            pattern.forEach(([x, y]) => p(x, y, primary));
            // Add shadow pixels for texture
            [[5,4],[4,5],[6,5],[5,6],[5,7]].forEach(([x, y]) => p(x, y, shadow));

            const scaled = document.createElement('canvas');
            scaled.width = size * scale;
            scaled.height = size * scale;
            const sctx = scaled.getContext('2d');
            sctx.imageSmoothingEnabled = false;
            sctx.drawImage(canvas, 0, 0, scaled.width, scaled.height);
            return scaled.toDataURL();
        };

        const starfishSprites = [
            createPixelStarfish('#ffb347', '#e07b39'),
            createPixelStarfish('#ff7aa2', '#d85b7e'),
            createPixelStarfish('#ffd56a', '#d6a64f'),
            createPixelStarfish('#7bdff2', '#4fb6cc')
        ];

        const spawnStarfish = () => {
            if (questState.started) return;
            questState.started = true;

            const positions = [];
            const count = questState.starfishTotal;
            const padding = 90;
            const minDist = 80;

            const maxX = Math.max(padding + 1, width - padding);
            const maxY = Math.max(padding + 1, height - padding);

            let attempts = 0;
            while (positions.length < count && attempts < 500) {
                attempts += 1;
                const x = Math.floor(Math.random() * (maxX - padding) + padding);
                const y = Math.floor(Math.random() * (maxY - padding) + padding);

                const tooClose = positions.some(p => Math.hypot(p.x - x, p.y - y) < minDist);
                if (!tooClose) positions.push({ x, y });
            }

            positions.forEach((pos, i) => {
                const starfishData = {
                    id: `starfish_${i}`,
                    src: starfishSprites[i % starfishSprites.length],
                    SCALE_FACTOR: 20,
                    STEP_FACTOR: 0,
                    ANIMATION_RATE: 1,
                    INIT_POSITION: { x: pos.x, y: pos.y },
                    pixels: { height: 33, width: 33 },
                    orientation: { rows: 1, columns: 1 },
                    hitbox: { widthPercentage: 0.4, heightPercentage: 0.4 },
                    greeting: 'Starfish collected!',
                    dialogues: ['Starfish collected!'],
                    // prevent automatic collision reaction popups
                    reaction: function() {},
                    showReactionDialogue: function() {
                        if (typeof this.showItemMessage === 'function') {
                            this.showItemMessage();
                        }
                    },
                    interact: function() {
                        questState.collected += 1;
                        this.destroy();
                    }
                };

                const starfish = new Collectible(starfishData, gameEnv);
                // Ensure collision reaction won't throw even if GameObject.js is cached
                starfish.showReactionDialogue = function() {
                    if (typeof this.showItemMessage === 'function') {
                        this.showItemMessage();
                    }
                };
                gameEnv.gameObjects.push(starfish);
            });
        };

        const showQuestWindow = () => {
            const existing = document.getElementById('aquatic-quest-window');
            if (existing) existing.remove();

            const overlay = document.createElement('div');
            overlay.id = 'aquatic-quest-window';
            Object.assign(overlay.style, {
                position: 'fixed',
                inset: '0',
                background: 'rgba(2, 10, 25, 0.65)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '9999'
            });

            const panel = document.createElement('div');
            Object.assign(panel.style, {
                width: 'min(520px, 90vw)',
                background: 'linear-gradient(180deg, rgba(9,50,80,0.95), rgba(4,20,40,0.95))',
                border: '2px solid rgba(130, 220, 255, 0.8)',
                borderRadius: '18px',
                padding: '24px',
                color: '#e6fbff',
                fontFamily: "'Press Start 2P', cursive, monospace",
                boxShadow: '0 0 30px rgba(80, 200, 255, 0.35)'
            });

            const title = document.createElement('div');
            title.textContent = 'Aquatic Quest';
            Object.assign(title.style, {
                fontSize: '18px',
                marginBottom: '12px',
                color: '#7de2ff',
                textShadow: '0 0 12px rgba(125, 226, 255, 0.7)'
            });

            const body = document.createElement('div');
            body.textContent = 'Collect all the lost starfishes scattered across the sea floor.';
            Object.assign(body.style, {
                fontSize: '12px',
                lineHeight: '1.6',
                marginBottom: '18px'
            });

            const detail = document.createElement('div');
            detail.textContent = `Starfishes to collect: ${questState.starfishTotal}`;
            Object.assign(detail.style, {
                fontSize: '11px',
                color: '#b9f0ff',
                marginBottom: '20px'
            });

            const confirm = document.createElement('button');
            confirm.textContent = 'Confirm';
            Object.assign(confirm.style, {
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                fontFamily: "'Press Start 2P', cursive, monospace",
                fontSize: '12px',
                background: 'linear-gradient(90deg, #35b9ff, #5cf0ff)',
                color: '#032030',
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(53, 185, 255, 0.4)'
            });

            confirm.onclick = () => {
                overlay.remove();
                spawnStarfish();
            };

            panel.appendChild(title);
            panel.appendChild(body);
            panel.appendChild(detail);
            panel.appendChild(confirm);
            overlay.appendChild(panel);
            document.body.appendChild(overlay);
        };

        const mermaidNpc = {
            id: 'Mermaid',
            greeting: "I've lost all my starfishes would you like to collect them for me?",
            // Mermaid spritesheet
            src: path + "/images/gamebuilder/sprites/Mermaid Spritesheet.png",
            SCALE_FACTOR: 6,
            ANIMATION_RATE: 50,
            INIT_POSITION: { x: 520, y: 320 },
            pixels: { height: 948, width: 632 },
            orientation: { rows: 3, columns: 3 },
            down: { row: 0, start: 0, columns: 3 },
            right: { row: 0, start: 0, columns: 3 },
            left: { row: 0, start: 0, columns: 3 },
            up: { row: 0, start: 0, columns: 3 },
            upRight: { row: 0, start: 0, columns: 3 },
            downRight: { row: 0, start: 0, columns: 3 },
            upLeft: { row: 0, start: 0, columns: 3 },
            downLeft: { row: 0, start: 0, columns: 3 },
            hitbox: { widthPercentage: 0.12, heightPercentage: 0.2 },
            dialogues: ["I've lost all my starfishes would you like to collect them for me?"],
            // prevent automatic collision reaction; only interact with E
            reaction: function() {},
            interact: function() {
                if (!this.dialogueSystem) return;
                if (questState.accepted) {
                    if (questState.collected >= questState.starfishTotal) {
                        this.dialogueSystem.showDialogue(
                            "Thank you for finding them all! Our waters are safe again.",
                            'Mermaid',
                            this.spriteData?.src || null
                        );
                        // End level after gratitude message
                        setTimeout(() => {
                            const gameControl = this.gameEnv?.gameControl;
                            if (gameControl?.currentLevel) {
                                gameControl.currentLevel.continue = false;
                            }
                        }, 500);
                        return;
                    }
                    this.dialogueSystem.showDialogue('Please collect the starfishes scattered around the reef.', 'Mermaid', this.spriteData?.src || null);
                    return;
                }

                this.dialogueSystem.showDialogue(
                    "I've lost all my starfishes would you like to collect them for me?",
                    'Mermaid',
                    this.spriteData?.src || null
                );

                this.dialogueSystem.addButtons([
                    {
                        text: 'Accept',
                        primary: true,
                        action: () => {
                            questState.accepted = true;
                            this.dialogueSystem.closeDialogue();
                            showQuestWindow();
                        }
                    },
                    {
                        text: 'Decline',
                        action: () => {
                            this.dialogueSystem.closeDialogue();
                        }
                    }
                ]);
            }
        };

        // Collision walls adjusted so all starfish are reachable
        const dbarrier_1 = {
            id: 'dbarrier_1', x: 0, y: 0, width: 0, height: 0, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        const dbarrier_2 = {
            id: 'dbarrier_2', x: 0, y: 0, width: 0, height: 0, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        const dbarrier_3 = {
            id: 'dbarrier_3', x: 0, y: 0, width: 0, height: 0, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        this.classes = [
            { class: GameEnvBackground, data: bgData },
            { class: Player, data: playerData },
            { class: Npc, data: mermaidNpc },
            { class: Npc, data: slimeNpc },
            { class: Barrier, data: dbarrier_1 },
            { class: Barrier, data: dbarrier_2 },
            { class: Barrier, data: dbarrier_3 }
        ];
    }

    initialize() {
        this._mountRandomLeaderboard();

        const mermaid = this.gameEnv?.gameObjects?.find(
            obj => obj?.spriteData?.id === 'Mermaid'
        );
        if (!mermaid) return;

        mermaid.setupCanvas = function() {
            const pixels = this.spriteData?.pixels || { width: this.canvas.width, height: this.canvas.height };
            const orientation = this.spriteData?.orientation || { rows: 1, columns: 1 };
            const frameW = Math.max(1, Math.round(pixels.width / orientation.columns));
            const frameH = Math.max(1, Math.round(pixels.height / orientation.rows));
            const aspect = frameW / frameH;

            // Preserve sprite aspect ratio instead of forcing a square
            const baseSize = this.size;
            const width = baseSize * aspect;
            const height = baseSize;

            this.canvas.style.width = `${width}px`;
            this.canvas.style.height = `${height}px`;
            this.canvas.style.position = 'absolute';
            this.canvas.style.left = `${this.position.x}px`;
            this.canvas.style.top = `${this.gameEnv.top + this.position.y}px`;
            this.canvas.style.zIndex = (this.data && this.data.zIndex !== undefined) ? this.data.zIndex : "10";
        };
    }

    _buildRandomLeaderboardData() {
        const names = ['Yiming', 'Kai', 'Arjun', 'Lance', 'Mia', 'Rhea', 'Noah', 'Ava'];
        const titles = ['Star Collector', 'Reef Runner', 'Bubble Scout', 'Ocean Explorer'];

        return names
            .map((name, index) => ({
                name,
                title: titles[index % titles.length],
                score: Math.floor(Math.random() * 250) + 50,
                time: (Math.random() * 90 + 20).toFixed(1)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 5);
    }

    _renderLeaderboardEntries(entries) {
        if (!this._leaderboardList) return;

        this._leaderboardList.innerHTML = '';

        entries.forEach((entry, index) => {
            const row = document.createElement('div');
            Object.assign(row.style, {
                display: 'grid',
                gridTemplateColumns: '34px 1fr auto',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 10px',
                borderRadius: '10px',
                background: index === 0
                    ? 'rgba(255, 215, 64, 0.18)'
                    : 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(125, 226, 255, 0.12)'
            });

            const rank = document.createElement('div');
            rank.textContent = `#${index + 1}`;
            Object.assign(rank.style, {
                color: index === 0 ? '#ffe082' : '#7de2ff',
                fontWeight: '700'
            });

            const details = document.createElement('div');
            details.innerHTML = `<strong>${entry.name}</strong><div style="font-size:11px; color:#b9f0ff; margin-top:2px;">${entry.title}</div>`;

            const stats = document.createElement('div');
            stats.innerHTML = `<strong>${entry.score}</strong><div style="font-size:11px; color:#d8fbff; margin-top:2px; text-align:right;">${entry.time}s</div>`;

            row.appendChild(rank);
            row.appendChild(details);
            row.appendChild(stats);
            this._leaderboardList.appendChild(row);
        });
    }

    _mountRandomLeaderboard() {
        const container = this.gameEnv?.gameContainer;
        if (!container) return;

        const existing = container.querySelector('.aquatic-random-leaderboard');
        if (existing) existing.remove();

        const panel = document.createElement('div');
        panel.className = 'aquatic-random-leaderboard';
        Object.assign(panel.style, {
            position: 'absolute',
            top: '18px',
            right: '18px',
            width: 'min(260px, 32vw)',
            minWidth: '220px',
            padding: '14px',
            borderRadius: '16px',
            background: 'linear-gradient(180deg, rgba(5, 26, 44, 0.92), rgba(2, 11, 28, 0.92))',
            border: '1px solid rgba(125, 226, 255, 0.28)',
            boxShadow: '0 14px 30px rgba(0, 0, 0, 0.3)',
            color: '#e6fbff',
            fontFamily: 'Inter, "Segoe UI", sans-serif',
            zIndex: '25'
        });

        const title = document.createElement('div');
        title.textContent = 'Random Ocean Leaderboard';
        Object.assign(title.style, {
            fontSize: '15px',
            fontWeight: '700',
            color: '#7de2ff',
            marginBottom: '4px'
        });

        const subtitle = document.createElement('div');
        subtitle.textContent = 'Mock scores for class demos';
        Object.assign(subtitle.style, {
            fontSize: '11px',
            color: '#b9f0ff',
            marginBottom: '12px'
        });

        const list = document.createElement('div');
        Object.assign(list.style, {
            display: 'grid',
            gap: '8px'
        });

        const refreshButton = document.createElement('button');
        refreshButton.textContent = 'Refresh Scores';
        Object.assign(refreshButton.style, {
            marginTop: '12px',
            width: '100%',
            padding: '10px 12px',
            borderRadius: '10px',
            border: 'none',
            background: 'linear-gradient(90deg, #35b9ff, #5cf0ff)',
            color: '#032030',
            fontWeight: '700',
            cursor: 'pointer',
            pointerEvents: 'auto'
        });

        container.style.position = 'relative';

        this._leaderboardPanel = panel;
        this._leaderboardList = list;
        this._refreshLeaderboard = () => this._renderLeaderboardEntries(this._buildRandomLeaderboardData());

        refreshButton.addEventListener('click', this._refreshLeaderboard);
        this._cleanupFns.push(() => refreshButton.removeEventListener('click', this._refreshLeaderboard));

        this._renderLeaderboardEntries(this._buildRandomLeaderboardData());

        panel.appendChild(title);
        panel.appendChild(subtitle);
        panel.appendChild(list);
        panel.appendChild(refreshButton);
        container.appendChild(panel);
    }

    destroy() {
        this._cleanupFns.forEach(fn => fn());
        this._cleanupFns = [];

        if (this._leaderboardPanel) {
            this._leaderboardPanel.remove();
            this._leaderboardPanel = null;
            this._leaderboardList = null;
            this._refreshLeaderboard = null;
        }
    }

}

export default GameLevelAquaticGameLevel;
