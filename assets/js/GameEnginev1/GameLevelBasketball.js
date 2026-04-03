import GameEnvBackground from './essentials/GameEnvBackground.js'; // imports the background renderer for the game environment
import Player from './essentials/Player.js'; // imports the player class (the character the user controls)
import Npc from './essentials/Npc.js'; // imports the NPC class (non-player characters like LeBron/Kirby)
import Coin from './Coin.js'; // imports the Coin class for collectible coins
import Barrier from './essentials/Barrier.js'; // imports the Barrier class for invisible wall/boundary objects
import Leaderboard from '../GameEnginev1.1/essentials/Leaderboard.js'; // imports the leaderboard system for tracking high scores
import DialogueSystem from './DialogueSystem.js'; // imports the dialogue system for showing on-screen messages/popups

class GameLevelBasketball {
  constructor(gameEnv) { // constructor -> starts up the game level when it's first created
    this.gameEnv = gameEnv; // saves a reference to the game environment (contains screen size, game objects, etc.)
    const width = gameEnv.innerWidth; // grabs the current screen width for positioning calculations
    const height = gameEnv.innerHeight; // grabs the current screen height for positioning calculations
    const path = gameEnv.path; // grabs the base file path for loading images/sprites
    this.playerStart = { x: Math.round(width * 0.12), y: Math.round(height * 0.68) }; // sets the player's starting position (12% from left, 68% from top)
    this.chaserStart = { x: Math.round(width * 0.72), y: Math.round(height * 0.55) }; // sets LeBron's starting position (72% from left, 55% from top)

    this.caught = false; // boolean logic for caught mechanism -> tracks whether the player has been caught yet
    this.caughtAt = 0; // stores the timestamp (ms) of when the player got caught
    this.roundResetDelayMs = 1400; // how long to wait (in ms) after being caught before resetting the round
    this.startTime = 0; // clock logic -> stores when the current round started (in ms)
    this.currentTime = 0; // clock logic -> stores how many seconds have passed in the current round
    this.bestTime = this.loadBestTime(); // loads the player's personal best survival time from localStorage
    this.bestCoins = this.loadBestCoins(); // loads the player's personal best coin count from localStorage
    this.timeHud = null; // holds a reference to the HUD timer element (created later in createHud)
    this.messageHud = null; // holds a reference to the center-screen message element (e.g. "Kirby stole the ball!")
    this.bottomNav = null; // holds a reference to the bottom navigation buttons element
    this.leaderboard = null; // holds a reference to the leaderboard instance (created later in initLeaderboard)
    this.introDialogue = null; // holds a reference to the intro dialogue popup (shown before the round starts)
    this.preGameLocked = true; // boolean -> blocks game updates until the player clicks "Start" on the intro dialogue
    this.scoreSubmittedThisRound = false; // boolean -> prevents submitting the leaderboard score more than once per round
    this.handleRestartKey = this.handleRestartKey.bind(this); // binds the restart key handler so 'this' works correctly in event listeners
    this.handleShootKey = this.handleShootKey.bind(this); // binds the shoot key handler so 'this' works correctly in event listeners
    this.projectiles = []; // array -> stores all currently active basketball projectiles on screen
    this.projectileSpeed = 9; // how fast each projectile travels (pixels per frame)
    this.projectileRadius = 10; // the radius of each projectile circle (in pixels), used for drawing and collision
    this.projectileLifeMs = 2200; // how long a projectile stays alive (in ms) before being removed
    this.shootCooldownMs = 5000; // minimum time (in ms) the player must wait between shots
    this.lastShotAt = -Infinity; // timestamp of the last shot fired -> -Infinity means the player can shoot immediately at start
    this.lebronStunUntil = 0; // timestamp until which LeBron is frozen/stunned after being hit by a projectile
    this.lebronStunDurationMs = 3000; // how long LeBron stays stunned after being hit (in ms)

    const image_src_court = path + '/images/gamebuilder/bg/BaskCourt.png'; // builds the full file path to the basketball court background image
    const image_data_court = {
      id: 'BasketballCourt', // unique ID used to reference this background object
      src: image_src_court, // file path to the court image
      pixels: { height: 720, width: 1478 } // original pixel dimensions of the court image
    };

    // Player sprite data -> defines the astronaut character the user controls
    const sprite_src_player = path + '/images/gamebuilder/sprites/astro.png'; // file path to the astronaut sprite sheet
    const sprite_data_player = {
      id: 'BasketballPlayer', // unique ID used to find this object in the game loop
      greeting: 'Ball handler ready.', // greeting text shown when interacting with the player
      src: sprite_src_player, // file path to the player sprite sheet
      SCALE_FACTOR: 11, // higher number = smaller on-screen size for the player sprite
      STEP_FACTOR: 1000, // controls how far the player moves per key press step
      ANIMATION_RATE: 110, // delay in ms between animation frames (higher = slower animation)
      INIT_POSITION: { ...this.playerStart }, // copies the player's starting x/y position
      pixels: { height: 770, width: 513 }, // original pixel dimensions of the full sprite sheet
      orientation: { rows: 4, columns: 4 }, // the sprite sheet is a 4-row by 4-column grid of frames
      down:      { row: 0, start: 0, columns: 4 }, // animation frames to use when moving down
      left:      { row: 1, start: 0, columns: 4 }, // animation frames to use when moving left
      right:     { row: 2, start: 0, columns: 4 }, // animation frames to use when moving right
      up:        { row: 3, start: 0, columns: 4 }, // animation frames to use when moving up
      downRight: { row: 2, start: 0, columns: 4 }, // diagonal down-right reuses the right row
      downLeft:  { row: 1, start: 0, columns: 4 }, // diagonal down-left reuses the left row
      upRight:   { row: 2, start: 0, columns: 4 }, // diagonal up-right reuses the right row
      upLeft:    { row: 1, start: 0, columns: 4 }, // diagonal up-left reuses the left row
      hitbox: { widthPercentage: 0.45, heightPercentage: 0.5 }, // shrinks the collision area to 45% width and 50% height of the sprite
      keypress: { up: 87, left: 65, down: 83, right: 68 } // WASD key codes for movement (W=87, A=65, S=83, D=68)
    };

    // Chaser sprite data -> defines Kirby/LeBron who chases the player
    const sprite_src_chaser = path + '/images/gamebuilder/sprites/kirby.png'; // file path to the Kirby sprite sheet
    const sprite_data_chaser = {
      id: 'LeBron', // unique ID used to find this object in the game loop
      greeting: 'You reached LeBron.', // text shown when the player touches LeBron
      src: sprite_src_chaser, // file path to the Kirby/LeBron sprite sheet
      SCALE_FACTOR: 7, // controls on-screen size (lower = bigger than the player)
      ANIMATION_RATE: 8, // fast animation rate -> Kirby animates quickly
      INIT_POSITION: { ...this.chaserStart }, // copies LeBron's starting x/y position
      pixels: { height: 36, width: 569 }, // original pixel dimensions of the Kirby sprite sheet
      orientation: { rows: 1, columns: 13 }, // sprite sheet has 1 row with 13 animation frames
      down:      { row: 0, start: 0, columns: 13 }, // all directions use the same single row since Kirby has one animation
      left:      { row: 0, start: 0, columns: 13 },
      right:     { row: 0, start: 0, columns: 13 },
      up:        { row: 0, start: 0, columns: 13 },
      downRight: { row: 0, start: 0, columns: 13 },
      downLeft:  { row: 0, start: 0, columns: 13 },
      upRight:   { row: 0, start: 0, columns: 13 },
      upLeft:    { row: 0, start: 0, columns: 13 },
      hitbox: { widthPercentage: 0.2, heightPercentage: 0.2 }, // small hitbox (20%) so the player must be very close to trigger a catch
      dialogues: ['LeBron is in the gym.'], // dialogue lines LeBron can say when interacted with
      reaction: function () { // called when LeBron reacts to something -> shows a reaction dialogue
        if (this.dialogueSystem) this.showReactionDialogue();
      },
      interact: function () { // called when the player interacts with LeBron -> shows a random dialogue
        if (this.dialogueSystem) this.showRandomDialogue();
      }
    };

    // Coin data -> defines each collectible coin's starting position, size, and point value
    const coin_1 = {
      id: 'coin_1', // unique ID for the first coin
      INIT_POSITION: { x: Math.round(width * 0.25), y: Math.round(height * 0.35) }, // starts at 25% from left, 35% from top
      SCALE_FACTOR: 18, // small scale factor -> coin appears small on screen
      value: 1 // worth 1 point when collected
    };

    const coin_2 = {
      id: 'coin_2', // unique ID for the second coin
      INIT_POSITION: { x: Math.round(width * 0.50), y: Math.round(height * 0.65) }, // starts at center horizontally, 65% from top
      SCALE_FACTOR: 18,
      value: 1
    };

    const coin_3 = {
      id: 'coin_3', // unique ID for the third coin
      INIT_POSITION: { x: Math.round(width * 0.72), y: Math.round(height * 0.28) }, // starts at 72% from left, 28% from top
      SCALE_FACTOR: 18,
      value: 1
    };

    // Barrier data -> invisible walls that block movement at the edges of the playable court area
    // All positions use relative units (0.0 to 1.0) so they scale with any screen size
    const barrier_bench_top = {
      id: 'barrier_bench_top', // blocks movement along the top bench area
      x: 0.07,   // starts 7% from the left edge
      y: 0.07,   // starts 7% from the top edge
      width: 0.86,  // spans 86% of the screen width
      height: 0.10, // 10% of the screen height tall
      visible: false, // invisible -> player can't see this barrier
      hitbox: { widthPercentage: 0, heightPercentage: 0 } // no hitbox reduction -> full area blocks movement
    };

    const barrier_bench_bottom = {
      id: 'barrier_bench_bottom', // blocks movement along the bottom bench area
      x: 0.07,
      y: 0.83,   // positioned near the bottom (83% down)
      width: 0.86,
      height: 0.10,
      visible: false,
      hitbox: { widthPercentage: 0, heightPercentage: 0 }
    };

    const barrier_gatorade_left = {
      id: 'barrier_gatorade_left', // blocks movement at the left gatorade/sideline area
      x: 0.03,   // near the left edge (3%)
      y: 0.38,   // vertically centered on the court
      width: 0.05,  // narrow strip (5% wide)
      height: 0.22, // covers 22% of screen height
      visible: false,
      hitbox: { widthPercentage: 0, heightPercentage: 0 }
    };

    const barrier_gatorade_right = {
      id: 'barrier_gatorade_right', // blocks movement at the right gatorade/sideline area
      x: 0.92,   // near the right edge (92%)
      y: 0.38,
      width: 0.05,
      height: 0.22,
      visible: false,
      hitbox: { widthPercentage: 0, heightPercentage: 0 }
    };

    // this.classes -> the master list of all game objects to spawn when this level loads
    this.classes = [
      { class: GameEnvBackground, data: image_data_court }, // spawns the basketball court background
      { class: Player, data: sprite_data_player },          // spawns the player (astronaut)
      { class: Npc, data: sprite_data_chaser },             // spawns the chaser NPC (Kirby/LeBron)
      { class: Coin, data: coin_1 },                        // spawns the first coin
      { class: Coin, data: coin_2 },                        // spawns the second coin
      { class: Coin, data: coin_3 },                        // spawns the third coin
      { class: Barrier, data: barrier_bench_top },          // spawns the top bench barrier
      { class: Barrier, data: barrier_bench_bottom },       // spawns the bottom bench barrier
      { class: Barrier, data: barrier_gatorade_left },      // spawns the left sideline barrier
      { class: Barrier, data: barrier_gatorade_right }      // spawns the right sideline barrier
    ];
  }

