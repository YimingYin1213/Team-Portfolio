// Adventure Game Custom Level - Kirby Hide & Seek
// Save as assets/js/GameEnginev1/GameLevelSeek.js
//
// How to use:
// 1) Save as assets/js/GameEnginev1/GameLevelSeek.js
// 2) Import and add to your gameLevelClasses array:
//    import GameLevelSeek from '/portfolio/assets/js/GameEnginev1/GameLevelSeek.js';
//    export const gameLevelClasses = [GameLevelSeek];

class GameLevelSeek {
    constructor(gameEnv) {
        this.classes = [];
        const W = gameEnv.innerWidth  || window.innerWidth;
        const H = gameEnv.innerHeight || window.innerHeight;
        setTimeout(() => this._boot(W, H), 200);
    }

    _boot(W, H) {
        const old = document.getElementById('kirby-seek');
        if (old) old.remove();

        const canvas = document.createElement('canvas');
        canvas.id = 'kirby-seek';
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

        // ── Obstacles ─────────────────────────────────────────────────────
        const obstacles = [
            { x: W*0.08, y: H*0.12, w: W*0.12, h: H*0.14, type:'bush'  },
            { x: W*0.75, y: H*0.10, w: W*0.12, h: H*0.14, type:'bush'  },
            { x: W*0.40, y: H*0.30, w: W*0.13, h: H*0.13, type:'bush'  },
            { x: W*0.10, y: H*0.62, w: W*0.11, h: H*0.13, type:'bush'  },
            { x: W*0.78, y: H*0.64, w: W*0.12, h: H*0.13, type:'bush'  },
            { x: W*0.45, y: H*0.68, w: W*0.11, h: H*0.12, type:'bush'  },
            { x: W*0.22, y: H*0.38, w: W*0.07, h: H*0.20, type:'tree'  },
            { x: W*0.63, y: H*0.40, w: W*0.07, h: H*0.20, type:'tree'  },
            { x: W*0.86, y: H*0.36, w: W*0.06, h: H*0.20, type:'tree'  },
            { x: W*0.03, y: H*0.36, w: W*0.06, h: H*0.20, type:'tree'  },
            // boundaries
            { x:0,   y:0,   w:W,  h:6,   type:'wall' },
            { x:0,   y:H-6, w:W,  h:6,   type:'wall' },
            { x:0,   y:0,   w:6,  h:H,   type:'wall' },
            { x:W-6, y:0,   w:6,  h:H,   type:'wall' },
        ];

        // ── Kirby hides in the centre of a random bush ────────────────────
        const bushes = obstacles.filter(o => o.type === 'bush');
        const hideSpots = bushes.map(b => ({ x: b.x + b.w/2, y: b.y + b.h/2, bush: b }));

        const PR = 12, KR = 10;

        // ── State ─────────────────────────────────────────────────────────
        let player, kirby, keys, found, startTime, elapsed, bestTime, tick;
        bestTime = Infinity;

        const reset = () => {
            player    = { x: W*0.50, y: H*0.50, dir:'right', frame:0, moving:false };
            const hs  = hideSpots[Math.floor(Math.random() * hideSpots.length)];
            kirby     = { x: hs.x, y: hs.y, bush: hs.bush };
            keys      = {};
            found     = false;
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
            if (e.key.toLowerCase() === 'r' && found) reset();
        });
        window.addEventListener('keyup', e => {
            keys[e.key.toLowerCase()] = false;
        });

        // ── Collision ─────────────────────────────────────────────────────
        const circVsRect = (cx, cy, r, rx, ry, rw, rh) => {
            const nx = Math.max(rx, Math.min(cx, rx+rw));
            const ny = Math.max(ry, Math.min(cy, ry+rh));
            const dx = cx-nx, dy = cy-ny;
            return dx*dx + dy*dy < r*r;
        };
        const blocked = (cx, cy, r) =>
            obstacles.some(o => circVsRect(cx, cy, r, o.x, o.y, o.w, o.h));

