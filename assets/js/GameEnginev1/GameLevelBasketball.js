// Adventure Game Custom Level - Basketball Evasion
// Save as assets/js/GameEnginev1/GameLevelBasketball.js
//
// How to use:
// 1) Save as assets/js/GameEnginev1/GameLevelBasketball.js
// 2) Import and add to your gameLevelClasses array:
//    import GameLevelBasketball from '/portfolio/assets/js/GameEnginev1/GameLevelBasketball.js';
//    export const gameLevelClasses = [GameLevelBasketball];

import GameEnvBackground from './essentials/GameEnvBackground.js';

class GameLevelBasketball {
    constructor(gameEnv) {
        this.classes = [];
        const W = gameEnv.innerWidth  || window.innerWidth;
        const H = gameEnv.innerHeight || window.innerHeight;
        setTimeout(() => this._boot(W, H), 200);
    }

    _boot(W, H) {
        const old = document.getElementById('bball-evasion');
        if (old) old.remove();

        const canvas = document.createElement('canvas');
        canvas.id = 'bball-evasion';
        canvas.width  = W;
        canvas.height = H;
        canvas.setAttribute('tabindex', '0');
        canvas.style.cssText = `
            display:block; position:fixed; top:0; left:0;
            width:100vw; height:100vh; z-index:9999; outline:none;
        `;
        document.body.appendChild(canvas);
        canvas.focus();
        const ctx = canvas.getContext('2d');

        // ── Obstacles: randomly scattered but reproducible ─────────────────
        // Each is {x,y,w,h,type}. We keep a margin from spawn points.
        const MARGIN = 80;
        const obstacles = [ //
            // Fixed obstacles so layout is always fair -> arrays
            { x: W*0.28, y: H*0.30, w: W*0.10, h: H*0.06, type:'bench'  },
            { x: W*0.55, y: H*0.58, w: W*0.10, h: H*0.06, type:'bench'  },
            { x: W*0.38, y: H*0.62, w: W*0.08, h: H*0.06, type:'bench'  },
            { x: W*0.20, y: H*0.64, w: W*0.07, h: H*0.18, type:'gator'  },
            { x: W*0.65, y: H*0.28, w: W*0.07, h: H*0.18, type:'gator'  },
            { x: W*0.46, y: H*0.38, w: W*0.06, h: H*0.14, type:'cone'   },
            // boundary walls
            { x:0,    y:0,    w:4,  h:H, type:'wall' },
            { x:W-4,  y:0,    w:4,  h:H, type:'wall' },
            { x:0,    y:0,    w:W,  h:4, type:'wall' },
            { x:0,    y:H-4,  w:W,  h:4, type:'wall' },
        ];

        // ── Sizes ─────────────────────────────────────────────────────────
        const PR = 13;   // player collision radius
        const LR = 16;   // LeBron collision radius

        // ── State ─────────────────────────────────────────────────────────
        let player, lebron, keys, gameOver, caught, startTime, elapsed, bestTime, tick;
        bestTime = 0;

        const reset = () => {
            // Player spawns left side, LeBron spawns right side
            player    = { x: W*0.08, y: H*0.50, dir:'right', frame:0, moving:false };
            lebron    = { x: W*0.90, y: H*0.50, dir:'left',  frame:0 };
            keys      = {};
            gameOver  = false;
            caught    = false;
            startTime = Date.now();
            elapsed   = 0;
            tick      = 0;
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

        // ── Collision: circle vs AABB ──────────────────────────────────────
        const circVsRect = (cx, cy, r, rx, ry, rw, rh) => {
            const nearX = Math.max(rx, Math.min(cx, rx+rw));
            const nearY = Math.max(ry, Math.min(cy, ry+rh));
            const dx = cx - nearX, dy = cy - nearY;
            return dx*dx + dy*dy < r*r;
        };
        const blocked = (cx, cy, r) =>
            obstacles.some(o => circVsRect(cx, cy, r, o.x, o.y, o.w, o.h));

        // ── Draw: court ────────────────────────────────────────────────────
        const drawCourt = () => {
            // Dark background / arena
            ctx.fillStyle = '#1a1a2a';
            ctx.fillRect(0, 0, W, H);

            // Court surface — rich hardwood
            const woodGrad = ctx.createLinearGradient(0, 0, W, 0);
            woodGrad.addColorStop(0,   '#b5651d');
            woodGrad.addColorStop(0.5, '#cd853f');
            woodGrad.addColorStop(1,   '#b5651d');
            ctx.fillStyle = woodGrad;
            ctx.fillRect(0, 0, W, H);

            // Wood plank lines
            ctx.strokeStyle = 'rgba(100,50,0,0.25)';
            ctx.lineWidth = 1;
            for (let x = 0; x < W; x += W/32) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
            }

            // ── Court markings ─────────────────────────────────────────────
            ctx.strokeStyle = 'rgba(255,255,255,0.80)';
            ctx.lineWidth = 2.5;

            // Outer boundary
            const pad = 30;
            ctx.strokeRect(pad, pad, W - pad*2, H - pad*2);

            // Half-court line
            ctx.beginPath();
            ctx.moveTo(W/2, pad);
            ctx.lineTo(W/2, H - pad);
            ctx.stroke();

            // Centre circle
            ctx.beginPath();
            ctx.arc(W/2, H/2, Math.min(W, H)*0.12, 0, Math.PI*2);
            ctx.stroke();

            // Three-point arcs (left + right)
            const arcR = Math.min(W, H) * 0.30;
            ctx.beginPath();
            ctx.arc(pad, H/2, arcR, -Math.PI*0.45, Math.PI*0.45);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(W - pad, H/2, arcR, Math.PI*0.55, Math.PI*1.45);
            ctx.stroke();

            // Paint boxes (left + right)
            const pW = W * 0.14, pH = H * 0.38;
            ctx.fillStyle = 'rgba(180,80,20,0.25)';
            ctx.fillRect(pad, H/2 - pH/2, pW, pH);
            ctx.strokeRect(pad, H/2 - pH/2, pW, pH);
            ctx.fillRect(W - pad - pW, H/2 - pH/2, pW, pH);
            ctx.strokeRect(W - pad - pW, H/2 - pH/2, pW, pH);

            // Free-throw circles
            ctx.beginPath();
            ctx.arc(pad + pW, H/2, pH*0.25, 0, Math.PI*2);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(W - pad - pW, H/2, pH*0.25, 0, Math.PI*2);
            ctx.stroke();

            // ── Hoops ──────────────────────────────────────────────────────
            drawHoop(pad + 8, H/2, 1);   // left hoop, facing right
            drawHoop(W - pad - 8, H/2, -1); // right hoop, facing left
        };

        const drawHoop = (bx, by, dir) => {
            const rimR   = Math.min(W, H) * 0.032;
            const rimX   = bx + dir * rimR * 2.2;

            // Backboard
            ctx.fillStyle = '#e8e8e8';
            ctx.fillRect(bx - 3, by - H*0.09, 6, H*0.18);
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(bx - 3, by - H*0.09, 6, H*0.18);

            // Inner box on backboard
            ctx.strokeStyle = '#e53935';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(bx - 3, by - H*0.04, 6, H*0.08);

            // Support arm
            ctx.strokeStyle = '#555';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(rimX, by);
            ctx.stroke();

            // Rim (circle, orange)
            ctx.strokeStyle = '#e65100';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(rimX, by, rimR, 0, Math.PI*2);
            ctx.stroke();

            // Net — 8 strings hanging down
            ctx.strokeStyle = 'rgba(255,255,255,0.7)';
            ctx.lineWidth = 1;
            const netH = rimR * 1.8;
            for (let i = 0; i <= 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                const topX  = rimX + Math.cos(angle) * rimR;
                const topY  = by   + Math.sin(angle) * rimR * 0.4;
                ctx.beginPath();
                ctx.moveTo(topX, topY);
                ctx.lineTo(rimX + Math.cos(angle)*rimR*0.3, by + netH);
                ctx.stroke();
            }
            // Net bottom ring
            ctx.beginPath();
            ctx.arc(rimX, by + netH*0.85, rimR*0.35, 0, Math.PI*2);
            ctx.stroke();
        };

        // ── Draw: obstacles ────────────────────────────────────────────────
        const drawObstacles = () => {
            obstacles.forEach(o => {
                if (o.type === 'wall') return;

                if (o.type === 'bench') {
                    // Shadow
                    ctx.fillStyle = 'rgba(0,0,0,0.18)';
                    ctx.fillRect(o.x+4, o.y+4, o.w, o.h*0.45);
                    // Seat
                    ctx.fillStyle = '#8d6e4a';
                    ctx.fillRect(o.x, o.y, o.w, o.h*0.38);
                    ctx.fillStyle = '#a0825a';
                    ctx.fillRect(o.x+2, o.y+2, o.w-4, 4);
                    // Legs
                    ctx.fillStyle = '#5d4037';
                    const lw = o.w*0.1, lh = o.h*0.6;
                    ctx.fillRect(o.x + o.w*0.08, o.y + o.h*0.38, lw, lh);
                    ctx.fillRect(o.x + o.w*0.50, o.y + o.h*0.38, lw, lh);
                    ctx.fillRect(o.x + o.w*0.82, o.y + o.h*0.38, lw, lh);
                }

                if (o.type === 'gator') {
                    // Shadow
                    ctx.fillStyle = 'rgba(0,0,0,0.20)';
                    ctx.beginPath(); ctx.ellipse(o.x+o.w/2+4, o.y+o.h+4, o.w*0.45, o.h*0.07, 0, 0, Math.PI*2); ctx.fill();
                    // Body
                    ctx.fillStyle = '#2e7d32';
                    ctx.beginPath(); ctx.roundRect(o.x, o.y, o.w, o.h*0.80, 8); ctx.fill();
                    // Stripe
                    ctx.fillStyle = '#1b5e20';
                    ctx.fillRect(o.x, o.y + o.h*0.35, o.w, o.h*0.12);
                    // G logo
                    ctx.fillStyle = '#fdd835';
                    ctx.font = `bold ${Math.round(o.w*0.55)}px Arial`;
                    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                    ctx.fillText('G', o.x+o.w/2, o.y+o.h*0.42);
                    // Cups on top
                    ctx.fillStyle = '#ef5350';
                    ctx.fillRect(o.x+o.w*0.08, o.y - o.h*0.12, o.w*0.30, o.h*0.14);
                    ctx.fillRect(o.x+o.w*0.52, o.y - o.h*0.16, o.w*0.30, o.h*0.18);
                    // Wheels
                    ctx.fillStyle = '#212121';
                    ctx.beginPath(); ctx.arc(o.x+o.w*0.22, o.y+o.h*0.86, o.w*0.13, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.arc(o.x+o.w*0.78, o.y+o.h*0.86, o.w*0.13, 0, Math.PI*2); ctx.fill();
                    ctx.fillStyle = '#555';
                    ctx.beginPath(); ctx.arc(o.x+o.w*0.22, o.y+o.h*0.86, o.w*0.06, 0, Math.PI*2); ctx.fill();
                    ctx.beginPath(); ctx.arc(o.x+o.w*0.78, o.y+o.h*0.86, o.w*0.06, 0, Math.PI*2); ctx.fill();
                }

                if (o.type === 'cone') {
                    // Shadow
                    ctx.fillStyle = 'rgba(0,0,0,0.15)';
                    ctx.beginPath(); ctx.ellipse(o.x+o.w/2+3, o.y+o.h+3, o.w*0.5, o.h*0.08, 0, 0, Math.PI*2); ctx.fill();
                    // Pole
                    ctx.fillStyle = '#bdbdbd';
                    ctx.fillRect(o.x+o.w*0.44, o.y, o.w*0.12, o.h*0.92);
                    // Horizontal bars
                    ctx.fillStyle = '#ff6f00';
                    ctx.fillRect(o.x, o.y + o.h*0.10, o.w, o.h*0.12);
                    ctx.fillRect(o.x, o.y + o.h*0.38, o.w, o.h*0.12);
                    ctx.fillRect(o.x, o.y + o.h*0.66, o.w, o.h*0.12);
                    // Base
                    ctx.fillStyle = '#e65100';
                    ctx.fillRect(o.x, o.y + o.h*0.88, o.w, o.h*0.14);
                }
            });
        };

        // ── Draw: person ───────────────────────────────────────────────────
        // cx/cy = centre of sprite, s = scale (based on radius)
        const drawPerson = (cx, cy, facingRight, jersey, shorts, skin, numStr, headband, r) => {
            const s  = r / 13;
            const fx = facingRight ? 1 : -1;
            ctx.save();
            ctx.translate(Math.round(cx), Math.round(cy));

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.22)';
            ctx.beginPath(); ctx.ellipse(0, 2*s, r*0.9, r*0.25, 0, 0, Math.PI*2); ctx.fill();

            // Shoes
            ctx.fillStyle = '#212121';
            ctx.fillRect(-9*s, -5*s,  9*s, 5*s);
            ctx.fillRect( 1*s, -5*s,  9*s, 5*s);

            // Socks
            ctx.fillStyle = '#fff';
            ctx.fillRect(-8*s, -10*s, 7*s, 5*s);
            ctx.fillRect( 1*s, -10*s, 7*s, 5*s);

            // Shorts
            ctx.fillStyle = shorts;
            ctx.fillRect(-10*s, -24*s, 20*s, 14*s);

            // Jersey body
            ctx.fillStyle = jersey;
            ctx.fillRect(-11*s, -42*s, 22*s, 18*s);

            // Arms
            ctx.fillStyle = skin;
            ctx.fillRect(-17*s, -41*s, 6*s, 14*s);
            ctx.fillRect( 11*s, -41*s, 6*s, 14*s);

            // Jersey number
            ctx.fillStyle = 'rgba(255,255,255,0.9)';
            ctx.font = `bold ${Math.round(9*s)}px monospace`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(numStr, 0, -33*s);

            // Neck
            ctx.fillStyle = skin;
            ctx.fillRect(-4*s, -46*s, 8*s, 5*s);

            // Head
            ctx.fillStyle = skin;
            ctx.beginPath(); ctx.arc(0, -55*s, 11*s, 0, Math.PI*2); ctx.fill();

            // Headband
            ctx.fillStyle = headband;
            ctx.fillRect(-11*s, -62*s, 22*s, 5*s);

            // Eyes
            ctx.fillStyle = '#111';
            ctx.fillRect(fx*2*s, -57*s, 3*s, 3*s);

            // Mouth (tiny)
            ctx.fillStyle = '#111';
            ctx.fillRect(-2*s, -50*s, 4*s, 1.5*s);

            ctx.restore();
        };

        // ── Draw: basketball ───────────────────────────────────────────────
        const drawBall = (cx, cy) => {
            const r = 11;
            const bounce = Math.sin(tick * 0.22) * 6; // sine function allows a constant oscilating movement for a ball to dribble
            ctx.save();
            ctx.translate(Math.round(cx), Math.round(cy + bounce));
            // Shadow (stays on floor)
            ctx.fillStyle = 'rgba(0,0,0,0.20)';
            ctx.beginPath(); ctx.ellipse(0, 14 - bounce*0.4, r*0.8, r*0.22, 0, 0, Math.PI*2); ctx.fill();
            // Ball
            ctx.fillStyle = '#e65100';
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#bf360c';
            ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI*2); ctx.stroke();
            // Seams
            ctx.strokeStyle = '#1a1a1a';
            ctx.lineWidth = 1.2;
            ctx.beginPath(); ctx.moveTo(-r, 0); ctx.lineTo(r, 0); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(0, -r); ctx.lineTo(0, r); ctx.stroke();
            ctx.restore();
        };

