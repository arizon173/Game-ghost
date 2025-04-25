const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');

let gameRunning = false;
let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
let frameCount = 0;

let gameTime = 0; // Лічильник часу
let lastSpeedIncreaseTime = 0; // Останній час збільшення швидкості
let speedIncreaseInterval = 20; // Інтервал для збільшення швидкості (20 секунд)

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Ініціалізація привида
let ghost = {
  x: 100,
  y: 200,
  size: Math.min(window.innerWidth, window.innerHeight) / 6, // Збільшили розмір
  velocity: 0,
  gravity: 0.15,
  jump: -6,
  airResistance: 0.98,
  image: new Image()
};

// Завантаження зображення привида
ghost.image.src = "fantome-dessin-115505320747bmn5i7pcd-removebg-preview.png";

// Функція для малювання привида
function drawGhost() {
  ctx.drawImage(ghost.image, ghost.x, ghost.y, ghost.size, ghost.size);
}


// Хмарки
let clouds = [];
let cloud.Image = new Image();
cloud.Image.src = "clouds-drawing-png-115523323527a6ovsmmut-removebg-preview.png";


function spawnCloud() {
  const size = ghost.size * 1.5;
  const y = Math.random() * (canvas.height - size);
  const cloudWidth = size * 2.4;
  const cloudHeight = size * 1.8;

  clouds.push({
    x: canvas.width + cloudWidth,
    y: y,
    width: cloudWidth,
    height: cloudHeight,
    speed: 3 // Початкова швидкість хмари
  });
}

function drawCloud(cloud) {
  ctx.drawImage(cloudImage, cloud.x, cloud.y, cloud.width, cloud.height);
}

function drawScore() {
  ctx.font = `bold ${canvas.width / 20}px 'Press Start 2P'`;
  ctx.fillStyle = 'gold';
  ctx.textAlign = 'center';

  const scoreText = "Score " + score; // Забрали двокрапку
  const bestText = " Best " + highScore; // Забрали двокрапку
  const fullText = scoreText + bestText;
  const fullWidth = ctx.measureText(fullText).width;
  const x = canvas.width / 2;
  const y = 60;
  const underlineOffset = 5;
  const underlineThickness = 3;

  // Малюємо текст
  ctx.fillText(fullText, x, y);

  // Стиль для лінії
  ctx.strokeStyle = 'gold';
  ctx.lineWidth = underlineThickness;

  // Малюємо лінію під усім текстом
  ctx.beginPath();
  ctx.moveTo(x - fullWidth / 2, y + underlineOffset);
  ctx.lineTo(x + fullWidth / 2, y + underlineOffset);
  ctx.stroke();

  // Відновлюємо налаштування
  ctx.textAlign = 'start';
}

function checkCollision(r1, r2) {
  // Отримуємо координати центру хмари
  const cloudCenterX = r2.x + r2.width / 2;
  const cloudCenterY = r2.y + r2.height / 2;

  // Піввісі еліпса (хмари)
  const a = r2.width / 2; // піввісота по осі X
  const b = r2.height / 2; // піввісота по осі Y

  // Визначаємо відстань від центру хмари до точки привида
  const distX = r1.x + r1.size / 2 - cloudCenterX; // відстань по X
  const distY = r1.y + r1.size / 2 - cloudCenterY; // відстань по Y

  // Перевіряємо, чи точка привида знаходиться всередині еліпса
  return (Math.pow(distX, 2) / Math.pow(a, 2)) + (Math.pow(distY, 2) / Math.pow(b, 2)) <= 1;
}



function update() {
  ghost.velocity += ghost.gravity;
  ghost.velocity *= ghost.airResistance;
  ghost.y += ghost.velocity;

  if (ghost.y + ghost.size > canvas.height) {
    ghost.y = canvas.height - ghost.size;
    ghost.velocity = 0;
    gameRunning = false;
    startBtn.style.display = 'block';
  }

  if (ghost.y < 0) {
    ghost.y = 0;
    ghost.velocity = 0;
  }

  for (let i = clouds.length - 1; i >= 0; i--) {
    const c = clouds[i];
    c.x -= c.speed;

    if (checkCollision(ghost, c)) {
      gameRunning = false;
      startBtn.style.display = 'block';
    }

    if (c.x + c.width < 0) {
      clouds.splice(i, 1);
    }
  }

  // Перевірка часу, щоб збільшити швидкість хмар
  if (gameTime - lastSpeedIncreaseTime >= speedIncreaseInterval) {
    lastSpeedIncreaseTime = gameTime;
    clouds.forEach(cloud => cloud.speed += 0.5); // Збільшуємо швидкість хмар
  }

  gameTime += 1 / 60; // Збільшуємо лічильник часу кожну секунду

  if (frameCount % 90 === 0) {
    spawnCloud();
  }

  if (frameCount % 50 === 0) {
    score++;
    if (score > highScore) {
      highScore = score;
      localStorage.setItem('highScore', highScore);
    }
  }

  frameCount++;
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  clouds.forEach(drawCloud);
  drawGhost();
  drawScore();
}

function gameLoop() {
  if (gameRunning) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }
}

function handleJump(e) {
  e.preventDefault();
  if (gameRunning) {
    ghost.velocity = ghost.jump;
  }
}

canvas.addEventListener('touchstart', handleJump, { passive: false });
canvas.addEventListener('mousedown', handleJump);

startBtn.addEventListener('click', () => {
  score = 0;
  frameCount = 0;
  clouds = [];
  ghost.y = canvas.height / 2;
  ghost.velocity = 0;
  ghost.size = Math.min(window.innerWidth, window.innerHeight) / 12;
  gameRunning = true;
  startBtn.style.display = 'none';
  resizeCanvas();
  gameLoop();
});
