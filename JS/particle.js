export class Particle {
    constructor(pos, color) {
        this.position = { ...pos };
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 100;
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
        this.color = color;
        this.size = 2 + Math.random() * 3;
        this.lifetime = 1.0 + Math.random(); // seconds
        this.maxLifetime = this.lifetime;
        this.active = true;
    }

    update(dt) {
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        this.lifetime -= dt;

        if (this.lifetime <= 0) {
            this.active = false;
        }
    }

    draw(ctx) {
        const alpha = this.lifetime / this.maxLifetime;
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace('1.0)', `${alpha.toFixed(2)})`);
        ctx.fill();
    }
}
