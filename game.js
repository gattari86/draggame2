const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")
const scoreElement = document.getElementById("score")
const gestureElement = document.getElementById("gesture")
const loadingScreen = document.getElementById("loadingScreen")
const gameContainer = document.getElementById("gameContainer")
const instructionsElement = document.getElementById("instructions")
const gameOverScreen = document.getElementById("gameOver")
const finalScoreElement = document.getElementById("finalScore")
const restartButton = document.getElementById("restartButton")

let gameStarted = false
let gameOver = false

function resizeCanvas() {
  canvas.width = Math.min(window.innerWidth * 0.9, 800)
  canvas.height = Math.min(window.innerHeight * 0.7, 500)
  groundY = canvas.height - player.height
  player.y = groundY
}

resizeCanvas()
window.addEventListener("resize", resizeCanvas)

let score = 0
let touchStartY = 0
let touchStartX = 0

const player = {
  x: 80,
  y: 0,
  width: 60,
  height: 120,
  velocityY: 0,
  isJumping: false,
  isSplitting: false,
  isTwirling: false,
}

const gravity = 0.5,
  jumpForce = -15
let groundY = canvas.height - player.height
player.y = groundY

let accessories = [],
  powerUps = [],
  obstacles = []

function spawnAccessory() {
  accessories.push({
    x: canvas.width,
    y: Math.random() * (groundY - 100),
    width: 30,
    height: 40,
    color: "pink",
    points: 50,
    speed: 5,
  })
}

function spawnPowerUp() {
  powerUps.push({
    x: canvas.width,
    y: Math.random() * (groundY - 150),
    width: 35,
    height: 45,
    color: "gold",
    effect: "doublePoints",
    speed: 4,
  })
}

function spawnObstacle() {
  obstacles.push({
    x: canvas.width,
    y: groundY - 50,
    width: 40,
    height: 50,
    color: "red",
    speed: 6,
  })
}

function drawPlayer() {
  ctx.fillStyle = player.isTwirling ? "purple" : "#FF69B4"
  ctx.fillRect(player.x, player.y, player.width, player.height)

  // Draw face
  ctx.fillStyle = "white"
  ctx.fillRect(player.x + 15, player.y + 20, 10, 10) // Left eye
  ctx.fillRect(player.x + 35, player.y + 20, 10, 10) // Right eye
  ctx.fillStyle = "red"
  ctx.fillRect(player.x + 20, player.y + 50, 20, 5) // Mouth
}

function jump() {
  if (!player.isJumping && !player.isSplitting) {
    player.velocityY = jumpForce
    player.isJumping = true
  }
}

function split() {
  if (!player.isJumping && !player.isSplitting) {
    player.isSplitting = true
    player.height = 60
    player.y = groundY + 60
    setTimeout(() => {
      player.isSplitting = false
      player.height = 120
      player.y = groundY
    }, 1000)
  }
}

function twirl() {
  if (!player.isTwirling) {
    player.isTwirling = true
    setTimeout(() => {
      player.isTwirling = false
    }, 1000)
  }
}

let lastTap = 0
canvas.addEventListener("touchstart", (e) => {
  e.preventDefault()
  if (!gameStarted) {
    startGame()
    return
  }
  const now = new Date().getTime()
  if (now - lastTap < 300) {
    twirl()
    showGesture("TWIRL!")
  } else {
    touchStartY = e.touches[0].clientY
    touchStartX = e.touches[0].clientX
  }
  lastTap = now
})

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault()
  const touchEndY = e.touches[0].clientY
  if (touchStartY - touchEndY > 50) {
    jump()
    showGesture("JUMP!")
  } else if (touchEndY - touchStartY > 50) {
    split()
    showGesture("SPLIT!")
  }
  touchStartY = null
})

function showGesture(text) {
  gestureElement.textContent = text
  gestureElement.style.opacity = 1
  setTimeout(() => {
    gestureElement.style.opacity = 0
  }, 1000)
}

function checkCollisions() {
  accessories = accessories.filter((acc) => {
    if (
      player.x < acc.x + acc.width &&
      player.x + player.width > acc.x &&
      player.y < acc.y + acc.height &&
      player.y + player.height > acc.y
    ) {
      score += acc.points
      return false
    }
    return true
  })

  powerUps = powerUps.filter((power) => {
    if (
      player.x < power.x + power.width &&
      player.x + player.width > power.x &&
      player.y < power.y + power.height &&
      player.y + player.height > power.y
    ) {
      applyPowerUp(power.effect)
      return false
    }
    return true
  })

  obstacles.forEach((obs) => {
    if (
      player.x < obs.x + obs.width &&
      player.x + player.width > obs.x &&
      player.y < obs.y + obs.height &&
      player.y + player.height > obs.y
    ) {
      endGame()
    }
  })
}

function applyPowerUp(effect) {
  if (effect === "doublePoints") {
    score *= 2
    showGesture("DOUBLE POINTS!")
  }
}

function gameLoop() {
  if (gameOver) return

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // Draw background
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
  gradient.addColorStop(0, "#87CEEB")
  gradient.addColorStop(1, "#E0F6FF")
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  drawPlayer()

  player.velocityY += gravity
  player.y += player.velocityY
  if (player.y > groundY) {
    player.y = groundY
    player.velocityY = 0
    player.isJumping = false
  }
  // Move and draw game elements
  ;[accessories, powerUps, obstacles].forEach((elements) => {
    elements.forEach((el) => {
      el.x -= el.speed
      ctx.fillStyle = el.color
      ctx.fillRect(el.x, el.y, el.width, el.height)
    })
  })

  checkCollisions()

  // Spawn new elements
  if (Math.random() < 0.02) spawnAccessory()
  if (Math.random() < 0.01) spawnPowerUp()
  if (Math.random() < 0.015) spawnObstacle()

  // Remove off-screen elements
  accessories = accessories.filter((acc) => acc.x + acc.width > 0)
  powerUps = powerUps.filter((power) => power.x + power.width > 0)
  obstacles = obstacles.filter((obs) => obs.x + obs.width > 0)

  scoreElement.textContent = `Score: ${score}`
  requestAnimationFrame(gameLoop)
}

function startGame() {
  gameStarted = true
  gameOver = false
  loadingScreen.classList.add("hidden")
  gameContainer.classList.remove("hidden")
  instructionsElement.classList.remove("hidden")
  gameOverScreen.classList.add("hidden")
  score = 0
  accessories = []
  powerUps = []
  obstacles = []
  player.y = groundY
  player.velocityY = 0
  player.isJumping = false
  player.isSplitting = false
  player.isTwirling = false
  requestAnimationFrame(gameLoop)
}

function endGame() {
  gameOver = true
  gameOverScreen.classList.remove("hidden")
  finalScoreElement.textContent = score
}

restartButton.addEventListener("click", startGame)

// Initial game setup
window.addEventListener("load", () => {
  setTimeout(() => {
    loadingScreen.classList.add("hidden")
    gameContainer.classList.remove("hidden")
    instructionsElement.classList.remove("hidden")
  }, 2000) // Simulating loading time
})

canvas.addEventListener("click", startGame)

