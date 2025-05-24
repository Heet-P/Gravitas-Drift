import { SCREEN_WIDTH, SCREEN_HEIGHT, GameState, BulletType, EnemyType, PowerUpType } from './constants.js';
import { input } from './input.js';
import { Player } from './player.js';
import { Bullet } from './bullet.js';
import { Enemy } from './enemy.js';
import { PowerUp } from './powerup.js';
import { Particle } from './particle.js';
import { distance } from './utils.js';
import { saveScore, getTopScores, drawLeaderboard } from './leaderboard.js';
import { drawUI } from './ui.js';

let canvas, ctx;
let gameState = GameState.MENU;
let player;
let bullets = [];
let enemies = [];
let powerUps = [];
let particles = [];

let wave = 1;
let waveTimer = 0;
let score = 0;
let scoreSaved = false;
let topScores = [];
let gameOverTimer = 0;
let lastTime = 0;

function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    player = new Player();
    bullets = [];
    enemies = [];
    powerUps = [];
    particles = [];

    wave = 1;
    waveTimer = 0;
    score = 0;
    scoreSaved = false;

    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    let dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    update(dt);
    draw();

    requestAnimationFrame(gameLoop);
}

function update(dt) {
    switch (gameState) {
        case GameState.MENU:
            if (input.shoot || input.mouseDown) {
                gameState = GameState.PLAYING;
                init();
            }
            else if(input.keyL){
                gameState=GameState.LEADERBOARD;
                topScores=[];
            }
            break;

        case GameState.PLAYING:
            player.update(dt, input);

            if (player.health <= 0) {
                player.health = 0;
                gameState = GameState.GAME_OVER;
                gameOverTimer = 0;
                input.shoot = false;
                input.mouseDown = false;
            }

            let shootInterval = player.rapidFire ? 0.1 : 0.2;
            if ((input.shoot || input.mouseDown) && player.shootTimer <= 0) {
                const dir = getShootDirection();
                const vel = { x: dir.x * 400, y: dir.y * 400 };
                bullets.push(new Bullet(player.position, vel, BulletType.PLAYER, '#00ffff'));
                player.shootTimer = shootInterval;
            }

            bullets.forEach(b => b.update(dt, player.timeSlow));
            bullets = bullets.filter(b => b.active);

            enemies.forEach(e => e.update(dt, bullets));
            enemies = enemies.filter(e => e.active);

            powerUps.forEach(p => p.update(dt));
            powerUps = powerUps.filter(p => p.active);

            particles.forEach(p => p.update(dt));
            particles = particles.filter(p => p.active);

            handleCollisions();
            manageWaves(dt);
            break;

        case GameState.GAME_OVER:
            gameOverTimer += dt;

            if (!scoreSaved && gameOverTimer > 0.5) {
                const name = prompt("Game Over! Enter your name:");
                if (name){
                    console.log("Saving Score", name, score);
                    saveScore(name, score);
                }
                scoreSaved = true;
            }

            if ((input.shoot || input.mouseDown) && gameOverTimer > 1.0) {
                gameState = GameState.MENU;
                input.shoot = false;
                input.mouseDown = false;
            }
            break;

        case GameState.LEADERBOARD:
            if (topScores.length === 0) {
                getTopScores().then(data => {
                    topScores = data;
                });
            }
            if (input.keyM){
                gameState=GameState.MENU;
                input.keyM=false;
            }
            break;
    }
}

function draw() {
    ctx.clearRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    switch (gameState) {
        case GameState.MENU:
            drawMenu();
            break;
        case GameState.PLAYING:
            drawGame();
            break;
        case GameState.GAME_OVER:
            drawGameOver();
            break;
        case GameState.LEADERBOARD:
            drawLeaderboard(ctx, topScores);
            break;
    }
}

function drawMenu() {
    ctx.fillStyle = '#FF095D';
    ctx.font = '64px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Gravitas Drift', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 100);
    ctx.font = '20px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Press SPACE or MOUSE to start', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('Press L for Global LeaderBoard', SCREEN_WIDTH - 20, SCREEN_HEIGHT - 55);
    ctx.fillText('Made by Heet Parikh 24CS058', SCREEN_WIDTH - 20, SCREEN_HEIGHT - 35);
    ctx.fillText('Contact: heet16@gmail.com', SCREEN_WIDTH - 20, SCREEN_HEIGHT - 15);
    ctx.font = '16px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('Instructions:', 20, SCREEN_HEIGHT - 110);
    ctx.fillText('1. Use W/A/S/D to Move', 20, SCREEN_HEIGHT - 90);
    ctx.fillText('2. Power-Ups:', 20, SCREEN_HEIGHT - 70);
    ctx.fillText('   Blue = Shield', 20, SCREEN_HEIGHT - 50);
    ctx.fillText('   Green = Rapid Fire', 20, SCREEN_HEIGHT - 30);
    ctx.fillText('   Purple = Slow Time', 20, SCREEN_HEIGHT - 10);
}

function drawGame() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    particles.forEach(p => p.draw(ctx));
    bullets.forEach(b => b.draw(ctx));
    enemies.forEach(e => e.draw(ctx));
    powerUps.forEach(p => p.draw(ctx));
    player.draw(ctx);

    drawScore();
}

