import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Npc from './essentials/Npc.js';

class GameLevelBasketball {
  constructor(gameEnv) {
    const width = gameEnv.innerWidth;
    const height = gameEnv.innerHeight;
    const path = gameEnv.path;

    // Background data (simple Desert/Aquatic-style setup)
    const image_src_court = path + '/images/gamebuilder/bg/BballCourt.png';
    const image_data_court = {
      id: 'BasketballCourt',
      src: image_src_court,
      pixels: { height: 580, width: 900 }
    };

    // Player data (scaled down so it stays fully visible)
    const sprite_src_player = path + '/images/gamebuilder/sprites/BasketballPlayer.png';
    const sprite_data_player = {
      id: 'BasketballPlayer',
      greeting: 'Ball handler ready.',
      src: sprite_src_player,
      SCALE_FACTOR: 8,
      STEP_FACTOR: 1000,
      ANIMATION_RATE: 80,
      INIT_POSITION: { x: Math.round(width * 0.12), y: Math.round(height * 0.65) },
      pixels: { height: 512, width: 384 },
      orientation: { rows: 4, columns: 3 },
      down: { row: 0, start: 0, columns: 3 },
      left: { row: 1, start: 0, columns: 3 },
      right: { row: 2, start: 0, columns: 3 },
      up: { row: 3, start: 0, columns: 3 },
      downRight: { row: 2, start: 0, columns: 3 },
      downLeft: { row: 1, start: 0, columns: 3 },
      upRight: { row: 2, start: 0, columns: 3 },
      upLeft: { row: 1, start: 0, columns: 3 },
      hitbox: { widthPercentage: 0.45, heightPercentage: 0.5 },
      keypress: { up: 87, left: 65, down: 83, right: 68 }
    };

    // LeBron data (static NPC for now, we can add chase next)
    const sprite_src_lebron = path + '/images/gamebuilder/sprites/bron.png';
    const sprite_data_lebron = {
      id: 'LeBron',
      greeting: 'You reached LeBron.',
      src: sprite_src_lebron,
      SCALE_FACTOR: 7,
      ANIMATION_RATE: 120,
      INIT_POSITION: { x: Math.round(width * 0.72), y: Math.round(height * 0.62) },
      pixels: { height: 1350, width: 1080 },
      orientation: { rows: 1, columns: 1 },
      down: { row: 0, start: 0, columns: 1 },
      hitbox: { widthPercentage: 0.6, heightPercentage: 0.6 },
      dialogues: ['LeBron is in the gym.'],
      reaction: function () {
        if (this.dialogueSystem) {
          this.showReactionDialogue();
        }
      },
      interact: function () {
        if (this.dialogueSystem) {
          this.showRandomDialogue();
        }
      }
    };

    this.classes = [
      { class: GameEnvBackground, data: image_data_court },
      { class: Player, data: sprite_data_player },
      { class: Npc, data: sprite_data_lebron }
    ];
  }
}

export default GameLevelBasketball;
export const gameLevelClasses = [GameLevelBasketball];