        // ── Update ─────────────────────────────────────────────────────────
        const update = () => {
            if (gameOver) return;
            elapsed = (Date.now() - startTime) / 1000; // 
            tick++;

            // — Player movement —
            let dx = 0, dy = 0;
            if (keys['w'] || keys['arrowup'])    dy = -3.8;
            if (keys['s'] || keys['arrowdown'])  dy =  3.8;
            if (keys['a'] || keys['arrowleft'])  dx = -3.8;
            if (keys['d'] || keys['arrowright']) dx =  3.8;

            // Normalise diagonal so speed is consistent
            if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }

            if (dx < 0) player.dir = 'left';
            if (dx > 0) player.dir = 'right';

            player.moving = !!(dx || dy);
            if (!blocked(player.x + dx, player.y,      PR)) player.x += dx;
            if (!blocked(player.x,      player.y + dy, PR)) player.y += dy;
            if (player.moving && tick % 7 === 0) player.frame++;

            // — LeBron chase AI —
            // Full 2-D vector chase: always moves toward player on BOTH axes.
            const spd = Math.min(1.6 + elapsed * 0.04, 4.2);
            const ddx = player.x - lebron.x;
            const ddy = player.y - lebron.y;
            const dist = Math.sqrt(ddx*ddx + ddy*ddy);

