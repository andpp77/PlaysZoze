const player = document.getElementById('player');
const gameWorld = document.getElementById('game-world');
const livesDisplay = document.getElementById('lives-count');
const coinDisplay = document.getElementById('coin-count');

// Configuração de Sprites (Links públicos para teste)
const sprites = {
    idle: "./imgs/1.png",
    walk1: "./imgs/2.png",
    walk2: "./imgs/3.png",
    jump: "./imgs/4.png"
};

let playerX, playerY, velocityY, lives, coins, cameraX, isJumping, gameActive, isPaused;
let animCounter = 0; // Controla a velocidade da animação

const GRAVITY = 0.8;
const JUMP_STRENGTH = -16;
const MOVE_SPEED = 5;
const keys = {};

document.getElementById('start-button').addEventListener('click', startGame);

function startGame() {
    playerX = 100; playerY = 300; velocityY = 0;
    lives = 3; coins = 0; cameraX = 0;
    isJumping = false; gameActive = true; isPaused = false;
    
    livesDisplay.innerText = lives;
    coinDisplay.innerText = coins;
    document.querySelector('.overlay').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    gameWorld.classList.remove('hidden');
    
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
document.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

// FUNÇÃO DE ANIMAÇÃO
function updateAnimation() {
    animCounter++;

    if (isJumping) {
        player.style.backgroundImage = `url('${sprites.jump}')`;
    } 
    else if (keys['d'] || keys['arrowright'] || keys['a'] || keys['arrowleft']) {
        // Alterna entre walk1 e walk2 a cada 10 frames
        if (animCounter % 20 < 10) {
            player.style.backgroundImage = `url('${sprites.walk1}')`;
        } else {
            player.style.backgroundImage = `url('${sprites.walk2}')`;
        }
    } 
    else {
        player.style.backgroundImage = `url('${sprites.idle}')`;
    }

    // Virar o Sprite (Horizontal)
    if (keys['a'] || keys['arrowleft']) {
        player.style.transform = "scaleX(-1)";
    } else if (keys['d'] || keys['arrowright']) {
        player.style.transform = "scaleX(1)";
    }
}

function updatePhysics() {
    let onGround = false;
    const platforms = document.querySelectorAll('.platform');

    platforms.forEach(plat => {
        const px = parseFloat(plat.style.left);
        const py = parseFloat(plat.style.top);
        const pw = parseFloat(plat.style.width);

        if (playerX + 30 > px && playerX < px + pw - 5) {
            if (playerY + 40 <= py + 10 && playerY + 40 + velocityY >= py) {
                if (velocityY >= 0) {
                    playerY = py - 40;
                    velocityY = 0;
                    isJumping = false;
                    onGround = true;
                }
            }
        }
    });

    if (!onGround) {
        velocityY += GRAVITY;
        playerY += velocityY;
        isJumping = true; 
    }

    if (playerY > 500) die();
}

function die() {
    lives--;
    livesDisplay.innerText = lives;
    if (lives <= 0) {
        gameActive = false;
        location.reload();
    } else {
        playerX -= 150; playerY = 100; velocityY = 0;
    }
}

function gameLoop() {
    if (!gameActive) return;

    if (keys['arrowright'] || keys['d']) playerX += MOVE_SPEED;
    if (keys['arrowleft'] || keys['a']) playerX -= MOVE_SPEED;
    if ((keys['w'] || keys[' ']) && !isJumping) {
        velocityY = JUMP_STRENGTH;
        isJumping = true;
    }

    updatePhysics();
    updateAnimation(); // Chama a animação em cada frame

    if (playerX > 400) cameraX = playerX - 400;
    gameWorld.style.transform = `translateX(-${cameraX}px)`;
    player.style.left = playerX + "px";
    player.style.top = playerY + "px";

    requestAnimationFrame(gameLoop);
}