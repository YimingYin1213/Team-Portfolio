eek · JS
Copy

// Adventure Game Custom Level
// Exported from GameBuilder on 2026-03-12T16:02:58.493Z
// Modified: Added Kirby tag chase mechanic, HUD timer, and "I got you!" catch message.
// How to use this file:
// 1) Save as assets/js/GameEnginev1/GameLevelSeek.js in your repo.
// 2) Reference it in your runner or level selector. Examples:
//    import GameLevelPlanets from '/Team-Portfolio/assets/js/GameEnginev1/GameLevelPlanets.js';
//    import GameLevelSeek from '/Team-Portfolio/assets/js/GameEnginev1/GameLevelSeek.js';
//    export const gameLevelClasses = [GameLevelPlanets, GameLevelSeek];
//    // or pass it directly to your GameControl as the only level.
// 3) Ensure images exist and paths resolve via 'path' provided by the engine.
// 4) You can add more objects to this.classes inside the constructor.
 
import GameEnvBackground from '/assets/js/GameEnginev1/essentials/GameEnvBackground.js';
import Player from '/assets/js/GameEnginev1/essentials/Player.js';
import Npc from '/assets/js/GameEnginev1/essentials/Npc.js';
import Barrier from '/assets/js/GameEnginev1/essentials/Barrier.js';
 
class GameLevelSeek {
    constructor(gameEnv) {
        const path = gameEnv.path;
        const width = gameEnv.innerWidth;
        const height = gameEnv.innerHeight;
 
        // ── HUD: Timer ────────────────────────────────────────────────────────
        // Inject a timer element into the game canvas container (top-right corner).
        // We store references on gameEnv so the NPC's onDialogueClose can clear them.
        let timerEl = document.getElementById('tag-timer-hud');
        if (!timerEl) {
            timerEl = document.createElement('div');
            timerEl.id = 'tag-timer-hud';
            Object.assign(timerEl.style, {
                position: 'absolute',
                top: '12px',
                right: '16px',
                zIndex: '9999',
                fontFamily: '"Press Start 2P", monospace, sans-serif',
                fontSize: '18px',
                color: '#ffffff',
                textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
                pointerEvents: 'none',
                userSelect: 'none',
            });
            timerEl.textContent = '⏱ 0.0s';
            // Attach to the closest positioned ancestor of the canvas, or body
            const canvas = document.querySelector('canvas');
            const container = (canvas && canvas.parentElement) ? canvas.parentElement : document.body;
            if (getComputedStyle(container).position === 'static') {
                container.style.position = 'relative';
            }
            container.appendChild(timerEl);
        }
 
        // ── HUD: "I got you!" overlay ─────────────────────────────────────────
        let caughtEl = document.getElementById('tag-caught-hud');
        if (!caughtEl) {
            caughtEl = document.createElement('div');
            caughtEl.id = 'tag-caught-hud';
            Object.assign(caughtEl.style, {
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) scale(0)',
                zIndex: '10000',
                fontFamily: '"Press Start 2P", monospace, sans-serif',
                fontSize: '36px',
                color: '#ffe000',
                textShadow: '3px 3px 0 #d40000, -2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000',
                background: 'rgba(0,0,0,0.65)',
                padding: '20px 32px',
                borderRadius: '8px',
                border: '4px solid #ffe000',
                pointerEvents: 'none',
                userSelect: 'none',
                transition: 'transform 0.25s cubic-bezier(.34,1.56,.64,1)',
                whiteSpace: 'nowrap',
            });
            caughtEl.textContent = '🌸 I got you! 🌸';
            const canvas = document.querySelector('canvas');
            const container = (canvas && canvas.parentElement) ? canvas.parentElement : document.body;
            container.appendChild(caughtEl);
        }
        caughtEl.style.transform = 'translate(-50%, -50%) scale(0)'; // hide initially
 
        // ── Timer state ───────────────────────────────────────────────────────
        let startTime = Date.now();
        let timerInterval = setInterval(() => {
            const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
            if (timerEl) timerEl.textContent = `⏱ ${elapsed}s`;
        }, 100);
 
        // Store cleanup handles on gameEnv so the level can be torn down cleanly
        gameEnv._tagTimerInterval = timerInterval;
        gameEnv._tagTimerEl = timerEl;
        gameEnv._tagCaughtEl = caughtEl;
 
        // ── Background ────────────────────────────────────────────────────────
        const bgData = {
            name: "custom_bg",
            src: path + "/images/gamebuilder/bg/tagplayground.png",
            pixels: { height: 400, width: 560 }
        };
 
        // ── Player ────────────────────────────────────────────────────────────
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
 
        // ── Kirby NPC – tag chaser ────────────────────────────────────────────
        //
        // CHASE LOGIC:
        //   After the NPC is constructed the engine calls update() each frame.
        //   We override update() to move Kirby toward the player every tick.
        //   Collision detection uses the same simple AABB check the engine uses
        //   for dialogue triggers, so we replicate it here with a slightly
        //   generous radius so the "tag" feels fair.
        //
        // SPEED NOTE:
        //   CHASE_SPEED is in canvas-pixels per frame.  Tune it to taste —
        //   1.8 gives the player a fighting chance; raise it to make Kirby faster.
 
        const KIRBY_CHASE_SPEED = 1.8;   // px/frame – adjust to balance difficulty
        const TAG_CATCH_RADIUS  = 40;    // px – how close Kirby must get to tag you
        let   tagged            = false; // prevent repeated triggers
 