  initialize() { // called once when the level first loads -> sets up all starting state and UI
    if (!this.gameEnv.stats) this.gameEnv.stats = {}; // creates the stats object if it doesn't exist yet
    this.gameEnv.stats.coinsCollected = 0; // resets coin count to 0 at the start of a new level
    this.updateCoinSpawnBounds(); // calculates the safe area where coins can spawn (inside barriers)
    this.applyCoinSpawnRules(); // applies position constraints so coins only spawn in the safe zone
    this.startTime = 0; // resets the start time clock
    this.currentTime = 0; // resets the elapsed time counter
    this.createHud(); // builds and injects the timer/coin HUD into the DOM
    this.createBottomNav(); // builds and injects the bottom navigation buttons into the DOM
    this.updateHud(); // renders the initial HUD values (all zeros)
    this.initLeaderboard(); // creates the leaderboard instance and positions it on screen
    this.showIntroDialogue(); // shows the "Start" dialogue popup before the round begins
    document.addEventListener('keydown', this.handleRestartKey); // listens for 'R' key to restart after being caught
    document.addEventListener('keydown', this.handleShootKey);   // listens for 'E' key to shoot a basketball
  }

  update() { // called every frame -> runs the main game logic (chasing, collision, timers)
    const player = this.findById('BasketballPlayer'); // looks up the player object from the game objects list
    const lebron = this.findById('LeBron'); // looks up LeBron's object from the game objects list
    if (!player || !lebron) return; // safety check -> if either object is missing, skip this frame
    const now = performance.now(); // gets the current timestamp in milliseconds (high precision)
    this.updateProjectiles(now, lebron); // moves all active projectiles and checks if any hit LeBron
    if (this.preGameLocked) return; // if the intro dialogue hasn't been dismissed yet, pause all game logic

    if (!this.caught) { // only update the timer if the player hasn't been caught yet
      this.currentTime = (now - this.startTime) / 1000; // calculates seconds elapsed since round start
      this.updateHud(); // refreshes the HUD display with the new time
    }

    if (this.caught) { // if the player was caught, handle the round reset countdown
      if (now - this.caughtAt >= this.roundResetDelayMs) { // waits for the reset delay to finish
        this.resetRound(); // resets everything back to the starting state
      }
      return; // skips the rest of the update logic while waiting to reset
    }

    if (now < this.lebronStunUntil) { // if LeBron is currently stunned from a basketball hit
      lebron.velocity.x = 0; // freezes LeBron's horizontal movement
      lebron.velocity.y = 0; // freezes LeBron's vertical movement
      return; // skips LeBron's chasing logic for this frame
    }

    // Calculate the direction from LeBron to the player so LeBron can chase
    const dx = player.position.x - lebron.position.x; // horizontal distance from LeBron to player
    const dy = player.position.y - lebron.position.y; // vertical distance from LeBron to player
    const dist = Math.hypot(dx, dy); // total straight-line distance between LeBron and the player
    if (dist < 1) return; // if they're basically on top of each other, skip to avoid division-by-zero

    // Speed curve -> LeBron gets slightly faster over time but has a cap to keep the game fair
    const speed = Math.min(2.1 + this.currentTime * 0.03, 2.8); // starts at 2.1 px/frame, slowly climbs, max 2.8
    lebron.position.x += (dx / dist) * speed; // moves LeBron toward the player horizontally
    lebron.position.y += (dy / dist) * speed; // moves LeBron toward the player vertically

    // Clamp LeBron's position so he can't leave the visible game area
    lebron.position.x = Math.max(0, Math.min(lebron.position.x, this.gameEnv.innerWidth - (lebron.width || 0)));
    lebron.position.y = Math.max(0, Math.min(lebron.position.y, this.gameEnv.innerHeight - (lebron.height || 0)));

    // Update LeBron's facing direction based on which axis he's moving more along
    if (Math.abs(dx) > Math.abs(dy)) { // if moving more horizontally than vertically
      lebron.direction = dx >= 0 ? 'right' : 'left'; // face right if player is to the right, left otherwise
    } else { // if moving more vertically than horizontally
      lebron.direction = dy >= 0 ? 'down' : 'up'; // face down if player is below, up otherwise
    }

    if (this.isHitboxCollision(player, lebron)) { // checks if the player's and LeBron's hitboxes overlap
      this.caught = true; // marks the player as caught
      this.caughtAt = now; // records the exact time the catch happened
      this.bestTime = Math.max(this.bestTime, this.currentTime); // updates best time if this round beat it
      this.bestCoins = Math.max(this.bestCoins, this.getCoinsCollected()); // updates best coin count if this round beat it
      this.saveBestTime(); // persists the best time to localStorage
      this.saveBestCoins(); // persists the best coin count to localStorage
      this.submitRoundScore(); // sends the round score to the leaderboard
      this.showCaughtMessage(); // shows the "Kirby stole the ball!" message on screen
      this.updateHud(); // refreshes the HUD one final time with end-of-round stats
    }
  }

