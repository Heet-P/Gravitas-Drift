export function drawUI(ctx, player, score, wave) {
    // Health bar
    const healthPct = player.health / player.maxHealth;
    ctx.fillStyle = '#333';
    ctx.fillRect(20, 20, 200, 20);

    ctx.fillStyle =
        healthPct > 0.5 ? 'green' :
        healthPct > 0.25 ? 'yellow' : 'red';
    ctx.fillRect(20, 20, 200 * healthPct, 20);

    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.fillText('HEALTH',20, 55);

    // Score + wave
    ctx.fillStyle = '#00ffff';
    ctx.font = '20px sans-serif';
    ctx.fillText(`SCORE:${score}`, 550, 25); 
    // Power-up timers
    let y = 160;
    if (player.hasShield) {
        ctx.fillStyle = 'blue';
        ctx.fillText(`SHIELD: ${player.shieldTimer.toFixed(1)}s`, 5, y);
        y += 24;
    }
    if (player.rapidFire) {
        ctx.fillStyle = 'green';
        ctx.fillText(`RAPID FIRE: ${player.rapidFireTimer.toFixed(1)}s`, 5, y);
        y += 24;
    }
    if (player.timeSlow) {
        ctx.fillStyle = 'purple';
        ctx.fillText(`TIME SLOW: ${player.timeSlowTimer.toFixed(1)}s`, 5, y);
        y += 24;
    }
}
