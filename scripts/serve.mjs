#!/usr/bin/env node
// Servidor estático mínimo (zero dependências) para o visualizador web.
// Serve a raiz do repositório para que a página em /web/ consiga buscar
// /catalog.json e /schema/... por HTTP (o fetch de file:// é bloqueado no Chrome).
//
//   npm run web            porta 8080 (ou a próxima livre), abre /web/
//   PORT=3000 npm run web

import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join, normalize, extname } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const START_PORT = Number(process.env.PORT) || 8080;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".gif": "image/gif",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const server = createServer(async (req, res) => {
  try {
    let pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    if (pathname === "/") pathname = "/web/index.html";
    // impede path traversal: resolve dentro de ROOT
    const filePath = normalize(join(ROOT, pathname));
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403).end("Forbidden");
      return;
    }
    let target = filePath;
    const info = await stat(filePath).catch(() => null);
    if (info?.isDirectory()) target = join(filePath, "index.html");
    const body = await readFile(target);
    res.writeHead(200, { "content-type": MIME[extname(target)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("404 Not Found");
  }
});

function listen(port, attempts = 10) {
  server.once("error", (err) => {
    if (err.code === "EADDRINUSE" && attempts > 0) {
      listen(port + 1, attempts - 1);
    } else {
      console.error(err.message);
      process.exit(1);
    }
  });
  server.listen(port, () => {
    console.log(`remotion-agent-catalog — visualizador em  http://localhost:${port}/web/`);
    console.log("Ctrl+C para parar.");
  });
}

listen(START_PORT);
