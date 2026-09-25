// A static server for /home/user/tsamaya-web/dist with gzip on text types, as
// GitHub Pages serves it. Port 8796. Test use only.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join, extname } from 'node:path';
const root = '/home/user/tsamaya-web/dist';
const T = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.avif': 'image/avif', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png' };
createServer(async (req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html';
  try {
    let d = await readFile(join(root, p)); const t = T[extname(p)] || 'application/octet-stream';
    const h = { 'content-type': t };
    if (/text|javascript|json|svg/.test(t) && /gzip/.test(req.headers['accept-encoding'] || '')) { d = gzipSync(d); h['content-encoding'] = 'gzip'; }
    res.writeHead(200, h); res.end(d);
  } catch { res.writeHead(404); res.end('nf'); }
}).listen(8796);
