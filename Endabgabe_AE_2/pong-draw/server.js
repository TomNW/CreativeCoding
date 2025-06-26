import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

let clients = [];
let host = null;

wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.push(ws);

  if (!host) {
    host = ws;
    ws.send(JSON.stringify({ type: 'host' }));
  }

  ws.on('message', (message) => {
    let parsed;
    try {
      parsed = JSON.parse(message);
    } catch (e) {
      console.error("Fehler beim Parsen:", e);
      return;
    }

    if (parsed.type === "line") {
      parsed.line.player = (ws === host) ? "host" : "client";
    }

    const newMessage = JSON.stringify(parsed);

    for (const client of clients) {
      if (client !== ws && client.readyState === ws.OPEN) {
        client.send(newMessage);
      }
    }
  });

  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
    if (ws === host) {
      host = clients[0] || null;
      if (host) host.send(JSON.stringify({ type: 'host' }));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server läuft auf http://localhost:${PORT}`);
});
