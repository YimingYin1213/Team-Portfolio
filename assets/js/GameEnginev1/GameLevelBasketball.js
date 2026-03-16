// Adventure Game Custom Level - Basketball Evasion
// Fully self-contained — no external sprites or backgrounds required.
//
// How to use:
// 1) Save as assets/js/GameEnginev1/GameLevelBasketball.js
// 2) Import and add to your gameLevelClasses array:
//    import GameLevelBasketball from '/portfolio/assets/js/GameEnginev1/GameLevelBasketball.js';
//    export const gameLevelClasses = [GameLevelBasketball];

import GameEnvBackground from './essentials/GameEnvBackground.js';

class GameLevelBasketball {
    constructor(gameEnv) {
        // Minimal engine registration — no external assets needed
        this.classes = [];

        const width  = gameEnv.innerWidth  || window.innerWidth;
        const height = gameEnv.innerHeight || window.innerHeight;

        // Boot the game after the engine has finished its own setup tick
        setTimeout(() => this._boot(width, height), 200);
    }

    _boot(W, H) {
        // ── Remove any leftover canvas from a previous load ────────────────
        const old = document.getElementById('bball-evasion');
        if (old) old.remove();

        // ── Create fullscreen canvas ───────────────────────────────────────
        const canvas = document.createElement('canvas');
        canvas.id = 'bball-evasion';
        canvas.width  = W;
        canvas.height = H;
        canvas.setAttribute('tabindex', '0');
        canvas.style.cssText = `
            display: block;
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            z-index: 9999;
            outline: none;
        `;
        document.body.appendChild(canvas);
        canvas.focus();

        const ctx = canvas.getContext('2d');

        // ── Court colours ─────────────────────────────────────────────────
        const C = {
            floor:      '#C8843A',
            floorDark:  '#B5722F',
            line:       'rgba(255,255,255,0.85)',
            paint:      'rgba(180,90,30,0.45)',
            bench:      '#8B7355',
            benchLeg:   '#6B5335',
            gatorGreen: '#2E7D32',
            gatorYellow:'#FDD835',
            gatorRed:   '#C62828',
            crowd:      '#455A64',
            wall:       '#4E342E',
            backboard:  '#ECEFF1',
            rim:        '#E65100',
            ball:       '#E65100',
            ballLine:   '#1A1A1A',
            sky:        '#1A237E',
            // player colours
            pSkin:  '#D4845A',
            pJersey:'#E53935',
            pShorts:'#1565C0',
            pShoe:  '#212121',
            // LeBron colours
            lSkin:  '#8D5524',
            lJersey:'#552583',  // Lakers purple
            lShorts:'#552583',
            lNumber:'#FDB927',  // Lakers gold
            lShoe:  '#1A1A1A',
        };

        // ── Obstacles (benches + Gatorade cart) ───────────────────────────
        // Defined as {x, y, w, h} in absolute px — positioned to look natural
        // on the court. Adjusted after W/H are known.
        const makeObs = () => [
            // Left bench
            { x: W*0.18, y: H*0.55, w: W*0.12, h: H*0.10, type:'bench' },
            // Right bench
            { x: W*0.35, y: H*0.55, w: W*0.12, h: H*0.10, type:'bench' },
            // Gatorade cart
            { x: W*0.58, y: H*0.52, w: W*0.08, h: H*0.20, type:'gator' },
            // Hard boundary walls (invisible, just prevent leaving)
            { x: 0,      y: 0,      w: 2,       h: H,      type:'wall'  },
            { x: W-2,    y: 0,      w: 2,       h: H,      type:'wall'  },
            { x: 0,      y: 0,      w: W,       h: 2,      type:'wall'  },
            { x: 0,      y: H-2,    w: W,       h: 2,      type:'wall'  },
        ];

        let OBS = makeObs();

        // ── Game constants ────────────────────────────────────────────────
        const P_R       = 14;   // player radius (collision circle)
        const L_R       = 18;   // LeBron radius
        const P_SPEED   = 3.8;
        const L_SPEED_0 = 1.6;  // LeBron starts slow
        const L_SPEED_X = 4.2;  // LeBron max speed (ramps over time)
        const CATCH_R   = P_R + L_R + 2;

        // ── State ─────────────────────────────────────────────────────────
        let player, lebron, keys, gameOver, caught, startTime, elapsed, bestTime, tick;
        bestTime = 0;

        const reset = () => {
            player    = { x: W*0.10, y: H*0.50, dir:'right', frame:0, moving:false };
            lebron    = { x: W*0.88, y: H*0.50, dir:'left',  frame:0 };
            keys      = {};
            gameOver  = false;
            caught    = false;
            startTime = Date.now();
            elapsed   = 0;
            tick      = 0;
            OBS       = makeObs();
        };
        reset();

        // ── Input ─────────────────────────────────────────────────────────
        window.addEventListener('keydown', e => {
            keys[e.key.toLowerCase()] = true;
            if (['arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase()))
                e.preventDefault();
        });
        window.addEventListener('keyup', e => {
            keys[e.key.toLowerCase()] = false;
            if (e.key.toLowerCase() === 'r' && gameOver) reset();
        });

        // ── Collision: circle vs axis-aligned rect ─────────────────────────
        const circleHitsRect = (cx, cy, r, rx, ry, rw, rh) => {
            const nearX = Math.max(rx, Math.min(cx, rx + rw));
            const nearY = Math.max(ry, Math.min(cy, ry + rh));
            const dx = cx - nearX, dy = cy - nearY;
            return dx*dx + dy*dy < r*r;
        };
        const anyHit = (cx, cy, r) =>
            OBS.some(o => circleHitsRect(cx, cy, r, o.x, o.y, o.w, o.h));

        // ── Draw helpers ──────────────────────────────────────────────────

        // Pixelart-style person: cx/cy = foot-centre
        // jersey, shorts, skin, number string, hat colour
        const drawPerson = (cx, cy, facingRight, jersey, shorts, skin, numStr, hatCol, r) => {
            const s = r / 14; // scale factor (r=14 → s=1)
            const fx = facingRight ? 1 : -1;

            ctx.save();
            ctx.translate(cx, cy);

            // Shoes
            ctx.fillStyle = C.pShoe;
            ctx.fillRect(fx*2*s - 8*s, -4*s,  8*s, 4*s);
            ctx.fillRect(fx*2*s,        -4*s,  8*s, 4*s);

            // Legs / shorts
            ctx.fillStyle = shorts;
            ctx.fillRect(-8*s, -20*s, 16*s, 16*s);

            // Body / jersey
            ctx.fillStyle = jersey;
            ctx.fillRect(-10*s, -38*s, 20*s, 18*s);

            // Arms
            ctx.fillStyle = skin;
            ctx.fillRect(-16*s, -37*s, 6*s, 12*s);
            ctx.fillRect( 10*s, -37*s, 6*s, 12*s);

            // Jersey number
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${Math.round(8*s)}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(numStr, 0, -29*s);

            // Head
            ctx.fillStyle = skin;
            ctx.beginPath();
            ctx.arc(0, -48*s, 10*s, 0, Math.PI*2);
            ctx.fill();

            // Hat / headband
            ctx.fillStyle = hatCol;
            ctx.fillRect(-10*s, -56*s, 20*s, 5*s);

            // Eyes
            ctx.fillStyle = '#111';
            ctx.fillRect(fx*3*s, -50*s, 3*s, 3*s);

            ctx.restore();
        };

        // Basketball (bounces with a sine offset)
        const drawBall = (cx, cy, bounceOffset) => {
            const r = 10;
            ctx.save();
            ctx.translate(cx, cy + bounceOffset);
            ctx.fillStyle = C.ball;
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = C.ballLine; ctx.lineWidth = 1.2;
            // seam lines
            ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI, false);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke();
            ctx.restore();
        };

        // Court background
        const drawCourt = () => {
            // Floor planks
            ctx.fillStyle = C.floor;
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = C.floorDark;
            for (let x = 0; x < W; x += W/28) {
                ctx.fillRect(x, 0, W/56, H);
            }

            // Back wall
            ctx.fillStyle = C.wall;
            ctx.fillRect(0, 0, W, H * 0.38);

            // Crowd silhouettes (simple row of heads)
            ctx.fillStyle = C.crowd;
            for (let i = 0; i < 22; i++) {
                const bx = W * 0.08 + i * (W * 0.84 / 21);
                const by = H * 0.10 + (i % 3) * (H * 0.03);
                ctx.beginPath();
                ctx.arc(bx, by, W * 0.018, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(bx - W*0.009, by, W*0.018, H*0.05);
            }

            // Court lines
            ctx.strokeStyle = C.line;
            ctx.lineWidth = 2;
            // Outer boundary
            ctx.strokeRect(W*0.04, H*0.40, W*0.92, H*0.56);
            // Centre circle
            ctx.beginPath();
            ctx.arc(W/2, H*0.68, W*0.09, 0, Math.PI*2);
            ctx.stroke();
            // Centre line
            ctx.beginPath();
            ctx.moveTo(W/2, H*0.40);
            ctx.lineTo(W/2, H*0.96);
            ctx.stroke();
            // Left paint
            ctx.fillStyle = C.paint;
            ctx.fillRect(W*0.04, H*0.55, W*0.14, H*0.27);
            ctx.strokeRect(W*0.04, H*0.55, W*0.14, H*0.27);
            // Right paint
            ctx.fillStyle = C.paint;
            ctx.fillRect(W*0.82, H*0.55, W*0.14, H*0.27);
            ctx.strokeRect(W*0.82, H*0.55, W*0.14, H*0.27);
            // Free-throw arcs
            ctx.beginPath(); ctx.arc(W*0.18, H*0.68, W*0.06, Math.PI*0.5, Math.PI*1.5); ctx.stroke();
            ctx.beginPath(); ctx.arc(W*0.82, H*0.68, W*0.06, Math.PI*1.5, Math.PI*0.5); ctx.stroke();

            // Hoops
            const drawHoop = (x, y) => {
                // Backboard
                ctx.fillStyle = C.backboard;
                ctx.fillRect(x - 2, y - H*0.04, 4, H*0.10);
                ctx.strokeStyle = '#555'; ctx.lineWidth = 1;
                ctx.strokeRect(x - 2, y - H*0.04, 4, H*0.10);
                // Rim
                ctx.strokeStyle = C.rim; ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(x + (x < W/2 ? 1 : -1) * W*0.03, y + H*0.01, W*0.028, 0, Math.PI*2);
                ctx.stroke();
                // Net lines
                ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 1;
                for (let i = -3; i <= 3; i++) {
                    ctx.beginPath();
                    const rx = x + (x < W/2 ? 1 : -1) * W*0.028 + i * W*0.009;
                    ctx.moveTo(rx, y + H*0.01);
                    ctx.lineTo(rx + i * W*0.004, y + H*0.06);
                    ctx.stroke();
                }
                ctx.beginPath();
                ctx.moveTo(x + (x < W/2 ? 1 : -1) * W*0.003, y + H*0.04);
                ctx.lineTo(x + (x < W/2 ? 1 : -1) * W*0.055, y + H*0.04);
                ctx.stroke();
            };
            drawHoop(W*0.04, H*0.55);
            drawHoop(W*0.96, H*0.55);

            // HOOPS centre text
            ctx.fillStyle = 'rgba(255,255,255,0.18)';
            ctx.font = `bold ${Math.round(W*0.055)}px monospace`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('HOOPS', W/2, H*0.68);
        };

        // Obstacles (benches + Gatorade)
        const drawObstacles = () => {
            OBS.forEach(o => {
                if (o.type === 'bench') {
                    // Bench seat
                    ctx.fillStyle = C.bench;
                    ctx.fillRect(o.x, o.y, o.w, o.h * 0.4);
                    // Legs
                    ctx.fillStyle = C.benchLeg;
                    ctx.fillRect(o.x + o.w*0.08, o.y + o.h*0.4, o.w*0.12, o.h*0.55);
                    ctx.fillRect(o.x + o.w*0.80, o.y + o.h*0.4, o.w*0.12, o.h*0.55);
                }
                if (o.type === 'gator') {
                    // Barrel body
                    ctx.fillStyle = C.gatorGreen;
                    ctx.beginPath();
                    ctx.roundRect(o.x, o.y + o.h*0.2, o.w, o.h*0.75, 6);
                    ctx.fill();
                    // Gatorade bolt
                    ctx.fillStyle = C.gatorYellow;
                    ctx.font = `bold ${Math.round(o.w*0.55)}px monospace`;
                    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillText('G', o.x + o.w/2, o.y + o.h*0.58);
                    // Cups on top
                    ctx.fillStyle = C.gatorRed;
                    ctx.fillRect(o.x + o.w*0.1, o.y + o.h*0.08, o.w*0.28, o.h*0.14);
                    ctx.fillRect(o.x + o.w*0.5, o.y + o.h*0.05, o.w*0.28, o.h*0.17);
                    // Wheels
                    ctx.fillStyle = '#333';
                    ctx.beginPath(); ctx.arc(o.x + o.w*0.25, o.y + o.h*0.96, o.w*0.12, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.arc(o.x + o.w*0.75, o.y + o.h*0.96, o.w*0.12, 0, Math.PI*2); ctx.fill();
                }
            });
        };

        // ── Update ────────────────────────────────────────────────────────
        const update = () => {
            if (gameOver) return;
            elapsed = (Date.now() - startTime) / 1000;
            tick++;

            // Player
            let dx = 0, dy = 0;
            if (keys['w'] || keys['arrowup'])    { dy = -P_SPEED; player.dir = 'up';    }
            if (keys['s'] || keys['arrowdown'])  { dy =  P_SPEED; player.dir = 'down';  }
            if (keys['a'] || keys['arrowleft'])  { dx = -P_SPEED; player.dir = 'left';  }
            if (keys['d'] || keys['arrowright']) { dx =  P_SPEED; player.dir = 'right'; }
            player.moving = !!(dx || dy);

            if (!anyHit(player.x + dx, player.y, P_R)) player.x += dx;
            if (!anyHit(player.x, player.y + dy, P_R)) player.y += dy;
            if (player.moving && tick % 7 === 0) player.frame++;

            // LeBron chase
            const spd = Math.min(L_SPEED_0 + elapsed * 0.04, L_SPEED_X);
            const ddx = player.x - lebron.x;
            const ddy = player.y - lebron.y;
            const dist = Math.sqrt(ddx*ddx + ddy*ddy);

            if (dist > 2) {
                const nx = (ddx/dist) * spd;
                const ny = (ddy/dist) * spd;
                lebron.dir = Math.abs(ddx) > Math.abs(ddy)
                    ? (ddx > 0 ? 'right' : 'left')
                    : (ddy > 0 ? 'down'  : 'up');

                if      (!anyHit(lebron.x + nx, lebron.y, L_R)) lebron.x += nx;
                else if (!anyHit(lebron.x, lebron.y + ny, L_R)) lebron.y += ny;
                else {
                    for (const s of [{ x:-ny, y:nx }, { x:ny, y:-nx }]) {
                        if (!anyHit(lebron.x + s.x*0.9, lebron.y + s.y*0.9, L_R)) {
                            lebron.x += s.x*0.9; lebron.y += s.y*0.9; break;
                        }
                    }
                }
                if (tick % 7 === 0) lebron.frame++;
            }

            if (dist < CATCH_R) {
                caught = gameOver = true;
                if (elapsed > bestTime) bestTime = elapsed;
            }
        };

        // ── Render ────────────────────────────────────────────────────────
        const render = () => {
            ctx.clearRect(0, 0, W, H);
            drawCourt();
            drawObstacles();

            // Ball bounces near the player's feet
            const bounce = Math.sin(tick * 0.25) * 5;
            drawBall(player.x + (player.dir === 'left' ? -20 : 20), player.y - 10, bounce);

            // Draw player (red jersey #11)
            drawPerson(
                player.x, player.y,
                player.dir !== 'left',
                C.pJersey, C.pShorts, C.pSkin,
                '11', C.pJersey, P_R
            );

            // Draw LeBron (purple jersey #23)
            drawPerson(
                lebron.x, lebron.y,
                lebron.dir !== 'left',
                C.lJersey, C.lShorts, C.lSkin,
                '23', C.lNumber, L_R
            );

            // HUD bar
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.68)';
            ctx.beginPath();
            ctx.roundRect(W/2 - 160, 10, 320, 38, 9);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.round(W*0.013)}px monospace`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`⏱  ${elapsed.toFixed(1)}s     Best: ${bestTime.toFixed(1)}s`, W/2, 29);
            ctx.restore();

            // Speed warning (LeBron getting faster)
            const spd = Math.min(L_SPEED_0 + elapsed * 0.04, L_SPEED_X);
            if (spd > 3.0) {
                ctx.save();
                ctx.fillStyle = `rgba(220,50,50,${Math.min((spd-3.0)*0.4, 0.7)})`;
                ctx.font = `bold ${Math.round(W*0.012)}px monospace`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText("⚡ LeBron is heating up!", W/2, 60);
                ctx.restore();
            }

            // Controls hint
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.48)';
            ctx.beginPath(); ctx.roundRect(8, H-28, 270, 20, 4); ctx.fill();
            ctx.fillStyle = '#ccc';
            ctx.font = '11px monospace';
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText('Move: WASD / Arrow Keys   |   R = restart', 14, H-18);
            ctx.restore();

            // Caught screen
            if (caught) {
                ctx.save();
                ctx.fillStyle = 'rgba(0,0,0,0.75)';
                ctx.fillRect(0, 0, W, H);

                const bw = Math.min(460, W*0.7), bh = 240;
                const bx = (W-bw)/2, by = (H-bh)/2;
                ctx.fillStyle = '#1a1a2e';
                ctx.strokeStyle = '#FDB927';
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 16); ctx.fill(); ctx.stroke();

                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

                ctx.fillStyle = '#FDB927';
                ctx.font = `bold ${Math.round(W*0.025)}px monospace`;
                ctx.fillText('🏀  LeBron stole the ball!', W/2, by+55);

                ctx.fillStyle = '#ff6600';
                ctx.font = `bold ${Math.round(W*0.020)}px monospace`;
                ctx.fillText(`You survived  ${elapsed.toFixed(1)}s`, W/2, by+105);

                ctx.fillStyle = '#aaa';
                ctx.font = `${Math.round(W*0.014)}px monospace`;
                ctx.fillText(`Best: ${bestTime.toFixed(1)}s`, W/2, by+148);

                ctx.fillStyle = '#fff';
                ctx.font = `${Math.round(W*0.013)}px monospace`;
                ctx.fillText('Press  R  to play again', W/2, by+185);
                ctx.restore();
            }
        };

        // ── Loop ──────────────────────────────────────────────────────────
        (function loop() {
            update();
            render();
            requestAnimationFrame(loop);
        })();
    }
}

export default GameLevelBasketball;