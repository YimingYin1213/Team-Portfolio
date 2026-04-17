---
layout: post
categories: ['CSSE JavaScript']
microblog: True
codemirror: True
title: Characters, Interact, and Messages
description: A game design lesson on sprite sheets, chase logic, sprite swapping, and NPC interaction systems.
permalink: /js/characters-interact-messages
author: Lance Oberiano
---

# Characters, Interact, and Messages

This lesson introduces how sprite characters work in the game engine, then shows three different game mechanics built with characters, interaction, and message systems.

Our three logic ideas are:

- chase logic
- a menu that swaps the active sprite
- an NPC message system with an unlockable password interaction

## Real Example: `GameLevelBasketball.js`

Before building our own smaller examples, this lesson can start with a real project file from the repo: `assets/js/GameEnginev1/GameLevelBasketball.js`.

This is a strong example for **characters**, **interactions**, and **messages** because it already combines a moving player, a chasing character, keyboard input, HUD text, and interaction feedback in one level.

### How Characters Show Up in Basketball

In `GameLevelBasketball.js`, the main characters are created through sprite data objects and then added to `this.classes`.

- the player character is `BasketballPlayer`
- the chasing character is `LeBron`
- both characters use sprite sheets, scale factors, hitboxes, and starting positions

That means this file is already teaching one of the biggest ideas in this lesson: characters are not just pictures, they are data objects with movement, animation, and collision behavior.

### How Interactions Show Up in Basketball

This file also shows interaction logic in a few different ways:

- the player moves with `WASD`
- the player presses `E` to shoot
- LeBron chases the player using distance math
- collisions between the player and chaser trigger the caught state
- projectile hits can stun the chaser

So even though this is a basketball-themed level, it is still a characters/interact/messages lesson because the gameplay is built from characters reacting to one another.

### How Messages Show Up in Basketball

Messages are important because they tell the player what is happening.

In this file, messages and UI appear through:

- the intro dialogue before the round starts
- the HUD for time and coins
- the caught message after a collision
- score and best-score feedback

That gives students a good reminder that messages are not only NPC dialogue boxes. Messages can also be status text, instructions, warnings, and score updates.

{% capture challenge_basketball %}
Basketball example using the real `GameLevelBasketball.js` file. Move with WASD, press E to shoot, and observe how characters, interaction logic, and messages work together.
{% endcapture %}

{% capture code_basketball %}
import GameControl from '/assets/js/GameEnginev1/essentials/GameControl.js';
import GameEnvBackground from '/assets/js/GameEnginev1/essentials/GameEnvBackground.js';
import Player from '/assets/js/GameEnginev1/essentials/Player.js';
import Npc from '/assets/js/GameEnginev1/essentials/Npc.js';

class BasketballLessonLevel {
  constructor(gameEnv) {
    this.gameEnv = gameEnv;
    const width = gameEnv.innerWidth;
    const height = gameEnv.innerHeight;
    const path = gameEnv.path;

    this.playerStart = { x: Math.round(width * 0.12), y: Math.round(height * 0.68) };
    this.chaserStart = { x: Math.round(width * 0.72), y: Math.round(height * 0.55) };
    this.caught = false;
    this.caughtAt = 0;
    this.roundResetDelayMs = 1400;
    this.startTime = 0;
    this.currentTime = 0;
    this.preGameLocked = false;
    this.messageHud = null;
    this.timeHud = null;
    this.projectiles = [];
    this.projectileSpeed = 9;
    this.projectileRadius = 10;
    this.projectileLifeMs = 2200;
    this.shootCooldownMs = 1200;
    this.lastShotAt = -Infinity;
    this.lebronStunUntil = 0;
    this.lebronStunDurationMs = 2000;
    this.handleShootKey = this.handleShootKey.bind(this);

    const image_data_court = {
      id: 'BasketballCourt',
      src: path + '/images/gamebuilder/bg/BaskCourt.png',
      pixels: { height: 720, width: 1478 }
    };

    const sprite_data_player = {
      id: 'BasketballPlayer',
      greeting: 'Ball handler ready.',
      src: path + '/images/gamebuilder/sprites/astro.png',
      SCALE_FACTOR: 11,
      STEP_FACTOR: 1000,
      ANIMATION_RATE: 110,
      INIT_POSITION: { ...this.playerStart },
      pixels: { height: 770, width: 513 },
      orientation: { rows: 4, columns: 4 },
      down: { row: 0, start: 0, columns: 4 },
      left: { row: 1, start: 0, columns: 4 },
      right: { row: 2, start: 0, columns: 4 },
      up: { row: 3, start: 0, columns: 4 },
      downRight: { row: 2, start: 0, columns: 4 },
      downLeft: { row: 1, start: 0, columns: 4 },
      upRight: { row: 2, start: 0, columns: 4 },
      upLeft: { row: 1, start: 0, columns: 4 },
      hitbox: { widthPercentage: 0.45, heightPercentage: 0.5 },
      keypress: { up: 87, left: 65, down: 83, right: 68 }
    };

    const sprite_data_chaser = {
      id: 'LeBron',
      greeting: 'You reached LeBron.',
      src: path + '/images/gamebuilder/sprites/kirby.png',
      SCALE_FACTOR: 7,
      ANIMATION_RATE: 8,
      INIT_POSITION: { ...this.chaserStart },
      pixels: { height: 36, width: 569 },
      orientation: { rows: 1, columns: 13 },
      down: { row: 0, start: 0, columns: 13 },
      left: { row: 0, start: 0, columns: 13 },
      right: { row: 0, start: 0, columns: 13 },
      up: { row: 0, start: 0, columns: 13 },
      downRight: { row: 0, start: 0, columns: 13 },
      downLeft: { row: 0, start: 0, columns: 13 },
      upRight: { row: 0, start: 0, columns: 13 },
      upLeft: { row: 0, start: 0, columns: 13 },
      hitbox: { widthPercentage: 0.2, heightPercentage: 0.2 },
      reaction: function () {}
    };

    this.classes = [
      { class: GameEnvBackground, data: image_data_court },
      { class: Player, data: sprite_data_player },
      { class: Npc, data: sprite_data_chaser }
    ];
  }

