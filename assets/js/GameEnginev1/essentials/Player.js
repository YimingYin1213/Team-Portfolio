import Character from './Character.js';
import TouchControls from './TouchControls.js';

// Define non-mutable constants as defaults
const SCALE_FACTOR = 25; // 1/nth of the height of the canvas
const STEP_FACTOR = 100; // 1/nth, or N steps up and across the canvas
const ANIMATION_RATE = 1; // 1/nth of the frame rate
const INIT_POSITION = { x: 0, y: 0 };


class Player extends Character {
    // Static counter for unique player IDs (uninitialized)
    static playerCount;
    /**
     * The constructor method is called when a new Player object is created.
     * 
     * @param {Object|null} data - The sprite data for the object. If null, a default red square is used.
     */
    constructor(data = null, gameEnv = null) {
        super(data, gameEnv);
        // Increment static player counter and assign unique id
        Player.playerCount = (Player.playerCount || 0) + 1;
        this.id = data?.id ? data.id.toLowerCase() : `player${Player.playerCount}`;
        this.keypress = data?.keypress || {up: 87, left: 65, down: 83, right: 68};
        this.touchOptions = data?.touchOptions || {interactLabel: "e", position: "left"};
        this.touchOptions.id = `touch-controls-${this.id}`;
        this.touchOptions.mapping = this.keypress;
        this.pressedKeys = {}; // active keys array
        this.bindMovementKeyListners();
        this.gravity = data.GRAVITY || false;
        this.acceleration = 0.001;
        this.time = 0;
        this.moved = false;
        // Initialize touch controls for mobile devices
        this.touchControls = new TouchControls(gameEnv, this.touchOptions);
    }

    /**
     * Binds key event listeners to handle object movement.
     * 
     * This method binds keydown and keyup event listeners to handle object movement.
     * The .bind(this) method ensures that 'this' refers to the object object.
     */
    bindMovementKeyListners() {
        addEventListener('keydown', this.handleKeyDown.bind(this));
        addEventListener('keyup', this.handleKeyUp.bind(this));
    }

    handleKeyDown({ keyCode }) {
        // capture the pressed key in the active keys array
        this.pressedKeys[keyCode] = true;
        // set the velocity and direction based on the newly pressed key
        this.updateVelocity();
        this.updateDirection();
    }

    /**
     * Handles key up events to stop the player's velocity.
     * 
     * This method stops the player's velocity based on the key released.
     * 
     * @param {Object} event - The keyup event object.
     */
    handleKeyUp({ keyCode }) {
        // remove the lifted key from the active keys array
        if (keyCode in this.pressedKeys) {
            delete this.pressedKeys[keyCode];
        }
        // adjust the velocity and direction based on the remaining keys
        this.updateVelocity();
        this.updateDirection();
    }

    /**
     * Update the player's velocity and direction based on the pressed keys.
     */

    updateVelocity() {
        this.velocity.x = 0;
        this.velocity.y = 0;

        const horizontal = (this.pressedKeys[this.keypress.right] ? 1 : 0) - (this.pressedKeys[this.keypress.left] ? 1 : 0);
        const vertical = (this.pressedKeys[this.keypress.down] ? 1 : 0) - (this.pressedKeys[this.keypress.up] ? 1 : 0);
        const hasHorizontal = horizontal !== 0;
        const hasVertical = vertical !== 0;
        const diagonalScale = (hasHorizontal && hasVertical) ? Math.SQRT1_2 : 1;

        this.velocity.x = horizontal * this.xVelocity * diagonalScale;
        this.velocity.y = vertical * this.yVelocity * diagonalScale;
        this.moved = hasHorizontal || hasVertical;
    }

    updateDirection() {
        const horizontal = (this.pressedKeys[this.keypress.right] ? 1 : 0) - (this.pressedKeys[this.keypress.left] ? 1 : 0);
        const vertical = (this.pressedKeys[this.keypress.down] ? 1 : 0) - (this.pressedKeys[this.keypress.up] ? 1 : 0);

        if (horizontal === 0 && vertical === 0) return;

        if (horizontal < 0 && vertical < 0) {
            this.direction = "upLeft";
        } else if (horizontal < 0 && vertical > 0) {
            this.direction = "downLeft";
        } else if (horizontal > 0 && vertical < 0) {
            this.direction = "upRight";
        } else if (horizontal > 0 && vertical > 0) {
            this.direction = "downRight";
        } else if (vertical < 0) {
            this.direction = "up";
        } else if (vertical > 0) {
            this.direction = "down";
        } else if (horizontal > 0) {
            this.direction = "right";
        } else if (horizontal < 0) {
            this.direction = "left";
        }
    }

    update() {
        super.update();
        if(!this.moved){
            if (this.gravity) {
                    this.time += 1;
                    this.velocity.y += 0.5 + this.acceleration * this.time;
                }
            }
        else{
            this.time = 0;
        }
        }
        
    /**
     * Overrides the reaction to the collision to handle
     *  - clearing the pressed keys array
     *  - stopping the player's velocity
     *  - updating the player's direction   
     * @param {*} other - The object that the player is colliding with
     */
    handleCollisionReaction(other) {    
        // Do NOT clear pressed keys; keep walking animation active
        // Halt movement by zeroing velocity along collision axis

        // Avoid DOM-based push-out; rely on velocity zeroing only
            // Do NOT clear pressed keys; keep walking animation active
            // Halt movement by zeroing velocity along the touched axes; avoid DOM-based push-out
            try {
                const touchPoints = this.collisionData?.touchPoints?.this;
                if (touchPoints) {
                    // Horizontal block
                    if (touchPoints.left || touchPoints.right) {
                        this.velocity.x = 0;
                    }
                    // Vertical block
                    if (touchPoints.top || touchPoints.bottom) {
                        this.velocity.y = 0;
                    }
                }
            } catch (_) {}

        super.handleCollisionReaction(other);
    }

    /**
     * Toggle touch controls visibility (useful for debugging or user preference)
     */
    toggleTouchControls() {
        if (this.touchControls) {
            this.touchControls.toggle();
        }
    }

    /**
     * Show touch controls explicitly
     */
    showTouchControls() {
        if (this.touchControls) {
            this.touchControls.show();
        }
    }

    /**
     * Hide touch controls explicitly  
     */
    hideTouchControls() {
        if (this.touchControls) {
            this.touchControls.hide();
        }
    }

    /**
     * Show the interact button when near an NPC
     */
    showInteractButton() {
        if (this.touchControls) {
            this.touchControls.showInteractButton();
        }
    }

    /**
     * Hide the interact button when not near an NPC
     */
    hideInteractButton() {
        if (this.touchControls) {
            this.touchControls.hideInteractButton();
        }
    }

    /**
     * Check if interact button is currently visible
     */
    isInteractButtonVisible() {
        return this.touchControls ? this.touchControls.isInteractButtonVisible() : false;
    }

    /**
     * Clean up resources when player is destroyed
     */
    destroy() {
        if (this.touchControls) {
            this.touchControls.destroy();
        }
        super.destroy?.();
    }


}

export default Player;
