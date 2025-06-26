// Knopf zum Spielstart holen
const startBtn = document.getElementById("startBtn");
// Das Spielfeld (Canvas) holen
const canvas = document.getElementById("gameCanvas");
// Kontext zum Zeichnen holen
const ctx = canvas.getContext("2d");
// Canvas auf Fenstergröße setzen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// WebSocket-Verbindung zum Server aufbauen
const ws = new WebSocket("wss://" + location.host);

let isHost = false; // Bin ich der Host?
let lines = []; // Alle Linien, die gezeichnet wurden
let drawing = false; // Wird gerade gezeichnet?
let currentLine = null; // Die aktuelle Linie, die gerade gezeichnet wird

let score = { left: 0, right: 0 }; // Punktestand
let ball = {
  x: canvas.width / 2, // Ball-Mitte X
  y: canvas.height / 2, // Ball-Mitte Y
  vx: 5, // Geschwindigkeit X
  vy: 3, // Geschwindigkeit Y
  radius: 10 // Ball-Größe
};

let hitSound = null; // Ton bei Ball-Kontakt
let playHitSound = false; // Soll Ton abgespielt werden?

// Wenn ich mit der Maus klicke, fange ich an zu zeichnen
canvas.addEventListener("mousedown", (e) => {
  drawing = true;
  currentLine = { x1: e.clientX, y1: e.clientY, x2: e.clientX, y2: e.clientY };
});

// Beim Bewegen der Maus wird die Linie verlängert
canvas.addEventListener("mousemove", (e) => {
  if (drawing) {
    currentLine.x2 = e.clientX;
    currentLine.y2 = e.clientY;
  }
});

// Wenn ich die Maustaste loslasse, ist die Linie fertig
canvas.addEventListener("mouseup", () => {
  if (currentLine) {
    const line = {
      ...currentLine,
      time: Date.now(),
      player: isHost ? "host" : "client"
    };
    lines.push(line); // Linie speichern
    ws.send(JSON.stringify({ type: "line", line })); // An Server schicken
  }
  drawing = false;
  currentLine = null;
});

// Wenn eine Nachricht vom Server kommt
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

  // Ich bin der Host, kann also das Spiel starten
  if (msg.type === "host") {
    isHost = true;
    console.log("Ich bin der Host");
    startBtn.style.display = "block";
  }

  // Wenn Spiel starten soll
  if (msg.type === "start") {
    resetBall();
    gameLoop();
  }

  // Linie vom anderen Spieler empfangen
  if (msg.type === "line") {
    lines.push({ ...msg.line, time: Date.now() });
  }

  // Neue Ballposition vom Host empfangen
  if (msg.type === "ball") {
    ball = msg.ball;
    score = msg.score;
    updateScore();
  }

  // Nur zum Testen
  if (msg.type === "test") {
    console.log("Testnachricht:", msg.message);
  }
};

// Wenn ich den Start-Knopf klicke
startBtn.addEventListener("click", () => {
  // Ton vorbereiten
  if (!hitSound) {
    hitSound = new Audio('hit-sound.mp3');
    hitSound.preload = "auto";
    hitSound.play().then(() => {
      hitSound.pause();
      hitSound.currentTime = 0;
    }).catch(() => {});
  }

  resetBall(); // Ball in die Mitte
  gameLoop(); // Spiel starten
  ws.send(JSON.stringify({ type: "start" })); // Server sagen: Spiel starten
  startBtn.style.display = "none"; // Knopf ausblenden
});

// Ball in Mitte setzen und zufällige Richtung geben
function resetBall() {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.vx = Math.random() > 0.5 ? 5 : -5;
  ball.vy = (Math.random() - 0.5) * 6;
}

// Ball bewegen und prüfen, ob er irgendwo gegenstößt
function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  // Wenn Ball oben oder unten anstößt
  if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
    ball.vy *= -1;
  }

  // Wenn Ball links rausfliegt
  if (ball.x < 0) {
    score.right++;
    updateScore();
    resetBall();
  // Wenn Ball rechts rausfliegt
  } else if (ball.x > canvas.width) {
    score.left++;
    updateScore();
    resetBall();
  }

  // Prüfe, ob Ball eine Linie berührt
  for (let line of lines) {
    if (checkLineCollision(line)) {
      reflectBall(line); // Ball abprallen lassen
    }
  }

  // Nur der Host schickt Ball-Updates
  if (!isHost) return;
  ws.send(JSON.stringify({
    type: "ball",
    ball,
    score
  }));
}

// Alte Linien löschen (älter als 5 Sekunden)
function cleanupLines() {
  const now = Date.now();
  lines = lines.filter(line => now - line.time < 5000);
}

// Schauen, ob der Ball eine Linie trifft
function checkLineCollision(line) {
  const dist = distanceToSegment(ball.x, ball.y, line.x1, line.y1, line.x2, line.y2);
  return dist < ball.radius;
}

// Ball reflektieren, wenn er auf Linie trifft
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

  playHitSound = true; // Ton abspielen beim Aufprall
}

// Hilfsfunktion: Wie nah ist der Ball an einer Linie dran?
function distanceToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  return Math.hypot(px - projX, py - projY);
}

// Punktestand im HTML anzeigen
function updateScore() {
  document.getElementById("scoreboard").textContent =
    `Links: ${score.left} | Rechts: ${score.right}`;
}

// Ball auf dem Canvas zeichnen
function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();
}

// Alle Linien zeichnen (und die aktuelle, falls vorhanden)
function drawLines() {
  ctx.lineWidth = 4;
  for (let line of lines) {
    ctx.beginPath();
    ctx.moveTo(line.x1, line.y1);
    ctx.lineTo(line.x2, line.y2);

    // Host = blau, Client = rot
    if (line.player === "host") {
      ctx.strokeStyle = "blue";
    } else if (line.player === "client") {
      ctx.strokeStyle = "red";
    } else {
      ctx.strokeStyle = "gray";
    }

    ctx.stroke();
  }

  // Aktuelle Linie beim Zeichnen
  if (currentLine) {
    ctx.beginPath();
    ctx.moveTo(currentLine.x1, currentLine.y1);
    ctx.lineTo(currentLine.x2, currentLine.y2);
    ctx.strokeStyle = isHost ? "blue" : "red";
    ctx.stroke();
  }
}

// Haupt-Spielschleife – wird immer wieder aufgerufen
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas löschen

  if (isHost) {
    updateBall(); // Ball bewegen (nur Host)
  }

  cleanupLines();
