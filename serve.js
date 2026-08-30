/* ============================================================
   Portfolio 静态文件服务器（生产版）
   用法：node serve.js
   默认监听 127.0.0.1:8765（仅本机，由 nginx 代理对外）
   可用环境变量覆盖：PORT=9000 HOST=127.0.0.1
   说明：由 nginx 将 /portfolio/ 前缀剥离后代理到此服务，
   因此这里以站点根目录（含 index.html 的目录）为 ROOT。
   ============================================================ */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const HOST = process.env.HOST || '127.0.0.1';
const PORT = Number(process.env.PORT || 8765);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.gif': 'image/gif',
  '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8'
};
const CACHE = {
  '.html': 'no-cache',                       // HTML 不缓存
  '.css': 'no-cache',                        // CSS/JS 不缓存（改样式立即生效）
  '.js': 'no-cache',
  '.svg': 'public, max-age=2592000',         // 图片/视频/PDF 30 天
  '.jpg': 'public, max-age=2592000', '.jpeg': 'public, max-age=2592000',
  '.png': 'public, max-age=2592000', '.gif': 'public, max-age=2592000',
  '.webp': 'public, max-age=2592000', '.ico': 'public, max-age=2592000',
  '.mp4': 'public, max-age=2592000',
  '.pdf': 'public, max-age=2592000'
};

/* 防目录穿越：规范化后必须仍位于 ROOT 内 */
function safeResolve(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath.split('?')[0]); } catch { return null; }
  const filePath = path.normalize(path.join(ROOT, decoded));
  if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) return null;
  return filePath;
}

http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('405 Method Not Allowed');
    return;
  }
  let filePath = safeResolve(req.url);
  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }
  fs.stat(filePath, (err, st) => {
    if (!err && st.isDirectory()) filePath = path.join(filePath, 'index.html');
    fs.readFile(filePath, (err2, data) => {
      if (err2) {
        // 404：返回作品集自带的 404 页
        fs.readFile(path.join(ROOT, '404.html'), (e404, page) => {
          res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
          res.end(e404 ? '404 Not Found' : page);
        });
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
      const cc = CACHE[ext];
      if (cc) headers['Cache-Control'] = cc;
      res.writeHead(200, headers);
      res.end(req.method === 'HEAD' ? undefined : data);
    });
  });
}).listen(PORT, HOST, () => {
  console.log('portfolio server: http://' + HOST + ':' + PORT + '/  (root: ' + ROOT + ')');
});