        const npcData1 = {
            id: 'NPC',
            greeting: 'I got you!',
            src: path + "/images/gamebuilder/sprites/kirby.png",
            SCALE_FACTOR: 8,
            ANIMATION_RATE: 50,
            INIT_POSITION: { x: 700, y: 40 },
            pixels: { height: 36, width: 569 },
            orientation: { rows: 1, columns: 13 },
            // Sprite row mappings (sprite sheet only has 1 row, so clamp to 0)
            down:      { row: 0, start: 0, columns: 3 },
            right:     { row: Math.min(1, 0), start: 0, columns: 3 },
            left:      { row: Math.min(2, 0), start: 0, columns: 3 },
            up:        { row: Math.min(3, 0), start: 0, columns: 3 },
            upRight:   { row: Math.min(3, 0), start: 0, columns: 3 },
            downRight: { row: Math.min(1, 0), start: 0, columns: 3 },
            upLeft:    { row: Math.min(2, 0), start: 0, columns: 3 },
            downLeft:  { row: 0,              start: 0, columns: 3 },
            hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },
            dialogues: ['I got you!'],
 
            // ── Called once by the engine after the NPC sprite is set up ──────
            //    We monkey-patch update() here so we don't need to touch the
            //    engine source.
            bindGameEnv: function(env) {
                // Some engine versions call bindGameEnv; hook in here too.
                if (this._chasePatchApplied) return;
                this._applyChase(env);
            },
 
            // Internal helper – patches the update loop
            _applyChase: function(env) {
                if (this._chasePatchApplied) return;
                this._chasePatchApplied = true;
                const npc = this;
                const _origUpdate = this.update ? this.update.bind(this) : () => {};
 
                this.update = function() {
                    _origUpdate();
                    if (tagged) return;
 
                    // Find the player object in the game environment
                    const player = env?.gameObjects?.find(o => o.id === 'playerData' || o.spriteData?.id === 'playerData');
                    if (!player) return;
 
                    // Current positions (centre of each sprite)
                    const npcX  = npc.x  + (npc.width  || 0) / 2;
                    const npcY  = npc.y  + (npc.height || 0) / 2;
                    const plrX  = player.x + (player.width  || 0) / 2;
                    const plrY  = player.y + (player.height || 0) / 2;
 
                    const dx = plrX - npcX;
                    const dy = plrY - npcY;
                    const dist = Math.sqrt(dx * dx + dy * dy);
 
                    // Move Kirby toward the player
                    if (dist > 1) {
                        npc.x += (dx / dist) * KIRBY_CHASE_SPEED;
                        npc.y += (dy / dist) * KIRBY_CHASE_SPEED;
                    }
 
                    // ── Tag collision ─────────────────────────────────────────
                    if (dist < TAG_CATCH_RADIUS) {
                        tagged = true;
 
                        // Stop the timer
                        clearInterval(env._tagTimerInterval);
 
                        // Show "I got you!" splash
                        const caught = env._tagCaughtEl;
                        if (caught) {
                            caught.style.transform = 'translate(-50%, -50%) scale(1)';
                            // Auto-hide after 3 s and end the level
                            setTimeout(() => {
                                caught.style.transform = 'translate(-50%, -50%) scale(0)';
                                const gameControl = env?.gameControl;
                                if (gameControl?.currentLevel) {
                                    gameControl.currentLevel.continue = false;
                                }
                            }, 3000);
                        }
                    }
                };
            },
 
            // Standard engine reaction / interact hooks (kept for compatibility)
            reaction: function() {
                if (this.dialogueSystem) { this.showReactionDialogue(); }
                else { console.log(this.greeting); }
            },
            interact: function() {
                if (this.dialogueSystem) { this.showReactionDialogue(); }
            },
            onDialogueClose: function() {
                // Clean up HUD elements and timer when level ends via dialogue
                const env = this.gameEnv;
                if (env) {
                    clearInterval(env._tagTimerInterval);
                    env._tagTimerEl?.remove();
                    env._tagCaughtEl?.remove();
                }
                const gameControl = this.gameEnv?.gameControl;
                if (gameControl?.currentLevel) {
                    gameControl.currentLevel.continue = false;
                }
            }
        };
 
        // ── Barriers ──────────────────────────────────────────────────────────
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
 
        // ── Inject "Press Start 2P" font for the HUD if not already present ───
        if (!document.getElementById('tag-game-font')) {
            const link = document.createElement('link');
            link.id = 'tag-game-font';
            link.rel = 'stylesheet';
            link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
            document.head.appendChild(link);
        }
 
        // ── Hook Kirby's chase logic as soon as the NPC object is instantiated ─
        // The engine may not call bindGameEnv, so we also watch for the NPC to
        // appear in gameEnv.gameObjects and patch it then.
        const patchInterval = setInterval(() => {
            if (!gameEnv.gameObjects) return;
            const kirby = gameEnv.gameObjects.find(o => o.id === 'NPC' || o.spriteData?.id === 'NPC');
            if (kirby && !kirby._chasePatchApplied) {
                // Copy the _applyChase helper over and invoke it
                kirby._chasePatchApplied = false;
                kirby._applyChase = npcData1._applyChase;
                kirby._applyChase(gameEnv);
                clearInterval(patchInterval);
            }
        }, 100);
 
        // ── Class list ────────────────────────────────────────────────────────
        this.classes = [
            { class: GameEnvBackground, data: bgData },
            { class: Player,            data: playerData },
            { class: Npc,               data: npcData1 },
            { class: Barrier,           data: dbarrier_1 },
            { class: Barrier,           data: dbarrier_2 },
            { class: Barrier,           data: dbarrier_3 },
            { class: Barrier,           data: dbarrier_4 },
            { class: Barrier,           data: dbarrier_5 },
            { class: Barrier,           data: dbarrier_6 },
            { class: Barrier,           data: dbarrier_7 },
            { class: Barrier,           data: dbarrier_8 },
        ];
    }
}
 
export default GameLevelSeek;