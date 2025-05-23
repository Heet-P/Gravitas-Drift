import { BulletType } from './constants.js';

export class Bullet {
    constructor(pos, vel, type, color = '#ffffff') {
        this.position = { ...pos };
        this.velocity = { ...vel };
        this.type = type;
        this.radius = this.getRadius();
        this.color = color;
        this.active = true;
        this.trail = [];
        this.trailTimer = 0;
        this.lifetime = 10;
    }

    getRadius() {
        switch (this.type) {
            case BulletType.PLAYER: return 4;
            case BulletType.ENEMY: return 6;
            case BulletType.BOSS: return 8;
            default: return 5;
        }
    }

    update(dt, timeSlow = false) {
        const effectiveDt = timeSlow ? dt * 0.3 : dt;

        this.position.x += this.velocity.x * effectiveDt;
        this.position.y += this.velocity.y * effectiveDt;
        this.lifetime -= effectiveDt;

        if (
            this.lifetime <= 0 ||
            this.position.x < -50 || this.position.x > 1250 ||
            this.position.y < -50 || this.position.y > 850
        ) {
            this.active = false;
        }
        this.trailTimer += dt;
        if (this.trailTimer > 0.01) {
            this.trail.push({
                x: this.position.x,
                y: this.position.y,
                alpha: 1.0
            });
            this.trailTimer = 0;
        }

        // Fade trail and remove old entries
        this.trail.forEach(p => p.alpha -= dt * 9);
        this.trail = this.trail.filter(p => p.alpha > 0);

    }

    draw(ctx) {
        // Glow
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius + 2, 0, Math.PI * 2);
        ctx.fillStyle = this.hexToRgba(this.color, 0.3);
        ctx.fill();
        this.trail.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, this.radius + 1, 0, Math.PI * 2);
        ctx.fillStyle = this.hexToRgba(this.color, p.alpha * 0.2);
        ctx.fill();
        });

        // Core
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    hexToRgba(hex, alpha) {
        const bigint = parseInt(hex.replace('#', ''), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r},${g},${b},${alpha})`;
    }
}