  initialize() {
    this.createHud();
    this.startTime = performance.now();
    document.addEventListener('keydown', this.handleShootKey);
  }

  createHud() {
    this.timeHud = document.createElement('div');
    this.timeHud.style.position = 'fixed';
    this.timeHud.style.top = '90px';
    this.timeHud.style.left = '20px';
    this.timeHud.style.zIndex = '1000';
    this.timeHud.style.padding = '10px 14px';
    this.timeHud.style.background = 'rgba(0,0,0,0.75)';
    this.timeHud.style.color = 'white';
    this.timeHud.style.borderRadius = '10px';
    this.timeHud.style.fontFamily = 'monospace';
    document.body.appendChild(this.timeHud);

    this.messageHud = document.createElement('div');
    this.messageHud.style.position = 'fixed';
    this.messageHud.style.top = '140px';
    this.messageHud.style.left = '20px';
    this.messageHud.style.zIndex = '1000';
    this.messageHud.style.padding = '10px 14px';
    this.messageHud.style.background = 'rgba(0,0,0,0.75)';
    this.messageHud.style.color = 'white';
    this.messageHud.style.borderRadius = '10px';
    this.messageHud.style.fontFamily = 'monospace';
    this.messageHud.style.display = 'none';
    document.body.appendChild(this.messageHud);
  }

  findById(id) {
    return this.gameEnv.gameObjects.find((obj) => obj?.spriteData?.id === id);
  }

  update() {
    const player = this.findById('BasketballPlayer');
    const lebron = this.findById('LeBron');
    if (!player || !lebron) return;

    const now = performance.now();
    this.updateProjectiles(now, lebron);

    if (!this.caught) {
      this.currentTime = (now - this.startTime) / 1000;
      this.timeHud.textContent = 'Time: ' + this.currentTime.toFixed(1) + 's | Controls: WASD move, E shoot';
    }

    if (this.caught) {
      if (now - this.caughtAt >= this.roundResetDelayMs) {
        this.resetRound();
      }
      return;
    }

    if (now < this.lebronStunUntil) {
      lebron.velocity.x = 0;
      lebron.velocity.y = 0;
      return;
    }

    const dx = player.position.x - lebron.position.x;
    const dy = player.position.y - lebron.position.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return;

    const speed = 2.2;
    lebron.position.x += (dx / dist) * speed;
    lebron.position.y += (dy / dist) * speed;
    lebron.position.x = Math.max(0, Math.min(lebron.position.x, this.gameEnv.innerWidth - (lebron.width || 0)));
    lebron.position.y = Math.max(0, Math.min(lebron.position.y, this.gameEnv.innerHeight - (lebron.height || 0)));

    if (Math.abs(dx) > Math.abs(dy)) {
      lebron.direction = dx >= 0 ? 'right' : 'left';
    } else {
      lebron.direction = dy >= 0 ? 'down' : 'up';
    }

    if (this.isHitboxCollision(player, lebron)) {
      this.caught = true;
      this.caughtAt = now;
      this.messageHud.innerHTML = 'Kirby stole the ball!<br>Resetting round...';
      this.messageHud.style.display = 'block';
    }
  }

  handleShootKey(event) {
    if (event.key.toLowerCase() !== 'e' || event.repeat) return;
    if (this.caught) return;
    const now = performance.now();
    if (now - this.lastShotAt < this.shootCooldownMs) return;

    const player = this.findById('BasketballPlayer');
    if (!player) return;

    const directionMap = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
      upRight: { x: 1, y: -1 },
      upLeft: { x: -1, y: -1 },
      downRight: { x: 1, y: 1 },
      downLeft: { x: -1, y: 1 }
    };

