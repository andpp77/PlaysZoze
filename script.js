// --- Variáveis de Jogo ---
const player = document.getElementById('player');
const gameContainer = document.getElementById('game-container');
const enemy = document.getElementById('goomba'); // Pegando o inimigo

let playerX = 50;
let playerY = 0; // Posição Y (0 é o chão)
let velocityY = 0; // Velocidade vertical (para pulo e gravidade)
let isJumping = false;
let isFalling = false;

const GRAVITY = 0.5;
const JUMP_STRENGTH = 10;
const MOVE_SPEED = 5;

// --- Colisões e Estado do Jogo ---

/**
 * Função principal de colisão.
 * @returns {number} O Y da plataforma em que o jogador está, ou -1 se estiver no ar.
 */
function checkCollision() {
    const platforms = document.querySelectorAll('.platform');
    let maxGroundY = 0;
    let hitPlatform = false;

    // Define as coordenadas do jogador
    const playerRect = player.getBoundingClientRect();
    const gameRect = gameContainer.getBoundingClientRect();

    // Normaliza as coordenadas do jogador em relação ao contêiner
    const pLeft = playerRect.left - gameRect.left;
    const pRight = playerRect.right - gameRect.left;
    const pBottom = gameRect.height - (playerRect.bottom - gameRect.top);
    const pTop = gameRect.height - (playerRect.top - gameRect.top);

    platforms.forEach(platform => {
        const platformRect = platform.getBoundingClientRect();
        
        // Normaliza as coordenadas da plataforma
        const plLeft = platformRect.left - gameRect.left;
        const plRight = platformRect.right - gameRect.left;
        const plBottom = gameRect.height - (platformRect.bottom - gameRect.top);
        const plTop = gameRect.height - (platformRect.top - gameRect.top);

        // Checa sobreposição horizontal
        if (pRight > plLeft && pLeft < plRight) {
            // Checa colisão com o topo (pouso)
            // Se o jogador está caindo (isFalling) e a base do jogador está
            // prestes a tocar ou está tocando a plataforma.
            if (isFalling && pBottom >= plTop && pBottom - velocityY <= plTop) {
                // Colisão de Pouso!
                maxGroundY = Math.max(maxGroundY, plTop);
                hitPlatform = true;
            }
        }
    });
    
    // Colisão com o chão (ground)
    maxGroundY = Math.max(maxGroundY, 20); // Altura do chão definida no CSS (20px)

    return maxGroundY;
}

/**
 * Função de colisão do jogador com o inimigo.
 */
function checkEnemyCollision() {
    if (enemy.getAttribute('data-alive') === 'false') return;

    const playerRect = player.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect();
    
    // Verifica sobreposição de retângulos (colisão básica)
    if (playerRect.left < enemyRect.right &&
        playerRect.right > enemyRect.left &&
        playerRect.top < enemyRect.bottom &&
        playerRect.bottom > enemyRect.top) {

        // --- Colisão Aconteceu! ---

        // Verifica se foi um PULO/PISÃO (jogador está acima e caindo/descendo)
        // Se o topo do jogador (que é o que está acima) está acima do topo do inimigo E
        // O jogador está se movendo para baixo (velocityY < 0)
        // OBS: No sistema de coordenadas da tela, Y cresce para baixo, mas estamos
        // usando a convenção de jogo onde Y cresce para cima, então velocityY < 0 significa 'caindo'.
        
        // Vamos simplificar: Pisão ocorre se o *fundo* do jogador está no *terço superior* do inimigo.
        const isStomp = playerRect.bottom <= enemyRect.top + (enemyRect.height * 0.3) && velocityY < 0;

        if (isStomp) {
            // Derrotar o inimigo
            console.log("PISOU NO INIMIGO!");
            enemy.setAttribute('data-alive', 'false');
            enemy.classList.add('dead');
            // Dá um pequeno pulo extra para o jogador
            velocityY = JUMP_STRENGTH * 0.6; 
        } else {
            // O jogador foi atingido (lógica de dano aqui, por exemplo, reiniciar)
            console.log("JOGADOR FOI ATINGIDO!");
            alert("Game Over! Tente novamente.");
            location.reload(); // Reinicia o jogo (muito simplificado)
        }
    }
}


// --- Lógica do Jogo (Game Loop) ---

function gameLoop() {
    // 1. Aplica Gravidade
    velocityY -= GRAVITY;
    playerY += velocityY;

    // 2. Verifica Colisão com Plataforma/Chão
    const groundY = checkCollision();
    
    if (playerY <= groundY) {
        playerY = groundY; // Reposiciona no chão/plataforma
        velocityY = 0; // Zera a velocidade vertical
        isJumping = false;
        isFalling = false;
    } else if (velocityY < 0) {
        isFalling = true; // Só está caindo se estiver no ar e a velocidade for negativa
    }


    // 3. Verifica Colisão com Inimigo
    checkEnemyCollision();


    // 4. Atualiza Posição do Personagem no DOM (Visual)
    player.style.left = `${playerX}px`;
    // playerY = 0 é o chão, e o CSS bottom: 0px também é o chão.
    player.style.bottom = `${playerY}px`; 


    // 5. Move o Inimigo (Movimento Básico de Vai-e-Vem)
    if (enemy.getAttribute('data-alive') === 'true') {
        let enemyX = parseInt(enemy.style.left || 600); // Posição inicial

        // Movimento simples (exemplo: andando para a esquerda)
        enemyX -= 1; 

        // Reposiciona o inimigo se sair da tela (muito simplificado)
        if (enemyX < 50) { 
            enemyX = 750;
        }

        enemy.style.left = `${enemyX}px`;
        // Garantindo que o inimigo fique no chão
        enemy.style.bottom = '20px'; 
    }


    requestAnimationFrame(gameLoop); // Próxima iteração
}

// --- Controles de Teclado ---

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowRight':
        case 'd':
            playerX += MOVE_SPEED;
            break;
        case 'ArrowLeft':
        case 'a':
            playerX -= MOVE_SPEED;
            break;
        case ' ': // Barra de espaço
        case 'w':
            if (!isJumping) {
                // Só pode pular se não estiver pulando/caindo
                isJumping = true;
                velocityY = JUMP_STRENGTH;
            }
            break;
    }
    
    // Garante que o jogador não saia dos limites do jogo
    if (playerX < 0) playerX = 0;
    if (playerX > gameContainer.offsetWidth - player.offsetWidth) {
        playerX = gameContainer.offsetWidth - player.offsetWidth;
    }
});

// --- Iniciar o Jogo ---
gameLoop();