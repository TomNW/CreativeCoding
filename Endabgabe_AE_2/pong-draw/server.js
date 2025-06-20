import http from "http";
import fs from "fs";
import path from "path";
import { WebSocketServer } from "ws";

const PUBLIC_DIR = path.join(process.cwd(), "public");

const server = http.createServer((req, res) => {
  console.log("Request URL:", req.url);

  
  let filePath = req.url === "/" ? "index.html" : req.url.substring(1);

 
  filePath = path.join(PUBLIC_DIR, filePath);

  
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }
    
    const ext = path.extname(filePath);
    let contentType = "text/plain";
    if (ext === ".html") contentType = "text/html";
    else if (ext === ".js") contentType = "application/javascript";
    else if (ext === ".css") contentType = "text/css";
    else if (ext === ".json") contentType = "application/json";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client verbunden");

  ws.on("message", (message) => {
    console.log("Nachricht erhalten:", message.toString());
    
  });

  ws.send(JSON.stringify({ type: "host" })); 
});

server.listen(8080, () => {
  console.log("Server läuft auf http://localhost:8080");
});