function drawGameOver() {
    ctx.fillStyle = 'red';
    ctx.font = '48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 40);

    ctx.fillStyle = 'white';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Score: ${score}`, SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 10);
    ctx.fillText('Click or press a key to return to menu', SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 50);
}

function drawScore() {
    drawUI(ctx, player, score, wave);
}

function handleCollisions() {
    // Player vs Enemy bullets (enemy bullets hitting the player)
    for (let b of bullets) {
        if (!b.active || b.type !== BulletType.ENEMY) continue;  // Only check enemy bullets

        if (distance(b.position, player.position) < b.radius + player.radius) {
            if (player.invulnTimer <= 0) {
                if (player.hasShield) {
                    player.hasShield = false; // Shield absorbs damage
                    spawnParticles(player.position, 'rgba(0,0,255,1.0)', 10); // Shield particle effect
                } else {
                    player.health -= 20; // Apply damage to player
                    player.invulnTimer = 1.0; // Set player invulnerability for a short time
                    spawnParticles(player.position, 'rgba(255,0,0,1.0)', 20); // Hit effect
                    score = Math.max(0, score - 50); // Deduct score on damage
                }
            }
            b.active = false; // Deactivate bullet after hit
        }
    }

    // Player vs Enemies (collision with enemies)
    for (let e of enemies) {
        if (!e.active) continue;

        if (distance(player.position, e.position) < player.radius + e.radius) {
            if (player.invulnTimer <= 0) {
                if (player.hasShield) {
                    player.hasShield = false; // Shield absorbs enemy collision
                    spawnParticles(player.position, 'rgba(0,0,255,1.0)', 15); // Shield particle effect
                } else {
                    player.health -= 30; // Apply collision damage to player
                    player.invulnTimer = 1.5; // Set player invulnerability
                    spawnParticles(player.position, 'rgba(255,0,0,1.0)', 25); // Collision effect
                }
            }
        }
    }

    // Player bullets hitting enemies
    for (let b of bullets) {
        if (!b.active || b.type !== BulletType.PLAYER) continue;  // Only check player bullets

        for (let e of enemies) {
            if (!e.active) continue; // Skip inactive enemies

            if (distance(b.position, e.position) < b.radius + e.radius) {
                e.health -= 1; // Apply damage to enemy
                b.active = false; // Deactivate bullet after hit

                // Spawn explosion effect
                spawnParticles(e.position, 'rgba(255,255,0,1.0)', 20);

                // Check if the enemy is dead
                if (e.health <= 0) {
                    e.active = false;
                    score += (e.type === EnemyType.BOSS ? 1000 : 100); // Add score for killing enemy
                    spawnParticles(e.position, 'rgba(255,0,0,1.0)', 30); // Spawn death effect
                    if (Math.random() < 0.5) {
                        const types = ['shield', 'rapid_fire', 'health_boost', 'time_slow'];
                        const type = types[Math.floor(Math.random() * types.length)];
                        powerUps.push(new PowerUp(e.position, type));
                    }
                }

                break; // Exit loop after the bullet hits the enemy
            }
        }
    }

    // Player vs Power-ups (pickup check)
    for (let p of powerUps) {
        if (!p.active) continue;

        if (distance(p.position, player.position) < p.radius + player.radius) {
            switch (p.type) {
                case PowerUpType.SHIELD:
                    player.hasShield = true;
                    player.shieldTimer = 10.0;
                    break;
                case PowerUpType.RAPID_FIRE:
                    player.rapidFire = true;
                    player.rapidFireTimer = 8.0;
                    break;
                case PowerUpType.HEALTH_BOOST:
                    player.health = Math.min(player.health + 30, player.maxHealth);
                    break;
                case PowerUpType.TIME_SLOW:
                    player.timeSlow = true;
                    player.timeSlowTimer = 5.0;
                    break;
            }
            score += 50;
            p.active = false;
            spawnParticles(p.position, 'rgba(255,255,255,1.0)', 10);
        }
    }
}

function manageWaves(dt) {
    waveTimer += dt;

    const waveClear = enemies.length === 0;
    if (waveClear && waveTimer > 2.0) {
        wave++;
        waveTimer = 0;

        const enemiesInWave = 3 + wave;
        for (let i = 0; i < enemiesInWave; i++) {
            const x = Math.random() * SCREEN_WIDTH;
            const y = Math.random() * SCREEN_HEIGHT * 0.3;
            const type = [EnemyType.BASIC, EnemyType.SCATTER, EnemyType.HOMING][Math.floor(Math.random() * 3)];
            enemies.push(new Enemy(type, { x, y }, player));
        }
    }
}

function getShootDirection() {
    let dx = input.mouseX - player.position.x;
    let dy = input.mouseY - player.position.y;
    let len = Math.sqrt(dx * dx + dy * dy) || 1;
    return { x: dx / len, y: dy / len };
}

function spawnParticles(pos, baseColor, count = 15) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(pos, baseColor));
    }
}

window.onload = init;
