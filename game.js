const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gestureElement = document.getElementById('gesture');

function resizeCanvas() {
    canvas.width = Math.min(window.innerWidth * 0.9, 800);
    canvas.height = Math.min(window.innerHeight * 0.7, 500);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let score = 0;
let touchStartY = 0;
let touchStartX = 0;

const player = { x: 80, y: 0, width: 60, height: 120, velocityY: 0, isJumping: false, isSplitting: false, isTwirling: false };
const gravity = 0.5, jumpForce = -15, groundY = canvas.height - player.height;
player.y = groundY;

let accessories = [], powerUps = [];
function spawnAccessory() {
    accessories.push({ x: canvas.width, y: Math.random() * (groundY - 100), width: 30, height: 40, color: 'pink', points: 50, speed: 5 });
}
function spawnPowerUp() {
    powerUps.push({ x: canvas.width, y: Math.random() * (groundY - 150), width: 35, height: 45, color: 'gold', effect: 'doublePoints', speed: 4 });
}

function drawPlayer() {
    ctx.fillStyle = "#FF69B4";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function jump() {
    if (!player.isJumping && !player.isSplitting) {
        player.velocityY = jumpForce;
        player.isJumping = true;
    }
}
function split() {
    if (!player.isJumping && !player.isSplitting) {
        player.isSplitting = true;
        player.height = 60;
        player.y = groundY + 60;
        setTimeout(() => { player.isSplitting = false; player.height = 120; player.y = groundY; }, 1000);
    }
}
function twirl() {
    if (!player.isTwirling) {
        player.isTwirling = true;
        setTimeout(() => { player.isTwirling = false; }, 1000);
    }
}

let lastTap = 0;
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    let now = new Date().getTime();
    if (now - lastTap < 300) {
        twirl();
        gestureElement.textContent = "TWIRL!";
    } else {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
    }
    lastTap = now;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touchEndY = e.touches[0].clientY;
    if (touchStartY - touchEndY > 50) { jump(); gestureElement.textContent = "JUMP!"; }
    else if (touchEndY - touchStartY > 50) { split(); gestureElement.textContent = "SPLIT!"; }
    touchStartY = null;
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#333";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    player.velocityY += gravity;
    player.y += player.velocityY;
    if (player.y > groundY) { player.y = groundY; player.velocityY = 0; player.isJumping = false; }
    accessories.forEach(acc => {
        acc.x -= acc.speed;
        ctx.fillStyle = acc.color;
        ctx.fillRect(acc.x, acc.y, acc.width, acc.height);
    });
    powerUps.forEach(power => {
        power.x -= power.speed;
        ctx.fillStyle = power.color;
        ctx.fillRect(power.x, power.y, power.width, power.height);
    });
    scoreElement.textContent = `Score: ${score}`;
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
