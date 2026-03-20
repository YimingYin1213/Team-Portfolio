// Basketball Evasion Game Level
// Save as assets/js/GameEnginev1/GameLevelBasketball.js

import GameEnvBackground from './essentials/GameEnvBackground.js';
import Player from './essentials/Player.js';
import Npc from './essentials/Npc.js';
import Barrier from './essentials/Barrier.js';

class GameLevelBasketball {
    constructor(gameEnv) {
        const path   = gameEnv.path;
        const width  = gameEnv.innerWidth;
        const height = gameEnv.innerHeight;

        // ── Background ─────────────────────────────────────────────────
        const bgData = {
            name: 'custom_bg',
            src: path + '/images/gamebuilder/bg/Court.png',
            pixels: { height: 768, width: 1377 }
        };

        // ── Player — BasketballPlayer.png ──────────────────────────────
        const playerData = {
            id: 'playerData',
            src: path + '/images/gamebuilder/sprites/BasketballPlayer.png',
            SCALE_FACTOR: 5,
            STEP_FACTOR: 400,
            ANIMATION_RATE: 50,
            INIT_POSITION: { x: 100, y: 300 },
            pixels: { height: 1350, width: 1080 },
            orientation: { rows: 4, columns: 3 },
            down:      { row: 0, start: 0, columns: 3 },
            downRight: { row: 1, start: 0, columns: 3, rotate: Math.PI/16 },
            downLeft:  { row: 0, start: 0, columns: 3, rotate: -Math.PI/16 },
            left:      { row: 2, start: 0, columns: 3 },
            right:     { row: 1, start: 0, columns: 3 },
            up:        { row: 3, start: 0, columns: 3 },
            upLeft:    { row: 2, start: 0, columns: 3, rotate: Math.PI/16 },
            upRight:   { row: 3, start: 0, columns: 3, rotate: -Math.PI/16 },
            hitbox: { widthPercentage: 0, heightPercentage: 0 },
            keypress: { up: 87, left: 65, down: 83, right: 68 }
        };

        // ── NPC — LeBron.png ───────────────────────────────────────────
        const npcData1 = {
            id: 'NPC',
            greeting: 'Hello!',
            src: path + '/images/gamebuilder/sprites/LeBron.png',
            SCALE_FACTOR: 3,
            ANIMATION_RATE: 50,
            INIT_POSITION: { x: 360, y: 166 },
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
            dialogues: ['I got your ball! 🏀'],
            reaction: function() {
                if (this.dialogueSystem) this.showReactionDialogue();
                else console.log(this.greeting);
            },
            interact: function() {
                if (this.dialogueSystem) this.showRandomDialogue();
            }
        };

        // ── Barriers — same as team's version ─────────────────────────
        const dbarrier_1 = {
            id: 'dbarrier_1', x: 258, y: 281, width: 219, height: 104, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 }, fromOverlay: true
        };
        const dbarrier_2 = {
            id: 'dbarrier_2', x: 136, y: 195, width: 123, height: 229, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 }, fromOverlay: true
        };
        const dbarrier_3 = {
            id: 'dbarrier_3', x: 488, y: 351, width: 54, height: 101, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 }, fromOverlay: true
        };
        const dbarrier_4 = {
            id: 'dbarrier_4', x: 555, y: 414, width: 48, height: 40, visible: false,
            hitbox: { widthPercentage: 0.0, heightPercentage: 0.0 }, fromOverlay: true
        };

        this.classes = [
            { class: GameEnvBackground, data: bgData     },
            { class: Player,            data: playerData },
            { class: Npc,               data: npcData1   },
            { class: Barrier,           data: dbarrier_1 },
            { class: Barrier,           data: dbarrier_2 },
            { class: Barrier,           data: dbarrier_3 },
            { class: Barrier,           data: dbarrier_4 },
        ];

        // Boot chase AI + dribbling ball overlay after GameEngine sets up
        setTimeout(() => this._bootOverlay(width, height), 500);
    }

    _bootOverlay(W, H) {
        const old = document.getElementById('bball-overlay');
        if (old) old.remove();

        const canvas = document.createElement('canvas');
        canvas.id = 'bball-overlay';
        canvas.width = W; canvas.height = H;
        canvas.style.cssText = `
            display:block; position:fixed; top:0; left:0;
            width:100vw; height:100vh;
            z-index:100; pointer-events:none;
        `;
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        const SS = Math.round(H * 0.10);

        // Mirror player position by tracking same WASD keys
        const keys = {};
        const pPos = { x: 100, y: 300, dir: 'right' };

        // LeBron starts at his INIT_POSITION
        const l = { x: 360, y: 166, dir: 'left' };

        // Use same barrier positions for collision
        const BARRIERS = [
            { x: 258, y: 281, w: 219, h: 104 },
            { x: 136, y: 195, w: 123, h: 229 },
            { x: 488, y: 351, w: 54,  h: 101 },
            { x: 555, y: 414, w: 48,  h: 40  },
            { x: 0,   y: 0,   w: 4,  h: H },
            { x: W-4, y: 0,   w: 4,  h: H },
            { x: 0,   y: 0,   w: W,  h: 4 },
            { x: 0,   y: H-4, w: W,  h: 4 },
        ];

        const PR = SS * 0.28;
        const LR = SS * 0.30;
        let over = false, t0 = Date.now(), elapsed = 0, best = 0, tick = 0;

        const reset = () => {
            pPos.x = 100; pPos.y = 300; pPos.dir = 'right';
            l.x = 360; l.y = 166; l.dir = 'left';
            over = false; t0 = Date.now(); elapsed = 0; tick = 0;
        };

        window.addEventListener('keydown', e => { keys[e.key.toLowerCase()] = true; });
        window.addEventListener('keyup', e => {
            keys[e.key.toLowerCase()] = false;
            if (e.key.toLowerCase() === 'r' && over) reset();
        });

        const blocked = (cx, cy, r) => BARRIERS.some(o => {
            const nx = Math.max(o.x, Math.min(cx, o.x+o.w));
            const ny = Math.max(o.y, Math.min(cy, o.y+o.h));
            return (cx-nx)**2 + (cy-ny)**2 < r*r;
        });

        // Dribbling basketball beside player
        const drawBall = () => {
            const b = Math.sin(tick * .22) * 5;
            const offX = pPos.dir === 'left' ? -SS*.45 : SS*.45;
            ctx.save();
            ctx.translate(Math.round(pPos.x + offX), Math.round(pPos.y + b));
            ctx.fillStyle = 'rgba(0,0,0,.2)';
            ctx.beginPath(); ctx.ellipse(0, 14-b*.4, 8, 2.5, 0, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = '#e65100';
            ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI*2); ctx.fill();
            ctx.strokeStyle = '#111'; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(-9,0); ctx.lineTo(9,0); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI); ctx.stroke();
            ctx.restore();
        };

        const update = () => {
            if (over) return;
            elapsed = (Date.now() - t0) / 1000;
            tick++;

            // Mirror player movement at same speed as GameEngine STEP_FACTOR: 400
            let dx = 0, dy = 0;
            if (keys['w'] || keys['arrowup'])    dy = -2.5;
            if (keys['s'] || keys['arrowdown'])  dy =  2.5;
            if (keys['a'] || keys['arrowleft'])  dx = -2.5;
            if (keys['d'] || keys['arrowright']) dx =  2.5;
            if (dx && dy) { dx *= .707; dy *= .707; }
            if (dx !== 0) pPos.dir = dx > 0 ? 'right' : 'left';
            if (!blocked(pPos.x+dx, pPos.y,    PR)) pPos.x += dx;
            if (!blocked(pPos.x,    pPos.y+dy, PR)) pPos.y += dy;

            // LeBron chase AI — vector normalization
            const spd = Math.min(1.2 + elapsed * .03, 3.5);
            const ddx = pPos.x - l.x, ddy = pPos.y - l.y;
            const dist = Math.sqrt(ddx*ddx + ddy*ddy);
            if (dist > 1) {
                const mx = (ddx/dist)*spd, my = (ddy/dist)*spd;
                if (!blocked(l.x+mx, l.y+my, LR)) { l.x += mx; l.y += my; }
                else {
                    if (!blocked(l.x+mx, l.y, LR)) l.x += mx;
                    if (!blocked(l.x, l.y+my, LR)) l.y += my;
                }
                l.dir = ddx >= 0 ? 'right' : 'left';
            }
            if (dist < PR + LR + 2) {
                over = true;
                if (elapsed > best) best = elapsed;
            }
        };

        const render = () => {
            ctx.clearRect(0, 0, W, H);
            drawBall();

            // HUD
            ctx.fillStyle = 'rgba(0,0,0,.75)';
            ctx.beginPath(); ctx.roundRect(W/2-150, 6, 300, 36, 8); ctx.fill();
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillStyle = '#fff'; ctx.font = `bold ${Math.round(W*.018)}px monospace`;
            ctx.fillText(`⏱ ${elapsed.toFixed(1)}s`, W/2, 24);
            ctx.fillStyle = '#fdb927'; ctx.font = 'bold 12px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`Best: ${best.toFixed(1)}s`, W/2+145, 24);

            const spd = Math.min(1.2 + elapsed*.03, 3.5);
            if (spd > 2.5) {
                ctx.fillStyle = `rgba(230,50,50,${Math.min((spd-2.5)*.6,.9)})`;
                ctx.font = 'bold 13px monospace'; ctx.textAlign = 'center';
                ctx.fillText('⚡ LeBron is heating up!', W/2, 60);
            }

            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,.5)';
            ctx.beginPath(); ctx.roundRect(8, H-26, 290, 18, 4); ctx.fill();
            ctx.fillStyle = '#bbb'; ctx.font = '11px monospace';
            ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
            ctx.fillText('Move: WASD / Arrow Keys   |   R = restart', 14, H-17);
            ctx.restore();

            if (over) {
                ctx.fillStyle = 'rgba(0,0,0,.78)'; ctx.fillRect(0,0,W,H);
                const bw = Math.min(420,W*.7), bh = 200, bx = (W-bw)/2, by = (H-bh)/2;
                ctx.fillStyle = '#0d0d1a'; ctx.strokeStyle = '#fdb927'; ctx.lineWidth = 3;
                ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,16); ctx.fill(); ctx.stroke();
                ctx.fillStyle = '#fdb927';
                ctx.beginPath(); ctx.roundRect(bx,by,bw,8,[16,16,0,0]); ctx.fill();
                ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillStyle = '#fdb927'; ctx.font = `bold ${Math.round(bw*.065)}px monospace`;
                ctx.fillText('🏀 LeBron stole the ball!', W/2, by+55);
                ctx.fillStyle = '#ff6f00'; ctx.font = `bold ${Math.round(bw*.05)}px monospace`;
                ctx.fillText(`Survived  ${elapsed.toFixed(1)}s`, W/2, by+105);
                ctx.fillStyle = '#888'; ctx.font = `${Math.round(bw*.035)}px monospace`;
                ctx.fillText(`Best: ${best.toFixed(1)}s`, W/2, by+145);
                ctx.fillStyle = '#ddd';
                ctx.fillText('Press R to play again', W/2, by+178);
            }
        };

        (function loop() { update(); render(); requestAnimationFrame(loop); })();
    }
}

export default GameLevelBasketball;