  handleShootKey(event) { // event handler -> fires when any key is pressed, filters for 'E'
    if (event.key.toLowerCase() !== 'e' || event.repeat) return; // ignores keys that aren't 'E' or held-down repeats
    if (this.preGameLocked || this.caught) return; // can't shoot before the game starts or after being caught
    const now = performance.now(); // gets the current timestamp
    if (now - this.lastShotAt < this.shootCooldownMs) return; // enforces the cooldown between shots

    const player = this.findById('BasketballPlayer'); // looks up the player object
    if (!player) return; // safety check -> if no player found, do nothing

    this.lastShotAt = now; // records this shot's timestamp to start the cooldown
    this.spawnProjectileFromPlayer(player, now); // creates and launches a basketball projectile
  }

  spawnProjectileFromPlayer(player, now) { // creates a new basketball projectile at the player's position
    const container = this.gameEnv.container || this.gameEnv.gameContainer; // gets the DOM container to add the projectile canvas to
    if (!container) return; // safety check -> can't draw if there's no container

    const directionVector = this.getFacingDirectionVector(player); // gets a unit vector in the direction the player is facing
    const projectile = {
      x: player.position.x + (player.width || 0) / 2,   // starts at the horizontal center of the player
      y: player.position.y + (player.height || 0) / 2,  // starts at the vertical center of the player
      vx: directionVector.x * this.projectileSpeed,      // horizontal velocity based on facing direction and speed
      vy: directionVector.y * this.projectileSpeed,      // vertical velocity based on facing direction and speed
      radius: this.projectileRadius, // collision/drawing radius of the basketball
      bornAt: now,                   // timestamp of when this projectile was created (for lifetime tracking)
      canvas: document.createElement('canvas') // creates a dedicated canvas element to draw the basketball on
    };

    projectile.canvas.width = 64;  // sets the canvas to 64x64 pixels
    projectile.canvas.height = 64;
    const ctx = projectile.canvas.getContext('2d'); // gets the 2D drawing context for the canvas
    if (ctx) this.drawProjectileSprite(ctx, projectile.canvas.width, projectile.canvas.height); // draws the basketball graphic

    // Positions the canvas element absolutely over the game area
    Object.assign(projectile.canvas.style, {
      position: 'absolute', // taken out of normal document flow so it overlays the game
      width: `${projectile.radius * 2}px`,  // visual size matches the collision radius
      height: `${projectile.radius * 2}px`,
      left: `${projectile.x - projectile.radius}px`,  // centers the canvas on the projectile's x position
      top: `${(this.gameEnv.top || 0) + projectile.y - projectile.radius}px`, // centers the canvas on the projectile's y position, offset by game top
      zIndex: '1002',          // renders above game sprites but below HUD elements
      pointerEvents: 'none',   // mouse clicks pass through the canvas so it doesn't block interaction
      imageRendering: 'pixelated' // keeps pixel art crisp without blurring
    });

    container.appendChild(projectile.canvas); // adds the basketball canvas to the game container
    this.projectiles.push(projectile); // adds this projectile to the active projectiles array
  }

