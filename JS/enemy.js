import { EnemyType, BulletType } from './constants.js';
import { Bullet } from './bullet.js';
import { distance } from './utils.js';

export class Enemy {
    constructor(type, pos, playerRef) {
        this.type = type;
        this.position = { ...pos };
        this.velocity = { x: 0, y: 0 };
        this.radius = this.getRadius();
        this.color = this.getColor();
        this.health = this.getHealth();
        this.maxHealth = this.health;

        this.active = true;
        this.shootTimer = 0;
        this.shootInterval = this.getShootInterval();
        this.specialTimer = 0;
        this.phase = 0;
        this.player = playerRef;

        if (type === EnemyType.BOSS) {
            this.position = { x: 600, y: 100 };
            this.velocity = { x: 30, y: 0 };
        }
    }

    getRadius() {
        switch (this.type) {
            case EnemyType.BASIC: return 12;
            case EnemyType.SPIRAL: return 15;
            case EnemyType.SCATTER: return 18;
            case EnemyType.WALL: return 20;
            case EnemyType.HOMING: return 14;
            case EnemyType.BOSS: return 40;
        }
    }

    getColor() {
        switch (this.type) {
            case EnemyType.BASIC: return 'red';
            case EnemyType.SPIRAL: return 'orange';
            case EnemyType.SCATTER: return 'yellow';
            case EnemyType.WALL: return 'purple';
            case EnemyType.HOMING: return 'pink';
            case EnemyType.BOSS: return 'gold';
        }
    }

    getHealth() {
        switch (this.type) {
            case EnemyType.BASIC: return 1;
            case EnemyType.SPIRAL: return 2;
            case EnemyType.SCATTER: return 3;
            case EnemyType.WALL: return 4;
            case EnemyType.HOMING: return 2;
            case EnemyType.BOSS: return 50;
        }
    }

    getShootInterval() {
        switch (this.type) {
            case EnemyType.BASIC: return 2.0;
            case EnemyType.SPIRAL: return 0.5;
            case EnemyType.SCATTER: return 1.5;
            case EnemyType.WALL: return 3.0;
            case EnemyType.HOMING: return 1.0;
            case EnemyType.BOSS: return 0.3;
        }
    }

    update(dt, bullets) {
        this.shootTimer += dt;
        this.specialTimer += dt;

        const player = this.player;

        // Movement pattern
        switch (this.type) {
            case EnemyType.BASIC:
                const toPlayer = {
                    x: player.position.x - this.position.x,
                    y: player.position.y - this.position.y
                };
                const mag = Math.hypot(toPlayer.x, toPlayer.y);
                this.velocity = {
                    x: (toPlayer.x / mag) * 50,
                    y: (toPlayer.y / mag) * 50
                };
                break;

            case EnemyType.SPIRAL:
                this.position.x += Math.cos(this.specialTimer * 2) * 30 * dt;
                this.position.y += Math.sin(this.specialTimer * 2) * 30 * dt;
                break;

            case EnemyType.HOMING:
                const dir = {
                    x: player.position.x - this.position.x,
                    y: player.position.y - this.position.y
                };
                const d = Math.hypot(dir.x, dir.y);
                const factor = 20 * dt;
                this.velocity.x += (dir.x / d) * factor;
                this.velocity.y += (dir.y / d) * factor;

                const maxSpeed = 80;
                const s = Math.hypot(this.velocity.x, this.velocity.y);
                if (s > maxSpeed) {
                    this.velocity.x = (this.velocity.x / s) * maxSpeed;
                    this.velocity.y = (this.velocity.y / s) * maxSpeed;
                }
                break;

            case EnemyType.BOSS:
                this.position.x += this.velocity.x * dt;
                if (this.position.x <= 50 || this.position.x >= 1150) {
                    this.velocity.x *= -1;
                }
                break;

            default:
                break;
        }

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        // Shooting
        if (this.shootTimer >= this.shootInterval) {
            this.shootTimer = 0;
            this.fire(bullets);
        }
    }

    fire(bullets) {
        const px = this.player.position;
        const dx = px.x - this.position.x;
        const dy = px.y - this.position.y;
        const dirMag = Math.hypot(dx, dy);
        const vx = dx / dirMag;
        const vy = dy / dirMag;

        switch (this.type) {
            case EnemyType.BASIC:
                bullets.push(new Bullet(this.position, { x: vx * 150, y: vy * 150 }, BulletType.ENEMY, 'red'));
                break;
            case EnemyType.SCATTER:
                for (let i = 0; i < 12; i++) {
                    const angle = (i * 30) * Math.PI / 180;
                    const v = { x: Math.cos(angle) * 80, y: Math.sin(angle) * 80 };
                    bullets.push(new Bullet(this.position, v, BulletType.ENEMY, 'yellow'));
                }
                break;
            // You can continue adding other patterns like SPIRAL, WALL, etc. if needed
        }
    }

    draw(ctx) {
        // Glow
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius + 3, 0, Math.PI * 2);
        ctx.fillStyle = this.color + '44';
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }
}