    const vector = directionMap[player.direction] || { x: 1, y: 0 };
    const magnitude = Math.hypot(vector.x, vector.y) || 1;
    const dir = { x: vector.x / magnitude, y: vector.y / magnitude };

    const projectile = {
      x: player.position.x + (player.width || 0) / 2,
      y: player.position.y + (player.height || 0) / 2,
      vx: dir.x * this.projectileSpeed,
      vy: dir.y * this.projectileSpeed,
      radius: this.projectileRadius,
      bornAt: now,
      canvas: document.createElement('canvas')
    };

    projectile.canvas.width = this.projectileRadius * 2;
    projectile.canvas.height = this.projectileRadius * 2;
    projectile.canvas.style.position = 'absolute';
    projectile.canvas.style.zIndex = '8';
    const ctx = projectile.canvas.getContext('2d');
    ctx.fillStyle = '#ff8c00';
    ctx.beginPath();
    ctx.arc(this.projectileRadius, this.projectileRadius, this.projectileRadius, 0, Math.PI * 2);
    ctx.fill();

    this.gameEnv.container.appendChild(projectile.canvas);
    this.projectiles.push(projectile);
    this.lastShotAt = now;
  }

  updateProjectiles(now, lebron) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      projectile.x += projectile.vx;
      projectile.y += projectile.vy;
      projectile.canvas.style.left = projectile.x + 'px';
      projectile.canvas.style.top = projectile.y + 'px';

      const expired = now - projectile.bornAt > this.projectileLifeMs;
      const offscreen =
        projectile.x < 0 ||
        projectile.y < 0 ||
        projectile.x > this.gameEnv.innerWidth ||
        projectile.y > this.gameEnv.innerHeight;

      if (expired || offscreen) {
        projectile.canvas.remove();
        this.projectiles.splice(i, 1);
        continue;
      }

      if (lebron && this.isCircleHittingObject(projectile, lebron)) {
        this.lebronStunUntil = Math.max(this.lebronStunUntil, now + this.lebronStunDurationMs);
        projectile.canvas.remove();
        this.projectiles.splice(i, 1);
        this.messageHud.textContent = 'Nice shot! Kirby is stunned.';
        this.messageHud.style.display = 'block';
      }
    }
  }

  isHitboxCollision(a, b) {
    const aRect = a.canvas.getBoundingClientRect();
    const bRect = b.canvas.getBoundingClientRect();
    return (
      aRect.left < bRect.right &&
      aRect.right > bRect.left &&
      aRect.top < bRect.bottom &&
      aRect.bottom > bRect.top
    );
  }

  isCircleHittingObject(circle, obj) {
    const objRect = obj.canvas.getBoundingClientRect();
    const objLeft = obj.position.x;
    const objTop = obj.position.y;
    const objRight = objLeft + objRect.width;
    const objBottom = objTop + objRect.height;
    const closestX = Math.max(objLeft, Math.min(circle.x, objRight));
    const closestY = Math.max(objTop, Math.min(circle.y, objBottom));
    const dx = circle.x - closestX;
    const dy = circle.y - closestY;
    return (dx * dx + dy * dy) <= (circle.radius * circle.radius);
  }

  resetRound() {
    const player = this.findById('BasketballPlayer');
    const lebron = this.findById('LeBron');

    if (player) {
      player.position.x = this.playerStart.x;
      player.position.y = this.playerStart.y;
      player.velocity.x = 0;
      player.velocity.y = 0;
      player.direction = 'down';
    }

    if (lebron) {
      lebron.position.x = this.chaserStart.x;
      lebron.position.y = this.chaserStart.y;
      lebron.velocity.x = 0;
      lebron.velocity.y = 0;
      lebron.direction = 'left';
    }

    this.caught = false;
    this.caughtAt = 0;
    this.lebronStunUntil = 0;
    this.startTime = performance.now();
    this.currentTime = 0;
    this.messageHud.style.display = 'none';
    this.clearProjectiles();
  }

  clearProjectiles() {
    this.projectiles.forEach((projectile) => projectile?.canvas?.remove());
    this.projectiles = [];
  }

  destroy() {
    document.removeEventListener('keydown', this.handleShootKey);
    if (this.timeHud) this.timeHud.remove();
    if (this.messageHud) this.messageHud.remove();
    this.clearProjectiles();
  }
}

export const gameLevelClasses = [BasketballLessonLevel];
export { GameControl };
{% endcapture %}

{% include game-runner.html
   runner_id="characters-interact-basketball"
   challenge=challenge_basketball
   code=code_basketball
%}

