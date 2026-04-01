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
            greeting: "I've been living under the sea for thousands of years, do you wonder why?",
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
            dialogues: ["I've been living under the sea for thousands of years, do you wonder why?"],
            reaction: function() {},
            interact: function() {
                if (!this.dialogueSystem) return;
                const q1 = questState.firstQuest;
                const q2 = questState.secondQuest;

                if (q2.pendingSlimeCompletion) {
                    this.dialogueSystem.showDialogue(
                        "You've saved the ocean, you may go onto the lands now!",
                        'Slime',
                        null
                    );
                    clearDialogueActionButtons(this.dialogueSystem);
                    this.dialogueSystem.addButtons([
                        {
                            text: 'Complete Level',
                            primary: true,
                            action: () => {
                                q2.pendingSlimeCompletion = false;
                                updateQuestHud();
                                const gameControl = this.gameEnv?.gameControl;
                                const level = gameControl?.currentLevel;
                                if (level) {
                                    level.levelCompleted = true;
                                    level.continue = false;
                                }
                            }
                        },
                        {
                            text: 'Close',
                            action: () => this.dialogueSystem.closeDialogue()
                        }
                    ]);
                    return;
                }

                if (q1.completed && !q2.accepted) {
                    this.dialogueSystem.showDialogue(
                        'The upper sea is full of plastics and drifting garbage. Will you take Aquatic Quest #2 and clean it?',
                        'Slime',
                        null
                    );
                    clearDialogueActionButtons(this.dialogueSystem);
                    this.dialogueSystem.addButtons([
                        {
                            text: 'Accept Quest #2',
                            primary: true,
                            action: async () => {
                                q2.offered = true;
                                q2.accepted = true;
                                q2.collected = 0;
                                this.dialogueSystem.closeDialogue();
                                updateQuestHud();
                                await transitionToSurface();
                            }
                        },
                        {
                            text: 'Later',
                            action: () => this.dialogueSystem.closeDialogue()
                        }
                    ]);
                    return;
                }

                if (q2.accepted && q2.inSurface) {
                    this.dialogueSystem.showDialogue(
                        'Keep collecting every piece of floating trash above the water!',
                        'Slime',
                        null
                    );
                    return;
                }

                if (q2.accepted && !q2.completed) {
                    this.dialogueSystem.showDialogue(
                        'The surface still needs cleaning. Finish removing every trash item.',
                        'Slime',
                        null
                    );
                    return;
                }

                const showStoryStep = (step) => {
                    if (step === 0) {
                        this.dialogueSystem.showDialogue(
                            'Before the modern human society, the ocean remained peace and clean, but then, everything has shifted.',
                            'Slime',
                            null
                        );
                        clearDialogueActionButtons(this.dialogueSystem);
                        this.dialogueSystem.addButtons([
                            {
                                text: 'Continue',
                                primary: true,
                                action: () => showStoryStep(1)
                            }
                        ]);
                        return;
                    }

                    if (step === 1) {
                        this.dialogueSystem.showDialogue(
                            "countless plastics, useless metals, were thrown into the ocean. I've been consuming them to protect this part of the ocean.",
                            'Slime',
                            null
                        );
                        clearDialogueActionButtons(this.dialogueSystem);
                        this.dialogueSystem.addButtons([
                            {
                                text: 'Continue',
                                primary: true,
                                action: () => showStoryStep(2)
                            }
                        ]);
                        return;
                    }

                    this.dialogueSystem.showDialogue(
                        'Please protect the ocean :(',
                        'Slime',
                        null
                    );
                    clearDialogueActionButtons(this.dialogueSystem);
                    this.dialogueSystem.addButtons([
                        {
                            text: 'Close',
                            primary: true,
                            action: () => this.dialogueSystem.closeDialogue()
                        }
                    ]);
                };

                this.dialogueSystem.showDialogue(
                    "I've been living under the sea for thousands of years, do you wonder why?",
                    'Slime',
                    null
                );
                clearDialogueActionButtons(this.dialogueSystem);

                this.dialogueSystem.addButtons([
                    {
                        text: 'Yes',
                        primary: true,
                        action: () => showStoryStep(0)
                    },
                    {
                        text: 'No',
                        action: () => this.dialogueSystem.closeDialogue()
                    }
                ]);
            }
        };

        const questState = {
            firstQuest: {
                accepted: false,
                started: false,
                completed: false,
                starfishTotal: 8,
                collected: 0
            },
            secondQuest: {
                offered: false,
                accepted: false,
                started: false,
                inSurface: false,
                returning: false,
                completed: false,
                pendingSlimeCompletion: false,
                trashTotal: 12,
                collected: 0
            }
        };

        this.questState = questState;
        this.levelCompleted = false;
        this.playerLock = false;
        this.surfaceTrashIds = [];

        const getPlayer = () => this.gameEnv?.gameObjects?.find(
            obj => obj?.spriteData?.id === 'playerData'
        );

        const clearDialogueActionButtons = (dialogueSystem) => {
            if (!dialogueSystem?.dialogueBox) return;

            const dialogueBox = dialogueSystem.dialogueBox;
            const avatarElement = document.getElementById(`dialogue-avatar-${dialogueSystem.id}`);
            const buttonContainers = dialogueBox.querySelectorAll('div[style*="display: flex"]');

            buttonContainers.forEach((container) => {
                if (avatarElement && container.contains(avatarElement)) return;
                container.remove();
            });
        };

        const updateQuestHud = () => {
            const hud = document.getElementById('aquatic-quest-hud');
            if (!hud) return;

            const title = document.getElementById('aquatic-quest-hud-title');
            const progress = document.getElementById('aquatic-quest-hud-progress');
            const status = document.getElementById('aquatic-quest-hud-status');

            const q1 = questState.firstQuest;
            const q2 = questState.secondQuest;

            if (!q1.accepted) {
                title.textContent = 'Leaderboard';
                progress.textContent = 'Starfish: 0 / ' + q1.starfishTotal;
                status.textContent = 'Talk to Mermaid to begin.';
                return;
            }

            if (!q1.completed) {
                title.textContent = 'Leaderboard';
                progress.textContent = 'Starfish: ' + q1.collected + ' / ' + q1.starfishTotal;
                status.textContent = q1.collected >= q1.starfishTotal
                    ? 'Return to Mermaid for turn-in.'
                    : 'Quest #1: Collect all starfishes.';
                return;
            }

            if (!q2.accepted) {
                title.textContent = 'Leaderboard';
                progress.textContent = 'Starfish: ' + q1.collected + ' / ' + q1.starfishTotal;
                status.textContent = 'Quest #1 complete. Talk to Slime for quest #2.';
                return;
            }

            title.textContent = 'Ocean Recovery Tracker';
            progress.textContent = 'Trash Removed: ' + q2.collected + ' / ' + q2.trashTotal;
            status.textContent = q2.pendingSlimeCompletion
                ? 'Return to Slime to finish level.'
                : (q2.inSurface ? 'Quest #2 active above water.' : 'Quest #2 in progress.');
        };

        const ensureQuestHud = () => {
            const existing = document.getElementById('aquatic-quest-hud');
            if (existing) {
                updateQuestHud();
                return;
            }

            const hud = document.createElement('div');
            hud.id = 'aquatic-quest-hud';
            Object.assign(hud.style, {
                position: 'fixed',
                top: '14px',
                left: '14px',
                zIndex: '10020',
                minWidth: '290px',
                maxWidth: 'min(92vw, 420px)',
                padding: '14px 16px',
                borderRadius: '14px',
                color: '#e9fbff',
                fontFamily: "'Press Start 2P', cursive, monospace",
                background: 'linear-gradient(160deg, rgba(8, 45, 72, 0.92), rgba(3, 16, 34, 0.92))',
                border: '2px solid rgba(126, 219, 255, 0.72)',
                boxShadow: '0 8px 24px rgba(16, 132, 181, 0.38)'
            });

            const title = document.createElement('div');
            title.id = 'aquatic-quest-hud-title';
            Object.assign(title.style, {
                fontSize: '11px',
                color: '#86e6ff',
                marginBottom: '8px'
            });

            const progress = document.createElement('div');
            progress.id = 'aquatic-quest-hud-progress';
            Object.assign(progress.style, {
                fontSize: '12px',
                marginBottom: '8px',
                lineHeight: '1.4'
            });

            const status = document.createElement('div');
            status.id = 'aquatic-quest-hud-status';
            Object.assign(status.style, {
                fontSize: '10px',
                color: '#b8f2ff',
                lineHeight: '1.5'
            });

            hud.appendChild(title);
            hud.appendChild(progress);
            hud.appendChild(status);
            document.body.appendChild(hud);

            updateQuestHud();
        };

        const setBackground = (src) => {
            const backgroundObject = this.gameEnv?.gameObjects?.find(
                obj => obj?.constructor?.name === 'GameEnvBackground'
            );
            if (!backgroundObject) return;

            if (!backgroundObject.image) backgroundObject.image = new Image();
            backgroundObject.image.src = src;
        };

        const transitionOverlay = (label) => {
            const existing = document.getElementById('aquatic-transition-overlay');
            if (existing) existing.remove();

            const overlay = document.createElement('div');
            overlay.id = 'aquatic-transition-overlay';
            Object.assign(overlay.style, {
                position: 'fixed',
                inset: '0',
                background: 'radial-gradient(circle at center, rgba(167, 241, 255, 0.18), rgba(1, 8, 18, 0.88))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '10030',
                opacity: '0',
                transition: 'opacity 320ms ease'
            });

            const text = document.createElement('div');
            text.textContent = label;
            Object.assign(text.style, {
                color: '#cbf6ff',
                fontFamily: "'Press Start 2P', cursive, monospace",
                fontSize: '12px',
                textAlign: 'center',
                textShadow: '0 0 10px rgba(148, 245, 255, 0.9)'
            });

            overlay.appendChild(text);
            document.body.appendChild(overlay);

            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
            });

            return overlay;
        };

        const animatePlayerSwim = (targetY) => {
            const player = getPlayer();
            if (!player) return Promise.resolve();

            this.playerLock = true;
            player.velocity.x = 0;
            player.velocity.y = 0;
            player.pressedKeys = {};
            player.direction = targetY < player.position.y ? 'up' : 'down';

            return new Promise((resolve) => {
                const step = () => {
                    const current = player.position.y;
                    const delta = targetY - current;
                    if (Math.abs(delta) <= 2) {
                        player.position.y = targetY;
                        resolve();
                        return;
                    }

                    player.position.y += Math.sign(delta) * 5;
                    requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            });
        };

        const createDetailedTrashSprites = () => {
            const makeCanvas = () => {
                const c = document.createElement('canvas');
                c.width = 72;
                c.height = 72;
                return c;
            };

            const toDataUrl = (drawFn) => {
                const c = makeCanvas();
                const ctx = c.getContext('2d');
                drawFn(ctx, c.width, c.height);
                return c.toDataURL();
            };

            const bottle = toDataUrl((ctx, w, h) => {
                ctx.clearRect(0, 0, w, h);
                ctx.fillStyle = 'rgba(207, 240, 252, 0.88)';
                ctx.strokeStyle = 'rgba(120, 189, 216, 0.95)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(24, 14, 22, 10, 3);
                ctx.fill();
                ctx.stroke();
                ctx.beginPath();
                ctx.roundRect(20, 22, 30, 34, 7);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = 'rgba(56, 150, 210, 0.85)';
                ctx.fillRect(23, 35, 24, 8);
                ctx.fillStyle = 'rgba(235, 249, 255, 0.4)';
                ctx.fillRect(24, 25, 5, 24);
            });

            const can = toDataUrl((ctx, w, h) => {
                ctx.clearRect(0, 0, w, h);
                const grd = ctx.createLinearGradient(0, 20, 0, 58);
                grd.addColorStop(0, '#cfd7de');
                grd.addColorStop(0.5, '#9ca8b1');
                grd.addColorStop(1, '#7d8a95');
                ctx.fillStyle = grd;
                ctx.strokeStyle = '#5c6872';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(18, 18, 36, 38, 8);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#dce3e8';
                ctx.beginPath();
                ctx.ellipse(36, 18, 18, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#f15b5b';
                ctx.fillRect(22, 30, 28, 10);
                ctx.fillStyle = '#fff';
                ctx.fillRect(24, 33, 24, 2);
            });

            const bag = toDataUrl((ctx, w, h) => {
                ctx.clearRect(0, 0, w, h);
                ctx.fillStyle = 'rgba(245, 245, 245, 0.85)';
                ctx.strokeStyle = 'rgba(146, 164, 176, 0.95)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(18, 22);
                ctx.quadraticCurveTo(16, 9, 28, 11);
                ctx.quadraticCurveTo(36, 15, 44, 11);
                ctx.quadraticCurveTo(56, 9, 54, 22);
                ctx.lineTo(50, 54);
                ctx.quadraticCurveTo(36, 62, 22, 54);
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = 'rgba(99, 124, 142, 0.35)';
                ctx.fillRect(24, 32, 24, 12);
            });

            const sixPackRing = toDataUrl((ctx, w, h) => {
                ctx.clearRect(0, 0, w, h);
                ctx.strokeStyle = 'rgba(245, 240, 225, 0.95)';
                ctx.lineWidth = 4;
                const centers = [
                    [24, 25], [36, 25], [48, 25],
                    [24, 39], [36, 39], [48, 39]
                ];
                centers.forEach(([x, y]) => {
                    ctx.beginPath();
                    ctx.arc(x, y, 8, 0, Math.PI * 2);
                    ctx.stroke();
                });
            });

            const carton = toDataUrl((ctx, w, h) => {
                ctx.clearRect(0, 0, w, h);
                ctx.fillStyle = '#d6a066';
                ctx.strokeStyle = '#8e6338';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(19, 18, 34, 36, 4);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle = '#be7f41';
                ctx.fillRect(19, 32, 34, 8);
                ctx.fillStyle = '#f4d7b6';
                ctx.fillRect(23, 23, 12, 6);
                ctx.fillRect(37, 23, 12, 6);
            });

            return [bottle, can, bag, sixPackRing, carton];
        };

        const trashSprites = createDetailedTrashSprites();

        const setWorldNpcVisibility = (visible) => {
            const ids = ['Mermaid', 'Random Slime', 'Shark'];
            (this.gameEnv?.gameObjects || []).forEach((obj) => {
                if (!obj?.spriteData?.id || !ids.includes(obj.spriteData.id) || !obj.canvas) return;
                obj.canvas.style.display = visible ? 'block' : 'none';
            });
        };

        const spawnSurfaceTrash = () => {
            if (questState.secondQuest.inSurface === false) return;

            const padding = 80;
            const positions = [];
            const count = questState.secondQuest.trashTotal;
            const maxX = Math.max(padding + 1, width - padding);
            const maxY = Math.max(100, height - 90);
            let attempts = 0;

            while (positions.length < count && attempts < 600) {
                attempts += 1;
                const x = Math.floor(Math.random() * (maxX - padding) + padding);
                const y = Math.floor(Math.random() * (maxY - 90) + 90);
                const tooClose = positions.some((p) => Math.hypot(p.x - x, p.y - y) < 64);
                if (!tooClose) positions.push({ x, y });
            }

            positions.forEach((pos, i) => {
                const trashData = {
                    id: `surface_trash_${i}`,
                    src: trashSprites[i % trashSprites.length],
                    SCALE_FACTOR: 18,
                    STEP_FACTOR: 0,
                    ANIMATION_RATE: 1,
                    INIT_POSITION: { x: pos.x, y: pos.y },
                    pixels: { height: 72, width: 72 },
                    orientation: { rows: 1, columns: 1 },
                    hitbox: { widthPercentage: 0.38, heightPercentage: 0.38 },
                    greeting: 'Trash removed from the ocean surface!',
                    dialogues: ['Trash removed from the ocean surface!'],
                    reaction: function() {},
                    showReactionDialogue: function() {
                        if (typeof this.showItemMessage === 'function') {
                            this.showItemMessage();
                        }
                    },
                    interact: function() {
                        if (questState.secondQuest.completed) {
                            this.destroy();
                            return;
                        }
                        questState.secondQuest.collected += 1;
                        updateQuestHud();
                        if (questState.secondQuest.collected >= questState.secondQuest.trashTotal) {
                            transitionBackUnderwater();
                        }
                        this.destroy();
                    }
                };

                const trash = new Collectible(trashData, gameEnv);
                const baseX = pos.x;
                const baseY = pos.y;
                const phase = Math.random() * Math.PI * 2;
                const driftDir = Math.random() > 0.5 ? 1 : -1;
                const driftSpeed = 0.18 + Math.random() * 0.26;
                const bobAmplitude = 4 + Math.random() * 4;
                const rotateAmplitude = 6 + Math.random() * 8;
                const originalUpdate = trash.update.bind(trash);

                trash.update = function() {
                    originalUpdate();

                    const t = performance.now() * 0.0018 + phase;
                    const bob = Math.sin(t * 2.1) * bobAmplitude;
                    const drift = Math.sin(t * 0.55) * 26 * driftDir;
                    const rotation = Math.sin(t * 1.7) * rotateAmplitude;

                    this.position.x = baseX + drift * driftSpeed;
                    this.position.y = baseY + bob;

                    if (this.canvas) {
                        this.canvas.style.transformOrigin = 'center center';
                        this.canvas.style.transform = `rotate(${rotation}deg)`;
                        this.canvas.style.filter = 'drop-shadow(0 6px 4px rgba(0,0,0,0.25))';
                    }
                };

                this.surfaceTrashIds.push(trashData.id);
                gameEnv.gameObjects.push(trash);
            });
        };

        const clearSurfaceTrash = () => {
            this.surfaceTrashIds.forEach((id) => {
                const obj = this.gameEnv?.gameObjects?.find((item) => item?.spriteData?.id === id);
                if (obj?.destroy) obj.destroy();
            });
            this.surfaceTrashIds = [];
        };

        const transitionToSurface = async () => {
            const q2 = questState.secondQuest;
            if (q2.inSurface || q2.returning || q2.completed) return;

            q2.started = true;
            q2.inSurface = true;
            updateQuestHud();

            const overlay = transitionOverlay('Swimming to the surface...');
            await animatePlayerSwim(14);
            setBackground(path + '/images/gamebuilder/bg/Above the water.png');
            setWorldNpcVisibility(false);

            const player = getPlayer();
            if (player) {
                player.position.x = Math.min(this.gameEnv.innerWidth - player.width - 20, Math.max(20, player.position.x));
                player.position.y = Math.max(80, this.gameEnv.innerHeight * 0.32);
            }

            spawnSurfaceTrash();
            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 350);
            }
            this.playerLock = false;
            updateQuestHud();
        };

        const transitionBackUnderwater = async () => {
            const q2 = questState.secondQuest;
            if (!q2.inSurface || q2.returning || q2.completed) return;

            q2.returning = true;
            updateQuestHud();

            const overlay = transitionOverlay('Diving back underwater...');
            await animatePlayerSwim(12);

            setBackground(path + '/images/gamebuilder/bg/Aquatic.png');
            setWorldNpcVisibility(true);
            clearSurfaceTrash();

            const player = getPlayer();
            if (player) {
                player.position.x = 240;
                player.position.y = 60;
            }

            await animatePlayerSwim(300);

            q2.inSurface = false;
            q2.returning = false;
            q2.completed = true;
            q2.pendingSlimeCompletion = true;
            this.playerLock = false;

            if (overlay) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.remove(), 350);
            }

            updateQuestHud();
        };

        this.updateQuestHud = updateQuestHud;
        this.ensureQuestHud = ensureQuestHud;
        this.clearSurfaceTrash = clearSurfaceTrash;

        this.sharkGameOverShown = false;

        this.showSharkGameOver = () => {
            if (this.sharkGameOverShown) return;
            this.sharkGameOverShown = true;

            const existing = document.getElementById('aquatic-shark-gameover');
            if (existing) existing.remove();

            const overlay = document.createElement('div');
            overlay.id = 'aquatic-shark-gameover';
            Object.assign(overlay.style, {
                position: 'fixed',
                inset: '0',
                background: 'rgba(4, 14, 28, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: '10001'
            });

            const panel = document.createElement('div');
            Object.assign(panel.style, {
                width: 'min(520px, 92vw)',
                borderRadius: '16px',
                padding: '24px',
                background: 'linear-gradient(180deg, rgba(8, 46, 74, 0.95), rgba(4, 18, 36, 0.95))',
                border: '2px solid rgba(110, 206, 255, 0.8)',
                boxShadow: '0 0 30px rgba(56, 183, 255, 0.35)',
                color: '#e6fbff',
                fontFamily: "'Press Start 2P', cursive, monospace",
                textAlign: 'center'
            });

            const title = document.createElement('div');
            title.textContent = 'Game Over';
            Object.assign(title.style, {
                fontSize: '18px',
                marginBottom: '14px',
                color: '#7de2ff',
                textShadow: '0 0 12px rgba(125, 226, 255, 0.7)'
            });

            const body = document.createElement('div');
            body.textContent = "You've been eaten by shark. You can replay.";
            Object.assign(body.style, {
                fontSize: '12px',
                lineHeight: '1.6',
                marginBottom: '20px'
            });

            const restart = document.createElement('button');
            restart.textContent = 'Replay';
            Object.assign(restart.style, {
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

            restart.onclick = () => {
                window.location.reload();
            };

            panel.appendChild(title);
            panel.appendChild(body);
            panel.appendChild(restart);
            overlay.appendChild(panel);
            document.body.appendChild(overlay);
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
            const q1 = questState.firstQuest;
            if (q1.started) return;
            q1.started = true;
            updateQuestHud();

            const positions = [];
            const count = q1.starfishTotal;
            const padding = 90;
            const minDist = 80;
            const minNpcDist = 140;
            const npcPositions = [
                mermaidNpc.INIT_POSITION,
                slimeNpc.INIT_POSITION
            ];

            const maxX = Math.max(padding + 1, width - padding);
            const maxY = Math.max(padding + 1, height - padding);

            let attempts = 0;
            while (positions.length < count && attempts < 500) {
                attempts += 1;
                const x = Math.floor(Math.random() * (maxX - padding) + padding);
                const y = Math.floor(Math.random() * (maxY - padding) + padding);

                const tooClose = positions.some(p => Math.hypot(p.x - x, p.y - y) < minDist);
                const tooCloseToNpc = npcPositions.some(npc => Math.hypot(npc.x - x, npc.y - y) < minNpcDist);

                if (!tooClose && !tooCloseToNpc) positions.push({ x, y });
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
                        const q1State = questState.firstQuest;
                        q1State.collected += 1;
                        updateQuestHud();
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

                // Give each starfish a subtle unique wiggle animation
                const baseX = starfishData.INIT_POSITION.x;
                const baseY = starfishData.INIT_POSITION.y;
                const phase = Math.random() * Math.PI * 2;
                const wiggleSpeed = 0.004 + Math.random() * 0.003;
                const bobAmplitude = 5 + Math.random() * 2;
                const rotateAmplitude = 10 + Math.random() * 4;
                const originalUpdate = starfish.update.bind(starfish);

                starfish.update = function() {
                    originalUpdate();

                    const t = performance.now() * wiggleSpeed + phase;
                    const bobOffset = Math.sin(t) * bobAmplitude;
                    const rotation = Math.sin(t * 1.25) * rotateAmplitude;

                    this.position.y = baseY + bobOffset;
                    if (this.canvas) {
                        this.canvas.style.transformOrigin = 'center center';
                        this.canvas.style.transform = `rotate(${rotation}deg)`;
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
            detail.textContent = `Starfishes to collect: ${questState.firstQuest.starfishTotal}`;
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
                updateQuestHud();
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
            greeting: "I've lost all my starfishes. Will you collect them? Be careful, a shark is patrolling these waters!",
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
            // Play row 2 on interaction, lock to a stable frame
            interactAnim: { row: 1, start: 0, columns: 1 },
            hitbox: { widthPercentage: 0.12, heightPercentage: 0.2 },
            dialogues: ["I've lost all my starfishes. Will you collect them? Be careful, a shark is patrolling these waters!"],
            // prevent automatic collision reaction; only interact with E
            reaction: function() {},
            interact: function() {
                if (!this.dialogueSystem) return;
                const q1 = questState.firstQuest;
                const q2 = questState.secondQuest;

                // Trigger second-row animation whenever interaction starts
                this.direction = 'interactAnim';
                this.frameIndex = 0;
                this.frameCounter = 0;
                if (this._interactAnimResetTimeout) {
                    clearTimeout(this._interactAnimResetTimeout);
                }
                this._interactAnimResetTimeout = setTimeout(() => {
                    this.direction = 'down';
                }, 1200);

                if (q1.accepted) {
                    if (q1.collected >= q1.starfishTotal && !q1.completed) {
                        q1.completed = true;
                        updateQuestHud();
                        this.dialogueSystem.showDialogue(
                            "Thank you for finding them all! The lower reef is recovering. Go tell Slime and ask about the next mission.",
                            'Mermaid',
                            null
                        );
                        return;
                    }

                    if (q1.completed && !q2.accepted) {
                        this.dialogueSystem.showDialogue(
                            'I can already feel the water clearing. Slime knows where the next danger is - talk to Slime for Aquatic Quest #2.',
                            'Mermaid',
                            null
                        );
                        return;
                    }

                    if (q2.accepted && !q2.completed) {
                        this.dialogueSystem.showDialogue(
                            'You are doing great. Clear the floating trash on the surface, then return to Slime.',
                            'Mermaid',
                            null
                        );
                        return;
                    }

                    this.dialogueSystem.showDialogue('Please collect the starfishes scattered around the reef, and keep away from the shark.', 'Mermaid', null);
                    return;
                }

                this.dialogueSystem.showDialogue(
                    "I've lost all my starfishes. Will you collect them? Be careful, a shark is patrolling these waters!",
                    'Mermaid',
                    null
                );
                clearDialogueActionButtons(this.dialogueSystem);

                this.dialogueSystem.addButtons([
                    {
                        text: 'Accept',
                        primary: true,
                        action: () => {
                            q1.accepted = true;
                            this.dialogueSystem.closeDialogue();
                            showQuestWindow();
                            updateQuestHud();
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

        const sharkNpc = {
            id: 'Shark',
            greeting: false,
            src: path + "/images/gamebuilder/sprites/Shark.png",
            SCALE_FACTOR: 5,
            STEP_FACTOR: 200,
            ANIMATION_RATE: 8,
            INIT_POSITION: { x: 700, y: 180 },
            orientation: { rows: 1, columns: 1 },
            down: { row: 0, start: 0, columns: 1 },
            right: { row: 0, start: 0, columns: 1, mirror: true },
            left: { row: 0, start: 0, columns: 1 },
            up: { row: 0, start: 0, columns: 1 },
            upRight: { row: 0, start: 0, columns: 1, mirror: true },
            downRight: { row: 0, start: 0, columns: 1, mirror: true },
            upLeft: { row: 0, start: 0, columns: 1 },
            downLeft: { row: 0, start: 0, columns: 1 },
            hitbox: { widthPercentage: 0.12, heightPercentage: 0.15 },
            reaction: function() {}
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
            { class: Npc, data: sharkNpc },
            { class: Barrier, data: dbarrier_1 },
            { class: Barrier, data: dbarrier_2 },
            { class: Barrier, data: dbarrier_3 }
        ];
    }

    initialize() {
        this.ensureQuestHud?.();

        const player = this.gameEnv?.gameObjects?.find(
            obj => obj?.spriteData?.id === 'playerData'
        );
        if (player && !player._aquaticLockWrapped) {
            const originalUpdate = player.update.bind(player);
            player.update = () => {
                if (this.playerLock) {
                    player.velocity.x = 0;
                    player.velocity.y = 0;
                    player.pressedKeys = {};
                    player.draw();
                    return;
                }
                originalUpdate();
            };
            player._aquaticLockWrapped = true;
        }

        const mermaid = this.gameEnv?.gameObjects?.find(
            obj => obj?.spriteData?.id === 'Mermaid'
        );
        if (mermaid) {
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

        const shark = this.gameEnv?.gameObjects?.find(
            obj => obj?.spriteData?.id === 'Shark'
        );

        if (shark) {
            const randomDirection = () => {
                const angle = Math.random() * Math.PI * 2;
                return { x: Math.cos(angle), y: Math.sin(angle) };
            };

            const directionFromVector = (vx, vy) => {
                const absX = Math.abs(vx);
                const absY = Math.abs(vy);
                if (absX < 0.05 && absY < 0.05) return 'right';
                if (absX > absY * 1.5) return vx >= 0 ? 'right' : 'left';
                if (absY > absX * 1.5) return vy >= 0 ? 'down' : 'up';
                if (vx >= 0 && vy >= 0) return 'downRight';
                if (vx >= 0 && vy < 0) return 'upRight';
                if (vx < 0 && vy >= 0) return 'downLeft';
                return 'upLeft';
            };

            const baseSpeed = Math.max(1.2, Math.min(this.gameEnv.innerWidth, this.gameEnv.innerHeight) * 0.0035);
            const initialVector = randomDirection();

            shark._motion = {
                vector: initialVector,
                speed: baseSpeed,
                nextTurnAt: performance.now() + 1200 + Math.random() * 1200
            };

            const getRect = (obj) => {
                const x = obj?.position?.x ?? obj?.x ?? 0;
                const y = obj?.position?.y ?? obj?.y ?? 0;
                const w = obj?.width ?? 0;
                const h = obj?.height ?? 0;
                return { x, y, w, h };
            };

            const intersects = (a, b) => {
                return (
                    a.x < b.x + b.w &&
                    a.x + a.w > b.x &&
                    a.y < b.y + b.h &&
                    a.y + a.h > b.y
                );
            };

            const resolveSharkCollisions = () => {
                const sharkRect = getRect(shark);
                const blockers = (this.gameEnv?.gameObjects || []).filter(obj => {
                    if (!obj || obj === shark || !obj.canvas) return false;
                    if (obj?.spriteData?.id === 'Shark') return false;
                    if (obj?.spriteData?.id === 'playerData') return false;
                    if (obj?.spriteData?.id?.startsWith('starfish_')) return false;
                    const type = obj?.constructor?.name;
                    return type === 'Npc' || type === 'Barrier';
                });

                blockers.forEach(blocker => {
                    const otherRect = getRect(blocker);
                    if (!intersects(sharkRect, otherRect)) return;

                    const overlapX = Math.min(
                        sharkRect.x + sharkRect.w - otherRect.x,
                        otherRect.x + otherRect.w - sharkRect.x
                    );
                    const overlapY = Math.min(
                        sharkRect.y + sharkRect.h - otherRect.y,
                        otherRect.y + otherRect.h - sharkRect.y
                    );

                    if (overlapX < overlapY) {
                        if (sharkRect.x < otherRect.x) {
                            shark.position.x -= overlapX;
                        } else {
                            shark.position.x += overlapX;
                        }
                        shark._motion.vector.x *= -1;
                    } else {
                        if (sharkRect.y < otherRect.y) {
                            shark.position.y -= overlapY;
                        } else {
                            shark.position.y += overlapY;
                        }
                        shark._motion.vector.y *= -1;
                    }

                    sharkRect.x = shark.position.x;
                    sharkRect.y = shark.position.y;
                });
            };

            shark.update = () => {
                const q2 = this.questState?.secondQuest;
                if (this.levelCompleted || q2?.inSurface || q2?.returning || q2?.completed) {
                    if (shark.canvas) shark.canvas.style.display = 'none';
                    return;
                }

                if (shark.canvas) shark.canvas.style.display = 'block';

                const now = performance.now();
                if (now >= shark._motion.nextTurnAt) {
                    shark._motion.vector = randomDirection();
                    shark._motion.nextTurnAt = now + 1200 + Math.random() * 1200;
                }

                shark.position.x += shark._motion.vector.x * shark._motion.speed;
                shark.position.y += shark._motion.vector.y * shark._motion.speed;

                // Bounce at bounds while keeping straight-line motion between turns.
                if (shark.position.x < 0) {
                    shark.position.x = 0;
                    shark._motion.vector.x = Math.abs(shark._motion.vector.x);
                } else if (shark.position.x + shark.width > this.gameEnv.innerWidth) {
                    shark.position.x = this.gameEnv.innerWidth - shark.width;
                    shark._motion.vector.x = -Math.abs(shark._motion.vector.x);
                }

                if (shark.position.y < 0) {
                    shark.position.y = 0;
                    shark._motion.vector.y = Math.abs(shark._motion.vector.y);
                } else if (shark.position.y + shark.height > this.gameEnv.innerHeight) {
                    shark.position.y = this.gameEnv.innerHeight - shark.height;
                    shark._motion.vector.y = -Math.abs(shark._motion.vector.y);
                }

                resolveSharkCollisions();

                shark.direction = directionFromVector(shark._motion.vector.x, shark._motion.vector.y);
                shark.draw();

                const player = this.gameEnv?.gameObjects?.find(
                    obj => obj?.spriteData?.id === 'playerData'
                );

                if (!player || !player.canvas || !shark.canvas) return;

                shark.isCollision(player);
                if (shark.collisionData?.hit) {
                    this.showSharkGameOver();
                }
            };
        }
    }

    destroy() {
        const gameOver = document.getElementById('aquatic-shark-gameover');
        if (gameOver) gameOver.remove();
        const quest = document.getElementById('aquatic-quest-window');
        if (quest) quest.remove();
        const hud = document.getElementById('aquatic-quest-hud');
        if (hud) hud.remove();
        const transition = document.getElementById('aquatic-transition-overlay');
        if (transition) transition.remove();
        this.clearSurfaceTrash?.();
    }

}

export default GameLevelAquaticGameLevel;
//
