const startBtn = document.getElementById("startBtn");
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const ws = new WebSocket("ws://" + location.host);

let isHost = false;
let lines = [];
let drawing = false;
let currentLine = null;

let score = { left: 0, right: 0 };
let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  vx: 5,
  vy: 3,
  radius: 10
};

// Zeichnen
canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  currentLine = { x1: e.clientX, y1: e.clientY, x2: e.clientX, y2: e.clientY };
});

canvas.addEventListener("mousemove", (e) => {
  if (drawing) {
    currentLine.x2 = e.clientX;
    currentLine.y2 = e.clientY;
  }
});

canvas.addEventListener("mouseup", () => {
  if (currentLine) {
    const line = {
      ...currentLine,
      time: Date.now(),
      player: isHost ? "host" : "client" // 💡 Hier kommt die Info über den Spieler rein
    };
    lines.push(line);
    ws.send(JSON.stringify({ type: "line", line }));
  }
  drawing = false;
  currentLine = null;
});

// WebSocket-Nachrichten
ws.onmessage = async (event) => {
  let msg;

  try {
    if (event.data instanceof Blob) {
      const text = await event.data.text();
      msg = JSON.parse(text);
    } else {
      msg = JSON.parse(event.data);
    }
  } catch (err) {
    console.error("Fehler beim Parsen der Nachricht:", err);
    return;
  }

  console.log("Nachricht vom Server:", msg);

  if (msg.type === "host") {
    isHost = true;
    console.log("Ich bin der Host");
    startBtn.style.display = "block";
  }

  if (msg.type === "start") {
    resetBall();
    gameLoop(); // Spiel starten
  }

  if (msg.type === "line") {
    lines.push({ ...msg.line, time: Date.now() });
  }

  if (msg.type === "ball") {
    ball = msg.ball;
    score = msg.score;
    updateScore();
  }

  if (msg.type === "test") {
    console.log("Testnachricht:", msg.message);
  }
};

startBtn.addEventListener("click", () => {
  resetBall();
  gameLoop();
  ws.send(JSON.stringify({ type: "start" }));
  startBtn.style.display = "none"; // Button ausblenden
});

function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.vx = Math.random() > 0.5 ? 5 : -5;
  ball.vy = (Math.random() - 0.5) * 6;
}

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
    ball.vy *= -1;
  }

  if (ball.x < 0) {
    score.right++;
    updateScore();
    resetBall();
  } else if (ball.x > canvas.width) {
    score.left++;
    updateScore();
    resetBall();
  }

  for (let line of lines) {
    if (checkLineCollision(line)) {
      reflectBall(line);
    }
  }

  if (!isHost) return;
  ws.send(JSON.stringify({
    type: "ball",
    ball,
    score
  }));
}

function cleanupLines() {
  const now = Date.now();
  lines = lines.filter(line => now - line.time < 5000);
}

function checkLineCollision(line) {
  const dist = distanceToSegment(ball.x, ball.y, line.x1, line.y1, line.x2, line.y2);
  return dist < ball.radius;
}

function reflectBall(line) {
  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;
  const normalX = -dy;
  const normalY = dx;
  const length = Math.sqrt(normalX * normalX + normalY * normalY);
  const nx = normalX / length;
  const ny = normalY / length;

  const dot = ball.vx * nx + ball.vy * ny;
  ball.vx -= 2 * dot * nx;
  ball.vy -= 2 * dot * ny;
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  return Math.hypot(px - projX, py - projY);
}

function updateScore() {
  document.getElementById("scoreboard").textContent =
    `Links: ${score.left} | Rechts: ${score.right}`;
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();
}

function drawLines() {
  ctx.lineWidth = 4;
  for (let line of lines) {
    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);

    // 💡 Strichfarbe abhängig vom Spieler
    if (line.player === "host") {
      ctx.strokeStyle = "blue";
    } else if (line.player === "client") {
      ctx.strokeStyle = "red";
    } else {
      ctx.strokeStyle = "gray"; // fallback für alte Linien
    }

    ctx.stroke();
  }

  if (currentLine) {
    ctx.beginPath();
    ctx.moveTo(currentLine.x1, currentLine.y1);
    ctx.lineTo(currentLine.x2, currentLine.y2);
    ctx.strokeStyle = isHost ? "blue" : "red"; // 💡 eigene Farbe beim Zeichnen
    ctx.stroke();
  }
}


function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (isHost) {
    updateBall();
  }

  cleanupLines();
  drawBall();
  drawLines();
  requestAnimationFrame(gameLoop);
}

ws.onopen = () => {
  console.log("WebSocket verbunden");
  updateScore();
  // Kein gameLoop() hier, es wird durch "start" gesteuert!
};