### Build It in GameBuilder: Basketball Setup

If you want to introduce this lesson through GameBuilder first, students can sketch the main basketball ideas there before reading the smaller examples below.

Suggested setup in GameBuilder:

- background: a court-style background like `BaskCourt`
- player sprite: `astro` or another athlete-like sprite
- NPC sprite: `kirby` or another chasing sprite
- place the player on the left side of the court
- place the chaser on the right side
- then move to Freestyle mode to add the real chase, projectile, HUD, and message logic from `GameLevelBasketball.js`

Open the full builder in a new tab if you want more room: [GameBuilder]({{site.baseurl}}/team-space-portal/gamebuilder)

<iframe
  src="{{site.baseurl}}/team-space-portal/gamebuilder"
  style="width: 100%; height: 850px; border: none; border-radius: 12px; margin-top: 12px;"
  loading="lazy"
  allowfullscreen
></iframe>

## Quick Sprite Sheet Definitions

A **sprite sheet** is one image that stores many animation frames for a character.

- `src`: the image file path for the sprite sheet
- `pixels`: the total width and height of the whole sprite sheet image
- `orientation`: how many rows and columns of frames are in that image
- `down`, `up`, `left`, `right`: which row and frame range should be used for each movement direction
- `INIT_POSITION`: where the sprite starts on the screen
- `SCALE_FACTOR`: how large the sprite appears in the game
- `STEP_FACTOR`: how quickly the character moves
- `hitbox`: the collision area used for interaction

A simple sprite definition looks like this:

```javascript
const playerData = {
  id: 'playerData',
  src: path + '/images/gamebuilder/sprites/boysprite.png',
  SCALE_FACTOR: 5,
  STEP_FACTOR: 1000,
  ANIMATION_RATE: 50,
  INIT_POSITION: { x: 80, y: 320 },
  pixels: { height: 612, width: 408 },
  orientation: { rows: 4, columns: 3 },
  down: { row: 0, start: 0, columns: 3 },
  right: { row: 1, start: 0, columns: 3 },
  left: { row: 2, start: 0, columns: 3 },
  up: { row: 3, start: 0, columns: 3 }
};
```

The background is usually simpler because it is just one large image stretched across the canvas.

## 1. Chase Logic

This first example shows a player sprite and a second sprite that continuously moves toward the player. This is useful for enemies, guards, or boss fights.

Focus on this pattern:

```javascript
const dx = player.position.x - this.position.x;
const dy = player.position.y - this.position.y;
const dist = Math.hypot(dx, dy) || 1;

this.position.x += (dx / dist) * speed;
this.position.y += (dy / dist) * speed;
```

That math makes the chasing character move in the correct direction without teleporting.

{% capture challenge0 %}
Chase logic demo. Use WASD to move and watch the Kirby sprite follow your player.
{% endcapture %}

{% capture code0 %}
import GameControl from '/assets/js/GameEnginev1/essentials/GameControl.js';
import GameEnvBackground from '/assets/js/GameEnginev1/essentials/GameEnvBackground.js';
import Player from '/assets/js/GameEnginev1/essentials/Player.js';
import Character from '/assets/js/GameEnginev1/essentials/Character.js';

class ChaseNpc extends Character {
  update() {
    const player = this.gameEnv.gameObjects.find((obj) => obj?.spriteData?.id === 'playerData');
    if (player) {
      const dx = player.position.x - this.position.x;
      const dy = player.position.y - this.position.y;
      const dist = Math.hypot(dx, dy) || 1;
      const speed = 1.8;

      this.position.x += (dx / dist) * speed;
      this.position.y += (dy / dist) * speed;

      this.position.x = Math.max(0, Math.min(this.position.x, this.gameEnv.innerWidth - (this.width || 0)));
      this.position.y = Math.max(0, Math.min(this.position.y, this.gameEnv.innerHeight - (this.height || 0)));

      if (Math.abs(dx) > Math.abs(dy)) {
        this.direction = dx >= 0 ? 'right' : 'left';
      } else {
        this.direction = dy >= 0 ? 'down' : 'up';
      }
    }
    super.update();
  }
}

