import { PowerUpType } from './constants.js';
import { randomRange } from './utils.js';

export class PowerUp {
    constructor(pos, type) {
        this.position = { ...pos };
        this.velocity = { x: 0, y: 50 };
        this.radius = 12;
        this.type = type;
        this.lifetime = 15;
        this.active = true;
        this.pulseTimer = 0;
    }

    getColor() {
        switch (this.type) {
            case PowerUpType.SHIELD: return 'blue';
            case PowerUpType.RAPID_FIRE: return 'green';
            case PowerUpType.HEALTH_BOOST: return 'pink';
            case PowerUpType.TIME_SLOW: return 'purple';
            default: return 'white';
        }
    }

    update(dt) {
        this.pulseTimer += dt * 3;
        this.position.y += this.velocity.y * dt;
        this.lifetime -= dt;

        if (this.lifetime <= 0 || this.position.y > 850) {
            this.active = false;
        }
    }

    draw(ctx) {
        const pulse = Math.sin(this.pulseTimer) * 0.3 + 1.0;
        const color = this.getColor();

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = this.hexToRgba(color, 0.6);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    }

    hexToRgba(hex, alpha) {
        if (hex.startsWith('#')) {
            const bigint = parseInt(hex.slice(1), 16);
            const r = (bigint >> 16) & 255;
            const g = (bigint >> 8) & 255;
            const b = bigint & 255;
            return `rgba(${r},${g},${b},${alpha})`;
        }

        // fallback for named colors
        return hex;
    }
}
