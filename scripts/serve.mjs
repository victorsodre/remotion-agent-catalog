#!/usr/bin/env node
// Visualizador local: publica apenas web/, o catálogo e seu schema.
import { createServer } from "node:http";
import { readFile, realpath, stat } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, relative, resolve, sep, extname } from "node:path";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".webm": "video/webm",
  ".mp4": "video/mp4", ".mov": "video/quicktime", ".gif": "image/gif",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".woff2": "font/woff2",
};

function isPublic(pathname) {
  const parts = pathname.split("/");
  if (pathname.includes("\\") || pathname.includes("\0") || parts.some((p) => p.startsWith("."))) return false;
  return pathname === "/catalog.json" || pathname === "/schema/catalog.schema.json" ||
    (pathname.startsWith("/web/") && Object.hasOwn(MIME, extname(pathname)));
}

function isLocalRequest(req) {
  try {
    const host = new URL(`http://${req.headers.host}`);
    if (!["127.0.0.1", "localhost", "[::1]"].includes(host.hostname)) return false;
    return !req.headers.origin || req.headers.origin === host.origin;
  } catch { return false; }
}

export async function startServer(port = Number(process.env.PORT) || 8080, { root = ROOT, attempts = 10 } = {}) {
  const base = await realpath(root);
  const server = createServer(async (req, res) => {
    const send = (status, body) => res.writeHead(status, {
      "content-type": "text/plain; charset=utf-8", "x-content-type-options": "nosniff",
    }).end(body);
    if (!isLocalRequest(req)) { send(403, "Origem não permitida."); return; }
    if (!["GET", "HEAD"].includes(req.method)) { send(405, "Método não permitido."); return; }
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname); }
    catch { send(400, "URL inválida."); return; }
    if (pathname === "/") pathname = "/web/index.html";
    else if (pathname.endsWith("/")) pathname += "index.html";
    if (!isPublic(pathname)) { send(404, "Arquivo não encontrado."); return; }
    try {
      const target = await realpath(resolve(base, `.${pathname}`));
      const rel = relative(base, target);
      // Confere o destino real: links simbólicos também precisam ficar na área pública.
      if (rel === ".." || rel.startsWith(`..${sep}`) || !isPublic(`/${rel.split(sep).join("/")}`)) {
        send(404, "Arquivo não encontrado."); return;
      }
      if (!(await stat(target)).isFile()) { send(404, "Arquivo não encontrado."); return; }
      const body = req.method === "HEAD" ? undefined : await readFile(target);
      res.writeHead(200, { "content-type": MIME[extname(target)], "x-content-type-options": "nosniff" }).end(body);
    } catch { send(404, "Arquivo não encontrado."); }
  });
  for (let attempt = 0; ; attempt += 1) {
    try {
      await new Promise((accept, reject) => {
        server.once("error", reject);
        server.listen(port, "127.0.0.1", () => { server.off("error", reject); accept(); });
      });
      break;
    } catch (error) {
      if (error.code !== "EADDRINUSE" || attempt >= attempts || port === 0) throw error;
      port += 1;
    }
  }
  return {
    server, port: server.address().port,
    url: `http://127.0.0.1:${server.address().port}/web/`,
    close: () => new Promise((done) => { server.close(done); server.closeAllConnections(); }),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const instance = await startServer();
  console.log(`remotion-agent-catalog — visualizador em ${instance.url}`);
  console.log("Ctrl+C para parar.");
}
