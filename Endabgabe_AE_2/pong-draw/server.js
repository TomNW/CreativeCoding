// Importiere HTTP-Modul zum Erstellen eines Servers
import http from "http";
// Modul zum Lesen von Dateien
import fs from "fs";
// Pfade verarbeiten (für Dateipfade etc.)
import path from "path";
// WebSocket-Server importieren
import { WebSocketServer } from "ws";

// Ordner mit den öffentlichen Dateien (HTML, JS usw.)
const PUBLIC_DIR = path.join(process.cwd(), "public");

// Erstelle HTTP-Server
const server = http.createServer((req, res) => {
  console.log("Request URL:", req.url); // Zeigt an, welche Datei angefragt wurde

  // Wenn "/" aufgerufen wird, dann lade index.html
  let filePath = req.url === "/" ? "index.html" : req.url.substring(1);

  // Setze vollständigen Pfad zur Datei
  filePath = path.join(PUBLIC_DIR, filePath);

  // Sicherheit: Nur auf Dateien im public-Ordner zugreifen
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403); // Zugriff verweigert
    res.end("Forbidden");
    return;
  }

  // Versuche die Datei zu lesen
  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Wenn Datei nicht gefunden, gib 404 zurück
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }

    // Dateityp ermitteln
    const ext = path.extname(filePath);
    let contentType = "text/plain";
    if (ext === ".html") contentType = "text/html";
    else if (ext === ".js") contentType = "application/javascript";
    else if (ext === ".css") contentType = "text/css";
    else if (ext === ".json") contentType = "application/json";

    // Antwort mit richtiger Datei und Typ senden
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

// WebSocket-Server an den HTTP-Server anhängen
const wss = new WebSocketServer({ server });

// Wenn sich ein Client verbindet
wss.on("connection", (ws) => {
  console.log("Client verbunden");

  // Wenn eine Nachricht vom Client kommt
  ws.on("message", (message) => {
    console.log("Nachricht erhalten:", message.toString());
    // (Hier kann man später Nachrichten an andere Clients weiterleiten usw.)
  });

  // Dem ersten Client sagen, dass er der Host ist
  ws.send(JSON.stringify({ type: "host" }));
});

// Starte den Server auf Port 8080
server.listen(8080, () => {
  console.log("Server läuft auf http://localhost:8080");
});