  getFacingDirectionVector(player) { // returns a unit vector { x, y } for the direction the player is facing
    const direction = String(player?.direction || 'down'); // reads the player's current direction, defaults to 'down'
    const vectors = { // maps each direction name to its corresponding unit vector
      up:        { x: 0,              y: -1             }, // straight up
      down:      { x: 0,              y: 1              }, // straight down
      left:      { x: -1,             y: 0              }, // straight left
      right:     { x: 1,              y: 0              }, // straight right
      upLeft:    { x: -Math.SQRT1_2,  y: -Math.SQRT1_2  }, // diagonal up-left (normalized)
      downLeft:  { x: -Math.SQRT1_2,  y: Math.SQRT1_2   }, // diagonal down-left (normalized)
      upRight:   { x: Math.SQRT1_2,   y: -Math.SQRT1_2  }, // diagonal up-right (normalized)
      downRight: { x: Math.SQRT1_2,   y: Math.SQRT1_2   }  // diagonal down-right (normalized)
    };
    return vectors[direction] || vectors.down; // returns the matching vector, falls back to 'down' if direction is unknown
  }

  drawProjectileSprite(ctx, width, height) { // draws a basketball graphic onto a canvas context
    const cx = width / 2;  // horizontal center of the canvas
    const cy = height / 2; // vertical center of the canvas
    const r = Math.min(width, height) * 0.42; // radius of the ball, sized to fit nicely in the canvas

    ctx.clearRect(0, 0, width, height); // clears any previous drawing on the canvas

    // Draws the main orange circle (the ball body)
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2); // full circle
    ctx.fillStyle = '#f68b1f'; // classic basketball orange
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#8a3d00'; // dark brown outline
    ctx.stroke();