            if (dist > 1) {
                // Normalised direction toward player
                const nx = ddx / dist;
                const ny = ddy / dist;

                const mx = nx * spd;
                const my = ny * spd;

                // Try full movement first
                const fullOk = !blocked(lebron.x + mx, lebron.y + my, LR);
                if (fullOk) {
                    lebron.x += mx;
                    lebron.y += my;
                } else {
                    // Try each axis independently so LeBron slides along walls
                    const xOk = !blocked(lebron.x + mx, lebron.y, LR);
                    const yOk = !blocked(lebron.x, lebron.y + my, LR);
                    if (xOk) lebron.x += mx;
                    if (yOk) lebron.y += my;

                    // If completely stuck, try perpendicular nudges to escape corners
                    if (!xOk && !yOk) {
                        for (const s of [{ x:-ny*spd, y:nx*spd }, { x:ny*spd, y:-nx*spd }]) {
                            if (!blocked(lebron.x + s.x, lebron.y + s.y, LR)) {
                                lebron.x += s.x * 0.7;
                                lebron.y += s.y * 0.7;
                                break;
                            }
                        }
                    }
                }

                // Face direction of travel
                lebron.dir = ddx >= 0 ? 'right' : 'left';
                if (tick % 7 === 0) lebron.frame++;
            }

