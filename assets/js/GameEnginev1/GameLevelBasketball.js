// Basketball Evasion Game Level
// Save as assets/js/GameEnginev1/GameLevelBasketball.js
//
// Usage:
//   import GameLevelBasketball from './GameLevelBasketball.js';
//   export const gameLevelClasses = [GameLevelBasketball];

class GameLevelBasketball {
    constructor(gameEnv) {
        this.classes = [];
        const W = gameEnv.innerWidth  || window.innerWidth;
        const H = gameEnv.innerHeight || window.innerHeight;
        setTimeout(() => this._boot(W, H), 200);
    }

    _boot(W, H) {
        const old = document.getElementById('bball-game');
        if (old) old.remove();

        const canvas = document.createElement('canvas');
        canvas.id = 'bball-game';
        canvas.width = W; canvas.height = H;
        canvas.setAttribute('tabindex', '0');
        canvas.style.cssText = 'display:block;position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;outline:none;';
        document.body.appendChild(canvas);
        canvas.focus();
        const ctx = canvas.getContext('2d');

        // Obstacles + boundary walls
        const OBS = [
            { x: W*.25, y: H*.25, w: W*.12, h: H*.08 },
            { x: W*.55, y: H*.55, w: W*.12, h: H*.08 },
            { x: W*.35, y: H*.60, w: W*.10, h: H*.08 },
            { x: W*.60, y: H*.20, w: W*.10, h: H*.08 },
            { x: 0,   y: 0,   w: 4, h: H },
            { x: W-4, y: 0,   w: 4, h: H },
            { x: 0,   y: 0,   w: W, h: 4 },
            { x: 0,   y: H-4, w: W, h: 4 },
        ];

        const PR = 12, LR = 15;
        let p, l, keys, over, t0, elapsed, best, tick;
        best = 0;

        const reset = () => {
            p       = { x: W*.08, y: H*.5, dir: 1 };
            l       = { x: W*.90, y: H*.5, dir: -1 };
            keys    = {};
            over    = false;
            t0      = Date.now();
            elapsed = 0;
            tick    = 0;
        };
        reset();

        // Input
        window.addEventListener('keydown', e => {
            keys[e.key.toLowerCase()] = true;
            if (['arrowup','arrowdown','arrowleft','arrowright'].includes(e.key.toLowerCase())) e.preventDefault();
        });
        window.addEventListener('keyup', e => {
            keys[e.key.toLowerCase()] = false;
            if (e.key.toLowerCase() === 'r' && over) reset();
        });

        // Circle vs rect collision
        const blocked = (cx, cy, r) => OBS.some(o => {
            const nx = Math.max(o.x, Math.min(cx, o.x+o.w));
            const ny = Math.max(o.y, Math.min(cy, o.y+o.h));
            return (cx-nx)**2 + (cy-ny)**2 < r*r;
        });

        // Draw court
        const drawCourt = () => {
            const g = ctx.createLinearGradient(0,0,W,0);
            g.addColorStop(0, '#b5651d'); g.addColorStop(.5, '#cd853f'); g.addColorStop(1, '#b5651d');
            ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
            ctx.strokeStyle = 'rgba(90,40,0,.2)'; ctx.lineWidth = 1;
            for (let x = 0; x < W; x += W/28) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
            ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
            const pad = 20;
            ctx.strokeRect(pad, pad, W-pad*2, H-pad*2);
            ctx.beginPath(); ctx.moveTo(W/2,pad); ctx.lineTo(W/2,H-pad); ctx.stroke();
            ctx.beginPath(); ctx.arc(W/2, H/2, H*.13, 0, Math.PI*2); ctx.stroke();
        };

        // Draw bench obstacles
        const drawObs = () => OBS.slice(0,4).forEach(o => {
            ctx.fillStyle = '#7a5230'; ctx.fillRect(o.x, o.y, o.w, o.h*.4);
            ctx.fillStyle = '#4a2f10';
            [.1,.5,.82].forEach(fx => ctx.fillRect(o.x+o.w*fx, o.y+o.h*.4, o.w*.1, o.h*.55));
        });

        // Draw stick-figure player
        const drawPlayer = (x, y, jersey, num, dir) => {
            ctx.save(); ctx.translate(Math.round(x), Math.round(y));
            ctx.fillStyle = 'rgba(0,0,0,.25)';
            ctx.beginPath(); ctx.ellipse(0,4,10,3,0,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#111'; ctx.fillRect(-9,-5,8,5); ctx.fillRect(1,-5,8,5);
            ctx.fillStyle = jersey; ctx.fillRect(-9,-20,18,15); ctx.fillRect(-10,-38,20,18);
            ctx.fillStyle = '#c8784a'; ctx.fillRect(-15,-37,5,13); ctx.fillRect(10,-37,5,13);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(num, 0, -28);
            ctx.fillStyle = '#c8784a'; ctx.fillRect(-3,-41,6,4);
            ctx.beginPath(); ctx.arc(0,-50,9,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#111'; ctx.fillRect(dir*2,-52,3,3);
            ctx.restore();
        };

        // Draw bouncing basketball
        const drawBall = (x, y) => {
            const b = Math.sin(tick*.22)*5;
            ctx.save(); ctx.translate(Math.round(x), Math.round(y+b));
            ctx.fillStyle = 'rgba(0,0,0,.2)';
            ctx.beginPath(); ctx.ellipse(0,14-b*.4,8,2.5,0,0,Math.PI*2); ctx.fill();
            ctx.fillStyle = '#e65100'; ctx.beginPath(); ctx.arc(0,0,9,0,Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#111'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(-9,0); ctx.lineTo(9,0); ctx.stroke();
            ctx.beginPath(); ctx.arc(0,0,9,0,Math.PI); ctx.stroke();
            ctx.restore();
        };

        // Update game state
        const update = () => {
            if (over) return;
            elapsed = (Date.now() - t0) / 1000;
            tick++;

            let dx = 0, dy = 0;
            if (keys['w'] || keys['arrowup'])    dy = -3.5;
            if (keys['s'] || keys['arrowdown'])  dy =  3.5;
            if (keys['a'] || keys['arrowleft'])  dx = -3.5;
            if (keys['d'] || keys['arrowright']) dx =  3.5;
            if (dx && dy) { dx *= .707; dy *= .707; }
            if (dx) p.dir = dx > 0 ? 1 : -1;
            if (!blocked(p.x+dx, p.y,    PR)) p.x += dx;
            if (!blocked(p.x,    p.y+dy, PR)) p.y += dy;

            const spd = Math.min(1.5 + elapsed*.04, 4);
            const ddx = p.x - l.x, ddy = p.y - l.y;
            const dist = Math.sqrt(ddx*ddx + ddy*ddy);
            if (dist > 1) {
                const mx = (ddx/dist)*spd, my = (ddy/dist)*spd;
                if (!blocked(l.x+mx, l.y+my, LR)) { l.x += mx; l.y += my; }
                else { if (!blocked(l.x+mx, l.y, LR)) l.x += mx; if (!blocked(l.x, l.y+my, LR)) l.y += my; }
                l.dir = ddx >= 0 ? 1 : -1;
            }
            if (dist < PR+LR+2) { over = true; if (elapsed > best) best = elapsed; }
        };

        // Render frame
        const render = () => {
            ctx.clearRect(0,0,W,H);
            drawCourt(); drawObs();
            drawBall(p.x + p.dir*20, p.y - 10);
            drawPlayer(p.x, p.y, '#e53935', '11', p.dir);
            drawPlayer(l.x, l.y, '#552583', '23', l.dir);

            // HUD
            ctx.fillStyle = 'rgba(0,0,0,.75)';
            ctx.beginPath(); ctx.roundRect(W/2-150, 6, 300, 36, 8); ctx.fill();
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(W*.018)}px monospace`;
            ctx.fillText(`⏱ ${elapsed.toFixed(1)}s`, W/2, 24);
            ctx.fillStyle = '#fdb927'; ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'right'; ctx.fillText(`Best: ${best.toFixed(1)}s`, W/2+145, 24);

            const spd = Math.min(1.5 + elapsed*.04, 4);
            if (spd > 2.8) {
                ctx.fillStyle = `rgba(230,50,50,${Math.min((spd-2.8)*.5,.9)})`;
                ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
                ctx.fillText('⚡ LeBron is heating up!', W/2, 54);
            }

            // Game over card
            if (over) {
                ctx.fillStyle = 'rgba(0,0,0,.75)'; ctx.fillRect(0,0,W,H);
                const bw = Math.min(420, W*.7), bh = 200, bx = (W-bw)/2, by = (H-bh)/2;
                ctx.fillStyle = '#0d0d1a'; ctx.strokeStyle = '#fdb927'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,16); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#fdb927'; ctx.beginPath(); ctx.roundRect(bx,by,bw,7,[16,16,0,0]); ctx.fill();
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fdb927'; ctx.font = `bold ${Math.round(bw*.065)}px monospace`;
                ctx.fillText('🏀 LeBron stole the ball!', W/2, by+55);
                ctx.fillStyle = '#ff6f00'; ctx.font = `bold ${Math.round(bw*.05)}px monospace`;
                ctx.fillText(`Survived  ${elapsed.toFixed(1)}s`, W/2, by+105);
                ctx.fillStyle = '#888'; ctx.font = `${Math.round(bw*.035)}px monospace`;
                ctx.fillText(`Best: ${best.toFixed(1)}s`, W/2, by+145);
                ctx.fillStyle = '#ccc'; ctx.fillText('Press R to play again', W/2, by+178);
            }
        };

        (function loop() { update(); render(); requestAnimationFrame(loop); })();
    }
}

export default GameLevelBasketball;