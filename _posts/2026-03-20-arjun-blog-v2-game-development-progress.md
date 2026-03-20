---
layout: post
title: "Arjun's Blog V2: Game Development Progress - Custom Seek Level"
description: "Progress update on a custom seek-and-find level built with the GameBuilder engine."
permalink: /blog/arjun-v2-seek-level
---

## Game Development Progress Blog - Custom Seek Level

### Overview
In this update, I created a custom level called `GameLevelSeek` using the GameBuilder engine. The goal of this level is simple: the player must navigate the map and find the hidden NPC.

### What I Built
This level includes:

- A background environment
- A controllable player
- An NPC (Kirby) to find
- Multiple invisible barriers to shape the map

### Background Setup
I added a custom background image:

- File: `tagplayground.png`
- This acts as the main map where the player moves around

### Player Mechanics
The player character:

- Uses WASD controls for movement
- Has animations for all directions (up, down, left, right, diagonals)
- Starts at position `(32, 300)`

I also configured:

- Animation speed
- Sprite scaling
- Movement speed

### NPC Interaction
I added an NPC (Kirby) that the player must find.

Key features:

- Positioned far from the starting point to encourage exploration
- Displays the message: "Oh you found me" when interacted with
- Ends the level after interaction

This creates a simple seek-and-find objective.

### Barriers and Map Design
To make the level more interesting, I added multiple invisible barriers:

- These prevent the player from walking through certain areas
- They help guide movement and create a maze-like layout
- All barriers are hidden (`visible: false`) for a cleaner look

### Game Structure
All elements are added to the game using:

```javascript
this.classes = [
  GameEnvBackground,
  Player,
  Npc,
  Barrier
];
```

Each object is passed with custom data to control its behavior and placement.

### Goal of the Level
The objective is:

- Move around the map
- Avoid obstacles
- Find the NPC
- Interact to win

### Challenges Faced

- Positioning barriers correctly without blocking the player completely
- Getting NPC interaction to properly end the level
- Adjusting player movement and animation to feel smooth

### Next Steps

- Make Kirby invisible and make it jump out
- Introduce a timer or scoring system
- Improve map complexity
- Add sound effects or background music
