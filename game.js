const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 400;

// Game variables
let score = 0;
let gameOver = false;
let touchStartY = 0;
let lastTap = 0;

// Player
const player = {
    x: 50,
    y: 300,
    width: 40,
    height: 80,
    color: '#FF69B4',
    velocityY: 0,
    isJumping: false,
    isSplitting: false,
    isTwirling: false
};

// Game elements
let accessories = [];
let powerUps = [];
let obstacles = [];

// Game constants
const GRAVITY = 0.6;
const JUMP_FORCE = -15;
const GROUND_Y = canvas.height - player.height;

function drawPlayer() {
    ctx.fillStyle = player.isTwirling ? 'purple' : player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw face
    ctx.fillStyle = 'white';
    ctx.fillRect(player.x + 10, player.y + 15, 5, 5); // Left eye
    ctx.fillRect(player.x + 25, player.y + 15, 5, 5); // Right eye
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x + 15, player.y + 30, 10, 3); // Mouth
}

function spawnAccessory() {
    accessories.push({
        x: canvas.width,
        y: Math.random() * (GROUND_Y - 50),
        width: 20,
        height: 20,
        color: 'pink'
    });
}

function spawnPowerUp() {
    powerUps.push({
        x: canvas.width,
        y: Math.random() * (GROUND_Y - 50),
        width: 25,
        height: 25,
        color: 'gold'
    });
}

function spawnObstacle() {
    obstacles.push({
        x: canvas.width,
        y: GROUND_Y - 30,
        width: 30,
        height: 30,
        color: 'red'
    });
}

function jump() {
    if (!player.isJumping && !player.isSplitting) {
        player.velocityY = JUMP_FORCE;
        player.isJumping = true;
    }
}

function split() {
    if (!player.isJumping && !player.isSplitting) {
        player.isSplitting = true;
        player.height = 40;
        player.y = GROUND_Y + 40;
        setTimeout(() => {
            player.isSplitting = false;
            player.height = 80;
            player.y = GROUND_Y;
        }, 1000);
    }
}

function twirl() {
    if (!player.isTwirling) {
        player.isTwirling = true;
        setTimeout(() => { player.isTwirling = false; }, 1000);
    }
}

function checkCollisions() {
    accessories = accessories.filter(acc => {
        if (player.x < acc.x + acc.width &&
            player.x + player.width > acc.x &&
            player.y < acc.y + acc.height &&
            player.y + player.height > acc.y) {
            score += 10;
            return false;
        }
        return true;
    });

    powerUps = powerUps.filter(power => {
        if (player.x < power.x + power.width &&
            player.x + player.width > power.x &&
            player.y < power.y + power.height &&
            player.y + player.height > power.y) {
            score *= 2;
            return false;
        }
        return true;
    });

    obstacles.forEach(obs => {
        if (player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y) {
            gameOver = true;
        }
    });
}

function gameLoop() {
    if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '30px Arial';
        ctx.fillText('Game Over! Score: ' + score, canvas.width / 2 - 100, canvas.height / 2);
        ctx.font = '20px Arial';
        ctx.fillText('Tap to restart', canvas.width / 2 - 50, canvas.height / 2 + 40);
        return;
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update player
    player.velocityY += GRAVITY;
    player.y += player.velocityY;
    if (player.y > GROUND_Y) {
        player.y = GROUND_Y;
        player.velocityY = 0;
        player.isJumping = false;
    }

    // Draw player
    drawPlayer();

    // Update and draw game elements
    [accessories, powerUps, obstacles].forEach(elements => {
        elements.forEach(el => {
            el.x -= 5;
            ctx.fillStyle = el.color;
            ctx.fillRect(el.x, el.y, el.width, el.height);
        });
    });

    // Check collisions
    checkCollisions();

    // Spawn new elements
    if (Math.random() < 0.02) spawnAccessory();
    if (Math.random() < 0.01) spawnPowerUp();
    if (Math.random() < 0.015) spawnObstacle();

    // Remove off-screen elements
    accessories = accessories.filter(acc => acc.x + acc.width > 0);
    powerUps = powerUps.filter(power => power.x + power.width > 0);
    obstacles = obstacles.filter(obs => obs.x + obs.width > 0);

    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Score: ' + score, 10, 30);

    requestAnimationFrame(gameLoop);
}

// Event listeners
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameOver) {
        gameOver = false;
        score = 0;
        accessories = [];
        powerUps = [];
        obstacles = [];
        player.y = GROUND_Y;
        player.velocityY = 0;
        gameLoop();
        return;
    }

    let now = new Date().getTime();
    if (now - lastTap < 300) {
        twirl();
    } else {
        touchStartY = e.touches[0].clientY;
    }
    lastTap = now;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touchEndY = e.touches[0].clientY;
    if (touchStartY - touchEndY > 50) {
        jump();
    } else if (touchEndY - touchStartY > 50) {
        split();
    }
    touchStartY = null;
});

// Start the game
gameLoop();

