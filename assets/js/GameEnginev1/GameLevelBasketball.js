// Adventure Game Custom Level
// Exported from GameBuilder on 2026-03-06T07:25:20.568Z
// How to use this file:
// 1) Save as assets/js/GameEnginev1/GameLevelBasketball.js in your repo.
// 2) Reference it in your runner or level selector. Examples:
//    import GameLevelPlanets from '/portfolio/assets/js/GameEnginev1/GameLevelPlanets.js';
//    import GameLevelBasketball from '/portfolio/assets/js/GameEnginev1/GameLevelBasketball.js';
//    export const gameLevelClasses = [GameLevelPlanets, GameLevelBasketball];
//    // or pass it directly to your GameControl as the only level.
// 3) Ensure images exist and paths resolve via 'path' provided by the engine.
// 4) You can add more objects to this.classes inside the constructor.

import GameEnvBackground from '/assets/js/GameEnginev1/essentials/GameEnvBackground.js';
import Player from '/assets/js/GameEnginev1/essentials/Player.js';
import Npc from '/assets/js/GameEnginev1/essentials/Npc.js';
import Barrier from '/assets/js/GameEnginev1/essentials/Barrier.js';

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

       const npcData1 = {
    id: 'NPC',
    greeting: 'Hello!',
    src: path + "/images/gamebuilder/sprites/LeBron.png",
    SCALE_FACTOR: 3,
    ANIMATION_RATE: 50,
    INIT_POSITION: { x: 360, y: 166 },
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
    dialogues: ['Hello!'],
    reaction: function() { if (this.dialogueSystem) { this.showReactionDialogue(); } else { console.log(this.greeting); } },
    interact: function() { if (this.dialogueSystem) { this.showRandomDialogue(); } }
};
        const dbarrier_1 = {
            id: 'dbarrier_1', x: 258, y: 281, width: 219, height: 104, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        const dbarrier_2 = {
            id: 'dbarrier_2', x: 136, y: 195, width: 123, height: 229, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        const dbarrier_3 = {
            id: 'dbarrier_3', x: 488, y: 351, width: 54, height: 101, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };

        const dbarrier_4 = {
            id: 'dbarrier_4', x: 555, y: 414, width: 48, height: 40, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
            fromOverlay: true
        };
this.classes = [      { class: GameEnvBackground, data: bgData },
      { class: Player, data: playerData },
      { class: Npc, data: npcData1 },
      { class: Barrier, data: dbarrier_1 },
      { class: Barrier, data: dbarrier_2 },
      { class: Barrier, data: dbarrier_3 },
      { class: Barrier, data: dbarrier_4 }
];

        
    }
}

export default GameLevelBasketball;