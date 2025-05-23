export function saveLeaderboard(name, score) {
    try {
        let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
        leaderboard.push({ name, score });
        leaderboard.sort((a, b) => b.score - a.score);
        if (leaderboard.length > 10) leaderboard = leaderboard.slice(0, 10);
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    } catch (error) {
        console.error('Error saving leaderboard:', error);
    }
}

export function loadLeaderboard() {
    try {
        return JSON.parse(localStorage.getItem('leaderboard')) || [];
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        return [];
    }
}

export function drawLeaderboard(ctx, leaderboard) {
    ctx.fillStyle = 'yellow';
    ctx.font = '32px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('LEADERBOARD', SCREEN_WIDTH / 2, 100);

    // Display top 10 scores
    for (let i = 0; i < leaderboard.length; i++) {
        const entry = leaderboard[i];
        const color = i === 0 ? 'gold' : (i === 1 ? 'silver' : (i === 2 ? 'bronze' : 'white'));
        
        ctx.fillStyle = color;
        ctx.fillText(`${i + 1}. ${entry.name} - ${entry.score}`, SCREEN_WIDTH / 2, 180 + i * 40);
    }

    if (leaderboard.length === 0) {
        ctx.fillStyle = 'white';
        ctx.fillText('No scores yet!', SCREEN_WIDTH / 2, 200);
    }

    ctx.fillStyle = 'yellow';
    ctx.fillText("Press M to return to Menu", SCREEN_WIDTH / 2, SCREEN_HEIGHT - 50);
}