        // ── Draw: background ──────────────────────────────────────────────
        const drawBg = () => {
            // Sky
            const sky = ctx.createLinearGradient(0, 0, 0, H);
            sky.addColorStop(0, '#87CEEB');
            sky.addColorStop(1, '#c8e6f5');
            ctx.fillStyle = sky;
            ctx.fillRect(0, 0, W, H);

            // Grass
            const grass = ctx.createLinearGradient(0, H*0.55, 0, H);
            grass.addColorStop(0, '#5cb85c');
            grass.addColorStop(1, '#3d8b3d');
            ctx.fillStyle = grass;
            ctx.fillRect(0, H*0.55, W, H*0.45);

            // Ground line
            ctx.strokeStyle = '#2d6a2d';
            ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0, H*0.55); ctx.lineTo(W, H*0.55); ctx.stroke();

            // Clouds
            const drawCloud = (x, y, s) => {
                ctx.fillStyle = 'rgba(255,255,255,0.88)';
                [[0,0,s*1.2],[s*0.8,-s*0.4,s],[s*1.6,-s*0.2,s*0.9]].forEach(([ox,oy,r]) => {
                    ctx.beginPath(); ctx.arc(x+ox, y+oy, r, 0, Math.PI*2); ctx.fill();
                });
            };
            drawCloud(W*0.10, H*0.10, 22);
            drawCloud(W*0.40, H*0.07, 18);
            drawCloud(W*0.70, H*0.09, 24);

