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
    x: width * 0.18,
    y: height * 0.55,
    width: width * 0.06,
    height: height * 0.08,
    visible: false,
    hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
    fromOverlay: true
};

// Right bench (skinny vertical barrier)
const dbarrier_2 = {
    id: 'dbarrier_2',
    x: width * 0.26,
    y: height * 0.55,
    width: width * 0.06,
    height: height * 0.08,
    visible: false,
    hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
    fromOverlay: true
};

// Gatorade jug (small square)
const dbarrier_3 = {
    id: 'dbarrier_3',
    x: width * 0.46,
    y: height * 0.30,
    width: width * 0.03,
    height: height * 0.08,
    visible: false,
    hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 },
    fromOverlay: true
};
this.classes = [      { class: GameEnvBackground, data: bgData },
      { class: Player, data: playerData },
      { class: Npc, data: npcData1 },
      { class: Barrier, data: dbarrier_1 },
      { class: Barrier, data: dbarrier_2 },
      { class: Barrier, data: dbarrier_3 }
];

        
    }
}

export default GameLevelBasketball;