class ChaseLevel {
  constructor(gameEnv) {
    const path = gameEnv.path;
    const width = gameEnv.innerWidth;
    const height = gameEnv.innerHeight;

    const backgroundData = {
      id: 'chaseBackground',
      src: path + '/images/gamebuilder/bg/clouds.jpg',
      pixels: { height: 720, width: 1280 }
    };

    const playerData = {
      id: 'playerData',
      src: path + '/images/gamebuilder/sprites/boysprite.png',
      SCALE_FACTOR: 5,
      STEP_FACTOR: 1000,
      ANIMATION_RATE: 50,
      INIT_POSITION: { x: Math.round(width * 0.12), y: Math.round(height * 0.62) },
      pixels: { height: 612, width: 408 },
      orientation: { rows: 4, columns: 3 },
      down: { row: 0, start: 0, columns: 3 },
      downRight: { row: 1, start: 0, columns: 3, rotate: Math.PI / 16 },
      downLeft: { row: 2, start: 0, columns: 3, rotate: -Math.PI / 16 },
      left: { row: 2, start: 0, columns: 3 },
      right: { row: 1, start: 0, columns: 3 },
      up: { row: 3, start: 0, columns: 3 },
      upLeft: { row: 2, start: 0, columns: 3, rotate: Math.PI / 16 },
      upRight: { row: 1, start: 0, columns: 3, rotate: -Math.PI / 16 },
      hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
      keypress: { up: 87, left: 65, down: 83, right: 68 }
    };

    const chaserData = {
      id: 'kirbyChaser',
      src: path + '/images/gamebuilder/sprites/kirby.png',
      SCALE_FACTOR: 7,
      ANIMATION_RATE: 8,
      INIT_POSITION: { x: Math.round(width * 0.72), y: Math.round(height * 0.28) },
      pixels: { height: 36, width: 569 },
      orientation: { rows: 1, columns: 13 },
      down: { row: 0, start: 0, columns: 13 },
      left: { row: 0, start: 0, columns: 13 },
      right: { row: 0, start: 0, columns: 13 },
      up: { row: 0, start: 0, columns: 13 },
      downRight: { row: 0, start: 0, columns: 13 },
      downLeft: { row: 0, start: 0, columns: 13 },
      upRight: { row: 0, start: 0, columns: 13 },
      upLeft: { row: 0, start: 0, columns: 13 },
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.1 }
    };

    this.classes = [
      { class: GameEnvBackground, data: backgroundData },
      { class: Player, data: playerData },
      { class: ChaseNpc, data: chaserData }
    ];
  }
}

export const gameLevelClasses = [ChaseLevel];
export { GameControl };
{% endcapture %}

{% include game-runner.html
   runner_id="characters-interact-messages-0"
   challenge=challenge0
   code=code0
%}

### Build It in GameBuilder: Chase Logic

Use GameBuilder to create the scene first, then move to Freestyle mode and add the chase behavior.

Suggested setup in GameBuilder:

- background: `clouds`
- player sprite: `boysprite`
- NPC sprite: `kirby`
- place the player on the left side
- place the chasing NPC on the right side
- after generating the base code, add the `dx`, `dy`, and `Math.hypot()` chase logic from this lesson

Open the full builder in a new tab if you want more room: [GameBuilder]({{site.baseurl}}/team-space-portal/gamebuilder)

<iframe
  src="{{site.baseurl}}/team-space-portal/gamebuilder"
  style="width: 100%; height: 850px; border: none; border-radius: 12px; margin-top: 12px;"
  loading="lazy"
  allowfullscreen
></iframe>

## 2. Sprite Swap Menu

This second example keeps the same player logic but changes the sprite sheet using menu buttons. This is a great pattern for character selection screens or outfit systems.

The important idea is that the player object stays the same, but the `spriteData` and `spriteSheet` image get replaced.

{% capture challenge1 %}
Sprite swap demo. Use the on-screen buttons to switch the player skin while the game is running.
{% endcapture %}

{% capture code1 %}
import GameControl from '/assets/js/GameEnginev1/essentials/GameControl.js';
import GameEnvBackground from '/assets/js/GameEnginev1/essentials/GameEnvBackground.js';
import Player from '/assets/js/GameEnginev1/essentials/Player.js';

const cloneData = (data) => JSON.parse(JSON.stringify(data));

class SkinPlayer extends Player {
  applySkin(skinData) {
    const savedPosition = { ...this.position };
    const savedKeys = this.spriteData?.keypress || this.keypress;

    this.spriteData = {
      ...cloneData(skinData),
      id: 'playerData',
      INIT_POSITION: savedPosition,
      keypress: savedKeys
    };
    this.hitbox = this.spriteData.hitbox || {};
    this.scaleFactor = this.spriteData.SCALE_FACTOR;
    this.stepFactor = this.spriteData.STEP_FACTOR;
    this.animationRate = this.spriteData.ANIMATION_RATE;
    this.frameIndex = 0;
    this.frameCounter = 0;
    this.direction = 'down';

    this.spriteSheet = new Image();
    this.spriteReady = false;
    this.spriteSheet.onload = () => {
      this.spriteReady = true;
      this.resize();
    };
    this.spriteSheet.src = this.spriteData.src;
  }
}