            // Flower patches
            const drawFlower = (x, y) => {
                const petals = ['#ff6b9d','#ffb347','#ff6b6b','#ffd93d'];
                for (let i = 0; i < 5; i++) {
                    const a = (i/5)*Math.PI*2;
                    ctx.fillStyle = petals[i % petals.length];
                    ctx.beginPath(); ctx.arc(x + Math.cos(a)*5, y + Math.sin(a)*5, 3, 0, Math.PI*2); ctx.fill();
                }
                ctx.fillStyle = '#ffd93d';
                ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI*2); ctx.fill();
            };
            [[W*0.30,H*0.65],[W*0.55,H*0.72],[W*0.18,H*0.80],[W*0.70,H*0.78],[W*0.85,H*0.68]].forEach(([x,y]) => drawFlower(x,y));
        };

        // ── Draw: obstacles ───────────────────────────────────────────────
        const drawObstacles = () => {
            obstacles.forEach(o => {
                if (o.type === 'wall') return;

                if (o.type === 'tree') {
                    // Trunk
                    const tw = o.w * 0.30, tx = o.x + o.w*0.35;
                    ctx.fillStyle = '#8B5E3C';
                    ctx.fillRect(tx, o.y + o.h*0.55, tw, o.h*0.45);
                    ctx.fillStyle = '#7a5230';
                    ctx.fillRect(tx, o.y + o.h*0.55, tw*0.4, o.h*0.45);
                    // Foliage (3 layered circles)
                    const cx2 = o.x + o.w/2;
                    [[0, o.h*0.60, o.w*0.52,'#2e8b2e'],
                     [-o.w*0.22, o.h*0.38, o.w*0.40,'#3aa33a'],
                     [ o.w*0.22, o.h*0.38, o.w*0.40,'#3aa33a'],
                     [0, o.h*0.16, o.w*0.38,'#4ec44e']
                    ].forEach(([ox, oy, r, c]) => {
                        ctx.fillStyle = c;
                        ctx.beginPath(); ctx.arc(cx2+ox, o.y+oy, r, 0, Math.PI*2); ctx.fill();
                    });
                }

                if (o.type === 'bush') {
                    const cx2 = o.x + o.w/2, cy2 = o.y + o.h/2;
                    // Shadow
                    ctx.fillStyle = 'rgba(0,0,0,0.15)';
                    ctx.beginPath(); ctx.ellipse(cx2+5, o.y+o.h+4, o.w*0.45, o.h*0.12, 0, 0, Math.PI*2); ctx.fill();
                    // Bush body — cluster of circles
                    [[-o.w*0.28, o.h*0.15, o.w*0.36, '#2d9e2d'],
                     [ o.w*0.28, o.h*0.15, o.w*0.36, '#2d9e2d'],
                     [ 0,       -o.h*0.05, o.w*0.40, '#35b535'],
                     [-o.w*0.14, o.h*0.40, o.w*0.32, '#28882d'],
                     [ o.w*0.14, o.h*0.40, o.w*0.32, '#28882d'],
                    ].forEach(([ox, oy, r, c]) => {
                        ctx.fillStyle = c;
                        ctx.beginPath(); ctx.arc(cx2+ox, cy2+oy, r, 0, Math.PI*2); ctx.fill();
                    });
                    // Highlight
                    ctx.fillStyle = 'rgba(255,255,255,0.12)';
                    ctx.beginPath(); ctx.arc(cx2-o.w*0.1, cy2-o.h*0.2, o.w*0.18, 0, Math.PI*2); ctx.fill();
                }
            });
        };

        // ── Draw: player (Tiff-style pink character) ──────────────────────
        const drawPlayer = () => {
            const cx = player.x, cy = player.y;
            const s  = PR / 12;
            const fx = player.dir === 'right' ? 1 : -1;
            // Walk bob
            const bob = player.moving ? Math.sin(tick * 0.3) * 2 * s : 0;

            ctx.save();
            ctx.translate(Math.round(cx), Math.round(cy + bob));

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.20)';
            ctx.beginPath(); ctx.ellipse(0, 3*s, PR*0.85, PR*0.22, 0, 0, Math.PI*2); ctx.fill();

            // Shoes
            ctx.fillStyle = '#c0392b';
            ctx.beginPath(); ctx.ellipse(-6*s, 2*s, 7*s, 4*s, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse( 6*s, 2*s, 7*s, 4*s, 0, 0, Math.PI*2); ctx.fill();

            // Legs
            ctx.fillStyle = '#f0c8a0';
            ctx.fillRect(-8*s, -10*s, 6*s, 12*s);
            ctx.fillRect(  2*s, -10*s, 6*s, 12*s);

            // Dress / body
            ctx.fillStyle = '#e91e8c';
            ctx.beginPath();
            ctx.moveTo(-12*s, -10*s);
            ctx.lineTo( 12*s, -10*s);
            ctx.lineTo( 14*s,  2*s);
            ctx.lineTo(-14*s,  2*s);
            ctx.closePath(); ctx.fill();

            // Arms
            ctx.fillStyle = '#f0c8a0';
            ctx.fillRect(-18*s, -28*s, 6*s, 18*s);
            ctx.fillRect( 12*s, -28*s, 6*s, 18*s);

            // Neck
            ctx.fillStyle = '#f0c8a0';
            ctx.fillRect(-4*s, -34*s, 8*s, 6*s);

            // Head
            ctx.fillStyle = '#f0c8a0';
            ctx.beginPath(); ctx.arc(0, -44*s, 14*s, 0, Math.PI*2); ctx.fill();

            // Hair
            ctx.fillStyle = '#c0392b';
            ctx.beginPath(); ctx.arc(0, -52*s, 10*s, Math.PI, 0); ctx.fill();
            ctx.beginPath(); ctx.arc(-10*s, -46*s, 5*s, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc( 10*s, -46*s, 5*s, 0, Math.PI*2); ctx.fill();

            // Eyes
            ctx.fillStyle = '#111';
            ctx.beginPath(); ctx.arc(fx*4*s, -46*s, 2.5*s, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc(fx*1*s, -46*s, 2.5*s, 0, Math.PI*2); ctx.fill();
            // Shine
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(fx*4.7*s, -46.8*s, 0.9*s, 0, Math.PI*2); ctx.fill();

            // Smile
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1.5*s;
            ctx.beginPath(); ctx.arc(fx*1.5*s, -42*s, 3.5*s, 0, Math.PI); ctx.stroke();

            ctx.restore();
        };

        // ── Draw: Kirby ───────────────────────────────────────────────────
        const drawKirby = () => {
            if (!found) return; // hidden in bush until found!
            const cx = kirby.x, cy = kirby.y;
            const bounce = Math.sin(tick * 0.15) * 4;

            ctx.save();
            ctx.translate(Math.round(cx), Math.round(cy + bounce));

            // Shadow
            ctx.fillStyle = 'rgba(0,0,0,0.20)';
            ctx.beginPath(); ctx.ellipse(0, KR+4, KR*0.9, KR*0.25, 0, 0, Math.PI*2); ctx.fill();

            // Body
            ctx.fillStyle = '#ff9dc6';
            ctx.beginPath(); ctx.arc(0, 0, KR*1.5, 0, Math.PI*2); ctx.fill();

            // Blush
            ctx.fillStyle = 'rgba(255,100,150,0.45)';
            ctx.beginPath(); ctx.ellipse(-KR*0.9, KR*0.3, KR*0.55, KR*0.35, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse( KR*0.9, KR*0.3, KR*0.55, KR*0.35, 0, 0, Math.PI*2); ctx.fill();

            // Eyes
            ctx.fillStyle = '#1a1a6e';
            ctx.beginPath(); ctx.arc(-KR*0.45, -KR*0.2, KR*0.38, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc( KR*0.45, -KR*0.2, KR*0.38, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(-KR*0.3, -KR*0.32, KR*0.14, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.arc( KR*0.3, -KR*0.32, KR*0.14, 0, Math.PI*2); ctx.fill();

            // Mouth
            ctx.fillStyle = '#c2185b';
            ctx.beginPath(); ctx.arc(0, KR*0.35, KR*0.38, 0, Math.PI); ctx.fill();
            ctx.fillStyle = '#ff5c8a';
            ctx.beginPath(); ctx.ellipse(0, KR*0.55, KR*0.22, KR*0.12, 0, 0, Math.PI*2); ctx.fill();

            // Feet
            ctx.fillStyle = '#e75480';
            ctx.beginPath(); ctx.ellipse(-KR*0.55, KR*1.3, KR*0.5, KR*0.28, 0, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse( KR*0.55, KR*1.3, KR*0.5, KR*0.28, 0, 0, Math.PI*2); ctx.fill();

            // Arms
            ctx.fillStyle = '#ff9dc6';
            ctx.beginPath(); ctx.ellipse(-KR*1.35, KR*0.1, KR*0.42, KR*0.28, -0.5, 0, Math.PI*2); ctx.fill();
            ctx.beginPath(); ctx.ellipse( KR*1.35, KR*0.1, KR*0.42, KR*0.28,  0.5, 0, Math.PI*2); ctx.fill();

            // Star sparkles when found
            ctx.fillStyle = '#ffd700';
            ctx.font = `${Math.round(KR*1.2)}px serif`;
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText('✦', -KR*2.2, -KR*1.8);
            ctx.fillText('✦',  KR*2.2, -KR*1.8);

            ctx.restore();
        };

        // ── Draw: bush glow when nearby ───────────────────────────────────
        const drawProximityHint = () => {
            const dx = player.x - kirby.x;
            const dy = player.y - kirby.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const threshold = W * 0.18;

            if (dist < threshold && !found) {
                const alpha = (1 - dist/threshold) * 0.45;
                const pulse = Math.abs(Math.sin(tick * 0.08));
                ctx.save();
                ctx.globalAlpha = alpha * (0.5 + pulse * 0.5);
                ctx.fillStyle = '#ffd700';
                ctx.beginPath();
                ctx.arc(kirby.x, kirby.y, KR * 3.5, 0, Math.PI*2);
                ctx.fill();
                ctx.globalAlpha = 1;
                ctx.restore();
            }
        };

        // ── Update ────────────────────────────────────────────────────────
        const update = () => {
            if (found) return;
            elapsed = (Date.now() - startTime) / 1000;
            tick++;

            // Player movement
            let dx = 0, dy = 0;
            if (keys['w'] || keys['arrowup'])    dy = -3.2;
            if (keys['s'] || keys['arrowdown'])  dy =  3.2;
            if (keys['a'] || keys['arrowleft'])  dx = -3.2;
            if (keys['d'] || keys['arrowright']) dx =  3.2;

            if (dx !== 0 && dy !== 0) { dx *= 0.707; dy *= 0.707; }
            if (dx < 0) player.dir = 'left';
            if (dx > 0) player.dir = 'right';
            player.moving = !!(dx || dy);

            if (!blocked(player.x + dx, player.y,      PR)) player.x += dx;
            if (!blocked(player.x,      player.y + dy, PR)) player.y += dy;
            if (player.moving && tick % 8 === 0) player.frame++;

            // Check if player found Kirby
            const ddx = player.x - kirby.x;
            const ddy = player.y - kirby.y;
            const dist = Math.sqrt(ddx*ddx + ddy*ddy);
            if (dist < PR + KR*2.5) {
                found = true;
                if (elapsed < bestTime) bestTime = elapsed;
            }
        };

        // ── Render ────────────────────────────────────────────────────────
        const render = () => {
            ctx.clearRect(0, 0, W, H);
            drawBg();
            drawProximityHint();
            drawObstacles();
            drawKirby();
            drawPlayer();

            // ── HUD ───────────────────────────────────────────────────────
            ctx.save();
            ctx.fillStyle = 'rgba(10,10,30,0.80)';
            ctx.beginPath(); ctx.roundRect(W/2-170, 8, 340, 40, 10); ctx.fill();

            ctx.fillStyle = '#ff9dc6';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText('🔍 FIND KIRBY', W/2-158, 28);

            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`⏱  ${elapsed.toFixed(1)}s`, W/2, 28);

            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(bestTime === Infinity ? 'Best: --' : `Best: ${bestTime.toFixed(1)}s`, W/2+158, 28);
            ctx.restore();

            // Warm/cold hint
            const dx2 = player.x - kirby.x;
            const dy2 = player.y - kirby.y;
            const dist2 = Math.sqrt(dx2*dx2 + dy2*dy2);
            if (!found) {
                let hintText = '', hintColor = '';
                if      (dist2 < W*0.10) { hintText = '🔥 BURNING HOT!';  hintColor = '#ff4500'; }
                else if (dist2 < W*0.18) { hintText = '♨️  Very warm...';   hintColor = '#ff8c00'; }
                else if (dist2 < W*0.28) { hintText = '🌡️  Getting warmer'; hintColor = '#ffd700'; }
                else if (dist2 < W*0.40) { hintText = '❄️  Cold...';        hintColor = '#87ceeb'; }
                else                     { hintText = '🧊 Freezing cold!'; hintColor = '#4169e1'; }

                ctx.save();
                ctx.fillStyle = hintColor;
                ctx.font = 'bold 14px monospace';
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(hintText, W/2, 60);
                ctx.restore();
            }

            // Controls bar
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,0.50)';
            ctx.beginPath(); ctx.roundRect(8, H-26, 300, 18, 4); ctx.fill();
            ctx.fillStyle = '#bbb';
            ctx.font = '11px monospace';
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText('Move: WASD / Arrow Keys   |   R = new game', 14, H-17);
            ctx.restore();

            // ── Found screen ──────────────────────────────────────────────
            if (found) {
                ctx.save();
                ctx.fillStyle = 'rgba(0,0,0,0.72)';
                ctx.fillRect(0, 0, W, H);

                const bw = Math.min(460, W*0.72), bh = 240;
                const bx = (W-bw)/2, by = (H-bh)/2;

                ctx.fillStyle = '#1a0a2e';
                ctx.strokeStyle = '#ff9dc6';
                ctx.lineWidth = 3;
                ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 18); ctx.fill(); ctx.stroke();

                ctx.fillStyle = '#ff9dc6';
                ctx.beginPath(); ctx.roundRect(bx, by, bw, 8, [18,18,0,0]); ctx.fill();

                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

                ctx.fillStyle = '#ffd700';
                ctx.font = `bold ${Math.round(bw*0.075)}px monospace`;
                ctx.fillText('🎉 You found Kirby!', W/2, by + 68);

                ctx.fillStyle = '#ff9dc6';
                ctx.font = `bold ${Math.round(bw*0.055)}px monospace`;
                ctx.fillText(`Time: ${elapsed.toFixed(1)}s`, W/2, by + 118);

                const isNew = bestTime === elapsed;
                ctx.fillStyle = isNew ? '#ffd700' : '#888';
                ctx.font = `${Math.round(bw*0.040)}px monospace`;
                ctx.fillText(isNew ? '⭐ New best time!' : `Best: ${bestTime.toFixed(1)}s`, W/2, by + 163);

                ctx.fillStyle = '#ddd';
                ctx.font = `${Math.round(bw*0.036)}px monospace`;
                ctx.fillText('Press  R  to play again', W/2, by + 205);

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

export default GameLevelSeek;