    // Draws the horizontal seam line (curved slightly for a 3D look)
    ctx.beginPath();
    ctx.moveTo(cx - r, cy); // starts at the left edge of the ball
    ctx.quadraticCurveTo(cx, cy - 8, cx + r, cy); // slight curve upward through center
    ctx.strokeStyle = '#8a3d00'; // dark brown seam color
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draws the vertical seam line (curved slightly for a 3D look)
    ctx.beginPath();
    ctx.moveTo(cx, cy - r); // starts at the top edge of the ball
    ctx.quadraticCurveTo(cx - 8, cy, cx, cy + r); // slight curve leftward through center
    ctx.stroke();
  }

  updateProjectiles(now, lebron) { // called every frame -> moves projectiles and checks for hits on LeBron
    for (let i = this.projectiles.length - 1; i >= 0; i -= 1) { // iterates backward so removing items doesn't skip any
      const projectile = this.projectiles[i]; // gets the current projectile
      projectile.x += projectile.vx; // moves the projectile horizontally
      projectile.y += projectile.vy; // moves the projectile vertically

      if (this.isProjectileOutOfBounds(projectile) || now - projectile.bornAt > this.projectileLifeMs) {
        // removes the projectile if it flew off screen or has been alive too long
        this.removeProjectileAt(i);
        continue; // moves on to the next projectile
      }

      // Syncs the canvas element's position to match the updated projectile coordinates
      projectile.canvas.style.left = `${projectile.x - projectile.radius}px`;
      projectile.canvas.style.top = `${(this.gameEnv.top || 0) + projectile.y - projectile.radius}px`;

      if (lebron && this.isCircleHittingObject(projectile, lebron)) { // checks if this projectile hit LeBron
        this.lebronStunUntil = Math.max(this.lebronStunUntil, now + this.lebronStunDurationMs); // extends LeBron's stun timer
        lebron.velocity.x = 0; // stops LeBron's horizontal movement
        lebron.velocity.y = 0; // stops LeBron's vertical movement
        this.removeProjectileAt(i); // removes the projectile since it already hit something
      }
    }
  }

  isProjectileOutOfBounds(projectile) { // returns true if the projectile has left the visible game area
    const margin = projectile.radius * 2; // adds a small buffer so projectiles disappear just off-screen
    return (
      projectile.x < -margin ||                              // went too far left
      projectile.y < -margin ||                              // went too far up
      projectile.x > this.gameEnv.innerWidth + margin ||     // went too far right
      projectile.y > this.gameEnv.innerHeight + margin       // went too far down
    );
  }

  isCircleHittingObject(projectile, obj) { // returns true if the projectile circle overlaps with an object's hitbox rectangle
    const rect = this.getHitboxRect(obj); // gets the object's hitbox as a {left, right, top, bottom} rectangle
    const nearestX = Math.max(rect.left, Math.min(projectile.x, rect.right));   // clamps to the nearest x on the rectangle
    const nearestY = Math.max(rect.top,  Math.min(projectile.y, rect.bottom));  // clamps to the nearest y on the rectangle
    const dx = projectile.x - nearestX; // horizontal distance from circle center to nearest rectangle point
    const dy = projectile.y - nearestY; // vertical distance from circle center to nearest rectangle point
    return (dx * dx + dy * dy) <= (projectile.radius * projectile.radius); // true if inside the radius (circle-rect collision)
  }

  removeProjectileAt(index) { // removes a projectile from the screen and from the active projectiles array
    const projectile = this.projectiles[index]; // gets the projectile to remove
    if (projectile?.canvas) projectile.canvas.remove(); // removes the canvas element from the DOM
    this.projectiles.splice(index, 1); // removes the projectile object from the array
  }

  findById(id) { // searches all game objects and returns the one with the matching spriteData.id
    return this.gameEnv.gameObjects.find((obj) => obj?.spriteData?.id === id) || null; // returns null if not found
  }

  getHitboxRect(obj) { // returns the effective collision rectangle for an object, slightly inset from its full size
    const width  = obj.width  || 0; // sprite width (0 if not defined)
    const height = obj.height || 0; // sprite height (0 if not defined)
    const pos = obj.position || { x: 0, y: 0 }; // sprite's top-left position (defaults to origin)
    const widthReduction  = width  * 0.2; // insets the hitbox by 20% on each horizontal side
    const heightReduction = height * 0.2; // insets the hitbox by 20% on the vertical top side

    return {
      left:   pos.x + widthReduction,                 // left edge of hitbox
      right:  pos.x + width - widthReduction,          // right edge of hitbox
      top:    pos.y + heightReduction,                 // top edge of hitbox
      bottom: pos.y + height                           // bottom edge of hitbox (no reduction at bottom)
    };
  }

  isHitboxCollision(a, b) { // returns true if the hitboxes of two objects overlap (AABB collision detection)
    const ar = this.getHitboxRect(a); // gets object A's hitbox rectangle
    const br = this.getHitboxRect(b); // gets object B's hitbox rectangle
    return (
      ar.left   < br.right  && // A's left side is to the left of B's right side
      ar.right  > br.left   && // A's right side is to the right of B's left side
      ar.top    < br.bottom && // A's top is above B's bottom
      ar.bottom > br.top       // A's bottom is below B's top
    );
  }

  createHud() { // creates the on-screen HUD elements and adds them to the game container
    const container = this.gameEnv.container || this.gameEnv.gameContainer; // gets the parent DOM container
    if (!container) return; // safety check -> can't create HUD without a container
    const safeTop = Math.max(16, (this.gameEnv.top || 0) + 72); // calculates a safe y position to avoid overlapping the navbar

    // Removes any existing HUD elements from a previous initialization to prevent duplicates
    const oldTimer = container.querySelector('#basketball-time-hud');
    if (oldTimer) oldTimer.remove();
    const oldMessage = container.querySelector('#basketball-message-hud');
    if (oldMessage) oldMessage.remove();

    // Creates the timer/stats display in the top-left corner
    this.timeHud = document.createElement('div');
    this.timeHud.id = 'basketball-time-hud'; // ID for later lookup and cleanup
    Object.assign(this.timeHud.style, {
      position: 'fixed',       // stays in the corner even when the game scrolls
      top: `${safeTop}px`,     // positioned below the navbar
      left: '16px',            // 16px from the left edge
      zIndex: '20000',         // renders on top of nearly everything
      padding: '10px 14px',
      color: '#fff',
      background: 'rgba(0,0,0,0.78)', // semi-transparent dark background
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '15px',
      fontWeight: '700',
      border: '1px solid rgba(255,255,255,0.2)',
      boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
      pointerEvents: 'none' // mouse events pass through so this doesn't block game interaction
    });
    container.appendChild(this.timeHud); // adds the timer HUD to the game container

    // Creates the center-screen message box (e.g. "Kirby stole the ball!")
    this.messageHud = document.createElement('div');
    this.messageHud.id = 'basketball-message-hud'; // ID for later lookup and cleanup
    Object.assign(this.messageHud.style, {
      position: 'absolute',                    // positioned relative to the game container
      top: '50%',                              // vertically centered
      left: '50%',                             // horizontally centered
      transform: 'translate(-50%, -50%)',      // shifts back by half its own width/height to truly center
      zIndex: '1001',
      padding: '14px 18px',
      color: '#fdb927',                        // Lakers gold color for the text
      background: 'rgba(0,0,0,0.75)',
      border: '2px solid #fdb927',             // gold border to match text
      borderRadius: '10px',
      fontFamily: 'monospace',
      fontSize: '18px',
      fontWeight: '700',
      display: 'none',     // hidden by default -> only shown when the player is caught
      textAlign: 'center'
    });
    container.appendChild(this.messageHud); // adds the message HUD to the game container
  }

  createBottomNav() { // creates the bottom navigation bar with links to other game levels
    const oldNav = document.getElementById('basketball-bottom-nav');
    if (oldNav) oldNav.remove(); // removes any existing nav bar to prevent duplicates

    const basePath = (this.gameEnv?.path || '').replace(/\/$/, ''); // strips trailing slash from base path
    const aquaticUrl = `${basePath}/games/aquatic.html`; // URL for the Aquatic level
    const seekUrl    = `${basePath}/gamify/seek.html`;   // URL for the Seek level

    this.bottomNav = document.createElement('div');
    this.bottomNav.id = 'basketball-bottom-nav'; // ID for later cleanup
    Object.assign(this.bottomNav.style, {
      position: 'fixed',          // sticks to the bottom of the viewport
      left: '0',
      right: '0',
      bottom: '10px',             // 10px above the very bottom edge
      zIndex: '20001',            // renders on top of everything including HUD
      display: 'flex',
      justifyContent: 'center',   // centers the buttons horizontally
      gap: '10px',                // spacing between buttons
      pointerEvents: 'auto'       // allows clicking the buttons
    });

    const createNavButton = (label, url) => { // helper function -> creates a styled navigation button
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label; // sets the button's displayed text
      Object.assign(button.style, {
        background: 'rgba(255,255,255,0.12)', // semi-transparent white background
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.35)',
        borderRadius: '8px',
        padding: '8px 14px',
        fontFamily: 'monospace',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        backdropFilter: 'blur(2px)' // frosted glass blur effect behind the button
      });
      button.addEventListener('click', () => {
        window.location.href = url; // navigates to the given URL when clicked
      });
      return button;
    };

    this.bottomNav.appendChild(createNavButton('Go to Aquatic', aquaticUrl)); // adds the Aquatic level button
    this.bottomNav.appendChild(createNavButton('Go to Seek', seekUrl));       // adds the Seek level button
    document.body.appendChild(this.bottomNav); // adds the nav bar directly to the page body
  }

  updateHud() { // refreshes the HUD text with the latest time, best time, coins, and best coins
    if (!this.timeHud) return; // safety check -> do nothing if HUD hasn't been created yet
    this.timeHud.textContent =
      `Time: ${this.currentTime.toFixed(1)}s | Best: ${this.bestTime.toFixed(1)}s | ` +
      `Coins: ${this.getCoinsCollected()} | Best Coins: ${this.bestCoins}`; // formats and displays all four stats
  }

  showCaughtMessage() { // shows the "caught" message in the center of the screen
    if (!this.messageHud) return; // safety check -> do nothing if message HUD hasn't been created
    this.messageHud.innerHTML = 'Kirby stole the ball!<br>Resetting round...'; // sets the message text (two lines)
    this.messageHud.style.display = 'block'; // makes the message visible
  }

  initLeaderboard() { // creates the leaderboard UI and positions it on the right side of the screen
    if (this.leaderboard) return; // if the leaderboard already exists, don't create a duplicate
    this.leaderboard = new Leaderboard(this.gameEnv.gameControl, {
      gameName: 'Basketball',  // labels this leaderboard as belonging to the Basketball game
      initiallyHidden: false   // shows the leaderboard immediately (not collapsed)
    });
    const container = document.getElementById('leaderboard-container'); // looks up the leaderboard DOM container
    if (container) { // if the container exists, reposition it to the top-right corner
      container.style.left  = 'auto';  // removes any left positioning
      container.style.right = '20px';  // 20px from the right edge
      container.style.top   = '80px';  // 80px from the top
    }
  }

  submitRoundScore() { // calculates and submits the player's score to the leaderboard at the end of a round
    if (!this.leaderboard || this.scoreSubmittedThisRound) return; // don't submit if leaderboard missing or already submitted
    const score = Math.round((this.currentTime * 10) + (this.getCoinsCollected() * 50)); // score = 10 pts/sec survived + 50 pts/coin
    const username = (this.gameEnv?.game?.uid && String(this.gameEnv.game.uid)) || 'Player'; // uses the logged-in user's ID or 'Player'
    this.scoreSubmittedThisRound = true; // marks score as submitted to prevent double-submission

    this.leaderboard.submitScore(username, score, 'Basketball') // sends the score to the backend leaderboard
      .catch((err) => console.warn('Leaderboard score submit failed:', err)); // logs any submission errors without crashing
  }

  handleRestartKey(event) { // event handler -> fires when any key is pressed, filters for 'R' while caught
    if (event.key.toLowerCase() !== 'r' || !this.caught) return; // ignores keys that aren't 'R' or fires before being caught
    this.resetRound(); // triggers an immediate round reset
  }

  resetRound() { // resets all game state back to the beginning of a new round
    const player = this.findById('BasketballPlayer'); // looks up the player object
    const lebron = this.findById('LeBron'); // looks up LeBron's object
    const coins = this.gameEnv.gameObjects.filter((obj) => String(obj?.spriteData?.id || '').startsWith('coin_')); // finds all coin objects

    if (player) { // resets the player back to starting position and state
      player.position.x  = this.playerStart.x; // moves player to the starting x
      player.position.y  = this.playerStart.y; // moves player to the starting y
      player.velocity.x  = 0;     // clears any leftover momentum
      player.velocity.y  = 0;
      player.direction   = 'down'; // resets facing direction to default
    }

    if (lebron) { // resets LeBron back to his starting position and state
      lebron.position.x = this.chaserStart.x; // moves LeBron to starting x
      lebron.position.y = this.chaserStart.y; // moves LeBron to starting y
      lebron.velocity.x = 0;     // clears any leftover momentum
      lebron.velocity.y = 0;
      lebron.direction  = 'left'; // LeBron starts facing left
    }

    coins.forEach((coin) => { // moves each coin to a new random position within the safe spawn bounds
      if (typeof coin.randomizePosition === 'function') {
        coin.randomizePosition(); // calls the coin's built-in position randomizer
      }
    });

    this.caught               = false; // clears the "caught" flag so the game loop runs again
    this.caughtAt             = 0;     // resets the catch timestamp
    this.scoreSubmittedThisRound = false; // allows submitting a score again next round
    this.lebronStunUntil      = 0;     // clears any remaining stun on LeBron
    this.updateCoinSpawnBounds(); // recalculates coin spawn boundaries (in case screen resized)
    this.applyCoinSpawnRules();   // re-applies boundary constraints to all coin objects
    this.startTime = performance.now(); // starts the round timer from right now
    this.currentTime = 0; // resets elapsed time to zero
    if (!this.gameEnv.stats) this.gameEnv.stats = {}; // ensures stats object exists
    this.gameEnv.stats.coinsCollected = 0; // resets coin counter for the new round
    if (this.messageHud) this.messageHud.style.display = 'none'; // hides the "caught" message
    this.clearProjectiles(); // removes all active basketball projectiles from the screen
    this.updateHud(); // refreshes the HUD to show all zeros for the new round
  }

  showIntroDialogue() { // creates and shows the intro popup dialogue before the round begins
    this.introDialogue = new DialogueSystem({
      dialogues: ['Foreign explorer? Try to survive as long as you can by keeping the Ball safe!'], // the intro message text
      id: 'basketball_boss_intro' // unique ID for this dialogue instance
    });

    this.introDialogue.showDialogue(
      'Foreign explorer? Try to survive as long as you can by keeping the Ball safe!', // same message displayed in the dialogue box
      'Boss Level' // title shown at the top of the dialogue box
    );
    if (this.introDialogue.closeBtn) {
      this.introDialogue.closeBtn.style.display = 'none'; // hides the default X close button (player must click "Start" instead)
    }

    this.introDialogue.addButtons([
      {
        text: 'Start',   // button label
        primary: true,   // marks this as the primary/highlighted button
        action: () => {  // what happens when the player clicks "Start"
          this.preGameLocked = false;           // unlocks the game loop so play begins
          this.startTime = performance.now();   // sets the round start timestamp to right now
          this.currentTime = 0;                 // resets elapsed time
          this.updateHud();                     // refreshes the HUD immediately
          this.introDialogue.closeDialogue();   // closes and removes the intro dialogue
        }
      }
    ]);
  }

  updateCoinSpawnBounds() { // calculates the rectangular zone where coins are allowed to spawn (inside all barriers)
    if (!this.gameEnv.stats) this.gameEnv.stats = {}; // ensures stats object exists
    this.gameEnv.stats.coinSpawnBounds = {
      xMin: this.gameEnv.innerWidth  * 0.10, // left boundary -> just inside the left gatorade barrier (10%)
      xMax: this.gameEnv.innerWidth  * 0.88, // right boundary -> just inside the right gatorade barrier (88%)
      yMin: this.gameEnv.innerHeight * 0.19, // top boundary -> just below the top bench barrier (19%)
      yMax: this.gameEnv.innerHeight * 0.80  // bottom boundary -> just above the bottom bench barrier (80%)
    };
  }

  applyCoinSpawnRules() { // overrides each coin's randomizePosition function to respect the safe spawn bounds
    const bounds = this.gameEnv?.stats?.coinSpawnBounds;
    if (!bounds) return; // if bounds haven't been calculated yet, do nothing
    const coins = this.gameEnv.gameObjects.filter((obj) => String(obj?.spriteData?.id || '').startsWith('coin_')); // finds all coin objects

    coins.forEach((coin) => {
      if (!coin._originalRandomizePosition && typeof coin.randomizePosition === 'function') {
        coin._originalRandomizePosition = coin.randomizePosition.bind(coin); // saves the original function before overriding
      }

      coin.randomizePosition = () => { // replaces randomizePosition with a bounded version
        const xMin = bounds.xMin;
        const xMax = bounds.xMax;
        const yMin = bounds.yMin;
        const yMax = bounds.yMax;
        coin.position.x = xMin + Math.random() * Math.max(1, xMax - xMin); // picks a random x within the safe zone
        coin.position.y = yMin + Math.random() * Math.max(1, yMax - yMin); // picks a random y within the safe zone
      };

      coin.randomizePosition(); // immediately moves the coin to a valid position in the safe zone
    });
  }

  getCoinsCollected() { // returns the number of coins the player has collected this round
    return Number(this.gameEnv?.stats?.coinsCollected || 0); // safely reads from stats, returns 0 if not set
  }

  loadBestTime() { // loads the player's all-time best survival time from localStorage
    try {
      return Number(localStorage.getItem('basketball_best_time') || 0); // parses stored string back to a number
    } catch (_) {
      return 0; // returns 0 if localStorage is unavailable (e.g. private browsing)
    }
  }

  saveBestTime() { // saves the current best survival time to localStorage for persistence
    try {
      localStorage.setItem('basketball_best_time', String(this.bestTime)); // converts number to string for storage
    } catch (_) {} // silently fails if localStorage is unavailable
  }

  loadBestCoins() { // loads the player's all-time best coin count from localStorage
    try {
      return Number(localStorage.getItem('basketball_best_coins') || 0);
    } catch (_) {
      return 0;
    }
  }

  saveBestCoins() { // saves the current best coin count to localStorage for persistence
    try {
      localStorage.setItem('basketball_best_coins', String(this.bestCoins));
    } catch (_) {}
  }

  destroy() { // called when the level is unloaded -> cleans up all DOM elements and event listeners
    document.removeEventListener('keydown', this.handleRestartKey); // stops listening for the restart key
    document.removeEventListener('keydown', this.handleShootKey);   // stops listening for the shoot key
    if (this.timeHud)    this.timeHud.remove();    // removes the timer HUD from the DOM
    if (this.messageHud) this.messageHud.remove(); // removes the caught message from the DOM
    if (this.bottomNav)  this.bottomNav.remove();  // removes the bottom nav buttons from the DOM
    this.clearProjectiles(); // removes all active basketball projectiles
    if (this.leaderboard && typeof this.leaderboard.destroy === 'function') {
      this.leaderboard.destroy(); // destroys the leaderboard instance and its DOM elements
    }
    if (this.introDialogue && typeof this.introDialogue.closeDialogue === 'function') {
      this.introDialogue.closeDialogue(); // closes the intro dialogue if it's still open
    }
    // Nulls out all references to prevent memory leaks
    this.timeHud       = null;
    this.messageHud    = null;
    this.bottomNav     = null;
    this.leaderboard   = null;
    this.introDialogue = null;
  }

  clearProjectiles() { // removes all active basketball projectiles from the screen and clears the array
    this.projectiles.forEach((projectile) => projectile?.canvas?.remove()); // removes each canvas element from the DOM
    this.projectiles = []; // empties the projectiles array
  }
}

export default GameLevelBasketball; // exports this class as the default export for use in other files
export const gameLevelClasses = [GameLevelBasketball]; // named export -> used by the game engine to identify level classes