class SpriteSwapLevel {
  constructor(gameEnv) {
    const path = gameEnv.path;
    const width = gameEnv.innerWidth;
    const height = gameEnv.innerHeight;

    this.skins = {
      'Chill Guy': {
        src: path + '/images/gamify/chillguy.png',
        SCALE_FACTOR: 5,
        STEP_FACTOR: 1000,
        ANIMATION_RATE: 50,
        pixels: { height: 512, width: 384 },
        orientation: { rows: 4, columns: 3 },
        down: { row: 0, start: 0, columns: 3 },
        downRight: { row: 1, start: 0, columns: 3, rotate: Math.PI / 16 },
        downLeft: { row: 2, start: 0, columns: 3, rotate: -Math.PI / 16 },
        left: { row: 2, start: 0, columns: 3 },
        right: { row: 1, start: 0, columns: 3 },
        up: { row: 3, start: 0, columns: 3 },
        upLeft: { row: 2, start: 0, columns: 3, rotate: Math.PI / 16 },
        upRight: { row: 1, start: 0, columns: 3, rotate: -Math.PI / 16 },
        hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 }
      },
      'Astronaut': {
        src: path + '/images/gamebuilder/sprites/astro.png',
        SCALE_FACTOR: 11,
        STEP_FACTOR: 1000,
        ANIMATION_RATE: 80,
        pixels: { height: 770, width: 513 },
        orientation: { rows: 4, columns: 4 },
        down: { row: 0, start: 0, columns: 4 },
        left: { row: 1, start: 0, columns: 4 },
        right: { row: 2, start: 0, columns: 4 },
        up: { row: 3, start: 0, columns: 4 },
        downRight: { row: 2, start: 0, columns: 4 },
        downLeft: { row: 1, start: 0, columns: 4 },
        upRight: { row: 2, start: 0, columns: 4 },
        upLeft: { row: 1, start: 0, columns: 4 },
        hitbox: { widthPercentage: 0.45, heightPercentage: 0.45 }
      },
      'Boy Sprite': {
        src: path + '/images/gamebuilder/sprites/boysprite.png',
        SCALE_FACTOR: 5,
        STEP_FACTOR: 1000,
        ANIMATION_RATE: 50,
        pixels: { height: 612, width: 408 },
        orientation: { rows: 4, columns: 3 },
        down: { row: 0, start: 0, columns: 3 },
        downRight: { row: 1, start: 0, columns: 3, rotate: Math.PI / 16 },
        downLeft: { row: 2, start: 0, columns: 3, rotate: -Math.PI / 16 },
        left: { row: 2, start: 0, columns: 3 },
        right: { row: 1, start: 0, columns: 3 },
        up: { row: 3, start: 0, columns: 3 },
        upLeft: { row: 2, start: 0, columns: 3, rotate: Math.PI / 16 },
        upRight: { row: 1, start: 0, columns: 3, rotate: -Math.PI / 16 },
        hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 }
      }
    };

    this.currentSkinName = 'Chill Guy';
    this.panel = null;
    this.status = null;

    const backgroundData = {
      id: 'swapBackground',
      src: path + '/images/gamify/forest.png',
      pixels: { height: 720, width: 1280 }
    };

    const playerData = {
      id: 'playerData',
      INIT_POSITION: { x: Math.round(width * 0.18), y: Math.round(height * 0.62) },
      keypress: { up: 87, left: 65, down: 83, right: 68 },
      ...cloneData(this.skins[this.currentSkinName])
    };

    this.classes = [
      { class: GameEnvBackground, data: backgroundData },
      { class: SkinPlayer, data: playerData }
    ];
  }

  initialize() {
    this.createPanel();
  }

  findPlayer() {
    return this.gameEnv.gameObjects.find((obj) => obj?.spriteData?.id === 'playerData');
  }

  createPanel() {
    const container = this.gameEnv.container;
    container.style.position = 'relative';

    this.panel = document.createElement('div');
    this.panel.style.position = 'absolute';
    this.panel.style.top = '12px';
    this.panel.style.left = '12px';
    this.panel.style.zIndex = '20';
    this.panel.style.background = 'rgba(0, 0, 0, 0.75)';
    this.panel.style.color = 'white';
    this.panel.style.padding = '12px';
    this.panel.style.borderRadius = '10px';
    this.panel.style.fontFamily = 'monospace';
    this.panel.style.display = 'flex';
    this.panel.style.flexDirection = 'column';
    this.panel.style.gap = '8px';

    const title = document.createElement('div');
    title.textContent = 'Choose a sprite';
    title.style.fontWeight = 'bold';
    this.panel.appendChild(title);

    this.status = document.createElement('div');
    this.status.textContent = 'Current skin: ' + this.currentSkinName;
    this.panel.appendChild(this.status);

    Object.keys(this.skins).forEach((skinName) => {
      const button = document.createElement('button');
      button.textContent = skinName;
      button.style.cursor = 'pointer';
      button.style.padding = '6px 10px';
      button.onclick = () => this.swapSkin(skinName);
      this.panel.appendChild(button);
    });

    container.appendChild(this.panel);
  }

  swapSkin(skinName) {
    const player = this.findPlayer();
    if (!player) return;
    this.currentSkinName = skinName;
    player.applySkin(this.skins[skinName]);
    if (this.status) {
      this.status.textContent = 'Current skin: ' + skinName;
    }
  }

  destroy() {
    if (this.panel) {
      this.panel.remove();
      this.panel = null;
    }
  }
}

