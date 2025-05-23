import { SCREEN_WIDTH, SCREEN_HEIGHT } from './constants.js';
import { clamp } from './utils.js';

export class Player {
    constructor() {
        this.radius = 15;
        this.maxHealth = 100;
        this.health = this.maxHealth;
        this.position = { x: SCREEN_WIDTH / 2, y: SCREEN_HEIGHT / 2 };
        this.velocity = { x: 0, y: 0 };
        this.speed = 300;

        this.color = '#00ffff';
        this.hasShield = false;
        this.shieldTimer = 0;
        this.rapidFire = false;
        this.rapidFireTimer = 0;
        this.timeSlow = false;
        this.timeSlowTimer = 0;
        this.shootTimer = 0;
        this.invulnTimer = 0;
        this.trail = [];
        this.trailTimer = 0;
    }

    update(dt, input) {
    const acceleration = 1025;
    const friction = 1;
    const maxSpeed = this.speed;

    let ax = 0, ay = 0;

    if (input.up) ay -= 1;
    if (input.down) ay += 1;
    if (input.left) ax -= 1;
    if (input.right) ax += 1;

    // Normalize input direction
    const len = Math.hypot(ax, ay);
    if (len > 0) {
        ax = (ax / len) * acceleration;
        ay = (ay / len) * acceleration;
    }

    // Apply acceleration
    this.velocity.x += ax * dt;
    this.velocity.y += ay * dt;

    // Apply friction
    this.velocity.x -= this.velocity.x * friction * dt;
    this.velocity.y -= this.velocity.y * friction * dt;

    // Cap max speed
    const speed = Math.hypot(this.velocity.x, this.velocity.y);
    if (speed > maxSpeed) {
        const scale = maxSpeed / speed;
        this.velocity.x *= scale;
        this.velocity.y *= scale;
    }

    // Move
    this.position.x = clamp(this.position.x + this.velocity.x * dt, this.radius, SCREEN_WIDTH - this.radius);
    this.position.y = clamp(this.position.y + this.velocity.y * dt, this.radius, SCREEN_HEIGHT - this.radius);

    // Timers
    if (this.invulnTimer > 0) this.invulnTimer -= dt;
    if (this.shieldTimer > 0) {
        this.shieldTimer -= dt;
        if (this.shieldTimer <= 0) this.hasShield = false;
    }
    if (this.rapidFireTimer > 0) {
        this.rapidFireTimer -= dt;
        if (this.rapidFireTimer <= 0) this.rapidFire = false;
    }
    if (this.timeSlowTimer > 0) {
        this.timeSlowTimer -= dt;
        if (this.timeSlowTimer <= 0) this.timeSlow = false;
    }
    if (this.shootTimer > 0) this.shootTimer -= dt;

    
    this.trailTimer += dt;
    if (this.trailTimer > 0.02) 
        {
            this.trail.push({ x: this.position.x, y: this.position.y, alpha: 1.0 });
            this.trailTimer = 0;
    }

    // Fade out trail
    this.trail.forEach(p => p.alpha -= dt * 2);

    // Remove fully transparent
    this.trail = this.trail.filter(p => p.alpha > 0);

}


    draw(ctx) {
        
        // Glow
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius + 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,255,255,0.3)';
        ctx.fill();

        // Shield
        if (this.hasShield) {
            ctx.beginPath();
            ctx.arc(this.position.x, this.position.y, this.radius + 8, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,255,0.2)';
            ctx.fill();
        }
        this.trail.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, this.radius, 0, Math.PI * 1.2);
                ctx.fillStyle = `rgba(0, 255, 255, ${p.alpha * 0.2})`;
                ctx.fill();
        });

        // Player
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius / 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }
}
