const canvas = document.getElementById("gameCanvas")
const ctx = canvas.getContext("2d")
const scoreElement = document.getElementById("score")
const gestureElement = document.getElementById("gesture")

let score = 0
let gameOver = false
let touchStartY = 0
let lastTap = 0

const player = {
  x: 50,
  y: 0,
  width: 40,
  height: 80,
  color: "#FF69B4",
  velocityY: 0,
  isJumping: false,
  isSplitting: false,
  isTwirling: false,
}

const GRAVITY = 0.6
const JUMP_FORCE = -15
let GROUND_Y

let accessories = []
let powerUps = []
let obstacles = []

function resizeCanvas() {
  canvas.width = Math.min(window.innerWidth * 0.9, 800)
  canvas.height = Math.min(window.innerHeight * 0.7, 400)
  GROUND_Y = canvas.height - player.height
  player.y = GROUND_Y
}

function drawPlayer() {
  ctx.fillStyle = player.isTwirling ? "purple" : player.color
  ctx.fillRect(player.x, player.y, player.width, player.height)

  ctx.fillStyle = "white"
  ctx.fillRect(player.x + 10, player.y + 15, 5, 5)
  ctx.fillRect(player.x + 25, player.y + 15, 5, 5)
  ctx.fillStyle = "red"
  ctx.fillRect(player.x + 15, player.y + 30, 10, 3)
}

function spawnAccessory() {
  accessories.push({
    x: canvas.width,
    y: Math.random() * (GROUND_Y - 50),
    width: 20,
    height: 20,
    color: "pink",
    speed: 5,
  })
}

function spawnPowerUp() {
  powerUps.push({
    x: canvas.width,
    y: Math.random() * (GROUND_Y - 50),
    width: 25,
    height: 25,
    color: "gold",
    speed: 4,
  })
}

function spawnObstacle() {
  obstacles.push({
    x: canvas.width,
    y: GROUND_Y - 30,
    width: 30,
    height: 30,
    color: "red",
    speed: 6,
  })
}

function jump() {
  if (!player.isJumping && !player.isSplitting) {
    player.velocityY = JUMP_FORCE
    player.isJumping = true
    showGesture("JUMP!")
  }
}

function split() {
  if (!player.isJumping && !player.isSplitting) {
    player.isSplitting = true
    player.height = 40
    player.y = GROUND_Y + 40
    showGesture("SPLIT!")
    setTimeout(() => {
      player.isSplitting = false
      player.height = 80
      player.y = GROUND_Y
    }, 1000)
  }
}

function twirl() {
  if (!player.isTwirling) {
    player.isTwirling = true
    showGesture("TWIRL!")
    setTimeout(() => {
      player.isTwirling = false
    }, 1000)
  }
}

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
      score += 10
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
      score *= 2
      showGesture("DOUBLE POINTS!")
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
      gameOver = true
    }
  })
}

function gameLoop() {
  if (gameOver) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "white"
    ctx.font = "30px Arial"
    ctx.fillText("Game Over! Score: " + score, canvas.width / 2 - 100, canvas.height / 2)
    ctx.font = "20px Arial"
    ctx.fillText("Tap to restart", canvas.width / 2 - 50, canvas.height / 2 + 40)
    return
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#87CEEB"
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  player.velocityY += GRAVITY
  player.y += player.velocityY
  if (player.y > GROUND_Y) {
    player.y = GROUND_Y
    player.velocityY = 0
    player.isJumping = false
  }

  drawPlayer()
  ;[accessories, powerUps, obstacles].forEach((elements) => {
    elements.forEach((el) => {
      el.x -= el.speed
      ctx.fillStyle = el.color
      ctx.fillRect(el.x, el.y, el.width, el.height)
    })
  })

  checkCollisions()

  if (Math.random() < 0.02) spawnAccessory()
  if (Math.random() < 0.01) spawnPowerUp()
  if (Math.random() < 0.015) spawnObstacle()

  accessories = accessories.filter((acc) => acc.x + acc.width > 0)
  powerUps = powerUps.filter((power) => power.x + power.width > 0)
  obstacles = obstacles.filter((obs) => obs.x + obs.width > 0)

  scoreElement.textContent = "Score: " + score
  requestAnimationFrame(gameLoop)
}

function startGame() {
  gameOver = false
  score = 0
  accessories = []
  powerUps = []
  obstacles = []
  player.y = GROUND_Y
  player.velocityY = 0
  player.isJumping = false
  player.isSplitting = false
  player.isTwirling = false
  gameLoop()
}

canvas.addEventListener("touchstart", (e) => {
  e.preventDefault()
  if (gameOver) {
    startGame()
    return
  }

  const now = new Date().getTime()
  if (now - lastTap < 300) {
    twirl()
  } else {
    touchStartY = e.touches[0].clientY
  }
  lastTap = now
})

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault()
  const touchEndY = e.touches[0].clientY
  if (touchStartY - touchEndY > 50) {
    jump()
  } else if (touchEndY - touchStartY > 50) {
    split()
  }
  touchStartY = null
})

window.addEventListener("resize", resizeCanvas)
resizeCanvas()
startGame()

