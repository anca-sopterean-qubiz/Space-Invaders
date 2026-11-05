// Test-only static file server for the vanilla-JS Space Invaders game.
// Playwright's `webServer` launches this so the game is reachable at `baseURL`.
// It is test infrastructure — it serves the untouched application files (index.html,
// app.js, grid.js, the ES-module siblings, and the image sprites) with correct MIME
// types so the browser accepts them as module scripts.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
// tests/support -> repo root (two levels up).
const ROOT = path.resolve(here, '..', '..');
const PORT = Number(process.env.PORT) || 4318;
const HOST = '127.0.0.1';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${HOST}:${PORT}`);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';

    // Resolve inside ROOT and reject path traversal.
    const resolved = path.normalize(path.join(ROOT, pathname));
    if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    const info = await stat(resolved).catch(() => null);
    if (!info || !info.isFile()) {
      res.writeHead(404).end('Not found');
      return;
    }

    const body = await readFile(resolved);
    const type = MIME[path.extname(resolved).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store' }).end(body);
  } catch (err) {
    res.writeHead(500).end('Server error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`[static-server] serving ${ROOT} at http://${HOST}:${PORT}`);
});
