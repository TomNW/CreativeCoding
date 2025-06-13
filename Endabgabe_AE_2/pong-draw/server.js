import express from 'express';
import http from 'http';
import { WebSocketServer } from 'ws';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static('public'));

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

  // 💡 Spielerkennung ergänzen bei Linien
  if (parsed.type === "line") {
    parsed.line.player = (ws === host) ? "host" : "client";
  }

  const newMessage = JSON.stringify(parsed);

  // Broadcast an alle anderen
  for (const client of clients) {
    if (client !== ws && client.readyState === WebSocket.OPEN) {
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

server.listen(3000, () => {
  console.log('Server läuft auf http://localhost:3000');
});
