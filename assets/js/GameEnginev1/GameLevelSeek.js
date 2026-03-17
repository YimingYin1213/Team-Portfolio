// Adventure Game Custom Level
// Exported from GameBuilder on 2026-03-12T16:02:58.493Z
// How to use this file:
// 1) Save as assets/js/GameEnginev1/GameLevelSeek.js in your repo.
// 2) Register it in your level selector — open the file that contains gameLevelClasses and add:
//    import GameLevelSeek from '/Team-Portfolio/assets/js/GameEnginev1/GameLevelSeek.js';
//    export const gameLevelClasses = [...existingLevels, GameLevelSeek];
// 3) Ensure these images exist in your repo:
//    - images/gamebuilder/bg/tagplayground.png
//    - images/gamebuilder/sprites/boysprite.png
//    - images/gamebuilder/sprites/kirby.png

import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Npc from './essentials/Npc.js';
import Barrier from './essentials/Barrier.js';

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
            down:      { row: 0, start: 0, columns: 3 },
            downRight: { row: 1, start: 0, columns: 3, rotate:  Math.PI / 16 },
            downLeft:  { row: 0, start: 0, columns: 3, rotate: -Math.PI / 16 },
            left:      { row: 2, start: 0, columns: 3 },
            right:     { row: 1, start: 0, columns: 3 },
            up:        { row: 3, start: 0, columns: 3 },
            upLeft:    { row: 2, start: 0, columns: 3, rotate:  Math.PI / 16 },
            upRight:   { row: 3, start: 0, columns: 3, rotate: -Math.PI / 16 },
            hitbox: { widthPercentage: 0, heightPercentage: 0 },
            keypress: { up: 87, left: 65, down: 83, right: 68 }
        };

        const npcData1 = {
            id: 'NPC',
            greeting: 'Oh you found me',
            src: path + "/images/gamebuilder/sprites/kirby.png",
            SCALE_FACTOR: 8,
            ANIMATION_RATE: 50,
            INIT_POSITION: { x: 599, y: 88 },
            pixels: { height: 36, width: 569 },
            orientation: { rows: 1, columns: 13 },
            // Simplified to row 0 since the sprite only has 1 row
            down:      { row: 0, start: 0, columns: 3 },
            right:     { row: 0, start: 0, columns: 3 },
            left:      { row: 0, start: 0, columns: 3 },
            up:        { row: 0, start: 0, columns: 3 },
            upRight:   { row: 0, start: 0, columns: 3 },
            downRight: { row: 0, start: 0, columns: 3 },
            upLeft:    { row: 0, start: 0, columns: 3 },
            downLeft:  { row: 0, start: 0, columns: 3 },
            hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },
            dialogues: ['Oh you found me'],
            CHASE_SPEED: 1.5,  // increase this number to make Kirby faster
            update: function() {
                try { Npc.prototype.update.call(this); } catch(e) {}
                const player = this.gameEnv?.gameObjects?.find(
                    obj => obj?.spriteData?.id === 'playerData'
                );
                if (player) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 4) {
                        this.x += (dx / dist) * this.CHASE_SPEED;
                        this.y += (dy / dist) * this.CHASE_SPEED;
                    }
                }
            },
            reaction: function() { if (this.dialogueSystem) { this.showReactionDialogue(); } else { console.log(this.greeting); } },
            interact: function() { if (this.dialogueSystem) { this.showReactionDialogue(); } },
            onDialogueClose: function() {
                const gameControl = this.gameEnv?.gameControl;
                if (gameControl?.currentLevel) {
                    gameControl.currentLevel.continue = false;
                }
            }
        };

        const dbarrier_1 = {
            id: 'dbarrier_1', x: 232, y: 218, width: 83, height: 78, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        // Kirby chases the player every frame
            CHASE_SPEED: 1.5,  // increase this number to make Kirby faster
            update: function() {
                // Try to call the parent NPC update first (keeps animations running)
                try { Npc.prototype.update.call(this); } catch(e) {}

                // Find the player among all active game objects
                const player = this.gameEnv?.gameObjects?.find(
                    obj => obj?.spriteData?.id === 'playerData'
                );

                if (player) {
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Only move if not already on top of the player
                    if (dist > 4) {
                        this.x += (dx / dist) * this.CHASE_SPEED;
                        this.y += (dy / dist) * this.CHASE_SPEED;
                    }
                }
            },

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

        const dbarrier_1 = {
            id: 'dbarrier_1', x: 232, y: 218, width: 83,  height: 78, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 }, fromOverlay: true
        };
        const dbarrier_2 = {
            id: 'dbarrier_2', x: 72,  y: 96,  width: 62,  height: 43, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 }, fromOverlay: true
        };
        const dbarrier_3 = {
            id: 'dbarrier_3', x: 261, y: 62,  width: 143, height: 22, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 }, fromOverlay: true
        };
        const dbarrier_4 = {
            id: 'dbarrier_4', x: 411, y: 44,  width: 112, height: 47, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 }, fromOverlay: true
        };
        const dbarrier_5 = {
            id: 'dbarrier_5', x: 535, y: 67,  width: 10,  height: 16, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 }, fromOverlay: true
        };
        const dbarrier_6 = {
            id: 'dbarrier_6', x: 331, y: 355, width: 22,  height: 10, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 }, fromOverlay: true
        };
        const dbarrier_7 = {
            id: 'dbarrier_7', x: 388, y: 310, width: 16,  height: 16, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 }, fromOverlay: true
        };
        const dbarrier_8 = {
            id: 'dbarrier_8', x: 397, y: 353, width: 16,  height: 6,  visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 }, fromOverlay: true
        };

        this.classes = [
            { class: GameEnvBackground, data: bgData },
            { class: Player,            data: playerData },
            { class: Npc,               data: npcData1 },
            { class: Barrier,           data: dbarrier_1 },
            { class: Barrier,           data: dbarrier_2 },
            { class: Barrier,           data: dbarrier_3 },
            { class: Barrier,           data: dbarrier_4 },
            { class: Barrier,           data: dbarrier_5 },
            { class: Barrier,           data: dbarrier_6 },
            { class: Barrier,           data: dbarrier_7 },
            { class: Barrier,           data: dbarrier_8 },
        ];
    }
}

export default GameLevelSeek;