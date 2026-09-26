// Static server for dist/ that behaves like GitHub Pages for measurement:
// gzip for text types, correct MIME types, no-cache. Usage: node gzserve.mjs <dir> <port>
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join, extname, normalize } from 'node:path';

const root = process.argv[2] || decodeURIComponent(new URL('../../../../dist', import.meta.url).pathname);
const port = +(process.argv[3] || 8796);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2',
  '.ico': 'image/x-icon', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml',
};
const TEXT = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.txt', '.xml']);
const cache = new Map();

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const file = normalize(join(root, p));
    if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
    const s = await stat(file).catch(() => null);
    if (!s || !s.isFile()) { res.writeHead(404, { 'content-type': 'text/plain' }).end('404'); return; }
    const ext = extname(file);
    let body = await readFile(file);
    const headers = { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': 'max-age=600' };
    if (TEXT.has(ext) && /gzip/.test(req.headers['accept-encoding'] || '')) {
      const key = file + ':' + s.mtimeMs;
      if (!cache.has(key)) cache.set(key, gzipSync(body, { level: 9 }));
      body = cache.get(key);
      headers['content-encoding'] = 'gzip';
      headers.vary = 'accept-encoding';
    }
    headers['content-length'] = body.length;
    res.writeHead(200, headers).end(body);
  } catch (e) {
    res.writeHead(500).end(String(e));
  }
}).listen(port, () => console.log('gzserve', root, 'on', port));
