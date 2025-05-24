export const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    shoot: false,
    mouseX: 0,
    mouseY: 0,
    keyL: false,
    keyM: false
};

window.addEventListener('keydown', (e) => {
    switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
            input.up = true;
            break;
        case 'KeyS':
        case 'ArrowDown':
            input.down = true;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            input.left = true;
            break;
        case 'KeyD':
        case 'ArrowRight':
            input.right = true;
            break;
        case 'Space':
            input.shoot = true;
            break;
        case 'KeyL':
            input.keyL = true;
            break;
        case 'KeyM':
            input.keyM = true;
            break;
    }
});

window.addEventListener('keyup', (e) => {
    switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
            input.up = false;
            break;
        case 'KeyS':
        case 'ArrowDown':
            input.down = false;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            input.left = false;
            break;
        case 'KeyD':
        case 'ArrowRight':
            input.right = false;
            break;
        case 'Space':
            input.shoot = false;
            break;
        case 'KeyL':
            input.keyL = false;
            break;
        case 'KeyM':
            input.keyM = false;
            break;
    }
});

window.addEventListener('mousemove', (e) => {
    const canvas = document.getElementById('gameCanvas');
    const rect = canvas.getBoundingClientRect();
    input.mouseX = e.clientX - rect.left;
    input.mouseY = e.clientY - rect.top;
});
input.mouseDown = false;

window.addEventListener('mousedown', () => input.mouseDown = true);
window.addEventListener('mouseup', () => input.mouseDown = false);