export const gameLevelClasses = [SpriteSwapLevel];
export { GameControl };
{% endcapture %}

{% include game-runner.html
   runner_id="characters-interact-messages-1"
   challenge=challenge1
   code=code1
%}

### Build It in GameBuilder: Sprite Swap Menu

Use the GameBuilder workspace below to make a base version of the sprite swap scene, then move to Freestyle mode to add the menu logic.

Suggested setup in GameBuilder:

- background: `forest`
- player sprite: start with `chillguy`
- player controls: `WASD`
- no NPCs required for the base scene
- after generating code, add the sprite swap menu logic from the lesson to create the button-based character switching

Open the full builder in a new tab if you want more room: [GameBuilder]({{site.baseurl}}/team-space-portal/gamebuilder)

<iframe
  src="{{site.baseurl}}/team-space-portal/gamebuilder"
  style="width: 100%; height: 850px; border: none; border-radius: 12px; margin-top: 12px;"
  loading="lazy"
  allowfullscreen
></iframe>

## 3. NPC Messages and Interaction Logic

This final example focuses on character interaction. The player can talk to one NPC to learn a password, then use that information with a second NPC.

This is a good lesson example because it combines:

- character collisions
- interaction with the `E` key
- dialogue boxes and buttons
- game state that changes after a message is read

{% capture challenge2 %}
NPC interaction demo. Walk into an NPC and press E to talk. Learn the password from the guide, then visit the gatekeeper.
{% endcapture %}

{% capture code2 %}
import GameControl from '/assets/js/GameEnginev1/essentials/GameControl.js';
import GameEnvBackground from '/assets/js/GameEnginev1/essentials/GameEnvBackground.js';
import Player from '/assets/js/GameEnginev1/essentials/Player.js';
import Npc from '/assets/js/GameEnginev1/essentials/Npc.js';

class InteractionLevel {
  constructor(gameEnv) {
    this.gameEnv = gameEnv;
    const path = gameEnv.path;
    const width = gameEnv.innerWidth;
    const height = gameEnv.innerHeight;
    const level = this;

    this.questState = {
      hasPassword: false,
      gateUnlocked: false
    };
    this.banner = null;

    const backgroundData = {
      id: 'interactionBackground',
      src: path + '/images/gamify/mcbg.jpg',
      pixels: { height: 720, width: 1280 }
    };

    const playerData = {
      id: 'playerData',
      src: path + '/images/gamebuilder/sprites/boysprite.png',
      SCALE_FACTOR: 5,
      STEP_FACTOR: 1000,
      ANIMATION_RATE: 50,
      INIT_POSITION: { x: Math.round(width * 0.12), y: Math.round(height * 0.62) },
      pixels: { height: 612, width: 408 },
      orientation: { rows: 4, columns: 3 },
      down: { row: 0, start: 0, columns: 3 },
      downRight: { row: 1, start: 0, columns: 3, rotate: Math.PI / 16 },
      downLeft: { row: 2, start: 0, columns: 3, rotate: -Math.PI / 16 },
      left: { row: 2, start: 0, columns: 3 },
      right: { row: 1, start: 0, columns: 3 },
      up: { row: 3, start: 0, columns: 3 },
      upLeft: { row: 2, start: 0, columns: 3, rotate: Math.PI / 16 },
      upRight: { row: 1, start: 0, columns: 3, rotate: -Math.PI / 16 },
      hitbox: { widthPercentage: 0.45, heightPercentage: 0.2 },
      keypress: { up: 87, left: 65, down: 83, right: 68 }
    };

    const guideNpc = {
      id: 'Guide',
      greeting: false,
      src: path + '/images/gamify/villager.png',
      SCALE_FACTOR: 6,
      ANIMATION_RATE: 100,
      pixels: { width: 700, height: 1400 },
      INIT_POSITION: { x: Math.round(width * 0.38), y: Math.round(height * 0.58) },
      orientation: { rows: 1, columns: 1 },
      down: { row: 0, start: 0, columns: 1 },
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },
      dialogues: ['Need a clue?'],
      reaction: function () {},
      interact: function () {
        if (!level.questState.hasPassword) {
          this.dialogueSystem.showDialogue('The password is PIXEL. Bring it to the gatekeeper on the right.', 'Guide', this.spriteData.src);
          this.dialogueSystem.addButtons([
            {
              text: 'Memorize it',
              primary: true,
              action: () => {
                level.questState.hasPassword = true;
                level.updateBanner('Password learned: PIXEL');
                this.dialogueSystem.showDialogue('Nice. Now go prove that you listened.', 'Guide', this.spriteData.src);
              }
            }
          ]);
        } else {
          this.dialogueSystem.showDialogue('You already know the password. Talk to the gatekeeper next.', 'Guide', this.spriteData.src);
        }
      }
    };

