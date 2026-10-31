import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const port = Number(process.env.PORT || 4320);
if (!fs.existsSync(path.join(root, 'index.html'))) { console.error('Run npm run build first.'); process.exit(1); }
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.webp':'image/webp', '.jpg':'image/jpeg', '.png':'image/png', '.svg':'image/svg+xml', '.ico':'image/x-icon', '.xml':'application/xml', '.txt':'text/plain; charset=utf-8' };
const server = http.createServer((request, response) => {
  if (!['GET','HEAD'].includes(request.method)) { response.writeHead(405, {Allow:'GET, HEAD'}).end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); } catch { response.writeHead(400).end('Invalid URL'); return; }
  if (pathname === '/rift-timer/eu' || pathname === '/rift-timer/eu/') { response.writeHead(301,{Location:'/rift-timer/europe/'}).end(); return; }
  const segments = pathname.split('/');
  if (pathname.includes('\0') || pathname.includes('\\') || segments.some(segment => segment.startsWith('.') || segment === '..')) { response.writeHead(403).end('Forbidden'); return; }
  let target = path.resolve(root, '.' + pathname);
  if (!target.startsWith(root + path.sep) && target !== root) { response.writeHead(403).end('Forbidden'); return; }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    if (!pathname.endsWith('/')) { response.writeHead(301,{Location:pathname + '/'}).end(); return; }
    target = path.join(target, 'index.html');
  }
  const exists = fs.existsSync(target) && fs.statSync(target).isFile();
  if (!exists) target = path.join(root, '404.html');
  const headers = { 'Content-Type':types[path.extname(target)] || 'application/octet-stream', 'X-Content-Type-Options':'nosniff', 'Referrer-Policy':'strict-origin-when-cross-origin', 'Cache-Control':'no-cache' };
  response.writeHead(exists ? 200 : 404, headers);
  if (request.method === 'HEAD') response.end(); else fs.createReadStream(target).pipe(response);
});
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `Port ${port} is in use. Set PORT to another port.` : error); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Aion 2 Rift Timer: http://127.0.0.1:${port}/`));