            // — Catch —
            if (dist < PR + LR + 2) {
                caught = gameOver = true;
                if (elapsed > bestTime) bestTime = elapsed; // verifies if a New High Score is achieved
            }
        };

        // ── Render ─────────────────────────────────────────────────────────
        const render = () => {
            ctx.clearRect(0, 0, W, H);
            drawCourt();
            drawObstacles();

            // Ball dribbles beside player
            const ballOffX = player.dir === 'left' ? -22 : 22; // -22 when on left and 22 on the right
            drawBall(player.x + ballOffX, player.y - 12); // sine wave bounces based on player coords

            // Player: red #11
            drawPerson(
                player.x, player.y,
                player.dir !== 'left',
                '#e53935', '#1565c0', '#d4845a',
                '11', '#e53935', PR
            );

            // LeBron: Lakers purple #23
            drawPerson(
                lebron.x, lebron.y,
                lebron.dir !== 'left',
                '#552583', '#552583', '#8d5524',
                '23', '#fdb927', LR
            );

            // ── HUD ──────────────────────────────────────────────────────
            // Scoreboard-style panel
            ctx.save();
            ctx.fillStyle = 'rgba(10,10,20,0.82)';
            ctx.beginPath(); ctx.roundRect(W/2-170, 8, 340, 40, 10); ctx.fill();

            // Left label
            ctx.fillStyle = '#e53935';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText('YOU #11', W/2-158, 28);

            // Timer
            ctx.fillStyle = '#ffffff';
            ctx.font = `bold ${Math.round(W*0.016)}px monospace`;
            ctx.textAlign = 'center';
            ctx.fillText(`⏱  ${elapsed.toFixed(1)}s`, W/2, 28);

            // Best
            ctx.fillStyle = '#fdb927';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`Best: ${bestTime.toFixed(1)}s`, W/2+158, 28);
            ctx.restore();

            // Speed warning
            const spd = Math.min(1.6 + elapsed * 0.04, 4.2);
            if (spd > 2.8) {
                const alpha = Math.min((spd - 2.8) * 0.5, 0.9);
                ctx.save();
                ctx.fillStyle = `rgba(230,50,50,${alpha})`;
                ctx.font = `bold ${Math.round(W*0.012)}px monospace`;
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText('⚡ LeBron is heating up!', W/2, 60);
                ctx.restore();
            }

            // Controls
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.50)';
            ctx.beginPath(); ctx.roundRect(8, H-26, 290, 18, 4); ctx.fill();
            ctx.fillStyle = '#bbb';
            ctx.font = '11px monospace';
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText('Move: WASD / Arrow Keys   |   R = restart', 14, H-17);
            ctx.restore();

            // ── Caught screen ─────────────────────────────────────────────
            if (caught) {
                ctx.save();
                ctx.fillStyle = 'rgba(0,0,0,0.78)';
                ctx.fillRect(0, 0, W, H);

                const bw = Math.min(480, W*0.72), bh = 250;
                const bx = (W-bw)/2, by = (H-bh)/2;

                // Card
                ctx.fillStyle = '#0d0d1a';
                ctx.strokeStyle = '#fdb927';
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 18); ctx.fill(); ctx.stroke();

                // Gold top strip
                ctx.fillStyle = '#fdb927';
                ctx.beginPath(); ctx.roundRect(bx, by, bw, 8, [18,18,0,0]); ctx.fill();

                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

                ctx.fillStyle = '#fdb927';
                ctx.font = `bold ${Math.round(bw*0.072)}px monospace`;
                ctx.fillText('🏀 LeBron stole the ball!', W/2, by + 70);

                ctx.fillStyle = '#ff6f00';
                ctx.font = `bold ${Math.round(bw*0.055)}px monospace`;
                ctx.fillText(`You survived  ${elapsed.toFixed(1)}s`, W/2, by + 125);

                ctx.fillStyle = '#888';
                ctx.font = `${Math.round(bw*0.038)}px monospace`;
                ctx.fillText(`Best: ${bestTime.toFixed(1)}s`, W/2, by + 170);

                ctx.fillStyle = '#ddd';
                ctx.font = `${Math.round(bw*0.036)}px monospace`;
                ctx.fillText('Press  R  to play again', W/2, by + 210);

                ctx.restore();
            }
        };

        // ── Loop ───────────────────────────────────────────────────────────
        (function loop() {
            update();
            render();
            requestAnimationFrame(loop);
        })();
    }
}

export default GameLevelBasketball;