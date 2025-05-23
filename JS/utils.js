export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

export function distance(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}
