// Adventure Game Custom Level — SEEK (Kirby Chase)

import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Npc from './essentials/Npc.js';
import Barrier from './essentials/Barrier.js';

class GameLevelSeek {
    constructor(gameEnv = {}) {
        this.gameEnv = gameEnv;
        const path = gameEnv?.path || '';

        //  Background
        const bgData = {
            name: "custom_bg",
            src: path + "/images/gamebuilder/bg/tagplayground.png",
            pixels: { height: 400, width: 560 }
        };

        //  Player
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

            // WASD controls
            keypress: { up: 87, left: 65, down: 83, right: 68 }
        };

        //  KIRBY — SLOW CHASER
        const npcData1 = {
            id: 'NPC',
            greeting: 'oh I got you',
            src: path + "/images/gamebuilder/sprites/kirby.png",
            SCALE_FACTOR: 8,
            ANIMATION_RATE: 50,

            //  TOP-RIGHT START
            INIT_POSITION: { x: 700, y: 40 },

            pixels: { height: 36, width: 569 },
            orientation: { rows: 1, columns: 13 },

            down: { row: 0, start: 0, columns: 3 },
            right: { row: 0, start: 0, columns: 3 },
            left: { row: 0, start: 0, columns: 3 },
            up: { row: 0, start: 0, columns: 3 },
            upRight: { row: 0, start: 0, columns: 3 },
            downRight: { row: 0, start: 0, columns: 3 },
            upLeft: { row: 0, start: 0, columns: 3 },
            downLeft: { row: 0, start: 0, columns: 3 },

            hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },

            dialogues: ['oh I got you'],

            //  SLOW CHASE LOGIC
            update: function() {
                const player = this.gameEnv?.gameObjects?.find(
                    obj => obj.id === 'playerData'
                );
                if (!player) return;

                const dx = player.x - this.x;
                const dy = player.y - this.y;

                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist === 0) return;

                const speed = 0.5; // VERY slow (player faster)

                this.x += (dx / dist) * speed;
                this.y += (dy / dist) * speed;
            },

            reaction: function() {
                if (this.dialogueSystem) {
                    this.showReactionDialogue();
                } else {
                    console.log(this.greeting);
                }
            },

            interact: function() {
                if (this.dialogueSystem) {
                    this.showReactionDialogue();
                }
            },

            onDialogueClose: function() {
                const gameControl = this.gameEnv?.gameControl;
                if (gameControl?.currentLevel) {
                    gameControl.currentLevel.continue = false;
                }
            }
        };

        //  Invisible Barriers
        const barriers = [
            { id:'b1', x:232, y:218, width:83, height:78 },
            { id:'b2', x:72, y:96, width:62, height:43 },
            { id:'b3', x:261, y:62, width:143, height:22 },
            { id:'b4', x:411, y:44, width:112, height:47 },
            { id:'b5', x:535, y:67, width:10, height:16 },
            { id:'b6', x:331, y:355, width:22, height:10 },
            { id:'b7', x:388, y:310, width:16, height:16 },
            { id:'b8', x:397, y:353, width:16, height:6 }
        ].map(b => ({
            ...b,
            visible: false,
            hitbox: { widthPercentage: 0, heightPercentage: 0 },
            fromOverlay: true
        }));

        //  Register objects with engine
        this.classes = [
            { class: GameEnvBackground, data: bgData },
            { class: Player, data: playerData },
            { class: Npc, data: npcData1 },
            ...barriers.map(b => ({ class: Barrier, data: b }))
        ];
    }
}

export default GameLevelSeek;