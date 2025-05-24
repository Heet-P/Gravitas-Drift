import { SCREEN_WIDTH, SCREEN_HEIGHT } from './constants.js';

export async function saveScore(name, score) {
    if (!window.supabase) {
        console.error("Supabase client not found.");
        return;
    }
    //Case-sensitive issue resolve;
    name=name.trim().toLowerCase();
    
    const { data: existing, error: fetchError } = await window.supabase
        .from('leaderboard')
        .select('score')
        .eq('name', name)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') {  // ignore "row not found"
        console.error('Failed to check existing score:', fetchError.message);
        return;
    }

    // If user exists and old score is higher, don't update
    if (existing && existing.score >= score) {
        console.log('Score not updated: existing score is higher or equal.');
        return;
    }

    const { error } = await window.supabase
        .from('leaderboard')
        .upsert([{ name, score }], { onConflict: ['name'] });

    if (error) {
        console.error('Failed to save score:', error.message);
    } else {
        console.log("Score saved/updated to Supabase.");
    }
}

export async function getTopScores(limit = 10) {
    if (!window.supabase) {
        console.error("Supabase client not found.");
        return [];
    }

    const { data, error } = await window.supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Failed to fetch leaderboard:', error.message);
        return [];
    }

    return data;
}

export function drawLeaderboard(ctx, leaderboard) {
    ctx.fillStyle = 'yellow';
    ctx.font = '32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GLOBAL LEADERBOARD', SCREEN_WIDTH / 2, 100);

    if (leaderboard.length === 0) {
        ctx.fillStyle = 'white';
        ctx.fillText('No scores yet!', SCREEN_WIDTH / 2, 200);
    } else {
        for (let i = 0; i < leaderboard.length; i++) {
            const entry = leaderboard[i];
            const color = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'orange' : 'white';
            ctx.fillStyle = color;
            ctx.fillText(`${i + 1}. ${entry.name} - ${entry.score}`, SCREEN_WIDTH / 2, 180 + i * 40);
        }
    }

    ctx.fillStyle = 'yellow';
    ctx.fillText("Press M to return to Menu", SCREEN_WIDTH / 2, SCREEN_HEIGHT - 50);
}