    const gatekeeperNpc = {
      id: 'Gatekeeper',
      greeting: false,
      src: path + '/images/gamify/r2_idle.png',
      SCALE_FACTOR: 8,
      ANIMATION_RATE: 100,
      pixels: { width: 505, height: 223 },
      INIT_POSITION: { x: Math.round(width * 0.72), y: Math.round(height * 0.58) },
      orientation: { rows: 1, columns: 3 },
      down: { row: 0, start: 0, columns: 3 },
      hitbox: { widthPercentage: 0.1, heightPercentage: 0.2 },
      dialogues: ['Only prepared players may pass.'],
      reaction: function () {},
      interact: function () {
        if (!level.questState.hasPassword) {
          this.dialogueSystem.showDialogue('No password, no access. Find the guide first.', 'Gatekeeper', this.spriteData.src);
          return;
        }

        if (!level.questState.gateUnlocked) {
          this.dialogueSystem.showDialogue('Correct. PIXEL is the answer. The gate is now unlocked.', 'Gatekeeper', this.spriteData.src);
          this.dialogueSystem.addButtons([
            {
              text: 'Unlock gate',
              primary: true,
              action: () => {
                level.questState.gateUnlocked = true;
                level.updateBanner('Gate unlocked. Message systems can change the game state.');
              }
            }
          ]);
        } else {
          this.dialogueSystem.showDialogue('The gate is already open. Great job using interaction logic.', 'Gatekeeper', this.spriteData.src);
        }
      }
    };

    this.classes = [
      { class: GameEnvBackground, data: backgroundData },
      { class: Player, data: playerData },
      { class: Npc, data: guideNpc },
      { class: Npc, data: gatekeeperNpc }
    ];
  }

  initialize() {
    this.createBanner();
    this.updateBanner('Walk into an NPC and press E to interact.');
  }

  createBanner() {
    const container = this.gameEnv.container;
    container.style.position = 'relative';

    this.banner = document.createElement('div');
    this.banner.style.position = 'absolute';
    this.banner.style.top = '12px';
    this.banner.style.left = '50%';
    this.banner.style.transform = 'translateX(-50%)';
    this.banner.style.zIndex = '20';
    this.banner.style.background = 'rgba(10, 10, 10, 0.82)';
    this.banner.style.color = '#ffffff';
    this.banner.style.padding = '10px 14px';
    this.banner.style.borderRadius = '10px';
    this.banner.style.fontFamily = 'monospace';
    this.banner.style.textAlign = 'center';
    this.banner.style.minWidth = '320px';

    container.appendChild(this.banner);
  }

  updateBanner(message) {
    if (this.banner) {
      this.banner.textContent = message;
    }
  }

  destroy() {
    if (this.banner) {
      this.banner.remove();
      this.banner = null;
    }
  }
}

export const gameLevelClasses = [InteractionLevel];
export { GameControl };
{% endcapture %}

{% include game-runner.html
   runner_id="characters-interact-messages-2"
   challenge=challenge2
   code=code2
%}

### Build It in GameBuilder: NPC Messages and Interaction Logic

Use the GameBuilder workspace below to build the background, player, and NPC positions first. After that, switch to Freestyle mode and add the custom interaction logic from this lesson.

Suggested setup in GameBuilder:

- background: `mcbg` style scene or any environment you want for conversation
- player sprite: `boysprite`
- NPC 1: a guide character on the left
- NPC 2: a gatekeeper character on the right
- add dialogue text for both NPCs in the builder first
- then edit the generated code so the guide gives the password and the gatekeeper checks whether the password has been learned

This is a good workflow because GameBuilder handles placement and asset setup, while Freestyle mode lets you add the more advanced message-state logic.

Open the full builder in a new tab if you want more room: [GameBuilder]({{site.baseurl}}/team-space-portal/gamebuilder)

<iframe
  src="{{site.baseurl}}/team-space-portal/gamebuilder"
  style="width: 100%; height: 850px; border: none; border-radius: 12px; margin-top: 12px;"
  loading="lazy"
  allowfullscreen
></iframe>

## Wrap Up

By the end of this lesson, students should be able to explain how sprite sheets define movement frames, how a character can chase another object using position math, how a menu can change sprite data, and how dialogue or interaction systems can update game state.

A good extension activity would be asking students to build a fourth mechanic of their own, like a follower NPC, a shopkeeper, or a collectible that unlocks new dialogue.
